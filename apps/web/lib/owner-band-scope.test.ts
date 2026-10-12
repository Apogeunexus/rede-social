import { tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import { describe, expect, it } from 'vitest';
import {
  OWNER_BAND_SLUGS,
  OWNER_BANDS_ANCHOR,
  OWNER_COMMUNITIES,
  OWNER_EVENTS,
  ownerMemberHref,
  ownerScopeHref,
  parseOwnerMembersView,
} from './owner-band-scope';

type Params = Parameters<typeof parseOwnerMembersView>[0];

function scopeOf(params: Params) {
  return parseOwnerMembersView(params).scope;
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

describe('parseOwnerMembersView: the scope', () => {
  it('is Por membro without a recorte, or with recorte=membro', () => {
    expect(scopeOf({})).toEqual({ kind: 'member' });
    expect(scopeOf({ recorte: 'membro' })).toEqual({ kind: 'member' });
  });

  it('picks an allow-listed community, else the first one', () => {
    expect(scopeOf({ recorte: 'comunidade', comunidade: 'geral' })).toEqual({
      kind: 'community',
      id: 'c-geral',
    });
    expect(scopeOf({ recorte: 'comunidade', comunidade: 'eventos' })).toEqual({
      kind: 'community',
      id: 'c-eventos',
    });
    for (const comunidade of [undefined, 'xyz', 'VIP', 'c-geral', '', '__proto__', ['geral']]) {
      expect(scopeOf({ recorte: 'comunidade', comunidade }), JSON.stringify(comunidade)).toEqual({
        kind: 'community',
        id: 'c-vip',
      });
    }
  });

  it('picks an allow-listed event, else the first one', () => {
    expect(scopeOf({ recorte: 'evento', evento: 'e2' })).toEqual({ kind: 'event', id: 'e2' });
    for (const evento of [undefined, 'xyz', 'U1', '', 'constructor', 'e2 ', ['e2', 'e2']]) {
      expect(scopeOf({ recorte: 'evento', evento }), JSON.stringify(evento)).toEqual({
        kind: 'event',
        id: 'u1',
      });
    }
  });

  it('reads a bare legacy comunidade as Por membro', () => {
    expect(scopeOf({ comunidade: 'vip' })).toEqual({ kind: 'member' });
    expect(scopeOf({ evento: 'e2' })).toEqual({ kind: 'member' });
  });

  it('falls back to Por membro for any other recorte', () => {
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
        scopeOf({ recorte, comunidade: 'geral', evento: 'e2' }),
        JSON.stringify(recorte),
      ).toEqual({ kind: 'member' });
    }
  });
});

describe('ownerScopeHref', () => {
  it('links each scope on the Membros area, landing on the bands', () => {
    expect(OWNER_BANDS_ANCHOR).toBe('faixas');
    expect(ownerScopeHref({ kind: 'member' })).toBe(
      '/painel-preview/dono-do-cliente?area=membros#faixas',
    );
    expect(ownerScopeHref({ kind: 'community', id: 'c-vip' })).toBe(
      '/painel-preview/dono-do-cliente?area=membros&recorte=comunidade&comunidade=vip#faixas',
    );
    expect(ownerScopeHref({ kind: 'event', id: 'u1' })).toBe(
      '/painel-preview/dono-do-cliente?area=membros&recorte=evento&evento=u1#faixas',
    );
  });

  it('round-trips through the parser', () => {
    const scopes = [
      { kind: 'member' } as const,
      ...OWNER_COMMUNITIES.map((row) => ({ kind: 'community' as const, id: row.id })),
      ...OWNER_EVENTS.map((row) => ({ kind: 'event' as const, id: row.id })),
    ];
    for (const scope of scopes) {
      const query = new URL(ownerScopeHref(scope), 'http://x').searchParams;
      expect(scopeOf(Object.fromEntries(query))).toEqual(scope);
    }
  });
});

describe('parseOwnerMembersView: the open band and member (quick 261012-qer B-3)', () => {
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

  it('is null without a band, or for anything but a slug', () => {
    expect(parseOwnerMembersView({}).band).toBeNull();
    for (const faixa of ['at_risk', 'Em-risco', 'em-risco ', '', '__proto__', ['novos', 'novos']]) {
      expect(parseOwnerMembersView({ faixa }).band, JSON.stringify(faixa)).toBeNull();
    }
  });

  it('accepts a roster id as the member, and nothing else', () => {
    expect(parseOwnerMembersView({}).memberId).toBeNull();
    expect(parseOwnerMembersView({ membro: 'om-01' }).memberId).toBe('om-01');
    expect(parseOwnerMembersView({ membro: 'om-72' }).memberId).toBe('om-72');
    for (const membro of ['om-99', 'OM-01', 'om-1', '', '__proto__', 'constructor', ['om-01']]) {
      expect(parseOwnerMembersView({ membro }).memberId, JSON.stringify(membro)).toBeNull();
    }
  });

  it('keeps the scope next to the band and member', () => {
    expect(
      parseOwnerMembersView({
        recorte: 'evento',
        evento: 'e2',
        faixa: 'em-risco',
        membro: 'om-49',
      }),
    ).toEqual({ scope: { kind: 'event', id: 'e2' }, band: 'at_risk', memberId: 'om-49' });
  });
});

describe('ownerScopeHref with a band, and ownerMemberHref', () => {
  it('reopens the band on the way back to #faixas', () => {
    expect(ownerScopeHref({ kind: 'member' }, 'at_risk')).toBe(
      '/painel-preview/dono-do-cliente?area=membros&faixa=em-risco#faixas',
    );
    expect(ownerScopeHref({ kind: 'event', id: 'u1' }, 'new')).toBe(
      '/painel-preview/dono-do-cliente?area=membros&recorte=evento&evento=u1&faixa=novos#faixas',
    );
  });

  it('opens a member in the scope and band, with no anchor', () => {
    expect(ownerMemberHref({ kind: 'member' }, 'at_risk', 'om-49')).toBe(
      '/painel-preview/dono-do-cliente?area=membros&faixa=em-risco&membro=om-49',
    );
    expect(ownerMemberHref({ kind: 'community', id: 'c-geral' }, 'superfan', 'om-13')).toBe(
      '/painel-preview/dono-do-cliente?area=membros&recorte=comunidade&comunidade=geral&faixa=superfas&membro=om-13',
    );
  });

  it('round-trips the member link through the parser', () => {
    const href = ownerMemberHref({ kind: 'event', id: 'e3' }, 'engaged', 'om-25');
    const query = new URL(href, 'http://x').searchParams;
    expect(parseOwnerMembersView(Object.fromEntries(query))).toEqual({
      scope: { kind: 'event', id: 'e3' },
      band: 'engaged',
      memberId: 'om-25',
    });
  });
});
