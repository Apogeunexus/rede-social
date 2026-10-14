import {
  CONTENT_KIND_ORDER,
  type ContentItem,
  type ContentKind,
  ownerContentItems,
  ownerContentKindMetric,
  type ReportValue,
} from '@rede-social/module-dashboard/fixtures';
import { percentOf, perItem, sumOf } from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { ChevronRight } from 'lucide-react';
import {
  contentBackHref,
  contentKindAnchor,
  type OwnerContentView,
  ownerContentHref,
} from '@/lib/owner-content-view';
import { BackLink } from './BackLink';
import { Cell, Linked } from './BandScopeCards';
import { ExamplePill } from './ExamplePill';
import { type DashboardT, exampleBadge, formatCount, formatPercent } from './format';
import { ContentPostList, contentKindLabel } from './OwnerContentPostCard';
import { PanelSection } from './PanelSection';

const KEY = 'tenantOwner.content';

export function interactionsOf(item: ContentItem): number {
  return item.likes + item.comments;
}

/** Best first: more likes + comments, then the newer, then the id (a stable, value-led order). */
export function byInteractions(a: ContentItem, b: ContentItem): number {
  return (
    interactionsOf(b) - interactionsOf(a) ||
    b.date.localeCompare(a.date) ||
    a.id.localeCompare(b.id)
  );
}

export function itemsOfKind(kind: ContentKind): ContentItem[] {
  return ownerContentItems.filter((item) => item.kind === kind);
}

/** Likes + comments per publication of a kind (the "média dos vídeos" of the detail). */
export function kindAverage(kind: ContentKind): number {
  const items = itemsOfKind(kind);
  return perItem(sumOf(items, interactionsOf), items.length);
}

/**
 * Each kind's own metric (D-03): the fixture's examples for video, carousel, link and story; a
 * photo's saves per post (example, as saves are) and a text's share of comments (measured), both
 * computed from the items.
 */
function kindMetric(kind: ContentKind): { value: string; metric: { example: boolean } } {
  const items = itemsOfKind(kind);
  const percent = (metric: ReportValue<number>) => ({
    value: formatPercent(metric.value),
    metric,
  });
  switch (kind) {
    case 'photo': {
      const saves = sumOf(items, (item) => item.saves?.value ?? 0);
      const example = items.some((item) => item.saves?.example !== false);
      return { value: formatCount(perItem(saves, items.length)), metric: { example } };
    }
    case 'text':
      return {
        value: formatPercent(
          percentOf(
            sumOf(items, (item) => item.comments),
            sumOf(items, interactionsOf),
          ),
        ),
        metric: { example: false },
      };
    default:
      return percent(ownerContentKindMetric[kind]);
  }
}

/**
 * One kind as a card (D-03): its name, how many publications, likes + comments per publication and
 * its own metric; the whole card opens that kind's publications. The list says once which metrics
 * are examples.
 */
function KindCard({ t, kind, href }: { t: DashboardT; kind: ContentKind; href: string | null }) {
  const items = itemsOfKind(kind);
  const own = kindMetric(kind);
  return (
    <div id={contentKindAnchor(kind)} className="scroll-mt-20">
      <Linked href={href}>
        <Card className="flex flex-col gap-3 p-4 transition-colors hover:bg-card-hover [overflow-wrap:anywhere]">
          <span className="text-xl font-bold leading-tight text-text">
            {contentKindLabel(t, kind)}
          </span>
          <dl className="grid grid-cols-3 gap-2 border-t border-border pt-3">
            <Cell label={t(`${KEY}.types.posts`)} value={formatCount(items.length)} />
            <Cell label={t(`${KEY}.types.perPost`)} value={formatCount(kindAverage(kind))} />
            <Cell label={t(`${KEY}.types.metric.${kind}`)} value={own.value} />
          </dl>
          {href === null ? null : (
            <p className="flex items-center justify-between gap-2 text-sm font-bold text-brand">
              <span>{t(`${KEY}.types.open`)}</span>
              <ChevronRight aria-hidden size={18} className="shrink-0" />
            </p>
          )}
        </Card>
      </Linked>
    </div>
  );
}

function MetricsNote({ t }: { t: DashboardT }) {
  const example = CONTENT_KIND_ORDER.some((kind) => kindMetric(kind).metric.example);
  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
      {t(`${KEY}.types.note`)}
      <ExamplePill text={exampleBadge(t, { example })} />
    </p>
  );
}

/**
 * The one example sentence of an opened type (quick 261013-orf E-03.9): the type's own metric when
 * it is an example, saves when the type has them (not a story), and always shares.
 */
function openedNote(t: DashboardT, kind: ContentKind): string {
  const metric = kindMetric(kind).metric.example;
  const saves = kind !== 'story';
  const examples = metric && saves ? 'metricSaves' : metric ? 'metric' : 'saves';
  return t(`${KEY}.types.openedNote`, { examples });
}

/**
 * The Por tipo tab (D-03): the six kinds as cards in CONTENT_KIND_ORDER. A card opens that kind in
 * place: "Voltar aos tipos", the card (not a link here) and its publications best first, each opening
 * its detail. Reels are videos (PD-1); stories are a kind only here.
 */
export function OwnerContentTypes({ t, view }: { t: DashboardT; view: OwnerContentView }) {
  const { kind } = view;
  if (kind) {
    const back = contentBackHref(view);
    if (back === null) throw new Error('an opened type has no way back');
    return (
      <PanelSection title={t(`${KEY}.types.title`)}>
        <BackLink href={back} label={t(`${KEY}.types.back`)} />
        <KindCard t={t} kind={kind} href={null} />
        <p className="text-sm font-bold text-text">{t(`${KEY}.types.postsOf`)}</p>
        <ContentPostList
          t={t}
          items={[...itemsOfKind(kind)].sort(byInteractions)}
          hrefOf={(item) => ownerContentHref({ ...view, postId: item.id })}
          exampleNote={openedNote(t, kind)}
        />
      </PanelSection>
    );
  }
  return (
    <PanelSection title={t(`${KEY}.types.title`)}>
      <MetricsNote t={t} />
      <ul className="flex flex-col gap-3">
        {CONTENT_KIND_ORDER.map((row) => (
          <li key={row} className="min-w-0">
            <KindCard t={t} kind={row} href={ownerContentHref({ ...view, kind: row })} />
          </li>
        ))}
      </ul>
    </PanelSection>
  );
}
