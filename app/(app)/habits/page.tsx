"use client";

import { useEffect } from "react";
import { listenToHabits } from "@/lib/db";
import { habitsToArray } from "@/lib/db/habits";
import { useUserStore } from "@/store/use-user-store";
import { HabitList } from "@/components/features/habits/habit-list";

export default function HabitsPage() {
  const { user, habits, setHabits, setLoading } = useUserStore();

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const unsubscribe = listenToHabits(user.uid, (habitsObj) => {
      setHabits(habitsToArray(habitsObj));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, setHabits, setLoading]);

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="text-muted-foreground">Manage your habits</p>
        </div>

        {/* Habit List */}
        <HabitList />
      </div>
    </div>
  );
}
