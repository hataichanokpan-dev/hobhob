import {
  createTarget,
  updateTarget,
  deleteTarget,
  createTargetInstance,
  updateTargetInstance,
  listenToTargets,
  listenToTargetInstances,
  getTargetInstanceRef,
} from "./index";
import { remove } from "firebase/database";
import { getCurrentWindowKey, getCurrentWindowBounds } from "@/lib/utils/date";
import type { Target, TargetInstance, CreateTargetInput, UpdateTargetInput } from "@/types";

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new target
 */
export async function createNewTarget(
  uid: string,
  input: CreateTargetInput,
  timezone: string
): Promise<string> {
  const target: Target = {
    id: generateId(),
    title: input.title,
    description: input.description,
    successCriteriaText: input.successCriteriaText,
    icon: input.icon,
    color: input.color,
    windowType: input.windowType,
    requiredCount: input.requiredCount ?? 1,
    isRecurring: input.isRecurring ?? false,
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Only include customDurationDays if it's defined (CUSTOM window type)
  if (input.customDurationDays !== undefined) {
    target.customDurationDays = input.customDurationDays;
  }

  await createTarget(uid, target);

  // Create initial instance for current window
  const windowKey = getCurrentWindowKey(target.windowType, timezone, target.customDurationDays);
  const bounds = getCurrentWindowBounds(target.windowType, timezone, target.customDurationDays);

  const instance: TargetInstance = {
    id: generateId(),
    targetId: target.id,
    windowKey,
    windowStart: bounds.start,
    windowEnd: bounds.end,
    status: "ACTIVE",
    createdAt: Date.now(),
  };

  await createTargetInstance(uid, instance);

  return target.id;
}

/**
 * Update existing target
 */
export async function updateExistingTarget(
  uid: string,
  input: UpdateTargetInput
): Promise<void> {
  const { id, ...updates } = input;
  await updateTarget(uid, id, updates);
}

/**
 * Delete a target (archives it)
 */
export async function archiveTarget(
  uid: string,
  targetId: string
): Promise<void> {
  await updateTarget(uid, targetId, { isArchived: true });
}

/**
 * Mark target instance as completed
 */
export async function completeTargetInstance(
  uid: string,
  instanceId: string
): Promise<void> {
  await updateTargetInstance(uid, instanceId, {
    status: "COMPLETED",
    completedAt: Date.now(),
  });
}

/**
 * Convert targets object to array
 */
export function targetsToArray(
  targetsObj: Record<string, Target> | null
): Target[] {
  if (!targetsObj) return [];
  return Object.entries(targetsObj).map(([id, target]) => ({
    ...target,
    id,
  }));
}

/**
 * Convert target instances object to array
 */
export function targetInstancesToArray(
  instancesObj: Record<string, TargetInstance> | null
): TargetInstance[] {
  if (!instancesObj) return [];
  return Object.entries(instancesObj).map(([id, instance]) => ({
    ...instance,
    id,
  }));
}

/**
 * Get active target instances for the current window
 * This implements the instance generation logic:
 * 1. Compute current windowKey/start/end
 * 2. For each non-archived target:
 *    - If no instance exists for current windowKey:
 *      - If isRecurring = true → create ACTIVE instance
 *      - If isRecurring = false → create only if no COMPLETED instance exists
 * 3. Any ACTIVE instance where now > windowEnd must be set to EXPIRED
 * 4. Return only ACTIVE instances in current window
 */
export async function getActiveTargetInstances(
  uid: string,
  targets: Target[],
  instances: TargetInstance[],
  timezone: string
): Promise<TargetInstance[]> {
  const now = Date.now();
  const activeInstances: TargetInstance[] = [];
  const instancesToCreate: TargetInstance[] = [];
  const instancesToExpire: string[] = [];
  const duplicateIdsToRemove: string[] = [];

  // Group instances by targetId
  const instancesByTarget = new Map<string, TargetInstance[]>();
  for (const instance of instances) {
    const list = instancesByTarget.get(instance.targetId) || [];
    list.push(instance);
    instancesByTarget.set(instance.targetId, list);
  }

  for (const target of targets) {
    if (target.isArchived) continue;

    const currentWindowKey = getCurrentWindowKey(target.windowType, timezone, target.customDurationDays);
    const bounds = getCurrentWindowBounds(target.windowType, timezone, target.customDurationDays);
    const targetInstances = instancesByTarget.get(target.id) || [];

    // Group instances by windowKey for this target
    const instancesByWindow = new Map<string, TargetInstance[]>();
    for (const instance of targetInstances) {
      const list = instancesByWindow.get(instance.windowKey) || [];
      list.push(instance);
      instancesByWindow.set(instance.windowKey, list);
    }

    // Get instances for current window
    const windowInstances = instancesByWindow.get(currentWindowKey) || [];

    // Clean up duplicates: keep only the first instance (oldest createdAt), mark others for removal
    if (windowInstances.length > 1) {
      // Sort by createdAt (oldest first)
      windowInstances.sort((a, b) => a.createdAt - b.createdAt);
      // Keep first one, mark rest for removal
      for (let i = 1; i < windowInstances.length; i++) {
        duplicateIdsToRemove.push(windowInstances[i].id);
      }
    }

    // Find completed instance for current window (from remaining after dedup)
    const completedInstanceInWindow = windowInstances.find(
      (i) => i.status === "COMPLETED" && !duplicateIdsToRemove.includes(i.id)
    );

    // Find active instance for current window (from remaining after dedup)
    const activeInstanceInWindow = windowInstances.find(
      (i) => i.status === "ACTIVE" && !duplicateIdsToRemove.includes(i.id)
    );

    // If there's a completed instance in this window, don't create a new one
    if (completedInstanceInWindow) {
      // Completed instance exists, don't add to activeInstances
      continue;
    }

    // If there's an active instance, use it
    if (activeInstanceInWindow) {
      // Check if instance should be expired
      if (now > activeInstanceInWindow.windowEnd) {
        instancesToExpire.push(activeInstanceInWindow.id);
      } else {
        activeInstances.push(activeInstanceInWindow);
      }
      continue;
    }

    // No instance exists for this window, create one
    // For one-time targets, check if ANY completed instance exists (across all windows)
    const hasCompletedInstanceAnywhere = targetInstances.some(
      (i) => i.status === "COMPLETED" && !duplicateIdsToRemove.includes(i.id)
    );

    // For recurring targets: create new instance for this window
    // For one-time targets: only create if no completed instance exists anywhere
    if (target.isRecurring || !hasCompletedInstanceAnywhere) {
      const newInstance: TargetInstance = {
        id: generateId(),
        targetId: target.id,
        windowKey: currentWindowKey,
        windowStart: bounds.start,
        windowEnd: bounds.end,
        status: "ACTIVE",
        createdAt: now,
      };
      instancesToCreate.push(newInstance);
      activeInstances.push(newInstance);
    }
  }

  // Remove duplicate instances (delete them from database)
  if (duplicateIdsToRemove.length > 0) {
    await Promise.all(
      duplicateIdsToRemove.map((id) => remove(getTargetInstanceRef(uid, id)))
    );
  }

  // Create new instances in parallel
  await Promise.all(
    instancesToCreate.map((instance) => createTargetInstance(uid, instance))
  );

  // Mark expired instances in parallel
  await Promise.all(
    instancesToExpire.map((id) =>
      updateTargetInstance(uid, id, { status: "EXPIRED" })
    )
  );

  return activeInstances;
}
