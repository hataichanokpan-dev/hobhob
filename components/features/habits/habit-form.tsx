"use client";

import { useState } from "react";
import { X, Palette } from "lucide-react";
import { createNewHabit, updateExistingHabit } from "@/lib/db/habits";
import { useUserStore } from "@/store/use-user-store";
import type { Habit, CreateHabitInput, UpdateHabitInput } from "@/types";

const HABIT_ICONS = [
  "🏃", "📚", "💪", "🧘", "💧", "🍎", "😴", "🎯",
  "✍️", "🎨", "🎵", "💻", "🌱", "🙏", "💊", "🧹",
];

const HABIT_COLORS = [
  { name: "Orange", value: "orange", bg: "bg-[#FF6600]", text: "text-[#FF6600]", hex: "#FF6600" },
  { name: "Light Orange", value: "orange-light", bg: "bg-[#FF9933]", text: "text-[#FF9933]", hex: "#FF9933" },
  { name: "Yellow", value: "yellow", bg: "bg-[#FFCC00]", text: "text-[#FFCC00]", hex: "#FFCC00" },
  { name: "Pink", value: "pink", bg: "bg-[#FF66B2]", text: "text-[#FF66B2]", hex: "#FF66B2" },
  { name: "Green", value: "green", bg: "bg-[#33CC33]", text: "text-[#33CC33]", hex: "#33CC33" },
  { name: "Blue", value: "blue", bg: "bg-[#3399FF]", text: "text-[#3399FF]", hex: "#3399FF" },
  { name: "Red", value: "red", bg: "bg-[#FF3333]", text: "text-[#FF3333]", hex: "#FF3333" },
];

