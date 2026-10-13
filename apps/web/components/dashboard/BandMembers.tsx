import {
  type EngagementBand,
  type EngagementBands,
  type OwnerBandMember,
  type OwnerBandScope,
  ownerBandList,
  ownerScopeBands,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import {
  bandTotal,
  barPercent,
  Collapsible,
  ENGAGEMENT_BAND_ORDER,
  percentOf,
} from '@rede-social/module-dashboard/ui';
import { Card, cn } from '@rede-social/ui';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { type OwnerMembersView, ownerMembersHref } from '@/lib/owner-band-scope';
import { BackLink } from './BackLink';
import {
  CommunityScopeCard,
  EventScopeCard,
  ownerCommunity,
  ownerEvent,
  RevenueExampleNote,
  ScopeItemCards,
} from './BandScopeCards';
import { ExamplePill } from './ExamplePill';
import {
  bandLabel,
  communityLabel,
  type DashboardT,
  exampleBadge,
  formatCount,
  formatDayMonth,
  formatHoursMinutes,
  formatMonthYear,
  formatPercent,
  initials,
} from './format';
import { PreviewAction } from './PanelSection';

/** The cascade levels the bands render (the member level replaces the area, see OwnerMembers). */
type BandView = Pick<OwnerMembersView, 'kind' | 'band' | 'itemId'>;

export interface BandMembersProps {
  t: DashboardT;
  /** The whole base's bands: every tab's headers count each member once (quick 261012-tru D-02). */
  bands: EngagementBands;
  /** The tab, the open band and the opened community or event (allow-listed by the parser). */
  view: BandView;
}

function topCommunityLabel(t: DashboardT, id: string): string {
  const row = tenantOwnerPanel.byCommunity.find((community) => community.id === id);
  if (!row) throw new Error(`no community ${id}`);
  return communityLabel(t, row);
}

/**
 * A band's share of the scope: "menos de 1%" when it has members but rounds to 0% (A-1).
 * `Math.round` matches formatPercent's half-expand rounding.
 */
function bandShare(t: DashboardT, count: number, total: number): string {
  const percent = percentOf(count, total);
  return count > 0 && Math.round(percent) === 0
    ? t('tenantOwner.bandMembers.underOnePercent')
    : formatPercent(percent);
}

function BandSummary({
  t,
  band,
  count,
  total,
}: {
  t: DashboardT;
  band: EngagementBand;
  count: number;
  total: number;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {t('tenantOwner.bandMembers.summary', {
        count: formatCount(count),
        percent: bandShare(t, count, total),
      })}
      <span aria-hidden className="block h-1.5 w-16 overflow-hidden rounded-full bg-bg-tertiary">
        {/* min-w-1.5: a band with members never draws an empty bar (a 6 px dot at least). */}
        <span
          className={cn(
            'block h-full rounded-full',
            band === 'at_risk' ? 'bg-brand' : 'bg-brand/50',
            count > 0 && 'min-w-1.5',
          )}
          style={{ width: `${barPercent(count, total)}%` }}
        />
      </span>
    </span>
  );
}

/** One labeled line of the member card: the label in gray, then its value in the text color. */
function CardLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="text-sm">
      <dt className="inline text-text-secondary">{label}</dt>{' '}
      <dd className="inline text-text">{children}</dd>
    </div>
  );
}

/**
 * One member as a card (quick 261012-qer B-1, sized as the user drew it in quick 261012-ri4 R-1):
 * the initials on the brand color (the profile photo replaces them once profiles are wired), the
 * large name, four labeled lines, and a chevron saying it opens (R-3). The whole card links to the
 * member's insights (B-3). The daily time is an example; the list says so once on top (R-2).
 */
