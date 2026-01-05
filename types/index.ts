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
