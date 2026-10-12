import { describe, expect, it } from 'vitest';
import {
  memberActivityLists,
  memberPanel,
  memberPostTable,
  previewTenant,
  type RelativeMoment,
  spreadMoments,
} from '../fixtures';
import { totalViews, totalWatchedSeconds } from '../ui/metrics';

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

/** The last-seen moment of a table post: every action on it carries that moment. */
const seenOf = new Map(
  memberPostTable.map((post, i) => [post.id, spreadMoments(memberPostTable.length)[i]]),
);

describe('memberActivityLists.comments (D-04)', () => {
  const { comments, likes } = memberActivityLists;
  const { engagement, byCommunity } = memberPanel.activity;

  it('agrees with the Comentários card: measured, 12 rows', () => {
    expect(comments.example).toBe(false);
    expect(comments.example).toBe(engagement.comments.example);
    expect(comments.value).toHaveLength(engagement.comments.value.count);
    expect(comments.value).toHaveLength(12);
  });

  it('comments once on 12 table posts: 6 VIP, 4 Geral, 2 Eventos, at their last-seen moment', () => {
    const ids = comments.value.map((row) => row.post.id);
    expect(new Set(ids).size).toBe(12);
    for (const row of comments.value) {
      expect(tableIds.has(row.post.id)).toBe(true);
      expect(row.when).toEqual(seenOf.get(row.post.id));
      expect(row.text.length).toBeLessThanOrEqual(90);
    }
    expect(new Set(comments.value.map((row) => row.id)).size).toBe(12);
    expect(countBy(comments.value, (row) => row.post.community)).toEqual({
      'Comunidade VIP': 6,
      Geral: 4,
      Eventos: 2,
    });
    expect(isNewestFirst(comments.value.map((row) => row.when))).toBe(true);
  });

  it('likes + comments per community equal "Onde você mais participa"', () => {
    const liked = countBy(likes.value, (row) => row.community);
    const commented = countBy(comments.value, (row) => row.post.community);
    for (const row of byCommunity.value) {
      expect((liked[row.name] ?? 0) + (commented[row.name] ?? 0)).toBe(row.interactions);
    }
    expect(byCommunity.value.map((row) => row.interactions)).toEqual([31, 19, 8]);
  });
});

describe('memberActivityLists.saves and shares (example lists)', () => {
  const { saves, shares } = memberActivityLists;
  const { engagement } = memberPanel.activity;

  it('saves: 9 example rows at table indices 2..58 step 7, newest first', () => {
    expect(saves.example).toBe(true);
    expect(saves.example).toBe(engagement.saves.example);
    if (saves.example) expect(saves.reason).toBe('needs_saves');
    expect(saves.value).toHaveLength(engagement.saves.value.count);
    expect(saves.value.map((row) => row.id)).toEqual([
      'p03',
      'p10',
      'p17',
      'p24',
      'p31',
      'p38',
      'p45',
      'p52',
      'p59',
    ]);
    for (const row of saves.value) expect(row.when).toEqual(seenOf.get(row.id));
    expect(isNewestFirst(saves.value.map((row) => row.when))).toBe(true);
  });

  it('shares: 3 example rows at indices 5, 25, 45 via link, native, link', () => {
    expect(shares.example).toBe(true);
    expect(shares.example).toBe(engagement.shares.example);
    if (shares.example) expect(shares.reason).toBe('needs_shares');
    expect(shares.value).toHaveLength(engagement.shares.value.count);
    expect(shares.value.map((row) => [row.id, row.via])).toEqual([
      ['p06', 'link'],
      ['p26', 'native'],
      ['p46', 'link'],
    ]);
    for (const row of shares.value) expect(row.when).toEqual(seenOf.get(row.id));
    expect(isNewestFirst(shares.value.map((row) => row.when))).toBe(true);
  });
});

describe('memberActivityLists.stories (measured list, example time per story)', () => {
  const { stories } = memberActivityLists;
  const { seen } = memberPanel.activity;

  it('agrees with the Stories vistos card: measured, 23 rows', () => {
    expect(stories.example).toBe(false);
    expect(stories.example).toBe(seen.stories.example);
    expect(stories.value).toHaveLength(seen.stories.value);
    expect(stories.value).toHaveLength(23);
    expect(new Set(stories.value.map((row) => row.id)).size).toBe(23);
  });

  it('authors are the creator or a community, never another member', () => {
    const allowed = [previewTenant.displayName, ...COMMUNITIES];
    for (const row of stories.value) expect(allowed).toContain(row.author);
  });

  it('every time on screen is an example of 5..15 s', () => {
    for (const row of stories.value) {
      expect(row.seconds.example).toBe(true);
      if (row.seconds.example) expect(row.seconds.reason).toBe('needs_story_view_time');
      expect(row.seconds.value).toBeGreaterThanOrEqual(5);
      expect(row.seconds.value).toBeLessThanOrEqual(15);
    }
  });

  it('is newest first, inside the window', () => {
    expect(isNewestFirst(stories.value.map((row) => row.when))).toBe(true);
    for (const row of stories.value) expect(row.when.daysAgo).toBeGreaterThanOrEqual(1);
  });
});

