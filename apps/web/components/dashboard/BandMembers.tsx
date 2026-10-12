import {
  type EngagementBand,
  type EngagementBands,
  type OwnerBandMember,
  type OwnerBandScope,
  ownerBandList,
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
import type { ReactNode } from 'react';
import { ExamplePill } from './ExamplePill';
import {
  bandLabel,
  communityLabel,
  type DashboardT,
  exampleBadge,
  formatCount,
  formatHoursMinutes,
  formatMonthYear,
  formatPercent,
  initials,
} from './format';
import { PreviewAction } from './PanelSection';

export interface BandMembersProps {
  t: DashboardT;
  bands: EngagementBands;
  /** The scope (allow-listed by `parseOwnerMembersView`). */
  scope: OwnerBandScope;
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

/** One labeled line of the member card: the label bold, then its value. */
function CardLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="text-xs text-text-secondary">
      <dt className="inline font-semibold">{label}</dt> <dd className="inline">{children}</dd>
    </div>
  );
}

/**
 * One member as a card (quick 261012-qer B-1): the initials on the brand color (the profile photo
 * replaces them once profiles are wired), the name, and four labeled lines. The daily time is an
 * example, so its pill sits right next to it.
 */
function MemberCard({ t, member }: { t: DashboardT; member: OwnerBandMember }) {
  return (
    <Card className="flex items-start gap-3 p-3">
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand"
      >
        {initials(member.name)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 [overflow-wrap:anywhere]">
        <span className="text-base font-bold text-text">{member.name}</span>
        <dl className="flex flex-col gap-0.5">
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
            {formatHoursMinutes(t, member.dailyMinutes.value)}{' '}
            <ExamplePill text={exampleBadge(t, member.dailyMinutes)} />
          </CardLine>
        </dl>
      </div>
    </Card>
  );
}

/**
 * The six engagement bands of the level-4 Membros area (quick 261012-pkd D-02), each a closed native
 * `<details>`: the summary reads count · share with a mini bar (only Em risco solid, the band to act
 * on). Opened, the band lists its 10 most recent members as cards; over 10 it says so on top and
 * ends with how many more plus a disabled "Ver todos" (A-3); a band with no members says so (A-4).
 * The body keys on the band count, so it always agrees with the summary. Names reach the client's
 * own team only (D-03).
 */
export function BandMembers({ t, bands, scope }: BandMembersProps) {
  const total = bandTotal(bands);
  return ENGAGEMENT_BAND_ORDER.map((band) => {
    const count = bands.counts[band];
    const { members, more } = ownerBandList(scope, band);
    return (
      <Collapsible
        key={band}
        title={bandLabel(t, band)}
        summary={<BandSummary t={t} band={band} count={count} total={total} />}
      >
        {count === 0 ? (
          <p className="text-sm text-text-secondary">{t('tenantOwner.bandMembers.empty')}</p>
        ) : (
          <>
            {more > 0 ? (
              <p className="text-xs text-text-secondary">
                {t('tenantOwner.bandMembers.recent', { count: members.length })}
              </p>
            ) : null}
            <ul className="flex flex-col gap-3">
              {members.map((member) => (
                <li key={member.id} className="min-w-0">
                  <MemberCard t={t} member={member} />
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
        )}
      </Collapsible>
    );
  });
}
