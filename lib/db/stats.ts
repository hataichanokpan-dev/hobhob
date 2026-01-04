import { updateHabitStats, listenToStats, getStatsRef } from "./index";
import { get, set, ref } from "firebase/database";
import { database } from "@/lib/firebase/client";
import type { HabitStats } from "@/types";

/**
 * Update stats for a habit after check-in
 */
export async function updateStatsAfterCheckin(
  uid: string,
  habitId: string,
  checkins: Record<string, boolean>,
  timezone: string
): Promise<void> {
  // Get current stats
  const statsRef = ref(database, `users/${uid}/stats/${habitId}`);
  const snapshot = await get(statsRef);

  let currentStreak = 0;
  let bestStreak = 0;
  let totalCheckins = 0;

  if (snapshot.exists()) {
    const stats = snapshot.val() as HabitStats;
    currentStreak = stats.currentStreak;
    bestStreak = stats.bestStreak;
    totalCheckins = stats.totalCheckins;
  }

  // Recalculate streaks based on all checkins
  // For now, simple increment - full calculation would require loading all checkins
  totalCheckins = Object.values(checkins).filter((v) => v === true).length;

  // Simple streak calculation (can be improved with full history)
  const newStats: HabitStats = {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    totalCheckins,
    lastUpdated: Date.now(),
  };

  await updateHabitStats(uid, habitId, newStats);
}

/**
 * Listen to stats for all habits
 */
export function listenToAllStats(
  uid: string,
  callback: (stats: Record<string, HabitStats> | null) => void
): () => void {
  return listenToStats(uid, callback);
}

/**
 * Get stats for a single habit
 */
export async function getHabitStats(
  uid: string,
  habitId: string
): Promise<HabitStats | null> {
  const snapshot = await get(ref(database, `users/${uid}/stats/${habitId}`));
  return snapshot.exists() ? (snapshot.val() as HabitStats) : null;
}

/**
 * Initialize stats for a new habit
 */
export async function initializeHabitStats(
  uid: string,
  habitId: string
): Promise<void> {
  const stats: HabitStats = {
    currentStreak: 0,
    bestStreak: 0,
    totalCheckins: 0,
    lastUpdated: Date.now(),
  };

  await set(ref(database, `users/${uid}/stats/${habitId}`), stats);
}
