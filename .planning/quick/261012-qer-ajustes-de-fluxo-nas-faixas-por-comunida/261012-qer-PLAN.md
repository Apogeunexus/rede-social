---
phase: quick-261012-qer
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/modules/dashboard/fixtures/tenant-owner.ts
  - packages/modules/dashboard/fixtures/owner-members.ts
  - packages/modules/dashboard/fixtures/owner-member-insights.ts
  - packages/modules/dashboard/fixtures/index.ts
  - packages/modules/dashboard/tests/tenant-owner.test.ts
  - packages/modules/dashboard/tests/owner-members.test.ts
  - packages/modules/dashboard/tests/owner-member-insights.test.ts
  - packages/modules/dashboard/README.md
  - apps/web/lib/owner-band-scope.ts
  - apps/web/lib/owner-band-scope.test.ts
  - apps/web/app/painel-preview/[nivel]/page.tsx
  - apps/web/components/dashboard/TenantOwnerPanel.tsx
  - apps/web/components/dashboard/OwnerMembers.tsx
  - apps/web/components/dashboard/BandMembers.tsx
  - apps/web/components/dashboard/BandMembers.test.tsx
  - apps/web/components/dashboard/OwnerMemberDetail.tsx
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, PWA-03, MOD-02]
tags: [dashboard, preview, tenant-owner, engagement-bands, member-insights, pt-BR]

estimate:
  tokens: 260000
  raw_tokens: 260000
  tasks: 4
  confidence: low

must_haves:
  truths:
    - "B-2: the 'Faixas de engajamento' block opens with a nav 'Recorte das faixas' of three equal tabs in one row (`grid grid-cols-3`, the area tabs' pattern): Por membro | Por comunidade | Por evento. Por membro is the whole base. Por comunidade adds a second row with Comunidade VIP, Geral, Iniciantes and Eventos (default VIP). Por evento adds a second row with the 7 panel events, upcoming soonest first then past most recent first (default 'Encontro mensal · 12/10'). Every link is a plain `<a>` that keeps `area=membros` and ends in `#faixas`."
    - "B-2: `recorte`, `comunidade` and `evento` are parsed against allow-lists derived from the fixture. An unknown or repeated `recorte` gives Por membro. An unknown `comunidade` or `evento` under a valid `recorte` gives that row's first item. A bare legacy `comunidade=vip` gives Por membro. Unit tests cover '__proto__', 'constructor', wrong case, empty, padded and arrays."
    - "B-2: Por evento shows today's whole-base band of everyone who registered (RSVP 'vou') for the event. The counts sum to the event's `confirmed`, no band exceeds the base's, nobody is inactive, past no-shows bound em risco, and past registrants are mostly superfãs + engajados, as in `attendanceByBand`, all unit-tested. Each band opens the list of those registrants (min(10, count) rows, 'e mais N')."
    - "A-2: the 'Recuperar quem está em risco' card follows every scope. Por membro reads '168 em risco · 69 com push', VIP '22 em risco · 11 com push', Geral '190 · 78', Iniciantes '120 · 49', Eventos '97 · 40', and each event its own pair (Encontro mensal '6 em risco · 3 com push'). A unit test proves 0 ≤ atRiskWithPush ≤ at_risk for every scope."
    - "B-1 + A-1/A-3/A-4: each listed member is its own card (`Card`: bg-card, rounded, soft shadow), stacked vertically. It shows an initials circle on the brand color, the name in bold `text-base`, and four labeled lines: 'Membro desde: set. de 2026', 'Última atividade: hoje às 22:40' ('ontem às HH:MM', else 'há N dias'), 'Comunidade que mais interage: Geral' (in every scope), and 'Tempo médio diário: 35 min' with the 'exemplo' pill on that line. Other rules: a share that rounds to 0% with members reads 'menos de 1%', the mini bar is ≥ 6 px when count > 0, and a band over 10 shows 'Os 10 com atividade mais recente' on top plus a disabled 'Ver todos' beside 'e mais N membros'. A 0-member band opens to 'Nenhum membro nesta faixa.', which is live in every event's Inativos."
    - "B-3: tapping a member card opens that member's insights inside the level-4 Membros area (`&faixa=<band>&membro=om-NN`, both allow-listed; invalid → the list), with 'Voltar' back to the same scope, the same band open and `#faixas`. Top to bottom it shows:"
    - "  - a header: initials, name, band pill, 'Membro desde', top community;"
    - "  - 'Últimos 30 dias' in a 2-column grid: Dias ativos, Curtidas, Comentários, Ações fortes, plus Tempo médio diário and Posts vistos with 'exemplo';"
    - "  - 'Evolução': the band 60 days ago, 30 days ago and today, plus a 12-week LineChart of active days;"
    - "  - 'Onde interage': communities and content types as BarLists;"
    - "  - 'Eventos': registrations and presences;"
    - "  - 'Compras': value, purchase date, and expiry marked 'exemplo';"
    - "  - 'Atendimento': counts and dates only, never message text;"
    - "  - a deterministic suggestion by band with a disabled button."
    - "  The data is a pure builder over the roster, coherent with band rules, events, store and support totals, and unit-tested."
    - "Privacy: the README and the SUMMARY say that with real data the privacy notice must tell members that the client's management sees each member's individual behavior. Level 5 (admin do cliente) does not get the screen; this is recorded as pending. Levels 1-3 stay aggregate-only. `ownerMemberInsights` is read only by OwnerMemberDetail.tsx, and `ownerBandList` only by BandMembers.tsx."
    - "Gates with the placeholder env: lint (incl. check-ui-literals), typecheck, test, boundaries and check:static-routes are green. The full preview Playwright suite is green with new B-2/A-1..A-4/B-1/B-3 assertions, with no sideways scroll at 360/390/430 or inside the iPhone. proxy.ts, the preview layout and dashboard-preview.ts are unchanged since 6ca062b1. The dev server is restarted and answers 200. No push, no Vercel."
  artifacts:
    - path: apps/web/lib/owner-band-scope.ts
      provides: "allow-lists and parse of recorte/comunidade/evento/faixa/membro, scope/member hrefs (B-2, B-3); replaces lib/owner-communities.ts (git mv)"
      contains: "export function parseOwnerMembersView"
    - path: packages/modules/dashboard/fixtures/tenant-owner.ts
      provides: "communityEngagement[].atRiskWithPush and eventEngagement (A-2, B-2)"
      contains: "eventEngagement"
    - path: packages/modules/dashboard/fixtures/owner-members.ts
      provides: "OwnerBandScope, event registrations, dailyMinutes example, ownerBandList(scope, band) (B-1, B-2)"
      contains: "OwnerBandScope"
    - path: packages/modules/dashboard/fixtures/owner-member-insights.ts
      provides: "pure ownerMemberInsights(id) builder (B-3)"
      contains: "export function ownerMemberInsights"
    - path: apps/web/components/dashboard/BandMembers.tsx
      provides: "member cards as links, share floor, cap hint, empty band, reopened band (A-1, A-3, A-4, B-1, B-3)"
      contains: "PreviewAction"
    - path: apps/web/components/dashboard/OwnerMemberDetail.tsx
      provides: "the member insights screen (B-3)"
      contains: "ownerMemberInsights"
    - path: apps/web/components/dashboard/BandMembers.test.tsx
      provides: "component test of B-1, A-1, A-3, A-4 (count 0) against the real pt-BR catalog"
      contains: "Nenhum membro nesta faixa."
  key_links:
    - from: apps/web/app/painel-preview/[nivel]/page.tsx
      to: apps/web/lib/owner-band-scope.ts
      via: "parseOwnerMembersView(query) passed as TenantOwnerPanel `members` → OwnerMembers"
      pattern: "parseOwnerMembersView"
    - from: apps/web/components/dashboard/BandMembers.tsx
      to: apps/web/components/dashboard/OwnerMemberDetail.tsx
      via: "card href ownerMemberHref(view, band, id); OwnerMembers renders the detail when view.memberId is set"
      pattern: "ownerMemberHref"
    - from: packages/modules/dashboard/fixtures/owner-member-insights.ts
      to: packages/modules/dashboard/fixtures/owner-members.ts
      via: "builds from ownerBandRoster rows (band, dates, communities, event registrations, dailyMinutes)"
      pattern: "ownerBandRoster"
