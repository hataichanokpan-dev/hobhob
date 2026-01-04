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

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`checkin-toggle ${checked ? "checked" : "unchecked"} ${
        isAnimating ? "scale-90" : "scale-100"
      }`}
      style={{
        borderColor: checked ? habit.color : undefined,
        boxShadow: checked
          ? `0 0 20px ${habit.color === "purple" ? "#8b5cf6" : habit.color === "blue" ? "#3b82f6" : habit.color === "pink" ? "#ec4899" : habit.color === "green" ? "#22c55e" : habit.color === "orange" ? "#f97316" : "#ef4444"}40`
          : undefined,
      }}
    >
      {checked && (
        <Check
          className="w-6 h-6 text-white"
          style={{
            color: habit.color === "purple" ? "#8b5cf6" : habit.color === "blue" ? "#3b82f6" : habit.color === "pink" ? "#ec4899" : habit.color === "green" ? "#22c55e" : habit.color === "orange" ? "#f97316" : "#ef4444",
          }}
        />
      )}
    </button>
  );
}
