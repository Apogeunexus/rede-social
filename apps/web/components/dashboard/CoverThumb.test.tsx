// @vitest-environment happy-dom
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadMessages } from '@/i18n/messages';
import { COVER_TONES, CoverThumb, type CoverThumbProps, coverTone } from './CoverThumb';
import type { DashboardT } from './format';

// format.ts reaches the app's module registry for tab labels; a thumbnail never names a module.
vi.mock('@/lib/registry', () => ({ moduleLabelResolver: () => () => undefined }));

/**
 * The publication thumbnail of the lists (quick 261013-orf D-02/D-04) on the REAL pt-BR catalog:
 * decorative, the brand gradient at one of five tones per publication, the kind's icon, a video's
 * length and a story's ring.
 */

afterEach(cleanup);

// A path join, not `new URL(…, import.meta.url)`: happy-dom replaces the global URL.
const catalogDir = join(dirname(fileURLToPath(import.meta.url)), '../../messages/pt-BR/');
const messages = loadMessages(catalogDir) as Record<string, unknown>;
const { createTranslator } = await import('next-intl');
const t = createTranslator({
  locale: 'pt-BR',
  messages,
  namespace: 'dashboard',
  // any: the untyped test translator stands in for the app's typed DashboardT (BandMembers.test).
} as never) as unknown as DashboardT;

function thumb(props: CoverThumbProps): HTMLElement {
  const { container } = render(<CoverThumb t={t} {...props} />);
  const el = container.querySelector<HTMLElement>('[data-testid="cover-thumb"]');
  if (!el) throw new Error('no cover thumb');
  return el;
}

describe('coverTone', () => {
  it('is stable per seed and always one of the five positions', () => {
    for (const seed of ['p01', 'op-41', 'v12', 'e3', 'x']) {
      expect(coverTone(seed)).toBe(coverTone(seed));
      expect(COVER_TONES).toContain(coverTone(seed));
    }
  });

  it('gives five distinct tones to p01..p05', () => {
    const tones = ['p01', 'p02', 'p03', 'p04', 'p05'].map(coverTone);
    expect(new Set(tones).size).toBe(5);
  });
});

describe('CoverThumb (row)', () => {
  it('a video is a decorative 56 px square with its icon, its length and a brand tone', () => {
    const el = thumb({ kind: 'video', seed: 'p01', durationSeconds: 612 });
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.dataset.kind).toBe('video');
    for (const name of ['size-14', 'rounded-lg', 'shrink-0']) expect(el.classList).toContain(name);
    expect(el.textContent).toBe('10:12');
    expect(el.querySelectorAll('svg')).toHaveLength(1);
    const style = el.getAttribute('style') ?? '';
    expect(style).toContain('var(--brand-gradient)');
    expect(style).toContain('300% 300%');
  });

  it('a text post has the text icon, no badge and no ring', () => {
    const el = thumb({ kind: 'text', seed: 'p06', durationSeconds: null });
    expect(el.querySelectorAll('svg')).toHaveLength(1);
    expect(el.textContent).toBe('');
    expect(el.className).not.toContain('ring-2');
  });

  it('a photo has no length badge', () => {
    const el = thumb({ kind: 'photo', seed: 'p10' });
    expect(el.textContent).toBe('');
    expect(el.querySelectorAll('svg')).toHaveLength(1);
  });

  it('a story has the brand ring and no badge', () => {
    const el = thumb({ kind: 'story', seed: 's01' });
    expect(el.className).toContain('ring-2');
    expect(el.textContent).toBe('');
  });

  it('a card-sized vertical video keeps its ratio, 7rem high and at most 8rem wide', () => {
    const el = thumb({
      kind: 'video',
      seed: 'op-41',
      durationSeconds: 41,
      variant: 'card',
      ratio: 9 / 16,
    });
    expect(el.dataset.ratio).toBe('0.5625');
    expect(el.classList).not.toContain('size-14');
    const style = el.getAttribute('style') ?? '';
    // 7rem × 9/16 = 3.938rem wide; the ratio then gives the 7rem height.
    expect(el.style.width).toBe('3.938rem');
    expect(el.style.maxWidth).toBe('8rem');
    expect(style).toContain('aspect-ratio: 0.5625');
    const badge = el.querySelector('span');
    expect(badge?.textContent).toBe('0:41');
    expect(badge?.classList).toContain('text-xs');
  });

  it('a card-sized text post is a square with its icon', () => {
    const el = thumb({ kind: 'text', seed: 'op-19', variant: 'card', ratio: null });
    expect(el.dataset.ratio).toBe('1');
    expect(el.querySelectorAll('svg')).toHaveLength(1);
  });

  it('an event check-in and an order have their own icon and kind', () => {
    for (const kind of ['event', 'order'] as const) {
      const el = thumb({ kind, seed: 'e3' });
      expect(el.dataset.kind).toBe(kind);
      expect(el.querySelectorAll('svg')).toHaveLength(1);
      cleanup();
    }
  });
});
