"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Calendar, Flame, Target, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  listenToHabits,
  listenToTargets,
  listenToTargetInstances,
} from "@/lib/db";
import { habitsToArray } from "@/lib/db/habits";
import {
  targetsToArray,
  targetInstancesToArray,
  getActiveTargetInstances,
  completeTargetInstance,
} from "@/lib/db/targets";
import { useTranslation } from "@/hooks/use-translation";
import {
  listenToDateCheckins,
  getHabitCheckinStatus,
  calculateCompletionRate,
  toggleHabitCheckin,
  getHabitCheckin,
} from "@/lib/db/checkins";
import {
  incrementCircleCompletionCount,
  listenToCircleDailyStats,
} from "@/lib/db/circles";
import { getTodayDateString, formatReadableDate } from "@/lib/utils/date";
import { filterHabitsForToday } from "@/lib/utils/habits";
import { useUserStore } from "@/store/use-user-store";
import { useTargetsStore } from "@/store/use-targets.store";
import { HabitCard } from "@/components/features/habits/habit-card";
import { HabitForm } from "@/components/features/habits/habit-form";
import { TargetCard } from "@/components/features/targets/target-card";
import { TargetDetail } from "@/components/features/targets/target-detail";
import { PWAInstallPrompt } from "@/components/features/pwa/pwa-install-prompt";
import { useFirstTime } from "@/hooks/use-first-time";
import type {
  DayCheckins,
  Target as TargetType,
  TargetInstance,
} from "@/types";

