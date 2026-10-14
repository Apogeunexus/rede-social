import {
  CONTENT_KIND_ORDER,
  type ContentItem,
  ownerContent,
  ownerContentItems,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import {
  ActionCard,
  bandTotal,
  Collapsible,
  ENGAGEMENT_BAND_ORDER,
  HEAT_BUCKETS,
  heatBucket,
  KpiCard,
  KpiGrid,
  LineChart,
  percentOf,
  perItem,
  sumOf,
  topBy,
} from '@rede-social/module-dashboard/ui';
import { Card, cn } from '@rede-social/ui';
import { AlertTriangle, CalendarClock, ChevronRight, MessageCircle, Repeat } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  type ContentNumber,
  contentAttentionAnchor,
  contentBackHref,
  contentNumberAnchor,
  contentTabView,
  needsAttention,
  type OwnerContentView,
  ownerContentHref,
} from '@/lib/owner-content-view';
import { BackLink } from './BackLink';
import { BandSummary } from './BandMembers';
import { CoverThumb } from './CoverThumb';
import {
  type DashboardT,
  exampleBadge,
  formatCount,
  formatDecimal,
  formatPercent,
  formatRatio,
  kpiDelta,
} from './format';
import { LegendStroke } from './LegendStroke';
import { InteractionList, InteractorList } from './OwnerContentPeople';
import {
  ContentPostCard,
  ContentPostList,
  contentAgeText,
  SavesSharesNote,
  savesSharesExample,
} from './OwnerContentPostCard';
import { byInteractions, interactionsOf, kindAverage } from './OwnerContentTypes';
import { PanelSection, PreviewAction } from './PanelSection';

const KEY = 'tenantOwner.content.overview';

/** The 61 feed posts, newest first: what every overview number counts (PD-1). */
const POSTS: readonly ContentItem[] = ownerContentItems.filter((item) => item.kind !== 'story');

/** Reach and views are examples on every post: the first one's flag marks the totals. */
function firstPost(): ContentItem {
  const first = POSTS[0];
  if (!first) throw new Error('no feed post');
  return first;
}

/** Likes + comments ÷ reach of one publication, 0–1 (an example, as the reach is: PD-12). */
function rateOf(item: ContentItem): number {
  return item.reach.value > 0 ? interactionsOf(item) / item.reach.value : 0;
}

/** The overview's six figures, computed from the items (never typed next to them). */
function totals() {
  const interactions = sumOf(POSTS, interactionsOf);
  const reach = sumOf(POSTS, (item) => item.reach.value);
  return {
    posts: POSTS.length,
    likes: sumOf(POSTS, (item) => item.likes),
    comments: sumOf(POSTS, (item) => item.comments),
    interactions,
    rate: reach > 0 ? interactions / reach : 0,
    members: sumOf(ENGAGEMENT_BAND_ORDER, (band) => ownerContent.interactorsByBand[band]),
    views: sumOf(POSTS, (item) => item.views.value),
    reachPerPost: perItem(reach, POSTS.length),
  };
}

/** A number that opens its list: the whole card is a plain link landing back on itself. */
function NumberLink({ number, children }: { number: ContentNumber; children: ReactNode }) {
  return (
    <a
      href={ownerContentHref({ ...contentTabView('overview'), number })}
      id={contentNumberAnchor(number)}
      className="grid scroll-mt-20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      {children}
    </a>
  );
}

