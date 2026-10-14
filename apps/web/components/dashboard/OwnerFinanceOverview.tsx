import { formatBrl, formatBrlWhole } from '@rede-social/contracts/money';
import {
  type Delta,
  type FinanceSummary,
  ownerContentItem,
  ownerFinanceAttention,
  ownerFinanceContentSales,
  ownerFinanceEventSales,
  ownerFinanceProduct,
  ownerFinanceSummary,
  ownerFinanceVipProspects,
  ownerFinanceVipUsage,
  ownerFinanceWeekly,
  ownerFinanceWindow,
} from '@rede-social/module-dashboard/fixtures';
import {
  ActionCard,
  BarList,
  ENGAGEMENT_BAND_ORDER,
  isBelowPrivacyFloor,
  KpiCard,
  KpiGrid,
  LineChart,
  PRIVACY_FLOOR,
  percentOf,
} from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { AlertTriangle, BellRing, ChevronRight, Crown, HeartHandshake } from 'lucide-react';
import type { ReactNode } from 'react';
import { contentTabView, ownerContentHref } from '@/lib/owner-content-view';
import {
  type FinanceAttentionList,
  type FinanceNumber,
  financeAttentionAnchor,
  financeNumberAnchor,
  financeProductAnchor,
  financeTabView,
  ownerFinanceHref,
} from '@/lib/owner-finance-view';
import { ownerEvent } from './BandScopeCards';
import { ExamplePill } from './ExamplePill';
import {
  bandLabel,
  changeDelta,
  type DashboardT,
  exampleBadge,
  formatCount,
  formatDayMonth,
  formatPercent,
  kpiDelta,
} from './format';
import { LegendStroke } from './LegendStroke';
import { financeProducts } from './OwnerFinanceProducts';
import { PanelSection, PreviewAction } from './PanelSection';

const KEY = 'tenantOwner.finance.overview';
const OVERVIEW = financeTabView('overview');

/** The share of the month's revenue that came from add-ons, 0-100. */
export function secondaryShare(summary: FinanceSummary): number {
  return percentOf(summary.secondary.cents, summary.total.cents);
}

/** Revenue per member since the community opened, in cents. */
export function lifetimePerMember(summary: FinanceSummary): number {
  return summary.base > 0 ? summary.lifetimeCents / summary.base : 0;
}

/** A link row of a card list: the whole row opens, landing back on its own id. */
function RowLink({ id, href, children }: { id?: string; href: string; children: ReactNode }) {
  return (
    <a
      id={id}
      href={href}
      className="flex scroll-mt-20 items-center gap-3 px-3 py-3 transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1 [overflow-wrap:anywhere]">
        {children}
      </span>
      <ChevronRight aria-hidden size={18} className="shrink-0 text-brand" />
    </a>
  );
}

/** A number that opens its list: the whole card is a plain link landing back on itself. */
function NumberLink({ number, children }: { number: FinanceNumber; children: ReactNode }) {
  return (
    <a
      href={ownerFinanceHref({ ...OVERVIEW, number })}
      id={financeNumberAnchor(number)}
      className="grid scroll-mt-20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      {children}
    </a>
  );
}

/** A change in percentage points (the share of add-ons), against the 30 days before. */
function pointsDelta(now: number, before: number): Delta {
  const amount = Math.round(Math.abs(now - before));
  const direction: Delta['direction'] = amount === 0 ? 'flat' : now > before ? 'up' : 'down';
  return {
    amount,
    kind: 'points',
    direction,
    good: direction === 'flat' ? null : direction === 'up',
    basis: 'previous_30_days',
  };
}

/**
 * (1) The six numbers of the month (D-07), each against the 30 days before and opening its list;
 * then the month's total, the notice that a registered value is not money received, and the
 * cancellations (D-05) under the privacy floor (D-06).
 */
