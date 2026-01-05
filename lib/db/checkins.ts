import { update, getCheckinsRef, listenToCheckins } from "./index";
import type { DayCheckins, CheckinData, CheckinValue } from "@/types";

/**
 * Toggle check-in for a habit on a specific date
 * with optimistic UI support
 */
export async function toggleHabitCheckin(
  uid: string,
  date: string,
  habitId: string,
  currentValue: boolean | null,
  note?: string
): Promise<CheckinValue> {
  const newChecked = currentValue !== true;

  if (note) {
    // If note is provided, store as CheckinData
    const checkinData: CheckinData = {
      checked: newChecked,
      note,
      timestamp: Date.now(),
    };
    await update(getCheckinsRef(uid, date), {
      [habitId]: checkinData,
    });
    return checkinData;
  } else {
    // Otherwise, store as simple boolean for backward compatibility
    await update(getCheckinsRef(uid, date), {
      [habitId]: newChecked,
    });
    return newChecked;
  }
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
 * Returns object with checked status and optional note
 */
export function getHabitCheckin(
  checkins: DayCheckins | null,
  habitId: string
): { checked: boolean | null; note?: string } {
  if (!checkins || !(habitId in checkins)) {
    return { checked: null };
  }

  const value = checkins[habitId];

  // Handle CheckinData format
  if (typeof value === "object" && value !== null) {
    const data = value as CheckinData;
    return { checked: data.checked, note: data.note };
  }

  // Handle simple boolean format (backward compatibility)
  return { checked: value, note: undefined };
}

/**
 * Get just the checked status (for simple display)
 */
export function getHabitCheckinStatus(
  checkins: DayCheckins | null,
  habitId: string
): boolean | null {
  const result = getHabitCheckin(checkins, habitId);
  return result.checked;
}

/**
 * Calculate completion percentage for a date
 */
export function calculateCompletionRate(
  checkins: DayCheckins | null,
  totalHabits: number
): number {
  if (!checkins || totalHabits === 0) return 0;

  const completed = Object.values(checkins).filter((v) => {
    if (typeof v === "object" && v !== null) {
      return (v as CheckinData).checked === true;
    }
    return v === true;
  }).length;
  return Math.round((completed / totalHabits) * 100);
}