---

<objective>
Apply everything locked in 261012-qer-CONTEXT.md to the level-4 "Membros" area built in quick 261012-pkd (HEAD 6ca062b1, branch `feat/painel-preview`):
- A-1..A-4: the share floor, the scoped win-back card, the cap hint and the empty band;
- B-1: the member card;
- B-2: three scope tabs, including the new Por evento;
- B-3: tapping a member opens their insights.

Purpose: the owner reads honest band numbers in any scope (whole base, a community, an event's registrants) and can go from a band straight to one member's behavior and a suggested action.

Output:
- per-scope fixtures (communities, events) with coherence tests, and a roster that knows event registrations and an example daily time;
- a pure member-insights builder with tests;
- the rewritten scope parser (`lib/owner-band-scope.ts`);
- BandMembers cards, the OwnerMemberDetail screen, catalog keys, the component test, e2e and README.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/261012-qer-ajustes-de-fluxo-nas-faixas-por-comunida/261012-qer-CONTEXT.md
@.planning/quick/261012-pkd-faixas-de-engajamento-por-comunidade-com/261012-pkd-SUMMARY.md
@apps/web/components/dashboard/BandMembers.tsx
@apps/web/components/dashboard/OwnerMembers.tsx
@apps/web/lib/owner-communities.ts
@packages/modules/dashboard/fixtures/owner-members.ts

<interfaces>
Facts already in the code. Read them; do not re-derive them.

`packages/modules/dashboard/fixtures/shared.ts`
- Lines 40-57: counted actions are like, comment, post, RSVP "vou", check-in or walk-in, and paid order. Support messages do not count.
- Band windows:
  - new: joined < 30 days ago;
  - superfan: 12+ active days AND 3+ strong actions (comment, post, check-in, order) in 30 days;
  - engaged: 4+ active days;
  - occasional: 1-3 active days;
  - at_risk: none in 30 days, some in days 31-60;
  - inactive: none in 60 days.
- `ReportValue<T>` = `{ example: false; value }` | `{ example: true; value; reason: NotMeasuredReason }`. `needs_usage_sessions`, `needs_post_views` and `needs_access_expiry` already exist.

`packages/modules/dashboard/fixtures/tenant-owner.ts`
- `engagement.counts` = new 96, superfan 62, engaged 205, occasional 150, at_risk 168, inactive 559. `atRiskWithPush` = 69.
- `communityEngagement` (lines 265-310) is ids c-vip/c-geral/c-iniciantes/c-eventos with `{ id, bands }`.
- `events.past` (lines 404-445), date / confirmed / checkIns / walkIns:
  - e1 'Encontro set.': 2026-09-19, 100/82/6;
  - e2 'Live de dúvidas': 09-24, 148/86/0;
  - e3 'Workshop': 10-01, 50/32/0;
  - e4 'Aula aberta': 10-07, 61/30/0.
- `events.upcoming`, date / confirmed:
  - u1 'Encontro mensal': 10-12, 92;
  - u2 'Live de dúvidas': 10-15, 64;
  - u3 'Imersão presencial': 10-24, 40.
- `events.attendanceByBand` (line 498) = 24/70/94/40/6/2 presences, i.e. 236 = Σ checkIns + walkIns.
- `store.products` s2 'Comunidade VIP' has 21 orders and 413700 cents (19700 each).
- `support.weeklyConversations` (8 weeks) = [12,14,13,16,15,19,17,21] and `weeklyMedianMinutes` = [180..100].
- `byFormat` post types are video/gallery/text/link.

`packages/modules/dashboard/fixtures/owner-members.ts`
- The roster has 72 members, 12 per band. Member i = bandIndex·12 + j, with id `om-NN` and `lastActive` `{ daysAgo, time: TIMES[j] }`. The date and the time are already stored, relative to `PREVIEW_TODAY` = 2026-10-12.
- Whole-base days since the last action, by band: new j; superfan ⌊j/4⌋; engaged j; occasional 4+2j; at_risk 31+2j; inactive 64+9j.
- Joined: new 12+j days ago; others 40+23·bandIndex+9j days ago.
- VIP access only for j ≥ 2 (`COMMUNITY_RULES`).
- `ownerBandList(communityId | null, band)` returns ≤ `OWNER_BAND_LIST_LIMIT` (10) rows and `more = count − rows`. `topCommunityId` is set only for null.

Web
- `apps/web/lib/owner-communities.ts`: `OWNER_COMMUNITIES`, `parseOwnerCommunity`, `ownerMembersHref`, `OWNER_BANDS_ANCHOR = 'faixas'`. It imports `ownerAreaHref` from `dashboard-preview.ts`, which must stay fixture-free: proxy.ts imports it.
- `page.tsx:47`: `<TenantOwnerPanel area={parseOwnerArea(query)} community={parseOwnerCommunity(query)} />`. `await connection()` (line 56) stays before `notFound()`.
- `TenantOwnerPanel.tsx`:
  - the area tabs are `<ul className="grid grid-cols-3 gap-2">` with `<li className="min-w-0"><Chip href active className="w-full justify-center text-center">` (lines 95-110);
  - the `AreaComponent` prop type is at line 66.
- `OwnerMembers.tsx`:
  - the scope `<nav aria-label="Recorte das faixas">` chips are at lines 98-113;
  - the scope note is at 114-121;
  - the newActivated line is at 123-129;
  - the movement note is at 142-144;
  - the ActionCard is at 164-172; its catalog detail is "{atRisk} em risco · {withPush} com push".
- `BandMembers.tsx`: `BandSummary` (line 38) prints "{count} · {percent}" and a bar whose inner span has the inline width (line 61). The list body is at lines 85-111.
- Helpers:
  - `PanelSection.tsx:15`: `PreviewAction({ children, variant })` is a disabled Button with aria-describedby on the preview note.
  - `ExamplePill({ text })` and `exampleBadge(t, metric)`.
  - The initials circle markup is at `TenantStaffPanel.tsx:70-75`; it uses `initials(name)` from format.ts.
  - `Chip` with `active` uses `bg-brand text-on-brand`.
  - `Card` from `@rede-social/ui` (bg-card, rounded-xl, soft shadow).
  - `StatusPill` tones: brand/success/warning/danger/neutral.
  - `KpiGrid`/`KpiCard` with `badge`; `LineChart({ series, xLabels, yStep, formatValue, ariaLabel })`; `BarList({ rows })`; `ActionCard`.
  - `formatBrl` from `@rede-social/contracts/money`.
  - `formatDayMonth`, `formatMonthAbbrev`, `formatMonthYear`, `formatHoursMinutes` and `communityLabel` from format.ts.
  - Catalog: `moment` = "{days, plural, =0 {hoje {time}} =1 {ontem {time}} other {há # dias}}"; `postTypes.*`; `tenantOwner.weekly.week` = "S{week}".
- Component-test pattern (`lib/notifications-view.test.ts:16-24`):
  - `loadMessages` from `@/i18n/messages` over `messages/pt-BR`;
  - `createTranslator({ locale: 'pt-BR', messages, namespace } as never) as unknown as <T>`;
  - `// @vitest-environment happy-dom` on line 1;
  - no jest-dom, so use plain DOM assertions.
- E2E helpers (`painel-preview.spec.ts`):
  - `ownerArea`, `sectionTitled`, `bandDetails(bands, label)` (line 678), `bandScope` (nav 'Recorte das faixas', line 685), `openAllDetails`, `horizontalOverflow`, `screenMetrics`, `pageOverflow`;
  - `BAND_LIST_SCOPES` and its loop (lines 819-873);
  - the scope selector test (line 691) and the fallback test (line 754);
  - the 360/390/430 and 1440 `comunidade=vip` tests (lines 775-815).
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Three scope tabs (Por membro | Por comunidade | Por evento) with event-registrant bands and a scoped at-risk card, end to end (B-2, A-2)</name>
  <files>packages/modules/dashboard/fixtures/tenant-owner.ts, packages/modules/dashboard/fixtures/owner-members.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/tests/tenant-owner.test.ts, packages/modules/dashboard/tests/owner-members.test.ts, apps/web/lib/owner-band-scope.ts, apps/web/lib/owner-band-scope.test.ts, apps/web/app/painel-preview/[nivel]/page.tsx, apps/web/components/dashboard/TenantOwnerPanel.tsx, apps/web/components/dashboard/OwnerMembers.tsx, apps/web/components/dashboard/BandMembers.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <behavior>
    - Fixture, A-2: `communityEngagement` entries gain `atRiskWithPush`: c-vip 11, c-geral 78, c-iniciantes 49, c-eventos 40. The pinned `toEqual` includes them. Test: for the base, every community and every event, atRiskWithPush is an integer with 0 ≤ atRiskWithPush ≤ at_risk.
    - Fixture, B-2: a new `eventEngagement: { id; bands: EngagementBands; atRiskWithPush }[]`, one entry per event id. Values, as new/superfan/engaged/occasional/at_risk/inactive and then push:
      - u1: 14/26/34/12/6/0, push 3;
      - u2: 11/12/23/14/4/0, push 2;
      - u3: 3/15/16/4/2/0, push 1;
      - e4: 9/9/21/17/5/0, push 2;
      - e3: 6/16/18/7/3/0, push 1;
      - e2: 5/28/62/41/12/0, push 5;
      - e1: 1/30/45/18/6/0, push 3.
      - newActivated = counts.new, because an RSVP is a counted action (shared.ts:44).
    - Fixture tests:
      - each event's bands sum to its `confirmed`;
      - each band ≤ the base's band;
      - inactive = 0;
      - for past events, at_risk ≤ confirmed − checkIns (a check-in within 30 days makes a member active today);
      - over the past events, superfan + engaged registrants exceed half of Σ confirmed (the same story as `attendanceByBand`, 164 of 236);
      - newActivated === counts.new.
    - Roster:
      - each member gets `eventIds: string[]`;
      - for every event × band, the registered roster members are the first min(count, 12) ELIGIBLE slots in ascending j;
      - eligible means memberSince ≤ the event date for a past event, and always for an upcoming one;
      - tests: rows = min(10, count) and rows + more = count for every event × band; no past-event registrant joined after the event.
    - `OwnerBandScope` = `{ kind: 'member' } | { kind: 'community'; id } | { kind: 'event'; id }`. `ownerBandList(scope, band)` throws for an unknown id. The existing community and whole-base list tests are ported to the new signature.
    - Web lib (`owner-band-scope.test.ts`, ported from owner-communities.test.ts):
      - `OWNER_COMMUNITIES` slugs: vip, geral, iniciantes, eventos;
      - `OWNER_EVENTS` ids in the order u1, u2, u3, e4, e3, e2, e1;
      - `parseOwnerMembersView(params).scope`:
        - {} → member; recorte=membro → member;
        - recorte=comunidade&comunidade=geral → c-geral; recorte=comunidade alone or with comunidade=xyz → c-vip;
        - recorte=evento&evento=e2 → e2; recorte=evento&evento=xyz → u1;
        - legacy comunidade=vip alone → member;
        - recorte values 'COMUNIDADE', '', '__proto__', 'constructor', ['evento','evento'] and 'evento ' → member;
      - `ownerScopeHref` for each kind: `/painel-preview/dono-do-cliente?area=membros#faixas`, `…&recorte=comunidade&comunidade=vip#faixas`, `…&recorte=evento&evento=u1#faixas`.
  </behavior>
  <action>
1. RED: write all tests above first (module tests, the lib test and the e2e changes).
   - Run `pnpm --filter @rede-social/module-dashboard test` and `pnpm --filter @rede-social/web exec vitest run lib/owner-band-scope.test.ts`. They must fail by assertion or a missing export.
   - Typecheck is a GREEN gate only.
   - Commit `test(quick-261012-qer): pin the event scope, the three scope tabs and the per-scope push reach`.
2. Fixture. In `tenant-owner.ts`:
   - widen the `communityEngagement` element to `{ id; bands; atRiskWithPush }`. This is A-2's per-community `withPush`, named like the base field so that the card reads one shape;
   - add `eventEngagement` with the values above and a doc comment: today's whole-base band of everyone who RSVP'd "vou"; nobody inactive because no fixture RSVP is older than 60 days; newActivated = novos because an RSVP is a counted action.
3. Roster. In `owner-members.ts`:
   - export `OwnerBandScope`;
   - add `eventIds` to `OwnerRosterMember` through the eligibility rule;
   - change `ownerBandList` to `(scope: OwnerBandScope, band)`. The event scope filters by registration and the whole-base band, and uses the whole-base `lastActive`;
   - export the type from `fixtures/index.ts`.
4. Lib. Run `git mv apps/web/lib/owner-communities.ts apps/web/lib/owner-band-scope.ts` (and the same for the test). Keep the "never imported by proxy.ts" comment.
   - Add `OWNER_EVENTS`, derived as `[...events.upcoming, ...[...events.past].reverse()]` mapped to `{ id, name, date }`.
   - Add `OwnerMembersView = { scope: OwnerBandScope }`, which Task 4 extends.
   - Add `parseOwnerMembersView(params)`. It accepts only single exact-match strings, as in `parseOwnerCommunity`.
   - Add `ownerScopeHref(scope)`. Por membro has no `recorte`; the others carry `recorte` plus an explicit id.
   - Delete `parseOwnerCommunity` and `ownerMembersHref`; nothing else uses them.
5. Wiring.
   - `page.tsx` changes only its import and the 'dono-do-cliente' line, to `members={parseOwnerMembersView(query)}`. `await connection()` stays before `notFound()`.
   - In `TenantOwnerPanel.tsx`, the prop is renamed `community` → `members: OwnerMembersView`, and `AreaComponent` takes `{ members }`. The other areas ignore it.
   - In `OwnerMembers.tsx`, add `scopeEntry(scope)`, which returns the bands and `atRiskWithPush` of the base, the community or the event, and fails loud on a missing entry.
   - Replace the chip row with the tabs nav (the same markup as the area tabs). Under it, for community or event, add a second `<nav>` with a `flex flex-wrap gap-2` chip row:
     - aria-labels 'Comunidade das faixas' and 'Evento das faixas';
     - community chips use `communityLabel`;
     - event chips use `t('tenantOwner.bandScope.event', { name, date: formatDayMonth(date) })`, which disambiguates the two "Live de dúvidas".
   - The scope note: the community case is unchanged. The event case reads `tenantOwner.bandScope.eventNote` = "{event}: {count, plural, one {# inscrito} other {# inscritos}}. Cada um aparece na faixa que tem hoje na base toda."
   - The "Novos: X ativados de Y." line is hidden in event mode: every registrant acted, so it would always read X de X. This is a planner decision; record it in the SUMMARY. The footnote stays.
   - The movement note shows for any non-member scope. The ActionCard detail uses the scope's at_risk and atRiskWithPush (A-2 follows every scope, including events; planner decision, SUMMARY).
   - BandMembers receives `scope` and passes it to `ownerBandList`.
6. Catalog under `tenantOwner.bandScope`: add `byMember` "Por membro", `byCommunity` "Por comunidade", `byEvent` "Por evento", `communityLabel` "Comunidade das faixas", `eventLabel` "Evento das faixas", `event` "{name} · {date}" and `eventNote`. Remove `all` if it is now unused.
7. E2E. Rewrite the scope selector test:
   - tab texts and hrefs;
   - one `aria-current` per row;
   - the three tab widths are equal within 1 px;
   - Por comunidade shows 4 chips with VIP current; clicking Geral moves `aria-current`;
   - Por evento shows 7 chips, the first 'Encontro mensal · 12/10' current, plus the eventNote "Encontro mensal · 12/10: 92 inscritos. …";
   - the Membros area tab stays current;
   - at 360 px neither row scrolls sideways.

   Rewrite the fallback test with the parse cases.

   `BAND_LIST_SCOPES` becomes 12 rows (Por membro, 4 communities, 7 events), each with its query and its `recover` text. VIP/Geral/Iniciantes/Eventos are as in the behavior. Events, as em risco / push:
   - u1 '6 em risco · 3 com push'; u2 '4 · 2'; u3 '2 · 1';
   - e4 '5 · 2'; e3 '3 · 1'; e2 '12 · 5'; e1 '6 · 3'.

   In the loop, a count of 0 is allowed (0 rows and no 'e mais'). Pin the u1 Novos summary '14 · 15%'. Point the 360/390/430 and 1440 tests at `&recorte=comunidade&comunidade=vip`.
8. GREEN: run the verify below. The tracer gate is automatic (`human_verify_mode` is end-of-phase). Commit `feat(quick-261012-qer): scope the bands by member, community or event`. Use an English numbered body in human terms that ends with the checks run and their results; never name the review tooling.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && pnpm --filter @rede-social/module-dashboard test && pnpm --filter @rede-social/module-dashboard typecheck && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/web exec vitest run lib/owner-band-scope.test.ts && pnpm --filter @rede-social/web typecheck && PID=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t); if [ -n "$PID" ]; then kill $PID; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts -g "dono-do-cliente"</automated>
  </verify>
  <done>
    - The three tabs and the second rows work without JS, and every invalid value falls back as specified.
    - Por evento shows coherent registrant bands with lists.
    - The at-risk card follows every scope.
    - The module tests, the lib test, both typechecks and the `-g dono-do-cliente` run are green.
    - Two commits.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Member cards and honest band bodies (B-1, A-1, A-3, A-4)</name>
  <files>packages/modules/dashboard/fixtures/owner-members.ts, packages/modules/dashboard/tests/owner-members.test.ts, apps/web/components/dashboard/BandMembers.tsx, apps/web/components/dashboard/BandMembers.test.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <behavior>
    - Roster: each member has `dailyMinutes: ReportValue<number>` (example, reason `needs_usage_sessions`). The minutes are a pure function of band and j: new 18+2j, superfan 45+3j, engaged 25+2j, occasional 8+j, at_risk 2+(j mod 3), inactive 0. `ownerBandList` rows carry `topCommunityId` and `dailyMinutes` in EVERY scope. Tests: the ranges by band; topCommunityId is set on every row of every scope.
    - Component test (`BandMembers.test.tsx`, happy-dom, real catalog, `vi.mock('@/lib/registry', () => ({ moduleLabelResolver: () => () => undefined }))` with a one-line WHY):
      - B-1: Por membro, Novos: the first card (`li`) contains 'Luana Ferraz', 'Membro desde: set. de 2026', 'Última atividade: hoje às 22:40', 'Comunidade que mais interage: Geral', 'Tempo médio diário: 18 min' and 'exemplo'. The initials circle reads 'LF' and is aria-hidden.
      - A-1: Eventos community scope, Superfãs: the summary contains '3 · menos de 1%'. Novos still reads '96 · 8%'. The bar span has `min-w-1.5` with count > 0 and lacks it at count 0.
      - A-3: Por membro, Em risco: 'Os 10 com atividade mais recente' precedes the `<ul>` in DOM order. 'e mais 158 membros' is present, and a `button` 'Ver todos' is `disabled`. Eventos Superfãs (3) has none of the three.
      - A-4: Por membro with a copy of `engagement` whose at_risk is 0: the summary reads '0 · 0%' and the body is only 'Nenhum membro nesta faixa.', with no `li`, no 'e mais', no 'Os 10' line and no button.
  </behavior>
  <action>
