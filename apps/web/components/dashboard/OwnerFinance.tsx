import { formatBrl } from '@rede-social/contracts/money';
import { tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import {
  BarList,
  Collapsible,
  ENGAGEMENT_BAND_ORDER,
  engagedPercent,
  KpiCard,
  KpiGrid,
  percentOf,
  sumOf,
} from '@rede-social/module-dashboard/ui';
import { getTranslations } from 'next-intl/server';
import { ExamplePill } from './ExamplePill';
import {
  bandLabel,
  exampleBadge,
  formatCount,
  formatList,
  formatPercent,
  formatRatio,
  kpiDelta,
} from './format';
import { PanelSection } from './PanelSection';

/**
 * Level 4, "Financeiro": the month's sales (value registered and orders, with the fixed notice that
 * a registered value is not money received), then closed: revenue per product and who buys; the
 * accesses that expire and the renewal rate, open; and conversion per product, closed. Expiring
 * accesses, renewal and conversion are examples (no data yet), marked next to their values (D-03).
 */
export async function OwnerFinance() {
  const t = await getTranslations('dashboard');
  const { kpis, store, ordersByBand, engagement } = tenantOwnerPanel;
  const products = [...store.products].sort((a, b) => b.cents - a.cents);
  const top = products[0];
  const totalOrders = ENGAGEMENT_BAND_ORDER.reduce((sum, band) => sum + ordersByBand[band], 0);
  const { expiringAccess7d, renewal, conversion } = store;
  const conversionRate = (row: { visits: number; orders: number }) =>
    row.visits > 0 ? row.orders / row.visits : 0;
  const conversionRows = [...conversion.value].sort(
    (a, b) => conversionRate(b) - conversionRate(a),
  );

  return (
    <>
      <PanelSection title={t('tenantOwner.sales.title')}>
        <KpiGrid>
          <KpiCard
            label={t('tenantOwner.sales.value')}
            value={formatBrl(kpis.orderValue.cents)}
            delta={kpiDelta(t, kpis.orderValue.delta)}
          />
          <KpiCard
            label={t('tenantOwner.sales.orders')}
            value={formatCount(sumOf(store.products, (row) => row.orders))}
            delta={kpiDelta(t, store.ordersDelta)}
          />
        </KpiGrid>
        <p className="text-xs text-text-secondary">{t('tenantOwner.sales.notice')}</p>
      </PanelSection>

      {top ? (
        <Collapsible
          title={t('tenantOwner.revenue.title')}
          summary={t('tenantOwner.revenue.summary', {
            product: top.product,
            value: formatBrl(top.cents),
          })}
        >
          <BarList
            rows={products.map((row, i) => ({
              id: row.id,
              label: row.product,
              value: row.cents,
              display: formatBrl(row.cents),
              rate: t('tenantOwner.revenue.orders', { count: row.orders }),
              highlight: i === 0,
            }))}
          />
        </Collapsible>
      ) : null}

      <Collapsible
        title={t('tenantOwner.buyers.title')}
        summary={t('tenantOwner.buyers.sentence', {
          orders: formatPercent(
            percentOf(ordersByBand.superfan + ordersByBand.engaged, totalOrders),
          ),
          members: formatPercent(engagedPercent(engagement)),
        })}
      >
        <BarList
          max={totalOrders}
          rows={ENGAGEMENT_BAND_ORDER.map((band) => ({
            id: band,
            label: bandLabel(t, band),
            value: ordersByBand[band],
            display: formatCount(ordersByBand[band]),
            rate: formatPercent(percentOf(ordersByBand[band], totalOrders)),
            highlight: band === 'superfan' || band === 'engaged',
          }))}
        />
        <p className="text-xs text-text-secondary">{t('tenantOwner.buyers.footnote')}</p>
      </Collapsible>

      <PanelSection title={t('tenantOwner.access.title')}>
        <KpiGrid>
          <KpiCard
            label={t('tenantOwner.access.expiring')}
            value={formatCount(expiringAccess7d.value.count)}
            note={formatList(expiringAccess7d.value.products)}
            badge={exampleBadge(t, expiringAccess7d)}
          />
          <KpiCard
            label={t('tenantOwner.access.renewal')}
            value={formatPercent(percentOf(renewal.value.renewed, renewal.value.expired))}
            note={t('tenantOwner.access.renewalNote', {
              renewed: formatCount(renewal.value.renewed),
              expired: formatCount(renewal.value.expired),
            })}
            badge={exampleBadge(t, renewal)}
          />
        </KpiGrid>
      </PanelSection>

      <Collapsible
        title={t('tenantOwner.conversion.title')}
        summary={
          <span className="inline-flex flex-wrap items-center gap-2">
            {t('tenantOwner.conversion.summary')}
            <ExamplePill text={exampleBadge(t, conversion)} />
          </span>
        }
      >
        <BarList
          rows={conversionRows.map((row, i) => ({
            id: row.id,
            label: row.product,
            value: percentOf(row.orders, row.visits),
            display: formatRatio(conversionRate(row)),
            rate: t('tenantOwner.conversion.rate', {
              orders: formatCount(row.orders),
              visits: formatCount(row.visits),
            }),
            highlight: i === 0,
          }))}
        />
      </Collapsible>
    </>
  );
}
