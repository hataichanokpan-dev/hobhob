import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a localized string
 */
export function formatDate(date: Date, locale: string = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Format a date to a short time string
 */
export function formatTime(date: Date, locale: string = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Get the start of day in user's timezone
 */
export function getStartOfDay(date: Date, timezone: string): Date {
  const str = date.toLocaleString("en-US", { timeZone: timezone });
  return new Date(new Date(str).setHours(0, 0, 0, 0));
}

/**
 * Get today's date string in user's timezone (YYYY-MM-DD format)
 */
export function getTodayDateString(timezone: string = "UTC"): string {
  const now = new Date();
  const year = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: timezone,
  }).format(now);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    timeZone: timezone,
  }).format(now);
  const day = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    timeZone: timezone,
  }).format(now);

  return `${year}-${month}-${day}`;
}

/**
 * Debounce function to limit execution rate
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep/delay function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Check if the code is running on the server
 */
export const isServer = typeof window === "undefined";

/**
 * Check if the code is running on the client
 */
export const isClient = typeof window !== "undefined";
