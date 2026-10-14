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
  // One per band list (the example daily time, quick 261012-ri4 R-2): the six bands all have members.
  { slug: 'membros', tab: 'Membros', heading: 'Crescimento', pills: 6 },
  // Taxa, Visualizações and Alcance, the best posts' line and the four bands' daily-time line.
  { slug: 'conteudo', tab: 'Conteúdo', heading: 'Resumo do mês', pills: 8 },
  // The three of Lista de espera and the receita line of Próximos eventos (quick 261013-p31).
  { slug: 'eventos', tab: 'Eventos', heading: 'Próximos eventos', pills: 4 },
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

  test('the cascade is plain links: a tab, a band, then a community', async ({ page }) => {
    await page.goto('/painel-preview/dono-do-cliente?area=membros');
    await bandScope(page).getByRole('link', { name: 'Por comunidade' }).click();
    await expect(page).toHaveURL(/\?area=membros&recorte=comunidade#faixas$/);
    const engaged = bandDetails(faixas(page), 'Engajados');
    await expect(engaged).not.toHaveAttribute('open');
    await engaged.locator('summary').click();
    await expect(engaged).toHaveAttribute('open');
    const geral = scopeCards(engaged, 'community').nth(1).getByRole('link');
    expect(await geral.getAttribute('href')).toMatch(
      /\?area=membros&recorte=comunidade&comunidade=geral&faixa=engajados#faixas$/,
    );
    await geral.click();
    await expect(page).toHaveURL(
      /\?area=membros&recorte=comunidade&comunidade=geral&faixa=engajados#faixas$/,
    );
    await expect(
      bandDetails(faixas(page), 'Engajados').getByRole('link', { name: 'Voltar às comunidades' }),
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
    ['Interações por publicação', '65'],
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

/** The scope tabs of the bands (quick 261012-tru D-01): Por membro | Por comunidade | Por evento. */
function bandScope(page: Page) {
  return page.getByRole('navigation', { name: 'Recorte das faixas' });
}

/** The Faixas de engajamento section of the Membros area. */
function faixas(page: Page) {
  return sectionTitled(ownerArea(page), 'Faixas de engajamento');
}

const MEMBERS_AREA = '/painel-preview/dono-do-cliente?area=membros';
const BAND_TABS = ['Por membro', 'Por comunidade', 'Por evento'];
const COMMUNITY_NAMES = ['Comunidade VIP', 'Geral', 'Iniciantes', 'Eventos'];
const COMMUNITY_NOTE =
  'A contagem de cada faixa é da base toda. Em cada comunidade, o membro aparece na faixa das ações feitas nela.';
const EVENT_NOTE =
  'A contagem de cada faixa é da base toda. Em cada evento, o inscrito aparece na faixa que tem hoje na base toda.';

/** The community (16:7 `card` cover) or event (16:10 `hero` cover) cards of an opened band. */
function scopeCards(details: Locator, kind: 'community' | 'event') {
  const geometry = kind === 'community' ? 'card' : 'hero';
  return details
    .getByRole('listitem')
    .filter({ has: details.page().locator(`[data-geometry="${geometry}"]`) });
}

/** A card's column value: the `dd` after the `dt` reading exactly `label`. */
function cardCell(card: Locator, label: string) {
  return card
    .locator('dt', { hasText: new RegExp(`^${label}$`) })
    .locator('xpath=following-sibling::dd[1]');
}

/** width / height of an element's box. */
async function boxRatio(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('no box');
  return box.width / box.height;
}

async function linkTexts(nav: Locator) {
  return (await nav.getByRole('link').allTextContents()).map((text) => text.trim());
}

/** The page holds no second row of chips (D-01) and the Faixas section one navigation at most. */
async function expectOneTabRow(page: Page, where: string) {
  await expect(page.getByRole('navigation', { name: 'Comunidade das faixas' }), where).toHaveCount(
    0,
  );
  await expect(page.getByRole('navigation', { name: 'Evento das faixas' }), where).toHaveCount(0);
  const section = faixas(page);
  if ((await section.count()) > 0) {
    await expect(section.getByRole('navigation'), where).toHaveCount(1);
  }
}

test('dono-do-cliente membros: the scope tabs, one row at every level', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(MEMBERS_AREA);
  const bands = faixas(page);
  const tabs = bandScope(page).getByRole('link');
  expect(await linkTexts(bandScope(page))).toEqual(BAND_TABS);
  const hrefs = [
    /\?area=membros#faixas$/,
    /\?area=membros&recorte=comunidade#faixas$/,
    /\?area=membros&recorte=evento#faixas$/,
  ];
  for (const [i, href] of hrefs.entries()) {
    expect(await tabs.nth(i).getAttribute('href')).toMatch(href);
  }
  const widths = await tabs.evaluateAll((links) =>
    links.map((link) => link.getBoundingClientRect().width),
  );
  expect(widths).toHaveLength(3);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);

  const notes: [string, string | null][] = [
    ['Por membro', null],
    ['Por comunidade', COMMUNITY_NOTE],
    ['Por evento', EVENT_NOTE],
  ];
  for (const [tab, note] of notes) {
    await bandScope(page).getByRole('link', { name: tab }).click();
    await expect(bandScope(page).getByRole('link', { name: tab })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(bandScope(page).locator('[aria-current="page"]')).toHaveCount(1);
    await expect(
      ownerTabs(page).getByRole('link', { name: 'Membros', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    for (const other of [COMMUNITY_NOTE, EVENT_NOTE]) {
      await expect(bands.getByText(other, { exact: true }), tab).toHaveCount(
        other === note ? 1 : 0,
      );
    }
    await expect(bands.getByText('Novos: 54 ativados de 96.'), tab).toBeVisible();
    await expect(bandDetails(bands, 'Engajados').locator('summary'), tab).toContainText(
      '205 · 17%',
    );
    await expect(
      bands.getByText('Subiram e Caíram contam toda a base.', { exact: true }),
      tab,
    ).toHaveCount(note === null ? 0 : 1);
  }

  for (const query of [
    '',
    '&recorte=comunidade&faixa=engajados',
    '&recorte=comunidade&comunidade=vip&faixa=engajados',
    '&recorte=evento&evento=u1&faixa=engajados',
    '&faixa=superfas&membro=om-13',
  ]) {
    await page.goto(`${MEMBERS_AREA}${query}`);
    await expect(ownerArea(page)).toBeVisible();
    await expectOneTabRow(page, query);
  }
});

test('dono-do-cliente membros: Por comunidade cascade, down to the insights and back', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(MEMBERS_AREA);
  const area = ownerArea(page);
  await bandScope(page).getByRole('link', { name: 'Por comunidade' }).click();
  await expect(page).toHaveURL(/\?area=membros&recorte=comunidade#faixas$/);
  const bands = faixas(page);
  for (const label of BAND_LABELS) {
    await expect(bandDetails(bands, label), label).not.toHaveAttribute('open');
  }
  await expect(area.getByText('168 em risco · 69 com push', { exact: true })).toBeVisible();

  const engaged = bandDetails(bands, 'Engajados');
  await expect(engaged.locator('summary')).toContainText('205 · 17%');
  await engaged.locator('summary').click();
  const cards = scopeCards(engaged, 'community');
  await expect(cards).toHaveCount(4);
  for (const [i, count] of [61, 150, 38, 22].entries()) {
    const card = cards.nth(i);
    await expect(card.locator('.text-xl')).toHaveText(COMMUNITY_NAMES[i] ?? '');
    await expect(card.getByText(`${count} nesta faixa`, { exact: true })).toBeVisible();
    await expect(card.getByRole('link')).toHaveCount(1);
  }
  const vip = cards.first();
  for (const [label, value] of [
    ['Membros', '186'],
    ['Ativos na semana', '104'],
    ['Publicações no mês', '22'],
    ['Interações no mês', '1.650'],
  ]) {
    await expect(cardCell(vip, label ?? ''), label).toHaveText(value ?? '');
  }
  await expect(vip.getByText('Interações: comentários e curtidas', { exact: true })).toBeVisible();
  const geral = cards.nth(1);
  await expect(cardCell(geral, 'Membros')).toHaveText('1.240');
  await expect(cardCell(geral, 'Interações no mês')).toHaveText('1.580');
  const ratio = await boxRatio(vip.locator('[data-testid="community-cover-fallback"]'));
  expect(Math.abs(ratio - 16 / 7)).toBeLessThanOrEqual(0.02);
  const coverBox = await vip.locator('[data-testid="community-cover-fallback"]').boundingBox();
  const cardBox = await vip.getByRole('link').boundingBox();
  expect(Math.abs((coverBox?.width ?? 0) - (cardBox?.width ?? 0))).toBeLessThanOrEqual(1);

  await vip.getByRole('link').click();
  await expect(page).toHaveURL(
    /\?area=membros&recorte=comunidade&comunidade=vip&faixa=engajados#faixas$/,
  );
  const opened = bandDetails(faixas(page), 'Engajados');
  await expect(opened).toHaveAttribute('open');
  const back = opened.getByRole('link', { name: 'Voltar às comunidades' });
  await expect(back).toBeVisible();
  expect(await back.getAttribute('href')).toMatch(
    /\?area=membros&recorte=comunidade&faixa=engajados#faixas$/,
  );
  await expect(opened.locator('[data-geometry="card"]')).toHaveCount(1);
  await expect(opened.locator('a [data-geometry="card"]')).toHaveCount(0);
  await expect(opened.getByText('Engajados em Comunidade VIP', { exact: true })).toBeVisible();
  await expect(opened.getByRole('listitem')).toHaveCount(10);
  await expect(opened.getByText('e mais 51 membros', { exact: true })).toBeVisible();
  await expect(opened.getByRole('button', { name: 'Ver todos' })).toBeDisabled();
  await expect(area.getByText('22 em risco · 11 com push', { exact: true })).toBeVisible();

  const { card, name } = await firstMemberCard(opened);
  await card.click();
  await expect(page).toHaveURL(
    /\?area=membros&recorte=comunidade&comunidade=vip&faixa=engajados&membro=om-\d\d$/,
  );
  await expect(area.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
  const voltar = area.getByRole('link', { name: 'Voltar', exact: true });
  expect(await voltar.getAttribute('href')).toMatch(
    /\?area=membros&recorte=comunidade&comunidade=vip&faixa=engajados#faixas$/,
  );
  await voltar.click();
  await expect(page).toHaveURL(
    /\?area=membros&recorte=comunidade&comunidade=vip&faixa=engajados#faixas$/,
  );
  const again = bandDetails(faixas(page), 'Engajados');
  await expect(again.getByRole('listitem').first()).toContainText(name);
  await again.getByRole('link', { name: 'Voltar às comunidades' }).click();
  await expect(page).toHaveURL(/\?area=membros&recorte=comunidade&faixa=engajados#faixas$/);
  const cardsAgain = bandDetails(faixas(page), 'Engajados');
  await expect(cardsAgain).toHaveAttribute('open');
  await expect(scopeCards(cardsAgain, 'community')).toHaveCount(4);
  await expect(cardsAgain.getByRole('link', { name: 'Voltar às comunidades' })).toHaveCount(0);
  await expect(area.getByText('168 em risco · 69 com push', { exact: true })).toBeVisible();
});

const EVENT_NAMES = [
  'Encontro mensal',
  'Live de dúvidas',
  'Imersão presencial',
  'Aula aberta',
  'Workshop',
  'Live de dúvidas',
  'Encontro set.',
];

test('dono-do-cliente membros: Por evento cascade, down to the insights and back', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(MEMBERS_AREA);
  const area = ownerArea(page);
  await bandScope(page).getByRole('link', { name: 'Por evento' }).click();
  await expect(page).toHaveURL(/\?area=membros&recorte=evento#faixas$/);
  const bands = faixas(page);

  const engaged = bandDetails(bands, 'Engajados');
  await engaged.locator('summary').click();
  const cards = scopeCards(engaged, 'event');
  await expect(cards).toHaveCount(7);
  for (const [i, count] of [34, 23, 16, 21, 18, 62, 45].entries()) {
    await expect(cards.nth(i).locator('.text-xl')).toHaveText(EVENT_NAMES[i] ?? '');
    await expect(cards.nth(i).getByText(`${count} nesta faixa`, { exact: true })).toBeVisible();
  }
  const u1 = cards.first();
  await expect(u1.getByText('Presencial', { exact: true })).toBeVisible();
  await expect(cards.nth(1).getByText('Online', { exact: true })).toBeVisible();
  await expect(cardCell(u1, 'Data')).toHaveText('12/10');
  await expect(cardCell(u1, 'Duração')).toHaveText('3h00');
  await expect(cardCell(u1, 'Receita')).toHaveText(/^R\$\s?5,5\s?mil$/);
  const ratio = await boxRatio(u1.locator('[data-testid="event-cover-fallback"]'));
  expect(Math.abs(ratio - 16 / 10)).toBeLessThanOrEqual(0.02);
  await expect(engaged.getByText('exemplo', { exact: true })).toHaveCount(1);
  await expect(engaged.getByText('Receita: valores de exemplo')).toBeVisible();
  await expect(cards.getByText('exemplo', { exact: true })).toHaveCount(0);

  const inactive = bandDetails(bands, 'Inativos');
  await inactive.locator('summary').click();
  await expect(scopeCards(inactive, 'event')).toHaveCount(7);
  await expect(inactive.getByText('0 nesta faixa', { exact: true })).toHaveCount(7);
  await expect(inactive.getByRole('link')).toHaveCount(0);

  await u1.getByRole('link').click();
  await expect(page).toHaveURL(/\?area=membros&recorte=evento&evento=u1&faixa=engajados#faixas$/);
  const opened = bandDetails(faixas(page), 'Engajados');
  await expect(opened).toHaveAttribute('open');
  const back = opened.getByRole('link', { name: 'Voltar aos eventos' });
  expect(await back.getAttribute('href')).toMatch(
    /\?area=membros&recorte=evento&faixa=engajados#faixas$/,
  );
  await expect(
    opened.getByText('Engajados em Encontro mensal · 12/10', { exact: true }),
  ).toBeVisible();
  await expect(opened.getByRole('listitem')).toHaveCount(10);
  await expect(opened.getByText('e mais 24 membros', { exact: true })).toBeVisible();
  await expect(area.getByText('6 em risco · 3 com push', { exact: true })).toBeVisible();

  const { card, name } = await firstMemberCard(opened);
  await card.click();
  await expect(page).toHaveURL(
    /\?area=membros&recorte=evento&evento=u1&faixa=engajados&membro=om-\d\d$/,
  );
  await expect(area.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
  const voltar = area.getByRole('link', { name: 'Voltar', exact: true });
  expect(await voltar.getAttribute('href')).toMatch(
    /\?area=membros&recorte=evento&evento=u1&faixa=engajados#faixas$/,
  );
  await voltar.click();
  await bandDetails(faixas(page), 'Engajados')
    .getByRole('link', { name: 'Voltar aos eventos' })
    .click();
  await expect(page).toHaveURL(/\?area=membros&recorte=evento&faixa=engajados#faixas$/);
  await expect(scopeCards(bandDetails(faixas(page), 'Engajados'), 'event')).toHaveCount(7);
});

const CARD_LABELS = [
  'Membro desde:',
  'Última atividade:',
  'Comunidade que mais interage:',
  'Tempo médio diário:',
];

/** Every band list of one list scope (the whole base, a community or an event). */
const BAND_LISTS: {
  scope: string;
  query: string;
  kind: 'member' | 'community' | 'event';
  recover: string;
}[] = [
  { scope: 'Por membro', query: '', kind: 'member', recover: '168 em risco · 69 com push' },
  ...[
    ['vip', '22 em risco · 11 com push'],
    ['geral', '190 em risco · 78 com push'],
    ['iniciantes', '120 em risco · 49 com push'],
    ['eventos', '97 em risco · 40 com push'],
  ].map(([slug = '', recover = '']) => ({
    scope: `comunidade ${slug}`,
    query: `&recorte=comunidade&comunidade=${slug}`,
    kind: 'community' as const,
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
  ].map(([id = '', recover = '']) => ({
    scope: `evento ${id}`,
    query: `&recorte=evento&evento=${id}`,
    kind: 'event' as const,
    recover,
  })),
];

const BAND_SLUGS = ['novos', 'superfas', 'engajados', 'ocasionais', 'em-risco', 'inativos'];

/** The count a band list holds: the summary in Por membro, the opened card's "N nesta faixa". */
async function listCount(details: Locator, kind: 'member' | 'community' | 'event') {
  const text =
    kind === 'member'
      ? /([\d.]+) · /.exec(await details.locator('summary').innerText())?.[1]
      : /^([\d.]+) nesta faixa$/.exec(
          (await details.getByText(/^[\d.]+ nesta faixa$/).innerText()).trim(),
        )?.[1];
  return Number(text?.replace('.', '') ?? Number.NaN);
}

for (const { scope, query, kind, recover } of BAND_LISTS) {
  test(`dono-do-cliente membros ${scope}: each band lists its members`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [b, label] of BAND_LABELS.entries()) {
      await page.goto(`${MEMBERS_AREA}${query}&faixa=${BAND_SLUGS[b]}#faixas`);
      const details = bandDetails(faixas(page), label);
      await expect(details, label).toHaveAttribute('open');
      if (kind === 'event' && label === 'Inativos') {
        // Nobody of an event is inactive: the URL falls back to the band's cards (D-06).
        await expect(details.getByText('0 nesta faixa', { exact: true })).toHaveCount(7);
        await expect(details.getByRole('link', { name: 'Voltar aos eventos' })).toHaveCount(0);
        continue;
      }
      if (kind !== 'member') {
        const back = kind === 'community' ? 'Voltar às comunidades' : 'Voltar aos eventos';
        await expect(details.getByRole('link', { name: back }), label).toBeVisible();
        await expect(ownerArea(page).getByText(recover, { exact: true }), label).toBeVisible();
      }
      const count = await listCount(details, kind);
      expect(count, label).toBeGreaterThan(0);

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
      await expect(details.getByText('Nenhum membro nesta faixa.', { exact: true })).toHaveCount(0);
      await expect(details.getByText('exemplo', { exact: true }), label).toHaveCount(
        kind === 'event' ? 2 : 1,
      );
      await expect(
        details.getByText('Tempo médio diário: valores de exemplo'),
        label,
      ).toBeVisible();
      await expect(rows.getByText('exemplo', { exact: true }), label).toHaveCount(0);

      if (scope === 'Por membro' && label === 'Em risco') {
        await expect(details.getByText('e mais 158 membros')).toBeVisible();
      }
      if (scope === 'Por membro' && label === 'Novos') {
        const first = rows.first();
        await expect(first).toContainText('Luana Ferraz');
        await expect(first).toContainText('Membro desde: set. de 2026');
        await expect(first).toContainText('Última atividade: hoje às 22:40');
        await expect(first).toContainText('Comunidade que mais interage: Geral');
        await expect(first).toContainText('Tempo médio diário: 18 min');
        const fontSize = (locator: Locator) =>
          locator.evaluate((el) => getComputedStyle(el).fontSize);
        expect(await fontSize(first.getByText('Luana Ferraz', { exact: true }))).toBe('18px');
        expect(await fontSize(first.getByText('Membro desde:').locator('..'))).toBe('14px');
        await expect(first.getByRole('link').locator('svg')).toHaveCount(1);
        await expect(details.getByRole('link', { name: /Luana Ferraz/ })).toHaveCount(1);
      }
      if (scope === 'comunidade vip' && label === 'Inativos') {
        await expect(details.getByText('e mais 8 membros')).toBeVisible();
      }
      if (
        (scope === 'comunidade iniciantes' || scope === 'comunidade eventos') &&
        label === 'Superfãs'
      ) {
        expect(count).toBe(scope === 'comunidade iniciantes' ? 6 : 3);
        await expect(details.getByText(/^e mais/)).toHaveCount(0);
      }
    }
  });
}

/** The first member card (a link) of an opened band, and the name it shows. */
async function firstMemberCard(details: Locator) {
  const card = details.getByRole('listitem').first().getByRole('link');
  const name = (await card.locator('.text-lg').innerText()).trim();
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
    (await area.getByText('Sugestão de ação (base toda)', { exact: true }).boundingBox())?.y ??
      Number.NaN,
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

const DEMOTED_DETAIL =
  '/painel-preview/dono-do-cliente?area=membros&recorte=comunidade&comunidade=eventos&faixa=ocasionais&membro=om-28';

test('dono-do-cliente membros: a member demoted in a community shows both bands', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${MEMBERS_AREA}&recorte=comunidade#faixas`);
  const area = ownerArea(page);
  const occasional = bandDetails(faixas(page), 'Ocasionais');
  await occasional.locator('summary').click();
  await scopeCards(occasional, 'community').nth(3).getByRole('link').click();
  await expect(page).toHaveURL(
    /\?area=membros&recorte=comunidade&comunidade=eventos&faixa=ocasionais#faixas$/,
  );
  await bandDetails(faixas(page), 'Ocasionais')
    .getByRole('link', { name: /Rodrigo Aguiar/ })
    .click();

  await expect(page).toHaveURL(
    /\?area=membros&recorte=comunidade&comunidade=eventos&faixa=ocasionais&membro=om-28$/,
  );
  await expect(area.getByText('Ocasional em Eventos', { exact: true })).toBeVisible();
  await expect(area.getByText('Engajado na base toda', { exact: true })).toBeVisible();
  await expect(area.getByText('Hoje (base toda): Engajado', { exact: true })).toBeVisible();
  expect(
    await area.getByRole('link', { name: 'Voltar', exact: true }).getAttribute('href'),
  ).toMatch(/&comunidade=eventos&faixa=ocasionais#faixas$/);

  await page.goto(`${MEMBERS_AREA}&recorte=comunidade&comunidade=vip&faixa=engajados&membro=om-28`);
  await expect(area.getByText('Engajado', { exact: true })).toBeVisible();
  await expect(area.getByText(/na base toda$/)).toHaveCount(0);
});

test('dono-do-cliente membros: an unknown membro shows the bands', async ({ page }) => {
  for (const query of ['membro=xyz', 'faixa=em-risco&membro=om-99', 'membro=OM-01']) {
    await page.goto(`/painel-preview/dono-do-cliente?area=membros&${query}`);
    const area = ownerArea(page);
    await expect(area.getByRole('heading', { name: 'Faixas de engajamento' }), query).toBeVisible();
    await expect(area.getByRole('link', { name: 'Voltar', exact: true }), query).toHaveCount(0);
  }
});

/** What a forged URL must fall back to (D-06): the tab, the open band and what the band shows. */
const FALLBACKS: {
  query: string;
  tab: string;
  band: string | null;
  shows: 'members' | 'community cards' | 'event cards' | 'opened community' | null;
}[] = [
  { query: 'recorte=xyz', tab: 'Por membro', band: null, shows: null },
  {
    query: 'recorte=COMUNIDADE&comunidade=geral&faixa=engajados',
    tab: 'Por membro',
    band: 'Engajados',
    shows: 'members',
  },
  {
    query: 'comunidade=vip&faixa=engajados',
    tab: 'Por membro',
    band: 'Engajados',
    shows: 'members',
  },
  { query: 'recorte=comunidade&comunidade=vip', tab: 'Por comunidade', band: null, shows: null },
  ...['comunidade=xyz', 'comunidade=VIP', 'evento=u1'].map((item) => ({
    query: `recorte=comunidade&${item}&faixa=engajados`,
    tab: 'Por comunidade',
    band: 'Engajados',
    shows: 'community cards' as const,
  })),
  ...['evento=xyz', 'evento=e2&evento=e2', 'comunidade=vip'].map((item) => ({
    query: `recorte=evento&${item}&faixa=engajados`,
    tab: 'Por evento',
    band: 'Engajados',
    shows: 'event cards' as const,
  })),
  {
    query: 'recorte=evento&evento=u1&faixa=inativos',
    tab: 'Por evento',
    band: 'Inativos',
    shows: 'event cards',
  },
  { query: 'recorte=evento&evento=u1&faixa=xyz', tab: 'Por evento', band: null, shows: null },
  // A member outside the band or the opened list (quick 261012-ri4 R-5, 261012-tru D-06).
  { query: 'membro=om-13', tab: 'Por membro', band: null, shows: null },
  { query: 'faixa=novos&membro=om-13', tab: 'Por membro', band: 'Novos', shows: 'members' },
  {
    query: 'recorte=comunidade&comunidade=vip&faixa=superfas&membro=om-13',
    tab: 'Por comunidade',
    band: 'Superfãs',
    shows: 'opened community',
  },
  {
    query: 'recorte=comunidade&comunidade=eventos&faixa=engajados&membro=om-28',
    tab: 'Por comunidade',
    band: 'Engajados',
    shows: 'opened community',
  },
  {
    query: 'recorte=comunidade&faixa=engajados&membro=om-25',
    tab: 'Por comunidade',
    band: 'Engajados',
    shows: 'community cards',
  },
];

test('dono-do-cliente membros: a forged URL falls one level up', async ({ page }) => {
  for (const { query, tab, band, shows } of FALLBACKS) {
    await page.goto(`${MEMBERS_AREA}&${query}`);
    const area = ownerArea(page);
    const bands = faixas(page);
    await expect(area.getByRole('heading', { name: 'Faixas de engajamento' }), query).toBeVisible();
    await expect(area.getByRole('link', { name: 'Voltar', exact: true }), query).toHaveCount(0);
    await expect(bandScope(page).getByRole('link', { name: tab }), query).toHaveAttribute(
      'aria-current',
      'page',
    );
    for (const label of BAND_LABELS) {
      const details = bandDetails(bands, label);
      if (label === band) await expect(details, `${query} ${label}`).toHaveAttribute('open');
      else await expect(details, `${query} ${label}`).not.toHaveAttribute('open');
    }
    if (band === null) continue;
    const details = bandDetails(bands, band);
    if (shows === 'members') {
      await expect(details.locator('[data-geometry]'), query).toHaveCount(0);
      await expect(details.getByRole('listitem').first(), query).toContainText('Membro desde:');
    }
    if (shows === 'community cards') {
      await expect(scopeCards(details, 'community'), query).toHaveCount(4);
      await expect(details.getByRole('link', { name: 'Voltar às comunidades' }), query).toHaveCount(
        0,
      );
    }
    if (shows === 'event cards') {
      await expect(scopeCards(details, 'event'), query).toHaveCount(7);
      await expect(details.getByRole('link', { name: 'Voltar aos eventos' }), query).toHaveCount(0);
    }
    if (shows === 'opened community') {
      await expect(
        details.getByRole('link', { name: 'Voltar às comunidades' }),
        query,
      ).toBeVisible();
      await expect(details.locator('[data-geometry="card"]'), query).toHaveCount(1);
    }
  }
});

const CASCADE_VIEWS = [
  '&recorte=comunidade&faixa=engajados',
  '&recorte=comunidade&comunidade=vip&faixa=engajados',
  '&recorte=evento&faixa=engajados',
  '&recorte=evento&evento=u1&faixa=engajados',
];

for (const width of PHONE_WIDTHS) {
  test(`dono-do-cliente membros: the cascade at ${width}px, no horizontal scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const query of CASCADE_VIEWS) {
      await page.goto(`${MEMBERS_AREA}${query}#faixas`);
      await expect(ownerArea(page), query).toBeVisible();
      await openAllDetails(page);
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth, query).toBeLessThanOrEqual(overflow.clientWidth);
    }
  });
}

test('dono-do-cliente membros: the cascade at 1440x900, inside the phone', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const query of CASCADE_VIEWS) {
    await page.goto(`${MEMBERS_AREA}${query}#faixas`);
    await expect(page.getByText('9:41', { exact: true })).toBeVisible();
    await openAllDetails(page);
    const metrics = await screenMetrics(page);
    expect(metrics.scrollWidth, query).toBeLessThanOrEqual(metrics.clientWidth);
    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth, query).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.scrollHeight, query).toBeLessThanOrEqual(overflow.clientHeight + 1);
  }

  // From the cards, the Geral card scrolls the phone screen (not the window) down to the bands.
  await page.goto(`${MEMBERS_AREA}&recorte=comunidade&faixa=engajados#faixas`);
  await expect(page.getByText('9:41', { exact: true })).toBeVisible();
  await scopeCards(bandDetails(faixas(page), 'Engajados'), 'community')
    .nth(1)
    .getByRole('link')
    .click();
  await expect(page).toHaveURL(/recorte=comunidade&comunidade=geral&faixa=engajados#faixas$/);
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

const SUPERFAN_DETAIL = '/painel-preview/dono-do-cliente?area=membros&faixa=superfas&membro=om-13';

for (const width of PHONE_WIDTHS) {
  test(`dono-do-cliente membros: a member's insights at ${width}px, no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const url of [SUPERFAN_DETAIL, DEMOTED_DETAIL]) {
      await page.goto(url);
      await expect(
        ownerArea(page).getByRole('heading', { name: 'Últimos 30 dias' }),
        url,
      ).toBeVisible();
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth, url).toBeLessThanOrEqual(overflow.clientWidth);
    }
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

/** The five insight numbers that open their list (quick 261012-tru D-07). */
const OWNER_LIST_CASES: { slug: string; card: string; title: string; order: string }[] = [
  {
    slug: 'dias-ativos',
    card: 'Dias ativos',
    title: 'Dias ativos',
    order: 'mais recentes primeiro',
  },
  { slug: 'curtidas', card: 'Curtidas', title: 'Curtidas', order: 'mais recentes primeiro' },
  {
    slug: 'comentarios',
    card: 'Comentários',
    title: 'Comentários',
    order: 'mais recentes primeiro',
  },
  {
    slug: 'acoes-fortes',
    card: 'Ações fortes',
    title: 'Ações fortes',
    order: 'mais recentes primeiro',
  },
  {
    slug: 'posts-vistos',
    card: 'Posts vistos',
    title: 'Posts vistos',
    order: 'mais vistos primeiro',
  },
];

test("dono-do-cliente membros: the insights' numbers open their lists", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const area = ownerArea(page);
  for (const list of OWNER_LIST_CASES) {
    await page.goto(SUPERFAN_DETAIL);
    const kpi = area.locator(`#insight-${list.slug}`);
    await expect(kpi, list.slug).toContainText('Ver lista');
    const value = Number((await kpi.locator('span.text-2xl').innerText()).trim().replace('.', ''));
    expect(value, list.slug).toBeGreaterThan(0);
    await kpi.click();
    await expect(page).toHaveURL(
      new RegExp(`\\?area=membros&faixa=superfas&membro=om-13&lista=${list.slug}#lista$`),
    );
    const title = area.getByRole('heading', { level: 3, name: list.title, exact: true });
    await expect(title).toBeVisible();
    await expect(title).toBeInViewport();
    await expect(area.getByText('Fernanda Paiva · últimos 30 dias', { exact: true })).toBeVisible();
    const count = area.getByText(new RegExp(`^${value} .* · ${list.order}$`));
    await expect(count, list.slug).toBeVisible();
    await expect(sectionTitled(area, list.title).getByRole('listitem'), list.slug).toHaveCount(
      value,
    );
    // Quick 261013-orf D-01: one decorative thumbnail per row, except the active days.
    const thumbs = area.locator('#lista [data-testid="cover-thumb"]');
    const withThumb = list.slug === 'dias-ativos' ? 0 : value;
    await expect(thumbs, list.slug).toHaveCount(withThumb);
    await expect(
      area.locator('#lista li').filter({ has: page.locator('[data-testid="cover-thumb"]') }),
      list.slug,
    ).toHaveCount(withThumb);
    await expect(
      area.locator('#lista [data-testid="cover-thumb"]:not([aria-hidden="true"])'),
      list.slug,
    ).toHaveCount(0);
    if (list.slug === 'acoes-fortes') {
      await expect(
        area.locator('#lista [data-testid="cover-thumb"][data-kind="event"]'),
      ).toHaveCount(4);
    }
    await expect(area.getByText('exemplo', { exact: true }), list.slug).toHaveCount(
      list.slug === 'posts-vistos' ? 1 : 0,
    );
    await expect(area.getByRole('heading', { name: 'Últimos 30 dias' })).toHaveCount(0);

    const back = area.getByRole('link', { name: 'Voltar', exact: true });
    expect(await back.getAttribute('href'), list.slug).toMatch(
      new RegExp(`\\?area=membros&faixa=superfas&membro=om-13#insight-${list.slug}$`),
    );
    await back.click();
    await expect(area.getByRole('heading', { name: 'Últimos 30 dias' })).toBeVisible();
    await expect(area.locator(`#insight-${list.slug}`), list.slug).toBeInViewport();
  }
  // The daily time is not a list: a plain card with its pill.
  await expect(kpiCard(area, 'Tempo médio diário').locator('xpath=ancestor::a')).toHaveCount(0);
});

test("dono-do-cliente membros: a member's likes of today never repeat a time (quick 261013-uoi F-1)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${SUPERFAN_DETAIL}&lista=curtidas`);
  const rows = await sectionTitled(ownerArea(page), 'Curtidas')
    .getByRole('listitem')
    .allInnerTexts();
  const times = rows.flatMap((text) => {
    const match = /hoje (às )?(\d{2}:\d{2})/.exec(text);
    return match?.[2] ? [match[2]] : [];
  });
  expect(times.length).toBeGreaterThan(0);
  expect(new Set(times).size).toBe(times.length);
  expect(times.filter((time) => time === '22:40').length).toBeLessThanOrEqual(1);
});

test('dono-do-cliente membros: a list keeps the community it was opened from', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(DEMOTED_DETAIL);
  const area = ownerArea(page);
  await area.locator('#insight-curtidas').click();
  await expect(page).toHaveURL(
    /\?area=membros&recorte=comunidade&comunidade=eventos&faixa=ocasionais&membro=om-28&lista=curtidas#lista$/,
  );
  await expect(
    area.getByRole('heading', { level: 3, name: 'Curtidas', exact: true }),
  ).toBeVisible();
  await area.getByRole('link', { name: 'Voltar', exact: true }).click();
  await expect(page).toHaveURL(
    /\?area=membros&recorte=comunidade&comunidade=eventos&faixa=ocasionais&membro=om-28#insight-curtidas$/,
  );
  await expect(area.getByText('Ocasional em Eventos', { exact: true })).toBeVisible();
});

test('dono-do-cliente membros: an empty list says so', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${MEMBERS_AREA}&faixa=em-risco&membro=om-49`);
  const area = ownerArea(page);
  await expect(area.locator('#insight-curtidas').locator('span.text-2xl')).toHaveText('0');
  await area.locator('#insight-curtidas').click();
  await expect(page).toHaveURL(/&faixa=em-risco&membro=om-49&lista=curtidas#lista$/);
  await expect(
    area.getByText('Nenhuma curtida nos últimos 30 dias.', { exact: true }),
  ).toBeVisible();
  await expect(area.getByRole('listitem')).toHaveCount(0);
});

test('dono-do-cliente membros: a forged lista falls one level up', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const area = ownerArea(page);
  for (const lista of ['xyz', 'CURTIDAS', 'curtidas&lista=curtidas']) {
    await page.goto(`${SUPERFAN_DETAIL}&lista=${lista}`);
    await expect(area.getByRole('heading', { name: 'Últimos 30 dias' }), lista).toBeVisible();
    await expect(area.locator('#lista'), lista).toHaveCount(0);
  }
  await page.goto(`${MEMBERS_AREA}&lista=curtidas`);
  await expect(area.getByRole('heading', { name: 'Faixas de engajamento' })).toBeVisible();
  await expect(area.locator('#lista')).toHaveCount(0);
  await page.goto(`${MEMBERS_AREA}&faixa=novos&membro=om-13&lista=curtidas`);
  await expect(area.getByRole('heading', { name: 'Faixas de engajamento' })).toBeVisible();
  await expect(bandDetails(faixas(page), 'Novos')).toHaveAttribute('open');
  await expect(area.locator('#lista')).toHaveCount(0);
});

const OWNER_LIST_VIEWPORT_SLUGS = ['curtidas', 'comentarios', 'acoes-fortes', 'posts-vistos'];

for (const width of PHONE_WIDTHS) {
  test(`dono-do-cliente membros: a member's lists at ${width}px, no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const slug of OWNER_LIST_VIEWPORT_SLUGS) {
      await page.goto(`${SUPERFAN_DETAIL}&lista=${slug}#lista`);
      await expect(ownerArea(page).locator('#lista'), slug).toBeVisible();
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth, slug).toBeLessThanOrEqual(overflow.clientWidth);
    }
  });
}

test("dono-do-cliente membros: a member's lists at 1440x900, inside the phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const slug of OWNER_LIST_VIEWPORT_SLUGS) {
    await page.goto(`${SUPERFAN_DETAIL}&lista=${slug}#lista`);
    await expect(page.getByText('9:41', { exact: true })).toBeVisible();
    await expect(ownerArea(page).locator('#lista'), slug).toBeVisible();
    const metrics = await screenMetrics(page);
    expect(metrics.scrollWidth, slug).toBeLessThanOrEqual(metrics.clientWidth);
    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth, slug).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.scrollHeight, slug).toBeLessThanOrEqual(overflow.clientHeight + 1);
  }
});