/** (1) The six numbers of the month against the 30 days before, each opening its list (D-02). */
function Kpis({ t }: { t: DashboardT }) {
  const sum = totals();
  const { deltas } = ownerContent;
  const base = bandTotal(tenantOwnerPanel.engagement);
  const seeList = (
    <span className="flex items-center gap-1 text-xs font-bold text-brand">
      {t('member.lists.seeList')}
      <ChevronRight aria-hidden size={14} />
    </span>
  );
  const key = `${KEY}.kpis`;
  return (
    <PanelSection title={t(`${key}.title`)}>
      <KpiGrid>
        <NumberLink number="posts">
          <KpiCard
            label={t(`${key}.posts`)}
            value={formatCount(sum.posts)}
            delta={kpiDelta(t, deltas.posts)}
            note={t(`${key}.postsNote`)}
            footer={seeList}
          />
        </NumberLink>
        <NumberLink number="interactions">
          <KpiCard
            label={t(`${key}.interactions`)}
            value={formatCount(sum.interactions)}
            delta={kpiDelta(t, deltas.interactions)}
            note={t(`${key}.interactionsNote`, {
              likes: formatCount(sum.likes),
              comments: formatCount(sum.comments),
            })}
            footer={seeList}
          />
        </NumberLink>
        <NumberLink number="rate">
          <KpiCard
            label={t(`${key}.rate`)}
            value={formatRatio(sum.rate)}
            delta={kpiDelta(t, deltas.rate)}
            note={t(`${key}.rateNote`)}
            badge={exampleBadge(t, firstPost().reach)}
            footer={seeList}
          />
        </NumberLink>
        <NumberLink number="members">
          <KpiCard
            label={t(`${key}.members`)}
            value={formatCount(sum.members)}
            delta={kpiDelta(t, deltas.interactors)}
            note={t(`${key}.membersNote`, {
              percent: formatPercent(percentOf(sum.members, base)),
            })}
            footer={seeList}
          />
        </NumberLink>
        <NumberLink number="views">
          <KpiCard
            label={t(`${key}.views`)}
            value={formatCount(sum.views)}
            delta={kpiDelta(t, deltas.views)}
            note={t(`${key}.viewsNote`, { count: sum.posts })}
            badge={exampleBadge(t, firstPost().views)}
            footer={seeList}
          />
        </NumberLink>
        <NumberLink number="reach">
          <KpiCard
            label={t(`${key}.reach`)}
            value={formatCount(sum.reachPerPost)}
            delta={kpiDelta(t, deltas.reach)}
            note={t(`${key}.reachNote`, {
              percent: formatPercent(percentOf(sum.reachPerPost, base)),
            })}
            badge={exampleBadge(t, firstPost().reach)}
            footer={seeList}
          />
        </NumberLink>
      </KpiGrid>
    </PanelSection>
  );
}

/** The posts with a comment waiting for the team over 24 hours, the longest wait first. */
function attentionPosts(): ContentItem[] {
  const wait = (item: ContentItem) => item.commentMeta.oldestUnansweredHours ?? 0;
  return POSTS.filter(needsAttention).sort((a, b) => wait(b) - wait(a));
}

/**
 * (2) Precisa de atenção: comments unanswered over 24 hours; each row (the publication's thumbnail,
 * the count with the alert icon, the caption) opens its unanswered comments (quick 261013-orf E-02).
 */
function Attention({ t }: { t: DashboardT }) {
  const rows = attentionPosts();
  const key = `${KEY}.attention`;
  return (
    <PanelSection title={t(`${key}.title`)}>
      <p className="text-xs text-text-secondary">{t(`${key}.note`)}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-text-secondary">{t(`${key}.empty`)}</p>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {rows.map((item) => (
              <li key={item.id}>
                <a
                  id={contentAttentionAnchor(item.id)}
                  href={ownerContentHref({ ...contentTabView('overview'), reply: item.id })}
                  className="flex scroll-mt-20 items-center gap-3 px-3 py-2.5 transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                >
                  <CoverThumb
                    t={t}
                    kind={item.kind}
                    seed={item.id}
                    durationSeconds={item.durationSeconds}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 [overflow-wrap:anywhere]">
                    <span className="flex items-start gap-1.5 text-sm font-bold text-text">
                      <AlertTriangle
                        aria-hidden
                        size={14}
                        className="mt-0.5 shrink-0 text-warning"
                      />
                      {t(`${key}.row`, {
                        count: item.comments - item.commentMeta.answered,
                        age: contentAgeText(t, item.commentMeta.oldestUnansweredHours ?? 0),
                      })}
                    </span>
                    <span className="line-clamp-2 text-xs text-text-secondary">{item.excerpt}</span>
                  </span>
                  <ChevronRight aria-hidden size={18} className="shrink-0 text-brand" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </PanelSection>
  );
}

