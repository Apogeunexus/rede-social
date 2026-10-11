---
phase: quick-261011-jqy
plan: 01
status: complete
subsystem: dashboard (preview)
tags: [dashboard, preview, fixtures, module, next-intl, pt-BR, tenant-brand, responsive, svg-charts]
requires: [packages/ui, packages/contracts/branding, packages/contracts/money, apps/web brand-scope, apps/web proxy]
provides:
  - "@rede-social/module-dashboard (./ui, ./fixtures)"
  - "/painel-preview/<nivel> dev-only preview of the 7 access-level panels"
affects: [apps/web/proxy.ts, apps/web/package.json, pnpm-lock.yaml]
tech-stack:
  added: []
  patterns:
    - "Fixture tenant record -> resolveBranding -> brandScope -> [data-brand-root] (same path as (app)/layout)"
    - "Dev-only public prefix in proxy.ts gated by dashboardPreviewEnabled() + notFound() in layout/pages after connection()"
    - "Zero-JS GET form simulator with allow-listed query parsing"
key-files:
  created:
    - packages/modules/dashboard/{package.json,tsconfig.json,vitest.config.ts,turbo.json,README.md}
    - packages/modules/dashboard/fixtures/{index,shared,preview-tenant,platform-panels,tenant-panels}.ts
    - packages/modules/dashboard/ui/{index,scale}.ts
    - packages/modules/dashboard/ui/{KpiCard,Sparkline,ToneLabel,LineChart,BarList,AttentionList,ResponsiveTable,Collapsible,CohortHeatmap,ActionCard}.tsx
    - packages/modules/dashboard/tests/{scale.test.ts,fixtures.test.ts,kpi-card.test.tsx,charts.test.tsx,lists.test.tsx,tenant-widgets.test.tsx}
    - apps/web/lib/dashboard-preview.ts
    - apps/web/lib/dashboard-preview.test.ts
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/app/painel-preview/{layout.tsx,page.tsx,[nivel]/page.tsx}
    - apps/web/components/dashboard/{format.ts,PanelHeader,PanelSection,PreviewChrome,TenantColumn,PlatformOwnerPanel,PlatformAdminPanel,PlatformSupportPanel,TenantOwnerPanel,TenantAdminPanel,TenantStaffPanel,MemberPanel}.tsx
    - apps/web/playwright.preview.config.ts
    - apps/web/e2e-preview/painel-preview.spec.ts
  modified:
    - apps/web/proxy.ts
    - apps/web/proxy.test.ts
    - apps/web/package.json
    - pnpm-lock.yaml
decisions:
  - "Preview gate = NODE_ENV !== 'production' read per call; proxy treats /painel-preview/* as public only then; layout + pages notFound() in production after connection()"
  - "Fixtures are raw data shaped like future API answers (enum ids, numbers, ISO dates, cents); all copy lives in dashboard.json"
  - "Derived figures (funnel rates, stuck step, shares, moderation total) are computed from the data, never hand-typed from the reference"
  - "Module names prefer the app's own <key>.nav label (moduleLabelResolver) with a dashboard catalog fallback"
metrics:
  duration: "~25 min (commits 14:36–14:54, 2026-10-11)"
  completed: 2026-10-11
actuals:
  tokens: 50000
  tasks: 3
  commits: 5
---

# Phase quick-261011-jqy Plan 01: Access-level panels preview Summary

A dev-only `/painel-preview/<nivel>` route renders all 7 access-level dashboards with fictional fixtures. The panels use the Igor Alves tenant brand, applied through the app's real brand-scope mechanism, and every string comes from the pt-BR catalog. There is vertical scroll only at 360–430 px, all charts are plain SVG in token colours, and a new module package `@rede-social/module-dashboard` holds the primitives and fixtures. The route does not exist in production: the proxy answers 307 to `/entrar`, and the layout and pages call `notFound()`.

## How to open it

```bash
API_URL=http://127.0.0.1:8787 \
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder \
pnpm --filter @rede-social/web dev
# then http://localhost:3000/painel-preview
```

