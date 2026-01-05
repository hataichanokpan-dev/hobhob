/**
 * Date utility functions for timezone-aware operations
 */

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
