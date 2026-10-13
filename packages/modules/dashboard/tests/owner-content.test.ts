import { describe, expect, it } from 'vitest';
import {
  CONTENT_KIND_ORDER,
  type ContentItem,
  type ContentKind,
  ownerContentIncludes,
  ownerContentItem,
  ownerContentItems,
  ownerContentKindMetric,
  ownerContentPeople,
  ownerMemberInsights,
  tenantOwnerPanel,
} from '../fixtures';
import { buildOwnerContentPeople } from '../fixtures/owner-content';
import { daysSince, ownerBandRoster } from '../fixtures/owner-members';
import { ownerPostTable } from '../fixtures/owner-posts';

/**
 * Quick 261013-h51 D-05, D-08: the Conteúdo area's items (the 61 feed posts and the 16 stories),
 * their numbers and the people behind them. The sums close with the panel's own numbers, and a
 * member's liked post and that post's likers are one fact seen from both sides.
 */

const { byCommunity, byFormat, topPosts, reach, stories, videoPlayback } = tenantOwnerPanel;

const posts = ownerContentItems.filter((item) => item.kind !== 'story');
const storyItems = ownerContentItems.filter((item) => item.kind === 'story');

function sum(items: readonly ContentItem[], pick: (item: ContentItem) => number): number {
  return items.reduce((total, item) => total + pick(item), 0);
}

function insightsOf(id: string) {
  const insights = ownerMemberInsights(id);
  if (!insights) throw new Error(`no insights for ${id}`);
  return insights;
}

const ROSTER = ownerBandRoster.map((row) => ({ row, insights: insightsOf(row.id) }));

