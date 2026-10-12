---
phase: quick-261012-oxi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/modules/dashboard/ui/metrics.ts
  - packages/modules/dashboard/ui/index.ts
  - packages/modules/dashboard/fixtures/tenant-owner.ts
  - packages/modules/dashboard/tests/metrics.test.ts
  - packages/modules/dashboard/tests/tenant-owner.test.ts
  - packages/modules/dashboard/README.md
  - apps/web/components/dashboard/OwnerContent.tsx
  - apps/web/components/dashboard/OwnerEvents.tsx
  - apps/web/components/dashboard/OwnerSupport.tsx
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, PWA-03, MOD-02]
tags: [dashboard, preview, tenant-owner, review-fixes, pt-BR]

estimate:
  tokens: 90000
  raw_tokens: 90000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "Eventos > Lista de espera: the cards 'Conseguiram vaga' (15) and 'Foram ao evento' (10) each carry the 'exemplo' pill, derived from `events.waitlist.example`. The section has 3 pills and the Eventos area has 3 in total (C-1)."
    - "The attendance KPI note on Visão geral reads 'check-in ÷ inscritos', the same word as the Eventos footnote 'Check-in ÷ inscritos. …' (C-2)."
    - "Conteúdo > Posts que mais renderam has exactly ONE 'exemplo' pill, on a note line under the title that says likes and comments are measured and saves and shares are example values. No post row has a pill, and the rows still show '18 salvamentos · 7 compartilhamentos'. The KPIs 'Alcance por post', '% assistido' and 'Conclusão' keep their pills. The Conteúdo area has 4 pills in total (C-3)."
    - "`tenantOwnerPanel.byFormat` stores posts and total likes + comments per format (video 18 · 1.729, gallery 15 · 1.067, text 20 · 960, link 8 · 184). The per-post figure is computed with `perItem` (96 / 71 / 48 / 23, as the screen showed before). A unit test proves the interactions sum to 3.940 = likes 3.100 + comments 840 (C-4)."
    - "On Atendimento, the closed 'Atendimentos por assunto' summary reads 'Acesso e login lidera: 26 (35%)', computed from `support.bySubject`, followed by the 'exemplo' pill (C-5)."
    - "A new pure helper `topBy(rows, score)` picks the highest-scoring row (the earliest on a tie). It decides the community 'rende mais' and its bar highlight, the attendance-per-event highlight, and the top channel. Unit tests rotate and reverse the fixture rows and get the same pick: c-vip, e1 and likes (C-6)."
    - "The module README has a section 'Para quando os dados reais forem ligados'. It lists the six level-4 blocks that need an empty-list sentence (C-7) and the level-6 'Acessos que vencem em 7 dias: 6' shown as measured while `expires_at` is never written (C-8)."
    - "pnpm lint (with check-ui-literals), typecheck, test, boundaries and check:static-routes are green, and so is the full preview Playwright suite. proxy.ts, the painel-preview layout and page.tsx are unchanged since d8e8155c."
  artifacts:
    - path: packages/modules/dashboard/ui/metrics.ts
      provides: "topBy: value-based pick for highlights (C-6)"
      contains: "export function topBy"
    - path: packages/modules/dashboard/fixtures/tenant-owner.ts
      provides: "byFormat with raw interactions per format (C-4)"
      contains: "interactions: 1729"
    - path: packages/modules/dashboard/tests/tenant-owner.test.ts
      provides: "C-4 sum proof and C-6 rotated-order proofs"
      contains: "topBy"
    - path: apps/web/messages/pt-BR/dashboard.json
      provides: "tenantOwner.topPosts.exampleNote, tenantOwner.subjects.summary, attendanceNote with 'inscritos'"
      contains: "lidera: {count} ({percent})"
    - path: packages/modules/dashboard/README.md
      provides: "C-7 / C-8 notes for when real data is wired"
      contains: "Para quando os dados reais forem ligados"
  key_links:
    - from: apps/web/components/dashboard/OwnerContent.tsx
      to: packages/modules/dashboard/ui/metrics.ts
      via: "topBy for the community, best day/slot and channel; perItem for per-format figures"
      pattern: "topBy\\(byCommunity"
    - from: apps/web/components/dashboard/OwnerEvents.tsx
      to: packages/modules/dashboard/ui/metrics.ts
      via: "topBy(past, eventPercent) drives the attendance highlight"
      pattern: "topBy\\(past"
    - from: apps/web/components/dashboard/OwnerSupport.tsx
      to: apps/web/messages/pt-BR/dashboard.json
      via: "tenantOwner.subjects.summary in the collapsed summary"
      pattern: "tenantOwner.subjects.summary"
    - from: apps/web/e2e-preview/painel-preview.spec.ts
      to: "rendered pill counts"
      via: "OWNER_AREA_CASES pills: conteudo 4, eventos 3"
      pattern: "pills: 4"
