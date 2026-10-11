---
phase: quick-261011-jqy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/modules/dashboard/package.json
  - packages/modules/dashboard/tsconfig.json
  - packages/modules/dashboard/vitest.config.ts
  - packages/modules/dashboard/turbo.json
  - packages/modules/dashboard/README.md
  - packages/modules/dashboard/fixtures/index.ts
  - packages/modules/dashboard/fixtures/preview-tenant.ts
  - packages/modules/dashboard/fixtures/platform-panels.ts
  - packages/modules/dashboard/fixtures/tenant-panels.ts
  - packages/modules/dashboard/ui/index.ts
  - packages/modules/dashboard/ui/scale.ts
  - packages/modules/dashboard/ui/KpiCard.tsx
  - packages/modules/dashboard/ui/Sparkline.tsx
  - packages/modules/dashboard/ui/ToneLabel.tsx
  - packages/modules/dashboard/ui/LineChart.tsx
  - packages/modules/dashboard/ui/BarList.tsx
  - packages/modules/dashboard/ui/AttentionList.tsx
  - packages/modules/dashboard/ui/ResponsiveTable.tsx
  - packages/modules/dashboard/ui/Collapsible.tsx
  - packages/modules/dashboard/ui/CohortHeatmap.tsx
  - packages/modules/dashboard/ui/ActionCard.tsx
  - packages/modules/dashboard/tests/scale.test.ts
  - packages/modules/dashboard/tests/fixtures.test.ts
  - packages/modules/dashboard/tests/kpi-card.test.tsx
  - packages/modules/dashboard/tests/charts.test.tsx
  - packages/modules/dashboard/tests/lists.test.tsx
  - packages/modules/dashboard/tests/tenant-widgets.test.tsx
  - pnpm-lock.yaml
  - apps/web/package.json
  - apps/web/proxy.ts
  - apps/web/proxy.test.ts
  - apps/web/lib/dashboard-preview.ts
  - apps/web/lib/dashboard-preview.test.ts
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/app/painel-preview/layout.tsx
  - apps/web/app/painel-preview/page.tsx
  - apps/web/app/painel-preview/[nivel]/page.tsx
  - apps/web/components/dashboard/PreviewChrome.tsx
  - apps/web/components/dashboard/PanelHeader.tsx
  - apps/web/components/dashboard/PlatformOwnerPanel.tsx
  - apps/web/components/dashboard/PlatformAdminPanel.tsx
  - apps/web/components/dashboard/PlatformSupportPanel.tsx
  - apps/web/components/dashboard/TenantOwnerPanel.tsx
  - apps/web/components/dashboard/TenantAdminPanel.tsx
  - apps/web/components/dashboard/TenantStaffPanel.tsx
  - apps/web/components/dashboard/MemberPanel.tsx
  - apps/web/playwright.preview.config.ts
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, MOD-02, MOD-05, UI-03, PWA-03]
tags: [dashboard, preview, fixtures, module, next-intl, pt-BR, tenant-brand, responsive, svg-charts]

estimate:
  tokens: 230000
  raw_tokens: 230000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "With only `pnpm --filter @rede-social/web dev` running (placeholder env, no API, no Supabase, no session), `/painel-preview` redirects to `/painel-preview/dono-da-plataforma` and each of the 7 level pages answers 200 and shows the 'Dados de exemplo' notice (D-01, D-05, D-07)."
    - "A production build never serves the preview: proxy.ts keeps `/painel-preview/*` private when NODE_ENV is production (an anonymous request 307s to /entrar, proven by proxy.test.ts), and the layout and page call notFound() under production; no other PUBLIC entry or auth/tenant check changes (D-05)."
    - "The preview wears the Igor Alves brand through the app's own mechanism: a fixture tenant record (`#2e6fd0` / `#5b9cf8`, dark primary `#5b9cf8`, display name 'Dr. Igor Alves') goes through resolveBranding -> brandScope onto a `[data-brand-root]` element, exactly as `(app)/layout.tsx` feeds AppShell; no colour literal lives in any .tsx (D-04)."
    - "At 360, 390 and 430 px wide no level scrolls sideways (document scrollWidth <= clientWidth), KPI cards sit in a wrapping 2-column grid on phone, and every table becomes a stacked card list below `md` (D-03)."
    - "Every user-facing string comes from `apps/web/messages/pt-BR/dashboard.json` (or an existing catalog key), every status is an icon plus text, and charts are plain SVG drawn to scale with token colours (series = brand, previous period = tertiary dashed) (D-02, D-06)."
    - "Each of the 7 panels carries the reference's content and reading order, plus the preview chrome (role, question, usage, availability pill, 'O que falta no app' bullets); the staff panel's function simulator yields tabs with counts for 2+ functions, one block for 1, and an empty state for 0."
    - "`packages/modules/dashboard` (`@rede-social/module-dashboard`) is a module-tagged package exporting only `./ui` and `./fixtures`, depending only on kernel/contracts/tooling, with no `module.ts`; `pnpm boundaries`, `pnpm lint`, `pnpm typecheck` and `pnpm test` are green (D-02)."
  artifacts:
    - path: "packages/modules/dashboard/package.json"
      provides: "The module package, exports ./ui and ./fixtures"
      contains: "@rede-social/module-dashboard"
    - path: "packages/modules/dashboard/fixtures/preview-tenant.ts"
      provides: "The only file with the Igor Alves hex values: a TenantBranding record + display name"
      contains: "#2e6fd0"
    - path: "packages/modules/dashboard/ui/index.ts"
      provides: "Presentational primitives: KpiCard, Sparkline, ToneLabel, LineChart, BarList, AttentionList, ResponsiveTable, Collapsible, CohortHeatmap, ActionCard"
    - path: "apps/web/lib/dashboard-preview.ts"
      provides: "dashboardPreviewEnabled(), DASHBOARD_PREVIEW_PATH, PREVIEW_LEVELS, parseStaffFunctions()"
      exports: ["dashboardPreviewEnabled", "DASHBOARD_PREVIEW_PATH", "PREVIEW_LEVELS"]
    - path: "apps/web/app/painel-preview/[nivel]/page.tsx"
      provides: "The level page: allow-listed slug, chrome + one panel"
    - path: "apps/web/messages/pt-BR/dashboard.json"
      provides: "Every string of the preview under the `dashboard` root key"
      contains: "Dados de exemplo"
    - path: "apps/web/e2e-preview/painel-preview.spec.ts"
      provides: "No-horizontal-scroll check on all 7 levels at 360/390/430 px, table-vs-cards at md, staff simulator states"
  key_links:
    - from: "apps/web/app/painel-preview/layout.tsx"
      to: "packages/modules/dashboard/fixtures/preview-tenant.ts"
      via: "resolveBranding(previewTenant.branding) -> brandScope() -> style + attributes on the [data-brand-root] div"
      pattern: "brandScope\\(resolveBranding"
    - from: "apps/web/proxy.ts"
      to: "apps/web/lib/dashboard-preview.ts"
      via: "the private-route rule treats DASHBOARD_PREVIEW_PATH as public only when dashboardPreviewEnabled() (read per request)"
      pattern: "dashboardPreviewEnabled\\(\\)"
    - from: "apps/web/components/dashboard/*Panel.tsx"
      to: "@rede-social/module-dashboard/ui + /fixtures"
      via: "server components compose module primitives with fixture numbers and getTranslations('dashboard') strings"
      pattern: "@rede-social/module-dashboard/(ui|fixtures)"
    - from: "apps/web/package.json"
      to: "packages/modules/dashboard"
      via: "workspace:* dependency; Tailwind already scans packages/modules via globals.css @source"
      pattern: "@rede-social/module-dashboard"
