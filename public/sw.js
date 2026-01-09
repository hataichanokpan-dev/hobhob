/**
 * Service Worker for HobHob PWA
 * Handles push notifications and notification clicks
 */

// Use self.location.origin for the app origin (works in service workers)
const APP_ORIGIN = self.location.origin;

// Install event - cache assets
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  event.waitUntil(self.clients.claim());
});

// Push event - receive and show notification
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received");

  let payload = {
    title: undefined,
    body: undefined,
    icon: undefined,
    badge: undefined,
    data: undefined
  };

  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (error) {
    console.error("[SW] Error parsing push payload:", error);
  }

  const title = payload.title || "HobHob";
  const notificationType = payload.data?.type || "default";

  // Customize notification based on type
  const options = {
    body: payload.body || "You have new updates",
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/badge-72x72.png",
    tag: notificationType === "emoji-encouragement"
      ? `emoji-${payload.data?.fromUserId}-${Date.now()}`
      : "hobhob-daily",
    renotify: true,
    requireInteraction: false,
    silent: false,
    // Add vibration pattern for better feel
    vibrate: notificationType === "emoji-encouragement"
      ? [200, 100, 200] // Two short vibrations for emoji
      : [300], // Single vibration for daily
    // Add timestamp for better UX
    timestamp: Date.now(),
    data: payload.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event - open app
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click event");

  event.notification.close();

  // Determine URL based on notification type
  const notificationData = event.notification.data || {};
  let urlPath = "/today";

  if (notificationData.type === "emoji-encouragement" && notificationData.circleId) {
    // Navigate to the specific circle
    urlPath = `/circles/${notificationData.circleId}`;
  }

  const urlToOpen = new URL(urlPath, APP_ORIGIN).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate if needed
      for (const client of clientList) {
        if (client.url.startsWith(APP_ORIGIN) && "focus" in client) {
          // Navigate to the correct URL if different
          if (client.url !== urlToOpen && "navigate" in client) {
            return client.navigate(urlToOpen).then(() => client.focus());
          }
          return client.focus();
        }
      }

      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log("[SW] Service worker loaded");
