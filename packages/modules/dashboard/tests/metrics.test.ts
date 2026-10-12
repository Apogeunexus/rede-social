import { describe, expect, it } from 'vitest';
import { type EngagementBands, memberPanel } from '../fixtures';
import {
  bandTotal,
  ENGAGEMENT_BAND_ORDER,
  engagedPercent,
  FOR_YOU_PRIORITY,
  interactedCount,
  interactedPercent,
  isBelowPrivacyFloor,
  isNewMember,
  MAX_FOR_YOU_CARDS,
  MIN_STREAK_WEEKS,
  NEW_MEMBER_DAYS,
  PRIVACY_FLOOR,
  percentOf,
  selectForYouCards,
  vsMedian,
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

describe('the privacy floor (D-02)', () => {
  it('hides any count under 5', () => {
    expect(PRIVACY_FLOOR).toBe(5);
    expect(isBelowPrivacyFloor(4)).toBe(true);
    expect(isBelowPrivacyFloor(0)).toBe(true);
    expect(isBelowPrivacyFloor(5)).toBe(false);
    expect(isBelowPrivacyFloor(37)).toBe(false);
  });
});

describe('isNewMember', () => {
  it('is a member who joined less than 30 days ago', () => {
    expect(NEW_MEMBER_DAYS).toBe(30);
    expect(isNewMember(9)).toBe(true);
    expect(isNewMember(29)).toBe(true);
    expect(isNewMember(30)).toBe(false);
  });
});

describe('vsMedian', () => {
  it('compares a post with the median once it is old enough', () => {
    expect(vsMedian(127, 52, 26, 24)).toBeCloseTo(1.4423, 4);
    expect(vsMedian(60, 52, 35, 24)).toBeCloseTo(0.1538, 4);
  });

  it('is null while the post is younger than the comparison point', () => {
    expect(vsMedian(15, 52, 12, 24)).toBeNull();
  });

  it('is null without a median to compare with', () => {
    expect(vsMedian(10, 0, 30, 24)).toBeNull();
  });
});

describe('the weekly streak', () => {
  it('is only worth showing from 2 weeks', () => {
    expect(MIN_STREAK_WEEKS).toBe(2);
  });
});

describe('selectForYouCards', () => {
  const { nextEvent, supportReply, accessExpiring, newSinceLastVisit, unlockedCommunity } =
    memberPanel.forYou;

  it('ranks event > support reply > access expiring > news > community', () => {
    expect(FOR_YOU_PRIORITY).toEqual(['event', 'support', 'access', 'news', 'community']);
  });

  it("keeps the member's three highest cards", () => {
    expect(selectForYouCards(memberPanel.forYou)).toEqual(['event', 'support', 'access']);
  });

  it('gives news a slot when a higher card is absent', () => {
    expect(
      selectForYouCards({ supportReply, accessExpiring, newSinceLastVisit, unlockedCommunity }),
    ).toEqual(['support', 'access', 'news']);
    expect(selectForYouCards({ unlockedCommunity, newSinceLastVisit })).toEqual([
      'news',
      'community',
    ]);
  });

  it('shows nothing when there is nothing for the member', () => {
    expect(selectForYouCards({})).toEqual([]);
  });

  it(`never shows more than ${MAX_FOR_YOU_CARDS} cards`, () => {
    expect(MAX_FOR_YOU_CARDS).toBe(3);
    const all = { nextEvent, supportReply, accessExpiring, newSinceLastVisit, unlockedCommunity };
    expect(selectForYouCards(all).length).toBeLessThanOrEqual(MAX_FOR_YOU_CARDS);
  });
});
