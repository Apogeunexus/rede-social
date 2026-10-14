import {
  previewTenant,
  type TenantAdminAttention,
  tenantAdminPanel,
} from '@rede-social/module-dashboard/fixtures';
import {
  type AttentionItem,
  BarList,
  Collapsible,
  KpiCard,
  KpiGrid,
  percentOf,
  ResponsiveTable,
} from '@rede-social/module-dashboard/ui';
import { getTranslations } from 'next-intl/server';
import {
  type DashboardT,
  formatClock,
  formatCount,
  formatDayMonth,
  formatDuration,
  formatPercent,
  kpiDelta,
} from './format';
import { PanelHeader } from './PanelHeader';
import { PanelSection } from './PanelSection';
import { TenantColumn } from './TenantColumn';

function attentionItem(t: DashboardT, item: TenantAdminAttention): AttentionItem {
  const base = `tenantAdmin.attention.${item.kind}`;
  switch (item.kind) {
    case 'support_waiting':
      return {
        id: item.id,
        tone: item.severity,
        tag: t(`${base}.tag`, { hours: item.oldestHours }),
        title: t(`${base}.title`, { count: item.conversations }),
        detail: t(`${base}.detail`, { name: item.oldestName, hours: item.oldestHours }),
      };
    case 'event_soon':
      return {
        id: item.id,
        tone: item.severity,
        tag: t(`${base}.tag`, { date: formatDayMonth(item.date), hour: item.startsAtHour }),
        title: t(`${base}.title`, {
          event: item.event,
          confirmed: formatCount(item.confirmed),
          capacity: formatCount(item.capacity),
        }),
        detail: t(`${base}.detail`),
      };
    default:
      return {
        id: item.id,
        tone: item.severity,
        tag: t(`${base}.tag`, { hours: item.hoursLeft }),
        title: t(`${base}.title`, { count: item.stories, hours: item.hoursLeft }),
        detail: t(`${base}.detail`),
      };
  }
}

/**
 * Level 5, "Admin do cliente": what needs me today, and what worked this week? What needs attention
 * sits behind the header bell; the KPIs come first (with who slipped into "em risco" this week), then
 * the posts that performed best, the period's videos, reels and stories (with the stories' aggregate
 * reach), and five closed sections: the metrics the app does not collect yet (one line each: what it
 * needs, never a value, D-03), events, communities, store and moderation.
 */
