"use client";

import type { Checkins } from "@/types";

interface CalendarHeatmapProps {
  checkins: Checkins;
  habitId: string;
  days?: number;
  timezone?: string;
}

export function CalendarHeatmap({
  checkins,
  habitId,
  days = 30,
  timezone = "UTC",
}: CalendarHeatmapProps) {
  const today = new Date();
  const cells: Array<{
    date: string;
    day: number;
    checked: boolean | null;
    isToday: boolean;
  }> = [];

  // Generate cells from oldest to newest
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const year = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: timezone,
    }).format(date);
    const month = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      timeZone: timezone,
    }).format(date);
    const day = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      timeZone: timezone,
    }).format(date);

    const dateStr = `${year}-${month}-${day}`;
    const isToday = i === 0;

    cells.push({
      date: dateStr,
      day: parseInt(day),
      checked: dateStr in checkins && habitId in checkins[dateStr] ? checkins[dateStr][habitId] : null,
      isToday,
    });
  }

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-medium mb-3">Last {days} Days</h3>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day labels */}
        {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
          <div key={idx} className="text-center">
            <span className="text-xs text-muted-foreground">{day}</span>
          </div>
        ))}

        {/* Calendar cells */}
        {cells.map((cell, idx) => {
          const date = new Date(cell.date);
          const dayOfWeek = date.getDay();

          // Add empty cells for alignment
          if (idx === 0) {
            const offset = dayOfWeek;
            for (let i = 0; i < offset; i++) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }
          }

          return (
            <div
              key={cell.date}
              className={`aspect-square rounded-md flex items-center justify-center text-xs transition-all ${
                cell.checked === true
                  ? "bg-primary text-white font-bold"
                  : cell.checked === false
                  ? "bg-white/5 text-muted-foreground"
                  : "bg-white/[0.02] text-muted-foreground/50"
              } ${cell.isToday ? "ring-1 ring-primary/50" : ""}`}
              title={cell.date}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-white/5" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-white/[0.02]" />
          <span>None</span>
        </div>
      </div>
    </div>
  );
}
