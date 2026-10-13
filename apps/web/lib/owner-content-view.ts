import {
  type ContentItem,
  type ContentKind,
  type ContentWho,
  type EngagementBand,
  ownerContent,
  ownerContentIncludes,
  ownerContentInteractorIncludes,
  ownerContentItems,
} from '@rede-social/module-dashboard/fixtures';
import { ENGAGEMENT_BAND_ORDER } from '@rede-social/module-dashboard/ui';
import { ownerAreaHref } from './dashboard-preview';
import {
  OWNER_BAND_SLUGS,
  OWNER_MEMBER_LISTS,
  type OwnerMemberListSlug,
  ownerInsightAnchor,
} from './owner-band-scope';

/*
 * Kept apart from dashboard-preview.ts on purpose (as owner-band-scope.ts): proxy.ts imports that
 * file and must never pull the fixtures in. This module imports it, never the reverse.
 */

type SearchParams = Record<string, string | string[] | undefined>;

/** The three tabs of the Conteúdo area (quick 261013-h51 D-01). */
export type ContentTab = 'overview' | 'types' | 'posts';

/** The six numbers of Visão geral, each opening its list (D-02). */
export type ContentNumber = 'posts' | 'interactions' | 'rate' | 'members' | 'views' | 'reach';

/**
 * Where the Conteúdo area stands in its cascade (D-01): the tab; on Visão geral, the number whose
 * list is open or the band of "Quem interage" that is open; the type opened under Por tipo; the
 * publication; who did one of its numbers; the member opened from a list (a publication's people,
 * the interactors or a band) and the list behind one of the member's insight numbers. Each level is
 * only ever set with the levels above it.
 */
export interface OwnerContentView {
  tab: ContentTab;
  number: ContentNumber | null;
  band: EngagementBand | null;
  kind: ContentKind | null;
  postId: string | null;
  who: ContentWho | null;
  memberId: string | null;
  list: OwnerMemberListSlug | null;
}

/** `?vista=` per tab; Visão geral has none. */
const TAB_SLUGS = { types: 'tipos', posts: 'publicacoes' } as const;

/** The `?numero=` slug of each overview number (D-02). */
export const CONTENT_NUMBER_SLUGS: Readonly<Record<ContentNumber, string>> = {
  posts: 'publicacoes',
  interactions: 'interacoes',
  rate: 'taxa',
  members: 'membros',
  views: 'visualizacoes',
  reach: 'alcance',
};

/** The `?tipo=` slug of each kind (D-03). */
export const CONTENT_KIND_SLUGS: Readonly<Record<ContentKind, string>> = {
  video: 'video',
  photo: 'foto',
  carousel: 'carrossel',
  text: 'texto',
  link: 'link',
  story: 'story',
};

/** The `?quem=` slug of each interaction: there is no views or reach value (P3). */
export const CONTENT_WHO_SLUGS: Readonly<Record<ContentWho, string>> = {
  likes: 'curtidas',
  comments: 'comentarios',
  saves: 'salvamentos',
  shares: 'compartilhamentos',
};

/** The id of a publication card (or attention row): Voltar from its detail lands on it. */
export function contentPostAnchor(postId: string): string {
  return `post-${postId}`;
}

/** The id of a type card: Voltar from an opened type lands on it. */
export function contentKindAnchor(kind: ContentKind): string {
  return `tipo-${CONTENT_KIND_SLUGS[kind]}`;
}

/** The id of an interaction number on the detail: Voltar from its people lands on it. */
export function contentWhoAnchor(who: ContentWho): string {
  return `quem-${CONTENT_WHO_SLUGS[who]}`;
}

/** The id of a member card in a people list: Voltar from the insights lands on it. */
export function contentMemberAnchor(memberId: string): string {
  return `membro-${memberId}`;
}

/** The id of an overview number: Voltar from its list lands on it. */
export function contentNumberAnchor(number: ContentNumber): string {
  return `numero-${CONTENT_NUMBER_SLUGS[number]}`;
}

/** A query value only when it is a single string, exactly one of `allowed`. */
function pick<T extends string>(raw: string | string[] | undefined, allowed: readonly T[]) {
  return typeof raw === 'string' ? allowed.find((value) => value === raw) : undefined;
}

