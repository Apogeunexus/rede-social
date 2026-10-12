import { describe, expect, it } from 'vitest';
import type { EngagementBand, RelativeMoment } from '../fixtures';
import {
  OWNER_BAND_LIST_LIMIT,
  ownerBandList,
  tenantOwnerPanel,
  tenantStaffPanel,
} from '../fixtures';
import { ownerBandRoster, PREVIEW_TODAY } from '../fixtures/owner-members';
import { ENGAGEMENT_BAND_ORDER } from '../ui/metrics';

/**
 * Quick 261012-pkd D-02: the level-4 band lists. One roster feeds every scope, so a member never
 * reads more engaged in a community than in the whole base, and every list adds up to its band.
 */

const { engagement, communityEngagement, byCommunity } = tenantOwnerPanel;

/** Higher = more engaged; `new` sits apart (a novo is a novo in every scope). */
const LEVEL: Record<Exclude<EngagementBand, 'new'>, number> = {
  superfan: 4,
  engaged: 3,
  occasional: 2,
  at_risk: 1,
  inactive: 0,
};

function level(band: EngagementBand): number {
  return band === 'new' ? Number.NaN : LEVEL[band];
}

/** The days-ago window each band's last activity must fall in. */
function fitsWindow(band: EngagementBand, daysAgo: number): boolean {
  if (band === 'at_risk') return daysAgo >= 30 && daysAgo <= 59;
  if (band === 'inactive') return daysAgo >= 60;
  return daysAgo >= 0 && daysAgo <= 29;
}

function joinedDaysAgo(memberSince: string): number {
  return Math.round(
    (Date.parse(`${PREVIEW_TODAY}T00:00:00Z`) - Date.parse(`${memberSince}T00:00:00Z`)) /
      86_400_000,
  );
}

function scopeCount(scope: string | null, band: EngagementBand): number {
  if (scope === null) return engagement.counts[band];
  const entry = communityEngagement.find((row) => row.id === scope);
  if (!entry) throw new Error(`no bands for ${scope}`);
  return entry.bands.counts[band];
}

function scopeNewActivated(scope: string | null): number {
  if (scope === null) return engagement.newActivated;
  return communityEngagement.find((row) => row.id === scope)?.bands.newActivated ?? 0;
}

/** daysAgo asc, then time desc, then id asc. */
function compareRecency(
  a: { id: string; lastActive: RelativeMoment },
  b: { id: string; lastActive: RelativeMoment },
): number {
  return (
    a.lastActive.daysAgo - b.lastActive.daysAgo ||
    (b.lastActive.time ?? '').localeCompare(a.lastActive.time ?? '') ||
    a.id.localeCompare(b.id)
  );
}

const SCOPES: (string | null)[] = [null, ...byCommunity.map((row) => row.id)];

function rosterBand(memberId: string, scope: string | null): EngagementBand | undefined {
  const member = ownerBandRoster.find((row) => row.id === memberId);
  if (!member) return undefined;
  return scope === null ? member.band : member.communities[scope]?.band;
}

describe('the band roster', () => {
  it('holds 72 members, 12 per band, with unique ids and names', () => {
    expect(ownerBandRoster).toHaveLength(72);
    for (const band of ENGAGEMENT_BAND_ORDER) {
      expect(
        ownerBandRoster.filter((row) => row.band === band),
        band,
      ).toHaveLength(12);
    }
    expect(new Set(ownerBandRoster.map((row) => row.id)).size).toBe(72);
    expect(new Set(ownerBandRoster.map((row) => row.name)).size).toBe(72);
  });

  it('borrows no name from the staff or the level-6 lists', () => {
    const taken = new Set([
      ...tenantStaffPanel.support.queue.map((row) => row.name),
      ...tenantStaffPanel.moderation.recentComments.map((row) => row.name),
      ...tenantOwnerPanel.support.answeredByStaff.map((row) => row.name),
    ]);
    expect(taken.size).toBeGreaterThan(0);
    for (const row of ownerBandRoster) expect(taken.has(row.name), row.name).toBe(false);
  });

  it('dates everything from the Encontro mensal day', () => {
    expect(PREVIEW_TODAY).toBe(tenantOwnerPanel.events.upcoming[0]?.date);
  });
});

