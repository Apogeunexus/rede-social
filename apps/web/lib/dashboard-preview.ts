/**
 * The access-level panels preview (`/painel-preview/<nivel>`, quick 261011-jqy): fictional data in the
 * Igor Alves brand, reachable without a session in development and absent from production.
 *
 * Two independent locks keep it out of production: `proxy.ts` treats the prefix as public only when
 * `dashboardPreviewEnabled()`, and the preview layout and pages call `notFound()` when it is false.
 * `NODE_ENV` is read per call (tests flip it with `vi.stubEnv`); Next inlines it in a build.
 *
 * A production deploy that exists only to show the panels (a demo project, never a tenant's app) opts
 * in with `DASHBOARD_PREVIEW_ENABLED=1` in that deploy's runtime env. Only the exact string "1"
 * counts, so an unset, empty or "true" value keeps the preview out of production.
 */
export function dashboardPreviewEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.DASHBOARD_PREVIEW_ENABLED === '1';
}

/** The preview prefix, anchored: `/painel-previewx` and `/painel-preview-foo` do not match. */
export const DASHBOARD_PREVIEW_PATH = /^\/painel-preview(?:\/|$)/;

export const DASHBOARD_PREVIEW_ROOT = '/painel-preview';

export type PreviewGroup = 'platform' | 'tenant';

export interface PreviewLevel {
  slug: string;
  group: PreviewGroup;
}

/** The 7 levels, in the reference's order (the level number is the index + 1). */
export const PREVIEW_LEVELS = [
  { slug: 'dono-da-plataforma', group: 'platform' },
  { slug: 'admin-da-plataforma', group: 'platform' },
  { slug: 'suporte-da-plataforma', group: 'platform' },
  { slug: 'dono-do-cliente', group: 'tenant' },
  { slug: 'admin-do-cliente', group: 'tenant' },
  { slug: 'equipe-do-cliente', group: 'tenant' },
  { slug: 'membro', group: 'tenant' },
] as const satisfies readonly PreviewLevel[];

export type PreviewSlug = (typeof PREVIEW_LEVELS)[number]['slug'];

/** The allow-listed level for a path segment, or null (the page then 404s). */
export function previewLevel(slug: string): (typeof PREVIEW_LEVELS)[number] | null {
  return PREVIEW_LEVELS.find((level) => level.slug === slug) ?? null;
}

export function previewLevelPath(slug: PreviewSlug): string {
  return `${DASHBOARD_PREVIEW_ROOT}/${slug}`;
}

/** The "Dados de exemplo" tag's id: every disabled action in a panel points at it (aria-describedby). */
export const PREVIEW_NOTE_ID = 'dashboard-preview-note';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * The client owner's panel areas (quick 261012-o00), in tab order: each slug is a `?area=` value on
 * the level-4 page.
 */
export const OWNER_AREAS = ['visao-geral', 'membros', 'conteudo', 'eventos'] as const;
export type OwnerArea = (typeof OWNER_AREAS)[number];

export const DEFAULT_OWNER_AREA: OwnerArea = 'visao-geral';

function isOwnerArea(value: unknown): value is OwnerArea {
  return (OWNER_AREAS as readonly unknown[]).includes(value);
}

/**
 * The area the query asks for (untrusted): `area` only when it is a single string that is exactly an
 * allow-listed slug, else Visão geral. Only these constants ever reach markup or URLs.
 */
export function parseOwnerArea(params: SearchParams): OwnerArea {
  const raw = params.area;
  return typeof raw === 'string' && isOwnerArea(raw) ? raw : DEFAULT_OWNER_AREA;
}

/** The tab link of an area (Visão geral too; the bare level path also renders it). */
export function ownerAreaHref(area: OwnerArea): string {
  return `${previewLevelPath('dono-do-cliente')}?area=${area}`;
}

/** The staff functions the level-6 simulator can grant, in canonical (tab) order. */
export const STAFF_FUNCTIONS = ['atendimento', 'moderacao', 'conteudo', 'loja'] as const;
export type StaffFunction = (typeof STAFF_FUNCTIONS)[number];

/** The reference's default person: support and moderation. */
const DEFAULT_STAFF_FUNCTIONS: readonly StaffFunction[] = ['atendimento', 'moderacao'];

function isStaffFunction(value: unknown): value is StaffFunction {
  return (STAFF_FUNCTIONS as readonly unknown[]).includes(value);
}

/**
 * The simulator state from the query (untrusted): without `simular` the reference default; with
 * `simular=1` exactly the allow-listed `funcoes` (a string or a repeated param), in canonical order,
 * unknown ids dropped. The active tab is `aba` when it is a single granted id, else the first granted
 * function, else null. Only these ids ever reach markup or URLs.
 */
export function parseStaffFunctions(params: SearchParams): {
  functions: StaffFunction[];
  active: StaffFunction | null;
} {
  const simulated = params.simular === '1';
  const raw = params.funcoes;
  const requested = typeof raw === 'string' ? [raw] : (raw ?? []);
  const functions = simulated
    ? STAFF_FUNCTIONS.filter((id) => requested.includes(id))
    : [...DEFAULT_STAFF_FUNCTIONS];
  const tab = params.aba;
  const active =
    typeof tab === 'string' && isStaffFunction(tab) && functions.includes(tab)
      ? tab
      : (functions[0] ?? null);
  return { functions, active };
}

/**
 * The member report's drill-down lists (quick 261012-hqr), in canonical order: each slug is a
 * `?lista=` value on the level-7 page.
 */
export const MEMBER_LISTS = [
  'curtidas',
  'comentarios',
  'salvamentos',
  'compartilhamentos',
  'posts-vistos',
  'videos',
  'stories',
] as const;
export type MemberListSlug = (typeof MEMBER_LISTS)[number];

function isMemberList(value: unknown): value is MemberListSlug {
  return (MEMBER_LISTS as readonly unknown[]).includes(value);
}

/**
 * The list the query asks for (untrusted): `lista` only when it is a single string that is exactly
 * an allow-listed slug, else null and the report renders. Only these constants ever reach markup or
 * URLs.
 */
export function parseMemberList(params: SearchParams): MemberListSlug | null {
  const raw = params.lista;
  return typeof raw === 'string' && isMemberList(raw) ? raw : null;
}

/** The id of the list screen's wrapper: opening a list lands on it. */
export const MEMBER_LIST_ANCHOR = 'lista';

/** The id of the report card that opens `slug`: "Voltar" lands back on it. */
export function memberCardAnchor(slug: MemberListSlug): string {
  return `atividade-${slug}`;
}

export function memberListHref(slug: MemberListSlug): string {
  return `${previewLevelPath('membro')}?lista=${slug}#${MEMBER_LIST_ANCHOR}`;
}

export function memberReportHref(slug: MemberListSlug): string {
  return `${previewLevelPath('membro')}#${memberCardAnchor(slug)}`;
}
