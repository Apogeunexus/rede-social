import { describe, expect, it } from 'vitest';
import {
  CONTENT_KIND_ORDER,
  type ContentItem,
  type ContentKind,
  ownerContent,
  ownerContentIncludes,
  ownerContentInteractions,
  ownerContentInteractorIncludes,
  ownerContentInteractors,
  ownerContentItem,
  ownerContentItems,
  ownerContentKindMetric,
  ownerContentPeople,
  ownerMemberInsights,
  tenantOwnerPanel,
} from '../fixtures';
import { buildOwnerContentPeople } from '../fixtures/owner-content';
import { daysSince, ownerBandRoster } from '../fixtures/owner-members';
import { ENGAGEMENT_BAND_ORDER } from '../ui/metrics';
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
      expect(
        sum(rows, (item) => item.likes + item.comments),
        row.id,
      ).toBe(row.interactions);
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
      expect(
        sum(rows, (item) => item.likes),
        kind,
      ).toBe(likes);
      expect(
        sum(rows, (item) => item.comments),
        kind,
      ).toBe(comments);
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

describe('the overview numbers (D-02, D-08)', () => {
  const { engagement, publishing } = tenantOwnerPanel;

  it('compare with the 30 days before', () => {
    const { deltas } = ownerContent;
    expect(deltas.posts).toMatchObject({ amount: 5, kind: 'count', direction: 'up' });
    expect(deltas.interactions).toMatchObject({ amount: 9, kind: 'percent', direction: 'up' });
    expect(deltas.rate).toMatchObject({ amount: 1, kind: 'points', direction: 'up' });
    expect(deltas.interactors).toMatchObject({ amount: 4, kind: 'percent', direction: 'up' });
    expect(deltas.views).toMatchObject({ amount: 6, kind: 'percent', direction: 'up' });
    expect(deltas.reach).toMatchObject({ amount: 6, kind: 'percent', direction: 'up' });
    for (const delta of Object.values(deltas)) expect(delta.basis).toBe('previous_30_days');
  });

  it('count who interacted per band, within the band and above the roster sample', () => {
    const { interactorsByBand } = ownerContent;
    expect(interactorsByBand).toEqual({
      new: 41,
      superfan: 62,
      engaged: 189,
      occasional: 136,
      at_risk: 0,
      inactive: 0,
    });
    expect(Object.values(interactorsByBand).reduce((a, b) => a + b, 0)).toBe(428);
    for (const band of ENGAGEMENT_BAND_ORDER) {
      expect(interactorsByBand[band], band).toBeLessThanOrEqual(engagement.counts[band]);
      expect(interactorsByBand[band], band).toBeGreaterThanOrEqual(
        ownerContentInteractors(band).people.length,
      );
    }
    expect(interactorsByBand.new).toBeLessThanOrEqual(engagement.newActivated);
  });

  it('trend over 12 weeks against the 12 before', () => {
    expect(ownerContent.weeklyPerPost.current).toEqual([
      52, 55, 54, 57, 58, 56, 60, 61, 63, 66, 64, 68,
    ]);
    expect(ownerContent.weeklyPerPost.previous).toEqual([
      48, 50, 49, 51, 53, 52, 54, 55, 58, 60, 59, 62,
    ]);
  });

  it('heatmap: 28 cells whose rows and columns are byWeekday and bySlot', () => {
    const { heatmap } = ownerContent;
    expect(heatmap).toHaveLength(28);
    for (const day of publishing.byWeekday) {
      const cells = heatmap.filter((cell) => cell.weekday === day.weekday);
      expect(cells, day.weekday).toHaveLength(4);
      expect(sumOf(cells, 'posts'), day.weekday).toBe(day.posts);
      expect(sumOf(cells, 'interactions'), day.weekday).toBe(day.interactions);
    }
    for (const slot of publishing.bySlot) {
      const cells = heatmap.filter((cell) => cell.fromHour === slot.fromHour);
      expect(cells, String(slot.fromHour)).toHaveLength(7);
      expect(cells.every((cell) => cell.toHour === slot.toHour)).toBe(true);
      expect(sumOf(cells, 'posts'), String(slot.fromHour)).toBe(slot.posts);
      expect(sumOf(cells, 'interactions'), String(slot.fromHour)).toBe(slot.interactions);
    }
    const perPost = heatmap.map((cell) => cell.interactions / cell.posts);
    const best = heatmap[perPost.indexOf(Math.max(...perPost))];
    expect(best).toMatchObject({ weekday: 'thu', fromHour: 20, posts: 4, interactions: 401 });
    expect(Math.round(Math.max(...perPost))).toBe(100);
    const worst = heatmap[perPost.indexOf(Math.min(...perPost))];
    expect(worst).toMatchObject({ weekday: 'sun', fromHour: 7, posts: 1, interactions: 39 });
  });

  it("each post's comments: answered by the team, the oldest unanswered, the first reply", () => {
    let late = 0;
    for (const item of posts) {
      const { answered, oldestUnansweredHours, firstReplyMedianMinutes } = item.commentMeta;
      expect(answered, item.id).toBeGreaterThanOrEqual(0);
      expect(answered, item.id).toBeLessThanOrEqual(item.comments);
      expect(oldestUnansweredHours === null, item.id).toBe(answered === item.comments);
      expect(firstReplyMedianMinutes === null, item.id).toBe(answered === 0);
      if (oldestUnansweredHours !== null) {
        expect(oldestUnansweredHours, item.id).toBeLessThanOrEqual(24 * (daysSince(item.date) + 1));
        if (daysSince(item.date) < 2) expect(oldestUnansweredHours, item.id).toBeLessThan(24);
        if (oldestUnansweredHours > 24) late += 1;
      }
    }
    expect(late).toBeGreaterThanOrEqual(3);
    const op19 = ownerContentItem('op-19');
    expect(op19.comments - op19.commentMeta.answered).toBe(9);
    expect(op19.commentMeta.oldestUnansweredHours).toBe(192);
  });
});

