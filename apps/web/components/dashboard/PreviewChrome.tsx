import { ToneLabel } from '@rede-social/module-dashboard/ui';
import { Card, Chip } from '@rede-social/ui';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import {
  PREVIEW_LEVELS,
  type PreviewAvailability,
  type PreviewGroup,
  type PreviewSlug,
  previewLevelPath,
} from '@/lib/dashboard-preview';

const AVAILABILITY_TONE = {
  ready: 'success',
  partial: 'warning',
  needs_levels: 'warning',
  blocked: 'danger',
} as const satisfies Record<PreviewAvailability, 'success' | 'warning' | 'danger'>;

const GROUPS: readonly PreviewGroup[] = ['platform', 'tenant'];

/** The catalog stores a level's bullets as an object of numbered keys (the loader refuses arrays). */
const bulletsSchema = z.record(z.string(), z.string());

export interface PreviewChromeProps {
  slug: PreviewSlug;
}

/**
 * The preview's own chrome above each panel (never part of the panel itself): the level navigation in
 * two wrapping groups of chips, then the current level's context — number and role id, name, the
 * question the panel answers, how it is used, what the app can feed today and what is missing.
 */
export async function PreviewChrome({ slug }: PreviewChromeProps) {
  const t = await getTranslations('dashboard');
  const index = PREVIEW_LEVELS.findIndex((level) => level.slug === slug);
  const level = PREVIEW_LEVELS[index];
  if (!level) return null;
  const missing = Object.values(bulletsSchema.parse(t.raw(`levels.${slug}.missing`)));

  return (
    <>
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

      <Card className="flex flex-col gap-4 p-4 md:flex-row md:justify-between">
        <div className="flex min-w-0 flex-col gap-1 md:max-w-[60%]">
          <span className="text-xs font-bold text-text-tertiary">
            {t('chrome.role', { number: index + 1, role: level.role })}
          </span>
          <h2 className="text-xl font-extrabold leading-tight text-text">
            {t(`levels.${slug}.name`)}
          </h2>
          <p className="text-sm text-text">
            <strong>{t('chrome.question')}</strong> {t(`levels.${slug}.question`)}
          </p>
          <p className="text-xs text-text-secondary">{t(`levels.${slug}.usage`)}</p>
        </div>
        <div className="flex min-w-0 flex-col items-start gap-2 md:max-w-[38%]">
          <ToneLabel tone={AVAILABILITY_TONE[level.availability]}>
            {t(`availability.${level.availability}`)}
          </ToneLabel>
          <p className="text-xs font-bold text-text-secondary">{t('chrome.missing')}</p>
          <ul className="list-disc pl-5 text-xs text-text-secondary">
            {missing.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </Card>
    </>
  );
}
