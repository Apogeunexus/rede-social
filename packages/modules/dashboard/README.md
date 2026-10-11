# @rede-social/module-dashboard

The access-level dashboards (quick 261011-jqy), in their PREVIEW stage: presentational panel
primitives and FICTIONAL fixtures for the 7 levels (platform owner, platform admin, platform support,
tenant owner, tenant admin, tenant staff, member). Nothing here reads a database or calls an API;
real data is wired later, panel by panel, and the fixtures are shaped like the API answers they will
become (counts, percents as numbers, enum ids, ISO dates, money in integer cents — never UI copy).

The module has no manifest (`module.ts`) yet: it is not a tenant-toggled feature, has no route of its
own and is not in the API `MODULE_REGISTRY`.

## Contracts

The package's `exports` map is the whole public surface; nothing else may be imported.

| Subpath | What it holds |
|---|---|
| `./ui` | `KpiCard`, `KpiGrid`, `Sparkline`, `LineChart`, `BarList`, `ToneLabel`, `AttentionList`, `ResponsiveTable`, `Collapsible`, `CohortHeatmap`, `ActionCard`, and the pure scale helpers `linearPoints`, `pathFrom`, `niceBounds`, `barPercent`, `funnelRates`, `largestDrop`, `heatBucket` / `HEAT_BUCKETS` |
| `./fixtures` | `previewTenant` (the Igor Alves tenant: display name + a `TenantBranding` record, the only colour values of the package), `platformOwnerPanel`, `platformAdminPanel`, `platformSupportPanel`, `tenantOwnerPanel`, `tenantAdminPanel`, `tenantStaffPanel`, `memberPanel`, with an exported type per shape |

UI rules (MOD-02, PWA-03, UI-03): a component holds no route, no clock and no words — every string,
href and formatted value is a prop decided by the web tier (`apps/web/components/dashboard`, copy in
`apps/web/messages/pt-BR/dashboard.json`). Colours only through token utilities and `currentColor`;
every status is an icon plus text; charts are plain SVG drawn to scale (series in brand, previous
period dashed in the tertiary text token); nothing scrolls sideways (KPI rows wrap, tables become
stacked cards below `md`).

## Events emitted

None.

## Events consumed

None.

## Flag key

None: the module has no manifest yet.

## Kernel dependencies

- `@rede-social/ui` (`Card`, `StatusPill`, `cn`)
- `@rede-social/contracts/branding` (the `TenantBranding` type of the preview tenant)

## Navigation

None. The preview route lives in the web app (see Preview below) and is not in any app menu.

## Jobs

None.

## Reuse

Presentational only: another host renders the primitives with its own strings and data. See
packages/reuse-fixture for how a module is consumed outside this app.

## Preview

Open <http://localhost:3000/painel-preview> (it redirects to the first level; every level is
`/painel-preview/<nivel>`, and the staff level takes `?simular=1&funcoes=atendimento&funcoes=loja&aba=loja`).
It needs only the web dev server — no API, no Supabase, no session. The web env validates at import
time, so give it three safe local placeholders (nothing listens there; the preview never calls them):

```bash
API_URL=http://127.0.0.1:8787 \
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder \
pnpm --filter @rede-social/web dev
```

The route exists only outside production: `proxy.ts` treats `/painel-preview/*` as public only when
`NODE_ENV` is not `production` (otherwise an anonymous request 307s to `/entrar`), and the preview
layout and pages call `notFound()` in production. All data is fictional and the page says so
("Dados de exemplo"); every action is a disabled button.

The no-horizontal-scroll check (all 7 levels at 360/390/430 px, table vs cards, the staff simulator)
runs with the installed Google Chrome and starts the dev server itself:

```bash
pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts
```
