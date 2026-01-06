import { create } from "zustand";
import type { Circle, UserCircleMembership, CirclesStoreState, CirclesStoreActions } from "@/types";

interface CirclesStore extends CirclesStoreState, CirclesStoreActions {}

const initialState = {
  circles: [],
  userMemberships: [],
  isLoading: true,
  error: null,
};

export const useCirclesStore = create<CirclesStore>((set) => ({
  ...initialState,

  setCircles: (circles) => set({ circles }),

  setUserMemberships: (userMemberships) => set({ userMemberships }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
