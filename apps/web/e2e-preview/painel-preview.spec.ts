import { expect, type Locator, type Page, test } from '@playwright/test';

/**
 * The access-level panels preview (quicks 261011-jqy and 261011-l72). From 1024 px up every level
 * renders inside an iPhone 17 Pro Max frame (a 440x956 screen that scrolls on its own, scaled to fit
 * the window); below that there is no frame and the panel is full width. Never a sideways scroll, and
 * a single "Dados de exemplo" tag describes every disabled action.
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
const SCREEN_RATIO = 440 / 956;
const NOTICE_DESCRIPTION =
  'Dados de exemplo: números, nomes e clientes são fictícios e as ações estão desativadas.';
const REMOVED_NOTES = [
  'Simulação do painel',
  'Todos os números',
  'Pergunta:',
  'O que falta no app',
  'Dá para fazer hoje',
  'platform_owner',
];

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
  });
}

async function pageOverflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    return {
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      scrollHeight: root.scrollHeight,
      clientHeight: root.clientHeight,
    };
  });
}

async function screenMetrics(page: Page) {
  return page.locator('[data-phone-screen]').evaluate((el) => {
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
}

/** Opens every collapsible (native `<details>`), so a width check covers their content too. */
async function openAllDetails(page: Page) {
  await page.locator('details').evaluateAll((elements) => {
    for (const el of elements) (el as HTMLDetailsElement).open = true;
  });
}

async function frameBottom(page: Page) {
  return page.locator('[data-phone-frame]').evaluate((el) => el.getBoundingClientRect().bottom);
}

/**
 * The stacked card of a client row (it carries the column labels). The client's alert row lives in
 * the header bell's panel, hidden while it is closed, so role queries skip it.
 */
function cardOfClient(scope: Page | Locator) {
  return scope
    .getByRole('listitem')
    .filter({ hasText: 'Clube Corrida Sul' })
    .filter({ hasText: 'Interagiu 30d' });
}

test('/painel-preview lands on the first level', async ({ page }) => {
  await page.goto('/painel-preview');
  await expect(page).toHaveURL(/\/painel-preview\/dono-da-plataforma$/);
});