const WEEK_DAYS = [
  { value: 0, label: "Mon", short: "Mo" },
  { value: 1, label: "Tue", short: "Tu" },
  { value: 2, label: "Wed", short: "We" },
  { value: 3, label: "Thu", short: "Th" },
  { value: 4, label: "Fri", short: "Fr" },
  { value: 5, label: "Sat", short: "Sa" },
  { value: 6, label: "Sun", short: "Su" },
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
  const [description, setDescription] = useState(habit?.description || "");
  const [icon, setIcon] = useState(habit?.icon || HABIT_ICONS[0]);
  const [customIcon, setCustomIcon] = useState("");
  const [showCustomIcon, setShowCustomIcon] = useState(false);

  // Check if habit has a custom color (hex code)
  const isCustomHabitColor = habit?.color?.startsWith("#");
  const habitColor = habit?.color || HABIT_COLORS[0].value;
  const [color, setColor] = useState(habitColor);
  const [customColor, setCustomColor] = useState(isCustomHabitColor ? habitColor : "#FF6600");
  const [showCustomColor, setShowCustomColor] = useState(false);

  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    habit?.frequency || "daily"
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(habit?.targetDays || []);

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

      // Only include description if it's not empty (Firebase doesn't accept undefined)
      const trimmedDescription = description.trim();
      if (trimmedDescription) {
        input.description = trimmedDescription;
      }

      // Add targetDays for weekly/monthly
      if (frequency !== "daily" && selectedDays.length > 0) {
        input.targetDays = selectedDays;
      }

      if (isEditing) {
        console.log("Updating habit:", { id: habit.id, input });
        await updateExistingHabit(user.uid, { ...input, id: habit.id });
        console.log("Habit updated successfully");
      } else {
        console.log("Creating new habit:", input);
        await createNewHabit(user.uid, input);
        console.log("Habit created successfully");
      }

      // Only call onSuccess if save succeeded
      onSuccess?.();
    } catch (error) {
      console.error("Error saving habit:", error);
      alert(`Failed to save habit: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Edit Habit" : "New Habit"}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="icon-btn"
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

      {/* Description Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description <span className="text-muted-foreground">(optional)</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description to remind yourself why this habit matters..."
          className="w-full input resize-none"
          rows={2}
          maxLength={600}
        />
        <p className="text-xs text-muted-foreground text-right">
          {description.length}/600
        </p>
      </div>

      {/* Icon Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Icon</label>
          <button
            type="button"
            onClick={() => setShowCustomIcon(!showCustomIcon)}
            className="text-xs text-[var(--color-brand)] hover:underline"
          >
            {showCustomIcon ? "Hide" : "Custom"}
          </button>
        </div>

        {/* Preset Icons */}
        <div className={`grid grid-cols-8 gap-2 pt-2 ${showCustomIcon ? "hidden" : ""}`}>
          {HABIT_ICONS.map((habitIcon) => (
            <button
              key={habitIcon}
              type="button"
              onClick={() => setIcon(habitIcon)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                icon === habitIcon
                  ? "bg-[var(--color-brand)] text-white scale-110"
                  : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
              }`}
            >
              {habitIcon}
            </button>
          ))}
        </div>

        {/* Custom Icon Input */}
        {showCustomIcon && (
          <div className="space-y-2 pt-2">
            <input
              type="text"
              value={customIcon}
              onChange={(e) => setCustomIcon(e.target.value)}
              placeholder="Type or paste an emoji... ✨"
              className="w-full input text-center text-2xl"
              maxLength={2}
              onBlur={() => {
                if (customIcon) {
                  setIcon(customIcon);
                }
              }}
            />
            {customIcon && (
              <button
                type="button"
                onClick={() => {
                  setIcon(customIcon);
                  setShowCustomIcon(false);
                }}
                className="w-full btn-primary text-sm"
              >
                Use "{customIcon}"
              </button>
            )}
          </div>
        )}
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Color</label>
          <button
            type="button"
            onClick={() => setShowCustomColor(!showCustomColor)}
            className="text-xs text-[var(--color-brand)] hover:underline"
          >
            {showCustomColor ? "Hide" : "Custom"}
          </button>
        </div>

        {/* Preset Colors */}
        <div className={`flex gap-2 pt-2 ${showCustomColor ? "hidden" : ""}`}>
          {HABIT_COLORS.map((habitColor) => (
            <button
              key={habitColor.value}
              type="button"
              onClick={() => setColor(habitColor.value)}
              className={`w-10 h-10 rounded-lg ${habitColor.bg} transition-all ${
                color === habitColor.value
                  ? "ring-2 ring-[var(--color-brand)] ring-offset-2 scale-110"
                  : "opacity-60 hover:opacity-100"
              }`}
            />
          ))}
        </div>

        {/* Custom Color Picker */}
        {showCustomColor && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0"
                />
                <Palette className="absolute -right-1 -top-1 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#FF6600"
                className="flex-1 input font-mono text-sm uppercase"
                maxLength={7}
              />
              <button
                type="button"
                onClick={() => {
                  setColor(customColor);
                  setShowCustomColor(false);
                }}
                className="btn-primary text-sm px-4"
              >
                Use
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Pick any color or enter a hex code (e.g., #FF6600)
            </p>
          </div>
        )}
      </div>

      {/* Frequency Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Frequency</label>

        {/* Frequency Type Selector */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              setFrequency("daily");
              setSelectedDays([]);
            }}
            className={`p-3 rounded-xl text-center transition-all ${
              frequency === "daily"
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
            }`}
          >
            <div className="text-sm font-medium">Daily</div>
            <div className="text-xs opacity-70">Every day</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setFrequency("weekly");
              setSelectedDays([0]); // Default: all days
            }}
            className={`p-3 rounded-xl text-center transition-all ${
              frequency === "weekly"
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
            }`}
          >
            <div className="text-sm font-medium">Weekly</div>
            <div className="text-xs opacity-70">Pick days</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setFrequency("monthly");
              setSelectedDays([1]); // Default: 1st day
            }}
            className={`p-3 rounded-xl text-center transition-all ${
              frequency === "monthly"
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
            }`}
          >
            <div className="text-sm font-medium">Monthly</div>
            <div className="text-xs opacity-70">Pick dates</div>
          </button>
        </div>

        {/* Day Selector for Weekly */}
        {frequency === "weekly" && (
          <div className="surface p-3">
            <div className="flex justify-between gap-1">
              {WEEK_DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedDays.includes(day.value)
                      ? "bg-[var(--color-brand)] text-white"
                      : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
                  }`}
                >
                  {day.short}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              {selectedDays.length === 0
                ? "Select at least one day"
                : `${selectedDays.length} day${selectedDays.length > 1 ? "s" : ""} selected`}
            </div>
          </div>
        )}

        {/* Day Number Selector for Monthly */}
        {frequency === "monthly" && (
          <div className="surface p-3">
            <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => toggleDay(dayNum)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedDays.includes(dayNum)
                      ? "bg-[var(--color-brand)] text-white"
                      : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
                  }`}
                >
                  {dayNum}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              {selectedDays.length === 0
                ? "Select at least one date"
                : `${selectedDays.length} date${selectedDays.length > 1 ? "s" : ""} selected`}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !name.trim() || (frequency !== "daily" && selectedDays.length === 0)}
        className="w-full btn-primary"
      >
        {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Habit"}
      </button>
    </form>
  );
}
