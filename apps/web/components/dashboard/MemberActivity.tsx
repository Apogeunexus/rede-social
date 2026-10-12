import { memberPanel, type ReportValue } from '@rede-social/module-dashboard/fixtures';
import { KpiCard, KpiGrid } from '@rede-social/module-dashboard/ui';
import { getTranslations } from 'next-intl/server';
import { type DashboardT, formatCount, kpiDelta } from './format';
import { PanelSection } from './PanelSection';

/** The "exemplo" pill text for a fictional value; nothing for a measured one (D-03). */
function exampleBadge(t: DashboardT, metric: ReportValue<unknown>): string | undefined {
  return metric.example ? t('member.activity.example') : undefined;
}

/**
 * Level 7's "Sua atividade": the member's OWN activity over the last 7 days, like Instagram's.
 * Own data only, never another member's and never the member's engagement band (D-01). A metric the
 * app does not collect yet shows a fictional value with the "exemplo" pill, derived from the data's
 * `example` flag and never from a position; its collection reason is never shown here (D-03). The
 * deltas are neutral: the report describes the member's behaviour, it never grades it.
 */
export async function MemberActivity() {
  const t = await getTranslations('dashboard');
  const { engagement } = memberPanel.activity;
  const engagementCards = [
    { key: 'likes', metric: engagement.likes },
    { key: 'comments', metric: engagement.comments },
    { key: 'saves', metric: engagement.saves },
    { key: 'shares', metric: engagement.shares },
  ] as const;

  return (
    <PanelSection title={t('member.activity.title')} period={t('member.activity.period')}>
      <div className="flex flex-col gap-6">
        <PanelSection as="h4" title={t('member.activity.engagement.title')}>
          <KpiGrid>
            {engagementCards.map(({ key, metric }) => (
              <KpiCard
                key={key}
                label={t(`member.activity.engagement.${key}`)}
                value={formatCount(metric.value.count)}
                delta={kpiDelta(t, metric.value.delta)}
                badge={exampleBadge(t, metric)}
              />
            ))}
          </KpiGrid>
        </PanelSection>
      </div>
    </PanelSection>
  );
}
