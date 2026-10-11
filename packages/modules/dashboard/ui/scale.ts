/**
 * Pure geometry for the panel charts: every mark is drawn to scale from the data (never by eye), and
 * a degenerate series (one point, a flat line, a zero max) never divides by zero.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  lo: number;
  hi: number;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const NO_PADDING: Padding = { top: 0, right: 0, bottom: 0, left: 0 };

/** The axis range: the data's min and max floored / ceiled to `step` (one shared scale per chart). */
export function niceBounds(values: readonly number[], step: number): Bounds {
  if (values.length === 0) return { lo: 0, hi: step };
  return {
    lo: Math.floor(Math.min(...values) / step) * step,
    hi: Math.ceil(Math.max(...values) / step) * step,
  };
}

/**
 * Evenly spaced x, y inverted (SVG grows downwards), inside `width` x `height` minus the padding.
 * Without `bounds` the series' own min/max is the range (a sparkline).
 */
export function linearPoints(
  values: readonly number[],
  width: number,
  height: number,
  padding: Padding = NO_PADDING,
  bounds?: Bounds,
): Point[] {
  if (values.length === 0) return [];
  const lo = bounds?.lo ?? Math.min(...values);
  const hi = bounds?.hi ?? Math.max(...values);
  const range = hi - lo || 1;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const last = values.length - 1;
  return values.map((value, i) => ({
    x: padding.left + (last === 0 ? innerW / 2 : (i * innerW) / last),
    y: padding.top + innerH * (1 - (value - lo) / range),
  }));
}

/** `M x,y L x,y …` with one decimal. */
export function pathFrom(points: readonly Point[]): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
}

/** A bar's fill as a percent of `max`, clamped to [0, 100]; 0 when `max` is not positive. */
export function barPercent(value: number, max: number): number {
  if (!(max > 0)) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/**
 * A funnel's step-over-step rates (0–1): `null` for the first step and after an empty one. The UI
 * formats them, so the rate always matches the counts drawn next to it.
 */
export function funnelRates(values: readonly number[]): (number | null)[] {
  return values.map((value, i) => {
    const before = i === 0 ? undefined : values[i - 1];
    return before ? value / before : null;
  });
}

/**
 * The funnel step that loses the most (the drop from the step before it): `{ index, drop }`, the
 * first such step on a tie, or `null` when no step loses anything.
 */
export function largestDrop(values: readonly number[]): { index: number; drop: number } | null {
  let best: { index: number; drop: number } | null = null;
  for (let i = 1; i < values.length; i += 1) {
    const drop = (values[i - 1] ?? 0) - (values[i] ?? 0);
    if (drop > 0 && (best === null || drop > best.drop)) best = { index: i, drop };
  }
  return best;
}
