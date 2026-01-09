"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2, Sparkles, Smartphone, Check } from "lucide-react";
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

// Animated Toggle Switch Component
function ToggleSwitch({
  enabled,
  onToggle,
  isDisabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  isDisabled: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={`relative w-14 h-8 rounded-full transition-all duration-300 ease-out ${
        enabled
          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30"
          : "bg-white/10 hover:bg-white/15"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      aria-label={enabled ? "Disable notifications" : "Enable notifications"}
    >
      <span
        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ease-out ${
          enabled ? "left-7" : "left-1"
        } ${enabled ? "flex items-center justify-center" : ""}`}
      >
        {enabled && <Check className="w-4 h-4 text-violet-500" strokeWidth={3} />}
      </span>
    </button>
  );
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
      <div className="surface p-5 space-y-4 relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-lg opacity-50 animate-pulse" />
            <Bell className="w-6 h-6 text-violet-400 relative" />
          </div>
          <h3 className="font-semibold text-lg">{t("settings.pushNotifications.title")}</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-5 space-y-4 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 rounded-full blur-3xl" />

      {/* Header with animated icon */}
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            {pushStatus?.enabled && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-lg opacity-50 animate-pulse" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-bounce" />
              </>
            )}
            {pushStatus?.enabled ? (
              <Bell className="w-6 h-6 text-violet-400 relative" />
            ) : (
              <BellOff className="w-6 h-6 text-white/30 relative" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{t("settings.pushNotifications.title")}</h3>
            <p className="text-sm text-white/50 flex items-center gap-1.5">
              {pushStatus?.enabled ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-violet-400" />
                  {t("settings.pushNotifications.enabled")}
                </>
              ) : (
                t("settings.pushNotifications.disabled")
              )}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <ToggleSwitch
          enabled={pushStatus?.enabled || false}
          onToggle={pushStatus?.enabled ? handleDisablePush : handleEnablePush}
          isDisabled={isToggling}
        />
      </div>

      {/* Loading overlay */}
      {isToggling && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3 animate-in fade-in">
          <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
          <span className="text-sm text-white/80">
            {t("settings.pushNotifications.loading")}
          </span>
        </div>
      )}

      {/* Description with cute styling */}
      <div className="relative bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-white/60 leading-relaxed">
          {t("settings.pushNotifications.description")}
        </p>
        {pushStatus?.enabled && (
          <div className="mt-3 flex items-center gap-2 text-xs text-violet-400">
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
            <span>You'll receive daily reminders at 6:00 AM</span>
          </div>
        )}
      </div>

      {/* Device info */}
      {pushStatus?.totalDevices !== undefined && pushStatus.totalDevices > 0 && (
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Smartphone className="w-3 h-3" />
          <span>
            {pushStatus.enabledDevices} of {pushStatus.totalDevices} device{pushStatus.totalDevices > 1 ? "s" : ""} enabled
          </span>
        </div>
      )}
    </div>
  );
}
