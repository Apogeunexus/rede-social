---
phase: quick-261012-fcr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/modules/dashboard/fixtures/shared.ts
  - packages/modules/dashboard/fixtures/platform-panels.ts
  - packages/modules/dashboard/fixtures/tenant-panels.ts
  - packages/modules/dashboard/fixtures/index.ts
  - packages/modules/dashboard/ui/metrics.ts
  - packages/modules/dashboard/ui/index.ts
  - packages/modules/dashboard/tests/metrics.test.ts
  - packages/modules/dashboard/tests/fixtures.test.ts
  - packages/modules/dashboard/README.md
  - apps/web/components/dashboard/format.ts
  - apps/web/components/dashboard/BandsBarList.tsx
  - apps/web/components/dashboard/MissingKpi.tsx
  - apps/web/components/dashboard/PlatformOwnerPanel.tsx
  - apps/web/components/dashboard/PlatformAdminPanel.tsx
  - apps/web/components/dashboard/PlatformSupportPanel.tsx
  - apps/web/components/dashboard/TenantOwnerPanel.tsx
  - apps/web/components/dashboard/TenantAdminPanel.tsx
  - apps/web/components/dashboard/TenantStaffPanel.tsx
  - apps/web/components/dashboard/MemberPanel.tsx
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, PWA-03, MOD-02]
tags: [dashboard, preview, fixtures, engagement, privacy, next-intl, pt-BR]

estimate:
  tokens: 150000
  raw_tokens: 150000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "D-05: the fixtures stop contradicting each other. Dr. Igor Alves has 1.240 members and 38% 'interagiu' on every level. The platform's 8.430 members split Instituto Aurora 3.110 · Rede Lab 1.760 · Dr. Igor Alves 1.240 · Escola Horizonte 1.210 · Outros 8 clientes 1.110, so the computed sentence reads 'O maior cliente concentra 37% dos membros.' The client admin's 'Membros que interagiram' is 380, the weekly chart's last point."
    - "D-01: one engagement model backs levels 1, 3 and 4. It has six exclusive bands (Novos, Superfãs, Engajados, Ocasionais, Em risco, Inativos) plus 'novos ativados'. Pure helpers compute band totals, 'interagiu' % and 'engajados' %. Unit tests prove the band sums equal the member KPIs (8.430, 1.240, 310) and the percents equal the KPIs and client rows that already show them (41%, 38%, 22%, 14%, 12%, 3%, 31%)."
    - "Levels 1–3 show spec items 1.1–1.5, 2.1–2.4 and 3.1–3.5 at the spec's positions. Band lists follow D-04: band order, max = members, rate = %, only 'Em risco' highlighted. The level-2 bell lists 5 alerts, including Escola Horizonte's drop from 17% to 12%."
    - "Levels 4–5 show spec items 4.1–4.6 and 5.1–5.6, plus the stories line '4 stories, média de 310 visualizações únicas (25%)'. 'Interações por post' is gone from the level-5 KPI grid. 'Quem compra' reads '72% das compras vêm de 22% dos membros (superfãs e engajados).'"
    - "Level 6 shows the per-function items: 1ª resposta 1h04, a 'Novo' tag on Rui Matos, removal rate 0,9% (2 de 214), 4 first comments, '+144%' / '+15%' / 'em andamento', 6 accesses expiring, conversion not measured. Level 7 shows the member's presence '3 de 4', the streak '6 semanas', and at most 3 'Para você' cards in priority order (for Ana: event, support reply, access expiring). The member never sees a band name."
    - "D-03 (one rule): a metric the app does not collect today has no number in the fixture or on screen. That covers post reach, engagement per view, saves, shares, video % watched and completion, product conversion, news since the last visit, and monthly revenue. It renders as a dashed KpiCard (inside a member card: a pill) reading 'Ainda não medido', with a catalog reason naming what must be collected."
    - "D-02: on level 3, every count of the client's members or their devices below 5 reads 'menos de 5'. That covers superfãs, blocked members and devices that refused push. Such bars are drawn at zero width. No segment list, buyer list or recovery card names a member."
    - "No horizontal scroll at 360/390/430 px or inside the 440 px phone screen, also with every collapsible open. These are green: pnpm lint (with check-ui-literals), typecheck, test, boundaries, check:static-routes and the full preview Playwright suite. proxy.ts and app/painel-preview are untouched."
  artifacts:
    - path: "packages/modules/dashboard/ui/metrics.ts"
      provides: "Pure helpers: band order/total, interagiu % and engajados %, percentOf, privacy floor, new-member rule, vs-median rule, streak minimum, 'Para você' priority selector"
      contains: "export function engagedPercent"
    - path: "packages/modules/dashboard/tests/metrics.test.ts"
      provides: "Unit tests of every helper in ui/metrics.ts"
    - path: "packages/modules/dashboard/fixtures/shared.ts"
      provides: "EngagementBand, EngagementBands, NotMeasuredReason, NotMeasured, the new DeltaBasis"
      contains: "NotMeasuredReason"
    - path: "packages/modules/dashboard/tests/fixtures.test.ts"
      provides: "Cross-level consistency: band sums = member KPIs, percents = KPIs/client rows, D-05 numbers"
      contains: "8430"
    - path: "apps/web/components/dashboard/BandsBarList.tsx"
      provides: "Band distribution as a BarList in band order, max = members, optional D-02 floor"
      contains: "BarList"
    - path: "apps/web/components/dashboard/MissingKpi.tsx"
      provides: "The single D-03 render: KpiCard variant missing + 'Ainda não medido' + catalog reason"
      contains: "variant=\"missing\""
    - path: "apps/web/messages/pt-BR/dashboard.json"
      provides: "All new pt-BR copy: bands.*, notMeasuredReason.*, belowFloor, per-level keys"
      contains: "notMeasuredReason"
    - path: "apps/web/e2e-preview/painel-preview.spec.ts"
      provides: "Per-level checks of the new metrics, 'menos de 5', 'Ainda não medido', no overflow with collapsibles open"
      contains: "menos de 5"
  key_links:
    - from: "apps/web/components/dashboard/{PlatformOwnerPanel,TenantOwnerPanel}.tsx"
      to: "packages/modules/dashboard/ui/metrics.ts"
      via: "KPI values and sentences computed from the bands (engagedPercent, percentOf), never typed"
      pattern: "engagedPercent\\("
    - from: "apps/web/components/dashboard/BandsBarList.tsx"
      to: "packages/modules/dashboard/ui/BarList.tsx"
      via: "max = bandTotal(bands), rows in ENGAGEMENT_BAND_ORDER, highlight only at_risk (D-04)"
      pattern: "max=\\{bandTotal"
    - from: "apps/web/components/dashboard/PlatformSupportPanel.tsx"
      to: "packages/modules/dashboard/ui/metrics.ts"
      via: "formatFloored / isBelowPrivacyFloor on every member or device count (D-02)"
      pattern: "formatFloored"
    - from: "apps/web/components/dashboard/MemberPanel.tsx"
      to: "packages/modules/dashboard/ui/metrics.ts"
      via: "selectForYouCards picks at most 3 cards by priority"
      pattern: "selectForYouCards"
    - from: "apps/web/components/dashboard/MissingKpi.tsx"
      to: "apps/web/messages/pt-BR/dashboard.json"
      via: "dashboard.notMeasured + dashboard.notMeasuredReason.<reason> (D-03)"
      pattern: "notMeasuredReason"
---

<objective>
Enrich the 7 dev-only preview panels (`/painel-preview/<nivel>`, branch `feat/painel-preview`, HEAD d94933ad) with the approved engagement and activity metrics:

- **Model.** One shared engagement model (D-01) holds the six bands, the privacy floor and the 'Para você' priority. Its pure helpers are unit-tested so every band sum and percent matches the KPIs the panels already show.
- **Fixtures.** The three fixture contradictions are fixed first (D-05).
- **Metrics.** Every spec item lands, levels 1.1 to 7.4, at its position.
- **Unmeasured metrics.** Anything the app cannot measure today follows ONE rule (D-03, resolved below).
- **Privacy.** Level 3 never shows a member or device count under 5 (D-02).

Purpose: the panels answer "how engaged is this base, who is slipping, and who buys", in place of raw activity counts. The numbers stay consistent from one level to the next, and a metric we do not collect never shows up as a number.

Output:
- Fixture types and data, a new `ui/metrics.ts` with tests, and two web helpers (`BandsBarList`, `MissingKpi`).
- 7 updated panels, pt-BR catalog keys, and extended preview e2e.
- Screenshots in this task's `screens/` folder (not committed).
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/261012-fcr-enriquecer-metricas-dos-7-paineis-com-fa/261012-fcr-CONTEXT.md
@.planning/quick/261011-ndw-alertas-viram-sininho-no-cabecalho-do-pa/261011-ndw-SUMMARY.md
@apps/web/AGENTS.md
@packages/modules/dashboard/README.md
@packages/modules/dashboard/fixtures/shared.ts
@packages/modules/dashboard/fixtures/platform-panels.ts
@packages/modules/dashboard/fixtures/tenant-panels.ts
@packages/modules/dashboard/ui/scale.ts
@packages/modules/dashboard/ui/KpiCard.tsx
@packages/modules/dashboard/ui/BarList.tsx
@apps/web/components/dashboard/format.ts
@apps/web/e2e-preview/painel-preview.spec.ts

<interfaces>
Verified on branch `feat/painel-preview`, HEAD d94933ad. All paths are relative to the repo root.

**Existing primitives (module `@rede-social/module-dashboard/ui`)**

