"use client";

import { Sparkles, Heart, Star } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-card)] relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand)]/5 via-purple-500/5 to-[var(--color-brand)]/5 pointer-events-none" />

      <div className="px-4 py-3 relative">
        <div className="flex flex-col items-center gap-2">
          {/* Logo and tagline - cute & enhanced */}
          <div className="flex items-center gap-2 group">
            <div className="relative">
              <img
                src="/icons/hobhob_v2.png"
                alt="HobHob"
                className="w-6 h-6 rounded-lg shadow-md shadow-[var(--color-brand)]/20 group-hover:scale-110 transition-transform"
              />
               
            </div>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Small steps, big changes
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            </span>
          </div>

          {/* Copyright - enhanced with heart */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
            <span>© {new Date().getFullYear()} HobHob</span>
            <span className="text-pink-500">• </span>
            <span>Made with</span>
            <Heart className="w-3 h-3 fill-pink-500 animate-pulse-slow" />
          </div>
        </div>
      </div>
    </footer>
  );
}
