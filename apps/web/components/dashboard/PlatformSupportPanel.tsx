import { platformSupportPanel } from '@rede-social/module-dashboard/fixtures';
import { Collapsible, KpiCard, KpiGrid, ToneLabel } from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { PREVIEW_NOTE_ID } from '@/lib/dashboard-preview';
import { formatCount, formatList, formatTime, kpiDelta, moduleNamer } from './format';
import { PanelHeader } from './PanelHeader';
import { PreviewAction } from './PanelSection';

const SEARCH_ID = 'preview-support-search';

/**
 * Level 3, "Suporte da plataforma": what is happening with this client, without seeing the members'
 * content? Read-only: the client being looked at, the registered access with its reason, four KPIs,
 * the configuration (closed) and the last errors (open), and the two ways out — escalate, or review
 * one's own registered accesses.
 */
export async function PlatformSupportPanel() {
  const t = await getTranslations('dashboard');
  const moduleName = await moduleNamer(t);
  const { client, access, kpis, configuration, errors24h } = platformSupportPanel;

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
            blocked: formatCount(kpis.members.blocked),
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
                  {t(`platformSupport.errors.details.${error.detail}`, { count: error.count ?? 0 })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Collapsible>

      <div className="flex flex-wrap gap-2">
        <PreviewAction variant="outline">{t('platformSupport.actions.escalate')}</PreviewAction>
        <PreviewAction>{t('platformSupport.actions.myAccesses')}</PreviewAction>
      </div>
    </div>
  );
}
