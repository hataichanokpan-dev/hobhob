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
