"use client";

import { Flame, Trophy } from "lucide-react";
import type { HabitStats } from "@/types";

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
}

export function StreakDisplay({ currentStreak, bestStreak }: StreakDisplayProps) {
  return (
    <div className="glass-card p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Current</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">
            {currentStreak}
          </div>
          <p className="text-xs text-muted-foreground">days</p>
        </div>

        {/* Best Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Best</span>
          </div>
          <div className="text-2xl font-bold text-yellow-500">
            {bestStreak}
          </div>
          <p className="text-xs text-muted-foreground">days</p>
        </div>
      </div>
    </div>
  );
}
