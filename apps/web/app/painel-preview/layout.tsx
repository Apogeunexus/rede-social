import { resolveBranding } from '@rede-social/contracts/branding';
import { previewTenant } from '@rede-social/module-dashboard/fixtures';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { TitleFontSheet } from '@/components/brand/TitleFontSheet';
import { brandScope } from '@/lib/brand-scope';
import { dashboardPreviewEnabled } from '@/lib/dashboard-preview';

/**
 * The access-level panels preview (quick 261011-jqy): every level renders inside the Igor Alves
 * brand, applied through the app's own mechanism — the fixture tenant record goes through
 * `resolveBranding` -> `brandScope` onto a `[data-brand-root]` element, exactly as `(app)/layout.tsx`
 * feeds AppShell. No session, no API: the data is fictional, and PreviewChrome shows the
 * "Dados de exemplo" tag on every level.
 *
 * Production never serves it: `connection()` keeps the route request-time (a build-time `notFound()`
 * must never be frozen into a static 404), then the guard 404s; `proxy.ts` already keeps the prefix
 * private there. The pages repeat the guard because layouts and pages render concurrently.
 */
export default async function PanelPreviewLayout({ children }: { children: ReactNode }) {
  await connection();
  if (!dashboardPreviewEnabled()) notFound();

  const scope = brandScope(resolveBranding(previewTenant.branding));

  return (
    <div
      data-brand-root
      {...scope.attributes}
      style={scope.style}
      className="min-h-[var(--screen-h)] bg-bg text-text"
    >
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">{children}</main>
      {scope.titleFontHref ? <TitleFontSheet href={scope.titleFontHref} /> : null}
    </div>
  );
}
