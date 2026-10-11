import { expect, test } from '@playwright/test';

/**
 * The access-level panels preview (quick 261011-jqy) on phone widths: every level shows the
 * "Dados de exemplo" note and never scrolls sideways (vertical scroll only, D-03).
 */

const LEVELS = ['dono-da-plataforma', 'admin-da-plataforma', 'suporte-da-plataforma'];
const PHONE_WIDTHS = [360, 390, 430];

async function horizontalOverflow(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
  });
}

test('/painel-preview lands on the first level', async ({ page }) => {
  await page.goto('/painel-preview');
  await expect(page).toHaveURL(/\/painel-preview\/dono-da-plataforma$/);
});

for (const level of LEVELS) {
  for (const width of PHONE_WIDTHS) {
    test(`${level} at ${width}px: example-data note visible, no horizontal scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/painel-preview/${level}`);
      await expect(page.getByText('Dados de exemplo', { exact: true })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Níveis de acesso' })).toBeVisible();
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    });
  }
}

test('the clients list is a table on desktop and stacked cards on a phone', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Clientes (piores primeiro)' });
  // The stacked card of a client row (it carries the column labels; the "Atenção" row does not).
  const cardOfClient = page
    .getByRole('listitem')
    .filter({ hasText: 'Clube Corrida Sul' })
    .filter({ hasText: 'Interagiu 30d' });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/painel-preview/dono-da-plataforma');
  await expect(table).toBeVisible();
  await expect(cardOfClient).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(table).toBeHidden();
  await expect(cardOfClient).toBeVisible();
});

test('the level navigation marks the current level', async ({ page }) => {
  await page.goto('/painel-preview/admin-da-plataforma');
  const current = page.getByRole('link', { name: /Admin da plataforma/ });
  await expect(current).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: /Suporte da plataforma/ }).click();
  await expect(page).toHaveURL(/\/painel-preview\/suporte-da-plataforma$/);
  await expect(
    page.getByRole('heading', { level: 2, name: 'Suporte da plataforma' }),
  ).toBeVisible();
});
