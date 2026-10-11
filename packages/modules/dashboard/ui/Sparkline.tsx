import { cn } from '@rede-social/ui';
import { linearPoints, pathFrom } from './scale';

const WIDTH = 120;
const HEIGHT = 28;
const PAD = { top: 3, right: 1, bottom: 3, left: 1 };

export interface SparklineProps {
  values: readonly number[];
  className?: string;
}

/**
 * A decorative trend line (the KPI's number and delta carry the meaning, so it is `aria-hidden`).
 * Drawn on the series' own min/max in the brand token through `currentColor`.
 */
export function Sparkline({ values, className }: SparklineProps) {
  const d = pathFrom(linearPoints(values, WIDTH, HEIGHT, PAD));
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height={HEIGHT}
      preserveAspectRatio="none"
      className={cn('block text-brand', className)}
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
