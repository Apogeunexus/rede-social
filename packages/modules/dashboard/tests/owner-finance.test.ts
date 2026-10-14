import { describe, expect, it } from 'vitest';
import {
  buildOwnerFinanceLedger,
  classifyOrders,
  type EngagementBand,
  FINANCE_OFFERS,
  type FinanceOfferId,
  type FinanceOrder,
  financeOffer,
  financeProductOffers,
  ownerFinanceIncludes,
  ownerFinanceMembers,
  ownerFinanceOrders,
  ownerFinancePeople,
  ownerFinanceWindow,
  tenantOwnerPanel,
} from '../fixtures';
import { daysSince, ownerBandRoster } from '../fixtures/owner-members';
import { ENGAGEMENT_BAND_ORDER } from '../ui/metrics';

/**
 * Quick 261014-dwc: the Financeiro's single order ledger. Every total the panel, the member insights
 * and Conteúdo show comes from this one list, so these tests prove the sums (D-02) and the planner's
 * targets (PD-1..PD-6).
 */

const { engagement, growth, kpis, store, channels, communityEngagement } = tenantOwnerPanel;

const MEMBERS = new Map(ownerFinanceMembers.map((member) => [member.id, member]));
const PAID = ownerFinanceOrders.filter((order) => order.status === 'paid');
const KINDS = classifyOrders(ownerFinanceOrders);
const ROSTER = new Map(ownerBandRoster.map((row) => [row.id, row]));

function memberOf(order: FinanceOrder) {
  const member = MEMBERS.get(order.memberId);
  if (!member) throw new Error(`no member ${order.memberId}`);
  return member;
}

function paidOf(memberId: string): FinanceOrder[] {
  return PAID.filter((order) => order.memberId === memberId);
}

const inWindow = (order: FinanceOrder, from: number, to: number) =>
  order.daysAgo >= from && order.daysAgo <= to;

describe('the base (PD-5)', () => {
  it('holds the 1.240 members with unique ids, the bands of the panel', () => {
    expect(ownerFinanceMembers).toHaveLength(1240);
    expect(new Set(ownerFinanceMembers.map((member) => member.id)).size).toBe(1240);
    for (const band of ENGAGEMENT_BAND_ORDER) {
      expect(ownerFinanceMembers.filter((member) => member.band === band).length, band).toBe(
        engagement.counts[band],
      );
    }
  });

  it('holds the 72 roster members with their band and joining day, and 1.168 without a name', () => {
    for (const row of ownerBandRoster) {
      const member = MEMBERS.get(row.id);
      expect(member?.band, row.id).toBe(row.band);
      expect(member?.joinedDaysAgo, row.id).toBe(daysSince(row.memberSince));
    }
    const others = ownerFinanceMembers.filter((member) => !ROSTER.has(member.id));
    expect(others).toHaveLength(1168);
    for (const member of others) {
      expect(member.id).toMatch(/^ob-\d{4}$/);
      expect(Object.keys(member).sort()).toEqual(['band', 'id', 'joinedDaysAgo']);
    }
  });

  it('is deterministic', () => {
    expect(buildOwnerFinanceLedger()).toEqual({
      members: ownerFinanceMembers,
      orders: ownerFinanceOrders,
    });
  });

  it('puts novos under 30 days, em risco from 31 and inativos from 61', () => {
    for (const member of ownerFinanceMembers) {
      if (member.band === 'new') expect(member.joinedDaysAgo, member.id).toBeLessThan(30);
      else expect(member.joinedDaysAgo, member.id).toBeGreaterThanOrEqual(30);
      if (member.band === 'at_risk') {
        expect(member.joinedDaysAgo, member.id).toBeGreaterThanOrEqual(31);
      }
      if (member.band === 'inactive') {
        expect(member.joinedDaysAgo, member.id).toBeGreaterThanOrEqual(61);
      }
    }
  });
});