---

<objective>
Fix the findings that the critic and flow-critic reviews raised on quick 261012-o00, the level-4 owner panel at `/painel-preview/dono-do-cliente`. These are targeted fixes, not a redesign. The fix list C-1..C-8 in `261012-oxi-CONTEXT.md` is LOCKED, and every item below cites its ID.

Purpose: the panel must not contradict itself. Every example value carries the pill, one indicator keeps one name, highlights follow the values rather than the array order, and the per-format figures are computed instead of typed. The owner should not be buried in pills, and a collapsed block should say its headline number. The README records what has to change when real data is wired.

Output: the `topBy` helper and its tests, a corrected `byFormat` fixture, edits to three area components and the catalog, updated e2e counts, a README section, and 3 screenshots (not versioned).
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/quick/261012-oxi-corrigir-achados-das-revisoes-do-painel-/261012-oxi-CONTEXT.md
@.planning/quick/261012-o00-painel-do-dono-do-cliente-em-seis-areas-/261012-o00-SUMMARY.md
@apps/web/AGENTS.md

Branch `feat/painel-preview`, HEAD d8e8155c. Docker and Supabase are unavailable, and the preview needs neither.

House rules (unchanged from o00): fictional data only. Every on-screen string lives in `apps/web/messages/pt-BR/dashboard.json`, in pt-BR with accents. Use design tokens only, no hex. Keep the `@3xl` layout. Scroll is vertical only. The production gate stays intact. Biome, boundaries and check-ui-literals must stay green. Code comments and commit messages are in English.

