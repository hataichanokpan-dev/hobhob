"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Check, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCircleByInviteCode, joinCircleByInviteCode } from "@/lib/db/circles";
import { useUserStore } from "@/store/use-user-store";
import { useTranslation } from "@/hooks/use-translation";
import type { Circle } from "@/types";

export default function InviteJoinPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { t, tp } = useTranslation();
  const [inviteCode, setInviteCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [circle, setCircle] = useState<Circle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  // Check for invite code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setInviteCode(code.toUpperCase());
    }
  }, []);

  const handleValidateCode = async () => {
    if (inviteCode.length !== 6) {
      setError(t("circleInvite.invalidCode"));
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await getCircleByInviteCode(inviteCode.toUpperCase());

      if (result.success && result.circle) {
        setCircle(result.circle);
      } else {
        setError(result.error || "Invalid invite code");
        setCircle(null);
      }
    } catch (err) {
      setError("Failed to validate invite code");
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      router.push(`/sign-in?redirect=${encodeURIComponent("/circles/invite?code=" + inviteCode)}`);
      return;
    }

    if (!circle) return;

    setIsJoining(true);
    setError(null);

    try {
      const result = await joinCircleByInviteCode(user.uid, inviteCode.toUpperCase());

      if (result.success) {
        setJoined(true);
        setTimeout(() => router.push("/today"), 1500);
      } else {
        setError(result.error || "Failed to join circle");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsJoining(false);
    }
  };

  // Success state
  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="surface p-8 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("circleInvite.joinedTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("circleInvite.redirecting")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="icon-btn" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">{t("circleInvite.title")}</h1>
        </div>
      </div>

      {!circle ? (
        // Input state
        <div className="px-4 py-8 space-y-6">
          {/* Icon */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-1">{t("circleInvite.privateCircle")}</h2>
            <p className="text-sm text-muted-foreground">{t("circleInvite.enterCode")}</p>
          </div>

          {/* Code Input */}
          <div className="surface p-6 space-y-4">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                setInviteCode(value);
                setCircle(null);
                setError(null);
              }}
              placeholder={t("circleInvite.codePlaceholder")}
              className="w-full px-4 py-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] text-center text-3xl tracking-widest font-mono"
              maxLength={6}
              autoFocus
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <button
              onClick={handleValidateCode}
              disabled={inviteCode.length !== 6 || isValidating}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("circleInvite.checking")}
                </>
              ) : (
                t("circleInvite.continue")
              )}
            </button>
          </div>
        </div>
      ) : (
        // Circle preview state
        <div className="px-4 py-8 space-y-6">
          {/* Circle Preview */}
          <div className="surface p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3" style={{ backgroundColor: circle.circleColor + "20" }}>
                {circle.circleIcon}
              </div>
              <h2 className="text-xl font-semibold mb-1">{circle.name}</h2>
              <p className="text-sm text-muted-foreground">{circle.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-muted)]">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                <span className="font-medium text-sm">{t("circleInvite.privateCircle")}</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6 whitespace-pre-line">
                {t("circleInvite.privateInfo")}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20">
              <p className="text-sm text-center">
                {circle.mode === "habit" && circle.publicHabitTemplate
                  ? `You'll be tracking: ${circle.publicHabitTemplate.name}`
                  : circle.mode === "target" && circle.publicTargetTemplate
                  ? `You'll be pursuing: ${circle.publicTargetTemplate.title}`
                  : "You'll be working on a goal together"
                }
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("circleInvite.joining")}
                </>
              ) : (
                t("circleInvite.join")
              )}
            </button>

            <button
              onClick={() => {
                setCircle(null);
                setError(null);
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              {t("circleInvite.differentCode")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
