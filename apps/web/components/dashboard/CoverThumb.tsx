import type { ContentKind } from '@rede-social/module-dashboard/fixtures';
import { cn } from '@rede-social/ui';
import {
  GalleryHorizontal,
  Image as ImageIcon,
  Link2,
  type LucideIcon,
  Play,
  ShoppingBag,
  Ticket,
  Type,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { type DashboardT, formatClock } from './format';

/** A publication's kind, plus the two strong actions that are not publications (PD-D). */
export type CoverKind = ContentKind | 'event' | 'order';

/** One icon per kind, shared by the list thumbnail and the content cover (D-02). */
export const COVER_ICON: Record<CoverKind, LucideIcon> = {
  video: Play,
  photo: ImageIcon,
  carousel: GalleryHorizontal,
  text: Type,
  link: Link2,
  story: Play,
  event: Ticket,
  order: ShoppingBag,
};

/** The five positions along the gradient's diagonal: the tones a cover can take (PD-B). */
export const COVER_TONES = ['0% 0%', '25% 25%', '50% 50%', '75% 75%', '100% 100%'] as const;

/**
 * The cover's tone for a publication: the sum of its id's character codes picks one of the five
 * positions, so the same publication has the same tone everywhere and neighbours rarely match.
 */
export function coverTone(seed: string): (typeof COVER_TONES)[number] {
  let sum = 0;
  for (const char of seed) sum += char.charCodeAt(0);
  return COVER_TONES[sum % COVER_TONES.length] ?? COVER_TONES[0];
}

/**
 * The cover's paint: the brand's own `--brand-gradient`, enlarged and shifted to the publication's
 * tone, so the variation never introduces a colour outside the brand tokens.
 */
export function coverStyle(seed: string): CSSProperties {
  return {
    backgroundImage: 'var(--brand-gradient)',
    backgroundSize: '300% 300%',
    backgroundPosition: coverTone(seed),
    color: 'var(--brand-on-primary)',
  };
}

export interface CoverThumbProps {
  kind: CoverKind;
  /** The publication's (or event's, or product's) id: picks the tone. */
  seed: string;
  /** A video's length, drawn as a small badge. */
  durationSeconds?: number | null;
  /** `row`: a 56 px square at the start of a list row; `card`: the compact card's cover (E-01). */
  variant?: 'row' | 'card';
  /** `card` only: the feed's width ÷ height (`contentCoverRatio`); null (a text post) is square. */
  ratio?: number | null;
}

/** The compact card's cover: 7rem high at the feed's ratio, never wider than 8rem (PD-I). */
const CARD_HEIGHT_REM = 7;
const CARD_MAX_WIDTH_REM = 8;

/**
 * The publication's cover as a thumbnail (quick 261013-orf D-02): 56 px at the start of a list row,
 * the "Sua atividade" look, or the compact card's cover at the feed's ratio (E-01). The same brand
 * cover as Conteúdo's detail, with the kind's icon, a video's length and a story's ring. Decorative
 * (D-04): the row's text stays its accessible name. With real data this becomes the post's media
 * (`MediaImage`); the gradient stays for posts without media.
 */
export function CoverThumb({
  t,
  kind,
  seed,
  durationSeconds = null,
  variant = 'row',
  ratio = null,
}: CoverThumbProps & { t: DashboardT }) {
  const Icon = COVER_ICON[kind];
  const card = variant === 'card';
  const aspect = ratio ?? 1;
  return (
    <span
      aria-hidden="true"
      data-testid="cover-thumb"
      data-kind={kind}
      data-ratio={card ? String(aspect) : undefined}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg',
        !card && 'size-14',
        kind === 'story' && 'ring-2 ring-brand ring-offset-2 ring-offset-card',
      )}
      style={
        card
          ? {
              ...coverStyle(seed),
              aspectRatio: aspect,
              width: `${(CARD_HEIGHT_REM * aspect).toFixed(3)}rem`,
              maxWidth: `${CARD_MAX_WIDTH_REM}rem`,
            }
          : coverStyle(seed)
      }
    >
      <Icon size={card ? 28 : 24} className="opacity-90" />
      {durationSeconds !== null ? (
        <span
          className={cn(
            'absolute rounded bg-black/50 font-bold tabular-nums text-white',
            card
              ? 'right-1.5 bottom-1.5 px-1.5 py-0.5 text-xs'
              : 'right-1 bottom-1 px-1 text-[10px] leading-4',
          )}
        >
          {formatClock(t, durationSeconds)}
        </span>
      ) : null}
    </span>
  );
}
