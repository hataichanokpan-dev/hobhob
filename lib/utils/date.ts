/**
 * Date utility functions for timezone-aware operations
 */

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
