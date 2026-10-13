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
}

/**
 * The publication's cover as a 56 px thumbnail at the start of a list row (quick 261013-orf D-02),
 * the "Sua atividade" look: the same brand cover as Conteúdo's cards, with the kind's icon, a video's
 * length and a story's ring. Decorative (D-04): the row's text stays its accessible name. With real
 * data this becomes the post's media (`MediaImage`); the gradient stays for posts without media.
 */
export function CoverThumb({
  t,
  kind,
  seed,
  durationSeconds = null,
}: CoverThumbProps & { t: DashboardT }) {
  const Icon = COVER_ICON[kind];
  return (
    <span
      aria-hidden="true"
      data-testid="cover-thumb"
      data-kind={kind}
      className={cn(
        'relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg',
        kind === 'story' && 'ring-2 ring-brand ring-offset-2 ring-offset-card',
      )}
      style={coverStyle(seed)}
    >
      <Icon size={24} className="opacity-90" />
      {durationSeconds !== null ? (
        <span className="absolute right-1 bottom-1 rounded bg-black/50 px-1 text-[10px] leading-4 font-bold tabular-nums text-white">
          {formatClock(t, durationSeconds)}
        </span>
      ) : null}
    </span>
  );
}
