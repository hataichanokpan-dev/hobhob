"use client";

import { Search, Trophy } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface LeaderboardSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function LeaderboardSearch({
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
}: LeaderboardSearchProps) {
  const { t, tp } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("leaderboard.searchPlaceholder")}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-muted)] border-0 focus:ring-2 focus:ring-[var(--color-brand)] transition-all"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Trophy className="w-4 h-4" />
        <span>
          {searchQuery
            ? tp("leaderboard.resultsCount", { count: filteredCount })
            : tp("leaderboard.totalCount", { count: totalCount })}
        </span>
      </div>
    </div>
  );
}
