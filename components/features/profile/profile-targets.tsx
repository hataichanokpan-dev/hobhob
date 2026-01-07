import { Target as TargetIcon, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { getWindowLabel } from "@/lib/utils/date";
import type { Target, TargetInstance } from "@/types";

interface ProfileTargetsProps {
  targets: Target[];
  instances: TargetInstance[];
}

export function ProfileTargets({ targets, instances }: ProfileTargetsProps) {
  const { t } = useTranslation();

  // Calculate stats
  const activeTargets = targets.filter((t) => !t.isArchived);
  const completedInstances = instances.filter((i) => i.status === "COMPLETED");
  const completionRate =
    activeTargets.length > 0
      ? Math.round((completedInstances.length / Math.max(instances.length, 1)) * 100)
      : 0;

  if (activeTargets.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <TargetIcon className="w-4 h-4 text-[var(--color-brand)]" />
            <Sparkles className="w-3 h-3 text-green-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h3 className="text-sm font-semibold">{t("profile.targetsSummary")}</h3>
        </div>
        <div className="surface p-6 rounded-2xl text-center border-2 border-dashed border-[var(--color-border)]">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-sm text-muted-foreground">{t("profile.noTargets")}</p>
          <p className="text-xs text-muted-foreground mt-1">Set your first target today!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <TargetIcon className="w-4 h-4 text-[var(--color-brand)]" />
          <Sparkles className="w-3 h-3 text-green-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <h3 className="text-sm font-semibold">{t("profile.targetsSummary")}</h3>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="surface p-3 rounded-2xl text-center relative overflow-hidden group hover:scale-105 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/10 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TargetIcon className="w-3 h-3 text-[var(--color-brand)]" />
              <p className="text-2xl font-bold gradient-text">{activeTargets.length}</p>
            </div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
              {t("profile.totalTargets")}
            </p>
          </div>
        </div>
        <div className="surface p-3 rounded-2xl text-center relative overflow-hidden group hover:scale-105 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3 text-[#33CC33]" />
              <p className="text-2xl font-bold text-[#33CC33]">
                {completedInstances.length}
              </p>
            </div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
              {t("profile.completed")}
            </p>
          </div>
        </div>
        <div className="surface p-3 rounded-2xl text-center relative overflow-hidden group hover:scale-105 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-[var(--color-brand)]" />
              <p className="text-2xl font-bold text-[var(--color-brand)]">
                {completionRate}%
              </p>
            </div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
              {t("profile.rate")}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Completed Targets */}
      {completedInstances.length > 0 && (
        <div className="surface p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#33CC33]" />
            {t("profile.recentlyCompleted")}
          </h4>
          <div className="space-y-2">
            {completedInstances.slice(-3).reverse().map((instance) => {
              const target = targets.find((t) => t.id === instance.targetId);
              if (!target) return null;

              return (
                <div key={instance.id} className="flex items-center gap-2 text-xs p-2 rounded-xl bg-[var(--color-muted)]/50 hover:bg-[var(--color-muted)] transition-colors">
                  <div className="w-6 h-6 rounded-lg bg-[#33CC33]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#33CC33]" />
                  </div>
                  <span className="flex-1 truncate font-medium">{target.title}</span>
                  <span className="text-muted-foreground text-[10px] px-2 py-1 rounded-lg bg-[var(--color-muted)]">
                    {new Date(instance.completedAt || 0).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Targets List */}
      <div className="surface p-4 rounded-2xl relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-[var(--color-brand)]/10 to-transparent rounded-tr-full pointer-events-none" />
        <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1">
          <TargetIcon className="w-3 h-3 text-[var(--color-brand)]" />
          {t("profile.activeTargets")}
        </h4>
        <div className="space-y-2">
          {activeTargets.slice(0, 3).map((target) => {
            const targetColor = target.color || "#FF6600";
            const windowLabel = getWindowLabel(
              target.windowType,
              target.customDurationDays
            );

            return (
              <div
                key={target.id}
                className="flex items-center gap-2 text-xs p-2 rounded-xl bg-[var(--color-muted)]/50 hover:bg-[var(--color-muted)] transition-all hover:scale-[1.01]"
              >
                <span className="text-lg">{target.icon || "🎯"}</span>
                <span className="flex-1 truncate font-medium">{target.title}</span>
                <span
                  className="px-2 py-1 rounded-lg text-[9px] font-bold"
                  style={{
                    backgroundColor: `${targetColor}20`,
                    color: targetColor,
                  }}
                >
                  {windowLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
