import type { RelativeMoment } from './platform-panels';
import type { Delta, EngagementBand, EngagementBands, NotMeasured } from './shared';

/**
 * The four tenant-side levels, all for the preview tenant (`previewTenant.displayName`): fictional
 * numbers in the shape the tenant metrics endpoints will answer. Data only (see `./shared.ts`);
 * money in integer cents.
 */

export type PostType = 'video' | 'gallery' | 'text' | 'link';
export type Severity = 'danger' | 'warning';

/* ---------------------------------------------------------------- 4. Dono do cliente */

export interface TenantOwnerPanel {
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
  /** Likes + comments per post by format, posts of the last 30 days. */
  byFormat: { type: PostType; posts: number; perPost: number }[];
  /** Orders of the last 30 days by the band the buyer was in the day before the order. */
  ordersByBand: Record<EngagementBand, number>;
  /** Members who interacted per week, oldest first, and the 12 weeks before them. */
  weeklyInteracting: { current: number[]; previous: number[] };
  /** Interactions by channel in the period. */
  channels: {
    channel: 'likes' | 'comments' | 'attendance' | 'orders' | 'support';
    count: number;
  }[];
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
  byFormat: [
    { type: 'video', posts: 18, perPost: 96 },
    { type: 'gallery', posts: 15, perPost: 71 },
    { type: 'text', posts: 20, perPost: 48 },
    { type: 'link', posts: 8, perPost: 23 },
  ],
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

/* ---------------------------------------------------------------- 5. Admin do cliente */

export type TenantAdminAttention =
  | {
      id: string;
      kind: 'support_waiting';
      severity: Severity;
      conversations: number;
      oldestHours: number;
      oldestName: string;
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
  | { id: string; kind: 'story_expiring'; severity: Severity; stories: number; hoursLeft: number };

export interface TenantAdminPanel {
  attention: TenantAdminAttention[];
  kpis: {
    awaitingReply: { count: number; oldestHours: number };
    firstResponseMedian: { minutes: number; delta: Delta };
    interacting: { count: number; delta: Delta };
    /** `activated`: the novos with at least one counted action. */
    newMembers: { count: number; activated: number; delta: Delta };
    /** Members who went from an active band to "em risco" this week. */
    enteredAtRisk: { count: number; withPush: number };
    orders: { count: number; delta: Delta; manualGrants: number };
  };
  /** Per-post figures the app does not collect yet (no post views, saves or shares tables). */
  postMetrics: {
    reach: NotMeasured;
    engagementPerView: NotMeasured;
    saves: NotMeasured;
    shares: NotMeasured;
  };
  /** Videos and reels of the period, newest first; playback is not recorded yet. */
  videos: {
    rows: { id: string; date: string; kind: 'video' | 'reel'; durationSeconds: number }[];
    watched: NotMeasured;
    completion: NotMeasured;
  };
  /** Stories of the period: unique viewers per story on average (aggregate, never who viewed). */
  stories: { count: number; averageUniqueViewers: number; memberBase: number };
  /** Last 14 days, best first. */
  topPosts: {
    id: string;
    date: string;
    type: PostType;
    community: string;
    likes: number;
    comments: number;
  }[];
  events: {
    attendancePercent: number;
    rows: { id: string; name: string; percent: number }[];
    walkIns: { event: string; count: number };
  };
  communities: { id: string; name: string; exclusive: boolean; interactions: number }[];
  store: { id: string; product: string; orders: number }[];
  moderation: { removedComments: number; blocks: number; unblocks: number; roleChanges: number };
}

export const tenantAdminPanel: TenantAdminPanel = {
  attention: [
    {
      id: 'a-support',
      kind: 'support_waiting',
      severity: 'danger',
      conversations: 2,
      oldestHours: 26,
      oldestName: 'Ana',
    },
    {
      id: 'a-event',
      kind: 'event_today',
      severity: 'warning',
      event: 'Encontro mensal',
      startsAtHour: 19,
      confirmed: 92,
      capacity: 100,
    },
    { id: 'a-story', kind: 'story_expiring', severity: 'warning', stories: 1, hoursLeft: 5 },
  ],
  kpis: {
    awaitingReply: { count: 2, oldestHours: 26 },
    firstResponseMedian: {
      minutes: 100,
      delta: { amount: 20, kind: 'minutes', direction: 'down', good: true, basis: 'none' },
    },
    interacting: {
      count: 380,
      delta: { amount: 7, kind: 'percent', direction: 'up', good: true, basis: 'none' },
    },
    newMembers: {
      count: 28,
      activated: 15,
      delta: { amount: 5, kind: 'count', direction: 'up', good: true, basis: 'none' },
    },
    enteredAtRisk: { count: 23, withPush: 9 },
    orders: {
      count: 14,
      delta: { amount: 2, kind: 'count', direction: 'down', good: false, basis: 'none' },
      manualGrants: 3,
    },
  },
  postMetrics: {
    reach: { measured: false, reason: 'needs_post_views' },
    engagementPerView: { measured: false, reason: 'needs_post_views' },
    saves: { measured: false, reason: 'needs_saves' },
    shares: { measured: false, reason: 'needs_shares' },
  },
  videos: {
    rows: [
      { id: 'reel-1', date: '2026-10-09', kind: 'reel', durationSeconds: 41 },
      { id: 'p1', date: '2026-10-08', kind: 'video', durationSeconds: 252 },
      { id: 'reel-2', date: '2026-10-05', kind: 'reel', durationSeconds: 38 },
    ],
    watched: { measured: false, reason: 'needs_video_playback' },
    completion: { measured: false, reason: 'needs_video_playback' },
  },
  stories: { count: 4, averageUniqueViewers: 310, memberBase: 1240 },
  topPosts: [
    { id: 'p1', date: '2026-10-08', type: 'video', community: 'Geral', likes: 96, comments: 31 },
    { id: 'p2', date: '2026-10-06', type: 'gallery', community: 'VIP', likes: 70, comments: 12 },
    { id: 'p3', date: '2026-10-04', type: 'text', community: 'Geral', likes: 40, comments: 20 },
    { id: 'p4', date: '2026-10-02', type: 'link', community: 'Iniciantes', likes: 22, comments: 4 },
  ],
  events: {
    attendancePercent: 64,
    rows: [
      { id: 'e1', name: 'Encontro set.', percent: 82 },
      { id: 'e2', name: 'Live de dúvidas', percent: 58 },
      { id: 'e3', name: 'Workshop', percent: 64 },
      { id: 'e4', name: 'Aula aberta', percent: 49 },
    ],
    walkIns: { event: 'Encontro', count: 6 },
  },
  communities: [
    { id: 'c-vip', name: 'VIP', exclusive: true, interactions: 1240 },
    { id: 'c-geral', name: 'Geral', exclusive: false, interactions: 980 },
    { id: 'c-iniciantes', name: 'Iniciantes', exclusive: false, interactions: 410 },
    { id: 'c-eventos', name: 'Eventos', exclusive: false, interactions: 220 },
  ],
  store: [
    { id: 's1', product: 'Mentoria em grupo', orders: 6 },
    { id: 's2', product: 'Comunidade VIP', orders: 5 },
    { id: 's3', product: 'E-book', orders: 3 },
    { id: 's4', product: 'Workshop gravado', orders: 0 },
  ],
  moderation: { removedComments: 2, blocks: 1, unblocks: 0, roleChanges: 1 },
};

/* ---------------------------------------------------------------- 6. Equipe do cliente */

export type StaffBlockKey = 'support' | 'moderation' | 'content' | 'store';

export interface TenantStaffPanel {
  /** The count each function's tab badge shows (0 shows no badge). */
  counts: Record<StaffBlockKey, number>;
  support: {
    waiting: number;
    oldestWaitHours: number;
    answeredByMe: { count: number; delta: Delta };
    /** My own first-response median over the last 7 days. */
    myFirstResponseMedianMinutes: number;
    queue: {
      id: string;
      name: string;
      preview: string;
      waitingHours: number;
      severity: Severity;
      /** Days since the member joined (a member under 30 days gets the "Novo" tag). */
      joinedDaysAgo: number;
    }[];
  };
  moderation: {
    newComments24h: { count: number; delta: Delta };
    removed7d: number;
    /** Comments of the last 7 days: the base of the removal rate. */
    comments7d: number;
    /** First comments ever by a new member, last 24 h. */
    firstCommentsFromNew24h: number;
    blocks7d: number;
    recentComments: { id: string; name: string; text: string }[];
  };
  content: {
    posts7d: { count: number; delta: Delta };
    activeStories: { count: number; expiringSoon: number; withinHours: number };
    /** Median likes + comments per post at `comparableAfterHours` of age. */
    medianInteractions: number;
    comparableAfterHours: number;
    recentPosts: {
      id: string;
      when: RelativeMoment;
      /** Hours since publication (a post younger than `comparableAfterHours` is not compared yet). */
      ageHours: number;
      type: PostType;
      likes: number;
      comments: number;
    }[];
  };
  store: {
    orders7d: { count: number; delta: Delta };
    productsWithoutOrder30d: { count: number; names: string[] };
    /** Time-limited accesses that end in the next 7 days, and their products. */
    expiringAccess7d: { count: number; products: string[] };
    /** Orders per product page view: no product page views are recorded yet. */
    conversion: NotMeasured;
    recentPurchases: {
      id: string;
      product: string;
      /** `null` when access was granted by hand (no amount). */
      amountCents: number | null;
      source: 'purchase' | 'manual_grant';
    }[];
  };
}

export const tenantStaffPanel: TenantStaffPanel = {
  counts: { support: 2, moderation: 0, content: 1, store: 0 },
  support: {
    waiting: 2,
    oldestWaitHours: 26,
    answeredByMe: {
      count: 5,
      delta: { amount: 1, kind: 'count', direction: 'up', good: true, basis: 'yesterday' },
    },
    myFirstResponseMedianMinutes: 64,
    queue: [
      {
        id: 'q1',
        name: 'Ana Souza',
        preview: 'Não consigo entrar na comunidade VIP…',
        waitingHours: 26,
        severity: 'danger',
        joinedDaysAgo: 224,
      },
      {
        id: 'q2',
        name: 'Rui Matos',
        preview: 'Oi, o evento de hoje vai ter transmissão?',
        waitingHours: 3,
        severity: 'warning',
        joinedDaysAgo: 9,
      },
    ],
  },
  moderation: {
    newComments24h: {
      count: 48,
      delta: { amount: 12, kind: 'count', direction: 'up', good: false, basis: 'none' },
    },
    removed7d: 2,
    comments7d: 214,
    firstCommentsFromNew24h: 4,
    blocks7d: 1,
    recentComments: [
      { id: 'm1', name: 'João P.', text: 'Alguém tem o link da aula de ontem?' },
      { id: 'm2', name: 'Lia C.', text: 'Esse conteúdo mudou minha semana, obrigada!' },
      { id: 'm3', name: 'M. Vieira', text: 'Compre seguidores baratos em…' },
    ],
  },
  content: {
    posts7d: {
      count: 9,
      delta: { amount: 2, kind: 'count', direction: 'up', good: true, basis: 'none' },
    },
    activeStories: { count: 4, expiringSoon: 1, withinHours: 6 },
    medianInteractions: 52,
    comparableAfterHours: 24,
    // Ages as of today 20h: "ontem 18h" is 26 h old, "ontem 09h" 35 h, "hoje 08h" 12 h.
    recentPosts: [
      {
        id: 'r1',
        when: { daysAgo: 1, time: '18h' },
        ageHours: 26,
        type: 'video',
        likes: 96,
        comments: 31,
      },
      {
        id: 'r2',
        when: { daysAgo: 1, time: '09h' },
        ageHours: 35,
        type: 'text',
        likes: 40,
        comments: 20,
      },
      {
        id: 'r3',
        when: { daysAgo: 0, time: '08h' },
        ageHours: 12,
        type: 'gallery',
        likes: 12,
        comments: 3,
      },
    ],
  },
  store: {
    orders7d: {
      count: 14,
      delta: { amount: 2, kind: 'count', direction: 'down', good: false, basis: 'none' },
    },
    productsWithoutOrder30d: { count: 1, names: ['Workshop gravado'] },
    expiringAccess7d: { count: 6, products: ['Comunidade VIP'] },
    conversion: { measured: false, reason: 'needs_product_page_views' },
    recentPurchases: [
      { id: 'b1', product: 'Comunidade VIP', amountCents: 19700, source: 'purchase' },
      { id: 'b2', product: 'Mentoria em grupo', amountCents: 49000, source: 'purchase' },
      { id: 'b3', product: 'Comunidade VIP', amountCents: null, source: 'manual_grant' },
    ],
  },
};

/* ---------------------------------------------------------------- 7. Membro */

/**
 * The member's own data only. There is deliberately no engagement band here: a member never sees
 * the band they are counted in.
 */
export interface MemberPanel {
  profile: {
    name: string;
    memberSince: string;
    /** Events with a check-in vs events the member confirmed, last 30 days. */
    attendance: { attended: number; events: number };
    /** Consecutive weeks with at least one counted action. */
    weeklyStreak: number;
  };
  /** Candidate cards; an absent entry is not rendered, and at most 3 show, by priority. */
  forYou: {
    nextEvent?: { title: string; startsAtHour: number; place: string; startsInMinutes: number };
    supportReply?: { preview: string; unread: boolean };
    accessExpiring?: { product: string; daysLeft: number };
    /** What changed in a community since the member's last visit: last visits are not recorded yet. */
    newSinceLastVisit?: { community: string; posts: NotMeasured };
    unlockedCommunity?: { name: string; posts: number };
  };
}

export const memberPanel: MemberPanel = {
  profile: {
    name: 'Ana Souza',
    memberSince: '2026-03-01',
    attendance: { attended: 3, events: 4 },
    weeklyStreak: 6,
  },
  forYou: {
    nextEvent: {
      title: 'Encontro mensal',
      startsAtHour: 19,
      place: 'Espaço Aurora, sala 2',
      startsInMinutes: 40,
    },
    supportReply: { preview: 'Oi, Ana! Seu acesso à VIP já foi liberado.', unread: true },
    accessExpiring: { product: 'Comunidade VIP', daysLeft: 5 },
    newSinceLastVisit: {
      community: 'Comunidade VIP',
      posts: { measured: false, reason: 'needs_last_visit' },
    },
    unlockedCommunity: { name: 'Comunidade VIP', posts: 42 },
  },
};
