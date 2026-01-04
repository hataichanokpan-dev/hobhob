import { auth } from "@/lib/firebase/client";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { get, update, ref } from "firebase/database";
import { getUserRef, saveUserProfile, getProfileRef } from "@/lib/db";
import type { UserProfile } from "@/types";

/**
 * Check if running in development mode with auth bypass
 */
export function isDevBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true" && process.env.NODE_ENV === "development";
}

/**
 * Sign in with mock dev user (bypasses Firebase Auth)
 * ONLY works in development mode with NEXT_PUBLIC_DEV_AUTH_BYPASS=true
 */
export async function signInWithDevUser(): Promise<FirebaseUser> {
  if (!isDevBypassEnabled()) {
    throw new Error("Dev bypass is only available in development mode with NEXT_PUBLIC_DEV_AUTH_BYPASS=true");
  }

  // Create mock Firebase user object (minimal properties we use)
  const mockUid = "dev-user-123";
  const mockUser = {
    uid: mockUid,
    email: "dev@example.com",
    displayName: "Dev User",
    photoURL: null,
    phoneNumber: null,
    emailVerified: true,
    isAnonymous: false,
    providerId: "dev",
    providerData: [],
    toJSON: () => ({}),
    refreshToken: "",
    tenantId: null,
    getIdToken: async () => "dev-token",
    getIdTokenResult: async () => ({ token: "dev-token", authTime: "", issuedAtTime: "", expirationTime: "", signInProvider: "dev", claims: {}, signInSecondFactor: null } as any),
    metadata: {},
    multiFactor: {} as any,
    delete: async () => undefined,
    reload: async () => undefined,
  } as FirebaseUser;

  // Create/update user profile in database
  await ensureUserProfile(mockUser);

  return mockUser;
}

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
    const profileRef = getProfileRef(user.uid);
    await update(profileRef, { lastLoginAt: Date.now() });
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
