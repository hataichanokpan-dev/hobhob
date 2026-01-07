import { create } from "zustand";
import type { Target, TargetInstance } from "@/types";

interface TargetsStore {
  // State
  targets: Target[];
  instances: TargetInstance[];
  activeInstances: TargetInstance[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setTargets: (targets: Target[]) => void;
  setInstances: (instances: TargetInstance[]) => void;
  setActiveInstances: (instances: TargetInstance[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  targets: [],
  instances: [],
  activeInstances: [],
  isLoading: true,
  error: null,
};

export const useTargetsStore = create<TargetsStore>((set) => ({
  ...initialState,

  setTargets: (targets) => set({ targets }),

  setInstances: (instances) => set({ instances }),

  setActiveInstances: (activeInstances) => set({ activeInstances }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