function Numbers({ t }: { t: DashboardT }) {
  const now = ownerFinanceSummary(0);
  const before = ownerFinanceSummary(30);
  const { revoked } = ownerFinanceWindow(0, 29);
  const key = `${KEY}.numbers`;
  const seeList = (
    <span className="flex items-center gap-1 text-xs font-bold text-brand">
      {t('member.lists.seeList')}
      <ChevronRight aria-hidden size={14} />
    </span>
  );
  const delta = (current: number, previous: number, higherIsGood = true) => {
    const change = changeDelta(current, previous, higherIsGood);
    return change ? kpiDelta(t, change) : undefined;
  };
  const rebought = percentOf(now.rebought, now.base);
  return (
    <PanelSection title={t(`${key}.title`)}>
      <KpiGrid>
        <NumberLink number="primary">
          <KpiCard
            label={t(`${key}.primary`)}
            value={formatBrlWhole(now.primary.cents)}
            delta={delta(now.primary.cents, before.primary.cents)}
            note={t(`${key}.primaryNote`, {
              count: now.primary.orders,
              average: formatBrl(Math.round(now.primary.cents / now.primary.orders)),
            })}
            footer={seeList}
          />
        </NumberLink>
        <NumberLink number="secondary">
          <KpiCard
            label={t(`${key}.secondary`)}
            value={formatBrlWhole(now.secondary.cents)}
            delta={delta(now.secondary.cents, before.secondary.cents)}
            note={t(`${key}.secondaryNote`, { count: now.secondary.orders })}
            footer={seeList}
          />
        </NumberLink>
        <NumberLink number="share">
          <KpiCard
            label={t(`${key}.share`)}
            value={formatPercent(secondaryShare(now))}
            delta={kpiDelta(t, pointsDelta(secondaryShare(now), secondaryShare(before)))}
            note={t(`${key}.shareNote`)}
            footer={seeList}
          />
        </NumberLink>
        <NumberLink number="rebought">
          <KpiCard
            label={t(`${key}.rebought`)}
            value={formatCount(now.rebought)}
            delta={delta(now.rebought, before.rebought)}
            note={t(`${key}.reboughtNote`, { percent: formatPercent(rebought) })}
            footer={seeList}
          />
        </NumberLink>
        <NumberLink number="timeToSecond">
          <KpiCard
            label={t(`${key}.timeToSecond`)}
            value={t(`${key}.days`, { count: Math.round(now.timeToSecondDays) })}
            delta={delta(
              Math.round(now.timeToSecondDays),
              Math.round(before.timeToSecondDays),
              false,
            )}
            note={t(`${key}.timeToSecondNote`)}
            footer={seeList}
          />
        </NumberLink>
        <NumberLink number="lifetime">
          <KpiCard
            label={t(`${key}.lifetime`)}
            value={formatBrl(Math.round(lifetimePerMember(now)))}
            delta={delta(lifetimePerMember(now), lifetimePerMember(before))}
            note={t(`${key}.lifetimeNote`)}
            footer={seeList}
          />
        </NumberLink>
      </KpiGrid>
      <Card className="flex flex-col gap-1.5 p-4">
        <p className="text-sm font-bold text-text">
          {t(`${key}.total`, {
            value: formatBrl(now.total.cents),
            count: now.total.orders,
          })}
        </p>
        <p className="text-xs text-text-secondary">{t(`${KEY}.notice`)}</p>
        <p className="text-xs text-text-secondary" data-floor-line="revoked">
          {isBelowPrivacyFloor(revoked.orders)
            ? t(`${key}.revokedFloor`, { floor: PRIVACY_FLOOR })
            : t(`${key}.revoked`, { count: revoked.orders, value: formatBrl(revoked.cents) })}
        </p>
      </Card>
    </PanelSection>
  );
}

/** One attention row's text: the alert icon and the line, the note (and pill) under it. */
function AttentionText({ title, note }: { title: string; note: ReactNode }) {
  return (
    <>
      <span className="flex items-start gap-1.5 text-sm font-bold text-text">
        <AlertTriangle aria-hidden size={14} className="mt-0.5 shrink-0 text-warning" />
        {title}
      </span>
      <span className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">{note}</span>
    </>
  );
}

/**
 * (2) Precisa de atenção (D-07), in a fixed order: the VIP payers fading, the accesses ending in 7
 * days (example), the product unsold for 60 days, the full event with a waiting list (example).
 * Each row opens what it names.
 */
