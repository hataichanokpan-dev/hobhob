"use client";

import { motion } from "framer-motion";

export type HabitFilterType = "all" | "daily" | "weekly" | "monthly";

interface HabitFilterProps {
  currentFilter: HabitFilterType;
  onFilterChange: (filter: HabitFilterType) => void;
  counts?: {
    all: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
}

const FILTERS = [
  { value: "all" as const, label: "All", short: "All" },
  { value: "daily" as const, label: "Daily", short: "Daily" },
  { value: "weekly" as const, label: "Weekly", short: "Weekly" },
  { value: "monthly" as const, label: "Monthly", short: "Monthly" },
];

export function HabitFilter({ currentFilter, onFilterChange, counts }: HabitFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {FILTERS.map((filter) => {
        const isActive = currentFilter === filter.value;
        const count = counts?.[filter.value] || 0;

        return (
          <motion.button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`
              relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${isActive
                ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/80"
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <span className="relative z-10">{filter.label}</span>
            {count > 0 && (
              <span
                className={`
                  ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold
                  ${isActive
                    ? "bg-[var(--color-background)]/20 text-[var(--color-background)]"
                    : "bg-[var(--color-foreground)]/10 text-[var(--color-foreground)]"
                  }
                `}
              >
                {count}
              </span>
            )}
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 rounded-xl bg-[var(--color-foreground)]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