/** The key whose slug the query names exactly, else undefined. */
function bySlug<K extends string>(
  raw: string | string[] | undefined,
  slugs: Readonly<Record<K, string>>,
): K | undefined {
  if (typeof raw !== 'string') return undefined;
  return (Object.keys(slugs) as K[]).find((key) => slugs[key] === raw);
}

const ITEM_IDS: readonly string[] = ownerContentItems.map((item) => item.id);

function itemOf(id: string): ContentItem {
  const item = ownerContentItems.find((row) => row.id === id);
  if (!item) throw new Error(`no content item ${id}`);
  return item;
}

/** The band of "Quem interage" the query opens: one with interactors (em risco and inativos have none). */
function parseBand(params: SearchParams): EngagementBand | null {
  const raw = params.faixa;
  if (typeof raw !== 'string') return null;
  const band = ENGAGEMENT_BAND_ORDER.find((row) => OWNER_BAND_SLUGS[row] === raw);
  return band && ownerContent.interactorsByBand[band] > 0 ? band : null;
}

/** The publication the query names, when the opened list holds it. */
function parsePost(
  params: SearchParams,
  view: Pick<OwnerContentView, 'tab' | 'number' | 'band' | 'kind'>,
): string | null {
  const id = pick(params.post, ITEM_IDS);
  if (!id) return null;
  const item = itemOf(id);
  if (view.tab === 'types') return view.kind !== null && item.kind === view.kind ? id : null;
  // The interactors and a band list people, not publications.
  if (view.number === 'members' || view.band !== null) return null;
  // Publicações and Visão geral list the 61 feed posts; stories live under Por tipo only (PD-1).
  return item.kind === 'story' ? null : id;
}

/** The member the query names, when the opened list holds them (no names read here). */
function parseMember(
  params: SearchParams,
  view: Pick<OwnerContentView, 'number' | 'band' | 'postId' | 'who'>,
): string | null {
  const id = typeof params.membro === 'string' ? params.membro : undefined;
  if (!id) return null;
  if (view.postId) return view.who && ownerContentIncludes(view.postId, view.who, id) ? id : null;
  if (view.number === 'members') return ownerContentInteractorIncludes(null, id) ? id : null;
  if (view.band) return ownerContentInteractorIncludes(view.band, id) ? id : null;
  return null;
}

/**
 * The view the query asks for (untrusted), read level by level; an invalid value at any level falls
 * to the level above, never to an error (D-01):
 * 1. `vista` is `tipos` or `publicacoes`, else Visão geral.
 * 2. On Visão geral, `numero` is one of CONTENT_NUMBER_SLUGS; else `faixa` opens a band of "Quem
 *    interage" that has interactors (em risco and inativos never do).
 * 3. `tipo` (Por tipo only) is one of CONTENT_KIND_SLUGS.
 * 4. `post` is a publication of the opened list: of the opened type under Por tipo (a story only
 *    there), any feed post under Publicações, Visão geral and its numbers of publications; none
 *    under the interactors or a band.
 * 5. `quem` is one of CONTENT_WHO_SLUGS, only with a post that has that number (a story has no
 *    saves). There is no views or reach value: those never open people (P3).
 * 6. `membro` must be in the opened list: the post's people (`ownerContentIncludes`), the
 *    interactors or that band's interactors (`ownerContentInteractorIncludes`).
 * 7. `lista` is one of OWNER_MEMBER_LISTS, only with a member.
 * Only allow-listed constants ever reach markup or URLs.
 */
export function parseOwnerContentView(params: SearchParams): OwnerContentView {
  const tab = bySlug(params.vista, TAB_SLUGS) ?? 'overview';
  const number = tab === 'overview' ? (bySlug(params.numero, CONTENT_NUMBER_SLUGS) ?? null) : null;
  const band = tab === 'overview' && number === null ? parseBand(params) : null;
  const kind = tab === 'types' ? (bySlug(params.tipo, CONTENT_KIND_SLUGS) ?? null) : null;
  const postId = parsePost(params, { tab, number, band, kind });
  const rawWho = postId ? bySlug(params.quem, CONTENT_WHO_SLUGS) : undefined;
  const who =
    postId && rawWho && !(rawWho === 'saves' && itemOf(postId).saves === null) ? rawWho : null;
  const memberId = parseMember(params, { number, band, postId, who });
  const list = memberId ? (pick(params.lista, OWNER_MEMBER_LISTS) ?? null) : null;
  return { tab, number, band, kind, postId, who, memberId, list };
}