1. RED.
   - Write the roster tests and `BandMembers.test.tsx`. If `next-intl/server` throws at import, also mock it with `getTranslations: vi.fn()`. Find each band's `<details>` by its summary `span.font-bold`, and assert on textContent, querySelector and classList; closed details stay in the DOM.
   - E2E, in the `BAND_LIST_SCOPES` loop:
     - every card contains 'Membro desde:', 'Última atividade:', 'Comunidade que mais interage:' and 'Tempo médio diário:' (this replaces the old 'Interage mais em' check, which only applied to the whole base);
     - count > 10 → 'Os 10 com atividade mais recente' is visible and the 'Ver todos' button is disabled; otherwise both have count 0;
     - count 0 → 'Nenhum membro nesta faixa.' is visible;
     - Iniciantes/Eventos Superfãs read '6 · menos de 1%' and '3 · menos de 1%', with the `summary span[aria-hidden="true"] > span` bar's `boundingBox().width` ≥ 5;
     - the pinned first Novos card now reads 'Última atividade: hoje às 22:40'.
   - Run the module tests and `pnpm --filter @rede-social/web exec vitest run components/dashboard/BandMembers.test.tsx`. Both must fail by assertion.
   - Commit `test(quick-261012-qer): pin the member card, the share floor, the list cap hint and the empty band`.
