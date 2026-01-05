"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Flame } from "lucide-react";
import { listenToHabits } from "@/lib/db";
import { habitsToArray } from "@/lib/db/habits";
import { deleteHabit, updateHabit } from "@/lib/db";
import { useUserStore } from "@/store/use-user-store";
import { useTranslation } from "@/hooks/use-translation";
import { HabitForm } from "@/components/features/habits/habit-form";
import { HabitListCard } from "@/components/features/habits/habit-list-card";
import {
  HabitFilter,
  type HabitFilterType,
} from "@/components/features/habits/habit-filter";
import type { Habit } from "@/types";

export default function HabitsPage() {
  const { user, habits, setHabits, setLoading } = useUserStore();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(
    undefined
  );
  const [filter, setFilter] = useState<HabitFilterType>("all");

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const unsubscribe = listenToHabits(user.uid, (habitsObj) => {
      setHabits(habitsToArray(habitsObj));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, setHabits, setLoading]);

  // Filter habits based on selected filter
  const filteredHabits = habits.filter((habit) => {
    if (filter === "all") return true;
    return habit.frequency === filter;
  });

  // Calculate counts for each filter
  const filterCounts = {
    all: habits.length,
    daily: habits.filter((h) => h.frequency === "daily").length,
    weekly: habits.filter((h) => h.frequency === "weekly").length,
    monthly: habits.filter((h) => h.frequency === "monthly").length,
  };

  // Separate filtered habits by active status
  const activeHabits = filteredHabits.filter((h) => h.isActive);
  const inactiveHabits = filteredHabits.filter((h) => !h.isActive);

  // Group habits by frequency for display
  const dailyHabits = activeHabits.filter((h) => h.frequency === "daily");
  const weeklyHabits = activeHabits.filter((h) => h.frequency === "weekly");
  const monthlyHabits = activeHabits.filter((h) => h.frequency === "monthly");

  const handleEdit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  }, []);

  const handleToggleActive = useCallback(
    async (habitId: string, isActive: boolean) => {
      if (!user) return;
      try {
        await updateHabit(user.uid, habitId, { isActive });
      } catch (error) {
        console.error("Failed to toggle habit:", error);
      }
    },
    [user]
  );

  const handleDelete = useCallback(
    async (habitId: string) => {
      if (!user) return;
      try {
        await deleteHabit(user.uid, habitId);
      } catch (error) {
        console.error("Failed to delete habit:", error);
      }
    },
    [user]
  );

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingHabit(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingHabit(undefined);
  };

  // Show form (create or edit)
  if (showForm) {
    return (
      <div className="p-4">
        <div className="surface p-6 max-w-lg mx-auto">
          <HabitForm
            habit={editingHabit}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{t("habits.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("habits.description")}
            </p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            className="icon-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Add new habit"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Quick Stats */}
        {habits.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-[var(--color-muted)]">
              <Target className="w-4 h-4 mx-auto mb-1 text-[var(--color-brand)]" />
              <p className="text-2xl font-semibold">{habits.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {t("habits.stats.total")}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[var(--color-muted)]">
              <Flame className="w-4 h-4 mx-auto mb-1 text-[#ff6a00]" />
              <p className="text-2xl font-semibold text-[var(--color-brand)]">
                {activeHabits.length}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {t("habits.stats.active")}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[var(--color-muted)]">
              <Target className="w-4 h-4 mx-auto mb-1 text-[#33CC33]" />
              <p className="text-2xl font-semibold">{inactiveHabits.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {t("habits.stats.paused")}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Filter */}
      {habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <HabitFilter
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={filterCounts}
          />
        </motion.div>
      )}

      {/* Empty State */}
      {habits.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="empty-state surface p-8"
        >
          <div className="empty-state-icon mx-auto">
            <span className="text-4xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("habits.emptyState.title")}</h3>
          <p className="empty-state-text mb-6 max-w-sm mx-auto">
            {t("habits.emptyState.description")}
          </p>
          <motion.button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            {t("habits.emptyState.button")}
          </motion.button>
        </motion.div>
      )}

      {/* No results for filter */}
      {habits.length > 0 && filteredHabits.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="surface p-8 text-center"
        >
          <p className="text-muted-foreground">
            {t("habits.noResults")}
          </p>
        </motion.div>
      )}

      {/* Habits List */}
      <AnimatePresence mode="popLayout">
        {activeHabits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* When showing all, group by frequency */}
            {filter === "all" ? (
              <>
                {dailyHabits.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                      {t("habits.frequency.daily")} ({dailyHabits.length})
                    </h2>
                    <div className="space-y-3">
                      {dailyHabits.map((habit) => (
                        <HabitListCard
                          key={habit.id}
                          habit={habit}
                          onEdit={handleEdit}
                          onToggleActive={handleToggleActive}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {weeklyHabits.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                      {t("habits.frequency.weekly")} ({weeklyHabits.length})
                    </h2>
                    <div className="space-y-3">
                      {weeklyHabits.map((habit) => (
                        <HabitListCard
                          key={habit.id}
                          habit={habit}
                          onEdit={handleEdit}
                          onToggleActive={handleToggleActive}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {monthlyHabits.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                      {t("habits.frequency.monthly")} ({monthlyHabits.length})
                    </h2>
                    <div className="space-y-3">
                      {monthlyHabits.map((habit) => (
                        <HabitListCard
                          key={habit.id}
                          habit={habit}
                          onEdit={handleEdit}
                          onToggleActive={handleToggleActive}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Show all filtered habits without grouping
              filteredHabits
                .filter((h) => h.isActive)
                .map((habit) => (
                  <HabitListCard
                    key={habit.id}
                    habit={habit}
                    onEdit={handleEdit}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                ))
            )}
          </motion.div>
        )}

        {/* Inactive Habits */}
        {inactiveHabits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
              {t("habits.frequency.paused")} ({inactiveHabits.length})
            </h2>
            <div className="space-y-3">
              {inactiveHabits.map((habit) => (
                <HabitListCard
                  key={habit.id}
                  habit={habit}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
