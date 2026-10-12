import { type OwnerBandScope, tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
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
 * The events the level-4 bands can be scoped to (quick 261012-qer B-2): the panel's upcoming events
 * soonest first, then its past ones most recent first. The `?evento=` value is the fixture id.
 */
export const OWNER_EVENTS: readonly { id: string; name: string; date: string }[] = [
  ...tenantOwnerPanel.events.upcoming,
  ...[...tenantOwnerPanel.events.past].reverse(),
].map(({ id, name, date }) => ({ id, name, date }));

/** What the Membros area renders: the bands' scope (Task 4 adds the open band and member). */
export interface OwnerMembersView {
  scope: OwnerBandScope;
}

const RECORTES = ['membro', 'comunidade', 'evento'] as const;

/** A query value only when it is a single string, exactly one of `allowed`. */
function pick<T extends string>(raw: string | string[] | undefined, allowed: readonly T[]) {
  return typeof raw === 'string' ? allowed.find((value) => value === raw) : undefined;
}

function first<T>(rows: readonly T[]): T {
  const row = rows[0];
  if (row === undefined) throw new Error('the fixture has no row to fall back to');
  return row;
}

/**
 * The scope the query asks for (untrusted). `recorte` picks Por membro, Por comunidade or Por evento;
 * anything else is Por membro, so a bare legacy `?comunidade=` too. Under a valid `recorte`, an
 * unknown `comunidade` or `evento` falls to that row's first item. Only allow-listed constants ever
 * reach markup or URLs.
 */
export function parseOwnerMembersView(params: SearchParams): OwnerMembersView {
  const recorte = pick(params.recorte, RECORTES);
  if (recorte === 'comunidade') {
    const slug = pick(
      params.comunidade,
      OWNER_COMMUNITIES.map((row) => row.slug),
    );
    const community =
      OWNER_COMMUNITIES.find((row) => row.slug === slug) ?? first(OWNER_COMMUNITIES);
    return { scope: { kind: 'community', id: community.id } };
  }
  if (recorte === 'evento') {
    const id =
      pick(
        params.evento,
        OWNER_EVENTS.map((row) => row.id),
      ) ?? first(OWNER_EVENTS).id;
    return { scope: { kind: 'event', id } };
  }
  return { scope: { kind: 'member' } };
}

/** A scope's query after `?area=membros` (empty for Por membro). */
function scopeQuery(scope: OwnerBandScope): string {
  if (scope.kind === 'member') return '';
  if (scope.kind === 'event') return `&recorte=evento&evento=${scope.id}`;
  const slug = OWNER_COMMUNITIES.find((row) => row.id === scope.id)?.slug;
  if (!slug) throw new Error(`no community ${scope.id}`);
  return `&recorte=comunidade&comunidade=${slug}`;
}

/** A scope tab's or chip's link: the Membros area, the scope, the bands anchor. */
export function ownerScopeHref(scope: OwnerBandScope): string {
  return `${ownerAreaHref('membros')}${scopeQuery(scope)}#${OWNER_BANDS_ANCHOR}`;
}
