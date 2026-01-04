"use client";

import { User, Settings, Sun, Moon, Monitor } from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { useTheme } from "@/components/providers/theme-provider";
import { signOut } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserProfile } from "@/types";

interface ProfileCardProps {
  profile: UserProfile | null;
  onSignOut: () => void;
  onOpenSettings: () => void;
}

function ProfileCard({ profile, onSignOut, onOpenSettings }: ProfileCardProps) {
  return (
    <div className="surface p-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ff9533] flex items-center justify-center text-lg text-white font-semibold shadow-sm">
          {profile?.displayName?.charAt(0).toUpperCase() || "?"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{profile?.displayName || "Guest"}</h3>
          <p className="text-xs text-muted-foreground truncate">{profile?.email || "Sign in to sync"}</p>
        </div>

        {/* Settings Icon */}
        <button
          onClick={onOpenSettings}
          className="icon-btn"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Stats - Cute HobHob touch */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="text-sm font-semibold text-[var(--color-brand)]">Active</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Member</p>
          <p className="text-sm font-semibold">
            {profile ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short" }) : "-"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Streak</p>
          <p className="text-sm font-semibold">🔥 0</p>
        </div>
      </div>

      {/* Sign Out */}
      {profile && (
        <button
          onClick={onSignOut}
          className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign Out
        </button>
      )}
    </div>
  );
}

export function AppHeader() {
  const { userProfile } = useUserStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const handleOpenSettings = () => {
    setShowProfile(false);
    router.push("/settings");
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-card)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <img
              src="/icons/hobhob_v2.png"
              alt="HobHob"
              className="w-14 h-14 rounded-lg shadow-sm"
            />
            <div>
              <h1 className="text-base font-semibold tracking-tight">HobHob</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">For a better tomorrow</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="icon-btn"
                aria-label="Toggle theme"
              >
                {theme === "light" && <Sun className="w-4 h-4" />}
                {theme === "dark" && <Moon className="w-4 h-4" />}
                {theme === "system" && <Monitor className="w-4 h-4" />}
              </button>

              {/* Theme Dropdown */}
              {showThemeMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowThemeMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 surface shadow-lg p-1 min-w-[140px]">
                    <button
                      onClick={() => { setTheme("light"); setShowThemeMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-[var(--color-muted)] transition-colors"
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                    <button
                      onClick={() => { setTheme("dark"); setShowThemeMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-[var(--color-muted)] transition-colors"
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </button>
                    <button
                      onClick={() => { setTheme("system"); setShowThemeMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-[var(--color-muted)] transition-colors"
                    >
                      <Monitor className="w-4 h-4" />
                      System
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 py-1.5 px-2 rounded-full hover:bg-[var(--color-muted)] transition-colors"
            >
              {userProfile ? (
                <>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ff9533] flex items-center justify-center text-xs text-white font-semibold">
                    {userProfile.displayName.charAt(0).toUpperCase()}
                  </div>
                </>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Dropdown Card */}
      {showProfile && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowProfile(false)}
          />
          <div className="absolute left-4 right-4 top-full z-20 mt-2">
            <ProfileCard
              profile={userProfile}
              onSignOut={handleSignOut}
              onOpenSettings={handleOpenSettings}
            />
          </div>
        </>
      )}
    </header>
  );
}
