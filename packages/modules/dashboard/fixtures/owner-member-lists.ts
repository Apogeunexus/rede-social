import { daysSince, type OwnerRosterMember } from './owner-members';
import { OWNER_POST_UNANSWERED, type OwnerPost, ownerPostTable } from './owner-posts';
import type { RelativeMoment } from './platform-panels';
import type { EngagementBand, ReportValue } from './shared';

/**
 * The lists behind one member's insight numbers (quick 261012-tru D-07), for the level-4 Membros
 * area: which posts they liked and commented on, their strong actions, their active days and the
 * posts they saw in the last 30 days. RAW DATA (MOD-02), built purely from the numbers the insights
 * already computed, so each list's length IS its KPI and no row contradicts another.
 *
 * Which post a member liked or commented on is assigned across the whole roster at once
 * (`assignRosterInteractions`, quick 261013-orf E-03.1), so every Conteúdo "Quem curtiu/comentou"
 * list with a number has people, and a member's comment and a post's commenter are one fact.
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
  /** Most recent first; one comment per post, each on an active day after the post was published. */
  comments: OwnerLikedPost[];
  /** Comments, check-ins and the VIP order, most recent first. */
  strongActions: OwnerStrongAction[];
  /** Example: no post views are recorded yet. Distinct posts, most viewed first. */
  postsSeen: ReportValue<OwnerSeenPost[]>;
}

/** One like or comment of the roster: the post and the day (days ago). */
export interface RosterInteraction {
  postId: string;
  daysAgo: number;
}

/** What `assignRosterInteractions` needs of one active roster member. */
export interface RosterInteractionBase {
  row: OwnerRosterMember;
  /** The days ago of each active day of the last 30. */
  days: readonly number[];
  /** The member's 30-day likes (the KPI), all of which must be placed. */
  likes: number;
}

/** Per member id: the posts liked and commented on, each with its day. */
export type RosterInteractions = ReadonlyMap<
  string,
  { likes: readonly RosterInteraction[]; comments: readonly RosterInteraction[] }
>;

/** A Conteúdo people list shows at most this many cards; the assignment covers that much. */
const COVERAGE = 10;

/** Who comments first on a post: the most engaged bands, then the members with fewer comments. */
const COMMENT_BAND_RANK: Partial<Record<EngagementBand, number>> = {
  superfan: 0,
  engaged: 1,
  new: 2,
  occasional: 3,
};

interface MemberState {
  base: RosterInteractionBase;
  index: number;
  /** Active days, most recent first. */
  days: number[];
  budget: number;
  /** Likes per active day. */
  likedOn: Map<number, number>;
  liked: Map<string, number>;
  comments: RosterInteraction[];
}

function unlikedDays(state: MemberState): number[] {
  return state.days.filter((day) => !state.likedOn.has(day));
}

function like(state: MemberState, postId: string, day: number, likers: Map<string, number>): void {
  state.liked.set(postId, day);
  state.likedOn.set(day, (state.likedOn.get(day) ?? 0) + 1);
  state.budget -= 1;
  likers.set(postId, (likers.get(postId) ?? 0) + 1);
}

/**
 * Assigns the roster's likes and comments to the 61 posts, deterministically and all at once, so
 * every Conteúdo people list with a number has people (quick 261013-orf E-03.1):
 *
 * - A member is eligible for a post when they reach its community and have an active day no later
 *   than the post's age.
 * - Likes, newest post first: each post gets min(its likes, 10, eligible members) likers, taken from
 *   the eligible members who can still afford a like without leaving an active day bare (most likes
 *   left first, then roster order), on their most recent unliked day by then, else their most recent
 *   active day by then. Then every active day still without a like gets one (the newest unused post
 *   published by then), and the rest of each member's likes go round-robin from the most recent day.
 *   Each member places exactly their likes KPI, and no post gets more likers than its likes.
 * - Comments, newest post first: each post gets min(its comments, 10, members eligible by the comment
 *   day limit) commenters. The limit is the post's age, or, for a post whose oldest unanswered
 *   comment waited 48 h or more, that many whole days ago — and one commenter comments exactly then.
 *   Then the members who liked the post by then (on the day of their like), then the other eligible
 *   ones (on their most recent active day by then); superfãs, engajados, novos and ocasionais in that
 *   order, fewer comments first, then roster order. One comment per member per post.
 *
 * The posts published today and yesterday reach fewer than 10 active members; their lists hold every
 * member who could act.
 */
