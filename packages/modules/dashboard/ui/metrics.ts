import type { EngagementBand, EngagementBands } from '../fixtures/shared';
import type { MemberPanel } from '../fixtures/tenant-panels';

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

/** A member counts as new (gets the "Novo" tag) for this many days after joining. */
export const NEW_MEMBER_DAYS = 30;

/** Whether a member joined less than `NEW_MEMBER_DAYS` ago. */
export function isNewMember(_joinedDaysAgo: number): boolean {
  throw new Error('not implemented');
}

/** A post's interactions against the median as a relative change; `null` while too young or with no median. */
export function vsMedian(
  _interactions: number,
  _median: number,
  _ageHours: number,
  _comparableAfterHours: number,
): number | null {
  throw new Error('not implemented');
}

/** A weekly streak shorter than this is not shown. */
export const MIN_STREAK_WEEKS = 2;

export type ForYouCard = 'event' | 'support' | 'access' | 'news' | 'community';

/** The member's "Para você" cards, most important first. */
export const FOR_YOU_PRIORITY: readonly ForYouCard[] = [];

export const MAX_FOR_YOU_CARDS = 3;

/** The cards present in `forYou`, in priority order, at most `MAX_FOR_YOU_CARDS`. */
export function selectForYouCards(_forYou: MemberPanel['forYou']): ForYouCard[] {
  throw new Error('not implemented');
}
