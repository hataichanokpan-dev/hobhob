"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
      <div className="flex min-h-screen items-center justify-center p-4 bg-[var(--color-background)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-6"
        >
          {/* Animated Logo */}
          <motion.div
            className="inline-flex items-center justify-center relative"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl blur-xl opacity-50"
              style={{
                background: "linear-gradient(135deg, #ff6a00, #ff9933, #ffb84d)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <img
              src="/icons/hobhob_v2.png"
              alt="HobHob"
              className="relative w-24 h-24 rounded-2xl shadow-lg"
            />
          </motion.div>

          {/* Loading text with pulse */}
          <motion.div
            className="space-y-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-lg font-medium">Loading your space...</p>
            <p className="text-sm text-muted-foreground">One moment ✨</p>
          </motion.div>

          {/* Minimal loading dots */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--color-brand)]"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
