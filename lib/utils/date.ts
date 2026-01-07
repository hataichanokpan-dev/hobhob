/**
 * Date utility functions for timezone-aware operations
 */

import type { WindowType } from "@/types";

/**
 * Format a date to YYYY-MM-DD string in user's timezone
 * This is the standard format used for storing and querying checkins
 */
export function formatDateString(date: Date, timezone: string = "UTC"): string {
  const year = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: timezone,
  }).format(date);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    timeZone: timezone,
  }).format(date);
  const day = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    timeZone: timezone,
  }).format(date);

  return `${year}-${month}-${day}`;
}

/**
 * Get today's date string in user's timezone (YYYY-MM-DD format)
 */
export function getTodayDateString(timezone: string = "UTC"): string {
  return formatDateString(new Date(), timezone);
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
 * Format a date to a readable format (e.g., "Monday, January 3")
 */
export function formatReadableDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone,
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
 * Check if a date is today in user's timezone
 */
export function isToday(date: Date, timezone: string): boolean {
  const today = getTodayDateString(timezone);
  const dateStr = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).format(date);
  return dateStr === today;
}

/**
 * Get the day of week (0-6, where 0=Monday, 6=Sunday) in user's timezone
 */
export function getDayOfWeek(timezone: string): number {
  const now = new Date();
  // Convert to user's timezone and get day of week
  const str = now.toLocaleString("en-US", { timeZone: timezone });
  const dateInTimezone = new Date(str);
  // JavaScript getDay() returns 0=Sunday, 1=Monday, ..., 6=Saturday
  // Convert to 0=Monday, 6=Sunday
  const jsDay = dateInTimezone.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Get the day of month (1-31) in user's timezone
 */
export function getDayOfMonth(timezone: string): number {
  const now = new Date();
  const dayOfMonth = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: timezone,
  }).format(now);
  return parseInt(dayOfMonth);
}

// ============ Target Window Utilities ============

/**
 * Get the current window key for a given window type in user's timezone
 * WEEK format: YYYY-Www (ISO week, e.g., 2025-W01)
 * MONTH format: YYYY-MM (e.g., 2025-01)
 * YEAR format: YYYY (e.g., 2025)
 * 2_WEEKS format: YYYY-Www+2w
 * 2_MONTHS format: YYYY-MM+2m
 * 6_MONTHS format: YYYY-MM+6m
 * CUSTOM format: YYYY-DDD (e.g., 2025-045 for day 45 of the year)
 */
export function getCurrentWindowKey(windowType: WindowType, timezone: string, customDurationDays?: number): string {
  const now = new Date();

  if (windowType === "WEEK") {
    const year = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: timezone,
    }).format(now);

    const dateInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const isoWeek = getISOWeek(dateInTimezone);
    return `${year}-W${isoWeek.toString().padStart(2, "0")}`;
  }

  if (windowType === "MONTH") {
    const year = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: timezone,
    }).format(now);
    const month = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      timeZone: timezone,
    }).format(now);
    return `${year}-${month}`;
  }

  if (windowType === "YEAR") {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: timezone,
    }).format(now);
  }

  // Custom windows - use anchor window + offset
  const nowInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const year = nowInTimezone.getFullYear();
  const month = nowInTimezone.getMonth();

  if (windowType === "2_WEEKS") {
    // Use the ISO week number and divide by 2 to get 2-week period
    const isoWeek = getISOWeek(nowInTimezone);
    const period = Math.floor((isoWeek - 1) / 2);
    return `${year}-2W${period.toString().padStart(2, "0")}`;
  }

  if (windowType === "2_MONTHS") {
    // Use bi-monthly periods (Jan-Feb, Mar-Apr, etc.)
    const period = Math.floor(month / 2);
    return `${year}-${period.toString().padStart(2, "0")}B`;
  }

  if (windowType === "6_MONTHS") {
    // Use half-year periods (H1: Jan-Jun, H2: Jul-Dec)
    const period = month < 6 ? 0 : 1;
    return `${year}-${period}H`;
  }

  if (windowType === "CUSTOM" && customDurationDays) {
    // Use day-of-year divided by custom duration to get the period number
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((nowInTimezone.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const period = Math.floor(dayOfYear / customDurationDays);
    return `${year}-C${period.toString().padStart(3, "0")}`;
  }

  // Fallback
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: timezone,
  }).format(now);
}

/**
 * Get the start and end timestamps for the current window in user's timezone
 * Week starts on Monday (ISO 8601)
 */
