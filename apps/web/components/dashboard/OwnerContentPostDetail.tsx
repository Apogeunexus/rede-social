import { formatBrl } from '@rede-social/contracts/money';
import {
  type ContentDetail,
  type ContentItem,
  type ContentWho,
  daysSince,
  ownerContent,
  ownerContentDetail,
  ownerContentItem,
  ownerContentKindRetention,
  ownerContentKindVelocity,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import {
  ActionCard,
  BarList,
  ENGAGEMENT_BAND_ORDER,
  isBelowPrivacyFloor,
  KpiCard,
  KpiGrid,
  LineChart,
  PRIVACY_FLOOR,
  percentOf,
  sumOf,
  topBy,
} from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { ChevronRight, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  contentBackHref,
  contentRecommendation,
  contentWhoAnchor,
  type OwnerContentView,
  ownerContentHref,
} from '@/lib/owner-content-view';
import { BackLink } from './BackLink';
import { ownerEvent } from './BandScopeCards';
import { ExamplePill } from './ExamplePill';
import {
  bandLabel,
  type DashboardT,
  exampleBadge,
  formatClock,
  formatCount,
  formatDayMonth,
  formatDecimal,
  formatHoursMinutes,
  formatPercent,
} from './format';
import { LegendStroke } from './LegendStroke';
import { ContentCover, contentAgeText, contentMeta } from './OwnerContentPostCard';
import { interactionsOf, kindAverage } from './OwnerContentTypes';
import { PanelSection, PreviewAction } from './PanelSection';

const KEY = 'tenantOwner.content.detail';

/** Under 48 hours a publication is still collecting: no comparison yet (D-06). */
const COMPARABLE_AFTER_DAYS = 2;

export function isInProgress(item: ContentItem): boolean {
  return daysSince(item.date) < COMPARABLE_AFTER_DAYS;
}

/** "dos vídeos", "das fotos": the kind with its article, for "a média …". */
function kindsLabel(t: DashboardT, item: ContentItem): string {
  return t(`tenantOwner.content.kindsOf.${item.kind}`);
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
                  kinds: kindsLabel(t, item),
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

/** The two series of a detail chart, by the line's own stroke. */
function Legend({ current, previous }: { current: string; previous: string }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
      <li className="flex items-center gap-2">
        <LegendStroke dashed={false} />
        {current}
      </li>
      <li className="flex items-center gap-2">
        <LegendStroke dashed />
        {previous}
      </li>
    </ul>
  );
}

/** Primeiras 48 horas: likes + comments as they came in, against the kind's average (dashed). */
function Velocity({
  t,
  item,
  detail,
}: {
  t: DashboardT;
  item: ContentItem;
  detail: ContentDetail;
}) {
  const key = `${KEY}.velocity`;
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      {isInProgress(item) ? (
        <p className="text-sm text-text-secondary">{t(`${key}.inProgress`)}</p>
      ) : (
        <Card className="flex flex-col gap-3 p-4">
          <p className="text-xs font-bold text-text-secondary">{t(`${key}.note`)}</p>
          <LineChart
            series={detail.velocity48h}
            previous={ownerContentKindVelocity(item.kind)}
            xLabels={detail.velocity48h.map((_, i) =>
              i % 2 === 1 ? t(`${key}.hour`, { hours: (i + 1) * 6 }) : '',
            )}
            yStep={10}
            formatValue={formatCount}
            ariaLabel={t(`${key}.label`)}
          />
          <Legend
            current={t(`${key}.current`)}
            previous={t(`${key}.average`, { kinds: kindsLabel(t, item) })}
          />
        </Card>
      )}
    </PanelSection>
  );
}

/**
 * Quem a publicação alcançou, por faixa: totals per today's band and their share of the reach, never a
 * link to anyone (P3). An example for a post, measured for a story.
 */
function ReachByBand({
  t,
  item,
  detail,
}: {
  t: DashboardT;
  item: ContentItem;
  detail: ContentDetail;
}) {
  const key = `${KEY}.reach`;
  const { reachByBand } = detail;
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      {reachByBand.example ? (
        <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          {t(`${key}.exampleNote`)}
          <ExamplePill text={exampleBadge(t, reachByBand)} />
        </p>
      ) : null}
      <BarList
        max={item.reach.value}
        rows={ENGAGEMENT_BAND_ORDER.map((band) => {
          const count = reachByBand.value[band];
          return {
            id: band,
            label: bandLabel(t, band),
            value: count,
            display: formatCount(count),
            rate: formatPercent(percentOf(count, item.reach.value)),
          };
        })}
      />
      <p className="text-xs text-text-secondary">{t(`${key}.note`)}</p>
    </PanelSection>
  );
}

function AppLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2.5 text-sm">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-bold text-text">{children}</dd>
    </div>
  );
}

/**
 * O que só o app sabe (D-06): members back after 30+ idle days, event RSVPs and sales within 7 days
 * (a value only from 5 orders on, P2 / PD-10) and the VIP subscriptions while it was the shop window,
 * with the note that this is association, not cause.
 */
function AppKnows({ t, detail }: { t: DashboardT; detail: ContentDetail }) {
  const key = `${KEY}.app`;
  const { orders } = detail;
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      <Card>
        <dl className="divide-y divide-border [overflow-wrap:anywhere]">
          <AppLine label={t(`${key}.reactivated`)}>{formatCount(detail.reactivated)}</AppLine>
          <AppLine label={t(`${key}.rsvps`)}>
            {detail.rsvps.length === 0 ? (
              t(`${key}.noRsvps`)
            ) : (
              <ul className="flex flex-col gap-0.5">
                {detail.rsvps.map((row) => {
                  const event = ownerEvent(row.eventId);
                  return (
                    <li key={row.eventId}>
                      {t(`${key}.rsvp`, {
                        name: event.name,
                        date: formatDayMonth(event.date),
                        count: row.members,
                      })}
                    </li>
                  );
                })}
              </ul>
            )}
          </AppLine>
          <AppLine label={t(`${key}.sales`)}>
            {isBelowPrivacyFloor(orders.count)
              ? t(`${key}.salesFloor`, { floor: PRIVACY_FLOOR })
              : t(`${key}.salesValue`, { count: orders.count, value: formatBrl(orders.cents) })}
          </AppLine>
          {detail.vitrine ? (
            <AppLine label={t(`${key}.vitrine`)}>
              {formatCount(detail.vitrine.subscriptions)}
            </AppLine>
          ) : null}
        </dl>
      </Card>
      <p className="text-xs text-text-secondary">{t(`${key}.note`)}</p>
    </PanelSection>
  );
}

/**
 * Comentários (D-06): how many the team answered, the median first reply and how long the oldest
 * unanswered waits; the commenters list (unanswered first) is one link away. Never a comment's text.
 */
function Comments({ t, item, view }: { t: DashboardT; item: ContentItem; view: OwnerContentView }) {
  const key = `${KEY}.comments`;
  const { answered, oldestUnansweredHours, firstReplyMedianMinutes } = item.commentMeta;
  const unanswered = item.comments - answered;
  return (
    <PanelSection id="comentarios" as="h4" title={t(`${key}.title`)} className="scroll-mt-20">
      {item.comments === 0 ? (
        <p className="text-sm text-text-secondary">{t(`${key}.none`)}</p>
      ) : (
        <Card className="flex flex-col gap-1 p-4 text-sm text-text">
          <p className="font-bold">
            {t(`${key}.answered`, {
              answered: formatCount(answered),
              comments: formatCount(item.comments),
              percent: formatPercent(percentOf(answered, item.comments)),
            })}
          </p>
          {firstReplyMedianMinutes !== null ? (
            <p className="text-text-secondary">
              {t(`${key}.firstReply`, { time: formatHoursMinutes(t, firstReplyMedianMinutes) })}
            </p>
          ) : null}
          {unanswered > 0 && oldestUnansweredHours !== null ? (
            <p className="font-semibold text-warning">
              {t(`${key}.waiting`, {
                count: unanswered,
                age: contentAgeText(t, oldestUnansweredHours),
              })}
            </p>
          ) : null}
          <a
            href={ownerContentHref({ ...view, who: 'comments', memberId: null, list: null })}
            className="mt-1 inline-flex min-h-11 w-fit items-center gap-1 rounded-md font-bold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {t(`${key}.seeWho`)}
            <ChevronRight aria-hidden size={16} />
          </a>
        </Card>
      )}
    </PanelSection>
  );
}

