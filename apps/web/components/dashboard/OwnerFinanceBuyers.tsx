import { ownerFinanceWindow, tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import {
  BarList,
  Collapsible,
  ENGAGEMENT_BAND_ORDER,
  engagedPercent,
  percentOf,
} from '@rede-social/module-dashboard/ui';
import { bandLabel, type DashboardT, formatCount, formatPercent } from './format';

/**
 * Financeiro › Quem compra: the month's orders of the single order list by the buyer's band of today
 * (quick 261014-dwc PD-4), with how much of them superfãs and engajados bring. Tarefa 4 rewrites this
 * tab (D-09).
 */
export function OwnerFinanceBuyers({ t }: { t: DashboardT }) {
  const { byBand, total } = ownerFinanceWindow(0, 29);
  const orders = (band: keyof typeof byBand) => byBand[band].orders;
  return (
    <Collapsible
      title={t('tenantOwner.buyers.title')}
      summary={t('tenantOwner.buyers.sentence', {
        orders: formatPercent(percentOf(orders('superfan') + orders('engaged'), total.orders)),
        members: formatPercent(engagedPercent(tenantOwnerPanel.engagement)),
      })}
    >
      <BarList
        max={total.orders}
        rows={ENGAGEMENT_BAND_ORDER.map((band) => ({
          id: band,
          label: bandLabel(t, band),
          value: orders(band),
          display: formatCount(orders(band)),
          rate: formatPercent(percentOf(orders(band), total.orders)),
          highlight: band === 'superfan' || band === 'engaged',
        }))}
      />
      <p className="text-xs text-text-secondary">{t('tenantOwner.buyers.footnote')}</p>
    </Collapsible>
  );
}
