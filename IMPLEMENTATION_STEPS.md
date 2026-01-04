# HobHob - Detailed Step-by-Step Implementation Guide

This document breaks down each implementation step into actionable tasks with specific file creation, code patterns, and verification steps.

---

## Progress Overview

| Step | Status | Description |
|------|--------|-------------|
| Step 1 | ✅ Done | Bootstrap Project |
| Step 2 | ⏳ TODO | Firebase Setup |
| Step 3 | ⏳ TODO | Google Authentication |
| Step 4 | ⏳ TODO | Habit CRUD |
| Step 5 | ⏳ TODO | Today Page + Check-ins |
| Step 6 | ⏳ TODO | Stats & Streaks |
| Step 7 | ⏳ TODO | Settings Page |
| Step 8 | ⏳ TODO | Polish & PWA |
| Step 9 | ⏳ TODO | Testing & Deployment |

---

## Step 2: Firebase Setup

### Overview
Set up Firebase project, enable services, configure environment variables, and create security rules.

### 2.1 Create Firebase Project
**Location:** Firebase Console

**Tasks:**
1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Project name: `hobhob` (or your preferred name)
4. Disable Google Analytics for now (can enable later)
5. Click "Create project"
6. Wait for project creation (~30 seconds)

**Expected Output:** Firebase project created and console opens

---

### 2.2 Enable Authentication
**Location:** Firebase Console → Build → Authentication

**Tasks:**
1. Click "Get Started" on Authentication page
2. Click "Add new provider"
3. Select "Google"
4. Toggle "Enable" switch
5. Set a project support email (your email)
6. Click "Save"

**Configuration needed later:**
- OAuth consent screen will be configured after first sign-in attempt

**Expected Output:** Google provider enabled

---

### 2.3 Enable Realtime Database
**Location:** Firebase Console → Build → Realtime Database

**Tasks:**
1. Click "Create Database"
2. Select a location (choose closest to your users, e.g., `us-central1`)
3. Start in **Test Mode** (we'll deploy proper rules next)
4. Click "Done"

**Expected Output:** Database created with test rules

---

### 2.4 Configure OAuth Consent Screen
**Location:** Firebase Console → Authentication → Sign-in method → Google

**Tasks:**
1. Click the Google provider
2. Note: For development, Firebase handles this automatically
3. For production:
   - Go to Google Cloud Console
   - Configure OAuth consent screen
   - Add authorized domains:
     - `localhost` (dev)
     - `your-domain.vercel.app` (production)

**Expected Output:** OAuth configured for development

---

### 2.5 Get Firebase Configuration
**Location:** Firebase Console → Project Settings → General → Your apps

**Tasks:**
1. Click the web icon (`</>`)
2. App nickname: `hobhob-web`
3. Register app
4. Copy the `firebaseConfig` object

**Example config:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "hobhob.firebaseapp.com",
  databaseURL: "https://hobhob.firebaseio.com",
  projectId: "hobhob",
  storageBucket: "hobhob.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

### 2.6 Create Environment Variables File
**File to create:** `.env.local`

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Commands:**
```bash
# Create .env.local from template
cp .env.example .env.local
# Edit with your Firebase config
```

---

### 2.7 Create Firebase Client Initialization
**File to create:** `lib/firebase/client.ts`

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

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);

// Export app instance
export default app;
```

---

### 2.8 Create Firebase Types
**File to create:** `types/index.ts`

```typescript
import { User } from "firebase/auth";

// ============ User Types ============
export interface UserProfile {
  email: string;
  displayName: string;
  photoURL: string | null;
  timezone: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// ============ Habit Types ============
export type HabitFrequency = "daily" | "weekly";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  targetDays?: number[]; // For weekly habits: [0-6] where 0 = Monday
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

export interface UpdateHabitInput extends Partial<CreateHabitInput> {
  id: string;
  isActive?: boolean;
}

// ============ Check-in Types ============
export type CheckinValue = boolean | null;

export interface DayCheckins {
  [habitId: string]: CheckinValue;
}

export interface Checkins {
  [date: string]: DayCheckins; // date format: "yyyy-mm-dd"
}

// ============ Stats Types ============
export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCheckins: number;
  lastUpdated: number;
}

