import { resolveBranding, tenantBrandingSchema } from '@rede-social/contracts/branding';
import { describe, expect, it } from 'vitest';
import {
  memberPanel,
  platformAdminPanel,
  platformOwnerPanel,
  platformSupportPanel,
  previewTenant,
  tenantAdminPanel,
  tenantOwnerPanel,
  tenantStaffPanel,
} from '../fixtures';
import {
  bandTotal,
  dailyAverageMinutes,
  engagedPercent,
  interactedPercent,
  isBelowPrivacyFloor,
  isNewMember,
  MIN_STREAK_WEEKS,
  percentOf,
  totalMinutes,
  vsMedian,
} from '../ui/metrics';

describe('previewTenant (the Igor Alves brand record)', () => {
  it('parses as a stored tenant branding', () => {
    expect(() => tenantBrandingSchema.parse(previewTenant.branding)).not.toThrow();
  });

  it('resolves to the blue pair with the lighter blue as the dark primary', () => {
    const { colors } = resolveBranding(previewTenant.branding);
    expect(colors.primary).toBe('#2e6fd0');
    expect(colors.secondary).toBe('#5b9cf8');
    expect(colors.primaryDark).toBe('#5b9cf8');
  });

  it('is named Dr. Igor Alves', () => {
    expect(previewTenant.displayName).toBe('Dr. Igor Alves');
  });
});

describe('platformOwnerPanel', () => {
  it('carries a 12-point active-clients series ending at the current count', () => {
    const { series, count } = platformOwnerPanel.kpis.activeClients;
    expect(series).toHaveLength(12);
    expect(series.at(-1)).toBe(count);
  });

  it('reports storage against the 1 GB plan', () => {
    const { usedGb, planGb } = platformOwnerPanel.kpis.storage;
    expect(planGb).toBe(1);
    expect(usedGb).toBeLessThan(planGb);
  });
});

describe('D-05: the levels agree on the same numbers', () => {
  const { membersByClient, clients, kpis } = platformOwnerPanel;
  const byId = new Map(membersByClient.map((row) => [row.id, row.members]));

  it('splits the platform members across the clients without loss', () => {
    const sum = membersByClient.reduce((total, row) => total + row.members, 0);
    expect(sum).toBe(kpis.members.count);
    expect(sum).toBe(8430);
  });

  it('gives Dr. Igor Alves the client panel member count everywhere', () => {
    expect(byId.get('c-igor')).toBe(tenantOwnerPanel.kpis.members.count);
    expect(byId.get('c-igor')).toBe(1240);
  });

  it('gives each named client row the same members as its list row', () => {
    for (const id of ['c-aurora', 'c-lab', 'c-igor', 'c-horizonte']) {
      expect(clients.find((row) => row.id === id)?.members).toBe(byId.get(id));
    }
    const corrida = clients.find((row) => row.id === 'c-corrida')?.members ?? Number.NaN;
    expect(corrida).toBeLessThanOrEqual(byId.get('others') ?? 0);
  });

  it('makes Instituto Aurora the largest client', () => {
    const largest = [...clients].sort((a, b) => b.members - a.members)[0];
    expect(largest?.name).toBe('Instituto Aurora');
  });

  it("uses the client's 38% 'interagiu' on the platform row", () => {
    const igor = clients.find((row) => row.id === 'c-igor');
    expect(igor?.interactedPercent).toBe(tenantOwnerPanel.kpis.interacting.percent);
    expect(igor?.interactedPercent).toBe(38);
  });

  it("gives the admin's 7-day 'interagiram' the weekly chart's last point", () => {
    expect(tenantAdminPanel.kpis.interacting.count).toBe(
      tenantOwnerPanel.weeklyInteracting.current.at(-1),
    );
    expect(tenantAdminPanel.kpis.interacting.count).toBe(380);
  });
});

