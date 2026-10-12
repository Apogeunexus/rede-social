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
| `./ui` | `KpiCard`, `KpiGrid`, `Sparkline`, `LineChart`, `BarList`, `ToneLabel`, `AttentionList`, `ResponsiveTable`, `Collapsible`, `CohortHeatmap`, `ActionCard`, the pure scale helpers `linearPoints`, `pathFrom`, `niceBounds`, `barPercent`, `funnelRates`, `largestDrop`, `heatBucket` / `HEAT_BUCKETS`, and the pure metric helpers (`ui/metrics.ts`): `ENGAGEMENT_BAND_ORDER`, `bandTotal`, `interactedCount`, `interactedPercent`, `engagedPercent`, `percentOf`, the privacy floor `PRIVACY_FLOOR` / `isBelowPrivacyFloor`, `mergeBandsBelowFloor` / `BandGroup` (bands under the floor merged with a neighbour, so none is recoverable by subtracting from the total) and `isComplementBelowPrivacyFloor` (a shown count whose complement would be under the floor), `NEW_MEMBER_DAYS` / `isNewMember`, `vsMedian`, `MIN_STREAK_WEEKS`, and the member's card priority `FOR_YOU_PRIORITY` / `MAX_FOR_YOU_CARDS` / `selectForYouCards` |
| `./fixtures` | `previewTenant` (the Igor Alves tenant: display name + a `TenantBranding` record, the only colour values of the package), `platformOwnerPanel`, `platformAdminPanel`, `platformSupportPanel`, `tenantOwnerPanel`, `tenantAdminPanel`, `tenantStaffPanel`, `memberPanel`, with an exported type per shape, and the shared shapes in `fixtures/shared.ts`: `Delta`, the engagement model (`EngagementBand`, `EngagementBands`: six exclusive bands of the active members, with the counted actions and band rules in its doc comment) and `NotMeasured` / `NotMeasuredReason`. A metric the app does not collect yet is typed `NotMeasured`, which has no value field: it renders as "Ainda não medido" with the reason, never as a number |

UI rules (MOD-02, PWA-03, UI-03): a component holds no route, no clock and no words — every string,
href and formatted value is a prop decided by the web tier (`apps/web/components/dashboard`, copy in
`apps/web/messages/pt-BR/dashboard.json`). Colours only through token utilities and `currentColor`;
every status is an icon plus text; charts are plain SVG drawn to scale (series in brand, previous
period dashed in the tertiary text token); nothing scrolls sideways (KPI rows wrap, tables become
stacked cards below a 48rem container — an `@3xl` container query, so the host must wrap a panel in
an `@container`; the preview's `PhoneMockup` does this, and without one the cards layout stays).

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

The preview check runs with the installed Google Chrome and starts the dev server itself. It covers
every level inside the iPhone 17 Pro Max frame at 1440x900 (and the fit at 1024x768), the absence of
the frame and of horizontal scroll at 360/390/430 px (also with every collapsible open, and inside
the phone screen), table vs cards, the staff simulator, the alerts bell, and the engagement and
activity metrics of each level (band order, computed percents, the member's card priority). On
platform support the floor merges any band under 5 with a neighbour (every row ≥ 5, the rows sum to
the exact total) and hides the "nunca agiram" complement when it is under 5. An unmeasured metric
shows as a `MissingKpi` ("Ainda não medido") when it stands alone, and as the grouped, closed
"Métricas que dependem de coleta" list on level 5; the member only ever gets measured cards:

```bash
pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts
```
