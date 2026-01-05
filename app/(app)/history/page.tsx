"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Calendar, Filter, TrendingUp, Flame, CheckCircle2 } from "lucide-react";
import { listenToHabits, listenToAllCheckins } from "@/lib/db";
import { habitsToArray } from "@/lib/db/habits";
import { getTodayDateString } from "@/lib/utils/date";
import { useUserStore } from "@/store/use-user-store";
import { useTranslation } from "@/hooks/use-translation";
import { HistoryFilters } from "@/components/features/history/history-filters";
import { HistoryStats } from "@/components/features/history/history-stats";
import { HistoryHeatmap } from "@/components/features/history/history-heatmap";
import { HistoryCheckinList } from "@/components/features/history/history-checkin-list";
import type { Habit, Checkins, DayCheckins } from "@/types";

type DateRangePreset = "week" | "month" | "3months" | "year" | "all";

export default function HistoryPage() {
  const { user, userProfile } = useUserStore();
  const { t } = useTranslation();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [allCheckins, setAllCheckins] = useState<Checkins>({});
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");

  const timezone = userProfile?.timezone || "UTC";

  // Load habits
  useEffect(() => {
    if (!user) return;

    const unsubscribeHabits = listenToHabits(user.uid, (habitsObj) => {
      setHabits(habitsToArray(habitsObj));
      setIsLoading(false);
    });

    return () => unsubscribeHabits();
  }, [user]);

  // Load all checkins
  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToAllCheckins(user.uid, (checkinsData) => {
      setAllCheckins(checkinsData || {});
    });

    return () => unsubscribe();
  }, [user]);

  // Calculate date range based on preset
  useEffect(() => {
    const today = getTodayDateString(timezone);
    const todayDate = new Date(today);

    let start = new Date(todayDate);
    let end = new Date(todayDate);

    switch (dateRangePreset) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "3months":
        start.setMonth(end.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      case "all":
        start = new Date(2020, 0, 1); // Arbitrary early date
        break;
    }

    setStartDate(formatDateForInput(start));
    setEndDate(formatDateForInput(end));
  }, [dateRangePreset, timezone]);

  // Filter checkins by date range and habit
  const filteredData = useMemo(() => {
    const filteredDates: string[] = [];
    const filteredCheckins: Checkins = {};

    for (const date in allCheckins) {
      const dateObj = new Date(date);
      const startObj = new Date(startDate);
      const endObj = new Date(endDate);

      if (dateObj >= startObj && dateObj <= endObj) {
        const dayCheckins = allCheckins[date];

        // Filter by habit if selected
        if (selectedHabitId === "all") {
          filteredDates.push(date);
          filteredCheckins[date] = dayCheckins;
        } else if (dayCheckins[selectedHabitId]) {
          filteredDates.push(date);
          filteredCheckins[date] = {
            [selectedHabitId]: dayCheckins[selectedHabitId],
          };
        }
      }
    }

    return { dates: filteredDates.sort(), checkins: filteredCheckins };
  }, [allCheckins, startDate, endDate, selectedHabitId]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalCheckins = 0;
    let completedCheckins = 0;
    let bestStreak = 0;
    let currentStreak = 0;

    const sortedDates = filteredData.dates;
    const today = getTodayDateString(timezone);

    // Calculate totals
    for (const date of sortedDates) {
      const dayCheckins = filteredData.checkins[date];

      for (const habitId in dayCheckins) {
        const value = dayCheckins[habitId];
        let checked = false;

        if (typeof value === "object" && value !== null) {
          checked = value.checked;
        } else {
          checked = value === true;
        }

        totalCheckins++;
        if (checked) completedCheckins++;
      }
    }

    // Calculate streaks
    let streak = 0;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const date = sortedDates[i];
      const dayCheckins = filteredData.checkins[date];

      let allComplete = true;
      for (const habitId in dayCheckins) {
        const value = dayCheckins[habitId];
        let checked = false;

        if (typeof value === "object" && value !== null) {
          checked = value.checked;
        } else {
          checked = value === true;
        }

        if (!checked) {
          allComplete = false;
          break;
        }
      }

      if (allComplete && Object.keys(dayCheckins).length > 0) {
        streak++;
        if (date <= today) {
          currentStreak = streak;
        }
      } else {
        bestStreak = Math.max(bestStreak, streak);
        streak = 0;
      }
    }
    bestStreak = Math.max(bestStreak, streak);

    const completionRate = totalCheckins > 0
      ? Math.round((completedCheckins / totalCheckins) * 100)
      : 0;

    return {
      completionRate,
      bestStreak,
      currentStreak,
      totalCheckins,
      completedCheckins,
    };
  }, [filteredData, timezone]);

  const handleExport = () => {
    // Simple CSV export
    let csv = "Date,Habit,Status,Note\n";

    for (const date of filteredData.dates) {
      const dayCheckins = filteredData.checkins[date];
      const habit = selectedHabitId === "all"
        ? null
        : habits.find((h) => h.id === selectedHabitId);

      for (const habitId in dayCheckins) {
        const value = dayCheckins[habitId];
        let checked = false;
        let note = "";

        if (typeof value === "object" && value !== null) {
          checked = value.checked;
          note = value.note || "";
        } else {
          checked = value === true;
        }

        const habitName = habit?.name || habits.find((h) => h.id === habitId)?.name || habitId;
        csv += `${date},"${habitName}",${checked ? "✓" : "✗"},"${note}"\n`;
      }
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hobhob-history-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl"
          >
            📊
          </motion.div>
          <motion.p
            className="text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {t("common.loading")}
          </motion.p>
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--color-brand)]"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="surface p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--color-brand)]" />
            <h1 className="text-2xl font-semibold">{t("history.title")}</h1>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            {t("history.export")}
          </button>
        </div>

        {/* Filters */}
        <HistoryFilters
          dateRangePreset={dateRangePreset}
          onDateRangePresetChange={setDateRangePreset}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          habits={habits}
          selectedHabitId={selectedHabitId}
          onHabitChange={setSelectedHabitId}
        />
      </div>

      {/* Stats Cards */}
      <HistoryStats stats={stats} />

      {/* Calendar Heatmap */}
      <div className="surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[var(--color-brand)]" />
          <h2 className="text-lg font-semibold">{t("history.heatmap.title")}</h2>
        </div>
        <HistoryHeatmap
          dates={filteredData.dates}
          checkins={filteredData.checkins}
          habits={selectedHabitId === "all" ? habits : habits.filter((h) => h.id === selectedHabitId)}
        />
      </div>

      {/* Check-in List */}
      <div className="surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-[var(--color-brand)]" />
          <h2 className="text-lg font-semibold">{t("history.checkins.title")}</h2>
        </div>
        <HistoryCheckinList
          dates={filteredData.dates}
          checkins={filteredData.checkins}
          habits={habits}
        />
      </div>
    </div>
  );
}

// Helper function to format date for input
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
