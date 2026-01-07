"use client";

import { X, Download, Share2, Sparkles } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useFirstTime } from "@/hooks/use-first-time";
import { useTranslation } from "@/hooks/use-translation";
import { motion, AnimatePresence } from "framer-motion";

interface PWAInstallPromptProps {
  onClose: () => void;
}

export function PWAInstallPrompt({ onClose }: PWAInstallPromptProps) {
  const { t } = useTranslation();
  const { device, browser, canShowPrompt } = usePWAInstall();
  const { markAsSeen } = useFirstTime();

  const handleClose = () => {
    markAsSeen();
    onClose();
  };

  if (!canShowPrompt) return null;

  const isIOS = device === "ios";
  const isAndroid = device === "android";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto"
    >
      {/* Animated gradient border */}
      <div className="relative rounded-3xl p-0.5 bg-[var(--color-brand)] via-purple-500 to-[var(--color-brand)] bg-[length:200%_100%] animate-gradient-x">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-[var(--color-brand)]/20 blur-sm"></div>

        {/* Main card content */}
        <div className="relative surface rounded-3xl p-5 shadow-2xl">
           

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Icon with glow effect */}
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand)]  flex items-center justify-center shadow-lg">
                  <Download className="w-8 h-6 text-white" />
                </div>
                 
              </div>
              <div>
                <h3 className="font-bold text-base flex items-center gap-1.5">
                  {t("pwaInstall.title")}
                  
                </h3>
                <span className="text-xs text-muted-foreground">
                  {t("pwaInstall.subtitle")}
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl hover:bg-[var(--color-muted)] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Instructions based on device */}
          <div className="space-y-3 mb-4">
            {isIOS && (
              <IOSInstructions browser={browser} />
            )}
            {isAndroid && (
              <AndroidInstructions browser={browser} />
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleClose}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-brand)] text-white font-medium text-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {t("pwaInstall.gotIt")}
          </button>
        </div>
      </div>

      {/* Glow effect at bottom */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[var(--color-brand)]/50 to-transparent blur-sm"></div>
    </motion.div>
  );
}

function IOSInstructions({ browser }: { browser: string }) {
  const { t } = useTranslation();

  if (browser !== "safari") {
    return (
      <div className="p-3 rounded-xl bg-[var(--color-brand)] border border-[var(--color-brand)]/20">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("pwaInstall.ios.notSafari")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brand)]/10 to-purple-500/10 border border-[var(--color-brand)]/10">
        <div className="w-6 h-6 rounded-lg bg-[var(--color-brand)] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <Share2 className="w-3 h-3 text-white" />
        </div>
        <p className="text-xs leading-relaxed flex-1 font-medium">
          {t("pwaInstall.ios.step1")}
        </p>
      </div>
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/10">
        <div className="w-6 h-6 rounded-lg bg-[var(--color-brand)] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <span className="text-[10px] font-bold text-white">
            +
          </span>
        </div>
        <p className="text-xs leading-relaxed flex-1 font-medium">
          {t("pwaInstall.ios.step2")}
        </p>
      </div>
    </div>
  );
}

function AndroidInstructions({ browser }: { browser: string }) {
  const { t } = useTranslation();

  if (browser === "chrome" || browser === "samsung") {
    return (
      <div className="p-3 rounded-xl bg-[var(--color-muted)] border border-[var(--color-brand)]/20">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("pwaInstall.android.chrome")}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-[var(--color-muted)] border border-[var(--color-brand)]/20">
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t("pwaInstall.android.other")}
      </p>
    </div>
  );
}
