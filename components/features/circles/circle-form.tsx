"use client";

import { useState } from "react";
import { Loader2, Palette } from "lucide-react";
import { createNewCircle } from "@/lib/db/circles";
import { useUserStore } from "@/store/use-user-store";
import { useRouter } from "next/navigation";

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

const CIRCLE_COLORS = [
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#10B981" },
  { name: "Orange", hex: "#F59E0B" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Red", hex: "#EF4444" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Teal", hex: "#14B8A6" },
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

interface CreateCircleFormProps {
  onSuccess?: (circleId: string, inviteCode?: string) => void;
  onCancel?: () => void;
}

export function CreateCircleForm({ onSuccess, onCancel }: CreateCircleFormProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - focused on habit first
  const [step, setStep] = useState<"habit" | "circle">("habit");

  // Habit fields
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [habitIcon, setHabitIcon] = useState(HABIT_ICONS[0]);
  const [customHabitIcon, setCustomHabitIcon] = useState("");
  const [showCustomHabitIcon, setShowCustomHabitIcon] = useState(false);
  const [habitColor, setHabitColor] = useState(HABIT_COLORS[0].value);
  const [customHabitColor, setCustomHabitColor] = useState(HABIT_COLORS[0].hex);
  const [showCustomHabitColor, setShowCustomHabitColor] = useState(false);
  const [habitFrequency, setHabitFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [habitTargetDays, setHabitTargetDays] = useState<number[]>([]);

  // Circle fields
  const [circleName, setCircleName] = useState("");
  const [circleDescription, setCircleDescription] = useState("");
  const [circleIcon, setCircleIcon] = useState("🌍");
  const [customCircleIcon, setCustomCircleIcon] = useState("");
  const [showCustomCircleIcon, setShowCustomCircleIcon] = useState(false);
  const [circleColor, setCircleColor] = useState(CIRCLE_COLORS[0].hex);
  const [type, setType] = useState<"open" | "private">("open");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !habitName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createNewCircle(user.uid, {
        circleName: circleName.trim() || habitName.trim(),
        circleDescription: circleDescription.trim() || `Building "${habitName.trim()}" together.`,
        circleIcon,
        circleColor,
        type,
        habitName: habitName.trim(),
        habitDescription: habitDescription.trim() || undefined,
        habitIcon,
        habitColor,
        habitFrequency,
        habitTargetDays: habitFrequency !== "daily" ? habitTargetDays : undefined,
      });

      if (result.success) {
        if (onSuccess) {
          onSuccess(result.circleId!, result.inviteCode);
        } else {
          router.push("/circles");
        }
      } else {
        setError(result.error || "Failed to create circle");
      }
    } catch (err) {
      console.error("Error creating circle:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setHabitTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const isStep1Valid = habitName.trim();
  const isStep2Valid = habitName.trim();

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Create Circle</h1>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2">
          <div className={`flex-1 h-1 rounded-full ${step === "habit" ? "bg-[var(--color-brand)]" : "bg-[var(--color-muted)]"}`} />
          <div className={`flex-1 h-1 rounded-full ${step === "circle" ? "bg-[var(--color-brand)]" : "bg-[var(--color-muted)]"}`} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Habit</span>
          <span>Circle</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-6">
        {/* Step 1: Habit Setup */}
        {step === "habit" && (
          <div className="space-y-5">
            {/* Habit Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Habit name</label>
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g., Morning Exercise"
                className="w-full input"
                maxLength={50}
                required
              />
            </div>

            {/* Habit Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description <span className="text-muted-foreground">(optional)</span></label>
              <textarea
                value={habitDescription}
                onChange={(e) => setHabitDescription(e.target.value)}
                placeholder="Add a description to remind yourself why this habit matters..."
                className="w-full input resize-none"
                rows={2}
                maxLength={600}
              />
              <p className="text-xs text-muted-foreground text-right">
                {habitDescription.length}/600
              </p>
            </div>

            {/* Habit Icon */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Habit icon</label>
                <button
                  type="button"
                  onClick={() => setShowCustomHabitIcon(!showCustomHabitIcon)}
                  className="text-xs text-[var(--color-brand)] hover:underline"
                >
                  {showCustomHabitIcon ? "Hide" : "Custom"}
                </button>
              </div>

              <div className={`grid grid-cols-8 gap-2 pt-2 ${showCustomHabitIcon ? "hidden" : ""}`}>
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setHabitIcon(icon)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                      habitIcon === icon
                        ? "bg-[var(--color-brand)] text-white scale-110"
                        : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {showCustomHabitIcon && (
                <div className="space-y-2 pt-2">
                  <input
                    type="text"
                    value={customHabitIcon}
                    onChange={(e) => setCustomHabitIcon(e.target.value)}
                    placeholder="Type or paste an emoji... ✨"
                    className="w-full input text-center text-2xl"
                    maxLength={2}
                    onBlur={() => {
                      if (customHabitIcon) {
                        setHabitIcon(customHabitIcon);
                      }
                    }}
                  />
                  {customHabitIcon && (
                    <button
                      type="button"
                      onClick={() => {
                        setHabitIcon(customHabitIcon);
                        setShowCustomHabitIcon(false);
                      }}
                      className="w-full btn-primary text-sm"
                    >
                      Use "{customHabitIcon}"
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Habit Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Habit color</label>
                <button
                  type="button"
                  onClick={() => setShowCustomHabitColor(!showCustomHabitColor)}
                  className="text-xs text-[var(--color-brand)] hover:underline"
                >
                  {showCustomHabitColor ? "Hide" : "Custom"}
                </button>
              </div>

              <div className={`flex gap-2 pt-2 ${showCustomHabitColor ? "hidden" : ""}`}>
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setHabitColor(color.value)}
                    className={`w-10 h-10 rounded-lg ${color.bg} transition-all ${
                      habitColor === color.value
                        ? "ring-2 ring-[var(--color-brand)] ring-offset-2 scale-110"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>

              {showCustomHabitColor && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={customHabitColor}
                        onChange={(e) => setCustomHabitColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                      />
                      <Palette className="absolute -right-1 -top-1 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      value={customHabitColor}
                      onChange={(e) => setCustomHabitColor(e.target.value)}
                      placeholder="#FF6600"
                      className="flex-1 input font-mono text-sm uppercase"
                      maxLength={7}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setHabitColor(customHabitColor);
                        setShowCustomHabitColor(false);
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

            {/* Frequency */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Frequency</label>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setHabitFrequency("daily");
                    setHabitTargetDays([]);
                  }}
                  className={`p-3 rounded-xl text-center transition-all ${
                    habitFrequency === "daily"
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
                    setHabitFrequency("weekly");
                    setHabitTargetDays([0]);
                  }}
                  className={`p-3 rounded-xl text-center transition-all ${
                    habitFrequency === "weekly"
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
                    setHabitFrequency("monthly");
                    setHabitTargetDays([1]);
                  }}
                  className={`p-3 rounded-xl text-center transition-all ${
                    habitFrequency === "monthly"
                      ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                      : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
                  }`}
                >
                  <div className="text-sm font-medium">Monthly</div>
                  <div className="text-xs opacity-70">Pick dates</div>
                </button>
              </div>

              {/* Day Selector for Weekly */}
              {habitFrequency === "weekly" && (
                <div className="surface p-3">
                  <div className="flex justify-between gap-1">
                    {WEEK_DAYS.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          habitTargetDays.includes(day.value)
                            ? "bg-[var(--color-brand)] text-white"
                            : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
                        }`}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    {habitTargetDays.length === 0
                      ? "Select at least one day"
                      : `${habitTargetDays.length} day${habitTargetDays.length > 1 ? "s" : ""} selected`}
                  </div>
                </div>
              )}

              {/* Day Number Selector for Monthly */}
              {habitFrequency === "monthly" && (
                <div className="surface p-3">
                  <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => toggleDay(dayNum)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${
                          habitTargetDays.includes(dayNum)
                            ? "bg-[var(--color-brand)] text-white"
                            : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
                        }`}
                      >
                        {dayNum}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    {habitTargetDays.length === 0
                      ? "Select at least one date"
                      : `${habitTargetDays.length} date${habitTargetDays.length > 1 ? "s" : ""} selected`}
                  </div>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={() => setStep("circle")}
              disabled={!isStep1Valid || (habitFrequency !== "daily" && habitTargetDays.length === 0)}
              className="w-full btn-primary"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Circle Settings */}
        {step === "circle" && (
          <div className="space-y-6">
            {/* Habit Summary */}
            <div className="surface p-4">
              <div className="text-xs text-muted-foreground mb-2">Your habit</div>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: habitColor.startsWith("#") ? habitColor : HABIT_COLORS.find(c => c.value === habitColor)?.hex + "20" }}
                >
                  {habitIcon}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{habitName}</div>
                  {habitDescription && (
                    <div className="text-xs text-muted-foreground line-clamp-1">{habitDescription}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {habitFrequency === "daily" ? "Every day" :
                     habitFrequency === "weekly" ? `${habitTargetDays.length} day${habitTargetDays.length > 1 ? "s" : ""}/week` :
                     `${habitTargetDays.length} date${habitTargetDays.length > 1 ? "s" : ""}/month`}
                  </div>
                </div>
              </div>
            </div>

            {/* Circle Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Circle name</label>
              <input
                type="text"
                value={circleName}
                onChange={(e) => setCircleName(e.target.value)}
                placeholder={habitName}
                className="w-full input"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use habit name
              </p>
            </div>

            {/* Circle Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Circle description <span className="text-muted-foreground">(optional)</span></label>
              <textarea
                value={circleDescription}
                onChange={(e) => setCircleDescription(e.target.value)}
                placeholder="What's this circle about?"
                className="w-full input resize-none"
                rows={2}
                maxLength={150}
              />
            </div>

            {/* Circle Icon */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Circle icon</label>
                <button
                  type="button"
                  onClick={() => setShowCustomCircleIcon(!showCustomCircleIcon)}
                  className="text-xs text-[var(--color-brand)] hover:underline"
                >
                  {showCustomCircleIcon ? "Hide" : "Custom"}
                </button>
              </div>

              <div className={`grid grid-cols-8 gap-2 pt-2 ${showCustomCircleIcon ? "hidden" : ""}`}>
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setCircleIcon(icon)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                      circleIcon === icon
                        ? "bg-[var(--color-brand)] text-white scale-110"
                        : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {showCustomCircleIcon && (
                <div className="space-y-2 pt-2">
                  <input
                    type="text"
                    value={customCircleIcon}
                    onChange={(e) => setCustomCircleIcon(e.target.value)}
                    placeholder="Type or paste an emoji... ✨"
                    className="w-full input text-center text-2xl"
                    maxLength={2}
                    onBlur={() => {
                      if (customCircleIcon) {
                        setCircleIcon(customCircleIcon);
                      }
                    }}
                  />
                  {customCircleIcon && (
                    <button
                      type="button"
                      onClick={() => {
                        setCircleIcon(customCircleIcon);
                        setShowCustomCircleIcon(false);
                      }}
                      className="w-full btn-primary text-sm"
                    >
                      Use "{customCircleIcon}"
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Circle Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Circle color</label>
              <div className="flex gap-2 pt-2">
                {CIRCLE_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setCircleColor(color.hex)}
                    className={`w-10 h-10 rounded-full transition-all ${
                      circleColor === color.hex
                        ? "scale-110 ring-2 ring-offset-2 ring-offset-black"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Circle Type */}
            <div>
              <label className="block text-sm font-medium mb-3">Privacy</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("open")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    type === "open"
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10"
                      : "border-[var(--color-border)] hover:border-[var(--color-brand)]/50"
                  }`}
                >
                  <div className="text-2xl mb-2">🌍</div>
                  <div className="font-medium text-sm mb-1">Open</div>
                  <div className="text-xs text-muted-foreground">Anyone can join</div>
                </button>
                <button
                  type="button"
                  onClick={() => setType("private")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    type === "private"
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10"
                      : "border-[var(--color-border)] hover:border-[var(--color-brand)]/50"
                  }`}
                >
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="font-medium text-sm mb-1">Private</div>
                  <div className="text-xs text-muted-foreground">Invite only</div>
                </button>
              </div>
            </div>

            {/* Private Info */}
            {type === "private" && (
              <div className="p-3 rounded-xl bg-[var(--color-muted)]">
                <p className="text-xs text-muted-foreground">
                  Private circles are limited to 2-6 members. You'll get an invite code to share.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("habit")}
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-colors font-medium text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isStep2Valid || isSubmitting}
                className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Circle"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