The three env vars are safe local placeholders. Nothing listens on them and the preview never calls them; `lib/env.ts` just requires them at import time. No API, Supabase or session is needed.

## Commits

| Task | Commit | What |
|------|--------|------|
| 1 (tracer) | 45ba56f7 | Module package, Igor Alves fixture brand, dev-only proxy rule + tests, catalog, level-1 KPI row, preview Playwright config |
| 2 RED | 28842b04 | Failing tests for chart/list primitives + funnelRates |
| 2 GREEN | b6504a7f | Primitives (ToneLabel, LineChart, BarList, AttentionList, ResponsiveTable, Collapsible), levels 1–3 complete, preview chrome + level nav |
| 3 RED | 0a8aa7ca | Failing tests for heatBucket, CohortHeatmap, ActionCard, parseStaffFunctions |
| 3 GREEN | 48e70d7a | Tenant levels 4–7, staff simulator, exhaustive level map, module README |

## Verification (all run with the placeholder env exported, real output)

| Check | Command | Result |
|---|---|---|
| Lint (Biome in every package + UI literal guard) | `pnpm lint` | exit 0; 16/16 tasks; `check-ui-literals: OK` (both lines) |
| Typecheck (builds web first) | `pnpm typecheck` | exit 0; 18/18 tasks; build lists `ƒ /painel-preview` and `ƒ /painel-preview/[nivel]` (dynamic) |
| Unit tests | `pnpm test` | exit 0; 15/15 tasks; web 112 files / 2380 tests, module-dashboard 6 / 48, api 7 / 60 (incl. module-readmes), all others green |
| Boundaries | `pnpm boundaries` | "Checked 1261 files in 16 packages, no issues found" |
| Static routes gate | `pnpm check:static-routes` | "guarded routes checked: 74 · offenders: 0 · OK" |
| Preview Playwright (Google Chrome, `next dev` only) | `pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts` | 30 passed: 7 levels × 360/390/430 px (note visible, `scrollWidth <= clientWidth`), table at 1280 / cards at 390, level nav `aria-current`, staff simulator 2+/1/0 functions, form submit + tab switch, unknown ids dropped, unknown level 404 |
| Production proof | `next start -p 3001` + curl | `/painel-preview/dono-da-plataforma -> 307 http://localhost:3001/entrar`; same for `/painel-preview` and `/painel-preview/membro`; server stopped |
| Absence checks | grep/test | no `overflow-x-(auto\|scroll)` under module UI, `components/dashboard`, `app/painel-preview`; no `packages/modules/dashboard/module.ts`; 6-digit hex only in `fixtures/preview-tenant.ts` and `tests/fixtures.test.ts` |
| Lockfile | `git diff pnpm-lock.yaml` (Task 1) | only the new `packages/modules/dashboard` importer + the web `link:` entry |

Not failures: during `pnpm typecheck`, the web build logs "Dynamic server usage … used `cookies`" for the existing `/eventos/check-in`, `/eventos/meus` and `/eventos/fotos` routes. Those are Next's informational messages about routes that were already dynamic; the build exits 0. None of those files is touched by this diff.

## Screenshots (not committed)

- `.planning/quick/261011-jqy-criar-pre-visualizacao-dos-paineis-de-mo/screens/{dono-da-plataforma,admin-da-plataforma,suporte-da-plataforma,dono-do-cliente,admin-do-cliente,equipe-do-cliente,membro}-390-light.png`
- `.planning/quick/261011-jqy-criar-pre-visualizacao-dos-paineis-de-mo/screens/admin-do-cliente-390-dark.png`

## Deviations from Plan

### Auto-fixed Issues