/** (3) Likes + comments per publication per week, 12 weeks against the 12 before (dashed). */
function Trend({ t }: { t: DashboardT }) {
  const { current, previous } = ownerContent.weeklyPerPost;
  const key = `${KEY}.trend`;
  return (
    <PanelSection title={t(`${key}.title`)}>
      <Card className="flex flex-col gap-3 p-4">
        <p className="text-xs font-bold text-text-secondary">{t(`${key}.note`)}</p>
        <LineChart
          series={current}
          previous={previous}
          xLabels={current.map((_, i) =>
            (i + 1) % 4 === 0 ? t('tenantOwner.weekly.week', { week: i + 1 }) : '',
          )}
          yStep={10}
          formatValue={formatCount}
          ariaLabel={t(`${key}.label`)}
        />
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          <li className="flex items-center gap-2">
            <LegendStroke dashed={false} />
            {t(`${key}.current`)}
          </li>
          <li className="flex items-center gap-2">
            <LegendStroke dashed />
            {t(`${key}.previous`)}
          </li>
        </ul>
      </Card>
    </PanelSection>
  );
}

/** (4) The three best publications as cards, and the way to all of them. */
function Best({ t }: { t: DashboardT }) {
  const best = [...POSTS].sort(byInteractions).slice(0, 3);
  const key = `${KEY}.best`;
  return (
    <PanelSection title={t(`${key}.title`)}>
      {savesSharesExample(best) ? <SavesSharesNote t={t} /> : null}
      <ul className="flex flex-col gap-3">
        {best.map((item) => (
          <li key={item.id} className="min-w-0">
            <ContentPostCard
              t={t}
              item={item}
              href={ownerContentHref({ ...contentTabView('overview'), postId: item.id })}
            />
          </li>
        ))}
      </ul>
      <a
        href={ownerContentHref(contentTabView('posts'))}
        className="inline-flex min-h-11 items-center gap-1 self-start rounded-md text-sm font-bold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {t(`${key}.seeAll`)}
        <ChevronRight aria-hidden size={16} />
      </a>
    </PanelSection>
  );
}

const SOLID = HEAT_BUCKETS[HEAT_BUCKETS.length - 1];

/**
 * (5) Melhor dia e horário: the 7 weekdays × 4 time slots, each cell printing likes + comments per
 * publication, tinted by its place between the lowest and the highest cell (PD-6), so only the best
 * cell is solid. A list of rows, not a table: no table may show inside the phone.
 */
function Heatmap({ t }: { t: DashboardT }) {
  const { heatmap } = ownerContent;
  const key = `${KEY}.heatmap`;
  const values = heatmap.map((cell) => perItem(cell.interactions, cell.posts));
  const low = Math.min(...values);
  const high = Math.max(...values);
  const best = topBy(heatmap, (cell) => cell.interactions / cell.posts);
  const first = heatmap[0];
  if (!first || !best) throw new Error('an empty heatmap');
  const slots = heatmap.filter((cell) => cell.weekday === first.weekday);
  const days = heatmap.filter((cell) => cell.fromHour === first.fromHour);
  return (
    <PanelSection title={t(`${key}.title`)}>
      <Card className="flex flex-col gap-1 p-4">
        <div
          aria-hidden
          className="grid grid-cols-[2.5rem_repeat(4,minmax(0,1fr))] gap-1 pb-1 text-center text-xs text-text-secondary"
        >
          <span />
          {slots.map((cell) => (
            <span key={cell.fromHour}>
              {t(`${key}.slot`, { from: cell.fromHour, to: cell.toHour })}
            </span>
          ))}
        </div>
        <ul className="flex flex-col gap-1">
          {days.map((day) => (
            <li
              key={day.weekday}
              className="grid grid-cols-[2.5rem_repeat(4,minmax(0,1fr))] items-center gap-1"
            >
              <span aria-hidden className="text-xs font-bold text-text-secondary">
                {t(`tenantOwner.content.weekdayShort.${day.weekday}`)}
              </span>
              {heatmap
                .filter((cell) => cell.weekday === day.weekday)
                .map((cell) => {
                  const value = perItem(cell.interactions, cell.posts);
                  const tint = heatBucket(high > low ? percentOf(value - low, high - low) : 100);
                  return (
                    <span
                      key={cell.fromHour}
                      data-heat-cell={`${cell.weekday}-${cell.fromHour}`}
                      data-solid={tint === SOLID ? '' : undefined}
                      className={cn(
                        'rounded-md py-2 text-center text-sm font-bold tabular-nums',
                        tint,
                      )}
                    >
                      <span aria-hidden>{formatCount(value)}</span>
                      <span className="sr-only">
                        {t(`${key}.cell`, {
                          day: t(`tenantOwner.content.weekday.${cell.weekday}`),
                          from: cell.fromHour,
                          to: cell.toHour,
                          value: formatCount(value),
                          posts: cell.posts,
                        })}
                      </span>
                    </span>
                  );
                })}
            </li>
          ))}
        </ul>
      </Card>
      <p className="text-sm font-bold text-text">
        {t(`${key}.best`, {
          day: t(`tenantOwner.content.weekday.${best.weekday}`).toLowerCase(),
          from: best.fromHour,
          to: best.toHour,
          value: formatCount(perItem(best.interactions, best.posts)),
        })}
      </p>
      <p className="text-xs text-text-secondary">{t(`${key}.note`)}</p>
    </PanelSection>
  );
}

