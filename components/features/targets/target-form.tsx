"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { createNewTarget, updateExistingTarget } from "@/lib/db/targets";
import { useUserStore } from "@/store/use-user-store";
import { useTranslation } from "@/hooks/use-translation";
import type { Target, CreateTargetInput, UpdateTargetInput } from "@/types";

const TARGET_ICONS = [
  "🎯",
  "📚",
  "💪",
  "🧘",
  "💧",
  "🍎",
  "😴",
  "⏰",
  "✍️",
  "🎨",
  "🎵",
  "💻",
  "🌱",
  "🙏",
  "💊",
  "🧹",
  "🏃",
  "🚴",
  "🏊",
  "🧗",
  "🎸",
  "📸",
  "✈️",
  "🚗",
];

const TARGET_COLORS = [
  { name: "Orange", value: "orange", hex: "#FF6600" },
  { name: "Light Orange", value: "orange-light", hex: "#FF9933" },
  { name: "Yellow", value: "yellow", hex: "#FFCC00" },
  { name: "Pink", value: "pink", hex: "#FF66B2" },
  { name: "Green", value: "green", hex: "#33CC33" },
  { name: "Blue", value: "blue", hex: "#3399FF" },
  { name: "Red", value: "red", hex: "#FF3333" },
  { name: "Purple", value: "purple", hex: "#9933FF" },
];

const WINDOW_TYPES = [
  {
    value: "WEEK" as const,
    labelKey: "targetForm.windowTypes.WEEK",
    shortKey: "W",
  },
  {
    value: "2_WEEKS" as const,
    labelKey: "targetForm.windowTypes.2_WEEKS",
    shortKey: "2W",
  },
  {
    value: "MONTH" as const,
    labelKey: "targetForm.windowTypes.MONTH",
    shortKey: "M",
  },
  {
    value: "2_MONTHS" as const,
    labelKey: "targetForm.windowTypes.2_MONTHS",
    shortKey: "2M",
  },
  {
    value: "6_MONTHS" as const,
    labelKey: "targetForm.windowTypes.6_MONTHS",
    shortKey: "6M",
  },
  {
    value: "YEAR" as const,
    labelKey: "targetForm.windowTypes.YEAR",
    shortKey: "Y",
  },
  {
    value: "CUSTOM" as const,
    labelKey: "targetForm.windowTypes.CUSTOM",
    shortKey: "C",
  },
];

interface TargetFormProps {
  target?: Target;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TargetForm({ target, onSuccess, onCancel }: TargetFormProps) {
  const { user, userProfile } = useUserStore();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState(target?.title || "");
  const [description, setDescription] = useState(target?.description || "");
  const [successCriteriaText, setSuccessCriteriaText] = useState(
    target?.successCriteriaText || ""
  );
  const [icon, setIcon] = useState(target?.icon || TARGET_ICONS[0]);
  const [customIcon, setCustomIcon] = useState("");
  const [showCustomIcon, setShowCustomIcon] = useState(false);

  const isCustomTargetColor = target?.color?.startsWith("#");
  const targetColor = target?.color || TARGET_COLORS[0].value;
  const [color, setColor] = useState(targetColor);
  const [customColor, setCustomColor] = useState(
    isCustomTargetColor ? targetColor : "#FF6600"
  );
  const [showCustomColor, setShowCustomColor] = useState(false);

  const [windowType, setWindowType] = useState<
    "WEEK" | "MONTH" | "YEAR" | "2_WEEKS" | "2_MONTHS" | "6_MONTHS" | "CUSTOM"
  >(target?.windowType || "WEEK");
  const [customDurationDays, setCustomDurationDays] = useState(
    target?.customDurationDays?.toString() || "14"
  );
  const [isRecurring, setIsRecurring] = useState(target?.isRecurring ?? false);

  const isEditing = !!target;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !title.trim()) return;

    // Validate custom duration for CUSTOM window type
    if (windowType === "CUSTOM") {
      const days = parseInt(customDurationDays);
      if (isNaN(days) || days < 1 || days > 3650) {
        return;
      }
    }

    setIsLoading(true);

