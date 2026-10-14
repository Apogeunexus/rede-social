import { ENGAGEMENT_BAND_ORDER } from '../ui/metrics';
import { daysSince, type OwnerBandMember, ownerBandRoster } from './owner-members';
import type { RelativeMoment } from './platform-panels';
import type { EngagementBand } from './shared';
import { tenantOwnerPanel } from './tenant-owner';

/**
 * The level-4 Financeiro (quick 261014-dwc): ONE list of store orders, from which every money total
 * of the preview is computed — the Financeiro tabs, the panel's month (`kpis.orderValue`,
 * `store.products`, the orders channel), each member's purchases (`owner-member-insights.ts`) and
 * the sales tied to a publication (`owner-content.ts`). RAW DATA (MOD-02): ids, offers, days ago and
 * integer cents; no clock and no randomness, so two builds are equal.
 *
 * D-02 Primary × secondary revenue, by ORDER, never by product. Every member's first paid order is
 * primary: the purchase that gave access to the app, dated the day they joined. Every paid order
 * after it is secondary (an add-on purchase), a renewal included. `classifyOrders` computes it; it
 * is never stored on the order (PD-18). The same product sells as an entry and as an add-on, through
 * different OFFERS (own composition and price, PD-2); the 96 novos of the month are the month's 96
 * primary orders.
 * D-03 An entry gives one year of access: the access ends on purchase + 365 (an example, `expires_at`
 * is never filled). The community opened about a year ago: the 6 founders joined 358-364 days ago,
 * their accesses end in the next 7 days, and nobody else joined that week, so no access has ended
 * and nobody renewed yet (PD-5).
 * D-05 A revoked order (the admin's cancellation) never counts as revenue, as an order nor as primary.
 * PD-1 The month keeps R$ 8.940,00; its orders go from 96 to 126 (96 entries + 30 add-ons, PD-3).
 * PD-4 The buyer's band is today's: a purchase in the last 30 days is an action, so em risco and
 * inativos buy nothing in the month, and the month's entries are exactly the novos.
 * PD-6 The 72 roster members (the named sample) enter on their `memberSince`; the novos and the
 * VIP holders with an even slot enter through the VIP, the others through the e-book; a VIP holder
 * with an odd slot buys the VIP as an add-on later. A roster member buys at most once in the month,
 * on their last active day (a novo: the entry), and an older add-on sits 90+ days back, outside the
 * insights' 90-day window, so no band or history moves.
 */

export type FinanceOfferId =
  | 'ebook-entrada'
  | 'vip-entrada'
  | 'ebook-adicional'
  | 'vip-adicional'
  | 'mentoria-adicional'
  | 'workshop-adicional';

/** An entry offer is a member's first purchase (it gives the app); an add-on is any later one. */
export type FinanceOfferKind = 'entry' | 'addon';

export interface FinanceOffer {
  id: FinanceOfferId;
  /** Level 5's product id. */
  productId: string;
  kind: FinanceOfferKind;
  /** What the offer sells: tenant content, like a product's name. */
  composition: string;
  priceCents: number;
}

/** A member of the base: only the band of today and the day they joined; the roster has names. */
export interface FinanceMember {
  id: string;
  band: EngagementBand;
  joinedDaysAgo: number;
}

export interface FinanceOrder {
  id: string;
  memberId: string;
  offerId: FinanceOfferId;
  productId: string;
  cents: number;
  daysAgo: number;
  status: 'paid' | 'revoked';
}

/** Computed per order, never stored (PD-18). */
export type RevenueKind = 'primary' | 'secondary';

/** PD-2: the client's offers (no table records them yet). Add-ons keep today's unit prices. */
export const FINANCE_OFFERS: readonly FinanceOffer[] = [
  {
    id: 'ebook-entrada',
    productId: 's3',
    kind: 'entry',
    composition: 'E-book + 1 ano de acesso ao app',
    priceCents: 1700,
  },
  {
    id: 'vip-entrada',
    productId: 's2',
    kind: 'entry',
    composition: 'Comunidade VIP + 1 ano de acesso ao app',
    priceCents: 24700,
  },
  {
    id: 'ebook-adicional',
    productId: 's3',
    kind: 'addon',
    composition: 'E-book',
    priceCents: 2700,
  },
  {
    id: 'vip-adicional',
    productId: 's2',
    kind: 'addon',
    composition: 'Comunidade VIP por 1 ano',
    priceCents: 19700,
  },
  {
    id: 'mentoria-adicional',
    productId: 's1',
    kind: 'addon',
    composition: 'Mentoria em grupo: 4 encontros ao vivo',
    priceCents: 49000,
  },
  {
    id: 'workshop-adicional',
    productId: 's4',
    kind: 'addon',
    composition: 'Workshop gravado',
    priceCents: 9700,
  },
];

