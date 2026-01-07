import { Users, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Circle } from "@/types";

interface ProfileCirclesProps {
  circles: Circle[];
  isLoading: boolean;
}

export function ProfileCircles({ circles, isLoading }: ProfileCirclesProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-4 h-4 text-[var(--color-brand)]" />
            <Sparkles className="w-3 h-3 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h3 className="text-sm font-semibold">{t("profile.myCircles")}</h3>
        </div>
        <div className="surface p-4 rounded-2xl">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-[var(--color-muted)] rounded w-3/4"></div>
            <div className="h-4 bg-[var(--color-muted)] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (circles.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-4 h-4 text-[var(--color-brand)]" />
            <Sparkles className="w-3 h-3 text-purple-400 absolute -top-1 -right-1" />
          </div>
          <h3 className="text-sm font-semibold">{t("profile.myCircles")}</h3>
        </div>
        <div className="surface p-6 rounded-2xl text-center border-2 border-dashed border-[var(--color-border)]">
          <div className="text-4xl mb-2">🌐</div>
          <span className="text-sm text-muted-foreground">{t("profile.noCircles")}</span>
          <p className="text-xs text-muted-foreground mt-1">Join a community to grow together!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Users className="w-4 h-4 text-[var(--color-brand)]" />
          
        </div>
        <h3 className="text-sm font-semibold">{t("profile.myCircles")}</h3>
      </div>
      <div className="space-y-2">
        {circles.map((circle) => (
          <div
            key={circle.id}
            className="surface p-3 rounded-2xl hover:scale-[1.02] transition-all cursor-pointer group hover:shadow-lg border border-transparent hover:border-[var(--color-brand)]/20"
            onClick={() => window.location.assign(`/circles/${circle.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md bg-gradient-to-br from-[var(--color-brand)]/20 to-purple-500/10 group-hover:scale-110 transition-transform">
                  {circle.circleIcon || "👥"}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-brand)] rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{circle.name}</h4>
                <span className="text-xs text-muted-foreground truncate">
                  {circle.description || t("profile.noDescription")}
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-5">
                  <Users className="w-3 h-3 text-[var(--color-brand)]" />
                  <p className="text-sm font-bold text-[var(--color-brand)]">
                    {circle.memberCount || 0}
                  </p>
                </div>
                
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
