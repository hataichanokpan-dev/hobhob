/**
 * API Route: Send Emoji Push Notification
 * POST /api/push/send-emoji
 *
 * Sends a push notification to a user when they receive an emoji encouragement
 * from another user in a private circle.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { adminDb } from "@/lib/firebase/admin";
import { getEnabledPushSubscriptionsServer } from "@/lib/db/server";
import webpush from "web-push";
import type { EmojiNotificationPayload, PushApiResponse } from "@/types";

// Environment variables
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:you@domain.com";
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const APP_ORIGIN = process.env.APP_ORIGIN || "";

// Configure web-push
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

/**
 * Get today's date string in user's timezone (yyyy-mm-dd)
 */
function getTodayInTimezone(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

/**
 * Check if user has completed all habits for today
 */
async function getUserCompletionStatus(uid: string, timezone: string): Promise<"Complete" | "Not complete"> {
  try {
    const today = getTodayInTimezone(timezone);

    // Get user's habits
    const habitsSnapshot = await adminDb.ref(`users/${uid}/habits`).once("value");
    if (!habitsSnapshot.exists()) {
      return "Not complete";
    }

    const habits = habitsSnapshot.val();
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();
    const dayOfMonth = todayDate.getDate();

    let activeHabitsCount = 0;
    let completedHabitsCount = 0;

    // Get today's checkins
    const checkinsSnapshot = await adminDb.ref(`users/${uid}/checkins/${today}`).once("value");
    const checkins = checkinsSnapshot.exists() ? checkinsSnapshot.val() : {};

    for (const habit of Object.values(habits) as any[]) {
      if (!habit.isActive) continue;

      // Check if habit should be tracked today
      const shouldTrackToday = (() => {
        switch (habit.frequency) {
          case "daily":
            return true;
          case "weekly":
            return habit.targetDays?.includes(dayOfWeek);
          case "monthly":
            return habit.targetDays?.includes(dayOfMonth);
          default:
            return false;
        }
      })();

      if (!shouldTrackToday) continue;

      activeHabitsCount++;

      // Check if completed
      const checkinValue = checkins[habit.id];
      const isChecked = typeof checkinValue === "object"
        ? checkinValue?.checked === true
        : checkinValue === true;

      if (isChecked) {
        completedHabitsCount++;
      }
    }

    // User is complete if all active habits for today are done
    if (activeHabitsCount === 0) return "Not complete";
    return completedHabitsCount >= activeHabitsCount ? "Complete" : "Not complete";

  } catch (error) {
    console.error("[Emoji Push] Error checking user completion status:", error);
    return "Not complete";
  }
}

/**
 * Send push notification to a subscription
 */
async function sendPushNotification(
  subscription: any,
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: EmojiNotificationPayload;
  }
): Promise<boolean> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(notification));
    return true;
  } catch (error: any) {
    if (error.statusCode === 410) {
      console.log("[Emoji Push] Subscription expired");
      return false;
    }
    console.error("[Emoji Push] Error sending push:", error.message);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated (the sender)
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json<PushApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return NextResponse.json<PushApiResponse>(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const fromUserId = decodedToken.uid;

    // Parse request body
    const requestBody = await request.json();
    const { toUserId, circleId, circleName, emoji } = requestBody;

    if (!toUserId || !circleId || !emoji) {
      return NextResponse.json<PushApiResponse>(
        { success: false, error: "Missing required fields: toUserId, circleId, emoji" },
        { status: 400 }
      );
    }

    // Get sender's profile for their name
    const senderProfileSnapshot = await adminDb.ref(`users/${fromUserId}/profile`).once("value");
    const senderProfile = senderProfileSnapshot.exists() ? senderProfileSnapshot.val() : null;
    const fromUserName = senderProfile?.displayName || senderProfile?.username || "Someone";

    // Get recipient's profile for timezone
    const recipientProfileSnapshot = await adminDb.ref(`users/${toUserId}/profile`).once("value");
    const recipientProfile = recipientProfileSnapshot.exists() ? recipientProfileSnapshot.val() : null;
    const recipientTimezone = recipientProfile?.timezone || "UTC";

    // Get recipient's completion status
    const status = await getUserCompletionStatus(toUserId, recipientTimezone);

    // Get recipient's enabled push subscriptions
    const subscriptions = await getEnabledPushSubscriptionsServer(toUserId);

    if (Object.keys(subscriptions).length === 0) {
      return NextResponse.json<PushApiResponse>({
        success: true,
        message: "No enabled subscriptions for recipient",
      });
    }

    // Prepare notification payload
    const payload: EmojiNotificationPayload = {
      type: "emoji-encouragement",
      fromUserId,
      fromUserName,
      emoji,
      status,
      circleId,
      circleName,
    };

    // Generate notification text based on status
    const title = `${emoji} ${fromUserName} sent you an emoji!`;
    const body = status === "Complete"
      ? "They see you've completed all your habits today! 🎉"
      : "Keep going! You've got this! 💪";

    // Send to all enabled subscriptions
    let sentCount = 0;
    for (const [deviceId, subData] of Object.entries(subscriptions)) {
      const success = await sendPushNotification(subData.subscription, {
        title,
        body,
        icon: `${APP_ORIGIN}/icons/icon-192x192.png`,
        badge: `${APP_ORIGIN}/icons/badge-72x72.png`,
        data: payload,
      });

      if (success) {
        sentCount++;
      }
    }

    console.log(`[Emoji Push] Sent ${sentCount} notification(s) to ${toUserId} from ${fromUserId}`);

    return NextResponse.json<PushApiResponse>({
      success: true,
      message: `Sent ${sentCount} notification(s)`,
    });

  } catch (error) {
    console.error("[Emoji Push] Error:", error);

    return NextResponse.json<PushApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send emoji notification",
      },
      { status: 500 }
    );
  }
}
