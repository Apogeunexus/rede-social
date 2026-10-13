import { tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import {
  BarList,
  bandTotal,
  Collapsible,
  KpiCard,
  KpiGrid,
  percentOf,
  perItem,
  sumOf,
  topBy,
} from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { getTranslations } from 'next-intl/server';
import { ExamplePill } from './ExamplePill';
import { exampleBadge, formatCount, formatDayMonth, formatPercent } from './format';
import { PanelSection } from './PanelSection';

/** Likes + comments per post of a row, computed (C-4). */
function perPostOf(row: { posts: number; interactions: number }): number {
  return perItem(row.interactions, row.posts);
}

/**
 * Level 4, "Conteúdo": the posts that performed best (saves and shares are examples, marked by one
 * pill on the block's note line, not on every row: C-3), reach, video playback and stories (stories are aggregate only, never who viewed), then
 * closed: interactions per post by format and by community, the best day and time to publish, and
 * where members interact. Every "rende mais", best day/slot and top channel is picked by value with
 * `topBy`, never by the data's order (C-6). The "exemplo" pill comes from each value's `example`
 * flag (D-03).
 */
export async function OwnerContentOverview() {
  const t = await getTranslations('dashboard');
  const {
    topPosts,
    reach,
    videoPlayback,
    stories,
    byFormat,
    byCommunity,
    publishing,
    channels,
    engagement,
  } = tenantOwnerPanel;
  const base = bandTotal(engagement);
  const formats = [...byFormat].sort((a, b) => perPostOf(b) - perPostOf(a));
  const topFormat = formats[0];
  const formatPosts = sumOf(byFormat, (row) => row.posts);
  const topCommunity = topBy(byCommunity, perPostOf);
  const communityPosts = sumOf(byCommunity, (row) => row.posts);
  const bestDay = topBy(publishing.byWeekday, perPostOf);
  const bestSlot = topBy(publishing.bySlot, perPostOf);
  const topChannel = topBy(channels, (row) => row.count);
  const postsExample = topPosts.some((post) => post.saves.example || post.shares.example);

  return (
    <>
      <PanelSection title={t('tenantOwner.topPosts.title')}>
        {postsExample ? (
          <p className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <span>{t('tenantOwner.topPosts.exampleNote')}</span>
            <ExamplePill text={exampleBadge(t, { example: postsExample })} />
          </p>
        ) : null}
        <Card>
          <ul className="divide-y divide-border">
            {topPosts.map((post) => (
              <li key={post.id} className="flex items-start justify-between gap-3 px-3 py-2.5">
                <div className="flex min-w-0 flex-col gap-0.5 [overflow-wrap:anywhere]">
                  <p className="text-sm font-semibold text-text">
                    {t('tenantOwner.topPosts.post', {
                      type: t(`postTypes.${post.type}`),
                      community: post.community,
                    })}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('tenantOwner.topPosts.measured', {
                      likes: post.likes,
                      comments: post.comments,
                    })}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('tenantOwner.topPosts.saved', {
                      saves: post.saves.value,
                      shares: post.shares.value,
                    })}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold tabular-nums text-text">
                  {formatDayMonth(post.date)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </PanelSection>

      <PanelSection title={t('tenantOwner.reach.title')}>
        <KpiGrid>
          <KpiCard
            label={t('tenantOwner.reach.perPost')}
            value={formatCount(reach.value.perPost)}
            note={t('tenantOwner.reach.perPostNote', {
              percent: formatPercent(percentOf(reach.value.perPost, base)),
            })}
            badge={exampleBadge(t, reach)}
          />
          <KpiCard
            label={t('tenantOwner.reach.stories')}
            value={formatCount(stories.averageUniqueViewers)}
            note={t('tenantOwner.reach.storiesNote', {
              count: formatCount(stories.count),
              percent: formatPercent(percentOf(stories.averageUniqueViewers, base)),
            })}
          />
          <KpiCard
            label={t('tenantOwner.reach.watched')}
            value={formatPercent(videoPlayback.watchedPercent.value)}
            badge={exampleBadge(t, videoPlayback.watchedPercent)}
          />
          <KpiCard
            label={t('tenantOwner.reach.completion')}
            value={formatPercent(videoPlayback.completionPercent.value)}
            badge={exampleBadge(t, videoPlayback.completionPercent)}
          />
        </KpiGrid>
        <p className="text-xs text-text-secondary">{t('tenantOwner.reach.footnote')}</p>
      </PanelSection>

      {topFormat ? (
        <Collapsible
          title={t('tenantOwner.formats.title')}
          summary={t('tenantOwner.formats.summary', {
            format: t(`postTypes.${topFormat.type}`),
            perPost: formatCount(perPostOf(topFormat)),
          })}
        >
          <BarList
            rows={formats.map((row, i) => ({
              id: row.type,
              label: t(`postTypes.${row.type}`),
              value: perPostOf(row),
              display: formatCount(perPostOf(row)),
              rate: t('tenantOwner.formats.posts', { count: row.posts }),
              highlight: i === 0,
            }))}
          />
          <p className="text-xs text-text-secondary">
            {t('tenantOwner.formats.footnote', { count: formatPosts })}
          </p>
        </Collapsible>
      ) : null}

      {topCommunity ? (
        <Collapsible
          title={t('tenantOwner.communities.title')}
          summary={t('tenantOwner.communities.summary', {
            name: topCommunity.name,
            perPost: formatCount(perPostOf(topCommunity)),
          })}
        >
          <BarList
            rows={byCommunity.map((row) => ({
              id: row.id,
              label: row.exclusive
                ? t('tenantAdmin.communities.exclusive', { name: row.name })
                : row.name,
              value: perPostOf(row),
              display: formatCount(perPostOf(row)),
              rate: t('tenantOwner.formats.posts', { count: row.posts }),
              highlight: row.id === topCommunity.id,
            }))}
          />
          <p className="text-xs text-text-secondary">
            {t('tenantOwner.formats.footnote', { count: communityPosts })}
          </p>
        </Collapsible>
      ) : null}

      {bestDay && bestSlot ? (
        <Collapsible
          title={t('tenantOwner.bestTime.title')}
          summary={t('tenantOwner.bestTime.summary', {
            day: t(`tenantOwner.bestTime.weekday.${bestDay.weekday}`),
            from: bestSlot.fromHour,
            to: bestSlot.toHour,
          })}
        >
          <p className="text-xs font-bold text-text-secondary">{t('tenantOwner.bestTime.byDay')}</p>
          <BarList
            rows={publishing.byWeekday.map((row) => ({
              id: row.weekday,
              label: t(`tenantOwner.bestTime.weekday.${row.weekday}`),
              value: perPostOf(row),
              display: formatCount(perPostOf(row)),
              rate: t('tenantOwner.formats.posts', { count: row.posts }),
              highlight: row === bestDay,
            }))}
          />
          <p className="text-xs font-bold text-text-secondary">
            {t('tenantOwner.bestTime.bySlot')}
          </p>
          <BarList
            rows={publishing.bySlot.map((row) => ({
              id: `${row.fromHour}-${row.toHour}`,
              label: t('tenantOwner.bestTime.slot', { from: row.fromHour, to: row.toHour }),
              value: perPostOf(row),
              display: formatCount(perPostOf(row)),
              rate: t('tenantOwner.formats.posts', { count: row.posts }),
              highlight: row === bestSlot,
            }))}
          />
          <p className="text-xs text-text-secondary">{t('tenantOwner.bestTime.footnote')}</p>
        </Collapsible>
      ) : null}

      {topChannel ? (
        <Collapsible
          title={t('tenantOwner.channels.title')}
          summary={t('tenantOwner.channels.summary', {
            channel: t(`tenantOwner.channels.${topChannel.channel}`),
            count: formatCount(topChannel.count),
          })}
        >
          <BarList
            rows={channels.map((row) => ({
              id: row.channel,
              label: t(`tenantOwner.channels.${row.channel}`),
              value: row.count,
              display: formatCount(row.count),
              highlight: row.channel === topChannel.channel,
            }))}
          />
        </Collapsible>
      ) : null}
    </>
  );
}
