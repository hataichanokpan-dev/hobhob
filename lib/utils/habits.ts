import type { Habit } from "@/types";
import { getDayOfWeek, getDayOfMonth } from "./date";

/**
 * Check if a habit should be shown on today's date based on its frequency
 * @param habit - The habit to check
 * @param timezone - User's timezone for accurate day calculation
 * @returns true if the habit should be shown today
 */
export function shouldShowHabitToday(habit: Habit, timezone: string): boolean {
  // Daily habits always show
  if (habit.frequency === "daily") {
    return true;
  }

  // Weekly habits: check if current day of week is in targetDays
  if (habit.frequency === "weekly") {
    if (!habit.targetDays || habit.targetDays.length === 0) {
      // If no days selected, default to showing every day
      return true;
    }
    const currentDayOfWeek = getDayOfWeek(timezone);
    return habit.targetDays.includes(currentDayOfWeek);
  }

  // Monthly habits: check if current day of month is in targetDays
  if (habit.frequency === "monthly") {
    if (!habit.targetDays || habit.targetDays.length === 0) {
      // If no days selected, default to showing on 1st of month
      const currentDayOfMonth = getDayOfMonth(timezone);
      return currentDayOfMonth === 1;
    }
    const currentDayOfMonth = getDayOfMonth(timezone);
    return habit.targetDays.includes(currentDayOfMonth);
  }

  // Default to showing if frequency is unknown
  return true;
}

/**
 * Filter habits to show only those that should be displayed today
 * @param habits - Array of habits to filter
 * @param timezone - User's timezone for accurate day calculation
 * @returns Filtered array of habits
 */
export function filterHabitsForToday(habits: Habit[], timezone: string): Habit[] {
  return habits.filter((habit) => shouldShowHabitToday(habit, timezone));
}

/**
 * Get frequency text for display
 * @param habit - The habit to get frequency text for
 * @returns Human-readable frequency text
 */
export function getFrequencyText(habit: Habit): string {
  if (habit.frequency === "daily") {
    return "Every day";
  }

  if (habit.frequency === "weekly" && habit.targetDays && habit.targetDays.length > 0) {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const days = habit.targetDays.map((d) => dayNames[d]).sort((a, b) => {
      return dayNames.indexOf(a) - dayNames.indexOf(b);
    });

    if (days.length === 7) return "Every day";
    if (days.length === 1) return `Every ${days[0]}`;
    if (days.length === 2) return `${days[0]} & ${days[1]}`;

    // Show first 2 days + count
    const remaining = days.length - 2;
    return `${days.slice(0, 2).join(", ")} + ${remaining} more`;
  }

  if (habit.frequency === "monthly" && habit.targetDays && habit.targetDays.length > 0) {
    if (habit.targetDays.length === 1) {
      return `Monthly on ${getOrdinal(habit.targetDays[0])}`;
    }
    if (habit.targetDays.length === 31) return "Every day";
    return `${habit.targetDays.length} days/month`;
  }

  return "Custom";
}

/**
 * Convert number to ordinal (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
