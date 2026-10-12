import { type OwnerBandScope, tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
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
import {
  OWNER_BANDS_ANCHOR,
  OWNER_COMMUNITIES,
  OWNER_EVENTS,
  type OwnerMembersView,
  ownerScopeHref,
} from '@/lib/owner-band-scope';
import { BandMembers } from './BandMembers';
import {
  bandLabel,
  communityLabel,
  type DashboardT,
  formatChange,
  formatCount,
  formatDayMonth,
  formatMonthAbbrev,
  formatPercent,
  formatSignedCount,
} from './format';
import { OwnerMemberDetail } from './OwnerMemberDetail';
import { PanelSection, PreviewAction } from './PanelSection';

/**
 * The scope's bands, its em risco reachable by push (A-2) and its note under the tabs (none for the
 * whole base). A missing entry is a fixture bug, so it fails loud.
 */
function scopeEntry(t: DashboardT, scope: OwnerBandScope) {
  const { engagement, atRiskWithPush, byCommunity, communityEngagement, eventEngagement } =
    tenantOwnerPanel;
  if (scope.kind === 'member') return { bands: engagement, atRiskWithPush, note: null };
  if (scope.kind === 'community') {
    const community = byCommunity.find((row) => row.id === scope.id);
    const entry = communityEngagement.find((row) => row.id === scope.id);
    if (!community || !entry) throw new Error(`no engagement bands for community ${scope.id}`);
    return {
      ...entry,
      note: t('tenantOwner.bandScope.note', {
        community: communityLabel(t, community),
        count: bandTotal(entry.bands),
      }),
    };
  }
  const event = OWNER_EVENTS.find((row) => row.id === scope.id);
  const entry = eventEngagement.find((row) => row.id === scope.id);
  if (!event || !entry) throw new Error(`no engagement bands for event ${scope.id}`);
  return {
    ...entry,
    note: t('tenantOwner.bandScope.eventNote', {
      event: eventLabel(t, event),
      count: bandTotal(entry.bands),
    }),
  };
}

/** `Encontro mensal · 12/10`: the date tells the two "Live de dúvidas" apart. */
function eventLabel(t: DashboardT, event: { name: string; date: string }): string {
  return t('tenantOwner.bandScope.event', { name: event.name, date: formatDayMonth(event.date) });
}

const SCOPE_TABS = [
  { kind: 'member', labelKey: 'tenantOwner.bandScope.byMember' },
  { kind: 'community', labelKey: 'tenantOwner.bandScope.byCommunity' },
  { kind: 'event', labelKey: 'tenantOwner.bandScope.byEvent' },
] as const satisfies readonly { kind: OwnerBandScope['kind']; labelKey: string }[];

/** A tab's link: the whole base, or its row's first item. */
function tabScope(kind: OwnerBandScope['kind']): OwnerBandScope {
  if (kind === 'member') return { kind };
  const id = (kind === 'community' ? OWNER_COMMUNITIES : OWNER_EVENTS)[0]?.id;
  if (!id) throw new Error(`no ${kind} to scope the bands to`);
  return { kind, id };
}

/** The second row under Por comunidade or Por evento: one chip per community or event. */
function ScopeItems({ t, scope }: { t: DashboardT; scope: OwnerBandScope }) {
  if (scope.kind === 'member') return null;
  const items =
    scope.kind === 'community'
      ? tenantOwnerPanel.byCommunity.map((row) => ({ id: row.id, label: communityLabel(t, row) }))
      : OWNER_EVENTS.map((row) => ({ id: row.id, label: eventLabel(t, row) }));
  return (
    <nav
      aria-label={t(
        scope.kind === 'community'
          ? 'tenantOwner.bandScope.communityLabel'
          : 'tenantOwner.bandScope.eventLabel',
      )}
    >
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Chip
              href={ownerScopeHref({ kind: scope.kind, id: item.id })}
              active={item.id === scope.id}
            >
              {item.label}
            </Chip>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Level 4, "Membros": growth (who joined and left in 30 days, the balance against the members KPI's
 * change, new members per week), the engagement bands with who moved up or down, right after them
 * a card to win back the members in risk, then retention by joining month (one number on a phone,
 * the cohort heatmap from `@3xl`).
 *
 * The bands have three scope tabs (quick 261012-qer B-2): Por membro (the whole base), Por comunidade
 * and Por evento (that event's registrants), each with a second row to pick the item; who moved stays
 * whole-base, and the win-back card follows the scope (A-2). Each band opens a named list of its
 * members (261012-pkd D-02); a member card opens that member's insights in place of the area
 * (261012-qer B-3). Those lists and insights are the only places this panel names a member, to the
 * client's own team (D-03); every other block is counts only.
 */
export async function OwnerMembers({ members }: { members: OwnerMembersView }) {
  const t = await getTranslations('dashboard');
  if (members.memberId) return <OwnerMemberDetail t={t} view={members} />;
  const { kpis, growth, cohorts, movement } = tenantOwnerPanel;
  const { scope } = members;
  const entry = scopeEntry(t, scope);
  const scopeBands = entry.bands;
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

      {/* scroll-mt keeps the #faixas landing clear of the phone mockup's sticky status bar. */}
      <PanelSection id={OWNER_BANDS_ANCHOR} title={t('bands.title')} className="scroll-mt-20">
        <nav aria-label={t('tenantOwner.bandScope.label')}>
          {/* Three equal tabs spanning the bar, as the area tabs. */}
          <ul className="grid grid-cols-3 gap-2">
            {SCOPE_TABS.map((tab) => (
              <li key={tab.kind} className="min-w-0">
                <Chip
                  href={ownerScopeHref(tabScope(tab.kind))}
                  active={tab.kind === scope.kind}
                  className="w-full justify-center text-center"
                >
                  {t(tab.labelKey)}
                </Chip>
              </li>
            ))}
          </ul>
        </nav>
        <ScopeItems t={t} scope={scope} />
        {entry.note ? <p className="text-xs text-text-secondary">{entry.note}</p> : null}
        <BandMembers t={t} bands={scopeBands} scope={scope} openBand={members.band} />
        <p className="text-xs text-text-secondary">
          {/* Every event registrant acted (the RSVP), so the line would always read X de X. */}
          {scope.kind === 'event'
            ? null
            : `${t('bands.newActivated', {
                activated: formatCount(scopeBands.newActivated),
                total: formatCount(scopeBands.counts.new),
              })} `}
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
        {scope.kind === 'member' ? null : (
          <p className="text-xs text-text-secondary">{t('tenantOwner.bandScope.movementNote')}</p>
        )}
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
          atRisk: formatCount(scopeBands.counts.at_risk),
          withPush: formatCount(entry.atRiskWithPush),
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
