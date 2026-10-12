import { resolveBranding, tenantBrandingSchema } from '@rede-social/contracts/branding';
import { describe, expect, it } from 'vitest';
import { platformOwnerPanel, previewTenant, tenantAdminPanel, tenantOwnerPanel } from '../fixtures';
import { bandTotal, interactedPercent } from '../ui/metrics';

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
