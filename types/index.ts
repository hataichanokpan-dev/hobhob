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
export type CircleMode = "habit" | "target";

export interface CircleHabitTemplate {
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  targetDays?: number[];
}

export interface CircleTargetTemplate {
  title: string;
  description?: string;
  successCriteriaText?: string;
  icon: string;
  color: string;
  windowType: WindowType;
  customDurationDays?: number;
  isRecurring: boolean;
}

export interface Circle {
  id: string;
  name: string;
  description?: string; // Optional description for the circle
  circleIcon: string; // Icon for the circle itself (social context)
  circleColor: string; // Color for the circle itself
  type: CircleType;
  mode: CircleMode; // "habit" or "target"
  createdAt: number;
  createdBy: string; // uid
  memberCount?: number;
  activeToday?: number;
  // For habit mode
  publicHabitTemplate?: CircleHabitTemplate;
  // For target mode
  publicTargetTemplate?: CircleTargetTemplate;
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
  habitId?: string; // Present for habit mode
  targetId?: string; // Present for target mode
}

// Circle member with their profile and completion status
export interface CircleMember {
  uid: string;
  profile: UserProfile | null;
  habitId?: string; // For habit mode
  targetId?: string; // For target mode
  completedToday?: boolean; // For habit mode
  completedThisWindow?: boolean; // For target mode
  currentInstance?: TargetInstance; // For target mode
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

// ============ Target Types ============
export type WindowType = "WEEK" | "MONTH" | "YEAR" | "2_WEEKS" | "2_MONTHS" | "6_MONTHS" | "CUSTOM";
export type TargetInstanceStatus = "ACTIVE" | "COMPLETED" | "EXPIRED";

/**
 * Target template - defines a recurring or one-time goal
 */
export interface Target {
  id: string;
  title: string;
  description?: string;
  successCriteriaText?: string;
  icon: string;
  color: string;
  windowType: WindowType;
  customDurationDays?: number; // Number of days for custom window
  requiredCount: number; // MVP: always 1
  isRecurring: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Target instance - created per time window
 */
export interface TargetInstance {
  id: string;
  targetId: string;
  windowKey: string; // Format: WEEK=YYYY-Www, MONTH=YYYY-MM, YEAR=YYYY, 2_WEEKS=YYYY-Www+2w, etc.
  windowStart: number; // Unix timestamp
  windowEnd: number; // Unix timestamp
  status: TargetInstanceStatus;
  completedAt?: number;
  createdAt: number;
}

/**
 * For creating a new target
 */
export interface CreateTargetInput {
  title: string;
  description?: string;
  successCriteriaText?: string;
  icon: string;
  color: string;
  windowType: WindowType;
  customDurationDays?: number; // Number of days for custom window (required if windowType is CUSTOM)
  requiredCount?: number; // Default 1
  isRecurring?: boolean; // Default false
}

/**
 * For updating an existing target
 */
export interface UpdateTargetInput extends Partial<CreateTargetInput> {
  id: string;
  isArchived?: boolean;
}

/**
 * Targets template storage structure
 */
export interface Targets {
  [targetId: string]: Target;
}

/**
 * Target instances storage structure
 */
export interface TargetInstances {
  [instanceId: string]: TargetInstance;
}

// ============ Push Notification Types ============

/**
 * PushSubscriptionJSON interface from the Push API
 */
export interface PushSubscriptionJSON {
  endpoint: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

/**
 * Push subscription data stored per device
 */
export interface PushSubscriptionData {
  enabled: boolean;
  subscription: PushSubscriptionJSON;
  userAgent: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Push subscriptions storage structure per user
 */
export interface PushSubscriptions {
  [deviceId: string]: PushSubscriptionData;
}

/**
 * Daily notification payload
 */
export interface DailyNotificationPayload {
  type: "daily-summary";
  remainingHabits: number;
  activeTargets: number;
  date: string; // yyyy-mm-dd in user's timezone
}

/**
 * Emoji notification payload for circle encouragements
 */
export interface EmojiNotificationPayload {
  type: "emoji-encouragement";
  fromUserId: string;
  fromUserName: string;
  emoji: string;
  status: "Complete" | "Not complete";
  circleId: string;
  circleName?: string;
}

/**
 * Push notification API response
 */
export interface PushApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}