describe('the content items', () => {
  it('are the 61 feed posts newest first, then 16 stories', () => {
    expect(ownerContentItems).toHaveLength(77);
    expect(posts.map((item) => item.id)).toEqual(ownerPostTable.map((post) => post.id));
    expect(storyItems.map((item) => item.id)).toEqual(
      Array.from({ length: 16 }, (_, i) => `os-${String(i + 1).padStart(2, '0')}`),
    );
    expect(ownerContentItems.slice(0, 61).every((item) => item.kind !== 'story')).toBe(true);
    expect(CONTENT_KIND_ORDER).toEqual(['video', 'photo', 'carousel', 'text', 'link', 'story']);
  });

  it('total 3.100 likes and 840 comments over the 61 posts', () => {
    expect(sum(posts, (item) => item.likes)).toBe(3100);
    expect(sum(posts, (item) => item.comments)).toBe(840);
  });

  it('match byCommunity and byFormat', () => {
    for (const row of byCommunity) {
      const rows = posts.filter((item) => item.communityId === row.id);
      expect(rows, row.id).toHaveLength(row.posts);
      expect(sum(rows, (item) => item.likes + item.comments), row.id).toBe(row.interactions);
    }
    for (const row of byFormat) {
      const rows = ownerPostTable.filter((post) => post.type === row.type);
      expect(rows, row.type).toHaveLength(row.posts);
      expect(
        rows.reduce((total, post) => total + post.likes + post.comments, 0),
        row.type,
      ).toBe(row.interactions);
    }
  });

  it('split per kind as the Por tipo table (photo + carousel = the 15 gallery posts)', () => {
    const expected: Record<Exclude<ContentKind, 'story'>, [number, number, number]> = {
      video: [18, 1489, 240],
      photo: [6, 310, 62],
      carousel: [9, 560, 135],
      text: [20, 591, 369],
      link: [8, 150, 34],
    };
    for (const [kind, [count, likes, comments]] of Object.entries(expected)) {
      const rows = posts.filter((item) => item.kind === kind);
      expect(rows, kind).toHaveLength(count);
      expect(sum(rows, (item) => item.likes), kind).toBe(likes);
      expect(sum(rows, (item) => item.comments), kind).toBe(comments);
    }
  });

  it('carry the four top posts with their numbers', () => {
    const ids = ['op-11', 'op-15', 'op-19', 'op-22'];
    for (const [i, top] of topPosts.entries()) {
      const item = ownerContentItem(ids[i] ?? '');
      expect(item, top.id).toMatchObject({
        date: top.date,
        likes: top.likes,
        comments: top.comments,
        saves: top.saves,
        shares: top.shares,
      });
    }
    expect(ownerContentItem('op-15').kind).toBe('carousel');
  });

  it('read their kind with the SPEC §2.3 rule', () => {
    for (const post of ownerPostTable) {
      const item = ownerContentItem(post.id);
      if (post.type === 'gallery') {
        expect(item.kind, post.id).toBe((post.cards ?? 0) === 1 ? 'photo' : 'carousel');
        expect(post.cards, post.id).toBeGreaterThanOrEqual(1);
      } else {
        expect(item.kind, post.id).toBe(post.type);
      }
    }
  });

  it('have the media size of their kind', () => {
    for (const item of posts) {
      if (item.kind === 'video') {
        const seconds = item.durationSeconds ?? 0;
        expect(seconds, item.id).toBeGreaterThan(0);
        expect(item.media, item.id).toEqual(
          seconds <= 90 ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 },
        );
      } else {
        expect(item.durationSeconds, item.id).toBeNull();
      }
      if (item.kind === 'photo') {
        expect(item.media, item.id).toEqual({ width: 1080, height: 1350 });
        expect(item.cards, item.id).toBe(1);
      }
      if (item.kind === 'carousel') {
        expect(item.media, item.id).not.toBeNull();
        expect(item.cards, item.id).toBeGreaterThanOrEqual(2);
      }
      if (item.kind === 'text' || item.kind === 'link') expect(item.media, item.id).toBeNull();
    }
    expect(ownerContentItem('op-11')).toMatchObject({
      kind: 'video',
      durationSeconds: 58,
      media: { width: 1080, height: 1920 },
    });
  });

  it('keep the example values marked and coherent (likes ≤ reach ≤ 1.240 ≤ …, views ≥ reach)', () => {
    for (const item of posts) {
      expect(item.saves, item.id).toMatchObject({ example: true, reason: 'needs_saves' });
      expect(item.shares, item.id).toMatchObject({ example: true, reason: 'needs_shares' });
      expect(item.views, item.id).toMatchObject({ example: true, reason: 'needs_post_views' });
      expect(item.reach, item.id).toMatchObject({ example: true, reason: 'needs_post_views' });
      expect(item.likes, item.id).toBeLessThanOrEqual(item.reach.value);
      expect(item.reach.value, item.id).toBeLessThanOrEqual(1240);
      expect(item.views.value, item.id).toBeGreaterThanOrEqual(item.reach.value);
    }
    expect(sum(posts, (item) => item.reach.value)).toBe(37332);
    expect(Math.round(sum(posts, (item) => item.reach.value) / posts.length)).toBe(
      reach.value.perPost,
    );
  });

  it('hold 16 measured stories inside the 30 days', () => {
    expect(storyItems).toHaveLength(stories.count);
    for (const item of storyItems) {
      expect(item.communityId, item.id).toBeNull();
      expect(item.media, item.id).toEqual({ width: 1080, height: 1920 });
      expect(daysSince(item.date), item.id).toBeLessThanOrEqual(29);
      expect(daysSince(item.date), item.id).toBeGreaterThanOrEqual(0);
      expect(item.reach.example, item.id).toBe(false);
      expect(item.views.example, item.id).toBe(false);
      expect(item.views.value, item.id).toBeGreaterThanOrEqual(item.reach.value);
      expect(item.saves, item.id).toBeNull();
    }
    expect(sum(storyItems, (item) => item.likes)).toBe(412);
    expect(sum(storyItems, (item) => item.comments)).toBe(63);
    expect(sum(storyItems, (item) => item.reach.value)).toBe(
      stories.count * stories.averageUniqueViewers,
    );
  });

  it('give each kind its own metric, examples with their reasons', () => {
    expect(ownerContentKindMetric.video).toEqual(videoPlayback.watchedPercent);
    expect(ownerContentKindMetric.carousel).toEqual({
      example: true,
      reason: 'needs_gallery_swipes',
      value: 48,
    });
    expect(ownerContentKindMetric.link).toEqual({
      example: true,
      reason: 'needs_link_clicks',
      value: 14,
    });
    expect(ownerContentKindMetric.story).toEqual({
      example: true,
      reason: 'needs_story_taps',
      value: 22,
    });
  });

  it('throw on an unknown id', () => {
    expect(() => ownerContentItem('op-99')).toThrow();
    expect(() => ownerContentPeople('op-99', 'likes')).toThrow();
    expect(() => ownerContentPeople('os-01', 'saves')).toThrow();
  });
});

