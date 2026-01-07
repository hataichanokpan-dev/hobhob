"use client";

import { Clock, Calendar, Repeat } from "lucide-react";
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
  const windowLabel = getWindowLabel(target.windowType, target.customDurationDays);
  const isExpiringSoon = Date.now() > instance.windowEnd - (24 * 60 * 60 * 1000);

  // Safe color/icon extraction with fallback
  const targetIcon = target.icon || "🎯";
  const targetColor = target.color || "#FF6600";
  const isHexColor = targetColor.startsWith("#");

  return (
    <div
      className="surface p-3 cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group rounded-2xl"
      onClick={onClick}
      style={{ borderLeft: `3px solid ${targetColor}` }}
    >
      <div className="flex items-center gap-2">
        {/* Cute small icon */}
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"
          style={{
            backgroundColor: isHexColor ? targetColor : undefined,
            background: isHexColor ? undefined : `var(--color-${targetColor})`,
          }}
        >
          <span className="text-lg">{targetIcon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-[var(--color-brand)] transition-colors">
            {target.title}
          </h3>

          {/* Compact Meta Info */}
          <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px]">
            {/* Window Type - smaller */}
            <div
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${targetColor}15`,
                color: targetColor,
              }}
            >
              <Calendar className="w-2.5 h-2.5" />
              <span>{windowLabel}</span>
            </div>

            {/* Recurring Badge - smaller */}
            {target.isRecurring && (
              <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[var(--color-muted)] text-muted-foreground">
                <Repeat className="w-2.5 h-2.5" />
                <span>↻</span>
              </div>
            )}

            {/* Time Remaining - smaller */}
            <div className={`inline-flex items-center gap-0.5 ${isExpiringSoon ? "text-orange-500" : "text-muted-foreground"}`}>
              <Clock className="w-2.5 h-2.5" />
              <span>{timeRemaining}</span>
            </div>
          </div>
        </div>

        {/* Cute Complete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete(instance.id);
          }}
          className="flex-shrink-0 w-8 h-8 rounded-full text-white text-sm hover:scale-110 active:scale-95 transition-all shadow-sm flex items-center justify-center"
          style={{
            backgroundColor: targetColor,
          }}
          aria-label="Mark done"
        >
          ✓
        </button>
      </div>
    </div>
  );
}