describe('primary and secondary revenue (D-02, D-03, D-05, PD-18)', () => {
  it('gives every member exactly one primary order: the first paid one, on the joining day', () => {
    for (const member of ownerFinanceMembers) {
      const paid = paidOf(member.id);
      const primaries = paid.filter((order) => KINDS.get(order.id) === 'primary');
      expect(primaries, member.id).toHaveLength(1);
      const [primary] = primaries;
      expect(primary?.daysAgo, member.id).toBe(member.joinedDaysAgo);
      expect(financeOffer(primary?.offerId ?? '').kind, member.id).toBe('entry');
      for (const order of paid) {
        expect(order.daysAgo, order.id).toBeLessThanOrEqual(member.joinedDaysAgo);
      }
    }
  });

  it('classifies a renewal (same member, same product, 365 days later) as secondary', () => {
    const entry: FinanceOrder = {
      id: 'x-1',
      memberId: 'x',
      offerId: 'vip-entrada',
      productId: 's2',
      cents: 24700,
      daysAgo: 400,
      status: 'paid',
    };
    const renewal: FinanceOrder = {
      ...entry,
      id: 'x-2',
      offerId: 'vip-adicional',
      cents: 19700,
      daysAgo: 35,
    };
    const kinds = classifyOrders([renewal, entry]);
    expect(kinds.get('x-1')).toBe('primary');
    expect(kinds.get('x-2')).toBe('secondary');
  });

  it('never makes a revoked order primary, nor counts it', () => {
    const revoked = ownerFinanceOrders.filter((order) => order.status === 'revoked');
    expect(revoked.length).toBeGreaterThan(0);
    for (const order of revoked) expect(KINDS.has(order.id), order.id).toBe(false);
    const kinds = classifyOrders([
      {
        id: 'y-1',
        memberId: 'y',
        offerId: 'ebook-entrada',
        productId: 's3',
        cents: 1700,
        daysAgo: 50,
        status: 'revoked',
      },
      {
        id: 'y-2',
        memberId: 'y',
        offerId: 'ebook-entrada',
        productId: 's3',
        cents: 1700,
        daysAgo: 40,
        status: 'paid',
      },
    ]);
    expect(kinds.has('y-1')).toBe(false);
    expect(kinds.get('y-2')).toBe('primary');
  });

  it('prices every order at its offer, and the offers at PD-2', () => {
    expect(
      FINANCE_OFFERS.map((offer) => [offer.id, offer.productId, offer.kind, offer.priceCents]),
    ).toEqual([
      ['ebook-entrada', 's3', 'entry', 1700],
      ['vip-entrada', 's2', 'entry', 24700],
      ['ebook-adicional', 's3', 'addon', 2700],
      ['vip-adicional', 's2', 'addon', 19700],
      ['mentoria-adicional', 's1', 'addon', 49000],
      ['workshop-adicional', 's4', 'addon', 9700],
    ]);
    for (const order of ownerFinanceOrders) {
      const offer = financeOffer(order.offerId);
      expect(order.cents, order.id).toBe(offer.priceCents);
      expect(order.productId, order.id).toBe(offer.productId);
    }
    expect(financeProductOffers('s2').map((offer) => offer.id)).toEqual([
      'vip-entrada',
      'vip-adicional',
    ]);
    expect(() => financeOffer('xyz')).toThrow();
    expect(() => financeProductOffers('xyz')).toThrow();
  });
});

describe('entries (D-02)', () => {
  it('match the weekly joins, and the 96 novos of the month', () => {
    const primaries = PAID.filter((order) => KINDS.get(order.id) === 'primary');
    const weekly = Array.from({ length: 12 }, (_, i) => {
      const weeksBack = 11 - i;
      return primaries.filter((order) => inWindow(order, 7 * weeksBack, 7 * weeksBack + 6)).length;
    });
    expect(weekly).toEqual(growth.weeklyJoined);
    const month = primaries.filter((order) => inWindow(order, 0, 29)).length;
    expect(month).toBe(96);
    expect(month).toBe(engagement.counts.new);
    expect(month).toBe(kpis.members.newMembers);
    expect(month).toBe(growth.joined);
  });
});

