import { linearPoints, niceBounds, pathFrom } from './scale';

/** Close to a phone card's content width, so 11-unit labels render at ~11 px on a 390 px screen. */
const WIDTH = 340;
const HEIGHT = 180;
const PAD = { top: 10, right: 10, bottom: 24, left: 38 };
const LABEL_SIZE = 11;

export interface LineChartProps {
  series: readonly number[];
  /** The previous period, same length: drawn dashed on the SAME y-scale. */
  previous?: readonly number[];
  /** One per point; an empty string draws no label at that point. */
  xLabels: readonly string[];
  /** The axis is floored / ceiled to this step. */
  yStep: number;
  formatValue: (value: number) => string;
  ariaLabel: string;
}

/**
 * A line on one shared y-scale (the bounds come from the union of both series, so the dashed
 * previous period is comparable to the current one by eye), three labelled ticks, a faint area and a
 * dot on the last point. Colours are tokens through `currentColor`: the series in brand, the previous
 * period in the tertiary text token, the grid in the divider token. No words of its own.
 */
export function LineChart({
  series,
  previous,
  xLabels,
  yStep,
  formatValue,
  ariaLabel,
}: LineChartProps) {
  const bounds = niceBounds([...series, ...(previous ?? [])], yStep);
  const yOf = (value: number) =>
    PAD.top +
    (HEIGHT - PAD.top - PAD.bottom) * (1 - (value - bounds.lo) / (bounds.hi - bounds.lo || 1));
  const points = linearPoints(series, WIDTH, HEIGHT, PAD, bounds);
  const previousPoints = previous ? linearPoints(previous, WIDTH, HEIGHT, PAD, bounds) : null;
  const first = points[0];
  const last = points.at(-1);
  const baseline = yOf(bounds.lo);
  const ticks = [bounds.lo, (bounds.lo + bounds.hi) / 2, bounds.hi];

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="block h-auto max-h-64 w-full"
    >
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={yOf(tick)}
            y2={yOf(tick)}
            stroke="currentColor"
            strokeWidth={1}
            className="text-divider"
          />
          <text
            data-tick
            x={PAD.left - 6}
            y={yOf(tick) + 4}
            textAnchor="end"
            fontSize={LABEL_SIZE}
            className="fill-current text-text-tertiary"
          >
            {formatValue(tick)}
          </text>
        </g>
      ))}
      {first && last ? (
        <path
          data-series="area"
          d={`${pathFrom(points)} L${last.x.toFixed(1)},${baseline.toFixed(1)} L${first.x.toFixed(1)},${baseline.toFixed(1)} Z`}
          fill="currentColor"
          fillOpacity={0.08}
          stroke="none"
          className="text-brand"
        />
      ) : null}
      {previousPoints ? (
        <path
          data-series="previous"
          d={pathFrom(previousPoints)}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="5 5"
          className="text-text-tertiary"
        />
      ) : null}
      <path
        data-series="current"
        d={pathFrom(points)}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinejoin="round"
        className="text-brand"
      />
      {last ? (
        <circle
          data-last-point
          cx={last.x}
          cy={last.y}
          r={4.5}
          fill="currentColor"
          strokeWidth={2}
          className="stroke-card text-brand"
        />
      ) : null}
      {points.map((point, i) =>
        xLabels[i] ? (
          <text
            data-x-label
            // biome-ignore lint/suspicious/noArrayIndexKey: one label per fixed point position
            key={i}
            x={point.x}
            y={HEIGHT - 6}
            // The last label ends at the last point, so it never runs past the chart.
            textAnchor={i === points.length - 1 ? 'end' : 'middle'}
            fontSize={LABEL_SIZE}
            className="fill-current text-text-tertiary"
          >
            {xLabels[i]}
          </text>
        ) : null,
      )}
    </svg>
  );
}
