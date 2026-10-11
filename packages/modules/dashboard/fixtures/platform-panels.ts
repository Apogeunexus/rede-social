import type { Delta } from './shared';

/**
 * Level 1, "Dono da plataforma" (`platform_owner`): fictional numbers in the shape the platform
 * metrics endpoint will answer. Data only — see `./shared.ts`.
 */
export interface PlatformOwnerPanel {
  kpis: {
    activeClients: { count: number; delta: Delta; series: number[] };
    newClients: { count: number; delta: Delta };
    members: { count: number; delta: Delta; interactedPercent: number };
    storage: { usedGb: number; planGb: number; delta: Delta; videoMinutes: number };
    /** Not measured yet: the card says why instead of inventing a number. */
    monthlyRevenue: { measured: false; reason: 'needs_billing_per_client' };
  };
}

export const platformOwnerPanel: PlatformOwnerPanel = {
  kpis: {
    activeClients: {
      count: 12,
      delta: { amount: 2, kind: 'count', direction: 'up', good: true, basis: 'previous_month' },
      series: [6, 7, 7, 8, 8, 9, 9, 10, 10, 10, 11, 12],
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
  },
};
