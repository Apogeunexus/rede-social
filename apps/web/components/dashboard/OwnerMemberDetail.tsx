import { formatBrl } from '@rede-social/contracts/money';
import {
  type EngagementBand,
  financeOffer,
  type OwnerBandScope,
  type OwnerMemberInsights,
  ownerMemberInsights,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import { ActionCard, BarList, KpiCard, KpiGrid, LineChart } from '@rede-social/module-dashboard/ui';
import { Card, StatusPill, type StatusTone } from '@rede-social/ui';
import { ChevronRight, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import { type OwnerMemberListSlug, ownerInsightAnchor } from '@/lib/owner-band-scope';
import { BackLink } from './BackLink';
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

function Header({
  t,
  insights,
  scope,
  band,
}: {
  t: DashboardT;
  insights: OwnerMemberInsights;
  scope: OwnerBandScope;
  band: EngagementBand;
}) {
  // In a community the member may sit one band lower than in the whole base (R-4): show both.
  const split = scope.kind === 'community' && band !== insights.band;
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
        {split ? (
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={BAND_TONE[band]} className="w-fit">
              {t('tenantOwner.memberDetail.bandIn', {
                band: bandName(t, band),
                community: communityOf(t, scope.id),
              })}
            </StatusPill>
            <StatusPill tone={BAND_TONE[insights.band]} className="w-fit">
              {t('tenantOwner.memberDetail.bandWhole', { band: bandName(t, insights.band) })}
            </StatusPill>
          </div>
        ) : (
          <StatusPill tone={BAND_TONE[insights.band]} className="w-fit">
            {bandName(t, insights.band)}
          </StatusPill>
        )}
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

/**
 * An insight card that opens the list behind its number (quick 261012-tru D-07, the level-7
 * pattern): the whole card is a plain link and carries the id the list's "Voltar" returns to.
 */
function ListLink({
  listHref,
  slug,
  children,
}: {
  listHref: ListHref;
  slug: OwnerMemberListSlug;
  children: ReactNode;
}) {
  return (
    <a
      href={listHref(slug)}
      id={ownerInsightAnchor(slug)}
      className="grid scroll-mt-20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      {children}
    </a>
  );
}

function Last30({
  t,
  insights,
  listHref,
}: {
  t: DashboardT;
  insights: OwnerMemberInsights;
  listHref: ListHref;
}) {
  const { last30 } = insights;
  const key = 'tenantOwner.memberDetail.last30';
  const seeList = (
    <span className="flex items-center gap-1 text-xs font-bold text-brand">
      {t('member.lists.seeList')}
      <ChevronRight aria-hidden size={14} />
    </span>
  );
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      <KpiGrid className="grid-cols-2">
        <ListLink listHref={listHref} slug="dias-ativos">
          <KpiCard
            label={t(`${key}.activeDays`)}
            value={formatCount(last30.activeDays)}
            footer={seeList}
          />
        </ListLink>
        <ListLink listHref={listHref} slug="curtidas">
          <KpiCard label={t(`${key}.likes`)} value={formatCount(last30.likes)} footer={seeList} />
        </ListLink>
        <ListLink listHref={listHref} slug="comentarios">
          <KpiCard
            label={t(`${key}.comments`)}
            value={formatCount(last30.comments)}
            footer={seeList}
          />
        </ListLink>
        <ListLink listHref={listHref} slug="acoes-fortes">
          <KpiCard
            label={t(`${key}.strongActions`)}
            value={formatCount(last30.strongActions)}
            note={t(`${key}.strongNote`)}
            footer={seeList}
          />
        </ListLink>
        <KpiCard
          label={t(`${key}.dailyTime`)}
          value={formatHoursMinutes(t, last30.dailyMinutes.value)}
          badge={exampleBadge(t, last30.dailyMinutes)}
        />
        <ListLink listHref={listHref} slug="posts-vistos">
          <KpiCard
            label={t(`${key}.postsSeen`)}
            value={formatCount(last30.postsSeen.value)}
            badge={exampleBadge(t, last30.postsSeen)}
            footer={seeList}
          />
        </ListLink>
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
          const { expiresAt } = purchase;
          // Primary revenue is the entry (it gave the app), secondary any later purchase (D-02).
          const entry = purchase.kind === 'primary';
          return (
            <Card
              key={`${purchase.productId}-${purchase.date}`}
              className="flex flex-col gap-1.5 p-4 [overflow-wrap:anywhere]"
            >
              <span className="text-sm font-bold text-text">{product.product}</span>
              <span className="flex flex-wrap items-center gap-2 text-xs text-text">
                {financeOffer(purchase.offerId).composition}
                <StatusPill tone={entry ? 'brand' : 'neutral'} className="px-2 py-0.5">
                  {t(`${key}.${entry ? 'entry' : 'addon'}`)}
                </StatusPill>
              </span>
              <span className="text-xs text-text-secondary">
                {t(`${key}.bought`, {
                  date: formatDate(purchase.date),
                  value: formatBrl(purchase.cents),
                })}
              </span>
              {expiresAt ? (
                <span className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  {t(`${key}.expires`, { date: formatDate(expiresAt.value) })}
                  <ExamplePill text={exampleBadge(t, expiresAt)} />
                </span>
              ) : null}
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

/** The link to the list behind one insight number, built by the cascade that opened the member. */
type ListHref = (slug: OwnerMemberListSlug) => string;

export interface OwnerMemberDetailProps {
  t: DashboardT;
  /** A roster member the opening cascade's parser let through. */
  memberId: string;
  /** The band the member was opened in, in `scope`. */
  band: EngagementBand;
  /** Where that band was counted: the whole base, a community or an event. */
  scope: OwnerBandScope;
  /** "Voltar": one step back in the cascade that opened the member. */
  backHref: string;
  listHref: ListHref;
}

/**
 * One member's insights, opened from a member card (quick 261012-qer B-3): in the level-4 Membros
 * area from a band, and in Conteúdo from the people behind a publication's number (quick 261013-h51
 * P1). "Voltar" one step back in the cascade that opened it, then the header (the community
 * band next to the whole-base one when they differ, quick 261012-ri4 R-4), the last 30
 * days (example values marked; each number opens its list), the band history with the weekly active
 * days, where they interact, their events, purchases and support counts (never message text), and a
 * suggested next step whose button is disabled like every preview action. Visible to the client's
 * management only.
 */
export function OwnerMemberDetail({
  t,
  memberId,
  band,
  scope,
  backHref,
  listHref,
}: OwnerMemberDetailProps) {
  // Each opening parser only lets a roster member through, so a missing one is a bug.
  const insights = ownerMemberInsights(memberId);
  if (!insights) throw new Error(`no insights for member ${memberId}`);
  const { kind, days } = insights.suggestion;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <BackLink href={backHref} label={t('tenantOwner.memberDetail.back')} />
      <Header t={t} insights={insights} scope={scope} band={band} />
      <Last30 t={t} insights={insights} listHref={listHref} />
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