export default function TodayPage() {
  const router = useRouter();
  const { user, userProfile, habits, setHabits, setLoading } = useUserStore();
  const {
    targets,
    instances,
    activeInstances,
    setTargets,
    setInstances,
    setActiveInstances,
  } = useTargetsStore();
  const { t, tp } = useTranslation();
  const { hasSeenPrompt, isLoading: isFirstTimeLoading } = useFirstTime();
  const [checkins, setCheckins] = useState<DayCheckins | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [circleNotification, setCircleNotification] = useState<{
    message: string;
    habitId: string;
  } | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<{
    target: TargetType;
    instance: TargetInstance;
  } | null>(null);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  // Ref for targets section
  const targetsSectionRef = useRef<HTMLDivElement>(null);
  // Track when we just completed a target to prevent redundant refresh
  const lastCompletionTime = useRef<number>(0);

  // Get user's timezone or default to UTC
  const timezone = userProfile?.timezone || "UTC";

  // Scroll to targets section
  const scrollToTargets = useCallback(() => {
    targetsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const today = getTodayDateString(timezone);

  // Show PWA install prompt on first visit (after delay)
  useEffect(() => {
    if (isFirstTimeLoading || hasSeenPrompt || !user) return;

    // Show prompt after 3 seconds
    const timer = setTimeout(() => {
      setShowPWAInstall(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasSeenPrompt, isFirstTimeLoading, user]);

  // Load habits
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const unsubscribeHabits = listenToHabits(user.uid, (habitsObj) => {
      setHabits(habitsToArray(habitsObj));
      setLoading(false);
    });

    return () => unsubscribeHabits();
  }, [user, setHabits, setLoading]);

  // Load today's checkins
  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToDateCheckins(
      user.uid,
      today,
      (checkinsData) => {
        setCheckins(checkinsData);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, today]);

  // Load targets
  useEffect(() => {
    if (!user) return;

    const unsubscribeTargets = listenToTargets(user.uid, (targetsObj) => {
      setTargets(targetsToArray(targetsObj));
    });

    const unsubscribeInstances = listenToTargetInstances(
      user.uid,
      (instancesObj) => {
        setInstances(targetInstancesToArray(instancesObj));
      }
    );

    return () => {
      if (unsubscribeTargets) unsubscribeTargets();
      if (unsubscribeInstances) unsubscribeInstances();
    };
  }, [user, setTargets, setInstances]);

  // Generate active instances when targets or instances change
  useEffect(() => {
    if (!user || targets.length === 0) return;

    // Skip refresh if we just completed a target (within last 2 seconds)
    // This prevents redundant slow calls after completion
    const timeSinceCompletion = Date.now() - lastCompletionTime.current;
    if (timeSinceCompletion < 2000) {
      return;
    }

    const refreshInstances = async () => {
      try {
        const active = await getActiveTargetInstances(
          user.uid,
          targets,
          instances,
          timezone
        );
        setActiveInstances(active);
      } catch (error) {
        console.error("Failed to refresh active instances:", error);
      }
    };

    refreshInstances();
  }, [user, targets, instances, timezone, setActiveInstances]);

  // Handle check-in toggle with optimistic UI
  const handleToggle = useCallback(
    async (habitId: string, note?: string) => {
      if (!user) return;

      const currentValue = getHabitCheckin(checkins, habitId);
      const habit = habits.find((h) => h.id === habitId);
      const isCheckingIn = !currentValue.checked;

      // Optimistic update
      setCheckins((prev) => ({
        ...prev,
        [habitId]: isCheckingIn,
      }));

      setIsUpdating(habitId);

      try {
        await toggleHabitCheckin(
          user.uid,
          today,
          habitId,
          currentValue.checked,
          note
        );

        // If checking in a circle-linked habit, increment circle completion
        if (isCheckingIn && habit?.circleId) {
          await incrementCircleCompletionCount(habit.circleId, today);

          // Fetch the updated circle stats to get completion count
          const unsubscribe = listenToCircleDailyStats(
            habit.circleId,
            today,
            (stats) => {
              const completedCount = stats?.completedCount || 1; // At least 1 (the user)
              const peopleKey =
                completedCount === 1
                  ? "circleNotification.person"
                  : "circleNotification.people";
              setCircleNotification({
                message: tp("circleNotification.completedWithYou", {
                  count: completedCount,
                  people: t(peopleKey),
                }),
                habitId,
              });

              // Auto-hide notification after 3 seconds
              setTimeout(() => {
                setCircleNotification(null);
              }, 3000);
            }
          );

          // Clean up listener after 5 seconds
          setTimeout(() => unsubscribe(), 5000);
        }
      } catch (error) {
        // Rollback on error
        console.error("Failed to toggle check-in:", error);
        setCheckins((prev) => ({
          ...prev,
          [habitId]: currentValue.checked,
        }));
      } finally {
        setIsUpdating(null);
      }
    },
    [user, today, checkins, habits]
  );

  const handleHabitFormSuccess = () => {
    setShowHabitForm(false);
  };

  const handleHabitFormCancel = () => {
    setShowHabitForm(false);
  };

  // Handle target completion
  const handleTargetComplete = async (instanceId: string) => {
    if (!user) return;

    try {
      // Mark completion time to prevent redundant refresh
      lastCompletionTime.current = Date.now();

      await completeTargetInstance(user.uid, instanceId);
      // Remove the completed instance from activeInstances (immediate UI update)
      setActiveInstances(activeInstances.filter((i) => i.id !== instanceId));
    } catch (error) {
      console.error("Failed to complete target:", error);
    }
  };

  // Handle target card click (show detail)
  const handleTargetCardClick = (
    target: TargetType,
    instance: TargetInstance
  ) => {
    setSelectedTarget({ target, instance });
  };

  // Handle target detail close
  const handleTargetDetailClose = () => {
    setSelectedTarget(null);
  };

  // Filter active habits for today based on frequency settings
  const activeHabits = habits.filter((h) => h.isActive);
  const todaysHabits = filterHabitsForToday(activeHabits, timezone);
  const completedCount = todaysHabits.filter(
    (h) => getHabitCheckinStatus(checkins, h.id) === true
  ).length;
  const completionRate = calculateCompletionRate(checkins, todaysHabits.length);

  // Show habit form if active
  if (showHabitForm) {
    return (
      <div className="p-4">
        <HabitForm
          onSuccess={handleHabitFormSuccess}
          onCancel={handleHabitFormCancel}
        />
      </div>
    );
  }

  return (
    <>
      {/* Circle Completion Notification - Cute & Minimal */}
      {circleNotification && (
        <div className="fixed top-24 left-4 right-4 z-[60] max-w-sm mx-auto animate-slide-down">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-card)] shadow-lg border border-[var(--color-border)]">
            {/* Cute mini icon */}
            <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)]/10 flex items-center justify-center animate-scale-in">
              <span className="text-lg">✨</span>
            </div>

            {/* Message */}
            <p className="flex-1 text-sm font-medium leading-snug">
              {circleNotification.message}
            </p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Welcome Section - Professional & Minimal */}
        <div className="surface p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-[var(--color-brand)]" />
                <h1 className="text-2xl font-semibold">{t("today.title")}</h1>
                {/* Active Targets Pill - Minimal & Clickable */}
                {activeInstances.length > 0 && (
                  <button
                    onClick={scrollToTargets}
                    className="px-2 py-0.5 rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)] text-xs font-medium hover:bg-[var(--color-brand)]/20 transition-colors cursor-pointer"
                  >
                    🎯 {activeInstances.length}
                  </button>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {formatReadableDate(new Date(), timezone)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Circles Button
              <button
                onClick={() => router.push("/circles")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-colors"
                aria-label="View Circles"
              >
                <Users className="w-4 h-4 text-[var(--color-brand)]" />
                <span className="text-sm font-medium">Circles</span>
              </button>*/}

              {/* Completion Stats - Clean Design */}
              {todaysHabits.length > 0 && (
                <div className="text-right">
                  <div className="text-3xl font-semibold gradient-text">
                    {completionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tp("today.completedCount", {
                      completed: completedCount,
                      total: todaysHabits.length,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar - Bear.app style */}
          {todaysHabits.length > 0 && (
            <div className="mt-6">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick Stats Row - Professional */}
          {(todaysHabits.length > 0 || activeInstances.length > 0) && (
            <div className={`mt-6 grid gap-4 ${todaysHabits.length > 0 ? "grid-cols-3" : "grid-cols-1"}`}>
              {todaysHabits.length > 0 && (
                <>
                  <div className="text-center p-3 rounded-lg bg-[var(--color-muted)]">
                    <Target className="w-4 h-4 mx-auto mb-1 text-[var(--color-brand)]" />
                    <p className="text-2xl font-semibold">{todaysHabits.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      {t("today.stats.today")}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[var(--color-muted)]">
                    <Flame className="w-4 h-4 mx-auto mb-1 text-[#ff6a00]" />
                    <p className="text-2xl font-semibold">{completedCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      {t("today.stats.done")}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[var(--color-muted)]">
                    <Target className="w-4 h-4 mx-auto mb-1 text-[#33CC33]" />
                    <p className="text-2xl font-semibold">
                      {todaysHabits.length - completedCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      {t("today.stats.left")}
                    </p>
                  </div>
                </>
              )}
              {/* Active Targets Stats - Shows when no habits or as additional info */}
              {activeInstances.length > 0 && todaysHabits.length === 0 && (
                <div className="text-center p-3 rounded-lg bg-[var(--color-muted)]">
                  <Target className="w-4 h-4 mx-auto mb-1 text-[var(--color-brand)]" />
                  <p className="text-2xl font-semibold">{activeInstances.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {t("targets.title")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Message when no habits scheduled for today */}
          {activeHabits.length > 0 && todaysHabits.length === 0 && (
            <div className="mt-6 text-center p-4 rounded-lg bg-[var(--color-muted)]">
              <p className="text-sm text-muted-foreground">
                {t("today.noHabitsScheduled")}
              </p>
            </div>
          )}
        </div>

        {/* Habits List - Professional Card Style */}
        {activeHabits.length === 0 ? (
          <div className="empty-state surface p-8">
            <div className="empty-state-icon mx-auto">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("today.emptyState.title")}
            </h3>
            <p className="empty-state-text mb-6 max-w-sm mx-auto">
              {t("today.emptyState.description")}
            </p>
            <button
              onClick={() => setShowHabitForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("today.emptyState.button")}
            </button>
          </div>
        ) : todaysHabits.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-2">{t("nav.habits")}</h3>
            {todaysHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checked={getHabitCheckinStatus(checkins, habit.id) === true}
                streak={0} // TODO: Load from stats
                onToggle={handleToggle}
              />
            ))}
          </div>
        ) : null}

        {/* Targets Section */}
        {activeInstances.length > 0 && (
          <div ref={targetsSectionRef}>
            <hr className="my-4 mx-4" />
            <div className="surface p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  {t("targets.title")}
                </h2>
                <button
                  onClick={() => router.push("/targets")}
                  className="text-xs text-muted-foreground hover:text-[var(--color-brand)] transition-colors"
                >
                  {t("targets.viewAll")}
                </button>
              </div>
              <div className="space-y-3">
                {activeInstances.map((instance) => {
                  const target = targets.find(
                    (t) => t.id === instance.targetId
                  );
                  if (!target) return null;
                  return (
                    <TargetCard
                      key={instance.id}
                      target={target}
                      instance={instance}
                      timezone={timezone}
                      onComplete={handleTargetComplete}
                      onClick={() => handleTargetCardClick(target, instance)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button - Fixed Position
      {todaysHabits.length > 0 && (
        <button
          onClick={() => setShowHabitForm(true)}
          className="fixed bottom-28 right-4 w-14 h-14 rounded-full bg-[var(--color-brand)] text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30"
          style={{ boxShadow: "0 10px 22px rgba(255, 106, 0, 0.35)" }}
          aria-label="Add new habit"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}*/}

      {/* Target Detail Modal */}
      {selectedTarget && (
        <TargetDetail
          target={selectedTarget.target}
          instance={selectedTarget.instance}
          timezone={timezone}
          onClose={handleTargetDetailClose}
          onUpdate={() => {
            // Refresh active instances on update
            getActiveTargetInstances(
              user!.uid,
              targets,
              instances,
              timezone
            ).then(setActiveInstances);
          }}
        />
      )}

      {/* PWA Install Prompt */}
      {showPWAInstall && (
        <PWAInstallPrompt onClose={() => setShowPWAInstall(false)} />
      )}
    </>
  );
}