---

<objective>
Build a dev-only preview of the 7 access-level dashboards (Dono da plataforma, Admin da plataforma, Suporte da plataforma, Dono do cliente, Admin do cliente, Equipe do cliente, Membro) inside the real app: a new module package `@rede-social/module-dashboard` with presentational primitives + fictional fixtures, and an `apps/web/app/painel-preview/[nivel]` route that renders them in the Igor Alves tenant brand, in pt-BR from the catalog, with vertical scroll only.

Decision IDs: D-01..D-07 below are the seven locked decisions of `261011-jqy-CONTEXT.md` in order (D-01 example data only, D-02 module package + app conventions, D-03 vertical scroll only, D-04 Igor Alves brand through the real mechanism, D-05 not in production, D-06 look like the app, D-07 "Dados de exemplo"). The 7-panel content spec in CONTEXT.md and `reference-prototype.html` (same folder) are the content source: port content and hierarchy, never its CSS, its fake device frame, its fake bottom nav or its "Celular/Computador" toggle (the browser width decides).

Purpose: let the user see and judge every level's panel now, with fake numbers, before any API/DB work; real data is wired later panel by panel, so fixtures are shaped like the API answers they will become.
Output: the module package, the preview route + chrome + 7 panel compositions in apps/web, the `dashboard` catalog, a dev-only proxy rule with a production-blocking test, and a Playwright check of the no-horizontal-scroll rule that runs without Docker.

Out of scope (CONTEXT "Out of scope"): API routes, DB queries, migrations, the 7-role model in the database, real metrics, entries in the real app menus, changes to existing screens.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/261011-jqy-criar-pre-visualizacao-dos-paineis-de-mo/261011-jqy-CONTEXT.md
@.claude/CLAUDE.md
@apps/web/AGENTS.md

Visual/content reference (read only the line ranges you need; it is a 543-line HTML file whose lines 1–200 are CSS you must NOT port):
- preview chrome: lines 203–224 (header, level groups) and 512–522 (role · name, "Pergunta", usage line, status pill, "O que falta no app")
- panel 1 lines 299–330 · panel 2 lines 331–360 · panel 3 lines 361–388 · panel 4 lines 389–411 + heatmap 465–477 · panel 5 lines 412–440 · panel 6 lines 441–447 + 479–505 · panel 7 lines 448–462
- chart rules: lines 246–291 (line chart on one shared y-scale, previous period dashed, sparkline, bars to scale)

