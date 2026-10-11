import type { RelativeMoment } from './platform-panels';
import type { Delta } from './shared';

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
  };
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
  },
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
    newMembers: { count: number; delta: Delta };
    interactionsPerPost: { count: number; delta: Delta };
    orders: { count: number; delta: Delta; manualGrants: number };
  };
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
      count: 412,
      delta: { amount: 7, kind: 'percent', direction: 'up', good: true, basis: 'none' },
    },
    newMembers: {
      count: 28,
      delta: { amount: 5, kind: 'count', direction: 'up', good: true, basis: 'none' },
    },
    interactionsPerPost: {
      count: 64,
      delta: { amount: 11, kind: 'count', direction: 'up', good: true, basis: 'none' },
    },
    orders: {
      count: 14,
      delta: { amount: 2, kind: 'count', direction: 'down', good: false, basis: 'none' },
      manualGrants: 3,
    },
  },
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
    queue: {
      id: string;
      name: string;
      preview: string;
      waitingHours: number;
      severity: Severity;
    }[];
  };
  moderation: {
    newComments24h: { count: number; delta: Delta };
    removed7d: number;
    blocks7d: number;
    recentComments: { id: string; name: string; text: string }[];
  };
  content: {
    posts7d: { count: number; delta: Delta };
    activeStories: { count: number; expiringSoon: number; withinHours: number };
    recentPosts: {
      id: string;
      when: RelativeMoment;
      type: PostType;
      likes: number;
      comments: number;
    }[];
  };
  store: {
    orders7d: { count: number; delta: Delta };
    productsWithoutOrder30d: { count: number; names: string[] };
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
    queue: [
      {
        id: 'q1',
        name: 'Ana Souza',
        preview: 'Não consigo entrar na comunidade VIP…',
        waitingHours: 26,
        severity: 'danger',
      },
      {
        id: 'q2',
        name: 'Rui Matos',
        preview: 'Oi, o evento de hoje vai ter transmissão?',
        waitingHours: 3,
        severity: 'warning',
      },
    ],
  },
  moderation: {
    newComments24h: {
      count: 48,
      delta: { amount: 12, kind: 'count', direction: 'up', good: false, basis: 'none' },
    },
    removed7d: 2,
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
    recentPosts: [
      { id: 'r1', when: { daysAgo: 1, time: '18h' }, type: 'video', likes: 96, comments: 31 },
      { id: 'r2', when: { daysAgo: 1, time: '09h' }, type: 'text', likes: 40, comments: 20 },
      { id: 'r3', when: { daysAgo: 0, time: '08h' }, type: 'gallery', likes: 12, comments: 3 },
    ],
  },
  store: {
    orders7d: {
      count: 14,
      delta: { amount: 2, kind: 'count', direction: 'down', good: false, basis: 'none' },
    },
    productsWithoutOrder30d: { count: 1, names: ['Workshop gravado'] },
    recentPurchases: [
      { id: 'b1', product: 'Comunidade VIP', amountCents: 19700, source: 'purchase' },
      { id: 'b2', product: 'Mentoria em grupo', amountCents: 49000, source: 'purchase' },
      { id: 'b3', product: 'Comunidade VIP', amountCents: null, source: 'manual_grant' },
    ],
  },
};

/* ---------------------------------------------------------------- 7. Membro */

export interface MemberPanel {
  profile: { name: string; memberSince: string };
  /** Up to 3 cards; an absent entry is simply not rendered. */
  forYou: {
    nextEvent?: { title: string; startsAtHour: number; place: string; startsInMinutes: number };
    supportReply?: { preview: string; unread: boolean };
    unlockedCommunity?: { name: string; posts: number };
  };
}

export const memberPanel: MemberPanel = {
  profile: { name: 'Ana Souza', memberSince: '2026-03-01' },
  forYou: {
    nextEvent: {
      title: 'Encontro mensal',
      startsAtHour: 19,
      place: 'Espaço Aurora, sala 2',
      startsInMinutes: 40,
    },
    supportReply: { preview: 'Oi, Ana! Seu acesso à VIP já foi liberado.', unread: true },
    unlockedCommunity: { name: 'Comunidade VIP', posts: 42 },
  },
};
