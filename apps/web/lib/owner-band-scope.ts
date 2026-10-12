import {
  type EngagementBand,
  type OwnerBandScope,
  ownerBandIncludes,
  ownerBandRoster,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import { ENGAGEMENT_BAND_ORDER } from '@rede-social/module-dashboard/ui';
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

/** The `?faixa=` slug of each band (quick 261012-qer B-3): the band a member link came from. */
export const OWNER_BAND_SLUGS: Readonly<Record<EngagementBand, string>> = {
  new: 'novos',
  superfan: 'superfas',
  engaged: 'engajados',
  occasional: 'ocasionais',
  at_risk: 'em-risco',
  inactive: 'inativos',
};

const OWNER_MEMBER_IDS: readonly string[] = ownerBandRoster.map((row) => row.id);

/**
 * What the Membros area renders: the bands' scope, the band to reopen (null = all closed) and the
 * member whose insights replace the area (null = the area itself). A member is only ever set together
 * with the band they hold in the scope (quick 261012-ri4 R-5).
 */
export interface OwnerMembersView {
  scope: OwnerBandScope;
  band: EngagementBand | null;
  memberId: string | null;
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

/** The band of a `faixa` slug: exact and single, else null. */
function parseBand(params: SearchParams): EngagementBand | null {
  const raw = params.faixa;
  if (typeof raw !== 'string') return null;
  return ENGAGEMENT_BAND_ORDER.find((band) => OWNER_BAND_SLUGS[band] === raw) ?? null;
}

function parseScope(params: SearchParams): OwnerBandScope {
  const recorte = pick(params.recorte, RECORTES);
  if (recorte === 'comunidade') {
    const slug = pick(
      params.comunidade,
      OWNER_COMMUNITIES.map((row) => row.slug),
    );
    const community =
      OWNER_COMMUNITIES.find((row) => row.slug === slug) ?? first(OWNER_COMMUNITIES);
    return { kind: 'community', id: community.id };
  }
  if (recorte === 'evento') {
    const id =
      pick(
        params.evento,
        OWNER_EVENTS.map((row) => row.id),
      ) ?? first(OWNER_EVENTS).id;
    return { kind: 'event', id };
  }
  return { kind: 'member' };
}

/**
 * The view the query asks for (untrusted). `recorte` picks Por membro, Por comunidade or Por evento;
 * anything else is Por membro, so a bare legacy `?comunidade=` too. Under a valid `recorte`, an
 * unknown `comunidade` or `evento` falls to that row's first item. `faixa` is a band slug, else null.
 * `membro` is a roster id that must hold `faixa` in the scope (R-5); otherwise it is null and the
 * scope and band stay, so the area falls back to that list with the band open. Only allow-listed
 * constants ever reach markup or URLs.
 */
export function parseOwnerMembersView(params: SearchParams): OwnerMembersView {
  const scope = parseScope(params);
  const band = parseBand(params);
  const id = pick(params.membro, OWNER_MEMBER_IDS);
  const memberId = id && band && ownerBandIncludes(scope, band, id) ? id : null;
  return { scope, band, memberId };
}

/** A scope's query after `?area=membros` (empty for Por membro). */
function scopeQuery(scope: OwnerBandScope): string {
  if (scope.kind === 'member') return '';
  if (scope.kind === 'event') return `&recorte=evento&evento=${scope.id}`;
  const slug = OWNER_COMMUNITIES.find((row) => row.id === scope.id)?.slug;
  if (!slug) throw new Error(`no community ${scope.id}`);
  return `&recorte=comunidade&comunidade=${slug}`;
}

function bandQuery(band: EngagementBand | null | undefined): string {
  return band ? `&faixa=${OWNER_BAND_SLUGS[band]}` : '';
}

/** A scope tab's or chip's link (or Voltar's, reopening `band`): the Membros area at #faixas. */
export function ownerScopeHref(scope: OwnerBandScope, band?: EngagementBand | null): string {
  return `${ownerAreaHref('membros')}${scopeQuery(scope)}${bandQuery(band)}#${OWNER_BANDS_ANCHOR}`;
}

/** A member card's link: the member's insights, remembering the scope and band to go back to. */
export function ownerMemberHref(scope: OwnerBandScope, band: EngagementBand, id: string): string {
  return `${ownerAreaHref('membros')}${scopeQuery(scope)}${bandQuery(band)}&membro=${id}`;
}