2. Roster: add `dailyMinutes` and return `topCommunityId` in every scope. The "only the whole base" rule is gone per B-1; update its doc comment.
3. Catalog under `tenantOwner.bandMembers`:
   - `since` "Membro desde:", `lastActive` "Última atividade:", `topCommunity` "Comunidade que mais interage:", `dailyTime` "Tempo médio diário:";
   - `when` "{days, plural, =0 {hoje às {time}} =1 {ontem às {time}} other {há # dias}}";
   - `underOnePercent` "menos de 1%", `recent` "Os {count} com atividade mais recente", `seeAll` "Ver todos", `empty` "Nenhum membro nesta faixa.";
   - remove `line` and `top` once unused.
4. `BandMembers.tsx`.
   - A-1: a local `bandShare(t, count, total)` returns `underOnePercent` when `count > 0 && Math.round(percentOf(count, total)) === 0`, else `formatPercent(...)`. `Math.round` matches the half-expand rounding of formatPercent. The bar's inner span gets `count > 0 && 'min-w-1.5'`, a 6 px dot at the bar's height.
   - B-1: each member is an `<li>` holding a `Card` with `flex items-start gap-3 p-3`:
     - a `size-11` initials circle with `rounded-full bg-brand text-on-brand text-sm font-bold`, aria-hidden, showing `initials(name)`. The fixture has no photos; README notes the photo replaces the initials once profiles are wired;
     - a `min-w-0 flex-1 [overflow-wrap:anywhere]` column: the name in `text-base font-bold text-text`, then a `<dl>` of four lines, each a `<div className="text-xs text-text-secondary">` with an inline `<dt className="inline font-semibold">` label, a space and an inline `<dd>` value;
     - the 'Tempo médio diário' line uses `formatHoursMinutes(t, value)` followed by `<ExamplePill text={exampleBadge(t, member.dailyMinutes)} />` on that same line.

     The planner decision is per card: the pill stays next to the fictional number, as every other example value in the preview does, and a single neutral pill per card stays light. Record it in the SUMMARY. The `<ul>` becomes `flex flex-col gap-3`.
   - A-3/A-4, one rule: a band with count 0 renders only the `empty` paragraph. Otherwise:
     - when `more > 0`, the `recent` paragraph (count = members.length) goes above the `<ul>`;
     - when `more > 0`, a `flex flex-wrap items-center justify-between gap-2` row goes below it, holding the 'e mais' paragraph and `<PreviewAction>{t('tenantOwner.bandMembers.seeAll')}</PreviewAction>`.

     Keying on `count` keeps the body in agreement with the "0 · 0%" summary.
