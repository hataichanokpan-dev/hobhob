"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Flame, Trophy, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { formatDateString } from "@/lib/utils/date";
import { useUserStore } from "@/store/use-user-store";
import { useStatsData } from "@/hooks/use-stats-data";
import { useTranslation } from "@/hooks/use-translation";
import { CalendarHeatmap } from "@/components/features/stats/calendar-heatmap";
import { StatsChart } from "@/components/features/stats/stats-chart";
import {
  calculateCurrentStreak,
  calculateBestStreak,
} from "@/lib/utils/streak";

export default function StatsPage() {
  const { user, userProfile, habits } = useUserStore();
  const { stats, checkins, isLoading } = useStatsData(user?.uid);
  const { t, tp } = useTranslation();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timezone = userProfile?.timezone || "UTC";

  // Select first habit by default
  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  // Get stats for selected habit
  const selectedHabitStats = selectedHabitId ? stats[selectedHabitId] : null;
  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  // Calculate stats directly from checkins data
  const calculatedStats = useMemo(() => {
    if (!selectedHabitId || Object.keys(checkins).length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    return {
      currentStreak: calculateCurrentStreak(checkins, selectedHabitId, timezone),
      bestStreak: calculateBestStreak(checkins, selectedHabitId, timezone),
    };
  }, [selectedHabitId, checkins, timezone]);

  // Use calculated stats if cache stats don't exist
  const displayStats = selectedHabitStats || calculatedStats;

  // Calculate completion rates for last 7 and 30 days
  const completionRates = useMemo(() => {
    if (!selectedHabitId || Object.keys(checkins).length === 0) {
      return { rate7d: 0, rate30d: 0, completed7d: 0, total7d: 0, completed30d: 0, total30d: 0 };
    }

    const todayDate = new Date();
    const last7Days: string[] = [];
    const last30Days: string[] = [];

    // Generate last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - i);
      last7Days.push(formatDateString(date, timezone));
    }

    // Generate last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - i);
      last30Days.push(formatDateString(date, timezone));
    }

    // Calculate completion for last 7 days
    let completed7d = 0;
    let total7d = 6;
    for (const dateStr of last7Days) {
      if (dateStr in checkins && selectedHabitId in checkins[dateStr]) {
        const value = checkins[dateStr][selectedHabitId];
        const checked = typeof value === "object" && value !== null ? value.checked : value;
        if (checked) {
          total7d++;
          completed7d++;
        } else if (checked === false) {
          total7d++;
        }
      }
    }

    // Calculate completion for last 30 days
    let completed30d = 0;
    let total30d = 29;
    for (const dateStr of last30Days) {
      if (dateStr in checkins && selectedHabitId in checkins[dateStr]) {
        const value = checkins[dateStr][selectedHabitId];
        const checked = typeof value === "object" && value !== null ? value.checked : value;
        if (checked) {
          total30d++;
          completed30d++;
        } else if (checked === false) {
          total30d++;
        }
      }
    }

    return {
      rate7d: total7d > 0 ? Math.round((completed7d / total7d) * 100) : 0,
      rate30d: total30d > 0 ? Math.round((completed30d / total30d) * 100) : 0,
      completed7d,
      total7d,
      completed30d,
      total30d,
    };
  }, [selectedHabitId, checkins, timezone]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand)] animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t("stats.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Header with Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface p-5"
        >
          <div className="mb-4">
            <h1 className="text-xl font-semibold mb-1">{t("stats.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("stats.description")}</p>
          </div>

          {/* Habit Dropdown Selector */}
          {habits.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{selectedHabit?.icon}</span>
                  <span className="font-medium">{selectedHabit?.name}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 w-full mt-2 surface shadow-xl overflow-hidden"
                  >
                    {habits.map((habit) => (
                      <button
                        key={habit.id}
                        onClick={() => {
                          setSelectedHabitId(habit.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedHabitId === habit.id
                            ? "bg-[var(--color-brand)] text-white"
                            : "hover:bg-[var(--color-muted)]"
                        }`}
                      >
                        <span className="text-lg">{habit.icon}</span>
                        <span className="font-medium">{habit.name}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Stats for Selected Habit */}
        {selectedHabitId ? (
          <>
            {/* Streak Display - Updated */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="surface p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center bg-[#ff6a00]/10">
                  <Flame className="w-5 h-5 text-[#ff6a00]" />
                </div>
                <p className="text-3xl font-bold mb-1">{displayStats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">{t("stats.currentStreak")}</p>
              </div>
              <div className="surface p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center bg-[#FFD700]/10">
                  <Trophy className="w-5 h-5 text-[#FFD700]" />
                </div>
                <p className="text-3xl font-bold mb-1">{displayStats.bestStreak}</p>
                <p className="text-xs text-muted-foreground">{t("stats.bestStreak")}</p>
              </div>
            </motion.div>

            {/* Completion Rates - Updated */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="surface p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{t("stats.last7Days")}</span>
                  <TrendingUp className="w-4 h-4 text-[var(--color-brand)]" />
                </div>
                <p className="text-2xl font-bold mb-1">{completionRates.rate7d}%</p>
                <p className="text-xs text-muted-foreground">
                  {tp("stats.ofDays", { total: completionRates.total7d })}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-brand)] transition-all duration-500"
                    style={{ width: `${completionRates.rate7d}%` }}
                  />
                </div>
              </div>
              <div className="surface p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{t("stats.last30Days")}</span>
                  <Calendar className="w-4 h-4 text-[var(--color-brand)]" />
                </div>
                <p className="text-2xl font-bold mb-1">{completionRates.rate30d}%</p>
                <p className="text-xs text-muted-foreground">
                  {tp("stats.ofDays", { total: completionRates.total30d })}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-brand)] transition-all duration-500"
                    style={{ width: `${completionRates.rate30d}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Stats Chart */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatsChart
                checkins={checkins}
                habitId={selectedHabitId}
                timezone={timezone}
              />
            </motion.div>

            {/* Calendar Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <CalendarHeatmap
                checkins={checkins}
                habitId={selectedHabitId}
                timezone={timezone}
              />
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="surface p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-[var(--color-muted)]">
              <BarChart3 className="w-8 h-8 text-[var(--color-muted-foreground)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("stats.emptyState.title")}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {t("stats.emptyState.description")}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
