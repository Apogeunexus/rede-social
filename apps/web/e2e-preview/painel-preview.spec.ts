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
    level: 'dono-do-cliente',
    count: 3,
    name: 'Alertas, 3, 1 urgente',
    onlyOnce: '8 vagas restantes',
  },
  {
    level: 'admin-do-cliente',
    count: 3,
    name: 'Alertas, 3, 1 urgente',
    onlyOnce: 'Fixe nos destaques se quiser manter',
  },
];
const NO_ALERT_LEVELS = ['suporte-da-plataforma', 'equipe-do-cliente', 'membro'];
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
function sectionTitled(page: Page | Locator, title: string) {
  return page
    .getByRole('heading', { name: title, exact: true })
    .locator('xpath=ancestor::section[1]');
}

/** The KPI card whose label is exactly `label`. */
function kpiCard(page: Page | Locator, label: string) {
  return page.getByText(label, { exact: true }).locator('..');
}

async function h3Texts(page: Page) {
  return (await page.locator('h3').allTextContents()).map((text) => text.trim());
}

/**
 * Level 4 in six areas (quick 261012-o00). Tab names repeat inside the areas ("Membros" is also a
 * KPI label, "Eventos" a community and a subject), so every lookup inside an area is scoped to it.
 */
function ownerArea(page: Page) {
  return page.locator('[data-owner-area]');
}

function ownerTabs(page: Page) {
  return page.getByRole('navigation', { name: 'Áreas do painel' });
}

const OWNER_AREA_CASES: { slug: string; tab: string; heading: string; pills: number }[] = [
  {
    slug: 'visao-geral',
    tab: 'Visão geral',
    heading: 'Membros que interagiram por semana',
    pills: 0,
  },
  // One per member card (the example daily time, quick 261012-qer B-1): 10 in each closed band.
  { slug: 'membros', tab: 'Membros', heading: 'Crescimento', pills: 60 },
  { slug: 'conteudo', tab: 'Conteúdo', heading: 'Posts que mais renderam', pills: 4 },
  { slug: 'eventos', tab: 'Eventos', heading: 'Próximos eventos', pills: 3 },
  { slug: 'financeiro', tab: 'Financeiro', heading: 'Vendas do mês', pills: 3 },
  { slug: 'atendimento', tab: 'Atendimento', heading: 'Fila agora', pills: 1 },
];

