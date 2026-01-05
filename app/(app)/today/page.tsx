"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Calendar, Flame, Target } from "lucide-react";
import { listenToHabits } from "@/lib/db";
import { habitsToArray } from "@/lib/db/habits";
import { useTranslation } from "@/hooks/use-translation";
import {
  listenToDateCheckins,
  getHabitCheckinStatus,
  calculateCompletionRate,
  toggleHabitCheckin,
  getHabitCheckin,
} from "@/lib/db/checkins";
import { getTodayDateString, formatReadableDate } from "@/lib/utils/date";
import { filterHabitsForToday } from "@/lib/utils/habits";
import { useUserStore } from "@/store/use-user-store";
import { HabitCard } from "@/components/features/habits/habit-card";
import { HabitForm } from "@/components/features/habits/habit-form";
import type { DayCheckins } from "@/types";

export default function TodayPage() {
  const { user, userProfile, habits, setHabits, setLoading } = useUserStore();
  const { t, tp } = useTranslation();
  const [checkins, setCheckins] = useState<DayCheckins | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showHabitForm, setShowHabitForm] = useState(false);

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

    const unsubscribe = listenToDateCheckins(
      user.uid,
      today,
      (checkinsData) => {
        setCheckins(checkinsData);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, today]);

  // Handle check-in toggle with optimistic UI
  const handleToggle = useCallback(
    async (habitId: string, note?: string) => {
      if (!user) return;

      const currentValue = getHabitCheckin(checkins, habitId);

      // Optimistic update
      setCheckins((prev) => ({
        ...prev,
        [habitId]: !currentValue.checked,
      }));

      setIsUpdating(habitId);

      try {
        await toggleHabitCheckin(
          user.uid,
          today,
          habitId,
          currentValue.checked,
          note
        );
      } catch (error) {
        // Rollback on error
        console.error("Failed to toggle check-in:", error);
        setCheckins((prev) => ({
          ...prev,
          [habitId]: currentValue.checked,
        }));
      } finally {
        setIsUpdating(null);
      }
    },
    [user, today, checkins]
  );

  const handleHabitFormSuccess = () => {
    setShowHabitForm(false);
  };

  const handleHabitFormCancel = () => {
    setShowHabitForm(false);
  };

  // Filter active habits for today based on frequency settings
  const activeHabits = habits.filter((h) => h.isActive);
  const todaysHabits = filterHabitsForToday(activeHabits, timezone);
  const completedCount = todaysHabits.filter(
    (h) => getHabitCheckinStatus(checkins, h.id) === true
  ).length;
  const completionRate = calculateCompletionRate(checkins, todaysHabits.length);

  // Show habit form if active
  if (showHabitForm) {
    return (
      <div className="p-4">
        <HabitForm
          onSuccess={handleHabitFormSuccess}
          onCancel={handleHabitFormCancel}
        />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Welcome Section - Professional & Minimal */}
        <div className="surface p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-[var(--color-brand)]" />
                <h1 className="text-2xl font-semibold">{t("today.title")}</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                {formatReadableDate(new Date(), timezone)}
              </p>
            </div>

            {/* Completion Stats - Clean Design */}
            {todaysHabits.length > 0 && (
              <div className="text-right">
                <div className="text-3xl font-semibold gradient-text">
                  {completionRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tp("today.completedCount", {
                    completed: completedCount,
                    total: todaysHabits.length,
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar - Bear.app style */}
          {todaysHabits.length > 0 && (
            <div className="mt-6">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick Stats Row - Professional */}
          {todaysHabits.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-[var(--color-muted)]">
                <Target className="w-4 h-4 mx-auto mb-1 text-[var(--color-brand)]" />
                <p className="text-2xl font-semibold">{todaysHabits.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t("today.stats.today")}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--color-muted)]">
                <Flame className="w-4 h-4 mx-auto mb-1 text-[#ff6a00]" />
                <p className="text-2xl font-semibold">{completedCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t("today.stats.done")}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--color-muted)]">
                <Target className="w-4 h-4 mx-auto mb-1 text-[#33CC33]" />
                <p className="text-2xl font-semibold">
                  {todaysHabits.length - completedCount}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t("today.stats.left")}
                </p>
              </div>
            </div>
          )}

          {/* Message when no habits scheduled for today */}
          {activeHabits.length > 0 && todaysHabits.length === 0 && (
            <div className="mt-6 text-center p-4 rounded-lg bg-[var(--color-muted)]">
              <p className="text-sm text-muted-foreground">
                {t("today.noHabitsScheduled")}
              </p>
            </div>
          )}
        </div>

        {/* Habits List - Professional Card Style */}
        {activeHabits.length === 0 ? (
          <div className="empty-state surface p-8">
            <div className="empty-state-icon mx-auto">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("today.emptyState.title")}
            </h3>
            <p className="empty-state-text mb-6 max-w-sm mx-auto">
              {t("today.emptyState.description")}
            </p>
            <button
              onClick={() => setShowHabitForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("today.emptyState.button")}
            </button>
          </div>
        ) : todaysHabits.length > 0 ? (
          <div className="space-y-3">
            {todaysHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checked={getHabitCheckinStatus(checkins, habit.id) === true}
                streak={0} // TODO: Load from stats
                onToggle={handleToggle}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Floating Action Button - Fixed Position 
      {todaysHabits.length > 0 && (
        <button
          onClick={() => setShowHabitForm(true)}
          className="fixed bottom-28 right-4 w-14 h-14 rounded-full bg-[var(--color-brand)] text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30"
          style={{ boxShadow: "0 10px 22px rgba(255, 106, 0, 0.35)" }}
          aria-label="Add new habit"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}*/}
    </>
  );
}