- `KpiCard({ label, value, unit?, delta?, note?, chart?, variant?: 'default' | 'missing' })`. `missing` draws a dashed border and a muted value. Precedent: "Receita mensal" at `apps/web/components/dashboard/PlatformOwnerPanel.tsx:108-113`, with value `t('notMeasured')` ("Ainda não medido", `dashboard.notMeasured`).
- `KpiGrid` is `auto-fill minmax(9.5rem,1fr)`: 2 columns in the 440 px phone.
- `BarList({ rows: { id, label, value, display, highlight?, rate? }[], max?, className? })`:
  - Bars are drawn with `barPercent(value, max)`; the fill carries `data-bar-fill` and `style.width = "<n>%"`.
  - `highlight` gives the full `bg-brand` fill; other rows get `bg-brand/50`.
- `ResponsiveTable({ caption, columns: { key, header, numeric?, hideOnPhone? }[], rows })`: a table at `@3xl` container width, one card per row below it. The first column is the card title.
- `Collapsible({ title, summary?, open?, children })` is a native `<details>`, closed by default.
- `ActionCard({ icon, title, detail, pill?: { tone, text }, action?, unreadLabel? })`.
- `ToneLabel` tones: `success | warning | danger | neutral | brand`.
- `funnelRates` and `largestDrop` live in `ui/scale.ts`. They set the precedent for pure data helpers exported from `./ui`.

**Existing web helpers (`apps/web/components/dashboard/format.ts`)**

- Formatters: `formatCount`, `formatPercent(0–100)`, `formatRatio(0–1, one decimal)`, `formatDecimal(value, digits)`, `formatDayMonth`, `formatDuration(t, minutes)` ("1h04"), `formatList`, `kpiDelta(t, Delta)`, `hintDelta`, `momentText`, `moduleNamer`.
- `DashboardT` is the untyped `dashboard` translator.
- `PreviewAction({ children, variant? })` (disabled, described by the "Dados de exemplo" tag) lives in `apps/web/components/dashboard/PanelSection.tsx`.
- `formatBrl` comes from `@rede-social/contracts/money`.

**Package surface:** the `packages/modules/dashboard/package.json` exports are `./ui` and `./fixtures`. Do not add subpaths.

**Evidence for D-03 (what is and is not collected today)**, from the tables created in `supabase/migrations/*.sql`:

- Present: `story_views`, `push_subscriptions`, `store_orders`, `store_entitlements`, `event_attendances`, `tenant_invites`, `moderation_log`, `media_assets`. So story unique views, push reach, store value, attendance, invites and removals are real metrics.
- Absent: no post-view, post-save, post-share, video-playback, product-page-view or last-visit table. So those metrics are "Ainda não medido".
- `store_entitlements.expires_at` exists (`supabase/migrations/20261008171623_store.sql:45`), but it "is never set or read in 08.2" (`supabase/migrations/20261008190514_store_grants.sql:39`). The 'acesso vence' items are fixture-only until time-limited products exist.

**New contracts this plan creates.** The shapes are binding; the doc comments are up to the executor.

```ts
// packages/modules/dashboard/fixtures/shared.ts — additions
export type DeltaBasis = /* existing members */ | 'average_30_days'; // Task 2
export type EngagementBand = 'new' | 'superfan' | 'engaged' | 'occasional' | 'at_risk' | 'inactive';
export interface EngagementBands {
  /** Members (role member, status active) per exclusive band, evaluated in ENGAGEMENT_BAND_ORDER. */
  counts: Record<EngagementBand, number>;
  /** Novos (joined < 30 days) with at least one counted action. */
  newActivated: number;
}
export type NotMeasuredReason =
  | 'needs_billing_per_client' | 'needs_post_views' | 'needs_saves' | 'needs_shares'
  | 'needs_video_playback' | 'needs_product_page_views' | 'needs_last_visit';
/** A metric the app does not collect yet: there is deliberately no value field (D-03). */
export interface NotMeasured { measured: false; reason: NotMeasuredReason }

// packages/modules/dashboard/ui/metrics.ts — new, re-exported from ui/index.ts
export const ENGAGEMENT_BAND_ORDER: readonly EngagementBand[]; // new, superfan, engaged, occasional, at_risk, inactive
export function bandTotal(bands: EngagementBands): number;
export function interactedCount(bands: EngagementBands): number;   // superfan + engaged + occasional + newActivated
export function interactedPercent(bands: EngagementBands): number; // 0–100, unrounded
export function engagedPercent(bands: EngagementBands): number;    // (superfan + engaged) / total, 0–100, unrounded
export function percentOf(part: number, whole: number): number;    // 0–100, unrounded; 0 when whole <= 0
// Task 2
export const PRIVACY_FLOOR = 5;
export function isBelowPrivacyFloor(count: number): boolean;       // count < PRIVACY_FLOOR
// Task 3
export const NEW_MEMBER_DAYS = 30;
export function isNewMember(joinedDaysAgo: number): boolean;       // joinedDaysAgo < NEW_MEMBER_DAYS
export function vsMedian(interactions: number, median: number, ageHours: number, comparableAfterHours: number): number | null; // interactions / median - 1; null when ageHours < comparableAfterHours or median <= 0
export const MIN_STREAK_WEEKS = 2;
export type ForYouCard = 'event' | 'support' | 'access' | 'news' | 'community';
export const FOR_YOU_PRIORITY: readonly ForYouCard[]; // event, support, access, news, community
export const MAX_FOR_YOU_CARDS = 3;
export function selectForYouCards(forYou: MemberPanel['forYou']): ForYouCard[]; // present cards in priority order, at most 3
```

Fixture additions, per task. All are fictional, and every number is from CONTEXT "Fixture values":

- **Task 1, `tenantOwnerPanel`**
  - `kpis.engaged = { delta: { amount: 2, kind: 'points', direction: 'down', good: false, basis: 'none' }, actionsPerActiveMember: 9.3 }`
  - `engagement = { counts: { new: 96, superfan: 62, engaged: 205, occasional: 150, at_risk: 168, inactive: 559 }, newActivated: 54 }`
  - `movement = { up: 77, down: 171, flows: [{ from: 'at_risk', to: 'inactive', members: 64 }, { from: 'active', to: 'at_risk', members: 57 }, { from: 'engaged', to: 'occasional', members: 41 }, { from: 'occasional', to: 'engaged', members: 38 }] }`. The type of `from` is `EngagementBand | 'active'`.
  - `atRiskWithPush = 69`
  - `byFormat = [{ type: 'video', posts: 18, perPost: 96 }, { type: 'gallery', posts: 15, perPost: 71 }, { type: 'text', posts: 20, perPost: 48 }, { type: 'link', posts: 8, perPost: 23 }]`
  - `ordersByBand: Record<EngagementBand, number> = { new: 9, superfan: 31, engaged: 38, occasional: 14, at_risk: 3, inactive: 1 }`
- **Task 1, `tenantAdminPanel`**
  - `kpis.interacting.count = 380`
  - `kpis.newMembers` gains `activated: 15`
  - The `interactionsPerPost` KPI field is removed.
  - `kpis.enteredAtRisk = { count: 23, withPush: 9 }`
  - `postMetrics = { reach, engagementPerView, saves, shares }`, each a `NotMeasured`. The reasons are `needs_post_views`, `needs_post_views`, `needs_saves` and `needs_shares`.
  - `videos = { rows: [{ id: 'reel-1', date: '2026-10-09', kind: 'reel', durationSeconds: 41 }, { id: 'p1', date: '2026-10-08', kind: 'video', durationSeconds: 252 }, { id: 'reel-2', date: '2026-10-05', kind: 'reel', durationSeconds: 38 }], watched: NotMeasured(needs_video_playback), completion: NotMeasured(needs_video_playback) }`
  - `stories = { count: 4, averageUniqueViewers: 310, memberBase: 1240 }`
- **Task 1, D-05 in `platformOwnerPanel`**
  - `membersByClient`, in this order:
    - c-aurora 'Instituto Aurora' 3110
    - c-lab 'Rede Lab' 1760
    - c-igor `previewTenant.displayName` 1240
    - c-horizonte 'Escola Horizonte' 1210
    - others (clients 8) 1110
  - `clients` members: Corrida 310, Horizonte 1210, Lab 1760, Aurora 3110, Igor 1240. Igor's `interactedPercent` is 38.
  - `kpis.monthlyRevenue` is typed `NotMeasured`; its value is unchanged.
- **Task 2, `platformOwnerPanel`**
  - `kpis.engaged = { delta: { amount: 1, kind: 'points', direction: 'up', good: true, basis: 'previous_month' }, actionsPerActiveMember: 8.1 }`
  - `kpis.storeSales = { delta: { amount: 9, kind: 'percent', direction: 'up', good: true, basis: 'previous_month' }, byClient: [{ clientId: 'c-igor', cents: 894000 }, { clientId: 'c-aurora', cents: 544000 }] }`
  - `engagement = { counts: { new: 480, superfan: 380, engaged: 1440, occasional: 1340, at_risk: 1150, inactive: 3640 }, newActivated: 296 }`
  - `moduleUsage`, in the order of `moduleAdoption`: feed 96, communities 64, stories 38, events 31, chat 9, store 14.
  - `PlatformClientRow` gains `engagedPercent` and `atRiskPercent`: Corrida 3/31, Horizonte 12/24, Lab 18/19, Aurora 25/15, Igor 22/14.
