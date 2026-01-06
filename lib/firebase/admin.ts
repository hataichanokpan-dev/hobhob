import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";

// Check if we're in a server environment
const isServer = typeof window === "undefined";

if (!isServer) {
  throw new Error("Firebase Admin can only be used on the server side");
}

// Initialize Firebase Admin
const adminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const adminApp = getApps().length === 0 ? initializeApp(adminConfig) : getApps()[0];

// Export admin services
export const adminDb = getDatabase(adminApp);
export const adminAuth = getAuth(adminApp);