test('dono-do-cliente: the area tabs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente');
  const links = ownerTabs(page).getByRole('link');
  const names = (await links.allTextContents()).map((text) => text.trim());
  expect(names).toEqual([
    'Visão geral',
    'Membros',
    'Conteúdo',
    'Eventos',
    'Financeiro',
    'Atendimento',
  ]);
  expect(names).toEqual(OWNER_AREA_CASES.map((area) => area.tab));
  for (const [i, area] of OWNER_AREA_CASES.entries()) {
    expect(await links.nth(i).getAttribute('href')).toMatch(new RegExp(`\\?area=${area.slug}$`));
  }
  await expect(ownerTabs(page).locator('[aria-current="page"]')).toHaveCount(1);
  await expect(ownerTabs(page).getByRole('link', { name: 'Visão geral' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  for (const area of OWNER_AREA_CASES) {
    await ownerTabs(page).getByRole('link', { name: area.tab, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`\\?area=${area.slug}$`));
    await expect(
      ownerTabs(page).getByRole('link', { name: area.tab, exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(ownerTabs(page).locator('[aria-current="page"]')).toHaveCount(1);
    await expect(
      ownerArea(page).getByRole('heading', { level: 3, name: area.heading, exact: true }),
    ).toBeVisible();
    await expect(page.locator('[data-alerts-bell]')).toHaveCount(1);
    await expect(page.getByText('30 dias', { exact: true })).toBeVisible();
    await expect(ownerArea(page).getByText('exemplo', { exact: true })).toHaveCount(area.pills);
    await expect(page.getByText('Ainda não medido')).toHaveCount(0);
    await expect(page.getByText('Precisa registrar')).toHaveCount(0);
  }
});

test('dono-do-cliente: an unknown area falls back to Visão geral', async ({ page }) => {
  for (const query of ['?area=xyz', '?area=MEMBROS', '?area=']) {
    await page.goto(`/painel-preview/dono-do-cliente${query}`);
    await expect(ownerTabs(page).getByRole('link', { name: 'Visão geral' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      ownerArea(page).getByRole('heading', { name: 'Membros que interagiram por semana' }),
    ).toBeVisible();
  }
});

test.describe('dono-do-cliente without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a tab is a plain link to its area', async ({ page }) => {
    await page.goto('/painel-preview/dono-do-cliente');
    await ownerTabs(page).getByRole('link', { name: 'Membros', exact: true }).click();
    await expect(page).toHaveURL(/\?area=membros$/);
    await expect(ownerArea(page).getByRole('heading', { name: 'Crescimento' })).toBeVisible();
  });

  test('a band opens its members with no script (native details)', async ({ page }) => {
    await page.goto('/painel-preview/dono-do-cliente?area=membros');
    const bands = sectionTitled(ownerArea(page), 'Faixas de engajamento');
    const atRisk = bandDetails(bands, 'Em risco');
    await expect(atRisk).not.toHaveAttribute('open');
    await atRisk.locator('summary').click();
    await expect(atRisk).toHaveAttribute('open');
    await expect(atRisk.getByRole('listitem')).toHaveCount(10);
    await expect(atRisk.getByText('e mais 158 membros')).toBeVisible();
  });

  test('a band scope is a plain link: a tab, then a community', async ({ page }) => {
    await page.goto('/painel-preview/dono-do-cliente?area=membros');
    await bandScope(page).getByRole('link', { name: 'Por comunidade' }).click();
    await expect(page).toHaveURL(/\?area=membros&recorte=comunidade&comunidade=vip#faixas$/);
    await bandScopeItems(page, 'community').getByRole('link', { name: 'Geral' }).click();
    await expect(page).toHaveURL(/\?area=membros&recorte=comunidade&comunidade=geral#faixas$/);
    await expect(
      ownerArea(page).getByText(
        'Geral: 1.240 membros com acesso. Contam só as ações feitas nesta comunidade.',
        { exact: true },
      ),
    ).toBeVisible();
  });
});

test('dono-do-cliente: tabs wrap at 360 px with a visible focus ring', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente');
  const row = ownerTabs(page).locator('ul');
  const size = await row.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(size.scroll).toBeLessThanOrEqual(size.client);
  const overflow = await horizontalOverflow(page);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

  const links = ownerTabs(page).getByRole('link');
  await links.first().focus();
  await page.keyboard.press('Tab');
  await expect(links.nth(1)).toBeFocused();
  expect(await links.nth(1).evaluate((el) => el.matches(':focus-visible'))).toBe(true);
});

for (const area of OWNER_AREA_CASES) {
  for (const width of PHONE_WIDTHS) {
    test(`dono-do-cliente ?area=${area.slug} at ${width}px: no horizontal scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/painel-preview/dono-do-cliente?area=${area.slug}`);
      await expect(ownerArea(page)).toBeVisible();
      await openAllDetails(page);
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    });
  }

  test(`dono-do-cliente ?area=${area.slug} at 1440x900: inside the phone`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/painel-preview/dono-do-cliente?area=${area.slug}`);
    await expect(page.getByText('9:41', { exact: true })).toBeVisible();
    await openAllDetails(page);
    const metrics = await screenMetrics(page);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.scrollHeight).toBeLessThanOrEqual(overflow.clientHeight + 1);
    await expect(page.locator('[data-phone-screen]').locator('table:visible')).toHaveCount(0);
  });
}

test('dono-do-cliente: Visão geral', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente');
  const area = ownerArea(page);

  const cards = kpiCard(area, 'Membros').locator('..').locator(':scope > *');
  await expect(cards).toHaveCount(6);
  const expected: [string, string | RegExp][] = [
    ['Membros', '1.240'],
    ['Engajados', '22%'],
    ['Interações por post', '65'],
    ['Comparecimento em eventos', '64%'],
    ['Vendas do mês', /R\$\s8\.940,00/],
    ['Conversas aguardando resposta', '2'],
  ];
  for (const [i, [label, value]] of expected.entries()) {
    await expect(cards.nth(i).locator('span').first()).toHaveText(label);
    await expect(cards.nth(i)).toContainText(value);
  }
  await expect(cards.nth(0)).toContainText('+96 novos');
  await expect(kpiCard(area, 'Engajados')).toContainText('9,3 ações por membro ativo');
  await expect(kpiCard(area, 'Comparecimento em eventos')).toContainText('check-in ÷ inscritos');
  await expect(
    area.getByText('38% da base interagiu nos últimos 30 dias (471 de 1.240).', { exact: true }),
  ).toBeVisible();

  const last = area.locator('summary').last();
  await expect(last).toContainText('Conta');
  await expect(last).toContainText('Plano Pro');
  await expect(last.locator('xpath=ancestor::details[1]')).not.toHaveAttribute('open');
  await expect(
    area.getByRole('link', { name: 'Ver operação do dia (painel do admin)' }),
  ).toBeVisible();
});

test('dono-do-cliente ?area=membros', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente?area=membros');
  const area = ownerArea(page);

  await expect(kpiCard(area, 'Entraram')).toContainText('96');
  await expect(kpiCard(area, 'Saíram')).toContainText('9');
  await expect(
    area.getByText('Saldo de +87 membros em 30 dias (+8% vs. 30 dias antes).', { exact: true }),
  ).toBeVisible();

  const bands = sectionTitled(area, 'Faixas de engajamento');
  const titles = (await bands.locator('details > summary span.font-bold').allTextContents()).map(
    (text) => text.trim(),
  );
  expect(titles).toEqual([...BAND_LABELS, 'Ver movimentos']);
  const summaries = ['96 · 8%', '62 · 5%', '205 · 17%', '150 · 12%', '168 · 14%', '559 · 45%'];
  for (const [i, label] of BAND_LABELS.entries()) {
    const details = bandDetails(bands, label);
    await expect(details).toHaveCount(1);
    await expect(details).not.toHaveAttribute('open');
    await expect(details.locator('summary')).toContainText(summaries[i] ?? '');
  }
  await expect(bands.getByText('Novos: 54 ativados de 96.')).toBeVisible();
  await expect(kpiCard(area, 'Subiram')).toContainText('77');
  await expect(kpiCard(area, 'Caíram')).toContainText('171');

  await bands.getByText('Ver movimentos', { exact: true }).click();
  await expect(areaDetails(page, 'Ver movimentos').getByRole('listitem')).toHaveCount(4);

  const recover = area.getByText('168 em risco · 69 com push', { exact: true });
  await expect(recover).toBeVisible();
  await expect(area.getByRole('button', { name: 'Avisar sobre o próximo evento' })).toBeDisabled();
  const recoverY = (await recover.boundingBox())?.y ?? Number.NaN;
  const movesY =
    (await bands.locator('summary').filter({ hasText: 'Ver movimentos' }).boundingBox())?.y ??
    Number.NaN;
  const retentionY =
    (await area.getByRole('heading', { name: 'Retenção por mês de entrada' }).boundingBox())?.y ??
    Number.NaN;
  expect(recoverY).toBeGreaterThan(movesY);
  expect(recoverY).toBeLessThan(retentionY);
});

const BAND_LABELS = ['Novos', 'Superfãs', 'Engajados', 'Ocasionais', 'Em risco', 'Inativos'];

/** The collapsible of one band (quick 261012-pkd D-02), by its summary's exact bold title. */
function bandDetails(bands: Locator, label: string) {
  return bands.locator('details').filter({
    has: bands.page().locator('summary span.font-bold', { hasText: new RegExp(`^${label}$`) }),
  });
}

/** The scope tabs of the bands (quick 261012-qer B-2): Por membro | Por comunidade | Por evento. */
function bandScope(page: Page) {
  return page.getByRole('navigation', { name: 'Recorte das faixas' });
}

/** The second row under the Por comunidade or Por evento tab. */
function bandScopeItems(page: Page, kind: 'community' | 'event') {
  return page.getByRole('navigation', {
    name: kind === 'community' ? 'Comunidade das faixas' : 'Evento das faixas',
  });
}

const BAND_TABS = ['Por membro', 'Por comunidade', 'Por evento'];
const COMMUNITY_CHIPS = ['Comunidade VIP', 'Geral', 'Iniciantes', 'Eventos'];
const EVENT_CHIPS = [
  'Encontro mensal · 12/10',
  'Live de dúvidas · 15/10',
  'Imersão presencial · 24/10',
  'Aula aberta · 07/10',
  'Workshop · 01/10',
  'Live de dúvidas · 24/09',
  'Encontro set. · 19/09',
];
const EVENT_NOTE =
  'Encontro mensal · 12/10: 92 inscritos. Cada um aparece na faixa que tem hoje na base toda.';

async function linkTexts(nav: Locator) {
  return (await nav.getByRole('link').allTextContents()).map((text) => text.trim());
}

test('dono-do-cliente membros: the scope selector', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente?area=membros');
  const area = ownerArea(page);
  const bands = sectionTitled(area, 'Faixas de engajamento');
  const tabs = bandScope(page).getByRole('link');
  expect(await linkTexts(bandScope(page))).toEqual(BAND_TABS);
  const hrefs = [
    /\?area=membros#faixas$/,
    /\?area=membros&recorte=comunidade&comunidade=vip#faixas$/,
    /\?area=membros&recorte=evento&evento=u1#faixas$/,
  ];
  for (const [i, href] of hrefs.entries()) {
    expect(await tabs.nth(i).getAttribute('href')).toMatch(href);
  }
  await expect(bandScope(page).getByRole('link', { name: 'Por membro' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(bandScope(page).locator('[aria-current="page"]')).toHaveCount(1);
  await expect(bandScopeItems(page, 'community')).toHaveCount(0);
  await expect(bandScopeItems(page, 'event')).toHaveCount(0);
  const widths = await tabs.evaluateAll((links) =>
    links.map((link) => link.getBoundingClientRect().width),
  );
  expect(widths).toHaveLength(3);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
  await expect(area.getByText('168 em risco · 69 com push', { exact: true })).toBeVisible();

  // Por comunidade: a second row of the four communities, VIP first and current.
  await bandScope(page).getByRole('link', { name: 'Por comunidade' }).click();
  await expect(page).toHaveURL(/\?area=membros&recorte=comunidade&comunidade=vip#faixas$/);
  await expect(ownerTabs(page).getByRole('link', { name: 'Membros', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(ownerTabs(page).locator('[aria-current="page"]')).toHaveCount(1);
  await expect(bandScope(page).getByRole('link', { name: 'Por comunidade' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(bandScope(page).locator('[aria-current="page"]')).toHaveCount(1);
  const communities = bandScopeItems(page, 'community');
  expect(await linkTexts(communities)).toEqual(COMMUNITY_CHIPS);
  await expect(communities.getByRole('link', { name: 'Comunidade VIP' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(communities.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(
    bands.getByText(
      'Comunidade VIP: 186 membros com acesso. Contam só as ações feitas nesta comunidade.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(bands.getByText('Novos: 11 ativados de 14.')).toBeVisible();
  await expect(
    bands.getByText('Subiram e Caíram contam toda a base.', { exact: true }),
  ).toBeVisible();
  await expect(kpiCard(area, 'Subiram')).toContainText('77');
  await expect(kpiCard(area, 'Caíram')).toContainText('171');
  await expect(kpiCard(area, 'Entraram')).toContainText('96');
  await expect(bandDetails(bands, 'Novos').locator('summary')).toContainText('14 · 8%');
  await expect(bandDetails(bands, 'Em risco').locator('summary')).toContainText('22 · 12%');
  await expect(area.getByText('22 em risco · 11 com push', { exact: true })).toBeVisible();

  await communities.getByRole('link', { name: 'Geral' }).click();
  await expect(page).toHaveURL(/\?area=membros&recorte=comunidade&comunidade=geral#faixas$/);
  await expect(
    bandScopeItems(page, 'community').getByRole('link', { name: 'Geral' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(bandScopeItems(page, 'community').locator('[aria-current="page"]')).toHaveCount(1);

  // Por evento: a second row of the seven panel events, today's Encontro mensal first and current.
  await bandScope(page).getByRole('link', { name: 'Por evento' }).click();
  await expect(page).toHaveURL(/\?area=membros&recorte=evento&evento=u1#faixas$/);
  await expect(bandScopeItems(page, 'community')).toHaveCount(0);
  const events = bandScopeItems(page, 'event');
  expect(await linkTexts(events)).toEqual(EVENT_CHIPS);
  await expect(events.getByRole('link').first()).toHaveAttribute('aria-current', 'page');
  await expect(events.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(bands.getByText(EVENT_NOTE, { exact: true })).toBeVisible();
  await expect(bands.getByText(/ativados de/)).toHaveCount(0);
  await expect(
    bands.getByText(
      'Cada membro conta em uma faixa, pelos dias com alguma ação nos últimos 30 dias.',
    ),
  ).toBeVisible();
  await expect(
    bands.getByText('Subiram e Caíram contam toda a base.', { exact: true }),
  ).toBeVisible();
  await expect(bandDetails(bands, 'Novos').locator('summary')).toContainText('14 · 15%');
  await expect(area.getByText('6 em risco · 3 com push', { exact: true })).toBeVisible();
  await expect(ownerTabs(page).getByRole('link', { name: 'Membros', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );

  // At 360 px neither row scrolls sideways.
  await page.setViewportSize({ width: 360, height: 844 });
  for (const nav of [bandScope(page), bandScopeItems(page, 'event')]) {
    const size = await nav
      .locator('ul')
      .evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(size.scroll).toBeLessThanOrEqual(size.client);
  }
  const overflow = await horizontalOverflow(page);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

  await bandScope(page).getByRole('link', { name: 'Por membro' }).click();
  await expect(page).toHaveURL(/\?area=membros#faixas$/);
  await expect(bands.getByText('membros com acesso')).toHaveCount(0);
  await expect(bands.getByText('Subiram e Caíram contam toda a base.')).toHaveCount(0);
  await expect(bands.getByText('Novos: 54 ativados de 96.')).toBeVisible();
});

const SCOPE_FALLBACKS: { query: string; tab: string; item: string | null }[] = [
  { query: 'recorte=xyz', tab: 'Por membro', item: null },
  { query: 'recorte=COMUNIDADE&comunidade=geral', tab: 'Por membro', item: null },
  { query: 'recorte=', tab: 'Por membro', item: null },
  { query: 'recorte=__proto__', tab: 'Por membro', item: null },
  { query: 'recorte=evento&recorte=evento', tab: 'Por membro', item: null },
  { query: 'comunidade=vip', tab: 'Por membro', item: null },
  { query: 'recorte=comunidade&comunidade=xyz', tab: 'Por comunidade', item: 'Comunidade VIP' },
  { query: 'recorte=comunidade&comunidade=VIP', tab: 'Por comunidade', item: 'Comunidade VIP' },
  { query: 'recorte=evento&evento=xyz', tab: 'Por evento', item: 'Encontro mensal · 12/10' },
  {
    query: 'recorte=evento&evento=e2&evento=e2',
    tab: 'Por evento',
    item: 'Encontro mensal · 12/10',
  },
];

test('dono-do-cliente membros: an unknown recorte, comunidade or evento falls back', async ({
  page,
}) => {
  for (const { query, tab, item } of SCOPE_FALLBACKS) {
    await page.goto(`/painel-preview/dono-do-cliente?area=membros&${query}`);
    const bands = sectionTitled(ownerArea(page), 'Faixas de engajamento');
    await expect(bandScope(page).getByRole('link', { name: tab }), query).toHaveAttribute(
      'aria-current',
      'page',
    );
    if (item === null) {
      await expect(bands.getByText('Novos: 54 ativados de 96.'), query).toBeVisible();
      await expect(bands.getByText('membros com acesso'), query).toHaveCount(0);
    } else {
      const kind = tab === 'Por comunidade' ? 'community' : 'event';
      await expect(
        bandScopeItems(page, kind).getByRole('link', { name: item }),
        query,
      ).toHaveAttribute('aria-current', 'page');
    }
  }
});

const VIP_QUERY = '&recorte=comunidade&comunidade=vip';

for (const width of PHONE_WIDTHS) {
  test(`dono-do-cliente membros comunidade=vip at ${width}px: no horizontal scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`/painel-preview/dono-do-cliente?area=membros${VIP_QUERY}`);
    await expect(ownerArea(page)).toBeVisible();
    await openAllDetails(page);
    const overflow = await horizontalOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });
}

test('dono-do-cliente membros comunidade=vip at 1440x900: inside the phone', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/painel-preview/dono-do-cliente?area=membros${VIP_QUERY}`);
  await expect(page.getByText('9:41', { exact: true })).toBeVisible();
  await openAllDetails(page);
  const metrics = await screenMetrics(page);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  const overflow = await pageOverflow(page);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  expect(overflow.scrollHeight).toBeLessThanOrEqual(overflow.clientHeight + 1);
  await expect(page.locator('[data-phone-screen]').locator('table:visible')).toHaveCount(0);

  // The #faixas anchor scrolls the phone screen (not the window) down to the bands.
  await bandScopeItems(page, 'community').getByRole('link', { name: 'Geral' }).click();
  await expect(page).toHaveURL(/recorte=comunidade&comunidade=geral#faixas$/);
  const heading = ownerArea(page).getByRole('heading', { name: 'Faixas de engajamento' });
  await expect(heading).toBeInViewport();
  // In view and not under the screen's sticky status bar.
  const edges = await heading.evaluate((el) => {
    const bar = el.closest('[data-phone-screen]')?.firstElementChild;
    return {
      heading: el.getBoundingClientRect().top,
      bar: bar?.getBoundingClientRect().bottom ?? Number.NaN,
    };
  });
  expect(edges.heading).toBeGreaterThanOrEqual(edges.bar);
  await expect
    .poll(() => page.locator('[data-phone-screen]').evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
});

const BAND_LIST_SCOPES: {
  scope: string;
  tab: string;
  item: string | null;
  query: string;
  recover: string;
}[] = [
  {
    scope: 'Por membro',
    tab: 'Por membro',
    item: null,
    query: '',
    recover: '168 em risco · 69 com push',
  },
  ...[
    ['Comunidade VIP', 'vip', '22 em risco · 11 com push'],
    ['Geral', 'geral', '190 em risco · 78 com push'],
    ['Iniciantes', 'iniciantes', '120 em risco · 49 com push'],
    ['Eventos', 'eventos', '97 em risco · 40 com push'],
  ].map(([item = '', slug = '', recover = '']) => ({
    scope: item,
    tab: 'Por comunidade',
    item,
    query: `&recorte=comunidade&comunidade=${slug}`,
    recover,
  })),
  ...[
    ['u1', '6 em risco · 3 com push'],
    ['u2', '4 em risco · 2 com push'],
    ['u3', '2 em risco · 1 com push'],
    ['e4', '5 em risco · 2 com push'],
    ['e3', '3 em risco · 1 com push'],
    ['e2', '12 em risco · 5 com push'],
    ['e1', '6 em risco · 3 com push'],
  ].map(([id = '', recover = ''], i) => ({
    scope: `evento ${id}`,
    tab: 'Por evento',
    item: EVENT_CHIPS[['u1', 'u2', 'u3', 'e4', 'e3', 'e2', 'e1'].indexOf(id)] ?? `#${i}`,
    query: `&recorte=evento&evento=${id}`,
    recover,
  })),
];

