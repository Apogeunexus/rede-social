import { formatBrl } from '@rede-social/contracts/money';
import {
  financeOffer,
  ownerFinancePeople,
  ownerFinanceProduct,
} from '@rede-social/module-dashboard/fixtures';
import { financeBackHref, type OwnerFinanceView, ownerFinanceHref } from '@/lib/owner-finance-view';
import { BackLink } from './BackLink';
import { type DashboardT, momentText } from './format';
import { PeopleCards } from './OwnerContentPeople';
import { PanelSection } from './PanelSection';

/*
 * The only web file that reads `ownerFinancePeople`: who bought, what and for how much (D-11) reach
 * the client's own team at level 4 only; levels 1 to 3 never see a name, only aggregates.
 */

const KEY = 'tenantOwner.finance.people';

/**
 * The buyers of one offer in the last 30 days (D-08): "Voltar" to the offer, its composition and
 * product, how many bought it, then the member cards most recent first, each saying when and for how
 * much they bought; each card opens the member's insights.
 */
export function OwnerFinancePeople({ t, view }: { t: DashboardT; view: OwnerFinanceView }) {
  const back = financeBackHref(view);
  // The parser only sets an offer under its product: a gap here is a bug.
  if (!view.offerId || back === null) throw new Error('a buyers list with no offer');
  const offer = financeOffer(view.offerId);
  const { people, total } = ownerFinancePeople({ kind: 'offer', offerId: offer.id });
  const product = ownerFinanceProduct(offer.productId).name;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <BackLink href={back} label={t('tenantOwner.memberDetail.back')} />
      <PanelSection title={offer.composition} period={product} prominent>
        <p className="text-sm text-text-secondary">{t(`${KEY}.count`, { count: total })}</p>
        <PeopleCards
          t={t}
          people={people}
          total={total}
          hrefOf={(memberId) => ownerFinanceHref({ ...view, memberId, list: null })}
          leadOf={(person) =>
            t(`${KEY}.bought`, { when: momentText(t, person.when), value: formatBrl(person.cents) })
          }
          showBand
          moreText={(more) => t(`${KEY}.more`, { count: more })}
        />
      </PanelSection>
    </div>
  );
}
