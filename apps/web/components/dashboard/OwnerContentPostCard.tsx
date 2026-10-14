import {
  type ContentItem,
  OWNER_BAND_LIST_LIMIT,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import { Card } from '@rede-social/ui';
import {
  Bookmark,
  ChevronRight,
  Heart,
  type LucideIcon,
  MessageCircle,
  Play,
  Send,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { PREVIEW_NOTE_ID } from '@/lib/dashboard-preview';
import { contentCoverRatio, contentPostAnchor } from '@/lib/owner-content-view';
import { Linked } from './BandScopeCards';
import { COVER_ICON, CoverThumb, coverStyle } from './CoverThumb';
import { ExamplePill } from './ExamplePill';
import {
  communityLabel,
  type DashboardT,
  exampleBadge,
  formatClock,
  formatCount,
  formatDayMonth,
} from './format';
import { PreviewAction } from './PanelSection';

const KEY = 'tenantOwner.content';

/** How long a comment has waited: "18 h" under two days, else whole days ("2 dias"). */
export function contentAgeText(t: DashboardT, hours: number): string {
  return hours < 48
    ? t(`${KEY}.overview.age.hours`, { count: hours })
    : t(`${KEY}.overview.age.days`, { count: Math.floor(hours / 24) });
}

/** The kind's name ("Vídeo"). */
export function contentKindLabel(t: DashboardT, kind: ContentItem['kind']): string {
  return t(`${KEY}.kinds.${kind}`);
}

/** `08/10 · Geral · Vídeo`, or `09/10 · Story` (a story has no community). */
export function contentMeta(t: DashboardT, item: ContentItem): string {
  const date = formatDayMonth(item.date);
  const kind = contentKindLabel(t, item.kind);
  if (item.communityId === null) return t(`${KEY}.card.metaStory`, { date, kind });
  const community = tenantOwnerPanel.byCommunity.find((row) => row.id === item.communityId);
  if (!community) throw new Error(`no community ${item.communityId}`);
  return t(`${KEY}.card.meta`, { date, community: communityLabel(t, community), kind });
}

/**
 * The publication's media at the ratio the feed draws it (PD-2, `contentCoverRatio`), on the detail:
 * no photo in the preview, so the `--brand-gradient` fallback with the kind's icon (and a video's
 * length), at the publication's tone (`coverStyle`, shared with the list thumbnails). Its height is
 * capped by narrowing it, never by changing the ratio, so a 9:16 video does not fill a whole phone
 * screen; the sides are the same gradient darkened, never a grey band (quick 261013-orf E-01). A
 * video or story plays from the round ▶, disabled like every preview action. A text post has none.
 */
export function ContentCover({
  t,
  item,
  maxHeightRem = 20,
}: {
  t: DashboardT;
  item: ContentItem;
  maxHeightRem?: number;
}) {
  const ratio = contentCoverRatio(item);
  if (ratio === null) return null;
  const Icon = COVER_ICON[item.kind];
  const playable = item.kind === 'video' || item.kind === 'story';
  return (
    <div className="relative flex justify-center overflow-hidden" style={coverStyle(item.id)}>
      <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
      <div
        data-testid="content-cover"
        data-ratio={ratio.toFixed(4)}
        className="relative flex items-center justify-center"
        style={{
          aspectRatio: ratio,
          width: `min(100%, ${(maxHeightRem * ratio).toFixed(3)}rem)`,
          ...coverStyle(item.id),
        }}
      >
        {playable ? (
          <button
            type="button"
            disabled
            aria-label={t(`${KEY}.detail.watch`)}
            aria-describedby={PREVIEW_NOTE_ID}
            className="flex size-16 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <Play aria-hidden size={32} />
          </button>
        ) : (
          <Icon aria-hidden size={32} className="opacity-90" />
        )}
        {item.durationSeconds !== null ? (
          <span className="absolute right-2 bottom-2 rounded-md bg-black/50 px-1.5 py-0.5 text-xs font-bold tabular-nums text-white">
            {formatClock(t, item.durationSeconds)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** One of the compact card's numbers: its icon, the value and, for screen readers, its name. */
function Count({
  t,
  icon: Icon,
  name,
  value,
}: {
  t: DashboardT;
  icon: LucideIcon;
  name: 'likes' | 'comments' | 'saves' | 'shares';
  value: number;
}) {
  return (
    <span data-count={name} className="inline-flex items-center gap-1">
      <Icon aria-hidden size={14} className="shrink-0 text-text-secondary" />
      {formatCount(value)}
      <span className="sr-only"> {t(`${KEY}.card.compact.${name}`, { count: value })}</span>
    </span>
  );
}

/**
 * One publication as a compact card (D-05, quick 261013-orf E-01): the cover thumbnail at the feed's
 * ratio on the left and, on the right, the caption in two lines, `dd/mm · comunidade · tipo` and the
 * four numbers in one line (a story cannot be saved), then an optional line, with a chevron. The
 * whole card is the link to the detail, where the cover is big; its id lets the detail's "Voltar"
 * land on it. The "exemplo" of saves and shares is said once per list, never per card.
 */
export function ContentPostCard({
  t,
  item,
  href,
  extra,
}: {
  t: DashboardT;
  item: ContentItem;
  /** The detail's link; null = not a link. */
  href: string | null;
  /** A last line under the numbers (a KPI list's metric). */
  extra?: ReactNode;
}) {
  return (
    <div id={contentPostAnchor(item.id)} className="scroll-mt-20">
      <Linked href={href}>
        <Card className="flex items-start gap-3 p-3 transition-colors hover:bg-card-hover">
          <CoverThumb
            t={t}
            kind={item.kind}
            seed={item.id}
            durationSeconds={item.durationSeconds}
            variant="card"
            ratio={contentCoverRatio(item)}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 [overflow-wrap:anywhere]">
            <span className="line-clamp-2 text-sm font-bold leading-snug text-text">
              {item.excerpt}
            </span>
            <span className="text-xs text-text-secondary">{contentMeta(t, item)}</span>
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold tabular-nums text-text">
              <Count t={t} icon={Heart} name="likes" value={item.likes} />
              <Count t={t} icon={MessageCircle} name="comments" value={item.comments} />
              {item.saves === null ? null : (
                <Count t={t} icon={Bookmark} name="saves" value={item.saves.value} />
              )}
              <Count t={t} icon={Send} name="shares" value={item.shares.value} />
            </p>
            {extra}
          </div>
          {href === null ? null : (
            <ChevronRight aria-hidden size={18} className="shrink-0 self-center text-brand" />
          )}
        </Card>
      </Linked>
    </div>
  );
}

/** Whether any listed saves or shares are examples: the list says so once (D-05). */
export function savesSharesExample(items: readonly ContentItem[]): boolean {
  return items.some((item) => item.saves?.example === true || item.shares.example);
}

/** The one line saying a list's saves and shares are examples, with its pill. */
export function SavesSharesNote({ t, text }: { t: DashboardT; text?: string }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
      {text ?? t(`${KEY}.list.exampleNote`)}
      <ExamplePill text={exampleBadge(t, { example: true })} />
    </p>
  );
}

/**
 * A list of publication cards (D-04): one example line when its saves or shares are examples, the
 * first OWNER_BAND_LIST_LIMIT cards in the given order, then how many more with a disabled "Ver
 * todas" (the Membros pattern), or one sentence when there are none.
 */
export function ContentPostList({
  t,
  items,
  hrefOf,
  extraOf,
  exampleNote,
}: {
  t: DashboardT;
  items: readonly ContentItem[];
  hrefOf: (item: ContentItem) => string;
  extraOf?: (item: ContentItem) => ReactNode;
  /** Replaces the saves-and-shares line when the list's own metric is an example too. */
  exampleNote?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-text-secondary">{t(`${KEY}.list.empty`)}</p>;
  }
  const shown = items.slice(0, OWNER_BAND_LIST_LIMIT);
  const more = items.length - shown.length;
  return (
    <>
      {savesSharesExample(shown) || exampleNote ? (
        <SavesSharesNote t={t} text={exampleNote} />
      ) : null}
      <ul className="flex flex-col gap-3">
        {shown.map((item) => (
          <li key={item.id} className="min-w-0">
            <ContentPostCard t={t} item={item} href={hrefOf(item)} extra={extraOf?.(item)} />
          </li>
        ))}
      </ul>
      {more > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">{t(`${KEY}.list.more`, { count: more })}</p>
          <PreviewAction>{t(`${KEY}.list.seeAll`)}</PreviewAction>
        </div>
      ) : null}
    </>
  );
}
