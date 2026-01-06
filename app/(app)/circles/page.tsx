"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Search, Plus, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { listenToCircles, circlesToArray, listenToUserCircles, membershipsToArray } from "@/lib/db/circles";
import { useCirclesStore } from "@/store/use-circles.store";
import { useUserStore } from "@/store/use-user-store";
import { CircleCard } from "@/components/features/circles/circle-card";
import { CreateCircleForm } from "@/components/features/circles/circle-form";
import { useTranslation } from "@/hooks/use-translation";

export default function CirclesPage() {
  const router = useRouter();
  const { circles, setCircles, setLoading, userMemberships, setUserMemberships } = useCirclesStore();
  const { user } = useUserStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load circles on mount
  useEffect(() => {
    setLoading(true);

    const unsubscribeCircles = listenToCircles((circlesObj) => {
      const allCircles = circlesToArray(circlesObj);
      setCircles(allCircles);
      setLoading(false);
    });

    return () => {
      if (unsubscribeCircles) unsubscribeCircles();
    };
  }, [setCircles, setLoading]);

  // Load user's circle memberships
  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToUserCircles(user.uid, (membershipsObj) => {
      const memberships = membershipsToArray(membershipsObj);
      setUserMemberships(memberships);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, setUserMemberships]);

  const handleCircleClick = (circleId: string) => {
    router.push(`/circles/${circleId}`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreateSuccess = (circleId: string) => {
    setShowCreateForm(false);
    router.push(`/circles/${circleId}`);
  };

  // Show create form overlay
  if (showCreateForm) {
    return <CreateCircleForm onSuccess={handleCreateSuccess} onCancel={() => setShowCreateForm(false)} />;
  }

  // Filter circles - show open circles + private circles where user is a member
  const userMemberCircleIds = new Set(userMemberships.map((m) => m.circleId));
  const visibleCircles = circles.filter(
    (c) => c.type === "open" || userMemberCircleIds.has(c.id)
  );
  const filteredCircles = searchQuery
    ? visibleCircles.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : visibleCircles;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="icon-btn" aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">{t("circles.title")}</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-brand)] text-white hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {t("circles.create")}
          </button>
        </div>
      </div>

      {/* Invite Code CTA */}
      <div className="px-4 py-3">
        <button
          onClick={() => router.push("/circles/invite")}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)]/30 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-muted)] flex items-center justify-center group-hover:bg-[var(--color-brand)]/10 transition-colors">
              <Lock className="w-5 h-5 text-muted-foreground group-hover:text-[var(--color-brand)] transition-colors" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">{t("circles.inviteCode.cta")}</div>
              <div className="text-xs text-muted-foreground">{t("circles.inviteCode.description")}</div>
            </div>
          </div>
          <span className="text-[var(--color-brand)] text-sm font-medium">{t("circles.inviteCode.join")}</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("circles.search")}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 text-sm"
          />
        </div>
      </div>

      {/* Circles Grid */}
      <div className="px-4 py-4">
        {filteredCircles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? t("circles.noResults") : t("circles.noCircles")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredCircles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} onClick={() => handleCircleClick(circle.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
