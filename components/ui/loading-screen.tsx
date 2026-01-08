"use client";

import { motion } from "framer-motion";

export interface LoadingScreenProps {
  /**
   * The main message to display
   * @default "Loading"
   */
  message?: string;

  /**
   * Subtitle/context about what's being loaded
   * @default "Please wait..."
   */
  subtitle?: string;

  /**
   * Size of the loading animation
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Whether to show the cute background decorations
   * @default true
   */
  showDecorations?: boolean;
}

const sizeMap = {
  sm: { logo: 64, spinner: 32, text: "text-sm", spacing: 4 },
  md: { logo: 96, spinner: 40, text: "text-base", spacing: 6 },
  lg: { logo: 128, spinner: 48, text: "text-lg", spacing: 8 },
};

/**
 * Floating decorative emoji element
 */
function FloatingEmoji({
  emoji,
  delay,
  x,
  y,
  size = 24,
}: {
  emoji: string;
  delay: number;
  x: string;
  y: string;
  size?: number;
}) {
  return (
    <motion.div
      className="absolute opacity-20 pointer-events-none"
      style={{ left: x, top: y, fontSize: size }}
      animate={{
        y: [0, -15, 0],
        rotate: [0, 15, -15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.div>
  );
}

/**
 * Professional and cute loading screen with animated feedback
 *
 * Shows what's being loaded with smooth animations and decorative elements.
 * Used throughout the app for consistent loading experience.
 */
export function LoadingScreen({
  message = "Loading",
  subtitle = "Please wait...",
  size = "md",
  showDecorations = true,
}: LoadingScreenProps) {
  const config = sizeMap[size];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)] relative overflow-hidden">
      {/* Floating cute decorations */}
      {showDecorations && (
        <>
          <FloatingEmoji emoji="✨" delay={0} x="10%" y="15%" size={28} />
          <FloatingEmoji emoji="🌟" delay={1.5} x="85%" y="10%" size={32} />
          <FloatingEmoji emoji="💫" delay={0.8} x="12%" y="75%" size={24} />
          <FloatingEmoji emoji="⭐" delay={2} x="88%" y="80%" size={26} />
          <FloatingEmoji emoji="🔥" delay={1.2} x="50%" y="5%" size={20} />
          <FloatingEmoji emoji="💪" delay={2.5} x="5%" y="45%" size={22} />
          <FloatingEmoji emoji="🎯" delay={0.5} x="92%" y="50%" size={24} />
        </>
      )}

      <div className="relative z-10 text-center space-y-6">
        {/* Animated Logo with Glow */}
        <motion.div
          className="inline-flex items-center justify-center mb-4 relative"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl blur-xl"
            style={{
              background: "linear-gradient(135deg, #ff6a00, #ff9933, #ffb84d)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.img
            src="/icons/hobhob_v2.png"
            alt="HobHob"
            className="relative rounded-2xl shadow-lg"
            style={{
              width: config.logo,
              height: config.logo,
            }}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Loading Spinner Ring */}
        <motion.div
          className="inline-flex items-center justify-center relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Outer rotating ring */}
          <motion.div
            className="absolute rounded-full border-2 border-transparent"
            style={{
              width: config.spinner * 2,
              height: config.spinner * 2,
              borderTopColor: "var(--color-brand)",
              borderRightColor: "var(--color-brand)",
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          {/* Inner rotating ring (opposite direction) */}
          <motion.div
            className="absolute rounded-full border-2 border-transparent"
            style={{
              width: config.spinner * 1.4,
              height: config.spinner * 1.4,
              borderBottomColor: "var(--color-brand)",
              borderLeftColor: "var(--color-brand)",
              opacity: 0.6,
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          {/* Center pulse */}
          <motion.div
            className="rounded-full bg-[var(--color-brand)]"
            style={{
              width: config.spinner * 0.5,
              height: config.spinner * 0.5,
            }}
            animate={{
              scale: [1, 0.8, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Loading Messages */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.h2
            className={`font-semibold ${config.text}`}
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
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {message}
          </motion.h2>

          {/* Animated dots for subtitle */}
          <motion.p
            className="text-sm text-muted-foreground flex items-center justify-center gap-1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {subtitle}
            <span className="flex gap-0.5 ml-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-[var(--color-brand)]"
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
            </span>
          </motion.p>
        </motion.div>

        {/* Progress bar at bottom */}
        <motion.div
          className="w-full max-w-xs mx-auto"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="h-1 rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand)] opacity-30" />
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Compact loading spinner for inline use
 */
export function InlineLoader({
  size = "md",
  text,
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
}) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const spinnerSize = sizeMap[size];

  return (
    <div className="inline-flex items-center gap-3">
      <motion.div
        className="rounded-full border-2 border-transparent border-t-[var(--color-brand)] border-r-[var(--color-brand)]"
        style={{
          width: spinnerSize,
          height: spinnerSize,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {text && (
        <motion.span
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}