/** A closed collapsible of the open area, by its title. */
function areaDetails(page: Page, title: string) {
  return ownerArea(page)
    .locator('details')
    .filter({ has: page.locator('summary', { hasText: title }) });
}

/* ---------------------------------------------------- Conteúdo in three tabs (quick 261013-h51) */

const CONTENT_AREA = '/painel-preview/dono-do-cliente?area=conteudo';
const CONTENT_TABS = ['Visão geral', 'Por tipo', 'Publicações'];

/** The content tabs (D-01): Visão geral | Por tipo | Publicações. */
function contentTabs(page: Page) {
  return page.getByRole('navigation', { name: 'Vistas do conteúdo' });
}

/** The publication cards of a list (each card's wrapper carries `post-<id>`). */
function postCards(scope: Locator) {
  return scope.getByRole('listitem').filter({ has: scope.page().locator('[id^="post-"]') });
}

/** The Voltar link of a deeper step. */
function backLink(page: Page) {
  return ownerArea(page).getByRole('link', { name: 'Voltar', exact: true });
}

/** A compact card's number (quick 261013-orf E-01): `likes`, `comments`, `saves` or `shares`. */
async function cardCount(card: Locator, name: string) {
  const text = (await card.locator(`[data-count="${name}"]`).textContent()) ?? '';
  return Number(/^\s*([\d.]+)/.exec(text)?.[1]?.replace('.', '') ?? Number.NaN);
}

