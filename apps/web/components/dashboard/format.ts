import type {
  Delta,
  EngagementBand,
  KpiHint,
  RelativeMoment,
} from '@rede-social/module-dashboard/fixtures';
import {
  isBelowPrivacyFloor,
  type KpiDelta,
  PRIVACY_FLOOR,
} from '@rede-social/module-dashboard/ui';
import { getTranslations } from 'next-intl/server';
import { moduleLabelResolver } from '@/lib/registry';

/** The `dashboard` namespace translator (untyped catalog, as every `lib/*-view` module takes it). */
export type DashboardT = Awaited<ReturnType<typeof getTranslations>>;

const INTEGER = new Intl.NumberFormat('pt-BR');
const PERCENT = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 });
const PERCENT_1 = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });

/** `8430` -> `8.430`. */
export function formatCount(value: number): string {
  return INTEGER.format(value);
}

/** A count of a client's members or devices for platform support: under 5 reads "menos de 5" (D-02). */
export function formatFloored(t: DashboardT, count: number): string {
  return isBelowPrivacyFloor(count)
    ? t('belowFloor', { floor: PRIVACY_FLOOR })
    : formatCount(count);
}

/** A 0–100 number -> `41%`. */
export function formatPercent(value: number): string {
  return PERCENT.format(value / 100);
}

/** A 0–1 ratio -> `62,5%` (one decimal at most). */
export function formatRatio(ratio: number): string {
  return PERCENT_1.format(ratio);
}

const CHANGE = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
});

/** A relative change (0.44 = +44%) -> `+44%`, `-12%`, `0%`. */
export function formatChange(ratio: number): string {
  return CHANGE.format(ratio);
}

const SIGNED = new Intl.NumberFormat('pt-BR', { signDisplay: 'exceptZero' });

/** A signed count: `87` -> `+87`, `-3` -> `-3`, `0` -> `0`. */
export function formatSignedCount(value: number): string {
  return SIGNED.format(value);
}

const MEGABYTES = new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'megabyte' });

/** `41` -> `41 MB`. */
export function formatMegabytes(value: number): string {
  return MEGABYTES.format(value);
}

const LIST = new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' });

/** `['Feed', 'Loja']` -> `Feed e Loja`. */
export function formatList(items: readonly string[]): string {
  return LIST.format(items);
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

const MONTH_SHORT = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' });

/** `2026-10` -> `out` (the chart's x labels: no trailing dot). */
export function formatMonthShort(isoMonth: string): string {
  return MONTH_SHORT.format(new Date(`${isoMonth}-01T00:00:00Z`)).replace('.', '');
}

const WEEKDAY_SHORT = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' });

/** `2026-10-05` -> `seg` (a chart's x labels: no trailing dot). */
export function formatWeekdayShort(isoDate: string): string {
  return WEEKDAY_SHORT.format(new Date(`${isoDate}T00:00:00Z`)).replace('.', '');
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

/** A KPI with no comparison (or a should-stay-zero target): the hint, with the flat dash. */
export function hintDelta(t: DashboardT, hint: KpiHint): KpiDelta {
  return { text: t(`hint.${hint}`), direction: 'flat', tone: 'neutral' };
}

/** `2026-09` -> `set.` (the abbreviation as pt-BR writes it in a sentence). */
export function formatMonthAbbrev(isoMonth: string): string {
  return MONTH_SHORT.format(new Date(`${isoMonth}-01T00:00:00Z`));
}

/** `100` minutes -> `1h40`. */
export function formatDuration(t: DashboardT, minutes: number): string {
  return t('duration', {
    hours: Math.floor(minutes / 60),
    minutes: String(minutes % 60).padStart(2, '0'),
  });
}

/** `266` minutes -> `4 h 26 min`; under an hour -> `38 min` (a duration in a sentence). */
export function formatHoursMinutes(t: DashboardT, minutes: number): string {
  return t('durationLong', { hours: Math.floor(minutes / 60), minutes: minutes % 60 });
}

/** `130` seconds -> `2 min 10 s`, `252` -> `4 min 12 s`, `45` -> `45 s`, `180` -> `3 min`. */
export function formatMinutesSeconds(t: DashboardT, seconds: number): string {
  return t('durationSeconds', { minutes: Math.floor(seconds / 60), seconds: seconds % 60 });
}

/** `252` seconds -> `4:12` (a video's length). */
export function formatClock(t: DashboardT, seconds: number): string {
  return t('clock', {
    minutes: Math.floor(seconds / 60),
    seconds: String(seconds % 60).padStart(2, '0'),
  });
}

/** An engagement band (or `active`, any of the three active bands) -> its catalog name. */
export function bandLabel(t: DashboardT, band: EngagementBand | 'active'): string {
  return t(`bands.${band}`);
}

/** Merged bands -> one label: `['superfan', 'engaged']` -> `Superfãs e engajados`. */
export function bandGroupLabel(t: DashboardT, bands: readonly EngagementBand[]): string {
  const [first, ...rest] = bands;
  if (first === undefined) return '';
  return formatList([bandLabel(t, first), ...rest.map((band) => t(`bands.lower.${band}`))]);
}

/** `Ana Souza` -> `AS`, `M. Vieira` -> `MV`: the first letter of the first and last words. */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.charAt(0) ?? '';
  const last = words.length > 1 ? (words.at(-1)?.charAt(0) ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

/** `{ daysAgo: 0, time: '09:12' }` -> `hoje 09:12`; 1 -> `ontem …`; more -> `há 14 dias`. */
export function momentText(t: DashboardT, moment: RelativeMoment): string {
  return t('moment', { days: moment.daysAgo, time: moment.time ?? '' });
}

/**
 * Module key -> its name: the app's own tab label (`<key>.nav`, through `moduleLabelResolver`) when
 * the module has one, else the dashboard catalog's name for it.
 */
export async function moduleNamer(t: DashboardT): Promise<(key: string) => string> {
  const resolve = moduleLabelResolver(await getTranslations());
  return (key) => {
    const fallback = t(`modules.${key}`);
    return resolve(key, fallback) ?? fallback;
  };
}