Interfaces the executor needs (verified in the files at HEAD d8e8155c):
- `packages/modules/dashboard/ui/metrics.ts` exports `percentOf(part, whole)` (unrounded 0–100), `sumOf(rows, pick)`, `perItem(total, count)` (`Math.round`, 0 when count ≤ 0) and `attendancePercent(rows)`. `ui/index.ts` re-exports them in a named list.
- `apps/web/components/dashboard/format.ts` has `exampleBadge(t, { example })`, which returns `t('example')` or undefined, and `formatPercent(v)` (0–100 in, `maximumFractionDigits: 0`, so 26/74 renders "35%").
- `ExamplePill({ text })` renders nothing when `text` is undefined. `KpiCard` takes `badge?: string`. `Collapsible` takes `summary?: ReactNode`, and the summary is wrapped in a `text-xs text-text-secondary` span.
- The pill-next-to-text summary pattern already exists in two places. `OwnerFinance.tsx:129-133` wraps the text and the `ExamplePill` in `<span className="inline-flex flex-wrap items-center gap-2">`. `OwnerEvents.tsx:90-98` puts the waitlist summary line in `<p className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">` with a `<span>` and an `ExamplePill`.
- The leader sentence pattern is the catalog key `tenantOwner.revenue.summary` = "{product} lidera: {value}".
- The e2e helpers in `painel-preview.spec.ts` are `ownerArea(page)`, `sectionTitled(locator, title)` (the ancestor `<section>` of an exact heading), `kpiCard(locator, label)` and `areaDetails(page, title)`. `OWNER_AREA_CASES` is at lines 450-462.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Computed per-format interactions and highlights picked by value, end to end (C-4, C-6)</name>
  <files>packages/modules/dashboard/ui/metrics.ts, packages/modules/dashboard/ui/index.ts, packages/modules/dashboard/fixtures/tenant-owner.ts, packages/modules/dashboard/tests/metrics.test.ts, packages/modules/dashboard/tests/tenant-owner.test.ts, apps/web/components/dashboard/OwnerContent.tsx, apps/web/components/dashboard/OwnerEvents.tsx</files>
  <read_first>packages/modules/dashboard/ui/metrics.ts (whole file), packages/modules/dashboard/ui/index.ts (the metrics export list), packages/modules/dashboard/fixtures/tenant-owner.ts lines 110-122 and 267-278, packages/modules/dashboard/tests/tenant-owner.test.ts lines 1-31 and 100-128, apps/web/components/dashboard/OwnerContent.tsx (whole), apps/web/components/dashboard/OwnerEvents.tsx lines 27-53 and 134-162</read_first>
  <behavior>
    - metrics.test.ts `topBy`: no rows gives undefined. It picks the highest score whatever the input order. On a tie it returns the earliest row. With all-negative scores it still returns the largest one, which proves there is no 0 seed.
    - tenant-owner.test.ts 'interactions by format' (C-4): the posts sum to 61. The interactions sum to 3940, which equals the likes channel plus the comments channel. `perItem(interactions, posts)` per format, in fixture order, is [96, 71, 48, 23].
    - tenant-owner.test.ts 'highlights follow the values, not the order' (C-6): build every rotation of the array plus its reverse. For each ordering, `topBy(byCommunity, perItem of interactions over posts)` has id 'c-vip' and value 75. `topBy(events.past, percentOf(checkIns, confirmed))` has id 'e1' (82%). `topBy(channels, count)` has channel 'likes'.
  </behavior>
  <action>
RED first, following the fcr/o00 precedent of a red tree with a green typecheck. Commit message: `test(quick-261012-oxi): pin per-format interactions and value-picked highlights`. It contains:
(a) The tests from <behavior>. Import `topBy` from '../ui/metrics' in both test files. In tenant-owner.test.ts, add `byFormat`, `channels` and `events` to the existing top-of-file destructure, or read them from `tenantOwnerPanel`, whichever the file already does. Write a small local helper that returns every rotation of an array plus its reverse.
(b) In metrics.ts, the `topBy` signature with a body that throws `new Error('not implemented')`. Export it from ui/index.ts next to `perItem` and `sumOf`.
(c) The `byFormat` type change in tenant-owner.ts, with each row's `interactions` set to 0.
(d) The minimal OwnerContent type follow-up, so `pnpm typecheck` stays green: the format figures read `perItem(row.interactions, row.posts)` instead of the removed field.
Confirm the new tests FAIL on assertions, not on compile.

GREEN, commit message `fix(quick-261012-oxi): compute per-format interactions and pick highlights by value`:
1. metrics.ts `topBy<T>(rows: readonly T[], score: (row: T) => number): T | undefined`. Make one pass that keeps the current best row and replaces it only on a strictly greater score, so the earliest row wins a tie. Return undefined for no rows. Doc comment: a highlight must follow the values, never the data's order (261012-oxi C-6). The function stays pure, with no words and no clock (MOD-02).
2. tenant-owner.ts, per C-4. Change the `byFormat` type to `{ type: PostType; posts: number; interactions: number }[]`. Its doc comment becomes: posts and their likes + comments of the last 30 days by format, with the per-post figure computed (`perItem`), never typed. Set the values in the same order: video 18 / 1729, gallery 15 / 1067, text 20 / 960, link 8 / 184. Nothing else in the fixture changes. `fixtures.test.ts:116` only reads `posts` and needs no change.
3. OwnerContent.tsx, per C-6:
   - Delete the local best-per-post helper at lines 18-25. Add a local `perPostOf` that returns `perItem(row.interactions, row.posts)` for any `{ posts; interactions }` row.
   - The formats list stays sorted by `perPostOf`. Its value, display and summary use `perPostOf`, and `highlight: i === 0` is fine because that list is a sorted copy.
   - `bestDay = topBy(publishing.byWeekday, perPostOf)` and `bestSlot = topBy(publishing.bySlot, perPostOf)`.
   - `topCommunity = topBy(byCommunity, perPostOf)`. The community BarList keeps the data order, and its `highlight` becomes `row.id === topCommunity?.id`.
   - Planner discretion, same C-6 defect class found at OwnerContent.tsx:54 and :232: `topChannel = topBy(channels, (row) => row.count)`, and the channel highlight becomes `row.channel === topChannel?.channel`.
   - Update the component doc comment only where it describes these picks.