const CARD_LABELS = [
  'Membro desde:',
  'Última atividade:',
  'Comunidade que mais interage:',
  'Tempo médio diário:',
];

for (const { scope, tab, item, query, recover } of BAND_LIST_SCOPES) {
  test(`dono-do-cliente membros ${scope}: each band opens its members`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/painel-preview/dono-do-cliente?area=membros${query}`);
    await expect(bandScope(page).getByRole('link', { name: tab })).toHaveAttribute(
      'aria-current',
      'page',
    );
    if (item !== null) {
      const kind = tab === 'Por comunidade' ? 'community' : 'event';
      await expect(
        bandScopeItems(page, kind).getByRole('link', { name: item, exact: true }),
      ).toHaveAttribute('aria-current', 'page');
    }
    await expect(ownerArea(page).getByText(recover, { exact: true })).toBeVisible();
    const bands = sectionTitled(ownerArea(page), 'Faixas de engajamento');

    for (const label of BAND_LABELS) {
      const details = bandDetails(bands, label);
      const summary = details.locator('summary');
      const count = Number(
        /([\d.]+) · /.exec(await summary.innerText())?.[1]?.replace('.', '') ?? Number.NaN,
      );
      expect(count, label).toBeGreaterThanOrEqual(0);
      await summary.click();
      await expect(details).toHaveAttribute('open');

      const rows = details.getByRole('listitem');
      const shown = Math.min(10, count);
      await expect(rows, label).toHaveCount(shown);
      for (const text of await rows.allTextContents()) {
        for (const part of CARD_LABELS) expect(text, `${label}: ${text}`).toContain(part);
      }
      const more = details.getByText(/^e mais \d+ membros?$/);
      const recent = details.getByText('Os 10 com atividade mais recente', { exact: true });
      const seeAll = details.getByRole('button', { name: 'Ver todos' });
      if (count > 10) {
        const left = count - shown;
        await expect(more, label).toHaveText(`e mais ${left} ${left === 1 ? 'membro' : 'membros'}`);
        await expect(recent, label).toBeVisible();
        await expect(seeAll, label).toBeDisabled();
      } else {
        await expect(more, label).toHaveCount(0);
        await expect(recent, label).toHaveCount(0);
        await expect(seeAll, label).toHaveCount(0);
      }
      const empty = details.getByText('Nenhum membro nesta faixa.', { exact: true });
      if (count === 0) await expect(empty, label).toBeVisible();
      else await expect(empty, label).toHaveCount(0);
    }

    if (scope === 'Por membro') {
      await expect(bandDetails(bands, 'Em risco').getByText('e mais 158 membros')).toBeVisible();
      const first = bandDetails(bands, 'Novos').getByRole('listitem').first();
      await expect(first).toContainText('Luana Ferraz');
      await expect(first).toContainText('Membro desde: set. de 2026');
      await expect(first).toContainText('Última atividade: hoje às 22:40');
      await expect(first).toContainText('Comunidade que mais interage: Geral');
      await expect(first).toContainText('Tempo médio diário: 18 min');
    }
    if (scope === 'Comunidade VIP') {
      await expect(bandDetails(bands, 'Inativos').getByText('e mais 8 membros')).toBeVisible();
    }
    if (scope === 'Iniciantes' || scope === 'Eventos') {
      const superfans = bandDetails(bands, 'Superfãs');
      const count = scope === 'Iniciantes' ? 6 : 3;
      await expect(superfans.getByRole('listitem')).toHaveCount(count);
      await expect(superfans.getByText(/^e mais/)).toHaveCount(0);
      await expect(superfans.locator('summary')).toContainText(`${count} · menos de 1%`);
      const bar = superfans.locator('summary span[aria-hidden="true"] > span');
      expect((await bar.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(5);
    }
    if (scope === 'evento u1') {
      await expect(bandDetails(bands, 'Novos').locator('summary')).toContainText('14 · 15%');
      await expect(bandDetails(bands, 'Inativos').getByRole('listitem')).toHaveCount(0);
    }
  });
}

/** The first member card (a link) of an opened band, and the name it shows. */
async function firstMemberCard(details: Locator) {
  const card = details.getByRole('listitem').first().getByRole('link');
  const name = (await card.locator('.text-base').innerText()).trim();
  return { card, name };
}

const DETAIL_SECTIONS = [
  'Últimos 30 dias',
  'Evolução',
  'Onde interage',
  'Eventos',
  'Compras',
  'Atendimento',
];

test('dono-do-cliente membros: a member card opens their insights and Voltar returns', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente?area=membros');
  const area = ownerArea(page);
  const atRisk = bandDetails(sectionTitled(area, 'Faixas de engajamento'), 'Em risco');
  await atRisk.locator('summary').click();
  const { card, name } = await firstMemberCard(atRisk);
  await card.click();

  await expect(page).toHaveURL(/\?area=membros&faixa=em-risco&membro=om-\d\d$/);
  await expect(ownerTabs(page).getByRole('link', { name: 'Membros', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(area.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
  await expect(area.getByRole('heading', { name: 'Faixas de engajamento' })).toHaveCount(0);
  await expect(area.getByText('Em risco', { exact: true })).toBeVisible();
  await expect(kpiCard(area, 'Dias ativos').locator('span.text-2xl')).toHaveText('0');
  for (const label of ['Tempo médio diário', 'Posts vistos']) {
    await expect(kpiCard(area, label), label).toContainText('exemplo');
  }

  const ys: number[] = [];
  for (const title of DETAIL_SECTIONS) {
    const heading = area.getByRole('heading', { name: title, exact: true });
    await expect(heading, title).toHaveCount(1);
    ys.push((await heading.boundingBox())?.y ?? Number.NaN);
  }
  ys.push(
    (await area.getByText('Sugestão de ação', { exact: true }).boundingBox())?.y ?? Number.NaN,
  );
  expect([...ys].sort((a, b) => a - b)).toEqual(ys);
  await expect(area.getByRole('button', { name: 'Convidar para o encontro' })).toBeDisabled();

  const back = area.getByRole('link', { name: 'Voltar', exact: true });
  expect(await back.getAttribute('href')).toMatch(/\?area=membros&faixa=em-risco#faixas$/);
  await back.click();
  await expect(page).toHaveURL(/\?area=membros&faixa=em-risco#faixas$/);
  const reopened = bandDetails(sectionTitled(area, 'Faixas de engajamento'), 'Em risco');
  await expect(reopened).toHaveAttribute('open');
  await expect(reopened.getByRole('listitem').first()).toContainText(name);
  await expect(
    bandDetails(sectionTitled(area, 'Faixas de engajamento'), 'Novos'),
  ).not.toHaveAttribute('open');
});

test('dono-do-cliente membros: Voltar from an event registrant keeps the event and band', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente?area=membros&recorte=evento&evento=u1');
  const area = ownerArea(page);
  const engaged = bandDetails(sectionTitled(area, 'Faixas de engajamento'), 'Engajados');
  await engaged.locator('summary').click();
  const { card, name } = await firstMemberCard(engaged);
  await card.click();
  await expect(page).toHaveURL(
    /\?area=membros&recorte=evento&evento=u1&faixa=engajados&membro=om-\d\d$/,
  );
  await expect(area.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
  const back = area.getByRole('link', { name: 'Voltar', exact: true });
  expect(await back.getAttribute('href')).toMatch(
    /\?area=membros&recorte=evento&evento=u1&faixa=engajados#faixas$/,
  );
  await back.click();
  await expect(bandScopeItems(page, 'event').getByRole('link').first()).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(
    bandDetails(sectionTitled(area, 'Faixas de engajamento'), 'Engajados'),
  ).toHaveAttribute('open');
});

test('dono-do-cliente membros: an unknown membro shows the bands', async ({ page }) => {
  for (const query of ['membro=xyz', 'faixa=em-risco&membro=om-99', 'membro=OM-01']) {
    await page.goto(`/painel-preview/dono-do-cliente?area=membros&${query}`);
    const area = ownerArea(page);
    await expect(area.getByRole('heading', { name: 'Faixas de engajamento' }), query).toBeVisible();
    await expect(area.getByRole('link', { name: 'Voltar', exact: true }), query).toHaveCount(0);
  }
});

const SUPERFAN_DETAIL = '/painel-preview/dono-do-cliente?area=membros&faixa=superfas&membro=om-13';

for (const width of PHONE_WIDTHS) {
  test(`dono-do-cliente membros: a member's insights at ${width}px, no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(SUPERFAN_DETAIL);
    await expect(ownerArea(page).getByRole('heading', { name: 'Últimos 30 dias' })).toBeVisible();
    const overflow = await horizontalOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });
}