function Attention({ t }: { t: DashboardT }) {
  const attention = ownerFinanceAttention();
  const { vipFading, expiring, stalled, fullEvents } = attention;
  const key = `${KEY}.attention`;
  const listHref = (list: FinanceAttentionList) =>
    ownerFinanceHref({ ...OVERVIEW, attention: list });
  const vipName = ownerFinanceProduct(expiring.value.productId).name;
  return (
    <PanelSection title={t(`${key}.title`)}>
      <Card>
        <ul className="divide-y divide-border">
          <li>
            <RowLink id={financeAttentionAnchor('vipFading')} href={listHref('vipFading')}>
              <AttentionText
                title={t(`${key}.vipFading`, {
                  count: vipFading.atRisk + vipFading.inactive,
                })}
                note={t(`${key}.vipFadingNote`, {
                  atRisk: vipFading.atRisk,
                  inactive: vipFading.inactive,
                  push: vipFading.withPush,
                })}
              />
            </RowLink>
          </li>
          <li>
            <RowLink id={financeAttentionAnchor('expiring')} href={listHref('expiring')}>
              <AttentionText
                title={t(`${key}.expiring`, { count: expiring.value.count, product: vipName })}
                note={
                  <>
                    {t(`${key}.expiringNote`)}
                    <ExamplePill text={exampleBadge(t, expiring)} />
                  </>
                }
              />
            </RowLink>
          </li>
          {stalled.map((row) => (
            <li key={row.productId}>
              <RowLink
                id={financeProductAnchor(row.productId)}
                href={ownerFinanceHref({ ...OVERVIEW, productId: row.productId })}
              >
                <AttentionText
                  title={t(`${key}.stalled`, {
                    product: ownerFinanceProduct(row.productId).name,
                    days: row.days,
                  })}
                  note={t(`${key}.stalledNote`)}
                />
              </RowLink>
            </li>
          ))}
          {fullEvents.value.map((row) => {
            const event = ownerEvent(row.eventId);
            return (
              <li key={row.eventId}>
                <RowLink
                  href={`${ownerFinanceHref(financeTabView('products'))}#evento-${row.eventId}`}
                >
                  <AttentionText
                    title={t(`${key}.fullEvent`, { event: event.name, count: row.waiting })}
                    note={
                      <>
                        {t(`${key}.fullEventNote`, { date: formatDayMonth(event.date) })}
                        <ExamplePill text={exampleBadge(t, fullEvents)} />
                      </>
                    }
                  />
                </RowLink>
              </li>
            );
          })}
        </ul>
      </Card>
    </PanelSection>
  );
}

/**
 * The y axis in thousands of reais ("1,5 mil"): "R$ 1,5 mil" does not fit the chart's 38-unit
 * label column, and the chart's title already says the values are in reais.
 */
function axisReais(t: DashboardT, cents: number): string {
  if (cents === 0) return '0';
  return t(`${KEY}.weekly.thousands`, { value: THOUSANDS.format(cents / 100_000) });
}

const THOUSANDS = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** One weekly revenue chart: the last 12 weeks and the 12 before, dashed (PD-13). */
export function WeeklyChart({
  t,
  title,
  current,
  previous,
}: {
  t: DashboardT;
  title: string;
  current: readonly number[];
  previous: readonly number[];
}) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <p className="text-xs font-bold text-text-secondary">{title}</p>
      <LineChart
        series={current}
        previous={previous}
        xLabels={current.map((_, i) =>
          (i + 1) % 4 === 0 ? t('tenantOwner.weekly.week', { week: i + 1 }) : '',
        )}
        yStep={50000}
        formatValue={(cents) => axisReais(t, cents)}
        ariaLabel={t(`${KEY}.weekly.label`, { title })}
      />
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        <li className="flex items-center gap-2">
          <LegendStroke dashed={false} />
          {t('tenantOwner.weekly.current')}
        </li>
        <li className="flex items-center gap-2">
          <LegendStroke dashed />
          {t('tenantOwner.weekly.previous')}
        </li>
      </ul>
    </Card>
  );
}

/** (3) Receita por semana: primary and secondary, each against the 12 weeks before. */
function Weekly({ t }: { t: DashboardT }) {
  const { primary, secondary } = ownerFinanceWeekly();
  const key = `${KEY}.weekly`;
  return (
    <PanelSection title={t(`${key}.title`)}>
      <WeeklyChart
        t={t}
        title={t(`${key}.primary`)}
        current={primary.current}
        previous={primary.previous}
      />
      <WeeklyChart
        t={t}
        title={t(`${key}.secondary`)}
        current={secondary.current}
        previous={secondary.previous}
      />
    </PanelSection>
  );
}

