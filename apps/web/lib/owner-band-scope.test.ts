import {
  type EngagementBand,
  type OwnerBandScope,
  ownerBandIncludes,
  ownerBandRoster,
  ownerScopeBands,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import { ENGAGEMENT_BAND_ORDER } from '@rede-social/module-dashboard/ui';
import { describe, expect, it } from 'vitest';
import {
  OWNER_BAND_SLUGS,
  OWNER_BANDS_ANCHOR,
  OWNER_COMMUNITIES,
  OWNER_EVENTS,
  type OwnerMembersView,
  ownerListScope,
  ownerMembersHref,
  parseOwnerMembersView,
} from './owner-band-scope';

type Params = Parameters<typeof parseOwnerMembersView>[0];

const AREA = '/painel-preview/dono-do-cliente?area=membros';

function view(
  kind: OwnerMembersView['kind'],
  band: EngagementBand | null = null,
  itemId: string | null = null,
  memberId: string | null = null,
): OwnerMembersView {
  return { kind, band, itemId, memberId };
}

/** The first roster member in `band` of a list (the band lists stay BandMembers.tsx's to read). */
function firstMember(scope: OwnerBandScope, band: EngagementBand): string | undefined {
  return ownerBandRoster.find((row) => ownerBandIncludes(scope, band, row.id))?.id;
}

describe('OWNER_COMMUNITIES (quick 261012-pkd D-01)', () => {
  it('derives one unique slug per fixture community, in its order', () => {
    expect(OWNER_COMMUNITIES.map((row) => row.id)).toEqual(
      tenantOwnerPanel.byCommunity.map((row) => row.id),
    );
    const slugs = OWNER_COMMUNITIES.map((row) => row.slug);
    expect(slugs).toEqual(['vip', 'geral', 'iniciantes', 'eventos']);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('OWNER_EVENTS (quick 261012-qer B-2)', () => {
  it('lists the panel events, upcoming soonest first, then past most recent first', () => {
    expect(OWNER_EVENTS.map((row) => row.id)).toEqual(['u1', 'u2', 'u3', 'e4', 'e3', 'e2', 'e1']);
    expect(OWNER_EVENTS[0]).toEqual({ id: 'u1', name: 'Encontro mensal', date: '2026-10-12' });
  });
});

describe('OWNER_BAND_SLUGS (quick 261012-qer B-3)', () => {
  it('maps each band to one slug and back', () => {
    expect(OWNER_BAND_SLUGS).toEqual({
      new: 'novos',
      superfan: 'superfas',
      engaged: 'engajados',
      occasional: 'ocasionais',
      at_risk: 'em-risco',
      inactive: 'inativos',
    });
    for (const [band, faixa] of Object.entries(OWNER_BAND_SLUGS)) {
      expect(parseOwnerMembersView({ faixa }).band).toBe(band);
    }
  });

  it('reads no band without a slug, or for anything but a slug', () => {
    expect(parseOwnerMembersView({}).band).toBeNull();
    for (const faixa of ['at_risk', 'Em-risco', 'em-risco ', '', '__proto__', ['novos', 'novos']]) {
      expect(parseOwnerMembersView({ faixa }).band, JSON.stringify(faixa)).toBeNull();
    }
  });
});

describe('parseOwnerMembersView: the cascade levels (quick 261012-tru D-05)', () => {
  it('opens each tab on its closed bands', () => {
    expect(parseOwnerMembersView({})).toEqual(view('member'));
    expect(parseOwnerMembersView({ recorte: 'membro' })).toEqual(view('member'));
    expect(parseOwnerMembersView({ recorte: 'comunidade' })).toEqual(view('community'));
    expect(parseOwnerMembersView({ recorte: 'evento' })).toEqual(view('event'));
  });

  it('opens a band, then a community or an event inside it', () => {
    expect(parseOwnerMembersView({ recorte: 'comunidade', faixa: 'engajados' })).toEqual(
      view('community', 'engaged'),
    );
    expect(
      parseOwnerMembersView({ recorte: 'comunidade', comunidade: 'vip', faixa: 'engajados' }),
    ).toEqual(view('community', 'engaged', 'c-vip'));
    expect(parseOwnerMembersView({ recorte: 'evento', evento: 'u1', faixa: 'engajados' })).toEqual(
      view('event', 'engaged', 'u1'),
    );
  });

  it('falls to the band’s cards for an unknown community, keeping the band', () => {
    for (const comunidade of ['xyz', 'VIP', 'c-geral', '', '__proto__', ['vip']]) {
      expect(
        parseOwnerMembersView({ recorte: 'comunidade', comunidade, faixa: 'engajados' }),
        JSON.stringify(comunidade),
      ).toEqual(view('community', 'engaged'));
    }
    expect(
      parseOwnerMembersView({ recorte: 'comunidade', evento: 'u1', faixa: 'engajados' }),
    ).toEqual(view('community', 'engaged'));
  });

  it('falls to the closed bands for an item with no band', () => {
    expect(parseOwnerMembersView({ recorte: 'comunidade', comunidade: 'vip' })).toEqual(
      view('community'),
    );
    expect(parseOwnerMembersView({ recorte: 'evento', evento: 'u1' })).toEqual(view('event'));
  });

  it('falls to the band’s cards for an item with nobody in the band', () => {
    expect(parseOwnerMembersView({ recorte: 'evento', evento: 'u1', faixa: 'inativos' })).toEqual(
      view('event', 'inactive'),
    );
  });

  it('falls to the band’s cards for an unknown or repeated event', () => {
    for (const evento of ['xyz', 'U1', '', 'constructor', 'e2 ', ['e2', 'e2']]) {
      expect(
        parseOwnerMembersView({ recorte: 'evento', evento, faixa: 'engajados' }),
        JSON.stringify(evento),
      ).toEqual(view('event', 'engaged'));
    }
  });

  it('reads any other recorte as Por membro, ignoring comunidade and evento', () => {
    const values: Params['recorte'][] = [
      'COMUNIDADE',
      '',
      '__proto__',
      'constructor',
      ['evento', 'evento'],
      'evento ',
      'xyz',
    ];
    for (const recorte of values) {
      expect(
        parseOwnerMembersView({ recorte, comunidade: 'geral', evento: 'e2', faixa: 'engajados' }),
        JSON.stringify(recorte),
      ).toEqual(view('member', 'engaged'));
    }
    expect(parseOwnerMembersView({ comunidade: 'vip', faixa: 'novos' })).toEqual(
      view('member', 'new'),
    );
  });
});

describe('parseOwnerMembersView: the member level (quick 261012-tru D-06)', () => {
  it('opens a member only from the band they hold in the opened list', () => {
    expect(parseOwnerMembersView({ faixa: 'superfas', membro: 'om-13' }).memberId).toBe('om-13');
    expect(parseOwnerMembersView({ membro: 'om-13' })).toEqual(view('member'));
    expect(parseOwnerMembersView({ faixa: 'novos', membro: 'om-13' })).toEqual(
      view('member', 'new'),
    );
    const eventos = { recorte: 'comunidade', comunidade: 'eventos', membro: 'om-28' };
    expect(parseOwnerMembersView({ ...eventos, faixa: 'ocasionais' })).toEqual(
      view('community', 'occasional', 'c-eventos', 'om-28'),
    );
    expect(parseOwnerMembersView({ ...eventos, faixa: 'engajados' })).toEqual(
      view('community', 'engaged', 'c-eventos'),
    );
    expect(
      parseOwnerMembersView({
        recorte: 'comunidade',
        comunidade: 'vip',
        faixa: 'superfas',
        membro: 'om-13',
      }),
    ).toEqual(view('community', 'superfan', 'c-vip'));
  });

  it('opens no member from a band’s cards (no community or event opened)', () => {
    expect(
      parseOwnerMembersView({ recorte: 'comunidade', faixa: 'engajados', membro: 'om-25' }),
    ).toEqual(view('community', 'engaged'));
  });

  it('opens an event registrant listed in that event’s band', () => {
    const first = firstMember({ kind: 'event', id: 'u1' }, 'engaged');
    expect(first).toBeDefined();
    expect(
      parseOwnerMembersView({ recorte: 'evento', evento: 'u1', faixa: 'engajados', membro: first }),
    ).toEqual(view('event', 'engaged', 'u1', first ?? null));
  });

  it('accepts a roster id as the member, and nothing else', () => {
    for (const membro of ['om-99', 'OM-01', 'om-1', '', '__proto__', 'constructor', ['om-01']]) {
      for (const faixa of [undefined, 'novos', 'inativos']) {
        expect(
          parseOwnerMembersView({ faixa, membro }).memberId,
          JSON.stringify({ faixa, membro }),
        ).toBeNull();
      }
    }
  });
});

describe('ownerListScope', () => {
  it('is the whole base, the opened item, or none while a band shows its cards', () => {
    expect(ownerListScope(view('member', 'engaged'))).toEqual({ kind: 'member' });
    expect(ownerListScope(view('member'))).toEqual({ kind: 'member' });
    expect(ownerListScope(view('community', 'engaged', 'c-vip'))).toEqual({
      kind: 'community',
      id: 'c-vip',
    });
    expect(ownerListScope(view('event', 'engaged', 'u1'))).toEqual({ kind: 'event', id: 'u1' });
    expect(ownerListScope(view('community', 'engaged'))).toBeNull();
    expect(ownerListScope(view('event'))).toBeNull();
  });
});

describe('ownerMembersHref', () => {
  it('links each level, landing on the bands until a member opens', () => {
    expect(OWNER_BANDS_ANCHOR).toBe('faixas');
    expect(ownerMembersHref(view('member'))).toBe(`${AREA}#faixas`);
    expect(ownerMembersHref(view('community'))).toBe(`${AREA}&recorte=comunidade#faixas`);
    expect(ownerMembersHref(view('event'))).toBe(`${AREA}&recorte=evento#faixas`);
    expect(ownerMembersHref(view('community', 'engaged'))).toBe(
      `${AREA}&recorte=comunidade&faixa=engajados#faixas`,
    );
    expect(ownerMembersHref(view('community', 'engaged', 'c-vip'))).toBe(
      `${AREA}&recorte=comunidade&comunidade=vip&faixa=engajados#faixas`,
    );
    expect(ownerMembersHref(view('event', 'engaged', 'u1'))).toBe(
      `${AREA}&recorte=evento&evento=u1&faixa=engajados#faixas`,
    );
    expect(ownerMembersHref(view('community', 'occasional', 'c-eventos', 'om-28'))).toBe(
      `${AREA}&recorte=comunidade&comunidade=eventos&faixa=ocasionais&membro=om-28`,
    );
    expect(ownerMembersHref(view('member', 'at_risk', null, 'om-49'))).toBe(
      `${AREA}&faixa=em-risco&membro=om-49`,
    );
  });

  it('round-trips every reachable view through the parser', () => {
    const items = {
      member: [null],
      community: [null, ...OWNER_COMMUNITIES.map((row) => row.id)],
      event: [null, ...OWNER_EVENTS.map((row) => row.id)],
    } as const;
    let checked = 0;
    for (const kind of ['member', 'community', 'event'] as const) {
      for (const band of [null, ...ENGAGEMENT_BAND_ORDER]) {
        for (const itemId of items[kind]) {
          if (itemId !== null) {
            if (band === null) continue;
            if (ownerScopeBands({ kind, id: itemId }).counts[band] === 0) continue;
          }
          const base = view(kind, band, itemId);
          const listScope = ownerListScope(base);
          const first = band && listScope ? (firstMember(listScope, band) ?? null) : null;
          for (const memberId of first ? [null, first] : [null]) {
            const target = { ...base, memberId };
            const query = new URL(ownerMembersHref(target), 'http://x').searchParams;
            expect(
              parseOwnerMembersView(Object.fromEntries(query)),
              JSON.stringify(target),
            ).toEqual(target);
            checked += 1;
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(100);
  });
});