test("dono-do-cliente membros: a member's insights at 1440x900, inside the phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(SUPERFAN_DETAIL);
  await expect(page.getByText('9:41', { exact: true })).toBeVisible();
  await expect(ownerArea(page).getByRole('heading', { name: 'Últimos 30 dias' })).toBeVisible();
  const metrics = await screenMetrics(page);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  const overflow = await pageOverflow(page);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
});

/** A closed collapsible of the open area, by its title. */
function areaDetails(page: Page, title: string) {
  return ownerArea(page)
    .locator('details')
    .filter({ has: page.locator('summary', { hasText: title }) });
}

test('dono-do-cliente ?area=conteudo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente?area=conteudo');
  const area = ownerArea(page);

  const topPosts = sectionTitled(area, 'Posts que mais renderam');
  const posts = topPosts.getByRole('listitem');
  await expect(posts).toHaveCount(4);
  for (let i = 0; i < 4; i += 1) {
    await expect(posts.nth(i).getByText('exemplo', { exact: true })).toHaveCount(0);
  }
  await expect(topPosts.getByText('exemplo', { exact: true })).toHaveCount(1);
  await expect(
    topPosts.getByText(
      'Curtidas e comentários são medidos; salvamentos e compartilhamentos são valores de exemplo.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(posts.first()).toContainText('96 curtidas · 31 comentários');
  await expect(posts.first()).toContainText('18 salvamentos · 7 compartilhamentos');

  for (const label of [
    'Alcance por post',
    '% assistido (vídeos e reels)',
    'Conclusão (vídeos e reels)',
  ]) {
    await expect(kpiCard(area, label).getByText('exemplo', { exact: true })).toHaveCount(1);
  }
  await expect(
    kpiCard(area, 'Visualizações por story').getByText('exemplo', { exact: true }),
  ).toHaveCount(0);

  const summaries: [string, string][] = [
    ['Interações por post, por formato', 'Vídeo rende mais: 96 por post'],
    ['Interações por post, por comunidade', 'VIP rende mais: 75 por post'],
    ['Melhor dia e horário para publicar', 'Quinta, 20h–22h'],
    ['Onde os membros interagem', 'Curtidas: 3.100'],
  ];
  for (const [title, summary] of summaries) {
    const details = areaDetails(page, title);
    await expect(details).toHaveCount(1);
    await expect(details).not.toHaveAttribute('open');
    await expect(details.locator('summary')).toContainText(summary);
  }
});

