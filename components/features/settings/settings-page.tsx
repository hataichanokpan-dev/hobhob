"use client";

import { useEffect, useState } from "react";
import { get, update, ref, remove } from "firebase/database";
import { database } from "@/lib/firebase/client";
import { useUserStore } from "@/store/use-user-store";
import { signOut } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { ProfileCard, SettingItem, DangerButton } from "./settings-components";
import { User, Mail, Clock, LogOut, Download, Trash2, ChevronRight } from "lucide-react";
import type { UserProfile } from "@/types";

// Common timezones
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Bangkok",
  "Australia/Sydney",
];

export function SettingsPage() {
  const { user, userProfile, setUserProfile } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  // Update timezone
  const updateTimezone = async (timezone: string) => {
    if (!user || !userProfile) return;

    setIsUpdating(true);
    try {
      await update(ref(database, `users/${user.uid}/profile`), {
        timezone,
        lastLoginAt: Date.now(),
      });
      setUserProfile({ ...userProfile, timezone });
    } catch (error) {
      console.error("Failed to update timezone:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Export data as JSON
  const exportData = async () => {
    if (!user) return;

    setExporting(true);
    try {
      // Fetch all user data
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        alert("No data to export");
        return;
      }

      const data = snapshot.val();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hobhob-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!user) return;

    if (
      !confirm(
        "Are you sure you want to delete your account? This will permanently delete all your habits, check-ins, and stats. This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Delete user data from Firebase
      await remove(ref(database, `users/${user.uid}`));

      // Sign out
      await signOut();

      // Redirect to sign-in
      router.push("/sign-in");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account</p>
        </div>

        {/* Profile Card */}
        <ProfileCard profile={userProfile} />

        {/* Timezone Selector */}
        <SettingItem
          icon={Clock}
          label="Timezone"
          description={userProfile.timezone}
          action={
            <select
              value={userProfile.timezone}
              onChange={(e) => updateTimezone(e.target.value)}
              disabled={isUpdating}
              className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          }
        />

        {/* Export Data */}
        <SettingItem
          icon={Download}
          label="Export Data"
          description="Download all your data as JSON"
          action={
            <button
              onClick={exportData}
              disabled={exporting}
              className="btn-ghost text-sm"
            >
              {exporting ? "Exporting..." : "Export"}
            </button>
          }
        />

        {/* Links */}
        <div className="space-y-2">
          <SettingItem
            icon={ChevronRight}
            label="Privacy Policy"
            description="Read our privacy policy"
            action={<ChevronRight className="w-5 h-5 text-muted-foreground" />}
          />
          <SettingItem
            icon={ChevronRight}
            label="Terms of Service"
            description="Read our terms of service"
            action={<ChevronRight className="w-5 h-5 text-muted-foreground" />}
          />
        </div>

        {/* Logout */}
        <SettingItem
          icon={LogOut}
          label="Sign Out"
          description={user?.email ?? undefined}
          action={
            <button onClick={handleLogout} className="btn-ghost text-sm">
              Sign Out
            </button>
          }
        />

        {/* Danger Zone */}
        <div className="pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">DANGER ZONE</h3>
          <DangerButton
            icon={Trash2}
            label="Delete Account"
            onClick={deleteAccount}
          />
        </div>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground pt-8">
          <p>HobHob v1.0.0</p>
          <p className="mt-1">Built with Next.js and Firebase</p>
        </div>
      </div>
    </div>
  );
}