export async function TenantAdminPanel() {
  const t = await getTranslations('dashboard');
  const {
    attention,
    kpis,
    topPosts,
    postMetrics,
    videos,
    stories,
    events,
    communities,
    store,
    moderation,
  } = tenantAdminPanel;
  const topCommunity = communities[0];
  const moderationActions =
    moderation.removedComments + moderation.blocks + moderation.unblocks + moderation.roleChanges;
  const totalOrders = store.reduce((sum, row) => sum + row.orders, 0);
  const communityLabel = (row: (typeof communities)[number]) =>
    row.exclusive ? t('tenantAdmin.communities.exclusive', { name: row.name }) : row.name;
  const notCollected = [
    { key: 'reach', label: t('tenantAdmin.postMetrics.reach'), item: postMetrics.reach },
    {
      key: 'engagementPerView',
      label: t('tenantAdmin.postMetrics.engagementPerView'),
      item: postMetrics.engagementPerView,
    },
    { key: 'saves', label: t('tenantAdmin.postMetrics.saves'), item: postMetrics.saves },
    { key: 'shares', label: t('tenantAdmin.postMetrics.shares'), item: postMetrics.shares },
    { key: 'watched', label: t('tenantAdmin.videos.watched'), item: videos.watched },
    { key: 'completion', label: t('tenantAdmin.videos.completion'), item: videos.completion },
  ];

  return (
    <TenantColumn>
      <PanelHeader
        title={previewTenant.displayName}
        subtitle={t('tenantAdmin.header.subtitle')}
        period={t('tenantAdmin.header.period')}
        alerts={attention.map((item) => attentionItem(t, item))}
      />

      <KpiGrid>
        <KpiCard
          label={t('tenantAdmin.kpi.awaiting')}
          value={formatCount(kpis.awaitingReply.count)}
          note={t('tenantAdmin.kpi.awaitingNote', { hours: kpis.awaitingReply.oldestHours })}
        />
        <KpiCard
          label={t('tenantAdmin.kpi.firstResponse')}
          value={formatDuration(t, kpis.firstResponseMedian.minutes)}
          delta={kpiDelta(t, kpis.firstResponseMedian.delta)}
        />
        <KpiCard
          label={t('tenantAdmin.kpi.interacting')}
          value={formatCount(kpis.interacting.count)}
          delta={kpiDelta(t, kpis.interacting.delta)}
        />
        <KpiCard
          label={t('tenantAdmin.kpi.newMembers')}
          value={formatCount(kpis.newMembers.count)}
          delta={kpiDelta(t, kpis.newMembers.delta)}
          note={t('tenantAdmin.kpi.newMembersNote', {
            activated: formatCount(kpis.newMembers.activated),
            total: formatCount(kpis.newMembers.count),
            percent: formatPercent(percentOf(kpis.newMembers.activated, kpis.newMembers.count)),
          })}
        />
        <KpiCard
          label={t('tenantAdmin.kpi.enteredAtRisk')}
          value={formatCount(kpis.enteredAtRisk.count)}
          note={t('tenantAdmin.kpi.enteredAtRiskNote', {
            count: formatCount(kpis.enteredAtRisk.withPush),
          })}
        />
        <KpiCard
          label={t('tenantAdmin.kpi.orders')}
          value={formatCount(kpis.orders.count)}
          delta={kpiDelta(t, kpis.orders.delta)}
          note={t('tenantAdmin.kpi.ordersNote', { count: kpis.orders.manualGrants })}
        />
      </KpiGrid>

      <PanelSection
        title={t('tenantAdmin.topPosts.title')}
        action={t('tenantAdmin.topPosts.action')}
      >
        <ResponsiveTable
          caption={t('tenantAdmin.topPosts.title')}
          columns={[
            { key: 'date', header: t('tenantAdmin.topPosts.columns.date') },
            { key: 'type', header: t('tenantAdmin.topPosts.columns.type') },
            {
              key: 'community',
              header: t('tenantAdmin.topPosts.columns.community'),
              hideOnPhone: true,
            },
            { key: 'likes', header: t('tenantAdmin.topPosts.columns.likes'), numeric: true },
            { key: 'comments', header: t('tenantAdmin.topPosts.columns.comments'), numeric: true },
          ]}
          rows={topPosts.map((post) => ({
            id: post.id,
            cells: {
              date: formatDayMonth(post.date),
              type: t(`postTypes.${post.type}`),
              community: post.community,
              likes: formatCount(post.likes),
              comments: formatCount(post.comments),
            },
          }))}
        />
      </PanelSection>

      <PanelSection title={t('tenantAdmin.videos.title')}>
        <ResponsiveTable
          caption={t('tenantAdmin.videos.title')}
          columns={[
            { key: 'date', header: t('tenantAdmin.videos.columns.date') },
            { key: 'kind', header: t('tenantAdmin.videos.columns.kind') },
            {
              key: 'duration',
              header: t('tenantAdmin.videos.columns.duration'),
              numeric: true,
            },
          ]}
          rows={videos.rows.map((video) => ({
            id: video.id,
            cells: {
              date: formatDayMonth(video.date),
              kind: t(`tenantAdmin.videos.kinds.${video.kind}`),
              duration: formatClock(t, video.durationSeconds),
            },
          }))}
        />
        <p className="text-xs text-text-secondary">
          {t('tenantAdmin.videos.stories', {
            count: stories.count,
            viewers: formatCount(stories.averageUniqueViewers),
            percent: formatPercent(percentOf(stories.averageUniqueViewers, stories.memberBase)),
          })}
        </p>
      </PanelSection>

      <Collapsible
        title={t('tenantAdmin.notCollected.title')}
        summary={t('tenantAdmin.notCollected.summary', { count: notCollected.length })}
      >
        <ul className="flex flex-col gap-2">
          {notCollected.map(({ key, label, item }) => (
            <li key={key} className="flex flex-wrap gap-x-2 text-xs">
              <span className="font-bold text-text">{label}</span>
              <span className="text-text-secondary">{t(`notMeasuredReason.${item.reason}`)}</span>
            </li>
          ))}
        </ul>
      </Collapsible>

      <Collapsible
        title={t('tenantAdmin.events.title')}
        summary={t('tenantAdmin.events.summary', {
          percent: formatPercent(events.attendancePercent),
        })}
      >
        <BarList
          max={100}
          rows={events.rows.map((row, i) => ({
            id: row.id,
            label: row.name,
            value: row.percent,
            display: formatPercent(row.percent),
            highlight: i === 0,
          }))}
        />
        <p className="text-xs text-text-secondary">
          {t('tenantAdmin.events.footnote', {
            count: events.walkIns.count,
            event: events.walkIns.event,
          })}
        </p>
      </Collapsible>

      <Collapsible
        title={t('tenantAdmin.communities.title')}
        {...(topCommunity
          ? { summary: t('tenantAdmin.communities.summary', { name: topCommunity.name }) }
          : {})}
      >
        <BarList
          rows={communities.map((row, i) => ({
            id: row.id,
            label: communityLabel(row),
            value: row.interactions,
            display: formatCount(row.interactions),
            highlight: i === 0,
          }))}
        />
      </Collapsible>

      <Collapsible
        title={t('tenantAdmin.store.title')}
        summary={t('tenantAdmin.store.summary', { count: totalOrders })}
      >
        <BarList
          rows={store.map((row) => ({
            id: row.id,
            label: row.product,
            value: row.orders,
            display: formatCount(row.orders),
          }))}
        />
      </Collapsible>

      <Collapsible
        title={t('tenantAdmin.moderation.title')}
        summary={t('tenantAdmin.moderation.summary', { count: moderationActions })}
      >
        <KpiGrid>
          <KpiCard
            label={t('tenantAdmin.moderation.removed')}
            value={formatCount(moderation.removedComments)}
          />
          <KpiCard
            label={t('tenantAdmin.moderation.blocks')}
            value={formatCount(moderation.blocks)}
          />
          <KpiCard
            label={t('tenantAdmin.moderation.unblocks')}
            value={formatCount(moderation.unblocks)}
          />
          <KpiCard
            label={t('tenantAdmin.moderation.roleChanges')}
            value={formatCount(moderation.roleChanges)}
          />
        </KpiGrid>
      </Collapsible>
    </TenantColumn>
  );
}
