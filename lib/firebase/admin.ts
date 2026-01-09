import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";

// Check if we're in a server environment
const isServer = typeof window === "undefined";

if (!isServer) {
  throw new Error("Firebase Admin can only be used on the server side");
}

// Helper to format private key correctly
// Handles both literal \n and actual newlines from environment variables
function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;

  let formatted = key;

  // Remove surrounding quotes if present (from .env file)
  if (formatted.startsWith('"') && formatted.endsWith('"')) {
    formatted = formatted.slice(1, -1);
  }
  if (formatted.startsWith("'") && formatted.endsWith("'")) {
    formatted = formatted.slice(1, -1);
  }

  // If the key is a single line with \n escape sequences, convert them to actual newlines
  if (!formatted.includes("\n") && formatted.includes("\\n")) {
    formatted = formatted.replace(/\\n/g, "\n");
  }

  return formatted;
}

// Initialize Firebase Admin using environment variables (works on both local and Vercel)
const adminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const adminApp = getApps().length === 0 ? initializeApp(adminConfig) : getApps()[0];

// Export admin services
export const adminDb = getDatabase(adminApp);
export const adminAuth = getAuth(adminApp);