const PRODUCT_IDS: readonly string[] = tenantOwnerPanel.store.products.map((row) => row.id);

/** An offer by id; an id the fixture does not have is a bug, so it throws. */
export function financeOffer(id: string): FinanceOffer {
  const offer = FINANCE_OFFERS.find((row) => row.id === id);
  if (!offer) throw new Error(`no offer ${id}`);
  return offer;
}

/** A product's offers, the entry first; an unknown product throws. */
export function financeProductOffers(productId: string): FinanceOffer[] {
  if (!PRODUCT_IDS.includes(productId)) throw new Error(`no product ${productId}`);
  return FINANCE_OFFERS.filter((offer) => offer.productId === productId).sort(
    (a, b) => Number(a.kind === 'addon') - Number(b.kind === 'addon'),
  );
}

/**
 * Each paid order's revenue kind: a member's first paid order (most days ago; on a tie, the first in
 * the list) is primary, every later one secondary. A revoked order gets none.
 */
export function classifyOrders(orders: readonly FinanceOrder[]): ReadonlyMap<string, RevenueKind> {
  const first = new Map<string, FinanceOrder>();
  for (const order of orders) {
    if (order.status !== 'paid') continue;
    const before = first.get(order.memberId);
    if (!before || order.daysAgo > before.daysAgo) first.set(order.memberId, order);
  }
  const kinds = new Map<string, RevenueKind>();
  for (const order of orders) {
    if (order.status !== 'paid') continue;
    kinds.set(order.id, first.get(order.memberId) === order ? 'primary' : 'secondary');
  }
  return kinds;
}

/* ------------------------------------------------------------------------------- the base */

const { engagement, growth, communityEngagement } = tenantOwnerPanel;

/** Joins per week, 13 to 24 weeks back (newest first): 12 to 18 a week (the 12 weeks before). */
const PRIOR_WEEKLY_JOINS = [16, 13, 17, 15, 12, 18, 14, 16, 13, 17, 15, 14] as const;

/** The first members, who joined in the community's first week (PD-5). */
const FOUNDERS = 6;
const FOUNDERS_FROM = 358;
const DAYS_A_YEAR = 365;

/** Everyone else not counted by a week joined in this range of days ago. */
const REST_FROM = 7 * (12 + PRIOR_WEEKLY_JOINS.length);
const REST_TO = FOUNDERS_FROM - 1;

/** The founders' bands: loyal members, mostly still active. */
const FOUNDER_BANDS: readonly EngagementBand[] = [
  'superfan',
  'engaged',
  'engaged',
  'occasional',
  'superfan',
  'at_risk',
];

/** `count` days spread evenly over [from, to]. */
function spreadDays(from: number, to: number, count: number): number[] {
  const span = to - from + 1;
  return Array.from({ length: count }, (_, k) => from + Math.floor((k * span) / count));
}

function at<T>(rows: readonly T[], index: number): T {
  const row = rows[index];
  if (row === undefined) throw new Error(`no row at index ${index}`);
  return row;
}

const BASE_SIZE = ENGAGEMENT_BAND_ORDER.reduce((sum, band) => sum + engagement.counts[band], 0);

/**
 * The day (days ago) every member joined: the 12 weeks of `growth.weeklyJoined` in 7-day blocks back
 * from today (as `weeklyActiveDays`), the novos exactly under 30 days, the 12 weeks before, the
 * founders and the rest of the year between them.
 */
