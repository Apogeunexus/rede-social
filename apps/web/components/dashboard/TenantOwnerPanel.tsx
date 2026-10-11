import { formatBrl } from '@rede-social/contracts/money';
import { previewTenant, tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import {
  BarList,
  CohortHeatmap,
  Collapsible,
  KpiCard,
  KpiGrid,
  LineChart,
  Sparkline,
  ToneLabel,
} from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { previewLevelPath } from '@/lib/dashboard-preview';
import { formatCount, formatMonthAbbrev, formatPercent, kpiDelta } from './format';
import { PanelHeader } from './PanelHeader';
import { PanelSection } from './PanelSection';
import { TenantColumn } from './TenantColumn';

/** A legend swatch that repeats the line's own stroke, so the series differ by pattern, not colour. */
function LegendStroke({ dashed }: { dashed: boolean }) {
  return (
    <svg aria-hidden width={24} height={8} className={dashed ? 'text-text-tertiary' : 'text-brand'}>
      <line
        x1={0}
        x2={24}
        y1={4}
        y2={4}
        stroke="currentColor"
        strokeWidth={dashed ? 2 : 2.5}
        {...(dashed ? { strokeDasharray: '5 5' } : {})}
      />
    </svg>
  );
}

/**
 * Level 4, "Dono do cliente": is the community growing, keeping its members and paying back? KPIs,
 * the 12-week trend against the 12 weeks before (dashed), where members interact, retention by
 * joining month (one number on a phone, the cohort heatmap from md) and the account, closed.
 */
export async function TenantOwnerPanel() {
  const t = await getTranslations('dashboard');
  const { kpis, weeklyInteracting, channels, cohorts, account } = tenantOwnerPanel;
  const latest = cohorts.at(-1);
  const latestMonthOne = latest?.values[1];
  const columnCount = Math.max(0, ...cohorts.map((c) => c.values.length));

  return (
    <TenantColumn>
      <PanelHeader
        title={previewTenant.displayName}
        subtitle={t('tenantOwner.header.subtitle')}
        period={t('tenantOwner.header.period')}
      />

      <KpiGrid>
        <KpiCard
          label={t('tenantOwner.kpi.members')}
          value={formatCount(kpis.members.count)}
          delta={kpiDelta(t, kpis.members.delta)}
          note={t('tenantOwner.kpi.membersNote', { count: formatCount(kpis.members.newMembers) })}
        />
        <KpiCard
          label={t('tenantOwner.kpi.interacting')}
          value={formatPercent(kpis.interacting.percent)}
          delta={kpiDelta(t, kpis.interacting.delta)}
          chart={<Sparkline values={kpis.interacting.series} />}
        />
        <KpiCard
          label={t('tenantOwner.kpi.retention')}
          value={formatPercent(kpis.newMemberRetention.percent)}
          delta={kpiDelta(t, kpis.newMemberRetention.delta)}
          note={t('tenantOwner.kpi.retentionNote', {
            joined: formatMonthAbbrev(kpis.newMemberRetention.joinedMonth),
            returned: formatMonthAbbrev(kpis.newMemberRetention.returnedMonth),
          })}
        />
        <KpiCard
          label={t('tenantOwner.kpi.attendance')}
          value={formatPercent(kpis.eventAttendance.percent)}
          delta={kpiDelta(t, kpis.eventAttendance.delta)}
          note={t('tenantOwner.kpi.attendanceNote')}
        />
        <KpiCard
          label={t('tenantOwner.kpi.orderValue')}
          value={formatBrl(kpis.orderValue.cents)}
          delta={kpiDelta(t, kpis.orderValue.delta)}
          note={t('tenantOwner.kpi.orderValueNote')}
        />
      </KpiGrid>

      <PanelSection title={t('tenantOwner.weekly.title')}>
        <Card className="flex flex-col gap-3 p-4">
          <LineChart
            series={weeklyInteracting.current}
            previous={weeklyInteracting.previous}
            xLabels={weeklyInteracting.current.map((_, i) =>
              (i + 1) % 4 === 0 ? t('tenantOwner.weekly.week', { week: i + 1 }) : '',
            )}
            yStep={50}
            formatValue={formatCount}
            ariaLabel={t('tenantOwner.weekly.label')}
          />
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
            <li className="flex items-center gap-2">
              <LegendStroke dashed={false} />
              {t('tenantOwner.weekly.current')}
            </li>
            <li className="flex items-center gap-2">
              <LegendStroke dashed />
              {t('tenantOwner.weekly.previous')}
            </li>
          </ul>
        </Card>
      </PanelSection>

      <PanelSection title={t('tenantOwner.channels.title')}>
        <BarList
          rows={channels.map((row, i) => ({
            id: row.channel,
            label: t(`tenantOwner.channels.${row.channel}`),
            value: row.count,
            display: formatCount(row.count),
            highlight: i === 0,
          }))}
        />
      </PanelSection>

      <PanelSection title={t('tenantOwner.retention.title')}>
        {latest && latestMonthOne !== undefined ? (
          <div className="@3xl:hidden">
            <KpiCard
              label={t('tenantOwner.retention.phoneLabel')}
              value={formatPercent(latestMonthOne)}
              note={t('tenantOwner.retention.phoneNote', {
                month: formatMonthAbbrev(latest.month),
              })}
            />
          </div>
        ) : null}
        <div className="hidden flex-col gap-2 @3xl:flex">
          <CohortHeatmap
            caption={t('tenantOwner.retention.title')}
            corner={t('tenantOwner.retention.corner')}
            columns={Array.from({ length: columnCount }, (_, n) =>
              t('tenantOwner.retention.column', { n }),
            )}
            rows={cohorts.map((cohort) => ({
              label: formatMonthAbbrev(cohort.month),
              values: cohort.values,
            }))}
            formatValue={formatPercent}
          />
          <p className="text-xs text-text-secondary">{t('tenantOwner.retention.footnote')}</p>
        </div>
      </PanelSection>

      <Collapsible
        title={t('tenantOwner.account.title')}
        summary={
          <span className="inline-flex flex-wrap items-center gap-2">
            {t('tenantOwner.account.plan', { plan: t(`plans.${account.plan}`) })}
            <ToneLabel tone={account.domainStatus === 'verified' ? 'success' : 'warning'}>
              {t(`tenantOwner.account.domainStatus.${account.domainStatus}`)}
            </ToneLabel>
          </span>
        }
      >
        <ul className="flex flex-col gap-1.5 text-xs text-text-secondary [overflow-wrap:anywhere]">
          <li>{t('tenantOwner.account.domain', { domain: account.domain })}</li>
          <li>
            {t('tenantOwner.account.team', {
              admins: formatCount(account.admins),
              staff: formatCount(account.staff),
            })}
          </li>
          <li>{t('tenantOwner.account.billing')}</li>
        </ul>
      </Collapsible>

      <Link
        href={previewLevelPath('admin-do-cliente')}
        className="inline-flex items-center gap-1 self-start rounded-md text-sm font-bold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {t('tenantOwner.adminLink')}
        <ChevronRight aria-hidden size={16} />
      </Link>
    </TenantColumn>
  );
}
