import { previewTenant } from './preview-tenant';
import type { Delta, EngagementBands, KpiHint, NotMeasured } from './shared';

/**
 * The three platform levels: fictional numbers in the shape the platform metrics endpoints will
 * answer. Data only (see `./shared.ts`). The reference's demo tenant is the preview tenant, so the
 * Igor Alves client is the same everywhere.
 */

export type ClientPlan = 'pilot' | 'pro';
export type ClientStatus = 'active' | 'at_risk';
/** Days ago + the São Paulo clock time ("hoje 09:12", "ontem 18h", "há 14 dias"). */
export interface RelativeMoment {
  daysAgo: number;
  time?: string;
}

/* ---------------------------------------------------------------- 1. Dono da plataforma */

export type PlatformOwnerAttention =
  | { id: string; kind: 'storage_near_limit'; usedPercent: number; failsAbovePercent: number }
  | {
      id: string;
      kind: 'clients_at_risk';
      clientName: string;
      daysWithoutStaffPost: number;
      count: number;
    };

export type MembersByClientRow =
  | { id: string; kind: 'client'; name: string; members: number }
  | { id: string; kind: 'others'; clients: number; members: number };

export interface PlatformClientRow {
  id: string;
  name: string;
  plan: ClientPlan;
  status: ClientStatus;
  members: number;
  interactedPercent: number;
  /** Superfãs + engajados, % of the client's members (from its bands). */
  engagedPercent: number;
  /** "Em risco", % of the client's members (from its bands). */
  atRiskPercent: number;
  posts30d: number;
  mediaMb: number;
}

export interface PlatformOwnerPanel {
  kpis: {
    activeClients: { count: number; delta: Delta; series: number[] };
    newClients: { count: number; delta: Delta };
    members: { count: number; delta: Delta; interactedPercent: number };
    storage: { usedGb: number; planGb: number; delta: Delta; videoMinutes: number };
    /** Not measured yet: the card says why instead of inventing a number. */
    monthlyRevenue: NotMeasured;
    /** The "Membros engajados" share is computed from `engagement`. */
    engaged: { delta: Delta; actionsPerActiveMember: number };
    /** Store order value per client in the last 30 days (recorded value, no real payment). */
    storeSales: { delta: Delta; byClient: { clientId: string; cents: number }[] };
  };
  /** Every client's members in the six engagement bands, last 30 days. */
  engagement: EngagementBands;
  attention: PlatformOwnerAttention[];
  /** `YYYY-MM`, oldest first. */
  activeClientsByMonth: { month: string; count: number }[];
  membersByClient: MembersByClientRow[];
  /** Module key + % of the active clients with it on. */
  moduleAdoption: { module: string; percent: number }[];
  /** Module key + % of the active members who used it in 30 days, in `moduleAdoption` order. */
  moduleUsage: { module: string; percent: number }[];
  /** Worst first. */
  clients: PlatformClientRow[];
}

const ACTIVE_CLIENTS_SERIES = [6, 7, 7, 8, 8, 9, 9, 10, 10, 10, 11, 12];
const MONTHS = [
  '2025-11',
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
];

