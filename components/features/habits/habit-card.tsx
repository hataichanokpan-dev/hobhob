"use client";

import { Check, Flame, Users } from "lucide-react";
import { CheckinToggle } from "./checkin-toggle";
import { getFrequencyText } from "@/lib/utils/habits";
import { getCircle } from "@/lib/db/circles";
import { useEffect, useState } from "react";
import type { Habit, Circle } from "@/types";

interface HabitCardProps {
  habit: Habit;
  checked: boolean;
  streak?: number;
  onToggle: (habitId: string, note?: string) => void;
}

export function HabitCard({ habit, checked, streak = 0, onToggle }: HabitCardProps) {
  const [circle, setCircle] = useState<Circle | null>(null);

  // Fetch circle data if habit is linked to a circle
  useEffect(() => {
    if (habit.circleId) {
      getCircle(habit.circleId).then(setCircle).catch(() => {
        setCircle(null);
      });
    }
  }, [habit.circleId]);

  const colorClasses: Record<string, { bg: string; text: string; glow: string }> = {
    orange: { bg: "bg-[#FF6600]/20", text: "text-[#FF6600]", glow: "glow-orange" },
    "orange-light": { bg: "bg-[#FF9933]/20", text: "text-[#FF9933]", glow: "glow-orange" },
    yellow: { bg: "bg-[#FFCC00]/20", text: "text-[#FFCC00]", glow: "glow-yellow" },
    pink: { bg: "bg-[#FF66B2]/20", text: "text-[#FF66B2]", glow: "glow-pink" },
    green: { bg: "bg-[#33CC33]/20", text: "text-[#33CC33]", glow: "" },
    blue: { bg: "bg-[#3399FF]/20", text: "text-[#3399FF]", glow: "" },
    red: { bg: "bg-[#FF3333]/20", text: "text-[#FF3333]", glow: "" },
  };

  const isCustomColor = habit.color.startsWith("#");
  const customColor = habit.color;
  const colors = isCustomColor ? {
    bg: "",
    text: "",
    glow: "",
  } : (colorClasses[habit.color] || colorClasses.orange);

  const customTextStyle = isCustomColor && checked ? {
    color: customColor,
  } : {};

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[var(--color-card)] border transition-all duration-300 ${
        checked && !isCustomColor
          ? `${colors.bg} ${colors.text} border-current shadow-lg`
          : "border-[var(--color-border)] hover:border-[var(--color-brand)]/30 hover:shadow-md"
      }`}
      style={isCustomColor && checked ? {
        backgroundColor: `${customColor}08`,
        borderColor: customColor,
        boxShadow: `0 10px 30px ${customColor}20`,
      } : {}}
    >
      {/* Subtle corner dot for circle habits */}
      {circle && !checked && (
        <div
          className="absolute top-3 right-3 w-2 h-2 rounded-full"
          style={{ backgroundColor: circle.circleColor }}
        />
      )}

      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon with beautiful background */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all duration-300 ${
                checked && !isCustomColor
                  ? `${colors.bg} scale-105`
                  : "bg-[var(--color-muted)]"
              }`}
              style={isCustomColor && checked ? {
                backgroundColor: `${customColor}20`,
                transform: "scale(1.05)",
              } : {}}
            >
              {habit.icon}
            </div>

            {/* Completion Check */}
            {checked && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md animate-scale-in">
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
            )}

            {/* Circle mini badge */}
            {circle && (
              <div
                className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-[var(--color-card)]"
                style={{ backgroundColor: circle.circleColor }}
              >
                <span className="text-[9px]">{circle.circleIcon}</span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-lg leading-tight mb-1 transition-colors ${
                checked && !isCustomColor ? colors.text : "text-foreground"
              }`}
              style={customTextStyle}
            >
              {habit.name}
            </h3>

            {habit.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1 leading-relaxed">
                {habit.description}
              </p>
            )}

            {/* Bottom Row: Streak + Frequency + Circle */}
            <div className="flex items-center gap-2 flex-wrap">
              {streak > 0 && (
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                    !isCustomColor ? `${colors.bg} ${colors.text} border-current` : ""
                  }`}
                  style={isCustomColor ? {
                    backgroundColor: `${customColor}15`,
                    color: customColor,
                    borderColor: customColor,
                  } : {}}
                >
                  <Flame className="w-3 h-3" strokeWidth={2.5} />
                  <span className="font-semibold">{streak}</span>
                  <span className="text-[10px] opacity-80">day{streak !== 1 ? "s" : ""}</span>
                </div>
              )}

              <span className="text-xs text-muted-foreground">
                {getFrequencyText(habit)}
              </span>

              {/* Minimal circle tag */}
              {circle && (
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: `${circle.circleColor}15`,
                    color: circle.circleColor,
                  }}
                >
                  <Users className="w-2.5 h-2.5" strokeWidth={2.5} />
                  <span>{circle.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Check-in Toggle */}
          <CheckinToggle habit={habit} checked={checked} onToggle={onToggle} />
        </div>
      </div>
    </div>
  );
}
