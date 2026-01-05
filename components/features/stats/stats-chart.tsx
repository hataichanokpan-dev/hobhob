"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatDateString } from "@/lib/utils/date";
import type { Checkins } from "@/types";

interface StatsChartProps {
  checkins: Checkins;
  habitId: string;
  timezone: string;
}

type ChartPeriod = "weekly" | "monthly";

export function StatsChart({ checkins, habitId, timezone }: StatsChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>("weekly");

  // Generate weekly data for the last 12 weeks
  const weeklyData = useMemo(() => {
    const weeks: Array<{ week: string; completed: number; total: number; rate: number }> = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      let completed = 0;
      let total = 7;

      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDateString(d, timezone);

        if (dateStr in checkins && habitId in checkins[dateStr]) {
          const value = checkins[dateStr][habitId];
          const checked = typeof value === "object" && value !== null ? value.checked : value;
          if (checked) completed++;
        }
      }

      const weekLabel = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      weeks.push({
        week: weekLabel,
        completed,
        total,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    return weeks;
  }, [checkins, habitId, timezone]);

  // Generate monthly data for the last 12 months
  const monthlyData = useMemo(() => {
    const months: Array<{ month: string; completed: number; total: number; rate: number }> = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();

      // Get days in this month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let completed = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDateString(date, timezone);

        if (dateStr in checkins && habitId in checkins[dateStr]) {
          const value = checkins[dateStr][habitId];
          const checked = typeof value === "object" && value !== null ? value.checked : value;
          if (checked) completed++;
        }
      }

      const monthLabel = monthDate.toLocaleDateString("en-US", {
        month: "short",
      });

      months.push({
        month: monthLabel,
        completed,
        total: daysInMonth,
        rate: daysInMonth > 0 ? Math.round((completed / daysInMonth) * 100) : 0,
      });
    }

    return months;
  }, [checkins, habitId]);

  const data = period === "weekly" ? weeklyData : monthlyData;
  const dataKey = period === "weekly" ? "week" : "month";
  const completedKey = period === "weekly" ? "completed" : "completed";

  // Calculate overall stats
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  const totalDays = data.reduce((sum, d) => sum + d.total, 0);
  const overallRate = totalDays > 0 ? Math.round((totalCompleted / totalDays) * 100) : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const periodLabel = period === "weekly" ? "Week of" : "";

    return (
      <div className="surface p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">
          {periodLabel} {data[dataKey]}
        </p>
        <p className="text-sm font-semibold">
          {data.completed} of {data.total} days completed
        </p>
        <p className="text-xs text-[var(--color-brand)]">
          {data.rate}% completion rate
        </p>
      </div>
    );
  };

  return (
    <div className="surface p-5">
      {/* Header with period toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold mb-1">Completion Rate</h3>
          <p className="text-xs text-muted-foreground">
            {totalCompleted} of {totalDays} days completed ({overallRate}%)
          </p>
        </div>

        {/* Period Toggle */}
        <div className="flex gap-1 bg-[var(--color-muted)] rounded-lg p-1">
          <button
            onClick={() => setPeriod("weekly")}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${period === "weekly"
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              }
            `}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${period === "monthly"
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              }
            `}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey={dataKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "opacity-80" }} />
            <Bar
              dataKey="rate"
              radius={[4, 4, 0, 0]}
              fill="var(--color-brand)"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.rate >= 70 ? "#33CC33" : entry.rate >= 40 ? "#ff9933" : "#ff3333"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#33CC33]" />
          <span className="text-muted-foreground">≥70%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#ff9933]" />
          <span className="text-muted-foreground">40-69%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#ff3333]" />
          <span className="text-muted-foreground">&lt;40%</span>
        </div>
      </div>
    </div>
  );
}
