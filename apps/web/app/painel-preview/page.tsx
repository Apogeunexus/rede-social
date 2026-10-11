import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { dashboardPreviewEnabled, PREVIEW_LEVELS, previewLevelPath } from '@/lib/dashboard-preview';

/** `/painel-preview` opens the first level (production: 404, see the layout). */
export default async function PanelPreviewIndex() {
  await connection();
  if (!dashboardPreviewEnabled()) notFound();
  redirect(previewLevelPath(PREVIEW_LEVELS[0].slug));
}
