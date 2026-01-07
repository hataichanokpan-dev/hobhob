"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { listenToTargets, listenToTargetInstances } from "@/lib/db";
import {
  targetsToArray,
  targetInstancesToArray,
  getActiveTargetInstances,
  completeTargetInstance,
} from "@/lib/db/targets";
import { useTargetsStore } from "@/store/use-targets.store";
import { useUserStore } from "@/store/use-user-store";
import { TargetCard } from "@/components/features/targets/target-card";
import { TargetDetail } from "@/components/features/targets/target-detail";
import { TargetForm } from "@/components/features/targets/target-form";
import { useTranslation } from "@/hooks/use-translation";
import { getWindowLabel } from "@/lib/utils/date";
import type { Target, TargetInstance } from "@/types";

export default function TargetsPage() {
  const router = useRouter();
  const {
    targets,
    instances,
    activeInstances,
    setTargets,
    setInstances,
    setActiveInstances,
    setLoading,
  } = useTargetsStore();
  const { user, userProfile } = useUserStore();
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<{
    target: Target;
    instance: TargetInstance;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timezone = userProfile?.timezone || "UTC";

  // Load targets on mount
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const unsubscribeTargets = listenToTargets(user.uid, (targetsObj) => {
      setTargets(targetsToArray(targetsObj));
      setLoading(false);
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
  }, [user, setTargets, setInstances, setLoading]);

  // Generate active instances when targets or instances change
  useEffect(() => {
    if (!user || targets.length === 0) return;

    const refreshInstances = async () => {
      setIsRefreshing(true);
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
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshInstances();
  }, [user, targets, instances, timezone, setActiveInstances]);

  const handleBack = () => {
    router.back();
  };

  const handleComplete = async (instanceId: string) => {
    if (!user) return;

    try {
      await completeTargetInstance(user.uid, instanceId);
      // Remove the completed instance from activeInstances
      setActiveInstances(activeInstances.filter((i) => i.id !== instanceId));
    } catch (error) {
      console.error("Failed to complete target:", error);
    }
  };

  const handleCardClick = (target: Target, instance: TargetInstance) => {
    setSelectedTarget({ target, instance });
  };

  const handleUpdate = () => {
    setSelectedTarget(null);
    setShowCreateForm(false);
  };

  // Filter out archived targets
  const activeTargets = targets.filter((t) => !t.isArchived);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="icon-btn"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">{t("targets.title")}</h1>
          </div>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-brand)] text-white hover:opacity-90 transition-opacity text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {t("targets.create")}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-2">
        <p className="text-sm text-muted-foreground">
          {t("targets.description")}
        </p>
      </div>

      {/* Inline Create Form - Minimal */}
      {showCreateForm && (
        <div className="px-4 py-3">
          <div className="surface p-3 rounded-2xl relative">
            {/* Close button */}
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <TargetForm
              onSuccess={handleUpdate}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Targets Section */}
      <div className="px-4 py-4">
        {/* Active Targets (Current Window) */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            {t("targets.activeThisWindow")}
          </h2>
          {activeInstances.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl bg-[var(--color-muted)]">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm text-muted-foreground">
                {activeTargets.length === 0
                  ? t("targets.noActiveTargets")
                  : t("targets.noActiveThisWindow")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeInstances.map((instance) => {
                const target = activeTargets.find(
                  (t) => t.id === instance.targetId
                );
                if (!target) return null;
                return (
                  <TargetCard
                    key={instance.id}
                    target={target}
                    instance={instance}
                    timezone={timezone}
                    onComplete={handleComplete}
                    onClick={() => handleCardClick(target, instance)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* All Targets List */}
        {activeTargets.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              {t("targets.allTargets")}
            </h2>
            <div className="space-y-2">
              {activeTargets.map((target) => {
                const targetColor = target.color || "#FF6600";
                const isHexColor = targetColor.startsWith("#");
                const targetIcon = target.icon || "🎯";
                const windowLabel = getWindowLabel(
                  target.windowType,
                  target.customDurationDays
                );

                return (
                  <div
                    key={target.id}
                    className="surface p-2 rounded-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                    style={{ borderLeft: `2px solid ${targetColor}` }}
                    onClick={() => {
                      // Find instance for this target if available
                      const instance = activeInstances.find(
                        (i) => i.targetId === target.id
                      );
                      if (instance) {
                        handleCardClick(target, instance);
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {/* Cute tiny icon */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: isHexColor ? targetColor : undefined,
                          background: isHexColor
                            ? undefined
                            : `var(--color-${targetColor})`,
                        }}
                      >
                        <span className="text-sm">{targetIcon}</span>
                      </div>

                      {/* Content - Compact */}
                      <div className="flex-1 min-w-0">
                        {/* Title + Meta Inline */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-medium text-xs leading-tight">
                            {target.title}
                          </h3>
                          {/* Meta badges inline */}
                          <span
                            className="px-1 py-0.5 rounded text-[9px] font-medium"
                            style={{
                              backgroundColor: `${targetColor}20`,
                              color: targetColor,
                            }}
                          >
                            {windowLabel}
                          </span>
                          {target.isRecurring && (
                            <span className="px-1 py-0.5 rounded bg-[var(--color-muted)] text-[9px]">
                              ↻
                            </span>
                          )}
                        </div>

                        {/* Description + Success inline */}
                        <div className="flex items-start gap-2 mt-1 text-[10px] text-muted-foreground">
                          {target.description && (
                            <span className="line-clamp-1 flex-1">
                              {target.description}
                            </span>
                          )}

                          {target.successCriteriaText && (
                            <span className="line-clamp-1 flex-1 text-[var(--color-brand)]">
                              - {target.successCriteriaText}
                            </span>
                          )}
                        </div>
                        
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Target Detail Modal */}
      {selectedTarget && (
        <TargetDetail
          target={selectedTarget.target}
          instance={selectedTarget.instance}
          timezone={timezone}
          onClose={() => setSelectedTarget(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
