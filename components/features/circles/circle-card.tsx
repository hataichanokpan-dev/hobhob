import { Lock, Users } from "lucide-react";
import type { Circle } from "@/types";

interface CircleCardProps {
  circle: Circle;
  onClick: () => void;
}

export function CircleCard({ circle, onClick }: CircleCardProps) {
  const isPrivate = circle.type === "private";
  const memberCount = circle.memberCount || 0;
  const isTarget = circle.mode === "target";

  return (
    <button
      onClick={onClick}
      className="relative p-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]/60 text-left hover:scale-[1.01] hover:border-[var(--color-brand)]/30 hover:shadow-md active:scale-[0.99] transition-all duration-200 w-full group"
    >
      <div className="relative">
        {/* Header: Icon + Badges */}
        <div className="flex items-start justify-between mb-3">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: `linear-gradient(135deg, ${circle.circleColor}18 0%, ${circle.circleColor}08 100%)`,
            }}
          >
            {circle.circleIcon}
          </div>

          {/* Compact Badges */}
          <div className="flex items-center gap-1.5">
            {/* Mode Badge - Compact pill */}
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand)]/6 border border-[var(--color-brand)]/10">
              <span className="text-[11px] leading-none">
                {isTarget ? "🎯" : "✅"}
              </span>
            </div>

            {/* Private Badge */}
            {isPrivate && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand)]/6 border border-[var(--color-brand)]/10">
                <Lock className="w-2.5 h-2.5 text-[var(--color-brand)]" strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm mb-1 line-clamp-1 text-foreground">
          {circle.name}
        </h3>

        {/* Description - Optional */}
        {circle.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {circle.description}
          </p>
        )}

        {/* Footer: Member Count */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--color-border)]/40">
          <Users className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
          <span className="text-[11px] text-muted-foreground">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </div>
    </button>
  );
}
