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
| `./ui` | `KpiCard`, `KpiGrid`, `Sparkline`, `LineChart`, `BarList`, `ToneLabel`, `AttentionList`, `ResponsiveTable`, `Collapsible`, `CohortHeatmap`, `ActionCard`, the pure scale helpers `linearPoints`, `pathFrom`, `niceBounds`, `barPercent`, `funnelRates`, `largestDrop`, `heatBucket` / `HEAT_BUCKETS`, and the pure metric helpers (`ui/metrics.ts`): `ENGAGEMENT_BAND_ORDER`, `bandTotal`, `interactedCount`, `interactedPercent`, `engagedPercent`, `percentOf`, the privacy floor `PRIVACY_FLOOR` / `isBelowPrivacyFloor`, `mergeBandsBelowFloor` / `BandGroup` (bands under the floor merged with a neighbour, so none is recoverable by subtracting from the total) and `isComplementBelowPrivacyFloor` (a shown count whose complement would be under the floor), `NEW_MEMBER_DAYS` / `isNewMember`, `vsMedian`, `MIN_STREAK_WEEKS`, the member's card priority `FOR_YOU_PRIORITY` / `MAX_FOR_YOU_CARDS` / `selectForYouCards`, and `totalMinutes` / `dailyAverageMinutes` (the member report's week total and daily average). `KpiCard` takes an optional `badge` (a small neutral pill next to the value, worded by the host) |
| `./fixtures` | `previewTenant` (the Igor Alves tenant: display name + a `TenantBranding` record, the only colour values of the package), `platformOwnerPanel`, `platformAdminPanel`, `platformSupportPanel`, `tenantOwnerPanel`, `tenantAdminPanel`, `tenantStaffPanel`, `memberPanel`, with an exported type per shape, and the shared shapes in `fixtures/shared.ts`: `Delta`, the engagement model (`EngagementBand`, `EngagementBands`: six exclusive bands of the active members, with the counted actions and band rules in its doc comment) and `NotMeasured` / `NotMeasuredReason`. A metric the app does not collect yet is typed `NotMeasured`, which has no value field: it renders as "Ainda não medido" with the reason, never as a number. The one bounded exception is the member's "Sua atividade" report (261012-h5t D-03): its metrics are `ReportValue<T>` = `MeasuredValue<T>` \| `ExampleValue<T>`, where `ExampleValue` carries a FICTIONAL value plus its `reason`; it always renders with the "exemplo" pill, and the reason is never shown to the member |

UI rules (MOD-02, PWA-03, UI-03): a component holds no route, no clock and no words — every string,
href and formatted value is a prop decided by the web tier (`apps/web/components/dashboard`, copy in
`apps/web/messages/pt-BR/dashboard.json`). Colours only through token utilities and `currentColor`;
every status is an icon plus text; charts are plain SVG drawn to scale (series in brand, previous
period dashed in the tertiary text token); nothing scrolls sideways (KPI rows wrap, tables become
stacked cards below a 48rem container — an `@3xl` container query, so the host must wrap a panel in
an `@container`; the preview's `PhoneMockup` does this, and without one the cards layout stays).

### Member report (level 7)

"Sua atividade" covers the member's last 7 complete São Paulo days (`memberPanel.activity`). Every
delta compares with the 7 days before and is neutral (`good: null`): the report describes, it never
grades. The metrics the app does not collect yet are typed `ExampleValue` and show a fictional value
with the "exemplo" pill until the collection below exists:

| Metric | Source today | What must be collected (reason) |
|---|---|---|
| Tempo de uso (média por dia, gráfico, total da semana) | none | App session start/end per member (`needs_usage_sessions`) |
| Horário em que você mais usa | none | The same app sessions, by São Paulo hour (`needs_usage_sessions`) |
| Salvamentos | none | Saves per member (`needs_saves`) |
| Compartilhamentos | none | Shares per member (`needs_shares`) |
| Posts vistos | none | Post views per member (`needs_post_views`) |
| Vídeos e reels (count and watch time) | none | Video playback per member (`needs_video_playback`) |
| Curtidas | `feed_likes` | measured |
| Comentários | `feed_comments` | measured |
| Stories vistos | the member's own `story_views` rows | measured |
| Onde você mais participa | the member's likes + comments joined to `feed_posts.community_id` | measured |
| Presença nos encontros | event check-ins vs confirmed RSVPs, last 30 days | measured |
| Sequência | weeks with at least one counted action | measured |
| Tempo por story | none | Time each story stays on screen (`needs_story_view_time`) |

#### Drill-down lists

Eight report cards open the list behind their number (`memberActivityLists`, in
`fixtures/member-lists.ts`): the web passes `?lista=<slug>` on the level-7 page, where the slug is one
of `curtidas`, `comentarios`, `salvamentos`, `compartilhamentos`, `posts-vistos`, `videos` and
`stories` (both video cards open `videos`). Anything else renders the report.

- **One table.** `memberPostTable` holds the 60 posts the member viewed in the window, in recency
  order. Likes, comments, saves and shares point at those posts and carry the post's last-seen
  moment, so no row contradicts another. Every list agrees with its card (46 / 12 / 9 / 3, 60 posts
  and 128 views via `totalViews`, 41 videos and 72 minutes via `totalWatchedSeconds`, 23 stories),
  and likes + comments per community equal "Onde você mais participa".
- **The "exemplo" rule.** The pill sits next to the example value it marks. An all-example list
  (saves, shares, posts, videos) has one pill next to its count; the stories list is measured
  (`story_views`) and only the time per story is example, so each row's time carries its own pill.
- **Own data only.** Rows hold the member's own actions; authors are the creator or a community.

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
"Métricas que dependem de coleta" list on level 5; the member's "Para você" only ever gets measured
cards, and level 7's "Sua atividade" report carries the "exemplo" pill exactly on its example
metrics (seven pills, none on a measured one):

```bash
pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts
```
