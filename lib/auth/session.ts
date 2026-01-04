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
