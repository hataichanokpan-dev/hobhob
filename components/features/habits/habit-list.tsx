"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { deleteExistingHabit } from "@/lib/db/habits";
import { useUserStore } from "@/store/use-user-store";
import { HabitForm } from "./habit-form";
import type { Habit } from "@/types";

interface HabitListProps {
  filterActive?: boolean;
  onHabitClick?: (habit: Habit) => void;
}

export function HabitList({
  filterActive = true,
  onHabitClick,
}: HabitListProps) {
  const { user, habits, setHabits } = useUserStore();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();

  const filteredHabits = filterActive
    ? habits.filter((h) => h.isActive)
    : habits;

  const handleDelete = async (habitId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this habit?")) return;

    try {
      await deleteExistingHabit(user.uid, habitId);
      // Update local state (listener will handle this, but optimistic update feels better)
      setHabits(habits.filter((h) => h.id !== habitId));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingHabit(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingHabit(undefined);
  };

  if (showForm) {
    return (
      <div className="glass-card p-6">
        <HabitForm
          habit={editingHabit}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Habit Button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full glass-card p-4 flex items-center justify-center gap-2 hover:glass-strong transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>Add New Habit</span>
      </button>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="text-3xl">📝</span>
          </div>
          <p className="empty-state-text">
            No habits yet. Create your first habit!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => onHabitClick?.(habit)}
              className="glass-card p-4 cursor-pointer hover:translate-y-[-2px] transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-2xl">
                  {habit.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{habit.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {habit.frequency === "daily" ? "Every day" : "Specific days"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(habit);
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg btn-ghost"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(habit.id);
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg btn-ghost text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
