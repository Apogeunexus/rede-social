import { formatBrl } from '@rede-social/contracts/money';
import {
  type EngagementBand,
  type OwnerMemberInsights,
  ownerMemberInsights,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import { ActionCard, BarList, KpiCard, KpiGrid, LineChart } from '@rede-social/module-dashboard/ui';
import { Card, cn, StatusPill, type StatusTone } from '@rede-social/ui';
import { ChevronLeft, Lightbulb } from 'lucide-react';
import { type OwnerMembersView, ownerScopeHref } from '@/lib/owner-band-scope';
import { ExamplePill } from './ExamplePill';
import {
  communityLabel,
  type DashboardT,
  exampleBadge,
  formatCount,
  formatDate,
  formatDayMonth,
  formatHoursMinutes,
  formatMonthAbbrev,
  formatMonthYear,
  initials,
} from './format';
import { PanelSection, PreviewAction } from './PanelSection';

const BAND_TONE: Record<EngagementBand, StatusTone> = {
  new: 'neutral',
  superfan: 'success',
  engaged: 'success',
  occasional: 'neutral',
  at_risk: 'warning',
  inactive: 'danger',
};

/** How far back each history entry is (the fixture's 60 and 30 days, then today). */
const HISTORY_DAYS = [60, 30] as const;

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

const ALL_EVENTS = [...tenantOwnerPanel.events.past, ...tenantOwnerPanel.events.upcoming];

function eventOf(id: string) {
  const event = ALL_EVENTS.find((row) => row.id === id);
  if (!event) throw new Error(`no event ${id}`);
  return event;
}

function communityOf(t: DashboardT, id: string): string {
  const community = tenantOwnerPanel.byCommunity.find((row) => row.id === id);
  if (!community) throw new Error(`no community ${id}`);
  return communityLabel(t, community);
}

/** The first in-person event still to come: the "próximo encontro" the suggestions point at. */
function nextMeeting(t: DashboardT): string {
  const meeting = tenantOwnerPanel.events.upcoming.find((row) => row.format === 'in_person');
  if (!meeting) throw new Error('no upcoming in-person event');
  return t('tenantOwner.bandScope.event', {
    name: meeting.name,
    date: formatDayMonth(meeting.date),
  });
}

function bandName(t: DashboardT, band: EngagementBand): string {
  return t(`tenantOwner.memberDetail.band.${band}`);
}

function Header({ t, insights }: { t: DashboardT; insights: OwnerMemberInsights }) {
  return (
    <Card className="flex items-start gap-3 p-4">
      <span
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand"
      >
        {initials(insights.name)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 [overflow-wrap:anywhere]">
        <h3 className="text-lg font-bold text-text">{insights.name}</h3>
        <StatusPill tone={BAND_TONE[insights.band]} className="w-fit">
          {bandName(t, insights.band)}
        </StatusPill>
        <dl className="flex flex-col gap-0.5 text-xs text-text-secondary">
          <div>
            <dt className="inline font-semibold">{t('tenantOwner.bandMembers.since')}</dt>{' '}
            <dd className="inline">{formatMonthYear(insights.memberSince)}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">{t('tenantOwner.bandMembers.topCommunity')}</dt>{' '}
            <dd className="inline">{communityOf(t, insights.topCommunityId)}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}

function Last30({ t, insights }: { t: DashboardT; insights: OwnerMemberInsights }) {
  const { last30 } = insights;
  const key = 'tenantOwner.memberDetail.last30';
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      <KpiGrid className="grid-cols-2">
        <KpiCard label={t(`${key}.activeDays`)} value={formatCount(last30.activeDays)} />
        <KpiCard label={t(`${key}.likes`)} value={formatCount(last30.likes)} />
        <KpiCard label={t(`${key}.comments`)} value={formatCount(last30.comments)} />
        <KpiCard
          label={t(`${key}.strongActions`)}
          value={formatCount(last30.strongActions)}
          note={t(`${key}.strongNote`)}
        />
        <KpiCard
          label={t(`${key}.dailyTime`)}
          value={formatHoursMinutes(t, last30.dailyMinutes.value)}
          badge={exampleBadge(t, last30.dailyMinutes)}
        />
        <KpiCard
          label={t(`${key}.postsSeen`)}
          value={formatCount(last30.postsSeen.value)}
          badge={exampleBadge(t, last30.postsSeen)}
        />
      </KpiGrid>
    </PanelSection>
  );
}

function Evolution({ t, insights }: { t: DashboardT; insights: OwnerMemberInsights }) {
  const key = 'tenantOwner.memberDetail.evolution';
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      <ol className="flex flex-col gap-1 text-sm text-text">
        {insights.bandHistory.map((entry, index) => {
          const days = HISTORY_DAYS[index];
          const when =
            days === undefined
              ? t(`${key}.today`)
              : t(`${key}.past`, { month: formatMonthAbbrev(entry.month), days });
          return (
            <li key={entry.month}>
              {t(`${key}.line`, {
                when,
                band: entry.band ? bandName(t, entry.band) : t(`${key}.notMember`),
              })}
            </li>
          );
        })}
      </ol>
      <Card className="flex flex-col gap-3 p-4">
        <p className="text-xs font-bold text-text-secondary">{t(`${key}.weeklyTitle`)}</p>
        <LineChart
          series={insights.weeklyActiveDays}
          xLabels={insights.weeklyActiveDays.map((_, i) =>
            (i + 1) % 4 === 0 ? t('tenantOwner.weekly.week', { week: i + 1 }) : '',
          )}
          yStep={7}
          formatValue={formatCount}
          ariaLabel={t(`${key}.weeklyLabel`)}
        />
      </Card>
    </PanelSection>
  );
}

function WhereInteracts({ t, insights }: { t: DashboardT; insights: OwnerMemberInsights }) {
  const key = 'tenantOwner.memberDetail.where';
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      <Card className="flex flex-col gap-3 p-4">
        <p className="text-xs font-bold text-text-secondary">{t(`${key}.communities`)}</p>
        <BarList
          rows={insights.communities.map((row, index) => ({
            id: row.id,
            label: communityOf(t, row.id),
            value: row.actions,
            display: formatCount(row.actions),
            highlight: index === 0,
          }))}
        />
      </Card>
      <Card className="flex flex-col gap-3 p-4">
        <p className="text-xs font-bold text-text-secondary">{t(`${key}.postTypes`)}</p>
        <BarList
          rows={insights.postTypes.map((row) => ({
            id: row.type,
            label: t(`postTypes.${row.type}`),
            value: row.interactions,
            display: formatCount(row.interactions),
          }))}
        />
      </Card>
    </PanelSection>
  );
}

