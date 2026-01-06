/**
 * Circle Seeding Script
 *
 * This script creates initial curated circles in Firebase Realtime Database.
 * Run with: npx tsx scripts/seed-circles.ts
 *
 * Prerequisites:
 * - Set up Firebase Admin SDK credentials
 * - Run: npm install --save-dev tsx
 */

import { getDatabase, ref, set } from "firebase/database";
import { initializeApp } from "firebase/app";

// Firebase configuration (use your project's config)
const firebaseConfig = {
  // Replace with your Firebase project config
  // You can find this in Firebase Console → Project Settings → General
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://hobhob-8cacb-default-rtdb.firebaseio.com",
  // Note: For admin operations, you should use Firebase Admin SDK
  // This is a simplified version for development
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Initial circles data
const initialCircles = [
  {
    id: "morning-meditation",
    name: "Morning Meditation",
    description: "Start each day with intention and calm. Build a daily mindfulness practice.",
    emoji: "🌅",
    type: "open",
    createdAt: Date.now(),
    createdBy: "system",
    memberCount: 0,
    publicHabitTemplate: {
      name: "Morning Meditation",
      icon: "🌅",
      color: "#F59E0B",
    },
  },
  {
    id: "daily-reading",
    name: "Daily Reading",
    description: "Read every day. Fiction, non-fiction, articles—just read.",
    emoji: "📖",
    type: "open",
    createdAt: Date.now(),
    createdBy: "system",
    memberCount: 0,
    publicHabitTemplate: {
      name: "Daily Reading",
      icon: "📖",
      color: "#8B5CF6",
    },
  },
  {
    id: "drink-water",
    name: "Drink Water",
    description: "Stay hydrated. Drink at least 8 glasses of water daily.",
    emoji: "💧",
    type: "open",
    createdAt: Date.now(),
    createdBy: "system",
    memberCount: 0,
    publicHabitTemplate: {
      name: "Drink Water",
      icon: "💧",
      color: "#3B82F6",
    },
  },
  {
    id: "daily-exercise",
    name: "Daily Movement",
    description: "Move your body every day. Walking, yoga, gym—just move.",
    emoji: "🏃",
    type: "open",
    createdAt: Date.now(),
    createdBy: "system",
    memberCount: 0,
    publicHabitTemplate: {
      name: "Daily Movement",
      icon: "🏃",
      color: "#10B981",
    },
  },
  {
    id: "gratitude-journal",
    name: "Gratitude Journal",
    description: "Write down 3 things you're grateful for every day.",
    emoji: "🙏",
    type: "open",
    createdAt: Date.now(),
    createdBy: "system",
    memberCount: 0,
    publicHabitTemplate: {
      name: "Gratitude Journal",
      icon: "🙏",
      color: "#EC4899",
    },
  },
  {
    id: "no-sugar",
    name: "No Sugar",
    description: "Avoid added sugar. Whole foods only.",
    emoji: "🚫",
    type: "open",
    createdAt: Date.now(),
    createdBy: "system",
    memberCount: 0,
    publicHabitTemplate: {
      name: "No Sugar",
      icon: "🚫",
      color: "#EF4444",
    },
  },
  {
    id: "early-bedtime",
    name: "Early Bedtime",
    description: "Be in bed by 10 PM. Quality sleep is everything.",
    emoji: "🌙",
    type: "open",
    createdAt: Date.now(),
    createdBy: "system",
    memberCount: 0,
    publicHabitTemplate: {
      name: "Early Bedtime",
      icon: "🌙",
      color: "#6366F1",
    },
  },
  {
    id: "learn-language",
    name: "Learn a Language",
    description: "Practice a new language every day. Even 10 minutes counts.",
    emoji: "🌍",
    type: "open",
    createdAt: Date.now(),
    createdBy: "system",
    memberCount: 0,
    publicHabitTemplate: {
      name: "Learn Language",
      icon: "🌍",
      color: "#14B8A6",
    },
  },
];

/**
 * Seed circles to Firebase Realtime Database
 */
async function seedCircles() {
  console.log("🌱 Seeding circles to Firebase...");

  try {
    for (const circle of initialCircles) {
      const circleRef = ref(db, `circles/${circle.id}`);
      await set(circleRef, circle);
      console.log(`✅ Created circle: ${circle.name}`);
    }

    console.log("\n✨ Successfully seeded all circles!");
    console.log(`📊 Total circles: ${initialCircles.length}`);
    console.log("\n🔥 Don't forget to deploy your security rules:");
    console.log("   firebase deploy --only database:rules");
  } catch (error) {
    console.error("❌ Error seeding circles:", error);
    process.exit(1);
  }
}

// Run the seed function
seedCircles()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