for (const level of LEVELS) {
  test(`${level} at 1440x900: inside the iPhone 17 Pro Max frame`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/painel-preview/${level}`);
    await expect(page.getByText('9:41', { exact: true })).toBeVisible();

    const metrics = await screenMetrics(page);
    expect(metrics).toMatchObject({
      width: '440px',
      height: '956px',
      overflowY: 'auto',
      radius: '55px',
    });
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(Math.abs(metrics.ratio - SCREEN_RATIO)).toBeLessThanOrEqual(0.005);
    expect(await frameBottom(page)).toBeLessThanOrEqual(900);

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.scrollHeight).toBeLessThanOrEqual(overflow.clientHeight + 1);

    const screen = page.locator('[data-phone-screen]');
    await expect(screen.locator('table:visible')).toHaveCount(0);

    // The home indicator sits on the screen's bottom edge, also on panels shorter than the screen.
    const edges = await screen.evaluate((el) => {
      const indicator = el.querySelector('[data-phone-home-indicator]');
      return {
        screen: el.getBoundingClientRect().bottom,
        indicator: indicator?.getBoundingClientRect().bottom ?? Number.NaN,
      };
    });
    expect(Math.abs(edges.indicator - edges.screen)).toBeLessThanOrEqual(1);

    if (metrics.scrollHeight > metrics.clientHeight) {
      const scrolled = await screen.evaluate((el) => {
        el.scrollBy(0, 300);
        return { screen: el.scrollTop, window: window.scrollY };
      });
      expect(scrolled.screen).toBeGreaterThan(0);
      expect(scrolled.window).toBe(0);
    } else {
      testInfo.annotations.push({ type: 'fits-screen', description: level });
    }

    await openAllDetails(page);
    const opened = await screenMetrics(page);
    expect(opened.scrollWidth).toBeLessThanOrEqual(opened.clientWidth);
    const openedPage = await pageOverflow(page);
    expect(openedPage.scrollWidth).toBeLessThanOrEqual(openedPage.clientWidth);
  });
}

test('the frame fits a 1024x768 window', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/painel-preview/dono-da-plataforma');
  await expect(page.locator('[data-phone-frame]')).toBeVisible();
  await expect(page.getByText('9:41', { exact: true })).toBeVisible();
  expect(await frameBottom(page)).toBeLessThanOrEqual(768);
  const overflow = await pageOverflow(page);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  expect(overflow.scrollHeight).toBeLessThanOrEqual(overflow.clientHeight + 1);
});

for (const level of LEVELS) {
  for (const width of PHONE_WIDTHS) {
    test(`${level} at ${width}px: no phone frame, tag visible, no horizontal scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/painel-preview/${level}`);
      await expect(page.getByText('Dados de exemplo', { exact: true })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Níveis de acesso' })).toBeVisible();
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

      await expect(page.getByText('9:41', { exact: true })).toBeHidden();
      const metrics = await screenMetrics(page);
      expect(metrics.overflowY).toBe('visible');
      expect(metrics.radius).toBe('0px');

      await expect(page.locator('#dashboard-preview-note')).toHaveCount(1);
      for (const removed of REMOVED_NOTES) {
        await expect(page.getByText(removed)).toHaveCount(0);
      }
      const dangling = await page.evaluate(() =>
        [...document.querySelectorAll('[aria-describedby]')].flatMap((el) =>
          (el.getAttribute('aria-describedby') ?? '')
            .split(/\s+/)
            .filter((id) => id && !document.getElementById(id)),
        ),
      );
      expect(dangling).toEqual([]);

      const described = page.locator(':disabled[aria-describedby]');
      if (level === 'dono-da-plataforma') expect(await described.count()).toBeGreaterThan(0);
      if ((await described.count()) > 0) {
        await expect(described.first()).toHaveAccessibleDescription(NOTICE_DESCRIPTION);
      }

      await openAllDetails(page);
      const opened = await horizontalOverflow(page);
      expect(opened.scrollWidth).toBeLessThanOrEqual(opened.clientWidth);
    });
  }
}

test('iPhone 17 Pro Max frame at 1440x900: dono-da-plataforma', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/painel-preview/dono-da-plataforma');
  const screen = page.locator('[data-phone-screen]');
  await expect(page.getByText('9:41', { exact: true })).toBeVisible();

  const metrics = await screenMetrics(page);
  expect(metrics).toMatchObject({
    width: '440px',
    height: '956px',
    overflowY: 'auto',
    radius: '55px',
  });
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  expect(Math.abs(metrics.ratio - SCREEN_RATIO)).toBeLessThanOrEqual(0.005);

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
  await expect(page.getByRole('heading', { level: 2, name: 'Suporte da plataforma' })).toHaveCount(
    1,
  );
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

/**
 * Levels with alerts carry them behind a header bell (quick 261011-ndw): no inline list in the body,
 * the bell names the count, and its panel opens under the header inside the phone screen.
 */
const ALERT_LEVELS = [
  {
    level: 'dono-da-plataforma',
    count: 2,
    name: 'Alertas, 2',
    onlyOnce: 'Armazenamento perto do limite do plano',
  },
  {
    level: 'admin-da-plataforma',
    count: 5,
    name: 'Alertas, 5, 1 urgente',
    onlyOnce: 'Escola Horizonte: domínio',
  },
  {
    level: 'admin-do-cliente',
    count: 3,
    name: 'Alertas, 3, 1 urgente',
    onlyOnce: 'Fixe nos destaques se quiser manter',
  },
];
const NO_ALERT_LEVELS = ['suporte-da-plataforma', 'dono-do-cliente', 'equipe-do-cliente', 'membro'];
const ALERT_VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900, framed: true },
  { name: '390px', width: 390, height: 844, framed: false },
];

for (const { level, count, name, onlyOnce } of ALERT_LEVELS) {
  for (const viewport of ALERT_VIEWPORTS) {
    test(`alerts bell: ${level} at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`/painel-preview/${level}`);

      const bell = page.getByRole('button', { name, exact: true });
      await expect(bell).toHaveAttribute('aria-expanded', 'false');
      await expect(bell).toContainText(String(count));

      await expect(page.getByRole('heading', { name: /^(Atenção|Pendências)/ })).toHaveCount(0);
      const only = page.getByText(onlyOnce, { exact: true });
      await expect(only).toHaveCount(1);
      await expect(only).toBeHidden();

      const panelId = await bell.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      const panel = page.locator(`[id="${panelId}"]`);

      await bell.click();
      await expect(bell).toHaveAttribute('aria-expanded', 'true');
      await expect(panel).toBeVisible();
      await expect(panel.getByRole('heading', { name: `Alertas (${count})` })).toBeVisible();
      await expect(panel.getByRole('listitem')).toHaveCount(count);
      await expect(only).toBeVisible();

      const box = await panel.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;
      if (viewport.framed) {
        const screen = page.locator('[data-phone-screen]');
        const screenBox = await screen.boundingBox();
        expect(screenBox).not.toBeNull();
        if (!screenBox) return;
        expect(box.x).toBeGreaterThanOrEqual(screenBox.x - 1);
        expect(box.y).toBeGreaterThanOrEqual(screenBox.y - 1);
        expect(box.x + box.width).toBeLessThanOrEqual(screenBox.x + screenBox.width + 1);
        expect(box.y + box.height).toBeLessThanOrEqual(screenBox.y + screenBox.height + 1);
        const metrics = await screenMetrics(page);
        expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
      } else {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      }
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

      await page.keyboard.press('Escape');
      await expect(bell).toHaveAttribute('aria-expanded', 'false');
      await expect(panel).toBeHidden();
      await expect(bell).toBeFocused();
      expect(await bell.evaluate((el) => el.matches(':focus-visible'))).toBe(true);

      await page.keyboard.press('Enter');
      await expect(panel).toBeVisible();
      await page.getByRole('heading', { level: 1 }).click();
      await expect(bell).toHaveAttribute('aria-expanded', 'false');
      await expect(panel).toBeHidden();

      await bell.click();
      await expect(panel).toBeVisible();
      await bell.click();
      await expect(bell).toHaveAttribute('aria-expanded', 'false');
      await expect(panel).toBeHidden();
    });
  }
}

