"use client";

import { useMemo } from "react";
import type { ReactElement } from "react";
import { useTranslation } from "@/hooks/use-translation";
import type { Habit, Checkins } from "@/types";

interface HistoryHeatmapProps {
  dates: string[];
  checkins: Checkins;
  habits: Habit[];
}

export function HistoryHeatmap({ dates, checkins, habits }: HistoryHeatmapProps) {
  const { t } = useTranslation();

  // Group dates by month for display
  const { monthGroups, maxCount } = useMemo(() => {
    const groups: Record<string, string[]> = {};
    let max = 0;

    // Sort dates and group by month
    for (const date of dates) {
      const monthKey = date.substring(0, 7); // yyyy-MM
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(date);

      // Calculate completion count for this day
      const dayCheckins = checkins[date];
      let completedCount = 0;

      if (dayCheckins) {
        for (const habitId in dayCheckins) {
          const value = dayCheckins[habitId];
          let checked = false;

          if (typeof value === "object" && value !== null) {
            checked = value.checked;
          } else {
            checked = value === true;
          }

          if (checked) completedCount++;
        }
      }

      max = Math.max(max, completedCount);
    }

    // Sort months
    const sortedGroups: Record<string, string[]> = {};
    Object.keys(groups).sort().reverse().forEach((key) => {
      sortedGroups[key] = groups[key];
    });

    return { monthGroups: sortedGroups, maxCount: max };
  }, [dates, checkins]);

  // Get color intensity based on completion
  const getIntensity = (date: string): number => {
    const dayCheckins = checkins[date];
    if (!dayCheckins) return 0;

    let completedCount = 0;
    let totalCount = habits.length;

    for (const habitId in dayCheckins) {
      const value = dayCheckins[habitId];
      let checked = false;

      if (typeof value === "object" && value !== null) {
        checked = value.checked;
      } else {
        checked = value === true;
      }

      if (checked) completedCount++;
    }

    if (totalCount === 0) return 0;
    return completedCount / totalCount;
  };

  const getColor = (intensity: number): string => {
    if (intensity === 0) return "bg-[var(--color-muted)]";
    if (intensity < 0.25) return "bg-[#FF6600]/20";
    if (intensity < 0.5) return "bg-[#FF6600]/40";
    if (intensity < 0.75) return "bg-[#FF6600]/60";
    return "bg-[#FF6600]";
  };

  const getMonthName = (monthKey: string): string => {
    const date = new Date(monthKey + "-01");
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (dates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t("history.heatmap.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{t("history.heatmap.legend.less")}</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-[var(--color-muted)]" />
          <div className="w-4 h-4 rounded bg-[#FF6600]/20" />
          <div className="w-4 h-4 rounded bg-[#FF6600]/40" />
          <div className="w-4 h-4 rounded bg-[#FF6600]/60" />
          <div className="w-4 h-4 rounded bg-[#FF6600]" />
        </div>
        <span>{t("history.heatmap.legend.more")}</span>
      </div>

      {/* Heatmap by month */}
      <div className="space-y-4">
        {Object.entries(monthGroups).map(([monthKey, monthDates]) => (
          <div key={monthKey} className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              {getMonthName(monthKey)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {(() => {
                const cells: ReactElement[] = [];
                const firstDate = new Date(monthDates[0]);
                const firstDayOfWeek = (firstDate.getDay() + 6) % 7; // Monday = 0

                // Empty cells before first day
                for (let i = 0; i < firstDayOfWeek; i++) {
                  cells.push(<div key={`empty-${i}`} className="aspect-square" />);
                }

                // Date cells
                for (const date of monthDates) {
                  const intensity = getIntensity(date);
                  const dateObj = new Date(date);
                  const dayOfMonth = dateObj.getDate();

                  cells.push(
                    <div
                      key={date}
                      className={`aspect-square rounded ${getColor(intensity)} flex items-center justify-center text-[10px] font-medium transition-all hover:scale-110 cursor-pointer`}
                      title={`${date}: ${Math.round(intensity * 100)}%`}
                    >
                      {dayOfMonth}
                    </div>
                  );
                }

                return cells;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
