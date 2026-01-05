"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Habit } from "@/types";

type DateRangePreset = "week" | "month" | "3months" | "year" | "all";

interface HistoryFiltersProps {
  dateRangePreset: DateRangePreset;
  onDateRangePresetChange: (preset: DateRangePreset) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  habits: Habit[];
  selectedHabitId: string;
  onHabitChange: (habitId: string) => void;
}

export function HistoryFilters({
  dateRangePreset,
  onDateRangePresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  habits,
  selectedHabitId,
  onHabitChange,
}: HistoryFiltersProps) {
  const { t } = useTranslation();

  const presets: { value: DateRangePreset; label: string }[] = [
    { value: "week", label: t("history.filters.preset.week") },
    { value: "month", label: t("history.filters.preset.month") },
    { value: "3months", label: t("history.filters.preset.3months") },
    { value: "year", label: t("history.filters.preset.year") },
    { value: "all", label: t("history.filters.preset.all") },
  ];

  return (
    <div className="space-y-4">
      {/* Date Range Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          {t("history.filters.dateRange")}
        </label>
        <div className="grid grid-cols-5 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onDateRangePresetChange(preset.value)}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                dateRangePreset === preset.value
                  ? "bg-[var(--color-brand)] text-white"
                  : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      {dateRangePreset === "all" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t("history.filters.startDate")}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full input text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t("history.filters.endDate")}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full input text-sm"
            />
          </div>
        </div>
      )}

      {/* Habit Selector */}
      {habits.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("history.filters.habit")}
          </label>
          <select
            value={selectedHabitId}
            onChange={(e) => onHabitChange(e.target.value)}
            className="w-full input"
          >
            <option value="all">{t("history.filters.allHabits")}</option>
            {habits.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.icon} {habit.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