test('levels without alerts show no bell', async ({ page }) => {
  for (const level of NO_ALERT_LEVELS) {
    await page.goto(`/painel-preview/${level}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-alerts-bell]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Alertas/ })).toHaveCount(0);
  }
});

/**
 * Engagement and activity metrics (quick 261012-fcr). Sections are scoped by their heading because
 * "Engajados" is both a KPI and a band label.
 */
function sectionTitled(page: Page, title: string) {
  return page
    .getByRole('heading', { name: title, exact: true })
    .locator('xpath=ancestor::section[1]');
}

/** The KPI card whose label is exactly `label`. */
function kpiCard(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator('..');
}

async function h3Texts(page: Page) {
  return (await page.locator('h3').allTextContents()).map((text) => text.trim());
}

test('dono-do-cliente: engagement bands, movement, formats, buyers and the recovery card', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente');

  const bands = sectionTitled(page, 'Faixas de engajamento');
  const bandRows = bands.getByRole('listitem');
  await expect(bandRows).toHaveCount(6);
  const bandTexts = await bandRows.allTextContents();
  ['Novos', 'Superfãs', 'Engajados', 'Ocasionais', 'Em risco', 'Inativos'].forEach((label, i) => {
    expect(bandTexts[i]).toContain(label);
  });
  await expect(bands.getByText('Novos: 54 ativados de 96.')).toBeVisible();
  await expect(kpiCard(page, 'Subiram')).toContainText('77');
  await expect(kpiCard(page, 'Caíram')).toContainText('171');

  await bands.getByText('Ver movimentos', { exact: true }).click();
  await expect(bands.locator('details').getByRole('listitem')).toHaveCount(4);

  const engaged = page.getByText('9,3 ações por membro ativo', { exact: true }).locator('..');
  await expect(engaged).toBeVisible();
  await expect(engaged).toContainText('Engajados');
  await expect(engaged).toContainText('22%');

  const formats = page.locator('details').filter({ hasText: 'Interações por post, por formato' });
  const buyers = page.locator('details').filter({ hasText: 'Quem compra' });
  for (const details of [formats, buyers]) {
    await expect(details).not.toHaveAttribute('open');
  }
  await expect(formats.locator('summary')).toContainText('Vídeo rende mais: 96 por post');
  await expect(buyers.locator('summary')).toContainText('72% das compras vêm de 22% dos membros');

  const titles = await h3Texts(page);
  expect(titles.indexOf('Faixas de engajamento')).toBe(
    titles.indexOf('Membros que interagiram por semana') + 1,
  );
  const summaries = (await page.locator('summary').allTextContents()).map((text) => text.trim());
  const formatsAt = summaries.findIndex((text) => text.startsWith('Interações por post'));
  expect(formatsAt).toBeGreaterThanOrEqual(0);
  expect(summaries[formatsAt + 1]?.startsWith('Quem compra')).toBe(true);

  const recover = page.getByText('Recuperar quem está em risco', { exact: true });
  await expect(recover).toBeVisible();
  await expect(page.getByText('168 em risco · 69 com push', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Avisar sobre o próximo evento' })).toBeDisabled();
  const recoverY = (await recover.boundingBox())?.y ?? Number.NaN;
  const movesY =
    (await bands.locator('summary').filter({ hasText: 'Ver movimentos' }).boundingBox())?.y ??
    Number.NaN;
  const channelsY =
    (await page.getByRole('heading', { name: 'Onde os membros interagem' }).boundingBox())?.y ??
    Number.NaN;
  expect(recoverY).toBeGreaterThan(movesY);
  expect(recoverY).toBeLessThan(channelsY);
});

test('admin-do-cliente: unmeasured metrics grouped, videos, reels and stories, at-risk entries', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/admin-do-cliente');

  await expect(page.getByText('Ainda não medido', { exact: true })).toHaveCount(0);
  const notCollected = page
    .locator('details')
    .filter({ hasText: 'Métricas que dependem de coleta' });
  await expect(notCollected).not.toHaveAttribute('open');
  await expect(notCollected.locator('summary')).toContainText('6 métricas');
  await notCollected.locator('summary').click();
  await expect(notCollected.getByRole('listitem')).toHaveCount(6);
  await expect(notCollected.getByText('Precisa registrar as visualizações dos posts')).toHaveCount(
    2,
  );
  await expect(notCollected.getByText('Precisa registrar a reprodução dos vídeos')).toHaveCount(2);

  const atRisk = kpiCard(page, 'Entraram em risco nesta semana');
  await expect(atRisk).toContainText('23');
  await expect(atRisk).toContainText('9 com push');
  await expect(page.getByText('Interações por post')).toHaveCount(0);
  await expect(page.getByText('15 de 28 ativados (54%)', { exact: true })).toBeVisible();
  await expect(kpiCard(page, 'Membros que interagiram')).toContainText('380');

  const titles = await h3Texts(page);
  expect(titles.indexOf('Vídeos, reels e stories')).toBe(
    titles.indexOf('Posts que mais renderam (14 dias)') + 1,
  );
  const videos = sectionTitled(page, 'Vídeos, reels e stories');
  for (const clock of ['4:12', '0:41', '0:38']) {
    await expect(videos.getByRole('listitem').getByText(clock, { exact: true })).toBeVisible();
  }
  await expect(
    videos.getByText('4 stories, média de 310 visualizações únicas (25%)', { exact: true }),
  ).toBeVisible();

  const videosBottom = await videos.evaluate((el) => el.getBoundingClientRect().bottom);
  const groupY = (await notCollected.boundingBox())?.y ?? Number.NaN;
  const eventsY =
    (await page.locator('summary').filter({ hasText: 'Eventos' }).boundingBox())?.y ?? Number.NaN;
  expect(groupY).toBeGreaterThanOrEqual(videosBottom);
  expect(groupY).toBeLessThan(eventsY);
});

test("dono-da-plataforma: engagement, store sales, module usage and the clients' risk columns", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-da-plataforma');

  const engaged = kpiCard(page, 'Membros engajados');
  await expect(engaged).toContainText('22%');
  await expect(engaged).toContainText('8,1 ações por membro ativo');
  const sales = kpiCard(page, 'Vendas nas lojas dos clientes');
  await expect(sales).toContainText(/R\$\s14,4\smil/);
  const salesValueHeight = (await sales.getByText(/14,4/).boundingBox())?.height ?? Number.NaN;
  expect(salesValueHeight).toBeLessThan(40);
  const grid = kpiCard(page, 'Clientes ativos').locator('..');
  await expect(grid.locator(':scope > *')).toHaveCount(6);
  await expect(grid).not.toContainText('Receita mensal');
  const revenue = kpiCard(page, 'Receita mensal');
  await expect(revenue).toBeVisible();
  await expect(revenue).toContainText('Ainda não medido');
  await expect(revenue).toContainText('Precisa do faturamento por cliente');

  const titles = await h3Texts(page);
  expect(titles.indexOf('Faixas de engajamento')).toBe(
    titles.indexOf('Clientes ativos, 12 meses') + 1,
  );
  await expect(
    page.getByText('O maior cliente concentra 37% dos membros.', { exact: true }),
  ).toBeVisible();
  await expect(
    sectionTitled(page, 'Membros por cliente').getByRole('listitem').first(),
  ).toContainText('Instituto Aurora');
  await expect(page.getByRole('heading', { level: 4, name: 'Uso real' })).toBeVisible();

  const firstCard = sectionTitled(page, 'Clientes (piores primeiro)').getByRole('listitem').first();
  await expect(firstCard).toContainText('Clube Corrida Sul');
  await expect(firstCard).toContainText('Membros em risco %');
  await expect(firstCard).toContainText('Sem atividade da equipe');
  await expect(firstCard.getByText('Em risco', { exact: true })).toHaveCount(0);
  await expect(firstCard).toContainText('31%');
  await expect(firstCard).not.toContainText('Engajados %');

  await page.setViewportSize({ width: 900, height: 900 });
  const table = page.getByRole('table', { name: 'Clientes (piores primeiro)' });
  await expect(table).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Membros em risco %' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Engajados %' })).toBeVisible();
  const overflow = await horizontalOverflow(page);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
});

test('admin-da-plataforma: push reach, the active-members step and stalled videos', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/admin-da-plataforma');

  await expect(kpiCard(page, 'Alcance de push')).toContainText('52%');
  const steps = sectionTitled(page, 'Ativação dos clientes').getByRole('listitem');
  await expect(steps).toHaveCount(6);
  await expect(steps.last()).toContainText('10+ membros ativos');
  await expect(steps.last()).toContainText('2');
  const lab = sectionTitled(page, 'Falhas nas últimas 24h')
    .getByRole('listitem')
    .filter({ hasText: 'Rede Lab' });
  await expect(lab).toContainText('Vídeos parados');
  await expect(lab).toContainText('2');

  await page.setViewportSize({ width: 900, height: 900 });
  await expect(page.getByRole('table', { name: 'Falhas nas últimas 24h' })).toBeVisible();
  const overflow = await horizontalOverflow(page);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
});

test('suporte-da-plataforma: aggregates only, small bands merged, no count under 5 derivable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/suporte-da-plataforma');

  await expect(kpiCard(page, 'Convites não aceitos')).toContainText('37');
  const neverActed = kpiCard(page, 'Novos que nunca agiram (7 dias)');
  await expect(neverActed).toContainText('Todos, exceto menos de 5');
  await expect(neverActed).toContainText('14 entraram');
  await expect(neverActed).not.toContainText('13');
  await expect(neverActed).not.toContainText('que entraram');
  const activity = kpiCard(page, 'Atividade 24h vs. média');
  await expect(activity).toContainText('2/h');
  await expect(activity).toContainText('média: 6/h');
  await expect(activity).toContainText('67% vs. média de 30 dias');
  await expect(page.getByText('/ menos de 5 bloq.', { exact: true })).toBeVisible();

  const summaries = (await page.locator('summary').allTextContents()).map((text) => text.trim());
  const at = (prefix: string) => summaries.findIndex((text) => text.startsWith(prefix));
  expect(at('Configuração')).toBeGreaterThanOrEqual(0);
  expect(at('Engajamento (agregado)')).toBe(at('Configuração') + 1);

  const engagement = page.locator('details').filter({ hasText: 'Engajamento (agregado)' });
  await engagement.locator('summary').click();
  await expect(engagement.locator('summary')).toContainText('31% em risco');
  const rows = engagement.getByRole('listitem');
  await expect(rows).toHaveCount(5);
  const counts = await rows.evaluateAll((items) =>
    items.map((item) =>
      Number((item.children[2]?.firstChild?.textContent ?? '').trim().replaceAll('.', '')),
    ),
  );
  for (const count of counts) expect(count).toBeGreaterThanOrEqual(5);
  const membersText = (await kpiCard(page, 'Membros').textContent()) ?? '';
  const members = Number(/\d[\d.]*/.exec(membersText)?.[0].replaceAll('.', ''));
  expect(members).toBe(310);
  expect(counts.reduce((sum, count) => sum + count, 0)).toBe(members);
  await expect(rows.filter({ hasText: 'Superfãs e engajados' })).toContainText('10');
  await expect(engagement.getByRole('list')).not.toContainText('menos de 5');
  await expect(engagement.getByText(/aparece somada à faixa vizinha/)).toBeVisible();

  await expect(
    page.getByText('Menos de 5 aparelhos recusaram a notificação', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Alcance de push: 21% dos membros ativos', { exact: true }),
  ).toBeVisible();
});

test('equipe-do-cliente: per-function metrics', async ({ page }) => {
  const visit = (id: string) =>
    page.goto(`/painel-preview/equipe-do-cliente?simular=1&funcoes=${id}`);
  await page.setViewportSize({ width: 390, height: 844 });

  await visit('atendimento');
  await expect(kpiCard(page, 'Minha 1ª resposta (mediana, 7d)')).toContainText('1h04');
  const queue = sectionTitled(page, 'Fila').getByRole('listitem');
  await expect(queue.filter({ hasText: 'Rui Matos' })).toContainText('Novo');
  await expect(queue.filter({ hasText: 'Ana Souza' })).not.toContainText('Novo');

  await visit('moderacao');
  const removal = kpiCard(page, 'Taxa de remoção (7d)');
  await expect(removal).toContainText('0,9%');
  await expect(removal).toContainText('2 de 214 removidos');
  await expect(kpiCard(page, '1º comentário de novos (24h)')).toContainText('4');
  await expect(page.getByText('Removidos 7d', { exact: true })).toHaveCount(0);

  await visit('conteudo');
  const recent = sectionTitled(page, 'Últimas publicações (48h)').getByRole('listitem');
  await expect(recent.first()).toContainText('vs. mediana');
  for (const change of ['+144%', '+15%', 'em andamento']) {
    await expect(recent.getByText(change, { exact: true })).toBeVisible();
  }

  await visit('loja');
  const expiring = kpiCard(page, 'Acessos que vencem em 7 dias');
  await expect(expiring).toContainText('6');
  await expect(expiring).toContainText('Comunidade VIP');
  await expect(kpiCard(page, 'Conversão por produto')).toContainText('Ainda não medido');
  await expect(page.getByText('Ainda não medido', { exact: true })).toHaveCount(1);
});

test('membro: three cards by priority, presence and streak, no band', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/membro');

  const order = [
    page.getByText('Encontro mensal · hoje 19h', { exact: true }),
    page.getByText('O suporte respondeu', { exact: true }),
    page.getByText('Seu acesso vence em 5 dias', { exact: true }),
  ];
  const ys: number[] = [];
  for (const card of order) {
    await expect(card).toBeVisible();
    ys.push((await card.boundingBox())?.y ?? Number.NaN);
  }
  expect(ys[0]).toBeLessThan(ys[1] ?? Number.NaN);
  expect(ys[1]).toBeLessThan(ys[2] ?? Number.NaN);
  await expect(page.getByRole('button', { name: 'Renovar' })).toBeDisabled();
  await expect(page.getByText('Novidades em Comunidade VIP desde sua última visita')).toHaveCount(
    0,
  );
  await expect(page.getByText('Liberada pela sua compra')).toHaveCount(0);
  await expect(page.getByText(/acompanhante no encontro de hoje/)).toBeVisible();
  await expect(page.getByText(/Seu acesso à VIP já foi liberado/)).toHaveCount(0);
  await expect(page.getByText('Ainda não medido')).toHaveCount(0);
  await expect(page.getByText('Precisa registrar')).toHaveCount(0);

  const attendance = kpiCard(page, 'Presença nos encontros');
  for (const text of ['3', 'de 4', 'nos últimos 30 dias'])
    await expect(attendance).toContainText(text);
  const streak = kpiCard(page, 'Sequência');
  for (const text of ['6', 'semanas']) await expect(streak).toContainText(text);
  await expect(page.getByText('Presença nos encontros', { exact: true })).toHaveCount(1);
  await expect(
    sectionTitled(page, 'Presença e constância').getByText('Presença nos encontros', {
      exact: true,
    }),
  ).toHaveCount(1);
  for (const band of ['Superfãs', 'Engajados', 'Ocasionais', 'Em risco', 'Inativos']) {
    await expect(page.getByText(band, { exact: true })).toHaveCount(0);
  }
});

test('membro: Sua atividade report', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/membro');

  const title = page.getByRole('heading', { level: 3, name: 'Sua atividade', exact: true });
  await expect(title).toBeVisible();
  const forYou = page.getByRole('heading', { level: 3, name: 'Para você', exact: true });
  const titleY = (await title.boundingBox())?.y ?? Number.NaN;
  const forYouY = (await forYou.boundingBox())?.y ?? Number.NaN;
  expect(titleY).toBeGreaterThan(forYouY);
  const report = sectionTitled(page, 'Sua atividade');
  // Each block states its own window: four 7-day blocks, presence over 30 days.
  await expect(report.getByText('Últimos 7 dias', { exact: true })).toHaveCount(4);
  await expect(report.getByText('Últimos 30 dias', { exact: true })).toHaveCount(1);

  for (const label of ['Salvamentos', 'Compartilhamentos']) {
    await expect(kpiCard(page, label).getByText('exemplo', { exact: true })).toHaveCount(1);
  }
  for (const label of ['Curtidas', 'Comentários']) {
    await expect(kpiCard(page, label).getByText('exemplo', { exact: true })).toHaveCount(0);
  }
  const likes = kpiCard(page, 'Curtidas');
  await expect(likes).toContainText('46');
  await expect(likes).toContainText('8 vs. semana anterior');
  const engagement = sectionTitled(page, 'Seu engajamento');
  await expect(engagement.getByText(/melhorou|piorou/)).toHaveCount(0);

  expect((await report.locator('h4').allTextContents()).map((text) => text.trim())).toEqual([
    'Tempo de uso',
    'Seu engajamento',
    'O que você viu',
    'Onde você mais participa',
    'Presença e constância',
  ]);

  const average = kpiCard(page, 'Média por dia');
  for (const text of ['38', '4 h 26 min na semana', '6 min vs. semana anterior']) {
    await expect(average).toContainText(text);
  }
  await expect(average.getByText(/melhorou|piorou/)).toHaveCount(0);
  const usage = sectionTitled(page, 'Tempo de uso');
  const chart = usage.locator('svg[role="img"]');
  await expect(chart).toHaveCount(1);
  await expect(chart).toHaveAttribute('aria-label', 'Minutos de uso por dia, de segunda a domingo');
  expect(
    (await chart.locator('[data-x-label]').allTextContents()).map((text) => text.trim()),
  ).toEqual(['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']);
  const peak = page.getByText('Horário em que você mais usa: 20h–22h', { exact: true });
  await expect(peak).toBeVisible();
  await expect(peak.locator('..')).toContainText('exemplo');

  await expect(page.getByText('exemplo', { exact: true })).toHaveCount(7);
  for (const label of [
    'Média por dia',
    'Salvamentos',
    'Compartilhamentos',
    'Posts vistos',
    'Vídeos e reels',
    'Tempo em vídeos e reels',
  ]) {
    await expect(kpiCard(page, label).getByText('exemplo', { exact: true })).toHaveCount(1);
  }
  for (const label of [
    'Curtidas',
    'Comentários',
    'Stories vistos',
    'Presença nos encontros',
    'Sequência',
  ]) {
    await expect(kpiCard(page, label).getByText('exemplo', { exact: true })).toHaveCount(0);
  }
  const communities = sectionTitled(page, 'Onde você mais participa');
  await expect(communities.getByText('exemplo', { exact: true })).toHaveCount(0);

  const seenValues: [string, string][] = [
    ['Posts vistos', '128'],
    ['Stories vistos', '23'],
    ['Vídeos e reels', '41'],
    ['Tempo em vídeos e reels', '1 h 12 min'],
  ];
  for (const [label, value] of seenValues) await expect(kpiCard(page, label)).toContainText(value);

  const rows = (await communities.getByRole('listitem').allTextContents()).map((text) =>
    text.replace(/\s+/g, ' ').trim(),
  );
  expect(rows).toEqual(['Comunidade VIP31', 'Geral19', 'Eventos8']);

  await expect(page.getByText('Ainda não medido')).toHaveCount(0);
  await expect(page.getByText('Precisa registrar')).toHaveCount(0);
});

/** The drill-down lists behind the member report (quick 261012-hqr), one row per list. */
interface MemberListCase {
  slug: string;
  card: string;
  title: string;
  rows: number;
  count: string;
  /** The whole list is example data: one pill next to the count. */
  listExample: boolean;
  /** Rows whose own value is example data: one pill each. */
  rowExamples: number;
  sample?: string;
}

const MEMBER_LIST_CASES: MemberListCase[] = [
  {
    slug: 'curtidas',
    card: 'Curtidas',
    title: 'Posts que você curtiu',
    rows: 46,
    count: '46 curtidas',
    listExample: false,
    rowExamples: 0,
  },
  {
    slug: 'comentarios',
    card: 'Comentários',
    title: 'Seus comentários',
    rows: 12,
    count: '12 comentários',
    listExample: false,
    rowExamples: 0,
  },
  {
    slug: 'salvamentos',
    card: 'Salvamentos',
    title: 'Posts que você salvou',
    rows: 9,
    count: '9 salvamentos',
    listExample: true,
    rowExamples: 0,
  },
  {
    slug: 'compartilhamentos',
    card: 'Compartilhamentos',
    title: 'Posts que você compartilhou',
    rows: 3,
    count: '3 compartilhamentos',
    listExample: true,
    rowExamples: 0,
    sample: 'Link copiado',
  },
  {
    slug: 'stories',
    card: 'Stories vistos',
    title: 'Stories que você viu',
    rows: 23,
    count: '23 stories',
    listExample: false,
    rowExamples: 23,
    sample: 'Dr. Igor Alves',
  },
];

/** The report cards that open a list, in report order. */
const MEMBER_LIST_LABELS = [
  'Curtidas',
  'Comentários',
  'Salvamentos',
  'Compartilhamentos',
  'Stories vistos',
];

function memberCardLink(page: Page, label: string) {
  return kpiCard(page, label).locator('xpath=ancestor::a[1]');
}

for (const list of MEMBER_LIST_CASES) {
  test(`membro: the ${list.card} card opens its list and Voltar returns`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/painel-preview/membro');
    await memberCardLink(page, list.card).click();
    await expect(page).toHaveURL(new RegExp(`\\?lista=${list.slug}#lista$`));

    const title = page.getByRole('heading', { level: 3, name: list.title, exact: true });
    await expect(title).toBeVisible();
    await expect(title).toBeInViewport();
    await expect(page.getByText(list.count, { exact: true })).toBeVisible();
    await expect(sectionTitled(page, list.title).getByRole('listitem')).toHaveCount(list.rows);
    await expect(page.getByText('exemplo', { exact: true })).toHaveCount(
      (list.listExample ? 1 : 0) + list.rowExamples,
    );
    if (list.sample) await expect(page.getByText(list.sample).first()).toBeVisible();
    for (const heading of ['Para você', 'Sua atividade']) {
      await expect(page.getByRole('heading', { name: heading, exact: true })).toHaveCount(0);
    }
    await expect(page.getByText('Precisa registrar')).toHaveCount(0);
    await expect(page.getByText('Ainda não medido')).toHaveCount(0);
    if (list.slug === 'stories') {
      const rows = await sectionTitled(page, list.title).getByRole('listitem').allTextContents();
      for (const row of rows) expect(row).not.toMatch(/João|Lia|Vieira|Rui/);
      // The list is measured; only each story's time is example data, so the pill sits on the row.
      await expect(page.getByText('23 stories', { exact: true }).locator('..')).not.toContainText(
        'exemplo',
      );
    }

    await page.getByRole('link', { name: 'Voltar', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#atividade-${list.slug}$`));
    await expect(
      page.getByRole('heading', { level: 3, name: 'Sua atividade', exact: true }),
    ).toBeVisible();
    await expect(kpiCard(page, list.card)).toBeInViewport();
  });
}

test('membro: an unknown lista falls back to the report', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const query of ['lista=xyz', 'lista=', 'lista=CURTIDAS', 'lista=curtidas&lista=curtidas']) {
    await page.goto(`/painel-preview/membro?${query}`);
    await expect(
      page.getByRole('heading', { level: 3, name: 'Sua atividade', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voltar', exact: true })).toHaveCount(0);
  }
});

test('membro: only the list cards are links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/membro');
  await expect(page.locator('[data-phone-screen] a[href*="?lista="]')).toHaveCount(
    MEMBER_LIST_LABELS.length,
  );
  for (const label of MEMBER_LIST_LABELS) {
    await expect(memberCardLink(page, label)).toHaveCount(1);
  }
  await expect(page.getByText('Ver lista', { exact: true })).toHaveCount(MEMBER_LIST_LABELS.length);
  for (const label of ['Média por dia', 'Presença nos encontros', 'Sequência']) {
    await expect(memberCardLink(page, label)).toHaveCount(0);
  }
  await expect(sectionTitled(page, 'Onde você mais participa').locator('a')).toHaveCount(0);
});

test('membro: list links are keyboard-focusable with a visible ring', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  async function expectRing(link: Locator) {
    await link.focus();
    await expect(link).toBeFocused();
    const ring = await link.evaluate((el) => ({
      visible: el.matches(':focus-visible'),
      shadow: getComputedStyle(el).boxShadow,
    }));
    expect(ring.visible).toBe(true);
    expect(ring.shadow).not.toBe('none');
  }

  await page.goto('/painel-preview/membro');
  await expectRing(memberCardLink(page, 'Curtidas'));
  await page.goto('/painel-preview/membro?lista=curtidas');
  await expectRing(page.getByRole('link', { name: 'Voltar', exact: true }));
});

test('membro: a list scrolls inside the phone at 1440x900', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/painel-preview/membro');
  const screen = page.locator('[data-phone-screen]');
  await memberCardLink(page, 'Curtidas').click();
  await expect(page).toHaveURL(/\?lista=curtidas#lista$/);
  await expect(
    screen.getByRole('heading', { level: 3, name: 'Posts que você curtiu', exact: true }),
  ).toBeInViewport();

  const metrics = await screenMetrics(page);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  const scrolled = await screen.evaluate((el) => {
    el.scrollBy(0, 300);
    return { screen: el.scrollTop, window: window.scrollY };
  });
  expect(scrolled.screen).toBeGreaterThan(0);
  expect(scrolled.window).toBe(0);

  await screen.getByRole('link', { name: 'Voltar', exact: true }).click();
  await expect(page).toHaveURL(/#atividade-curtidas$/);
  await expect(kpiCard(page, 'Curtidas')).toBeInViewport();
});

for (const list of MEMBER_LIST_CASES) {
  for (const width of PHONE_WIDTHS) {
    test(`membro ?lista=${list.slug} at ${width}px: no horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/painel-preview/membro?lista=${list.slug}`);
      await expect(
        page.getByRole('heading', { level: 3, name: list.title, exact: true }),
      ).toBeVisible();
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    });
  }
}
