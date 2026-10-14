import {
  FINANCE_OFFERS,
  type FinanceOfferId,
  financeProductOffers,
  ownerBandRoster,
  ownerFinanceIncludes,
  ownerFinanceWindow,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import { describe, expect, it } from 'vitest';
import { OWNER_MEMBER_LISTS } from './owner-band-scope';
import {
  financeBackHref,
  financeTabView,
  type OwnerFinanceView,
  ownerFinanceHref,
  parseOwnerFinanceView,
} from './owner-finance-view';

type Params = Parameters<typeof parseOwnerFinanceView>[0];

const AREA = '/painel-preview/dono-do-cliente?area=financeiro';

const EMPTY: OwnerFinanceView = financeTabView('overview');

function view(patch: Partial<OwnerFinanceView>): OwnerFinanceView {
  return { ...EMPTY, ...patch };
}

/** The query of an href, as the page receives it. */
function paramsOf(href: string): Params {
  const query = href.split('#')[0]?.split('?')[1] ?? '';
  const params: Record<string, string | string[]> = {};
  for (const [key, value] of new URLSearchParams(query)) {
    const before = params[key];
    params[key] = before === undefined ? value : [before, value].flat();
  }
  return params;
}

const MONTH = ownerFinanceWindow(0, 29);
const PRODUCT_IDS = tenantOwnerPanel.store.products.map((row) => row.id);

/** The first roster member who bought the offer in the month (the names stay with the web file). */
function buyerOf(offerId: FinanceOfferId): string {
  const id = ownerBandRoster.find((row) =>
    ownerFinanceIncludes({ kind: 'offer', offerId }, row.id),
  )?.id;
  if (!id) throw new Error(`no roster buyer of ${offerId}`);
  return id;
}

describe('parseOwnerFinanceView: the tabs (D-01)', () => {
  it('opens Visão geral with nothing else by default', () => {
    expect(parseOwnerFinanceView({})).toEqual(EMPTY);
    expect(parseOwnerFinanceView({ area: 'financeiro' })).toEqual(EMPTY);
    expect(EMPTY).toMatchObject({
      tab: 'overview',
      productId: null,
      offerId: null,
      memberId: null,
      list: null,
    });
  });

  it('reads vista exactly and singly, else Visão geral', () => {
    expect(parseOwnerFinanceView({ vista: 'produtos' }).tab).toBe('products');
    expect(parseOwnerFinanceView({ vista: 'quem-compra' }).tab).toBe('buyers');
    for (const vista of ['PRODUTOS', 'xyz', '', ['produtos', 'produtos']]) {
      expect(parseOwnerFinanceView({ vista } as Params), String(vista)).toEqual(EMPTY);
    }
  });
});

describe('parseOwnerFinanceView: Produtos → oferta → comprador → lista (D-08)', () => {
  it('opens a product of the store only', () => {
    for (const id of PRODUCT_IDS) {
      expect(parseOwnerFinanceView({ vista: 'produtos', produto: id }).productId).toBe(id);
    }
    for (const produto of ['xyz', 'S2', '', ['s2', 's2']]) {
      expect(
        parseOwnerFinanceView({ vista: 'produtos', produto } as Params),
        String(produto),
      ).toEqual(view({ tab: 'products' }));
    }
  });

  it('opens an offer of the opened product that sold in the month', () => {
    expect(
      parseOwnerFinanceView({ vista: 'produtos', produto: 's2', oferta: 'vip-entrada' }),
    ).toEqual(view({ tab: 'products', productId: 's2', offerId: 'vip-entrada' }));
    // An offer of another product, an unsold one, or no product: one level up.
    expect(
      parseOwnerFinanceView({ vista: 'produtos', produto: 's2', oferta: 'ebook-entrada' }),
    ).toEqual(view({ tab: 'products', productId: 's2' }));
    expect(
      parseOwnerFinanceView({ vista: 'produtos', produto: 's4', oferta: 'workshop-adicional' }),
    ).toEqual(view({ tab: 'products', productId: 's4' }));
    expect(parseOwnerFinanceView({ vista: 'produtos', oferta: 'vip-entrada' })).toEqual(
      view({ tab: 'products' }),
    );
    expect(
      parseOwnerFinanceView({
        vista: 'produtos',
        produto: 's2',
        oferta: ['vip-entrada', 'vip-entrada'],
      }),
    ).toEqual(view({ tab: 'products', productId: 's2' }));
  });

  it('opens a member only from the offer’s buyers, and a list only with a member', () => {
    const buyer = buyerOf('vip-entrada');
    const base = { vista: 'produtos', produto: 's2', oferta: 'vip-entrada' };
    expect(parseOwnerFinanceView({ ...base, membro: buyer })).toEqual(
      view({ tab: 'products', productId: 's2', offerId: 'vip-entrada', memberId: buyer }),
    );
    const outside = ownerBandRoster.find(
      (row) => !ownerFinanceIncludes({ kind: 'offer', offerId: 'vip-entrada' }, row.id),
    )?.id;
    expect(outside).toBeDefined();
    for (const membro of [outside ?? '', 'om-99', '', [buyer, buyer]]) {
      expect(parseOwnerFinanceView({ ...base, membro } as Params), String(membro)).toEqual(
        view({ tab: 'products', productId: 's2', offerId: 'vip-entrada' }),
      );
    }
    for (const lista of OWNER_MEMBER_LISTS) {
      expect(parseOwnerFinanceView({ ...base, membro: buyer, lista }).list).toBe(lista);
    }
    expect(parseOwnerFinanceView({ ...base, membro: buyer, lista: 'xyz' }).list).toBeNull();
    expect(parseOwnerFinanceView({ ...base, lista: 'curtidas' }).list).toBeNull();
    expect(parseOwnerFinanceView({ vista: 'produtos', membro: buyer }).memberId).toBeNull();
  });
});

describe('ownerFinanceHref and financeBackHref', () => {
  const buyer = buyerOf('vip-entrada');

  it('writes the params in a fixed order', () => {
    expect(ownerFinanceHref(EMPTY)).toBe(AREA);
    expect(ownerFinanceHref(view({ tab: 'buyers' }))).toBe(`${AREA}&vista=quem-compra`);
    expect(
      ownerFinanceHref(
        view({
          tab: 'products',
          productId: 's2',
          offerId: 'vip-entrada',
          memberId: buyer,
          list: 'curtidas',
        }),
      ),
    ).toBe(`${AREA}&vista=produtos&produto=s2&oferta=vip-entrada&membro=${buyer}&lista=curtidas`);
  });

  it('goes back exactly one step, landing on what was closed', () => {
    const list = view({
      tab: 'products',
      productId: 's2',
      offerId: 'vip-entrada',
      memberId: buyer,
      list: 'curtidas',
    });
    expect(financeBackHref(list)).toBe(
      `${AREA}&vista=produtos&produto=s2&oferta=vip-entrada&membro=${buyer}#insight-curtidas`,
    );
    expect(financeBackHref({ ...list, list: null })).toBe(
      `${AREA}&vista=produtos&produto=s2&oferta=vip-entrada#membro-${buyer}`,
    );
    expect(financeBackHref({ ...list, list: null, memberId: null })).toBe(
      `${AREA}&vista=produtos&produto=s2#oferta-vip-entrada`,
    );
    expect(financeBackHref({ ...list, list: null, memberId: null, offerId: null })).toBe(
      `${AREA}&vista=produtos#produto-s2`,
    );
    for (const tab of ['overview', 'products', 'buyers'] as const) {
      expect(financeBackHref(financeTabView(tab)), tab).toBeNull();
    }
  });

  it('round-trips every valid Produtos view', () => {
    const views: OwnerFinanceView[] = [];
    for (const productId of PRODUCT_IDS) {
      views.push(view({ tab: 'products', productId }));
      for (const offer of financeProductOffers(productId)) {
        if (MONTH.byOffer[offer.id].orders === 0) continue;
        const withOffer = view({ tab: 'products', productId, offerId: offer.id });
        views.push(withOffer);
        for (const row of ownerBandRoster) {
          if (!ownerFinanceIncludes({ kind: 'offer', offerId: offer.id }, row.id)) continue;
          views.push({ ...withOffer, memberId: row.id });
          views.push({ ...withOffer, memberId: row.id, list: 'acoes-fortes' });
        }
      }
    }
    expect(views.length).toBeGreaterThan(FINANCE_OFFERS.length);
    for (const item of views) {
      expect(
        parseOwnerFinanceView(paramsOf(ownerFinanceHref(item))),
        ownerFinanceHref(item),
      ).toEqual(item);
    }
  });
});