- **Task 2, `platformAdminPanel`**
  - `ActivationStep` gains `'ten_active_members'`, appended `{ step: 'ten_active_members', clients: 2 }`.
  - `kpis.pushReach = { percent: 52 }`
  - `PlatformFailureRow` gains `stalledVideos`: Lab 2, Igor 0, Corrida 0.
  - `PlatformAdminPending` gains `{ id: string; kind: 'engagement_drop'; clientName: string; fromPercent: number; toPercent: number }`, appended as `{ id: 'p-horizonte-engagement', kind: 'engagement_drop', clientName: 'Escola Horizonte', fromPercent: 17, toPercent: 12 }`.
- **Task 2, `platformSupportPanel`**
  - `kpis.pendingInvites = { count: 37 }`
  - `kpis.newNeverActed7d = { count: 13, joined: 14 }`
  - `kpis.activity24h = { perHour: 2, averagePerHour: 6 }`
  - `engagement = { counts: { new: 22, superfan: 2, engaged: 8, occasional: 27, at_risk: 96, inactive: 155 }, newActivated: 1 }`
  - `pushReachPercent = 21`
- **Task 3, `tenantStaffPanel`**
  - `support.myFirstResponseMedianMinutes = 64`
  - Queue items gain `joinedDaysAgo`: Ana Souza 224, Rui Matos 9.
  - `moderation.comments7d = 214`, `moderation.firstCommentsFromNew24h = 4`. `removed7d` stays at 2.
  - `content.medianInteractions = 52`, `content.comparableAfterHours = 24`.
  - Each recent post gains `ageHours`: r1 26, r2 35, r3 12. This is consistent with a fixed "now" of today 20h for "ontem 18h", "ontem 09h" and "hoje 08h".
  - `store.expiringAccess7d = { count: 6, products: ['Comunidade VIP'] }`
  - `store.conversion = NotMeasured(needs_product_page_views)`
- **Task 3, `memberPanel`**
  - `profile.attendance = { attended: 3, events: 4 }`
  - `profile.weeklyStreak = 6`
  - `forYou.accessExpiring = { product: 'Comunidade VIP', daysLeft: 5 }`
  - `forYou.newSinceLastVisit = { community: 'Comunidade VIP', posts: NotMeasured(needs_last_visit) }`
</interfaces>
</context>

<planner_decisions>
These are the planner's resolutions where the CONTEXT left a choice or contradicts itself. The executor applies them and repeats them in the SUMMARY.

1. **D-03 resolved into ONE rule: "Ainda não medido", never a sample value.**
   - A metric the app does not collect today (see the evidence above) holds no number anywhere. It is typed `NotMeasured` (no value field) and renders one way: `MissingKpi`, the existing `KpiCard variant="missing"` with the metric name as label, `dashboard.notMeasured` as value, and `dashboard.notMeasuredReason.<reason>` (what must be collected) as note.
   - Unmeasured metrics are never per-row table cells or bar rows; repeating the same words N times would also push the 360 px cards. Where the spec places them as table columns (5.1–5.3, 5.4, 6 Conversão), they become a `KpiGrid` of missing cards directly under that table, one card per metric.
   - The only other surface is a member card (7.3). It has no KPI slot, so it carries the same catalog value as a neutral pill and the reason as its detail.
   - The CONTEXT example values (reach 612/49%, saves/shares, video 58%/34%, conversion 6/420, novidades 5 posts) are stored nowhere.
   - "Receita mensal" joins the same type and reason catalog.
2. **Level-1 KPI order.** "Membros engajados" is the 6th KPI (1.1) and "Vendas nas lojas dos clientes" the 7th, after "Receita mensal" (1.5). Both literal positions hold, but the grid has 7 cards, so "grid even" cannot also hold: 1.1 and 1.5 each add a card to the existing 5.
3. **"Quem compra" (4.5).** Each order counts in the band its buyer was in on the day before the order. Grouping orders by today's band would contradict the model: a 30-day order is itself a counted action, so its buyer can never be "em risco" or "inativo" today. With this rule the fixture's 3 and 1 orders are coherent (re-activation and win-back). X uses superfãs + engajados orders; Y is `engagedPercent` of the base.
4. **"vs. mediana" (level 6, Conteúdo).** A post is compared once it is at least 24 h old: the median of 52 is interactions per post at 24 h. A younger post reads "em andamento". The CONTEXT says "< 48h", but the section only lists posts from the last 48 h, so that rule would make all three "em andamento". The 24 h rule yields exactly the spec's outputs: +144%, +15%, em andamento.
5. **D-02 floor scope (level 3).** It covers every count of the client's members or their devices:
   - band counts
   - invites not accepted
   - novos who never acted, and the joined count
   - the existing "bloq." count (2 becomes "menos de 5")
   - the existing "aparelhos recusaram" count (3 becomes "Menos de 5 aparelhos…")
   It does NOT cover error counts, action rates (2/h), percents, days, module counts, or the client's own staff accounts. A below-floor bar is drawn with value 0 and no rate, so neither its width nor a percent can leak the true count.
6. **Level 7 priority (max 3: event > support reply > access expiring > novidades / comunidade liberada).** Ana's fixture has all five, so the locked rule renders event, support reply and access expiring. "Novidades desde sua última visita" and the "comunidade liberada" card are ranked out, and unit tests prove the selector, including novidades getting a slot when a higher card is absent. Level 7 therefore shows no "Ainda não medido" for Ana. To show 7.3 on screen, the user would change the fixture or the rule; that is not done here.
7. **Level 2 layout.** The failures table grows to 6 columns (2.4), so the activation funnel and the failures table stack full width at every container size (the 2-column grid is dropped). A 6-column table does not fit half of an ~840 px container without sideways overflow; the 900 px e2e proves it.
8. **Level 1 layout.** The existing 2-column grid becomes, in order, active-clients chart, Faixas de engajamento (1.2, right after the chart), Membros por cliente, Adoção de módulos (with Uso real, 1.4). It is 2x2 at `@3xl` and stacked in the phone.
9. **Level-4 'Engajados' note.** It reuses `actionsPerActiveMember` 9,3 from the fixture values, mirroring 1.1's note.
10. **'Uso real' row order.** Rows follow the adoption list's module order, so "ligado" and "usado" line up row by row.
11. **Not modeled:** Igor's `pushReach 58%` from "Fixture values". No spec item renders it, so storing it would be dead data.
</planner_decisions>

<source_audit>
| SOURCE | ID | Item | Task | Status |
|---|---|---|---|---|
| GOAL | — | Enrich the 7 panels with engagement bands and activity metrics | 1–3 | COVERED |
| REQ | V2-PLAT-04 | Tenant analytics (members, active, engagement, RSVP/check-in) | 1–3 | COVERED |
| REQ | PWA-03 | pt-BR catalog-only strings | 1–3 | COVERED |
| REQ | MOD-02 | Module holds data and pure helpers, no words; web tier formats | 1–3 | COVERED |
| CONTEXT | D-01 | Engagement segmentation model + helpers + tests | 1 (model), 2 and 3 (more tests) | COVERED |
| CONTEXT | D-02 | No names in segment lists; aggregate stories; floor "menos de 5" at level 3; no own band | 1, 2, 3 | COVERED (decision 5) |
| CONTEXT | D-03 | "Ainda não medido" for reach, engagement per view, saves, shares, video retention, novidades, conversion | 1 (type, MissingKpi, 5.x), 2 (revenue), 3 (6, 7.3) | COVERED (decision 1; 7.3 ranked out, decision 6) |
| CONTEXT | D-04 | Bands as BarList (band order, max = total, rate %, highlight Em risco); funnels via BarList + funnelRates/largestDrop | 1, 2 | COVERED |
| CONTEXT | D-05.1/2/3 | Igor 1.240 + rebalance; 38%; admin 380 | 1 | COVERED |
| CONTEXT | 1.1–1.5 | Level 1 items | 2 | COVERED (decisions 2, 8, 10) |
| CONTEXT | 2.1–2.4 | Level 2 items | 2 | COVERED (decision 7) |
| CONTEXT | 3.1–3.5 | Level 3 items | 2 | COVERED |
| CONTEXT | 4.1–4.6 | Level 4 items | 1 | COVERED (decisions 3, 9) |
| CONTEXT | 5.1–5.6 + stories line | Level 5 items | 1 | COVERED |
| CONTEXT | 6 (4 blocks) | Level 6 items | 3 | COVERED (decision 4) |
| CONTEXT | 7.1–7.4 + priority | Level 7 items | 3 | COVERED (decision 6) |
| CONTEXT | Fixture values | All values above | 1–3 | COVERED except Igor pushReach 58% (decision 11, no consumer) |
| CONTEXT | Verification | lint/typecheck/test/boundaries/static-routes, e2e, screenshots | 1–3 (scoped), 3 (full) | COVERED |
</source_audit>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1 (tracer): engagement model end to end on levels 4–5, plus the D-05 fixture fixes</name>
  <files>packages/modules/dashboard/fixtures/shared.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/fixtures/platform-panels.ts, packages/modules/dashboard/fixtures/tenant-panels.ts, packages/modules/dashboard/ui/metrics.ts, packages/modules/dashboard/ui/index.ts, packages/modules/dashboard/tests/metrics.test.ts, packages/modules/dashboard/tests/fixtures.test.ts, apps/web/components/dashboard/format.ts, apps/web/components/dashboard/BandsBarList.tsx, apps/web/components/dashboard/MissingKpi.tsx, apps/web/components/dashboard/TenantOwnerPanel.tsx, apps/web/components/dashboard/TenantAdminPanel.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - .planning/quick/261012-fcr-enriquecer-metricas-dos-7-paineis-com-fa/261012-fcr-CONTEXT.md (Engagement model, sections 4 and 5, Fixture values)
    - packages/modules/dashboard/fixtures/tenant-panels.ts (whole file)
    - packages/modules/dashboard/fixtures/platform-panels.ts lines 45–185
    - packages/modules/dashboard/ui/scale.ts lines 71–93 (the helper style to mirror)
    - apps/web/components/dashboard/TenantOwnerPanel.tsx, apps/web/components/dashboard/TenantAdminPanel.tsx (whole files)
    - apps/web/messages/pt-BR/dashboard.json (the tenantOwner, tenantAdmin and root keys)
  </read_first>
  <behavior>
    - bandTotal of Igor's bands is 1240, of the platform's 8430, of Corrida's 310 (the Corrida and platform fixtures arrive in Task 2; this task tests with literal objects).
    - interactedCount = superfan + engaged + occasional + newActivated. Igor: 62+205+150+54 = 471, and Math.round(interactedPercent) = 38.
    - engagedPercent = (superfan + engaged) / total × 100. Igor: 267/1240 gives Math.round 22. percentOf(168, 1240) rounds to 14. percentOf(5, 0) = 0.
    - ENGAGEMENT_BAND_ORDER equals ['new','superfan','engaged','occasional','at_risk','inactive'].
    - Fixtures, D-05:
      - sum of membersByClient = platform kpis.members.count = 8430
      - membersByClient c-igor = tenantOwnerPanel.kpis.members.count = 1240
      - each client row's members equals its membersByClient row (c-aurora, c-lab, c-igor, c-horizonte)
      - Corrida's 310 is at most the 'others' row's 1110
      - the largest client row is Instituto Aurora
      - client c-igor interactedPercent = tenantOwnerPanel.kpis.interacting.percent = 38
      - tenantAdminPanel.kpis.interacting.count = tenantOwnerPanel.weeklyInteracting.current.at(-1) = 380
    - Fixtures, level 4:
      - bandTotal(engagement) = kpis.members.count
      - engagement.counts.new = kpis.members.newMembers (96)
      - Math.round(interactedPercent) = kpis.interacting.percent
      - the ordersByBand sum = the 'orders' channel count (96)
      - the byFormat posts sum = platform client c-igor posts30d (61)
      - movement: using the test-local rank (inactive 0, at_risk 1, active 2, occasional 2, engaged 3, superfan 4), the downward flows sum to at most movement.down and the upward ones to at most movement.up
    - Fixtures, level 5:
      - newMembers.activated ≤ newMembers.count
      - stories.memberBase = tenantOwnerPanel.kpis.members.count
  </behavior>
  <action>
