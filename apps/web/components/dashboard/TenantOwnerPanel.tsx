import {
  previewTenant,
  type TenantOwnerAttention,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import type { AttentionItem } from '@rede-social/module-dashboard/ui';
import { Chip } from '@rede-social/ui';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { OWNER_AREAS, type OwnerArea, ownerAreaHref } from '@/lib/dashboard-preview';
import { type DashboardT, formatCount } from './format';
import { OwnerMembers } from './OwnerMembers';
import { OwnerOverview } from './OwnerOverview';
import { PanelHeader } from './PanelHeader';
import { TenantColumn } from './TenantColumn';

function ownerAttentionItem(t: DashboardT, item: TenantOwnerAttention): AttentionItem {
  const base = `tenantOwner.alerts.${item.kind}`;
  switch (item.kind) {
    case 'support_waiting':
      return {
        id: item.id,
        tone: item.severity,
        tag: t(`${base}.tag`, { hours: item.oldestHours }),
        title: t(`${base}.title`, { count: item.conversations }),
        detail: t(`${base}.detail`, { hours: item.oldestHours }),
      };
    case 'event_today':
      return {
        id: item.id,
        tone: item.severity,
        tag: t(`${base}.tag`, { hour: item.startsAtHour }),
        title: t(`${base}.title`, {
          event: item.event,
          confirmed: formatCount(item.confirmed),
          capacity: formatCount(item.capacity),
        }),
        detail: t(`${base}.detail`, { left: item.capacity - item.confirmed }),
      };
    default:
      return {
        id: item.id,
        tone: item.severity,
        tag: t(`${base}.tag`),
        title: t(`${base}.title`, { count: item.members }),
        detail: t(`${base}.detail`, { count: formatCount(item.withPush) }),
      };
  }
}

/** Every area has its component and tab label: a slug added to OWNER_AREAS without one fails typecheck. */
const AREAS = {
  'visao-geral': { labelKey: 'tenantOwner.areas.overview', Area: OwnerOverview },
  membros: { labelKey: 'tenantOwner.areas.members', Area: OwnerMembers },
} satisfies Record<OwnerArea, { labelKey: string; Area: () => Promise<ReactNode> }>;

export interface TenantOwnerPanelProps {
  /** The open area (allow-listed by `parseOwnerArea`). */
  area: OwnerArea;
}

/**
 * Level 4, "Dono do cliente": the client's business in six areas (quick 261012-o00). The header keeps
 * the period and the alerts bell in every area; under it a row of tab links (plain `<a>`, so it works
 * with no JavaScript, wrapping on a phone) picks the area through `?area=`. Each area is its own
 * server component. Segments are counts only: no member is named (D-02 of 261012-fcr).
 */
export async function TenantOwnerPanel({ area }: TenantOwnerPanelProps) {
  const t = await getTranslations('dashboard');
  const { Area } = AREAS[area];

  return (
    <TenantColumn>
      <PanelHeader
        title={previewTenant.displayName}
        subtitle={t('tenantOwner.header.subtitle')}
        period={t('tenantOwner.header.period')}
        alerts={tenantOwnerPanel.attention.map((item) => ownerAttentionItem(t, item))}
      />

      <nav aria-label={t('tenantOwner.areas.label')}>
        <ul className="flex flex-wrap gap-2">
          {OWNER_AREAS.map((slug) => (
            <li key={slug}>
              <Chip href={ownerAreaHref(slug)} active={slug === area}>
                {t(AREAS[slug].labelKey)}
              </Chip>
            </li>
          ))}
        </ul>
      </nav>

      <div data-owner-area={area} className="flex flex-col gap-6">
        <Area />
      </div>
    </TenantColumn>
  );
}
