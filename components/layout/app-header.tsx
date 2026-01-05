"use client";

import { Settings, Menu } from "lucide-react";
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
    <header className="sticky top-0 z-40 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo - Minimal & Clean */}
          <div className="flex items-center gap-3">
            {/* Logo with subtle glow */}
            <Link href="/today" className="flex items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg blur-sm opacity-50" />
                <img
                  src="/icons/hobhob_v2.png"
                  alt="HobHob"
                  className="relative w-12 h-12 rounded-lg shadow-sm"
                />
              </div>
            </Link>

            {/* Brand text - minimal */}
            <div className="flex flex-col">
              <h1 className="text-base font-semibold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-[#ff6a00] to-[#ff9933] bg-clip-text text-transparent">
                  HobHob
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5 leading-tight">
                {t("app.tagline")}
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Settings Button 
            <button
              onClick={handleOpenSettings}
              className="icon-btn"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          */}
            {/* Menu Button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="icon-btn"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
