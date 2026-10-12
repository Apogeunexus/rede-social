import type { NotMeasured } from '@rede-social/module-dashboard/fixtures';
import { KpiCard } from '@rede-social/module-dashboard/ui';
import type { DashboardT } from './format';

export interface MissingKpiProps {
  t: DashboardT;
  label: string;
  item: NotMeasured;
}

/**
 * A single metric the app does not collect yet (D-03): a dashed card that reads "Ainda não medido"
 * and names what must be collected. There is no value to show by construction. Several of them on
 * one panel are grouped in one closed list instead (level 5, "Métricas que dependem de coleta").
 */
export function MissingKpi({ t, label, item }: MissingKpiProps) {
  return (
    <KpiCard
      label={label}
      value={t('notMeasured')}
      note={t(`notMeasuredReason.${item.reason}`)}
      variant="missing"
    />
  );
}