describe('memberActivityLists.posts (D-04)', () => {
  const { posts } = memberActivityLists;
  const { seen } = memberPanel.activity;

  it('agrees with the Posts vistos card: 60 example rows summing to 128 views', () => {
    expect(posts.example).toBe(true);
    expect(posts.example).toBe(seen.posts.example);
    if (posts.example) expect(posts.reason).toBe('needs_post_views');
    expect(posts.value).toHaveLength(60);
    expect(posts.value).toHaveLength(seen.posts.value.posts);
    expect(totalViews(posts.value)).toBe(128);
    expect(totalViews(posts.value)).toBe(seen.posts.value.views);
  });

  it('holds every table post once, each seen at least once', () => {
    expect(new Set(posts.value.map((row) => row.id))).toEqual(tableIds);
    for (const row of posts.value) {
      expect(row.views).toBeGreaterThanOrEqual(1);
      expect(row.lastSeen).toEqual(seenOf.get(row.id));
    }
  });

  it('is sorted by views, most first, ties most recent first', () => {
    const tableIndex = new Map(memberPostTable.map((post, i) => [post.id, i]));
    posts.value.forEach((row, i) => {
      const previous = posts.value[i - 1];
      if (!previous) return;
      expect(previous.views).toBeGreaterThanOrEqual(row.views);
      if (previous.views === row.views) {
        expect(tableIndex.get(previous.id)).toBeLessThan(tableIndex.get(row.id) ?? -1);
      }
    });
  });

  it('every post the member acted on is one they saw', () => {
    const seenIds = new Set(posts.value.map((row) => row.id));
    const { likes, comments, saves, shares } = memberActivityLists;
    for (const id of [
      ...likes.value.map((row) => row.id),
      ...comments.value.map((row) => row.post.id),
      ...saves.value.map((row) => row.id),
      ...shares.value.map((row) => row.id),
    ]) {
      expect(seenIds.has(id)).toBe(true);
    }
  });
});

describe('memberActivityLists.videos (D-04)', () => {
  const { videos } = memberActivityLists;
  const { seen } = memberPanel.activity;

  it('agrees with the Vídeos e reels cards: 41 example rows, 72 whole minutes', () => {
    expect(videos.example).toBe(true);
    expect(videos.example).toBe(seen.videos.example);
    if (videos.example) expect(videos.reason).toBe('needs_video_playback');
    expect(videos.value).toHaveLength(seen.videos.value.count);
    expect(videos.value).toHaveLength(41);
    const seconds = totalWatchedSeconds(videos.value);
    expect(seconds).toBe(4320);
    expect(seconds).toBe(seen.videos.value.minutes * 60);
    expect(seconds % 60).toBe(0);
  });

  it('every row is plausible and the list is most watched first', () => {
    videos.value.forEach((row, i) => {
      expect(row.watchedSeconds).toBeGreaterThan(0);
      expect(row.watchedSeconds).toBeLessThanOrEqual(row.durationSeconds * row.plays);
      expect(row.title.length).toBeLessThanOrEqual(50);
      expect(COMMUNITIES).toContain(row.community);
      const previous = videos.value[i - 1];
      if (previous) expect(previous.watchedSeconds).toBeGreaterThanOrEqual(row.watchedSeconds);
    });
    expect(new Set(videos.value.map((row) => row.id)).size).toBe(41);
    expect(new Set(videos.value.map((row) => row.title)).size).toBe(41);
  });

  it('has 16 videos and 25 reels, and the D-03 sample row', () => {
    expect(countBy(videos.value, (row) => row.kind)).toEqual({ video: 16, reel: 25 });
    expect(
      videos.value.filter(
        (row) => row.durationSeconds === 252 && row.plays === 2 && row.watchedSeconds === 130,
      ),
    ).toHaveLength(1);
  });
});

describe('memberActivityLists example flags', () => {
  it('saves, shares, posts and videos are examples; likes, comments and stories are measured', () => {
    const entries = Object.entries(memberActivityLists);
    expect(
      entries
        .filter(([, list]) => list.example)
        .map(([key]) => key)
        .sort(),
    ).toEqual(['posts', 'saves', 'shares', 'videos']);
    expect(
      entries
        .filter(([, list]) => !list.example)
        .map(([key]) => key)
        .sort(),
    ).toEqual(['comments', 'likes', 'stories']);
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
