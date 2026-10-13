import { daysSince, type OwnerRosterMember } from './owner-members';
import { type OwnerPost, ownerPostTable } from './owner-posts';
import type { RelativeMoment } from './platform-panels';
import type { ReportValue } from './shared';

/**
 * The lists behind one member's insight numbers (quick 261012-tru D-07), for the level-4 Membros
 * area: which posts they liked and commented on, their strong actions, their active days and the
 * posts they saw in the last 30 days. RAW DATA (MOD-02), built purely from the numbers the insights
 * already computed, so each list's length IS its KPI and no row contradicts another.
 *
 * Visible to the client's management only, like the insights: they show which posts a member liked,
 * commented on and viewed, never a comment's text.
 */

export interface OwnerLikedPost {
  post: OwnerPost;
  when: RelativeMoment;
}

export type OwnerStrongAction =
  | { kind: 'comment'; post: OwnerPost; when: RelativeMoment }
  | { kind: 'check_in'; eventId: string; when: RelativeMoment }
  | { kind: 'order'; productId: string; cents: number; when: RelativeMoment };

export interface OwnerSeenPost {
  post: OwnerPost;
  views: number;
  /** Seconds on screen, all views together. */
  seconds: number;
  lastSeen: RelativeMoment;
}

export interface OwnerMemberLists {
  /** One row per active day of the last 30, most recent first, with its counted actions. */
  activeDays: { when: RelativeMoment; actions: number }[];
  /** Most recent first; one post per like. */
  likes: OwnerLikedPost[];
  /** One per day on the most recent active days, on a post liked that day. */
  comments: OwnerLikedPost[];
  /** Comments, check-ins and the VIP order, most recent first. */
  strongActions: OwnerStrongAction[];
  /** Example: no post views are recorded yet. Distinct posts, most viewed first. */
  postsSeen: ReportValue<OwnerSeenPost[]>;
}

export interface OwnerMemberListsInput {
  row: OwnerRosterMember;
  /** The member's slot in their band (0-11). */
  j: number;
  /** The days ago of each active day of the last 30. */
  activeDays: readonly number[];
  likes: number;
  comments: number;
  /** The past events the member attended, with their days ago. */
  attended: readonly { eventId: string; daysAgo: number }[];
  /** The order of the last 30 days, or null. */
  order: { productId: string; cents: number; daysAgo: number } | null;
}

/** Most recent first, then the original order (a stable sort keeps ties as built). */
function byRecency<T extends { when: RelativeMoment }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => a.when.daysAgo - b.when.daysAgo);
}

export function buildOwnerMemberLists(input: OwnerMemberListsInput): OwnerMemberLists {
  const { row, j, likes: likeCount, comments: commentCount, attended, order } = input;
  const days = [...input.activeDays].sort((a, b) => a - b);
  const last = row.lastActive;
  const moment = (daysAgo: number): RelativeMoment =>
    daysAgo === last.daysAgo ? { ...last } : { daysAgo };

  const pool = ownerPostTable.filter((post) => row.communities[post.communityId]);
  const age = new Map(pool.map((post) => [post.id, daysSince(post.date)]));
  const ageOf = (post: OwnerPost) => age.get(post.id) ?? Number.NaN;

  // One like per active day, then the extras round-robin over the days from the most recent.
  const slots = [...days];
  for (let k = 0; slots.length < likeCount; k += 1) {
    const day = days[k % days.length];
    if (day === undefined) break;
    slots.push(day);
  }
  if (slots.length !== likeCount) {
    throw new Error(`${row.id} has ${likeCount} likes and ${days.length} active days`);
  }

  // Oldest slot first: each takes the newest unused post published by that day.
  const used = new Set<string>();
  const likes: OwnerLikedPost[] = [];
  for (const day of [...slots].sort((a, b) => b - a)) {
    const post = pool
      .filter((candidate) => !used.has(candidate.id) && ageOf(candidate) >= day)
      .sort((a, b) => ageOf(a) - ageOf(b))[0];
    if (!post) throw new Error(`no post left for ${row.id} to like ${day} days ago`);
    used.add(post.id);
    likes.push({ post, when: moment(day) });
  }
  const sortedLikes = byRecency(likes);

  const comments = days.slice(0, commentCount).map((day) => {
    const liked = sortedLikes.find((like) => like.when.daysAgo === day);
    if (!liked) throw new Error(`${row.id} comments ${day} days ago with no like that day`);
    return { post: liked.post, when: liked.when };
  });

  const strongActions = byRecency<OwnerStrongAction>([
    ...comments.map((comment) => ({ kind: 'comment' as const, ...comment })),
    ...attended.map((event) => ({
      kind: 'check_in' as const,
      eventId: event.eventId,
      when: moment(event.daysAgo),
    })),
    ...(order
      ? [
          {
            kind: 'order' as const,
            productId: order.productId,
            cents: order.cents,
            when: moment(order.daysAgo),
          },
        ]
      : []),
  ]);

  const actionsOn = (day: number) =>
    slots.filter((slot) => slot === day).length +
    comments.filter((comment) => comment.when.daysAgo === day).length +
    attended.filter((event) => event.daysAgo === day).length +
    (order?.daysAgo === day ? 1 : 0);
  const activeDays = days.map((day) => ({ when: moment(day), actions: actionsOn(day) }));

  // Every liked post was seen, more than once; then per active day the newest unused post of then.
  const seen: OwnerSeenPost[] = sortedLikes.map((like, k) => ({
    post: like.post,
    views: 2 + ((k + j) % 3),
    seconds: 20 + 10 * ((k + j) % 6),
    lastSeen: like.when,
  }));
  for (const [k, day] of days.entries()) {
    const post = pool
      .filter((candidate) => !used.has(candidate.id) && ageOf(candidate) >= day)
      .sort((a, b) => ageOf(a) - ageOf(b))[0];
    if (!post) continue;
    used.add(post.id);
    seen.push({
      post,
      views: 1 + ((k + j) % 2),
      seconds: 20 + 10 * ((k + j) % 6),
      lastSeen: moment(day),
    });
  }
  seen.sort((a, b) => b.views - a.views || a.lastSeen.daysAgo - b.lastSeen.daysAgo);

  return {
    activeDays,
    likes: sortedLikes,
    comments,
    strongActions,
    postsSeen: { example: true, reason: 'needs_post_views', value: seen },
  };
}