test('dono-do-cliente ?area=eventos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente?area=eventos');
  const area = ownerArea(page);

  const upcoming = sectionTitled(area, 'Próximos eventos').getByRole('listitem');
  await expect(upcoming).toHaveCount(3);
  const encontro = upcoming.filter({ hasText: 'Encontro mensal' });
  await expect(encontro).toContainText('92');
  await expect(encontro).toContainText('8');
  await expect(upcoming.filter({ hasText: 'Imersão presencial' })).toContainText('Lotado');
  await expect(upcoming.filter({ hasText: 'Live de dúvidas' })).toContainText('Sem limite');

  const waitlist = sectionTitled(area, 'Lista de espera');
  await expect(waitlist.getByText('exemplo', { exact: true })).toHaveCount(3);
  for (const label of ['Conseguiram vaga', 'Foram ao evento']) {
    await expect(kpiCard(waitlist, label).getByText('exemplo', { exact: true })).toHaveCount(1);
  }
  await expect(
    waitlist.getByText('67 pessoas entraram na espera de 3 eventos lotados', { exact: true }),
  ).toBeVisible();
  await expect(
    waitlist.getByText('Encontro set.: 100 vagas, 38 na espera.', { exact: true }),
  ).toBeVisible();
  await expect(kpiCard(waitlist, 'Conseguiram vaga')).toContainText('15');
  await expect(kpiCard(waitlist, 'Foram ao evento')).toContainText('10');

  const summaries: [string, string][] = [
    ['Comparecimento por evento', 'comparecimento 64%'],
    ['Presencial × online', 'presencial 76% · online 56%'],
    ['Quem vai aos eventos', '69% das presenças vêm de 22% dos membros (superfãs e engajados).'],
  ];
  for (const [title, summary] of summaries) {
    const details = areaDetails(page, title);
    await expect(details).not.toHaveAttribute('open');
    await expect(details.locator('summary')).toContainText(summary);
  }

  const attendance = areaDetails(page, 'Comparecimento por evento');
  await attendance.locator('summary').click();
  await expect(attendance.getByRole('listitem')).toHaveCount(4);
  await expect(attendance).toContainText('+6 pessoas sem inscrição no Encontro set.');
});

