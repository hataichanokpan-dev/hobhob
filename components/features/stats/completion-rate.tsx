"use client";

import { Target } from "lucide-react";

interface CompletionRateProps {
  rate: number;
  period: "7d" | "30d";
}

export function CompletionRate({ rate, period }: CompletionRateProps) {
  const periodText = period === "7d" ? "7 days" : "30 days";
  const percentage = Math.min(100, Math.max(0, rate));

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Completion Rate</span>
        </div>
        <span className="text-xs text-muted-foreground">{periodText}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="text-right">
        <span className="text-2xl font-bold gradient-text">{percentage}%</span>
      </div>
    </div>
  );
}
