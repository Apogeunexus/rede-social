import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { PlatformOwnerPanel } from '@/components/dashboard/PlatformOwnerPanel';
import { dashboardPreviewEnabled, previewLevel } from '@/lib/dashboard-preview';

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

/** One level of the preview: the allow-listed slug picks the panel; anything else is a 404. */
export default async function PanelPreviewLevelPage({ params }: Props) {
  await connection();
  if (!dashboardPreviewEnabled()) notFound();
  const { nivel } = await params;
  const level = previewLevel(nivel);
  if (!level) notFound();

  if (level.slug !== 'dono-da-plataforma') notFound();
  return <PlatformOwnerPanel />;
}