4. OwnerEvents.tsx, per C-6: `best = topBy(past, eventPercent)`. Keep `worst` from the existing sorted copy (`byPercent.at(-1)`). The attendance BarList highlight at line 151 becomes `row.id === best?.id`. Leave the waitlist list alone: `waitRows` is already a sorted copy.

Do not touch the other `i === 0` highlights. They sit on sorted copies (OwnerFinance products and conversion, OwnerSupport subjects and staff, the waitlist and the formats), so they already follow the values. On screen, every number and summary stays the same: 'Vídeo rende mais: 96 por post', 'VIP rende mais: 75 por post', 'Curtidas: 3.100', 'comparecimento 64%'.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && pnpm --filter @rede-social/module-dashboard test && pnpm --filter @rede-social/module-dashboard typecheck && API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder pnpm --filter @rede-social/web typecheck && PID=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t); if [ -n "$PID" ]; then kill $PID; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts -g "dono-do-cliente"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -n "export function topBy" packages/modules/dashboard/ui/metrics.ts` returns 1 line, and `grep -n "topBy" packages/modules/dashboard/ui/index.ts` returns at least 1.
    - `grep -n "interactions: 1729" packages/modules/dashboard/fixtures/tenant-owner.ts` returns 1 line.
    - `grep -n "topBy(byCommunity" apps/web/components/dashboard/OwnerContent.tsx` and `grep -n "topBy(past" apps/web/components/dashboard/OwnerEvents.tsx` each return 1 line.
    - The module-dashboard vitest run is green and includes the new `topBy`, 'interactions by format' and rotated-order cases.
    - The scoped Playwright run (`-g "dono-do-cliente"`) passes with the existing assertions unchanged. This is the end-to-end proof that the computed values render the same numbers.
  </acceptance_criteria>
  <done>Per-format interactions are raw counts that sum to 3.940, and per post is computed. The community, best-day/slot, channel and attendance picks come from `topBy`, which is unit-tested against rotated and reversed orders. The owner panel e2e is still green. Two commits (RED, then GREEN).</done>
</task>

<task type="auto">
  <name>Task 2: Pills, one name per indicator, the subject leader; README notes; full gates and captures (C-1, C-2, C-3, C-5, C-7, C-8)</name>
  <files>apps/web/components/dashboard/OwnerEvents.tsx, apps/web/components/dashboard/OwnerContent.tsx, apps/web/components/dashboard/OwnerSupport.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts, packages/modules/dashboard/README.md</files>
  <read_first>apps/web/components/dashboard/OwnerEvents.tsx lines 89-132, apps/web/components/dashboard/OwnerContent.tsx lines 56-97 (as left by Task 1), apps/web/components/dashboard/OwnerSupport.tsx lines 31-43 and 92-106, apps/web/components/dashboard/OwnerFinance.tsx lines 126-135, apps/web/messages/pt-BR/dashboard.json lines 360-365, 390-395, 439-455 and 506-513, apps/web/e2e-preview/painel-preview.spec.ts lines 448-462, 573-606 and 653-800, packages/modules/dashboard/README.md lines 69-104</read_first>
  <action>
1. C-1, OwnerEvents.tsx: inside the 'Lista de espera' section, give both KpiCards ('tenantOwner.waitlist.gotSeat' and 'tenantOwner.waitlist.attended') `badge={exampleBadge(t, waitlist)}`. Nothing else changes in that section.

2. C-2, dashboard.json: set `dashboard.tenantOwner.kpi.attendanceNote` to "check-in ÷ inscritos". It then matches `tenantOwner.attendance.footnote`. Leave the level-5 `tenantAdmin` footnote alone: C-2 covers the two level-4 places only.

3. C-3, OwnerContent.tsx 'Posts que mais renderam':
   - Remove the per-row ExamplePill. The saves/shares line becomes a plain `<p className="text-xs text-text-secondary">` with the same `tenantOwner.topPosts.saved` text.
   - Compute `postsExample = topPosts.some((post) => post.saves.example || post.shares.example)`, so the flag comes from the data.
   - Inside the PanelSection, before the `<Card>`, and only when `postsExample` is true (the sentence must never claim "exemplo" for measured data), render the waitlist summary pattern: `<p className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">` holding `<span>{t('tenantOwner.topPosts.exampleNote')}</span>` and `<ExamplePill text={exampleBadge(t, { example: postsExample })} />`.
   - Add the catalog key `tenantOwner.topPosts.exampleNote` = "Curtidas e comentários são medidos; salvamentos e compartilhamentos são valores de exemplo."
   - The three KPI pills ('Alcance por post', '% assistido', 'Conclusão') stay as they are.
   - Update the component doc comment from "marked next to them" to describe one pill on the block's note line.

