import {
  FINANCE_OFFERS,
  type FinanceOfferId,
  financeProductOffers,
  ownerFinanceIncludes,
  ownerFinanceWindow,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import { ownerAreaHref } from './dashboard-preview';
import {
  OWNER_MEMBER_LISTS,
  type OwnerMemberListSlug,
  ownerInsightAnchor,
} from './owner-band-scope';

/*
 * Kept apart from dashboard-preview.ts on purpose (as owner-content-view.ts): proxy.ts imports that
 * file and must never pull the fixtures in. This module imports it, never the reverse.
 */

type SearchParams = Record<string, string | string[] | undefined>;

/** The three tabs of the Financeiro area (quick 261014-dwc D-01). */
export type FinanceTab = 'overview' | 'products' | 'buyers';

/**
 * Where the Financeiro area stands in its cascade (D-01): the tab; under Produtos, the product, one
 * of its offers, a buyer of that offer and the list behind one of the buyer's insight numbers. Each
 * level is only ever set with the levels above it.
 */
export interface OwnerFinanceView {
  tab: FinanceTab;
  productId: string | null;
  offerId: FinanceOfferId | null;
  memberId: string | null;
  list: OwnerMemberListSlug | null;
}

/** `?vista=` per tab; Visão geral has none. */
const TAB_SLUGS = { products: 'produtos', buyers: 'quem-compra' } as const;

const PRODUCT_IDS: readonly string[] = tenantOwnerPanel.store.products.map((row) => row.id);
const OFFER_IDS: readonly FinanceOfferId[] = FINANCE_OFFERS.map((offer) => offer.id);

/** The offers that sold in the last 30 days: only those open a list of buyers. */
const SOLD_OFFERS: ReadonlySet<FinanceOfferId> = (() => {
  const { byOffer } = ownerFinanceWindow(0, 29);
  return new Set(OFFER_IDS.filter((id) => byOffer[id].orders > 0));
})();

/** The id of a product card: Voltar from its detail lands on it. */
export function financeProductAnchor(productId: string): string {
  return `produto-${productId}`;
}

/** The id of an offer card on a product's detail: Voltar from its buyers lands on it. */
export function financeOfferAnchor(offerId: FinanceOfferId): string {
  return `oferta-${offerId}`;
}

/** The id of a member card in a buyers list: Voltar from the insights lands on it. */
export function financeMemberAnchor(memberId: string): string {
  return `membro-${memberId}`;
}

/** A query value only when it is a single string, exactly one of `allowed`. */
function pick<T extends string>(raw: string | string[] | undefined, allowed: readonly T[]) {
  return typeof raw === 'string' ? allowed.find((value) => value === raw) : undefined;
}

/** The key whose slug the query names exactly, else undefined. */
function bySlug<K extends string>(
  raw: string | string[] | undefined,
  slugs: Readonly<Record<K, string>>,
): K | undefined {
  if (typeof raw !== 'string') return undefined;
  return (Object.keys(slugs) as K[]).find((key) => slugs[key] === raw);
}

/** The offer the query names: one of the opened product's that sold in the month. */
function parseOffer(params: SearchParams, productId: string | null): FinanceOfferId | null {
  if (!productId) return null;
  const id = pick(params.oferta, OFFER_IDS);
  if (!id || !SOLD_OFFERS.has(id)) return null;
  return financeProductOffers(productId).some((offer) => offer.id === id) ? id : null;
}

/** The member the query names, when the opened offer's buyers hold them (no names read here). */
function parseMember(params: SearchParams, offerId: FinanceOfferId | null): string | null {
  const id = typeof params.membro === 'string' ? params.membro : undefined;
  if (!id || !offerId) return null;
  return ownerFinanceIncludes({ kind: 'offer', offerId }, id) ? id : null;
}

/**
 * The view the query asks for (untrusted), read level by level; an invalid value at any level falls
 * to the level above, never to an error (D-01):
 * 1. `vista` is `produtos` or `quem-compra`, else Visão geral.
 * 2. `produto` (Produtos only) is a store product.
 * 3. `oferta` is one of the opened product's offers with orders in the last 30 days.
 * 4. `membro` must be a buyer of the opened offer (`ownerFinanceIncludes`).
 * 5. `lista` is one of OWNER_MEMBER_LISTS, only with a member.
 * Only allow-listed constants ever reach markup or URLs.
 */
export function parseOwnerFinanceView(params: SearchParams): OwnerFinanceView {
  const tab = bySlug(params.vista, TAB_SLUGS) ?? 'overview';
  const productId = tab === 'products' ? (pick(params.produto, PRODUCT_IDS) ?? null) : null;
  const offerId = parseOffer(params, productId);
  const memberId = parseMember(params, offerId);
  const list = memberId ? (pick(params.lista, OWNER_MEMBER_LISTS) ?? null) : null;
  return { tab, productId, offerId, memberId, list };
}

/** The link to a cascade view: the area, then `vista`, `produto`, `oferta`, `membro` and `lista`. */
export function ownerFinanceHref(view: OwnerFinanceView): string {
  let query = '';
  if (view.tab !== 'overview') query += `&vista=${TAB_SLUGS[view.tab]}`;
  if (view.productId) query += `&produto=${view.productId}`;
  if (view.offerId) query += `&oferta=${view.offerId}`;
  if (view.memberId) query += `&membro=${view.memberId}`;
  if (view.list) query += `&lista=${view.list}`;
  return `${ownerAreaHref('financeiro')}${query}`;
}

/**
 * "Voltar" one level up (D-01): the parent view's link landing on what was closed (the insight
 * number, the member card, the offer card, the product card). Null on a tab screen.
 */
export function financeBackHref(view: OwnerFinanceView): string | null {
  if (view.list) {
    return `${ownerFinanceHref({ ...view, list: null })}#${ownerInsightAnchor(view.list)}`;
  }
  if (view.memberId) {
    return `${ownerFinanceHref({ ...view, memberId: null })}#${financeMemberAnchor(view.memberId)}`;
  }
  if (view.offerId) {
    return `${ownerFinanceHref({ ...view, offerId: null })}#${financeOfferAnchor(view.offerId)}`;
  }
  if (view.productId) {
    return `${ownerFinanceHref({ ...view, productId: null })}#${financeProductAnchor(view.productId)}`;
  }
  return null;
}

/** A tab screen with nothing open below it. */
export function financeTabView(tab: FinanceTab): OwnerFinanceView {
  return { tab, productId: null, offerId: null, memberId: null, list: null };
}