**Purpose.** Prove the whole slice (fixture type → pure helper → web panel → catalog → browser) on levels 4 and 5 first (D-01, D-03, D-04, D-05).

**1. RED.**
- Create `packages/modules/dashboard/tests/metrics.test.ts` with the helper cases in `<behavior>` (import from `../ui/metrics`).
- Extend `packages/modules/dashboard/tests/fixtures.test.ts` with the D-05, level-4 and level-5 consistency cases. Use plain `describe`/`it`/`expect`; the movement rank map is a local constant in the test.
- Run `pnpm --filter @rede-social/module-dashboard test`, confirm it fails, and commit as `test(quick-261012-fcr): pin the engagement model and the fixed fixture numbers`.

**2. Model (per D-01, D-03).**
- In `fixtures/shared.ts`, add `EngagementBand`, `EngagementBands`, `NotMeasuredReason` (all seven reasons now) and `NotMeasured`, exactly as in `<interfaces>`.
- The doc comments state:
  - the population: role member, status active
  - the counted actions: like, comment, post, RSVP going, check-in or walk-in, paid order. Support messages and moderated comments do not count.
  - an active day is a São Paulo calendar day with at least one counted action
  - the 30-day window
  - the band rules, in evaluation order
  - "interagiu" = superfãs + engajados + ocasionais + novos ativados
- Re-export the new types from `fixtures/index.ts`.

**3. Helpers.**
- Create `ui/metrics.ts` with the Task-1 part of the `<interfaces>` list: `ENGAGEMENT_BAND_ORDER`, `bandTotal`, `interactedCount`, `interactedPercent`, `engagedPercent`, `percentOf`.
- Export them from `ui/index.ts`.
- Pure, no words, no clock (MOD-02). Mirror the scale.ts style: a one-line doc per function, and zero-safe division.

**4. Fix the D-05 contradictions.**
- In `fixtures/platform-panels.ts`, rewrite `membersByClient` (new values and order) and the five `clients` member counts, set Igor's `interactedPercent` to 38, and type `kpis.monthlyRevenue` as `NotMeasured`. All values are in `<interfaces>`. The "maior cliente concentra" sentence is already computed from the data, so it now reads 37% with no code change.
- In `fixtures/tenant-panels.ts`, set the admin's `kpis.interacting.count` to 380.

**5. Level-4/5 fixture data.**
- Add every Task-1 field listed in `<interfaces>` to the `TenantOwnerPanel` and `TenantAdminPanel` types and values. Video `kind` is `'video' | 'reel'`.
- Delete the admin's per-post interactions KPI field from the type and the value. Spec 5.5 replaces it, and level 4's 4.4 section carries the per-post figure.
- Shape rule: fixtures stay raw data. Counts, enum ids, ISO dates; no sentences.

**6. Web helpers.**
- In `apps/web/components/dashboard/format.ts`, add:
  - `bandLabel(t, band: EngagementBand | 'active')`, which returns `t('bands.<band>')`
  - `formatClock(t, seconds)`, which returns `t('clock', { minutes, seconds zero-padded to 2 })`, giving "4:12" and "0:41"
- Create `apps/web/components/dashboard/MissingKpi.tsx`: a sync component taking `{ t, label, item: NotMeasured }` and rendering `KpiCard` with `value={t('notMeasured')}`, `note={t('notMeasuredReason.' + item.reason)}` and `variant="missing"`. This is the single D-03 render.
- Create `apps/web/components/dashboard/BandsBarList.tsx`: a sync component taking `{ t, bands: EngagementBands }` and rendering `BarList` with `max={bandTotal(bands)}`. Rows follow `ENGAGEMENT_BAND_ORDER`, never sorted by size (D-04):
  - id = band, label = `bandLabel`
  - value and display = the count, display via `formatCount`
  - rate = `formatPercent(percentOf(count, total))`
  - `highlight` only for `at_risk`

**7. Catalog (`apps/web/messages/pt-BR/dashboard.json`, under `dashboard`).**
- Root additions:
  - `clock` = "{minutes}:{seconds}"
  - `actionsPerActiveMember` = "{actions} ações por membro ativo"
- `bands`:
  - `title` = "Faixas de engajamento"
  - `new` = "Novos", `superfan` = "Superfãs", `engaged` = "Engajados", `occasional` = "Ocasionais", `at_risk` = "Em risco", `inactive` = "Inativos", `active` = "Ativos"
  - `flow` = "{from} → {to}"
  - `footnote` = "Cada membro conta em uma faixa, pelos dias com alguma ação nos últimos 30 dias."
  - `newActivated` = "Novos: {activated} ativados de {total}."
- `notMeasuredReason`:
  - `needs_billing_per_client` = "Precisa do faturamento por cliente"
  - `needs_post_views` = "Precisa registrar as visualizações dos posts"
  - `needs_saves` = "Precisa registrar os salvamentos"
  - `needs_shares` = "Precisa registrar os compartilhamentos"
  - `needs_video_playback` = "Precisa registrar a reprodução dos vídeos"
  - `needs_product_page_views` = "Precisa registrar as visitas às páginas dos produtos"
  - `needs_last_visit` = "Precisa registrar a última visita de cada membro"
- `tenantOwner`:
  - `kpi.engaged` = "Engajados"
  - `movement.up` = "Subiram"
  - `movement.down` = "Caíram"
  - `movement.note` = "de faixa em 30 dias, sem contar novos"
  - `movement.flowsTitle` = "Ver movimentos"
  - `movement.flowsSummary` = "os {count} maiores"
  - `formats.title` = "Interações por post, por formato"
  - `formats.posts` = "{count, plural, one {# post} other {# posts}}"
  - `formats.footnote` = "Curtidas e comentários por post, em {count} posts nos últimos 30 dias."
  - `buyers.title` = "Quem compra"
  - `buyers.sentence` = "{orders} das compras vêm de {members} dos membros (superfãs e engajados)."
  - `buyers.footnote` = "Cada pedido conta na faixa de quem comprou no dia anterior à compra."
  - `recover.title` = "Recuperar quem está em risco"
  - `recover.detail` = "{atRisk} em risco · {withPush} com push"
  - `recover.action` = "Avisar sobre o próximo evento"
- `tenantAdmin`:
  - `kpi.enteredAtRisk` = "Entraram em risco nesta semana"
  - `kpi.enteredAtRiskNote` = "{count} com push"
  - `kpi.newMembersNote` = "{activated} de {total} ativados ({percent})"
  - `postMetrics.reach` = "Alcance"
  - `postMetrics.engagementPerView` = "Engajamento por visualização"
  - `postMetrics.saves` = "Salvamentos"
  - `postMetrics.shares` = "Compartilhamentos"
  - `videos.title` = "Vídeos e reels"
  - `videos.columns.date` = "Data"
  - `videos.columns.kind` = "Tipo"
  - `videos.columns.duration` = "Duração"
  - `videos.kinds.video` = "Vídeo"
  - `videos.kinds.reel` = "Reel"
  - `videos.watched` = "% assistido"
  - `videos.completion` = "Conclusão"
  - `videos.stories` = "{count, plural, one {# story} other {# stories}}, média de {viewers} visualizações únicas ({percent})"
- Delete the admin KPI key that labelled per-post interactions (`tenantAdmin.kpi.perPost`).
- Keep `platformOwner.kpi.revenueReason` for now; Task 2 moves "Receita mensal" onto the shared reason.

