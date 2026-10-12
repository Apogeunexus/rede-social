import type { EngagementBand, EngagementBands } from '../fixtures/shared';

/**
 * Pure engagement helpers: every percent and total a panel shows is computed from the bands, never
 * typed next to them. No words, no clock (MOD-02); the web tier formats.
 */

/** The exclusive bands in evaluation order (also the order a band list is drawn in). */
export const ENGAGEMENT_BAND_ORDER: readonly EngagementBand[] = [
  'new',
  'superfan',
  'engaged',
  'occasional',
  'at_risk',
  'inactive',
];

/** Every member of the base: the sum of the six bands. */
export function bandTotal(bands: EngagementBands): number {
  return ENGAGEMENT_BAND_ORDER.reduce((sum, band) => sum + bands.counts[band], 0);
}

/** "Interagiu": superfãs + engajados + ocasionais + novos ativados. */
export function interactedCount(bands: EngagementBands): number {
  const { superfan, engaged, occasional } = bands.counts;
  return superfan + engaged + occasional + bands.newActivated;
}

/** `part` as 0–100 of `whole`, unrounded; 0 when `whole` is not positive. */
export function percentOf(part: number, whole: number): number {
  if (!(whole > 0)) return 0;
  return (part / whole) * 100;
}

/** The picked number of every row, summed (0 for no rows). */
export function sumOf<T>(rows: readonly T[], pick: (row: T) => number): number {
  return rows.reduce((total, row) => total + pick(row), 0);
}

/** `total / count` rounded to a whole number ("65 por post"); 0 when `count` is not positive. */
export function perItem(total: number, count: number): number {
  return count > 0 ? Math.round(total / count) : 0;
}

/** Check-ins as 0–100 of the confirmed RSVPs over a list of events, unrounded (0 for no RSVPs). */
export function attendancePercent(
  rows: readonly { confirmed: number; checkIns: number }[],
): number {
  return percentOf(
    sumOf(rows, (row) => row.checkIns),
    sumOf(rows, (row) => row.confirmed),
  );
}

/** "Interagiu" as 0–100 of the base, unrounded. */
export function interactedPercent(bands: EngagementBands): number {
  return percentOf(interactedCount(bands), bandTotal(bands));
}

/** "Engajados" (superfãs + engajados) as 0–100 of the base, unrounded. */
export function engagedPercent(bands: EngagementBands): number {
  return percentOf(bands.counts.superfan + bands.counts.engaged, bandTotal(bands));
}

/** Counts of a client's members or devices below this are shown as "menos de 5" to platform support (D-02). */
export const PRIVACY_FLOOR = 5;

/** Whether a count is small enough to re-identify someone (`count < PRIVACY_FLOOR`). */
export function isBelowPrivacyFloor(count: number): boolean {
  return count < PRIVACY_FLOOR;
}

/** One displayed row of a floored band list: one or more adjacent bands, summed. */
export interface BandGroup {
  bands: EngagementBand[];
  count: number;
}

/**
 * The bands as rows where no row is under `floor` (C-1). Hiding a small band is not enough when the
 * exact total sits next to the others: the total minus the shown bands gives it back. So a small band
 * is merged with a neighbour instead — the smallest small group first (lowest index on a tie), into
 * its only neighbour at either end, else into the smaller of its two neighbours (the previous on a
 * tie) — until every row reaches the floor. The rows still sum to the exact total and keep band
 * order. A whole base under the floor ends as one row, which equals the total already shown.
 */
export function mergeBandsBelowFloor(
  bands: EngagementBands,
  floor: number = PRIVACY_FLOOR,
): BandGroup[] {
  const groups: BandGroup[] = ENGAGEMENT_BAND_ORDER.map((band) => ({
    bands: [band],
    count: bands.counts[band],
  }));
  while (groups.length > 1) {
    let smallest = -1;
    let smallestCount = floor;
    groups.forEach((group, index) => {
      if (group.count < smallestCount) {
        smallest = index;
        smallestCount = group.count;
      }
    });
    if (smallest < 0) break;
    const previous = groups[smallest - 1];
    const next = groups[smallest + 1];
    const into =
      next === undefined || (previous !== undefined && previous.count <= next.count)
        ? smallest - 1
        : smallest + 1;
    const [first, second] = into < smallest ? [into, smallest] : [smallest, into];
    const a = groups[first];
    const b = groups[second];
    if (a === undefined || b === undefined) break;
    groups.splice(first, 2, { bands: [...a.bands, ...b.bands], count: a.count + b.count });
  }
  return groups;
}

/**
 * Whether showing `part` of `whole` would give away a count under the floor by complement (C-2):
 * "13 de 14" reveals the 1 who did act. True when `part` itself is shown (≥ floor) but
 * `whole − part` is under it, 0 included. When `part` is already floored the complement is a range.
 */
export function isComplementBelowPrivacyFloor(part: number, whole: number): boolean {
  return !isBelowPrivacyFloor(part) && isBelowPrivacyFloor(whole - part);
}

/** A member counts as new (gets the "Novo" tag) for this many days after joining. */
export const NEW_MEMBER_DAYS = 30;

/** Whether a member joined less than `NEW_MEMBER_DAYS` ago. */
export function isNewMember(joinedDaysAgo: number): boolean {
  return joinedDaysAgo < NEW_MEMBER_DAYS;
}

/** A post's interactions against the median as a relative change; `null` while too young or with no median. */
export function vsMedian(
  interactions: number,
  median: number,
  ageHours: number,
  comparableAfterHours: number,
): number | null {
  if (ageHours < comparableAfterHours || !(median > 0)) return null;
  return interactions / median - 1;
}

/** The minutes of a window of days, summed (0 for no days). */
export function totalMinutes(days: readonly { minutes: number }[]): number {
  return days.reduce((total, day) => total + day.minutes, 0);
}

/** The average minutes per day of a window, rounded to whole minutes (0 for no days). */
export function dailyAverageMinutes(days: readonly { minutes: number }[]): number {
  return days.length === 0 ? 0 : Math.round(totalMinutes(days) / days.length);
}

/** The views of a list of viewed posts, summed (0 for no rows). */
export function totalViews(rows: readonly { views: number }[]): number {
  return rows.reduce((total, row) => total + row.views, 0);
}

/** The seconds watched over a list of videos, summed (0 for no rows). */
export function totalWatchedSeconds(rows: readonly { watchedSeconds: number }[]): number {
  return rows.reduce((total, row) => total + row.watchedSeconds, 0);
}

/** A weekly streak shorter than this is not shown. */
export const MIN_STREAK_WEEKS = 2;