/** A plain brand link with a chevron, that switches the tab. */
function TabLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 items-center gap-1 self-start rounded-md text-sm font-bold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {children}
      <ChevronRight aria-hidden size={16} />
    </a>
  );
}

/**
 * (4) De onde vem a receita: by product (the leader highlighted) and by today's band (a band under 5
 * orders shows no value, D-06), each with the way to its tab. Em risco and inativos buy nothing in
 * the month by definition (PD-4): one line says so.
 */
function Sources({ t }: { t: DashboardT }) {
  const month = ownerFinanceWindow(0, 29);
  const products = financeProducts();
  const key = `${KEY}.sources`;
  const bands = ENGAGEMENT_BAND_ORDER.filter((band) => month.byBand[band].orders > 0);
  return (
    <PanelSection title={t(`${key}.title`)}>
      <p className="text-xs font-bold text-text-secondary">{t(`${key}.byProduct`)}</p>
      <BarList
        max={month.total.cents}
        rows={products.map((product, i) => ({
          id: product.id,
          label: product.name,
          value: product.month.cents,
          display: formatBrl(product.month.cents),
          rate:
            product.month.orders === 0
              ? t(`${key}.noOrders`)
              : t(`${key}.rate`, {
                  count: product.month.orders,
                  percent: formatPercent(percentOf(product.month.cents, month.total.cents)),
                }),
          highlight: i === 0,
        }))}
      />
      <TabLink href={ownerFinanceHref(financeTabView('products'))}>
        {t(`${key}.seeProducts`)}
      </TabLink>
      <p className="text-xs font-bold text-text-secondary">{t(`${key}.byBand`)}</p>
      <BarList
        max={month.total.cents}
        rows={bands.map((band) => {
          const row = month.byBand[band];
          const floored = isBelowPrivacyFloor(row.orders);
          return {
            id: band,
            label: bandLabel(t, band),
            value: floored ? 0 : row.cents,
            display: floored ? t(`${key}.floor`, { floor: PRIVACY_FLOOR }) : formatBrl(row.cents),
            rate: floored
              ? undefined
              : t(`${key}.rate`, {
                  count: row.orders,
                  percent: formatPercent(percentOf(row.cents, month.total.cents)),
                }),
            highlight: band === 'superfan' || band === 'engaged',
          };
        })}
      />
      <p className="text-xs text-text-secondary">{t(`${key}.idle`)}</p>
      <TabLink href={ownerFinanceHref(financeTabView('buyers'))}>{t(`${key}.seeBuyers`)}</TabLink>
    </PanelSection>
  );
}

/** "N pedidos · R$ X", or under 5 orders "menos de 5 pedidos" with no value (D-06). */
function floored(t: DashboardT, orders: number, cents: number): string {
  return isBelowPrivacyFloor(orders)
    ? t(`${KEY}.app.floor`, { floor: PRIVACY_FLOOR })
    : t(`${KEY}.app.value`, { count: orders, value: formatBrl(cents) });
}

function AppLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-3 py-3 text-sm">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="flex flex-col gap-1 font-bold text-text">{children}</dd>
    </div>
  );
}

/**
 * (5) O que só o app sabe: the sales by members who interacted with a publication or went to an
 * event up to 7 days before (distinct orders, each publication opening its detail in Conteúdo), and
 * the VIP's revenue next to its use (opening the VIP). Association, not cause.
 */