test('dono-do-cliente ?area=financeiro', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente?area=financeiro');
  const area = ownerArea(page);

  const value = kpiCard(area, 'Valor registrado');
  await expect(value).toContainText(/R\$\s8\.940,00/);
  await expect(value).toContainText('12% vs. mês anterior');
  await expect(kpiCard(area, 'Pedidos')).toContainText('96');
  await expect(
    area.getByText(
      'Enquanto não houver pagamento integrado, o valor é registrado, não dinheiro recebido.',
      { exact: true },
    ),
  ).toBeVisible();

  const revenue = areaDetails(page, 'Receita por produto');
  await expect(revenue).not.toHaveAttribute('open');
  await expect(revenue.locator('summary')).toContainText(/Comunidade VIP lidera: R\$\s4\.137,00/);
  const buyers = areaDetails(page, 'Quem compra');
  await expect(buyers).not.toHaveAttribute('open');
  await expect(buyers.locator('summary')).toContainText('72% das compras vêm de 22% dos membros');

  for (const label of ['Acessos que vencem em 7 dias', 'Taxa de renovação']) {
    await expect(kpiCard(area, label).getByText('exemplo', { exact: true })).toHaveCount(1);
  }
  await expect(kpiCard(area, 'Taxa de renovação')).toContainText('73%');
  const conversion = areaDetails(page, 'Conversão por produto');
  await expect(conversion).not.toHaveAttribute('open');
  await expect(conversion.locator('summary').getByText('exemplo', { exact: true })).toHaveCount(1);
});

