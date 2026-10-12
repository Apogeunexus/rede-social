import { tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import {
  ActionCard,
  BarList,
  bandTotal,
  CohortHeatmap,
  Collapsible,
  KpiCard,
  KpiGrid,
  LineChart,
  percentOf,
} from '@rede-social/module-dashboard/ui';
import { Card, Chip } from '@rede-social/ui';
import { HeartHandshake } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { OWNER_BANDS_ANCHOR, ownerMembersHref } from '@/lib/owner-communities';
import { BandMembers } from './BandMembers';
import {
  bandLabel,
  communityLabel,
  formatChange,
  formatCount,
  formatMonthAbbrev,
  formatPercent,
  formatSignedCount,
} from './format';
import { PanelSection, PreviewAction } from './PanelSection';

/** An allow-listed community's row and bands; a missing entry is a fixture bug, so it fails loud. */
function communityScope(id: string) {
  const community = tenantOwnerPanel.byCommunity.find((row) => row.id === id);
  const entry = tenantOwnerPanel.communityEngagement.find((row) => row.id === id);
  if (!community || !entry) throw new Error(`no engagement bands for community ${id}`);
  return { community, bands: entry.bands };
}

/**
 * Level 4, "Membros": growth (who joined and left in 30 days, the balance against the members KPI's
 * change, new members per week), the engagement bands with who moved up or down, right after them
 * a card to win back the members in risk, then retention by joining month (one number on a phone,
 * the cohort heatmap from `@3xl`).
 *
 * The bands have a community scope (`?comunidade=`, quick 261012-pkd D-01; who moved stays whole-base)
 * and each band opens a named list of its members (D-02). Those lists are the only place this panel
 * names a member, to the client's own team (D-03); every other block is counts only.
 */
export async function OwnerMembers({ community }: { community: string | null }) {
  const t = await getTranslations('dashboard');
  const { kpis, growth, cohorts, engagement, byCommunity, movement, atRiskWithPush } =
    tenantOwnerPanel;
  const scope = community ? communityScope(community) : null;
  const scopeBands = scope?.bands ?? engagement;
  const balance = growth.joined - growth.left;
  const latest = cohorts.at(-1);
  const latestMonthOne = latest?.values[1];
  const columnCount = Math.max(0, ...cohorts.map((c) => c.values.length));
  const flows = [...movement.flows].sort((a, b) => b.members - a.members);

  return (
    <>
      <PanelSection title={t('tenantOwner.growth.title')}>
        <KpiGrid>
          <KpiCard
            label={t('tenantOwner.growth.joined')}
            value={formatCount(growth.joined)}
            note={t('tenantOwner.growth.note')}
          />
          <KpiCard
            label={t('tenantOwner.growth.left')}
            value={formatCount(growth.left)}
            note={t('tenantOwner.growth.note')}
          />
        </KpiGrid>
        <p className="text-xs text-text-secondary">
          {t('tenantOwner.growth.balance', {
            balance: formatSignedCount(balance),
            percent: formatChange(percentOf(balance, kpis.members.count - balance) / 100),
          })}
        </p>
        <Card className="flex flex-col gap-3 p-4">
          <p className="text-xs font-bold text-text-secondary">
            {t('tenantOwner.growth.weeklyTitle')}
          </p>
          <LineChart
            series={growth.weeklyJoined}
            xLabels={growth.weeklyJoined.map((_, i) =>
              (i + 1) % 4 === 0 ? t('tenantOwner.weekly.week', { week: i + 1 }) : '',
            )}
            yStep={5}
            formatValue={formatCount}
            ariaLabel={t('tenantOwner.growth.weeklyLabel')}
          />
        </Card>
      </PanelSection>

      <PanelSection id={OWNER_BANDS_ANCHOR} title={t('bands.title')}>
        <nav aria-label={t('tenantOwner.bandScope.label')}>
          <ul className="flex flex-wrap gap-2">
            <li>
              <Chip href={ownerMembersHref(null)} active={community === null}>
                {t('tenantOwner.bandScope.all')}
              </Chip>
            </li>
            {byCommunity.map((row) => (
              <li key={row.id}>
                <Chip href={ownerMembersHref(row.id)} active={row.id === community}>
                  {communityLabel(t, row)}
                </Chip>
              </li>
            ))}
          </ul>
        </nav>
        {scope ? (
          <p className="text-xs text-text-secondary">
            {t('tenantOwner.bandScope.note', {
              community: communityLabel(t, scope.community),
              count: bandTotal(scope.bands),
            })}
          </p>
        ) : null}
        <BandMembers t={t} bands={scopeBands} community={community} />
        <p className="text-xs text-text-secondary">
          {t('bands.newActivated', {
            activated: formatCount(scopeBands.newActivated),
            total: formatCount(scopeBands.counts.new),
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
        {scope ? (
          <p className="text-xs text-text-secondary">{t('tenantOwner.bandScope.movementNote')}</p>
        ) : null}
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
    </>
  );
}
