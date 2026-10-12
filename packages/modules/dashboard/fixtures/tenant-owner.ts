import type { Delta, EngagementBand, EngagementBands } from './shared';
import type { PostType, Severity } from './tenant-panels';

/**
 * Level 4, "Dono do cliente" (quick 261012-o00): the client owner's six-area panel for the preview
 * tenant. RAW DATA only (MOD-02): counts, ids, ISO dates, money in integer cents, never a sentence.
 * Percents and per-post figures are computed from the raw counts here (`ui/metrics.ts`), never typed
 * next to them. Where a number describes the same thing as level 5 (`tenantAdminPanel`) it is equal,
 * and `tests/tenant-owner.test.ts` proves every sum and every cross-level equality (D-05).
 */

/**
 * The owner's header-bell alerts. The support alert deliberately has no name field: the level-4 panel
 * never names a member (level 5's names the oldest conversation).
 */
export type TenantOwnerAttention =
  | {
      id: string;
      kind: 'support_waiting';
      severity: Severity;
      conversations: number;
      oldestHours: number;
    }
  | {
      id: string;
      kind: 'event_today';
      severity: Severity;
      event: string;
      startsAtHour: number;
      confirmed: number;
      capacity: number;
    }
  | { id: string; kind: 'entered_at_risk'; severity: Severity; members: number; withPush: number };

export type EventFormat = 'in_person' | 'online';

/** One event of the last 30 days: `events.capacity` (null = no limit), RSVPs "vou" and check-ins. */
export interface OwnerPastEvent {
  id: string;
  name: string;
  format: EventFormat;
  date: string;
  capacity: number | null;
  /** RSVPs "vou". */
  confirmed: number;
  /** Check-ins of confirmed members. */
  checkIns: number;
  /** Check-ins of members with no RSVP. */
  walkIns: number;
}

export interface TenantOwnerPanel {
  attention: TenantOwnerAttention[];
  kpis: {
    members: { count: number; newMembers: number; delta: Delta };
    interacting: { percent: number; delta: Delta; series: number[] };
    newMemberRetention: {
      percent: number;
      delta: Delta;
      joinedMonth: string;
      returnedMonth: string;
    };
    eventAttendance: { percent: number; delta: Delta };
    orderValue: { cents: number; delta: Delta };
    /** The "Engajados" share is computed from `engagement`; only its change and the actions rate live here. */
    engaged: { delta: Delta; actionsPerActiveMember: number };
  };
  /** The members in the six engagement bands, last 30 days. */
  engagement: EngagementBands;
  /**
   * Band today vs 30 days ago, novos excluded: how many moved up or down, and the biggest flows
   * (`active` = any of superfã, engajado or ocasional).
   */
  movement: {
    up: number;
    down: number;
    flows: { from: EngagementBand | 'active'; to: EngagementBand; members: number }[];
  };
  /** Members in risk who have push on (reachable by a notification). */
  atRiskWithPush: number;
  /**
   * Memberships of the last 30 days: who joined and who left, and the members who joined per week
   * (the last 12 weeks, oldest first).
   */
  growth: { joined: number; left: number; weeklyJoined: number[] };
  /** Likes + comments per post by format, posts of the last 30 days. */
  byFormat: { type: PostType; posts: number; perPost: number }[];
  /**
   * Posts and their likes + comments of the last 30 days by community (`feed_posts.community_id`),
   * in rank order; the ids are level 5's.
   */
  byCommunity: {
    id: string;
    name: string;
    exclusive: boolean;
    posts: number;
    interactions: number;
  }[];
  /** Orders of the last 30 days by the band the buyer was in the day before the order. */
  ordersByBand: Record<EngagementBand, number>;
  /** Members who interacted per week, oldest first, and the 12 weeks before them. */
  weeklyInteracting: { current: number[]; previous: number[] };
  /** Interactions by channel in the period. */
  channels: {
    channel: 'likes' | 'comments' | 'attendance' | 'orders' | 'support';
    count: number;
  }[];
  events: {
    /** The events of the last 30 days, oldest first. */
    past: OwnerPastEvent[];
  };
  /** Support chat conversations (`chat_conversations` of kind support). */
  support: {
    /** Waiting for a first staff answer now, and how long the oldest has waited. */
    awaiting: { count: number; oldestHours: number };
  };
  /** Retention by joining month (`YYYY-MM`): % that interacted in each month after joining. */
  cohorts: { month: string; values: number[] }[];
  account: {
    plan: 'pilot' | 'pro';
    domain: string;
    domainStatus: 'verified' | 'pending';
    admins: number;
    staff: number;
    billing: 'coming_soon';
  };
}