async function coverRatio(scope: Page | Locator) {
  return boxRatio(scope.locator('[data-testid="content-cover"]').first());
}

/** A detail's interaction number as an integer ("1.240" -> 1240). */
async function numberIn(locator: Locator) {
  return Number((await locator.locator('span.text-2xl').innerText()).trim().replace('.', ''));
}

test.describe('dono-do-cliente conteudo', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('one row of three equal tabs, no period row', async ({ page }) => {
    const hrefs = [
      CONTENT_AREA,
      `${CONTENT_AREA}&vista=tipos`,
      `${CONTENT_AREA}&vista=publicacoes`,
    ];
    for (const [i, href] of hrefs.entries()) {
      await page.goto(href);
      const nav = contentTabs(page);
      await expect(nav).toHaveCount(1);
      expect(await linkTexts(nav)).toEqual(CONTENT_TABS);
      const links = nav.getByRole('link');
      const widths: number[] = [];
      for (let k = 0; k < 3; k += 1) {
        expect(await links.nth(k).getAttribute('href')).toBe(hrefs[k]);
        widths.push((await links.nth(k).boundingBox())?.width ?? Number.NaN);
      }
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(links.nth(i)).toHaveAttribute('aria-current', 'page');
      await expect(ownerArea(page).getByRole('navigation')).toHaveCount(1);
      // The bell's hidden "7 dias" alert tag is the header's, not a period choice of the area.
      await expect(ownerArea(page).getByText('7 dias', { exact: true })).toHaveCount(0);
      await expect(page.getByText('90 dias', { exact: true })).toHaveCount(0);
    }
  });

  test('Por tipo: six kinds, a kind opens its publications, a card its detail', async ({
    page,
  }) => {
    await page.goto(`${CONTENT_AREA}&vista=tipos`);
    const area = ownerArea(page);
    const expected: [string, string, string, string][] = [
      ['video', 'Vídeo', '18', '96'],
      ['foto', 'Foto', '6', '62'],
      ['carrossel', 'Carrossel', '9', '77'],
      ['texto', 'Texto', '20', '48'],
      ['link', 'Link', '8', '23'],
      ['story', 'Story', '16', '30'],
    ];
    const ids = await area.locator('[id^="tipo-"]').evaluateAll((els) => els.map((el) => el.id));
    expect(ids).toEqual(expected.map(([slug]) => `tipo-${slug}`));
    for (const [slug, name, posts, perPost] of expected) {
      const card = area.locator(`#tipo-${slug}`);
      await expect(card, slug).toContainText(name);
      await expect(cardCell(card, 'Publicações'), slug).toHaveText(posts);
      await expect(cardCell(card, 'Interações por publicação'), slug).toHaveText(perPost);
    }
    await expect(cardCell(area.locator('#tipo-video'), '% assistido')).toHaveText('58%');
    await expect(cardCell(area.locator('#tipo-texto'), '% de comentários')).toHaveText('38%');
    await expect(area.getByText('exemplo', { exact: true })).toHaveCount(1);

    await area.locator('#tipo-video').getByRole('link').click();
    await expect(page).toHaveURL(/\?area=conteudo&vista=tipos&tipo=video$/);
    await expect(contentTabs(page)).toHaveCount(1);
    await expect(area.getByRole('link', { name: 'Voltar aos tipos' })).toHaveAttribute(
      'href',
      /\?area=conteudo&vista=tipos#tipo-video$/,
    );
    await expect(area.locator('#tipo-video').getByRole('link')).toHaveCount(0);
    const cards = postCards(area);
    await expect(cards).toHaveCount(10);
    await expect(area.getByText('e mais 8 publicações', { exact: true })).toBeVisible();
    const first = cards.first().locator('[id^="post-"]');
    const id = await first.getAttribute('id');
    await first.getByRole('link').click();
    await expect(page).toHaveURL(new RegExp(`&vista=tipos&tipo=video&post=${id?.slice(5)}$`));
    expect(await backLink(page).getAttribute('href')).toMatch(
      new RegExp(`&vista=tipos&tipo=video#${id}$`),
    );

    await page.goto(`${CONTENT_AREA}&vista=tipos&tipo=story`);
    await expect(postCards(area)).toHaveCount(10);
    await expect(area.getByText('e mais 6 publicações', { exact: true })).toBeVisible();
  });

  test('Publicações: the 61 posts best first, 10 cards and one example pill', async ({ page }) => {
    await page.goto(`${CONTENT_AREA}&vista=publicacoes`);
    const area = ownerArea(page);
    const cards = postCards(area);
    await expect(cards).toHaveCount(10);
    await expect(area.getByText('e mais 51 publicações', { exact: true })).toBeVisible();
    await expect(area.getByRole('button', { name: 'Ver todas' })).toBeDisabled();
    await expect(area.getByText('exemplo', { exact: true })).toHaveCount(1);
    for (let i = 0; i < 10; i += 1) {
      await expect(cards.nth(i).getByText('exemplo', { exact: true })).toHaveCount(0);
    }
    const totals: number[] = [];
    for (let i = 0; i < 10; i += 1) {
      const likes = await cardCount(cards.nth(i), 'likes');
      const comments = await cardCount(cards.nth(i), 'comments');
      totals.push(likes + comments);
    }
    expect([...totals].sort((a, b) => b - a)).toEqual(totals);
    await expect(cards.first()).toContainText('Como organizar a agenda');
    await expect(cards.first()).toContainText('22/09 · Geral · Vídeo');

    // Quick 261013-orf E-01: the compact card — the cover thumbnail at the feed's ratio on the
    // left, the four numbers named for screen readers, the whole card one link, no "Ver publicação".
    const first = cards.first();
    const thumb = first.locator('[data-testid="cover-thumb"]');
    await expect(thumb).toHaveCount(1);
    await expect(thumb).toHaveAttribute('aria-hidden', 'true');
    await expect(thumb).toHaveAttribute('data-ratio', '0.5625');
    expect(Math.abs((await boxRatio(thumb)) - 9 / 16)).toBeLessThanOrEqual(0.02);
    expect((await thumb.boundingBox())?.height ?? 0).toBeCloseTo(112, 0);
    await expect(first.locator('.sr-only')).toHaveText([
      /^\s*curtidas$/,
      /^\s*comentários$/,
      /^\s*salvamentos$/,
      /^\s*compartilhamentos$/,
    ]);
    await expect(first.getByRole('link')).toHaveCount(1);
    await expect(area.getByText('Ver publicação')).toHaveCount(0);
    await expect(area.locator('[data-testid="content-cover"]')).toHaveCount(0);
  });

  test('the tracer: a publication, who liked it, a member, a list and back', async ({ page }) => {
    await page.goto(`${CONTENT_AREA}&vista=publicacoes`);
    const area = ownerArea(page);
    await area.locator('#post-op-11').getByRole('link').click();
    await expect(page).toHaveURL(/\?area=conteudo&vista=publicacoes&post=op-11$/);
    await expect(contentTabs(page)).toHaveCount(0);
    await expect(area.getByRole('heading', { level: 3 }).first()).toHaveText(
      'Bastidores: como eu preparo o conteúdo da semana',
    );
    expect(Math.abs((await coverRatio(area)) - 9 / 16)).toBeLessThanOrEqual(0.02);
    await expect(area.getByText('127 interações', { exact: true })).toBeVisible();
    await expect(area.getByText('1,3× a média dos vídeos', { exact: true })).toBeVisible();

    const likes = area.locator('#quem-curtidas');
    const value = await numberIn(likes);
    expect(value).toBe(96);
    await likes.click();
    await expect(page).toHaveURL(/&post=op-11&quem=curtidas$/);
    await expect(area.getByRole('heading', { name: 'Quem curtiu' })).toBeVisible();
    await expect(
      area.getByText(new RegExp(`^${value} curtidas · mais recentes primeiro$`)),
    ).toBeVisible();
    const rows = area.getByRole('listitem');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(10);
    await expect(area.getByText(`e mais ${value - count} curtidas`, { exact: true })).toBeVisible();
    await expect(rows.first()).toContainText('Faixa:');

    const card = rows.first().getByRole('link');
    const name = (await card.locator('.text-lg').innerText()).trim();
    const memberHref = (await card.getAttribute('href')) ?? '';
    const member = /membro=(om-\d\d)$/.exec(memberHref)?.[1];
    expect(member).toBeDefined();
    await card.click();
    await expect(page).toHaveURL(new RegExp(`&quem=curtidas&membro=${member}$`));
    await expect(area.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
    await expect(area.getByRole('heading', { name: 'Últimos 30 dias' })).toBeVisible();

    await area.locator('#insight-curtidas').click();
    await expect(page).toHaveURL(new RegExp(`&membro=${member}&lista=curtidas$`));
    await expect(
      area.getByRole('heading', { level: 3, name: 'Curtidas', exact: true }),
    ).toBeVisible();
    await expect(area.getByText(`${name} · últimos 30 dias`, { exact: true })).toBeVisible();

    const steps = [
      new RegExp(`&post=op-11&quem=curtidas&membro=${member}#insight-curtidas$`),
      new RegExp(`&post=op-11&quem=curtidas#membro-${member}$`),
      /&vista=publicacoes&post=op-11#quem-curtidas$/,
      /\?area=conteudo&vista=publicacoes#post-op-11$/,
    ];
    for (const step of steps) {
      expect(await backLink(page).getAttribute('href')).toMatch(step);
      await backLink(page).click();
      await expect(page).toHaveURL(step);
    }
    await expect(contentTabs(page).getByRole('link', { name: 'Publicações' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('covers take the feed ratio; a text post has none', async ({ page }) => {
    const cases: [string, number | null][] = [
      ['&vista=publicacoes&post=op-41', 9 / 16],
      ['&vista=publicacoes&post=op-37', 16 / 9],
      ['&vista=publicacoes&post=op-18', 4 / 5],
      ['&vista=publicacoes&post=op-23', 16 / 9],
      ['&vista=tipos&tipo=story&post=os-01', 9 / 16],
      ['&vista=publicacoes&post=op-19', null],
    ];
    for (const [query, ratio] of cases) {
      await page.goto(`${CONTENT_AREA}${query}`);
      const covers = ownerArea(page).locator('[data-testid="content-cover"]');
      if (ratio === null) {
        await expect(covers, query).toHaveCount(0);
        await expect(ownerArea(page).getByText('60 interações', { exact: true })).toBeVisible();
        continue;
      }
      await expect(covers, query).toHaveCount(1);
      expect(Math.abs((await coverRatio(ownerArea(page))) - ratio), query).toBeLessThanOrEqual(
        0.02,
      );
    }
    await page.goto(`${CONTENT_AREA}&vista=tipos&tipo=texto`);
    await expect(postCards(ownerArea(page))).toHaveCount(10);
    await expect(ownerArea(page).locator('[data-testid="content-cover"]')).toHaveCount(0);
    // Quick 261013-orf E-01: a text post's card thumbnail is a square with the text icon.
    const textThumbs = ownerArea(page).locator('[data-testid="cover-thumb"]');
    await expect(textThumbs).toHaveCount(10);
    for (const ratio of await textThumbs.evaluateAll((els) =>
      els.map((el) => el.getAttribute('data-ratio')),
    )) {
      expect(ratio).toBe('1');
    }
  });

  for (const width of PHONE_WIDTHS) {
    test(`a landscape video card never breaks at ${width}px (quick 261013-uoi F-3)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`${CONTENT_AREA}&vista=tipos&tipo=video`);
      const cards = postCards(ownerArea(page));
      await expect(cards).toHaveCount(10);
      const metrics = await cards.evaluateAll((els) =>
        els.map((el) => {
          const title = el.querySelector('.line-clamp-2');
          const text = title?.parentElement;
          const lineHeight = title ? Number.parseFloat(getComputedStyle(title).lineHeight) : 0;
          return {
            ratio: el.querySelector('[data-testid="cover-thumb"]')?.getAttribute('data-ratio'),
            titleHeight: title?.getBoundingClientRect().height ?? 0,
            lineHeight,
            textWidth: text?.getBoundingClientRect().width ?? 0,
            countTops: [...el.querySelectorAll('[data-count]')].map(
              (count) => count.getBoundingClientRect().top,
            ),
          };
        }),
      );
      expect(metrics.some((card) => Number(card.ratio) > 1)).toBe(true);
      const widths = metrics.map((card) => card.textWidth);
      for (const [i, card] of metrics.entries()) {
        expect(card.titleHeight, `card ${i}`).toBeLessThanOrEqual(2 * card.lineHeight + 1);
        expect(card.countTops, `card ${i}`).toHaveLength(4);
        const tops = card.countTops;
        expect(Math.max(...tops) - Math.min(...tops), `card ${i}`).toBeLessThanOrEqual(2);
      }
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
      const { scrollWidth, clientWidth } = await horizontalOverflow(page);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }

  test('the detail cover has no grey band and a disabled Assistir on videos', async ({ page }) => {
    // Quick 261013-orf E-01: the sides are the brand gradient darkened; ▶ is a preview action.
    for (const [query, playable] of [
      ['&vista=publicacoes&post=op-41', true],
      ['&vista=tipos&tipo=story&post=os-01', true],
      ['&vista=publicacoes&post=op-18', false],
    ] as const) {
      await page.goto(`${CONTENT_AREA}${query}`);
      const cover = ownerArea(page).locator('[data-testid="content-cover"]');
      const wrapper = cover.locator('..');
      expect(await wrapper.evaluate((el) => getComputedStyle(el).backgroundImage), query).toContain(
        'gradient',
      );
      const watch = ownerArea(page).getByRole('button', { name: 'Assistir' });
      await expect(watch, query).toHaveCount(playable ? 1 : 0);
      if (playable) {
        await expect(watch, query).toBeDisabled();
        await expect(watch, query).toHaveAttribute('aria-describedby', 'dashboard-preview-note');
      }
    }
  });
});

/** The six overview numbers (D-02): slug, label, value, delta text and the list's count line. */
const CONTENT_NUMBERS: {
  slug: string;
  label: string;
  value: string;
  delta: string;
  count: RegExp;
}[] = [
  {
    slug: 'publicacoes',
    label: 'Publicações',
    value: '61',
    delta: '5 vs. 30 dias antes',
    count: /^61 publicações · mais recentes primeiro$/,
  },
  {
    slug: 'interacoes',
    label: 'Interações',
    value: '3.940',
    delta: '9% vs. 30 dias antes',
    count: /^3\.940 interações · mais recentes primeiro$/,
  },
  {
    slug: 'taxa',
    label: 'Taxa de engajamento',
    value: '16,8%',
    delta: '1 p.p. vs. 30 dias antes',
    count: /^Taxa de engajamento de 16,8% · maior taxa primeiro$/,
  },
  {
    slug: 'membros',
    label: 'Membros que interagiram',
    value: '428',
    delta: '4% vs. 30 dias antes',
    count: /^428 membros · mais recentes primeiro$/,
  },
  {
    slug: 'visualizacoes',
    label: 'Visualizações',
    value: '39.727',
    delta: '6% vs. 30 dias antes',
    count: /^39\.727 visualizações · mais vistas primeiro$/,
  },
  {
    slug: 'alcance',
    label: 'Alcance por publicação',
    value: '385',
    delta: '6% vs. 30 dias antes',
    count: /^385 membros alcançados por publicação, em média · maior alcance primeiro$/,
  },
];

/** The bands with interactors (quick 261013-orf E-03.3): em risco and inativos are one static line. */
const CONTENT_BANDS: [string, string][] = [
  ['Novos', '41 membros · 43% da faixa'],
  ['Superfãs', '62 membros · 100% da faixa'],
  ['Engajados', '189 membros · 92% da faixa'],
  ['Ocasionais', '136 membros · 91% da faixa'],
];

const IDLE_BANDS_LINE =
  'Em risco e Inativos: ninguém curtiu nem comentou em 30 dias, e é isso que define essas faixas.';

function interactsSection(page: Page) {
  return sectionTitled(ownerArea(page), 'Quem interage, por faixa');
}

test.describe('dono-do-cliente conteudo: Visão geral', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('the seven blocks in order, no Canais', async ({ page }) => {
    await page.goto(CONTENT_AREA);
    const area = ownerArea(page);
    const titles = [
      'Resumo do mês',
      'Precisa de atenção',
      'Tendência de 12 semanas',
      'Melhores publicações',
      'Melhor dia e horário',
      'Quem interage, por faixa',
      'Próximos passos',
    ];
    expect(await area.getByRole('heading', { level: 3 }).allTextContents()).toEqual(titles);
    await expect(area.getByText('Onde os membros interagem')).toHaveCount(0);

    for (const number of CONTENT_NUMBERS) {
      const kpi = area.locator(`#numero-${number.slug}`);
      await expect(kpi.locator('span').first(), number.slug).toHaveText(number.label);
      await expect(kpi.locator('span.text-2xl'), number.slug).toHaveText(number.value);
      await expect(kpi, number.slug).toContainText(number.delta);
      await expect(kpi, number.slug).toContainText('Ver lista');
    }
    for (const slug of ['taxa', 'visualizacoes', 'alcance']) {
      await expect(
        area.locator(`#numero-${slug}`).getByText('exemplo', { exact: true }),
      ).toHaveCount(1);
    }
    for (const slug of ['publicacoes', 'interacoes', 'membros']) {
      await expect(
        area.locator(`#numero-${slug}`).getByText('exemplo', { exact: true }),
      ).toHaveCount(0);
    }

    const attention = sectionTitled(area, 'Precisa de atenção').getByRole('link');
    await expect(attention).toHaveCount(4);
    await expect(attention.first()).toContainText(
      '2 comentários sem resposta · o mais antigo há 10 dias',
    );
    await expect(attention.nth(1)).toContainText(
      '9 comentários sem resposta · o mais antigo há 8 dias',
    );
    await expect(attention.nth(1)).toContainText('Um lembrete gentil: constância não é perfeição');

    const trend = sectionTitled(area, 'Tendência de 12 semanas');
    await expect(trend.getByRole('img')).toHaveCount(1);
    await expect(trend.locator('[data-series="previous"]')).toHaveCount(1);

    const best = sectionTitled(area, 'Melhores publicações');
    await expect(postCards(best)).toHaveCount(3);
    await expect(best.getByText('exemplo', { exact: true })).toHaveCount(1);
    await expect(best.getByRole('link', { name: 'Ver todas as publicações' })).toHaveAttribute(
      'href',
      /\?area=conteudo&vista=publicacoes$/,
    );

    const heat = sectionTitled(area, 'Melhor dia e horário');
    await expect(heat.locator('[data-heat-cell]')).toHaveCount(28);
    await expect(heat.locator('[data-solid]')).toHaveCount(1);
    const thu = heat.locator('[data-heat-cell="thu-20"]');
    await expect(thu).toHaveAttribute('data-solid', '');
    await expect(thu.locator('[aria-hidden]')).toHaveText('100');
    await expect(thu).toContainText('Quinta, 20h–22h: 100 por publicação (4 publicações)');
    await expect(heat.locator('[data-heat-cell="sun-7"] [aria-hidden]')).toHaveText('39');
    await expect(heat).toContainText('Melhor: quinta, 20h–22h, com 100 interações por publicação.');

    await expect(interactsSection(page).locator('details')).toHaveCount(CONTENT_BANDS.length);
    for (const [label, summary] of CONTENT_BANDS) {
      const details = bandDetails(interactsSection(page), label);
      await expect(details, label).toHaveCount(1);
      await expect(details, label).not.toHaveAttribute('open');
      await expect(details.locator('summary'), label).toContainText(summary);
      // The Membros mini bar, decorative.
      await expect(details.locator('summary span[aria-hidden].w-16'), label).toHaveCount(1);
    }
    for (const label of ['Em risco', 'Inativos']) {
      await expect(bandDetails(interactsSection(page), label), label).toHaveCount(0);
    }
    const idle = interactsSection(page).getByText(IDLE_BANDS_LINE, { exact: true });
    await expect(idle).toBeVisible();
    await expect(idle.locator('xpath=ancestor-or-self::a')).toHaveCount(0);

    const next = sectionTitled(area, 'Próximos passos');
    await expect(next.getByRole('button')).toHaveCount(3);
    for (const button of await next.getByRole('button').all()) await expect(button).toBeDisabled();
    await expect(next).toContainText(
      '18 comentários sem resposta há mais de 24 h, em 4 publicações.',
    );
  });

  test('each number opens its list, whose count repeats it, and Voltar returns', async ({
    page,
  }) => {
    const area = ownerArea(page);
    for (const number of CONTENT_NUMBERS) {
      await page.goto(CONTENT_AREA);
      await area.locator(`#numero-${number.slug}`).click();
      await expect(page, number.slug).toHaveURL(
        new RegExp(`\\?area=conteudo&numero=${number.slug}$`),
      );
      await expect(contentTabs(page), number.slug).toHaveCount(0);
      await expect(
        area.getByRole('heading', { level: 3, name: number.label, exact: true }),
        number.slug,
      ).toBeVisible();
      await expect(area.getByText(number.count), number.slug).toBeVisible();
      if (['taxa', 'visualizacoes', 'alcance', 'publicacoes'].includes(number.slug)) {
        await expect(postCards(area), number.slug).toHaveCount(10);
        await expect(area.getByText('Membro desde:'), number.slug).toHaveCount(0);
        await expect(area.getByText('exemplo', { exact: true }), number.slug).toHaveCount(1);
      }
      if (number.slug === 'membros') {
        await expect(area.getByRole('listitem').first()).toContainText('Faixa:');
        await expect(area.getByText('e mais 418 membros', { exact: true })).toBeVisible();
      }
      if (number.slug === 'interacoes') {
        await expect(area.getByRole('listitem')).toHaveCount(10);
        await expect(area.getByText('e mais 3.930 interações', { exact: true })).toBeVisible();
      }
      expect(await backLink(page).getAttribute('href'), number.slug).toMatch(
        new RegExp(`\\?area=conteudo#numero-${number.slug}$`),
      );
      await backLink(page).click();
      await expect(area.locator(`#numero-${number.slug}`), number.slug).toBeInViewport();
    }
  });

  test('an interaction opens its publication; a views card never opens people', async ({
    page,
  }) => {
    const area = ownerArea(page);
    await page.goto(`${CONTENT_AREA}&numero=interacoes`);
    const row = area.getByRole('listitem').first().getByRole('link');
    const href = (await row.getAttribute('href')) ?? '';
    expect(href).toMatch(/\?area=conteudo&numero=interacoes&post=op-\d\d$/);
    await row.click();
    await expect(area.locator('#quem-curtidas')).toBeVisible();
    expect(await backLink(page).getAttribute('href')).toMatch(
      /\?area=conteudo&numero=interacoes#post-op-\d\d$/,
    );

    await page.goto(`${CONTENT_AREA}&numero=visualizacoes`);
    const first = postCards(area).first().getByRole('link');
    expect(await first.getAttribute('href')).toMatch(/&numero=visualizacoes&post=op-\d\d$/);
  });

  test('a band opens its members, a member the insights, Voltar reopens the band', async ({
    page,
  }) => {
    await page.goto(CONTENT_AREA);
    const engaged = bandDetails(interactsSection(page), 'Engajados');
    await engaged.locator('summary').click();
    await expect(engaged.getByRole('listitem')).toHaveCount(10);
    await expect(engaged.getByText('e mais 179 membros', { exact: true })).toBeVisible();
    const card = engaged.getByRole('listitem').first().getByRole('link');
    const name = (await card.locator('.text-lg').innerText()).trim();
    await card.click();
    await expect(page).toHaveURL(/\?area=conteudo&faixa=engajados&membro=om-\d\d$/);
    const area = ownerArea(page);
    await expect(area.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
    await expect(area.getByRole('heading', { name: 'Últimos 30 dias' })).toBeVisible();
    const back = await backLink(page).getAttribute('href');
    expect(back).toMatch(/\?area=conteudo&faixa=engajados#membro-om-\d\d$/);
    await backLink(page).click();
    const reopened = bandDetails(interactsSection(page), 'Engajados');
    await expect(reopened).toHaveAttribute('open');
    await expect(reopened.getByRole('listitem').first()).toContainText(name);
    await expect(contentTabs(page)).toHaveCount(1);
  });

  test('an attention row opens its unanswered comments, and Voltar returns to it', async ({
    page,
  }) => {
    // Quick 261013-orf E-02.
    await page.goto(CONTENT_AREA);
    const area = ownerArea(page);
    const row = area.locator('#atencao-op-24');
    await expect(row.locator('[data-testid="cover-thumb"]')).toHaveCount(1);
    await expect(row.locator('[data-testid="cover-thumb"]')).toHaveAttribute('aria-hidden', 'true');
    await row.click();
    await expect(page).toHaveURL(/\?area=conteudo&responder=op-24$/);
    await expect(contentTabs(page)).toHaveCount(0);
    await expect(
      area.getByRole('heading', { level: 3, name: 'Comentários sem resposta', exact: true }),
    ).toBeVisible();
    await expect(
      area.getByText('Dica rápida: uma lista curta vale mais que uma longa'),
    ).toBeVisible();
    await expect(
      area.getByText('2 comentários sem resposta · o mais antigo há 10 dias', { exact: true }),
    ).toBeVisible();
    const comments = area.getByRole('listitem');
    await expect(comments).toHaveCount(2);
    await expect(comments.first()).toContainText('Comentou há 10 dias');
    const reply = comments.first().getByRole('button', { name: 'Responder' });
    await expect(reply).toBeDisabled();
    await expect(reply).toHaveAttribute('aria-describedby', 'dashboard-preview-note');

    expect(await backLink(page).getAttribute('href')).toMatch(/\?area=conteudo#atencao-op-24$/);
    await backLink(page).click();
    await expect(page).toHaveURL(/\?area=conteudo#atencao-op-24$/);
    await expect(area.locator('#atencao-op-24')).toBeInViewport();

    await page.goto(`${CONTENT_AREA}&responder=op-19`);
    await expect(area.getByRole('listitem')).toHaveCount(9);
    for (const query of ['&responder=op-11', '&responder=xyz']) {
      await page.goto(`${CONTENT_AREA}${query}`);
      await expect(area.locator('#numero-publicacoes'), query).toBeVisible();
      await expect(
        area.getByRole('heading', { name: 'Comentários sem resposta', exact: true }),
        query,
      ).toHaveCount(0);
    }
    await page.goto(`${CONTENT_AREA}&numero=interacoes&responder=op-24`);
    await expect(
      area.getByRole('heading', { level: 3, name: 'Interações', exact: true }),
    ).toBeVisible();
    await expect(
      area.getByRole('heading', { name: 'Comentários sem resposta', exact: true }),
    ).toHaveCount(0);
  });

  test('the unanswered screen header opens the publication, whose Voltar lands on its row (quick 261013-uoi F-7)', async ({
    page,
  }) => {
    const area = ownerArea(page);
    await page.goto(`${CONTENT_AREA}&responder=op-19`);
    expect(await backLink(page).getAttribute('href')).toMatch(/\?area=conteudo#atencao-op-19$/);
    const header = area.locator('a[href$="?area=conteudo&post=op-19"]');
    await expect(header).toHaveCount(1);
    await expect(header.locator('[data-testid="cover-thumb"]')).toHaveCount(1);
    await header.click();
    await expect(page).toHaveURL(/\?area=conteudo&post=op-19$/);
    await expect(
      area.getByRole('heading', {
        level: 3,
        name: 'Um lembrete gentil: constância não é perfeição',
      }),
    ).toBeVisible();
    await expect(
      area.getByRole('heading', { level: 4, name: 'Interações', exact: true }),
    ).toBeVisible();
    expect(await backLink(page).getAttribute('href')).toMatch(/\?area=conteudo#atencao-op-19$/);
    await backLink(page).click();
    await expect(page).toHaveURL(/\?area=conteudo#atencao-op-19$/);
    await expect(area.locator('#atencao-op-19')).toBeInViewport();
  });

  test('the overview never repeats an anchor id', async ({ page }) => {
    // Quick 261013-orf E-03.10: an attention row is `atencao-`, a card `post-`.
    await page.goto(CONTENT_AREA);
    const ids = await ownerArea(page)
      .locator('[id^="post-"], [id^="atencao-"]')
      .evaluateAll((els) => els.map((el) => el.id));
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('the bands with interactors open, without repeating the band on each card', async ({
    page,
  }) => {
    // Quick 261013-orf E-03.3.
    await page.goto(`${CONTENT_AREA}&faixa=superfas`);
    const superfans = bandDetails(interactsSection(page), 'Superfãs');
    await expect(superfans).toHaveAttribute('open');
    await expect(superfans.getByRole('listitem').first()).toBeVisible();
    await expect(superfans.getByText('Faixa:')).toHaveCount(0);
    await expect(superfans.getByRole('listitem').first()).toContainText(
      /Interagiu (hoje|ontem|há)/,
    );
  });

  test('Interações: one publication thumbnail per row, the person first', async ({ page }) => {
    // Quick 261013-orf D-01.
    await page.goto(`${CONTENT_AREA}&numero=interacoes`);
    const area = ownerArea(page);
    const rows = area.getByRole('listitem');
    await expect(rows).toHaveCount(10);
    await expect(area.locator('li [data-testid="cover-thumb"]')).toHaveCount(10);
    await expect(
      area.locator('li [data-testid="cover-thumb"]:not([aria-hidden="true"])'),
    ).toHaveCount(0);
    // The thumbnail (a video's length included) is aria-hidden: the link's name starts with the person.
    const name = (await rows.first().locator('span.text-sm.font-bold').first().innerText()).trim();
    expect(name.length).toBeGreaterThan(0);
    await expect(rows.first().getByRole('link')).toHaveAccessibleName(new RegExp(`^${name}`));
  });

  test('a forged overview URL falls one level up', async ({ page }) => {
    const area = ownerArea(page);
    for (const query of ['&numero=xyz', '&faixa=em-risco', '&faixa=xyz', '&numero=MEMBROS']) {
      await page.goto(`${CONTENT_AREA}${query}`);
      await expect(area.locator('#numero-publicacoes'), query).toBeVisible();
      await expect(backLink(page), query).toHaveCount(0);
      await expect(interactsSection(page).locator('details[open]'), query).toHaveCount(0);
    }
    await page.goto(`${CONTENT_AREA}&numero=membros&post=op-11`);
    await expect(area.getByText(/^428 membros · mais recentes primeiro$/)).toBeVisible();
    await page.goto(`${CONTENT_AREA}&faixa=superfas&membro=om-49`);
    await expect(area.locator('#numero-publicacoes')).toBeVisible();
    await expect(bandDetails(interactsSection(page), 'Superfãs')).toHaveAttribute('open');
    await expect(area.getByRole('heading', { name: 'Últimos 30 dias' })).toHaveCount(0);
  });
});

const CONTENT_OVERVIEW_VIEWS = [
  '',
  '&faixa=engajados',
  '&responder=op-19',
  ...CONTENT_NUMBERS.map((number) => `&numero=${number.slug}`),
];

for (const width of PHONE_WIDTHS) {
  test(`dono-do-cliente conteudo: the overview and its lists at ${width}px, no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const query of CONTENT_OVERVIEW_VIEWS) {
      await page.goto(`${CONTENT_AREA}${query}`);
      await expect(ownerArea(page), query).toBeVisible();
      await openAllDetails(page);
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth, query).toBeLessThanOrEqual(overflow.clientWidth);
    }
  });
}

test('dono-do-cliente conteudo: the overview and its lists at 1440x900, inside the phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const query of CONTENT_OVERVIEW_VIEWS) {
    await page.goto(`${CONTENT_AREA}${query}`);
    await expect(page.getByText('9:41', { exact: true })).toBeVisible();
    await openAllDetails(page);
    const metrics = await screenMetrics(page);
    expect(metrics.scrollWidth, query).toBeLessThanOrEqual(metrics.clientWidth);
    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth, query).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.scrollHeight, query).toBeLessThanOrEqual(overflow.clientHeight + 1);
    await expect(page.locator('[data-phone-screen]').locator('table:visible'), query).toHaveCount(
      0,
    );
  }
});

const DETAIL_TITLES = [
  'Interações',
  'Primeiras 48 horas',
  'Quem a publicação alcançou, por faixa',
  'O que só o app sabe',
  'Comentários',
];

function detailSection(page: Page, title: string) {
  return sectionTitled(ownerArea(page), title);
}

test.describe('dono-do-cliente conteudo: the publication detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('a video shows every section, in order, and its sales from 5 orders', async ({ page }) => {
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-11`);
    const area = ownerArea(page);
    const ys: number[] = [];
    for (const title of [...DETAIL_TITLES, 'Retenção do vídeo']) {
      const heading = area.getByRole('heading', { name: title, exact: true });
      await expect(heading, title).toHaveCount(1);
      ys.push((await heading.boundingBox())?.y ?? Number.NaN);
    }
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
    await expect(area.getByText('Recomendação', { exact: true })).toBeVisible();
    await expect(area.getByRole('button', { name: 'Enviar push' })).toBeDisabled();
    await expect(area.getByRole('heading', { name: 'Toques no story' })).toHaveCount(0);

    const app = detailSection(page, 'O que só o app sabe');
    await expect(app).toContainText(/R\$\s?502,00/);
    await expect(app).toContainText('6 pedidos');
    await expect(app).toContainText('Live de dúvidas, 15/10: 21 inscritos');
    await expect(app).toContainText('Não quer dizer que a publicação causou.');
    await expect(detailSection(page, 'Primeiras 48 horas').getByRole('img')).toHaveCount(1);
    await expect(
      detailSection(page, 'Retenção do vídeo').getByText('exemplo', { exact: true }),
    ).toHaveCount(1);

    // P3: who was reached is totals only, and no reach or views number is a link.
    await expect(
      detailSection(page, 'Quem a publicação alcançou, por faixa').getByRole('link'),
    ).toHaveCount(0);
    const links = await area
      .getByRole('link')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
    expect(links.some((href) => /quem=(visualizacoes|alcance)/.test(href))).toBe(false);
  });

  test('the 41 s video reads its retention in video time and its RSVPs as inscritos', async ({
    page,
  }) => {
    // Quick 261013-orf E-03.5 and E-03.6.
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-41`);
    const chart = detailSection(page, 'Retenção do vídeo').getByRole('img');
    expect(
      (await chart.locator('[data-x-label]').allTextContents()).map((text) => text.trim()),
    ).toEqual(['0:00', '0:20', '0:41']);
    const app = detailSection(page, 'O que só o app sabe');
    await expect(app).toContainText('Inscritos em eventos nos 7 dias seguintes');
    await expect(app).toContainText('Workshop, 01/10: 11 inscritos');
  });

  test('says "por publicação", and an opened type has one example sentence', async ({ page }) => {
    // Quick 261013-orf E-03.9.
    for (const query of ['', '&vista=tipos', '&vista=tipos&tipo=video']) {
      await page.goto(`${CONTENT_AREA}${query}`);
      await expect(ownerArea(page).getByText(/por post\b/), query).toHaveCount(0);
    }
    await expect(ownerArea(page).getByText('exemplo', { exact: true })).toHaveCount(1);
    await expect(
      ownerArea(page).getByText(
        'Métrica do tipo, salvamentos e compartilhamentos: valores de exemplo',
      ),
    ).toBeVisible();
    await page.goto(`${CONTENT_AREA}&vista=tipos&tipo=texto`);
    await expect(
      ownerArea(page).getByText(/^Salvamentos e compartilhamentos: valores de exemplo/),
    ).toBeVisible();
    await page.goto(`${CONTENT_AREA}&vista=tipos&tipo=story`);
    await expect(
      ownerArea(page).getByText('Métrica do tipo e compartilhamentos: valores de exemplo'),
    ).toBeVisible();
  });

  test('sales under 5 orders show no value; the shop window shows its subscriptions', async ({
    page,
  }) => {
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-19`);
    const app = detailSection(page, 'O que só o app sabe');
    await expect(app).toContainText('menos de 5 pedidos');
    await expect(app).not.toContainText('R$');
    await expect(detailSection(page, 'Comentários')).toContainText(
      '9 sem resposta · o mais antigo há 8 dias',
    );

    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-15`);
    await expect(detailSection(page, 'O que só o app sabe')).toContainText(
      'Assinaturas da Comunidade VIP enquanto era a vitrine',
    );
    await expect(detailSection(page, 'O que só o app sabe')).toContainText(/R\$\s?1\.182,00/);
  });

  test('a story shows its taps, a text post neither taps nor retention', async ({ page }) => {
    const area = ownerArea(page);
    await page.goto(`${CONTENT_AREA}&vista=tipos&tipo=story&post=os-02`);
    await expect(area.getByRole('heading', { name: 'Toques no story' })).toBeVisible();
    await expect(area.getByRole('heading', { name: 'Retenção do vídeo' })).toHaveCount(0);
    await expect(area.locator('#quem-salvamentos')).toHaveCount(0);
    await expect(
      detailSection(page, 'Quem a publicação alcançou, por faixa').getByText('exemplo', {
        exact: true,
      }),
    ).toHaveCount(0);

    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-19`);
    await expect(area.getByRole('heading', { name: 'Toques no story' })).toHaveCount(0);
    await expect(area.getByRole('heading', { name: 'Retenção do vídeo' })).toHaveCount(0);
  });

  test('each interaction number opens who did it, with that number first', async ({ page }) => {
    const area = ownerArea(page);
    for (const slug of ['curtidas', 'comentarios', 'salvamentos', 'compartilhamentos']) {
      await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-11`);
      const kpi = area.locator(`#quem-${slug}`);
      const value = await numberIn(kpi);
      await kpi.click();
      await expect(page, slug).toHaveURL(new RegExp(`&post=op-11&quem=${slug}$`));
      await expect(
        area.getByText(
          new RegExp(
            `^${value} .* · (mais recentes primeiro|sem resposta primeiro, depois os mais recentes)$`,
          ),
        ),
        slug,
      ).toBeVisible();
    }
  });

  test('a people card says when; "e mais" counts in the list unit; zero reads "nenhum"', async ({
    page,
  }) => {
    // Quick 261013-orf E-03.2, E-03.7, E-03.8.
    const area = ownerArea(page);
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-11&quem=curtidas`);
    await expect(area.getByRole('listitem').first()).toContainText(
      /Curtiu (hoje|ontem|há \d+ dias)/,
    );
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-11&quem=comentarios`);
    await expect(
      area.getByText(/^31 comentários · sem resposta primeiro, depois os mais recentes$/),
    ).toBeVisible();
    const cards = await area.getByRole('listitem').count();
    await expect(area.getByText(`e mais ${31 - cards} comentários`, { exact: true })).toBeVisible();
    await expect(area.getByRole('listitem').first()).toContainText(/Comentou (hoje|ontem|há)/);
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-57&quem=compartilhamentos`);
    await expect(area.getByText(/^nenhum compartilhamento · /)).toBeVisible();
  });

  test('a list shorter than its number says it shows the members sample (quick 261013-uoi)', async ({
    page,
  }) => {
    const area = ownerArea(page);
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-11&quem=comentarios`);
    const cards = await area.getByRole('listitem').count();
    expect(cards).toBeGreaterThanOrEqual(1);
    expect(cards).toBeLessThanOrEqual(10);
    await expect(
      area.getByText('Mostrando quem está na amostra de membros.', { exact: true }),
    ).toBeVisible();
    await expect(area.getByText(`e mais ${31 - cards} comentários`, { exact: true })).toBeVisible();
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-11&quem=curtidas`);
    await expect(area.getByRole('listitem').first()).toContainText(
      /Curtiu (hoje às \d{2}:\d{2}|há )/,
    );
  });

  test('the oldest unanswered comment sits exactly at its wait (quick 261013-uoi C-3)', async ({
    page,
  }) => {
    const area = ownerArea(page);
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-04&quem=comentarios`);
    const first = area.getByRole('listitem').first();
    await expect(first).toContainText('Sem resposta');
    await expect(first).toContainText('Comentou hoje às 14:00');
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-04`);
    await expect(
      area.getByText('1 sem resposta · o mais antigo há 9 h', { exact: true }),
    ).toBeVisible();
  });

  test('the commenters put the unanswered first', async ({ page }) => {
    // Quick 261013-uoi: op-24 holds answered commenters after its unanswered ones (op-12's roster
    // commenters are now all unanswered).
    await page.goto(`${CONTENT_AREA}&vista=publicacoes&post=op-24&quem=comentarios`);
    const rows = ownerArea(page).getByRole('listitem');
    await expect(rows.first()).toContainText('Sem resposta');
    const flags = await rows.evaluateAll((els) =>
      els.map((el) => (el.textContent ?? '').includes('Sem resposta')),
    );
    expect(flags.indexOf(false)).toBeGreaterThan(0);
    expect(flags.slice(flags.indexOf(false)).some(Boolean)).toBe(false);
  });

  test('views and reach never open people, and forged values fall one level up', async ({
    page,
  }) => {
    const area = ownerArea(page);
    const detail = `${CONTENT_AREA}&vista=publicacoes&post=op-11`;
    for (const quem of ['visualizacoes', 'alcance', 'xyz']) {
      await page.goto(`${detail}&quem=${quem}`);
      await expect(area.locator('#quem-curtidas'), quem).toBeVisible();
    }
    await page.goto(`${detail}&quem=curtidas`);
    const href =
      (await area.getByRole('listitem').first().getByRole('link').getAttribute('href')) ?? '';
    const liker = /membro=(om-\d\d)$/.exec(href)?.[1] ?? '';
    const cases: [string, Locator][] = [
      [`${CONTENT_AREA}&vista=xyz`, area.locator('#numero-publicacoes')],
      [`${CONTENT_AREA}&vista=tipos&tipo=xyz`, area.locator('#tipo-video').getByRole('link')],
      [
        `${CONTENT_AREA}&vista=tipos&tipo=video&post=op-15`,
        area.getByRole('link', { name: 'Voltar aos tipos' }),
      ],
      [
        `${CONTENT_AREA}&vista=tipos&tipo=story&post=op-11`,
        area.getByRole('link', { name: 'Voltar aos tipos' }),
      ],
      [`${CONTENT_AREA}&vista=publicacoes&post=xyz`, area.getByText('e mais 51 publicações')],
      [`${detail}&quem=curtidas&membro=om-60`, area.getByRole('heading', { name: 'Quem curtiu' })],
      [
        `${detail}&quem=curtidas&membro=${liker}&lista=xyz`,
        area.getByRole('heading', { name: 'Últimos 30 dias' }),
      ],
      [`${detail}&membro=${liker}`, area.locator('#quem-curtidas')],
    ];
    for (const [url, shows] of cases) {
      const response = await page.goto(url);
      expect(response?.status(), url).toBe(200);
      await expect(shows, url).toBeVisible();
    }
  });
});

// smaug-ignore test-weakening: the regex literal hides the expects below from the gate's parser
test('dono-do-cliente conteudo: every people list with a number has people', async ({
  request,
}) => {
  // Quick 261013-orf E-03.1: 61 posts × 4 lists and 16 stories × 3 lists, read from the rendered
  // HTML (a browser per page takes minutes): the count line, then at least one member card link.
  test.setTimeout(900_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const urls: string[] = [];
  for (let i = 1; i <= 61; i += 1) {
    for (const quem of ['curtidas', 'comentarios', 'salvamentos', 'compartilhamentos']) {
      urls.push(`${CONTENT_AREA}&vista=publicacoes&post=op-${pad(i)}&quem=${quem}`);
    }
  }
  for (let i = 1; i <= 16; i += 1) {
    for (const quem of ['curtidas', 'comentarios', 'compartilhamentos']) {
      urls.push(`${CONTENT_AREA}&vista=tipos&tipo=story&post=os-${pad(i)}&quem=${quem}`);
    }
  }
  const countLine =
    />(\d[\d.]*|nenhuma?|nenhum) (curtidas?|comentários?|salvamentos?|compartilhamentos?) · /;
  let withNumber = 0;
  for (let start = 0; start < urls.length; start += 4) {
    const batch = urls.slice(start, start + 4);
    const pages = await Promise.all(
      batch.map(async (url) => {
        const response = await request.get(url, { timeout: 120_000 });
        return { url, status: response.status(), html: await response.text() };
      }),
    );
    for (const { url, status, html } of pages) {
      expect(status, url).toBe(200);
      const line = countLine.exec(html);
      expect(line, url).not.toBeNull();
      const value = Number(/^\d/.test(line?.[1] ?? '') ? line?.[1]?.replace('.', '') : 0);
      const cards = /membro=om-\d\d/.test(html);
      expect(value === 0 || cards, `${url} (${line?.[0]})`).toBe(true);
      if (value > 0) withNumber += 1;
    }
  }
  expect(withNumber).toBeGreaterThan(280);
});

const CONTENT_DETAIL_VIEWS = [
  '&vista=publicacoes&post=op-41',
  '&vista=tipos&tipo=story&post=os-01',
  '&vista=publicacoes&post=op-19',
  '&vista=publicacoes&post=op-11&quem=curtidas',
  '&vista=tipos&tipo=video',
  '&vista=publicacoes',
];

for (const width of PHONE_WIDTHS) {
  test(`dono-do-cliente conteudo: details and lists at ${width}px, no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const query of CONTENT_DETAIL_VIEWS) {
      await page.goto(`${CONTENT_AREA}${query}`);
      await expect(ownerArea(page), query).toBeVisible();
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth, query).toBeLessThanOrEqual(overflow.clientWidth);
    }
  });
}

test('dono-do-cliente conteudo: details and lists at 1440x900, inside the phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const query of CONTENT_DETAIL_VIEWS) {
    await page.goto(`${CONTENT_AREA}${query}`);
    await expect(page.getByText('9:41', { exact: true })).toBeVisible();
    const metrics = await screenMetrics(page);
    expect(metrics.scrollWidth, query).toBeLessThanOrEqual(metrics.clientWidth);
    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth, query).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.scrollHeight, query).toBeLessThanOrEqual(overflow.clientHeight + 1);
    await expect(page.locator('[data-phone-screen]').locator('table:visible'), query).toHaveCount(
      0,
    );
  }
});

