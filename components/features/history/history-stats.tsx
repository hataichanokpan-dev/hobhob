"use client";

import { TrendingUp, Flame, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface HistoryStatsProps {
  stats: {
    completionRate: number;
    bestStreak: number;
    currentStreak: number;
    totalCheckins: number;
    completedCheckins: number;
  };
}

export function HistoryStats({ stats }: HistoryStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Completion Rate */}
      <div className="surface p-4 text-center">
        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[var(--color-brand)]" />
        <div className="text-2xl font-semibold gradient-text">
          {stats.completionRate}%
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t("history.stats.completion")}
        </p>
      </div>

      {/* Current Streak */}
      <div className="surface p-4 text-center">
        <Flame className="w-6 h-6 mx-auto mb-2 text-[#ff6a00]" />
        <div className="text-2xl font-semibold">
          {stats.currentStreak}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t("history.stats.currentStreak")}
        </p>
      </div>

      {/* Total Check-ins */}
      <div className="surface p-4 text-center">
        <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-[#33CC33]" />
        <div className="text-2xl font-semibold">
          {stats.completedCheckins}/{stats.totalCheckins}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t("history.stats.total")}
        </p>
      </div>
    </div>
  );
}
