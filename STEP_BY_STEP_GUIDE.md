# HobHob - Step-by-Step Implementation Guide

This guide walks you through building the HobHob habit tracker from scratch. Each step includes detailed instructions, code snippets, and verification commands.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Bootstrap Project](#step-1-bootstrap-project)
4. [Step 2: Firebase Setup](#step-2-firebase-setup)
5. [Step 3: Google Authentication](#step-3-google-authentication)
6. [Step 4: Habit CRUD](#step-4-habit-crud)
7. [Step 5: Today Page + Check-ins](#step-5-today-page--check-ins)
8. [Step 6: Stats & Streaks](#step-6-stats--streaks)
9. [Step 7: Settings Page](#step-7-settings-page)
10. [Step 8: Polish & PWA](#step-8-polish--pwa)
11. [Step 9: Testing & Deployment](#step-9-testing--deployment)
12. [Next Steps](#next-steps)

---

## Project Overview

**HobHob** is a mobile-first habit tracker web application built with:

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern styling
- **Firebase Realtime Database** - Backend data storage
- **Firebase Authentication** - Google sign-in
- **Zustand** - State management
- **PWA** - Progressive Web App support

**Design:** Dark glassmorphism UI inspired by blur.io and Bear.app

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed ([nodejs.org](https://nodejs.org))
- **npm** or **yarn** package manager
- **Git** installed ([git-scm.com](https://git-scm.com))
- **GitHub** account ([github.com](https://github.com))
- **Firebase** account ([firebase.google.com](https://firebase.google.com))
- **Code editor** (VS Code recommended)

### Verify installations:

```bash
node --version    # Should be v18+
npm --version     # Should be 9+
git --version     # Should be 2.x+
```

---

## Step 1: Bootstrap Project

Create the Next.js project with Tailwind CSS v4.

### 1.1 Create Next.js Project

```bash
npx create-next-app@latest hobhob --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd hobhob
```

### 1.2 Install Dependencies

```bash
# Install Firebase
npm install firebase

# Install Zustand for state management
npm install zustand

# Install shadcn/ui (optional, for base components)
npx shadcn@latest init

# Install date utilities
npm install date-fns date-fns-tz

# Install Lucide icons
npm install lucide-react
```

### 1.3 Configure Tailwind CSS v4

**File:** `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
};

export default config;
```

**File:** `postcss.config.mjs`

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### 1.4 Create Master CSS

**File:** `app/globals.css`

```css
@import "tailwindcss";

/**
 * HobHob - Master CSS
 * Dark glassmorphism with subtle gradients
 */

@theme {
  --color-background: #0a0a0b;
  --color-foreground: #f5f5f6;
  --color-primary: #8b5cf6;
  --radius-lg: 0.75rem;
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}

.btn-primary {
  background: linear-gradient(to right, #9333ea, #db2777);
  color: white;
  font-weight: 500;
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  transition: all 200ms;
}

.btn-primary:hover {
  background: linear-gradient(to right, #7e22ce, #be185d);
}

.btn-ghost {
  color: var(--color-muted-foreground);
  font-weight: 500;
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  transition: all 200ms;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
}
```

### 1.5 Create Basic Layout

**File:** `app/layout.tsx`

```typescript
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HobHob - Habit Tracker",
  description: "Build better habits, one day at a time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
```

### 1.6 Verify Setup

```bash
npm run dev
```

Visit http://localhost:3000 - you should see the Next.js welcome page.

---

## Step 2: Firebase Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it `hobhob`
4. Disable Google Analytics (for now)
5. Click "Create project"

### 2.2 Enable Authentication

1. Go to **Build** → **Authentication**
2. Click "Get Started"
3. Click "Add new provider"
4. Select **Google**
5. Enable it and save

### 2.3 Enable Realtime Database

1. Go to **Build** → **Realtime Database**
2. Click "Create Database"
3. Select a location (e.g., `us-central1`)
4. Start in **Test Mode**
5. Click "Done"

### 2.4 Get Firebase Configuration

1. Go to **Project Settings** → **General** → **Your apps**
2. Click the web icon `</>`
3. Register app: `hobhob-web`
4. Copy the `firebaseConfig` object

### 2.5 Create Environment Variables

**File:** `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Dev mode bypass (optional, for development)
NEXT_PUBLIC_DEV_AUTH_BYPASS=true
```

### 2.6 Create Firebase Client

**File:** `lib/firebase/client.ts`

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
```

### 2.7 Create TypeScript Types

**File:** `types/index.ts`

```typescript
import { User } from "firebase/auth";

// User Profile
export interface UserProfile {
  email: string;
  displayName: string;
  photoURL: string | null;
  timezone: string;
  createdAt: number;
  lastLoginAt: number;
}

// Habit
export type HabitFrequency = "daily" | "weekly";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  targetDays?: number[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateHabitInput {
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  targetDays?: number[];
}

// Check-ins
export type CheckinValue = boolean | null;

export interface DayCheckins {
  [habitId: string]: CheckinValue;
}

export interface Checkins {
  [date: string]: DayCheckins;
}

// Stats
export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCheckins: number;
  lastUpdated: number;
}

export interface Stats {
  [habitId: string]: HabitStats;
}
```

### 2.8 Create Database Helpers

**File:** `lib/db/index.ts`

```typescript
import { database } from "@/lib/firebase/client";
import { ref, set, get, update, remove, onValue } from "firebase/database";
import type { UserProfile, Habit, DayCheckins, HabitStats } from "@/types";

// References
export function getUserRef(uid: string) {
  return ref(database, `users/${uid}`);
}

export function getProfileRef(uid: string) {
  return ref(database, `users/${uid}/profile`);
}

export function getHabitsRef(uid: string) {
  return ref(database, `users/${uid}/habits`);
}

export function getHabitRef(uid: string, habitId: string) {
  return ref(database, `users/${uid}/habits/${habitId}`);
}

export function getCheckinsRef(uid: string, date: string) {
  return ref(database, `users/${uid}/checkins/${date}`);
}

export function getStatsRef(uid: string) {
  return ref(database, `users/${uid}/stats`);
}

// CRUD Operations
export async function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  await set(getProfileRef(uid), profile);
}

export async function createHabit(uid: string, habit: Habit): Promise<void> {
  await set(getHabitRef(uid, habit.id), habit);
}

export async function updateHabit(uid: string, habitId: string, updates: Partial<Habit>): Promise<void> {
  await update(getHabitRef(uid, habitId), {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteHabit(uid: string, habitId: string): Promise<void> {
  await remove(getHabitRef(uid, habitId));
}

export async function toggleCheckin(
  uid: string,
  date: string,
  habitId: string,
  value: boolean
): Promise<void> {
  await update(getCheckinsRef(uid, date), {
    [habitId]: value,
  });
}

export async function updateHabitStats(
  uid: string,
  habitId: string,
  stats: HabitStats
): Promise<void> {
  await update(ref(database, `users/${uid}/stats/${habitId}`), stats);
}

// Real-time Listeners
export function listenToHabits(
  uid: string,
  callback: (habits: Record<string, Habit> | null) => void
): () => void {
  const habitsRef = getHabitsRef(uid);
  return onValue(habitsRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export function listenToCheckins(
  uid: string,
  date: string,
  callback: (checkins: DayCheckins | null) => void
): () => void {
  const checkinsRef = getCheckinsRef(uid, date);
  return onValue(checkinsRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export function listenToStats(
  uid: string,
  callback: (stats: Record<string, HabitStats> | null) => void
): () => void {
  const statsRef = getStatsRef(uid);
  return onValue(statsRef, (snapshot) => {
    callback(snapshot.val());
  });
}
```

### 2.9 Create Security Rules

**File:** `database.rules.json`

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid",
        "profile": {
          ".validate": "newData.hasChildren(['email', 'displayName', 'timezone', 'createdAt'])",
          "email": { ".validate": "newData.isString()" },
          "displayName": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 50" },
          "photoURL": { ".validate": "newData.isString() || newData.isNull()" },
          "timezone": { ".validate": "newData.isString()" },
          "createdAt": { ".validate": "newData.isNumber()" },
          "lastLoginAt": { ".validate": "newData.isNumber() || newData.isNull()" },
          "$other": { ".validate": false }
        },
        "habits": {
          "$habitId": {
            ".validate": "newData.hasChildren(['name', 'icon', 'color', 'frequency', 'isActive', 'createdAt', 'updatedAt'])",
            "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 50" },
            "icon": { ".validate": "newData.isString() && newData.val().length > 0" },
            "color": { ".validate": "newData.isString()" },
            "frequency": { ".validate": "newData.val() == 'daily' || newData.val() == 'weekly'" },
            "targetDays": { ".validate": "newData.isArray() || newData.isNull()" },
            "isActive": { ".validate": "newData.isBoolean()" },
            "createdAt": { ".validate": "newData.isNumber()" },
            "updatedAt": { ".validate": "newData.isNumber()" },
            "$other": { ".validate": false }
          }
        },
        "checkins": {
          "$date": {
            "$habitId": {
              ".validate": "newData.isBoolean() || newData.isNull()"
            }
          }
        },
        "stats": {
          "$habitId": {
            ".validate": "newData.hasChildren(['currentStreak', 'bestStreak', 'totalCheckins', 'lastUpdated'])",
            "currentStreak": { ".validate": "newData.isNumber() && newData.val() >= 0" },
            "bestStreak": { ".validate": "newData.isNumber() && newData.val() >= 0" },
            "totalCheckins": { ".validate": "newData.isNumber() && newData.val() >= 0" },
            "lastUpdated": { ".validate": "newData.isNumber()" },
            "$other": { ".validate": false }
          }
        },
        "$other": { ".validate": false }
      }
    }
  }
}
```

### 2.10 Deploy Security Rules

```bash
# Install Firebase CLI (first time only)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only database:rules
```

---

## Step 3: Google Authentication

### 3.1 Create User Store (Zustand)

**File:** `store/use-user-store.ts`

```typescript
import { create } from "zustand";
import { User } from "firebase/auth";
import type { UserProfile, Habit } from "@/types";

interface UserStore {
  user: User | null;
  userProfile: UserProfile | null;
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setHabits: (habits: Habit[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  userProfile: null,
  habits: [],
  isLoading: true,
  error: null,
};

export const useUserStore = create<UserStore>((set) => ({
  ...initialState,
  setUser: (user) => set({ user, isLoading: false }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setHabits: (habits) => set({ habits }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set(initialState),
}));
```

### 3.2 Create Auth Utilities

**File:** `lib/auth/session.ts`

```typescript
import { auth } from "@/lib/firebase/client";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { get, update, ref } from "firebase/database";
import { database } from "@/lib/firebase/client";
import type { UserProfile } from "@/types";

export function isDevBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true" && process.env.NODE_ENV === "development";
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await ensureUserProfile(result.user);
  return result.user;
}

export async function signInWithDevUser(): Promise<FirebaseUser> {
  const uid = "dev-user-123";
  const email = "dev@example.com";
  const displayName = "Dev User";
  const photoURL = null;

  const mockUser = {
    uid,
    email,
    displayName,
    photoURL,
  } as FirebaseUser;

  await ensureUserProfile(mockUser);

  // Store for persistence
  if (typeof window !== "undefined") {
    localStorage.setItem("dev_user", JSON.stringify({ uid, email, displayName, photoURL }));
  }

  return mockUser;
}

export function getStoredDevUser(): FirebaseUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("dev_user");
  if (!stored) return null;

  const data = JSON.parse(stored);
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
  } as FirebaseUser;
}

export function clearStoredDevUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("dev_user");
  }
}

async function ensureUserProfile(user: FirebaseUser): Promise<void> {
  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    const profile: UserProfile = {
      email: user.email!,
      displayName: user.displayName || "User",
      photoURL: user.photoURL,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };
    await update(ref(database, `users/${user.uid}/profile`), profile);
  } else {
    await update(ref(database, `users/${user.uid}/profile`), {
      lastLoginAt: Date.now(),
    });
  }
}

export async function signOut(): Promise<void> {
  clearStoredDevUser();
  await firebaseSignOut(auth);
}

export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}
```

### 3.3 Create Auth Provider

**File:** `components/providers/auth-provider.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChange, getStoredDevUser } from "@/lib/auth/session";
import { useUserStore } from "@/store/use-user-store";
import { get, ref } from "firebase/database";
import { database } from "@/lib/firebase/client";
import type { UserProfile } from "@/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setUserProfile, setLoading } = useUserStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check for dev user first
    const devUser = getStoredDevUser();
    if (devUser) {
      setUser(devUser);
      fetchProfile(devUser.uid);
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Use Firebase auth
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.uid);
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, [setUser, setUserProfile, setLoading]);

  async function fetchProfile(uid: string) {
    try {
      const snapshot = await get(ref(database, `users/${uid}/profile`));
      if (snapshot.exists()) {
        setUserProfile(snapshot.val() as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
```

### 3.4 Create Sign-In Page

**File:** `app/(auth)/sign-in/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { signInWithGoogle, signInWithDevUser, isDevBypassEnabled } from "@/lib/auth/session";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      if (isDevBypassEnabled()) {
        await signInWithDevUser();
      } else {
        await signInWithGoogle();
      }
      router.push("/today");
    } catch (err) {
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">HobHob</h1>
          <p className="text-muted-foreground mt-2">Build better habits, one day at a time.</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-semibold">Welcome</h2>

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? "Signing in..." : isDevBypassEnabled() ? "Dev Mode Sign In" : "Continue with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.5 Create Auth Layout

**File:** `app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
```

### 3.6 Update Root Layout

**File:** `app/layout.tsx`

Add AuthProvider to root layout (see Step 1 for base, wrap children with AuthProvider).

---

## Step 4: Habit CRUD

### 4.1 Create Habit Functions

**File:** `lib/db/habits.ts`

```typescript
import { createHabit, updateHabit, deleteHabit } from "./index";
import type { Habit, CreateHabitInput, UpdateHabitInput } from "@/types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function createNewHabit(uid: string, input: CreateHabitInput): Promise<string> {
  const habit: Habit = {
    id: generateId(),
    name: input.name,
    icon: input.icon,
    color: input.color,
    frequency: input.frequency,
    targetDays: input.targetDays,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await createHabit(uid, habit);
  return habit.id;
}

export async function updateExistingHabit(uid: string, input: UpdateHabitInput): Promise<void> {
  const { id, ...updates } = input;
  await updateHabit(uid, id, updates);
}

export async function deleteExistingHabit(uid: string, habitId: string): Promise<void> {
  await deleteHabit(uid, habitId);
}

export function habitsToArray(habitsObj: Record<string, Habit> | null): Habit[] {
  if (!habitsObj) return [];
  return Object.entries(habitsObj).map(([id, habit]) => ({ ...habit, id }));
}
```

### 4.2 Create Habit Form Component

**File:** `components/features/habits/habit-form.tsx`

```typescript
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createNewHabit, updateExistingHabit } from "@/lib/db/habits";
import { useUserStore } from "@/store/use-user-store";
import type { Habit, CreateHabitInput, UpdateHabitInput } from "@/types";

const HABIT_ICONS = [
  "🏃", "📚", "💪", "🧘", "💧", "🍎", "😴", "🎯",
  "✍️", "🎨", "🎵", "💻", "🌱", "🙏", "💊", "🧹",
];

const HABIT_COLORS = [
  { name: "Purple", value: "purple", bg: "bg-purple-500" },
  { name: "Blue", value: "blue", bg: "bg-blue-500" },
  { name: "Pink", value: "pink", bg: "bg-pink-500" },
  { name: "Green", value: "green", bg: "bg-green-500" },
  { name: "Orange", value: "orange", bg: "bg-orange-500" },
  { name: "Red", value: "red", bg: "bg-red-500" },
];

interface HabitFormProps {
  habit?: Habit;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HabitForm({ habit, onSuccess, onCancel }: HabitFormProps) {
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(habit?.name || "");
  const [icon, setIcon] = useState(habit?.icon || HABIT_ICONS[0]);
  const [color, setColor] = useState(habit?.color || HABIT_COLORS[0].value);
  const [frequency, setFrequency] = useState<"daily" | "weekly">(habit?.frequency || "daily");

  const isEditing = !!habit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setIsLoading(true);
    try {
      const input: CreateHabitInput | UpdateHabitInput = {
        name: name.trim(),
        icon,
        color,
        frequency,
      };

      if (isEditing) {
        await updateExistingHabit(user.uid, { ...input, id: habit.id });
      } else {
        await createNewHabit(user.uid, input);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving habit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isEditing ? "Edit Habit" : "New Habit"}</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg btn-ghost">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Exercise"
          className="w-full input"
          maxLength={50}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Icon</label>
        <div className="grid grid-cols-8 gap-2">
          {HABIT_ICONS.map((habitIcon) => (
            <button
              key={habitIcon}
              type="button"
              onClick={() => setIcon(habitIcon)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                icon === habitIcon ? "glass-strong scale-110" : "glass hover:glass-strong"
              }`}
            >
              {habitIcon}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Color</label>
        <div className="flex gap-2">
          {HABIT_COLORS.map((habitColor) => (
            <button
              key={habitColor.value}
              type="button"
              onClick={() => setColor(habitColor.value)}
              className={`w-10 h-10 rounded-lg ${habitColor.bg} transition-all ${
                color === habitColor.value ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Frequency</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFrequency("daily")}
            className={`p-3 rounded-xl transition-all ${frequency === "daily" ? "glass-strong" : "glass hover:glass-strong"}`}
          >
            <div className="text-sm font-medium">Daily</div>
          </button>
          <button
            type="button"
            onClick={() => setFrequency("weekly")}
            className={`p-3 rounded-xl transition-all ${frequency === "weekly" ? "glass-strong" : "glass hover:glass-strong"}`}
          >
            <div className="text-sm font-medium">Weekly</div>
          </button>
        </div>
      </div>

      <button type="submit" disabled={isLoading || !name.trim()} className="w-full btn-primary">
        {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Habit"}
      </button>
    </form>
  );
}
```

### 4.3 Create Habits Page

**File:** `app/(app)/habits/page.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { listenToHabits, habitsToArray } from "@/lib/db";
import { useUserStore } from "@/store/use-user-store";
import { HabitForm } from "@/components/features/habits/habit-form";

export default function HabitsPage() {
  const { user, habits, setHabits, setLoading } = useUserStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubscribe = listenToHabits(user.uid, (habitsObj) => {
      setHabits(habitsToArray(habitsObj));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, setHabits, setLoading]);

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="text-muted-foreground">Manage your habits</p>
        </div>

        {showForm ? (
          <div className="glass-card p-6">
            <HabitForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="w-full glass-card p-4 flex items-center justify-center gap-2">
            <span>+ Add New Habit</span>
          </button>
        )}

        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id} className="glass-card p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-2xl">
                  {habit.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{habit.name}</h3>
                  <p className="text-sm text-muted-foreground">{habit.frequency}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 5: Today Page + Check-ins

### 5.1 Create Date Utilities

**File:** `lib/utils/date.ts`

```typescript
import { formatInTimeZone } from "date-fns-tz";

export function getTodayDateString(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
}

export function formatReadableDate(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, "EEEE, MMMM d");
}
```

### 5.2 Create Check-in Functions

**File:** `lib/db/checkins.ts`

```typescript
import { toggleCheckin, listenToCheckins } from "./index";

export async function toggleHabitCheckin(
  uid: string,
  date: string,
  habitId: string,
  currentValue: boolean
): Promise<void> {
  await toggleCheckin(uid, date, habitId, !currentValue);
}

export function listenToDateCheckins(
  uid: string,
  date: string,
  callback: (checkins: Record<string, boolean | null> | null) => void
): () => void {
  return listenToCheckins(uid, date, callback);
}

export function getHabitCheckin(
  checkins: Record<string, boolean | null> | null,
  habitId: string
): boolean {
  if (!checkins) return false;
  return checkins[habitId] === true;
}

export function calculateCompletionRate(checkins: Record<string, boolean | null> | null): number {
  if (!checkins) return 0;
  const values = Object.values(checkins);
  const completed = values.filter((v) => v === true).length;
  const total = values.length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
```

### 5.3 Create Check-in Toggle Component

**File:** `components/features/habits/checkin-toggle.tsx`

```typescript
"use client";

import { Check } from "lucide-react";

interface CheckinToggleProps {
  checked: boolean;
  onToggle: () => void;
  color?: string;
  disabled?: boolean;
}

export function CheckinToggle({ checked, onToggle, color = "purple", disabled = false }: CheckinToggleProps) {
  const colorClasses: Record<string, string> = {
    purple: "border-purple-500 bg-purple-500/20 shadow-purple-500/30",
    blue: "border-blue-500 bg-blue-500/20 shadow-blue-500/30",
    pink: "border-pink-500 bg-pink-500/20 shadow-pink-500/30",
    green: "border-green-500 bg-green-500/20 shadow-green-500/30",
    orange: "border-orange-500 bg-orange-500/20 shadow-orange-500/30",
    red: "border-red-500 bg-red-500/20 shadow-red-500/30",
  };

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`checkin-toggle w-14 h-14 rounded-full border-2 transition-all flex items-center justify-center ${
        checked
          ? `checked ${colorClasses[color]} shadow-lg`
          : "unchecked border-white/20 bg-white/5"
      }`}
    >
      {checked && <Check className="w-7 h-7 text-white" />}
    </button>
  );
}
```

### 5.4 Create Today Page

**File:** `app/(app)/today/page.tsx`

```typescript
"use client";

import { useEffect, useCallback, useMemo } from "react";
import { listenToDateCheckins, toggleHabitCheckin, calculateCompletionRate } from "@/lib/db/checkins";
import { getTodayDateString, formatReadableDate } from "@/lib/utils/date";
import { useUserStore } from "@/store/use-user-store";
import { CheckinToggle } from "@/components/features/habits/checkin-toggle";

export default function TodayPage() {
  const { user, userProfile, habits, setHabits, setLoading } = useUserStore();
  const [checkins, setCheckins] = useState<Record<string, boolean | null> | null>(null);

  const today = useMemo(() => {
    return userProfile ? getTodayDateString(userProfile.timezone) : getTodayDateString("UTC");
  }, [userProfile]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Load habits
    const unsubscribeHabits = listenToHabits(user.uid, (habitsObj) => {
      const habitsArray = habitsToArray(habitsObj).filter((h) => h.isActive);
      setHabits(habitsArray);
      setLoading(false);
    });

    // Load check-ins
    const unsubscribeCheckins = listenToDateCheckins(user.uid, today, setCheckins);

    return () => {
      unsubscribeHabits();
      unsubscribeCheckins();
    };
  }, [user, today, setHabits, setLoading]);

  const handleToggle = useCallback(
    async (habitId: string) => {
      if (!user) return;
      const currentValue = checkins?.[habitId] === true;

      // Optimistic update
      setCheckins((prev) => ({ ...prev, [habitId]: !currentValue }));

      try {
        await toggleHabitCheckin(user.uid, today, habitId, currentValue);
      } catch (error) {
        // Rollback on error
        setCheckins((prev) => ({ ...prev, [habitId]: currentValue }));
      }
    },
    [user, today, checkins]
  );

  const completionRate = useMemo(() => calculateCompletionRate(checkins), [checkins]);

  if (!userProfile) {
    return <div className="min-h-screen pb-24 flex items-center justify-center">Loading...</div>;
  }

  const activeHabits = habits.filter((h) => h.isActive);

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm text-muted-foreground">{formatReadableDate(new Date(), userProfile.timezone)}</p>
          <h1 className="text-2xl font-bold">Today</h1>
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold">{completionRate}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Habits List */}
        {activeHabits.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No habits yet. Create your first habit!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeHabits.map((habit) => (
              <div key={habit.id} className="glass-card p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-2xl">
                    {habit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{habit.name}</h3>
                  </div>
                  <CheckinToggle
                    checked={checkins?.[habit.id] === true}
                    onToggle={() => handleToggle(habit.id)}
                    color={habit.color}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Step 6: Stats & Streaks

### 6.1 Create Streak Utilities

**File:** `lib/utils/streak.ts`

```typescript
import { formatInTimeZone } from "date-fns-tz";
import { subDays, differenceInCalendarDays } from "date-fns";

export function calculateCurrentStreak(
  checkins: Record<string, Record<string, boolean | null> | null>,
  habitId: string,
  timezone: string
): number {
  let streak = 0;
  let currentDate = new Date();

  while (true) {
    const dateStr = formatInTimeZone(currentDate, timezone, "yyyy-MM-dd");
    const dayCheckins = checkins[dateStr];

    if (!dayCheckins || dayCheckins[habitId] !== true) {
      break;
    }

    streak++;
    currentDate = subDays(currentDate, 1);
  }

  return streak;
}

export function calculateBestStreak(
  checkins: Record<string, Record<string, boolean | null> | null>,
  habitId: string
): number {
  let bestStreak = 0;
  let currentStreak = 0;

  const sortedDates = Object.keys(checkins).sort();

  for (const date of sortedDates) {
    const dayCheckins = checkins[date];
    if (dayCheckins && dayCheckins[habitId] === true) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return bestStreak;
}
```

### 6.2 Create Stats Components

**File:** `components/features/stats/streak-display.tsx`

```typescript
"use client";

import { Flame, Trophy } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
}

export function StreakDisplay({ currentStreak, bestStreak }: StreakDisplayProps) {
  return (
    <div className="glass-card p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </div>
        <div className="text-center">
          <Trophy className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-yellow-500">{bestStreak}</div>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>
      </div>
    </div>
  );
}
```

### 6.3 Create Stats Page

**File:** `app/(app)/stats/page.tsx`

```typescript
"use client";

import { useEffect, useState, useMemo } from "react";
import { listenToHabits, habitsToArray, listenToStats } from "@/lib/db";
import { useUserStore } from "@/store/use-user-store";
import { StreakDisplay } from "@/components/features/stats/streak-display";

export default function StatsPage() {
  const { user, userProfile, setLoading } = useUserStore();
  const [habits, setHabits] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const selectedHabit = useMemo(
    () => habits.find((h) => h.id === selectedHabitId) || habits[0],
    [habits, selectedHabitId]
  );

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubscribeHabits = listenToHabits(user.uid, (habitsObj) => {
      const habitsArray = habitsToArray(habitsObj).filter((h) => h.isActive);
      setHabits(habitsArray);
      setSelectedHabitId((prev) => prev || habitsArray[0]?.id || null);
      setLoading(false);
    });

    const unsubscribeStats = listenToStats(user.uid, setStats);

    return () => {
      unsubscribeHabits();
      unsubscribeStats();
    };
  }, [user, setLoading]);

  const habitStats = useMemo(() => {
    if (!selectedHabit || !stats) return null;
    return stats[selectedHabit.id] || { currentStreak: 0, bestStreak: 0, totalCheckins: 0 };
  }, [selectedHabit, stats]);

  if (!userProfile) {
    return <div className="min-h-screen pb-24 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">Track your progress</p>
        </div>

        {habits.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No habits to show stats for.</p>
          </div>
        ) : (
          <>
            {/* Habit Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => setSelectedHabitId(habit.id)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    selectedHabitId === habit.id ? "glass-strong" : "glass"
                  }`}
                >
                  <span className="mr-2">{habit.icon}</span>
                  {habit.name}
                </button>
              ))}
            </div>

            {/* Stats Display */}
            {habitStats && (
              <>
                <StreakDisplay currentStreak={habitStats.currentStreak} bestStreak={habitStats.bestStreak} />

                <div className="glass-card p-4">
                  <h3 className="text-lg font-semibold mb-2">Total Check-ins</h3>
                  <p className="text-3xl font-bold">{habitStats.totalCheckins}</p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

---

## Step 7: Settings Page

### 7.1 Create Settings Components

**File:** `components/features/settings/settings-components.tsx`

```typescript
"use client";

import type { UserProfile } from "@/types";

export function ProfileCard({ profile }: { profile: UserProfile }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl text-white font-bold">
          {profile.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{profile.displayName}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Joined {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 7.2 Create Settings Page

**File:** `app/(app)/settings/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { update, ref, remove } from "firebase/database";
import { database } from "@/lib/firebase/client";
import { useUserStore } from "@/store/use-user-store";
import { signOut } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { ProfileCard } from "@/components/features/settings/settings-components";

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

export default function SettingsPage() {
  const { user, userProfile, setUserProfile } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const updateTimezone = async (timezone: string) => {
    if (!user || !userProfile) return;
    setIsUpdating(true);
    try {
      await update(ref(database, `users/${user.uid}/profile`), { timezone, lastLoginAt: Date.now() });
      setUserProfile({ ...userProfile, timezone });
    } catch (error) {
      console.error("Failed to update timezone:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    if (!confirm("Are you sure? This will permanently delete all your data.")) return;

    try {
      await remove(ref(database, `users/${user.uid}`));
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  if (!userProfile) {
    return <div className="min-h-screen pb-24 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account</p>
        </div>

        <ProfileCard profile={userProfile} />

        <div className="glass-card p-4">
          <label className="text-sm font-medium">Timezone</label>
          <select
            value={userProfile.timezone}
            onChange={(e) => updateTimezone(e.target.value)}
            disabled={isUpdating}
            className="w-full mt-2 bg-transparent border border-white/10 rounded-lg px-3 py-2"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleLogout} className="w-full glass-card p-4 text-left">
          Sign Out
        </button>

        <button onClick={deleteAccount} className="w-full glass-card p-4 text-left text-red-400">
          Delete Account
        </button>
      </div>
    </div>
  );
}
```

---

## Step 8: Polish & PWA

### 8.1 Create PWA Manifest

**File:** `public/manifest.json`

```json
{
  "name": "HobHob - Habit Tracker",
  "short_name": "HobHob",
  "description": "Build better habits, one day at a time.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0b",
  "theme_color": "#0a0a0b",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

### 8.2 Create App Icon

**File:** `public/icons/icon.svg`

```xml
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="115" fill="url(#gradient)"/>
  <circle cx="256" cy="180" r="60" fill="white" opacity="0.95"/>
  <path d="M140 260C140 260 180 320 256 320C332 320 372 260 372 260" stroke="white" stroke-width="24" stroke-linecap="round" fill="none" opacity="0.95"/>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="512" y2="512">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
</svg>
```

### 8.3 Update Root Layout with Icons

**File:** `app/layout.tsx`

Add icons metadata to the existing layout:

```typescript
export const metadata: Metadata = {
  // ... existing metadata
  icons: {
    icon: [{ url: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" }],
  },
};
```

---

## Step 9: Testing & Deployment

### 9.1 Pre-Deployment Checklist

```bash
# Run type check
npx tsc --noEmit

# Run build
npm run build

# Run lint
npm run lint
```

### 9.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables from `.env.local`
5. Click "Deploy"

### 9.3 Deploy Firebase Security Rules

```bash
firebase deploy --only database:rules
```

### 9.4 Test Production Deployment

1. Visit your Vercel URL
2. Test all features from [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
3. Test on mobile devices
4. Test PWA installation

---

## Next Steps

### Future Enhancements

- **Push Notifications** - Daily reminders for habits
- **Social Features** - Share progress with friends
- **Analytics** - More detailed statistics and insights
- **Themes** - Custom color themes
- **Integrations** - Apple Health, Google Fit

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

---

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation in [CLAUDE.md](CLAUDE.md)
- Review the testing checklist in [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)

---

**Happy Habit Tracking! 🎯**
