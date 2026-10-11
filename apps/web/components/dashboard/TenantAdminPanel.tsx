import {
  previewTenant,
  type TenantAdminAttention,
  tenantAdminPanel,
} from '@rede-social/module-dashboard/fixtures';
import {
  type AttentionItem,
  AttentionList,
  BarList,
  Collapsible,
  KpiCard,
  KpiGrid,
  ResponsiveTable,
} from '@rede-social/module-dashboard/ui';
import { getTranslations } from 'next-intl/server';
import {
  type DashboardT,
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
    case 'event_today':
      return {
        id: item.id,
        tone: item.severity,
        tag: t(`${base}.tag`, { hour: item.startsAtHour }),
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
 * comes FIRST, then six KPIs, the posts that performed best, and four closed sections (events,
 * communities, store, moderation).
 */
export async function TenantAdminPanel() {
  const t = await getTranslations('dashboard');
  const { attention, kpis, topPosts, events, communities, store, moderation } = tenantAdminPanel;
  const topCommunity = communities[0];
  const moderationActions =
    moderation.removedComments + moderation.blocks + moderation.unblocks + moderation.roleChanges;
  const totalOrders = store.reduce((sum, row) => sum + row.orders, 0);
  const communityLabel = (row: (typeof communities)[number]) =>
    row.exclusive ? t('tenantAdmin.communities.exclusive', { name: row.name }) : row.name;

  return (
    <TenantColumn>
      <PanelHeader
        title={previewTenant.displayName}
        subtitle={t('tenantAdmin.header.subtitle')}
        period={t('tenantAdmin.header.period')}
      />

      <PanelSection title={t('tenantAdmin.attention.title', { count: attention.length })}>
        <AttentionList items={attention.map((item) => attentionItem(t, item))} />
      </PanelSection>

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
        />
        <KpiCard
          label={t('tenantAdmin.kpi.perPost')}
          value={formatCount(kpis.interactionsPerPost.count)}
          delta={kpiDelta(t, kpis.interactionsPerPost.delta)}
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