/** Recomendação: the deterministic rule's advice with this publication's numbers. */
function Recommendation({ t, item }: { t: DashboardT; item: ContentItem }) {
  const key = `${KEY}.recommendation`;
  const interactions = interactionsOf(item);
  const average = kindAverage(item.kind);
  const rule = contentRecommendation({
    kind: item.kind,
    interactions,
    kindAverage: average,
    daysAgo: daysSince(item.date),
    durationSeconds: item.durationSeconds,
  });
  const slot = topBy(ownerContent.heatmap, (cell) => cell.interactions / cell.posts);
  if (!slot) throw new Error('an empty heatmap');
  return (
    <ActionCard
      icon={Lightbulb}
      title={t(`${key}.title`)}
      detail={t(`${key}.${rule}.detail`, {
        interactions: formatCount(interactions),
        withPush: formatCount(tenantOwnerPanel.atRiskWithPush),
        ratio: formatDecimal(average > 0 ? interactions / average : 0, 1),
        kinds: kindsLabel(t, item),
        day: t(`tenantOwner.content.weekday.${slot.weekday}`).toLowerCase(),
        from: slot.fromHour,
      })}
      action={<PreviewAction variant="outline">{t(`${key}.${rule}.action`)}</PreviewAction>}
    />
  );
}

/**
 * Retenção do vídeo (videos only, example): % still watching at each tenth, against the videos'. The
 * axis reads the video's own time at its start, middle and end (0:00 · 0:20 · 0:41, E-03.5).
 */
function Retention({
  t,
  item,
  detail,
}: {
  t: DashboardT;
  item: ContentItem;
  detail: ContentDetail;
}) {
  const { retention } = detail;
  if (!retention) return null;
  const key = `${KEY}.retention`;
  const curve = retention.value;
  const duration = item.durationSeconds ?? 0;
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        {t(`${key}.exampleNote`)}
        <ExamplePill text={exampleBadge(t, retention)} />
      </p>
      <KpiGrid className="grid-cols-2">
        <KpiCard
          label={t(`${key}.watched`)}
          value={formatPercent(sumOf(curve, (value) => value) / Math.max(1, curve.length))}
        />
        <KpiCard label={t(`${key}.completion`)} value={formatPercent(curve.at(-1) ?? 0)} />
      </KpiGrid>
      <Card className="flex flex-col gap-3 p-4">
        <LineChart
          series={curve}
          previous={ownerContentKindRetention()}
          xLabels={curve.map((_, i) =>
            i % 5 === 0 ? formatClock(t, Math.floor((duration * i) / (curve.length - 1))) : '',
          )}
          yStep={20}
          formatValue={formatPercent}
          ariaLabel={t(`${key}.label`)}
        />
        <Legend current={t(`${key}.current`)} previous={t(`${key}.average`)} />
      </Card>
    </PanelSection>
  );
}

/** Toques no story (stories only, example): who tapped forward, back or out. */
function Taps({ t, detail }: { t: DashboardT; detail: ContentDetail }) {
  const { navigation } = detail;
  if (!navigation) return null;
  const key = `${KEY}.taps`;
  return (
    <PanelSection as="h4" title={t(`${key}.title`)}>
      <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        {t(`${key}.exampleNote`)}
        <ExamplePill text={exampleBadge(t, navigation)} />
      </p>
      <KpiGrid>
        <KpiCard label={t(`${key}.forward`)} value={formatPercent(navigation.value.forward)} />
        <KpiCard label={t(`${key}.back`)} value={formatPercent(navigation.value.back)} />
        <KpiCard label={t(`${key}.exit`)} value={formatPercent(navigation.value.exit)} />
      </KpiGrid>
    </PanelSection>
  );
}

/**
 * One publication's detail (D-06), opened from a card: "Voltar" to that card in the list it came
 * from, the header with how it did against its kind ("1,3× a média dos vídeos", or "Em andamento"
 * under 48 hours), its interactions (each opening who did it), the first 48 hours, who it reached by
 * band (totals only), what only the app knows, the comments, the recommendation, and the video's
 * retention or the story's taps.
 */
export function OwnerContentPostDetail({ t, view }: { t: DashboardT; view: OwnerContentView }) {
  const back = contentBackHref(view);
  // The parser only lets a publication of the opened list through: a gap here is a bug.
  if (!view.postId || back === null) throw new Error('a publication detail with no publication');
  const item = ownerContentItem(view.postId);
  const detail = ownerContentDetail(item.id);
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <BackLink href={back} label={t(`${KEY}.back`)} />
      <Header t={t} item={item} />
      <Interactions t={t} item={item} view={view} />
      <Velocity t={t} item={item} detail={detail} />
      <ReachByBand t={t} item={item} detail={detail} />
      <AppKnows t={t} detail={detail} />
      <Comments t={t} item={item} view={view} />
      <Recommendation t={t} item={item} />
      <Retention t={t} item={item} detail={detail} />
      <Taps t={t} detail={detail} />
    </div>
  );
}
