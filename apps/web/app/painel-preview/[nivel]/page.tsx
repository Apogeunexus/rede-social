import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { MemberPanel } from '@/components/dashboard/MemberPanel';
import { PhoneMockup } from '@/components/dashboard/PhoneMockup';
import { PlatformAdminPanel } from '@/components/dashboard/PlatformAdminPanel';
import { PlatformOwnerPanel } from '@/components/dashboard/PlatformOwnerPanel';
import { PlatformSupportPanel } from '@/components/dashboard/PlatformSupportPanel';
import { PreviewChrome } from '@/components/dashboard/PreviewChrome';
import { TenantAdminPanel } from '@/components/dashboard/TenantAdminPanel';
import { TenantOwnerPanel } from '@/components/dashboard/TenantOwnerPanel';
import { TenantStaffPanel } from '@/components/dashboard/TenantStaffPanel';
import {
  dashboardPreviewEnabled,
  type PreviewSlug,
  parseMemberList,
  parseOwnerArea,
  parseStaffFunctions,
  previewLevel,
} from '@/lib/dashboard-preview';

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  params: Promise<{ nivel: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!dashboardPreviewEnabled()) return {};
  const { nivel } = await params;
  const level = previewLevel(nivel);
  if (!level) return {};
  const t = await getTranslations('dashboard.levels');
  return { title: t(`${level.slug}.name`), robots: { index: false, follow: false } };
}

/** Every level has its panel: a level added to PREVIEW_LEVELS without one fails typecheck. */
const PANELS: Record<PreviewSlug, (query: SearchParams) => ReactNode> = {
  'dono-da-plataforma': () => <PlatformOwnerPanel />,
  'admin-da-plataforma': () => <PlatformAdminPanel />,
  'suporte-da-plataforma': () => <PlatformSupportPanel />,
  'dono-do-cliente': (query) => <TenantOwnerPanel area={parseOwnerArea(query)} />,
  'admin-do-cliente': () => <TenantAdminPanel />,
  'equipe-do-cliente': (query) => <TenantStaffPanel {...parseStaffFunctions(query)} />,
  membro: (query) => <MemberPanel list={parseMemberList(query)} />,
};

/** One level of the preview: the allow-listed slug picks the panel; anything else is a 404. */
export default async function PanelPreviewLevelPage({ params, searchParams }: Props) {
  await connection();
  if (!dashboardPreviewEnabled()) notFound();
  const { nivel } = await params;
  const level = previewLevel(nivel);
  if (!level) notFound();
  const query = await searchParams;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
      <div className="flex min-w-0 flex-col gap-6 lg:max-w-sm lg:flex-1">
        <PreviewChrome slug={level.slug} />
      </div>
      <PhoneMockup>{PANELS[level.slug](query)}</PhoneMockup>
    </div>
  );
}