function joinDays(): number[] {
  const weekly = [...growth.weeklyJoined].reverse();
  const days: number[] = [];
  let novos = 0;
  for (const [w, count] of weekly.entries()) {
    const from = 7 * w;
    const to = from + 6;
    if (to < 30) {
      days.push(...spreadDays(from, to, count));
      novos += count;
    } else if (from < 30) {
      // The week across the 30-day line: its first days close the novos.
      const under = engagement.counts.new - novos;
      days.push(...spreadDays(from, 29, under), ...spreadDays(30, to, count - under));
      novos += under;
    } else {
      days.push(...spreadDays(from, to, count));
    }
  }
  for (const [k, count] of PRIOR_WEEKLY_JOINS.entries()) {
    const from = 7 * (weekly.length + k);
    days.push(...spreadDays(from, from + 6, count));
  }
  const rest = BASE_SIZE - days.length - FOUNDERS;
  days.push(...spreadDays(REST_FROM, REST_TO, rest));
  days.push(...spreadDays(FOUNDERS_FROM, FOUNDERS_FROM + 6, FOUNDERS));
  return days.sort((a, b) => a - b);
}

const allowedBand = (band: EngagementBand, joined: number) =>
  band === 'at_risk' ? joined >= 31 : band === 'inactive' ? joined >= 61 : true;

/**
 * The base: the roster on its own joining days, then the anonymous members (`ob-0001`, most recent
 * first) on the days left. Their bands make up `engagement.counts`: novos under 30 days, the founders
 * as FOUNDER_BANDS, and the rest interleaved by need (em risco from 31 days, inativos from 61).
 */
function buildMembers(): FinanceMember[] {
  const left = new Map<number, number>();
  for (const day of joinDays()) left.set(day, (left.get(day) ?? 0) + 1);
  const members: FinanceMember[] = [];
  for (const row of ownerBandRoster) {
    const joined = daysSince(row.memberSince);
    const count = left.get(joined) ?? 0;
    if (count === 0) throw new Error(`no joining slot for ${row.id} on day ${joined}`);
    left.set(joined, count - 1);
    members.push({ id: row.id, band: row.band, joinedDaysAgo: joined });
  }
  const days = [...left.entries()]
    .sort((a, b) => a[0] - b[0])
    .flatMap(([day, count]) => Array.from({ length: count }, () => day));

  const need: Record<EngagementBand, number> = { ...engagement.counts };
  for (const member of members) need[member.band] -= 1;
  for (const band of FOUNDER_BANDS) need[band] -= 1;
  const middle = days.filter((day) => day >= 30 && day < FOUNDERS_FROM).length;
  const targets = { ...need };
  const given: Record<EngagementBand, number> = {
    new: 0,
    superfan: 0,
    engaged: 0,
    occasional: 0,
    at_risk: 0,
    inactive: 0,
  };

  let k = 0;
  let founder = 0;
  for (const [i, joined] of days.entries()) {
    let band: EngagementBand;
    if (joined < 30) band = 'new';
    else if (joined >= FOUNDERS_FROM) {
      band = at(FOUNDER_BANDS, founder);
      founder += 1;
    } else {
      let best: EngagementBand | null = null;
      let bestScore = Number.NEGATIVE_INFINITY;
      for (const row of ENGAGEMENT_BAND_ORDER) {
        if (row === 'new' || given[row] >= targets[row] || !allowedBand(row, joined)) continue;
        const score = (targets[row] * (k + 1)) / middle - given[row];
        if (score > bestScore) {
          best = row;
          bestScore = score;
        }
      }
      if (!best) throw new Error(`no band left for a member joined ${joined} days ago`);
      band = best;
      given[band] += 1;
      k += 1;
    }
    members.push({ id: `ob-${String(i + 1).padStart(4, '0')}`, band, joinedDaysAgo: joined });
  }
  for (const band of ENGAGEMENT_BAND_ORDER) {
    const count = members.filter((member) => member.band === band).length;
    if (count !== engagement.counts[band]) {
      throw new Error(`the base holds ${count} ${band}, the panel ${engagement.counts[band]}`);
    }
  }
  return members;
}

/* ----------------------------------------------------------------------------- the orders */

interface RawOrder {
  memberId: string;
  offerId: FinanceOfferId;
  daysAgo: number;
  status: FinanceOrder['status'];
}

