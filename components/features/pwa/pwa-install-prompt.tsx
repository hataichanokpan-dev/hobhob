"use client";

import { X, Download, Share2 } from "lucide-react";
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
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto"
    >
      <div className="surface rounded-3xl p-5 shadow-2xl border border-[var(--color-border)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand)]/80 flex items-center justify-center shadow-lg">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {t("pwaInstall.title")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("pwaInstall.subtitle")}
              </p>
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
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-brand)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          {t("pwaInstall.gotIt")}
        </button>
      </div>
    </motion.div>
  );
}

function IOSInstructions({ browser }: { browser: string }) {
  const { t } = useTranslation();

  if (browser !== "safari") {
    return (
      <div className="p-3 rounded-xl bg-[var(--color-muted)]">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("pwaInstall.ios.notSafari")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-lg bg-[var(--color-muted)] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Share2 className="w-3 h-3 text-[var(--color-brand)]" />
        </div>
        <p className="text-xs leading-relaxed flex-1">
          {t("pwaInstall.ios.step1")}
        </p>
      </div>
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-lg bg-[var(--color-muted)] flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px] font-bold text-[var(--color-brand)]">
            +
          </span>
        </div>
        <p className="text-xs leading-relaxed flex-1">
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
      <div className="p-3 rounded-xl bg-[var(--color-muted)]">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("pwaInstall.android.chrome")}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-[var(--color-muted)]">
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t("pwaInstall.android.other")}
      </p>
    </div>
  );
}
