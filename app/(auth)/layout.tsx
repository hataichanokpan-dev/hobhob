"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { SplashScreen } from "@/components/layout/splash-screen";
import { CuteBackground } from "@/components/layout/cute-background";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);

  // Check if user has already seen the splash screen recently
  useEffect(() => {
    const lastSplash = localStorage.getItem("lastSplashTime");
    const now = Date.now();

    // Show splash screen if:
    // 1. Never shown before, OR
    // 2. Last shown more than 24 hours ago
    if (lastSplash) {
      const timeSinceLastSplash = now - parseInt(lastSplash, 10);
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeSinceLastSplash < twentyFourHours) {
        // Skip splash screen
        setShowSplash(false);
        return;
      }
    }

    // Update last splash time
    localStorage.setItem("lastSplashTime", now.toString());
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {!showSplash && (
        <>
          {children}
         
        </>
      )}
    </div>
  );
}