function Events({ t, insights }: { t: DashboardT; insights: OwnerMemberInsights }) {
  const key = 'tenantOwner.memberDetail.events';
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      {insights.events.length === 0 ? (
        <p className="text-sm text-text-secondary">{t(`${key}.empty`)}</p>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {insights.events.map((entry) => {
              const event = eventOf(entry.id);
              const [tone, label]: [StatusTone, string] =
                entry.attended === null
                  ? ['brand', t(`${key}.registered`)]
                  : entry.attended
                    ? ['success', t(`${key}.attended`)]
                    : ['neutral', t(`${key}.missed`)];
              return (
                <li key={entry.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="min-w-0 text-sm text-text [overflow-wrap:anywhere]">
                    {t(`${key}.row`, { name: event.name, date: formatDayMonth(event.date) })}
                  </span>
                  <StatusPill tone={tone} className="shrink-0">
                    {label}
                  </StatusPill>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </PanelSection>
  );
}

function Purchases({ t, insights }: { t: DashboardT; insights: OwnerMemberInsights }) {
  const key = 'tenantOwner.memberDetail.purchases';
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      {insights.purchases.length === 0 ? (
        <p className="text-sm text-text-secondary">{t(`${key}.empty`)}</p>
      ) : (
        insights.purchases.map((purchase) => {
          const product = tenantOwnerPanel.store.products.find(
            (row) => row.id === purchase.productId,
          );
          if (!product) throw new Error(`no product ${purchase.productId}`);
          return (
            <Card
              key={`${purchase.productId}-${purchase.date}`}
              className="flex flex-col gap-1 p-4 [overflow-wrap:anywhere]"
            >
              <span className="text-sm font-bold text-text">{product.product}</span>
              <span className="text-xs text-text-secondary">
                {t(`${key}.bought`, {
                  date: formatDate(purchase.date),
                  value: formatBrl(purchase.cents),
                })}
              </span>
              <span className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                {t(`${key}.expires`, { date: formatDate(purchase.expiresAt.value) })}
                <ExamplePill text={exampleBadge(t, purchase.expiresAt)} />
              </span>
            </Card>
          );
        })
      )}
    </PanelSection>
  );
}

function Support({ t, insights }: { t: DashboardT; insights: OwnerMemberInsights }) {
  const key = 'tenantOwner.memberDetail.support';
  const { conversations, lastDaysAgo, medianResponseMinutes } = insights.support;
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      <p className="text-sm text-text-secondary">
        {conversations === 0 || lastDaysAgo === null || medianResponseMinutes === null
          ? t(`${key}.empty`)
          : t(`${key}.summary`, {
              count: conversations,
              days: lastDaysAgo,
              time: formatHoursMinutes(t, medianResponseMinutes),
            })}
      </p>
    </PanelSection>
  );
}

/**
 * One member's insights in the level-4 Membros area (quick 261012-qer B-3), opened from their band
 * card: "Voltar" to the same scope with the same band open at #faixas, then the header, the last 30
 * days (example values marked), the band history with the weekly active days, where they interact,
 * their events, purchases and support counts (never message text), and a suggested next step whose
 * button is disabled like every preview action. Visible to the client's management only.
 */
export function OwnerMemberDetail({ t, view }: { t: DashboardT; view: OwnerMembersView }) {
  // The parser only lets roster ids through, so a missing member is a bug.
  const insights = view.memberId ? ownerMemberInsights(view.memberId) : null;
  if (!insights) throw new Error(`no insights for member ${view.memberId ?? '(none)'}`);
  const { kind, days } = insights.suggestion;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <a
        href={ownerScopeHref(view.scope, view.band)}
        className={cn(
          'inline-flex min-h-11 w-fit items-center gap-1 rounded-md text-sm font-bold text-brand',
          FOCUS_RING,
        )}
      >
        <ChevronLeft aria-hidden size={18} />
        {t('tenantOwner.memberDetail.back')}
      </a>
      <Header t={t} insights={insights} />
      <Last30 t={t} insights={insights} />
      <Evolution t={t} insights={insights} />
      <WhereInteracts t={t} insights={insights} />
      <Events t={t} insights={insights} />
      <Purchases t={t} insights={insights} />
      <Support t={t} insights={insights} />
      <ActionCard
        icon={Lightbulb}
        title={t('tenantOwner.memberDetail.suggestion.title')}
        detail={t(`tenantOwner.memberDetail.suggestion.${kind}.detail`, {
          days,
          event: nextMeeting(t),
        })}
        action={
          <PreviewAction variant="outline">
            {t(`tenantOwner.memberDetail.suggestion.${kind}.action`)}
          </PreviewAction>
        }
      />
    </div>
  );
}