describe('who interacts and the interactions (D-02, PD-5, PD-7)', () => {
  const active = ROSTER.filter(
    ({ insights }) => insights.lists.likes.length + insights.lists.comments.length > 0,
  );

  it('the interactors are the roster members with a like or comment, most recent first', () => {
    const all = ownerContentInteractors(null);
    expect(all.total).toBe(428);
    expect(all.people.map((p) => p.id).sort()).toEqual(active.map(({ row }) => row.id).sort());
    for (const [i, person] of all.people.entries()) {
      const before = all.people[i - 1];
      if (before) expect(before.when.daysAgo).toBeLessThanOrEqual(person.when.daysAgo);
    }
    for (const band of ENGAGEMENT_BAND_ORDER) {
      const list = ownerContentInteractors(band);
      expect(list.total, band).toBe(ownerContent.interactorsByBand[band]);
      for (const person of list.people) {
        expect(person.band, band).toBe(band);
        expect(ownerContentInteractorIncludes(band, person.id), band).toBe(true);
        expect(ownerContentInteractorIncludes(null, person.id), band).toBe(true);
      }
    }
    const atRisk = ownerBandRoster.find((row) => row.band === 'at_risk');
    expect(ownerContentInteractorIncludes(null, atRisk?.id ?? '')).toBe(false);
    expect(
      ownerContentInteractorIncludes(
        'superfan',
        all.people.find((p) => p.band === 'new')?.id ?? '',
      ),
    ).toBe(false);
  });

  it('the interactions are every roster like and comment, the same fact as the people', () => {
    const { rows, total } = ownerContentInteractions();
    expect(total).toBe(3940);
    expect(rows).toHaveLength(759);
    expect(rows.filter((row) => row.action === 'like')).toHaveLength(663);
    for (const [i, row] of rows.entries()) {
      const who = row.action === 'like' ? 'likes' : 'comments';
      const person = ownerContentPeople(row.itemId, who).people.find((p) => p.id === row.person.id);
      expect(person?.when, `${row.person.id} ${row.itemId}`).toEqual(row.when);
      const before = rows[i - 1];
      if (before) expect(before.when.daysAgo).toBeLessThanOrEqual(row.when.daysAgo);
    }
  });
});

function sumOf<T extends Record<K, number>, K extends string>(rows: readonly T[], key: K): number {
  return rows.reduce((total, row) => total + row[key], 0);
}
