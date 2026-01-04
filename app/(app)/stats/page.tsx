"use client";

import { useEffect, useState } from "react";
import { listenToAllStats, getHabitStats } from "@/lib/db/stats";
import {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateCompletionRate,
} from "@/lib/utils/streak";
import { getTodayDateString } from "@/lib/utils/date";
import { useUserStore } from "@/store/use-user-store";
import { StreakDisplay } from "@/components/features/stats/streak-display";
import { CompletionRate } from "@/components/features/stats/completion-rate";
import { CalendarHeatmap } from "@/components/features/stats/calendar-heatmap";

export default function StatsPage() {
  const { user, userProfile, habits, setLoading } = useUserStore();
  const [stats, setStats] = useState<Record<string, {
    currentStreak: number;
    bestStreak: number;
    totalCheckins: number;
  }>>({});
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const timezone = userProfile?.timezone || "UTC";
  const today = getTodayDateString(timezone);

  // Load stats
  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToAllStats(user.uid, (statsData) => {
      if (statsData) {
        setStats(statsData);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Select first habit by default
  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  // Get stats for selected habit
  const selectedHabitStats = selectedHabitId ? stats[selectedHabitId] : null;

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">Track your progress</p>
        </div>

        {/* Habit Selector */}
        {habits.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => setSelectedHabitId(habit.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedHabitId === habit.id
                    ? "glass-strong text-white"
                    : "glass hover:glass-strong"
                }`}
              >
                <span className="mr-2">{habit.icon}</span>
                {habit.name}
              </button>
            ))}
          </div>
        )}

        {/* Stats for Selected Habit */}
        {selectedHabitStats ? (
          <div className="space-y-4">
            {/* Streak Display */}
            <StreakDisplay
              currentStreak={selectedHabitStats.currentStreak}
              bestStreak={selectedHabitStats.bestStreak}
            />

            {/* Completion Rates */}
            <div className="grid grid-cols-2 gap-3">
              <CompletionRate
                rate={selectedHabitStats.totalCheckins > 0 ? Math.round((selectedHabitStats.totalCheckins / 30) * 100) : 0}
                period="7d"
              />
              <CompletionRate
                rate={selectedHabitStats.totalCheckins > 0 ? Math.round((selectedHabitStats.totalCheckins / 30) * 100) : 0}
                period="30d"
              />
            </div>

            {/* Note about completion calculation */}
            <p className="text-xs text-center text-muted-foreground">
              * Completion rates are calculated from total check-ins
            </p>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="text-3xl">📊</span>
            </div>
            <p className="empty-state-text">
              No stats yet. Complete some check-ins to see your progress!
            </p>
          </div>
        )}

        {/* Calendar Heatmap - Placeholder for now, needs full checkins history */}
        {selectedHabitId && (
          <CalendarHeatmap
            checkins={{}}
            habitId={selectedHabitId}
            days={30}
            timezone={timezone}
          />
        )}
      </div>
    </div>
  );
}