test.describe('dono-do-cliente conteudo without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the tab, a type card and a publication card are plain links', async ({ page }) => {
    await page.goto(CONTENT_AREA);
    await contentTabs(page).getByRole('link', { name: 'Por tipo' }).click();
    await expect(page).toHaveURL(/\?area=conteudo&vista=tipos$/);
    await ownerArea(page).locator('#tipo-carrossel').getByRole('link').click();
    await expect(page).toHaveURL(/&vista=tipos&tipo=carrossel$/);
    await postCards(ownerArea(page)).first().getByRole('link').click();
    await expect(page).toHaveURL(/&vista=tipos&tipo=carrossel&post=op-\d\d$/);
    await expect(ownerArea(page).locator('#quem-curtidas')).toBeVisible();
  });
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
  // Each next event is the bands' event card (quick 261013-p31 D-02), with nowhere to go.
  expect((await upcoming.locator('.text-xl').allTextContents()).map((text) => text.trim())).toEqual(
    ['Encontro mensal', 'Live de dúvidas', 'Imersão presencial'],
  );
  for (let i = 0; i < 3; i++) {
    const cover = upcoming.nth(i).locator('[data-testid="event-cover-fallback"]');
    expect(Math.abs((await boxRatio(cover)) - 16 / 10), String(i)).toBeLessThan(0.02);
  }
  await expect(cardCell(encontro, 'Inscritos')).toHaveText('92');
  await expect(cardCell(encontro, 'Vagas')).toHaveText('8');
  await expect(cardCell(encontro, 'Receita')).toHaveText(/^R\$\s?5,5\s?mil$/);
  await expect(encontro.getByText('12/10, 19h', { exact: true })).toBeVisible();
  await expect(encontro.getByText('Presencial', { exact: true })).toBeVisible();
  await expect(cardCell(upcoming.filter({ hasText: 'Imersão presencial' }), 'Vagas')).toHaveText(
    'Lotado',
  );
  await expect(cardCell(upcoming.filter({ hasText: 'Live de dúvidas' }), 'Vagas')).toHaveText(
    'Sem limite',
  );
  const upcomingSection = sectionTitled(area, 'Próximos eventos');
  await expect(upcomingSection.getByRole('link')).toHaveCount(0);
  await expect(upcomingSection.locator('table')).toHaveCount(0);
  await expect(upcomingSection.getByText('exemplo', { exact: true })).toHaveCount(1);
  await expect(upcomingSection.getByText('Receita: valores de exemplo')).toBeVisible();

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
  // Each bar of the comparison lists leads with the cover as a 56 px 16:10 thumbnail (D-03).
  const thumbs = waitlist.locator('[data-event-thumb]');
  await expect(thumbs).toHaveCount(3);
  for (let i = 0; i < 3; i++) await expect(thumbs.nth(i)).toHaveAttribute('aria-hidden', 'true');
  const waitBars = waitlist.getByRole('listitem').filter({ has: page.locator('[data-bar-fill]') });
  await expect(waitBars).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await expect(waitBars.nth(i).locator('[data-event-thumb]')).toHaveCount(1);
  }
  const thumbBox = await thumbs.first().boundingBox();
  expect(Math.abs((thumbBox?.height ?? 0) - 56)).toBeLessThanOrEqual(1);
  expect(Math.abs((await boxRatio(thumbs.first())) - 16 / 10)).toBeLessThan(0.02);
  const tracks = await waitlist
    .locator('[data-bar-fill]')
    .evaluateAll((fills) =>
      fills.map((fill) => fill.parentElement?.getBoundingClientRect()).map((r) => [r?.x, r?.right]),
    );
  for (const track of tracks) expect(track).toEqual(tracks[0]);

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
  await expect(attendance.locator('[data-event-thumb]')).toHaveCount(4);
  await expect(attendance).toContainText('+6 pessoas sem inscrição no Encontro set.');
  for (const title of ['Presencial × online', 'Quem vai aos eventos']) {
    await expect(areaDetails(page, title).locator('[data-event-thumb]')).toHaveCount(0);
  }
});

