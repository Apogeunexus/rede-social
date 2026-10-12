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
    count: 4,
    name: 'Alertas, 4, 1 urgente',
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

  await expect(sectionTitled(page, 'Quem compra')).toContainText(
    '72% das compras vêm de 22% dos membros',
  );

  const titles = await h3Texts(page);
  const at = (title: string) => titles.indexOf(title);
  expect(at('Faixas de engajamento')).toBe(at('Membros que interagiram por semana') + 1);
  expect(at('Interações por post, por formato')).toBe(at('Onde os membros interagem') + 1);
  expect(at('Quem compra')).toBe(at('Interações por post, por formato') + 1);

  const recover = page.getByText('Recuperar quem está em risco', { exact: true });
  await expect(recover).toBeVisible();
  await expect(page.getByText('168 em risco · 69 com push', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Avisar sobre o próximo evento' })).toBeDisabled();
  const recoverBox = await recover.boundingBox();
  const accountBox = await page.getByText('Conta', { exact: true }).boundingBox();
  expect(recoverBox && accountBox && recoverBox.y < accountBox.y).toBe(true);
});

test('admin-do-cliente: unmeasured metrics, videos and reels, at-risk entries', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/admin-do-cliente');

  await expect(page.getByText('Ainda não medido', { exact: true })).toHaveCount(6);
  await expect(page.getByText('Precisa registrar as visualizações dos posts')).toHaveCount(2);

  const atRisk = kpiCard(page, 'Entraram em risco nesta semana');
  await expect(atRisk).toContainText('23');
  await expect(atRisk).toContainText('9 com push');
  await expect(page.getByText('Interações por post')).toHaveCount(0);
  await expect(page.getByText('15 de 28 ativados (54%)', { exact: true })).toBeVisible();
  await expect(kpiCard(page, 'Membros que interagiram')).toContainText('380');

  const titles = await h3Texts(page);
  expect(titles.indexOf('Vídeos e reels')).toBe(
    titles.indexOf('Posts que mais renderam (14 dias)') + 1,
  );
  const videos = sectionTitled(page, 'Vídeos e reels');
  for (const clock of ['4:12', '0:41', '0:38']) {
    await expect(videos.getByRole('listitem').getByText(clock, { exact: true })).toBeVisible();
  }
  await expect(
    videos.getByText('4 stories, média de 310 visualizações únicas (25%)', { exact: true }),
  ).toBeVisible();
});
