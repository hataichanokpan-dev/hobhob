"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import type { Habit } from "@/types";

interface CheckinToggleProps {
  habit: Habit;
  checked: boolean;
  onToggle: (habitId: string) => void;
  disabled?: boolean;
}

// Color mapping based on hobhob icon palette
const COLOR_MAP: Record<string, string> = {
  orange: "#FF6600",
  "orange-light": "#FF9933",
  yellow: "#FFCC00",
  pink: "#FF66B2",
  green: "#33CC33",
  blue: "#3399FF",
  red: "#FF3333",
};

export function CheckinToggle({
  habit,
  checked,
  onToggle,
  disabled = false,
}: CheckinToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (disabled) return;
    setIsAnimating(true);
    onToggle(habit.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const color = COLOR_MAP[habit.color] || COLOR_MAP.orange;

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`checkin-toggle ${checked ? "checked" : "unchecked"} ${
        isAnimating ? "scale-90" : "scale-100"
      }`}
      style={{
        borderColor: checked ? color : undefined,
        boxShadow: checked
          ? `0 0 20px ${color}40`
          : undefined,
      }}
    >
      {checked && (
        <Check
          className="w-6 h-6 text-white"
          style={{ color }}
        />
      )}
    </button>
  );
}
