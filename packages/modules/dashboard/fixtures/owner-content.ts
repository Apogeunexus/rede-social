import { ownerMemberInsights } from './owner-member-insights';
import {
  daysBefore,
  daysSince,
  type OwnerBandMember,
  type OwnerRosterMember,
  ownerBandRoster,
  PREVIEW_TODAY,
} from './owner-members';
import { type OwnerPostMedia, ownerPostTable } from './owner-posts';
import type { RelativeMoment } from './platform-panels';
import type { EngagementBand, ExampleValue, NotMeasuredReason, ReportValue } from './shared';
import { tenantOwnerPanel } from './tenant-owner';

/**
 * The level-4 Conteúdo area (quick 261013-h51): every publication of the last 30 days as one content
 * item — the 61 feed posts of `owner-posts.ts`, newest first, then the 16 stories — and the people
 * behind its numbers. RAW DATA (MOD-02): ids, kinds, ISO dates, counts and media sizes, never a
 * sentence; no clock and no randomness, so every render reads the same.
 *
 * Sources. The kind follows SPEC §2.3: a video is `media_kind = 'video'`; a gallery with one image is
 * a photo and with two or more a carousel; a post with no media is text, or a link when it has a link
 * preview; a story is a `stories` row. Likes and comments are measured (`feed_posts.like_count` /
 * `comment_count`, `stories.like_count` / `comment_count`), and so are a story's unique viewers
 * (`story_views`, aggregate only). A post's views and reach, its saves and shares, the video
 * retention, the carousel's last card, the link clicks and the story taps are EXAMPLES: no table
 * records them yet, each carries its reason and the screen marks it "exemplo". The post reach adds up
 * to 61 × `reach.value.perPost` (612): VIP posts reach at most the VIP's 186 members, except the
 * 06/10 carousel that was the VIP's shop window.
 *
 * People (P1). Who liked or commented on a post is the inverse of every roster member's insights
 * lists (`ownerMemberInsights(id).lists.likes` / `comments`, same moment), so "a member liked this
 * post" and "this post's likers" are one fact. Story likers and repliers are picked from the active
 * bands' roster members who had joined and had not acted after the story's day for the last time
 * (the insights count feed actions only, so nothing contradicts them). Who saved or shared is an
 * example: a subset of the item's likers, never longer than the value. The roster is a sample of the
 * base, so a list holds fewer names than its number; the screen says how many more. Visible to the
 * client's management only, never a comment's text.
 */

export type ContentKind = 'video' | 'photo' | 'carousel' | 'text' | 'link' | 'story';

/** The six kinds in the order Por tipo shows them (D-03). */
export const CONTENT_KIND_ORDER: readonly ContentKind[] = [
  'video',
  'photo',
  'carousel',
  'text',
  'link',
  'story',
];

/** The interactions whose people a publication lists (views and reach never do: P3). */
export type ContentWho = 'likes' | 'comments' | 'saves' | 'shares';

export interface ContentItem {
  /** `op-NN` for a feed post, `os-NN` for a story. */
  id: string;
  kind: ContentKind;
  /** The post's community; null for a story. */
  communityId: string | null;
  /** ISO date it was published. */
  date: string;
  excerpt: string;
  likes: number;
  /** Comments on a post, replies to a story. */
  comments: number;
  /** Example; null for a story (a story cannot be saved). */
  saves: ReportValue<number> | null;
  /** Example. */
  shares: ReportValue<number>;
  /** Example for a post; measured (`story_views`) for a story. */
  views: ReportValue<number>;
  /** Unique members reached: example for a post; measured unique viewers for a story. */
  reach: ReportValue<number>;
  /** The video's or first image's size; a story is a full-screen 1080×1920; null for text and link. */
  media: OwnerPostMedia | null;
  durationSeconds: number | null;
  cards: number | null;
}

/** One person behind a number: the member card's fields, the whole-base band and when they did it. */
export interface ContentPerson extends OwnerBandMember {
  band: EngagementBand;
  when: RelativeMoment;
}

export interface ContentPeople {
  /** The roster members who did it, most recent first. */
  people: readonly ContentPerson[];
  /** The item's own number (the list holds the roster sample of it). */
  total: number;
  /** Whether the number (and so who did it) is an example. */
  example: boolean;
}

function example(reason: NotMeasuredReason, value: number): ExampleValue<number> {
  return { example: true, reason, value };
}

