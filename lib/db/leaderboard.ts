import { get, update, ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase/client";
import type { LeaderboardUser, Follows, UserProfile, HabitStats } from "@/types";

/**
 * Get reference to follows collection
 */
function getFollowsRef(uid: string) {
  return ref(database, `users/${uid}/follows`);
}

/**
 * Get reference to user profile
 */
function getUserProfileRef(uid: string) {
  return ref(database, `users/${uid}/profile`);
}

/**
 * Get reference to user stats
 */
function getUserStatsRef(uid: string) {
  return ref(database, `users/${uid}/stats`);
}

/**
 * Get public leaderboard data from actual user data
 * Fetches all users and calculates their stats from check-ins
 */
export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  const usersRef = ref(database, "users");
  const snapshot = await get(usersRef);

  if (!snapshot.exists()) {
    return [];
  }

  const usersData = snapshot.val();
  const leaderboardUsers: LeaderboardUser[] = [];

  // Process each user
  const uids = Object.keys(usersData);
  for (let i = 0; i < uids.length; i++) {
    const uid = uids[i];
    const userData = (usersData as any)[uid];

    // Get profile data
    const profile = userData.profile;
    if (!profile) continue;

    // Calculate stats from check-ins (not stats field which may not exist)
    const checkins = userData.checkins || {};
    const habits = userData.habits || {};
    let totalCheckins = 0;
    let uniqueCheckinDays = 0;

    // Count all check-ins and unique days
    const dates = Object.keys(checkins);
    for (let j = 0; j < dates.length; j++) {
      const date = dates[j];
      const dayCheckins = checkins[date];

      // Count each habit check-in for this day
      const habitIds = Object.keys(dayCheckins);
      for (let k = 0; k < habitIds.length; k++) {
        const value = dayCheckins[habitIds[k]];
        let checked = false;

        // Handle both boolean and object formats
        if (typeof value === "object" && value !== null) {
          checked = value.checked === true;
        } else {
          checked = value === true;
        }

        if (checked) {
          totalCheckins++;
        }
      }

      // Count this day if there are any check-ins
      if (habitIds.length > 0) {
        uniqueCheckinDays++;
      }
    }

    // Calculate best streak (consecutive days with check-ins)
    let bestStreak = 0;
    let currentStreak = 0;

    if (dates.length > 0) {
      // Sort dates
      const sortedDates = dates.sort();

      // Calculate streaks
      for (let j = 0; j < sortedDates.length; j++) {
        const date = sortedDates[j];
        const dayCheckins = checkins[date];

        // Check if any habit was checked on this day
        let hasChecked = false;
        const habitIds = Object.keys(dayCheckins);
        for (let k = 0; k < habitIds.length; k++) {
          const value = dayCheckins[habitIds[k]];
          if (typeof value === "object" && value !== null) {
            if (value.checked === true) hasChecked = true;
          } else if (value === true) {
            hasChecked = true;
          }
        }

        if (hasChecked) {
          currentStreak++;
          if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
          }
        } else {
          currentStreak = 0;
        }
      }
    }

    // Only include users who have some activity
    if (totalCheckins > 0) {
      leaderboardUsers.push({
        uid,
        profile: {
          displayName: profile.displayName || "Anonymous",
          photoURL: profile.photoURL || null,
          email: "", // Not exposed publicly
          timezone: profile.timezone || "UTC",
          createdAt: profile.createdAt || 0,
          lastLoginAt: profile.lastLoginAt || 0,
        },
        totalStreak: totalCheckins, // Total check-ins
        bestStreak: bestStreak, // Best streak (consecutive days)
      });
    }
  }

  // Sort by total streak descending
  leaderboardUsers.sort((a, b) => b.totalStreak - a.totalStreak);

  return leaderboardUsers;
}

/**
 * Search leaderboard users by display name
 */
export async function searchLeaderboard(query: string): Promise<LeaderboardUser[]> {
  if (!query.trim()) {
    return [];
  }

  const allUsers = await getLeaderboard();
  const lowerQuery = query.toLowerCase();

  return allUsers.filter((user) =>
    user.profile.displayName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get user's follows
 */
export async function getUserFollows(uid: string): Promise<Follows> {
  const snapshot = await get(getFollowsRef(uid));

  if (!snapshot.exists()) {
    return { following: {}, followers: {} };
  }

  return snapshot.val();
}

/**
 * Follow a user
 */
export async function followUser(followerUid: string, followeeUid: string): Promise<void> {
  const now = Date.now();

  // Add to follower's following list
  await update(ref(database, `users/${followerUid}/follows/following`), {
    [followeeUid]: now,
  });

  // Add to followee's followers list
  await update(ref(database, `users/${followeeUid}/follows/followers`), {
    [followerUid]: now,
  });
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerUid: string, followeeUid: string): Promise<void> {
  // Remove from follower's following list
  await update(ref(database, `users/${followerUid}/follows/following`), {
    [followeeUid]: null,
  });

  // Remove from followee's followers list
  await update(ref(database, `users/${followeeUid}/follows/followers`), {
    [followerUid]: null,
  });
}

/**
 * Listen to user's follows
 */
export function listenToFollows(
  uid: string,
  callback: (follows: Follows | null) => void
): () => void {
  return onValue(getFollowsRef(uid), (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Check if current user is following another user
 */
export function isFollowing(follows: Follows | null, targetUid: string): boolean {
  return follows?.following[targetUid] !== undefined;
}

