import { Flame, Trophy, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { calculateCurrentStreak } from "@/lib/utils/streak";
import type { Habit, Checkins } from "@/types";

interface ProfileHabitsProps {
  habits: Habit[];
  checkins?: Checkins;
  timezone?: string;
}

const rankConfig = [
  {
    emoji: "🥇",
    gradient: "from-yellow-300 via-yellow-400 to-amber-500",
    shadow: "shadow-yellow-500/50",
    glow: "glow-gold",
  },
  {
    emoji: "🥈",
    gradient: "from-slate-300 via-gray-400 to-slate-500",
    shadow: "shadow-gray-400/50",
    glow: "glow-silver",
  },
  {
    emoji: "🥉",
    gradient: "from-orange-400 via-orange-500 to-amber-600",
    shadow: "shadow-orange-500/50",
    glow: "glow-bronze",
  },
];

export function ProfileHabits({ habits, checkins = {}, timezone = "UTC" }: ProfileHabitsProps) {
  const { t } = useTranslation();

  if (habits.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Trophy className="w-4 h-4 text-[var(--color-brand)]" />
            <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
          </div>
          <h3 className="text-sm font-semibold">{t("profile.topHabits")}</h3>
        </div>
        <div className="surface p-6 rounded-2xl text-center border-2 border-dashed border-[var(--color-border)]">
          <div className="text-4xl mb-2">🌱</div>
          <p className="text-sm text-muted-foreground">{t("profile.noHabits")}</p>
          <p className="text-xs text-muted-foreground mt-1">Start your journey today!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Trophy className="w-4 h-4 text-[var(--color-brand)]" />
          <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
        </div>
        <h3 className="text-sm font-semibold">{t("profile.topHabits")}</h3>
      </div>
      <div className="space-y-2">
        {habits.map((habit, index) => {
          const config = rankConfig[index] || rankConfig[2];
          const isFirstPlace = index === 0;
          const streak = calculateCurrentStreak(checkins, habit.id, timezone);

          return (
            <div
              key={habit.id}
              className={`surface p-3 rounded-2xl flex items-center gap-3 relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg ${
                isFirstPlace ? "border-2 border-yellow-500/30" : ""
              }`}
            >
              {/* Decorative background for first place */}
              {isFirstPlace && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
              )}

              {/* Rank Badge */}
              <div className="flex-shrink-0 relative">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-lg shadow-lg ${config.shadow} animate-pulse-slow`}
                >
                  {config.emoji}
                </div>
                {isFirstPlace && (
                  <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-spin-slow" />
                )}
              </div>

              {/* Habit Icon */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md relative ${
                  isFirstPlace
                    ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/10"
                    : "bg-[var(--color-muted)]"
                }`}
              >
                <span className="relative z-10">{habit.icon || "✨"}</span>
                {isFirstPlace && <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl animate-pulse" />}
              </div>

              {/* Habit Info */}
              <div className="flex-1 min-w-0 relative z-10">
                <h4 className="font-semibold text-sm truncate flex items-center gap-1">
                  {habit.name}
                  {isFirstPlace && <Sparkles className="w-3 h-3 text-yellow-400" />}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {habit.frequency || "Daily"}
                </p>
              </div>

              {/* Streak with flame animation */}
              <div className="flex flex-col items-end gap-0.5 relative z-10">
                <div className="flex items-center gap-1">
                  <Flame className={`w-4 h-4 ${streak > 0 ? "text-[#ff6a00] animate-flame" : "text-muted-foreground"}`} />
                  <span className={`text-base font-bold ${streak > 0 ? "text-[#ff6a00]" : "text-muted-foreground"}`}>
                    {streak}
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground">streak</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