describe('each member, across scopes', () => {
  it('is new exactly when they joined under 30 days ago', () => {
    for (const row of ownerBandRoster) {
      expect(row.band === 'new', row.id).toBe(joinedDaysAgo(row.memberSince) < 30);
    }
  });

  it('joined before any activity, and the whole-base activity fits the band', () => {
    for (const row of ownerBandRoster) {
      const joined = joinedDaysAgo(row.memberSince);
      expect(joined, row.id).toBeGreaterThanOrEqual(row.lastActive.daysAgo);
      for (const entry of Object.values(row.communities)) {
        expect(joined, row.id).toBeGreaterThanOrEqual(entry.lastActive.daysAgo);
      }
      expect(fitsWindow(row.band, row.lastActive.daysAgo), row.id).toBe(true);
    }
  });

  it('has every open community, and VIP only with access', () => {
    for (const row of ownerBandRoster) {
      for (const community of byCommunity) {
        if (!community.exclusive) expect(row.communities[community.id], row.id).toBeDefined();
      }
      for (const id of Object.keys(row.communities)) {
        expect(
          byCommunity.some((community) => community.id === id),
          id,
        ).toBe(true);
      }
    }
    expect(ownerBandRoster.some((row) => row.communities['c-vip'] === undefined)).toBe(true);
    expect(ownerBandRoster.some((row) => row.communities['c-vip'] !== undefined)).toBe(true);
  });

  it('is never more engaged nor more recent in a community than in the whole base', () => {
    for (const row of ownerBandRoster) {
      for (const [id, entry] of Object.entries(row.communities)) {
        const where = `${row.id} ${id}`;
        expect(entry.band === 'new', where).toBe(row.band === 'new');
        if (row.band !== 'new') {
          expect(level(entry.band), where).toBeLessThanOrEqual(level(row.band));
        }
        expect(entry.lastActive.daysAgo, where).toBeGreaterThanOrEqual(row.lastActive.daysAgo);
        expect(fitsWindow(entry.band, entry.lastActive.daysAgo), where).toBe(true);
      }
    }
  });

  it('interacts most in a community where they keep their whole-base band', () => {
    for (const row of ownerBandRoster) {
      const top = row.communities[row.topCommunityId];
      expect(top, row.id).toBeDefined();
      expect(top?.band, row.id).toBe(row.band);
    }
  });
});

describe('ownerBandList', () => {
  it('lists at most 10 members of the band, most recent first, adding up to the count', () => {
    expect(OWNER_BAND_LIST_LIMIT).toBe(10);
    for (const scope of SCOPES) {
      for (const band of ENGAGEMENT_BAND_ORDER) {
        const where = `${scope ?? 'all'} ${band}`;
        const count = scopeCount(scope, band);
        const list = ownerBandList(scope, band);
        expect(list.members, where).toHaveLength(Math.min(OWNER_BAND_LIST_LIMIT, count));
        expect(list.members.length + list.more, where).toBe(count);
        expect([...list.members].sort(compareRecency), where).toEqual(list.members);
        for (const member of list.members) {
          expect(rosterBand(member.id, scope), `${where} ${member.id}`).toBe(band);
          expect('topCommunityId' in member, `${where} ${member.id}`).toBe(scope === null);
        }
      }
    }
  });

  it('never holds more roster members in a band than its count, nor novos than activated', () => {
    for (const scope of SCOPES) {
      for (const band of ENGAGEMENT_BAND_ORDER) {
        const inBand = ownerBandRoster.filter((row) => rosterBand(row.id, scope) === band);
        expect(inBand.length, `${scope ?? 'all'} ${band}`).toBeLessThanOrEqual(
          scopeCount(scope, band),
        );
      }
      const novos = ownerBandRoster.filter((row) => rosterBand(row.id, scope) === 'new');
      expect(novos.length, scope ?? 'all').toBeLessThanOrEqual(scopeNewActivated(scope));
    }
  });

  it('carries the scope’s last activity', () => {
    const list = ownerBandList('c-eventos', 'at_risk');
    for (const member of list.members) {
      const roster = ownerBandRoster.find((row) => row.id === member.id);
      expect(member.lastActive).toEqual(roster?.communities['c-eventos']?.lastActive);
    }
  });

  it('throws for a community the client does not have', () => {
    expect(() => ownerBandList('c-nope', 'new')).toThrow();
  });
});
