import {
  type ContentItem,
  OWNER_BAND_LIST_LIMIT,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import { Card } from '@rede-social/ui';
import {
  ChevronRight,
  GalleryHorizontal,
  Image as ImageIcon,
  Link2,
  type LucideIcon,
  Play,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { contentCoverRatio, contentPostAnchor } from '@/lib/owner-content-view';
import { Cell, Linked } from './BandScopeCards';
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

const KIND_ICON: Record<ContentItem['kind'], LucideIcon | null> = {
  video: Play,
  photo: ImageIcon,
  carousel: GalleryHorizontal,
  text: null,
  link: Link2,
  story: Play,
};

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
 * The publication's media at the ratio the feed draws it (PD-2, `contentCoverRatio`): no photo in the
 * preview, so the `--brand-gradient` fallback with the kind's icon (and a video's length), as the
 * community and event covers. Its height is capped by narrowing it, never by changing the ratio, so a
 * 9:16 video does not fill a whole phone screen. A text post has no cover.
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
  const Icon = KIND_ICON[item.kind];
  return (
    <div className="flex justify-center bg-bg-tertiary">
      <div
        data-testid="content-cover"
        data-ratio={ratio.toFixed(4)}
        className="relative flex items-center justify-center"
        style={{
          aspectRatio: ratio,
          width: `min(100%, ${(maxHeightRem * ratio).toFixed(3)}rem)`,
          backgroundImage: 'var(--brand-gradient)',
          color: 'var(--brand-on-primary)',
        }}
      >
        {Icon ? <Icon aria-hidden size={32} className="opacity-90" /> : null}
        {item.durationSeconds !== null ? (
          <span className="absolute right-2 bottom-2 rounded-md bg-black/50 px-1.5 py-0.5 text-xs font-bold tabular-nums text-white">
            {formatClock(t, item.durationSeconds)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** The four numbers of a publication: measured likes and comments, example saves and shares. */
function Numbers({ t, item }: { t: DashboardT; item: ContentItem }) {
  const key = `${KEY}.card`;
  return (
    <dl className="grid grid-cols-2 gap-x-2 gap-y-3 border-t border-border pt-3">
      <Cell label={t(`${key}.likes`)} value={formatCount(item.likes)} />
      <Cell label={t(`${key}.comments`)} value={formatCount(item.comments)} />
      <Cell
        label={t(`${key}.saves`)}
        value={item.saves === null ? t(`${key}.none`) : formatCount(item.saves.value)}
      />
      <Cell label={t(`${key}.shares`)} value={formatCount(item.shares.value)} />
    </dl>
  );
}

/**
 * One publication as a card (D-05), in the look of the community and event cards: the cover at the
 * feed's ratio, the caption in two lines, `dd/mm · comunidade · tipo`, the four numbers and, when it
 * opens, a chevron line. The whole card is the link; its id lets the detail's "Voltar" land on it.
 * The "exemplo" of saves and shares is said once per list, never per card.
 */
export function ContentPostCard({
  t,
  item,
  href,
  extra,
}: {
  t: DashboardT;
  item: ContentItem;
  /** The detail's link; null = not a link (the detail's own header). */
  href: string | null;
  /** A last line under the numbers (a KPI list's metric). */
  extra?: ReactNode;
}) {
  return (
    <div id={contentPostAnchor(item.id)} className="scroll-mt-20">
      <Linked href={href}>
        <Card className="flex flex-col transition-colors hover:bg-card-hover">
          <ContentCover t={t} item={item} />
          <div className="flex flex-col gap-3 p-4 [overflow-wrap:anywhere]">
            <div className="flex flex-col gap-1">
              <span className="line-clamp-2 text-base font-bold leading-snug text-text">
                {item.excerpt}
              </span>
              <span className="text-xs text-text-secondary">{contentMeta(t, item)}</span>
            </div>
            <Numbers t={t} item={item} />
            {extra}
            {href === null ? null : (
              <p className="flex items-center justify-between gap-2 text-sm font-bold text-brand">
                <span>{t(`${KEY}.card.open`)}</span>
                <ChevronRight aria-hidden size={18} className="shrink-0" />
              </p>
            )}
          </div>
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