/**
 * The link to a cascade view: the area, then `vista`, `numero`, `faixa`, `tipo`, `post`, `quem`,
 * `membro` and `lista` in that order.
 */
export function ownerContentHref(view: OwnerContentView): string {
  let query = '';
  if (view.tab !== 'overview') query += `&vista=${TAB_SLUGS[view.tab]}`;
  if (view.number) query += `&numero=${CONTENT_NUMBER_SLUGS[view.number]}`;
  if (view.band) query += `&faixa=${OWNER_BAND_SLUGS[view.band]}`;
  if (view.kind) query += `&tipo=${CONTENT_KIND_SLUGS[view.kind]}`;
  if (view.postId) query += `&post=${view.postId}`;
  if (view.who) query += `&quem=${CONTENT_WHO_SLUGS[view.who]}`;
  if (view.memberId) query += `&membro=${view.memberId}`;
  if (view.list) query += `&lista=${view.list}`;
  return `${ownerAreaHref('conteudo')}${query}`;
}

/**
 * "Voltar" one level up (D-01): the parent view's link landing on what was closed (the insight
 * number, the member card, the interaction number, the publication card, the type card, the overview
 * number). Null on a tab screen (an opened band and an opened type are tab screens only when nothing
 * deeper is open; an opened type still goes back to the six types).
 */
export function contentBackHref(view: OwnerContentView): string | null {
  if (view.list) {
    return `${ownerContentHref({ ...view, list: null })}#${ownerInsightAnchor(view.list)}`;
  }
  if (view.memberId) {
    return `${ownerContentHref({ ...view, memberId: null })}#${contentMemberAnchor(view.memberId)}`;
  }
  if (view.who) {
    return `${ownerContentHref({ ...view, who: null })}#${contentWhoAnchor(view.who)}`;
  }
  if (view.postId) {
    return `${ownerContentHref({ ...view, postId: null })}#${contentPostAnchor(view.postId)}`;
  }
  if (view.kind) {
    return `${ownerContentHref({ ...view, kind: null })}#${contentKindAnchor(view.kind)}`;
  }
  if (view.number) {
    return `${ownerContentHref({ ...view, number: null })}#${contentNumberAnchor(view.number)}`;
  }
  return null;
}

/*
 * The cover takes the ratio the feed draws the media at (PD-2). The feed's own helpers live in client
 * files a server component cannot call, so their constants are repeated here:
 * apps/web/components/media/FeedVideo.tsx:33-46 (a video's own ratio clamped to [9:16, 1.91], 4:5
 * until the size is known) and packages/modules/feed/ui/PostMedia.tsx:97-115 (a gallery's first
 * image clamped to [4:5, 1.91], square without a size). A text post draws no media frame
 * (PostMedia.tsx:285-288); the link card is `aspect-video`; a story fills the 9:16 screen.
 */
const VIDEO_RANGE = [9 / 16, 1.91] as const;
const VIDEO_FALLBACK = 4 / 5;
const GALLERY_RANGE = [4 / 5, 1.91] as const;
const GALLERY_FALLBACK = 1;
const LINK_RATIO = 16 / 9;
const STORY_RATIO = 9 / 16;

function clampRatio(
  media: ContentItem['media'],
  [min, max]: readonly [number, number],
  fallback: number,
): number {
  if (!media || media.width <= 0 || media.height <= 0) return fallback;
  return Math.min(max, Math.max(min, media.width / media.height));
}

/** width / height of a publication's cover, or null when it has none (text). */
export function contentCoverRatio(item: Pick<ContentItem, 'kind' | 'media'>): number | null {
  switch (item.kind) {
    case 'video':
      return clampRatio(item.media, VIDEO_RANGE, VIDEO_FALLBACK);
    case 'photo':
    case 'carousel':
      return clampRatio(item.media, GALLERY_RANGE, GALLERY_FALLBACK);
    case 'link':
      return LINK_RATIO;
    case 'story':
      return STORY_RATIO;
    default:
      return null;
  }
}

/** A tab screen with nothing open below it. */
export function contentTabView(tab: ContentTab): OwnerContentView {
  return {
    tab,
    number: null,
    band: null,
    kind: null,
    postId: null,
    who: null,
    memberId: null,
    list: null,
  };
}
