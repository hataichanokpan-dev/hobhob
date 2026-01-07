"use client";

import { useState } from "react";
import { X, Target as TargetIcon, Clock, Calendar, Edit, Archive } from "lucide-react";
import { completeTargetInstance, archiveTarget } from "@/lib/db/targets";
import { useUserStore } from "@/store/use-user-store";
import { useTranslation } from "@/hooks/use-translation";
import { getTimeRemaining, getWindowLabel } from "@/lib/utils/date";
import { TargetForm } from "./target-form";
import type { Target, TargetInstance } from "@/types";

interface TargetDetailProps {
  target: Target;
  instance: TargetInstance;
  timezone: string;
  onClose: () => void;
  onUpdate?: () => void;
}

export function TargetDetail({
  target,
  instance,
  timezone,
  onClose,
  onUpdate,
}: TargetDetailProps) {
  const { user } = useUserStore();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const timeRemaining = getTimeRemaining(instance.windowEnd, timezone);
  const windowLabel = getWindowLabel(target.windowType, target.customDurationDays);

  const handleComplete = async () => {
    if (!user || isCompleting) return;

    setIsCompleting(true);
    try {
      await completeTargetInstance(user.uid, instance.id);
      onClose();
      onUpdate?.();
    } catch (error) {
      console.error("Failed to complete target:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleArchive = async () => {
    if (!user || isArchiving) return;
    if (!confirm(t("targetDetail.archiveConfirm"))) return;

    setIsArchiving(true);
    try {
      await archiveTarget(user.uid, target.id);
      onClose();
      onUpdate?.();
    } catch (error) {
      console.error("Failed to archive target:", error);
    } finally {
      setIsArchiving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
        <div className="surface w-full max-w-md max-h-[90vh] overflow-y-auto p-4 animate-scale-in">
          <TargetForm
            target={target}
            onSuccess={() => {
              setIsEditing(false);
              onUpdate?.();
              onClose();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="surface w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand)]/80 flex items-center justify-center shadow-md">
              <TargetIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{target.title}</h2>
              </div>
              <p className="text-xs text-muted-foreground">{windowLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Description */}
          {target.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">
                {t("targetDetail.descriptionLabel")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {target.description}
              </p>
            </div>
          )}

          {/* Success Criteria */}
          {target.successCriteriaText && (
            <div>
              <h3 className="text-sm font-medium mb-2">
                {t("targetDetail.successCriteriaLabel")}
              </h3>
              <div className="p-3 rounded-lg bg-[var(--color-muted)]">
                <p className="text-sm leading-relaxed">
                  {target.successCriteriaText}
                </p>
              </div>
            </div>
          )}

          {/* Window Info */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              {t("targetDetail.windowInfoLabel")}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[var(--color-brand)]" />
                <span className="text-muted-foreground">{t("targetDetail.timeRemaining")}:</span>
                <span className="font-medium">{timeRemaining}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[var(--color-brand)]" />
                <span className="text-muted-foreground">{t("targetDetail.windowType")}:</span>
                <span className="font-medium">{windowLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{t("targetDetail.recurring")}:</span>
                <span className="font-medium">
                  {target.isRecurring ? t("common.yes") : t("common.no")}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-2">
            {/* Mark Done Button */}
            <button
              onClick={handleComplete}
              disabled={isCompleting || instance.status !== "ACTIVE"}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-brand)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
            >
              {isCompleting ? t("common.loading") : t("targetDetail.markDone")}
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-3 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {t("targetDetail.edit")}
              </button>
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className="px-4 py-3 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-colors font-medium flex items-center justify-center gap-2 text-red-500"
              >
                <Archive className="w-4 h-4" />
                {isArchiving ? t("common.loading") : t("targetDetail.archive")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