/** `[reach, views, saves, shares]` per feed post: examples (no table records them yet). */
const POST_EXAMPLES: Readonly<Record<string, readonly [number, number, number, number]>> = {
  'op-01': [66, 99, 3, 1],
  'op-02': [687, 1099, 3, 1],
  'op-03': [66, 112, 2, 1],
  'op-04': [726, 1307, 2, 1],
  'op-05': [687, 1305, 2, 1],
  'op-06': [1000, 1500, 11, 3],
  'op-07': [838, 1341, 6, 2],
  'op-08': [126, 214, 14, 4],
  'op-09': [661, 1190, 4, 1],
  'op-10': [157, 298, 15, 6],
  'op-11': [1100, 1650, 18, 7],
  'op-12': [89, 142, 5, 2],
  'op-13': [870, 1479, 4, 1],
  'op-14': [935, 1683, 5, 3],
  'op-15': [402, 764, 15, 4],
  'op-16': [838, 1257, 3, 1],
  'op-17': [1088, 1741, 14, 4],
  'op-18': [117, 199, 6, 3],
  'op-19': [935, 1683, 11, 2],
  'op-20': [167, 317, 16, 6],
  'op-21': [700, 1050, 5, 1],
  'op-22': [713, 1141, 6, 1],
  'op-23': [86, 146, 9, 2],
  'op-24': [903, 1625, 4, 1],
  'op-25': [903, 1716, 9, 2],
  'op-26': [152, 228, 14, 6],
  'op-27': [1088, 1741, 14, 4],
  'op-28': [1100, 1870, 16, 6],
  'op-29': [1033, 1859, 12, 3],
  'op-30': [84, 160, 4, 1],
  'op-31': [838, 1257, 3, 1],
  'op-32': [162, 259, 15, 6],
  'op-33': [82, 139, 4, 1],
  'op-34': [661, 1190, 4, 1],
  'op-35': [883, 1678, 4, 1],
  'op-36': [1098, 1647, 11, 5],
  'op-37': [182, 291, 18, 7],
  'op-38': [935, 1590, 8, 3],
  'op-39': [107, 193, 5, 3],
  'op-40': [1000, 1900, 6, 3],
  'op-41': [1100, 1650, 20, 8],
  'op-42': [146, 234, 13, 5],
  'op-43': [870, 1479, 4, 1],
  'op-44': [81, 146, 4, 1],
  'op-45': [831, 1579, 3, 1],
  'op-46': [740, 1110, 6, 1],
  'op-47': [903, 1445, 9, 2],
  'op-48': [60, 102, 3, 1],
  'op-49': [805, 1449, 3, 1],
  'op-50': [138, 262, 12, 5],
  'op-51': [1065, 1598, 7, 3],
  'op-52': [870, 1392, 7, 3],
  'op-53': [857, 1457, 3, 1],
  'op-54': [128, 230, 14, 4],
  'op-55': [1100, 2090, 21, 8],
  'op-56': [82, 123, 4, 1],
  'op-57': [596, 954, 2, 0],
  'op-58': [726, 1234, 2, 1],
  'op-59': [138, 248, 12, 5],
  'op-60': [935, 1777, 4, 1],
  'op-61': [896, 1344, 4, 1],
};

/**
 * `[days ago, excerpt, likes, replies, unique viewers, views, shares]`, newest first: 16 stories
 * (`stories.count`), 412 likes, 63 replies and 16 × 296 unique viewers (`averageUniqueViewers`).
 */
