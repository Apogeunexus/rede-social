import { tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import {
  BarList,
  Collapsible,
  KpiCard,
  KpiGrid,
  LineChart,
  percentOf,
  sumOf,
} from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { getTranslations } from 'next-intl/server';
import { ExamplePill } from './ExamplePill';
import {
  exampleBadge,
  formatCount,
  formatDuration,
  formatHoursMinutes,
  formatPercent,
  formatRatio,
  kpiDelta,
} from './format';
import { PanelSection } from './PanelSection';

/**
 * Level 4, "Atendimento": the queue now and the weekly first-response median (the same numbers as
 * level 5), then closed: conversations per week, per subject (an example: no subject is recorded
 * yet; the closed block names the leading subject, C-5), answered per person of the client's team (staff names only, never a member's) and
 * moderation with its removal rate.
 */
export async function OwnerSupport() {
  const t = await getTranslations('dashboard');
  const { support, moderation, channels } = tenantOwnerPanel;
  const { awaiting, firstResponse, weeklyConversations, bySubject, answeredByStaff } = support;
  const evenWeeks = (values: readonly number[]) =>
    values.map((_, i) => ((i + 1) % 2 === 0 ? t('tenantOwner.weekly.week', { week: i + 1 }) : ''));
  const median = firstResponse.weeklyMedianMinutes.at(-1);
  const subjects = [...bySubject.value].sort((a, b) => b.conversations - a.conversations);
  const subjectTotal = sumOf(subjects, (row) => row.conversations);
  const leader = subjects[0];
  const staff = [...answeredByStaff].sort((a, b) => b.conversations - a.conversations);
  const comments = channels.find((row) => row.channel === 'comments')?.count ?? 0;
  const removalRate = comments > 0 ? moderation.removedComments / comments : 0;

  return (
    <>
      <PanelSection title={t('tenantOwner.queue.title')}>
        <KpiGrid>
          <KpiCard label={t('tenantOwner.queue.awaiting')} value={formatCount(awaiting.count)} />
          <KpiCard
            label={t('tenantOwner.queue.oldest')}
            value={formatHoursMinutes(t, awaiting.oldestHours * 60)}
          />
        </KpiGrid>
      </PanelSection>

      {median !== undefined ? (
        <PanelSection title={t('tenantOwner.firstResponse.title')}>
          <KpiCard
            label={t('tenantOwner.firstResponse.median')}
            value={formatDuration(t, median)}
            delta={kpiDelta(t, firstResponse.delta)}
            chart={
              <LineChart
                series={firstResponse.weeklyMedianMinutes}
                xLabels={evenWeeks(firstResponse.weeklyMedianMinutes)}
                yStep={30}
                formatValue={(value) => formatDuration(t, value)}
                ariaLabel={t('tenantOwner.firstResponse.chartLabel')}
              />
            }
          />
        </PanelSection>
      ) : null}

      <Collapsible
        title={t('tenantOwner.volume.title')}
        summary={t('tenantOwner.volume.summary', {
          count: formatCount(sumOf(weeklyConversations.slice(-4), (n) => n)),
        })}
      >
        <Card className="p-4">
          <LineChart
            series={weeklyConversations}
            xLabels={evenWeeks(weeklyConversations)}
            yStep={5}
            formatValue={formatCount}
            ariaLabel={t('tenantOwner.volume.chartLabel')}
          />
        </Card>
      </Collapsible>

      <Collapsible
        title={t('tenantOwner.subjects.title')}
        summary={
          <span className="inline-flex flex-wrap items-center gap-2">
            {leader
              ? t('tenantOwner.subjects.summary', {
                  subject: t(`tenantOwner.subjects.${leader.subject}`),
                  count: formatCount(leader.conversations),
                  percent: formatPercent(percentOf(leader.conversations, subjectTotal)),
                })
              : null}
            <ExamplePill text={exampleBadge(t, bySubject)} />
          </span>
        }
      >
        <BarList
          rows={subjects.map((row, i) => ({
            id: row.subject,
            label: t(`tenantOwner.subjects.${row.subject}`),
            value: row.conversations,
            display: formatCount(row.conversations),
            rate: formatPercent(percentOf(row.conversations, subjectTotal)),
            highlight: i === 0,
          }))}
        />
      </Collapsible>

      <Collapsible
        title={t('tenantOwner.team.title')}
        summary={t('tenantOwner.team.summary', {
          count: formatCount(sumOf(staff, (row) => row.conversations)),
          people: staff.length,
        })}
      >
        <BarList
          rows={staff.map((row, i) => ({
            id: row.id,
            label: row.name,
            value: row.conversations,
            display: formatCount(row.conversations),
            highlight: i === 0,
          }))}
        />
      </Collapsible>

      <Collapsible
        title={t('tenantOwner.moderation.title')}
        summary={t('tenantOwner.moderation.summary', { rate: formatRatio(removalRate) })}
      >
        <KpiGrid>
          <KpiCard
            label={t('tenantAdmin.moderation.removed')}
            value={formatCount(moderation.removedComments)}
          />
          <KpiCard
            label={t('tenantOwner.moderation.rate')}
            value={formatRatio(removalRate)}
            note={t('tenantOwner.moderation.rateNote', {
              removed: formatCount(moderation.removedComments),
              total: formatCount(comments),
            })}
          />
          <KpiCard
            label={t('tenantAdmin.moderation.blocks')}
            value={formatCount(moderation.blocks)}
          />
          <KpiCard
            label={t('tenantAdmin.moderation.unblocks')}
            value={formatCount(moderation.unblocks)}
          />
        </KpiGrid>
      </Collapsible>
    </>
  );
}