    try {
      const input: CreateTargetInput | UpdateTargetInput = {
        title: title.trim(),
        icon,
        color,
        windowType,
        isRecurring,
      };

      if (windowType === "CUSTOM") {
        input.customDurationDays = parseInt(customDurationDays);
      }

      const trimmedDescription = description.trim();
      if (trimmedDescription) {
        input.description = trimmedDescription;
      }

      const trimmedSuccessCriteria = successCriteriaText.trim();
      if (trimmedSuccessCriteria) {
        input.successCriteriaText = trimmedSuccessCriteria;
      }

      if (isEditing) {
        await updateExistingTarget(user.uid, { ...input, id: target.id });
      } else {
        await createNewTarget(user.uid, input, userProfile?.timezone || "UTC");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save target:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium text-xs leading-tight">{t("targets.create")}</h3>
      {/* Title - compact */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("targetForm.titleLabel")}
          className="w-full px-3 py-2 rounded-lg bg-[var(--color-muted)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] transition-all text-sm"
          required
        />
      </div>

      {/* Description - compact */}
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("targetForm.descriptionLabel")}
          rows={1}
          className="w-full px-3 py-2 rounded-lg bg-[var(--color-muted)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] transition-all resize-none text-sm"
        />
      </div>

      {/* Success Criteria - compact */}
      <div>
        <textarea
          value={successCriteriaText}
          onChange={(e) => setSuccessCriteriaText(e.target.value)}
          placeholder={t("targetForm.successCriteriaLabel")}
          rows={1}
          className="w-full px-3 py-2 rounded-lg bg-[var(--color-muted)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] transition-all resize-none text-sm"
        />
      </div>

      {/* Icon & Color Row - compact with mobile-first responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Icons */}
        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1">
            {t("targetForm.iconLabel")}
          </label>
          <div className="flex gap-1 overflow-x-auto pb-1 py-1 px-2 scrollbar-hide">
            {TARGET_ICONS.slice(0, 8).map((targetIcon) => (
              <button
                key={targetIcon}
                type="button"
                onClick={() => {
                  setIcon(targetIcon);
                  setShowCustomIcon(false);
                }}
                className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-base sm:text-sm transition-all flex-shrink-0 ${
                  icon === targetIcon && !showCustomIcon
                    ? "bg-[var(--color-muted)] ring-2 ring-[var(--color-brand)]"
                    : "hover:bg-[var(--color-muted)]"
                }`}
              >
                {targetIcon}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowCustomIcon(true);
                setIcon("");
              }}
              className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs transition-all flex-shrink-0 ${
                showCustomIcon
                  ? "bg-[var(--color-muted)] ring-2 ring-[var(--color-brand)]"
                  : "hover:bg-[var(--color-muted)]"
              }`}
            >
              ✨
            </button>
          </div>
          {true && (
            <input
              type="text"
              value={customIcon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Custom"
              className="w-full mt-2 px-2 py-1.5 rounded-lg bg-[var(--color-muted)] border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]/20 text-center text-sm"
            />
          )}
        </div>

        {/* Colors */}
        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1">
            {t("targetForm.colorLabel")}
          </label>
          <div className="flex gap-1 overflow-x-auto pb-1 py-1 px-2 scrollbar-hide">
            {TARGET_COLORS.map((targetColor) => (
              <button
                key={targetColor.value}
                type="button"
                onClick={() => {
                  setColor(targetColor.value);
                  setShowCustomColor(false);
                }}
                className={`w-6 h-6 sm:w-6 sm:h-6 rounded-lg transition-all flex-shrink-0 ${
                  color === targetColor.value && !showCustomColor
                    ? "ring-1 ring-offset-1 ring-[var(--color-brand)] scale-110"
                    : ""
                }`}
                style={{ backgroundColor: targetColor.hex }}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                setShowCustomColor(true);
                setColor(customColor);
              }}
              className={`w-6 h-6 sm:w-6 sm:h-6 rounded-lg transition-all flex-shrink-0 ${
                showCustomColor
                  ? "ring-1 ring-offset-1 ring-[var(--color-brand)] scale-110"
                  : ""
              }`}
              style={{ backgroundColor: customColor }}
            />
          </div>
          {showCustomColor && (
            <div className="flex items-center gap-1 mt-1">
              <Palette className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setColor(e.target.value);
                }}
                className="w-8 h-6 rounded cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Window Type - compact pills with responsive sizing */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          {t("targetForm.windowTypeLabel")}
        </label>
        <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-1">
          {WINDOW_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setWindowType(type.value)}
              className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium border transition-all ${
                windowType === type.value
                  ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                  : "bg-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-brand)]/50"
              }`}
            >
              {t(type.labelKey)}
            </button>
          ))}
        </div>

        {/* Custom Duration Input */}
        {windowType === "CUSTOM" && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              min="1"
              max="3650"
              value={customDurationDays}
              onChange={(e) => setCustomDurationDays(e.target.value)}
              placeholder={t("targetForm.customWindow.daysPlaceholder")}
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] transition-all text-sm"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {t("targetForm.customWindow.unitDays")}
            </span>
          </div>
        )}
      </div>

      {/* Is Recurring - compact */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-muted)]">
        <input
          type="checkbox"
          id="isRecurring"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
        />
        <label htmlFor="isRecurring" className="text-sm">
          {t("targetForm.isRecurringLabel")}
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-colors text-sm font-medium"
        >
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={
            !title.trim() ||
            isLoading ||
            (windowType === "CUSTOM" &&
              (!customDurationDays || parseInt(customDurationDays) < 1))
          }
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-brand)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          {isLoading
            ? t("common.loading")
            : isEditing
            ? t("targetForm.update")
            : t("targetForm.create")}
        </button>
      </div>
    </form>
  );
}
