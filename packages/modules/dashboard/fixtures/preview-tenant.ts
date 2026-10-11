import type { TenantBranding } from '@rede-social/contracts/branding';

/**
 * The fictional tenant every preview panel is drawn for: a record shaped like a `tenants` row (its
 * display name and its `branding` jsonb), so the preview layout feeds it through the app's own
 * mechanism (`resolveBranding` -> `brandScope` -> `[data-brand-root]`), exactly as the authenticated
 * shell does with a real tenant. The ONLY place of this package that holds colour values.
 */
export interface PreviewTenant {
  displayName: string;
  branding: TenantBranding;
}

export const previewTenant = {
  displayName: 'Dr. Igor Alves',
  branding: {
    colors: { primary: '#2e6fd0', secondary: '#5b9cf8' },
    look: { darkColors: { primary: '#5b9cf8' } },
  },
} satisfies PreviewTenant;