4. C-5, OwnerSupport.tsx:
   - `leader = subjects[0]`. `subjects` is already a copy sorted by conversations, so the leader is picked by value.
   - The Collapsible `summary` becomes the OwnerFinance.tsx:129-133 pattern: `<span className="inline-flex flex-wrap items-center gap-2">` holding the leader sentence and then the existing `<ExamplePill text={exampleBadge(t, bySubject)} />`. Render the sentence only when `leader` exists.
   - The sentence is `t('tenantOwner.subjects.summary', { subject: t(\`tenantOwner.subjects.${leader.subject}\`), count: formatCount(leader.conversations), percent: formatPercent(percentOf(leader.conversations, subjectTotal)) })`.
   - Add the catalog key `tenantOwner.subjects.summary` = "{subject} lidera: {count} ({percent})". It mirrors `tenantOwner.revenue.summary`. The rendered result is "Acesso e login lidera: 26 (35%)".
   - Add `formatCount`, `formatPercent` and `percentOf` to the imports only if they are not already imported. They are, per lines 8 and 14-22.

5. C-7 and C-8, README.md: at the end of '### Client owner panel (level 4)', before '## Events emitted', add `#### Para quando os dados reais forem ligados`. Write the body in English, like the rest of the README, and keep the block names in pt-BR as the screen shows them.
   - (C-7) Today the fixture always has rows. Once real data is wired, these level-4 blocks need an empty-list sentence: Posts que mais renderam, Próximos eventos, Lista de espera, Atendimentos por assunto, Equipe, Conversão por produto. For each one, say in one line what it renders now with no rows (read the component to state it). Empty states are NOT implemented in this task.
   - (C-8) Accepted and out of scope: level 6 shows "Acessos que vencem em 7 dias: 6" as a measured value, but `expires_at` is never written. Level 4 shows the same 6 with the pill. To close it, either level 6 adopts `ReportValue` with the pill, or the app starts filling `expires_at` when it grants time-limited access.
   - In the existing paragraph before the metrics table, which says the pill sits "next to the value they mark", add that the top posts carry one pill for the block instead of one per row (C-3).

