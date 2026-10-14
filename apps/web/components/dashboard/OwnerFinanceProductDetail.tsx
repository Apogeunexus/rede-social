import { formatBrl } from '@rede-social/contracts/money';
import { CommunityCover } from '@rede-social/module-communities/ui';
import {
  type FinanceOffer,
  financeProductOffers,
  ownerFinanceProduct,
  ownerFinanceWindow,
} from '@rede-social/module-dashboard/fixtures';
import { Card, cn, StatusPill } from '@rede-social/ui';
import { ChevronRight } from 'lucide-react';
import {
  financeBackHref,
  financeOfferAnchor,
  type OwnerFinanceView,
  ownerFinanceHref,
} from '@/lib/owner-finance-view';
import { BackLink } from './BackLink';
import { Linked } from './BandScopeCards';
import type { DashboardT } from './format';
import { ProductChange, ProductName } from './OwnerFinanceProducts';
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
              : t(`${KEY}.offers.orders`, { count: orders, value: formatBrl(cents) })}
          </span>
        </span>
        {href !== null ? (
          <ChevronRight aria-hidden size={18} className="shrink-0 text-brand" />
        ) : null}
      </Card>
    </Linked>
  );
}

/**
 * A product opened from its card (D-08): "Voltar" to the card, the header (cover, name, "Parado",
 * the store price and the change against the 30 days before), then its offers, the entry first, each
 * opening the buyers of the month.
 */
export function OwnerFinanceProductDetail({ t, view }: { t: DashboardT; view: OwnerFinanceView }) {
  const back = financeBackHref(view);
  if (!view.productId || back === null) throw new Error('a product detail with no product');
  const product = ownerFinanceProduct(view.productId);
  const { byOffer } = ownerFinanceWindow(0, 29);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <BackLink href={back} label={t('tenantOwner.memberDetail.back')} />
      <Card className="flex flex-col">
        <CommunityCover
          geometry="card"
          coverAssetId={null}
          coverVariantWidths={[]}
          coverAlt={product.name}
        />
        <div className="flex flex-col gap-2 p-4 [overflow-wrap:anywhere]">
          <ProductName t={t} product={product} as="h3" />
          <span className="text-sm text-text-secondary">
            {t(`${KEY}.products.priceLine`, { value: formatBrl(product.priceCents) })}
          </span>
          <ProductChange t={t} product={product} />
        </div>
      </Card>

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
    </div>
  );
}
