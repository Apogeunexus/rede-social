import { type OwnerBandScope, tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import {
  ActionCard,
  BarList,
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
  type OwnerMembersView,
  ownerInsightAnchor,
  ownerListScope,
  ownerMembersHref,
} from '@/lib/owner-band-scope';
import { BandMembers } from './BandMembers';
import {
  bandLabel,
  formatChange,
  formatCount,
  formatMonthAbbrev,
  formatPercent,
  formatSignedCount,
} from './format';
import { OwnerMemberDetail } from './OwnerMemberDetail';
import { OwnerMemberList } from './OwnerMemberList';
import { PanelSection, PreviewAction } from './PanelSection';

const SCOPE_TABS = [
  { kind: 'member', labelKey: 'tenantOwner.bandScope.byMember' },
  { kind: 'community', labelKey: 'tenantOwner.bandScope.byCommunity' },
  { kind: 'event', labelKey: 'tenantOwner.bandScope.byEvent' },
] as const satisfies readonly { kind: OwnerBandScope['kind']; labelKey: string }[];

const TAB_NOTES = {
  member: null,
  community: 'tenantOwner.bandScope.communityNote',
  event: 'tenantOwner.bandScope.eventNote',
} as const satisfies Record<OwnerBandScope['kind'], string | null>;

/**
 * The em risco and their push reach for the win-back card (quick 261012-tru D-08): the opened
 * community or event, else the whole base. A missing entry is a fixture bug, so it fails loud.
 */
function recoverReach(view: OwnerMembersView): { atRisk: number; withPush: number } {
  const scope = ownerListScope(view);
  const { engagement, atRiskWithPush, communityEngagement, eventEngagement } = tenantOwnerPanel;
  if (!scope || scope.kind === 'member') {
    return { atRisk: engagement.counts.at_risk, withPush: atRiskWithPush };
  }
  const rows = scope.kind === 'community' ? communityEngagement : eventEngagement;
  const entry = rows.find((row) => row.id === scope.id);
  if (!entry) throw new Error(`no engagement bands for ${scope.kind} ${scope.id}`);
  return { atRisk: entry.bands.counts.at_risk, withPush: entry.atRiskWithPush };
}

/**
 * Level 4, "Membros": growth (who joined and left in 30 days, the balance against the members KPI's
 * change, new members per week), the engagement bands with who moved up or down, right after them
 * a card to win back the members in risk, then retention by joining month (one number on a phone,
 * the cohort heatmap from `@3xl`).
 *
 * The bands are one cascade in three tabs (quick 261012-tru D-01): Por membro, Por comunidade and
 * Por evento, one row and nothing else to pick. Every tab shows the whole base's six bands, each
 * member counted once (D-02); a band opens its members (Por membro) or the community or event cards
 * (the others), a card opens its members in the band (D-05), and a member card opens that member's
 * insights in place of the area (D-06). Who moved stays whole-base; the win-back card follows the
 * opened community or event (D-08). Each insight number opens the list behind it (D-07). Those
 * lists and insights are the only places this panel names a member, to the client's own team
 * (261012-pkd D-03); every other block is counts only.
 */
export async function OwnerMembers({ members }: { members: OwnerMembersView }) {
  const t = await getTranslations('dashboard');
  if (members.memberId) {
    const { memberId, list, band } = members;
    if (list) {
      return (
        <OwnerMemberList
          t={t}
          memberId={memberId}
          list={list}
          backHref={`${ownerMembersHref({ ...members, list: null })}#${ownerInsightAnchor(list)}`}
        />
      );
    }
    // The parser only lets a member through with the band they hold in the opened list (R-5, D-06).
    const scope = ownerListScope(members);
    if (!band || !scope) throw new Error(`member ${memberId} opened with no band or list`);
    return (
      <OwnerMemberDetail
        t={t}
        memberId={memberId}
        band={band}
        scope={scope}
        backHref={ownerMembersHref({ ...members, memberId: null, list: null })}
        listHref={(slug) => ownerMembersHref({ ...members, list: slug })}
      />
    );
  }
  const { kpis, growth, cohorts, movement, engagement } = tenantOwnerPanel;
  const note = TAB_NOTES[members.kind];
  const recover = recoverReach(members);
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
          {/* Three equal tabs spanning the bar, as the area tabs; the only row (D-01). */}
          <ul className="grid grid-cols-3 gap-2">
            {SCOPE_TABS.map((tab) => (
              <li key={tab.kind} className="min-w-0">
                <Chip
                  href={ownerMembersHref({
                    kind: tab.kind,
                    band: null,
                    itemId: null,
                    memberId: null,
                    list: null,
                  })}
                  active={tab.kind === members.kind}
                  className="w-full justify-center text-center"
                >
                  {t(tab.labelKey)}
                </Chip>
              </li>
            ))}
          </ul>
        </nav>
        {note ? <p className="text-xs text-text-secondary">{t(note)}</p> : null}
        <BandMembers t={t} bands={engagement} view={members} />
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
        {members.kind === 'member' ? null : (
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
          atRisk: formatCount(recover.atRisk),
          withPush: formatCount(recover.withPush),
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
