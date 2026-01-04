"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createNewHabit, updateExistingHabit } from "@/lib/db/habits";
import { useUserStore } from "@/store/use-user-store";
import type { Habit, CreateHabitInput, UpdateHabitInput } from "@/types";

const HABIT_ICONS = [
  "🏃", "📚", "💪", "🧘", "💧", "🍎", "😴", "🎯",
  "✍️", "🎨", "🎵", "💻", "🌱", "🙏", "💊", "🧹",
];

const HABIT_COLORS = [
  { name: "Purple", value: "purple", bg: "bg-purple-500", text: "text-purple-500" },
  { name: "Blue", value: "blue", bg: "bg-blue-500", text: "text-blue-500" },
  { name: "Pink", value: "pink", bg: "bg-pink-500", text: "text-pink-500" },
  { name: "Green", value: "green", bg: "bg-green-500", text: "text-green-500" },
  { name: "Orange", value: "orange", bg: "bg-orange-500", text: "text-orange-500" },
  { name: "Red", value: "red", bg: "bg-red-500", text: "text-red-500" },
];

interface HabitFormProps {
  habit?: Habit;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HabitForm({ habit, onSuccess, onCancel }: HabitFormProps) {
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(habit?.name || "");
  const [icon, setIcon] = useState(habit?.icon || HABIT_ICONS[0]);
  const [color, setColor] = useState(habit?.color || HABIT_COLORS[0].value);
  const [frequency, setFrequency] = useState<"daily" | "weekly">(
    habit?.frequency || "daily"
  );

  const isEditing = !!habit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !name.trim()) return;

    setIsLoading(true);

    try {
      const input: CreateHabitInput | UpdateHabitInput = {
        name: name.trim(),
        icon,
        color,
        frequency,
      };

      if (isEditing) {
        await updateExistingHabit(user.uid, { ...input, id: habit.id });
      } else {
        await createNewHabit(user.uid, input);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving habit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Edit Habit" : "New Habit"}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg btn-ghost"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Exercise"
          className="w-full input"
          maxLength={50}
          required
        />
      </div>

      {/* Icon Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Icon</label>
        <div className="grid grid-cols-8 gap-2">
          {HABIT_ICONS.map((habitIcon) => (
            <button
              key={habitIcon}
              type="button"
              onClick={() => setIcon(habitIcon)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                icon === habitIcon
                  ? "glass-strong scale-110"
                  : "glass hover:glass-strong"
              }`}
            >
              {habitIcon}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Color</label>
        <div className="flex gap-2">
          {HABIT_COLORS.map((habitColor) => (
            <button
              key={habitColor.value}
              type="button"
              onClick={() => setColor(habitColor.value)}
              className={`w-10 h-10 rounded-lg ${habitColor.bg} transition-all ${
                color === habitColor.value
                  ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                  : "opacity-60 hover:opacity-100"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Frequency Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Frequency</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFrequency("daily")}
            className={`p-3 rounded-xl transition-all ${
              frequency === "daily"
                ? "glass-strong"
                : "glass hover:glass-strong"
            }`}
          >
            <div className="text-sm font-medium">Daily</div>
            <div className="text-xs text-muted-foreground">Every day</div>
          </button>
          <button
            type="button"
            onClick={() => setFrequency("weekly")}
            className={`p-3 rounded-xl transition-all ${
              frequency === "weekly"
                ? "glass-strong"
                : "glass hover:glass-strong"
            }`}
          >
            <div className="text-sm font-medium">Weekly</div>
            <div className="text-xs text-muted-foreground">Specific days</div>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full btn-primary"
      >
        {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Habit"}
      </button>
    </form>
  );
}
