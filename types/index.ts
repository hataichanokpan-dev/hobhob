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
export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Habit {
  id: string;
  name: string;
  description?: string; // Optional description for the habit
  icon: string;
  color: string;
  frequency: HabitFrequency;
  targetDays?: number[]; // For weekly: [0-6] where 0 = Monday, for monthly: [1-31] day numbers
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  circleId?: string; // If present, linked to a circle
}

export interface CreateHabitInput {
  name: string;
  description?: string;
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
export type CheckinValue = boolean | null | CheckinData;

export interface CheckinData {
  checked: boolean;
  note?: string;
  timestamp: number;
}

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

// ============ Leaderboard Types ============
export interface LeaderboardUser {
  uid: string;
  profile: UserProfile;
  totalStreak: number;
  bestStreak: number;
}

// ============ Follow Types ============
export interface Follows {
  following: { [uid: string]: number }; // uid -> timestamp
  followers: { [uid: string]: number }; // uid -> timestamp
}

// ============ Circle Types ============
export type CircleType = "open" | "private";

export interface CircleHabitTemplate {
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  targetDays?: number[];
}

export interface Circle {
  id: string;
  name: string;
  description?: string; // Optional description for the circle
  circleIcon: string; // Icon for the circle itself (social context)
  circleColor: string; // Color for the circle itself
  type: CircleType;
  createdAt: number;
  createdBy: string; // uid
  memberCount?: number;
  activeToday?: number;
  // For open circles
  publicHabitTemplate: CircleHabitTemplate;
  // For private circles only
  memberIds?: string[];
  inviteCode?: string;
}

export interface CircleDailyStats {
  date: string;
  completedCount: number;
  lastUpdated: number;
}

export interface UserCircleMembership {
  circleId: string;
  joinedAt: number;
  habitId: string;
}

// Circle member with their profile and completion status
export interface CircleMember {
  uid: string;
  profile: UserProfile | null;
  habitId: string;
  completedToday: boolean;
}

// Encouragement/reaction from one member to another
export interface CircleEncouragement {
  id: string;
  circleId: string;
  fromUserId: string;
  toUserId: string;
  emoji: string;
  createdAt: number;
}

export interface CircleEncouragements {
  [encouragementId: string]: CircleEncouragement;
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

// ============ Circles Store State ============
export interface CirclesStoreState {
  circles: Circle[];
  userMemberships: UserCircleMembership[];
  isLoading: boolean;
  error: string | null;
}

export interface CirclesStoreActions {
  setCircles: (circles: Circle[]) => void;
  setUserMemberships: (memberships: UserCircleMembership[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}
