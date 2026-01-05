"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Users } from "lucide-react";
import { getLeaderboard } from "@/lib/db/leaderboard";
import { followUser, unfollowUser, listenToFollows, isFollowing } from "@/lib/db/leaderboard";
import { useUserStore } from "@/store/use-user-store";
import { useTranslation } from "@/hooks/use-translation";
import { LeaderboardSearch } from "@/components/features/leaderboard/leaderboard-search";
import { LeaderboardUserCard } from "@/components/features/leaderboard/leaderboard-user-card";
import type { LeaderboardUser } from "@/types";

export default function LeaderboardPage() {
  const { user } = useUserStore();
  const { t } = useTranslation();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [follows, setFollows] = useState<{ following: Record<string, number>; followers: Record<string, number> } | null>(null);
  const [followingAction, setFollowingAction] = useState<string | null>(null);

  // Load leaderboard
  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await getLeaderboard();
        // Sort by total streak and take top 100
        const sorted = data
          .sort((a, b) => b.totalStreak - a.totalStreak)
          .slice(0, 100);
        setUsers(sorted);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  // Load current user's follows
  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToFollows(user.uid, (followsData) => {
      setFollows(followsData);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase();
    return users.filter((u) =>
      u.profile.displayName.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Handle follow
  const handleFollow = useCallback(async (targetUid: string) => {
    if (!user) return;

    setFollowingAction(targetUid);
    try {
      await followUser(user.uid, targetUid);
    } catch (error) {
      console.error("Failed to follow user:", error);
    } finally {
      setFollowingAction(null);
    }
  }, [user]);

  // Handle unfollow
  const handleUnfollow = useCallback(async (targetUid: string) => {
    if (!user) return;

    setFollowingAction(targetUid);
    try {
      await unfollowUser(user.uid, targetUid);
    } catch (error) {
      console.error("Failed to unfollow user:", error);
    } finally {
      setFollowingAction(null);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl"
          >
            🏆
          </motion.div>
          <motion.p
            className="text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {t("common.loading")}
          </motion.p>
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--color-brand)]"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center gap-2 mb-2"
        >
          <Trophy className="w-6 h-6 text-[#ff6a00]" />
          <h1 className="text-2xl font-semibold">{t("leaderboard.title")}</h1>
        </motion.div>
        <p className="text-sm text-muted-foreground">
          {t("leaderboard.description")}
        </p>
      </div>

      {/* Search */}
      <LeaderboardSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={users.length}
        filteredCount={filteredUsers.length}
      />

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 surface">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? t("leaderboard.noResults") : t("leaderboard.empty")}
            </p>
          </div>
        ) : (
          filteredUsers.map((leaderboardUser, index) => {
            const rank = index + 1;
            const isCurrentUser = user?.uid === leaderboardUser.uid;
            const userIsFollowing = isFollowing(follows, leaderboardUser.uid);

            return (
              <LeaderboardUserCard
                key={leaderboardUser.uid}
                user={leaderboardUser}
                rank={rank}
                isFollowing={userIsFollowing}
                isCurrentUser={isCurrentUser}
                onFollow={() => handleFollow(leaderboardUser.uid)}
                onUnfollow={() => handleUnfollow(leaderboardUser.uid)}
                isLoading={followingAction === leaderboardUser.uid}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
