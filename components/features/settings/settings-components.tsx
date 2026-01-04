"use client";

import { useUserStore } from "@/store/use-user-store";
import { signOut } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { User, Mail, Clock, LogOut, Download, Trash2 } from "lucide-react";
import type { UserProfile } from "@/types";

export function ProfileCard({ profile }: { profile: UserProfile | null }) {
  if (!profile) {
    return (
      <div className="glass-card p-4 text-center text-muted-foreground">
        No profile data available
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl text-white font-bold">
          {profile.displayName.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg truncate">{profile.displayName}</h2>
          <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Joined {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SettingItem({
  icon: Icon,
  label,
  description,
  action,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium">{label}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}

export function DangerButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full glass-card p-4 flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
}
