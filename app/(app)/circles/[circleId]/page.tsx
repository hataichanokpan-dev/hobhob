"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Loader2, Copy, Check, Users, MoreVertical, Trash2, Edit, X, Heart, Sparkles, Trophy } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getCircle, listenToCircleDailyStats, joinCircle, getUserCircleMemberships, regenerateInviteCode, deleteCircle, updateCircle, getCircleMembers, sendEncouragement, listenToCircleEncouragements, getTodaysEncouragements, getEmojisSentToUserToday } from "@/lib/db/circles";
import { useUserStore } from "@/store/use-user-store";
import { useTranslation } from "@/hooks/use-translation";
import { getTodayDateString } from "@/lib/utils/date";
import type { Circle, CircleDailyStats } from "@/types";

const ENCOURAGEMENT_EMOJIS = ["🔥", "💪", "🌱", "⭐", "👏", "💯"];

export default function CircleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const circleId = params.circleId as string;

  const { user } = useUserStore();
  const { t } = useTranslation();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [dailyStats, setDailyStats] = useState<CircleDailyStats | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    circleIcon: "",
    circleColor: "",
    habitName: "",
    habitDescription: "",
    habitIcon: "",
    habitColor: "",
  });

  // Member data
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [encouragements, setEncouragements] = useState<Record<string, any> | null>(null);

  // Get today's date for completion status
  const today = getTodayDateString("UTC");

  // For backward compatibility, default to "habit" mode if not set
  const circleMode = useMemo(() => circle?.mode || "habit", [circle]);

  // Load circle data
  useEffect(() => {
    const loadCircle = async () => {
      try {
        const circleData = await getCircle(circleId);
        if (!circleData) {
          setError(t("error.habitNotFound"));
          return;
        }
        setCircle(circleData);

        if (user && circleData.createdBy === user.uid) setIsCreator(true);

        if (user) {
          const memberships = await getUserCircleMemberships(user.uid);
          setIsMember(memberships.some((m) => m.circleId === circleId));
        }

        if (circleData.type === "open") {
          const today = new Date().toISOString().split("T")[0];
          const unsubscribe = listenToCircleDailyStats(circleId, today, (stats) => {
            setDailyStats(stats);
          });
          setIsLoading(false);
          return () => unsubscribe && unsubscribe();
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading circle:", err);
        setError(t("error.somethingWentWrong"));
        setIsLoading(false);
      }
    };

    loadCircle();
  }, [circleId, user]);

  // Load members for private circles
  useEffect(() => {
    if (!circle || circle.type !== "private") return;

    const loadMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const membersData = await getCircleMembers(circleId, today);
        setMembers(membersData);
      } catch (err) {
        console.error("Error loading members:", err);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembers();
  }, [circle, circleId, today]);

  // Listen to encouragements
  useEffect(() => {
    if (!circle) return;

    const unsubscribe = listenToCircleEncouragements(circleId, (encouragementsData) => {
      setEncouragements(encouragementsData);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [circle, circleId]);

  // Refresh members when encouragements change (to show updated counts)
  useEffect(() => {
    if (!circle || circle.type !== "private") return;

    const loadMembers = async () => {
      try {
        const membersData = await getCircleMembers(circleId, today);
        setMembers(membersData);
      } catch (err) {
        console.error("Error refreshing members:", err);
      }
    };

    loadMembers();
  }, [encouragements, circle, circleId, today]);

  const handleSendEncouragement = async (toUserId: string, emoji: string) => {
    if (!user || !circle) return;

    try {
      const result = await sendEncouragement(user.uid, toUserId, circleId, emoji);
      if (!result.success && result.error) {
        // Optionally show error to user
        console.log(result.error);
      }
    } catch (err) {
      console.error("Error sending encouragement:", err);
    }
  };

  const getMemberEncouragements = (memberUid: string) => {
    if (!encouragements) return [];
    const allEncouragements = getTodaysEncouragements(encouragements, memberUid);

    // Group by emoji and count duplicates
    const emojiCounts = new Map<string, number>();
    for (const enc of allEncouragements) {
      const count = emojiCounts.get(enc.emoji) || 0;
      emojiCounts.set(enc.emoji, count + 1);
    }

    // Convert back to array with count property
    return Array.from(emojiCounts.entries()).map(([emoji, count]) => ({
      emoji,
      count,
    }));
  };

  const getEmojisSentByCurrentUser = (toUserId: string) => {
    if (!user || !encouragements) return [];
    return getEmojisSentToUserToday(encouragements, user.uid, toUserId);
  };

  const handleJoin = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const result = await joinCircle(user.uid, circleId);

      if (result.success) {
        setIsMember(true);
        router.push("/today");
      } else {
        setError(result.error || t("circleDetail.join"));
      }
    } catch (err) {
      setError(`${t("error.somethingWentWrong")}. ${t("error.tryAgain")}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!circle?.inviteCode) return;
    const inviteUrl = `${window.location.origin}/circles/invite?code=${circle.inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError(t("circleDetail.copyCode"));
    }
  };

  const handleRegenerateCode = async () => {
    if (!user || !circle) return;

    setIsRegenerating(true);
    setError(null);

    try {
      const result = await regenerateInviteCode(user.uid, circleId);
      if (result.success && result.newInviteCode) {
        setCircle({ ...circle, inviteCode: result.newInviteCode });
      } else {
        setError(result.error || t("circleDetail.regenerate"));
      }
    } catch (err) {
      setError(t("error.somethingWentWrong"));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !circle) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteCircle(user.uid, circleId);
      if (result.success) {
        router.push("/circles");
      } else {
        setError(result.error || t("circleDetail.delete"));
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      setError(t("error.somethingWentWrong"));
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditDialog = () => {
    if (!circle) return;
    // Only allow editing for habit mode for now
    if (circle.mode === "target") {
      setShowMenu(false);
      return;
    }
    const template = circle.publicHabitTemplate;
    if (!template) return;

    setEditForm({
      name: circle.name,
      description: circle.description || "",
      circleIcon: circle.circleIcon,
      circleColor: circle.circleColor,
      habitName: template.name,
      habitDescription: template.description || "",
      habitIcon: template.icon,
      habitColor: template.color,
    });
    setShowMenu(false);
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!user || !circle || circle.mode === "target") return;

    setIsUpdating(true);
    setError(null);

    try {
      const result = await updateCircle(user.uid, circleId, {
        name: editForm.name,
        description: editForm.description || undefined,
        circleIcon: editForm.circleIcon,
        circleColor: editForm.circleColor,
        habitName: editForm.habitName,
        habitDescription: editForm.habitDescription || undefined,
        habitIcon: editForm.habitIcon,
        habitColor: editForm.habitColor,
      });

      if (result.success) {
        // Update local state
        const template = circle.publicHabitTemplate;
        setCircle({
          ...circle,
          name: editForm.name,
          description: editForm.description,
          circleIcon: editForm.circleIcon,
          circleColor: editForm.circleColor,
          publicHabitTemplate: template ? {
            ...template,
            name: editForm.habitName,
            description: editForm.habitDescription,
            icon: editForm.habitIcon,
            color: editForm.habitColor,
          } : undefined,
        });
        setShowEditDialog(false);
      } else {
        setError(result.error || t("circleForm.update"));
      }
    } catch (err) {
      setError(t("error.somethingWentWrong"));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-brand)]" />
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="surface p-8 text-center max-w-sm">
          <div className="text-4xl mb-3">😕</div>
          <h3 className="text-lg font-semibold mb-2">{error || t("error.habitNotFound")}</h3>
          <button onClick={() => router.back()} className="btn-primary mt-4 text-sm">
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  // Private circle - non-members
  if (circle.type === "private" && !isMember && !isCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="surface p-8 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">{t("circleInvite.privateCircle")}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("circleDetail.memberList")}
          </p>
          <button
            onClick={() => router.push(`/circles/invite?code=${circle.inviteCode}`)}
            className="btn-primary"
          >
            {t("circleInvite.enterCode")}
          </button>
        </div>
      </div>
    );
  }

  // Private circle - member view
  if (circle.type === "private") {
    const memberCount = circle.memberIds?.length || 0;

    return (
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="icon-btn">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">{circle.name}</h1>
            </div>
            {isCreator && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="icon-btn"
                  aria-label="Menu"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-12 z-10 surface p-2 rounded-lg shadow-lg min-w-[150px]">
                    <button
                      onClick={handleOpenEditDialog}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)] rounded-lg flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("circleDetail.delete")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Circle Info */}
        <div className="px-4 py-4 space-y-4">
          <div className="surface p-5">
            {/* Circle Header */}
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-2.5" style={{ backgroundColor: circle.circleColor + "20" }}>
                {circle.circleIcon}
              </div>
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <h2 className="text-base font-semibold">{circle.name}</h2>
                {/* Mode Badge */}
                <span className="px-2 py-0.5 rounded-md bg-[var(--color-brand)]/10 text-[10px] font-medium uppercase">
                  {circleMode}
                </span>
              </div>
              {circle.description && (
                <span className="text-sm text-muted-foreground mb-2 line-clamp-2">{circle.description}</span>
              )}
              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {memberCount}/6 members
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                <span className="capitalize">{circle.type}</span>
              </div>
            </div>

            {/* What You'll Track Section */}
            <div className="mb-4 p-4 rounded-xl bg-[var(--color-muted)]/40">
              
              {circleMode === "habit" && circle.publicHabitTemplate ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: circle.publicHabitTemplate.color + "20" }}
                    >
                      {circle.publicHabitTemplate.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{circle.publicHabitTemplate.name}</p>
                      {circle.publicHabitTemplate.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {circle.publicHabitTemplate.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
                      <span className="capitalize font-medium">{circle.publicHabitTemplate.frequency}</span>
                    </div>
                    {circle.publicHabitTemplate.targetDays && circle.publicHabitTemplate.targetDays.length > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                        <span className="text-muted-foreground">{circle.publicHabitTemplate.targetDays.length} days/week</span>
                      </>
                    )}
                  </div>
                </div>
              ) : circleMode === "target" && circle.publicTargetTemplate ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: circle.publicTargetTemplate.color + "20" }}
                    >
                      {circle.publicTargetTemplate.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{circle.publicTargetTemplate.title}</p>
                      {circle.publicTargetTemplate.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {circle.publicTargetTemplate.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
                      <span className="capitalize font-medium">{circle.publicTargetTemplate.windowType.toLowerCase()}</span>
                    </div>
                    {circle.publicTargetTemplate.isRecurring && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                        <span className="text-muted-foreground">{t("targetDetail.recurring")}</span>
                      </>
                    )}
                  </div>

                  {circle.publicTargetTemplate.successCriteriaText && (
                    <div className="pt-2 border-t border-[var(--color-border)]/40">
                      <span className="text-[11px] text-muted-foreground leading-relaxed">
                        <span className="font-medium">{t("targetDetail.successCriteriaLabel")}:</span> {circle.publicTargetTemplate.successCriteriaText}
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Creator Actions */}
            {isCreator && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[var(--color-muted)]">
                  <p className="text-xs text-muted-foreground mb-2">{t("circleDetail.inviteCode")}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-surface)] font-mono text-base tracking-widest">
                      {circle.inviteCode}
                    </div>
                    <button
                      onClick={handleCopyInviteLink}
                      className="p-2 rounded-lg bg-[var(--color-brand)] text-white hover:opacity-90"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleRegenerateCode}
                  disabled={isRegenerating}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {isRegenerating ? "..." : t("circleDetail.regenerate")}
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-brand)] font-medium">
                {isCreator ? `✓ ${t("circleDetail.creator")}` : `✓ ${t("circleDetail.joined")}`}
              </p>
              <button onClick={() => router.push("/today")} className="text-sm text-muted-foreground hover:text-foreground mt-1.5">
                {t("nav.today")} →
              </button>
            </div>
          </div>

          {/* Members */}
          <div className="surface p-4">
            <h3 className="text-sm font-medium mb-3">{t("circleDetail.memberList")} ({memberCount}/6)</h3>
            {isLoadingMembers ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-brand)]" />
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => {
                  const memberEncouragements = getMemberEncouragements(member.uid);
                  const sentEmojis = getEmojisSentByCurrentUser(member.uid);
                  const isCurrentUser = user?.uid === member.uid;

                  return (
                    <div key={member.uid} className="p-3 rounded-xl bg-[var(--color-muted)]">
                      <div className="flex items-center gap-3">
                        {/* Profile Picture with Status Ring */}
                        <div className="relative">
                          {member.profile?.photoURL ? (
                            <img
                              src={member.profile.photoURL}
                              alt={member.profile.displayName || "Member"}
                              className="w-11 h-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-medium" style={{ backgroundColor: circle.circleColor + "30" }}>
                              {member.profile?.displayName?.charAt(0).toUpperCase() || "?"}
                            </div>
                          )}
                          {/* Status Ring */}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[var(--color-muted)] flex items-center justify-center ${
                            (circleMode === "habit" ? member.completedToday : member.completedThisWindow) ? "bg-green-500" : "bg-gray-400"
                          }`}>
                            {(circleMode === "habit" ? member.completedToday : member.completedThisWindow) && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </div>

                        {/* Member Info & Encouragement Display */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {member.profile?.displayName || "Anonymous"}
                              {isCurrentUser && (
                                <span className="text-xs text-muted-foreground ml-0.5">({t("leaderboard.you")})</span>
                              )}
                            </p>
                          </div>
                          {memberEncouragements.length > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              {memberEncouragements.map((enc: any) => (
                                <span
                                  key={enc.emoji}
                                  className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)]/20 to-[var(--color-brand)]/10 text-xs animate-scale-in ${
                                    enc.count > 1 ? "px-1.5 w-auto min-w-6 h-6" : "w-6 h-6"
                                  }`}
                                >
                                  <span>{enc.emoji}</span>
                                  {enc.count > 1 && (
                                    <span className="ml-0.5 font-semibold">{enc.count}</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Encouragement Action - Only show for other members */}
                        {!isCurrentUser && (
                          <div className="flex gap-1.5">
                            {ENCOURAGEMENT_EMOJIS.slice(0, 3).map((emoji, idx) => {
                              const isSent = sentEmojis.includes(emoji);
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => !isSent && handleSendEncouragement(member.uid, emoji)}
                                  disabled={isSent}
                                  className={`group relative w-9 h-9 rounded-full flex items-center justify-center text-base transition-all ${
                                    isSent
                                      ? "bg-[var(--color-brand)]/20 cursor-default opacity-60"
                                      : "bg-[var(--color-surface)] hover:bg-gradient-to-br hover:from-[var(--color-brand)] hover:to-[var(--color-brand)]/80 hover:scale-110 active:scale-95"
                                  }`}
                                  style={{ animationDelay: `${idx * 50}ms` }}
                                  title={isSent ? "Already sent today" : undefined}
                                >
                                  <span className="group-hover:scale-110 transition-transform">{emoji}</span>
                                  {!isSent && (
                                    <>
                                      {/* Ripple effect hint */}
                                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-current scale-0 group-hover:scale-150 transition-transform" />
                                    </>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {memberCount < 6 && isCreator && (
              <button onClick={handleCopyInviteLink} className="w-full mt-3 p-3 rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm text-muted-foreground hover:border-[var(--color-brand)]/50">
                + {t("circleDetail.share")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Open circle view
  const completedCount = dailyStats?.completedCount || 0;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="icon-btn">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">{circle.name}</h1>
          </div>
          {isCreator && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="icon-btn"
                aria-label="Menu"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-12 z-10 surface p-2 rounded-lg shadow-lg min-w-[150px]">
                  <button
                    onClick={handleOpenEditDialog}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)] rounded-lg flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {t("common.edit")}
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("circleDetail.delete")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Circle Info */}
      <div className="px-4 py-4">
        <div className="surface p-5">
          {/* Circle Header */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-2.5" style={{ backgroundColor: circle.circleColor + "20" }}>
              {circle.circleIcon}
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-base font-semibold">{circle.name}</h2>
              {/* Mode Badge */}
              <span className="px-2 py-0.5 rounded-md bg-[var(--color-brand)]/10 text-[10px] font-medium uppercase">
                {circleMode}
              </span>
            </div>
            {circle.description && (
              <span className="text-sm text-muted-foreground mb-3 line-clamp-2">{circle.description}</span>
            )}
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {circle.memberCount || 0}
              </span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
              <span className="capitalize">{circle.type}</span>
            </div>
          </div>

          {/* What You'll Track Section */}
          <div className="mb-5 p-4 rounded-xl bg-[var(--color-muted)]/40">
 
            {circleMode === "habit" && circle.publicHabitTemplate ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: circle.publicHabitTemplate.color + "20" }}
                  >
                    {circle.publicHabitTemplate.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{circle.publicHabitTemplate.name}</p>
                    {circle.publicHabitTemplate.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {circle.publicHabitTemplate.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
                    <span className="capitalize font-medium">{circle.publicHabitTemplate.frequency}</span>
                  </div>
                  {circle.publicHabitTemplate.targetDays && circle.publicHabitTemplate.targetDays.length > 0 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                      <span className="text-muted-foreground">{circle.publicHabitTemplate.targetDays.length} days/week</span>
                    </>
                  )}
                </div>
              </div>
            ) : circleMode === "target" && circle.publicTargetTemplate ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: circle.publicTargetTemplate.color + "20" }}
                  >
                    {circle.publicTargetTemplate.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{circle.publicTargetTemplate.title}</p>
                    {circle.publicTargetTemplate.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {circle.publicTargetTemplate.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
                    <span className="capitalize font-medium">{circle.publicTargetTemplate.windowType.toLowerCase()}</span>
                  </div>
                  {circle.publicTargetTemplate.isRecurring && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                      <span className="text-muted-foreground">{t("targetDetail.recurring")}</span>
                    </>
                  )}
                </div>

                {circle.publicTargetTemplate.successCriteriaText && (
                  <div className="pt-2 border-t border-[var(--color-border)]/40">
                    <span className="text-[11px] text-muted-foreground leading-relaxed">
                      <span className="font-medium">{t("targetDetail.successCriteriaLabel")}:</span> {circle.publicTargetTemplate.successCriteriaText}
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Today's Progress */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <h5 className="text-sm font-medium mb-3 text-center">{t("today.title")}</h5>

            {circle.memberCount && circle.memberCount > 0 ? (
              <>
                <div className="flex justify-center gap-1.5 mb-3">
                  {Array.from({ length: Math.min(10, circle.memberCount) }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full flex-1 max-w-[8px] ${
                        i < Math.min(10, Math.ceil((completedCount / (circle.memberCount || 1)) * 10))
                          ? "bg-[var(--color-brand)]"
                          : "bg-[var(--color-muted)]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm">
                  {completedCount === 0 ? (
                    <span className="text-muted-foreground">{t("circleDetail.completed")}</span>
                  ) : (
                    <span>
                      <span className="font-semibold text-[var(--color-brand)]">{completedCount}</span>
                      <span className="text-muted-foreground"> / {circle.memberCount}</span>
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground">{t("circleDetail.inviteCode")}</p>
            )}
          </div>

          {/* Join Button */}
          {!isMember ? (
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full mt-6 btn-primary flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("circleInvite.joining")}
                </>
              ) : (
                t("circleDetail.join")
              )}
            </button>
          ) : (
            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--color-brand)] font-medium">✓ {t("circleDetail.joined")}</p>
              <button onClick={() => router.push("/today")} className="text-xs text-muted-foreground hover:text-foreground mt-2">
                {t("nav.today")} →
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="surface p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">{t("circleDetail.deleteConfirm")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("circleDetail.deleteWarning").replace("{name}", circle?.name || "")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("common.delete")}...
                  </>
                ) : (
                  t("common.delete")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Circle Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="surface p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("circleForm.editTitle")}</h3>
              <button
                onClick={() => setShowEditDialog(false)}
                className="icon-btn"
                disabled={isUpdating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Circle Name */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("circleForm.circleName")}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
                  disabled={isUpdating}
                />
              </div>

              {/* Circle Description */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("circleForm.circleDescription")}</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 resize-none"
                  rows={2}
                  disabled={isUpdating}
                />
              </div>

              {/* Circle Icon & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("circleForm.icon")}</label>
                  <input
                    type="text"
                    value={editForm.circleIcon}
                    onChange={(e) => setEditForm({ ...editForm, circleIcon: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 text-center text-2xl"
                    maxLength={2}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("circleForm.color")}</label>
                  <input
                    type="color"
                    value={editForm.circleColor}
                    onChange={(e) => setEditForm({ ...editForm, circleColor: e.target.value })}
                    className="w-full h-10 px-1 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] cursor-pointer"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--color-border)] pt-4">
                <p className="text-xs text-muted-foreground mb-3">{t("circleForm.habitName")}</p>
              </div>

              {/* Habit Name */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("circleForm.habitName")}</label>
                <input
                  type="text"
                  value={editForm.habitName}
                  onChange={(e) => setEditForm({ ...editForm, habitName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
                  disabled={isUpdating}
                />
              </div>

              {/* Habit Description */}
              <div>
                <label className="block text-sm font-medium mb-1">{t("circleForm.habitDescription")}</label>
                <textarea
                  value={editForm.habitDescription}
                  onChange={(e) => setEditForm({ ...editForm, habitDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 resize-none"
                  rows={2}
                  disabled={isUpdating}
                />
              </div>

              {/* Habit Icon & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("circleForm.habitIcon")}</label>
                  <input
                    type="text"
                    value={editForm.habitIcon}
                    onChange={(e) => setEditForm({ ...editForm, habitIcon: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 text-center text-2xl"
                    maxLength={2}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("circleForm.habitColor")}</label>
                  <input
                    type="color"
                    value={editForm.habitColor}
                    onChange={(e) => setEditForm({ ...editForm, habitColor: e.target.value })}
                    className="w-full h-10 px-1 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] cursor-pointer"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditDialog(false)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating || !editForm.name.trim() || !editForm.habitName.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-brand)] text-white text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("common.save")}...
                    </>
                  ) : (
                    t("common.save")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
