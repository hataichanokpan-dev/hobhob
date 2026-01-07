import {
  createTarget,
  updateTarget,
  deleteTarget,
  createTargetInstance,
  updateTargetInstance,
  listenToTargets,
  listenToTargetInstances,
} from "./index";
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

    // Find instance for current window
    let currentInstance = targetInstances.find(
      (i) => i.windowKey === currentWindowKey
    );

    // Create instance if it doesn't exist
    if (!currentInstance) {
      const hasCompletedInstance = targetInstances.some(
        (i) => i.status === "COMPLETED"
      );

      // For one-time targets, only create if no completed instance exists
      if (target.isRecurring || !hasCompletedInstance) {
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
        currentInstance = newInstance;
      }
    }

    // Check if instance should be expired
    if (currentInstance && currentInstance.status === "ACTIVE") {
      if (now > currentInstance.windowEnd) {
        instancesToExpire.push(currentInstance.id);
      } else {
        activeInstances.push(currentInstance);
      }
    }
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