export const platformOwnerPanel: PlatformOwnerPanel = {
  kpis: {
    activeClients: {
      count: 12,
      delta: { amount: 2, kind: 'count', direction: 'up', good: true, basis: 'previous_month' },
      series: ACTIVE_CLIENTS_SERIES,
    },
    newClients: {
      count: 3,
      delta: { amount: 1, kind: 'count', direction: 'up', good: true, basis: 'previous_month' },
    },
    members: {
      count: 8430,
      delta: { amount: 6, kind: 'percent', direction: 'up', good: true, basis: 'previous_month' },
      interactedPercent: 41,
    },
    storage: {
      usedGb: 0.84,
      planGb: 1,
      delta: { amount: 9, kind: 'percent', direction: 'up', good: false, basis: 'previous_month' },
      videoMinutes: 312,
    },
    monthlyRevenue: { measured: false, reason: 'needs_billing_per_client' },
    engaged: {
      delta: { amount: 1, kind: 'points', direction: 'up', good: true, basis: 'previous_month' },
      actionsPerActiveMember: 8.1,
    },
    storeSales: {
      delta: { amount: 9, kind: 'percent', direction: 'up', good: true, basis: 'previous_month' },
      byClient: [
        { clientId: 'c-igor', cents: 894000 },
        { clientId: 'c-aurora', cents: 544000 },
      ],
    },
  },
  engagement: {
    counts: {
      new: 480,
      superfan: 380,
      engaged: 1440,
      occasional: 1340,
      at_risk: 1150,
      inactive: 3640,
    },
    newActivated: 296,
  },
  attention: [
    { id: 'storage', kind: 'storage_near_limit', usedPercent: 84, failsAbovePercent: 95 },
    {
      id: 'at-risk',
      kind: 'clients_at_risk',
      clientName: 'Clube Corrida Sul',
      daysWithoutStaffPost: 14,
      count: 1,
    },
  ],
  activeClientsByMonth: MONTHS.map((month, i) => ({
    month,
    count: ACTIVE_CLIENTS_SERIES[i] ?? 0,
  })),
  membersByClient: [
    { id: 'c-aurora', kind: 'client', name: 'Instituto Aurora', members: 3110 },
    { id: 'c-lab', kind: 'client', name: 'Rede Lab', members: 1760 },
    { id: 'c-igor', kind: 'client', name: previewTenant.displayName, members: 1240 },
    { id: 'c-horizonte', kind: 'client', name: 'Escola Horizonte', members: 1210 },
    { id: 'others', kind: 'others', clients: 8, members: 1110 },
  ],
  moduleAdoption: [
    { module: 'feed', percent: 100 },
    { module: 'communities', percent: 92 },
    { module: 'stories', percent: 83 },
    { module: 'events', percent: 67 },
    { module: 'chat', percent: 58 },
    { module: 'store', percent: 17 },
  ],
  moduleUsage: [
    { module: 'feed', percent: 96 },
    { module: 'communities', percent: 64 },
    { module: 'stories', percent: 38 },
    { module: 'events', percent: 31 },
    { module: 'chat', percent: 9 },
    { module: 'store', percent: 14 },
  ],
  clients: [
    {
      id: 'c-corrida',
      name: 'Clube Corrida Sul',
      plan: 'pilot',
      status: 'at_risk',
      members: 310,
      interactedPercent: 12,
      engagedPercent: 3,
      atRiskPercent: 31,
      posts30d: 0,
      mediaMb: 41,
    },
    {
      id: 'c-horizonte',
      name: 'Escola Horizonte',
      plan: 'pilot',
      status: 'active',
      members: 1210,
      interactedPercent: 27,
      engagedPercent: 12,
      atRiskPercent: 24,
      posts30d: 6,
      mediaMb: 88,
    },
    {
      id: 'c-lab',
      name: 'Rede Lab',
      plan: 'pilot',
      status: 'active',
      members: 1760,
      interactedPercent: 35,
      engagedPercent: 18,
      atRiskPercent: 19,
      posts30d: 14,
      mediaMb: 120,
    },
    {
      id: 'c-aurora',
      name: 'Instituto Aurora',
      plan: 'pro',
      status: 'active',
      members: 3110,
      interactedPercent: 44,
      engagedPercent: 25,
      atRiskPercent: 15,
      posts30d: 22,
      mediaMb: 190,
    },
    {
      id: 'c-igor',
      name: previewTenant.displayName,
      plan: 'pro',
      status: 'active',
      members: 1240,
      interactedPercent: 38,
      engagedPercent: 22,
      atRiskPercent: 14,
      posts30d: 61,
      mediaMb: 402,
    },
  ],
};

/* ---------------------------------------------------------------- 2. Admin da plataforma */

export type PlatformAdminPending =
  | { id: string; kind: 'domain_expired'; clientName: string; host: string }
  | { id: string; kind: 'domain_deadline'; clientName: string; hoursLeft: number }
  | { id: string; kind: 'invite_pending'; clientName: string; daysSinceSent: number }
  | { id: string; kind: 'media_failures'; clientName: string; failures: number }
  | {
      id: string;
      kind: 'engagement_drop';
      clientName: string;
      /** Engajados %, 30 days ago and today. */
      fromPercent: number;
      toPercent: number;
    };

export type ActivationStep =
  | 'client_created'
  | 'domain_verified'
  | 'invite_accepted'
  | 'first_post'
  | 'ten_members'
  | 'ten_active_members';

export interface PlatformFailureRow {
  id: string;
  clientName: string;
  media: number;
  push: number;
  /** Videos stuck in processing. */
  stalledVideos: number;
  lastPost: RelativeMoment;
  status: ClientStatus;
}

export interface PlatformAdminPanel {
  pending: PlatformAdminPending[];
  kpis: {
    unverifiedDomains: { count: number; hint: KpiHint };
    pendingInvites: { count: number; hint: KpiHint };
    clientsWithoutOwner: { count: number; hint: KpiHint };
    mediaFailures24h: { count: number; delta: Delta };
    pushFailures: { count: number; delta: Delta };
    /** % of the active members with push on. */
    pushReach: { percent: number };
  };
  /** In funnel order: how many clients reached each step. */
  activation: { step: ActivationStep; clients: number }[];
  failures24h: PlatformFailureRow[];
}

