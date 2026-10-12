import { describe, expect, it } from 'vitest';
import {
  memberActivityLists,
  memberPanel,
  memberPostTable,
  type RelativeMoment,
  spreadMoments,
} from '../fixtures';

/**
 * The drill-down lists behind the member report (quick 261012-hqr). Each list must agree with the
 * number on its card (D-04) and hold only the member's own actions (D-05).
 */

const COMMUNITIES = ['Comunidade VIP', 'Geral', 'Eventos'] as const;
/** Person names used by the other panels' fixtures: none may leak into the member's lists. */
const OTHER_PEOPLE = /\b(João|Lia|Vieira|Rui|Matos)\b/;

function isNewestFirst(moments: readonly RelativeMoment[]): boolean {
  return moments.every((moment, i) => {
    const previous = moments[i - 1];
    if (!previous) return true;
    if (previous.daysAgo !== moment.daysAgo) return previous.daysAgo < moment.daysAgo;
    return (previous.time ?? '') >= (moment.time ?? '');
  });
}

function countBy<T>(rows: readonly T[], key: (row: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) counts[key(row)] = (counts[key(row)] ?? 0) + 1;
  return counts;
}

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(allStrings);
  return [];
}

const tableIds = new Set(memberPostTable.map((post) => post.id));

describe('memberPostTable (the one table every post list reads)', () => {
  it('holds 60 distinct posts with distinct excerpts of at most 70 characters', () => {
    expect(memberPostTable).toHaveLength(60);
    expect(tableIds.size).toBe(60);
    expect(new Set(memberPostTable.map((post) => post.excerpt)).size).toBe(60);
    for (const post of memberPostTable) expect(post.excerpt.length).toBeLessThanOrEqual(70);
  });

  it('splits 30 / 20 / 10 across Comunidade VIP, Geral and Eventos', () => {
    expect(countBy(memberPostTable, (post) => post.community)).toEqual({
      'Comunidade VIP': 30,
      Geral: 20,
      Eventos: 10,
    });
  });
});

describe('spreadMoments', () => {
  it.each([60, 46, 23, 12, 9, 3])('gives %i moments in the window, newest first', (count) => {
    const moments = spreadMoments(count);
    expect(moments).toHaveLength(count);
    expect(isNewestFirst(moments)).toBe(true);
    for (const moment of moments) {
      expect(moment.daysAgo).toBeGreaterThanOrEqual(1);
      expect(moment.daysAgo).toBeLessThanOrEqual(7);
      expect(moment.time).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('is deterministic', () => {
    expect(spreadMoments(60)).toEqual(spreadMoments(60));
  });
});

describe('memberActivityLists.likes (D-04)', () => {
  const { likes } = memberActivityLists;
  const { engagement } = memberPanel.activity;

  it('agrees with the Curtidas card: measured, 46 rows', () => {
    expect(likes.example).toBe(false);
    expect(likes.example).toBe(engagement.likes.example);
    expect(likes.value).toHaveLength(engagement.likes.value.count);
    expect(likes.value).toHaveLength(46);
  });

  it('likes distinct posts from the table: 25 VIP, 15 Geral, 6 Eventos', () => {
    const ids = likes.value.map((row) => row.id);
    expect(new Set(ids).size).toBe(46);
    for (const id of ids) expect(tableIds.has(id)).toBe(true);
    expect(countBy(likes.value, (row) => row.community)).toEqual({
      'Comunidade VIP': 25,
      Geral: 15,
      Eventos: 6,
    });
  });

  it('is newest first, inside the 7-day window', () => {
    expect(isNewestFirst(likes.value.map((row) => row.when))).toBe(true);
    for (const row of likes.value) {
      expect(row.when.daysAgo).toBeGreaterThanOrEqual(1);
      expect(row.when.daysAgo).toBeLessThanOrEqual(7);
    }
  });
});

describe('memberActivityLists (D-05)', () => {
  it('names no other person anywhere', () => {
    for (const text of allStrings(memberActivityLists)) expect(text).not.toMatch(OTHER_PEOPLE);
    for (const post of memberPostTable) expect(post.excerpt).not.toMatch(OTHER_PEOPLE);
  });

  it('every community is one of the three', () => {
    for (const post of memberPostTable) expect(COMMUNITIES).toContain(post.community);
  });
});
