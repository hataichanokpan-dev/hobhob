"use client";

import { Settings, Menu, Sparkles, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleOpenSettings = () => {
    router.push("/settings");
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border)] relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand)]/5 via-purple-500/5 to-[var(--color-brand)]/5 pointer-events-none" />

      <div className="px-4 py-3 relative">
        <div className="flex items-center justify-between">
          {/* Left: Logo - Cute & Enhanced */}
          <div className="flex items-center gap-3">
            {/* Logo with sparkle decoration */}
            <Link href="/today" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg blur-md opacity-40 bg-gradient-to-br from-[var(--color-brand)] to-purple-500 group-hover:opacity-60 transition-opacity" />
                <img
                  src="/icons/hobhob_v2.png"
                  alt="HobHob"
                  className="relative w-12 h-12 rounded-lg shadow-md shadow-[var(--color-brand)]/20 group-hover:scale-105 transition-transform"
                />
                <Sparkles className="w-4 h-4 text-[var(--color-brand)] absolute -top-1 -right-1 animate-pulse" />
              </div>
            </Link>

            {/* Brand text - enhanced with star */}
            <div className="flex flex-col">
              <h1 className="text-base font-bold tracking-tight leading-tight flex items-center gap-1">
                <span className="bg-gradient-to-r from-[#ff6a00] to-[#ff9933] bg-clip-text text-transparent">
                  HobHob
                </span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5 leading-tight flex items-center gap-0.5">
                {t("app.tagline")}
                <Sparkles className="w-2 h-2 text-[var(--color-brand)]" />
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Settings Button
            <button
              onClick={handleOpenSettings}
              className="icon-btn relative group"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          */}
            {/* Menu Button - Enhanced */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="icon-btn relative group hover:scale-110 transition-transform"
                aria-label="Open menu"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <Menu className="w-5 h-5 relative z-10" />
                <Sparkles className="w-3 h-3 text-[var(--color-brand)] absolute -top-0.5 -right-0.5 animate-pulse-slow" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
