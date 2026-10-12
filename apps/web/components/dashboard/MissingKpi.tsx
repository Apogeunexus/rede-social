import type { NotMeasured } from '@rede-social/module-dashboard/fixtures';
import { KpiCard } from '@rede-social/module-dashboard/ui';
import type { DashboardT } from './format';

export interface MissingKpiProps {
  t: DashboardT;
  label: string;
  item: NotMeasured;
}

/**
 * The one way a metric the app does not collect yet is shown (D-03): a dashed card that reads
 * "Ainda não medido" and names what must be collected. There is no value to show by construction.
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
