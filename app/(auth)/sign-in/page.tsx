"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signInWithDevUser, isDevBypassEnabled, onAuthStateChange, getStoredDevUser } from "@/lib/auth/session";
import { X } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showDevButton = isDevBypassEnabled();

  // Auto-redirect if already authenticated
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
    unsubscribe = onAuthStateChange((authUser) => {
      if (!isMounted) return;

      if (authUser) {
        console.log("✅ User already authenticated, redirecting to /today");
        router.push("/today");
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  function getErrorMessage(err: unknown): string {
    if (err && typeof err === "object" && "code" in err) {
      const code = (err as { code: string }).code;

      switch (code) {
        case "auth/unauthorized-domain":
          return "This domain is not authorized. Please add it to Firebase Console";
        case "auth/popup-blocked":
          return "Popup was blocked. Please allow popups and try again.";
        case "auth/popup-closed-by-user":
          return "Sign-in was cancelled. Please try again.";
        case "auth/network-request-failed":
          return "Network error. Please check your connection.";
        case "auth/invalid-api-key":
          return "Invalid API key. Please check your Firebase configuration.";
        case "auth/api-key-not-authorized":
          return "API key not authorized. Please check Firebase Console.";
        default:
          return `Sign-in failed: ${code}`;
      }
    }
    return "Failed to sign in. Please try again.";
  }

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      window.location.href = "/today";
    } catch (err) {
      console.error("Sign in error:", err);
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleDevSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithDevUser();
      window.location.href = "/today";
    } catch (err) {
      console.error("Dev sign in error:", err);
      setError("Dev bypass failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
      },
    },
  } as const;

  // Floating decorative elements
  const FloatingEmoji = ({ emoji, delay, x, y }: { emoji: string; delay: number; x: string; y: string }) => (
    <motion.div
      className="absolute text-2xl opacity-20 pointer-events-none"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -15, 0],
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)] relative overflow-hidden"
    >
      {/* Floating cute decorations */}
      <FloatingEmoji emoji="✨" delay={0} x="10%" y="20%" />
      <FloatingEmoji emoji="🌟" delay={1} x="85%" y="15%" />
      <FloatingEmoji emoji="💫" delay={2} x="15%" y="70%" />
      <FloatingEmoji emoji="⭐" delay={0.5} x="80%" y="75%" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo & Brand - Enhanced Cute Animation */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center mb-4 relative"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {/* Enhanced glow effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl blur-2xl opacity-60"
              style={{
                background: "linear-gradient(135deg, #ff6a00, #ff9933, #ffb84d)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.6, 0.4],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.img
              src="/icons/hobhob_v2.png"
              alt="HobHob"
              className="relative w-32 h-32 rounded-2xl shadow-lg"
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
           
          </motion.div>
          <motion.h1
            className="text-2xl font-semibold mb-1"
            style={{
              background: "linear-gradient(90deg, #ff6a00, #ff9933, #ffb84d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            HobHob
          </motion.h1>
          <motion.p
            className="text-sm text-muted-foreground"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Build better habits, one day at a time ✨
          </motion.p>
        </motion.div>

        {/* Sign In Form - Minimal Card with Animation */}
        <motion.div
          variants={itemVariants}
          className="surface p-6 space-y-6"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            variants={itemVariants}
            className="space-y-1"
          >
            <h2 className="text-lg font-semibold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to track your habits
            </p>
          </motion.div>

          {/* Google Sign In Button */}
          <motion.div
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-[var(--color-foreground)] text-[var(--color-background)] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[var(--color-background)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </motion.div>

          {/* Dev Mode Bypass */}
          {showDevButton && (
            <motion.div
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleDevSignIn}
                disabled={isLoading}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] text-sm hover:bg-[var(--color-muted)] disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🔧
                    </motion.span>
                    Dev Mode
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Error Message with Animation */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm relative"
            >
              <button
                onClick={() => setError(null)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="pr-6">{error}</p>
            </motion.div>
          )}

          {/* Terms */}
          <motion.div
            variants={itemVariants}
            className="text-[10px] text-center text-muted-foreground leading-relaxed"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </motion.div>
        </motion.div>

        {/* Footer - Enhanced Cute Animation */}
        <motion.div
          variants={itemVariants}
          className="mt-6 text-center space-y-2"
        >
          <motion.p
            className="text-xs text-muted-foreground inline-flex items-center gap-1"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Made with
            <motion.span
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              💕
            </motion.span>
            for habit builders
          </motion.p>
          
        </motion.div>
      </div>
    </motion.div>
  );
}
