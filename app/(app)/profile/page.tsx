"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Users, Flame, Target, Trophy, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/use-user-store";
import { useTargetsStore } from "@/store/use-targets.store";
import { useTranslation } from "@/hooks/use-translation";
import { listenToUserCircles, listenToCircles } from "@/lib/db/circles";
import { circlesToArray } from "@/lib/db/circles";
import { listenToAllCheckins, listenToHabits } from "@/lib/db";
import { habitsToArray } from "@/lib/db/habits";
import { calculateCurrentStreak } from "@/lib/utils/streak";
import type { Circle, Checkins, Habit } from "@/types";
import { ProfileCircles } from "@/components/features/profile/profile-circles";
import { ProfileHabits } from "@/components/features/profile/profile-habits";
import { ProfileTargets } from "@/components/features/profile/profile-targets";

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, habits, setHabits } = useUserStore();
  const { targets, instances, setTargets, setInstances } = useTargetsStore();
  const { t } = useTranslation();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkins, setCheckins] = useState<Checkins>({});
  const [localHabits, setLocalHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!user) return;

    // Load user's circle memberships first
    const unsubscribeMemberships = listenToUserCircles(user.uid, (memberships) => {
      if (!memberships) {
        setCircles([]);
        setIsLoading(false);
        return;
      }

      // Get circle IDs from memberships
      const circleIds = Object.values(memberships).map((m) => m.circleId);

      // Now listen to all circles and filter for user's circles
      const unsubscribeCircles = listenToCircles((circlesObj) => {
        if (!circlesObj) {
          setCircles([]);
          setIsLoading(false);
          return;
        }

        const userCircles = circlesToArray(circlesObj).filter((circle) =>
          circleIds.includes(circle.id)
        );
        setCircles(userCircles);
        setIsLoading(false);
      });

      return () => {
        if (unsubscribeCircles) unsubscribeCircles();
      };
    });

    // Load targets
    const { listenToTargets, listenToTargetInstances } = require("@/lib/db");
    const { targetsToArray, targetInstancesToArray } = require("@/lib/db/targets");

    const unsubscribeTargets = listenToTargets(user.uid, (targetsObj: any) => {
      setTargets(targetsToArray(targetsObj));
    });

    const unsubscribeInstances = listenToTargetInstances(user.uid, (instancesObj: any) => {
      setInstances(targetInstancesToArray(instancesObj));
    });

    // Load habits explicitly
    const unsubscribeHabits = listenToHabits(user.uid, (habitsObj: any) => {
      const loadedHabits = habitsToArray(habitsObj);
      setLocalHabits(loadedHabits);
      setHabits(loadedHabits);
    });

    // Load checkins
    const unsubscribeCheckins = listenToAllCheckins(user.uid, (checkinsData) => {
      setCheckins(checkinsData || {});
    });

    return () => {
      if (unsubscribeMemberships) unsubscribeMemberships();
      if (unsubscribeTargets) unsubscribeTargets();
      if (unsubscribeInstances) unsubscribeInstances();
      if (unsubscribeHabits) unsubscribeHabits();
      if (unsubscribeCheckins) unsubscribeCheckins();
    };
  }, [user, setTargets, setInstances, setHabits]);

  const handleBack = () => {
    router.back();
  };

  const timezone = userProfile?.timezone || "UTC";

  // Use localHabits if available (loaded in this component), otherwise fall back to store habits
  const habitsToUse = localHabits.length > 0 ? localHabits : habits;

  // Calculate stats for top habits (sort by streak) - using same approach as stats page
  const topHabits = habitsToUse.length > 0
    ? [...habitsToUse]
        .filter((h) => h.isActive)
        .map((habit) => ({
          habit,
          streak: calculateCurrentStreak(checkins, habit.id, timezone),
        }))
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 3)
        .map((item) => item.habit)
    : [];

  // Calculate user stats
  const activeHabitsCount = habitsToUse.filter((h) => h.isActive).length;

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-transparent to-[var(--color-muted)]/30">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 sticky top-0 z-10 bg-[var(--color-background)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="icon-btn"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            
            <h1 className="text-xl font-semibold">{t("profile.title")}</h1>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="px-4 py-4">
        <div className="surface p-5 rounded-3xl relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[var(--color-brand)]/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName || "User"}
                    className="w-20 h-20 rounded-full object-cover border-3 border-[var(--color-brand)] shadow-lg shadow-[var(--color-brand)]/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-brand)] via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[var(--color-brand)]/30 border-3 border-white/20">
                    {userProfile?.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {userProfile?.displayName}
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </h2>
                <span className="text-sm text-muted-foreground">{userProfile?.email}</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[var(--color-muted)]/50 p-3 rounded-2xl text-center hover:bg-[var(--color-muted)] transition-colors">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-4 h-4 text-[#ff6a00]" />
                  <p className="text-lg font-bold text-[#ff6a00]">{activeHabitsCount}</p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("profile.activeHabits")}</p>
              </div>
              <div className="bg-[var(--color-muted)]/50 p-3 rounded-2xl text-center hover:bg-[var(--color-muted)] transition-colors">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-[var(--color-brand)]" />
                  <p className="text-lg font-bold text-[var(--color-brand)]">{circles.length}</p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("profile.circles")}</p>
              </div>
              <div className="bg-[var(--color-muted)]/50 p-3 rounded-2xl text-center hover:bg-[var(--color-muted)] transition-colors">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-4 h-4 text-purple-500" />
                  <p className="text-lg font-bold text-purple-500">{targets.filter((t) => !t.isArchived).length}</p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("profile.targets")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Circles Section */}
      <div className="px-4 py-3">
        <ProfileCircles circles={circles} isLoading={isLoading} />
      </div>

      {/* Top Habits Section */}
      <div className="px-4 py-3">
        <ProfileHabits habits={topHabits} checkins={checkins} timezone={timezone} />
      </div>

      {/* Targets Summary Section */}
      <div className="px-4 py-3">
        <ProfileTargets targets={targets} instances={instances} />
      </div>
    </div>
  );
}
