"use client";

import { useMemo } from "react";
import { useTranslation } from "@/hooks/use-translation";
import type { Habit, Checkins } from "@/types";

interface HistoryCheckinListProps {
  dates: string[];
  checkins: Checkins;
  habits: Habit[];
}

export function HistoryCheckinList({ dates, checkins, habits }: HistoryCheckinListProps) {
  const { t } = useTranslation();

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get habit by ID
  const getHabit = (habitId: string): Habit | undefined => {
    return habits.find((h) => h.id === habitId);
  };

  // Parse checkin value
  const parseCheckin = (value: unknown): { checked: boolean; note?: string } => {
    if (typeof value === "object" && value !== null) {
      return {
        checked: (value as { checked: boolean }).checked,
        note: (value as { note?: string }).note,
      };
    }
    return { checked: value === true };
  };

  if (dates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t("history.checkins.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dates.slice().reverse().map((date) => {
        const dayCheckins = checkins[date];
        if (!dayCheckins) return null;

        return (
          <div key={date} className="p-3 rounded-lg bg-[var(--color-muted)]">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {formatDate(date)}
            </div>
            <div className="space-y-2">
              {Object.entries(dayCheckins).map(([habitId, value]) => {
                const habit = getHabit(habitId);
                if (!habit) return null;

                const { checked, note } = parseCheckin(value);

                return (
                  <div
                    key={habitId}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[var(--color-background)]"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                        checked ? "bg-[var(--color-brand)]/20" : "bg-[var(--color-muted)]"
                      }`}
                    >
                      {habit.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${checked ? "" : "text-muted-foreground"}`}>
                          {habit.name}
                        </span>
                        {checked ? (
                          <span className="text-xs text-[#33CC33]">✓</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">✗</span>
                        )}
                      </div>
                      {note && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
