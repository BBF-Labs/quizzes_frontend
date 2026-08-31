/**
 * Academic-year helpers.
 *
 * Academic years are formatted as "YYYY-YYYY" (e.g. "2025-2026"). A single
 * academic year starts in September of the first year and runs through August
 * of the second — so "2025-2026" spans Sep 2025 → Aug 2026. Deriving the
 * current/last year from the clock (instead of hardcoding a list) keeps the
 * pickers from suggesting a year that hasn't started yet or going stale.
 */

/** 0-indexed month the academic year rolls over. 8 = September. */
const ACADEMIC_YEAR_START_MONTH = 8;

/** The academic year currently in session, e.g. "2025-2026". */
export function getCurrentAcademicYear(now: Date = new Date()): string {
  const year = now.getFullYear();
  const startedNewYear = now.getMonth() >= ACADEMIC_YEAR_START_MONTH;
  const startYear = startedNewYear ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

/** The academic year immediately before the current one. */
export function getLastAcademicYear(now: Date = new Date()): string {
  const currentStart = parseInt(getCurrentAcademicYear(now).split("-")[0], 10);
  return `${currentStart - 1}-${currentStart}`;
}

/**
 * Year options for pickers: last + current academic year, ascending.
 * Deliberately excludes the not-yet-started next year.
 */
export function getAcademicYearOptions(now: Date = new Date()): string[] {
  return [getLastAcademicYear(now), getCurrentAcademicYear(now)];
}