test('dono-do-cliente ?area=atendimento', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente?area=atendimento');
  const area = ownerArea(page);

  await expect(kpiCard(area, 'Aguardando resposta')).toContainText('2');
  await expect(kpiCard(area, 'Espera mais antiga')).toContainText('26 h');
  const median = kpiCard(area, 'Mediana da semana');
  await expect(median).toContainText('1h40');
  await expect(median).toContainText('20 min');

  await expect(areaDetails(page, 'Atendimentos por semana').locator('summary')).toContainText(
    '72 nas últimas 4 semanas',
  );
  const subjects = areaDetails(page, 'Atendimentos por assunto');
  await expect(subjects).not.toHaveAttribute('open');
  await expect(subjects.locator('summary')).toContainText('Acesso e login lidera: 26 (35%)');
  await expect(subjects.locator('summary').getByText('exemplo', { exact: true })).toHaveCount(1);

  const team = areaDetails(page, 'Equipe');
  await expect(team).not.toHaveAttribute('open');
  await expect(team.locator('summary')).toContainText(
    '72 conversas respondidas por 3 pessoas em 30 dias',
  );
  await team.locator('summary').click();
  for (const name of ['Marina Costa', 'Paulo Reis', 'Bia Lopes']) {
    await expect(team.getByText(name, { exact: true })).toBeVisible();
  }
  await expect(areaDetails(page, 'Moderação').locator('summary')).toContainText(
    'taxa de remoção 0,2%',
  );

  await openAllDetails(page);
  const body = (await area.textContent()) ?? '';
  expect(body).not.toMatch(/\b(Ana|Rui|João|Lia|Vieira|Souza|Matos)\b/);
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

test('membro: the panel starts at Sua atividade; presence and streak, no band', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/membro');

  await expect(page.getByRole('heading', { name: 'Para você', exact: true })).toHaveCount(0);
  for (const text of [
    'Ana Souza',
    'Dr. Igor Alves',
    'Perfil',
    'Encontro mensal · hoje 19h',
    'O suporte respondeu',
  ]) {
    await expect(page.getByText(text, { exact: true })).toHaveCount(0);
  }
  await expect(page.getByText(/Membro desde/)).toHaveCount(0);
  for (const button of ['Renovar', 'Fazer check-in']) {
    await expect(page.getByRole('button', { name: button })).toHaveCount(0);
  }
  await expect(
    sectionTitled(page, 'Sua atividade').locator('xpath=preceding-sibling::*'),
  ).toHaveCount(0);
  const headings = (await page.getByRole('heading').allTextContents()).map((text) => text.trim());
  expect(headings[headings.indexOf('Membro') + 1]).toBe('Sua atividade');

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

  const posts = kpiCard(page, 'Posts vistos');
  for (const text of ['60', 'posts', '128 visualizações']) await expect(posts).toContainText(text);
  const seenValues: [string, string][] = [
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
    slug: 'posts-vistos',
    card: 'Posts vistos',
    title: 'Posts que você viu',
    rows: 60,
    count: '60 posts · 128 visualizações · mais vistos primeiro',
    listExample: true,
    rowExamples: 0,
    sample: 'visto 6×',
  },
  {
    slug: 'videos',
    card: 'Vídeos e reels',
    title: 'Vídeos e reels que você assistiu',
    rows: 41,
    count: '41 assistidos · 1 h 12 min · mais assistidos primeiro',
    listExample: true,
    rowExamples: 0,
    sample: '2 min 10 s de 4 min 12 s · 2×',
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
  'Posts vistos',
  'Stories vistos',
  'Vídeos e reels',
  'Tempo em vídeos e reels',
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
    await expect(page.locator('#lista').locator('xpath=preceding-sibling::*')).toHaveCount(0);
    await expect(page.getByText(/Membro desde/)).toHaveCount(0);
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

test('membro: the video time card opens the same videos list', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/painel-preview/membro');
  await memberCardLink(page, 'Tempo em vídeos e reels').click();
  await expect(page).toHaveURL(/\?lista=videos#lista$/);
  await expect(
    page.getByRole('heading', { level: 3, name: 'Vídeos e reels que você assistiu', exact: true }),
  ).toBeVisible();
});

for (const list of MEMBER_LIST_CASES) {
  test(`membro ?lista=${list.slug} at 1440x900: inside the phone, no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/painel-preview/membro?lista=${list.slug}`);
    await expect(
      page
        .locator('[data-phone-screen]')
        .getByRole('heading', { level: 3, name: list.title, exact: true }),
    ).toBeVisible();
    const metrics = await screenMetrics(page);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.scrollHeight).toBeLessThanOrEqual(overflow.clientHeight + 1);
  });
}