/** The add-ons of the last 30 days bought by anonymous members (PD-3 minus the roster's). */
interface MonthAddons {
  band: EngagementBand;
  offerId: FinanceOfferId;
  days: readonly number[];
}

/**
 * PD-3's month, minus the roster's five add-ons (`ROSTER_MONTH`): the days are placed so the sales
 * tied to a publication fit their 7-day windows (quick 261014-dwc Tarefa 2).
 */
const MONTH_ADDONS: readonly MonthAddons[] = [
  { band: 'superfan', offerId: 'mentoria-adicional', days: [5, 13, 20] },
  { band: 'engaged', offerId: 'mentoria-adicional', days: [3, 17] },
  { band: 'new', offerId: 'vip-adicional', days: [1, 3, 6] },
  { band: 'engaged', offerId: 'vip-adicional', days: [0, 2, 5] },
  { band: 'superfan', offerId: 'ebook-adicional', days: [0, 1, 4, 9, 22] },
  { band: 'engaged', offerId: 'ebook-adicional', days: [2, 3, 7, 14, 26] },
  { band: 'occasional', offerId: 'ebook-adicional', days: [4, 11, 18, 25] },
];

/** The roster's add-ons of the month, each on the member's last active day (PD-6). */
const ROSTER_MONTH: Readonly<Record<string, FinanceOfferId>> = {
  'om-13': 'mentoria-adicional',
  'om-15': 'ebook-adicional',
  'om-27': 'ebook-adicional',
  'om-39': 'ebook-adicional',
  'om-40': 'vip-adicional',
};

/** The month's cancellations (D-05): revoked by the admin, out of the revenue. */
const MONTH_REVOKED: readonly MonthAddons[] = [
  { band: 'engaged', offerId: 'vip-adicional', days: [12] },
  { band: 'superfan', offerId: 'mentoria-adicional', days: [8] },
];

/** The 30 days before (30-59 days ago): add-ons beyond the VIP ones the joining rule places. */
const BEFORE_ADDONS: readonly MonthAddons[] = [
  { band: 'superfan', offerId: 'mentoria-adicional', days: [33, 41, 52] },
  { band: 'engaged', offerId: 'mentoria-adicional', days: [36, 47] },
  { band: 'superfan', offerId: 'ebook-adicional', days: [31, 37, 44, 48, 53] },
  { band: 'engaged', offerId: 'ebook-adicional', days: [34, 39, 42, 50, 57, 58] },
  { band: 'occasional', offerId: 'ebook-adicional', days: [32, 38, 46, 51, 55, 59] },
];

/** Older add-ons are at least this old: past the 30 days before. */
const OLDER_FROM = 61;

/** The newest Workshop gravado sale: it has sold nothing for over 60 days (PD-9). */
const WORKSHOP_FROM = 74;

const ACTIVE_BANDS: readonly EngagementBand[] = ['superfan', 'engaged', 'occasional', 'at_risk'];
const OLD_BANDS: readonly EngagementBand[] = [...ACTIVE_BANDS, 'inactive'];

/**
 * Older add-ons, per offer: how many, from which bands and which entry, and from how many days back.
 * A few VIP entrants buy the Workshop gravado next: a path of the ladder under 5 people.
 */
const OLDER_ADDONS: readonly {
  offerId: FinanceOfferId;
  bands: readonly EngagementBand[];
  entry: FinanceOfferId;
  count: number;
  from: number;
}[] = [
  {
    offerId: 'mentoria-adicional',
    bands: ACTIVE_BANDS,
    entry: 'ebook-entrada',
    count: 45,
    from: OLDER_FROM,
  },
  {
    offerId: 'ebook-adicional',
    bands: OLD_BANDS,
    entry: 'vip-entrada',
    count: 26,
    from: OLDER_FROM,
  },
  {
    offerId: 'workshop-adicional',
    bands: OLD_BANDS,
    entry: 'ebook-entrada',
    count: 9,
    from: WORKSHOP_FROM,
  },
  {
    offerId: 'workshop-adicional',
    bands: OLD_BANDS,
    entry: 'vip-entrada',
    count: 3,
    from: WORKSHOP_FROM,
  },
];

/** Days from the entry to an older add-on: 7 to 56. */
const delayOf = (k: number) => 7 + ((k * 11) % 50);

