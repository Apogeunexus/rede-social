import type { EngagementBand, EngagementBands } from '../fixtures/shared';

/**
 * Pure engagement helpers: every percent and total a panel shows is computed from the bands, never
 * typed next to them. No words, no clock (MOD-02); the web tier formats.
 */

/** The exclusive bands in evaluation order (also the order a band list is drawn in). */
export const ENGAGEMENT_BAND_ORDER: readonly EngagementBand[] = [];

/** Every member of the base: the sum of the six bands. */
export function bandTotal(_bands: EngagementBands): number {
  throw new Error('not implemented');
}

/** "Interagiu": superfãs + engajados + ocasionais + novos ativados. */
export function interactedCount(_bands: EngagementBands): number {
  throw new Error('not implemented');
}

/** "Interagiu" as 0–100 of the base, unrounded. */
export function interactedPercent(_bands: EngagementBands): number {
  throw new Error('not implemented');
}

/** "Engajados" (superfãs + engajados) as 0–100 of the base, unrounded. */
export function engagedPercent(_bands: EngagementBands): number {
  throw new Error('not implemented');
}

/** `part` as 0–100 of `whole`, unrounded; 0 when `whole` is not positive. */
export function percentOf(_part: number, _whole: number): number {
  throw new Error('not implemented');
}
