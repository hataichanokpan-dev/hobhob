"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { useTranslation } from "@/hooks/use-translation";
import {
  registerServiceWorker,
  getServiceWorkerRegistration,
} from "@/lib/push/sw-registration";
import {
  getDeviceId,
  isPushSupported,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscription,
  getUserAgent,
} from "@/lib/push/push-client";
import { auth } from "@/lib/firebase/client";

interface PushStatus {
  enabled: boolean;
  hasAnySubscriptions?: boolean;
  anyEnabled?: boolean;
  totalDevices?: number;
  enabledDevices?: number;
}

export function PushNotificationSettings() {
  const { user } = useUserStore();
  const { t } = useTranslation();
  const [pushStatus, setPushStatus] = useState<PushStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [supported, setSupported] = useState(true);

  // Check if push is supported and get current status
  useEffect(() => {
    const checkPushSupport = async () => {
      const pushSupported = isPushSupported();
      setSupported(pushSupported);

      if (!pushSupported) {
        setIsLoading(false);
        return;
      }

      await fetchPushStatus();
    };

    checkPushSupport();
  }, [user]);

  const fetchPushStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const deviceId = getDeviceId();

      const response = await fetch(
        `/api/push/status?deviceId=${deviceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPushStatus(data);
      }
    } catch (error) {
      console.error("Error fetching push status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnablePush = async () => {
    if (!user) return;

    setIsToggling(true);
    try {
      // Request permission
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert("Push notification permission denied. Please enable it in your browser settings.");
        setIsToggling(false);
        return;
      }

      // Register service worker
      let registration = await getServiceWorkerRegistration();
      if (!registration) {
        try {
          registration = await registerServiceWorker();
        } catch (swError) {
          console.error("Service worker registration error:", swError);
          alert(`Service worker error: ${swError instanceof Error ? swError.message : "Unknown error"}`);
          setIsToggling(false);
          return;
        }
      }

      if (!registration) {
        alert("Failed to register service worker. Please try again.");
        setIsToggling(false);
        return;
      }

      // Subscribe to push
      const subscription = await subscribeToPush(registration);
      if (!subscription) {
        alert("Failed to subscribe to push notifications. Please try again.");
        setIsToggling(false);
        return;
      }

      // Send subscription to server
      const token = await user.getIdToken();
      const deviceId = getDeviceId();
      const userAgent = getUserAgent();

      const response = await fetch("/api/push/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deviceId,
          subscription: subscription.toJSON(),
          userAgent,
        }),
      });

      if (response.ok) {
        setPushStatus({ enabled: true });
      } else {
        const errorData = await response.json();
        alert(`Failed to save subscription: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error enabling push:", error);
      alert(`Failed to enable push notifications: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDisablePush = async () => {
    if (!user) return;

    setIsToggling(true);
    try {
      // Unsubscribe from push
      const registration = await getServiceWorkerRegistration();
      if (registration) {
        await unsubscribeFromPush(registration);
      }

      // Disable on server
      const token = await user.getIdToken();
      const deviceId = getDeviceId();

      const response = await fetch("/api/push/unregister", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId }),
      });

      if (response.ok) {
        setPushStatus({ enabled: false });
      } else {
        alert("Failed to disable push notifications. Please try again.");
      }
    } catch (error) {
      console.error("Error disabling push:", error);
      alert("Failed to disable push notifications. Please try again.");
    } finally {
      setIsToggling(false);
    }
  };

  // Don't render if not supported
  if (!supported) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="surface p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[var(--color-brand)]" />
          <h3 className="font-semibold">{t("settings.pushNotifications.title")}</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {pushStatus?.enabled ? (
            <Bell className="w-5 h-5 text-[var(--color-brand)]" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <h3 className="font-semibold">{t("settings.pushNotifications.title")}</h3>
            <span className="text-sm text-muted-foreground">
              {pushStatus?.enabled
                ? t("settings.pushNotifications.enabled")
                : t("settings.pushNotifications.disabled")}
            </span>
          </div>
        </div>

        {!isToggling && (
          <button
            onClick={pushStatus?.enabled ? handleDisablePush : handleEnablePush}
            className="text-sm px-4 py-2 rounded-lg bg-[var(--color-brand)] text-[var(--color-background)] hover:opacity-90 disabled:opacity-50 transition-opacity"
            disabled={isToggling}
          >
            {pushStatus?.enabled
              ? t("settings.pushNotifications.disable")
              : t("settings.pushNotifications.enable")}
          </button>
        )}

        {isToggling && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t("settings.pushNotifications.loading")}
            </span>
          </div>
        )}
      </div>

      <span className="text-xs text-muted-foreground block">
        {t("settings.pushNotifications.description")}
      </span>
    </div>
  );
}
