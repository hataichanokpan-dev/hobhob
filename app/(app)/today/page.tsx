"use client";

import { useEffect, useState, useCallback } from "react";
import { listenToHabits } from "@/lib/db";
import { habitsToArray } from "@/lib/db/habits";
import { listenToDateCheckins, getHabitCheckin, calculateCompletionRate, toggleHabitCheckin } from "@/lib/db/checkins";
import { getTodayDateString, formatReadableDate } from "@/lib/utils/date";
import { useUserStore } from "@/store/use-user-store";
import { HabitCard } from "@/components/features/habits/habit-card";
import type { DayCheckins } from "@/types";

export default function TodayPage() {
  const { user, userProfile, habits, setHabits, setLoading } = useUserStore();
  const [checkins, setCheckins] = useState<DayCheckins | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Get user's timezone or default to UTC
  const timezone = userProfile?.timezone || "UTC";
  const today = getTodayDateString(timezone);

  // Load habits
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const unsubscribeHabits = listenToHabits(user.uid, (habitsObj) => {
      setHabits(habitsToArray(habitsObj));
      setLoading(false);
    });

    return () => unsubscribeHabits();
  }, [user, setHabits, setLoading]);

  // Load today's checkins
  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToDateCheckins(user.uid, today, (checkinsData) => {
      setCheckins(checkinsData);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, today]);

  // Handle check-in toggle with optimistic UI
  const handleToggle = useCallback(
    async (habitId: string) => {
      if (!user) return;

      const currentValue = getHabitCheckin(checkins, habitId);

      // Optimistic update
      setCheckins((prev) => ({
        ...prev,
        [habitId]: !currentValue,
      }));

      setIsUpdating(habitId);

      try {
        await toggleHabitCheckin(user.uid, today, habitId, currentValue);
      } catch (error) {
        // Rollback on error
        console.error("Failed to toggle check-in:", error);
        setCheckins((prev) => ({
          ...prev,
          [habitId]: currentValue,
        }));
      } finally {
        setIsUpdating(null);
      }
    },
    [user, today, checkins]
  );

  // Filter active habits for today
  const activeHabits = habits.filter((h) => h.isActive);
  const completionRate = calculateCompletionRate(checkins, activeHabits.length);

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Today</h1>
            <p className="text-sm text-muted-foreground">
              {formatReadableDate(new Date(), timezone)}
            </p>
          </div>
          {activeHabits.length > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold gradient-text">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {activeHabits.length > 0 && (
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        )}

        {/* Habits List */}
        {activeHabits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="text-3xl">📋</span>
            </div>
            <p className="empty-state-text">
              No habits yet. Go to Habits to create your first one!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checked={getHabitCheckin(checkins, habit.id) === true}
                streak={0} // TODO: Load from stats
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
