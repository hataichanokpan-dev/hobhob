"use client";

import { Check, Flame } from "lucide-react";
import { CheckinToggle } from "./checkin-toggle";
import type { Habit } from "@/types";

interface HabitCardProps {
  habit: Habit;
  checked: boolean;
  streak?: number;
  onToggle: (habitId: string) => void;
}

export function HabitCard({ habit, checked, streak = 0, onToggle }: HabitCardProps) {
  const colorClasses: Record<string, { bg: string; text: string; glow: string }> = {
    purple: { bg: "bg-purple-500/20", text: "text-purple-500", glow: "glow-purple" },
    blue: { bg: "bg-blue-500/20", text: "text-blue-500", glow: "glow-blue" },
    pink: { bg: "bg-pink-500/20", text: "text-pink-500", glow: "glow-pink" },
    green: { bg: "bg-green-500/20", text: "text-green-500", glow: "" },
    orange: { bg: "bg-orange-500/20", text: "text-orange-500", glow: "" },
    red: { bg: "bg-red-500/20", text: "text-red-500", glow: "" },
  };

  const colors = colorClasses[habit.color] || colorClasses.purple;

  return (
    <div className={`habit-card ${checked ? colors.glow : ""}`}>
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl glass flex items-center justify-center text-3xl ${checked ? colors.bg : ""}`}>
          {habit.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">{habit.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            {streak > 0 && (
              <div className={`streak-badge ${colors.bg} ${colors.text} border-current`}>
                <Flame className="w-3 h-3" />
                <span>{streak}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {habit.frequency === "daily" ? "Every day" : "Specific days"}
            </p>
          </div>
        </div>

        {/* Check-in Toggle */}
        <CheckinToggle habit={habit} checked={checked} onToggle={onToggle} />
      </div>
    </div>
  );
}
