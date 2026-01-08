"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChange, getStoredDevUser } from "@/lib/auth/session";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CuteBackground } from "@/components/layout/cute-background";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useTranslation } from "@/hooks/use-translation";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  // Check authentication on mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    // Check for dev user first
    const devUser = getStoredDevUser();
    if (devUser) {
      console.log("🔧 Dev mode: User authenticated");
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    // Check Firebase auth state
    unsubscribe = onAuthStateChange((authUser) => {
      if (!isMounted) return;

      if (authUser) {
        console.log("✅ AppLayout: User authenticated");
        setIsAuthenticated(true);
        setIsChecking(false);
      } else {
        console.log("🔒 AppLayout: No user, redirecting to /sign-in");
        setIsAuthenticated(false);
        setIsChecking(false);
        router.push("/sign-in");
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  // Show loading while checking auth
  if (isChecking) {
    return <LoadingScreen message={t("loading.checkingAuth")} subtitle={t("loading.pleaseWait")} />;
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <AppHeader onMenuClick={handleMenuClick} />
      <main className="flex-1 pt-2 relative z-10">
        {children}
      </main>
      <AppFooter />
      <AppSidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

      <CuteBackground />
    </div>
  );
}
