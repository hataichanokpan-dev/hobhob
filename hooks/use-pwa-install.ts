import { useEffect, useState } from "react";

export type DeviceType = "ios" | "android" | "desktop" | "unknown";
export type BrowserType = "safari" | "chrome" | "samsung" | "firefox" | "unknown";

export interface DeviceInfo {
  device: DeviceType;
  browser: BrowserType;
  isInstalled: boolean;
  canShowPrompt: boolean;
}

const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

const isStandalone = (): boolean => {
  return (
    (window.matchMedia("(display-mode: standalone)").matches) ||
    (window.navigator as any).standalone === true
  );
};

const getBrowserType = (): BrowserType => {
  const ua = navigator.userAgent;

  if (isIOS() && ua.indexOf("Safari") > -1 && ua.indexOf("CriOS") === -1) {
    return "safari";
  }
  if (ua.indexOf("Chrome") > -1 || ua.indexOf("CriOS") > -1) {
    return "chrome";
  }
  if (ua.indexOf("SamsungBrowser") > -1) {
    return "samsung";
  }
  if (ua.indexOf("Firefox") > -1) {
    return "firefox";
  }

  return "unknown";
};

export function usePWAInstall() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    device: "unknown",
    browser: "unknown",
    isInstalled: false,
    canShowPrompt: false,
  });

  useEffect(() => {
    // Check if already installed
    if (isStandalone()) {
      setDeviceInfo({
        device: "unknown",
        browser: "unknown",
        isInstalled: true,
        canShowPrompt: false,
      });
      return;
    }

    // Detect device
    let device: DeviceType = "unknown";
    if (isIOS()) {
      device = "ios";
    } else if (isAndroid()) {
      device = "android";
    } else {
      device = "desktop";
    }

    const browser = getBrowserType();

    // Can show prompt on mobile devices
    const canShowPrompt = device === "ios" || device === "android";

    setDeviceInfo({
      device,
      browser,
      isInstalled: false,
      canShowPrompt,
    });
  }, []);

  return deviceInfo;
}
