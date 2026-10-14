import { formatBrl, formatBrlCompact, formatBrlWhole } from '@rede-social/contracts/money';
import {
  type EngagementBand,
  type FinanceOffer,
  type FinanceProductDetail,
  financeProductOffers,
  ownerContentItem,
  ownerFinanceProductDetail,
  ownerFinanceWindow,
} from '@rede-social/module-dashboard/fixtures';
import {
  BarList,
  ENGAGEMENT_BAND_ORDER,
  isBelowPrivacyFloor,
  KpiCard,
  KpiGrid,
  mergeBandsBelowFloor,
  PRIVACY_FLOOR,
} from '@rede-social/module-dashboard/ui';
import { Card, cn, StatusPill } from '@rede-social/ui';
import { ChevronRight } from 'lucide-react';
import { contentTabView, ownerContentHref } from '@/lib/owner-content-view';
import {
  financeBackHref,
  financeOfferAnchor,
  type OwnerFinanceView,
  ownerFinanceHref,
} from '@/lib/owner-finance-view';
import { BackLink } from './BackLink';
import { Linked } from './BandScopeCards';
import { CoverThumb } from './CoverThumb';
import {
  bandGroupLabel,
  changeDelta,
  type DashboardT,
  formatCount,
  formatFloored,
  kpiDelta,
} from './format';
import { WeeklyChart } from './OwnerFinanceOverview';
import { ProductName, productCoverKind } from './OwnerFinanceProducts';
import { PanelSection } from './PanelSection';

const KEY = 'tenantOwner.finance';

/**
 * One offer as a card (D-08): the composition, Entrada or Adicional, the price and the month's orders
 * and value. With orders it opens its buyers; without, it says so and goes nowhere.
 */
function OfferCard({
  t,
  offer,
  href,
  orders,
  cents,
}: {
  t: DashboardT;
  offer: FinanceOffer;
  href: string | null;
  orders: number;
  cents: number;
}) {
  return (
    <Linked href={href}>
      <Card
        className={cn(
          'flex items-center gap-3 p-4 [overflow-wrap:anywhere]',
          href !== null && 'transition-colors hover:bg-card-hover',
        )}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-base font-bold leading-tight text-text">{offer.composition}</span>
          <span className="flex flex-wrap items-center gap-2">
            <StatusPill tone={offer.kind === 'entry' ? 'brand' : 'neutral'}>
              {t(`${KEY}.offers.${offer.kind}`)}
            </StatusPill>
            <span className="text-sm font-semibold text-text tabular-nums">
              {formatBrl(offer.priceCents)}
            </span>
          </span>
          <span className="text-sm text-text-secondary">
            {orders === 0
              ? t(`${KEY}.offers.none`)
              : t(`${KEY}.offers.orders`, { count: orders, value: formatBrlWhole(cents) })}
          </span>
        </span>
        {href !== null ? (
          <ChevronRight aria-hidden size={18} className="shrink-0 text-brand" />
        ) : null}
      </Card>
    </Linked>
  );
}

/** (1) Números: revenue, orders, buyers against the 30 days before, and the cancellations (D-05). */
function Numbers({ t, product }: { t: DashboardT; product: FinanceProductDetail }) {
  const key = `${KEY}.detail.numbers`;
  const delta = (now: number, before: number) => {
    const change = changeDelta(now, before);
    return change ? kpiDelta(t, change) : undefined;
  };
  return (
    <PanelSection title={t(`${key}.title`)}>
      <KpiGrid>
        <KpiCard
          label={t(`${key}.revenue`)}
          value={formatBrlWhole(product.month.cents)}
          delta={delta(product.month.cents, product.before.cents)}
        />
        <KpiCard
          label={t(`${key}.orders`)}
          value={formatCount(product.month.orders)}
          delta={delta(product.month.orders, product.before.orders)}
          note={t(`${key}.ordersNote`, {
            entry: product.month.entry,
            addon: product.month.addon,
          })}
        />
        <KpiCard
          label={t(`${key}.buyers`)}
          value={formatCount(product.month.buyers)}
          delta={delta(product.month.buyers, product.before.buyers)}
        />
        <KpiCard
          label={t(`${key}.revoked`)}
          value={formatFloored(t, product.revoked.orders)}
          note={
            isBelowPrivacyFloor(product.revoked.orders)
              ? t(`${key}.revokedFloor`)
              : t(`${key}.revokedValue`, { value: formatBrlWhole(product.revoked.cents) })
          }
        />
      </KpiGrid>
      {product.month.orders === 0 && product.lastSaleDaysAgo !== null ? (
        <p className="text-sm font-bold text-text">
          {t(`${key}.unsold`, { days: product.lastSaleDaysAgo })}
        </p>
      ) : null}
    </PanelSection>
  );
}

/**
 * (3) Compradores por faixa (PD-14): the month's orders by the buyer's band of today, the bands
 * under 5 orders merged with a neighbour (C-1), so no small band is read nor deduced from the total;
 * a value only from 5 orders on (D-06).
 */
