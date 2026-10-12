import { describe, expect, it } from 'vitest';
import { tenantAdminPanel, tenantOwnerPanel } from '../fixtures';
import { attendancePercent, percentOf, perItem, sumOf } from '../ui/metrics';

/**
 * D-05 (quick 261012-o00): every number the client owner's panel shows agrees with the rest of the
 * preview, level 5 first, and every sum it computes adds up.
 */

const { attention, growth, kpis, byCommunity, events, channels, support } = tenantOwnerPanel;

function channel(name: (typeof channels)[number]['channel']): number | undefined {
  return channels.find((row) => row.channel === name)?.count;
}

describe('level-4 alerts (the header bell)', () => {
  it('holds three alerts: support, today’s event and who entered at risk', () => {
    expect(attention.map((item) => item.kind)).toEqual([
      'support_waiting',
      'event_today',
      'entered_at_risk',
    ]);
  });

  it('gives the support alert level 5’s queue, with no member name', () => {
    const owner = attention.find((item) => item.kind === 'support_waiting');
    expect(owner).toMatchObject({
      severity: 'danger',
      conversations: tenantAdminPanel.kpis.awaitingReply.count,
      oldestHours: tenantAdminPanel.kpis.awaitingReply.oldestHours,
    });
    expect(owner).toBeDefined();
    expect(Object.keys(owner ?? {})).not.toContain('oldestName');
    expect(JSON.stringify(attention)).not.toMatch(/\b(Ana|Rui)\b/);
  });

  it('gives today’s event level 5’s numbers', () => {
    const owner = attention.find((item) => item.kind === 'event_today');
    const admin = tenantAdminPanel.attention.find((item) => item.kind === 'event_today');
    expect(admin).toBeDefined();
    expect(owner).toMatchObject({
      severity: 'warning',
      event: admin?.kind === 'event_today' ? admin.event : '',
      startsAtHour: admin?.kind === 'event_today' ? admin.startsAtHour : -1,
      confirmed: 92,
      capacity: 100,
    });
  });

  it('gives who entered at risk level 5’s count and push reach', () => {
    const owner = attention.find((item) => item.kind === 'entered_at_risk');
    expect(owner).toMatchObject({
      severity: 'warning',
      members: tenantAdminPanel.kpis.enteredAtRisk.count,
      withPush: tenantAdminPanel.kpis.enteredAtRisk.withPush,
    });
  });
});

describe('growth (Membros)', () => {
  it('joins exactly the novos and the new members', () => {
    expect(growth.joined).toBe(tenantOwnerPanel.engagement.counts.new);
    expect(growth.joined).toBe(kpis.members.newMembers);
    expect(growth.joined).toBe(96);
    expect(growth.left).toBe(9);
  });

  it('gives the balance the members KPI change (+8%)', () => {
    const balance = growth.joined - growth.left;
    expect(balance).toBe(87);
    expect(Math.round(percentOf(balance, kpis.members.count - balance))).toBe(
      kpis.members.delta.amount,
    );
  });

  it('ends the weekly series on level 5’s new members of the week and their change', () => {
    expect(growth.weeklyJoined).toHaveLength(12);
    const last = growth.weeklyJoined.at(-1) ?? Number.NaN;
    const previous = growth.weeklyJoined.at(-2) ?? Number.NaN;
    expect(last).toBe(tenantAdminPanel.kpis.newMembers.count);
    expect(last - previous).toBe(tenantAdminPanel.kpis.newMembers.delta.amount);
    expect(sumOf(growth.weeklyJoined.slice(-4), (n) => n)).toBeLessThanOrEqual(growth.joined);
  });
});

describe('interactions by community', () => {
  it('sums to the 61 posts by format and to likes + comments', () => {
    const posts = sumOf(byCommunity, (row) => row.posts);
    const interactions = sumOf(byCommunity, (row) => row.interactions);
    expect(posts).toBe(sumOf(tenantOwnerPanel.byFormat, (row) => row.posts));
    expect(posts).toBe(61);
    expect(interactions).toBe((channel('likes') ?? 0) + (channel('comments') ?? 0));
    expect(interactions).toBe(3940);
    expect(perItem(interactions, posts)).toBe(65);
  });

  it('uses level 5’s communities, in its order, each at least level 5’s 14-day count', () => {
    expect(byCommunity.map((row) => row.id)).toEqual(
      tenantAdminPanel.communities.map((row) => row.id),
    );
    for (const row of byCommunity) {
      const admin = tenantAdminPanel.communities.find((other) => other.id === row.id);
      expect(row.interactions).toBeGreaterThanOrEqual(
        admin?.interactions ?? Number.POSITIVE_INFINITY,
      );
      expect(row.exclusive).toBe(admin?.exclusive);
    }
    expect(byCommunity.map((row) => perItem(row.interactions, row.posts))).toEqual([
      75, 63, 54, 47,
    ]);
  });
});

describe('past events', () => {
  it('give level 5’s attendance: 64% overall and 82 / 58 / 64 / 49 per event', () => {
    expect(Math.round(attendancePercent(events.past))).toBe(
      tenantAdminPanel.events.attendancePercent,
    );
    expect(Math.round(attendancePercent(events.past))).toBe(64);
    expect(
      events.past.map((row) => ({
        name: row.name,
        percent: Math.round(percentOf(row.checkIns, row.confirmed)),
      })),
    ).toEqual(tenantAdminPanel.events.rows.map(({ name, percent }) => ({ name, percent })));
  });

  it('give level 5’s walk-ins and the presences channel', () => {
    expect(sumOf(events.past, (row) => row.walkIns)).toBe(tenantAdminPanel.events.walkIns.count);
    expect(
      sumOf(events.past, (row) => row.checkIns) + sumOf(events.past, (row) => row.walkIns),
    ).toBe(channel('attendance'));
    expect(channel('attendance')).toBe(236);
  });

  it('never check in more than confirmed, nor confirm more than the capacity', () => {
    for (const row of events.past) {
      expect(row.checkIns).toBeLessThanOrEqual(row.confirmed);
      if (row.capacity !== null) expect(row.confirmed).toBeLessThanOrEqual(row.capacity);
    }
  });
});

describe('support', () => {
  it('waits on level 5’s queue', () => {
    expect(support.awaiting).toEqual(tenantAdminPanel.kpis.awaitingReply);
  });
});