Grounded repo facts (verified while planning — reuse, do not re-derive):
- Module layout to copy: `packages/modules/events/{package.json,tsconfig.json,vitest.config.ts,turbo.json}`. `turbo.json` = `{"extends":["//"],"tags":["module"]}`; tsconfig extends `../../config/tsconfig.base.json`; vitest merges `@rede-social/config/vitest.base` with `@vitejs/plugin-react`, `include: ['tests/**/*.test.{ts,tsx}']`, component tests opt in with `// @vitest-environment happy-dom` + `import '@testing-library/jest-dom/vitest'`. This module needs NO env placeholders (no server code). Workspace already globs `packages/modules/*` (pnpm-workspace.yaml).
- Do NOT create `packages/modules/dashboard/module.ts`: `apps/api/tests/unit/module-readmes.test.ts` test 1 requires every `packages/modules/*/module.ts` to be in the API `MODULE_REGISTRY` (a flag key + nav), which is out of scope. Without `module.ts` the package is skipped by that check.
- Module UI convention (MOD-02, PWA-03, see `packages/modules/events/ui/NextEventCard.tsx` header): a module component holds no route, no clock and no words — every string, href and formatted value is a prop decided by the web tier. Module tests use sentinel ASCII strings.
- `turbo.json` boundaries: `module` may depend on `kernel` (`@rede-social/ui` is tagged kernel), `contracts`, `tooling` only. Biome forbids deep imports of `@rede-social/module-*/ui/*` etc.; apps/web imports `@rede-social/module-dashboard/ui` and `@rede-social/module-dashboard/fixtures` only.
- Tailwind already scans every module: `apps/web/app/globals.css` has `@source "../../../packages/modules"`. No next.config change is needed (existing modules ship raw TS without `transpilePackages`).
- Brand mechanism: `(app)/layout.tsx` does `resolveBranding(tenant.branding)` -> `brandScope(branding)` -> `<AppShell style={scope.style} brandAttributes={scope.attributes}>`, and AppShell's root `<div>` carries `data-brand-root`. `(auth)/layout.tsx` does the same on `<main {...scope.attributes} style={scope.style}>`. tokens.css (Layer 1b) redeclares the derived brand aliases on `[data-brand-root]` and `[style*="--brand-primary"]`. `resolveBranding` and `TenantBranding`/`tenantBrandingSchema` come from `@rede-social/contracts/branding`; `brandScope` from `apps/web/lib/brand-scope.ts`.
- Catalog contract (`apps/web/i18n/messages.ts` + `scripts/check-ui-literals.sh`): file `messages/pt-BR/dashboard.json` must be exactly `{ "dashboard": { … } }`; values are strings or objects ONLY (an array throws at load), ICU plurals allowed; a missing key throws outside production. Module nav labels already exist at `<moduleKey>.nav` in the root catalog — `moduleLabelResolver(tRoot)` in `apps/web/lib/registry.tsx` resolves them.
- UI literal guard (runs in `pnpm lint`): in any `.tsx` no hex inside a string/class, no pt-BR diacritics in JSX text, no quoted `aria-label`/`placeholder`/`title`/`alt`/`label` literal, and Biome `noJsxLiterals` (allowed glyphs only `/ · — ( ) …`). Arrow glyphs like ▲▼ are NOT allowed: use lucide `ArrowUp`/`ArrowDown`/`Minus`. Icons already used in the repo: `CircleCheck`, `TriangleAlert`, `CircleAlert`, `Circle`, `ArrowUp`, `ArrowDown`, `ChevronRight`, `ChevronDown`, `CalendarDays`, `MessageCircle`, `Lock`, `Search`, `Info`.
- `proxy.ts`: anonymous requests to any path not in `PUBLIC` 307 to `/entrar` (step 4). `localhost` is a generic fast path (no API lookup). `getClaims()` without a session cookie returns no claims without a network call. `proxy.test.ts` mocks `@/lib/env`, `@supabase/ssr` and `resolveHostTenant`; the "PUBLIC entries" describe block is the pattern to follow.
- `apps/web/lib/env.ts` requires `API_URL`, `NEXT_PUBLIC_SUPABASE_URL` (both URLs) and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` at import time; `apps/web/.env.local` does not exist on this machine. Safe local placeholders (nothing listens there; the preview never calls them): `API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder`. Export them before `pnpm --filter @rede-social/web dev`, `next build`, `next start` and the root `pnpm typecheck` (which runs the web `build` first, see `apps/web/turbo.json`).
- `scripts/check-static-routes.sh` (after `next build`) fails if any app route is prerendered static. The root layout reads `cookies()`, and the preview layout/pages must also call `await connection()` (from `next/server`) before the production guard so a build-time `notFound()` can never be frozen into a static 404.
- Existing Playwright configs start the API (needs Supabase) — unusable here. The existing e2e configs collect `apps/web/e2e/**` only, so the preview spec lives in a separate `apps/web/e2e-preview/` directory with its own config. Playwright's bundled Chromium is NOT installed on this machine, but Google Chrome is: use `channel: 'chrome'`.
- Formatting helpers to reuse: `formatBrl(cents)` from `@rede-social/contracts/money`; numbers/percents with `Intl.NumberFormat('pt-BR', …)` (pattern in `apps/web/lib/store-view.ts`). Page props pattern in this repo: `{ params: Promise<{ nivel: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }` (see `app/(app)/eventos/[eventId]/page.tsx`). Next 16 docs ship in `apps/web/node_modules/next/dist/docs/` (read `01-app/03-api-reference/04-functions/not-found.md` and `03-file-conventions/dynamic-routes.md` before writing the route).
- Responsive table precedent: `apps/web/components/platform/TenantTable.tsx` — a `<table>` in a `Card` with `hidden md:block`, plus a `<ul className="flex flex-col gap-3 md:hidden">` of one Card per row.

<interfaces>
From @rede-social/ui (packages/ui/src/index.ts):
- `Card(props: HTMLAttributes<HTMLDivElement>)`; `SectionTitle({ as?: 'h2'|'h3'|'h4', variant?: 'micro'|'group' })`
- `StatusPill({ tone?: 'brand'|'success'|'warning'|'danger'|'neutral' })` (server-safe)
- `Chip({ href, active, children })` ('use client'; link form renders `<a>`); `Badge({ count, max?, variant?: 'count'|'dot' })`
- `EmptyState({ icon: LucideIcon, title, body?, action?, variant?: 'plain'|'card' })`
- `Button` ('use client'; variants brand|secondary|outline|ghost|danger; sizes sm|md|lg; accepts `disabled`)
From @rede-social/contracts/branding: `resolveBranding(raw: unknown): ResolvedBranding`, `type TenantBranding`, `tenantBrandingSchema`.
From apps/web/lib/brand-scope.ts: `brandScope(branding): { style: Record<string,string>; attributes: AppBrandAttributes; titleFontHref: string | null }`.
From @rede-social/contracts/money: `formatBrl(cents: number): string`.
</interfaces>
</context>

<tasks>

<task type="tracer">
  <name>Task 1 (tracer): one level end to end — module package, fixture brand, dev-only public route, catalog, KPI row at 390 px</name>
  <files>packages/modules/dashboard/package.json, packages/modules/dashboard/tsconfig.json, packages/modules/dashboard/vitest.config.ts, packages/modules/dashboard/turbo.json, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/fixtures/preview-tenant.ts, packages/modules/dashboard/fixtures/platform-panels.ts, packages/modules/dashboard/ui/index.ts, packages/modules/dashboard/ui/scale.ts, packages/modules/dashboard/ui/KpiCard.tsx, packages/modules/dashboard/ui/Sparkline.tsx, packages/modules/dashboard/tests/scale.test.ts, packages/modules/dashboard/tests/fixtures.test.ts, packages/modules/dashboard/tests/kpi-card.test.tsx, apps/web/package.json, pnpm-lock.yaml, apps/web/lib/dashboard-preview.ts, apps/web/lib/dashboard-preview.test.ts, apps/web/proxy.ts, apps/web/proxy.test.ts, apps/web/messages/pt-BR/dashboard.json, apps/web/app/painel-preview/layout.tsx, apps/web/app/painel-preview/page.tsx, apps/web/app/painel-preview/[nivel]/page.tsx, apps/web/components/dashboard/PlatformOwnerPanel.tsx, apps/web/playwright.preview.config.ts, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>packages/modules/events/package.json, packages/modules/events/vitest.config.ts, packages/modules/events/ui/NextEventCard.tsx (header comment only), apps/web/app/(auth)/layout.tsx, apps/web/lib/brand-scope.ts, apps/web/proxy.ts, apps/web/proxy.test.ts (lines 1–90 and 160–185), packages/contracts/src/branding.ts (lines 210–250 and 388–452), reference-prototype.html lines 203–224, 246–291, 299–330, 512–522</read_first>
  <behavior>
    - dashboardPreviewEnabled() is true when NODE_ENV is 'development' or 'test' and false when it is 'production' (read at call time, so vi.stubEnv flips it).
    - DASHBOARD_PREVIEW_PATH matches `/painel-preview` and `/painel-preview/dono-da-plataforma`, and does NOT match `/painel-previewx` or `/painel-preview-foo`.
    - proxy: anonymous GET `/painel-preview/dono-da-plataforma` on a generic host -> 200 (no Location) when NODE_ENV is development; -> 307 to `/entrar` when NODE_ENV is production; `/painel-previewx` -> 307 in development; `/inicio` still 307 in development.
    - resolveBranding(previewTenant.branding).colors: primary `#2e6fd0`, secondary `#5b9cf8`, primaryDark `#5b9cf8`; tenantBrandingSchema.parse accepts the record; displayName is 'Dr. Igor Alves'.
    - scale helpers: sparkline/line points are evenly spaced on x and inverted on y; a flat series does not divide by zero; barPercent(v, max) = v/max*100 clamped to [0,100] and 0 when max is 0.
    - KpiCard renders label, value, delta text with an arrow icon for up/down (a dash icon for flat), a visually-hidden sentiment word when given, an optional note, and a dashed "not measured" variant; it renders no text of its own.
  </behavior>
  <action>
Wire ONE path through every layer: the `dono-da-plataforma` level showing only its KPI row (5 cards, sparkline on "Clientes ativos", the "Receita mensal" not-measured card), inside the branded preview shell, reachable without a session in dev and closed in production.

1. Module package (D-02). Create `packages/modules/dashboard` copying the events layout: `package.json` named `@rede-social/module-dashboard`, private, type module, a one-line description, `exports` exactly `{"./ui": "./ui/index.ts", "./fixtures": "./fixtures/index.ts"}`, scripts `typecheck`/`lint`/`test` identical to events, dependencies `@rede-social/contracts`, `@rede-social/ui` (both `workspace:*`) and `lucide-react` `1.46.0`, peerDependencies react/react-dom `19.3.0`, devDependencies copied (same pinned versions) from events minus `motion`. `tsconfig.json` like events but include only `fixtures/**/*.ts`, `ui/**/*.ts`, `ui/**/*.tsx`, `tests/**/*.ts`, `tests/**/*.tsx`. `vitest.config.ts` like events WITHOUT the `env` block (no server code here). `turbo.json` with the `module` tag. No `module.ts` (see context). Add `"@rede-social/module-dashboard": "workspace:*"` to `apps/web/package.json` dependencies in alphabetical position (after module-communities), then run `pnpm install --offline` (fall back to `pnpm install` only if offline fails; no new registry package is introduced, so the lockfile diff must contain only the new importer and the web link).
2. Fixtures (D-01, D-04). `fixtures/preview-tenant.ts` exports `previewTenant` = `{ displayName: 'Dr. Igor Alves', branding: { colors: { primary: '#2e6fd0', secondary: '#5b9cf8' }, look: { darkColors: { primary: '#5b9cf8' } } } }` typed with `satisfies` against `{ displayName: string; branding: TenantBranding }` (type import from `@rede-social/contracts/branding`). This is the ONLY file in the change that holds hex values. `fixtures/platform-panels.ts` exports `platformOwnerPanel` with the KPI data of panel 1 (reference lines 306–310) as raw data only: counts, percents as numbers, a 12-point active-clients series, the storage used in GB against the 1 GB plan, delta records shaped `{ amount, kind, direction: 'up'|'down'|'flat', good: boolean | null, basis }` and enum ids — never sentences, units or labels (those are catalog copy). Explicit exported types for each fixture shape (they are the future API contract). `fixtures/index.ts` re-exports both.
3. Module UI (D-06). `ui/scale.ts`: pure helpers `linearPoints(values, width, height, padding, bounds?)`, `pathFrom(points)`, `niceBounds(values, step)` (floor/ceil to the step, as reference lines 268–273) and `barPercent(value, max)`. `ui/Sparkline.tsx`: decorative SVG (`aria-hidden`), `viewBox` + `width="100%"`, stroke `currentColor` with `className="text-brand"`. `ui/KpiCard.tsx`: a `Card` (`min-w-0`, long words wrap) with props `label`, `value` (ReactNode), optional `unit`, `delta?: { text; direction; tone: 'success'|'danger'|'neutral'; sentiment?: string }`, `note?`, `chart?` (ReactNode slot for the sparkline) and `variant?: 'default'|'missing'` (missing = dashed border, muted value). Direction is the lucide arrow icon + the delta text; tone colour (`text-success`/`text-danger`/`text-text-tertiary`) is supplemental; `sentiment` renders `sr-only`. Export a `KpiGrid` from the same file: a wrapping CSS grid that yields exactly 2 columns at 360–430 px and more on wider screens (for example `grid gap-3 grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))]`), never a horizontally scrolling row (D-03). Colours only through token utilities and `currentColor`; no hex/rgb/hsl/oklch literal in any `.tsx`. `ui/index.ts` exports the public surface.
4. Module tests: `tests/scale.test.ts`, `tests/fixtures.test.ts` and `tests/kpi-card.test.tsx` (happy-dom, sentinel ASCII strings) covering the behavior block.
5. Web gate (D-05). `apps/web/lib/dashboard-preview.ts` exports `dashboardPreviewEnabled()` (returns `process.env.NODE_ENV !== 'production'`, evaluated per call; Next inlines NODE_ENV in builds so it is constant false there), `DASHBOARD_PREVIEW_PATH = /^\/painel-preview(?:\/|$)/`, and `PREVIEW_LEVELS`: the ordered list of the 7 levels `{ slug, role, group }` — slugs `dono-da-plataforma`, `admin-da-plataforma`, `suporte-da-plataforma`, `dono-do-cliente`, `admin-do-cliente`, `equipe-do-cliente`, `membro`; roles `platform_owner`, `platform_admin`, `platform_support`, `tenant_owner`, `tenant_admin`, `tenant_staff`, `member`; groups `platform` / `tenant` — plus `previewLevel(slug)` returning the entry or null. In `proxy.ts` step 4 only, extend the condition so a path is treated as public when it matches `PUBLIC` OR (`dashboardPreviewEnabled()` AND `DASHBOARD_PREVIEW_PATH`). Do not touch the `PUBLIC` array, the session refresh, the host rules or the CSP. Document the dev-only entry in the comment above `PUBLIC` in one sentence. Add a describe block to `proxy.test.ts` (use `vi.stubEnv('NODE_ENV', …)` and `vi.unstubAllEnvs()` in `afterEach`) with the four proxy cases of the behavior block, and `lib/dashboard-preview.test.ts` for the helper cases.
6. Catalog (D-02, D-07). Create `apps/web/messages/pt-BR/dashboard.json` with root key `dashboard` and, for now: `preview` (page title "Painéis por nível de acesso", intro sentence, the notice "Dados de exemplo" and "Todos os números, nomes e clientes desta página são fictícios."), and the strings the panel-1 KPI row needs (labels, the "Ainda não medido" value, its reason, delta templates with ICU placeholders such as `{amount} vs. mês anterior`, the "de {total} GB" unit, the "{percent} interagiram em 30 dias" note, the sentiment words "melhorou"/"piorou"). Correct pt-BR accents. Objects and strings only, no arrays.
7. Route (D-04, D-05). `app/painel-preview/layout.tsx` (server): `await connection()`, then `if (!dashboardPreviewEnabled()) notFound()`; `const scope = brandScope(resolveBranding(previewTenant.branding))`; render a `<div data-brand-root {...scope.attributes} style={scope.style}>` filling the viewport with `bg-bg text-text`, a centred column (`mx-auto w-full max-w-6xl px-4 py-6`), a header with the h1 (catalog `preview.title`) and a visible note (`role="note"`, a warning `StatusPill` with an `Info`/`TriangleAlert` icon + "Dados de exemplo", then the fictional-data sentence), then `{children}`; render `TitleFontSheet` when `scope.titleFontHref` is set, as `(auth)/layout.tsx` does. `app/painel-preview/page.tsx`: `await connection()`, production guard, then `redirect('/painel-preview/dono-da-plataforma')`. `app/painel-preview/[nivel]/page.tsx`: `await connection()`, production guard, `await params`, `previewLevel(nivel)` or `notFound()`; `generateMetadata` returns the level name from the catalog as title; for this task only the `dono-da-plataforma` slug renders `<PlatformOwnerPanel />` and every other slug calls `notFound()` (Task 3 makes the map exhaustive).
8. `components/dashboard/PlatformOwnerPanel.tsx` (server): `getTranslations('dashboard')`, read `platformOwnerPanel`, format numbers with `Intl.NumberFormat('pt-BR')`, build the 5 KPI props and render them in `KpiGrid`.
9. 390 px check without Docker (D-03). `apps/web/playwright.preview.config.ts`: `testDir: './e2e-preview'`, one project using `channel: 'chrome'` (installed Google Chrome; the bundled Chromium is absent here), `baseURL: 'http://localhost:3000'`, `workers: 1`, a `webServer` running `pnpm --filter @rede-social/web dev` from the repo root with `env` set to the three safe placeholders plus `INSTALL_GATE: 'off'`, `url` = the dono-da-plataforma level URL, `reuseExistingServer: true`, timeout 120 s; a header comment saying why this config exists (no API/DB needed) and naming the placeholders. `e2e-preview/painel-preview.spec.ts`: for each width in [360, 390, 430], set the viewport, open `/painel-preview/dono-da-plataforma`, assert the "Dados de exemplo" text is visible and that `document.documentElement.scrollWidth <= document.documentElement.clientWidth`; also assert `/painel-preview` lands on the level URL. Keep the level list in the spec data-driven so Tasks 2–3 only append slugs.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && test ! -e packages/modules/dashboard/module.ts && pnpm --filter @rede-social/module-dashboard test && pnpm --filter @rede-social/module-dashboard typecheck && pnpm --filter @rede-social/web exec vitest run proxy.test.ts lib/dashboard-preview.test.ts i18n/messages.test.ts && pnpm --filter @rede-social/web typecheck && pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts</automated>
  </verify>
  <done>Anonymous dev request to /painel-preview/dono-da-plataforma renders the branded shell, the "Dados de exemplo" notice and the 5 KPI cards in 2 columns with no horizontal scroll at 360/390/430 px; proxy.test proves production 307s to /entrar; module and web unit tests, both typechecks and the preview Playwright run are green.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: platform levels 1–3 complete — charts, attention list, responsive table, collapsible, preview chrome and level navigation</name>
  <files>packages/modules/dashboard/ui/ToneLabel.tsx, packages/modules/dashboard/ui/LineChart.tsx, packages/modules/dashboard/ui/BarList.tsx, packages/modules/dashboard/ui/AttentionList.tsx, packages/modules/dashboard/ui/ResponsiveTable.tsx, packages/modules/dashboard/ui/Collapsible.tsx, packages/modules/dashboard/ui/scale.ts, packages/modules/dashboard/ui/index.ts, packages/modules/dashboard/fixtures/platform-panels.ts, packages/modules/dashboard/tests/scale.test.ts, packages/modules/dashboard/tests/charts.test.tsx, packages/modules/dashboard/tests/lists.test.tsx, apps/web/components/dashboard/PreviewChrome.tsx, apps/web/components/dashboard/PanelHeader.tsx, apps/web/components/dashboard/PlatformOwnerPanel.tsx, apps/web/components/dashboard/PlatformAdminPanel.tsx, apps/web/components/dashboard/PlatformSupportPanel.tsx, apps/web/app/painel-preview/[nivel]/page.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>reference-prototype.html lines 243–264, 266–285, 293–294, 299–388, 512–522; apps/web/components/platform/TenantTable.tsx (lines 49–60, 100–110, 185–195); packages/ui/src/primitives/StatusPill.tsx; apps/web/lib/registry.tsx (moduleLabelResolver, lines 596–600)</read_first>
  <behavior>
    - funnelRates([8, 5, 4, 4, 3]) -> [null, 0.625, 0.8, 1, 0.75] (each step over the previous; the UI formats them with Intl percent, so the computed value replaces the reference's hand-typed one).
    - BarList: each fill width equals barPercent(value, max ?? largest value) — a 5230-of-5230 row is 100%, a 410 row is 410/5230 of it; the visible value label is the caller's string.
    - LineChart: with a previous series both share ONE y-scale (niceBounds over the union); the previous path is dashed and drawn in the tertiary text token; the current path, area and last-point dot use the brand token; the svg has role="img" and the caller's aria-label; it ships no words.
    - ToneLabel / AttentionList: every tone renders its lucide icon (success CircleCheck, warning TriangleAlert, danger CircleAlert, neutral Circle) next to the text — never colour alone.
    - ResponsiveTable: a `<table>` inside a container visible only from `md`, and below `md` a list with one card per row showing each non-phone-hidden column as label + value; no element uses an x-axis overflow utility.
  </behavior>
  <action>
Expand from the tracer to the three platform levels, complete as in the reference (content and reading order of CONTEXT "The 7 panels" items 1–3), plus the chrome every level shares.

1. Module primitives (D-06, D-03). `ToneLabel.tsx`: wraps `StatusPill` with the tone's lucide icon (aria-hidden) + text; tones success/warning/danger/neutral (+ brand). `LineChart.tsx`: props `series`, optional `previous`, `xLabels` (strings, empty = no label), `yStep`, `formatValue: (n) => string`, `ariaLabel`; implement per reference lines 266–285 (shared y-scale, 3 grid ticks, area at low opacity, dot on the last point) using `currentColor` with token text classes — `text-brand` for the series, `text-text-tertiary` + `strokeDasharray` for the previous period, grid lines in the divider token. Size the `viewBox` close to the phone content width (about 340 wide) so tick labels render at roughly 11–12 px on a 390 px screen, `width="100%"`, and cap its rendered height on wide screens so it does not balloon. `BarList.tsx`: rows `{ label, value, display, highlight? }`, optional `max`, optional `rate` text per row (for the funnel's "% from previous step"), widths via `barPercent`; the label column must wrap rather than push the row wider than the screen at 360 px. Add `funnelRates(values)` to `scale.ts`. `AttentionList.tsx`: items `{ tone, tag, title, detail? }` in a `Card`, each a `ToneLabel` + bold title + secondary detail + a `ChevronRight`; non-interactive. `ResponsiveTable.tsx`: columns `{ key, header, numeric?, hideOnPhone? }`, rows of `Record<key, ReactNode>`, `caption` for accessibility; table from `md` and stacked `Card` list below it (TenantTable pattern), long tokens (domains, e-mails) break with `break-words`/`[overflow-wrap:anywhere]`. `Collapsible.tsx`: native `<details>`/`<summary>` in a `Card`, summary = title + optional secondary text + `ChevronDown`, visible focus ring, works without JS. Export all from `ui/index.ts`. Tests in `tests/charts.test.tsx`, `tests/lists.test.tsx`, `tests/scale.test.ts` for the behavior block (sentinel strings).
2. Fixtures (D-01). Complete `platformOwnerPanel` (attention items, 12-month active clients with month ids, members per client with the concentration share, module adoption as module keys + percent, the clients list worst first) and add `platformAdminPanel` (4 pending items with deadline/state ids, 5 KPIs, activation funnel counts 8/5/4/4/3, failures by client) and `platformSupportPanel` (selected client, access-log entry with time + ticket reason, 4 KPIs, configuration: enabled/disabled module keys + admin e-mail, 3 errors in the last 24 h). Values exactly as reference lines 304–387; data only (numbers, enum ids, ISO dates/times, entity names, fictional e-mails/domains), no sentences that are UI copy. The reference's "Rede Demo" tenant becomes `previewTenant.displayName` wherever it appears, so the Igor Alves tenant is the same everywhere; other fictional client names stay.
3. Web chrome. `PanelHeader.tsx` (server): the reference "appbar" without the device frame — a brand-filled initial mark (`bg-brand text-on-brand`) + title + subtitle + an optional static period `Chip` (no href, purely informative). `PreviewChrome.tsx` (server): (a) level navigation — two groups ("Plataforma (white label)", "Cliente (tenant)") of `Chip` links built from `PREVIEW_LEVELS` with the level number, `active` + `aria-current="page"` on the current slug, wrapping rows (flex-wrap), inside `<nav aria-label={…}>`; (b) the level context from reference lines 520–521 — "{n} · {role}", the level name as h2, "Pergunta:" + question, the usage line, the availability `ToneLabel` ("Dá para fazer hoje" success, "Parcial" warning, "Depende dos níveis novos" warning, "Bloqueado" danger) and "O que falta no app:" with its bullet list. Store each level's bullets in the catalog as an object of numbered keys and read them with `t.raw(...)` validated by a zod `record(string, string)` (the loader rejects arrays). Every action affordance inside any panel ("Ver todos", "Escalar para admin", "Meus acessos registrados", …) renders as a disabled `Button` (ghost/outline) whose `aria-describedby` points at the page's "Dados de exemplo" note, so nothing looks clickable that does nothing; the note text says actions are disabled in the preview.
4. Panels (server components, `getTranslations('dashboard')` + fixtures + module primitives; numbers via `Intl.NumberFormat('pt-BR')`, module names via `moduleLabelResolver(tRoot)` with a catalog fallback). `PlatformOwnerPanel`: header, KPI grid (from Task 1), "Atenção" AttentionList, then a two-column section from `md` (single column on phone) with the 12-month LineChart and the "Membros por cliente" BarList + concentration sentence, the "Adoção de módulos" BarList with max 100 + footnote, and the clients ResponsiveTable (Plano/Posts 30d/Mídia hidden on phone; status cell = ToneLabel). `PlatformAdminPanel`: pending AttentionList FIRST, 5 KPIs, activation BarList with per-step rates + "Etapa com mais clientes parados" sentence computed from the funnel, failures ResponsiveTable. `PlatformSupportPanel`: a disabled search field showing the selected client (real `<label>`), client card with plan + status ToneLabels and the "Acesso registrado às {time} · motivo: …" line, 4 KPIs (the domain KPI value is a danger ToneLabel), `Collapsible` "Configuração" (closed) and "Erros nas últimas 24h" (open, each row ToneLabel + time + text), the two disabled action buttons; read-only. Platform panels may use the full preview width; tenant panels (Task 3) will use the app's 680 px column.
5. Page + catalog + e2e. Map the three platform slugs in `[nivel]/page.tsx` and render `PreviewChrome` above the panel. Add every new string to `dashboard.json` (pt-BR accents; ICU plurals for counts such as "{count, plural, one {# cliente} other {# clientes}}"). Append the two new slugs to the spec, and add a desktop case: at 1280 px `/painel-preview/dono-da-plataforma` shows a `table`, while at 390 px that table is hidden and the stacked list is visible.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/module-dashboard test && pnpm --filter @rede-social/module-dashboard typecheck && pnpm --filter @rede-social/web typecheck && pnpm --filter @rede-social/web exec vitest run i18n/messages.test.ts && bash scripts/check-ui-literals.sh && ! grep -rnE "overflow-x-(auto|scroll)" packages/modules/dashboard/ui apps/web/components/dashboard apps/web/app/painel-preview && pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts</automated>
  </verify>
  <done>Levels 1–3 render their full reference content in order with the shared chrome and level navigation; tables are cards on phone and tables from md; statuses are icon + text; module tests, typechecks, the literal guard and the preview Playwright run (3 levels × 3 widths + desktop case) are green.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: tenant levels 4–7 + staff function simulator + module README + full Definition of Done</name>
  <files>packages/modules/dashboard/ui/CohortHeatmap.tsx, packages/modules/dashboard/ui/ActionCard.tsx, packages/modules/dashboard/ui/scale.ts, packages/modules/dashboard/ui/index.ts, packages/modules/dashboard/fixtures/tenant-panels.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/tests/tenant-widgets.test.tsx, packages/modules/dashboard/tests/scale.test.ts, packages/modules/dashboard/README.md, apps/web/lib/dashboard-preview.ts, apps/web/lib/dashboard-preview.test.ts, apps/web/components/dashboard/TenantOwnerPanel.tsx, apps/web/components/dashboard/TenantAdminPanel.tsx, apps/web/components/dashboard/TenantStaffPanel.tsx, apps/web/components/dashboard/MemberPanel.tsx, apps/web/app/painel-preview/[nivel]/page.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>reference-prototype.html lines 389–462 and 465–505; packages/modules/store/README.md (headings and tone); apps/api/tests/unit/module-readmes.test.ts (MODULE_HEADINGS, lines 23–33)</read_first>
  <behavior>
    - heatBucket(v) maps a 0–100 percent to one of a fixed set of static brand-opacity classes (monotonic: a higher percent never gets a lighter bucket); the strongest bucket switches the cell text to the on-brand ink; every cell prints its percent, so the value is never colour alone; empty cohort cells render empty.
    - ActionCard renders icon + title + detail, an optional ToneLabel pill, an optional action slot, an optional unread dot with an sr-only label passed by the caller, and a chevron when it is a navigable row; it renders nothing of its own in words.
    - parseStaffFunctions(searchParams): no `simular` param -> the reference default {atendimento, moderacao}; `simular=1` with no `funcoes` -> empty set; `funcoes` as a string or repeated param keeps only the allow-listed ids atendimento|moderacao|conteudo|loja in canonical order; unknown ids are dropped; the active tab is `aba` when it is one of the granted functions, else the first granted one, else null.
  </behavior>
  <action>
Finish the four tenant-side levels (CONTEXT items 4–7) in the app's own 680 px column (`mx-auto w-full md:max-w-[680px]`, the AppShell column width), make the level map exhaustive, document the module, and run the whole Definition of Done.

1. Module primitives. `CohortHeatmap.tsx`: rows `{ label, values: (number | null)[] }`, column headers, `caption`; a CSS grid with `heatBucket` classes (add `heatBucket` to `scale.ts`) and the percent text in each cell. `ActionCard.tsx`: the member "Para você" card per reference lines 456–458. Export both; tests in `tests/tenant-widgets.test.tsx` and `tests/scale.test.ts` for the behavior block.
2. Fixtures (D-01). `fixtures/tenant-panels.ts` exports `tenantOwnerPanel`, `tenantAdminPanel`, `tenantStaffPanel` and `memberPanel` with the reference values (lines 394–461, 466, 483–493): the 12-week interacting-members series + previous 12 weeks, interaction channels, the 4 cohorts, account facts (plan, domain status, a clearly fictional domain for the Igor Alves tenant, admins/staff counts), admin attention items, KPIs, top posts (ISO dates + type ids + community names + counts), the four collapsible sections' data (events attendance, communities, store products with order counts and prices in cents, moderation counts), per-function staff blocks (support queue, moderation comments, content posts, store purchases) with per-function counts for the tab badges, and the member's profile + 3 action cards. The tenant of every tenant-side panel is `previewTenant.displayName`. Data only, no UI copy; money in cents (formatted with `formatBrl`).
3. Panels (server components as in Task 2). `TenantOwnerPanel`: header (tenant name, "Visão do dono", period chip), 5 KPIs (members, interacting % + sparkline, new-member retention, event attendance, order value with the "valor registrado, sem pagamento real" note), the 12-week LineChart with previous period dashed + a legend whose swatches repeat the solid/dashed stroke (pattern, not colour alone), "Onde os membros interagem" BarList, retention by join month — on phone a single KPI card (latest cohort's month-1 retention), from `md` the CohortHeatmap — and a closed `Collapsible` "Conta". `TenantAdminPanel`: "Atenção" AttentionList FIRST (danger 26h, warning "Hoje 19h", warning 5h), 6 KPIs, "Posts que mais renderam (14 dias)" ResponsiveTable (Comunidade hidden on phone), then collapsible Eventos (BarList max 100 + footnote), Comunidades, Loja, Moderação (a KPI grid inside). `TenantStaffPanel`: reads the parsed functions; above the blocks, a simulator `<form method="get">` with a hidden `simular=1`, one labelled checkbox per function (pre-checked from the parsed state) and a submit button ("Simular"), so it works with zero client JS; with 2+ granted functions a wrapping row of `Chip` links (`?simular=1&funcoes=…&aba=<id>`) each with its count `Badge`, `active` + `aria-current` on the current tab; with exactly 1 the block alone; with 0 an `EmptyState` ("Nenhuma função marcada" + the reference sentence). Each block per reference lines 486–493 (row actions like "Remover" are disabled buttons tied to the note). `MemberPanel`: profile head (initials avatar + name + "Membro desde …" formatted with Intl) and "Para você" with up to 3 ActionCards (event with "Começa em 40 min" warning pill + disabled "Fazer check-in", support reply with unread dot, VIP community unlocked by purchase); a card whose fixture entry is absent is not rendered (CONTEXT: each card hides when empty). Do not port the reference's ghost post grid or bottom nav.
4. Route. Add `parseStaffFunctions` to `lib/dashboard-preview.ts` (+ tests). In `[nivel]/page.tsx` accept `searchParams`, replace the partial switch with an exhaustive map keyed by every `PREVIEW_LEVELS` slug (typed so a missing level fails typecheck), and pass the parsed staff state to `TenantStaffPanel` only.
5. Catalog: every new string in `dashboard.json` (levels 4–7 chrome: role, question, usage, status, missing bullets exactly as reference lines 391–452; all panel copy; ICU plurals for counts and relative times like "há {count, plural, one {# dia} other {# dias}}").
6. README (MOD-05). `packages/modules/dashboard/README.md` in English like the other modules, with the module-readme headings in order (Contracts, Events emitted, Events consumed, Flag key, Kernel dependencies, Navigation, Jobs, Reuse) — stating none for events/flag/nav/jobs because the module has no manifest yet — plus a "Preview" section: the URL `http://localhost:3000/painel-preview`, the exact dev command with the three placeholder env vars, that the route exists only outside production (proxy + notFound), that all data is fictional fixtures shaped like future API answers, and the Playwright check command.
7. E2E: append the four tenant slugs; add staff cases — default URL shows the 2-tab row, `?simular=1&funcoes=atendimento` shows no tab row and the support block, `?simular=1` shows the empty state. Every level × [360, 390, 430] keeps the no-horizontal-scroll assertion.
8. Definition of Done (project + ~/.claude/CLAUDE.md): with the placeholder env exported run `pnpm lint`, `pnpm typecheck` (builds web first), `pnpm test`, `pnpm boundaries`, `pnpm check:static-routes` (needs the build from typecheck), the preview Playwright run, and the production proof — `pnpm --filter @rede-social/web exec next start -p 3001` in the background, then `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:3001/painel-preview/dono-da-plataforma` must print `307` with a `/entrar` location; stop the server afterwards. Format with `pnpm biome check --write` on the touched files before linting. Then run (or, if subagents cannot be launched, offer) the `critic` and `flow-critic` reviews and resolve or justify each finding in the SUMMARY; anything not done goes in the SUMMARY's NÃO FEITO block.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm lint && pnpm typecheck && pnpm test && pnpm boundaries && pnpm check:static-routes && ! grep -rnE "overflow-x-(auto|scroll)" packages/modules/dashboard/ui apps/web/components/dashboard apps/web/app/painel-preview && test ! -e packages/modules/dashboard/module.ts && pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts</automated>
    <human-check>Open http://localhost:3000/painel-preview on a 390 px window and on desktop, walk the 7 levels and the staff simulator, and compare content, order and hierarchy with reference-prototype.html; confirm the blue Igor Alves brand (light and dark theme) and that "Dados de exemplo" is visible on every level.</human-check>
  </verify>
  <done>All 7 levels render their reference content with the chrome, in the Igor Alves brand, with no horizontal scroll at 360–430 px; the staff simulator covers 0/1/2+ functions; production returns 307 to /entrar for the preview URL; lint (incl. UI literal guard), typecheck, all unit tests, boundaries, static-routes gate and the preview Playwright run are green; README documents the module and how to open the preview; critic/flow-critic findings are resolved or justified.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser -> proxy.ts | Anonymous requests reach the new dev-only public prefix |