5. GREEN: run the verify below. Commit `feat(quick-261012-qer): member cards and honest band bodies` with a numbered English body plus evidence.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && pnpm --filter @rede-social/module-dashboard test && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/web exec vitest run components/dashboard/BandMembers.test.tsx && pnpm --filter @rede-social/web typecheck && PID=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t); if [ -n "$PID" ]; then kill $PID; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts -g "dono-do-cliente membros"</automated>
  </verify>
  <done>
    - Cards show the avatar, the bold name and the four labeled lines, including 'hoje às 22:40' and the example daily time.
    - 'menos de 1%' and the minimum bar apply.
    - The cap hint and the disabled 'Ver todos' appear only over 10.
    - A 0-member band opens to the empty sentence (component test plus every event's Inativos).
    - The checks are green, with two commits.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: A pure, coherent member-insights builder (B-3 data)</name>
  <files>packages/modules/dashboard/fixtures/owner-member-insights.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/fixtures/owner-members.ts, packages/modules/dashboard/tests/owner-member-insights.test.ts</files>
  <behavior>
    `ownerMemberInsights(id)` returns `OwnerMemberInsights | null` (null for an id not in the roster). It is pure, with no clock or randomness, and is built from the roster row. Tests loop over all 72 members.
    - Header: id, name, band, memberSince, lastActive and topCommunityId, all equal to the roster row.
    - `last30`: `activeDays`, `likes`, `comments`, `checkIns`, `orders`, `strongActions`, `dailyMinutes` (the roster's own ReportValue) and `postsSeen` (example, `needs_post_views`).
      - The band rule holds: superfan ≥ 12 active days and ≥ 3 strong actions; engaged 4–11; occasional 1–3; at_risk and inactive 0; new ≥ 1.
      - strongActions = comments + checkIns + orders (members cannot post in V1).
      - at_risk and inactive have every count at 0.
    - `weeklyActiveDays`: 12 numbers (oldest first), each 0–7.
      - The most recent non-zero week is week ⌊lastActive.daysAgo / 7⌋ counted back from the end, and every later week is 0. A lastActive beyond 83 days means all zeros.
      - Σ of the last 4 weeks ≤ activeDays ≤ Σ of the last 5 weeks.
      - Weeks before memberSince are 0.
    - `bandHistory`: three entries, at 60 days ago, 30 days ago and today, as `{ month: 'YYYY-MM' | 'today', band | null }`.
      - Today's entry is the roster band.
      - null before memberSince, so every novo has null for 60 days ago.
      - at_risk has an active band 30 days ago.
      - inactive has at_risk or inactive 30 days ago.
    - `communities`: every community the member can access, with lifetime actions sorted descending. The first is topCommunityId and is strictly greater than the rest.
    - `postTypes`: interactions per post type (video/gallery/text/link), sorted descending.
    - `events`: the member's registrations (roster `eventIds`), each with `attended: boolean | null` (null for upcoming).
      - attended ⇒ past event, the band is not at_risk or inactive, and lastActive.daysAgo ≤ days since the event.
      - `last30.checkIns` = the count of attended events.
      - Every attended event's week has ≥ 1 active day.
      - Σ roster attendees per event ≤ the event's checkIns.
    - `purchases`: a Comunidade VIP purchase exactly when the member has VIP access (j ≥ 2), dated memberSince + 1 day, at 19700 cents (= s2 cents / orders), with `expiresAt` as an example (`needs_access_expiry`) at the purchase date + 365 days.
      - The purchase date is never after the member's last action.
      - `last30.orders` = purchases within 30 days.
      - Σ roster VIP purchases within 30 days ≤ 21.
    - `support`: `conversations` (count in the last 8 weeks), `lastDaysAgo` (null when 0) and `medianResponseMinutes` (null when 0, else within [min, max] of `weeklyMedianMinutes`).
      - Σ roster conversations ≤ Σ `weeklyConversations` (127).
      - The object's keys are exactly those three: no message text.
    - `suggestion`: `{ kind: EngagementBand; days: number }` derived from the band. days = days since joining for new, and lastActive.daysAgo otherwise.
  </behavior>
  <action>
1. RED.
   - Write `tests/owner-member-insights.test.ts` with every behavior above, looping over `ownerBandRoster`, plus `ownerMemberInsights('om-99') === null` and determinism (two calls are deep-equal).
   - Run the module tests. They must fail on the missing module.
   - Commit `test(quick-261012-qer): pin the member insights' coherence with the roster and the panel totals`.
2. Write `fixtures/owner-member-insights.ts`.
   - Start with a header doc comment: RAW DATA (MOD-02), a pure builder over the roster, the coherence rules above, and that it is visible to the client's management only.
   - Derive every number from (bandIndex, j) with small closed-form rules chosen to satisfy the tests. Examples:
     - superfan activeDays 14+(j mod 6);
     - engaged 4+(j mod 8);
     - occasional 1+(j mod 3), capped so that check-ins ≤ activeDays;
     - weekly days spread backwards from lastActive's week.
   - Reuse roster internals instead of duplicating them: export `PREVIEW_TODAY`, the `daysBefore` helper and a `daysSince(isoDate)` from owner-members.ts if needed.
   - Export the function and its types from `fixtures/index.ts`.
3. GREEN: run the verify below. Commit `feat(quick-261012-qer): build each member's insights from the roster`, with a numbered English body plus evidence.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && pnpm --filter @rede-social/module-dashboard test && pnpm --filter @rede-social/module-dashboard typecheck && pnpm --filter @rede-social/module-dashboard lint</automated>
  </verify>
  <done>
    - All 72 members produce insights that are coherent with their band, dates, events, store and support totals, and the tests prove it.
    - There are no message texts and no randomness.
    - Two commits.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 4: Tapping a member opens their insights, with Voltar to the same band; docs, full gates and server restart (B-3)</name>
  <files>apps/web/lib/owner-band-scope.ts, apps/web/lib/owner-band-scope.test.ts, apps/web/components/dashboard/OwnerMembers.tsx, apps/web/components/dashboard/BandMembers.tsx, apps/web/components/dashboard/OwnerMemberDetail.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts, packages/modules/dashboard/README.md</files>
  <behavior>
    - Lib:
      - `OwnerMembersView` gains `band: EngagementBand | null` (`faixa` slugs: novos, superfas, engajados, ocasionais, em-risco, inativos) and `memberId: string | null` (`membro` = a roster id). Both are exact single strings; anything else gives null.
      - `ownerScopeHref(scope, band?)` adds `&faixa=<slug>` before `#faixas`.
      - `ownerMemberHref(scope, band, id)` builds the scope query plus `&faixa=<slug>&membro=<id>`, with no anchor.
      - Tests: the slug round trip; `membro` 'om-01' accepted; 'om-99', 'OM-01', '__proto__' and arrays → null; `faixa=at_risk` → null (slugs only).
    - E2E:
      - Por membro → open Em risco → click its first card. The URL matches `faixa=em-risco&membro=om-\d\d$` and the Membros area tab stays current.
      - The heading is the card's name.
      - The band pill reads 'Em risco'.
      - The KPI 'Dias ativos' is 0.
      - 'Tempo médio diário' and 'Posts vistos' each carry an 'exemplo' badge.
      - The section headings appear in order: Últimos 30 dias, Evolução, Onde interage, Eventos, Compras, Atendimento, Sugestão de ação.
      - The suggestion button is disabled.
      - 'Voltar' has an href ending `?area=membros&faixa=em-risco#faixas`; clicking it shows the Em risco `<details open>`.
    - E2E, further cases:
      - From Por evento (u1), a card's Voltar keeps `recorte=evento&evento=u1&faixa=…`.
      - `membro=xyz` shows the bands list with no 'Voltar'.
      - A Superfãs member's detail at 360/390/430 has no sideways scroll, and at 1440 inside the phone it has none either.
  </behavior>
  <action>
1. RED.
   - Write the lib tests and the e2e above.
   - Run the lib test. It must fail by assertion or a missing export.
   - Commit `test(quick-261012-qer): pin the member insights route and the way back to the band`.
2. Lib: implement the behavior. `OWNER_MEMBER_IDS` is derived from `ownerBandRoster`.
3. BandMembers:
   - each card's content goes inside `<a href={ownerMemberHref(scope, band, member.id)} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">` around the Card, and the card gets a `hover:bg-bg-secondary`-style token hover;
   - the band named by `openBand` renders `<Collapsible open>`.
4. OwnerMembers: when `members.memberId` is set, render only `<OwnerMemberDetail t view={members} />` instead of the area's blocks.
5. `OwnerMemberDetail.tsx`: a server component reading `ownerMemberInsights(view.memberId)`. A null result is unreachable after parsing, so it fails loud. Top to bottom:
   - (0) a `Voltar` link (`Chip` or Button-styled `<a>`) to `ownerScopeHref(view.scope, view.band)`;
   - (1) a header `Card`:
     - a `size-14` initials circle, with the same classes as the B-1 card;
     - the name as the `<h3>`, `text-lg font-bold`;
     - the band in a `StatusPill`: superfan and engaged success, new and occasional neutral, at_risk warning, inactive danger;
     - 'Membro desde: …' and 'Comunidade que mais interage: …';
   - (2) `PanelSection` 'Últimos 30 dias' with `KpiGrid` (2 columns on a phone): Dias ativos, Curtidas, Comentários, Ações fortes, Tempo médio diário (`formatHoursMinutes`, `badge=exampleBadge`), Posts vistos (`badge=exampleBadge`);
   - (3) 'Evolução':
     - an `<ol>` of three `{month}: {band}` lines (`formatMonthAbbrev` or 'hoje'; null → 'Ainda não era membro');
     - a `LineChart` of `weeklyActiveDays` with `yStep` 7, xLabels `tenantOwner.weekly.week` every 4th, formatValue `formatCount`, ariaLabel 'Dias ativos por semana, últimas 12 semanas';
   - (4) 'Onde interage': a `BarList` of communities (`communityLabel`, the top one highlighted) and a `BarList` of `postTypes.*`;
   - (5) 'Eventos':
     - one row per registration: '{name} · {dd/mm}' plus a StatusPill: 'Foi' success, 'Não foi' neutral, 'Inscrito' brand (upcoming);
     - empty → 'Nenhuma inscrição em eventos.';
   - (6) 'Compras':
     - 'Comunidade VIP', then 'Comprado em {dd/mm/aaaa} · {formatBrl}', then 'Vence em {date}' with `ExamplePill`;
     - empty → 'Nenhuma compra.';
   - (7) 'Atendimento':
     - '{count, plural, one {# conversa} other {# conversas}} em 8 semanas · última há {days} dias · primeira resposta em {formatHoursMinutes}';
     - empty → 'Nenhuma conversa com o atendimento em 8 semanas.';
   - (8) an `ActionCard` titled 'Sugestão de ação', with the detail by band and a `PreviewAction` button:
     - new: 'Entrou há {days} dias. Dê as boas-vindas e indique a comunidade Iniciantes.' / 'Enviar boas-vindas';
     - superfan: 'Um dos que mais participam. Convide para receber os novos no próximo encontro.' / 'Enviar convite';
     - engaged: 'Participa com frequência. Mostre o próximo evento: {event}.' / 'Avisar sobre o evento';
     - occasional: the same as engaged;
     - at_risk: 'Sem ações há {days} dias. Convide para o próximo encontro: {event}.' / 'Convidar para o encontro';
     - inactive: 'Sem ações há {days} dias. Mande uma mensagem chamando de volta.' / 'Enviar mensagem';
     - {event} = 'Encontro mensal · 12/10', the first in-person upcoming event.

   Every string lives in the catalog under `tenantOwner.memberDetail.*`. The layout is single-column, with `min-w-0` and `[overflow-wrap:anywhere]` where text can be long.
6. README (`packages/modules/dashboard/README.md`), in the Membros section:
   - the three scope tabs and the event registrants' bands with their coherence rules;
   - the per-scope `atRiskWithPush` and the card following the scope;
   - the member card (the photo replaces the initials once profiles are wired);
   - 'menos de 1%', the cap hint with the disabled 'Ver todos';
   - the insights builder and its rules;
   - a privacy paragraph: with real data, the privacy notice must tell members that the client's management sees each member's individual behavior (30-day numbers, events, purchases and support counts, never message text);
   - under "Para quando os dados reais forem ligados": replace the empty-band bullet with the implemented sentence, and add "Level 5 (admin do cliente) has no member list, so it does not get the insights screen yet."
7. GREEN.
   - Run the full verify below with the placeholder env. Stop ONLY the :3000 listener; never touch Chrome.
   - Commit `feat(quick-261012-qer): open a member's insights from their band card`.
   - Commit the README as `docs(quick-261012-qer): scope tabs, member cards, member insights and the privacy note`.
   - Each body is numbered English with evidence.
8. Restart the dev server exactly as in CONTEXT.md: `cd "/Users/macos/Desktop/rede social/rede-social" && API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder nohup pnpm --filter @rede-social/web dev > /tmp/rede-dev.log 2>&1 &`.
   - Poll with a bounded loop (≤ 120 s, `curl --max-time 10`) until `http://localhost:3000/painel-preview/dono-do-cliente?area=membros&comunidade=eventos` answers 200.
   - Then check `…?area=membros&recorte=evento&evento=u1` and `…?area=membros&faixa=em-risco&membro=om-49`; both must answer 200.
   - No push, no Vercel.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/web exec vitest run lib/owner-band-scope.test.ts components/dashboard/BandMembers.test.tsx && pnpm lint && pnpm typecheck && pnpm test && pnpm boundaries && pnpm check:static-routes && PID=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t); if [ -n "$PID" ]; then kill $PID; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts && git diff --quiet 6ca062b1 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts && grep -rl "ownerMemberInsights" apps/web/app apps/web/components apps/web/lib && grep -rl "ownerBandList" apps/web/app apps/web/components apps/web/lib && echo "gate OK"</automated>
  </verify>
  <done>
    - Any member card opens that member's insights with all 8 blocks, and the example values are marked.
    - Voltar returns to the same scope with the same band open at #faixas, and invalid params fall back.
    - The README carries the privacy note and the level-5 pending item.
    - All gates and the full preview suite are green.
    - Both `grep -rl` lines list only OwnerMemberDetail.tsx and BandMembers.tsx respectively.
    - The dev server answers 200 on the three URLs.
    - Three commits.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL query → server render | `recorte`, `comunidade`, `evento`, `faixa` and `membro` are untrusted and pick what the server renders |
| Fixture data → client's management | The band cards and the new insights screen show one member's individual behavior to the client's team |
| Preview route → production | The preview must stay unreachable in production without its env gate |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-qer-01 | Tampering | `parseOwnerMembersView`, `ownerScopeHref`, `ownerMemberHref` | low | mitigate | Exact-match allow-lists derived from the fixture: community slugs, event ids, band slugs and roster ids. Only those constants ever reach markup or URLs. Unit tests cover '__proto__', 'constructor', wrong case, empty, padded and array params, and e2e covers the fallbacks. |
| T-qer-02 | Information disclosure | `OwnerMemberDetail`, `BandMembers` | medium | accept | This is a user decision (B-1, B-3): the client's management sees individual behavior. The README and SUMMARY require the privacy notice to say so before real data. Support shows counts and dates only; the insights type has no message field (unit test on its keys). `ownerMemberInsights` and `ownerBandList` are read only by their single component (acceptance grep), so levels 1-3 stay aggregate-only, and level 5 does not get the screen. |
| T-qer-03 | Elevation of privilege | proxy.ts, painel-preview layout, dashboard-preview.ts, [nivel]/page.tsx | high | mitigate | `git diff --quiet 6ca062b1` on the first three is part of the final gate. page.tsx changes only its import and the 'dono-do-cliente' line, with `await connection()` still before `notFound()`. Fixtures stay out of dashboard-preview.ts, so proxy.ts never loads them. |
| T-qer-04 | Repudiation (misleading data) | `eventEngagement`, `atRiskWithPush`, roster registrations, `ownerMemberInsights` | low | mitigate | Coherence tests: sums to confirmed, dominance by the base, no-shows bound em risco, push ≤ em risco in every scope, band rules against 30-day numbers and weekly days, purchases against store orders, support against weekly totals, and attendance against check-ins. Example values always render with the 'exemplo' pill. |
| T-qer-05 | Denial of service | roster and insights builders in the server render | low | accept | Pure functions over 72 static rows and 7 events, with no I/O. |
</threat_model>

<verification>
- Each task's verify is green before the next task starts. Tasks 1-3 are TDD (a RED commit failing by assertion, then GREEN).
- Final gate (Task 4), with the placeholder env:
  - lint (incl. check-ui-literals), typecheck, test, boundaries, check:static-routes and the full `playwright.preview.config.ts` suite are green;
  - proxy.ts, layout.tsx and dashboard-preview.ts are unchanged since 6ca062b1.
- Only the :3000 listener is ever stopped; Chrome is never touched. The dev server is restarted and answers 200 on `?area=membros&comunidade=eventos`, `?area=membros&recorte=evento&evento=u1` and `?area=membros&faixa=em-risco&membro=om-49`.
- `find apps/web/components/dashboard apps/web/lib apps/web/e2e-preview packages/modules/dashboard -name '* 2*'` prints nothing.
- Nothing is pushed or deployed (no Vercel).
</verification>

<success_criteria>
- B-2: three equal tabs. Por comunidade and Por evento each have a second row. Event-registrant bands are coherent and unit-tested, and every value falls back as specified.
- A-2: the at-risk card follows every scope; Por membro stays 168 / 69.
- B-1: member cards with an initials avatar, the bold name and four labeled lines ('hoje às 22:40', 'Comunidade que mais interage' in every scope, the example daily time with its pill).
- A-1/A-3/A-4: 'menos de 1%' with a ≥ 6 px bar. 'Os 10 com atividade mais recente' plus a disabled 'Ver todos' only over 10. 'Nenhum membro nesta faixa.' for a 0 band.
- B-3: a card opens the member's insights (8 blocks, examples marked, no message text) with Voltar to the same band. The data is a pure builder proven coherent.
- Privacy and level-5 pending items are recorded. All gates and the full suite are green, the server is restarted, and there are 9 commits.
</success_criteria>

<output>
Create `.planning/quick/261012-qer-ajustes-de-fluxo-nas-faixas-por-comunida/261012-qer-SUMMARY.md` in pt-BR, like the 261012-pkd SUMMARY. Include:
- the commits table;
- A-1..A-4 and B-1..B-3 as applied, with the planner decisions:
  - A-4 keeps `<details>` (count 0 → sentence);
  - the 'exemplo' pill sits per card on the daily-time line;
  - the at-risk card follows every scope, events included;
  - the "Novos: X ativados de Y." line is hidden in event mode;
  - a bare legacy `comunidade=` falls to Por membro;
  - Voltar reopens the origin band through `faixa=`;
- the per-scope numbers (communities and events, with push);
- the insights rules in short;
- the privacy paragraph as in the README;
- the gate evidence table (command → result) and the restart with its three 200s;
- a final `**⚠️ NÃO FEITO**` block, at least:
  - level 5 without the insights screen (B-3, recorded as pending);
  - the photo replacing the initials once real profiles exist;
  - critic and flow-critic over the new commits, if this executor cannot launch subagents.

Do not commit STATE.md or touch the ROADMAP: the orchestrator owns them.
</output>
