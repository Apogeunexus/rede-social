import { type Delta, platformSupportPanel } from '@rede-social/module-dashboard/fixtures';
import {
  bandTotal,
  Collapsible,
  isBelowPrivacyFloor,
  isComplementBelowPrivacyFloor,
  KpiCard,
  KpiGrid,
  mergeBandsBelowFloor,
  PRIVACY_FLOOR,
  percentOf,
  ToneLabel,
} from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { PREVIEW_NOTE_ID } from '@/lib/dashboard-preview';
import { BandsBarList } from './BandsBarList';
import {
  formatCount,
  formatFloored,
  formatList,
  formatPercent,
  formatTime,
  kpiDelta,
  moduleNamer,
} from './format';
import { PanelHeader } from './PanelHeader';
import { PreviewAction } from './PanelSection';

const SEARCH_ID = 'preview-support-search';

/** The last 24 h's action rate against the 30-day average, as a relative change. */
function activityDelta(perHour: number, averagePerHour: number): Delta {
  const direction = perHour < averagePerHour ? 'down' : perHour > averagePerHour ? 'up' : 'flat';
  return {
    amount: percentOf(Math.abs(perHour - averagePerHour), averagePerHour),
    kind: 'percent',
    direction,
    good: direction === 'flat' ? null : direction === 'up',
    basis: 'average_30_days',
  };
}

/**
 * Level 3, "Suporte da plataforma": what is happening with this client, without seeing the members'
 * content? Read-only and aggregates only: the client being looked at, the registered access with its
 * reason, the KPIs (invites, novos who never acted, activity vs the average), the configuration and
 * the engagement bands (both closed), the last errors with the push reach (open), and the two ways
 * out — escalate, or review one's own registered accesses. Every count of the client's members or
 * devices under 5 reads "menos de 5" (D-02); a band under 5 is merged with a neighbour so the exact
 * total cannot give it back (C-1), and "novos que nunca agiram" hides a complement under 5 (C-2).
 */