| URL -> preview page | `nivel` path segment and `simular`/`funcoes`/`aba` query params are untrusted input |
| build -> production runtime | NODE_ENV decides whether the preview exists at all |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-jqy-01 | Elevation of privilege | proxy.ts private-route rule | high | mitigate | The prefix is public only when `dashboardPreviewEnabled()` (NODE_ENV !== 'production', read per request); anchored regex `^\/painel-preview(?:\/|$)`; `PUBLIC` array untouched; proxy.test proves production 307s to /entrar and `/painel-previewx` stays private in dev |
| T-jqy-02 | Information disclosure | app/painel-preview layout + pages | medium | mitigate | `await connection()` then `notFound()` under production in the layout AND each page (layouts and pages render concurrently); `pnpm check:static-routes` proves nothing is prerendered; `next start` + curl proves 307 to /entrar |
| T-jqy-03 | Tampering | `nivel`, `simular`, `funcoes`, `aba` | low | mitigate | Allow-list parsing (`previewLevel`, `parseStaffFunctions`); unknown slug -> notFound, unknown ids dropped; values are never echoed into markup or URLs except the allow-listed ids |
| T-jqy-04 | Spoofing | fixture tenant brand | low | accept | Fictional fixture scoped to the preview route, no real tenant data, no API/DB access; the real brand path (bootstrap) is unchanged |
| T-jqy-05 | Repudiation / misuse | fictional numbers read as real | low | mitigate | Persistent "Dados de exemplo" note on every level (D-07); every action is a disabled button tied to that note |
| T-jqy-SC | Tampering | pnpm install | low | accept | No new registry package: only a `workspace:*` link and versions copied from existing module manifests; `pnpm install --offline`; lockfile diff reviewed to contain only the new importer |
</threat_model>

