import { database } from "@/lib/firebase/client";
import { ref, set, get, update, remove, onValue, runTransaction } from "firebase/database";
import type { Circle, CircleDailyStats, UserCircleMembership, Habit } from "@/types";

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
    // Habit fields
    habitName: string;
    habitDescription?: string;
    habitIcon: string;
    habitColor: string;
    habitFrequency: "daily" | "weekly" | "monthly";
    habitTargetDays?: number[];
  }
): Promise<{ success: boolean; circleId?: string; habitId?: string; inviteCode?: string; error?: string }> {
  try {
    const circleId = generateId();
    const habitId = generateId();
    const inviteCode = input.type === "private" ? generateInviteCode() : undefined;

    // 1. Create the circle
    const circle: Circle = {
      id: circleId,
      name: input.circleName,
      circleIcon: input.circleIcon,
      circleColor: input.circleColor,
      type: input.type,
      createdAt: Date.now(),
      createdBy: uid,
      memberCount: 1, // Creator counts as first member
      publicHabitTemplate: {
        name: input.habitName,
        icon: input.habitIcon,
        color: input.habitColor,
        frequency: input.habitFrequency,
      },
    };

    // Only include description if provided (like habits.ts pattern)
    if (input.habitDescription) {
      circle.publicHabitTemplate.description = input.habitDescription;
    }
    if (input.circleDescription) {
      circle.description = input.circleDescription;
    }
    // Only include targetDays if provided (for weekly/monthly habits)
    if (input.habitTargetDays) {
      circle.publicHabitTemplate.targetDays = input.habitTargetDays;
    }

    // Add invite code for private circles
    if (input.type === "private" && inviteCode) {
      circle.inviteCode = inviteCode;
      circle.memberIds = [uid]; // Initialize with creator
    }

    await set(getCircleRef(circleId), circle);

    // 2. Create the habit for the creator
    const habit: Habit = {
      id: habitId,
      name: input.habitName,
      icon: input.habitIcon,
      color: input.habitColor,
      frequency: input.habitFrequency,
      isActive: true,
      circleId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Only include description if provided
    if (input.habitDescription) {
      habit.description = input.habitDescription;
    }
    // Only include targetDays if provided
    if (input.habitTargetDays) {
      habit.targetDays = input.habitTargetDays;
    }

    const habitRef = ref(database, `users/${uid}/habits/${habitId}`);
    await set(habitRef, habit);

    // 3. Create membership record
    const membership: UserCircleMembership = {
      circleId,
      joinedAt: Date.now(),
      habitId,
    };

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
      habitId,
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
): Promise<{ success: boolean; habitId?: string; error?: string }> {
  try {
    // 1. Get circle data
    const circleSnapshot = await get(getCircleRef(circleId));

    if (!circleSnapshot.exists()) {
      return { success: false, error: "Circle not found" };
    }

    const circle = circleSnapshot.val() as Circle;

    // 2. Check if user is already a member
    const membershipSnapshot = await get(getUserCircleRef(uid, circleId));

    if (membershipSnapshot.exists()) {
      return { success: false, error: "You're already a member of this circle" };
    }

    // 3. Check if user already has a habit with the same name
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

    // 4. Create habit (or use existing)
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

      // Only include description if provided
      if (circle.publicHabitTemplate.description) {
        habit.description = circle.publicHabitTemplate.description;
      }
      // Only include targetDays if provided
      if (circle.publicHabitTemplate.targetDays) {
        habit.targetDays = circle.publicHabitTemplate.targetDays;
      }

      await set(ref(database, `users/${uid}/habits/${habitId}`), habit);
    }

    // 5. Create membership record
    const membership: UserCircleMembership = {
      circleId,
      joinedAt: Date.now(),
      habitId,
    };

    await set(getUserCircleRef(uid, circleId), membership);

    // 6. Increment member count
    await incrementCircleMemberCount(circleId);

    return { success: true, habitId };
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
): Promise<{ success: boolean; circleId?: string; habitId?: string; error?: string }> {
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

    // 5. Create habit
    const habitId = generateId();
    const habit: Habit = {
      id: habitId,
      name: targetCircle.publicHabitTemplate.name,
      icon: targetCircle.publicHabitTemplate.icon,
      color: targetCircle.publicHabitTemplate.color,
      frequency: targetCircle.publicHabitTemplate.frequency,
      isActive: true,
      circleId: targetCircleId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Only include description if provided
    if (targetCircle.publicHabitTemplate.description) {
      habit.description = targetCircle.publicHabitTemplate.description;
    }
    // Only include targetDays if provided
    if (targetCircle.publicHabitTemplate.targetDays) {
      habit.targetDays = targetCircle.publicHabitTemplate.targetDays;
    }

    await set(ref(database, `users/${uid}/habits/${habitId}`), habit);

    // 6. Create membership
    const membership: UserCircleMembership = {
      circleId: targetCircleId,
      joinedAt: Date.now(),
      habitId,
    };

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
      habitId,
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

    // For private circles, get members from memberIds
    if (circle.type === "private" && circle.memberIds) {
      for (const memberUid of circle.memberIds) {
        try {
          // Get user profile
          const profileSnapshot = await get(ref(database, `users/${memberUid}/profile`));
          const profile = profileSnapshot.exists() ? profileSnapshot.val() : null;

          // Get user's circle membership to find habitId
          const membershipSnapshot = await get(getUserCircleRef(memberUid, circleId));
          if (!membershipSnapshot.exists()) continue;

          const membership = membershipSnapshot.val() as UserCircleMembership;
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