/**
 * (6) Quem interage, por faixa: the bands with interactors (today's), each summing who interacted and
 * their share of the band with the Membros mini bar (PD-5, quick 261013-orf E-03.3); opened, the
 * band's members who interacted, each opening their insights. Em risco and inativos have none by
 * definition: one static line says so, with nothing to open.
 */
function Bands({ t, view }: { t: DashboardT; view: OwnerContentView }) {
  const { interactorsByBand } = ownerContent;
  const { counts } = tenantOwnerPanel.engagement;
  const key = `${KEY}.bands`;
  return (
    <PanelSection id="quem-interage" title={t(`${key}.title`)} className="scroll-mt-20">
      <p className="text-xs text-text-secondary">{t(`${key}.note`)}</p>
      {ENGAGEMENT_BAND_ORDER.filter((band) => interactorsByBand[band] > 0).map((band) => {
        const count = interactorsByBand[band];
        return (
          <Collapsible
            key={band}
            open={band === view.band}
            title={t(`bands.${band}`)}
            summary={
              <BandSummary
                t={t}
                band={band}
                count={count}
                total={counts[band]}
                label={t(`${key}.summary`, {
                  count,
                  percent: formatPercent(percentOf(count, counts[band])),
                })}
              />
            }
          >
            <InteractorList t={t} view={contentTabView('overview')} band={band} />
          </Collapsible>
        );
      })}
      <p className="text-sm text-text-secondary">{t(`${key}.idle`)}</p>
    </PanelSection>
  );
}

/** (7) Three next steps from the numbers above, with the preview's disabled buttons. */
function NextSteps({ t }: { t: DashboardT }) {
  const key = `${KEY}.next`;
  const late = attentionPosts();
  const unanswered = sumOf(late, (item) => item.comments - item.commentMeta.answered);
  const kind = topBy(CONTENT_KIND_ORDER, kindAverage);
  const slot = topBy(ownerContent.heatmap, (cell) => cell.interactions / cell.posts);
  const best = [...POSTS].sort(byInteractions)[0];
  if (!kind || !slot || !best) throw new Error('no kind, slot or post to suggest');
  return (
    <PanelSection title={t(`${key}.title`)}>
      <ActionCard
        icon={MessageCircle}
        title={t(`${key}.answer.title`)}
        detail={t(`${key}.answer.detail`, { count: unanswered, posts: late.length })}
        action={<PreviewAction variant="outline">{t(`${key}.answer.action`)}</PreviewAction>}
      />
      <ActionCard
        icon={CalendarClock}
        title={t(`${key}.schedule.title`)}
        detail={t(`${key}.schedule.detail`, {
          kinds: t(`tenantOwner.content.kindsThe.${kind}`),
          perPost: formatCount(kindAverage(kind)),
          day: t(`tenantOwner.content.weekday.${slot.weekday}`).toLowerCase(),
          from: slot.fromHour,
          to: slot.toHour,
          best: formatCount(perItem(slot.interactions, slot.posts)),
        })}
        action={<PreviewAction variant="outline">{t(`${key}.schedule.action`)}</PreviewAction>}
      />
      <ActionCard
        icon={Repeat}
        title={t(`${key}.series.title`)}
        detail={t(`${key}.series.detail`, {
          excerpt: best.excerpt,
          count: formatCount(interactionsOf(best)),
          ratio: formatDecimal(interactionsOf(best) / kindAverage(best.kind), 1),
          kinds: t(`tenantOwner.content.kindsOf.${best.kind}`),
        })}
        action={<PreviewAction variant="outline">{t(`${key}.series.action`)}</PreviewAction>}
      />
    </PanelSection>
  );
}

