import { describe, expect, it } from 'vitest';
import type { EngagementBands } from '../fixtures';
import {
  bandTotal,
  ENGAGEMENT_BAND_ORDER,
  engagedPercent,
  interactedCount,
  interactedPercent,
  percentOf,
} from '../ui/metrics';

const IGOR: EngagementBands = {
  counts: { new: 96, superfan: 62, engaged: 205, occasional: 150, at_risk: 168, inactive: 559 },
  newActivated: 54,
};
const PLATFORM: EngagementBands = {
  counts: {
    new: 480,
    superfan: 380,
    engaged: 1440,
    occasional: 1340,
    at_risk: 1150,
    inactive: 3640,
  },
  newActivated: 296,
};
const CORRIDA: EngagementBands = {
  counts: { new: 22, superfan: 2, engaged: 8, occasional: 27, at_risk: 96, inactive: 155 },
  newActivated: 1,
};

describe('ENGAGEMENT_BAND_ORDER', () => {
  it('is the evaluation order of the exclusive bands', () => {
    expect(ENGAGEMENT_BAND_ORDER).toEqual([
      'new',
      'superfan',
      'engaged',
      'occasional',
      'at_risk',
      'inactive',
    ]);
  });
});

describe('bandTotal', () => {
  it('sums every band to the member base', () => {
    expect(bandTotal(IGOR)).toBe(1240);
    expect(bandTotal(PLATFORM)).toBe(8430);
    expect(bandTotal(CORRIDA)).toBe(310);
  });
});

describe('interactedCount / interactedPercent', () => {
  it('counts superfãs + engajados + ocasionais + novos ativados', () => {
    expect(interactedCount(IGOR)).toBe(62 + 205 + 150 + 54);
    expect(interactedCount(IGOR)).toBe(471);
  });

  it('is the share of the whole base, unrounded', () => {
    expect(interactedPercent(IGOR)).toBeCloseTo((471 / 1240) * 100, 10);
    expect(Math.round(interactedPercent(IGOR))).toBe(38);
  });
});

describe('engagedPercent', () => {
  it('is superfãs + engajados over the base', () => {
    expect(engagedPercent(IGOR)).toBeCloseTo((267 / 1240) * 100, 10);
    expect(Math.round(engagedPercent(IGOR))).toBe(22);
  });

  it('is 0 for an empty base', () => {
    const empty: EngagementBands = {
      counts: { new: 0, superfan: 0, engaged: 0, occasional: 0, at_risk: 0, inactive: 0 },
      newActivated: 0,
    };
    expect(engagedPercent(empty)).toBe(0);
    expect(interactedPercent(empty)).toBe(0);
  });
});

describe('percentOf', () => {
  it('is part over whole as 0–100, unrounded', () => {
    expect(Math.round(percentOf(168, 1240))).toBe(14);
  });

  it('is 0 when the whole is not positive', () => {
    expect(percentOf(5, 0)).toBe(0);
    expect(percentOf(5, -1)).toBe(0);
  });
});