export function assignRosterInteractions(
  bases: readonly RosterInteractionBase[],
): RosterInteractions {
  const posts = ownerPostTable
    .map((post, order) => ({ post, order, age: daysSince(post.date) }))
    .sort((a, b) => a.age - b.age || a.order - b.order);
  const states: MemberState[] = bases.map((base, index) => ({
    base,
    index,
    days: [...base.days].sort((a, b) => a - b),
    budget: base.likes,
    likedOn: new Map(),
    liked: new Map(),
    comments: [],
  }));
  const likers = new Map<string, number>();
  const reaches = (state: MemberState, post: OwnerPost) =>
    state.base.row.communities[post.communityId] !== undefined;
  const activeBy = (state: MemberState, limit: number) => state.days.some((day) => day <= limit);

  for (const { post, age } of posts) {
    const pool = states.filter((state) => reaches(state, post) && activeBy(state, age));
    const need = Math.min(post.likes, COVERAGE, pool.length);
    for (let count = 0; count < need; count += 1) {
      const pick = pool
        .filter((state) => {
          if (state.liked.has(post.id) || state.budget <= 0) return false;
          const bare = unlikedDays(state);
          return state.budget > bare.length || bare.some((day) => day <= age);
        })
        .sort((a, b) => b.budget - a.budget || a.index - b.index)[0];
      if (!pick) break;
      const day =
        unlikedDays(pick).find((candidate) => candidate <= age) ??
        pick.days.find((candidate) => candidate <= age);
      if (day === undefined) throw new Error(`${pick.base.row.id} has no day to like ${post.id}`);
      like(pick, post.id, day, likers);
    }
  }

  for (const state of states) {
    const slots = unlikedDays(state);
    for (let k = 0; slots.length < state.budget; k += 1) {
      const day = state.days[k % state.days.length];
      if (day === undefined) break;
      slots.push(day);
    }
    if (slots.length !== state.budget) {
      throw new Error(`${state.base.row.id} has likes left and no active day`);
    }
    for (const day of slots.sort((a, b) => b - a)) {
      const next = posts.find(
        ({ post, age }) =>
          age >= day &&
          reaches(state, post) &&
          !state.liked.has(post.id) &&
          (likers.get(post.id) ?? 0) < post.likes,
      );
      if (!next) throw new Error(`no post left for ${state.base.row.id} to like ${day} days ago`);
      like(state, next.post.id, day, likers);
    }
  }

  const rank = (a: MemberState, b: MemberState) =>
    (COMMENT_BAND_RANK[a.base.row.band] ?? 9) - (COMMENT_BAND_RANK[b.base.row.band] ?? 9) ||
    a.comments.length - b.comments.length ||
    a.index - b.index;
  for (const { post, age } of posts) {
    const waited = OWNER_POST_UNANSWERED[post.id]?.[1] ?? 0;
    const limit = waited >= 48 ? Math.floor(waited / 24) : age;
    const pool = states.filter((state) => reaches(state, post) && activeBy(state, limit));
    const need = Math.min(post.comments, COVERAGE, pool.length);
    const chosen: { state: MemberState; day: number }[] = [];
    const open = () => pool.filter((state) => !chosen.some((entry) => entry.state === state));
    if (waited >= 48) {
      const oldest = pool.filter((state) => state.days.includes(limit)).sort(rank)[0];
      if (oldest) chosen.push({ state: oldest, day: limit });
    }
    for (const state of open()
      .filter((candidate) => (candidate.liked.get(post.id) ?? Number.POSITIVE_INFINITY) <= limit)
      .sort(rank)) {
      if (chosen.length >= need) break;
      chosen.push({ state, day: state.liked.get(post.id) ?? limit });
    }
    for (const state of open().sort(rank)) {
      if (chosen.length >= need) break;
      const day = state.days.find((candidate) => candidate <= limit);
      if (day !== undefined) chosen.push({ state, day });
    }
    for (const { state, day } of chosen.slice(0, need)) {
      state.comments.push({ postId: post.id, daysAgo: day });
    }
  }

  return new Map(
    states.map((state) => [
      state.base.row.id,
      {
        likes: [...state.liked].map(([postId, daysAgo]) => ({ postId, daysAgo })),
        comments: state.comments,
      },
    ]),
  );
}

