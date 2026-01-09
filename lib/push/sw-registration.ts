/**
 * Service Worker Registration utilities
 */

const SW_URL = `/sw.js`;

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return "serviceWorker" in navigator;
}

/**
 * Register the service worker
 * @throws {Error} with details if registration fails
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.warn("[SW] Service workers are not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_URL, {
      scope: "/",
      type: "classic",
    });
    console.log("[SW] Service worker registered successfully at:", SW_URL);

    // Wait for the service worker to be activated
    await navigator.serviceWorker.ready;
    console.log("[SW] Service worker is ready and active");

    return registration;
  } catch (error: unknown) {
    console.error("[SW] Service worker registration failed:", error);
    // Provide more detailed error information
    if (error instanceof Error) {
      throw new Error(`Service worker registration failed: ${error.message}`);
    }
    throw new Error("Service worker registration failed");
  }
}

/**
 * Get the current service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration || null;
  } catch (error) {
    console.error("[SW] Error getting service worker registration:", error);
    return null;
  }
}

/**
 * Update the service worker
 */
export async function updateServiceWorker(): Promise<void> {
  const registration = await getServiceWorkerRegistration();
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}