export const platformAdminPanel: PlatformAdminPanel = {
  pending: [
    {
      id: 'p-corrida',
      kind: 'domain_expired',
      clientName: 'Clube Corrida Sul',
      host: 'comunidade.corridasul.com.br',
    },
    { id: 'p-horizonte', kind: 'domain_deadline', clientName: 'Escola Horizonte', hoursLeft: 36 },
    { id: 'p-aurora', kind: 'invite_pending', clientName: 'Instituto Aurora', daysSinceSent: 4 },
    { id: 'p-lab', kind: 'media_failures', clientName: 'Rede Lab', failures: 7 },
    {
      id: 'p-horizonte-engagement',
      kind: 'engagement_drop',
      clientName: 'Escola Horizonte',
      fromPercent: 17,
      toPercent: 12,
    },
  ],
  kpis: {
    unverifiedDomains: { count: 3, hint: 'no_comparison_yet' },
    pendingInvites: { count: 2, hint: 'no_comparison_yet' },
    clientsWithoutOwner: { count: 0, hint: 'should_stay_zero' },
    mediaFailures24h: {
      count: 9,
      delta: { amount: 6, kind: 'count', direction: 'up', good: false, basis: 'previous_24h' },
    },
    pushFailures: {
      count: 14,
      delta: { amount: 3, kind: 'count', direction: 'down', good: true, basis: 'yesterday' },
    },
    pushReach: { percent: 52 },
  },
  activation: [
    { step: 'client_created', clients: 8 },
    { step: 'domain_verified', clients: 5 },
    { step: 'invite_accepted', clients: 4 },
    { step: 'first_post', clients: 4 },
    { step: 'ten_members', clients: 3 },
    { step: 'ten_active_members', clients: 2 },
  ],
  failures24h: [
    {
      id: 'f-lab',
      clientName: 'Rede Lab',
      media: 7,
      push: 2,
      stalledVideos: 2,
      lastPost: { daysAgo: 0, time: '09:12' },
      status: 'active',
    },
    {
      id: 'f-igor',
      clientName: previewTenant.displayName,
      media: 2,
      push: 9,
      stalledVideos: 0,
      lastPost: { daysAgo: 0, time: '11:40' },
      status: 'active',
    },
    {
      id: 'f-corrida',
      clientName: 'Clube Corrida Sul',
      media: 0,
      push: 3,
      stalledVideos: 0,
      lastPost: { daysAgo: 14 },
      status: 'at_risk',
    },
  ],
};

/* ---------------------------------------------------------------- 3. Suporte da plataforma */

export type SupportErrorKind = 'dns' | 'push' | 'media';
export type SupportErrorDetail = 'cname_not_found' | 'devices_refused' | 'unsupported_format';

export interface PlatformSupportPanel {
  client: { name: string; plan: ClientPlan; status: ClientStatus };
  /** The registered access: when, and the reason typed by the support person. */
  access: { atIso: string; reason: string };
  kpis: {
    primaryDomain: { status: 'failed' | 'verified'; reason: 'dns_not_found' | null };
    members: { count: number; blocked: number; delta: Delta };
    errors24h: { count: number; delta: Delta };
    lastActivity: { daysAgo: number; kind: 'staff_post' };
    /** Invites sent and not accepted yet. */
    pendingInvites: { count: number };
    /** Members who joined in the last 7 days (`joined`) and, of them, never did a counted action. */
    newNeverActed7d: { count: number; joined: number };
    /** Counted actions per hour in the last 24 h vs the 30-day average. */
    activity24h: { perHour: number; averagePerHour: number };
  };
  /** The client's members in the six engagement bands (shown aggregated, floored, D-02). */
  engagement: EngagementBands;
  /** % of the active members with push on. */
  pushReachPercent: number;
  configuration: {
    enabledModules: string[];
    disabledModules: string[];
    adminEmails: string[];
  };
  errors24h: {
    id: string;
    kind: SupportErrorKind;
    severity: 'danger' | 'warning';
    atIso: string;
    detail: SupportErrorDetail;
    count?: number;
  }[];
}

export const platformSupportPanel: PlatformSupportPanel = {
  client: { name: 'Clube Corrida Sul', plan: 'pilot', status: 'active' },
  access: { atIso: '2026-10-11T17:02:00Z', reason: 'Chamado #128: membros não conseguem entrar' },
  kpis: {
    primaryDomain: { status: 'failed', reason: 'dns_not_found' },
    members: {
      count: 310,
      blocked: 2,
      delta: { amount: 14, kind: 'count', direction: 'up', good: true, basis: 'last_7_days' },
    },
    errors24h: {
      count: 9,
      delta: { amount: 6, kind: 'count', direction: 'up', good: false, basis: 'yesterday' },
    },
    lastActivity: { daysAgo: 14, kind: 'staff_post' },
    pendingInvites: { count: 37 },
    newNeverActed7d: { count: 13, joined: 14 },
    activity24h: { perHour: 2, averagePerHour: 6 },
  },
  engagement: {
    counts: { new: 22, superfan: 2, engaged: 8, occasional: 27, at_risk: 96, inactive: 155 },
    newActivated: 1,
  },
  pushReachPercent: 21,
  configuration: {
    enabledModules: ['feed', 'communities', 'stories', 'events', 'chat', 'notifications'],
    disabledModules: ['store', 'reels'],
    adminEmails: ['ana@corridasul.com.br'],
  },
  errors24h: [
    {
      id: 'e-dns',
      kind: 'dns',
      severity: 'danger',
      atIso: '2026-10-11T16:50:00Z',
      detail: 'cname_not_found',
    },
    {
      id: 'e-push',
      kind: 'push',
      severity: 'warning',
      atIso: '2026-10-11T14:21:00Z',
      detail: 'devices_refused',
      count: 3,
    },
    {
      id: 'e-media',
      kind: 'media',
      severity: 'warning',
      atIso: '2026-10-11T11:04:00Z',
      detail: 'unsupported_format',
    },
  ],
};
