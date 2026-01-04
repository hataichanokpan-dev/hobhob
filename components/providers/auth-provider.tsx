"use client";

import { useEffect, useState } from "react";
import { onAuthStateChange } from "@/lib/auth/session";
import { useUserStore } from "@/store/use-user-store";
import { get } from "firebase/database";
import { getProfileRef } from "@/lib/db";
import type { UserProfile } from "@/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setUserProfile, setLoading } = useUserStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);

      if (user) {
        // Fetch user profile
        try {
          const snapshot = await get(getProfileRef(user.uid));
          if (snapshot.exists()) {
            setUserProfile(snapshot.val() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }

      setLoading(false);
      setInitialized(true);
    });

    return unsubscribe;
  }, [setUser, setUserProfile, setLoading]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
