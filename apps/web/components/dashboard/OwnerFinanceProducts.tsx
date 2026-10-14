import { formatBrl, formatBrlCompact } from '@rede-social/contracts/money';
import {
  FINANCE_STALLED_DAYS,
  type FinanceProductSummary,
  ownerFinanceProduct,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import type { KpiDelta } from '@rede-social/module-dashboard/ui';
import { Card, cn, StatusPill } from '@rede-social/ui';
import { ArrowDown, ArrowUp, ChevronRight, Minus } from 'lucide-react';
import { ownerWaitlistHref } from '@/lib/owner-band-scope';
import {
  financeProductAnchor,
  financeTabView,
  type OwnerFinanceView,
  ownerFinanceHref,
} from '@/lib/owner-finance-view';
import { Cell, EventCard, eventRevenue, Linked } from './BandScopeCards';
import { type CoverKind, CoverThumb } from './CoverThumb';
import { ExamplePill } from './ExamplePill';
import {
  changeDelta,
  type DashboardT,
  exampleBadge,
  formatCount,
  formatDayMonth,
  kpiDelta,
} from './format';
import { PanelSection } from './PanelSection';

const KEY = 'tenantOwner.finance.products';

/** Every store product's card numbers, best revenue of the month first. */
export function financeProducts(): FinanceProductSummary[] {
  return tenantOwnerPanel.store.products
    .map((row) => ownerFinanceProduct(row.id))
    .sort((a, b) => b.month.cents - a.month.cents || a.name.localeCompare(b.name));
}

/** Each store product's cover icon (quick 261014-ia8 F-7); an unknown product reads as an order. */
const PRODUCT_COVER: Readonly<Record<string, CoverKind>> = {
  s1: 'mentoring',
  s2: 'community',
  s3: 'ebook',
  s4: 'recorded',
};

export function productCoverKind(id: string): CoverKind {
  return PRODUCT_COVER[id] ?? 'order';
}

/** Stalled: no paid order for over 60 days (PD-9). */
export function isStalled(product: FinanceProductSummary): boolean {
  return product.lastSaleDaysAgo === null || product.lastSaleDaysAgo > FINANCE_STALLED_DAYS;
}

const ARROW = { up: ArrowUp, down: ArrowDown, flat: Minus } as const;
const TONE = { success: 'text-success', danger: 'text-danger', neutral: 'text-text-tertiary' };

/** A change line as the KPI cards draw it: the arrow, the text, the screen-reader sentiment. */
export function DeltaLine({ delta }: { delta: KpiDelta }) {
  const Arrow = ARROW[delta.direction];
  return (
    <span className={cn('flex items-center gap-1 text-xs font-semibold', TONE[delta.tone])}>
      <Arrow aria-hidden size={14} className="shrink-0" />
      <span>{delta.text}</span>
      {delta.sentiment ? <span className="sr-only">{delta.sentiment}</span> : null}
    </span>
  );
}

/** The revenue against the 30 days before; a product that sold in neither says so, with no arrow. */
export function ProductChange({ t, product }: { t: DashboardT; product: FinanceProductSummary }) {
  const delta = changeDelta(product.month.cents, product.before.cents);
  if (delta) return <DeltaLine delta={kpiDelta(t, delta)} />;
  return (
    <span className="text-xs text-text-secondary">
      {t(product.month.cents === 0 ? `${KEY}.noSales` : `${KEY}.newSales`)}
    </span>
  );
}

/** The product's name (the detail's heading), with the "Parado" pill when it stalled. */
export function ProductName({
  t,
  product,
  as: Name = 'span',
}: {
  t: DashboardT;
  product: FinanceProductSummary;
  as?: 'span' | 'h3';
}) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Name className="text-xl font-bold leading-tight text-text">{product.name}</Name>
      {isStalled(product) ? <StatusPill tone="warning">{t(`${KEY}.stalled`)}</StatusPill> : null}
    </span>
  );
}

/** Thin lines between the columns: between each pair in two rows, between all four in one. */
const CELL_EDGES = [
  'pr-2',
  'border-l border-border px-2 @xs:pr-2',
  'pr-2 @xs:border-l @xs:border-border @xs:px-2',
  'border-l border-border px-2 @xs:pr-0',
] as const;

/**
 * One product as a card (D-08, PD-9): a low cover band with the product's icon and tone (quick
 * 261014-ia8 F-7), the name, four columns split by thin lines (the
 * store price, the month's sales as an entry and as an add-on, the revenue), the change against the
 * 30 days before and a chevron: the whole card opens the product.
 */
