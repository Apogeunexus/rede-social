// @vitest-environment happy-dom
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EngagementBands, OwnerBandScope } from '@rede-social/module-dashboard/fixtures';
import { tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadMessages } from '@/i18n/messages';
import { BandMembers } from './BandMembers';
import type { DashboardT } from './format';

// format.ts reaches the app's module registry for tab labels; these cards never name a module.
vi.mock('@/lib/registry', () => ({ moduleLabelResolver: () => () => undefined }));

/**
 * The level-4 band bodies (quick 261012-qer) on the REAL pt-BR catalog: each member is a card
 * (B-1), a share that rounds to 0% reads "menos de 1%" with a visible bar (A-1), a band over 10
 * says the list is capped (A-3), and a 0-member band opens to one sentence (A-4).
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
} as never) as unknown as DashboardT;

const MEMBER: OwnerBandScope = { kind: 'member' };
const EVENTOS: OwnerBandScope = { kind: 'community', id: 'c-eventos' };

function eventosBands(): EngagementBands {
  const entry = tenantOwnerPanel.communityEngagement.find((row) => row.id === 'c-eventos');
  if (!entry) throw new Error('no c-eventos bands');
  return entry.bands;
}

function renderBands(bands: EngagementBands, scope: OwnerBandScope) {
  const { container } = render(<BandMembers t={t} bands={bands} scope={scope} />);
  return container;
}

/** A band's `<details>`, by its summary's exact bold title (closed details stay in the DOM). */
function band(container: HTMLElement, label: string): HTMLDetailsElement {
  const details = [...container.querySelectorAll('details')].find(
    (el) => el.querySelector('summary span.font-bold')?.textContent?.trim() === label,
  );
  if (!details) throw new Error(`no band ${label}`);
  return details;
}

function bar(details: HTMLDetailsElement): Element {
  const inner = details.querySelector('summary span[aria-hidden="true"] > span');
  if (!inner) throw new Error('no share bar');
  return inner;
}

function seeAll(details: HTMLDetailsElement): HTMLButtonElement | undefined {
  return [...details.querySelectorAll('button')].find((el) => el.textContent === 'Ver todos');
}

describe('B-1: each member is a card', () => {
  it('shows initials, the bold name and four labeled lines with the example time', () => {
    const container = renderBands(tenantOwnerPanel.engagement, MEMBER);
    const first = band(container, 'Novos').querySelector('li');
    if (!first) throw new Error('no member card');
    const text = first.textContent ?? '';
    for (const part of [
      'Luana Ferraz',
      'Membro desde: set. de 2026',
      'Última atividade: hoje às 22:40',
      'Comunidade que mais interage: Geral',
      'Tempo médio diário: 18 min',
      'exemplo',
    ]) {
      expect(text, part).toContain(part);
    }
    const avatar = first.querySelector('[aria-hidden="true"]');
    expect(avatar?.textContent).toBe('LF');
  });
});

describe('A-1: a share that rounds to 0% with members', () => {
  it('reads "menos de 1%" and keeps a visible bar', () => {
    const container = renderBands(eventosBands(), EVENTOS);
    const superfans = band(container, 'Superfãs');
    expect(superfans.querySelector('summary')?.textContent).toContain('3 · menos de 1%');
    expect(band(container, 'Novos').querySelector('summary')?.textContent).toContain('96 · 8%');
    expect(bar(superfans).classList.contains('min-w-1.5')).toBe(true);
  });
});

describe('A-3: a band over 10 says the list is capped', () => {
  it('heads the list with the cap and ends with a disabled Ver todos', () => {
    const container = renderBands(tenantOwnerPanel.engagement, MEMBER);
    const atRisk = band(container, 'Em risco');
    const hint = [...atRisk.querySelectorAll('p')].find(
      (el) => el.textContent === 'Os 10 com atividade mais recente',
    );
    const list = atRisk.querySelector('ul');
    expect(hint, 'cap hint').toBeDefined();
    expect(list, 'list').not.toBeNull();
    if (hint && list) {
      expect(hint.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(atRisk.textContent).toContain('e mais 158 membros');
    expect(seeAll(atRisk)?.disabled).toBe(true);
  });

  it('says nothing of a cap when the band fits', () => {
    const container = renderBands(eventosBands(), EVENTOS);
    const superfans = band(container, 'Superfãs');
    expect(superfans.querySelectorAll('li')).toHaveLength(3);
    expect(superfans.textContent).not.toContain('Os 10 com atividade mais recente');
    // "Comunidade que mais interage" holds "mais" too: only "e mais <n>" is the overflow line.
    expect(superfans.textContent).not.toMatch(/e mais \d/);
    expect(seeAll(superfans)).toBeUndefined();
  });
});

describe('A-4: a band with no members', () => {
  it('opens to one sentence, with no list, cap or button, and no bar', () => {
    const { engagement } = tenantOwnerPanel;
    const empty: EngagementBands = {
      ...engagement,
      counts: { ...engagement.counts, at_risk: 0 },
    };
    const container = renderBands(empty, MEMBER);
    const atRisk = band(container, 'Em risco');
    expect(atRisk.querySelector('summary')?.textContent).toContain('0 · 0%');
    expect(bar(atRisk).classList.contains('min-w-1.5')).toBe(false);
    const body = atRisk.querySelector('summary + div');
    expect(body?.textContent).toBe('Nenhum membro nesta faixa.');
    expect(atRisk.querySelectorAll('li')).toHaveLength(0);
    expect(atRisk.querySelectorAll('button')).toHaveLength(0);
  });
});
