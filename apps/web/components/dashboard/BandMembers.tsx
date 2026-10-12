import {
  type EngagementBand,
  type EngagementBands,
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
import { cn } from '@rede-social/ui';
import {
  bandLabel,
  communityLabel,
  type DashboardT,
  formatCount,
  formatMonthYear,
  formatPercent,
  momentText,
} from './format';

export interface BandMembersProps {
  t: DashboardT;
  bands: EngagementBands;
  /** The scope (allow-listed by `parseOwnerCommunity`); null = Toda a base. */
  community: string | null;
}

function topCommunityLabel(t: DashboardT, id: string): string {
  const row = tenantOwnerPanel.byCommunity.find((community) => community.id === id);
  if (!row) throw new Error(`no community ${id}`);
  return communityLabel(t, row);
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
        percent: formatPercent(percentOf(count, total)),
      })}
      <span aria-hidden className="block h-1.5 w-16 overflow-hidden rounded-full bg-bg-tertiary">
        <span
          className={cn(
            'block h-full rounded-full',
            band === 'at_risk' ? 'bg-brand' : 'bg-brand/50',
          )}
          style={{ width: `${barPercent(count, total)}%` }}
        />
      </span>
    </span>
  );
}

/**
 * The six engagement bands of the level-4 Membros area (quick 261012-pkd D-02), each a closed native
 * `<details>`: the summary reads count · percent with a mini share bar (only Em risco solid, the band
 * to act on); opened, the 10 most recent members of the band in the scope and how many more it holds.
 * Names reach the client's own team only (D-03).
 */
export function BandMembers({ t, bands, community }: BandMembersProps) {
  const total = bandTotal(bands);
  return ENGAGEMENT_BAND_ORDER.map((band) => {
    const count = bands.counts[band];
    const { members, more } = ownerBandList(community, band);
    return (
      <Collapsible
        key={band}
        title={bandLabel(t, band)}
        summary={<BandSummary t={t} band={band} count={count} total={total} />}
      >
        <ul className="flex flex-col gap-3">
          {members.map((member) => (
            <li key={member.id} className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-bold text-text [overflow-wrap:anywhere]">
                {member.name}
              </span>
              <span className="text-xs text-text-secondary">
                {t('tenantOwner.bandMembers.line', {
                  since: formatMonthYear(member.memberSince),
                  when: momentText(t, member.lastActive),
                })}
              </span>
              {member.topCommunityId ? (
                <span className="text-xs text-text-secondary">
                  {t('tenantOwner.bandMembers.top', {
                    community: topCommunityLabel(t, member.topCommunityId),
                  })}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        {more > 0 ? (
          <p className="text-xs text-text-secondary">
            {t('tenantOwner.bandMembers.more', { count: more })}
          </p>
        ) : null}
      </Collapsible>
    );
  });
}
