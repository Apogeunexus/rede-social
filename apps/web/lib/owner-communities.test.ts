import { tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import { describe, expect, it } from 'vitest';
import {
  OWNER_BANDS_ANCHOR,
  OWNER_COMMUNITIES,
  ownerMembersHref,
  parseOwnerCommunity,
} from './owner-communities';

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

describe('parseOwnerCommunity', () => {
  it('is Toda a base (null) without a comunidade', () => {
    expect(parseOwnerCommunity({})).toBeNull();
  });

  it('returns the community id of an allow-listed slug', () => {
    expect(parseOwnerCommunity({ comunidade: 'vip' })).toBe('c-vip');
    expect(parseOwnerCommunity({ comunidade: 'geral' })).toBe('c-geral');
    expect(parseOwnerCommunity({ comunidade: 'iniciantes' })).toBe('c-iniciantes');
    expect(parseOwnerCommunity({ comunidade: 'eventos' })).toBe('c-eventos');
  });

  it('falls back to Toda a base for anything else', () => {
    for (const comunidade of ['VIP', 'c-vip', '', 'xyz', '__proto__', 'constructor', 'vip ']) {
      expect(parseOwnerCommunity({ comunidade }), JSON.stringify(comunidade)).toBeNull();
    }
    expect(parseOwnerCommunity({ comunidade: ['vip', 'vip'] })).toBeNull();
    expect(parseOwnerCommunity({ comunidade: undefined })).toBeNull();
  });
});

describe('ownerMembersHref', () => {
  it('links each scope on the Membros area, landing on the bands', () => {
    expect(OWNER_BANDS_ANCHOR).toBe('faixas');
    expect(ownerMembersHref(null)).toBe('/painel-preview/dono-do-cliente?area=membros#faixas');
    expect(ownerMembersHref('c-vip')).toBe(
      '/painel-preview/dono-do-cliente?area=membros&comunidade=vip#faixas',
    );
  });
});