describe('the last 30 days (PD-3)', () => {
  const month = ownerFinanceWindow(0, 29);

  it('split by offer', () => {
    const byOffer = Object.fromEntries(
      FINANCE_OFFERS.map((offer) => [
        offer.id,
        [month.byOffer[offer.id].orders, month.byOffer[offer.id].cents],
      ]),
    );
    expect(byOffer).toEqual({
      'vip-entrada': [11, 271700],
      'ebook-entrada': [85, 144500],
      'mentoria-adicional': [6, 294000],
      'vip-adicional': [7, 137900],
      'ebook-adicional': [17, 45900],
      'workshop-adicional': [0, 0],
    });
  });

  it('add up to 96 entries and 30 add-on purchases: 126 orders and R$ 8.940,00', () => {
    expect(month.primary).toEqual({ orders: 96, cents: 416200 });
    expect(month.secondary).toEqual({ orders: 30, cents: 477800 });
    expect(month.total.orders).toBe(126);
    expect(month.total.cents).toBe(894000);
    expect(month.revoked.orders).toBe(2);
    expect(Math.round((100 * month.secondary.cents) / month.total.cents)).toBe(53);
    expect(Math.round(month.primary.cents / month.primary.orders)).toBe(4335);
  });

  it('split by product', () => {
    const byProduct = Object.fromEntries(
      ['s2', 's1', 's3', 's4'].map((id) => [
        id,
        [month.byProduct[id]?.orders, month.byProduct[id]?.cents],
      ]),
    );
    expect(byProduct).toEqual({
      s2: [18, 409600],
      s1: [6, 294000],
      s3: [102, 190400],
      s4: [0, 0],
    });
  });

  it('split by today’s band (PD-4)', () => {
    const byBand = Object.fromEntries(
      ENGAGEMENT_BAND_ORDER.map((band) => [
        band,
        [month.byBand[band].orders, month.byBand[band].cents],
      ]),
    );
    expect(byBand).toEqual({
      new: [99, 475300],
      superfan: [10, 212200],
      engaged: [11, 173300],
      occasional: [6, 33200],
      at_risk: [0, 0],
      inactive: [0, 0],
    });
  });

  it('cancel one VIP add-on and one Mentoria, out of the revenue', () => {
    const revoked = ownerFinanceOrders.filter(
      (order) => order.status === 'revoked' && inWindow(order, 0, 29),
    );
    expect(revoked.map((order) => order.offerId).sort()).toEqual([
      'mentoria-adicional',
      'vip-adicional',
    ]);
  });

  it('agree with the panel: the order value, the products and the orders channel (PD-1)', () => {
    expect(kpis.orderValue.cents).toBe(month.total.cents);
    for (const product of store.products) {
      expect([product.orders, product.cents], product.id).toEqual([
        month.byProduct[product.id]?.orders,
        month.byProduct[product.id]?.cents,
      ]);
    }
    expect(channels.find((row) => row.channel === 'orders')?.count).toBe(126);
  });

  it('closes the 30 days before at a total that makes the +12%', () => {
    const before = ownerFinanceWindow(30, 59);
    expect(before.total.cents).toBeGreaterThanOrEqual(794700);
    expect(before.total.cents).toBeLessThanOrEqual(801700);
    expect(Math.round((100 * (month.total.cents - before.total.cents)) / before.total.cents)).toBe(
      12,
    );
  });
});

describe('the ledger’s rules', () => {
  const vipOwners = (band: EngagementBand) =>
    ownerFinanceMembers.filter(
      (member) =>
        member.band === band &&
        paidOf(member.id).some((order) => order.productId === 's2' && order.daysAgo < 365),
    ).length;

  it('owns the VIP as the VIP community counts it (186)', () => {
    const vip = communityEngagement.find((row) => row.id === 'c-vip');
    for (const band of ENGAGEMENT_BAND_ORDER) {
      expect(vipOwners(band), band).toBe(vip?.bands.counts[band]);
    }
  });

  it('gives a roster member exactly one paid VIP order when they have VIP access', () => {
    for (const row of ownerBandRoster) {
      const vip = paidOf(row.id).filter((order) => order.productId === 's2');
      expect(vip, row.id).toHaveLength(row.communities['c-vip'] ? 1 : 0);
    }
  });

  it('sells each product to a member at most once', () => {
    const seen = new Set<string>();
    for (const order of PAID) {
      const key = `${order.memberId}:${order.productId}`;
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
    }
  });

  it('keeps the 30-day orders to active bands, em risco from 31 days and inativos from 61', () => {
    for (const order of ownerFinanceOrders) {
      const { band } = memberOf(order);
      if (order.daysAgo < 30) expect(['new', 'superfan', 'engaged', 'occasional']).toContain(band);
      if (band === 'at_risk') expect(order.daysAgo, order.id).toBeGreaterThanOrEqual(31);
      if (band === 'inactive') expect(order.daysAgo, order.id).toBeGreaterThanOrEqual(61);
    }
  });

  it('sold the Workshop gravado, last over 60 days ago', () => {
    const workshop = PAID.filter((order) => order.productId === 's4');
    expect(workshop.length).toBeGreaterThan(0);
    expect(Math.min(...workshop.map((order) => order.daysAgo))).toBeGreaterThan(60);
  });

  it('ends exactly 6 accesses in the next 7 days, all VIP entries, the first 6 members', () => {
    const ending = PAID.filter(
      (order) => KINDS.get(order.id) === 'primary' && order.daysAgo >= 358 && order.daysAgo <= 364,
    );
    expect(ending).toHaveLength(6);
    for (const order of ending) expect(order.offerId).toBe('vip-entrada');
    expect(ownerFinanceMembers.filter((member) => member.joinedDaysAgo >= 358).length).toBe(6);
  });

  it('meets the planner’s lifetime targets: who bought again, when, and the ladder', () => {
    const again = ownerFinanceMembers.filter((member) => paidOf(member.id).length >= 2);
    const share = again.length / ownerFinanceMembers.length;
    expect(share).toBeGreaterThanOrEqual(0.15);
    expect(share).toBeLessThanOrEqual(0.25);
    const gaps = again.map((member) => {
      const [first, second] = [...paidOf(member.id)].sort((a, b) => b.daysAgo - a.daysAgo);
      return (first?.daysAgo ?? 0) - (second?.daysAgo ?? 0);
    });
    const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    expect(average).toBeGreaterThanOrEqual(20);
    expect(average).toBeLessThanOrEqual(60);
    const paths = new Map<string, number>();
    for (const member of again) {
      const [first, second] = [...paidOf(member.id)].sort((a, b) => b.daysAgo - a.daysAgo);
      const key = `${first?.offerId}>${second?.offerId}`;
      paths.set(key, (paths.get(key) ?? 0) + 1);
    }
    const counts = [...paths.values()];
    expect(counts.filter((count) => count >= 5).length).toBeGreaterThanOrEqual(3);
    expect(counts.filter((count) => count < 5).length).toBeGreaterThanOrEqual(1);
  });
});

