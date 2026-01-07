import { database } from "@/lib/firebase/client";
import { ref, set, get, update, remove, onValue, query, orderByChild, equalTo } from "firebase/database";
import type { UserProfile, Habit, DayCheckins, HabitStats, Target, TargetInstance } from "@/types";

// Re-export Firebase database functions
export { ref, update, remove, onValue };

/**
 * Get user database reference path
 */
export function getUserRef(uid: string) {
  return ref(database, `users/${uid}`);
}

/**
 * Get profile reference
 */
export function getProfileRef(uid: string) {
  return ref(database, `users/${uid}/profile`);
}

/**
 * Get habits reference
 */
export function getHabitsRef(uid: string) {
  return ref(database, `users/${uid}/habits`);
}

/**
 * Get single habit reference
 */
export function getHabitRef(uid: string, habitId: string) {
  return ref(database, `users/${uid}/habits/${habitId}`);
}

/**
 * Get checkins reference for a specific date
 */
export function getCheckinsRef(uid: string, date: string) {
  return ref(database, `users/${uid}/checkins/${date}`);
}

/**
 * Get stats reference
 */
export function getStatsRef(uid: string) {
  return ref(database, `users/${uid}/stats`);
}

/**
 * Create or update user profile
 */
export async function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  await set(getProfileRef(uid), profile);
}

/**
 * Create new habit
 */
export async function createHabit(uid: string, habit: Habit): Promise<void> {
  await set(getHabitRef(uid, habit.id), habit);
}

/**
 * Update habit
 */
export async function updateHabit(uid: string, habitId: string, updates: Partial<Habit>): Promise<void> {
  await update(getHabitRef(uid, habitId), {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Delete habit
 */
export async function deleteHabit(uid: string, habitId: string): Promise<void> {
  await remove(getHabitRef(uid, habitId));
}

/**
 * Toggle check-in for a habit on a specific date
 */
export async function toggleCheckin(
  uid: string,
  date: string,
  habitId: string,
  value: boolean
): Promise<void> {
  await update(getCheckinsRef(uid, date), {
    [habitId]: value,
  });
}

/**
 * Update habit stats
 */
export async function updateHabitStats(
  uid: string,
  habitId: string,
  stats: HabitStats
): Promise<void> {
  await update(ref(database, `users/${uid}/stats/${habitId}`), stats);
}

/**
 * Listen to habits changes
 */
export function listenToHabits(
  uid: string,
  callback: (habits: Record<string, Habit> | null) => void
): () => void {
  const habitsRef = getHabitsRef(uid);
  return onValue(habitsRef, (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Listen to checkins for a specific date
 */
export function listenToCheckins(
  uid: string,
  date: string,
  callback: (checkins: DayCheckins | null) => void
): () => void {
  const checkinsRef = getCheckinsRef(uid, date);
  return onValue(checkinsRef, (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Listen to stats changes
 */
export function listenToStats(
  uid: string,
  callback: (stats: Record<string, HabitStats> | null) => void
): () => void {
  const statsRef = getStatsRef(uid);
  return onValue(statsRef, (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Listen to all checkins changes
 */
export function listenToAllCheckins(
  uid: string,
  callback: (checkins: Record<string, DayCheckins> | null) => void
): () => void {
  const checkinsRef = ref(database, `users/${uid}/checkins`);
  return onValue(checkinsRef, (snapshot) => {
    callback(snapshot.val());
  });
}

// ============ Target Functions ============

/**
 * Get targets reference
 */
export function getTargetsRef(uid: string) {
  return ref(database, `users/${uid}/targets`);
}

/**
 * Get single target reference
 */
export function getTargetRef(uid: string, targetId: string) {
  return ref(database, `users/${uid}/targets/${targetId}`);
}

/**
 * Get target instances reference
 */
export function getTargetInstancesRef(uid: string) {
  return ref(database, `users/${uid}/targetInstances`);
}

/**
 * Get single target instance reference
 */
export function getTargetInstanceRef(uid: string, instanceId: string) {
  return ref(database, `users/${uid}/targetInstances/${instanceId}`);
}

/**
 * Get instances for a specific target
 */
export function getTargetInstancesByTargetRef(uid: string, targetId: string) {
  return query(
    ref(database, `users/${uid}/targetInstances`),
    orderByChild("targetId"),
    equalTo(targetId)
  );
}

/**
 * Create new target
 */
export async function createTarget(uid: string, target: Target): Promise<void> {
  await set(getTargetRef(uid, target.id), target);
}

/**
 * Update target
 */
export async function updateTarget(uid: string, targetId: string, updates: Partial<Target>): Promise<void> {
  await update(getTargetRef(uid, targetId), {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Delete target
 */
export async function deleteTarget(uid: string, targetId: string): Promise<void> {
  await remove(getTargetRef(uid, targetId));
}

/**
 * Create target instance
 */
export async function createTargetInstance(uid: string, instance: TargetInstance): Promise<void> {
  await set(getTargetInstanceRef(uid, instance.id), instance);
}

/**
 * Update target instance
 */
export async function updateTargetInstance(uid: string, instanceId: string, updates: Partial<TargetInstance>): Promise<void> {
  await update(getTargetInstanceRef(uid, instanceId), updates);
}

/**
 * Listen to targets changes
 */
export function listenToTargets(
  uid: string,
  callback: (targets: Record<string, Target> | null) => void
): () => void {
  const targetsRef = getTargetsRef(uid);
  return onValue(targetsRef, (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Listen to target instances changes
 */
export function listenToTargetInstances(
  uid: string,
  callback: (instances: Record<string, TargetInstance> | null) => void
): () => void {
  const instancesRef = getTargetInstancesRef(uid);
  return onValue(instancesRef, (snapshot) => {
    callback(snapshot.val());
  });
}