/* ------------------------------------------------- Financeiro in three tabs (quick 261014-dwc) */

const FINANCE_AREA = '/painel-preview/dono-do-cliente?area=financeiro';
const FINANCE_TABS = ['Visão geral', 'Produtos', 'Quem compra'];
const PRODUCT_NAMES = ['Comunidade VIP', 'Mentoria em grupo', 'E-book', 'Workshop gravado'];
/** The English words the screen must never show (CONTEXT): their pt-BR words are used instead. */
const ENGLISH_WORDS = /\b(upsell|ticket|churn|mrr|insights?)\b/i;

/** The finance tabs (D-01): Visão geral | Produtos | Quem compra. */
function financeTabs(page: Page) {
  return page.getByRole('navigation', { name: 'Vistas do financeiro' });
}

/** The product cards of Produtos (each `li` carries `produto-<id>`). */
function productCards(area: Locator) {
  return area.locator('li[id^="produto-"]');
}

async function expectNoEnglish(page: Page, where: string) {
  expect(await ownerArea(page).innerText(), where).not.toMatch(ENGLISH_WORDS);
}

test.describe('dono-do-cliente financeiro', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('one row of three equal tabs on the tab screens, none deeper, no period choice', async ({
    page,
  }) => {
    const hrefs = [
      FINANCE_AREA,
      `${FINANCE_AREA}&vista=produtos`,
      `${FINANCE_AREA}&vista=quem-compra`,
    ];
    for (const [i, href] of hrefs.entries()) {
      await page.goto(href);
      const nav = financeTabs(page);
      await expect(nav).toHaveCount(1);
      expect(await linkTexts(nav)).toEqual(FINANCE_TABS);
      const links = nav.getByRole('link');
      const widths: number[] = [];
      for (let k = 0; k < 3; k += 1) {
        expect(await links.nth(k).getAttribute('href')).toBe(hrefs[k]);
        widths.push((await links.nth(k).boundingBox())?.width ?? Number.NaN);
      }
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(links.nth(i)).toHaveAttribute('aria-current', 'page');
      await expect(ownerArea(page).getByRole('navigation')).toHaveCount(1);
      // The bell's hidden "7 dias" alert tag is the header's, not a period choice of the area.
      await expect(ownerArea(page).getByText('7 dias', { exact: true })).toHaveCount(0);
      await expect(page.getByText('90 dias', { exact: true })).toHaveCount(0);
      await expectNoEnglish(page, href);
    }
    for (const deeper of [
      '&vista=produtos&produto=s2',
      '&vista=produtos&produto=s2&oferta=vip-entrada',
    ]) {
      await page.goto(`${FINANCE_AREA}${deeper}`);
      await expect(backLink(page)).toBeVisible();
      await expect(financeTabs(page)).toHaveCount(0);
      await expect(ownerArea(page).getByRole('navigation')).toHaveCount(0);
      await expectNoEnglish(page, deeper);
    }
  });

  test('Produtos: four cards by revenue, a 16:7 cover, entries and add-ons, Parado once', async ({
    page,
  }) => {
    await page.goto(`${FINANCE_AREA}&vista=produtos`);
    const cards = productCards(ownerArea(page));
    await expect(cards).toHaveCount(4);
    const names: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      const card = cards.nth(i);
      names.push((await card.locator('.text-xl').innerText()).trim());
      const cover = card.locator('[data-testid="community-cover-fallback"]');
      await expect(cover).toHaveCount(1);
      expect(Math.abs((await boxRatio(cover)) - 16 / 7)).toBeLessThanOrEqual(0.02);
    }
    expect(names).toEqual(PRODUCT_NAMES);
    const vip = cards.first();
    await expect(cardCell(vip, 'Preço')).toHaveText(/R\$\s197,00/);
    await expect(cardCell(vip, 'Entrada')).toHaveText('11');
    await expect(cardCell(vip, 'Adicional')).toHaveText('7');
    await expect(cardCell(vip, 'Receita')).toHaveText(/R\$\s4,1\smil/);
    await expect(vip).toContainText('6% vs. 30 dias antes');
    await expect(ownerArea(page).getByText('Parado', { exact: true })).toHaveCount(1);
    await expect(cards.nth(3).getByText('Parado', { exact: true })).toBeVisible();
    await expect(cards.nth(3)).toContainText('Sem venda nos últimos 30 dias nem nos 30 anteriores');
  });

  test('the tracer: product, offer, buyer, list and back one step at a time', async ({ page }) => {
    await page.goto(`${FINANCE_AREA}&vista=produtos`);
    const area = ownerArea(page);
    await area.locator('#produto-s2').getByRole('link').click();
    await expect(page).toHaveURL(/\?area=financeiro&vista=produtos&produto=s2$/);
    await expect(area.getByRole('heading', { level: 3, name: 'Comunidade VIP' })).toBeVisible();
    await expect(area.locator('li[id^="oferta-"]')).toHaveCount(2);
    const entry = area.locator('#oferta-vip-entrada');
    await expect(entry).toContainText('Comunidade VIP + 1 ano de acesso ao app');
    await expect(entry.getByText('Entrada', { exact: true })).toBeVisible();
    await expect(entry).toContainText(/R\$\s247,00/);
    await expect(entry).toContainText(/11 pedidos · R\$\s2\.717,00/);
    const addon = area.locator('#oferta-vip-adicional');
    await expect(addon).toContainText('Comunidade VIP por 1 ano');
    await expect(addon.getByText('Adicional', { exact: true })).toBeVisible();
    await expect(addon).toContainText(/R\$\s197,00/);
    await expect(addon).toContainText(/7 pedidos · R\$\s1\.379,00/);

    await entry.getByRole('link').click();
    await expect(page).toHaveURL(/&produto=s2&oferta=vip-entrada$/);
    await expect(
      area.getByRole('heading', { name: 'Comunidade VIP + 1 ano de acesso ao app' }),
    ).toBeVisible();
    await expect(area.getByText(/^11 compras nos últimos 30 dias/)).toBeVisible();
    const rows = area.getByRole('listitem');
    await expect(rows).toHaveCount(10);
    await expect(area.getByText('e mais 1 compra', { exact: true })).toBeVisible();
    await expect(rows.first()).toContainText(/Comprou há \d+ dias · R\$\s247,00/);

    const card = rows.first().getByRole('link');
    const name = (await card.locator('.text-lg').innerText()).trim();
    const member = /membro=(om-\d\d)$/.exec((await card.getAttribute('href')) ?? '')?.[1];
    expect(member).toBeDefined();
    await card.click();
    await expect(page).toHaveURL(new RegExp(`&oferta=vip-entrada&membro=${member}$`));
    await expect(area.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
    const purchases = sectionTitled(area, 'Compras');
    await expect(purchases).toContainText('Comunidade VIP + 1 ano de acesso ao app');
    await expect(purchases.getByText('Entrada', { exact: true })).toBeVisible();
    await expect(purchases).toContainText(/R\$\s247,00/);
    await expectNoEnglish(page, 'member');

    await area.locator('#insight-curtidas').click();
    await expect(page).toHaveURL(new RegExp(`&membro=${member}&lista=curtidas$`));
    await expect(
      area.getByRole('heading', { level: 3, name: 'Curtidas', exact: true }),
    ).toBeVisible();

    const steps = [
      new RegExp(`&oferta=vip-entrada&membro=${member}#insight-curtidas$`),
      new RegExp(`&produto=s2&oferta=vip-entrada#membro-${member}$`),
      /&vista=produtos&produto=s2#oferta-vip-entrada$/,
      /\?area=financeiro&vista=produtos#produto-s2$/,
    ];
    for (const step of steps) {
      expect(await backLink(page).getAttribute('href')).toMatch(step);
      await backLink(page).click();
      await expect(page).toHaveURL(step);
    }
    await expect(financeTabs(page).getByRole('link', { name: 'Produtos' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('an offer with no order in the month opens nothing', async ({ page }) => {
    await page.goto(`${FINANCE_AREA}&vista=produtos&produto=s4`);
    const offer = ownerArea(page).locator('#oferta-workshop-adicional');
    await expect(offer).toContainText('Nenhum pedido nos últimos 30 dias');
    await expect(offer.getByRole('link')).toHaveCount(0);
  });

  test('a forged URL falls one level up', async ({ page }) => {
    const cases: [string, RegExp][] = [
      ['&vista=produtos&produto=xyz', /^Produtos da loja$/],
      ['&vista=produtos&produto=s2&oferta=ebook-entrada', /^Ofertas$/],
      ['&vista=produtos&produto=s4&oferta=workshop-adicional', /^Ofertas$/],
      // om-13 bought no VIP entry: the offer's buyers stay open.
      ['&vista=produtos&produto=s2&oferta=vip-entrada&membro=om-13', /^Comunidade VIP \+ 1 ano/],
    ];
    for (const [query, heading] of cases) {
      await page.goto(`${FINANCE_AREA}${query}`);
      await expect(
        ownerArea(page).getByRole('heading', { level: 3, name: heading }),
        query,
      ).toBeVisible();
    }
    await page.goto(
      `${FINANCE_AREA}&vista=produtos&produto=s2&oferta=vip-entrada&membro=om-03&lista=xyz`,
    );
    await expect(ownerArea(page).getByRole('heading', { name: 'Últimos 30 dias' })).toBeVisible();
    await expect(backLink(page)).toHaveAttribute('href', /&oferta=vip-entrada#membro-om-03$/);
  });
});

const FINANCE_VIEWS = [
  '&vista=produtos',
  '&vista=produtos&produto=s2',
  '&vista=produtos&produto=s2&oferta=vip-entrada',
];

for (const width of PHONE_WIDTHS) {
  test(`dono-do-cliente financeiro: products and buyers at ${width}px, no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const query of FINANCE_VIEWS) {
      await page.goto(`${FINANCE_AREA}${query}`);
      await expect(ownerArea(page), query).toBeVisible();
      await openAllDetails(page);
      const overflow = await horizontalOverflow(page);
      expect(overflow.scrollWidth, query).toBeLessThanOrEqual(overflow.clientWidth);
      // A card's columns never run past the card ("R$ 4,1 mil" cut at 360 px before the 2×2 rows).
      const clipped = await ownerArea(page)
        .locator('dl')
        .evaluateAll((lists) => lists.filter((el) => el.scrollWidth > el.clientWidth + 1).length);
      expect(clipped, query).toBe(0);
    }
  });
}

test('dono-do-cliente financeiro: products and buyers at 1440x900, inside the phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const query of FINANCE_VIEWS) {
    await page.goto(`${FINANCE_AREA}${query}`);
    await expect(page.getByText('9:41', { exact: true })).toBeVisible();
    await openAllDetails(page);
    const metrics = await screenMetrics(page);
    expect(metrics.scrollWidth, query).toBeLessThanOrEqual(metrics.clientWidth);
    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth, query).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.scrollHeight, query).toBeLessThanOrEqual(overflow.clientHeight + 1);
    await expect(page.locator('[data-phone-screen]').locator('table:visible'), query).toHaveCount(
      0,
    );
  }
});

test.describe('dono-do-cliente financeiro without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the tabs and a product card are plain links', async ({ page }) => {
    await page.goto(FINANCE_AREA);
    await financeTabs(page).getByRole('link', { name: 'Produtos' }).click();
    await expect(page).toHaveURL(/\?area=financeiro&vista=produtos$/);
    await ownerArea(page).locator('#produto-s2').getByRole('link').click();
    await expect(page).toHaveURL(/&vista=produtos&produto=s2$/);
    await expect(ownerArea(page).locator('#oferta-vip-entrada')).toBeVisible();
  });
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
  await expect(page.getByText('Interações por publicação')).toHaveCount(0);
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

/** A line chart's x labels, left to right: apart by 2 px or more and inside the chart. */
async function expectXLabelsApart(chart: Locator, expected: readonly string[]) {
  const { box, labels } = await chart.evaluate((svg) => {
    const rect = svg.getBoundingClientRect();
    return {
      box: { left: rect.left, right: rect.right },
      labels: [...svg.querySelectorAll('[data-x-label]')]
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { text: el.textContent ?? '', left: r.left, right: r.right };
        })
        .sort((a, b) => a.left - b.left),
    };
  });
  for (const text of expected) expect(labels.map((label) => label.text)).toContain(text);
  for (const [i, label] of labels.entries()) {
    expect(label.left, label.text).toBeGreaterThanOrEqual(box.left);
    expect(label.right, label.text).toBeLessThanOrEqual(box.right);
    const before = labels[i - 1];
    if (before)
      expect(label.left - before.right, `${before.text}|${label.text}`).toBeGreaterThanOrEqual(2);
  }
}

test('dono-da-plataforma: the x labels of the monthly chart never touch at 360 px (quick 261013-uoi C-2)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto('/painel-preview/dono-da-plataforma');
  const chart = page.getByRole('img', { name: 'Clientes ativos por mês' });
  await expect(chart).toBeVisible();
  await expectXLabelsApart(chart, ['out']);
  await expect(chart.locator('[data-x-label]').last()).toHaveText('out');
});

test('dono-do-cliente: the weekly chart keeps S4, S8 and S12 apart at 360 px (quick 261013-uoi C-2)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto('/painel-preview/dono-do-cliente');
  const chart = page.getByRole('img', { name: /^Membros que interagiram por semana/ });
  await expect(chart).toBeVisible();
  await expectXLabelsApart(chart, ['S4', 'S8', 'S12']);
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
    // Quick 261013-orf D-01/D-02/D-04: one decorative publication thumbnail per row, 56 px square.
    const thumbs = page.locator('#lista [data-testid="cover-thumb"]');
    await expect(thumbs).toHaveCount(list.rows);
    await expect(
      page.locator('#lista li').filter({ has: page.locator('[data-testid="cover-thumb"]') }),
    ).toHaveCount(list.rows);
    await expect(
      page.locator('#lista [data-testid="cover-thumb"]:not([aria-hidden="true"])'),
    ).toHaveCount(0);
    const firstBox = await thumbs.first().boundingBox();
    expect(Math.abs((firstBox?.width ?? 0) - 56)).toBeLessThanOrEqual(1);
    expect(Math.abs((firstBox?.height ?? 0) - 56)).toBeLessThanOrEqual(1);
    if (list.slug === 'curtidas') {
      await expect(thumbs.first()).toHaveAttribute('data-kind', 'video');
      await expect(thumbs.first()).toHaveText('10:12');
      const text = thumbs.and(page.locator('[data-kind="text"]'));
      expect(await text.count()).toBeGreaterThan(0);
      await expect(text.first().locator('svg')).toHaveCount(1);
    }
    if (list.slug === 'videos') {
      await expect(thumbs.first()).toHaveText('10:12');
      for (const label of await thumbs.allTextContents()) expect(label).toMatch(/^\d+:\d\d$/);
    }
    if (list.slug === 'stories') {
      const stories = thumbs.and(page.locator('[data-kind="story"]'));
      await expect(stories).toHaveCount(list.rows);
      // Quick 261013-uoi F-5: a story is a circle, as on Instagram.
      for (const classes of await stories.evaluateAll((els) => els.map((el) => el.className))) {
        expect(classes).toContain('rounded-full');
      }
    }
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