6. e2e, painel-preview.spec.ts:
   - `OWNER_AREA_CASES`: conteudo pills 7 → 4, eventos pills 1 → 3.
   - Test 'dono-do-cliente: Visão geral': assert `kpiCard(area, 'Comparecimento em eventos')` contains 'check-in ÷ inscritos' (C-2).
   - Test 'dono-do-cliente ?area=conteudo':
     - The per-row loop now expects `toHaveCount(0)` pills in each `posts.nth(i)`.
     - Add `sectionTitled(area, 'Posts que mais renderam').getByText('exemplo', { exact: true })` with count 1.
     - Add the exampleNote sentence as visible with an exact match.
     - Keep the '18 salvamentos · 7 compartilhamentos' assertion.
   - Test 'dono-do-cliente ?area=eventos': the waitlist pills go 1 → 3. For each of 'Conseguiram vaga' and 'Foram ao evento', assert `kpiCard(waitlist, label).getByText('exemplo', { exact: true })` has count 1.
   - Test 'dono-do-cliente ?area=atendimento': assert the 'Atendimentos por assunto' summary contains 'Acesso e login lidera: 26 (35%)', and keep its pill count of 1.

7. Commits. First `fix(quick-261012-oxi): one pill per example block, one name for attendance, subject leader in the summary`, which carries the components, the catalog and the e2e. Then `docs(quick-261012-oxi): what the owner panel needs when real data is wired`, which carries the README. Commit bodies follow the global rules: number each change in human terms and close with the checks that were run and their results. Never `git add` the screens folder, `.planning/STATE.md` or the ROADMAP.