const STORY_ROWS: readonly (readonly [number, string, number, number, number, number, number])[] = [
  [0, 'Bom dia: a rotina de hoje em 15 segundos', 18, 2, 214, 257, 1],
  [3, 'Enquete: encontro presencial ou online?', 34, 17, 341, 409, 6],
  [4, 'Bastidores da gravação da aula 6', 26, 6, 305, 366, 3],
  [6, 'Caixinha de perguntas sobre a rotina da manhã', 22, 3, 288, 346, 2],
  [7, 'Lembrete: live de dúvidas na quinta às 20h', 30, 4, 312, 374, 5],
  [9, 'Contagem regressiva para o encontro mensal', 41, 5, 336, 403, 7],
  [11, 'Quiz: quantos hábitos você mantém hoje?', 20, 3, 270, 324, 2],
  [12, 'Um minuto do workshop de sábado', 24, 4, 296, 355, 3],
  [14, 'Resposta à caixinha: como recomeçar', 28, 2, 301, 361, 4],
  [16, 'Enquete: qual tema na próxima aula aberta?', 19, 6, 284, 341, 1],
  [18, 'Bastidores do estúdio novo', 31, 2, 318, 382, 4],
  [19, 'Dica rápida: a lista de amanhã', 23, 1, 279, 335, 2],
  [21, 'Votação: melhor horário para as lives', 27, 3, 297, 356, 3],
  [23, 'Recado para quem acabou de chegar', 25, 2, 290, 348, 2],
  [25, 'Antes e depois da mesa organizada', 21, 1, 268, 322, 2],
  [27, 'Prévia do material extra da mentoria', 23, 2, 337, 404, 3],
];

const STORY_MEDIA: OwnerPostMedia = { width: 1080, height: 1920 };

function postKind(post: (typeof ownerPostTable)[number]): ContentKind {
  if (post.type === 'gallery') return post.cards === 1 ? 'photo' : 'carousel';
  return post.type;
}

const postItems: ContentItem[] = ownerPostTable.map((post) => {
  const row = POST_EXAMPLES[post.id];
  if (!row) throw new Error(`no example values for ${post.id}`);
  const [reach, views, saves, shares] = row;
  return {
    id: post.id,
    kind: postKind(post),
    communityId: post.communityId,
    date: post.date,
    excerpt: post.excerpt,
    likes: post.likes,
    comments: post.comments,
    saves: example('needs_saves', saves),
    shares: example('needs_shares', shares),
    views: example('needs_post_views', views),
    reach: example('needs_post_views', reach),
    media: post.media,
    durationSeconds: post.durationSeconds,
    cards: post.cards,
  };
});

const storyItems: ContentItem[] = STORY_ROWS.map(
  ([daysAgo, excerpt, likes, comments, reach, views, shares], i) => ({
    id: `os-${String(i + 1).padStart(2, '0')}`,
    kind: 'story',
    communityId: null,
    date: daysBefore(PREVIEW_TODAY, daysAgo),
    excerpt,
    likes,
    comments,
    saves: null,
    shares: example('needs_shares', shares),
    views: { example: false, value: views },
    reach: { example: false, value: reach },
    media: STORY_MEDIA,
    durationSeconds: null,
    cards: null,
  }),
);

/** The 61 feed posts newest first, then the 16 stories newest first. */
export const ownerContentItems: readonly ContentItem[] = [...postItems, ...storyItems];

/** One item; an id the fixture does not have is a bug, so it throws. */
export function ownerContentItem(id: string): ContentItem {
  const item = ownerContentItems.find((row) => row.id === id);
  if (!item) throw new Error(`no content item ${id}`);
  return item;
}

/**
 * Each kind's own metric that no count gives (D-03): the video's % watched (the panel's
 * `videoPlayback`), the carousel's share that reached the last card, the link's share that clicked
 * and the story's share that tapped forward — all examples. A photo's saves per post and a text's
 * comment share are computed from the items by the web tier.
 */
export const ownerContentKindMetric = {
  video: tenantOwnerPanel.videoPlayback.watchedPercent,
  carousel: example('needs_gallery_swipes', 48),
  link: example('needs_link_clicks', 14),
  story: example('needs_story_taps', 22),
} as const satisfies Partial<Record<ContentKind, ReportValue<number>>>;

const ACTIVE_BANDS: readonly EngagementBand[] = ['new', 'superfan', 'engaged', 'occasional'];

interface ItemPeople {
  likes: ContentPerson[];
  comments: ContentPerson[];
  saves: ContentPerson[] | null;
  shares: ContentPerson[];
}

function personOf(row: OwnerRosterMember, when: RelativeMoment): ContentPerson {
  const { id, name, memberSince, lastActive, topCommunityId, dailyMinutes, band } = row;
  return { id, name, memberSince, lastActive, topCommunityId, dailyMinutes, band, when };
}

/** Most recent first: fewer days ago, then a later clock reading, then the id. */
function byRecency(a: ContentPerson, b: ContentPerson): number {
  return (
    a.when.daysAgo - b.when.daysAgo ||
    (b.when.time ?? '').localeCompare(a.when.time ?? '') ||
    a.id.localeCompare(b.id)
  );
}

