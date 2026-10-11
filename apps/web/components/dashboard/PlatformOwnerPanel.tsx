import {
  type PlatformOwnerAttention,
  platformOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import {
  type AttentionItem,
  AttentionList,
  BarList,
  KpiCard,
  KpiGrid,
  LineChart,
  ResponsiveTable,
  Sparkline,
  ToneLabel,
} from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { getTranslations } from 'next-intl/server';
import {
  type DashboardT,
  formatCount,
  formatDecimal,
  formatMegabytes,
  formatMonthShort,
  formatPercent,
  kpiDelta,
  moduleNamer,
} from './format';
import { PanelHeader } from './PanelHeader';
import { PanelSection } from './PanelSection';

function attentionItem(t: DashboardT, item: PlatformOwnerAttention): AttentionItem {
  if (item.kind === 'storage_near_limit') {
    return {
      id: item.id,
      tone: 'warning',
      tag: formatPercent(item.usedPercent),
      title: t('platformOwner.attention.storage.title'),
      detail: t('platformOwner.attention.storage.detail', {
        limit: formatPercent(item.failsAbovePercent),
      }),
    };
  }
  return {
    id: item.id,
    tone: 'warning',
    tag: t('platformOwner.attention.atRisk.tag', { count: item.count }),
    title: t('platformOwner.attention.atRisk.title', { name: item.clientName }),
    detail: t('platformOwner.attention.atRisk.detail', { days: item.daysWithoutStaffPost }),
  };
}

/**
 * Level 1, "Dono da plataforma": is the client base growing and using the product, and does the
 * infrastructure cost fit the plan? KPIs, what needs attention, the 12-month trend, where the members
 * are, module adoption and the clients, worst first.
 */
export async function PlatformOwnerPanel() {
  const t = await getTranslations('dashboard');
  const moduleName = await moduleNamer(t);
  const { kpis, attention, activeClientsByMonth, membersByClient, moduleAdoption, clients } =
    platformOwnerPanel;

  const totalMembers = membersByClient.reduce((sum, row) => sum + row.members, 0);
  const share = (members: number) => (totalMembers > 0 ? (members / totalMembers) * 100 : 0);
  const biggest = Math.max(
    0,
    ...membersByClient.filter((row) => row.kind === 'client').map((row) => row.members),
  );
  const lastMonth = activeClientsByMonth.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        title={t('platformOwner.header.title')}
        subtitle={t('platformOwner.header.subtitle')}
        period={t('platformOwner.header.period')}
      />

      <KpiGrid>
        <KpiCard
          label={t('platformOwner.kpi.activeClients')}
          value={formatCount(kpis.activeClients.count)}
          delta={kpiDelta(t, kpis.activeClients.delta)}
          chart={<Sparkline values={kpis.activeClients.series} />}
        />
        <KpiCard
          label={t('platformOwner.kpi.newClients')}
          value={formatCount(kpis.newClients.count)}
          delta={kpiDelta(t, kpis.newClients.delta)}
        />
        <KpiCard
          label={t('platformOwner.kpi.members')}
          value={formatCount(kpis.members.count)}
          delta={kpiDelta(t, kpis.members.delta)}
          note={t('platformOwner.kpi.membersNote', {
            percent: formatPercent(kpis.members.interactedPercent),
          })}
        />
        <KpiCard
          label={t('platformOwner.kpi.storage')}
          value={formatDecimal(kpis.storage.usedGb)}
          unit={t('platformOwner.kpi.storageUnit', { total: formatCount(kpis.storage.planGb) })}
          delta={kpiDelta(t, kpis.storage.delta)}
          note={t('platformOwner.kpi.storageNote', {
            minutes: formatCount(kpis.storage.videoMinutes),
          })}
        />
        <KpiCard
          label={t('platformOwner.kpi.revenue')}
          value={t('notMeasured')}
          note={t('platformOwner.kpi.revenueReason')}
          variant="missing"
        />
      </KpiGrid>

      <PanelSection title={t('platformOwner.attention.title')}>
        <AttentionList items={attention.map((item) => attentionItem(t, item))} />
      </PanelSection>

      <div className="grid gap-6 md:grid-cols-2">
        <PanelSection title={t('platformOwner.activeChart.title')}>
          <Card className="p-4">
            <LineChart
              series={activeClientsByMonth.map((m) => m.count)}
              xLabels={activeClientsByMonth.map((m, i) =>
                i % 2 === 0 || i === lastMonth ? formatMonthShort(m.month) : '',
              )}
              yStep={2}
              formatValue={formatCount}
              ariaLabel={t('platformOwner.activeChart.label')}
            />
          </Card>
        </PanelSection>

        <PanelSection
          title={t('platformOwner.membersByClient.title')}
          action={t('platformOwner.membersByClient.action')}
        >
          <BarList
            rows={membersByClient.map((row, i) => ({
              id: row.id,
              label:
                row.kind === 'client'
                  ? row.name
                  : t('platformOwner.membersByClient.others', { count: row.clients }),
              value: row.members,
              display: formatPercent(share(row.members)),
              highlight: i === 0,
            }))}
          />
          <p className="text-xs text-text-secondary">
            {t('platformOwner.membersByClient.concentration', {
              percent: formatPercent(share(biggest)),
            })}
          </p>
        </PanelSection>
      </div>

      <PanelSection title={t('platformOwner.adoption.title')}>
        <BarList
          max={100}
          rows={moduleAdoption.map((row) => ({
            id: row.module,
            label: moduleName(row.module),
            value: row.percent,
            display: formatPercent(row.percent),
          }))}
        />
        <p className="text-xs text-text-secondary">{t('platformOwner.adoption.footnote')}</p>
      </PanelSection>

      <PanelSection
        title={t('platformOwner.clients.title')}
        action={t('platformOwner.clients.action')}
      >
        <ResponsiveTable
          caption={t('platformOwner.clients.title')}
          columns={[
            { key: 'client', header: t('platformOwner.clients.columns.client') },
            { key: 'plan', header: t('platformOwner.clients.columns.plan'), hideOnPhone: true },
            { key: 'status', header: t('platformOwner.clients.columns.status') },
            { key: 'members', header: t('platformOwner.clients.columns.members'), numeric: true },
            {
              key: 'interacted',
              header: t('platformOwner.clients.columns.interacted'),
              numeric: true,
            },
            {
              key: 'posts',
              header: t('platformOwner.clients.columns.posts'),
              numeric: true,
              hideOnPhone: true,
            },
            {
              key: 'media',
              header: t('platformOwner.clients.columns.media'),
              numeric: true,
              hideOnPhone: true,
            },
          ]}
          rows={clients.map((client) => ({
            id: client.id,
            cells: {
              client: client.name,
              plan: t(`plans.${client.plan}`),
              status: (
                <ToneLabel tone={client.status === 'active' ? 'success' : 'warning'}>
                  {t(`clientStatus.${client.status}`)}
                </ToneLabel>
              ),
              members: formatCount(client.members),
              interacted: formatPercent(client.interactedPercent),
              posts: formatCount(client.posts30d),
              media: formatMegabytes(client.mediaMb),
            },
          }))}
        />
      </PanelSection>
    </div>
  );
}
