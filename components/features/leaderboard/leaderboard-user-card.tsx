"use client";

import { motion } from "framer-motion";
import { Trophy, UserMinus, UserPlus } from "lucide-react";
import type { LeaderboardUser } from "@/types";

interface LeaderboardUserCardProps {
  user: LeaderboardUser;
  rank: number;
  isFollowing: boolean;
  isCurrentUser: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  isLoading?: boolean;
}

export function LeaderboardUserCard({
  user,
  rank,
  isFollowing,
  isCurrentUser,
  onFollow,
  onUnfollow,
  isLoading = false,
}: LeaderboardUserCardProps) {
  // Rank color
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className={`w-5 h-5 ${getRankColor(rank)}`} />;
    return <span className={`text-sm font-bold ${getRankColor(rank)}`}>#{rank}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: rank * 0.02 }}
      className={`surface p-4 ${
        rank === 1 ? "ring-2 ring-yellow-500/30" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-12 flex-shrink-0 flex items-center justify-center">
          {getRankIcon(rank)}
        </div>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.profile.photoURL ? (
            <img
              src={user.profile.photoURL}
              alt={user.profile.displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-border)]"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ff9533] flex items-center justify-center text-white font-semibold text-lg">
              {user.profile.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          {isCurrentUser && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-brand)] border-2 border-[var(--color-card)]" />
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">
              {user.profile.displayName}
              {isCurrentUser && (
                <span className="text-xs text-muted-foreground ml-1">(You)</span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-[#ff6a00]" />
              {user.bestStreak} day streak
            </span>
            <span className="flex items-center gap-1">
              🔥 {user.totalStreak} total
            </span>
          </div>
        </div>

        {/* Follow Button */}
        {!isCurrentUser && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={isFollowing ? onUnfollow : onFollow}
            disabled={isLoading}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isFollowing
                ? "bg-[var(--color-muted)] text-muted-foreground hover:bg-[var(--color-muted)]/80"
                : "bg-[var(--color-brand)] text-white hover:opacity-90"
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isFollowing ? "Unfollowing..." : "Following..."}
              </span>
            ) : isFollowing ? (
              <span className="flex items-center gap-2">
                <UserMinus className="w-4 h-4" />
                Unfollow
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Follow
              </span>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
