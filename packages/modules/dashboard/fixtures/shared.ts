/**
 * Shapes shared by every panel fixture. A fixture is RAW DATA, shaped like the API answer it will
 * become: counts, percents as numbers (0–100), enum ids, ISO dates and entity names. Never a
 * sentence, a unit or a label — those are catalog copy the web tier picks.
 */

export type DeltaDirection = 'up' | 'down' | 'flat';

/** How `amount` reads: a plain count, a relative %, percentage points, or minutes. */
export type DeltaKind = 'count' | 'percent' | 'points' | 'minutes';

/** What the amount is compared with; `none` prints the amount alone. */
export type DeltaBasis =
  | 'previous_month'
  | 'previous_30_days'
  | 'previous_24h'
  | 'yesterday'
  | 'last_7_days'
  | 'none';

/**
 * A change against a previous period. `direction` is the arrow (what the number did); `good` is the
 * colour and the screen-reader sentiment (whether that is good news): storage going up is `up` and
 * `good: false`. `null` means neither.
 */
export interface Delta {
  amount: number;
  kind: DeltaKind;
  direction: DeltaDirection;
  good: boolean | null;
  basis: DeltaBasis;
}

/** A KPI with no comparison yet, or one whose healthy value is zero. */
export type KpiHint = 'no_comparison_yet' | 'should_stay_zero';

export type Tone = 'success' | 'warning' | 'danger' | 'neutral';
