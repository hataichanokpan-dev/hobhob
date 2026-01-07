import { database } from "@/lib/firebase/client";
import { ref, set, get, update, remove, onValue, runTransaction } from "firebase/database";
import type { Circle, CircleDailyStats, UserCircleMembership, Habit, Target, TargetInstance, WindowType } from "@/types";
import { getCurrentWindowKey, getCurrentWindowBounds } from "@/lib/utils/date";

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate invite code (6-character alphanumeric)
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 for clarity
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new circle
 * Following same pattern as createNewHabit in habits.ts
 */
export async function createNewCircle(
  uid: string,
  input: {
    circleName: string;
    circleDescription?: string;
    circleIcon: string;
    circleColor: string;
    type: "open" | "private";
    mode: "habit" | "target"; // NEW: Mode selection
    // Habit fields (for habit mode)
    habitName?: string;
    habitDescription?: string;
    habitIcon?: string;
    habitColor?: string;
    habitFrequency?: "daily" | "weekly" | "monthly";
    habitTargetDays?: number[];
    // Target fields (for target mode) - NEW
    targetTitle?: string;
    targetDescription?: string;
    targetSuccessCriteria?: string;
    targetIcon?: string;
    targetColor?: string;
    targetWindowType?: WindowType;
    targetCustomDays?: number;
    targetIsRecurring?: boolean;
  }
): Promise<{ success: boolean; circleId?: string; habitId?: string; targetId?: string; inviteCode?: string; error?: string }> {
  try {
    const circleId = generateId();
    const inviteCode = input.type === "private" ? generateInviteCode() : undefined;

    // Helper functions for date calculations
    const getCurrentWindowKey = (windowType: WindowType, timezone: string, customDays?: number): string => {
      const now = new Date();
      // For MVP: simple window keys based on UTC
      // TODO: Use timezone from user profile
      switch (windowType) {
        case "WEEK":
          const weekNum = getWeekNumber(now);
          return `${now.getFullYear()}-W${weekNum}`;
        case "MONTH":
          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        case "YEAR":
          return `${now.getFullYear()}`;
        case "CUSTOM":
          if (customDays) {
            const dayNum = Math.floor(Date.now() / (customDays * 24 * 60 * 60 * 1000));
            return `custom-${dayNum}`;
          }
          return `custom-${now.getFullYear()}`;
        default:
          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }
    };

    const getWeekNumber = (date: Date): number => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    // 1. Create the circle
    const circle: Circle = {
      id: circleId,
      name: input.circleName,
      circleIcon: input.circleIcon,
      circleColor: input.circleColor,
      type: input.type,
      mode: input.mode,
      createdAt: Date.now(),
      createdBy: uid,
      memberCount: 1, // Creator counts as first member
    };

    // Add description if provided
    if (input.circleDescription) {
      circle.description = input.circleDescription;
    }

    // Add mode-specific template
    if (input.mode === "habit") {
      // Habit mode - validate required fields
      if (!input.habitName || !input.habitIcon || !input.habitColor || !input.habitFrequency) {
        return { success: false, error: "Missing required habit fields" };
      }
      circle.publicHabitTemplate = {
        name: input.habitName,
        icon: input.habitIcon,
        color: input.habitColor,
        frequency: input.habitFrequency,
      };
      if (input.habitDescription) {
        circle.publicHabitTemplate.description = input.habitDescription;
      }
      if (input.habitTargetDays) {
        circle.publicHabitTemplate.targetDays = input.habitTargetDays;
      }
    } else if (input.mode === "target") {
      // Target mode - validate required fields
      if (!input.targetTitle || !input.targetIcon || !input.targetColor || !input.targetWindowType) {
        return { success: false, error: "Missing required target fields" };
      }
      circle.publicTargetTemplate = {
        title: input.targetTitle,
        icon: input.targetIcon,
        color: input.targetColor,
        windowType: input.targetWindowType,
        isRecurring: input.targetIsRecurring ?? false,
      };
      if (input.targetDescription) {
        circle.publicTargetTemplate.description = input.targetDescription;
      }
      if (input.targetSuccessCriteria) {
        circle.publicTargetTemplate.successCriteriaText = input.targetSuccessCriteria;
      }
      if (input.targetCustomDays) {
        circle.publicTargetTemplate.customDurationDays = input.targetCustomDays;
      }
    }

    // Add invite code for private circles
    if (input.type === "private" && inviteCode) {
      circle.inviteCode = inviteCode;
      circle.memberIds = [uid]; // Initialize with creator
    }

    await set(getCircleRef(circleId), circle);

    // 2. Create the habit or target for the creator
    let membership: UserCircleMembership;

    if (input.mode === "habit") {
      const habitId = generateId();
      const habit: Habit = {
        id: habitId,
        name: input.habitName!,
        icon: input.habitIcon!,
        color: input.habitColor!,
        frequency: input.habitFrequency!,
        isActive: true,
        circleId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      if (input.habitDescription) {
        habit.description = input.habitDescription;
      }
      if (input.habitTargetDays) {
        habit.targetDays = input.habitTargetDays;
      }

      const habitRef = ref(database, `users/${uid}/habits/${habitId}`);
      await set(habitRef, habit);

      membership = {
        circleId,
        joinedAt: Date.now(),
        habitId,
      };
    } else {
      // Target mode
      const targetId = generateId();
      const timezone = "UTC"; // TODO: Get from user profile

      // Get current window bounds
      const now = Date.now();
      const windowKey = getCurrentWindowKey(input.targetWindowType!, timezone, input.targetCustomDays);

      // Calculate window bounds (simplified for MVP)
      let windowStart = now;
      let windowEnd = now;

      switch (input.targetWindowType) {
        case "WEEK":
          // Start of week to end of week
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          windowStart = weekStart.getTime();
          windowEnd = windowStart + 7 * 24 * 60 * 60 * 1000;
          break;
        case "MONTH":
          // Start of month to end of month
          const monthStart = new Date();
          monthStart.setDate(1);
          monthStart.setHours(0, 0, 0, 0);
          windowStart = monthStart.getTime();
          const nextMonth = new Date(monthStart);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          windowEnd = nextMonth.getTime();
          break;
        default:
          // Default 30 days for other types
          windowEnd = now + 30 * 24 * 60 * 60 * 1000;
      }

      // Create target
      const target: Target = {
        id: targetId,
        title: input.targetTitle!,
        icon: input.targetIcon!,
        color: input.targetColor!,
        windowType: input.targetWindowType!,
        requiredCount: 1,
        isRecurring: input.targetIsRecurring ?? false,
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      if (input.targetDescription) {
        target.description = input.targetDescription;
      }
      if (input.targetSuccessCriteria) {
        target.successCriteriaText = input.targetSuccessCriteria;
      }
      // Only include customDurationDays if defined (Firebase doesn't allow undefined)
      if (input.targetCustomDays !== undefined) {
        target.customDurationDays = input.targetCustomDays;
      }

      const targetRef = ref(database, `users/${uid}/targets/${targetId}`);
      await set(targetRef, target);

      // Create initial target instance
      const instanceId = generateId();
      const instance: TargetInstance = {
        id: instanceId,
        targetId,
        windowKey,
        windowStart,
        windowEnd,
        status: "ACTIVE",
        createdAt: now,
      };

      const instanceRef = ref(database, `users/${uid}/targetInstances/${instanceId}`);
      await set(instanceRef, instance);

      membership = {
        circleId,
        joinedAt: Date.now(),
        targetId,
      };
    }

    // 3. Create membership record
    await set(getUserCircleRef(uid, circleId), membership);

    // 4. For private circles, store invite code mapping
    if (input.type === "private" && inviteCode) {
      await set(ref(database, `circles/${circleId}/inviteCodes/${inviteCode}`), {
        createdBy: uid,
        createdAt: Date.now(),
        maxUses: null, // Unlimited uses
      });
    }

    return {
      success: true,
      circleId,
      habitId: membership.habitId,
      targetId: membership.targetId,
      inviteCode,
    };
  } catch (error) {
    console.error("Error creating circle:", error);
    return { success: false, error: "Failed to create circle. Please try again." };
  }
}

/**
 * Join a circle by ID
 */
export async function joinCircleById(
  uid: string,
  circleId: string
): Promise<{ success: boolean; habitId?: string; targetId?: string; error?: string }> {
  try {
    // 1. Get circle data
    const circleSnapshot = await get(getCircleRef(circleId));

    if (!circleSnapshot.exists()) {
      return { success: false, error: "Circle not found" };
    }

    const circle = circleSnapshot.val() as Circle;

    // For backward compatibility, default to "habit" mode if not set
    const circleMode = circle.mode || "habit";

    // 2. Check if user is already a member
    const membershipSnapshot = await get(getUserCircleRef(uid, circleId));

    if (membershipSnapshot.exists()) {
      return { success: false, error: "You're already a member of this circle" };
    }

    // 3. Handle based on circle mode
    if (circleMode === "habit") {
      if (!circle.publicHabitTemplate) {
        return { success: false, error: "Invalid circle configuration" };
      }

      // Check if user already has a habit with the same name
      const habitsRef = ref(database, `users/${uid}/habits`);
      const habitsSnapshot = await get(habitsRef);
      let existingHabitId: string | null = null;

      if (habitsSnapshot.exists()) {
        const habits = habitsSnapshot.val();
        for (const [id, habit] of Object.entries(habits)) {
          if ((habit as Habit).name === circle.publicHabitTemplate.name) {
            existingHabitId = id;
            break;
          }
        }
      }

      // Create habit (or use existing)
      let habitId: string;

      if (existingHabitId) {
        // Link existing habit to circle
        habitId = existingHabitId;
        await update(ref(database, `users/${uid}/habits/${habitId}`), {
          circleId,
          updatedAt: Date.now(),
        });
      } else {
        // Create new habit from circle template
        habitId = generateId();
        const habit: Habit = {
          id: habitId,
          name: circle.publicHabitTemplate.name,
          icon: circle.publicHabitTemplate.icon,
          color: circle.publicHabitTemplate.color,
          frequency: circle.publicHabitTemplate.frequency,
          isActive: true,
          circleId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        if (circle.publicHabitTemplate.description) {
          habit.description = circle.publicHabitTemplate.description;
        }
        if (circle.publicHabitTemplate.targetDays) {
          habit.targetDays = circle.publicHabitTemplate.targetDays;
        }

        await set(ref(database, `users/${uid}/habits/${habitId}`), habit);
      }

      // Create membership record
      const membership: UserCircleMembership = {
        circleId,
        joinedAt: Date.now(),
        habitId,
      };

      await set(getUserCircleRef(uid, circleId), membership);
      await incrementCircleMemberCount(circleId);

      return { success: true, habitId };
    } else if (circleMode === "target") {
      if (!circle.publicTargetTemplate) {
        return { success: false, error: "Invalid circle configuration" };
      }

      // Check if user already has a target with the same title
      const targetsRef = ref(database, `users/${uid}/targets`);
      const targetsSnapshot = await get(targetsRef);
      let existingTargetId: string | null = null;

      if (targetsSnapshot.exists()) {
        const targets = targetsSnapshot.val();
        for (const [id, target] of Object.entries(targets)) {
          if ((target as Target).title === circle.publicTargetTemplate.title) {
            existingTargetId = id;
            break;
          }
        }
      }

      // Create target (or use existing)
      let targetId: string;

      if (existingTargetId) {
        // Link existing target to circle
        targetId = existingTargetId;
        await update(ref(database, `users/${uid}/targets/${targetId}`), {
          circleId,
          updatedAt: Date.now(),
        });
      } else {
        // Create new target from circle template
        targetId = generateId();
        const timezone = "UTC"; // TODO: Get from user profile

        // Helper functions (same as in createNewCircle)
        const getCurrentWindowKey = (windowType: WindowType, timezone: string, customDays?: number): string => {
          const now = new Date();
          switch (windowType) {
            case "WEEK":
              const weekNum = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
              return `${now.getFullYear()}-W${weekNum}`;
            case "MONTH":
              return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            case "YEAR":
              return `${now.getFullYear()}`;
            default:
              return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          }
        };

        const now = Date.now();
        const windowKey = getCurrentWindowKey(circle.publicTargetTemplate.windowType, timezone, circle.publicTargetTemplate.customDurationDays);

        // Calculate window bounds
        let windowStart = now;
        let windowEnd = now;

        switch (circle.publicTargetTemplate.windowType) {
          case "WEEK":
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            windowStart = weekStart.getTime();
            windowEnd = windowStart + 7 * 24 * 60 * 60 * 1000;
            break;
          case "MONTH":
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);
            windowStart = monthStart.getTime();
            const nextMonth = new Date(monthStart);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            windowEnd = nextMonth.getTime();
            break;
          default:
            windowEnd = now + 30 * 24 * 60 * 60 * 1000;
        }

        // Create target
        const target: Target = {
          id: targetId,
          title: circle.publicTargetTemplate.title,
          icon: circle.publicTargetTemplate.icon,
          color: circle.publicTargetTemplate.color,
          windowType: circle.publicTargetTemplate.windowType,
          requiredCount: 1,
          isRecurring: circle.publicTargetTemplate.isRecurring,
          isArchived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        if (circle.publicTargetTemplate.description) {
          target.description = circle.publicTargetTemplate.description;
        }
        if (circle.publicTargetTemplate.successCriteriaText) {
          target.successCriteriaText = circle.publicTargetTemplate.successCriteriaText;
        }
        // Only include customDurationDays if defined (Firebase doesn't allow undefined)
        if (circle.publicTargetTemplate.customDurationDays !== undefined) {
          target.customDurationDays = circle.publicTargetTemplate.customDurationDays;
        }

        await set(ref(database, `users/${uid}/targets/${targetId}`), target);

        // Create initial target instance
        const instanceId = generateId();
        const instance: TargetInstance = {
          id: instanceId,
          targetId,
          windowKey,
          windowStart,
          windowEnd,
          status: "ACTIVE",
          createdAt: now,
        };

        await set(ref(database, `users/${uid}/targetInstances/${instanceId}`), instance);
      }

      // Create membership record
      const membership: UserCircleMembership = {
        circleId,
        joinedAt: Date.now(),
        targetId,
      };

      await set(getUserCircleRef(uid, circleId), membership);
      await incrementCircleMemberCount(circleId);

      return { success: true, targetId };
    }

    return { success: false, error: "Invalid circle mode" };
  } catch (error) {
    console.error("Error joining circle:", error);
    return { success: false, error: "Failed to join circle. Please try again." };
  }
}

/**
 * Leave a circle
 */
export async function leaveCircleById(
  uid: string,
  circleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Check if user is a member
    const membershipSnapshot = await get(getUserCircleRef(uid, circleId));

    if (!membershipSnapshot.exists()) {
      return { success: false, error: "You're not a member of this circle" };
    }

    // 2. Remove membership record
    await remove(getUserCircleRef(uid, circleId));

    // 3. Decrement member count
    await decrementCircleMemberCount(circleId);

    return { success: true };
  } catch (error) {
    console.error("Error leaving circle:", error);
    return { success: false, error: "Failed to leave circle. Please try again." };
  }
}

/**
 * Get circle by invite code
 */
export async function getCircleByInviteCode(
  inviteCode: string
): Promise<{ success: boolean; circle?: Circle; error?: string }> {
  try {
    const circlesSnapshot = await get(getCirclesRef());

    if (!circlesSnapshot.exists()) {
      return { success: false, error: "Invalid invite code" };
    }

    const circles = circlesSnapshot.val();
    for (const [circleId, circleData] of Object.entries(circles)) {
      const circle = circleData as Circle;
      if (circle.inviteCode === inviteCode) {
        return {
          success: true,
          circle: {
            ...circle,
            id: circleId,
          },
        };
      }
    }

    return { success: false, error: "Invalid invite code" };
  } catch (error) {
    console.error("Error getting circle by invite code:", error);
    return { success: false, error: "Failed to find circle" };
  }
}

/**
 * Join a circle via invite code
 */
export async function joinCircleByInviteCode(
  uid: string,
  inviteCode: string
): Promise<{ success: boolean; circleId?: string; habitId?: string; targetId?: string; error?: string }> {
  try {
    // 1. Find circle with this invite code
    const circlesSnapshot = await get(getCirclesRef());

    if (!circlesSnapshot.exists()) {
      return { success: false, error: "Invalid invite code" };
    }

    let targetCircleId: string | null = null;
    let targetCircle: Circle | null = null;

    const circles = circlesSnapshot.val();
    for (const [circleId, circleData] of Object.entries(circles)) {
      const circle = circleData as Circle;
      if (circle.inviteCode === inviteCode) {
        targetCircleId = circleId;
        targetCircle = circle;
        break;
      }
    }

    if (!targetCircleId || !targetCircle) {
      return { success: false, error: "Invalid invite code" };
    }

    // 2. Check if circle is private
    if (targetCircle.type !== "private") {
      return { success: false, error: "This invite code is not valid" };
    }

    // 3. Check if already a member
    const membershipSnapshot = await get(getUserCircleRef(uid, targetCircleId));

    if (membershipSnapshot.exists()) {
      return { success: false, error: "You're already a member of this circle" };
    }

    // 4. Check max members (optional - private circles can have up to 6 members)
    if (targetCircle.memberIds && targetCircle.memberIds.length >= 6) {
      return { success: false, error: "This circle is full" };
    }

    // 5. Create habit or target based on circle mode
    let membership: UserCircleMembership;

    if (targetCircle.mode === "habit") {
      const habitTemplate = targetCircle.publicHabitTemplate;
      if (!habitTemplate) {
        return { success: false, error: "Invalid circle configuration" };
      }

      const habitId = generateId();
      const habit: Habit = {
        id: habitId,
        name: habitTemplate.name,
        icon: habitTemplate.icon,
        color: habitTemplate.color,
        frequency: habitTemplate.frequency,
        isActive: true,
        circleId: targetCircleId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Only include description if provided
      if (habitTemplate.description) {
        habit.description = habitTemplate.description;
      }
      // Only include targetDays if provided
      if (habitTemplate.targetDays) {
        habit.targetDays = habitTemplate.targetDays;
      }

      await set(ref(database, `users/${uid}/habits/${habitId}`), habit);

      membership = {
        circleId: targetCircleId,
        joinedAt: Date.now(),
        habitId,
      };
    } else {
      // Target mode
      const targetTemplate = targetCircle.publicTargetTemplate;
      if (!targetTemplate) {
        return { success: false, error: "Invalid circle configuration" };
      }

      const targetId = generateId();
      const target: Target = {
        id: targetId,
        title: targetTemplate.title,
        icon: targetTemplate.icon,
        color: targetTemplate.color,
        windowType: targetTemplate.windowType,
        requiredCount: 1,
        isRecurring: targetTemplate.isRecurring,
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Only include optional fields if defined (Firebase doesn't allow undefined)
      if (targetTemplate.description) {
        target.description = targetTemplate.description;
      }
      if (targetTemplate.successCriteriaText) {
        target.successCriteriaText = targetTemplate.successCriteriaText;
      }
      if (targetTemplate.customDurationDays !== undefined) {
        target.customDurationDays = targetTemplate.customDurationDays;
      }

      await set(ref(database, `users/${uid}/targets/${targetId}`), target);

      // Create initial target instance
      const instanceId = generateId();
      const timezone = "UTC"; // Default timezone, could be enhanced to use user's timezone
      const windowKey = getCurrentWindowKey(target.windowType, timezone, target.customDurationDays);
      const { start: windowStart, end: windowEnd } = getCurrentWindowBounds(target.windowType, timezone, target.customDurationDays);

      const instance: TargetInstance = {
        id: instanceId,
        targetId,
        windowKey,
        windowStart,
        windowEnd,
        status: "ACTIVE",
        createdAt: Date.now(),
      };

      await set(ref(database, `users/${uid}/targetInstances/${instanceId}`), instance);

      membership = {
        circleId: targetCircleId,
        joinedAt: Date.now(),
        targetId,
      };
    }

    // 6. Create membership
    await set(getUserCircleRef(uid, targetCircleId), membership);

    // 7. Add user to circle's memberIds
    await update(getCircleRef(targetCircleId), {
      memberIds: [...(targetCircle.memberIds || []), uid],
    });

    // 8. Increment member count
    await incrementCircleMemberCount(targetCircleId);

    return {
      success: true,
      circleId: targetCircleId,
      habitId: membership.habitId,
      targetId: membership.targetId,
    };
  } catch (error) {
    console.error("Error joining by invite code:", error);
    return { success: false, error: "Failed to join circle. Please try again." };
  }
}

/**
 * Get circles root reference
 */
export function getCirclesRef() {
  return ref(database, "circles");
}

/**
 * Get single circle reference
 */
export function getCircleRef(circleId: string) {
  return ref(database, `circles/${circleId}`);
}

/**
 * Join a circle (for open circles)
 * This is an alias for joinCircleById to maintain API compatibility
 */
export async function joinCircle(
  uid: string,
  circleId: string
): Promise<{ success: boolean; habitId?: string; error?: string }> {
  return joinCircleById(uid, circleId);
}

/**
 * Regenerate invite code for a private circle
 * Only the creator can do this
 */
export async function regenerateInviteCode(
  uid: string,
  circleId: string
): Promise<{ success: boolean; newInviteCode?: string; error?: string }> {
  try {
    // 1. Verify user is the creator
    const circleSnapshot = await get(getCircleRef(circleId));

    if (!circleSnapshot.exists()) {
      return { success: false, error: "Circle not found" };
    }

    const circle = circleSnapshot.val() as Circle;

    if (circle.createdBy !== uid) {
      return { success: false, error: "Only the creator can regenerate invite codes" };
    }

    if (circle.type !== "private") {
      return { success: false, error: "Only private circles have invite codes" };
    }

    // 2. Generate new invite code
    const newInviteCode = generateInviteCode();

    // 3. Update circle
    await update(getCircleRef(circleId), {
      inviteCode: newInviteCode,
    });

    // 4. Store new invite code record
    await set(ref(database, `circles/${circleId}/inviteCodes/${newInviteCode}`), {
      createdBy: uid,
      createdAt: Date.now(),
      maxUses: null,
    });

    return {
      success: true,
      newInviteCode,
    };
  } catch (error) {
    console.error("Error regenerating invite code:", error);
    return { success: false, error: "Failed to regenerate invite code" };
  }
}

/**
 * Get circle daily stats reference
 */
export function getCircleDailyStatsRef(circleId: string, date: string) {
  return ref(database, `circles/${circleId}/daily/${date}`);
}

/**
 * Update a circle (only by creator)
 */
export async function updateCircle(
  uid: string,
  circleId: string,
  updates: {
    name?: string;
    description?: string;
    circleIcon?: string;
    circleColor?: string;
    habitName?: string;
    habitDescription?: string;
    habitIcon?: string;
    habitColor?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Verify user is the creator
    const circleSnapshot = await get(getCircleRef(circleId));

    if (!circleSnapshot.exists()) {
      return { success: false, error: "Circle not found" };
    }

    const circle = circleSnapshot.val() as Circle;

    if (circle.createdBy !== uid) {
      return { success: false, error: "Only the creator can edit the circle" };
    }

    // 2. Prepare update data with conditional property assignment
    const updateData: any = {};

    // Circle fields
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.circleIcon !== undefined) {
      updateData.circleIcon = updates.circleIcon;
    }
    if (updates.circleColor !== undefined) {
      updateData.circleColor = updates.circleColor;
    }

    // Habit template fields
    if (
      updates.habitName !== undefined ||
      updates.habitDescription !== undefined ||
      updates.habitIcon !== undefined ||
      updates.habitColor !== undefined
    ) {
      updateData.publicHabitTemplate = {
        ...circle.publicHabitTemplate,
      };

      if (updates.habitName !== undefined) {
        updateData.publicHabitTemplate.name = updates.habitName;
      }
      if (updates.habitDescription !== undefined) {
        if (updates.habitDescription) {
          updateData.publicHabitTemplate.description = updates.habitDescription;
        } else {
          delete updateData.publicHabitTemplate.description;
        }
      }
      if (updates.habitIcon !== undefined) {
        updateData.publicHabitTemplate.icon = updates.habitIcon;
      }
      if (updates.habitColor !== undefined) {
        updateData.publicHabitTemplate.color = updates.habitColor;
      }
    }

    // 3. Update the circle
    await update(getCircleRef(circleId), updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating circle:", error);
    return { success: false, error: "Failed to update circle" };
  }
}

/**
 * Delete a circle (only by creator)
 */
export async function deleteCircle(
  uid: string,
  circleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Verify user is the creator
    const circleSnapshot = await get(getCircleRef(circleId));

    if (!circleSnapshot.exists()) {
      return { success: false, error: "Circle not found" };
    }

    const circle = circleSnapshot.val() as Circle;

    if (circle.createdBy !== uid) {
      return { success: false, error: "Only the creator can delete the circle" };
    }

    // 2. Delete the circle
    await remove(getCircleRef(circleId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting circle:", error);
    return { success: false, error: "Failed to delete circle" };
  }
}

/**
 * Get user's circle memberships reference
 */
export function getUserCirclesRef(uid: string) {
  return ref(database, `users/${uid}/circles`);
}

/**
 * Get single user circle membership reference
 */
export function getUserCircleRef(uid: string, circleId: string) {
  return ref(database, `users/${uid}/circles/${circleId}`);
}

/**
 * Get all circles
 */
export async function getAllCircles(): Promise<Circle[]> {
  const snapshot = await get(getCirclesRef());
  const data = snapshot.val();

  if (!data) return [];

  return Object.entries(data).map(([id, circle]: [string, any]) => ({
    ...circle,
    id,
  }));
}

/**
 * Get single circle by ID
 */
export async function getCircle(circleId: string): Promise<Circle | null> {
  const snapshot = await get(getCircleRef(circleId));
  const data = snapshot.val();

  if (!data) return null;

  return {
    ...data,
    id: circleId,
  };
}

/**
 * Get user's circle memberships
 */
export async function getUserCircleMemberships(uid: string): Promise<UserCircleMembership[]> {
  const snapshot = await get(getUserCirclesRef(uid));
  const data = snapshot.val();

  if (!data) return [];

  return Object.entries(data).map(([circleId, membership]: [string, any]) => ({
    circleId,
    ...membership,
  }));
}

/**
 * Listen to all circles
 */
export function listenToCircles(callback: (circles: Record<string, Circle> | null) => void): () => void {
  return onValue(getCirclesRef(), (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Listen to user's circle memberships
 */
export function listenToUserCircles(
  uid: string,
  callback: (memberships: Record<string, UserCircleMembership> | null) => void
): () => void {
  return onValue(getUserCirclesRef(uid), (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Listen to circle daily stats (for aggregate completion count)
 */
export function listenToCircleDailyStats(
  circleId: string,
  date: string,
  callback: (stats: CircleDailyStats | null) => void
): () => void {
  return onValue(getCircleDailyStatsRef(circleId, date), (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Increment circle member count (transaction)
 */
export async function incrementCircleMemberCount(circleId: string): Promise<void> {
  const memberCountRef = ref(database, `circles/${circleId}/memberCount`);

  await runTransaction(memberCountRef, (currentCount) => {
    return (currentCount || 0) + 1;
  });
}

/**
 * Decrement circle member count (transaction)
 */
export async function decrementCircleMemberCount(circleId: string): Promise<void> {
  const memberCountRef = ref(database, `circles/${circleId}/memberCount`);

  await runTransaction(memberCountRef, (currentCount) => {
    return Math.max(0, (currentCount || 0) - 1);
  });
}

/**
 * Increment circle daily completion count (transaction)
 */
export async function incrementCircleCompletionCount(
  circleId: string,
  date: string
): Promise<void> {
  const statsRef = getCircleDailyStatsRef(circleId, date);

  await runTransaction(statsRef, (currentData) => {
    if (!currentData) {
      return {
        date,
        completedCount: 1,
        lastUpdated: Date.now(),
      };
    }

    return {
      ...currentData,
      completedCount: (currentData.completedCount || 0) + 1,
      lastUpdated: Date.now(),
    };
  });
}

/**
 * Convert circles object to array
 */
export function circlesToArray(circlesObj: Record<string, Circle> | null): Circle[] {
  if (!circlesObj) return [];
  return Object.entries(circlesObj).map(([id, circle]) => ({
    ...circle,
    id,
  }));
}

/**
 * Convert memberships object to array
 */
export function membershipsToArray(
  membershipsObj: Record<string, UserCircleMembership> | null
): UserCircleMembership[] {
  if (!membershipsObj) return [];
  return Object.entries(membershipsObj).map(([circleId, membership]) => ({
    ...membership,
    circleId,
  }));
}

/**
 * Get circle members with their profiles and completion status
 */
export async function getCircleMembers(
  circleId: string,
  date: string
): Promise<any[]> {
  try {
    const circleSnapshot = await get(getCircleRef(circleId));
    if (!circleSnapshot.exists()) return [];

    const circle = circleSnapshot.val() as Circle;
    const members: any[] = [];

    // For backward compatibility, default to "habit" mode if not set
    const circleMode = circle.mode || "habit";

    // For private circles, get members from memberIds
    if (circle.type === "private" && circle.memberIds) {
      for (const memberUid of circle.memberIds) {
        try {
          // Get user profile
          const profileSnapshot = await get(ref(database, `users/${memberUid}/profile`));
          const profile = profileSnapshot.exists() ? profileSnapshot.val() : null;

          // Get user's circle membership
          const membershipSnapshot = await get(getUserCircleRef(memberUid, circleId));
          if (!membershipSnapshot.exists()) continue;

          const membership = membershipSnapshot.val() as UserCircleMembership;

          // Handle based on circle mode
          if (circleMode === "habit" && membership.habitId) {
            const habitId = membership.habitId;

            // Get today's check-in status
            const checkinSnapshot = await get(ref(database, `users/${memberUid}/checkins/${date}/${habitId}`));
            const checkinValue = checkinSnapshot.exists() ? checkinSnapshot.val() : null;
            const completedToday = checkinValue === true || (checkinValue?.checked === true);

            members.push({
              uid: memberUid,
              profile,
              habitId,
              completedToday,
            });
          } else if (circleMode === "target" && membership.targetId) {
            const targetId = membership.targetId;

            // Get all target instances for this user's target
            const instancesSnapshot = await get(ref(database, `users/${memberUid}/targetInstances`));
            let completedThisWindow = false;
            let currentInstance: TargetInstance | undefined;

            if (instancesSnapshot.exists()) {
              const instances = instancesSnapshot.val();
              const now = Date.now();

              // Find instance for this target in current window
              for (const [instanceId, instanceData] of Object.entries(instances)) {
                const instance = instanceData as TargetInstance;
                if (instance.targetId === targetId) {
                  // Check if window is still valid
                  if (now >= instance.windowStart && now <= instance.windowEnd) {
                    currentInstance = instance;
                    // Check if completed
                    if (instance.status === "COMPLETED") {
                      completedThisWindow = true;
                    }
                    break; // Found the current window instance
                  }
                }
              }
            }

            members.push({
              uid: memberUid,
              profile,
              targetId,
              completedThisWindow,
              currentInstance,
            });
          }
        } catch (err) {
          console.error(`Error fetching member ${memberUid}:`, err);
        }
      }
    }

    return members;
  } catch (error) {
    console.error("Error getting circle members:", error);
    return [];
  }
}

/**
 * Send encouragement emoji to a member
 * Users can only send 1 emoji per emoji type per day to each recipient
 */
export async function sendEncouragement(
  fromUserId: string,
  toUserId: string,
  circleId: string,
  emoji: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user has already sent this emoji to this recipient today
    const encouragementsRef = getCircleEncouragementsRef(circleId);
    const encouragementsSnapshot = await get(encouragementsRef);

    if (encouragementsSnapshot.exists()) {
      const encouragements = encouragementsSnapshot.val();
      const today = Date.now();
      const oneDayAgo = today - 24 * 60 * 60 * 1000;

      // Check if user already sent this specific emoji to this recipient today
      const alreadySent = Object.values(encouragements).some(
        (enc: any) =>
          enc.fromUserId === fromUserId &&
          enc.toUserId === toUserId &&
          enc.emoji === emoji &&
          enc.createdAt > oneDayAgo
      );

      if (alreadySent) {
        return { success: false, error: "You already sent this emoji today" };
      }
    }

    const encouragementId = `${fromUserId}_${toUserId}_${emoji}_${Date.now()}`;
    const encouragementRef = ref(database, `circles/${circleId}/encouragements/${encouragementId}`);

    const encouragement: any = {
      id: encouragementId,
      circleId,
      fromUserId,
      toUserId,
      emoji,
      createdAt: Date.now(),
    };

    await set(encouragementRef, encouragement);

    // Auto-delete after 24 hours
    setTimeout(async () => {
      try {
        await remove(encouragementRef);
      } catch (err) {
        // Ignore deletion errors
      }
    }, 24 * 60 * 60 * 1000);

    return { success: true };
  } catch (error) {
    console.error("Error sending encouragement:", error);
    return { success: false, error: "Failed to send encouragement" };
  }
}

/**
 * Get emojis that a user has sent to a recipient today
 */
export function getEmojisSentToUserToday(
  encouragements: Record<string, any> | null,
  fromUserId: string,
  toUserId: string
): string[] {
  if (!encouragements) return [];

  const today = Date.now();
  const oneDayAgo = today - 24 * 60 * 60 * 1000;

  const sentEmojis: string[] = [];
  for (const enc of Object.values(encouragements)) {
    const encouragement = enc as any;
    if (
      encouragement.fromUserId === fromUserId &&
      encouragement.toUserId === toUserId &&
      encouragement.createdAt > oneDayAgo
    ) {
      sentEmojis.push(encouragement.emoji);
    }
  }

  return sentEmojis;
}

/**
 * Get encouragements reference for a circle
 */
export function getCircleEncouragementsRef(circleId: string) {
  return ref(database, `circles/${circleId}/encouragements`);
}

/**
 * Listen to encouragements for a circle
 */
export function listenToCircleEncouragements(
  circleId: string,
  callback: (encouragements: any) => void
): () => void {
  return onValue(getCircleEncouragementsRef(circleId), (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Get encouragements received by a user today
 */
export function getTodaysEncouragements(
  encouragements: Record<string, any> | null,
  userId: string
): any[] {
  if (!encouragements) return [];

  const today = Date.now();
  const oneDayAgo = today - 24 * 60 * 60 * 1000;

  return Object.values(encouragements).filter(
    (enc: any) => enc.toUserId === userId && enc.createdAt > oneDayAgo
  );
}
