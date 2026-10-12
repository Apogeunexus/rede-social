import {
  type PlatformAdminPending,
  platformAdminPanel,
} from '@rede-social/module-dashboard/fixtures';
import {
  type AttentionItem,
  BarList,
  funnelRates,
  KpiCard,
  KpiGrid,
  largestDrop,
  ResponsiveTable,
  ToneLabel,
} from '@rede-social/module-dashboard/ui';
import { getTranslations } from 'next-intl/server';
import {
  type DashboardT,
  formatCount,
  formatPercent,
  formatRatio,
  hintDelta,
  kpiDelta,
  momentText,
} from './format';
import { PanelHeader } from './PanelHeader';
import { PanelSection } from './PanelSection';

function pendingItem(t: DashboardT, item: PlatformAdminPending): AttentionItem {
  const base = `platformAdmin.pending.${item.kind}`;
  switch (item.kind) {
    case 'domain_expired':
      return {
        id: item.id,
        tone: 'danger',
        tag: t(`${base}.tag`),
        title: t(`${base}.title`, { name: item.clientName }),
        detail: t(`${base}.detail`, { host: item.host }),
      };
    case 'domain_deadline':
      return {
        id: item.id,
        tone: 'warning',
        tag: t(`${base}.tag`, { hours: item.hoursLeft }),
        title: t(`${base}.title`, { name: item.clientName }),
        detail: t(`${base}.detail`, { hours: item.hoursLeft }),
      };
    case 'invite_pending':
      return {
        id: item.id,
        tone: 'warning',
        tag: t(`${base}.tag`, { days: item.daysSinceSent }),
        title: t(`${base}.title`, { name: item.clientName }),
        detail: t(`${base}.detail`, { days: item.daysSinceSent }),
      };
    case 'engagement_drop':
      return {
        id: item.id,
        tone: 'warning',
        tag: t(`${base}.tag`, { points: item.fromPercent - item.toPercent }),
        title: t(`${base}.title`, { name: item.clientName }),
        detail: t(`${base}.detail`, {
          from: formatPercent(item.fromPercent),
          to: formatPercent(item.toPercent),
        }),
      };
    default:
      return {
        id: item.id,
        tone: 'warning',
        tag: t(`${base}.tag`, { count: item.failures }),
        title: t(`${base}.title`, { name: item.clientName }),
        detail: t(`${base}.detail`, { count: item.failures }),
      };
  }
}

/**
 * Level 2, "Admin da plataforma": which client is stuck in activation or broken right now? The
 * deadlines and engagement drops sit behind the header bell; the KPIs come first (with push reach),
 * then the activation funnel up to "10+ active members" (each step's rate computed from the counts)
 * and the last 24 h of failures per client, stalled videos included. Both sections are full width:
 * a 6-column table does not fit half the container without a sideways scroll.
 */
export async function PlatformAdminPanel() {
  const t = await getTranslations('dashboard');
  const { pending, kpis, activation, failures24h } = platformAdminPanel;

  const counts = activation.map((step) => step.clients);
  const rates = funnelRates(counts);
  const stuck = largestDrop(counts);
  const stuckStep = stuck ? activation[stuck.index] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        title={t('platformAdmin.header.title')}
        subtitle={t('platformAdmin.header.subtitle')}
        alerts={pending.map((item) => pendingItem(t, item))}
      />

      <KpiGrid>
        <KpiCard
          label={t('platformAdmin.kpi.unverifiedDomains')}
          value={formatCount(kpis.unverifiedDomains.count)}
          delta={hintDelta(t, kpis.unverifiedDomains.hint)}
        />
        <KpiCard
          label={t('platformAdmin.kpi.pendingInvites')}
          value={formatCount(kpis.pendingInvites.count)}
          delta={hintDelta(t, kpis.pendingInvites.hint)}
        />
        <KpiCard
          label={t('platformAdmin.kpi.clientsWithoutOwner')}
          value={formatCount(kpis.clientsWithoutOwner.count)}
          delta={hintDelta(t, kpis.clientsWithoutOwner.hint)}
        />
        <KpiCard
          label={t('platformAdmin.kpi.mediaFailures24h')}
          value={formatCount(kpis.mediaFailures24h.count)}
          delta={kpiDelta(t, kpis.mediaFailures24h.delta)}
        />
        <KpiCard
          label={t('platformAdmin.kpi.pushFailures')}
          value={formatCount(kpis.pushFailures.count)}
          delta={kpiDelta(t, kpis.pushFailures.delta)}
        />
        <KpiCard
          label={t('platformAdmin.kpi.pushReach')}
          value={formatPercent(kpis.pushReach.percent)}
          note={t('platformAdmin.kpi.pushReachNote')}
        />
      </KpiGrid>

      <PanelSection
        title={t('platformAdmin.activation.title')}
        action={t('platformAdmin.activation.action')}
      >
        <BarList
          max={counts[0] ?? 0}
          rows={activation.map((step, i) => {
            const rate = rates[i];
            return {
              id: step.step,
              label: t(`platformAdmin.activation.steps.${step.step}`),
              value: step.clients,
              display: formatCount(step.clients),
              ...(rate === null || rate === undefined ? {} : { rate: formatRatio(rate) }),
            };
          })}
        />
        {stuck && stuckStep ? (
          <p className="text-xs text-text-secondary">
            {t('platformAdmin.activation.stuck', {
              step: t(`platformAdmin.activation.steps.${stuckStep.step}`),
              count: stuck.drop,
            })}
          </p>
        ) : null}
      </PanelSection>

      <PanelSection title={t('platformAdmin.failures.title')}>
        <ResponsiveTable
          caption={t('platformAdmin.failures.title')}
          columns={[
            { key: 'client', header: t('platformAdmin.failures.columns.client') },
            { key: 'media', header: t('platformAdmin.failures.columns.media'), numeric: true },
            { key: 'push', header: t('platformAdmin.failures.columns.push'), numeric: true },
            {
              key: 'stalledVideos',
              header: t('platformAdmin.failures.columns.stalledVideos'),
              numeric: true,
            },
            {
              key: 'lastPost',
              header: t('platformAdmin.failures.columns.lastPost'),
              hideOnPhone: true,
            },
            { key: 'status', header: t('platformAdmin.failures.columns.status') },
          ]}
          rows={failures24h.map((row) => ({
            id: row.id,
            cells: {
              client: row.clientName,
              media: formatCount(row.media),
              push: formatCount(row.push),
              stalledVideos: formatCount(row.stalledVideos),
              lastPost: momentText(t, row.lastPost),
              status: (
                <ToneLabel tone={row.status === 'active' ? 'success' : 'warning'}>
                  {t(`clientStatus.${row.status}`)}
                </ToneLabel>
              ),
            },
          }))}
        />
      </PanelSection>
    </div>
  );
}
