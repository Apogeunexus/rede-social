import { Chip, StatusPill } from '@rede-social/ui';
import { TriangleAlert } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import {
  PREVIEW_LEVELS,
  PREVIEW_NOTE_ID,
  type PreviewGroup,
  type PreviewSlug,
  previewLevelPath,
} from '@/lib/dashboard-preview';

const GROUPS: readonly PreviewGroup[] = ['platform', 'tenant'];

export interface PreviewChromeProps {
  slug: PreviewSlug;
}

/**
 * The preview's own chrome beside each panel (never part of the panel itself): the page title, the
 * single "Dados de exemplo" tag — the element every disabled action's `aria-describedby` points at,
 * whose accessible text says the data is fictional and the actions are disabled — the level
 * navigation in two wrapping groups of chips, and the current level's name as a visually hidden h2,
 * the heading the panel's sections sit under.
 */
export async function PreviewChrome({ slug }: PreviewChromeProps) {
  const t = await getTranslations('dashboard');

  return (
    <>
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-extrabold leading-tight">{t('preview.title')}</h1>
        <div id={PREVIEW_NOTE_ID} role="note" className="flex">
          <StatusPill tone="warning" className="gap-1" title={t('preview.noticeDescription')}>
            <TriangleAlert aria-hidden size={14} className="shrink-0" />
            <span aria-hidden>{t('preview.notice')}</span>
            <span className="sr-only">{t('preview.noticeDescription')}</span>
          </StatusPill>
        </div>
      </header>

      <nav aria-label={t('chrome.navLabel')} className="flex flex-col gap-3">
        {GROUPS.map((group) => (
          <div key={group} className="flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              {t(`chrome.groups.${group}`)}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {PREVIEW_LEVELS.map((entry, i) =>
                entry.group === group ? (
                  <li key={entry.slug}>
                    <Chip href={previewLevelPath(entry.slug)} active={entry.slug === slug}>
                      <span className="tabular-nums opacity-70">{i + 1}</span>
                      {t(`levels.${entry.slug}.name`)}
                    </Chip>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ))}
      </nav>

      <h2 className="sr-only">{t(`levels.${slug}.name`)}</h2>
    </>
  );
}
