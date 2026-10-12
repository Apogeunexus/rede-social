import { formatBrl } from '@rede-social/contracts/money';
import { tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import {
  attendancePercent,
  bandTotal,
  Collapsible,
  engagedPercent,
  interactedCount,
  interactedPercent,
  KpiCard,
  KpiGrid,
  LineChart,
  perItem,
  sumOf,
  ToneLabel,
} from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { previewLevelPath } from '@/lib/dashboard-preview';
import { formatCount, formatDecimal, formatPercent, kpiDelta } from './format';
import { PanelSection } from './PanelSection';

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
 * Level 4, "Visão geral": one number from each area (members, engaged, interactions per post, event
 * attendance, the month's sales, conversations waiting), the 12-week trend against the 12 weeks
 * before (dashed) with the base's "interagiu" share, then the account, closed, and the link to the
 * admin's panel. Every percent and per-post figure is computed from the raw counts.
 */
export async function OwnerOverview() {
  const t = await getTranslations('dashboard');
  const { kpis, weeklyInteracting, account, engagement, byCommunity, events, support } =
    tenantOwnerPanel;
  const posts = sumOf(byCommunity, (row) => row.posts);
  const interactions = sumOf(byCommunity, (row) => row.interactions);

  return (
    <>
      <KpiGrid>
        <KpiCard
          label={t('tenantOwner.kpi.members')}
          value={formatCount(kpis.members.count)}
          delta={kpiDelta(t, kpis.members.delta)}
          note={t('tenantOwner.kpi.membersNote', { count: formatCount(kpis.members.newMembers) })}
        />
        <KpiCard
          label={t('tenantOwner.kpi.engaged')}
          value={formatPercent(engagedPercent(engagement))}
          delta={kpiDelta(t, kpis.engaged.delta)}
          note={t('actionsPerActiveMember', {
            actions: formatDecimal(kpis.engaged.actionsPerActiveMember, 1),
          })}
        />
        <KpiCard
          label={t('tenantOwner.kpi.perPost')}
          value={formatCount(perItem(interactions, posts))}
          note={t('tenantOwner.kpi.perPostNote', { posts: formatCount(posts) })}
        />
        <KpiCard
          label={t('tenantOwner.kpi.attendance')}
          value={formatPercent(attendancePercent(events.past))}
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
          label={t('tenantOwner.kpi.awaiting')}
          value={formatCount(support.awaiting.count)}
          note={t('tenantOwner.kpi.awaitingNote', { hours: support.awaiting.oldestHours })}
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
        <p className="text-xs text-text-secondary">
          {t('tenantOwner.weekly.share', {
            percent: formatPercent(interactedPercent(engagement)),
            count: formatCount(interactedCount(engagement)),
            total: formatCount(bandTotal(engagement)),
          })}
        </p>
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
    </>
  );
}
