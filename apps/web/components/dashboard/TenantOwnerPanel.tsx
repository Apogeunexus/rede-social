import { formatBrl } from '@rede-social/contracts/money';
import { previewTenant, tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import {
  ActionCard,
  BarList,
  CohortHeatmap,
  Collapsible,
  ENGAGEMENT_BAND_ORDER,
  engagedPercent,
  KpiCard,
  KpiGrid,
  LineChart,
  percentOf,
  Sparkline,
  ToneLabel,
} from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { ChevronRight, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { previewLevelPath } from '@/lib/dashboard-preview';
import { BandsBarList } from './BandsBarList';
import {
  bandLabel,
  formatCount,
  formatDecimal,
  formatMonthAbbrev,
  formatPercent,
  kpiDelta,
} from './format';
import { PanelHeader } from './PanelHeader';
import { PanelSection, PreviewAction } from './PanelSection';
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
 * Level 4, "Dono do cliente": is the community growing, keeping its members and paying back? KPIs
 * (with "Engajados", computed from the bands), the 12-week trend against the 12 weeks before
 * (dashed), the engagement bands with who moved up or down, right after them a card to win back the
 * members in risk, where members interact, then closed: interactions per post by format and who buys
 * (orders by band), each with its headline as the summary; retention by joining month (one number on
 * a phone, the cohort heatmap from md), and the account, closed. Segments are counts only: no member
 * is named (D-02).
 */
export async function TenantOwnerPanel() {
  const t = await getTranslations('dashboard');
  const {
    kpis,
    weeklyInteracting,
    channels,
    cohorts,
    account,
    engagement,
    movement,
    atRiskWithPush,
    byFormat,
    ordersByBand,
  } = tenantOwnerPanel;
  const latest = cohorts.at(-1);
  const latestMonthOne = latest?.values[1];
  const columnCount = Math.max(0, ...cohorts.map((c) => c.values.length));
  const engaged = formatPercent(engagedPercent(engagement));
  const flows = [...movement.flows].sort((a, b) => b.members - a.members);
  const formats = [...byFormat].sort((a, b) => b.perPost - a.perPost);
  const topFormat = formats[0];
  const formatPosts = byFormat.reduce((sum, row) => sum + row.posts, 0);
  const totalOrders = ENGAGEMENT_BAND_ORDER.reduce((sum, band) => sum + ordersByBand[band], 0);

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
        <KpiCard
          label={t('tenantOwner.kpi.engaged')}
          value={engaged}
          delta={kpiDelta(t, kpis.engaged.delta)}
          note={t('actionsPerActiveMember', {
            actions: formatDecimal(kpis.engaged.actionsPerActiveMember, 1),
          })}
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

      <PanelSection title={t('bands.title')}>
        <BandsBarList t={t} bands={engagement} />
        <p className="text-xs text-text-secondary">
          {t('bands.newActivated', {
            activated: formatCount(engagement.newActivated),
            total: formatCount(engagement.counts.new),
          })}{' '}
          {t('bands.footnote')}
        </p>
        <KpiGrid>
          <KpiCard
            label={t('tenantOwner.movement.up')}
            value={formatCount(movement.up)}
            note={t('tenantOwner.movement.note')}
          />
          <KpiCard
            label={t('tenantOwner.movement.down')}
            value={formatCount(movement.down)}
            note={t('tenantOwner.movement.note')}
          />
        </KpiGrid>
        <Collapsible
          title={t('tenantOwner.movement.flowsTitle')}
          summary={t('tenantOwner.movement.flowsSummary', { count: flows.length })}
        >
          <BarList
            rows={flows.map((flow) => ({
              id: `${flow.from}-${flow.to}`,
              label: t('bands.flow', {
                from: bandLabel(t, flow.from),
                to: bandLabel(t, flow.to),
              }),
              value: flow.members,
              display: formatCount(flow.members),
              highlight: flow.to === 'at_risk',
            }))}
          />
        </Collapsible>
      </PanelSection>

      <ActionCard
        icon={HeartHandshake}
        title={t('tenantOwner.recover.title')}
        detail={t('tenantOwner.recover.detail', {
          atRisk: formatCount(engagement.counts.at_risk),
          withPush: formatCount(atRiskWithPush),
        })}
        action={<PreviewAction variant="outline">{t('tenantOwner.recover.action')}</PreviewAction>}
      />

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

      {topFormat ? (
        <Collapsible
          title={t('tenantOwner.formats.title')}
          summary={t('tenantOwner.formats.summary', {
            format: t(`postTypes.${topFormat.type}`),
            perPost: formatCount(topFormat.perPost),
          })}
        >
          <BarList
            rows={formats.map((row, i) => ({
              id: row.type,
              label: t(`postTypes.${row.type}`),
              value: row.perPost,
              display: formatCount(row.perPost),
              rate: t('tenantOwner.formats.posts', { count: row.posts }),
              highlight: i === 0,
            }))}
          />
          <p className="text-xs text-text-secondary">
            {t('tenantOwner.formats.footnote', { count: formatPosts })}
          </p>
        </Collapsible>
      ) : null}

      <Collapsible
        title={t('tenantOwner.buyers.title')}
        summary={t('tenantOwner.buyers.sentence', {
          orders: formatPercent(
            percentOf(ordersByBand.superfan + ordersByBand.engaged, totalOrders),
          ),
          members: engaged,
        })}
      >
        <BarList
          max={totalOrders}
          rows={ENGAGEMENT_BAND_ORDER.map((band) => ({
            id: band,
            label: bandLabel(t, band),
            value: ordersByBand[band],
            display: formatCount(ordersByBand[band]),
            rate: formatPercent(percentOf(ordersByBand[band], totalOrders)),
            highlight: band === 'superfan' || band === 'engaged',
          }))}
        />
        <p className="text-xs text-text-secondary">{t('tenantOwner.buyers.footnote')}</p>
      </Collapsible>

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
