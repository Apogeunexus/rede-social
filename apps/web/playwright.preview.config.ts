import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

/**
 * The access-level panels preview check (quick 261011-jqy). The main configs start the API, which
 * needs Supabase; the preview needs neither — it renders fictional fixtures — so this config starts
 * `next dev` alone and collects only `e2e-preview/`.
 *
 * The web env still validates at import time (`lib/env.ts`), so the server gets three safe local
 * placeholders that nothing listens on and the preview never calls: `API_URL=http://127.0.0.1:8787`,
 * `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
 * preview-local-placeholder`. `INSTALL_GATE=off` keeps the phone-sized viewports out of the install
 * screen. Uses the installed Google Chrome (`channel: 'chrome'`), not Playwright's bundled Chromium.
 *
 * Run: `pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts`
 */
export default defineConfig({
  testDir: './e2e-preview',
  workers: 1,
  fullyParallel: false,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    channel: 'chrome',
    colorScheme: 'light',
  },
  projects: [{ name: 'chrome', use: { channel: 'chrome' } }],
  webServer: {
    command: 'pnpm --filter @rede-social/web dev',
    cwd: repoRoot,
    url: 'http://localhost:3000/painel-preview/dono-da-plataforma',
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      API_URL: 'http://127.0.0.1:8787',
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'preview-local-placeholder',
      INSTALL_GATE: 'off',
    },
  },
});