function ProductCard({
  t,
  product,
  href,
}: {
  t: DashboardT;
  product: FinanceProductSummary;
  href: string;
}) {
  return (
    <Linked href={href}>
      <Card className="flex flex-col transition-colors hover:bg-card-hover">
        <CoverThumb t={t} kind={productCoverKind(product.id)} seed={product.id} variant="strip" />
        {/* A container: the four columns become two rows of two when the card is narrower than
            20rem (a 360 px phone), so "R$ 4,1 mil" never gets cut. */}
        <div className="@container flex flex-col gap-3 p-4 [overflow-wrap:anywhere]">
          <ProductName t={t} product={product} />
          <dl className="grid grid-cols-2 gap-y-3 border-t border-border pt-3 @xs:grid-cols-[repeat(4,minmax(max-content,1fr))] @xs:gap-y-0">
            {[
              { label: t(`${KEY}.price`), value: formatBrl(product.priceCents) },
              { label: t(`${KEY}.entry`), value: formatCount(product.month.entry) },
              { label: t(`${KEY}.addon`), value: formatCount(product.month.addon) },
              { label: t(`${KEY}.revenue`), value: formatBrlCompact(product.month.cents) },
            ].map((cell, i) => (
              <Cell
                key={cell.label}
                label={cell.label}
                value={cell.value}
                className={CELL_EDGES[i]}
              />
            ))}
          </dl>
          <span className="flex items-center justify-between gap-2">
            <ProductChange t={t} product={product} />
            <ChevronRight aria-hidden size={18} className="shrink-0 text-brand" />
          </span>
        </div>
      </Card>
    </Linked>
  );
}

/** The paid events: the next ones soonest first, then the past ones most recent first (PD-12). */
function paidEvents() {
  const { upcoming, past } = tenantOwnerPanel.events;
  const paid = (event: { ticketCents: { value: number } }) => event.ticketCents.value > 0;
  return {
    events: [
      ...upcoming.filter(paid).sort((a, b) => a.date.localeCompare(b.date)),
      ...past.filter(paid).sort((a, b) => b.date.localeCompare(a.date)),
    ],
    free: [...upcoming, ...past].filter((event) => !paid(event)).length,
    upcomingIds: new Set(upcoming.map((event) => event.id)),
  };
}

/** The people waiting for a seat of a full event, or null when it is not full or nobody waits. */
function waitingFor(event: { id: string; confirmed: number; capacity: number | null }) {
  const row = tenantOwnerPanel.events.waitlist.value.find((entry) => entry.eventId === event.id);
  const full = event.capacity !== null && event.confirmed >= event.capacity;
  return full && row && row.waiting > 0 ? row.waiting : null;
}

/**
 * Eventos pagos (D-04, PD-12): the events with a ticket, each as the events' card under a low cover
 * of its format (quick 261014-ia8 F-7) — date, registrations and the example revenue (one pill for
 * the whole list, the waiting lists being examples too), the ticket on the gray line. A full event with people waiting says so and opens its
 * waiting list in Eventos (quick 261014-ia8 F-1); the others open nothing. Their revenue is never
 * part of the store's total; the free events are counted below.
 */
function PaidEvents({ t }: { t: DashboardT }) {
  const { events, free, upcomingIds } = paidEvents();
  const key = 'tenantOwner.finance.events';
  const [first] = events;
  return (
    <PanelSection title={t(`${key}.title`)}>
      <p className="text-sm text-text-secondary">{t(`${key}.note`)}</p>
      <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        {t(`${key}.exampleNote`)}
        <ExamplePill text={first ? exampleBadge(t, first.ticketCents) : undefined} />
      </p>
      <ul className="flex flex-col gap-3">
        {events.map((event) => {
          // Only an event still to come has people waiting; a past one says when it happened.
          const upcoming = upcomingIds.has(event.id);
          const waiting = upcoming ? waitingFor(event) : null;
          return (
            <li key={event.id} id={`evento-${event.id}`} className="scroll-mt-20">
              <EventCard
                t={t}
                id={event.id}
                href={waiting === null ? null : ownerWaitlistHref(event.id)}
                status={
                  waiting !== null
                    ? t(`${key}.full`, { count: waiting })
                    : upcoming
                      ? undefined
                      : t(`${key}.happened`, { date: formatDayMonth(event.date) })
                }
                cover={<CoverThumb t={t} kind={event.format} seed={event.id} variant="strip" />}
                detail={t(`${key}.ticket`, { value: formatBrl(event.ticketCents.value) })}
                cells={[
                  { label: t(`${key}.date`), value: formatDayMonth(event.date) },
                  { label: t(`${key}.confirmed`), value: formatCount(event.confirmed) },
                  { label: t(`${key}.revenue`), value: eventRevenue(t, event) },
                ]}
              >
                {waiting === null ? null : (
                  <span className="flex items-center justify-between gap-2 text-sm font-bold text-brand">
                    {t(`${key}.seeWaitlist`)}
                    <ChevronRight aria-hidden size={18} className="shrink-0" />
                  </span>
                )}
              </EventCard>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-text-secondary">{t(`${key}.free`, { count: free })}</p>
    </PanelSection>
  );
}

/** Produtos (D-08): the store's products by the month's revenue, each opening its detail. */
export function OwnerFinanceProducts({ t }: { t: DashboardT; view: OwnerFinanceView }) {
  const products = financeProducts();
  return (
    <>
      <PanelSection title={t(`${KEY}.title`)}>
        <p className="text-sm text-text-secondary">{t(`${KEY}.order`)}</p>
        <ul className="flex flex-col gap-3">
          {products.map((product) => (
            <li key={product.id} id={financeProductAnchor(product.id)} className="scroll-mt-20">
              <ProductCard
                t={t}
                product={product}
                href={ownerFinanceHref({ ...financeTabView('products'), productId: product.id })}
              />
            </li>
          ))}
        </ul>
      </PanelSection>
      <PaidEvents t={t} />
    </>
  );
}