**8. Level 4 (`TenantOwnerPanel.tsx`)**, in this order (spec 4.1–4.6):
- **(a) 6th KPI** (4.1):
  - label `tenantOwner.kpi.engaged`
  - value `formatPercent(engagedPercent(engagement))`, computed and never typed; it reads 22%
  - delta `kpiDelta(t, kpis.engaged.delta)`
  - note `t('actionsPerActiveMember', { actions: formatDecimal(9.3, 1) })`
- **(b) "Faixas de engajamento" section** (4.2, 4.3): a `PanelSection` with `bands.title`, placed right after the weekly chart section. It holds:
  - `BandsBarList`
  - one footnote with `bands.newActivated` (54 of 96) and `bands.footnote`
  - a `KpiGrid` with "Subiram" (77) and "Caíram" (171), each with `movement.note`
  - a `Collapsible` titled `movement.flowsTitle`, with summary `movement.flowsSummary` and count = the number of flows shown. Inside it, a `BarList` of the flows sorted by members, largest first:
    - label `t('bands.flow', { from: bandLabel(from), to: bandLabel(to) })`
    - display `formatCount`
    - highlight the flows whose `to` is `at_risk`
- **(c) "Interações por post, por formato" section** (4.4), after "Onde os membros interagem":
  - a `BarList` of byFormat sorted by perPost, largest first
  - label `postTypes.<type>`, value and display = perPost, rate `formats.posts` with count = posts
  - highlight the first row
  - footnote `formats.footnote` with count = the computed posts sum (61)
- **(d) "Quem compra" section** (4.5), next:
  - a `BarList` with `max` = total orders
  - rows in `ENGAGEMENT_BAND_ORDER`; display = orders, rate = % of orders
  - highlight superfan and engaged
  - the computed sentence `buyers.sentence`: orders = `formatPercent(percentOf(superfan + engaged orders, total))`, giving 72%; members = `formatPercent(engagedPercent(engagement))`, giving 22%
  - footnote `buyers.footnote` (planner decision 3)
- **(e) Recovery card** (4.6): an `ActionCard` right before the "Conta" `Collapsible`:
  - icon `HeartHandshake` (lucide-react@1.46.0, verified)
  - title `recover.title`
  - detail `recover.detail`: atRisk = `formatCount(engagement.counts.at_risk)`, withPush = `formatCount(atRiskWithPush)`
  - action `PreviewAction variant="outline"` with `recover.action` (disabled)
- No member names anywhere in these sections (D-02).
- Update the component's doc comment to list the new sections.

**9. Level 5 (`TenantAdminPanel.tsx`).**
- KPI order: awaiting, first response, interacting (380), new members, entered at risk, orders.
  - New members gets the note `kpi.newMembersNote` (activated 15, total 28, percent `formatPercent(percentOf(15, 28))`, giving 54%) (5.6).
  - The per-post KPI is replaced in place by `kpi.enteredAtRisk`: value 23, note `kpi.enteredAtRiskNote` with 9 (5.5).
- Inside the "Posts que mais renderam" `PanelSection`, under its table: a `KpiGrid` of four `MissingKpi` with labels `postMetrics.reach`, `engagementPerView`, `saves` and `shares` (5.1–5.3 per D-03, planner decision 1).
- A new `PanelSection` `videos.title`, right after it (5.4), containing:
  - a `ResponsiveTable` (caption = title) with columns date (title column, `formatDayMonth`), kind (`videos.kinds.<kind>`) and duration (numeric, `formatClock`)
  - a `KpiGrid` with two `MissingKpi`, `videos.watched` and `videos.completion`
  - a `<p className="text-xs text-text-secondary">` stories line from `videos.stories`: count 4, viewers `formatCount(310)`, percent `formatPercent(percentOf(310, memberBase))`, giving 25% (D-02: aggregate only, never who viewed)

**10. E2E.** Append to `apps/web/e2e-preview/painel-preview.spec.ts` two tests whose titles start with the level slug. Scope locators to a section, e.g. `page.locator('section').filter({ has: page.getByRole('heading', { name: 'Faixas de engajamento', exact: true }) })`, because "Engajados" is both a KPI and a band label.
- **"dono-do-cliente: engagement bands, movement, formats, buyers and the recovery card"** at 390x844:
  - The bands section's listitems are in band order: Novos, Superfãs, Engajados, Ocasionais, Em risco, Inativos.
  - It shows "Novos: 54 ativados de 96.", and "Subiram" 77 / "Caíram" 171.
  - Opening "Ver movimentos" shows 4 listitems.
  - The "Engajados" KPI shows 22% and "9,3 ações por membro ativo".
  - The "Quem compra" section contains "72% das compras vêm de 22% dos membros".
  - The h3 order (`page.locator('h3').allTextContents()`) puts "Faixas de engajamento" after "Membros que interagiram por semana", and "Interações por post, por formato" then "Quem compra" after "Onde os membros interagem".
  - "Recuperar quem está em risco" and "168 em risco · 69 com push" are visible, the "Avisar sobre o próximo evento" button is disabled, and the card sits above "Conta" (bounding-box y).
- **"admin-do-cliente: unmeasured metrics, videos and reels, at-risk entries"** at 390x844:
  - Exactly 6 exact-text "Ainda não medido".
  - "Precisa registrar as visualizações dos posts" appears twice.
  - "Entraram em risco nesta semana" is shown with 23 and "9 com push".
  - "Interações por post" has count 0 on this page.
  - "15 de 28 ativados (54%)" is shown, and the "Membros que interagiram" card shows 380.
  - "Vídeos e reels" follows "Posts que mais renderam (14 dias)" in h3 order; "4:12", "0:41" and "0:38" are visible; the stories line "4 stories, média de 310 visualizações únicas (25%)" is visible.

**11. GREEN and commit.**
- Run `pnpm exec biome check --write` on the touched files, then the `<verify>` command.
- Commit as `feat(quick-261012-fcr): engagement bands and unmeasured metrics on the client owner and admin panels`.

**Operational notes.**
- Kill only the :3000 listener before Playwright (CONTEXT). A dev server started before the catalog changed serves stale messages, because `loadMessages` memoizes per process.
- If `next dev` fails with a Turbopack "Failed to open database", delete only `apps/web/.next/dev/cache/turbopack` (gitignored).
  </action>
  <verify>
    <automated>set -e; export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder; pnpm --filter @rede-social/module-dashboard test; pnpm --filter @rede-social/module-dashboard typecheck; pnpm --filter @rede-social/module-dashboard lint; pnpm --filter @rede-social/web typecheck; pnpm --filter @rede-social/web lint; bash scripts/check-ui-literals.sh; node -e "const d=require('./apps/web/messages/pt-BR/dashboard.json').dashboard; const need=[d.bands?.at_risk,d.bands?.flow,d.bands?.newActivated,d.notMeasuredReason?.needs_post_views,d.notMeasuredReason?.needs_last_visit,d.tenantOwner?.buyers?.sentence,d.tenantOwner?.recover?.action,d.tenantAdmin?.videos?.stories,d.tenantAdmin?.kpi?.enteredAtRisk,d.clock]; if(need.some(v=>typeof v!=='string')) throw new Error('missing catalog key'); if(d.tenantAdmin.kpi.perPost!==undefined) throw new Error('dead KPI key left'); console.log('catalog OK')"; PIDS=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t || true); if [ -n "$PIDS" ]; then kill $PIDS; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts -g "dono-do-cliente|admin-do-cliente"</automated>
  </verify>
  <done>
    - Module tests pass, including the RED-then-GREEN metrics and fixture-consistency cases (band sums 1.240, 38%, 22%, 96 orders, 61 posts, 380, the D-05 platform split).
    - The tracer chain works in the browser: on levels 4 and 5 the new sections render from fixture → helper → catalog. Six "Ainda não medido" cards show on level 5, no per-post KPI is left, and the existing frame/width tests for both levels stay green.
    - Two commits exist: test, then feat.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: platform levels 1–3: engagement, store sales, module usage, activation step, push reach, the Horizonte alert and the D-02 floor</name>
  <files>packages/modules/dashboard/fixtures/shared.ts, packages/modules/dashboard/fixtures/platform-panels.ts, packages/modules/dashboard/ui/metrics.ts, packages/modules/dashboard/tests/metrics.test.ts, packages/modules/dashboard/tests/fixtures.test.ts, apps/web/components/dashboard/format.ts, apps/web/components/dashboard/BandsBarList.tsx, apps/web/components/dashboard/PlatformOwnerPanel.tsx, apps/web/components/dashboard/PlatformAdminPanel.tsx, apps/web/components/dashboard/PlatformSupportPanel.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - apps/web/components/dashboard/PlatformOwnerPanel.tsx, PlatformAdminPanel.tsx, PlatformSupportPanel.tsx (whole files)
    - packages/modules/dashboard/fixtures/platform-panels.ts (whole file, after Task 1)
    - apps/web/e2e-preview/painel-preview.spec.ts lines 73–82 (cardOfClient) and 289–312 (ALERT_LEVELS)
  </read_first>
  <behavior>
    - PRIVACY_FLOOR = 5. isBelowPrivacyFloor(4) and (0) are true; (5) is false.
    - Platform:
      - bandTotal(platformOwnerPanel.engagement) = kpis.members.count = 8430
      - Math.round(interactedPercent) = kpis.members.interactedPercent (41)
      - Math.round(engagedPercent) = 22
    - Client row c-igor: engagedPercent = Math.round(engagedPercent(tenantOwnerPanel.engagement)) (22), and atRiskPercent = Math.round(percentOf(at_risk, total)) of the same bands (14).
    - Client row c-corrida:
      - members = platformSupportPanel.kpis.members.count = bandTotal(platformSupportPanel.engagement) = 310
      - engagedPercent 3, atRiskPercent 31 and interactedPercent 12, each equal to Math.round of the helper over the support bands
    - The support bands' superfan count is below PRIVACY_FLOOR, so the fixture exercises the rule.
    - storeSales.byClient c-igor cents = tenantOwnerPanel.kpis.orderValue.cents (894000).
    - The engagement_drop alert's toPercent = client c-horizonte engagedPercent (12).
    - Activation counts never increase step to step; the last step is ten_active_members with 2.
    - newNeverActed7d.count ≤ joined.
  </behavior>
  <action>