export interface OwnerMemberListsInput {
  row: OwnerRosterMember;
  /** The member's slot in their band (0-11). */
  j: number;
  /** The days ago of each active day of the last 30. */
  activeDays: readonly number[];
  /** The member's likes and comments, from `assignRosterInteractions`. */
  likes: readonly RosterInteraction[];
  comments: readonly RosterInteraction[];
  /** The past events the member attended, with their days ago. */
  attended: readonly { eventId: string; daysAgo: number }[];
  /** The order of the last 30 days, or null. */
  order: { productId: string; cents: number; daysAgo: number } | null;
}

/** Most recent first, then the original order (a stable sort keeps ties as built). */
function byRecency<T extends { when: RelativeMoment }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => a.when.daysAgo - b.when.daysAgo);
}

const POSTS = new Map(ownerPostTable.map((post) => [post.id, post]));

function postOf(id: string): OwnerPost {
  const post = POSTS.get(id);
  if (!post) throw new Error(`no post ${id}`);
  return post;
}

export function buildOwnerMemberLists(input: OwnerMemberListsInput): OwnerMemberLists {
  const { row, j, attended, order } = input;
  const days = [...input.activeDays].sort((a, b) => a - b);
  const last = row.lastActive;
  const moment = (daysAgo: number): RelativeMoment =>
    daysAgo === last.daysAgo ? { ...last } : { daysAgo };

  const pool = ownerPostTable.filter((post) => row.communities[post.communityId]);
  const age = new Map(pool.map((post) => [post.id, daysSince(post.date)]));
  const ageOf = (post: OwnerPost) => age.get(post.id) ?? Number.NaN;

  // Ties keep the age order (newest post first), as the old per-member build did.
  const toRows = (rows: readonly RosterInteraction[]) =>
    byRecency(
      rows
        .map((entry) => ({ post: postOf(entry.postId), when: moment(entry.daysAgo) }))
        .sort((a, b) => ageOf(a.post) - ageOf(b.post)),
    );
  const likes = toRows(input.likes);
  const comments = toRows(input.comments);

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
    likes.filter((entry) => entry.when.daysAgo === day).length +
    comments.filter((comment) => comment.when.daysAgo === day).length +
    attended.filter((event) => event.daysAgo === day).length +
    (order?.daysAgo === day ? 1 : 0);
  const activeDays = days.map((day) => ({ when: moment(day), actions: actionsOn(day) }));

  // Every liked or commented post was seen, more than once; then per active day the newest unused
  // post of then.
  const used = new Set<string>();
  const seen: OwnerSeenPost[] = [];
  for (const [k, entry] of byRecency([...likes, ...comments]).entries()) {
    if (used.has(entry.post.id)) continue;
    used.add(entry.post.id);
    seen.push({
      post: entry.post,
      views: 2 + ((k + j) % 3),
      seconds: 20 + 10 * ((k + j) % 6),
      lastSeen: entry.when,
    });
  }
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
    likes,
    comments,
    strongActions,
    postsSeen: { example: true, reason: 'needs_post_views', value: seen },
  };
}
