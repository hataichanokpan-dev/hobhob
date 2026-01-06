import { Lock, Users } from "lucide-react";
import type { Circle } from "@/types";

interface CircleCardProps {
  circle: Circle;
  onClick: () => void;
}

export function CircleCard({ circle, onClick }: CircleCardProps) {
  const isPrivate = circle.type === "private";
  const memberCount = circle.memberCount || 0;

  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden p-5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-left hover:scale-[1.01] hover:shadow-lg hover:shadow-[var(--color-brand)]/5 active:scale-[0.99] transition-all duration-300 w-full group"
    >
      {/* Subtle gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/0 to-[var(--color-brand)]/0 group-hover:from-[var(--color-brand)]/3 group-hover:to-[var(--color-brand)]/1 transition-all duration-500" />

      <div className="relative">
        {/* Header: Icon + Private Badge */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon with soft gradient background */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2.5xl shadow-sm transition-transform group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${circle.circleColor}20 0%, ${circle.circleColor}10 100%)`,
            }}
          >
            {circle.circleIcon}
          </div>

          {/* Private Badge - Minimal & Cute */}
          {isPrivate && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--color-brand)]/5 border border-[var(--color-brand)]/10">
              <Lock className="w-3 h-3 text-[var(--color-brand)]" strokeWidth={2.5} />
              <span className="text-[10px] font-medium text-[var(--color-brand)] tracking-wide">PRIVATE</span>
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-base mb-1.5 line-clamp-1 text-foreground leading-snug">
          {circle.name}
        </h3>

        {/* Description - Optional */}
        {circle.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {circle.description}
          </p>
        )}

        {/* Footer: Member Count - Clean & Professional */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="font-medium">{memberCount}</span>
            <span className="text-[11px]">members</span>
          </div>

          {/* Type indicator dot */}
          <div className="ml-auto">
            <div
              className="w-2 h-2 rounded-full transition-colors"
              style={{ backgroundColor: isPrivate ? circle.circleColor : "var(--color-brand)" }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
