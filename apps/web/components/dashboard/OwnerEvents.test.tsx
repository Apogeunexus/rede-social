// @vitest-environment happy-dom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OwnerEvents } from './OwnerEvents';

/**
 * The level-4 "Eventos" area on the REAL pt-BR catalog (quick 261013-p31): the next events are the
 * bands' event cards, and the numbers of the area stay the ones it had.
 */

const { messages } = await vi.hoisted(async () => {
  const { loadMessages } = await import('@/i18n/messages');
  const { join } = await import('node:path');
  // Vitest runs from `apps/web` (the `ParticipantsList.test.tsx` precedent).
  return { messages: loadMessages(join(process.cwd(), 'messages', 'pt-BR')) };
});

vi.mock('next-intl/server', async () => {
  const { createTranslator } = await import('next-intl');
  return {
    getTranslations: async () =>
      createTranslator({ locale: 'pt-BR', messages, namespace: 'dashboard' } as never),
  };
});

// format.ts reaches the app's module registry for tab labels; this area never names a module.
vi.mock('@/lib/registry', () => ({ moduleLabelResolver: () => () => undefined }));

afterEach(cleanup);

async function renderArea() {
  const { container } = render(await OwnerEvents());
  return container;
}

function exactly(root: Element, text: string): Element[] {
  return [...root.querySelectorAll('*')].filter((el) => el.textContent?.trim() === text);
}

/** The section under the `h3` reading exactly `title`. */
function section(root: Element, title: string): Element {
  const heading = [...root.querySelectorAll('h3')].find((el) => el.textContent?.trim() === title);
  const found = heading?.closest('section');
  if (!found) throw new Error(`no section ${title}`);
  return found;
}

/** The dd next to a card's dt `label`. */
function cell(root: Element, label: string): string | undefined {
  const term = [...root.querySelectorAll('dt')].find((el) => el.textContent?.trim() === label);
  return term?.nextElementSibling?.textContent?.trim();
}

describe('D-01/D-02 (quick 261013-p31): Próximos eventos são cartões de evento', () => {
  it('shows each next event as a cover card with Inscritos | Vagas | Receita', async () => {
    const upcoming = section(await renderArea(), 'Próximos eventos');
    const items = [...upcoming.querySelectorAll('li')];
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(
        item.querySelectorAll('[data-testid="event-cover-fallback"][data-geometry="hero"]'),
      ).toHaveLength(1);
    }
    expect(items.map((item) => item.querySelector('.text-xl')?.textContent?.trim())).toEqual([
      'Encontro mensal',
      'Live de dúvidas',
      'Imersão presencial',
    ]);
    for (const [i, pill] of ['Presencial', 'Online', 'Presencial'].entries()) {
      const item = items[i];
      if (!item) throw new Error(`no card ${i}`);
      expect(exactly(item, pill).length, String(i)).toBeGreaterThan(0);
    }
    for (const [i, when] of ['12/10, 19h', '15/10, 20h', '24/10, 9h'].entries()) {
      const item = items[i];
      if (!item) throw new Error(`no card ${i}`);
      const line = exactly(item, when)[0];
      expect(line?.classList.contains('text-text-secondary'), String(i)).toBe(true);
    }
    const [u1, u2, u3] = items;
    if (!u1 || !u2 || !u3) throw new Error('missing cards');
    expect(cell(u1, 'Inscritos')).toBe('92');
    expect(cell(u1, 'Vagas')).toBe('8');
    expect(cell(u1, 'Receita')).toMatch(/^R\$\s?5,5\s?mil$/);
    expect(cell(u2, 'Inscritos')).toBe('64');
    expect(cell(u2, 'Vagas')).toBe('Sem limite');
    expect(cell(u2, 'Receita')).toMatch(/^R\$\s?0,00$/);
    expect(cell(u3, 'Inscritos')).toBe('40');
    expect(cell(u3, 'Vagas')).toBe('Lotado');
    expect(cell(u3, 'Receita')).toMatch(/^R\$\s?14\s?mil$/);
  });

  it('promises no navigation and says once that the receita is an example', async () => {
    const upcoming = section(await renderArea(), 'Próximos eventos');
    expect(upcoming.querySelectorAll('table')).toHaveLength(0);
    expect(upcoming.querySelectorAll('a')).toHaveLength(0);
    expect(upcoming.querySelectorAll('.hover\\:bg-card-hover')).toHaveLength(0);
    expect(exactly(upcoming, 'exemplo')).toHaveLength(1);
    expect((upcoming.textContent ?? '').split('Receita: valores de exemplo')).toHaveLength(2);
    for (const item of upcoming.querySelectorAll('li')) {
      expect(item.textContent).not.toContain('exemplo');
    }
  });
});

describe('D-04 (quick 261013-p31): the area keeps its numbers', () => {
  it('has four "exemplo" pills and the same summaries', async () => {
    const container = await renderArea();
    expect(exactly(container, 'exemplo')).toHaveLength(4);
    expect(container.textContent).toContain('comparecimento 64%');
    expect(container.textContent).toContain('presencial 76% · online 56%');
  });
});
