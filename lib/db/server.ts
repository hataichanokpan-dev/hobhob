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