1. **[Rule 3 - Blocking] `pnpm install --offline` failed.** The local pnpm metadata cache has no entry for `@vitest/coverage-v8@5.0.0`, an existing root dependency. I fell back to `pnpm install`, as the plan allows. No new registry package was added, and the lockfile diff holds only the new importer and the web link. (Task 1, 45ba56f7)
2. **[Rule 1 - Bug] BarList tracks did not line up on desktop.** Each row was its own grid, so its `auto` value column had a different width. The rows now share one grid, with a subgrid per row. (Task 2, b6504a7f)
3. **[Rule 1 - Bug] A status pill overflowed the half-width "Falhas nas últimas 24h" table on desktop.** `table-fixed` ignores content minimums, so ResponsiveTable now uses `table-auto`. Long text still breaks with `overflow-wrap:anywhere`. (Task 2)
4. **[Rule 1 - Test bug] The table-vs-cards e2e locator also matched the "Atenção" row** that mentions the same client. It is now scoped to the client card, which carries the column labels; no assertion was weakened. (Task 2)
5. **[Rule 2 - Correctness] Figures are computed instead of copied from the reference:**
   - Activation rates show as `62,5%`.
   - The stuck step comes from the new tested `largestDrop` helper.
   - The moderation summary reads "4 ações": the reference says 3, but its own breakdown (2+1+0+1) sums to 4.
   - The support error list's summary reads "3 mais recentes de 9" instead of a bare "9", so three rows never silently stand for nine.
6. **Helper files added beyond the plan's list:** `fixtures/shared.ts` (shared types), `components/dashboard/format.ts` (Intl formatting, delta/hint mapping, module names), `PanelSection.tsx` (section + disabled `PreviewAction`) and `TenantColumn.tsx` (680 px column).
7. **Module label for `chat`** is the app's own nav label "Suporte" (`moduleLabelResolver`, as planned), not the reference's "Chat de suporte".
8. **Destructive affordance:** the staff moderation "Remover" buttons use the danger variant (disabled), following the flow rule that destructive controls signal danger.

Operational note: `loadMessages()` memoizes the catalog per process. A `next dev` started before `dashboard.json` changes keeps serving the old catalog (MISSING_MESSAGE) until it restarts. This is existing behaviour and not changed.

## Known Stubs

All panel data is intentional fictional fixture data (CONTEXT decision 1, "Dados de exemplo" shown on every level). Every action is intentionally a disabled button tied to that note. Real data is wired later, panel by panel, which is out of scope here.

## Threat Flags

None beyond the plan's threat model. The only new network surface is the dev-only `/painel-preview/*` prefix, which T-jqy-01/02 cover; the tests and the production curl prove it.

## Reviews

Run by the orchestrator after the merge (2026-10-11):

- **critic: APPROVED**, nothing blocking. LOW: no test drives the signed-in production path to the page `notFound()` (code order verified: `connection()` then the gate); fixed LOW: `generateMetadata` now honours the same gate (6fca804b).
- **flow-critic: APPROVED**, nothing blocking. Fixed in 6fca804b: period chip made a static pill, the do-nothing "Filtros" chip removed, chevrons on rows without a destination removed, staff header hidden when no function is granted. Recorded for the real panels: empty states in AttentionList/BarList/ResponsiveTable, confirmation before "Remover", focusable reason for disabled actions.

After the fixes: pnpm lint OK, pnpm typecheck 18/18, pnpm test 15/15, pnpm boundaries no issues, preview Playwright 30/30.

## Self-Check: PASSED

All created files listed above exist in the worktree, and commits 45ba56f7, 28842b04, b6504a7f, 0a8aa7ca and 48e70d7a are on branch `worktree-agent-a53c232cfe58f1a39`.

**⚠️ NÃO FEITO**
- critic review (hostile behavioural review): no subagent tool in this executor session. To close: the orchestrator runs `critic` on commits 45ba56f7..48e70d7a ("rodo o critic?").
- flow-critic review (flow completeness): same reason. To close: run `flow-critic` on the same range ("rodo o flow-critic?").
- Human visual check (plan `<human-check>`): walk the 7 levels at 390 px and on desktop, in light and dark, against `reference-prototype.html`. Only automated checks and the screenshots above were done.