describe('the roster’s orders (PD-6)', () => {
  const month = ownerFinanceOrders.filter(
    (order) => order.status === 'paid' && inWindow(order, 0, 29),
  );
  const rosterMonth = month.filter((order) => ROSTER.has(order.memberId));

  it('stays within the base in every offer and band', () => {
    for (const offer of FINANCE_OFFERS) {
      for (const band of ENGAGEMENT_BAND_ORDER) {
        const of = (rows: FinanceOrder[]) =>
          rows.filter((order) => order.offerId === offer.id && memberOf(order).band === band)
            .length;
        expect(of(rosterMonth), `${offer.id} ${band}`).toBeLessThanOrEqual(of(month));
      }
    }
  });

  it('has a roster buyer for every offer sold in the month', () => {
    for (const offer of FINANCE_OFFERS) {
      if (!month.some((order) => order.offerId === offer.id)) continue;
      expect(
        rosterMonth.some((order) => order.offerId === offer.id),
        offer.id,
      ).toBe(true);
    }
  });

  it('buys at most once a month, on the last active day (novos: on joining)', () => {
    for (const row of ownerBandRoster) {
      const orders = rosterMonth.filter((order) => order.memberId === row.id);
      expect(orders.length, row.id).toBeLessThanOrEqual(1);
      const [order] = orders;
      if (!order) continue;
      const day = row.band === 'new' ? daysSince(row.memberSince) : row.lastActive.daysAgo;
      expect(order.daysAgo, row.id).toBe(day);
    }
  });

  it('puts older add-on purchases 90 days back or more, never after the last action', () => {
    for (const order of PAID) {
      const row = ROSTER.get(order.memberId);
      if (!row || KINDS.get(order.id) !== 'secondary' || order.daysAgo < 30) continue;
      expect(order.daysAgo, order.id).toBeGreaterThanOrEqual(90);
      expect(order.daysAgo, order.id).toBeGreaterThanOrEqual(row.lastActive.daysAgo);
    }
  });
});

describe('ownerFinancePeople (D-11: the one web file that reads it lists names)', () => {
  const offerIds: FinanceOfferId[] = FINANCE_OFFERS.map((offer) => offer.id);

  it('lists the VIP entry’s roster buyers, most recent first, out of 11', () => {
    const { people, total } = ownerFinancePeople({ kind: 'offer', offerId: 'vip-entrada' });
    expect(total).toBe(11);
    const expected = ownerBandRoster
      .filter((row) => row.band === 'new' && row.communities['c-vip'])
      .map((row) => row.id);
    expect(people.map((person) => person.id).sort()).toEqual([...expected].sort());
    for (const [i, person] of people.entries()) {
      const before = people[i - 1];
      if (before) expect(person.when.daysAgo).toBeGreaterThanOrEqual(before.when.daysAgo);
      expect(person.cents).toBe(24700);
      expect(person.offerId).toBe('vip-entrada');
      expect(person.band).toBe('new');
    }
  });

  it('holds exactly the members ownerFinanceIncludes says, each total its offer’s orders', () => {
    const month = ownerFinanceWindow(0, 29);
    for (const offerId of offerIds) {
      const list = { kind: 'offer', offerId } as const;
      const { people, total } = ownerFinancePeople(list);
      expect(total, offerId).toBe(month.byOffer[offerId].orders);
      const ids = new Set(people.map((person) => person.id));
      for (const row of ownerBandRoster) {
        expect(ownerFinanceIncludes(list, row.id), `${offerId} ${row.id}`).toBe(ids.has(row.id));
      }
    }
  });

  it('throws on an offer the fixture does not have', () => {
    expect(() => ownerFinancePeople({ kind: 'offer', offerId: 'xyz' as FinanceOfferId })).toThrow();
  });
});
