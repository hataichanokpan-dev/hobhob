"use client";

import { motion } from "framer-motion";
import { Trophy, UserMinus, UserPlus, Medal, Award } from "lucide-react";
import type { LeaderboardUser } from "@/types";
import { useState } from "react";

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
  const [imageError, setImageError] = useState(false);

  // Safely get display name
  const displayName = user.profile?.displayName || "Anonymous";
  const photoURL = user.profile?.photoURL;

  // Rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Trophy className="w-5 h-5 text-yellow-100" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-400/30 blur-lg"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
          <Medal className="w-5 h-5 text-gray-100" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
          <Award className="w-5 h-5 text-amber-100" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
        <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.02 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`surface p-4 rounded-2xl border transition-all duration-200 ${
        rank === 1
          ? "border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-transparent shadow-lg shadow-yellow-500/10"
          : rank === 2
          ? "border-gray-400/20 bg-gradient-to-r from-gray-400/5 to-transparent"
          : rank === 3
          ? "border-amber-600/20 bg-gradient-to-r from-amber-600/5 to-transparent"
          : "border-[var(--color-border)]"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          {getRankBadge(rank)}
        </div>

        {/* Avatar */}
        <motion.div
          className="relative flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {photoURL && !imageError ? (
            <img
              src={photoURL}
              alt={displayName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-border)] shadow-md"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ff9533] flex items-center justify-center text-white font-semibold text-xl shadow-md">
              {displayName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          {isCurrentUser && (
            <motion.div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-brand)] border-3 border-[var(--color-card)] shadow-md"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-base">{displayName}</h3>
            {isCurrentUser && (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-[var(--color-brand)]/20 text-[var(--color-brand)] rounded-full">
                You
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-orange-500" />
              <span className="font-medium text-orange-400">{user.totalStreak}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium text-purple-400">{user.bestStreak}</span>
              <span>streak</span>
            </span>
          </div>
        </div>

        {/* Follow Button */}
        {!isCurrentUser && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={isFollowing ? onUnfollow : onFollow}
            disabled={isLoading}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
              isFollowing
                ? "bg-[var(--color-muted)]/80 text-muted-foreground hover:bg-[var(--color-muted)] border border-[var(--color-border)]"
                : "bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand)]/80 text-white hover:shadow-lg hover:shadow-[var(--color-brand)]/30"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : isFollowing ? (
              <UserMinus className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