export async function PlatformSupportPanel() {
  const t = await getTranslations('dashboard');
  const moduleName = await moduleNamer(t);
  const { client, access, kpis, configuration, errors24h, engagement, pushReachPercent } =
    platformSupportPanel;
  // An exact "em risco" percent next to a merged row would give the neighbour back by subtraction.
  const atRiskAlone = mergeBandsBelowFloor(engagement).find(
    (group) => group.bands.length === 1 && group.bands[0] === 'at_risk',
  );
  const neverActed = kpis.newNeverActed7d;
  const neverActedHidesComplement = isComplementBelowPrivacyFloor(
    neverActed.count,
    neverActed.joined,
  );

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        title={t('platformSupport.header.title')}
        subtitle={t('platformSupport.header.subtitle')}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={SEARCH_ID} className="text-xs font-bold text-text-secondary">
          {t('platformSupport.searchLabel')}
        </label>
        <div className="relative">
          <Search
            aria-hidden
            size={16}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-tertiary"
          />
          <input
            id={SEARCH_ID}
            type="search"
            disabled
            defaultValue={client.name}
            aria-describedby={PREVIEW_NOTE_ID}
            className="h-11 w-full rounded-xl bg-bg-input pr-4 pl-10 text-sm text-text disabled:opacity-80"
          />
        </div>
      </div>

      <Card className="flex flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-base font-bold text-text">{client.name}</p>
          <span className="flex flex-wrap gap-2">
            <ToneLabel tone="neutral">{t(`plans.${client.plan}`)}</ToneLabel>
            <ToneLabel tone={client.status === 'active' ? 'success' : 'warning'}>
              {t(`clientStatus.${client.status}`)}
            </ToneLabel>
          </span>
        </div>
        <p className="text-xs text-text-secondary [overflow-wrap:anywhere]">
          {t('platformSupport.access', { time: formatTime(access.atIso), reason: access.reason })}
        </p>
      </Card>

      <KpiGrid>
        <KpiCard
          label={t('platformSupport.kpi.primaryDomain')}
          value={
            <ToneLabel tone={kpis.primaryDomain.status === 'verified' ? 'success' : 'danger'}>
              {t(`platformSupport.kpi.domainStatus.${kpis.primaryDomain.status}`)}
            </ToneLabel>
          }
          {...(kpis.primaryDomain.reason
            ? { note: t(`platformSupport.kpi.domainReason.${kpis.primaryDomain.reason}`) }
            : {})}
        />
        <KpiCard
          label={t('platformSupport.kpi.members')}
          value={formatCount(kpis.members.count)}
          unit={t('platformSupport.kpi.membersUnit', {
            blocked: formatFloored(t, kpis.members.blocked),
          })}
          delta={kpiDelta(t, kpis.members.delta)}
        />
        <KpiCard
          label={t('platformSupport.kpi.errors24h')}
          value={formatCount(kpis.errors24h.count)}
          delta={kpiDelta(t, kpis.errors24h.delta)}
        />
        <KpiCard
          label={t('platformSupport.kpi.lastActivity')}
          value={t('daysAgo', { days: kpis.lastActivity.daysAgo })}
          note={t('platformSupport.kpi.lastActivityNote')}
        />
        <KpiCard
          label={t('platformSupport.kpi.pendingInvites')}
          value={formatFloored(t, kpis.pendingInvites.count)}
        />
        <KpiCard
          label={t('platformSupport.kpi.neverActed')}
          value={
            neverActedHidesComplement
              ? t('platformSupport.kpi.neverActedAllBut', { floor: PRIVACY_FLOOR })
              : formatFloored(t, neverActed.count)
          }
          note={t(
            neverActedHidesComplement
              ? 'platformSupport.kpi.neverActedJoined'
              : 'platformSupport.kpi.neverActedNote',
            { joined: formatFloored(t, neverActed.joined) },
          )}
        />
        <KpiCard
          label={t('platformSupport.kpi.activity')}
          value={t('platformSupport.kpi.activityValue', { count: kpis.activity24h.perHour })}
          delta={kpiDelta(
            t,
            activityDelta(kpis.activity24h.perHour, kpis.activity24h.averagePerHour),
          )}
          note={t('platformSupport.kpi.activityNote', {
            average: kpis.activity24h.averagePerHour,
          })}
        />
      </KpiGrid>

      <Collapsible
        title={t('platformSupport.configuration.title')}
        summary={t('platformSupport.configuration.summary', {
          count: configuration.enabledModules.length,
        })}
      >
        <ul className="flex flex-col gap-1.5 text-xs text-text-secondary [overflow-wrap:anywhere]">
          <li>
            {t('platformSupport.configuration.enabled', {
              list: formatList(configuration.enabledModules.map(moduleName)),
            })}
          </li>
          <li>
            {t('platformSupport.configuration.disabled', {
              list: formatList(configuration.disabledModules.map(moduleName)),
            })}
          </li>
          <li>
            {t('platformSupport.configuration.admins', {
              count: configuration.adminEmails.length,
              emails: formatList(configuration.adminEmails),
            })}
          </li>
        </ul>
      </Collapsible>

      <Collapsible
        title={t('platformSupport.engagement.title')}
        {...(atRiskAlone
          ? {
              summary: t('platformSupport.engagement.summary', {
                percent: formatPercent(percentOf(atRiskAlone.count, bandTotal(engagement))),
              }),
            }
          : {})}
      >
        <BandsBarList t={t} bands={engagement} floor />
        <p className="text-xs text-text-secondary">
          {t('platformSupport.engagement.footnote', { floor: PRIVACY_FLOOR })}
        </p>
      </Collapsible>

      <Collapsible
        open
        title={t('platformSupport.errors.title')}
        summary={t('platformSupport.errors.summary', {
          shown: errors24h.length,
          total: kpis.errors24h.count,
        })}
      >
        <ul className="flex flex-col gap-3">
          {errors24h.map((error) => (
            <li key={error.id} className="flex items-start gap-3">
              <ToneLabel tone={error.severity} className="shrink-0">
                {t(`platformSupport.errors.kinds.${error.kind}`)}
              </ToneLabel>
              <div className="flex min-w-0 flex-col text-xs">
                <span className="font-bold text-text tabular-nums">{formatTime(error.atIso)}</span>
                <span className="text-text-secondary">
                  {error.detail === 'devices_refused' && isBelowPrivacyFloor(error.count ?? 0)
                    ? t('platformSupport.errors.details.devices_refused_below_floor', {
                        floor: PRIVACY_FLOOR,
                      })
                    : t(`platformSupport.errors.details.${error.detail}`, {
                        count: error.count ?? 0,
                      })}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-text-secondary">
          {t('platformSupport.errors.pushReach', { percent: formatPercent(pushReachPercent) })}
        </p>
      </Collapsible>

      <div className="flex flex-wrap gap-2">
        <PreviewAction variant="outline">{t('platformSupport.actions.escalate')}</PreviewAction>
        <PreviewAction>{t('platformSupport.actions.myAccesses')}</PreviewAction>
      </div>
    </div>
  );
}
