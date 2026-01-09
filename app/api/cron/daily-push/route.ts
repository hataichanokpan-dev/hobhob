/**
 * Vercel Cron Job: Send Daily Push Notifications
 * GET /api/cron/daily-push
 *
 * This endpoint is called by Vercel Cron every hour to check for users
 * who should receive daily push notifications at 06:00 in their timezone.
 *
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-push",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getEnabledPushSubscriptionsServer } from "@/lib/db/server";
import webpush from "web-push";
import type { DailyNotificationPayload } from "@/types";

// Environment variables
const CRON_SECRET = process.env.CRON_SECRET || "";
const APP_ORIGIN = process.env.APP_ORIGIN || "";

/**
 * Verify cron secret to prevent unauthorized access
 */
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = `Bearer ${CRON_SECRET}`;

  if (!CRON_SECRET) {
    console.error("[Cron] CRON_SECRET not configured");
    return false;
  }

  return authHeader === expectedSecret;
}

/**
 * Get current hour in user's timezone (0-23)
 */
function getCurrentHourInTimezone(timezone: string): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(now), 10);
  return hour;
}

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
 * Send push notification to a subscription
 */
async function sendPushNotification(
  subscription: any,
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: DailyNotificationPayload;
  }
): Promise<boolean> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(notification));
    return true;
  } catch (error: any) {
    // If subscription is no longer valid (410 gone), we should remove it
    if (error.statusCode === 410) {
      console.log("[Cron] Subscription expired, should be removed");
      return false;
    }
    console.error("[Cron] Error sending push:", error.message);
    return false;
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Configure web-push (only when actually handling a request)
  const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:you@domain.com";
  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error("[Cron] VAPID keys not configured");
    return NextResponse.json(
      { error: "VAPID keys not configured" },
      { status: 500 }
    );
  }

  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  console.log("[Cron] Starting daily push notification job");

  try {
    // Get all users using adminDb (server-side Firebase Admin SDK)
    const usersSnapshot = await adminDb.ref("users").once("value");
    if (!usersSnapshot.exists()) {
      console.log("[Cron] No users found");
      return NextResponse.json({ success: true, sent: 0 });
    }

    const users = usersSnapshot.val();
    let totalSent = 0;
    let totalErrors = 0;

    // Process each user
    for (const [uid, userData] of Object.entries(users)) {
      try {
        const user = userData as any;

        // Skip if no profile or timezone
        if (!user.profile?.timezone) {
          continue;
        }

        const timezone = user.profile.timezone;
        const currentHour = getCurrentHourInTimezone(timezone);

        // Only send at 06:00 in user's timezone
        if (currentHour !== 6) {
          continue;
        }

        // Get today's date in user's timezone
        const today = getTodayInTimezone(timezone);

        // Check if we already sent notification for today
        const lastNotificationRef = adminDb.ref(`users/${uid}/lastPushNotification`);
        const lastNotificationSnapshot = await lastNotificationRef.once("value");

        if (lastNotificationSnapshot.exists()) {
          const lastDate = lastNotificationSnapshot.val();
          if (lastDate === today) {
            console.log(`[Cron] Already sent notification to ${uid} for ${today}`);
            continue;
          }
        }

        // Calculate remaining habits
        let remainingHabits = 0;
        if (user.habits) {
          const todayDate = new Date();
          const dayOfWeek = todayDate.getDay(); // 0-6 (Sun-Sat)
          const dayOfMonth = todayDate.getDate();
          const dayOfYear = Math.floor((todayDate.getTime() - new Date(todayDate.getFullYear(), 0, 0).getTime()) / 86400000);

          for (const habit of Object.values(user.habits) as any[]) {
            if (!habit.isActive) continue;

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

            // Check if already completed today
            if (user.checkins?.[today]?.[habit.id]) {
              continue;
            }

            remainingHabits++;
          }
        }

        // Calculate active targets
        let activeTargets = 0;
        if (user.targetInstances) {
          const now = Date.now();
          for (const instance of Object.values(user.targetInstances) as any[]) {
            if (instance.status !== "ACTIVE") continue;
            if (now > instance.windowEnd) continue;
            activeTargets++;
          }
        }

        // Skip if nothing to notify about
        if (remainingHabits === 0 && activeTargets === 0) {
          console.log(`[Cron] User ${uid} has no pending habits or targets`);
          // Still mark as sent to avoid rechecking
          await lastNotificationRef.set(today);
          continue;
        }

        // Get enabled push subscriptions
        const subscriptions = await getEnabledPushSubscriptionsServer(uid);
        if (Object.keys(subscriptions).length === 0) {
          console.log(`[Cron] User ${uid} has no enabled push subscriptions`);
          continue;
        }

        // Prepare notification payload
        const payload: DailyNotificationPayload = {
          type: "daily-summary",
          remainingHabits,
          activeTargets,
          date: today,
        };

        // Generate notification text
        let body = "";
        if (remainingHabits > 0 && activeTargets > 0) {
          body = `${remainingHabits} habit${remainingHabits > 1 ? "s" : ""} left, ${activeTargets} target${activeTargets > 1 ? "s" : ""} active`;
        } else if (remainingHabits > 0) {
          body = `${remainingHabits} habit${remainingHabits > 1 ? "s" : ""} to complete today`;
        } else if (activeTargets > 0) {
          body = `${activeTargets} target${activeTargets > 1 ? "s" : ""} to work on`;
        }

        // Send to all enabled subscriptions
        let sentForUser = 0;
        for (const [deviceId, subData] of Object.entries(subscriptions)) {
          const subscriptionData = subData as { subscription: any; enabled: boolean };
          const success = await sendPushNotification(subscriptionData.subscription, {
            title: "HobHob Daily Summary",
            body,
            icon: `${APP_ORIGIN}/icons/icon-192x192.png`,
            badge: `${APP_ORIGIN}/icons/badge-72x72.png`,
            data: payload,
          });

          if (success) {
            sentForUser++;
            totalSent++;
          }
        }

        if (sentForUser > 0) {
          // Mark notification as sent for today
          await lastNotificationRef.set(today);
          console.log(`[Cron] Sent ${sentForUser} notification(s) to ${uid} for ${today}`);
        } else {
          totalErrors++;
        }

      } catch (userError) {
        console.error(`[Cron] Error processing user ${uid}:`, userError);
        totalErrors++;
      }
    }

    console.log(`[Cron] Daily push job completed: ${totalSent} sent, ${totalErrors} errors`);

    return NextResponse.json({
      success: true,
      sent: totalSent,
      errors: totalErrors,
    });

  } catch (error) {
    console.error("[Cron] Error in daily push job:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
