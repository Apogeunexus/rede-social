import { Card, cn } from '@rede-social/ui';
import { barPercent } from './scale';

export interface BarRow {
  id: string;
  label: string;
  value: number;
  /** The visible value, formatted by the host. */
  display: string;
  highlight?: boolean;
  /** Optional secondary figure after the value (a funnel's "% of the previous step"). */
  rate?: string;
}

export interface BarListProps {
  rows: readonly BarRow[];
  /** The 100% mark; defaults to the largest value. */
  max?: number;
  className?: string;
}

/**
 * Horizontal bars drawn to scale (`barPercent`). The rows share one grid (each row a subgrid), so
 * every track starts and ends at the same x whatever its value label. The label column wraps instead of pushing the row
 * wider than a 360 px screen. The highlighted bar is the full brand token, the others a lighter tint.
 */
export function BarList({ rows, max, className }: BarListProps) {
  const top = max ?? Math.max(0, ...rows.map((row) => row.value));
  return (
    <Card className={cn('p-4', className)}>
      <ul className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-x-2 gap-y-3">
        {rows.map((row) => (
          <li key={row.id} className="col-span-3 grid grid-cols-subgrid items-center text-sm">
            <span
              className={cn(
                'min-w-0 [overflow-wrap:anywhere]',
                row.highlight ? 'font-bold text-text' : 'text-text-secondary',
              )}
            >
              {row.label}
            </span>
            <span className="block h-2 overflow-hidden rounded-full bg-bg-tertiary">
              <span
                data-bar-fill
                className={cn(
                  'block h-full rounded-full',
                  row.highlight ? 'bg-brand' : 'bg-brand/50',
                )}
                style={{ width: `${barPercent(row.value, top)}%` }}
              />
            </span>
            <span className="text-right font-bold tabular-nums text-text">
              {row.display}
              {row.rate ? (
                <span className="ml-1 text-xs font-semibold text-text-tertiary">{row.rate}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