function BuyersByBand({ t, product }: { t: DashboardT; product: FinanceProductDetail }) {
  const key = `${KEY}.detail.bands`;
  const counts = Object.fromEntries(
    ENGAGEMENT_BAND_ORDER.map((band) => [band, product.byBand[band].orders]),
  ) as Record<EngagementBand, number>;
  const groups = mergeBandsBelowFloor({ counts, newActivated: 0 });
  return (
    <PanelSection title={t(`${key}.title`)}>
      {product.month.orders === 0 ? (
        <p className="text-sm text-text-secondary">{t(`${key}.empty`)}</p>
      ) : (
        <>
          <BarList
            stacked
            rows={groups.map((group) => {
              const cents = group.bands.reduce((sum, band) => sum + product.byBand[band].cents, 0);
              const floored = isBelowPrivacyFloor(group.count);
              return {
                id: group.bands.join('-'),
                // A band with no order adds nothing to the row's name.
                label: bandGroupLabel(
                  t,
                  group.bands.filter((band) => counts[band] > 0),
                ),
                value: floored ? 0 : cents,
                display: floored
                  ? t(`${key}.floor`, { floor: PRIVACY_FLOOR })
                  : formatBrlCompact(cents),
                rate: floored ? undefined : t(`${key}.orders`, { count: group.count }),
                highlight: group.bands.includes('superfan') || group.bands.includes('engaged'),
              };
            })}
          />
          <p className="text-xs text-text-secondary">{t(`${key}.note`)}</p>
        </>
      )}
    </PanelSection>
  );
}

/** (5) Publicações que venderam: each opens its detail in Conteúdo; association, not cause. */
function SoldBy({ t, product }: { t: DashboardT; product: FinanceProductDetail }) {
  const key = `${KEY}.detail.posts`;
  return (
    <PanelSection title={t(`${key}.title`)}>
      {product.posts.length === 0 ? (
        <p className="text-sm text-text-secondary">{t(`${key}.empty`)}</p>
      ) : (
        <>
          <Card>
            <ul className="divide-y divide-border">
              {product.posts.map((post) => (
                <li key={post.postId}>
                  <a
                    href={ownerContentHref({ ...contentTabView('posts'), postId: post.postId })}
                    className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 [overflow-wrap:anywhere]">
                      <span className="line-clamp-2 text-sm text-text">
                        {ownerContentItem(post.postId).excerpt}
                      </span>
                      <span className="text-xs font-bold text-text">
                        {isBelowPrivacyFloor(post.orders)
                          ? t(`${key}.floor`, { floor: PRIVACY_FLOOR })
                          : t(`${key}.value`, {
                              count: post.orders,
                              value: formatBrlWhole(post.cents),
                            })}
                      </span>
                    </span>
                    <ChevronRight aria-hidden size={18} className="shrink-0 text-brand" />
                  </a>
                </li>
              ))}
            </ul>
          </Card>
          <p className="text-xs text-text-secondary">{t(`${key}.note`)}</p>
        </>
      )}
    </PanelSection>
  );
}

/**
 * A product opened from its card or from Visão geral (D-08): "Voltar" to where it opened, the header
 * (cover, name, "Parado", the store price and the change), then Números, Receita por semana,
 * Compradores por faixa, the offers (the entry first, each opening the month's buyers) and the
 * publications that sold it.
 */
export function OwnerFinanceProductDetail({ t, view }: { t: DashboardT; view: OwnerFinanceView }) {
  const back = financeBackHref(view);
  if (!view.productId || back === null) throw new Error('a product detail with no product');
  const product = ownerFinanceProductDetail(view.productId);
  const { byOffer } = ownerFinanceWindow(0, 29);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <BackLink href={back} label={t('tenantOwner.memberDetail.back')} />
      <Card className="flex flex-col">
        <CoverThumb t={t} kind={productCoverKind(product.id)} seed={product.id} variant="banner" />
        <div className="flex flex-col gap-2 p-4 [overflow-wrap:anywhere]">
          <ProductName t={t} product={product} as="h3" />
          <span className="text-sm text-text-secondary">
            {t(`${KEY}.products.priceLine`, { value: formatBrl(product.priceCents) })}
          </span>
        </div>
      </Card>

      <Numbers t={t} product={product} />

      <PanelSection title={t(`${KEY}.detail.weekly`)}>
        <WeeklyChart
          t={t}
          title={t(`${KEY}.detail.weeklyChart`, { product: product.name })}
          current={product.weekly.current}
          previous={product.weekly.previous}
        />
      </PanelSection>

      <BuyersByBand t={t} product={product} />

      <PanelSection title={t(`${KEY}.offers.title`)}>
        <p className="text-sm text-text-secondary">{t(`${KEY}.offers.note`)}</p>
        <ul className="flex flex-col gap-3">
          {financeProductOffers(product.id).map((offer) => {
            const { orders, cents } = byOffer[offer.id];
            return (
              <li key={offer.id} id={financeOfferAnchor(offer.id)} className="scroll-mt-20">
                <OfferCard
                  t={t}
                  offer={offer}
                  orders={orders}
                  cents={cents}
                  href={orders === 0 ? null : ownerFinanceHref({ ...view, offerId: offer.id })}
                />
              </li>
            );
          })}
        </ul>
      </PanelSection>

      <SoldBy t={t} product={product} />
    </div>
  );
}
