/**
 * The access-level panels preview (`/painel-preview/<nivel>`, quick 261011-jqy): fictional data in the
 * Igor Alves brand, reachable without a session in development and absent from production.
 *
 * Two independent locks keep it out of production: `proxy.ts` treats the prefix as public only when
 * `dashboardPreviewEnabled()`, and the preview layout and pages call `notFound()` when it is false.
 * `NODE_ENV` is read per call (tests flip it with `vi.stubEnv`); Next inlines it in a build, so in a
 * production bundle this is the constant `false`.
 */
export function dashboardPreviewEnabled(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/** The preview prefix, anchored: `/painel-previewx` and `/painel-preview-foo` do not match. */
export const DASHBOARD_PREVIEW_PATH = /^\/painel-preview(?:\/|$)/;

export const DASHBOARD_PREVIEW_ROOT = '/painel-preview';

export type PreviewRole =
  | 'platform_owner'
  | 'platform_admin'
  | 'platform_support'
  | 'tenant_owner'
  | 'tenant_admin'
  | 'tenant_staff'
  | 'member';

export type PreviewGroup = 'platform' | 'tenant';

/** How much of the panel the app can feed today (the reference's status pill). */
export type PreviewAvailability = 'ready' | 'partial' | 'needs_levels' | 'blocked';

export interface PreviewLevel {
  slug: string;
  role: PreviewRole;
  group: PreviewGroup;
  availability: PreviewAvailability;
}

/** The 7 levels, in the reference's order (the level number is the index + 1). */
export const PREVIEW_LEVELS = [
  {
    slug: 'dono-da-plataforma',
    role: 'platform_owner',
    group: 'platform',
    availability: 'partial',
  },
  { slug: 'admin-da-plataforma', role: 'platform_admin', group: 'platform', availability: 'ready' },
  {
    slug: 'suporte-da-plataforma',
    role: 'platform_support',
    group: 'platform',
    availability: 'blocked',
  },
  { slug: 'dono-do-cliente', role: 'tenant_owner', group: 'tenant', availability: 'needs_levels' },
  { slug: 'admin-do-cliente', role: 'tenant_admin', group: 'tenant', availability: 'ready' },
  { slug: 'equipe-do-cliente', role: 'tenant_staff', group: 'tenant', availability: 'partial' },
  { slug: 'membro', role: 'member', group: 'tenant', availability: 'ready' },
] as const satisfies readonly PreviewLevel[];

export type PreviewSlug = (typeof PREVIEW_LEVELS)[number]['slug'];

/** The allow-listed level for a path segment, or null (the page then 404s). */
export function previewLevel(slug: string): (typeof PREVIEW_LEVELS)[number] | null {
  return PREVIEW_LEVELS.find((level) => level.slug === slug) ?? null;
}

export function previewLevelPath(slug: PreviewSlug): string {
  return `${DASHBOARD_PREVIEW_ROOT}/${slug}`;
}

/** The "Dados de exemplo" note's id: every disabled action in a panel points at it (aria-describedby). */
export const PREVIEW_NOTE_ID = 'dashboard-preview-note';
