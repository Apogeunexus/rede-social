import type { Delta } from '@rede-social/module-dashboard/fixtures';
import type { KpiDelta } from '@rede-social/module-dashboard/ui';
import type { getTranslations } from 'next-intl/server';

/** The `dashboard` namespace translator (untyped catalog, as every `lib/*-view` module takes it). */
export type DashboardT = Awaited<ReturnType<typeof getTranslations>>;

const INTEGER = new Intl.NumberFormat('pt-BR');
const PERCENT = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 });
const PERCENT_1 = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });

/** `8430` -> `8.430`. */
export function formatCount(value: number): string {
  return INTEGER.format(value);
}

/** A 0–100 number -> `41%`. */
export function formatPercent(value: number): string {
  return PERCENT.format(value / 100);
}

/** A 0–1 ratio -> `62,5%` (one decimal at most). */
export function formatRatio(ratio: number): string {
  return PERCENT_1.format(ratio);
}

/** `0.84` -> `0,84` (two decimals). */
export function formatDecimal(value: number, digits = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

const TIME = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

/** An ISO instant -> `14:02` in the São Paulo clock (fixtures never depend on the server's zone). */
export function formatTime(iso: string): string {
  return TIME.format(new Date(iso));
}

const DAY_MONTH = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});

/** An ISO date -> `08/10`. */
export function formatDayMonth(isoDate: string): string {
  return DAY_MONTH.format(new Date(`${isoDate}T00:00:00Z`));
}

const MONTH_YEAR = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** An ISO date -> `mar. de 2026`. */
export function formatMonthYear(isoDate: string): string {
  return MONTH_YEAR.format(new Date(`${isoDate}T00:00:00Z`));
}

const MONTH_SHORT = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' });

/** `2026-10` -> `out` (the chart's x labels: no trailing dot). */
export function formatMonthShort(isoMonth: string): string {
  return MONTH_SHORT.format(new Date(`${isoMonth}-01T00:00:00Z`)).replace('.', '');
}

function deltaAmount(t: DashboardT, delta: Delta): string {
  switch (delta.kind) {
    case 'percent':
      return formatPercent(delta.amount);
    case 'points':
      return t('amount.points', { value: formatCount(delta.amount) });
    case 'minutes':
      return t('amount.minutes', { value: formatCount(delta.amount) });
    default:
      return formatCount(delta.amount);
  }
}

/** A fixture delta -> the KPI card's delta: catalog text, arrow, tone and screen-reader sentiment. */
export function kpiDelta(t: DashboardT, delta: Delta): KpiDelta {
  const tone = delta.good === null ? 'neutral' : delta.good ? 'success' : 'danger';
  return {
    text: t(`delta.${delta.basis}`, { amount: deltaAmount(t, delta) }),
    direction: delta.direction,
    tone,
    ...(delta.good === null
      ? {}
      : { sentiment: t(delta.good ? 'sentiment.good' : 'sentiment.bad') }),
  };
}
