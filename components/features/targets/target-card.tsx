"use client";

import { Clock, Calendar, Repeat, Check, Sparkles, Star } from "lucide-react";
import { getTimeRemaining, getWindowLabel } from "@/lib/utils/date";
import type { Target, TargetInstance } from "@/types";

interface TargetCardProps {
  target: Target;
  instance: TargetInstance;
  timezone: string;
  onComplete: (instanceId: string) => void;
  onClick?: () => void;
}

export function TargetCard({
  target,
  instance,
  timezone,
  onComplete,
  onClick,
}: TargetCardProps) {
  const timeRemaining = getTimeRemaining(instance.windowEnd, timezone);
  const windowLabel = getWindowLabel(
    target.windowType,
    target.customDurationDays
  );
  const isExpiringSoon = Date.now() > instance.windowEnd - 24 * 60 * 60 * 1000;

  // Safe color/icon extraction with fallback
  const targetIcon = target.icon || "🎯";
  const targetColor = target.color || "#FF6600";
  const isHexColor = targetColor.startsWith("#");

  return (
    <div
      className="surface p-4 cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group rounded-3xl relative overflow-hidden"
      onClick={onClick}
      style={{ borderLeft: `3px solid ${targetColor}` }}
    >
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand)]/5 via-purple-500/5 to-[var(--color-brand)]/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Sparkle decoration - top right */}
      <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-3 h-3 text-yellow-400/60" />
      </div>

      {/* Star decoration - bottom left */}
      <div className="absolute bottom-2 left-12 opacity-0 group-hover:opacity-100 transition-opacity delay-75">
        <Star className="w-2.5 h-2.5 text-yellow-400/40 fill-yellow-400/40" />
      </div>

      <div className="relative flex items-center gap-3">
        {/* Cute small icon with glow effect */}
        <div className="relative">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 relative"
            style={{
              backgroundColor: isHexColor ? targetColor : undefined,
              background: isHexColor
                ? `linear-gradient(135deg, ${targetColor}dd, ${targetColor}aa)`
                : `var(--color-${targetColor})`,
            }}
          >
            <span className="text-xl drop-shadow-sm">{targetIcon}</span>
          </div>
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-60 transition-opacity -z-10"
            style={{ backgroundColor: targetColor }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-[var(--color-brand)] transition-colors">
              {target.title}
            </h3>
            {/* Star decoration for title */}
            <Star className="w-3 h-3 text-yellow-400/60 fill-yellow-400/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Description */}
          {target.description && (
            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
              {target.description}
            </p>
          )}

          {/* Compact Meta Info */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
            {/* Window Type */}
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium shadow-sm"
              style={{
                backgroundColor: `${targetColor}20`,
                color: targetColor,
              }}
            >
              <Calendar className="w-3 h-3" />
              <span>{windowLabel}</span>
            </div>

            {/* Recurring Badge */}
            {target.isRecurring && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 shadow-sm">
                <Repeat className="w-3 h-3" />
                <span>↻</span>
              </div>
            )}

            {/* Time Remaining */}
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                isExpiringSoon
                  ? "bg-orange-500/20 text-orange-500"
                  : "bg-[var(--color-muted)] text-muted-foreground"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{timeRemaining}</span>
            </div>

            {/* Success Criteria Badge */}
            {target.successCriteriaText && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-brand)]/20 text-[var(--color-brand)] shadow-sm">
                <span>✨</span>
                <span className="line-clamp-1 max-w-[100px]">{target.successCriteriaText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cute Complete Button - Empty initially, shows checkmark on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete(instance.id);
          }}
          className="flex-shrink-0 w-10 h-10 rounded-full text-white text-sm hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg flex items-center justify-center relative overflow-hidden group/btn"
          style={{
            backgroundColor: targetColor,
          }}
          aria-label="Mark done"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />

          {/* Checkmark - Only shows on hover, empty initially */}
          <Check className="w-5 h-5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 drop-shadow-sm" />
        </button>
      </div>

      {/* Bottom decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-brand)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
