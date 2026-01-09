/**
 * Push Notification Client Utilities
 * Handles subscription management on the client side
 */

import type { PushSubscriptionJSON } from "@/types";

const DEVICE_ID_KEY = "hobhob_push_device_id";
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

/**
 * Generate a random device ID
 */
export function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or generate device ID from localStorage
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Convert URL base64 to Uint8Array
 * Needed for VAPID key conversion
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Check if push permission is granted
 */
export function isPushPermissionGranted(): boolean {
  return Notification.permission === "granted";
}

/**
 * Check if push permission is denied
 */
export function isPushPermissionDenied(): boolean {
  return Notification.permission === "denied";
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported");
  }

  if (isPushPermissionDenied()) {
    throw new Error("Push notifications are blocked");
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(
  serviceWorkerRegistration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported");
  }

  if (!isPushPermissionGranted()) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      throw new Error("Push notification permission denied");
    }
  }

  try {
    // Convert VAPID key
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource;

    // Subscribe to push
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log("[Push] Successfully subscribed to push notifications");
    return subscription;
  } catch (error) {
    console.error("[Push] Failed to subscribe:", error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(
  serviceWorkerRegistration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log("[Push] Successfully unsubscribed");
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Push] Failed to unsubscribe:", error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(
  serviceWorkerRegistration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    return await serviceWorkerRegistration.pushManager.getSubscription();
  } catch (error) {
    console.error("[Push] Failed to get subscription:", error);
    return null;
  }
}

/**
 * Convert PushSubscription to JSON for storage
 */
export function subscriptionToJSON(subscription: PushSubscription): PushSubscriptionJSON {
  return subscription.toJSON() as PushSubscriptionJSON;
}

/**
 * Get user agent string for device identification
 */
export function getUserAgent(): string {
  return navigator.userAgent;
}

/**
 * Send emoji push notification to a user
 * Called after successfully sending an emoji encouragement
 */
export async function sendEmojiPushNotification(params: {
  toUserId: string;
  circleId: string;
  circleName?: string;
  emoji: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user's ID token
    const { auth } = await import("@/lib/firebase/client");
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return { success: false, error: "User not authenticated" };
    }

    const token = await currentUser.getIdToken();

    const response = await fetch("/api/push/send-emoji", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || "Failed to send notification" };
    }

    return await response.json();
  } catch (error) {
    console.error("[Push Client] Error sending emoji notification:", error);
    return { success: false, error: "Network error" };
  }
}
