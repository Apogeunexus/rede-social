import { tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import { describe, expect, it } from 'vitest';
import {
  OWNER_BANDS_ANCHOR,
  OWNER_COMMUNITIES,
  OWNER_EVENTS,
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
