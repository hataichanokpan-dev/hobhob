import type { Checkins } from "@/types";

/**
 * Calculate current streak for a habit
 * Streak = consecutive days with checkin = true
 */
export function calculateCurrentStreak(
  checkins: Checkins,
  habitId: string,
  timezone: string,
  endDate?: string
): number {
  const dates = Object.keys(checkins).sort().reverse();
  if (dates.length === 0) return 0;

  // Start from endDate (or today) and go backwards
  const today = endDate || getTodayDateString(timezone);
  let streak = 0;
  let checkDate = new Date(today);

  // Check up to 365 days back
  for (let i = 0; i < 365; i++) {
    const dateStr = formatDateToString(checkDate, timezone);

    // Check if this date exists in checkins
    if (dateStr in checkins && habitId in checkins[dateStr]) {
      const checked = checkins[dateStr][habitId];
      if (checked === true) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Break on first unchecked day
        break;
      }
    } else {
      // No data for this date, check if it's in the past
      const checkDateStr = formatDateToString(checkDate, timezone);
      if (checkDateStr < today) {
        // If it's a past date with no data, streak is broken
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  return streak;
}

/**
 * Calculate best streak for a habit
 */
export function calculateBestStreak(
  checkins: Checkins,
  habitId: string,
  timezone: string
): number {
  const dates = Object.keys(checkins).sort();
  if (dates.length === 0) return 0;

  let bestStreak = 0;
  let currentStreak = 0;
  let previousDate: string | null = null;

  for (const date of dates) {
    if (!(habitId in checkins[date])) continue;

    const checked = checkins[date][habitId];
    if (checked === true) {
      if (previousDate) {
        // Check if this date is consecutive with previous date
        const prev = new Date(previousDate);
        const curr = new Date(date);
        const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }

      previousDate = date;
    }
  }

  return bestStreak;
}

/**
 * Calculate completion rate for a period (last N days)
 */
export function calculateCompletionRate(
  checkins: Checkins,
  habitId: string,
  days: number,
  timezone: string
): {
  completed: number;
  total: number;
  rate: number;
} {
  const today = getTodayDateString(timezone);
  let completed = 0;
  let total = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDateToString(date, timezone);

    if (dateStr in checkins && habitId in checkins[dateStr]) {
      total++;
      if (checkins[dateStr][habitId] === true) {
        completed++;
      }
    }
  }

  return {
    completed,
    total,
    rate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Get checkin data for a date range (for heatmap)
 */
export function getCheckinsForRange(
  checkins: Checkins,
  habitId: string,
  days: number,
  timezone: string
): Array<{ date: string; checked: boolean | null }> {
  const today = getTodayDateString(timezone);
  const result: Array<{ date: string; checked: boolean | null }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDateToString(date, timezone);

    if (dateStr in checkins && habitId in checkins[dateStr]) {
      result.push({
        date: dateStr,
        checked: checkins[dateStr][habitId],
      });
    } else {
      result.push({
        date: dateStr,
        checked: null,
      });
    }
  }

  return result;
}

/**
 * Format Date to YYYY-MM-DD string in timezone
 */
function formatDateToString(date: Date, timezone: string): string {
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
 * Get today's date string in timezone
 */
function getTodayDateString(timezone: string): string {
  const now = new Date();
  return formatDateToString(now, timezone);
}
