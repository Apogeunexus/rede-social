// @vitest-environment happy-dom
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ownerContentItem, ownerContentUnanswered } from '@rede-social/module-dashboard/fixtures';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadMessages } from '@/i18n/messages';
import { contentTabView } from '@/lib/owner-content-view';
import { bandLabel, type DashboardT } from './format';
import { OwnerContentReplies } from './OwnerContentReplies';

// format.ts reaches the app's module registry for tab labels; this screen never names a module.
vi.mock('@/lib/registry', () => ({ moduleLabelResolver: () => () => undefined }));

/**
 * The unanswered comments screen (quick 261013-orf E-02) on the REAL pt-BR catalog: the
 * publication's thumbnail and caption, the overview row's count, then each unanswered comment,
 * oldest first, with who, their band, the text, when, and a disabled "Responder".
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

describe('OwnerContentReplies (quick 261013-orf E-02)', () => {
  it('lists the 9 unanswered comments of op-19, oldest first, each with its text', () => {
    const { container } = render(
      <OwnerContentReplies t={t} view={{ ...contentTabView('overview'), reply: 'op-19' }} />,
    );
    expect(container.querySelectorAll('[data-testid="cover-thumb"]')).toHaveLength(1);
    expect(container.textContent).toContain(ownerContentItem('op-19').excerpt);
    expect(container.textContent).toContain('9 comentários sem resposta · o mais antigo há 8 dias');
    const rows = container.querySelectorAll('li');
    const comments = ownerContentUnanswered('op-19');
    expect(rows).toHaveLength(9);
    expect(rows[0]?.textContent).toContain('Comentou há 8 dias');
    for (const [i, row] of [...rows].entries()) {
      const comment = comments[i];
      expect(comment).toBeDefined();
      expect(row.textContent).toContain(comment?.person.name ?? '');
      expect(row.textContent).toContain(bandLabel(t, comment?.person.band ?? 'new'));
      expect(row.textContent).toContain(comment?.text ?? '');
      const button = row.querySelector('button');
      expect(button?.textContent).toBe('Responder');
      expect(button?.disabled).toBe(true);
    }
  });
});