function AppKnows({ t }: { t: DashboardT }) {
  const content = ownerFinanceContentSales();
  const events = ownerFinanceEventSales();
  const vip = ownerFinanceVipUsage();
  const { total } = ownerFinanceWindow(0, 29);
  const key = `${KEY}.app`;
  // A publication opens in Conteúdo; its Voltar is Conteúdo's (the proposal accepted it).
  const contentHref = (postId: string) => ownerContentHref({ ...contentTabView('posts'), postId });
  return (
    <PanelSection title={t(`${key}.title`)}>
      <Card>
        <dl className="divide-y divide-border [overflow-wrap:anywhere]">
          <AppLine label={t(`${key}.content`)}>
            <span>
              {floored(t, content.total.orders, content.total.cents)}
              {isBelowPrivacyFloor(content.total.orders)
                ? null
                : ` ${t(`${key}.ofRevenue`, {
                    percent: formatPercent(percentOf(content.total.cents, total.cents)),
                  })}`}
            </span>
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border font-normal">
              {[...content.posts]
                .sort((a, b) => b.cents - a.cents)
                .map((post) => (
                  <li key={post.postId}>
                    <a
                      href={contentHref(post.postId)}
                      className="flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="line-clamp-1 text-text">
                          {ownerContentItem(post.postId).excerpt}
                        </span>
                        <span className="font-bold text-text">
                          {floored(t, post.orders, post.cents)}
                        </span>
                      </span>
                      <ChevronRight aria-hidden size={16} className="shrink-0 text-brand" />
                    </a>
                  </li>
                ))}
            </ul>
          </AppLine>
          <AppLine label={t(`${key}.events`)}>
            <span>{floored(t, events.total.orders, events.total.cents)}</span>
            <ul className="flex flex-col gap-0.5 text-xs font-normal text-text-secondary">
              {events.events.map((row) => {
                const event = ownerEvent(row.eventId);
                return (
                  <li key={row.eventId}>
                    {t(`${key}.event`, {
                      name: event.name,
                      date: formatDayMonth(event.date),
                      value: floored(t, row.orders, row.cents),
                    })}
                  </li>
                );
              })}
            </ul>
          </AppLine>
          <div>
            <a
              id={financeProductAnchor('s2')}
              href={ownerFinanceHref({ ...OVERVIEW, productId: 's2' })}
              className="flex scroll-mt-20 items-center gap-3 px-3 py-3 text-sm transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-text-secondary">{t(`${key}.vip`)}</span>
                <span className="font-bold text-text">
                  {t(`${key}.vipLine`, {
                    value: formatBrl(vip.cents),
                    active: formatCount(vip.activeWeek),
                    holders: formatCount(vip.holders),
                  })}
                </span>
              </span>
              <ChevronRight aria-hidden size={18} className="shrink-0 text-brand" />
            </a>
          </div>
        </dl>
      </Card>
      <p className="text-xs text-text-secondary">{t(`${key}.note`)}</p>
    </PanelSection>
  );
}

/** (6) Three next steps from the numbers above, with the preview's disabled buttons. */
function NextSteps({ t }: { t: DashboardT }) {
  const { vipFading, expiring } = ownerFinanceAttention();
  const key = `${KEY}.next`;
  return (
    <PanelSection title={t(`${key}.title`)}>
      <ActionCard
        icon={Crown}
        title={t(`${key}.vip.title`)}
        detail={t(`${key}.vip.detail`, { count: ownerFinanceVipProspects() })}
        action={<PreviewAction variant="outline">{t(`${key}.vip.action`)}</PreviewAction>}
      />
      <ActionCard
        icon={HeartHandshake}
        title={t(`${key}.fading.title`)}
        detail={t(`${key}.fading.detail`, {
          count: vipFading.atRisk + vipFading.inactive,
          push: vipFading.withPush,
        })}
        action={<PreviewAction variant="outline">{t(`${key}.fading.action`)}</PreviewAction>}
      />
      <ActionCard
        icon={BellRing}
        title={t(`${key}.expiring.title`)}
        detail={t(`${key}.expiring.detail`, { count: expiring.value.count })}
        pill={{ tone: 'neutral', text: t('example') }}
        action={<PreviewAction variant="outline">{t(`${key}.expiring.action`)}</PreviewAction>}
      />
    </PanelSection>
  );
}

/**
 * Financeiro › Visão geral (D-07), in order: the six numbers of the month, Precisa de atenção,
 * Receita por semana, De onde vem a receita, O que só o app sabe and Próximos passos. Nothing here
 * names a member: the names are one step down, in the lists.
 */
export function OwnerFinanceOverview({ t }: { t: DashboardT }) {
  return (
    <>
      <Numbers t={t} />
      <Attention t={t} />
      <Weekly t={t} />
      <Sources t={t} />
      <AppKnows t={t} />
      <NextSteps t={t} />
    </>
  );
}
