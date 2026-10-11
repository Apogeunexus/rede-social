import { expect, test } from '@playwright/test';

/**
 * The access-level panels preview (quick 261011-jqy) on phone widths: every level shows the
 * "Dados de exemplo" note and never scrolls sideways (vertical scroll only, D-03).
 */

const LEVELS = [
  'dono-da-plataforma',
  'admin-da-plataforma',
  'suporte-da-plataforma',
  'dono-do-cliente',
  'admin-do-cliente',
  'equipe-do-cliente',
  'membro',
];
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

/** The stacked card of a client row (it carries the column labels; the "Atenção" row does not). */
function cardOfClient(scope: import('@playwright/test').Page | import('@playwright/test').Locator) {
  return scope
    .getByRole('listitem')
    .filter({ hasText: 'Clube Corrida Sul' })
    .filter({ hasText: 'Interagiu 30d' });
}

test('iPhone 17 Pro Max frame at 1440x900: dono-da-plataforma', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/painel-preview/dono-da-plataforma');
  const screen = page.locator('[data-phone-screen]');
  await expect(page.getByText('9:41', { exact: true })).toBeVisible();

  const metrics = await screen.evaluate((el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      width: style.width,
      height: style.height,
      overflowY: style.overflowY,
      radius: style.borderTopLeftRadius,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      ratio: rect.width / rect.height,
    };
  });
  expect(metrics).toMatchObject({
    width: '440px',
    height: '956px',
    overflowY: 'auto',
    radius: '55px',
  });
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  expect(Math.abs(metrics.ratio - 440 / 956)).toBeLessThanOrEqual(0.005);

  const scrollTop = await screen.evaluate((el) => {
    el.scrollBy(0, 400);
    return el.scrollTop;
  });
  expect(scrollTop).toBeGreaterThan(0);

  await expect(screen.getByRole('table', { name: 'Clientes (piores primeiro)' })).toBeHidden();
  await expect(cardOfClient(screen)).toBeVisible();
});

test('the clients list: a table on an unframed 900 px window, cards on a phone', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Clientes (piores primeiro)' });

  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto('/painel-preview/dono-da-plataforma');
  await expect(table).toBeVisible();
  await expect(cardOfClient(page)).toBeHidden();
  await expect(page.getByText('9:41', { exact: true })).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(table).toBeHidden();
  await expect(cardOfClient(page)).toBeVisible();
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

test.describe('equipe-do-cliente: the function simulator', () => {
  const tabs = (page: import('@playwright/test').Page) =>
    page.getByRole('navigation', { name: 'Funções desta pessoa' });

  test('the default person has two functions: a tab row, support open', async ({ page }) => {
    await page.goto('/painel-preview/equipe-do-cliente');
    await expect(tabs(page).getByRole('link')).toHaveCount(2);
    await expect(tabs(page).getByRole('link', { name: /Atendimento/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByRole('heading', { name: 'Fila' })).toBeVisible();
  });

  test('one function: no tab row, its block alone', async ({ page }) => {
    await page.goto('/painel-preview/equipe-do-cliente?simular=1&funcoes=atendimento');
    await expect(tabs(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Fila' })).toBeVisible();
  });

  test('no function: the empty state', async ({ page }) => {
    await page.goto('/painel-preview/equipe-do-cliente?simular=1');
    await expect(tabs(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Nenhuma função marcada' })).toBeVisible();
  });

  test('the form submits the checked functions and a tab switches the block', async ({ page }) => {
    await page.goto('/painel-preview/equipe-do-cliente?simular=1');
    await page.getByRole('checkbox', { name: 'Conteúdo' }).check();
    await page.getByRole('checkbox', { name: 'Loja' }).check();
    await page.getByRole('button', { name: 'Simular' }).click();
    await expect(tabs(page).getByRole('link')).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'Últimas publicações (48h)' })).toBeVisible();
    await tabs(page).getByRole('link', { name: /Loja/ }).click();
    await expect(page.getByRole('heading', { name: 'Compras recentes' })).toBeVisible();
  });

  test('unknown ids in the query are dropped', async ({ page }) => {
    await page.goto('/painel-preview/equipe-do-cliente?simular=1&funcoes=x&funcoes=loja&aba=x');
    await expect(tabs(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Compras recentes' })).toBeVisible();
  });
});

test('an unknown level is a 404', async ({ page }) => {
  const response = await page.goto('/painel-preview/nivel-inexistente');
  expect(response?.status()).toBe(404);
});