describe('tenantOwnerPanel engagement (level 4)', () => {
  const { engagement, kpis, ordersByBand, channels, byFormat, movement } = tenantOwnerPanel;

  it('sums the bands to the member KPI, and the novos to the new members', () => {
    expect(bandTotal(engagement)).toBe(kpis.members.count);
    expect(engagement.counts.new).toBe(kpis.members.newMembers);
  });

  it("derives the 'interagiu' KPI from the bands", () => {
    expect(Math.round(interactedPercent(engagement))).toBe(kpis.interacting.percent);
  });

  it('counts every order in exactly one band', () => {
    const orders = Object.values(ordersByBand).reduce((sum, n) => sum + n, 0);
    expect(orders).toBe(channels.find((row) => row.channel === 'orders')?.count);
    expect(orders).toBe(96);
  });

  it("splits the platform's 61 posts of the client by format", () => {
    const posts = byFormat.reduce((sum, row) => sum + row.posts, 0);
    expect(posts).toBe(platformOwnerPanel.clients.find((row) => row.id === 'c-igor')?.posts30d);
    expect(posts).toBe(61);
  });

  it('keeps the shown flows within the up and down totals', () => {
    const rank = {
      inactive: 0,
      at_risk: 1,
      active: 2,
      occasional: 2,
      engaged: 3,
      superfan: 4,
      new: 2,
    };
    let down = 0;
    let up = 0;
    for (const flow of movement.flows) {
      if (rank[flow.to] < rank[flow.from]) down += flow.members;
      else if (rank[flow.to] > rank[flow.from]) up += flow.members;
    }
    expect(down).toBeLessThanOrEqual(movement.down);
    expect(up).toBeLessThanOrEqual(movement.up);
  });
});

describe('tenantAdminPanel (level 5)', () => {
  it('never activates more novos than joined', () => {
    const { newMembers } = tenantAdminPanel.kpis;
    expect(newMembers.activated).toBeLessThanOrEqual(newMembers.count);
  });

  it("measures stories against the client's member base", () => {
    expect(tenantAdminPanel.stories.memberBase).toBe(tenantOwnerPanel.kpis.members.count);
  });
});

describe('platform engagement (levels 1–3)', () => {
  const { engagement, kpis, clients } = platformOwnerPanel;
  const client = (id: string) => clients.find((row) => row.id === id);

  it('sums the platform bands to the members KPI and its percents', () => {
    expect(bandTotal(engagement)).toBe(kpis.members.count);
    expect(bandTotal(engagement)).toBe(8430);
    expect(Math.round(interactedPercent(engagement))).toBe(kpis.members.interactedPercent);
    expect(Math.round(engagedPercent(engagement))).toBe(22);
  });

  it("derives Dr. Igor Alves's row from the client's own bands", () => {
    const bands = tenantOwnerPanel.engagement;
    const igor = client('c-igor');
    expect(igor?.engagedPercent).toBe(Math.round(engagedPercent(bands)));
    expect(igor?.engagedPercent).toBe(22);
    expect(igor?.atRiskPercent).toBe(Math.round(percentOf(bands.counts.at_risk, bandTotal(bands))));
    expect(igor?.atRiskPercent).toBe(14);
  });

  it("derives Clube Corrida Sul's row from the support panel's bands", () => {
    const bands = platformSupportPanel.engagement;
    const corrida = client('c-corrida');
    expect(corrida?.members).toBe(platformSupportPanel.kpis.members.count);
    expect(bandTotal(bands)).toBe(310);
    expect(corrida?.members).toBe(bandTotal(bands));
    expect(corrida?.engagedPercent).toBe(Math.round(engagedPercent(bands)));
    expect(corrida?.engagedPercent).toBe(3);
    expect(corrida?.atRiskPercent).toBe(Math.round(percentOf(bands.counts.at_risk, 310)));
    expect(corrida?.atRiskPercent).toBe(31);
    expect(corrida?.interactedPercent).toBe(Math.round(interactedPercent(bands)));
    expect(corrida?.interactedPercent).toBe(12);
  });

  it('exercises the privacy floor on the support bands', () => {
    expect(isBelowPrivacyFloor(platformSupportPanel.engagement.counts.superfan)).toBe(true);
  });

  it("counts Dr. Igor Alves's order value in the platform store sales", () => {
    const igor = kpis.storeSales.byClient.find((row) => row.clientId === 'c-igor');
    expect(igor?.cents).toBe(tenantOwnerPanel.kpis.orderValue.cents);
    expect(igor?.cents).toBe(894000);
  });

  it("alerts on Escola Horizonte's drop to its current engaged share", () => {
    const drop = platformAdminPanel.pending.find((item) => item.kind === 'engagement_drop');
    expect(drop && 'toPercent' in drop ? drop.toPercent : undefined).toBe(
      client('c-horizonte')?.engagedPercent,
    );
    expect(client('c-horizonte')?.engagedPercent).toBe(12);
  });

  it('never grows from one activation step to the next, ending at 10 active members', () => {
    const counts = platformAdminPanel.activation.map((step) => step.clients);
    for (let i = 1; i < counts.length; i += 1) {
      expect(counts[i]).toBeLessThanOrEqual(counts[i - 1] ?? 0);
    }
    expect(platformAdminPanel.activation.at(-1)).toEqual({
      step: 'ten_active_members',
      clients: 2,
    });
  });

  it('never has more new members who never acted than joined', () => {
    const { newNeverActed7d } = platformSupportPanel.kpis;
    expect(newNeverActed7d.count).toBeLessThanOrEqual(newNeverActed7d.joined);
  });
});