export const tenantOwnerPanel: TenantOwnerPanel = {
  attention: [],
  kpis: {
    members: {
      count: 1240,
      newMembers: 96,
      delta: { amount: 8, kind: 'percent', direction: 'up', good: true, basis: 'previous_30_days' },
    },
    interacting: {
      percent: 38,
      delta: { amount: 3, kind: 'points', direction: 'down', good: false, basis: 'none' },
      series: [31, 33, 36, 35, 39, 41, 40, 42, 41, 39, 37, 38],
    },
    newMemberRetention: {
      percent: 41,
      delta: { amount: 4, kind: 'points', direction: 'up', good: true, basis: 'none' },
      joinedMonth: '2026-09',
      returnedMonth: '2026-10',
    },
    eventAttendance: {
      percent: 72,
      delta: { amount: 5, kind: 'points', direction: 'up', good: true, basis: 'none' },
    },
    orderValue: {
      cents: 894000,
      delta: { amount: 12, kind: 'percent', direction: 'up', good: true, basis: 'none' },
    },
    engaged: {
      delta: { amount: 2, kind: 'points', direction: 'down', good: false, basis: 'none' },
      actionsPerActiveMember: 9.3,
    },
  },
  engagement: {
    counts: { new: 96, superfan: 62, engaged: 205, occasional: 150, at_risk: 168, inactive: 559 },
    newActivated: 54,
  },
  movement: {
    up: 77,
    down: 171,
    flows: [
      { from: 'at_risk', to: 'inactive', members: 64 },
      { from: 'active', to: 'at_risk', members: 57 },
      { from: 'engaged', to: 'occasional', members: 41 },
      { from: 'occasional', to: 'engaged', members: 38 },
    ],
  },
  atRiskWithPush: 69,
  growth: { joined: 0, left: 0, weeklyJoined: [] },
  byFormat: [
    { type: 'video', posts: 18, perPost: 96 },
    { type: 'gallery', posts: 15, perPost: 71 },
    { type: 'text', posts: 20, perPost: 48 },
    { type: 'link', posts: 8, perPost: 23 },
  ],
  byCommunity: [],
  ordersByBand: { new: 9, superfan: 31, engaged: 38, occasional: 14, at_risk: 3, inactive: 1 },
  weeklyInteracting: {
    current: [310, 330, 360, 352, 391, 410, 402, 425, 418, 396, 372, 380],
    previous: [280, 290, 300, 310, 305, 330, 340, 335, 350, 345, 360, 355],
  },
  channels: [
    { channel: 'likes', count: 3100 },
    { channel: 'comments', count: 840 },
    { channel: 'attendance', count: 310 },
    { channel: 'orders', count: 96 },
    { channel: 'support', count: 74 },
  ],
  events: { past: [] },
  support: { awaiting: { count: 0, oldestHours: 0 } },
  cohorts: [
    { month: '2026-06', values: [100, 58, 46, 41, 38] },
    { month: '2026-07', values: [100, 55, 44, 40] },
    { month: '2026-08', values: [100, 61, 47] },
    { month: '2026-09', values: [100, 41] },
  ],
  account: {
    plan: 'pro',
    domain: 'comunidade.drigoralves.exemplo.com.br',
    domainStatus: 'verified',
    admins: 2,
    staff: 3,
    billing: 'coming_soon',
  },
};
