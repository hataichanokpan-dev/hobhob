"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateString } from "@/lib/utils/date";
import type { Checkins } from "@/types";

interface CalendarHeatmapProps {
  checkins: Checkins;
  habitId: string;
  timezone?: string;
}

export function CalendarHeatmap({
  checkins,
  habitId,
  timezone = "UTC",
}: CalendarHeatmapProps) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(), // 0-indexed
  }));

  // Calculate days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
  }, [selectedMonth.year, selectedMonth.month]);

  // Get month name and year
  const monthName = useMemo(() => {
    return new Date(selectedMonth.year, selectedMonth.month, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [selectedMonth.year, selectedMonth.month]);

  // Check if selected month is current month
  const isCurrentMonth = useMemo(() => {
    return selectedMonth.year === today.getFullYear() && selectedMonth.month === today.getMonth();
  }, [selectedMonth.year, selectedMonth.month]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setSelectedMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  // Navigate to next month (only if not current month)
  const goToNextMonth = () => {
    if (isCurrentMonth) return;
    setSelectedMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Generate calendar cells
  const cells = useMemo(() => {
    const result: Array<{
      date: string;
      day: number;
      checked: boolean | null;
      isToday: boolean;
    }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedMonth.year, selectedMonth.month, day);
      const dateStr = formatDateString(date, timezone);
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

      // Get checked status, handling both boolean and CheckinData formats
      let checked: boolean | null = null;
      if (dateStr in checkins && habitId in checkins[dateStr]) {
        const value = checkins[dateStr][habitId];
        if (typeof value === "object" && value !== null) {
          checked = value.checked;
        } else {
          checked = value;
        }
      }

      result.push({
        date: dateStr,
        day,
        checked,
        isToday,
      });
    }

    return result;
  }, [selectedMonth.year, selectedMonth.month, daysInMonth, checkins, habitId, timezone, today]);

  // Calculate starting day of week for padding
  const firstDayOfWeek = useMemo(() => {
    return new Date(selectedMonth.year, selectedMonth.month, 1).getDay();
  }, [selectedMonth.year, selectedMonth.month]);

  // Calculate completion stats for this month
  const completionStats = useMemo(() => {
    const completed = cells.filter((c) => c.checked === true).length;
    const missed = cells.filter((c) => c.checked === false).length;
    const total = completed + missed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, missed, total, rate };
  }, [cells]);

  return (
    <div className="surface p-5">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="icon-btn"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h3 className="text-sm font-semibold">{monthName}</h3>
          <p className="text-xs text-muted-foreground">
            {completionStats.completed}/{completionStats.total} days ({completionStats.rate}%)
          </p>
        </div>

        <button
          onClick={goToNextMonth}
          className="icon-btn"
          aria-label="Next month"
          disabled={isCurrentMonth}
        >
          <ChevronRight className={`w-4 h-4 ${isCurrentMonth ? "opacity-30" : ""}`} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day labels */}
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <div key={day} className="text-center py-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{day}</span>
          </div>
        ))}

        {/* Empty cells for alignment */}
        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Calendar cells */}
        {cells.map((cell) => (
          <div
            key={cell.date}
            className={`aspect-square rounded-md flex items-center justify-center text-xs transition-all ${
              cell.checked === true
                ? "bg-[#33CC33] text-white font-semibold"
                : cell.checked === false
                ? "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                : "bg-[var(--color-muted)]/30 text-[var(--color-muted-foreground)]/40"
            } ${cell.isToday ? "ring-1 ring-[var(--color-brand)]" : ""}`}
            title={cell.date}
          >
            {cell.day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#33CC33]" />
          <span className="text-muted-foreground">Done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[var(--color-muted)]" />
          <span className="text-muted-foreground">Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[var(--color-muted)]/30" />
          <span className="text-muted-foreground">None</span>
        </div>
      </div>
    </div>
  );
}