describe('tenantStaffPanel (level 6)', () => {
  const { support, moderation, content } = tenantStaffPanel;

  it('tags only the queue member who joined less than 30 days ago', () => {
    const joined = (name: string) =>
      support.queue.find((item) => item.name === name)?.joinedDaysAgo ?? Number.NaN;
    expect(isNewMember(joined('Rui Matos'))).toBe(true);
    expect(isNewMember(joined('Ana Souza'))).toBe(false);
  });

  it('compares the recent posts with the median, the youngest still running', () => {
    const ratios = content.recentPosts.map((post) =>
      vsMedian(
        post.likes + post.comments,
        content.medianInteractions,
        post.ageHours,
        content.comparableAfterHours,
      ),
    );
    expect(ratios[0]).toBeCloseTo(1.44, 2);
    expect(ratios[1]).toBeCloseTo(0.15, 2);
    expect(ratios[2]).toBeNull();
  });

  it('removes 0,9% of the comments of the week', () => {
    const rate = percentOf(moderation.removed7d, moderation.comments7d);
    expect(Math.round(rate * 10) / 10).toBe(0.9);
  });
});

describe('memberPanel (level 7)', () => {
  it('has a streak worth showing and no more presences than events', () => {
    const { weeklyStreak, attendance } = memberPanel.profile;
    expect(weeklyStreak).toBeGreaterThanOrEqual(MIN_STREAK_WEEKS);
    expect(attendance.attended).toBeLessThanOrEqual(attendance.events);
  });

  const { activity } = memberPanel;
  const days = activity.usage.value.days;

  it('covers the last 7 complete days, oldest first (2026-10-05 to 2026-10-11)', () => {
    expect(days.map((day) => day.date)).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ]);
  });

  it('totals the week as the sum of its days (4 h 26 min, 38 min a day)', () => {
    expect(totalMinutes(days)).toBe(266);
    expect(dailyAverageMinutes(days)).toBe(38);
  });

  it('never counts more community interactions than likes + comments, most first', () => {
    const rows = activity.byCommunity.value;
    const sum = rows.reduce((total, row) => total + row.interactions, 0);
    const { likes, comments } = activity.engagement;
    expect(sum).toBeLessThanOrEqual(likes.value.count + comments.value.count);
    const sorted = [...rows].sort((a, b) => b.interactions - a.interactions);
    expect(rows).toEqual(sorted);
  });

  it('never watched videos longer than the app was used', () => {
    expect(activity.seen.videos.value.minutes).toBeLessThanOrEqual(totalMinutes(days));
  });

  it('has a two-hour peak inside the day', () => {
    const { fromHour, toHour } = activity.peakHours.value;
    expect(toHour - fromHour).toBe(2);
    for (const hour of [fromHour, toHour]) {
      expect(hour).toBeGreaterThanOrEqual(0);
      expect(hour).toBeLessThanOrEqual(24);
    }
  });

  it('never grades the member: every report delta is neutral', () => {
    const deltas = [
      activity.usage.value.delta,
      ...Object.values(activity.engagement).map((metric) => metric.value.delta),
    ];
    for (const delta of deltas) {
      expect(delta.good).toBeNull();
      expect(delta.basis).toBe('previous_7_days');
    }
  });

  it('every metric that lacks a source is typed as example (D-03)', () => {
    const examples: Record<string, string> = {};
    const measured: string[] = [];
    const walk = (node: unknown, path: string[]): void => {
      if (typeof node !== 'object' || node === null) return;
      if ('example' in node && typeof node.example === 'boolean') {
        const key = path.join('.');
        if (node.example && 'reason' in node) examples[key] = String(node.reason);
        else measured.push(key);
        return;
      }
      for (const [key, child] of Object.entries(node)) walk(child, [...path, key]);
    };
    walk(activity, []);
    expect(examples).toEqual({
      usage: 'needs_usage_sessions',
      peakHours: 'needs_usage_sessions',
      'engagement.saves': 'needs_saves',
      'engagement.shares': 'needs_shares',
      'seen.posts': 'needs_post_views',
      'seen.videos': 'needs_video_playback',
    });
    expect(measured.sort()).toEqual(
      ['byCommunity', 'engagement.comments', 'engagement.likes', 'seen.stories'].sort(),
    );
  });
});
