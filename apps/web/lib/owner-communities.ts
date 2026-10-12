import { tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import { ownerAreaHref } from './dashboard-preview';

/*
 * Kept apart from dashboard-preview.ts on purpose: proxy.ts imports that file and must never pull
 * the fixtures in. This module imports it, never the reverse.
 */

type SearchParams = Record<string, string | string[] | undefined>;

/** The id of the "Faixas de engajamento" section: every scope link lands on it. */
export const OWNER_BANDS_ANCHOR = 'faixas';

/**
 * The communities the level-4 bands can be scoped to (quick 261012-pkd D-01), in the fixture's order.
 * The `?comunidade=` value is the fixture id without its `c-` prefix.
 */
export const OWNER_COMMUNITIES: readonly { id: string; slug: string }[] =
  tenantOwnerPanel.byCommunity.map(({ id }) => ({ id, slug: id.replace(/^c-/, '') }));

/**
 * The community the query asks for (untrusted): the community id only when `comunidade` is a single
 * string that is exactly an allow-listed slug, else null (Toda a base). Only these constants ever
 * reach markup or URLs.
 */
export function parseOwnerCommunity(params: SearchParams): string | null {
  const raw = params.comunidade;
  if (typeof raw !== 'string') return null;
  return OWNER_COMMUNITIES.find((row) => row.slug === raw)?.id ?? null;
}

/** The scope chip's link: the Membros area, the allow-listed community if any, the bands anchor. */
export function ownerMembersHref(communityId: string | null): string {
  const slug = OWNER_COMMUNITIES.find((row) => row.id === communityId)?.slug;
  const scope = slug ? `&comunidade=${slug}` : '';
  return `${ownerAreaHref('membros')}${scope}#${OWNER_BANDS_ANCHOR}`;
}
