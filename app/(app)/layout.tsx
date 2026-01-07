"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/use-user-store";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CuteBackground } from "@/components/layout/cute-background";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, userProfile, isLoading } = useUserStore();

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  // Redirect to sign-in if not authenticated or no profile
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log("🔒 No user found, redirecting to /sign-in");
        router.push("/sign-in");
      } else if (!userProfile) {
        console.log("🔒 User authenticated but no profile, redirecting to /sign-in");
        router.push("/sign-in");
      }
    }
  }, [user, userProfile, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user or profile (will redirect via useEffect)
  if (!user || !userProfile) {
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