/** A publication list ordered by an example metric, each card printing it (never people: P3). */
function MetricPosts({
  t,
  view,
  score,
  line,
}: {
  t: DashboardT;
  view: OwnerContentView;
  score: (item: ContentItem) => number;
  line: (item: ContentItem) => string;
}) {
  return (
    <ContentPostList
      t={t}
      items={[...POSTS].sort((a, b) => score(b) - score(a))}
      hrefOf={(item) => ownerContentHref({ ...view, postId: item.id })}
      exampleNote={t('tenantOwner.content.numbers.exampleNote')}
      extraOf={(item) => <p className="text-sm font-bold text-text">{line(item)}</p>}
    />
  );
}

/**
 * The list behind one overview number (D-02), a deeper step under its "Voltar": its count line
 * repeats the number. Publicações lists the posts newest first; Interações the interactions (PD-7);
 * Membros que interagiram the members; Taxa, Visualizações and Alcance the publications ordered by
 * that metric — never people (P3).
 */
export function ContentNumberList({ t, view }: { t: DashboardT; view: OwnerContentView }) {
  const back = contentBackHref(view);
  const { number } = view;
  if (!number || back === null) throw new Error('a number list with no number');
  const sum = totals();
  const key = 'tenantOwner.content.numbers';
  const bodies: Record<ContentNumber, () => { count: string; body: ReactNode }> = {
    posts: () => ({
      count: t(`${key}.posts`, { count: sum.posts }),
      body: (
        <ContentPostList
          t={t}
          items={POSTS}
          hrefOf={(item) => ownerContentHref({ ...view, postId: item.id })}
        />
      ),
    }),
    interactions: () => ({
      count: t(`${key}.interactions`, { value: formatCount(sum.interactions) }),
      body: <InteractionList t={t} view={view} />,
    }),
    members: () => ({
      count: t(`${key}.members`, { value: formatCount(sum.members) }),
      body: <InteractorList t={t} view={view} band={null} />,
    }),
    rate: () => ({
      count: t(`${key}.rate`, { value: formatRatio(sum.rate) }),
      body: (
        <MetricPosts
          t={t}
          view={view}
          score={rateOf}
          line={(item) => t(`${key}.metricRate`, { value: formatRatio(rateOf(item)) })}
        />
      ),
    }),
    views: () => ({
      count: t(`${key}.views`, { value: formatCount(sum.views) }),
      body: (
        <MetricPosts
          t={t}
          view={view}
          score={(item) => item.views.value}
          line={(item) => t(`${key}.metricViews`, { value: formatCount(item.views.value) })}
        />
      ),
    }),
    reach: () => ({
      count: t(`${key}.reach`, { value: formatCount(sum.reachPerPost) }),
      body: (
        <MetricPosts
          t={t}
          view={view}
          score={(item) => item.reach.value}
          line={(item) => t(`${key}.metricReach`, { value: formatCount(item.reach.value) })}
        />
      ),
    }),
  };
  const { count, body } = bodies[number]();
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <BackLink href={back} label={t('tenantOwner.memberDetail.back')} />
      <PanelSection title={t(`${KEY}.kpis.${number}`)} prominent>
        <p className="text-sm text-text-secondary">{count}</p>
        {body}
      </PanelSection>
    </div>
  );
}

/**
 * The Visão geral tab of Conteúdo (D-02), in order: the six numbers of the month, Precisa de
 * atenção, the 12-week trend, the best publications, the best day and time, who interacts by band and
 * three next steps. Canais is gone: it is not content, and the panel's own Visão geral already has a
 * number from each area (PD-11). Nothing here names a member except an opened band's cards (P1).
 */
export function OwnerContentOverview({ t, view }: { t: DashboardT; view: OwnerContentView }) {
  return (
    <>
      <Kpis t={t} />
      <Attention t={t} />
      <Trend t={t} />
      <Best t={t} />
      <Heatmap t={t} />
      <Bands t={t} view={view} />
      <NextSteps t={t} />
    </>
  );
}
