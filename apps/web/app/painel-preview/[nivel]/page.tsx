import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { PlatformAdminPanel } from '@/components/dashboard/PlatformAdminPanel';
import { PlatformOwnerPanel } from '@/components/dashboard/PlatformOwnerPanel';
import { PlatformSupportPanel } from '@/components/dashboard/PlatformSupportPanel';
import { PreviewChrome } from '@/components/dashboard/PreviewChrome';
import { dashboardPreviewEnabled, type PreviewSlug, previewLevel } from '@/lib/dashboard-preview';

type Props = {
  params: Promise<{ nivel: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nivel } = await params;
  const level = previewLevel(nivel);
  if (!level) return {};
  const t = await getTranslations('dashboard.levels');
  return { title: t(`${level.slug}.name`), robots: { index: false, follow: false } };
}

const PANELS: Partial<Record<PreviewSlug, () => ReactNode>> = {
  'dono-da-plataforma': () => <PlatformOwnerPanel />,
  'admin-da-plataforma': () => <PlatformAdminPanel />,
  'suporte-da-plataforma': () => <PlatformSupportPanel />,
};

/** One level of the preview: the allow-listed slug picks the panel; anything else is a 404. */
export default async function PanelPreviewLevelPage({ params }: Props) {
  await connection();
  if (!dashboardPreviewEnabled()) notFound();
  const { nivel } = await params;
  const level = previewLevel(nivel);
  const panel = level ? PANELS[level.slug] : undefined;
  if (!level || !panel) notFound();

  return (
    <>
      <PreviewChrome slug={level.slug} />
      {panel()}
    </>
  );
}
