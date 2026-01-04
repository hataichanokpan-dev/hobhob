"use client";

import { Heart } from "lucide-react";

interface AppFooterProps {
  showBottomNav?: boolean;
}

export function AppFooter({ showBottomNav = true }: AppFooterProps) {
  return (
    <footer className={`border-t border-[var(--color-border)] bg-[var(--color-card)] ${showBottomNav ? "pb-24" : "pb-4"}`}>
      <div className="px-4 py-3">
        <div className="flex flex-col items-center gap-3">
          {/* Logo with message */}
          <div className="flex items-center gap-2">
            <img
              src="/icons/hobhob_v2.png"
              alt="HobHob"
              className="w-5 h-5 rounded"
            />
            <span className="text-sm">Small steps lead to big changes 🐼</span>
          </div>

          {/* Quick Links */}
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <a href="/today" className="hover:text-[var(--color-brand)] transition-colors">
              Today
            </a>
            <a href="/habits" className="hover:text-[var(--color-brand)] transition-colors">
              Habits
            </a>
            <a href="/stats" className="hover:text-[var(--color-brand)] transition-colors">
              Stats
            </a>
            <a href="/settings" className="hover:text-[var(--color-brand)] transition-colors">
              Settings
            </a>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" />
            <span>© {new Date().getFullYear()} HobHob</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