function MemberCard({ t, member, href }: { t: DashboardT; member: OwnerBandMember; href: string }) {
  return (
    <a
      href={href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Card className="flex items-start gap-4 p-4 transition-colors hover:bg-card-hover">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-base font-bold text-on-brand"
        >
          {initials(member.name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2 [overflow-wrap:anywhere]">
          <span className="text-lg font-bold leading-tight text-text">{member.name}</span>
          <dl className="flex flex-col gap-1">
            <CardLine label={t('tenantOwner.bandMembers.since')}>
              {formatMonthYear(member.memberSince)}
            </CardLine>
            <CardLine label={t('tenantOwner.bandMembers.lastActive')}>
              {t('tenantOwner.bandMembers.when', {
                days: member.lastActive.daysAgo,
                time: member.lastActive.time ?? '',
              })}
            </CardLine>
            <CardLine label={t('tenantOwner.bandMembers.topCommunity')}>
              {topCommunityLabel(t, member.topCommunityId)}
            </CardLine>
            <CardLine label={t('tenantOwner.bandMembers.dailyTime')}>
              {formatHoursMinutes(t, member.dailyMinutes.value)}
            </CardLine>
          </dl>
        </div>
        <ChevronRight aria-hidden size={18} className="shrink-0 self-center text-brand" />
      </Card>
    </a>
  );
}

/**
 * One band's member list (quick 261012-pkd D-02, kept as is by quick 261012-tru D-02): the 10 most
 * recent members of the list scope as cards; over 10 it says so on top and ends with how many more
 * plus a disabled "Ver todos" (A-3); no members says so (A-4). When a listed daily time is an
 * example, one line on top says so with the pill (quick 261012-ri4 R-2). `count` is the band's count
 * in the list scope, so the body always agrees with what led here. Each card opens the member's
 * insights one level down.
 */
function MemberList({
  t,
  view,
  scope,
  band,
  count,
}: {
  t: DashboardT;
  view: BandView;
  scope: OwnerBandScope;
  band: EngagementBand;
  count: number;
}) {
  if (count === 0) {
    return <p className="text-sm text-text-secondary">{t('tenantOwner.bandMembers.empty')}</p>;
  }
  const { members, more } = ownerBandList(scope, band);
  const example = members.find((member) => member.dailyMinutes.example)?.dailyMinutes;
  return (
    <>
      {more > 0 || example ? (
        <div className="flex flex-col gap-1">
          {more > 0 ? (
            <p className="text-xs text-text-secondary">
              {t('tenantOwner.bandMembers.recent', { count: members.length })}
            </p>
          ) : null}
          {example ? (
            <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              {t('tenantOwner.bandMembers.exampleNote')}
              <ExamplePill text={exampleBadge(t, example)} />
            </p>
          ) : null}
        </div>
      ) : null}
      <ul className="flex flex-col gap-3">
        {members.map((member) => (
          <li key={member.id} className="min-w-0">
            <MemberCard
              t={t}
              member={member}
              href={ownerMembersHref({ ...view, band, memberId: member.id, list: null })}
            />
          </li>
        ))}
      </ul>
      {more > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">
            {t('tenantOwner.bandMembers.more', { count: more })}
          </p>
          <PreviewAction>{t('tenantOwner.bandMembers.seeAll')}</PreviewAction>
        </div>
      ) : null}
    </>
  );
}

/** `Encontro mensal · 12/10` or `Comunidade VIP`: the opened item as the members line names it. */
function itemName(t: DashboardT, kind: 'community' | 'event', id: string): string {
  if (kind === 'community') return communityLabel(t, ownerCommunity(id));
  const event = ownerEvent(id);
  return t('tenantOwner.bandScope.event', { name: event.name, date: formatDayMonth(event.date) });
}

/**
 * A community or event opened inside its band (quick 261012-tru D-05): the way back to the band's
 * cards, the item's own card (not a link here), then that band's members in it.
 */
function OpenedItem({
  t,
  view,
  kind,
  id,
  band,
}: {
  t: DashboardT;
  view: BandView;
  kind: 'community' | 'event';
  id: string;
  band: EngagementBand;
}) {
  const scope: OwnerBandScope = { kind, id };
  const Item = kind === 'community' ? CommunityScopeCard : EventScopeCard;
  return (
    <>
      <BackLink
        href={ownerMembersHref({ ...view, band, itemId: null, memberId: null, list: null })}
        label={t(
          kind === 'community'
            ? 'tenantOwner.scopeCards.backCommunities'
            : 'tenantOwner.scopeCards.backEvents',
        )}
      />
      {kind === 'event' ? <RevenueExampleNote t={t} /> : null}
      <Item t={t} id={id} band={band} href={null} />
      <p className="text-sm font-bold text-text">
        {t('tenantOwner.scopeCards.membersIn', {
          band: bandLabel(t, band),
          item: itemName(t, kind, id),
        })}
      </p>
      <MemberList
        t={t}
        view={view}
        scope={scope}
        band={band}
        count={ownerScopeBands(scope).counts[band]}
      />
    </>
  );
}

/**
 * The six engagement bands of the level-4 Membros area, one cascade in the three tabs (quick
 * 261012-tru D-01, D-02): each band is a closed native `<details>` whose summary reads the whole-base
 * count · share with a mini bar (only Em risco solid, the band to act on). Opened, Por membro lists
 * its members; Por comunidade and Por evento list the community or event cards with how many of the
 * band each holds, and a card opens that item in place with its members in the band (D-05). A member
 * card opens the member's insights (D-06); coming back, the view renders the same band (and item)
 * open. Names reach the client's own team only (261012-pkd D-03).
 */
export function BandMembers({ t, bands, view }: BandMembersProps) {
  const total = bandTotal(bands);
  return ENGAGEMENT_BAND_ORDER.map((band) => {
    const open = band === view.band;
    let body: ReactNode;
    if (view.kind === 'member') {
      body = (
        <MemberList
          t={t}
          view={view}
          scope={{ kind: 'member' }}
          band={band}
          count={bands.counts[band]}
        />
      );
    } else if (open && view.itemId !== null) {
      body = <OpenedItem t={t} view={view} kind={view.kind} id={view.itemId} band={band} />;
    } else {
      body = <ScopeItemCards t={t} kind={view.kind} band={band} />;
    }
    return (
      <Collapsible
        key={band}
        open={open}
        title={bandLabel(t, band)}
        summary={<BandSummary t={t} band={band} count={bands.counts[band]} total={total} />}
      >
        {body}
      </Collapsible>
    );
  });
}
