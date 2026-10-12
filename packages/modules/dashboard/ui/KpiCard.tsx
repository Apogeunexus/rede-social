import { Card, cn, StatusPill } from '@rede-social/ui';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

export type KpiDirection = 'up' | 'down' | 'flat';
export type KpiTone = 'success' | 'danger' | 'neutral';

export interface KpiDelta {
  /** The change, already formatted by the host ("2 vs. mês anterior"). */
  text: string;
  /** The arrow: what the number did. */
  direction: KpiDirection;
  /** Supplemental colour: whether the change is good news. */
  tone: KpiTone;
  /** Screen-reader word for the tone ("melhorou"), so the meaning never rests on colour alone. */
  sentiment?: string;
}

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  /** Small text after the value ("de 1 GB"). */
  unit?: string;
  delta?: KpiDelta;
  note?: string;
  /** A slot under the numbers, for a `Sparkline`. */
  chart?: ReactNode;
  /** `missing`: a metric the app cannot measure yet — dashed border, muted value. */
  variant?: 'default' | 'missing';
  /** A small neutral pill next to the value ("exemplo"), already worded by the host. */
  badge?: string;
}

const DIRECTION_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus } as const;

const TONE_CLASS: Record<KpiTone, string> = {
  success: 'text-success',
  danger: 'text-danger',
  neutral: 'text-text-tertiary',
};

/**
 * One key number. The module holds no words, no clock and no route (MOD-02, PWA-03): every string
 * arrives formatted from the web tier. Direction is an arrow icon next to the delta text; the tone
 * colour only supplements it, and `sentiment` repeats it for screen readers.
 */
export function KpiCard({
  label,
  value,
  unit,
  delta,
  note,
  chart,
  variant = 'default',
  badge,
}: KpiCardProps) {
  const missing = variant === 'missing';
  const Arrow = delta ? DIRECTION_ICON[delta.direction] : null;
  const valueSpan = (
    <span
      className={cn(
        'font-extrabold tabular-nums leading-tight',
        missing ? 'text-base text-text-tertiary' : 'text-2xl text-text',
      )}
    >
      {value}
      {unit ? <span className="ml-1 text-sm font-semibold text-text-secondary">{unit}</span> : null}
    </span>
  );
  return (
    <Card
      className={cn(
        'flex min-w-0 flex-col gap-1 p-3 [overflow-wrap:anywhere]',
        missing && 'border border-dashed border-border-secondary bg-transparent shadow-none',
      )}
    >
      <span className="text-xs font-bold text-text-secondary">{label}</span>
      {badge ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {valueSpan}
          <StatusPill tone="neutral" className="px-2 py-0.5">
            {badge}
          </StatusPill>
        </div>
      ) : (
        valueSpan
      )}
      {delta && Arrow ? (
        <span
          className={cn('flex items-center gap-1 text-xs font-semibold', TONE_CLASS[delta.tone])}
        >
          <Arrow aria-hidden size={14} className="shrink-0" />
          <span>{delta.text}</span>
          {delta.sentiment ? <span className="sr-only">{delta.sentiment}</span> : null}
        </span>
      ) : null}
      {note ? <span className="text-xs text-text-tertiary">{note}</span> : null}
      {chart ? <div className="mt-1">{chart}</div> : null}
    </Card>
  );
}

export interface KpiGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * The KPI row as a WRAPPING grid: exactly two columns at 360–430 px, more on wider screens, never a
 * sideways-scrolling strip (vertical scroll only).
 */
export function KpiGrid({ children, className }: KpiGridProps) {
  return (
    <div className={cn('grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3', className)}>
      {children}
    </div>
  );
}
