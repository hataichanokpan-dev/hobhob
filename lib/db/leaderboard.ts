import { get, update, ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase/client";
import type { LeaderboardUser, Follows } from "@/types";

/**
 * Get reference to follows collection
 */
function getFollowsRef(uid: string) {
  return ref(database, `users/${uid}/follows`);
}

/**
 * Get public leaderboard data
 * NOTE: This requires a public leaderboard index in Firebase
 * For security, only expose public data (displayName, photoURL, streaks)
 */
export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  const leaderboardRef = ref(database, "leaderboard");
  const snapshot = await get(leaderboardRef);

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();
  return Object.entries(data).map(([uid, user]: [string, any]) => ({
    uid,
    profile: {
      displayName: user.displayName,
      photoURL: user.photoURL || null,
      email: "", // Not exposed publicly
      timezone: user.timezone || "UTC",
      createdAt: user.createdAt || 0,
      lastLoginAt: user.lastLoginAt || 0,
    },
    totalStreak: user.totalStreak || 0,
    bestStreak: user.bestStreak || 0,
  }));
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
