"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChange, getStoredDevUser } from "@/lib/auth/session";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useTranslation } from "@/hooks/use-translation";

/**
 * Root page - redirects based on auth state
 * If user is authenticated, redirect to /today
 * Otherwise, redirect to /sign-in
 */
export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    // Check for dev user first
    const devUser = getStoredDevUser();
    if (devUser) {
      console.log("🔧 Dev mode: User already authenticated, redirecting to /today");
      router.push("/today");
      return;
    }

    // Check Firebase auth state
    unsubscribe = onAuthStateChange((user) => {
      if (!isMounted) return;

      if (user) {
        console.log("✅ User already authenticated, redirecting to /today");
        router.push("/today");
      } else {
        console.log("ℹ️ No authenticated user, redirecting to /sign-in");
        router.push("/sign-in");
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  // Show loading while checking auth state
  return <LoadingScreen message={t("loading.checkingAuth")} subtitle={t("loading.preparingSpace")} />;
}