**1. RED.**
- Add the `<behavior>` cases to `tests/metrics.test.ts` (floor) and `tests/fixtures.test.ts` (platform, cross-level).
- Run the module tests, confirm they fail, and commit as `test(quick-261012-fcr): pin the platform bands, client rows and the privacy floor`.

**2. Model and helpers.**
- Add `'average_30_days'` to `DeltaBasis`.
- Add `PRIVACY_FLOOR` and `isBelowPrivacyFloor` to `ui/metrics.ts` and export them.
- Add every Task-2 fixture field from `<interfaces>` to the platform types and values in `fixtures/platform-panels.ts`.

**3. Web helpers.**
- In `format.ts`, add `formatFloored(t, count)`: `isBelowPrivacyFloor(count)` returns `t('belowFloor', { floor: PRIVACY_FLOOR })`, otherwise `formatCount(count)`.
- Give `BandsBarList` an optional `floor` prop. When it is set and a count is below the floor, the row's value is 0 (so the bar width cannot leak the count), its display is `formatFloored`, and it has no rate (per D-02, planner decision 5). Every other row keeps its rate.

**4. Catalog.**
- Root additions:
  - `belowFloor` = "menos de {floor}"
  - `delta.average_30_days` = "{amount} vs. média de 30 dias"
- `platformOwner`:
  - `kpi.engaged` = "Membros engajados"
  - `kpi.storeSales` = "Vendas nas lojas dos clientes"
  - `kpi.storeSalesNote` = "{count, plural, one {de # cliente} other {de # clientes}} · valor registrado, sem pagamento real"
  - `adoption.usageTitle` = "Uso real"
  - `adoption.usageFootnote` = "% dos membros ativos que usaram o módulo em 30 dias."
  - `clients.columns.atRisk` = "Em risco %"
  - `clients.columns.engaged` = "Engajados %"
- `platformAdmin`:
  - `kpi.pushReach` = "Alcance de push"
  - `kpi.pushReachNote` = "membros ativos com push ligado"
  - `activation.steps.ten_active_members` = "10+ membros ativos"
  - `pending.engagement_drop.tag` = "-{points} p.p."
  - `pending.engagement_drop.title` = "{name}: engajamento"
  - `pending.engagement_drop.detail` = "Engajados caíram de {from} para {to} em 30 dias"
  - `failures.columns.stalledVideos` = "Vídeos parados"
- `platformSupport`:
  - `kpi.pendingInvites` = "Convites não aceitos"
  - `kpi.neverActed` = "Novos que nunca agiram (7 dias)"
  - `kpi.neverActedNote` = "de {joined} que entraram"
  - `kpi.activity` = "Atividade 24h vs. média"
  - `kpi.activityValue` = "{count}/h"
  - `kpi.activityNote` = "média: {average}/h"
  - `engagement.title` = "Engajamento (agregado)"
  - `engagement.summary` = "{percent} em risco"
  - `engagement.footnote` = "Só números agregados; contagens abaixo de {floor} aparecem como “menos de {floor}”."
  - `errors.pushReach` = "Alcance de push: {percent} dos membros ativos"
  - `errors.details.devices_refused_below_floor` = "Menos de {floor} aparelhos recusaram a notificação"
- Delete `platformOwner.kpi.revenueReason`; "Receita mensal" now uses `notMeasuredReason.needs_billing_per_client` through `MissingKpi` (planner decision 1).

**5. Level 1 (`PlatformOwnerPanel.tsx`).**
- **KPIs**, in order: active clients, new clients, members, storage, then:
  - "Receita mensal", rendered as `<MissingKpi item={kpis.monthlyRevenue}>`
  - 6th, "Membros engajados" (1.1): value `formatPercent(engagedPercent(engagement))`, delta, note `actionsPerActiveMember` with `formatDecimal(8.1, 1)`
  - 7th, "Vendas nas lojas dos clientes" (1.5): value `formatBrl` of the byClient cents sum, giving R$ 14.380,00, computed; delta; note `kpi.storeSalesNote` with count = byClient length
  - This is planner decision 2.
- **The `@3xl:grid-cols-2` grid**, in order (planner decision 8):
  - the active-clients chart
  - a `PanelSection` `bands.title` (1.2) with `BandsBarList` and the `bands.footnote` line
  - "Membros por cliente". Rows are sorted by members, largest first, with the 'others' row last; highlight the client row with the most members instead of index 0 (D-05: Aurora now leads). The concentration sentence keeps its computed value.
  - "Adoção de módulos", moved into the grid. After its existing list and footnote, add a `SectionTitle as="h4" variant="group"` "Uso real" (1.4), then a `BarList max={100}` of `moduleUsage` with `moduleName` labels and percent display, then `adoption.usageFootnote`.
- **Clients table** (1.3): sort rows by `atRiskPercent`, highest first, which defines "piores primeiro". Insert after the interacted column:
  - `atRisk`: numeric, visible on phone, "Em risco %"
  - `engaged`: numeric, `hideOnPhone`, "Engajados %"
  Both cells use `formatPercent`.

**6. Level 2 (`PlatformAdminPanel.tsx`).**
- 6th KPI `kpi.pushReach` (2.2): value `formatPercent(52)`, note `kpi.pushReachNote`.
- `pendingItem` gains the `engagement_drop` case (2.3):
  - tone `warning`
  - tag with points = fromPercent - toPercent
  - title with the client name
  - detail with from/to through `formatPercent`
  The bell then counts 5, still 1 urgent.
- The activation funnel renders the new 6th step through the existing `funnelRates` / `largestDrop` code (2.1, D-04); no code change beyond the catalog key.
- The failures table gains `stalledVideos` (2.4): numeric, after push, visible on phone.
- Replace the `grid gap-6 @3xl:grid-cols-2` wrapper with a full-width column of the two sections (planner decision 7).

**7. Level 3 (`PlatformSupportPanel.tsx`)**, aggregates only (D-02):
- The members KPI unit passes blocked through `formatFloored`; it reads "/ menos de 5 bloq.".
- Append three KPIs after "Última atividade":
  - `kpi.pendingInvites` (3.1): value `formatFloored(37)`
  - `kpi.neverActed` (3.2): value `formatFloored(13)`, note `kpi.neverActedNote` with `formatFloored(14)`
  - `kpi.activity` (3.3): value `kpi.activityValue` with 2, note `kpi.activityNote` with 6, and a delta computed in the panel:
    - amount = `percentOf(Math.abs(perHour - averagePerHour), averagePerHour)` (reads 67%), kind `percent`
    - direction `down` / `up` / `flat` from the comparison; good is false for down, true for up, null for flat
    - basis `average_30_days`
- Right after the "Configuração" `Collapsible`, add a closed `Collapsible` `engagement.title` (3.4):
  - summary `engagement.summary` with `formatPercent(percentOf(at_risk, total))` (31%)
  - children: `BandsBarList floor`, and the `engagement.footnote` line with `floor: PRIVACY_FLOOR`
- In "Erros nas últimas 24h":
  - When the error is `devices_refused` and its count is below the floor, render `errors.details.devices_refused_below_floor` with the floor.
  - Under the list, add the line `errors.pushReach` with `formatPercent(21)` (3.5).
- Do not floor error counts, the activity rate, percents, days or the admin e-mail count.

**8. E2E** (titles start with the slug):
- **"dono-da-plataforma: engagement, store sales, module usage and the clients' risk columns"** at 390x844:
  - "Membros engajados" 22% with "8,1 ações por membro ativo"; "Vendas nas lojas dos clientes" matching `/14\.380,00/`.
  - "Receita mensal" still shows "Ainda não medido" with "Precisa do faturamento por cliente".
  - In h3 order, "Faixas de engajamento" comes right after "Clientes ativos, 12 meses".
  - "O maior cliente concentra 37% dos membros." is shown, and the first row of the Membros por cliente list is "Instituto Aurora".
  - The "Uso real" h4 is visible.
  - The first stacked client card is Clube Corrida Sul; it contains "Em risco %" and "31%" and does not contain "Engajados %".
  - Then at 900x900: the clients table shows the headers "Em risco %" and "Engajados %", and `horizontalOverflow` scrollWidth ≤ clientWidth.
- **"admin-da-plataforma: push reach, the active-members step and stalled videos"**:
  - At 390: "Alcance de push" 52%.
  - The activation list has 6 listitems, the last containing "10+ membros ativos" and "2".
  - The Rede Lab card contains "Vídeos parados" and "2".
  - At 900x900: no horizontal overflow.
- **"suporte-da-plataforma: aggregates only, counts under 5 read 'menos de 5'"** at 390:
  - "Convites não aceitos" 37; "Novos que nunca agiram (7 dias)" 13 with "de 14 que entraram".
  - "Atividade 24h vs. média" with "2/h", "média: 6/h" and "67% vs. média de 30 dias".
  - "/ menos de 5 bloq." is visible.
  - In summary order, "Configuração" comes before "Engajamento (agregado)".
  - After opening "Engajamento (agregado)":
    - the summary reads "31% em risco"
    - the Superfãs row matches `/Superfãs\s*menos de 5/` and does not contain "2"
    - that row's `[data-bar-fill]` has style width "0%"
  - "Menos de 5 aparelhos recusaram a notificação" and "Alcance de push: 21% dos membros ativos" are present.