/** `count` rows of `rows`, starting at `offset` and wrapping (a deterministic spread). */
function rotate<T>(rows: readonly T[], offset: number, count: number): T[] {
  if (rows.length === 0) return [];
  return Array.from({ length: Math.min(count, rows.length) }, (_, k) => {
    const row = rows[(offset + k) % rows.length];
    if (row === undefined) throw new Error('rotate out of range');
    return row;
  });
}

/** The likers and repliers of a story: active members who had joined and acted by its day. */
function storyPeople(item: ContentItem, index: number): Pick<ItemPeople, 'likes' | 'comments'> {
  const age = daysSince(item.date);
  const candidates = ownerBandRoster.filter(
    (row) =>
      ACTIVE_BANDS.includes(row.band) &&
      row.lastActive.daysAgo <= age &&
      daysSince(row.memberSince) >= age,
  );
  const when = (row: OwnerRosterMember): RelativeMoment =>
    row.lastActive.daysAgo === age ? { ...row.lastActive } : { daysAgo: age };
  const pick = (offset: number, count: number) =>
    rotate(candidates, offset, count)
      .map((row) => personOf(row, when(row)))
      .sort(byRecency);
  return {
    likes: pick(index * 5, Math.floor(item.likes / 4)),
    comments: pick(index * 5 + 3, Math.floor(item.comments / 2)),
  };
}

/**
 * Every item's people, built once from the roster (exported for the determinism test). Saves and
 * shares take alternate likers (even and odd places), at most the example value.
 */
export function buildOwnerContentPeople(): Map<string, ItemPeople> {
  const posts = new Map<string, { likes: ContentPerson[]; comments: ContentPerson[] }>(
    postItems.map((item) => [item.id, { likes: [], comments: [] }]),
  );
  for (const row of ownerBandRoster) {
    const insights = ownerMemberInsights(row.id);
    if (!insights) throw new Error(`no insights for ${row.id}`);
    for (const like of insights.lists.likes) {
      posts.get(like.post.id)?.likes.push(personOf(row, like.when));
    }
    for (const comment of insights.lists.comments) {
      posts.get(comment.post.id)?.comments.push(personOf(row, comment.when));
    }
  }
  const people = new Map<string, ItemPeople>();
  for (const item of ownerContentItems) {
    const base =
      item.kind === 'story'
        ? storyPeople(item, storyItems.indexOf(item))
        : (posts.get(item.id) ?? { likes: [], comments: [] });
    const likes = [...base.likes].sort(byRecency);
    const comments = [...base.comments].sort(byRecency);
    const every = (rest: number) => likes.filter((_, i) => i % 2 === rest);
    people.set(item.id, {
      likes,
      comments,
      saves: item.saves === null ? null : every(0).slice(0, item.saves.value),
      shares: every(1).slice(0, item.shares.value),
    });
  }
  return people;
}

const PEOPLE = buildOwnerContentPeople();

function peopleOf(item: ContentItem, who: ContentWho): readonly ContentPerson[] | null {
  const entry = PEOPLE.get(item.id);
  if (!entry) throw new Error(`no people for ${item.id}`);
  return entry[who];
}

/**
 * Who did `who` on an item (P1): the roster members, most recent first, the item's own number and
 * whether it is an example. An unknown id, or saves on a story, is a bug, so it throws.
 */
export function ownerContentPeople(itemId: string, who: ContentWho): ContentPeople {
  const item = ownerContentItem(itemId);
  const people = peopleOf(item, who);
  const metric = who === 'saves' ? item.saves : who === 'shares' ? item.shares : null;
  if (people === null || (who === 'saves' && metric === null)) {
    throw new Error(`${itemId} has no ${who}`);
  }
  if (who === 'likes') return { people, total: item.likes, example: false };
  if (who === 'comments') return { people, total: item.comments, example: false };
  return { people, total: metric?.value ?? 0, example: metric?.example ?? false };
}

/**
 * Whether the member is in the item's `who` list: the membership the URL parser checks, so a link can
 * only open a member from the list that holds them (no names read). A story's saves hold nobody.
 */
export function ownerContentIncludes(itemId: string, who: ContentWho, memberId: string): boolean {
  const people = peopleOf(ownerContentItem(itemId), who);
  return people?.some((person) => person.id === memberId) ?? false;
}