<verification>
Run with the placeholder env exported (`API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder`):
1. `pnpm lint` (Biome in every package + `scripts/check-ui-literals.sh`: no hex/pt-BR/attribute literals in .tsx, catalog root key = filename) — green.
2. `pnpm typecheck` (builds web, then typechecks every package) — green.
3. `pnpm test` (all unit suites, incl. `packages/modules/dashboard`, `apps/web` proxy/helper/catalog tests and `apps/api` module-readmes) — green.
4. `pnpm boundaries` — green (module depends only on kernel/contracts/tooling; web -> module allowed).
5. `pnpm check:static-routes` after the build — green.
6. `pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts` — every level at 360/390/430 px has `scrollWidth <= clientWidth`, table-vs-cards at md, staff simulator states.
7. Production proof: `next start -p 3001` + curl of `/painel-preview/dono-da-plataforma` -> `307` to `/entrar`.
8. Absence checks: no `module.ts` in the module; no x-axis overflow utility under the module UI, `apps/web/components/dashboard` or `apps/web/app/painel-preview`; hex values appear only in `fixtures/preview-tenant.ts` and test files (`grep -rlE "#[0-9a-fA-F]{6}" packages/modules/dashboard apps/web/components/dashboard apps/web/app/painel-preview --exclude-dir=node_modules`).
9. critic + flow-critic reviews run or offered (user DoD), findings resolved or justified in the SUMMARY.
</verification>

<success_criteria>
- `pnpm --filter @rede-social/web dev` alone (placeholder env, no API, no Supabase, no session) serves all 7 levels under `/painel-preview/<nivel>`, each marked "Dados de exemplo".
- Production never serves the preview (proxy keeps it private; layout/page 404), proven by a unit test and by `next start` + curl; no other auth/tenant check changed.
- The page wears the Igor Alves brand via fixture tenant record -> resolveBranding -> brandScope -> `[data-brand-root]`; hex only in that fixture.
- No horizontal scroll at 360–430 px on any level; KPI 2-column wrapping grid on phone; tables become stacked cards below md.
- All strings from `dashboard.json` (pt-BR with accents), statuses icon + text, SVG charts to scale with token colours, no chart library added.
- lint, typecheck, unit tests, boundaries, static-routes gate and the preview Playwright check all green.
</success_criteria>

<output>
Create `.planning/quick/261011-jqy-criar-pre-visualizacao-dos-paineis-de-mo/261011-jqy-SUMMARY.md` when done, including the exact commands run with their results, the dev command with placeholder env, and a NÃO FEITO block for anything left undone.
</output>
