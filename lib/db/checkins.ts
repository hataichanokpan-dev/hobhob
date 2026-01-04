import { toggleCheckin, listenToCheckins } from "./index";
import type { DayCheckins } from "@/types";

/**
 * Toggle check-in for a habit on a specific date
 * with optimistic UI support
 */
export async function toggleHabitCheckin(
  uid: string,
  date: string,
  habitId: string,
  currentValue: boolean | null
): Promise<boolean> {
  const newValue = currentValue !== true;
  await toggleCheckin(uid, date, habitId, newValue);
  return newValue;
}

/**
 * Listen to checkins for a specific date
 */
export function listenToDateCheckins(
  uid: string,
  date: string,
  callback: (checkins: DayCheckins | null) => void
): () => void {
  return listenToCheckins(uid, date, callback);
}

/**
 * Get checkin value for a habit on a specific date
 */
export function getHabitCheckin(
  checkins: DayCheckins | null,
  habitId: string
): boolean | null {
  if (!checkins || !(habitId in checkins)) {
    return null;
  }
  return checkins[habitId];
}

/**
 * Calculate completion percentage for a date
 */
export function calculateCompletionRate(
  checkins: DayCheckins | null,
  totalHabits: number
): number {
  if (!checkins || totalHabits === 0) return 0;

  const completed = Object.values(checkins).filter((v) => v === true).length;
  return Math.round((completed / totalHabits) * 100);
}
