/**
 * Server-side database operations using Firebase Admin SDK
 * Used by API routes for push notification management
 */

import { adminDb } from "@/lib/firebase/admin";
import type { PushSubscriptions } from "@/types";

/**
 * Get all push subscriptions for a user (server-side)
 */
export async function getPushSubscriptionsServer(
  uid: string
): Promise<PushSubscriptions | null> {
  try {
    const snapshot = await adminDb.ref(`users/${uid}/pushSubscriptions`).once("value");
    return snapshot.val();
  } catch (error) {
    console.error("[Server DB] Error getting push subscriptions:", error);
    return null;
  }
}

/**
 * Save push subscription for a user (server-side)
 */
export async function savePushSubscriptionServer(
  uid: string,
  deviceId: string,
  data: {
    enabled: boolean;
    subscription: any;
    userAgent: string;
    createdAt: number;
    updatedAt: number;
  }
): Promise<void> {
  await adminDb.ref(`users/${uid}/pushSubscriptions/${deviceId}`).set(data);
}

/**
 * Disable push subscription for a user (server-side)
 */
export async function disablePushSubscriptionServer(
  uid: string,
  deviceId: string
): Promise<void> {
  await adminDb.ref(`users/${uid}/pushSubscriptions/${deviceId}`).update({
    enabled: false,
    updatedAt: Date.now(),
  });
}

/**
 * Get enabled push subscriptions for a user (server-side)
 */
export async function getEnabledPushSubscriptionsServer(
  uid: string
): Promise<PushSubscriptions> {
  const all = await getPushSubscriptionsServer(uid);
  const enabled: PushSubscriptions = {};

  if (all) {
    for (const [deviceId, data] of Object.entries(all)) {
      if (data.enabled) {
        enabled[deviceId] = data;
      }
    }
  }

  return enabled;
}

/**
 * Mark push notification as sent for a user (server-side)
 */
export async function markPushNotificationSent(
  uid: string,
  date: string
): Promise<void> {
  await adminDb.ref(`users/${uid}/lastPushNotification`).set(date);
}

/**
 * Delete all encouragements for a specific date in a circle (server-side)
 * Used for cleanup when a new day starts
 */
export async function deleteEncouragementsForDateServer(
  circleId: string,
  date: string
): Promise<void> {
  try {
    await adminDb.ref(`circles/${circleId}/encouragements/${date}`).remove();
  } catch (error) {
    console.error(`[Server DB] Error deleting encouragements for ${date}:`, error);
  }
}

/**
 * Get all circle IDs that have encouragements for a specific date (server-side)
 */
export async function getCirclesWithEncouragementsForDate(
  date: string
): Promise<string[]> {
  try {
    const snapshot = await adminDb.ref(`circles`).once("value");
    if (!snapshot.exists()) return [];

    const circles = snapshot.val();
    const circleIds: string[] = [];

    for (const [circleId, circleData] of Object.entries(circles)) {
      // Check if this circle has encouragements for the given date
      const encouragementsSnapshot = await adminDb.ref(`circles/${circleId}/encouragements/${date}`).once("value");
      if (encouragementsSnapshot.exists()) {
        circleIds.push(circleId);
      }
    }

    return circleIds;
  } catch (error) {
    console.error("[Server DB] Error getting circles with encouragements:", error);
    return [];
  }
}

/**
 * Delete yesterday's encouragements for all circles (server-side)
 * Call this when a new day starts
 */
export async function deleteYesterdaysEncouragements(): Promise<void> {
  try {
    // Get yesterday's date string in UTC
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterday.getUTCDate()).padStart(2, '0')}`;

    // Get all circles that have encouragements for yesterday
    const circleIds = await getCirclesWithEncouragementsForDate(yesterdayStr);

    // Delete encouragements for yesterday in each circle
    for (const circleId of circleIds) {
      await deleteEncouragementsForDateServer(circleId, yesterdayStr);
    }

    console.log(`[Server DB] Deleted encouragements for ${yesterdayStr} in ${circleIds.length} circle(s)`);
  } catch (error) {
    console.error("[Server DB] Error deleting yesterday's encouragements:", error);
  }
}
