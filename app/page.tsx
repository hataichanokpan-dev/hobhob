"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/use-user-store";
import { onAuthStateChange, getStoredDevUser } from "@/lib/auth/session";

/**
 * Root page - redirects based on auth state
 * If user is authenticated, redirect to /today
 * Otherwise, redirect to /sign-in
 */
export default function HomePage() {
  const router = useRouter();
  const { setUser, setUserProfile, isLoading } = useUserStore();

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
    unsubscribe = onAuthStateChange(async (user) => {
      if (!isMounted) return;

      if (user) {
        console.log("✅ User already authenticated, redirecting to /today");
        setUser(user);
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
  }, [router, setUser]);

  // Show loading while checking auth state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