8. Gates and captures. Export the placeholder env once: API_URL=http://127.0.0.1:8787, NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder.
   - Run, in order: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm boundaries`, `pnpm check:static-routes`.
   - Before every Playwright run, stop ONLY the process that `lsof -nP -iTCP:3000 -sTCP:LISTEN -t` returns. Never touch Chrome, and do not restart the dev server afterwards. Then run the full suite: `pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts`.
   - Captures: write a temporary `apps/web/e2e-preview/zz-screens.tmp.spec.ts`. At viewport 1440×900 in the light theme, it opens `?area=conteudo`, `?area=eventos` and `?area=atendimento` on `/painel-preview/dono-do-cliente`, waits for `[data-owner-area]`, asserts no console error, and saves full-page PNGs to `/Users/macos/Desktop/rede social/rede-social/.planning/quick/261012-oxi-corrigir-achados-das-revisoes-do-painel-/screens/dono-do-cliente-{conteudo,eventos,atendimento}-1440-light.png`. Run it alone with the same config, then DELETE the spec.
   - Finally, `find apps/web/e2e-preview packages/modules/dashboard apps/web/components/dashboard -name '* 2*'` must print nothing.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && node -e 'const d=require("./apps/web/messages/pt-BR/dashboard.json");const o=(d.dashboard||d).tenantOwner;if(o.kpi.attendanceNote!=="check-in ÷ inscritos"||!o.topPosts.exampleNote||o.subjects.summary!=="{subject} lidera: {count} ({percent})")process.exit(1);console.log("catalog OK")' && pnpm lint && pnpm typecheck && pnpm test && pnpm boundaries && pnpm check:static-routes && PID=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t); if [ -n "$PID" ]; then kill $PID; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts && git diff --quiet d8e8155c -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx "apps/web/app/painel-preview/[nivel]/page.tsx" && echo "gate OK"</automated>
    <human-check>Open the 3 PNGs in screens/. Conteúdo: a single "exemplo" pill on the note line under 'Posts que mais renderam', with none on the rows. Eventos: pills on both waitlist cards. Atendimento: the closed 'Atendimentos por assunto' reads 'Acesso e login lidera: 26 (35%)' followed by the pill. Nothing is clipped and there is no sideways scroll inside the iPhone frame.</human-check>
  </verify>
  <acceptance_criteria>
    - The node catalog check prints "catalog OK".
    - `grep -n "pills: 4" apps/web/e2e-preview/painel-preview.spec.ts` returns the conteudo case, and `grep -n "pills: 3" apps/web/e2e-preview/painel-preview.spec.ts` returns both the eventos and the financeiro cases.
    - `grep -n "Para quando os dados reais forem ligados" packages/modules/dashboard/README.md` returns 1 line, and that section names all six blocks plus `expires_at`.
    - The full gate chain and the full preview Playwright suite exit 0, and "gate OK" prints.
    - The 3 PNGs exist in screens/, the temporary spec is gone, and the " 2" find prints nothing.
  </acceptance_criteria>
  <done>C-1, C-2, C-3, C-5, C-7 and C-8 are visible on screen or in the README, the pill counts read Conteúdo 4 and Eventos 3, all gates are green, the captures are saved and not versioned, and there are two commits (fix, docs).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Fixture data → screen | Fictional values could read as measured numbers if a pill is missing |
| Preview route → production | The preview must stay unreachable in production without `DASHBOARD_PREVIEW_ENABLED=1` |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-oxi-01 | Repudiation (misleading data) | waitlist KPIs, top posts note, subject summary | low | mitigate | Each pill comes from the value's `example` flag (`exampleBadge`). The top-posts note renders only while a post's saves or shares are examples. The e2e pins the exact pill counts per area (C-1, C-3, C-5). |
| T-oxi-02 | Information disclosure | Atendimento subject summary | low | mitigate | The summary shows a subject label, a count and a percent only, never a member or conversation name. The existing atendimento e2e check for member names stays green. |
| T-oxi-03 | Elevation of privilege | proxy.ts, painel-preview layout.tsx and page.tsx | high | mitigate | None of these files is in `files_modified`. Task 2's verify runs `git diff --quiet d8e8155c` on all three. |
| T-oxi-04 | Denial of service | `topBy` in the server render | low | accept | It is a single pass over static fixture arrays with no I/O, bounded by the fixture size. |
</threat_model>

<verification>
- Task 1: module tests (including the new `topBy`, C-4 and C-6 cases), module and web typecheck, and the scoped `-g "dono-do-cliente"` Playwright run are green before Task 2 starts.
- Task 2: with the placeholder env, `pnpm lint` (including check-ui-literals), `pnpm typecheck`, `pnpm test`, `pnpm boundaries`, `pnpm check:static-routes` and the full `playwright.preview.config.ts` suite are green.
- Only the :3000 listener is ever stopped, and the dev server is not restarted.
- `git diff --quiet d8e8155c -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx "apps/web/app/painel-preview/[nivel]/page.tsx"` succeeds.
- 3 PNGs are in this task's `screens/` folder (not versioned), the temporary spec is deleted, and there are no " 2" copies.
</verification>

<success_criteria>
- C-1: both waitlist cards carry the pill, and Eventos shows 3 pills.
- C-2: "inscritos" in both level-4 attendance texts.
- C-3: one pill on the top-posts block's note line, none on the rows, the 3 KPI pills kept, and Conteúdo shows 4 pills.
- C-4: `byFormat` holds raw interactions summing to 3.940 = likes + comments, the per post is computed, and a unit test proves it.
- C-5: 'Acesso e login lidera: 26 (35%)' plus the pill on the collapsed summary, computed from the data.
- C-6: the community, attendance (and channel) highlights are picked by `topBy`, and unit tests prove the pick with rotated and reversed orders.
- C-7 and C-8 are recorded in the module README under 'Para quando os dados reais forem ligados'.
- All gates are green and the production gate is untouched.
</success_criteria>

<output>
Create `.planning/quick/261012-oxi-corrigir-achados-das-revisoes-do-painel-/261012-oxi-SUMMARY.md` when done, in pt-BR like the o00 SUMMARY. It includes:
- the commits table;
- C-1..C-8 as applied, plus the planner-discretion channel highlight under C-6;
- the gate evidence table (command → result);
- the capture paths;
- a final `**⚠️ NÃO FEITO**` block for anything left: the critic and flow-critic re-review if this executor cannot launch subagents, the dark-theme/390 px human pass if it was not done, and the empty states (C-7, documented only, by design).

Do not commit STATE.md or touch the ROADMAP; the orchestrator owns them.
</output>