/** The earliest day (days ago) a member of the band may have bought, by the band's rules. */
function lowestDay(band: EngagementBand): number {
  if (band === 'inactive') return 61;
  if (band === 'at_risk') return 31;
  return band === 'new' ? 0 : 30;
}

function buildOrders(members: readonly FinanceMember[]): RawOrder[] {
  const byId = new Map(members.map((member) => [member.id, member]));
  const roster = new Map(ownerBandRoster.map((row) => [row.id, row]));
  const vipBands = communityEngagement.find((row) => row.id === 'c-vip')?.bands.counts;
  if (!vipBands) throw new Error('no VIP community bands');

  const orders: RawOrder[] = [];
  const owned = new Set<string>();
  const add = (memberId: string, offerId: FinanceOfferId, daysAgo: number) => {
    const { productId } = financeOffer(offerId);
    const key = `${memberId}:${productId}`;
    if (owned.has(key)) throw new Error(`${memberId} already owns ${productId}`);
    const member = byId.get(memberId);
    if (!member || daysAgo > member.joinedDaysAgo || daysAgo < 0) {
      throw new Error(`${memberId} cannot buy ${offerId} ${daysAgo} days ago`);
    }
    owned.add(key);
    orders.push({ memberId, offerId, daysAgo, status: 'paid' });
  };
  const owns = (memberId: string, productId: string) => owned.has(`${memberId}:${productId}`);

  // 1. Who holds the VIP and how they entered: the roster by its slot (PD-6), the founders by the VIP,
  //    the other anonymous holders spread across each band, alternating entry and add-on.
  const anonymous = members.filter((member) => !roster.has(member.id));
  const vipEntry = new Set<string>();
  const vipAddon = new Set<string>();
  for (const row of ownerBandRoster) {
    if (!row.communities['c-vip']) continue;
    const j = ownerBandRoster.filter((other) => other.band === row.band).indexOf(row);
    if (row.band === 'new' || j % 2 === 0) vipEntry.add(row.id);
    else vipAddon.add(row.id);
  }
  for (const member of anonymous) {
    if (member.joinedDaysAgo >= FOUNDERS_FROM) vipEntry.add(member.id);
  }
  for (const band of ENGAGEMENT_BAND_ORDER) {
    const holders = members.filter(
      (member) => member.band === band && (vipEntry.has(member.id) || vipAddon.has(member.id)),
    ).length;
    const pool = anonymous.filter(
      (member) => member.band === band && member.joinedDaysAgo < FOUNDERS_FROM,
    );
    if (band === 'new') {
      // One anonymous novo enters by the VIP today; three buy it as an add-on this month.
      const first = at(pool, 0);
      vipEntry.add(first.id);
      continue;
    }
    const count = vipBands[band] - holders;
    for (let i = 0; i < count; i += 1) {
      const member = at(pool, Math.floor(((i + 0.5) * pool.length) / count));
      if (i % 2 === 0) vipEntry.add(member.id);
      else vipAddon.add(member.id);
    }
  }

  // 2. Every member's entry, on the day they joined.
  for (const member of members) {
    add(member.id, vipEntry.has(member.id) ? 'vip-entrada' : 'ebook-entrada', member.joinedDaysAgo);
  }

  // 3. The roster's add-ons: the month's five on the last active day, the other VIP add-ons 90+ days
  //    back, never after the last action.
  for (const row of ownerBandRoster) {
    const month = ROSTER_MONTH[row.id];
    if (month) {
      add(row.id, month, row.lastActive.daysAgo);
      continue;
    }
    if (!vipAddon.has(row.id)) continue;
    const joined = daysSince(row.memberSince);
    const j = ownerBandRoster.filter((other) => other.band === row.band).indexOf(row);
    add(row.id, 'vip-adicional', Math.max(90, row.lastActive.daysAgo, joined - delayOf(j)));
  }

  // 4. The anonymous month: PD-3's add-ons and cancellations, from the most recent joiners up.
  const pick = (
    band: EngagementBand,
    offerId: FinanceOfferId,
    day: number,
    taken: ReadonlySet<string>,
  ): FinanceMember => {
    const { productId } = financeOffer(offerId);
    const member = anonymous.find(
      (row) =>
        row.band === band &&
        row.joinedDaysAgo > day &&
        !taken.has(row.id) &&
        !owns(row.id, productId) &&
        (offerId !== 'vip-adicional' || !vipEntry.has(row.id)) &&
        (offerId !== 'ebook-adicional' || vipEntry.has(row.id)),
    );
    if (!member) throw new Error(`no ${band} member left to buy ${offerId} ${day} days ago`);
    return member;
  };
  const busy = new Set<string>();
  const vipMonth = new Set<string>();
  for (const group of MONTH_ADDONS) {
    for (const day of group.days) {
      let member: FinanceMember;
      if (group.offerId === 'vip-adicional' && group.band !== 'new') {
        // An anonymous VIP add-on holder whose purchase falls in the month.
        const found = anonymous.find(
          (row) =>
            row.band === group.band &&
            vipAddon.has(row.id) &&
            !vipMonth.has(row.id) &&
            row.joinedDaysAgo > day,
        );
        if (!found) throw new Error(`no ${group.band} VIP add-on holder for the month`);
        member = found;
      } else {
        member = pick(group.band, group.offerId, day, busy);
      }
      if (group.offerId === 'vip-adicional') {
        vipAddon.add(member.id);
        vipMonth.add(member.id);
      }
      busy.add(member.id);
      add(member.id, group.offerId, day);
    }
  }
  for (const group of MONTH_REVOKED) {
    for (const day of group.days) {
      const member = anonymous.find(
        (row) =>
          row.band === group.band &&
          row.joinedDaysAgo > day &&
          !busy.has(row.id) &&
          !vipEntry.has(row.id) &&
          !vipAddon.has(row.id) &&
          !owns(row.id, financeOffer(group.offerId).productId),
      );
      if (!member) throw new Error(`no ${group.band} member to cancel ${group.offerId}`);
      busy.add(member.id);
      orders.push({ memberId: member.id, offerId: group.offerId, daysAgo: day, status: 'revoked' });
    }
  }

  // 5. The other anonymous VIP add-ons: some days after joining, never in the month, within the
  //    band's rules.
  let k = 0;
  for (const member of anonymous) {
    if (!vipAddon.has(member.id) || vipMonth.has(member.id)) continue;
    const day = Math.max(lowestDay(member.band), member.joinedDaysAgo - delayOf(k));
    add(member.id, 'vip-adicional', Math.min(day, member.joinedDaysAgo));
    k += 1;
  }

  // 6. The 30 days before, then the older add-ons: anonymous members not busy in the month.
  for (const group of BEFORE_ADDONS) {
    for (const day of group.days) {
      const member = pick(group.band, group.offerId, day, busy);
      busy.add(member.id);
      add(member.id, group.offerId, day);
    }
  }
  for (const group of OLDER_ADDONS) {
    const { productId } = financeOffer(group.offerId);
    const pool = anonymous.filter(
      (row) =>
        group.bands.includes(row.band) &&
        !busy.has(row.id) &&
        !owns(row.id, productId) &&
        vipEntry.has(row.id) === (group.entry === 'vip-entrada') &&
        row.joinedDaysAgo - delayOf(0) >= Math.max(group.from, lowestDay(row.band)),
    );
    if (pool.length < group.count) {
      throw new Error(`${pool.length} members for ${group.count} older ${group.offerId}`);
    }
    for (let i = 0; i < group.count; i += 1) {
      const member = at(pool, Math.floor(((i + 0.5) * pool.length) / group.count));
      const day = Math.max(group.from, lowestDay(member.band), member.joinedDaysAgo - delayOf(k));
      add(member.id, group.offerId, Math.min(day, member.joinedDaysAgo));
      k += 1;
    }
  }
  return orders;
}

