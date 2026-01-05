"use client";

import { Check, Flame } from "lucide-react";
import { CheckinToggle } from "./checkin-toggle";
import { getFrequencyText } from "@/lib/utils/habits";
import type { Habit } from "@/types";

interface HabitCardProps {
  habit: Habit;
  checked: boolean;
  streak?: number;
  onToggle: (habitId: string, note?: string) => void;
}

export function HabitCard({ habit, checked, streak = 0, onToggle }: HabitCardProps) {
  const colorClasses: Record<string, { bg: string; text: string; glow: string }> = {
    orange: { bg: "bg-[#FF6600]/20", text: "text-[#FF6600]", glow: "glow-orange" },
    "orange-light": { bg: "bg-[#FF9933]/20", text: "text-[#FF9933]", glow: "glow-orange" },
    yellow: { bg: "bg-[#FFCC00]/20", text: "text-[#FFCC00]", glow: "glow-yellow" },
    pink: { bg: "bg-[#FF66B2]/20", text: "text-[#FF66B2]", glow: "glow-pink" },
    green: { bg: "bg-[#33CC33]/20", text: "text-[#33CC33]", glow: "" },
    blue: { bg: "bg-[#3399FF]/20", text: "text-[#3399FF]", glow: "" },
    red: { bg: "bg-[#FF3333]/20", text: "text-[#FF3333]", glow: "" },
  };

  const colors = colorClasses[habit.color] || colorClasses.orange;

  return (
    <div className={`habit-card ${checked ? colors.glow : ""}`}>
      <div className="flex items-center gap-4">
        {/* Icon with colored background when checked */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-colors ${checked ? colors.bg : "bg-[var(--color-muted)]"}`}>
          {habit.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg ${checked ? colors.text : ""}`}>{habit.name}</h3>
          {habit.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {habit.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            {streak > 0 && (
              <div className={`streak-badge ${colors.bg} ${colors.text} border-current`}>
                <Flame className="w-3 h-3" />
                <span>{streak}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {getFrequencyText(habit)}
            </p>
          </div>
        </div>

        {/* Check-in Toggle */}
        <CheckinToggle habit={habit} checked={checked} onToggle={onToggle} />
      </div>
    </div>
  );
}
