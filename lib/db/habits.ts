import {
  createHabit,
  updateHabit,
  deleteHabit,
  listenToHabits,
} from "./index";
import type { Habit, CreateHabitInput, UpdateHabitInput } from "@/types";

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new habit
 */
export async function createNewHabit(
  uid: string,
  input: CreateHabitInput
): Promise<string> {
  const habit: Habit = {
    id: generateId(),
    name: input.name,
    icon: input.icon,
    color: input.color,
    frequency: input.frequency,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Only include targetDays if provided (for weekly habits)
  if (input.targetDays) {
    habit.targetDays = input.targetDays;
  }

  await createHabit(uid, habit);
  return habit.id;
}

/**
 * Update existing habit
 */
export async function updateExistingHabit(
  uid: string,
  input: UpdateHabitInput
): Promise<void> {
  const { id, ...updates } = input;
  await updateHabit(uid, id, updates);
}

/**
 * Delete a habit
 */
export async function deleteExistingHabit(
  uid: string,
  habitId: string
): Promise<void> {
  await deleteHabit(uid, habitId);
}

/**
 * Convert habits object to array
 */
export function habitsToArray(
  habitsObj: Record<string, Habit> | null
): Habit[] {
  if (!habitsObj) return [];
  return Object.entries(habitsObj).map(([id, habit]) => ({
    ...habit,
    id,
  }));
}