/** Oldest first; on one day the entries first, then by member. */
function chronological(a: RawOrder, b: RawOrder): number {
  const entry = (order: RawOrder) => (financeOffer(order.offerId).kind === 'entry' ? 0 : 1);
  return b.daysAgo - a.daysAgo || entry(a) - entry(b) || a.memberId.localeCompare(b.memberId);
}

/** The whole ledger, built from scratch (the exports below are one build of it). */
export function buildOwnerFinanceLedger(): {
  members: FinanceMember[];
  orders: FinanceOrder[];
} {
  const members = buildMembers();
  const orders = buildOrders(members)
    .sort(chronological)
    .map((order, i) => {
      const offer = financeOffer(order.offerId);
      return {
        id: `of-${String(i + 1).padStart(4, '0')}`,
        memberId: order.memberId,
        offerId: order.offerId,
        productId: offer.productId,
        cents: offer.priceCents,
        daysAgo: order.daysAgo,
        status: order.status,
      };
    });
  return { members, orders };
}

const LEDGER = buildOwnerFinanceLedger();

/** The 1.240 members of the base. */
export const ownerFinanceMembers: readonly FinanceMember[] = LEDGER.members;

/** Every store order of the base, oldest first: the one list every money total comes from. */
export const ownerFinanceOrders: readonly FinanceOrder[] = LEDGER.orders;

