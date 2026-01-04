"use client";

import { useEffect, useState } from "react";
import { onAuthStateChange, getStoredDevUser } from "@/lib/auth/session";
import { useUserStore } from "@/store/use-user-store";
import { get } from "firebase/database";
import { getProfileRef } from "@/lib/db";
import type { UserProfile } from "@/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setUserProfile, setLoading } = useUserStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    // Initialize loading state
    setLoading(true);

    // Check for dev user first (before Firebase auth)
    const devUser = getStoredDevUser();
    if (devUser) {
      console.log("🔧 Dev mode: Using stored dev user");
      setUser(devUser);
      // Fetch user profile for dev user (non-blocking)
      get(getProfileRef(devUser.uid))
        .then((snapshot) => {
          if (isMounted && snapshot.exists()) {
            setUserProfile(snapshot.val() as UserProfile);
            console.log("✅ Dev user profile loaded");
          }
        })
        .catch((error) => {
          console.error("Error fetching dev user profile:", error);
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
            setInitialized(true);
          }
        });
    } else {
      // Use Firebase auth listener
      console.log("🔑 Firebase: Checking auth state...");
      unsubscribe = onAuthStateChange(async (user) => {
        if (!isMounted) return;

        console.log("Firebase auth state changed:", user ? "Authenticated" : "Not authenticated");
        setUser(user);

        if (user) {
          // Fetch user profile (with timeout to prevent hanging)
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
            );

            const snapshot = await Promise.race([
              get(getProfileRef(user.uid)),
              timeoutPromise,
            ]) as any;

            if (snapshot && snapshot.exists()) {
              setUserProfile(snapshot.val() as UserProfile);
              console.log("✅ User profile loaded:", user.email);
            } else {
              console.log("ℹ️ No profile found, will be created on first use");
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            // Continue anyway - profile will be created when needed
          }
        }

        setLoading(false);
        setInitialized(true);
      });
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [setUser, setUserProfile, setLoading]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