describe('the people behind each number (P1)', () => {
  it('never outnumber the measured likes and comments', () => {
    for (const item of ownerContentItems) {
      expect(ownerContentPeople(item.id, 'likes').people.length, item.id).toBeLessThanOrEqual(
        item.likes,
      );
      expect(ownerContentPeople(item.id, 'comments').people.length, item.id).toBeLessThanOrEqual(
        item.comments,
      );
      expect(ownerContentPeople(item.id, 'likes').total, item.id).toBe(item.likes);
      expect(ownerContentPeople(item.id, 'comments').total, item.id).toBe(item.comments);
    }
  });

  it('are the same fact as each member’s liked and commented posts (both directions)', () => {
    let likes = 0;
    let comments = 0;
    for (const { row, insights } of ROSTER) {
      for (const post of posts) {
        const liked = insights.lists.likes.find((like) => like.post.id === post.id);
        const liker = ownerContentPeople(post.id, 'likes').people.find(
          (person) => person.id === row.id,
        );
        expect(Boolean(liker), `${row.id} likes ${post.id}`).toBe(Boolean(liked));
        if (liked) {
          expect(liker?.when, `${row.id} ${post.id}`).toEqual(liked.when);
          likes += 1;
        }
        const commented = insights.lists.comments.find((comment) => comment.post.id === post.id);
        const commenter = ownerContentPeople(post.id, 'comments').people.find(
          (person) => person.id === row.id,
        );
        expect(Boolean(commenter), `${row.id} comments ${post.id}`).toBe(Boolean(commented));
        if (commented) {
          expect(commenter?.when, `${row.id} ${post.id}`).toEqual(commented.when);
          comments += 1;
        }
      }
    }
    expect(likes).toBe(663);
    expect(comments).toBe(96);
  });

  it('carry their band and are listed most recent first', () => {
    for (const item of ownerContentItems) {
      for (const who of ['likes', 'comments'] as const) {
        const { people } = ownerContentPeople(item.id, who);
        for (const [i, person] of people.entries()) {
          const row = ownerBandRoster.find((member) => member.id === person.id);
          expect(person.band, person.id).toBe(row?.band);
          expect(person.name, person.id).toBe(row?.name);
          const before = people[i - 1];
          if (before) expect(before.when.daysAgo, item.id).toBeLessThanOrEqual(person.when.daysAgo);
        }
      }
    }
  });

  it('on a story: active members who acted by then and had joined', () => {
    for (const item of storyItems) {
      const age = daysSince(item.date);
      for (const who of ['likes', 'comments'] as const) {
        for (const person of ownerContentPeople(item.id, who).people) {
          const row = ownerBandRoster.find((member) => member.id === person.id);
          expect(['new', 'superfan', 'engaged', 'occasional'], person.id).toContain(row?.band);
          expect(row?.lastActive.daysAgo ?? 99, person.id).toBeLessThanOrEqual(age);
          expect(daysSince(row?.memberSince ?? ''), person.id).toBeGreaterThanOrEqual(age);
          expect(person.when.daysAgo, person.id).toBe(age);
        }
      }
    }
  });

  it('saves and shares: an example subset of the likers, never longer than the value', () => {
    for (const item of ownerContentItems) {
      const likers = new Set(ownerContentPeople(item.id, 'likes').people.map((p) => p.id));
      for (const who of ['saves', 'shares'] as const) {
        const metric = who === 'saves' ? item.saves : item.shares;
        if (metric === null) continue;
        const list = ownerContentPeople(item.id, who);
        expect(list.example, item.id).toBe(true);
        expect(list.total, item.id).toBe(metric.value);
        expect(list.people.length, item.id).toBeLessThanOrEqual(metric.value);
        for (const person of list.people) expect(likers.has(person.id), item.id).toBe(true);
      }
    }
  });

  it('the predicate agrees with the lists, with no names', () => {
    const likers = ownerContentPeople('op-11', 'likes').people;
    const first = likers[0];
    expect(first).toBeDefined();
    expect(ownerContentIncludes('op-11', 'likes', first?.id ?? '')).toBe(true);
    const outsider = ownerBandRoster.find((row) => !likers.some((p) => p.id === row.id));
    expect(ownerContentIncludes('op-11', 'likes', outsider?.id ?? '')).toBe(false);
    expect(ownerContentIncludes('op-11', 'likes', 'om-99')).toBe(false);
  });

  it('two builds deep-equal (no clock, no randomness)', () => {
    expect(buildOwnerContentPeople()).toEqual(buildOwnerContentPeople());
  });
});