- In `ALERT_LEVELS`, change admin-da-plataforma to count 5 and name "Alertas, 5, 1 urgente". This updates the premise (one more alert by spec 2.3); it does not weaken the test. 'Escola Horizonte: domínio' stays unique.

**9. GREEN and commit.** Run Biome with --write on the touched files, run `<verify>`, and commit as `feat(quick-261012-fcr): engagement and activity metrics on the platform owner, admin and support panels`.
  </action>
  <verify>
    <automated>set -e; export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder; pnpm --filter @rede-social/module-dashboard test; pnpm --filter @rede-social/module-dashboard typecheck; pnpm --filter @rede-social/module-dashboard lint; pnpm --filter @rede-social/web typecheck; pnpm --filter @rede-social/web lint; bash scripts/check-ui-literals.sh; node -e "const d=require('./apps/web/messages/pt-BR/dashboard.json').dashboard; const need=[d.belowFloor,d.delta?.average_30_days,d.platformOwner?.kpi?.storeSales,d.platformOwner?.adoption?.usageTitle,d.platformOwner?.clients?.columns?.atRisk,d.platformAdmin?.activation?.steps?.ten_active_members,d.platformAdmin?.pending?.engagement_drop?.detail,d.platformAdmin?.failures?.columns?.stalledVideos,d.platformSupport?.engagement?.title,d.platformSupport?.errors?.details?.devices_refused_below_floor]; if(need.some(v=>typeof v!=='string')) throw new Error('missing catalog key'); if(d.platformOwner.kpi.revenueReason!==undefined) throw new Error('revenue reason not moved'); console.log('catalog OK')"; PIDS=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t || true); if [ -n "$PIDS" ]; then kill $PIDS; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts -g "dono-da-plataforma|admin-da-plataforma|suporte-da-plataforma|alerts bell|clients list"</automated>
  </verify>
  <done>
    - Levels 1–3 show every spec item 1.1–3.5 with computed values (22%, R$ 14.380,00, 37%, 31%, 67%), and the bell on level 2 lists 5 alerts.
    - On level 3 no member or device count under 5 is printed, and the floored bar has zero width.
    - The platform and cross-level consistency tests are green, and the scoped preview e2e is green, including the 900 px no-overflow checks.
    - Two commits exist: test, then feat.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: levels 6–7 (per-function staff metrics, the member's cards by priority), no-overflow with collapsibles open, full gates and screenshots</name>
  <files>packages/modules/dashboard/fixtures/tenant-panels.ts, packages/modules/dashboard/ui/metrics.ts, packages/modules/dashboard/tests/metrics.test.ts, packages/modules/dashboard/tests/fixtures.test.ts, packages/modules/dashboard/README.md, apps/web/components/dashboard/format.ts, apps/web/components/dashboard/TenantStaffPanel.tsx, apps/web/components/dashboard/MemberPanel.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - apps/web/components/dashboard/TenantStaffPanel.tsx, MemberPanel.tsx (whole files)
    - packages/modules/dashboard/fixtures/tenant-panels.ts lines 228–366
    - apps/web/e2e-preview/painel-preview.spec.ts lines 89–184 (the two per-level loops to strengthen)
    - packages/modules/dashboard/README.md (Contracts table and Preview section)
  </read_first>
  <behavior>
    - NEW_MEMBER_DAYS = 30. isNewMember(9) is true; isNewMember(30) is false.
    - vsMedian:
      - (127, 52, 26, 24) ≈ 1.4423 (toBeCloseTo 4)
      - (60, 52, 35, 24) ≈ 0.1538
      - (15, 52, 12, 24) is null
      - (10, 0, 30, 24) is null
    - MIN_STREAK_WEEKS = 2.
    - selectForYouCards:
      - memberPanel.forYou gives ['event','support','access']
      - the same without nextEvent gives ['support','access','news']
      - only unlockedCommunity + newSinceLastVisit gives ['news','community']
      - {} gives []
      - never more than MAX_FOR_YOU_CARDS
    - Fixtures, staff:
      - the queue's Rui Matos is new and Ana Souza is not
      - for r1/r2/r3, vsMedian(likes+comments, 52, ageHours, 24) is about 1.44 / about 0.15 / null
      - removed7d / comments7d × 100 rounds to 0.9 at one decimal
    - Fixtures, member: weeklyStreak ≥ MIN_STREAK_WEEKS, and attendance.attended ≤ events.
  </behavior>
  <action>
**1. RED.**
- Add the `<behavior>` cases to `tests/metrics.test.ts` and `tests/fixtures.test.ts`.
- Run the module tests, confirm they fail, and commit as `test(quick-261012-fcr): pin the staff rules and the member card priority`.

**2. Helpers and fixtures.**
- Add `NEW_MEMBER_DAYS`, `isNewMember`, `vsMedian`, `MIN_STREAK_WEEKS`, `ForYouCard`, `FOR_YOU_PRIORITY`, `MAX_FOR_YOU_CARDS` and `selectForYouCards` to `ui/metrics.ts` and export them.
  - `selectForYouCards` maps event→`nextEvent`, support→`supportReply`, access→`accessExpiring`, news→`newSinceLastVisit`, community→`unlockedCommunity`.
  - It keeps the present ones in `FOR_YOU_PRIORITY` order and takes the first `MAX_FOR_YOU_CARDS`. The cut is the locked spec rule (planner decision 6).
- Add the Task-3 fixture fields from `<interfaces>` to `TenantStaffPanel` and `MemberPanel`, types and values.

**3. Format.** Add `formatChange(ratio)` to `format.ts`: `Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0, signDisplay: 'exceptZero' })`. It gives "+144%" and "+15%" (verified with node).

**4. Catalog.**
- `tenantStaff.support`:
  - `myFirstResponse` = "Minha 1ª resposta (mediana, 7d)"
  - `newMember` = "Novo"
- `tenantStaff.moderation`:
  - `removalRate` = "Taxa de remoção (7d)"
  - `removalRateNote` = "{removed} de {total} removidos"
  - `firstComments` = "1º comentário de novos (24h)"
- `tenantStaff.content`:
  - `columns.vsMedian` = "vs. mediana"
  - `inProgress` = "em andamento"
  - `medianNote` = "Comparado à mediana de {median} interações por post nas primeiras {hours}h."
- `tenantStaff.store`:
  - `expiring` = "Acessos que vencem em 7 dias"
  - `conversion` = "Conversão por produto"
- `member`:
  - `attendance` = "Presença nos encontros: {attended} de {total}"
  - `streak` = "Sequência: {weeks, plural, one {# semana} other {# semanas}}"
  - `forYou.access.title` = "Seu acesso vence em {days, plural, one {# dia} other {# dias}}"
  - `forYou.access.renew` = "Renovar"
  - `forYou.news.title` = "Novidades em {community} desde sua última visita"
- Delete `tenantStaff.moderation.removed`: its figure becomes the removal-rate note.

**5. Level 6 (`TenantStaffPanel.tsx`).**
- **Support.**
  - 4th KPI `support.myFirstResponse` with `formatDuration(t, 64)`, giving "1h04".
  - `PersonRow` gets an optional `tag?: ReactNode`, rendered inline right after the bold name.
  - Each queue row passes `<ToneLabel tone="brand">` with `support.newMember` when `isNewMember(joinedDaysAgo)`, so only Rui Matos gets it.
- **Moderation.**
  - Replace the removed-comments KPI in place with `moderation.removalRate`: value `formatRatio(percentOf(removed7d, comments7d) / 100)`, giving "0,9%"; note `moderation.removalRateNote` (2 de 214).
  - Add a 4th KPI `moderation.firstComments` with `formatCount(4)`.
- **Content.**
  - Add a `vsMedian` column (numeric, visible on phone) to the recent-posts table. The cell is `vsMedian(likes + comments, median, ageHours, comparableAfterHours)`: null renders `content.inProgress`, anything else `formatChange(ratio)` (planner decision 4).
  - Add the `content.medianNote` line under the table.
- **Store.**
  - 3rd KPI `store.expiring`: value 6, note `formatList(products)`.
  - 4th: `MissingKpi` with label `store.conversion` and the fixture's `NotMeasured` (D-03).

**6. Level 7 (`MemberPanel.tsx`).**
- Under "Membro desde", add the support line `member.attendance` (3 de 4) (7.2). Add `member.streak` only when `weeklyStreak >= MIN_STREAK_WEEKS` (7.4).
- Render the "Para você" cards from `selectForYouCards(forYou)`, in its order, with `hasCards` = a non-empty selection:
  - event, support and community keep their current rendering
  - access (7.1): `ActionCard` with icon `CalendarClock`, title `forYou.access.title` (days 5), detail = product, action `PreviewAction variant="brand"` with `forYou.access.renew` (disabled)
  - news (7.3): `ActionCard` with icon `Sparkles`, title `forYou.news.title`, detail `t('notMeasuredReason.' + reason)`, pill `{ tone: 'neutral', text: t('notMeasured') }` (D-03's in-card form)
- The member fixture and panel carry no band data or band label: the member never sees their own band.
- Update the doc comment with the priority rule.

**7. E2E.**
- **(a) Strengthen the two existing per-level loops; do not weaken any assertion.**
  - In the 360/390/430 loop, after the current assertions, open every `details` (`page.locator('details').evaluateAll` setting `open = true`) and re-assert `horizontalOverflow` scrollWidth ≤ clientWidth.
  - In the 1440x900 loop, do the same, then assert the phone screen's scrollWidth ≤ clientWidth.
- **(b) "equipe-do-cliente: per-function metrics"** visits `?simular=1&funcoes=<id>` for each function:
  - atendimento: "Minha 1ª resposta (mediana, 7d)" with "1h04"; the Rui Matos row contains "Novo" and the Ana Souza row does not.
  - moderacao: "Taxa de remoção (7d)" with "0,9%" and "2 de 214 removidos"; "1º comentário de novos (24h)" with 4; exact text "Removidos 7d" has count 0.
  - conteudo: "vs. mediana", "+144%", "+15%" and "em andamento" are present.
  - loja: "Acessos que vencem em 7 dias" with 6 and "Comunidade VIP"; "Conversão por produto" with exactly 1 "Ainda não medido".
- **(c) "membro: three cards by priority, presence and streak, no band"** at 390:
  - "Encontro mensal · hoje 19h", "O suporte respondeu" and "Seu acesso vence em 5 dias" are visible, in increasing bounding-box y.
  - The "Renovar" button is disabled.
  - "Novidades em Comunidade VIP desde sua última visita" has count 0, and the text "Liberada pela sua compra" has count 0.
  - "Presença nos encontros: 3 de 4" and "Sequência: 6 semanas" are visible.
  - None of Superfãs, Engajados, Ocasionais, Em risco and Inativos appears as exact text.

**8. Module README.**
- Update the `./ui` row of the Contracts table with the `metrics` helpers.
- Update the `./fixtures` row with the shared engagement and `NotMeasured` types, with one sentence on the D-03 rule.
- Update the Preview coverage sentence (new metric checks, open-collapsible overflow).

**9. Full gates**, in this order, with the placeholder env exported and the :3000 listener stopped (listener only, never the Chrome helpers): `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm boundaries`, `pnpm check:static-routes`, then the full preview Playwright suite. Fix any red check at its cause.

**10. Screenshots (not committed).**
- With a temporary spec `apps/web/e2e-preview/zz-screens.tmp.spec.ts`, save into `.planning/quick/261012-fcr-enriquecer-metricas-dos-7-paineis-com-fa/screens/`:
  - every level at 1440x900, light, framed: `<level>-1440-light.png`
  - every level as a full-page 390 px capture, so every new section is visible: `<level>-390-full-light.png`
- Delete the temporary spec afterwards.

**11. Commit** as `feat(quick-261012-fcr): staff and member metrics, and the panels stay scroll-free with every section open`.

**12. SUMMARY.** It must restate the D-03 rule and planner decisions 1–11 verbatim in substance, list the commits, and give the evidence for every gate.
  </action>
  <verify>
    <automated>set -e; export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder; pnpm lint; pnpm typecheck; pnpm test; pnpm boundaries; pnpm check:static-routes; node -e "const d=require('./apps/web/messages/pt-BR/dashboard.json').dashboard; const need=[d.tenantStaff?.support?.myFirstResponse,d.tenantStaff?.moderation?.removalRate,d.tenantStaff?.content?.inProgress,d.tenantStaff?.store?.conversion,d.member?.attendance,d.member?.streak,d.member?.forYou?.access?.renew,d.member?.forYou?.news?.title]; if(need.some(v=>typeof v!=='string')) throw new Error('missing catalog key'); if(d.tenantStaff.moderation.removed!==undefined) throw new Error('removed-7d key left'); console.log('catalog OK')"; PIDS=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t || true); if [ -n "$PIDS" ]; then kill $PIDS; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts; test ! -e apps/web/e2e-preview/zz-screens.tmp.spec.ts; test "$(ls .planning/quick/261012-fcr-enriquecer-metricas-dos-7-paineis-com-fa/screens/*.png | wc -l | tr -d ' ')" -ge 14; git diff --quiet d94933ad -- apps/web/proxy.ts apps/web/app/painel-preview</automated>
    <human-check>
      - Open http://localhost:3000/painel-preview at 1440x900 and walk the 7 levels in light and dark. Then narrow the window to 390 px.
      - Level 1: "Faixas de engajamento" sits right under the 12-month chart; "Em risco" is the only solid bar; Instituto Aurora leads "Membros por cliente".
      - Level 3: open "Engajamento (agregado)"; Superfãs reads "menos de 5" with an empty track.
      - Level 4: the bands, then movement (open "Ver movimentos"), formats, "Quem compra" and the recovery card, in that order.
      - Level 5: the dashed "Ainda não medido" cards under the posts table and under "Vídeos e reels" read as honest gaps, not as broken data.
      - Level 6: tick all four functions and check each tab.
      - Level 7: three cards (event, support reply, access expiring); "Novidades" is ranked out on purpose (planner decision 6). Confirm this is the behaviour you want.
    </human-check>
  </verify>
  <done>
    - Level 6 shows the per-function metrics, and level 7 shows presence, the streak and three cards by priority with no band.
    - No horizontal scroll at any tested width or in the phone screen with every collapsible open.
    - pnpm lint (check-ui-literals OK), typecheck, test, boundaries, check:static-routes and the full preview suite are all green.
    - 14+ screenshots are in screens/, the temporary spec is gone, and proxy.ts and app/painel-preview are unchanged since d94933ad.
    - The SUMMARY states the D-03 rule and the planner decisions.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser → Next dev server (`/painel-preview/*`) | Unchanged. The dev-only gate (proxy 307 in production, `connection()` + `notFound()`) is not touched by this plan |
| fixture module → server-rendered panels | Static fictional data in the repo. Raw counts below the privacy floor exist only in the support fixture and must not reach the HTML of level 3 |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-fcr-01 | Information disclosure | Dev-only preview gate (`apps/web/proxy.ts`, `apps/web/app/painel-preview/**`) | medium | mitigate | Neither path is in `files_modified`. Task 3's verify runs `git diff --quiet d94933ad -- apps/web/proxy.ts apps/web/app/painel-preview`, and `pnpm test` re-runs proxy.test.ts and dashboard-preview.test.ts |
| T-fcr-02 | Information disclosure (re-identification from small counts) | Level 3: `PlatformSupportPanel`, `BandsBarList floor`, `formatFloored` | medium | mitigate | D-02 floor on every member/device count (planner decision 5). A below-floor row draws value 0 and no rate, so neither bar width nor a percent leaks the count. Unit tests cover `isBelowPrivacyFloor`, and Task 2's e2e asserts "menos de 5", no "2" in the Superfãs row, a 0% bar fill, "/ menos de 5 bloq." and the floored device sentence |
| T-fcr-03 | Information disclosure | Segment surfaces: bands, movement, "Quem compra", recovery card, stories line | medium | mitigate | Their fixture types carry counts only, with no person name or id fields. Stories are an aggregate per period ("never who viewed"). The e2e scopes assertions to these sections, which render only labels and counts |
| T-fcr-04 | Information disclosure | Member panel (level 7) showing the member's own band | low | mitigate | `memberPanel` has no band field. Task 3's e2e asserts that no band label appears on level 7 |
| T-fcr-05 | Spoofing (fictional or unmeasured figures read as real) | Unmeasured metrics | low | mitigate | D-03 rule: `NotMeasured` has no value field, so no number can be rendered for it. The e2e counts "Ainda não medido". The "Dados de exemplo" tag and its existing assertions stay on every level |
| T-fcr-06 | Tampering (markup injection) | Fixture strings rendered in panels | low | accept | Repo-static data rendered as React text nodes; no raw-HTML API is introduced. Biome and check-ui-literals run on every task |
</threat_model>

<verification>
Every command runs with `API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder` exported. Docker and Supabase are not needed.

- Task 1: module test/typecheck/lint, web typecheck/lint, check-ui-literals, the catalog node check, and preview e2e `-g "dono-do-cliente|admin-do-cliente"`.
- Task 2: the same set, with e2e `-g "dono-da-plataforma|admin-da-plataforma|suporte-da-plataforma|alerts bell|clients list"`.
- Task 3 (full): `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm boundaries`, `pnpm check:static-routes`, the full preview Playwright suite (Google Chrome, `playwright.preview.config.ts`), the screenshot count, and the untouched gate.
- Before any Playwright run, stop only the :3000 listener: `lsof -nP -iTCP:3000 -sTCP:LISTEN -t`. Never kill the Chrome helpers.
</verification>

<success_criteria>
- All 3 must-have groups are true: D-05 numbers consistent across levels; every spec item 1.1–7.4 at its position; D-03 single rule; D-02 floor at level 3.
- Unit tests prove:
  - band sums = member KPIs (8.430 / 1.240 / 310)
  - interagiu/engajados % = the KPIs and client rows
  - the "menos de 5" rule
  - the vs-median rule
  - the 'Para você' priority
- No horizontal scroll at 360/390/430 px or in the 440 px phone screen with every collapsible open.
- All gates are green with real output quoted in the SUMMARY, and there are 6 commits (3 test + 3 feat).
- Screenshots are in `screens/` (not committed).
</success_criteria>

<output>
Create `.planning/quick/261012-fcr-enriquecer-metricas-dos-7-paineis-com-fa/261012-fcr-SUMMARY.md` when done. It must include:

- the D-03 rule, stated as one paragraph
- planner decisions 1–11
- the commits
- the real gate output
- the screenshot paths
- a `**⚠️ NÃO FEITO**` block for anything not done. The `critic` and `flow-critic` reviews belong there if the executor cannot launch subagents ("rodo o critic e o flow-critic?").
</output>
