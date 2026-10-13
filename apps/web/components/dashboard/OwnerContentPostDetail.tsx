import {
  type ContentItem,
  type ContentWho,
  daysSince,
  ownerContentItem,
} from '@rede-social/module-dashboard/fixtures';
import { KpiCard, KpiGrid } from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  contentBackHref,
  contentWhoAnchor,
  type OwnerContentView,
  ownerContentHref,
} from '@/lib/owner-content-view';
import { BackLink } from './BackLink';
import { type DashboardT, exampleBadge, formatCount, formatDecimal } from './format';
import { ContentCover, contentMeta } from './OwnerContentPostCard';
import { interactionsOf, kindAverage } from './OwnerContentTypes';
import { PanelSection } from './PanelSection';

const KEY = 'tenantOwner.content.detail';

/** Under 48 hours a publication is still collecting: no comparison yet (D-06). */
const COMPARABLE_AFTER_DAYS = 2;

export function isInProgress(item: ContentItem): boolean {
  return daysSince(item.date) < COMPARABLE_AFTER_DAYS;
}

/** The detail's header (D-06): the cover, the whole caption, the meta, and how it did. */
function Header({ t, item }: { t: DashboardT; item: ContentItem }) {
  const interactions = interactionsOf(item);
  const average = kindAverage(item.kind);
  return (
    <Card className="flex flex-col">
      <ContentCover t={t} item={item} maxHeightRem={28} />
      <div className="flex flex-col gap-2 p-4 [overflow-wrap:anywhere]">
        <h3 className="text-lg font-bold leading-snug text-text">{item.excerpt}</h3>
        <p className="text-xs text-text-secondary">{contentMeta(t, item)}</p>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-extrabold tabular-nums text-text">
            {t(`${KEY}.interactions`, { count: interactions, value: formatCount(interactions) })}
          </span>
          <span className="text-sm font-semibold text-text-secondary">
            {isInProgress(item) || average === 0
              ? t(`${KEY}.inProgress`)
              : t(`${KEY}.vsKind`, {
                  ratio: formatDecimal(interactions / average, 1),
                  kinds: t(`tenantOwner.content.kindsPlural.${item.kind}`),
                })}
          </span>
        </p>
      </div>
    </Card>
  );
}

/** A number that opens who did it: the whole card is a plain link landing back on itself. */
function WhoLink({ href, who, children }: { href: string; who: ContentWho; children: ReactNode }) {
  return (
    <a
      href={href}
      id={contentWhoAnchor(who)}
      className="grid scroll-mt-20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      {children}
    </a>
  );
}

/**
 * Interações (D-06, P1): likes, comments, saves and shares, each opening the members who did it. Saves
 * and shares are examples (and so are their people); a story cannot be saved.
 */
function Interactions({
  t,
  item,
  view,
}: {
  t: DashboardT;
  item: ContentItem;
  view: OwnerContentView;
}) {
  const seeList = (
    <span className="flex items-center gap-1 text-xs font-bold text-brand">
      {t('member.lists.seeList')}
      <ChevronRight aria-hidden size={14} />
    </span>
  );
  const rows: { who: ContentWho; value: number; badge: string | undefined }[] = [
    { who: 'likes', value: item.likes, badge: undefined },
    { who: 'comments', value: item.comments, badge: undefined },
    ...(item.saves === null
      ? []
      : [{ who: 'saves' as const, value: item.saves.value, badge: exampleBadge(t, item.saves) }]),
    { who: 'shares', value: item.shares.value, badge: exampleBadge(t, item.shares) },
  ];
  return (
    <PanelSection as="h4" title={t(`${KEY}.interactionsTitle`)}>
      <KpiGrid className="grid-cols-2">
        {rows.map((row) => (
          <WhoLink
            key={row.who}
            who={row.who}
            href={ownerContentHref({ ...view, who: row.who, memberId: null, list: null })}
          >
            <KpiCard
              label={t(`tenantOwner.content.card.${row.who}`)}
              value={formatCount(row.value)}
              badge={row.badge}
              footer={seeList}
            />
          </WhoLink>
        ))}
      </KpiGrid>
    </PanelSection>
  );
}

/**
 * One publication's detail (D-06), opened from a card: "Voltar" to that card in the list it came
 * from, the header with how it did against its kind ("1,3× a média dos vídeos", or "Em andamento"
 * under 48 hours), then its interactions, each opening who did it.
 */
export function OwnerContentPostDetail({ t, view }: { t: DashboardT; view: OwnerContentView }) {
  const back = contentBackHref(view);
  // The parser only lets a publication of the opened list through: a gap here is a bug.
  if (!view.postId || back === null) throw new Error('a publication detail with no publication');
  const item = ownerContentItem(view.postId);
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <BackLink href={back} label={t(`${KEY}.back`)} />
      <Header t={t} item={item} />
      <Interactions t={t} item={item} view={view} />
    </div>
  );
}
