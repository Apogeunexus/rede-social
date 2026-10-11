import { platformOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import { KpiCard, KpiGrid, Sparkline } from '@rede-social/module-dashboard/ui';
import { getTranslations } from 'next-intl/server';
import { formatCount, formatDecimal, formatPercent, kpiDelta } from './format';

/** Level 1, "Dono da plataforma": the fixture numbers composed with catalog copy. */
export async function PlatformOwnerPanel() {
  const t = await getTranslations('dashboard');
  const { kpis } = platformOwnerPanel;

  return (
    <div className="flex flex-col gap-6">
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
    </div>
  );
}