const KINDS = classifyOrders(ownerFinanceOrders);
const MEMBER_BY_ID = new Map(ownerFinanceMembers.map((member) => [member.id, member]));

function memberOf(id: string): FinanceMember {
  const member = MEMBER_BY_ID.get(id);
  if (!member) throw new Error(`no member ${id}`);
  return member;
}

/** A paid order's revenue kind. */
export function financeRevenueKind(order: FinanceOrder): RevenueKind {
  const kind = KINDS.get(order.id);
  if (!kind) throw new Error(`order ${order.id} is not paid`);
  return kind;
}

/* ---------------------------------------------------------------------------- the totals */

export interface FinanceAmount {
  orders: number;
  cents: number;
}

export interface FinanceTotals extends FinanceAmount {
  /** Distinct members with a paid order. */
  buyers: number;
}

export interface FinanceWindow {
  total: FinanceTotals;
  primary: FinanceAmount;
  secondary: FinanceAmount;
  /** Revoked orders (D-05): never in any other figure. */
  revoked: FinanceAmount;
  byOffer: Record<FinanceOfferId, FinanceAmount>;
  byProduct: Record<string, FinanceTotals>;
  /** By the buyer's band of today (PD-4). */
  byBand: Record<EngagementBand, FinanceTotals>;
}

function totalsOf(orders: readonly FinanceOrder[]): FinanceTotals {
  return {
    orders: orders.length,
    cents: orders.reduce((sum, order) => sum + order.cents, 0),
    buyers: new Set(orders.map((order) => order.memberId)).size,
  };
}

function amountOf(orders: readonly FinanceOrder[]): FinanceAmount {
  const { orders: count, cents } = totalsOf(orders);
  return { orders: count, cents };
}

/** The orders paid (or revoked) from `fromDaysAgo` to `toDaysAgo`, both included. */
export function ownerFinanceWindow(fromDaysAgo: number, toDaysAgo: number): FinanceWindow {
  const inside = ownerFinanceOrders.filter(
    (order) => order.daysAgo >= fromDaysAgo && order.daysAgo <= toDaysAgo,
  );
  const paid = inside.filter((order) => order.status === 'paid');
  const byOffer = Object.fromEntries(
    FINANCE_OFFERS.map((offer) => [
      offer.id,
      amountOf(paid.filter((order) => order.offerId === offer.id)),
    ]),
  ) as Record<FinanceOfferId, FinanceAmount>;
  const byBand = Object.fromEntries(
    ENGAGEMENT_BAND_ORDER.map((band) => [
      band,
      totalsOf(paid.filter((order) => memberOf(order.memberId).band === band)),
    ]),
  ) as Record<EngagementBand, FinanceTotals>;
  return {
    total: totalsOf(paid),
    primary: amountOf(paid.filter((order) => financeRevenueKind(order) === 'primary')),
    secondary: amountOf(paid.filter((order) => financeRevenueKind(order) === 'secondary')),
    revoked: amountOf(inside.filter((order) => order.status === 'revoked')),
    byOffer,
    byProduct: Object.fromEntries(
      PRODUCT_IDS.map((id) => [id, totalsOf(paid.filter((order) => order.productId === id))]),
    ),
    byBand,
  };
}

/** A year after the purchase: when an entry's (or the VIP's) access ends (D-03, an example). */
export const FINANCE_ACCESS_DAYS = DAYS_A_YEAR;

