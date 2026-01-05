import { useEffect, useState } from "react";
import { listenToAllStats } from "@/lib/db/stats";
import { listenToAllCheckins } from "@/lib/db";
import type { Checkins } from "@/types";

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCheckins: number;
  lastUpdated: number;
}

export interface StatsData {
  stats: Record<string, HabitStats>;
  checkins: Checkins;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to load stats and checkins data from Firebase
 * Used by the stats page to display habit statistics and charts
 */
export function useStatsData(uid: string | null | undefined): StatsData {
  const [stats, setStats] = useState<Record<string, HabitStats>>({});
  const [checkins, setCheckins] = useState<Checkins>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let statsLoaded = false;
    let checkinsLoaded = false;

    // Load stats data
    const unsubscribeStats = listenToAllStats(uid, (statsData) => {
      if (statsData) {
        setStats(statsData);
      } else {
        setStats({});
      }
      statsLoaded = true;
      if (checkinsLoaded) setIsLoading(false);
    });

    // Load checkins data
    const unsubscribeCheckins = listenToAllCheckins(uid, (checkinsData) => {
      if (checkinsData) {
        setCheckins(checkinsData);
      } else {
        setCheckins({});
      }
      checkinsLoaded = true;
      if (statsLoaded) setIsLoading(false);
    });

    // Cleanup function
    return () => {
      unsubscribeStats();
      unsubscribeCheckins();
    };
  }, [uid]);

  return {
    stats,
    checkins,
    isLoading,
    error,
  };
}