export interface Stats {
  [habitId: string]: HabitStats;
}

// ============ User Data Structure ============
export interface UserData {
  profile: UserProfile;
  habits: {
    [habitId: string]: Habit;
  };
  checkins: Checkins;
  stats: Stats;
}

// ============ Store State ============
export interface UserStoreState {
  user: User | null;
  userProfile: UserProfile | null;
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
}

export interface UserStoreActions {
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setHabits: (habits: Habit[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
}
```

---

### 2.9 Create Database Helper Functions
**File to create:** `lib/db/index.ts`

```typescript
import { database } from "@/lib/firebase/client";
import { ref, set, get, update, remove, onValue } from "firebase/database";
import type { UserProfile, Habit, DayCheckins, HabitStats } from "@/types";

/**
 * Get user database reference path
 */
export function getUserRef(uid: string) {
  return ref(database, `users/${uid}`);
}

/**
 * Get profile reference
 */
export function getProfileRef(uid: string) {
  return ref(database, `users/${uid}/profile`);
}

/**
 * Get habits reference
 */
export function getHabitsRef(uid: string) {
  return ref(database, `users/${uid}/habits`);
}

/**
 * Get single habit reference
 */
export function getHabitRef(uid: string, habitId: string) {
  return ref(database, `users/${uid}/habits/${habitId}`);
}

/**
 * Get checkins reference for a specific date
 */
export function getCheckinsRef(uid: string, date: string) {
  return ref(database, `users/${uid}/checkins/${date}`);
}

/**
 * Get stats reference
 */
export function getStatsRef(uid: string) {
  return ref(database, `users/${uid}/stats`);
}

/**
 * Create or update user profile
 */
export async function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  await set(getProfileRef(uid), profile);
}

/**
 * Create new habit
 */
export async function createHabit(uid: string, habit: Habit): Promise<void> {
  await set(getHabitRef(uid, habit.id), habit);
}

/**
 * Update habit
 */
export async function updateHabit(uid: string, habitId: string, updates: Partial<Habit>): Promise<void> {
  await update(getHabitRef(uid, habitId), {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Delete habit
 */
export async function deleteHabit(uid: string, habitId: string): Promise<void> {
  await remove(getHabitRef(uid, habitId));
}

/**
 * Toggle check-in for a habit on a specific date
 */
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

/**
 * Update habit stats
 */
export async function updateHabitStats(
  uid: string,
  habitId: string,
  stats: HabitStats
): Promise<void> {
  await update(ref(database, `users/${uid}/stats/${habitId}`), stats);
}

/**
 * Listen to habits changes
 */
export function listenToHabits(
  uid: string,
  callback: (habits: Record<string, Habit> | null) => void
): () => void {
  const habitsRef = getHabitsRef(uid);
  return onValue(habitsRef, (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Listen to checkins for a specific date
 */
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

/**
 * Listen to stats changes
 */
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

---

### 2.10 Create Firebase Security Rules
**File to create:** `database.rules.json`

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
            ".validate": "newData.isString() && /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(newData.val())",
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

**Deploy rules:**
```bash
firebase deploy --only database:rules
```

---

### 2.11 Verification Checklist

- [ ] Firebase project created
- [ ] Google Auth enabled
- [ ] Realtime Database created
- [ ] `.env.local` created with Firebase config
- [ ] `lib/firebase/client.ts` created
- [ ] `types/index.ts` created
- [ ] `lib/db/index.ts` created
- [ ] `database.rules.json` created
- [ ] Security rules deployed
- [ ] Test: Can import Firebase modules without errors

**Test command:**
```bash
npm run dev
# Check browser console for Firebase errors
```

---

## Step 3: Google Authentication

### Overview
Implement Firebase Google authentication, create sign-in page, set up user session management with Zustand, and add auth middleware.

### 3.1 Create User State Store (Zustand)
**File to create:** `store/use-user-store.ts`

```typescript
import { create } from "zustand";
import { User } from "firebase/auth";
import type { UserProfile, Habit } from "@/types";

interface UserStore {
  // State
  user: User | null;
  userProfile: UserProfile | null;
  habits: Habit[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setHabits: (habits: Habit[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
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

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
```

---

### 3.2 Create Auth Utilities
**File to create:** `lib/auth/session.ts`

```typescript
import { auth } from "@/lib/firebase/client";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { get } from "firebase/database";
import { getUserRef, saveUserProfile } from "@/lib/db";
import type { UserProfile } from "@/types";

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  // Create/update user profile in database
  await ensureUserProfile(result.user);

  return result.user;
}

/**
 * Ensure user profile exists in database
 */
async function ensureUserProfile(user: FirebaseUser): Promise<void> {
  const userRef = getUserRef(user.uid);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    // Create new user profile
    const profile: UserProfile = {
      email: user.email!,
      displayName: user.displayName || "User",
      photoURL: user.photoURL,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    await saveUserProfile(user.uid, profile);
  } else {
    // Update last login
    const profileRef = getUserRef(user.uid).child("profile");
    await profileRef.update({ lastLoginAt: Date.now() });
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}
```

---

### 3.3 Create Auth Provider Component
**File to create:** `components/providers/auth-provider.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChange } from "@/lib/auth/session";
import { useUserStore } from "@/store/use-user-store";
import { getUserRef, get } from "@/lib/database";
import type { UserProfile } from "@/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setUserProfile, setLoading } = useUserStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);

      if (user) {
        // Fetch user profile
        try {
          const snapshot = await get(getUserRef(user.uid).child("profile"));
          if (snapshot.exists()) {
            setUserProfile(snapshot.val() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }

      setLoading(false);
      setInitialized(true);
    });

    return unsubscribe;
  }, [setUser, setUserProfile, setLoading]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

### 3.4 Create Sign-In Page
**File to create:** `app/(auth)/sign-in/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth/session";
import { useUserStore } from "@/store/use-user-store";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      // AuthProvider will handle redirect
      router.push("/today");
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo/Icon */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl glass flex items-center justify-center mb-4">
            <span className="text-4xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">HobHob</h1>
          <p className="text-muted-foreground mt-2">
            Build better habits, one day at a time.
          </p>
        </div>

        {/* Sign In Card */}
        <div className="glass-card p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">Welcome</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to start tracking your habits
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Privacy Note */}
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### 3.5 Create Auth Layout
**File to create:** `app/(auth)/layout.tsx`

```typescript
import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Ambient glow background */}
      <div className="ambient-glow" />
      {children}
    </div>
  );
}
```

---

### 3.6 Create Auth Middleware
**File to create:** `lib/auth/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware to protect routes
 *
 * Public routes: /sign-in, /coming-soon
 * Protected routes: everything else under /(app)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicRoutes = ["/sign-in", "/coming-soon", "/manifest.json", "/icons"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for auth token cookie (set by Firebase)
  // Note: Firebase doesn't set cookies by default, so we'll handle auth on client side
  // This middleware is mainly for server-side route protection

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

---

### 3.7 Update Root Layout with AuthProvider
**File to update:** `app/layout.tsx`

```typescript
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata: Metadata = {
  title: "HobHob - Habit Tracker",
  description: "Build better habits, one day at a time.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HobHob",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen overflow-x-hidden ios-fix">
        <AuthProvider>
          <div className="ambient-glow-subtle" />
          <div className="relative min-h-screen">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### 3.8 Update Root Page with Auth Redirect
**File to update:** `app/page.tsx`

```typescript
import { redirect } from "next/navigation";

/**
 * Root page - redirects based on auth state
 * For now, redirect to sign-in (auth state check is client-side)
 */
export default function HomePage() {
  redirect("/sign-in");
}
```

---

### 3.9 Verification Checklist

- [ ] `store/use-user-store.ts` created
- [ ] `lib/auth/session.ts` created
- [ ] `components/providers/auth-provider.tsx` created
- [ ] `app/(auth)/sign-in/page.tsx` created
- [ ] `app/(auth)/layout.tsx` created
- [ ] `lib/auth/middleware.ts` created
- [ ] Root layout updated with AuthProvider
- [ ] Root page redirects to sign-in
- [ ] Build compiles without errors

**Test commands:**
```bash
npm run build
npm run dev
# Visit http://localhost:3000
# Should redirect to /sign-in
# Click "Continue with Google"
# Should open Google sign-in popup
```

**Commit message:**
```
feat: Add Firebase authentication

- Create Zustand store for user state
- Implement Google sign-in with Firebase Auth
- Add AuthProvider component for auth state
- Create sign-in page with Google button
- Add auth middleware
- Update root layout with provider
- Redirect root to sign-in page

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Step 4: Habit CRUD

### Overview
Implement habit creation, reading, updating, and deletion. Build UI components for habit management including forms and lists.

### 4.1 Create Habit DB Functions
**File to create:** `lib/db/habits.ts`

```typescript
import {
  createHabit,
  updateHabit,
  deleteHabit,
  listenToHabits,
} from "./index";
import type { Habit, CreateHabitInput, UpdateHabitInput } from "@/types";

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new habit
 */
export async function createNewHabit(
  uid: string,
  input: CreateHabitInput
): Promise<string> {
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

/**
 * Update existing habit
 */
export async function updateExistingHabit(
  uid: string,
  input: UpdateHabitInput
): Promise<void> {
  const { id, ...updates } = input;
  await updateHabit(uid, id, updates);
}

/**
 * Delete a habit
 */
export async function deleteExistingHabit(
  uid: string,
  habitId: string
): Promise<void> {
  await deleteHabit(uid, habitId);
}

/**
 * Convert habits object to array
 */
export function habitsToArray(
  habitsObj: Record<string, Habit> | null
): Habit[] {
  if (!habitsObj) return [];
  return Object.entries(habitsObj).map(([id, habit]) => ({
    ...habit,
    id,
  }));
}
```

---

### 4.2 Create Habit Form Component
**File to create:** `components/features/habits/habit-form.tsx`

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
  { name: "Purple", value: "purple", bg: "bg-purple-500", text: "text-purple-500" },
  { name: "Blue", value: "blue", bg: "bg-blue-500", text: "text-blue-500" },
  { name: "Pink", value: "pink", bg: "bg-pink-500", text: "text-pink-500" },
  { name: "Green", value: "green", bg: "bg-green-500", text: "text-green-500" },
  { name: "Orange", value: "orange", bg: "bg-orange-500", text: "text-orange-500" },
  { name: "Red", value: "red", bg: "bg-red-500", text: "text-red-500" },
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
  const [frequency, setFrequency] = useState<"daily" | "weekly">(
    habit?.frequency || "daily"
  );

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Edit Habit" : "New Habit"}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg btn-ghost"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Name Input */}
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

      {/* Icon Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Icon</label>
        <div className="grid grid-cols-8 gap-2">
          {HABIT_ICONS.map((habitIcon) => (
            <button
              key={habitIcon}
              type="button"
              onClick={() => setIcon(habitIcon)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                icon === habitIcon
                  ? "glass-strong scale-110"
                  : "glass hover:glass-strong"
              }`}
            >
              {habitIcon}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Color</label>
        <div className="flex gap-2">
          {HABIT_COLORS.map((habitColor) => (
            <button
              key={habitColor.value}
              type="button"
              onClick={() => setColor(habitColor.value)}
              className={`w-10 h-10 rounded-lg ${habitColor.bg} transition-all ${
                color === habitColor.value
                  ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                  : "opacity-60 hover:opacity-100"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Frequency Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Frequency</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFrequency("daily")}
            className={`p-3 rounded-xl transition-all ${
              frequency === "daily"
                ? "glass-strong"
                : "glass hover:glass-strong"
            }`}
          >
            <div className="text-sm font-medium">Daily</div>
            <div className="text-xs text-muted-foreground">Every day</div>
          </button>
          <button
            type="button"
            onClick={() => setFrequency("weekly")}
            className={`p-3 rounded-xl transition-all ${
              frequency === "weekly"
                ? "glass-strong"
                : "glass hover:glass-strong"
            }`}
          >
            <div className="text-sm font-medium">Weekly</div>
            <div className="text-xs text-muted-foreground">Specific days</div>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full btn-primary"
      >
        {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Habit"}
      </button>
    </form>
  );
}
```

---

### 4.3 Create Habit List Component
**File to create:** `components/features/habits/habit-list.tsx`

```typescript
"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { deleteExistingHabit } from "@/lib/db/habits";
import { useUserStore } from "@/store/use-user-store";
import { HabitForm } from "./habit-form";
import type { Habit } from "@/types";

interface HabitListProps {
  filterActive?: boolean;
  onHabitClick?: (habit: Habit) => void;
}

export function HabitList({
  filterActive = true,
  onHabitClick,
}: HabitListProps) {
  const { user, habits, setHabits } = useUserStore();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();

  const filteredHabits = filterActive
    ? habits.filter((h) => h.isActive)
    : habits;

  const handleDelete = async (habitId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this habit?")) return;

    try {
      await deleteExistingHabit(user.uid, habitId);
      // Update local state (listener will handle this, but optimistic update feels better)
      setHabits(habits.filter((h) => h.id !== habitId));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingHabit(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingHabit(undefined);
  };

  if (showForm) {
    return (
      <div className="glass-card p-6">
        <HabitForm
          habit={editingHabit}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Habit Button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full glass-card p-4 flex items-center justify-center gap-2 hover:glass-strong transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>Add New Habit</span>
      </button>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="text-3xl">📝</span>
          </div>
          <p className="empty-state-text">
            No habits yet. Create your first habit!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => onHabitClick?.(habit)}
              className="glass-card p-4 cursor-pointer hover:translate-y-[-2px] transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-2xl">
                  {habit.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{habit.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {habit.frequency === "daily" ? "Every day" : "Specific days"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(habit);
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg btn-ghost"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(habit.id);
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg btn-ghost text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 4.4 Create Habits Page
**File to create:** `app/(app)/habits/page.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { listenToHabits, habitsToArray } from "@/lib/db";
import { useUserStore } from "@/store/use-user-store";

export default function HabitsPage() {
  const { user, habits, setHabits, setLoading } = useUserStore();

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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="text-muted-foreground">Manage your habits</p>
        </div>

        {/* Content - HabitList component will be imported here */}
        <div className="text-center text-muted-foreground py-12">
          <p>Habit list component loading...</p>
        </div>
      </div>
    </div>
  );
}
```

---

### 4.5 Verification Checklist

- [ ] `lib/db/habits.ts` created
- [ ] `components/features/habits/habit-form.tsx` created
- [ ] `components/features/habits/habit-list.tsx` created
- [ ] `app/(app)/habits/page.tsx` created
- [ ] Build compiles without errors

**Test commands:**
```bash
npm run build
```

**Commit message:**
```
feat: Add habit CRUD functionality

- Implement habit create, update, delete operations
- Build HabitForm component with icon and color selection
- Build HabitList component with add/edit/delete actions
- Create habits page to manage all habits
- Add habit state management with Firebase listeners

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Next Steps

Continue with **Step 5: Today Page + Check-ins** in the next session.

This detailed step-by-step guide provides:
- Exact file paths to create
- Complete code snippets
- Verification checklists
- Test commands
- Commit messages

Each step builds upon the previous ones, ensuring a solid foundation for the application.