export function getCurrentWindowBounds(windowType: WindowType, timezone: string, customDurationDays?: number): { start: number; end: number } {
  const now = new Date();
  const nowInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));

  if (windowType === "WEEK") {
    const day = nowInTimezone.getDay();
    const diff = nowInTimezone.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(nowInTimezone.setDate(diff));

    const start = new Date(monday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(monday);
    end.setDate(end.getDate() + 7);
    end.setHours(0, 0, 0, 0);

    return {
      start: start.getTime(),
      end: end.getTime(),
    };
  }

  if (windowType === "MONTH") {
    const year = nowInTimezone.getFullYear();
    const month = nowInTimezone.getMonth();

    const start = new Date(year, month, 1, 0, 0, 0);
    const end = new Date(year, month + 1, 1, 0, 0, 0);

    return {
      start: start.getTime(),
      end: end.getTime(),
    };
  }

  if (windowType === "YEAR") {
    const year = nowInTimezone.getFullYear();
    const start = new Date(year, 0, 1, 0, 0, 0);
    const end = new Date(year + 1, 0, 1, 0, 0, 0);

    return {
      start: start.getTime(),
      end: end.getTime(),
    };
  }

  if (windowType === "2_WEEKS") {
    const day = nowInTimezone.getDay();
    const diff = nowInTimezone.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(nowInTimezone.setDate(diff));
    const isoWeek = getISOWeek(monday);
    const period = Math.floor((isoWeek - 1) / 2);

    // Calculate start of the 2-week period
    const startWeekOfYear = (period * 2) + 1;
    const startOfYear = new Date(nowInTimezone.getFullYear(), 0, 1);
    const startDayOfWeek = startOfYear.getDay() || 7;
    const daysUntilFirstMonday = (8 - startDayOfWeek) % 7;
    const firstMondayOfYear = new Date(startOfYear.getTime() + daysUntilFirstMonday * 86400000);
    const startOfPeriod = new Date(firstMondayOfYear.getTime() + (period * 2) * 7 * 86400000);

    const start = new Date(startOfPeriod);
    start.setHours(0, 0, 0, 0);

    const end = new Date(startOfPeriod);
    end.setDate(end.getDate() + 14);
    end.setHours(0, 0, 0, 0);

    return {
      start: start.getTime(),
      end: end.getTime(),
    };
  }

  if (windowType === "2_MONTHS") {
    const year = nowInTimezone.getFullYear();
    const month = nowInTimezone.getMonth();
    const period = Math.floor(month / 2);

    const start = new Date(year, period * 2, 1, 0, 0, 0);
    const end = new Date(year, (period * 2) + 2, 1, 0, 0, 0);

    return {
      start: start.getTime(),
      end: end.getTime(),
    };
  }

  if (windowType === "6_MONTHS") {
    const year = nowInTimezone.getFullYear();
    const month = nowInTimezone.getMonth();
    const period = month < 6 ? 0 : 1;

    const start = new Date(year, period * 6, 1, 0, 0, 0);
    const end = new Date(year, (period * 6) + 6, 1, 0, 0, 0);

    return {
      start: start.getTime(),
      end: end.getTime(),
    };
  }

  if (windowType === "CUSTOM" && customDurationDays) {
    const year = nowInTimezone.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((nowInTimezone.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const period = Math.floor(dayOfYear / customDurationDays);

    const start = new Date(startOfYear.getTime() + (period * customDurationDays * 24 * 60 * 60 * 1000));
    start.setHours(0, 0, 0, 0);

    const end = new Date(start.getTime() + (customDurationDays * 24 * 60 * 60 * 1000));
    end.setHours(0, 0, 0, 0);

    return {
      start: start.getTime(),
      end: end.getTime(),
    };
  }

  // Fallback
  return {
    start: 0,
    end: 0,
  };
}

/**
 * Get time remaining in current window as human-readable string
 */
export function getTimeRemaining(windowEnd: number, timezone: string): string {
  const now = Date.now();
  const remaining = windowEnd - now;

  if (remaining <= 0) {
    return "Expired";
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

/**
 * Get window display label
 */
export function getWindowLabel(windowType: WindowType, customDurationDays?: number): string {
  switch (windowType) {
    case "WEEK":
      return "Weekly";
    case "MONTH":
      return "Monthly";
    case "YEAR":
      return "Yearly";
    case "2_WEEKS":
      return "2 Weeks";
    case "2_MONTHS":
      return "2 Months";
    case "6_MONTHS":
      return "6 Months";
    case "CUSTOM":
      return customDurationDays ? `${customDurationDays} Days` : "Custom";
  }
}

/**
 * Get ISO week number from date
 * Returns week number 1-53
 */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