/** A product with no paid order for longer than this is stalled ("Parado", PD-9). */
export const FINANCE_STALLED_DAYS = 60;

export interface FinanceProductSummary {
  id: string;
  name: string;
  /** The store price: the add-on offer's (an entry bundles the app's access). */
  priceCents: number;
  /** The last 30 days: entries, add-ons, all orders and their value. */
  month: { entry: number; addon: number } & FinanceTotals;
  /** The 30 days before. */
  before: FinanceTotals;
  /** Days since the last paid order; null when it never sold. */
  lastSaleDaysAgo: number | null;
}

/** One product's card numbers (D-08); an unknown id throws. */
export function ownerFinanceProduct(productId: string): FinanceProductSummary {
  const offers = financeProductOffers(productId);
  const store = tenantOwnerPanel.store.products.find((row) => row.id === productId);
  const addon = offers.find((offer) => offer.kind === 'addon');
  if (!store || !addon) throw new Error(`no store product ${productId}`);
  const month = ownerFinanceWindow(0, 29);
  const count = (kind: FinanceOfferKind) =>
    offers
      .filter((offer) => offer.kind === kind)
      .reduce((sum, offer) => sum + month.byOffer[offer.id].orders, 0);
  const sold = ownerFinanceOrders.filter(
    (order) => order.status === 'paid' && order.productId === productId,
  );
  const empty = { orders: 0, cents: 0, buyers: 0 };
  return {
    id: productId,
    name: store.product,
    priceCents: addon.priceCents,
    month: {
      entry: count('entry'),
      addon: count('addon'),
      ...(month.byProduct[productId] ?? empty),
    },
    before: ownerFinanceWindow(30, 59).byProduct[productId] ?? empty,
    lastSaleDaysAgo: sold.length === 0 ? null : Math.min(...sold.map((order) => order.daysAgo)),
  };
}

/* ---------------------------------------------------------------------------- the people */

/** The lists of named buyers (D-11: level 4 only, read by one web file). */
export type FinancePeopleList = { kind: 'offer'; offerId: FinanceOfferId };

export interface FinancePerson extends OwnerBandMember {
  band: EngagementBand;
  /** When they bought. */
  when: RelativeMoment;
  cents: number;
  offerId: FinanceOfferId;
}

export interface FinancePeople {
  /** The roster members in the list, most recent first. */
  people: readonly FinancePerson[];
  /** The list's own number (the roster is a sample of it). */
  total: number;
}

const MONTH_DAYS = 30;

/** Most recent first: fewer days ago, then a later clock reading, then the id. */
function byRecency(a: FinancePerson, b: FinancePerson): number {
  return (
    a.when.daysAgo - b.when.daysAgo ||
    (b.when.time ?? '').localeCompare(a.when.time ?? '') ||
    a.id.localeCompare(b.id)
  );
}

/**
 * The buyers behind one Financeiro number: who, of the roster, and how many in all. An offer: its
 * paid orders of the last 30 days. An unknown offer throws.
 */
export function ownerFinancePeople(list: FinancePeopleList): FinancePeople {
  financeOffer(list.offerId);
  const orders = ownerFinanceOrders.filter(
    (order) =>
      order.status === 'paid' && order.offerId === list.offerId && order.daysAgo < MONTH_DAYS,
  );
  const people = ownerBandRoster
    .flatMap((row): FinancePerson[] => {
      const order = orders.find((entry) => entry.memberId === row.id);
      if (!order) return [];
      const { id, name, memberSince, lastActive, topCommunityId, dailyMinutes } = row;
      return [
        {
          id,
          name,
          memberSince,
          lastActive,
          topCommunityId,
          dailyMinutes,
          band: row.band,
          when:
            order.daysAgo === lastActive.daysAgo ? { ...lastActive } : { daysAgo: order.daysAgo },
          cents: order.cents,
          offerId: order.offerId,
        },
      ];
    })
    .sort(byRecency);
  return { people, total: orders.length };
}

/** Whether the member is in the list (the URL parser's membership test; it reads no names). */
export function ownerFinanceIncludes(list: FinancePeopleList, memberId: string): boolean {
  return ownerFinancePeople(list).people.some((person) => person.id === memberId);
}
