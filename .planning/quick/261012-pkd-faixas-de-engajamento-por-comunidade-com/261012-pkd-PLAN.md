---
phase: quick-261012-pkd
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/modules/dashboard/fixtures/tenant-owner.ts
  - packages/modules/dashboard/fixtures/owner-members.ts
  - packages/modules/dashboard/fixtures/index.ts
  - packages/modules/dashboard/tests/tenant-owner.test.ts
  - packages/modules/dashboard/tests/owner-members.test.ts
  - packages/modules/dashboard/README.md
  - apps/web/lib/owner-communities.ts
  - apps/web/lib/owner-communities.test.ts
  - apps/web/app/painel-preview/[nivel]/page.tsx
  - apps/web/components/dashboard/TenantOwnerPanel.tsx
  - apps/web/components/dashboard/OwnerMembers.tsx
  - apps/web/components/dashboard/BandMembers.tsx
  - apps/web/components/dashboard/PanelSection.tsx
  - apps/web/components/dashboard/format.ts
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, PWA-03, MOD-02]
tags: [dashboard, preview, tenant-owner, engagement-bands, communities, pt-BR]

estimate:
  tokens: 100000
  raw_tokens: 100000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "D-01: The 'Faixas de engajamento' section of `?area=membros` opens with a nav 'Recorte das faixas' of 5 chip links, in order: Toda a base, Comunidade VIP, Geral, Iniciantes, Eventos. Each is a plain `<a>` to `/painel-preview/dono-do-cliente?area=membros[&comunidade=<slug>]#faixas`, so it works without JavaScript. The row wraps at 360 px with no sideways scroll. The active chip has aria-current, and the 'Membros' area tab stays active in every scope."
    - "D-01: `?comunidade=` is parsed against an allow-list derived from `tenantOwnerPanel.byCommunity` (slug = the fixture id without its `c-` prefix: vip, geral, iniciantes, eventos). Anything else (unknown, wrong case, the raw id `c-vip`, empty, repeated) renders Toda a base. `apps/web/lib/dashboard-preview.ts`, `proxy.ts` and the preview layout are unchanged, and page.tsx changes only by one import and the 'dono-do-cliente' line."
    - "D-01: `tenantOwnerPanel.communityEngagement` holds the six bands per community, with the same ids and order as `byCommunity`. VIP has 186 members (who bought access): 14/38/61/33/22/18, 11 new activated. Geral, Iniciantes and Eventos each have 1.240 (every member) and 96 novos. Unit tests prove that each community sums to its base, that the open communities' novos equal the whole base's, that VIP novos ≤ 21 VIP orders, that newActivated ≤ min(the community's novos, the base's 54), and that no community's cumulative superfã→em-risco count exceeds the whole base's."
    - "D-01 (planner decision): the scope applies to the bands and to the 'Novos: X ativados de Y.' line. Subiram/Caíram and 'Ver movimentos' stay whole-base, and a line says 'Subiram e Caíram contam toda a base.' whenever a community is selected. A community scope also shows '<Comunidade>: N membros com acesso. Contam só as ações feitas nesta comunidade.' D-04: Crescimento, Retenção and 'Recuperar quem está em risco' are unchanged."
    - "D-02: Each of the 6 bands (Novos, Superfãs, Engajados, Ocasionais, Em risco, Inativos) is a native `<details>` Collapsible, closed by default. Its summary is 'count · percent' (Toda a base: '96 · 8%', '62 · 5%', '205 · 17%', '150 · 12%', '168 · 14%', '559 · 45%'), followed by a mini share bar that is solid only for Em risco. Opened, it lists at most 10 members, most recent activity first. Each row shows the name, 'Membro desde <mês> de <ano> · última atividade <relativo>', and in Toda a base also 'Interage mais em <comunidade>'. Under the list, 'e mais N membros' with N = count − shown, and no such line when N = 0 (Iniciantes Superfãs 6, Eventos Superfãs 3)."
    - "D-02: The names come from a fixed 72-name table plus a pure builder (`fixtures/owner-members.ts`), with no runtime randomness and no clock. The roster is coherent across scopes, and unit tests prove it: a member's band in a community is never above their whole-base band, and novos stay novos. Last activity in a community is never more recent than overall, and every date fits its band's window (active ≤ 29 days, em risco 30–59, inativo ≥ 60). Joining precedes any activity, and 'novo' ⇔ joined < 30 days before the preview's today (2026-10-12, the Encontro mensal day)."
    - "D-03: The module README and the SUMMARY record that the level-4 band lists now show member names to the client's team, and that the app's privacy notice must say so before real data is wired. Levels 1–3 are untouched: `ownerBandList` is used only by `BandMembers.tsx`."
    - "Gates are green with the placeholder env: pnpm lint (incl. check-ui-literals), typecheck, test, boundaries, check:static-routes, and the full preview Playwright suite. The suite is extended with: the selector navigation keeps area=membros; unknown values fall back; every band of every scope opens with ≤ 10 rows and a matching 'e mais N'; no sideways scroll at 360/390/430 or inside the iPhone. 2 captures are in `screens/`, the temporary spec is deleted, and there are no ' 2' copies in touched dirs."
  artifacts:
    - path: packages/modules/dashboard/fixtures/tenant-owner.ts
      provides: "communityEngagement: six bands per community, ids/order of byCommunity (D-01)"
      contains: "communityEngagement"
    - path: packages/modules/dashboard/fixtures/owner-members.ts
      provides: "72-member roster (fixed names + pure builder) and ownerBandList(communityId | null, band) → { members ≤ 10, more } (D-02)"
      contains: "export function ownerBandList"
    - path: packages/modules/dashboard/tests/owner-members.test.ts
      provides: "roster coherence and list size/sort/sum proofs (D-02)"
      contains: "ownerBandList"
    - path: apps/web/lib/owner-communities.ts
      provides: "OWNER_COMMUNITIES allow-list derived from the fixture, parseOwnerCommunity, ownerMembersHref, OWNER_BANDS_ANCHOR (D-01)"
      contains: "export function parseOwnerCommunity"
    - path: apps/web/components/dashboard/BandMembers.tsx
      provides: "the six band Collapsibles with mini bar, member rows and 'e mais N' (D-02)"
      contains: "ownerBandList"
    - path: apps/web/messages/pt-BR/dashboard.json
      provides: "tenantOwner.bandScope.* and tenantOwner.bandMembers.* copy"
      contains: "Recorte das faixas"
    - path: packages/modules/dashboard/README.md
      provides: "community bands, member lists and the D-03 privacy requirement"
      contains: "261012-pkd D-03"
  key_links:
    - from: "apps/web/app/painel-preview/[nivel]/page.tsx"
      to: apps/web/lib/owner-communities.ts
      via: "parseOwnerCommunity(query) passed as TenantOwnerPanel's community prop"
      pattern: "community=\\{parseOwnerCommunity\\(query\\)\\}"
    - from: apps/web/components/dashboard/OwnerMembers.tsx
      to: apps/web/lib/owner-communities.ts
      via: "ownerMembersHref builds every scope chip link"
      pattern: "ownerMembersHref\\("
    - from: apps/web/components/dashboard/OwnerMembers.tsx
      to: packages/modules/dashboard/fixtures/tenant-owner.ts
      via: "the selected community's bands from communityEngagement"
      pattern: "communityEngagement"
    - from: apps/web/components/dashboard/BandMembers.tsx
      to: packages/modules/dashboard/fixtures/owner-members.ts
      via: "ownerBandList(community, band) per band"
      pattern: "ownerBandList\\("
---

<objective>
On the level-4 owner panel (`/painel-preview/dono-do-cliente?area=membros`, branch `feat/painel-preview`, HEAD 75704bdd), make the "Faixas de engajamento" block scoped by community and make each band open the list of its members. The decisions D-01..D-04 in `261012-pkd-CONTEXT.md` are LOCKED, and each item below cites its ID.

Purpose: the owner sees how engaged members are in each community, not only across the whole base, and who those members are. The numbers must stay coherent with every other number of the preview: per community, per band and per member.

Output: community band counts in the fixture, a deterministic member roster with its pure list builder, a web allow-list for `?comunidade=`, the scope chips, six band Collapsibles with member lists, catalog copy, unit and e2e tests, a README section with the privacy requirement (D-03), and 2 screenshots (not versioned).
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/quick/261012-pkd-faixas-de-engajamento-por-comunidade-com/261012-pkd-CONTEXT.md
@.planning/quick/261012-o00-painel-do-dono-do-cliente-em-seis-areas-/261012-o00-SUMMARY.md
@.planning/quick/261012-oxi-corrigir-achados-das-revisoes-do-painel-/261012-oxi-SUMMARY.md
@apps/web/AGENTS.md

Docker and Supabase are unavailable, and the preview needs neither. Do NOT deploy to Vercel or push. The user follows the work on the local dev server.

House rules (unchanged from o00/oxi):
- Fictional data only.
- Every on-screen string lives in `apps/web/messages/pt-BR/dashboard.json`, in pt-BR with accents.
- Design tokens only, no hex.
- Keep the `@3xl` rule: the band lists are stacked rows at every width, with no table.
- Vertical scroll only.
- The iPhone mockup stays as it is, and the production gate stays intact.
- Biome, boundaries and check-ui-literals stay green.
- Code comments and commit messages are in English. Commit scope is `quick-261012-pkd`.

Interfaces the executor needs (verified at HEAD 75704bdd):
- `tenantOwnerPanel` (`packages/modules/dashboard/fixtures/tenant-owner.ts`):
  - `engagement` = `{ counts: { new: 96, superfan: 62, engaged: 205, occasional: 150, at_risk: 168, inactive: 559 }, newActivated: 54 }`, a total of 1.240, which equals `kpis.members.count`.
  - `byCommunity` = `[{ id: 'c-vip', name: 'VIP', exclusive: true, … }, { id: 'c-geral', name: 'Geral', exclusive: false }, { id: 'c-iniciantes', name: 'Iniciantes' }, { id: 'c-eventos', name: 'Eventos' }]`.
  - `store.products` has `{ id: 's2', product: 'Comunidade VIP', orders: 21 }`.
  - `events.upcoming[0]` is 'Encontro mensal', date '2026-10-12' (the "today" of the event_today alert).
  - `support.answeredByStaff` names: Marina Costa, Paulo Reis, Bia Lopes.
- `EngagementBand` / `EngagementBands` come from `fixtures/shared.ts`. The band rules are in its doc comment (new < 30 days joined; superfan 12+ active days AND 3+ strong actions; engaged 4+; occasional 1–3; at_risk no active day in 30 but one in 31–60; inactive none in 60).
- `RelativeMoment` = `{ daysAgo: number; time?: string }` (`fixtures/platform-panels.ts:13`).
- Level-6 member names: in `tenantStaffPanel` (`fixtures/tenant-panels.ts:237+`), `support.queue[].name` (Ana Souza, Rui Matos) and `moderation.recentComments[].name` (João P., Lia C., M. Vieira).
- `ui/metrics.ts` exports `ENGAGEMENT_BAND_ORDER`, `bandTotal`, `percentOf` (unrounded 0–100) and `topBy`. `ui/scale.ts` exports `barPercent(value, max)`, which is re-exported from `@rede-social/module-dashboard/ui`.
- `Collapsible({ title, summary?: ReactNode, open?, children })` is a native `<details>` inside a Card. The summary node sits inside a `text-xs text-text-secondary` span.
- `BarList` row markup to mirror for the mini bar: track `block h-2 overflow-hidden rounded-full bg-bg-tertiary`, fill `block h-full rounded-full` + `bg-brand` (highlight) or `bg-brand/50`, width `${barPercent(value, top)}%` (`ui/BarList.tsx:42-51`).
- `apps/web/components/dashboard/format.ts` has `formatCount`, `formatPercent` (0–100 in, 0 decimals), `bandLabel(t, band)` and `momentText(t, moment)` → 'hoje 21:30' / 'ontem 20:45' / 'há 3 dias'. `momentText` needs `time` set whenever `daysAgo` ≤ 1, or it prints a trailing space. The file also has `formatMonthAbbrev` and an Intl `MONTH_SHORT` in UTC.
- `Chip` (`packages/ui/src/primitives/Chip.tsx`) with `href` renders `<a aria-current="page" when active>`. The owner tab row is the pattern to follow (`TenantOwnerPanel.tsx:89-104`).
- `apps/web/lib/dashboard-preview.ts` is imported by `proxy.ts`. It must NOT import fixtures, and this plan does not touch it. Follow its `parseOwnerArea` / `memberListHref` / `MEMBER_LIST_ANCHOR` patterns in a NEW file `apps/web/lib/owner-communities.ts`.
- e2e helpers in `painel-preview.spec.ts`: `ownerArea(page)`, `ownerTabs(page)`, `sectionTitled(scope, title)`, `kpiCard(scope, label)`, `areaDetails(page, title)`, `openAllDetails(page)`, `horizontalOverflow`, `screenMetrics`, `pageOverflow`, `PHONE_WIDTHS` and `OWNER_AREA_CASES`. Do not add a case to `OWNER_AREA_CASES`: the tabs test compares it to the tab names. The current membros test (lines 608-646) counts band rows with `bands.getByRole('listitem')` (6) and the flows with `bands.locator('details').getByRole('listitem')` (4). Both must be re-scoped as described below.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Community scope for the bands, end to end: fixture counts, allow-list, chips (D-01, D-04)</name>
  <files>packages/modules/dashboard/fixtures/tenant-owner.ts, packages/modules/dashboard/tests/tenant-owner.test.ts, apps/web/lib/owner-communities.ts, apps/web/lib/owner-communities.test.ts, apps/web/app/painel-preview/[nivel]/page.tsx, apps/web/components/dashboard/TenantOwnerPanel.tsx, apps/web/components/dashboard/OwnerMembers.tsx, apps/web/components/dashboard/PanelSection.tsx, apps/web/components/dashboard/format.ts, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>packages/modules/dashboard/fixtures/tenant-owner.ts lines 82-125 and 254-281 and 463-470, packages/modules/dashboard/tests/tenant-owner.test.ts lines 1-40 and 83-136, apps/web/lib/dashboard-preview.ts lines 54-88 and 125-168 (patterns only, do not edit), apps/web/lib/dashboard-preview.test.ts lines 166-198, apps/web/app/painel-preview/[nivel]/page.tsx (whole), apps/web/components/dashboard/TenantOwnerPanel.tsx lines 55-111, apps/web/components/dashboard/OwnerMembers.tsx (whole), apps/web/components/dashboard/PanelSection.tsx lines 22-62, apps/web/components/dashboard/format.ts lines 180-200, apps/web/messages/pt-BR/dashboard.json (the `bands` block and `tenantOwner.movement`), apps/web/e2e-preview/painel-preview.spec.ts lines 420-571 and 608-646</read_first>
  <behavior>
    - tenant-owner.test.ts 'engagement by community (Membros, D-01)':
      - `communityEngagement.map(id)` equals `byCommunity.map(id)`, in order.
      - The pinned counts are exactly:
        - c-vip { new 14, superfan 38, engaged 61, occasional 33, at_risk 22, inactive 18 }, newActivated 11;
        - c-geral { 96, 41, 150, 170, 190, 593 }, newActivated 48;
        - c-iniciantes { 96, 6, 38, 104, 120, 876 }, newActivated 31;
        - c-eventos { 96, 3, 22, 88, 97, 934 }, newActivated 14.
      - `bandTotal`: VIP = 186 < `bandTotal(engagement)`. Every non-exclusive community = `bandTotal(engagement)` = `kpis.members.count`, and its `counts.new` = `engagement.counts.new`.
      - VIP `counts.new` ≤ the orders of store product 's2'.
      - Every `newActivated` ≤ min(own `counts.new`, `engagement.newActivated`).
      - For each community and each prefix of [superfan, engaged, occasional, at_risk], the cumulative sum ≤ the same prefix of `engagement.counts`.
    - owner-communities.test.ts:
      - `OWNER_COMMUNITIES` = the `byCommunity` ids with slugs ['vip', 'geral', 'iniciantes', 'eventos'], all unique.
      - `parseOwnerCommunity`:
        - `{}` gives null;
        - each slug gives its id ('vip' → 'c-vip');
        - 'VIP', 'c-vip', '', 'xyz', '__proto__', 'constructor', 'vip ', ['vip', 'vip'] and undefined give null.
      - `ownerMembersHref(null)` = '/painel-preview/dono-do-cliente?area=membros#faixas'.
      - `ownerMembersHref('c-vip')` = '/painel-preview/dono-do-cliente?area=membros&comunidade=vip#faixas'.
      - `OWNER_BANDS_ANCHOR` = 'faixas'.
  </behavior>
  <action>
RED first (fcr/o00/oxi precedent: a red tree with a green typecheck). Commit message: `test(quick-261012-pkd): pin the community bands and the comunidade allow-list`. It contains:
(a) The tests from <behavior>. owner-communities.test.ts imports from './owner-communities' and from '@rede-social/module-dashboard/fixtures'.
(b) In tenant-owner.ts, the new interface field with all counts and newActivated at 0, for the four ids.
(c) `apps/web/lib/owner-communities.ts` with the exported signatures, whose bodies throw `new Error('not implemented')`. Export `OWNER_COMMUNITIES` as an empty array.
Confirm that the new tests FAIL on assertions, and that both `pnpm --filter @rede-social/module-dashboard typecheck` and the web typecheck pass.

GREEN, commit message `feat(quick-261012-pkd): scope the owner's engagement bands by community`:

1. tenant-owner.ts (D-01). Add `communityEngagement: { id: string; bands: EngagementBands }[]` to `TenantOwnerPanel`, right after `engagement`.
   - Doc comment: the six bands per community, same ids and order as `byCommunity`. Same band rules as `engagement`, counting only the member's actions in that community. The base is who has access: the exclusive VIP = who bought it, the others = every member. Novos in an open community are the base's novos.
   - Values exactly as pinned in <behavior>. Nothing else in the fixture changes.

2. `apps/web/lib/owner-communities.ts` (new, D-01). It imports `tenantOwnerPanel` from '@rede-social/module-dashboard/fixtures' and `ownerAreaHref` from './dashboard-preview'. Never the reverse, because `proxy.ts` imports dashboard-preview.ts and must not pull fixtures.
   - A local `type SearchParams = Record<string, string | string[] | undefined>`.
   - `OWNER_BANDS_ANCHOR = 'faixas'`.
   - `OWNER_COMMUNITIES: readonly { id: string; slug: string }[]`, derived from `tenantOwnerPanel.byCommunity`. The slug is the id with a leading `c-` removed. Doc comment: the `?comunidade=` value is the fixture id without its prefix.
   - `parseOwnerCommunity(params: SearchParams): string | null` returns the community ID only when `params.comunidade` is a single string exactly equal to an allow-listed slug, else null (= Toda a base). Same doc-comment wording as `parseOwnerArea`: untrusted query, only these constants reach markup or URLs.
   - `ownerMembersHref(communityId: string | null): string` = `ownerAreaHref('membros')`, plus `&comunidade=<slug>` when the id is allow-listed, plus `#faixas`.

3. page.tsx: add one import and change only the 'dono-do-cliente' entry to pass `community={parseOwnerCommunity(query)}` next to `area={parseOwnerArea(query)}`. Do not touch `await connection()`, the `notFound()` calls, `generateMetadata` or the other entries.

4. TenantOwnerPanel.tsx:
   - Add `community: string | null` to `TenantOwnerPanelProps`, documented as allow-listed by `parseOwnerCommunity`, null = Toda a base.
   - Widen the AREAS `satisfies` signature to `(props: { community: string | null }) => Promise<ReactNode>`. Read the open area through a local constant annotated with that signature, and render `<Area community={community} />`. The other five areas keep their zero-argument signatures, which is assignable. A slug without a component must still fail typecheck.

5. PanelSection.tsx: add an optional `id?: string` prop, set on the `<section>` element. Nothing else changes.

6. format.ts: add `communityLabel(t, { name, exclusive })`. It returns `t('tenantOwner.bandScope.exclusive', { name })` for an exclusive community ('Comunidade VIP', the label D-01 names) and the plain name otherwise.

7. dashboard.json, under `tenantOwner`, a `bandScope` block:
   - "label": "Recorte das faixas"
   - "all": "Toda a base"
   - "exclusive": "Comunidade {name}"
   - "note": "{community}: {count, plural, one {# membro com acesso} other {# membros com acesso}}. Contam só as ações feitas nesta comunidade."
   - "movementNote": "Subiram e Caíram contam toda a base."

8. OwnerMembers.tsx (D-01, D-04). The signature becomes `OwnerMembers({ community }: { community: string | null })`.
   - Resolve `scope = community ? byCommunity row + communityEngagement entry : null`. Throw if an allow-listed id has no entry: it cannot happen, so fail loud.
   - `scopeBands` = the entry's bands, or `engagement`.
   - The bands `PanelSection` gets `id={OWNER_BANDS_ANCHOR}`. Its children, in order:
     1. `<nav aria-label={t('tenantOwner.bandScope.label')}>` > `<ul className="flex flex-wrap gap-2">` with one `<li>` + `<Chip href={ownerMembersHref(…)} active={…}>` for Toda a base (null), then one per `byCommunity` row labelled with `communityLabel`. Wrap, never scroll sideways (D-01).
     2. When scoped, a `<p className="text-xs text-text-secondary">` with `bandScope.note` (community = `communityLabel`, count = `bandTotal(scopeBands)`).
     3. `<BandsBarList t={t} bands={scopeBands} />`. Task 2 replaces it.
     4. The existing newActivated + footnote line, fed by `scopeBands`.
     5. The Subiram/Caíram KpiGrid, unchanged and whole-base.
     6. When scoped, a `<p className="text-xs text-text-secondary">` with `bandScope.movementNote`. This is the planner decision for D-01: movement stays whole-base, because per-community movement would need its own flows and cross-checks.
     7. The 'Ver movimentos' Collapsible, unchanged.
   - Crescimento, the ActionCard (`engagement.counts.at_risk`, whole-base) and Retenção stay exactly as they are (D-04).

9. e2e (painel-preview.spec.ts):
   - Re-scope the existing membros test. Band rows = the `listitem`s of the `<ul>` that contains `[data-bar-fill]`, so the selector's `li`s do not count. Flows = `areaDetails(page, 'Ver movimentos').getByRole('listitem')` (4).
   - Add 'dono-do-cliente membros: the scope selector' at 390×844:
     - The nav 'Recorte das faixas' link texts equal ['Toda a base', 'Comunidade VIP', 'Geral', 'Iniciantes', 'Eventos'], and the hrefs end with `?area=membros#faixas`, `?area=membros&comunidade=vip#faixas`, `…geral#faixas`, `…iniciantes#faixas` and `…eventos#faixas`.
     - Toda a base has aria-current. Clicking 'Comunidade VIP' gives a URL matching `?area=membros&comunidade=vip#faixas$`. The Membros tab and the VIP chip have aria-current (one each in their nav).
     - 'Comunidade VIP: 186 membros com acesso. Contam só as ações feitas nesta comunidade.', 'Novos: 11 ativados de 14.' and 'Subiram e Caíram contam toda a base.' are visible. Subiram 77, Caíram 171 and Entraram 96 are unchanged. The bar rows show 14 with 8%, and Em risco 22 with 12%.
     - Clicking 'Toda a base' removes the note lines.
     - At 360 px, the selector `ul` has scrollWidth ≤ clientWidth.
   - Add 'dono-do-cliente membros: an unknown comunidade falls back to Toda a base' for `comunidade=xyz`, `=VIP`, `=c-vip`, `=` and `comunidade=vip&comunidade=geral`. Each shows Toda a base with aria-current, 'Novos: 54 ativados de 96.' and no 'membros com acesso' text.
   - In the existing 'without JavaScript' describe, add a case: from `?area=membros`, clicking the 'Geral' chip navigates to `comunidade=geral`, and 'Geral: 1.240 membros com acesso. …' is visible.
   - Add a loop over `PHONE_WIDTHS` for `?area=membros&comunidade=vip`, with `openAllDetails` and no horizontal overflow, plus a 1440×900 case. That case checks: inside the phone (screenMetrics scrollWidth ≤ clientWidth, page has no overflow, no visible table); after clicking the 'Geral' chip, the heading 'Faixas de engajamento' `toBeInViewport()`. This proves that the `#faixas` anchor scrolls the phone screen to the block.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && pnpm --filter @rede-social/module-dashboard test && pnpm --filter @rede-social/module-dashboard typecheck && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/web exec vitest run lib/owner-communities.test.ts lib/dashboard-preview.test.ts && pnpm --filter @rede-social/web typecheck && PID=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t); if [ -n "$PID" ]; then kill $PID; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts -g "dono-do-cliente"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -n "communityEngagement" packages/modules/dashboard/fixtures/tenant-owner.ts` returns at least 2 lines (the type and the value).
    - `grep -n "export function parseOwnerCommunity\|export function ownerMembersHref\|export const OWNER_BANDS_ANCHOR" apps/web/lib/owner-communities.ts` returns 3 lines.
    - `git diff --quiet 75704bdd -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts` exits 0.
    - `git diff --numstat 75704bdd -- "apps/web/app/painel-preview/[nivel]/page.tsx"` shows at most 3 added and 1 removed lines. `grep -n "await connection();" "apps/web/app/painel-preview/[nivel]/page.tsx"` still precedes the `notFound()` line.
    - `grep -n "Recorte das faixas" apps/web/messages/pt-BR/dashboard.json` returns 1 line.
    - Module tests, the two web lib test files and the scoped Playwright run (`-g "dono-do-cliente"`) are green.
  </acceptance_criteria>
  <done>The scope chips switch the band distribution between Toda a base and each community, through plain links that keep `area=membros` and land on `#faixas`. Unknown values fall back to Toda a base. The community counts are pinned and proven coherent with the whole base. Movement stays whole-base, with a note. Two commits (RED, GREEN).</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Each band opens its members: roster builder, band Collapsibles, privacy note, full gates (D-02, D-03)</name>
  <files>packages/modules/dashboard/fixtures/owner-members.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/tests/owner-members.test.ts, packages/modules/dashboard/README.md, apps/web/components/dashboard/BandMembers.tsx, apps/web/components/dashboard/OwnerMembers.tsx, apps/web/components/dashboard/TenantOwnerPanel.tsx, apps/web/components/dashboard/format.ts, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>packages/modules/dashboard/fixtures/member-lists.ts lines 1-20 and 140-188 (the fixed-table + pure-builder pattern), packages/modules/dashboard/fixtures/index.ts (whole), packages/modules/dashboard/fixtures/tenant-panels.ts lines 237-280 (level-6 names), packages/modules/dashboard/ui/Collapsible.tsx (whole), packages/modules/dashboard/ui/BarList.tsx lines 27-62, packages/modules/dashboard/README.md lines 12-20 and 69-135, apps/web/components/dashboard/OwnerMembers.tsx (as left by Task 1), apps/web/components/dashboard/format.ts lines 95-115 and 200-212, apps/web/e2e-preview/painel-preview.spec.ts (the membros tests as left by Task 1)</read_first>
  <behavior>
    - owner-members.test.ts (import from '../fixtures' and '../fixtures/owner-members'):
      - Roster:
        - 72 members, 12 per whole-base band, unique ids and names.
        - No name equals a level-6 queue/comment name or a level-4 staff name (collect them from the fixtures).
        - `PREVIEW_TODAY` = `tenantOwnerPanel.events.upcoming[0].date`.
      - Per member:
        - new ⇔ `memberSince` < 30 days before `PREVIEW_TODAY` (UTC day difference).
        - The joined day count is ≥ every `lastActive.daysAgo` of the member.
        - The whole-base `lastActive` fits its band window: new/superfan/engaged/occasional ≤ 29, at_risk 30–59, inactive ≥ 60.
        - Every open community has an entry. VIP has an entry only for members with access.
        - Each entry's band level is ≤ the whole-base level (superfan > engaged > occasional > at_risk > inactive), and new ⇔ new.
        - Each entry's `lastActive.daysAgo` is ≥ the whole-base one and fits the entry band's window.
        - `topCommunityId` is a community the member has, where their band equals the whole-base band.
      - Lists, for every scope in [null, ...byCommunity ids] × every band of `ENGAGEMENT_BAND_ORDER`:
        - `members.length` = min(`OWNER_BAND_LIST_LIMIT` (10), count), where count comes from `engagement` or that community's `communityEngagement`.
        - `members.length + more` = count.
        - Sorted by recency (daysAgo asc, then time desc, then id).
        - Each listed member's band in that scope equals the list's band.
        - `topCommunityId` is present on every row ⇔ scope is null.
        - The roster never has more members in a (scope, band) than its count.
        - The roster's novos in a scope ≤ that scope's `newActivated`.
      - `ownerBandList('c-nope', 'new')` throws.
  </behavior>
  <action>
RED first. Commit message: `test(quick-261012-pkd): pin the band member lists and the roster's coherence`. It holds the tests from <behavior>, plus `fixtures/owner-members.ts` with the exported types, the constants, an empty roster and `ownerBandList` throwing `new Error('not implemented')`. Re-export from fixtures/index.ts. Confirm the tests fail on assertions with a green typecheck.

GREEN, commit message `feat(quick-261012-pkd): each engagement band opens the list of its members`:

1. `packages/modules/dashboard/fixtures/owner-members.ts` (new, D-02). RAW DATA plus a pure builder, with no `Math.random`, no `Date.now` and no words (MOD-02).
   - Header doc comment: the level-4 band lists (quick 261012-pkd D-02); a fixed name table plus a pure builder; coherent across scopes; names are visible to the client's team (D-03).
   - Exports:
     - `OWNER_BAND_LIST_LIMIT = 10` (the future endpoint's page size).
     - `PREVIEW_TODAY = '2026-10-12'`.
     - type `OwnerBandMember { id; name; memberSince: string (ISO date); lastActive: RelativeMoment; topCommunityId?: string }`.
     - type `OwnerBandList { members: OwnerBandMember[]; more: number }`.
     - type `OwnerRosterMember { id; name; memberSince; band: EngagementBand; lastActive: RelativeMoment; topCommunityId: string; communities: Record<string, { band: EngagementBand; lastActive: RelativeMoment }> }`.
     - `ownerBandRoster: readonly OwnerRosterMember[]`.
     - `ownerBandList(communityId: string | null, band: EngagementBand): OwnerBandList`.
   - Fixed tables (not exported):
     - `MEMBER_NAMES`: 72 distinct, plausible pt-BR full names (first name + one surname, mixed genders, no public figures). None may be a name used elsewhere in the fixtures.
     - `TIMES`: 12 'HH:MM' readings, latest first (e.g. '22:40' down to '06:10').
   - Builder rules. Member i = bandIndex·12 + j, with bandIndex following `ENGAGEMENT_BAND_ORDER` and slot j = 0..11. id `om-NN` (i+1, padded to 2). name `MEMBER_NAMES[i]`. Every `lastActive` carries `time: TIMES[j]`.
     - Whole-base daysAgo:
       - new j;
       - superfan floor(j/4);
       - engaged j;
       - occasional 4+2j;
       - at_risk 31+2j;
       - inactive 64+9j.
     - Joined days ago:
       - new 12+j;
       - others 40+23·bandIndex+9j.
       - `memberSince` = `PREVIEW_TODAY` minus those days, computed with UTC date arithmetic and formatted as 'YYYY-MM-DD'.
     - Communities, in `byCommunity` order with offset = index (VIP 0, Geral 1, Iniciantes 2, Eventos 3):
       - VIP access only when j ≥ 2.
       - The open ones for everyone.
       - drop = 1 when (Geral j ≥ 10), (Iniciantes j ≥ 6) or (Eventos j ≥ 3), else 0. VIP is always 0, and novos never drop.
       - With drop 0: band = whole-base band, daysAgo = whole-base + offset.
       - With drop 1, band = one level lower (inactive stays inactive), and daysAgo by the whole-base band:
         - superfan → +5;
         - engaged → +10;
         - occasional → 30+j;
         - at_risk → 60+5j;
         - inactive → +20.
     - `topCommunityId` = eligible[j % eligible.length], where eligible = the member's communities with drop 0, in `byCommunity` order.
   - `ownerBandList`:
     - The scope is the whole base (null) or a `byCommunity` id; throw `Error` for any other id.
     - Filter the roster to the members whose band in that scope equals `band`. Sort by daysAgo asc, then time desc, then id asc. Keep the first `OWNER_BAND_LIST_LIMIT`.
     - Rows carry the scope's `lastActive`. `topCommunityId` is set only for the whole base (omit the key otherwise).
     - `more` = the scope's count for that band (`tenantOwnerPanel.engagement` or `communityEngagement`) − rows.
   - These rules satisfy every invariant in <behavior> (the planner checked the windows and per-scope counts against Task 1's numbers). If a test still fails, fix the rule, never the test's invariant.
   - Re-export from fixtures/index.ts: `ownerBandList`, `OWNER_BAND_LIST_LIMIT` and the types `OwnerBandMember` and `OwnerBandList`. Tests import the roster and `PREVIEW_TODAY` from '../fixtures/owner-members'.

2. format.ts: add `formatMonthYear(isoDate)` with Intl 'pt-BR' `{ month: 'short', year: 'numeric', timeZone: 'UTC' }` (expected 'set. de 2026'). Run node once to confirm the exact output, then pin it in e2e.

3. dashboard.json, under `tenantOwner`, a `bandMembers` block:
   - "summary": "{count} · {percent}"
   - "line": "Membro desde {since} · última atividade {when}"
   - "top": "Interage mais em {community}"
   - "more": "e mais {count, plural, one {# membro} other {# membros}}"

4. `apps/web/components/dashboard/BandMembers.tsx` (new, D-02), a server component `BandMembers({ t, bands, community })`. For each band of `ENGAGEMENT_BAND_ORDER`, render one `Collapsible` (closed):
   - title `bandLabel(t, band)`.
   - summary: an `inline-flex items-center gap-2` span with `bandMembers.summary` (count via `formatCount`, percent via `formatPercent(percentOf(count, bandTotal(bands)))`), then an `aria-hidden` mini bar. The track is `block h-1.5 w-16 overflow-hidden rounded-full bg-bg-tertiary`. The fill is `block h-full rounded-full`, `bg-brand` for at_risk and `bg-brand/50` otherwise, with width `${barPercent(count, total)}%`. This keeps fcr's "only Em risco is solid".
   - children, from `ownerBandList(community, band)`:
     - a `<ul className="flex flex-col gap-3">` of `<li className="flex min-w-0 flex-col gap-0.5">`;
     - the name in `text-sm font-bold text-text [overflow-wrap:anywhere]`;
     - `bandMembers.line` (since = `formatMonthYear`, when = `momentText`) in `text-xs text-text-secondary`;
     - when `topCommunityId` is set, `bandMembers.top` with `communityLabel` of that `byCommunity` row;
     - then, if `more > 0`, a `<p className="text-xs text-text-secondary">` with `bandMembers.more`.
   - A band with 0 members is not given an empty state (oxi C-7 precedent). Document it in the README instead (step 7).

5. OwnerMembers.tsx: replace the `BandsBarList` call with `<BandMembers t={t} bands={scopeBands} community={community} />`, and drop the now-unused import. Update the component doc comment: the bands section has a community scope, and its bands open named member lists (261012-pkd D-02/D-03). Everything else stays.

6. TenantOwnerPanel.tsx: update only the doc comment's privacy sentence. The Membros band lists name members to the client's own team (261012-pkd D-03); the bell and every other block stay counts only.

7. README.md (D-03).
   - In the `./fixtures` contracts row, add `tenantOwnerPanel.communityEngagement` and `ownerBandList` / `OWNER_BAND_LIST_LIMIT` / `OwnerBandMember` / `OwnerBandList` (`fixtures/owner-members.ts`).
   - Under "Client owner panel (level 4)", add `#### Faixas por comunidade e membros de cada faixa (261012-pkd)`:
     - the `?comunidade=<slug>` allow-list (`apps/web/lib/owner-communities.ts`, slug = id without `c-`, unknown → Toda a base, links end in `#faixas`);
     - the per-community rule and base (VIP = who bought, others = every member);
     - the coherence the tests prove;
     - Subiram/Caíram whole-base (planner decision);
     - the lists (10 most recent, "e mais N", "Interage mais em" only on Toda a base);
     - the roster construction in two sentences;
     - two source rows: per-community bands = counted actions joined to the community, plus access for the base, measured; member lists = the same per-member band plus last action, measured;
     - and a bold paragraph **Privacy (261012-pkd D-03, user decision)**. Until this task, the level-4 panel showed only counts. The band lists now show member names and their engagement level to the client's team. Before real data is wired, the app's privacy notice must tell members that the client's team sees each member's engagement level. Platform levels 1–3 keep aggregates only.
   - Under "Para quando os dados reais forem ligados", add a bullet: a band with 0 members renders '0 · 0%' and opens to nothing, so it needs a pt-BR empty sentence.

8. e2e:
   - Update the membros test. The bands section has 6 band `<details>` whose summary titles are, in order, Novos, Superfãs, Engajados, Ocasionais, Em risco and Inativos, all closed, with summaries '96 · 8%', '62 · 5%', '205 · 17%', '150 · 12%', '168 · 14%' and '559 · 45%'. Write a helper `bandDetails(scope, label)` that matches the summary's bold title exactly. Update Task 1's selector test so the VIP check reads the summaries '14 · 8%' and '22 · 12%'.
   - Add one test per scope (Toda a base, Comunidade VIP, Geral, Iniciantes, Eventos) at 390×844. Open each band, then:
     - `li` count = min(10, the count parsed from the summary);
     - 'e mais N membros' with shown + N = count, or no 'e mais' line when the count ≤ 10;
     - every row contains 'Membro desde' and 'última atividade';
     - the rows contain 'Interage mais em' only on Toda a base.
     - Pin these: Toda a base Em risco 'e mais 158 membros'; VIP Inativos 'e mais 8 membros'; Iniciantes Superfãs 6 rows and Eventos Superfãs 3 rows, with no 'e mais'.
     - Pin one `formatMonthYear` output seen on screen.
   - In the no-JS describe, add: clicking the 'Em risco' summary opens its list (native `<details>`).
   - Task 1's width loops already cover `openAllDetails` with the lists in both scopes. Keep them.

9. Final gates, with the placeholder env exported: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm boundaries` and `pnpm check:static-routes`. Then stop ONLY the :3000 listener (`lsof -nP -iTCP:3000 -sTCP:LISTEN -t`; never Chrome, never restart the dev server) and run the full preview suite.

10. Captures. Write a temporary spec `apps/web/e2e-preview/zz-screens.tmp.spec.ts` at 1440×900, light theme. It takes 2 page screenshots into `.planning/quick/261012-pkd-faixas-de-engajamento-por-comunidade-com/screens/` (not versioned) and asserts no console error:
    - `dono-do-cliente-membros-toda-a-base-em-risco-1440-light.png`: `?area=membros#faixas`, the Em risco `<details>` opened by a summary click, and that summary scrolled into view inside the phone screen.
    - `dono-do-cliente-membros-vip-1440-light.png`: `?area=membros&comunidade=vip#faixas`.
    Look at both. Delete the temporary spec. Run `find apps/web/e2e-preview apps/web/components/dashboard apps/web/lib packages/modules/dashboard .planning/quick/261012-pkd-faixas-de-engajamento-por-comunidade-com -name '* 2*'`, which must print nothing. Leave the pre-existing ' 2' files of older quick dirs alone and mention them in the SUMMARY.

11. Docs commit: `docs(quick-261012-pkd): community bands, member lists and the privacy note`, holding the README only. Do not commit STATE.md, do not touch the ROADMAP, do not push or deploy.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm lint && pnpm typecheck && pnpm test && pnpm boundaries && pnpm check:static-routes && PID=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t); if [ -n "$PID" ]; then kill $PID; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts && git diff --quiet 75704bdd -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts && echo "gate OK"</automated>
    <human-check>On the local server, in the dark theme at 390 px and inside the iPhone at 1440: open `/painel-preview/dono-do-cliente?area=membros`, switch to Comunidade VIP and to Eventos, and open Em risco and Superfãs. Check that the chips wrap, the mini bars read, the names wrap, 'e mais N' sits under the list, and nothing scrolls sideways.</human-check>
  </verify>
  <acceptance_criteria>
    - `grep -n "export function ownerBandList" packages/modules/dashboard/fixtures/owner-members.ts` returns 1 line, and `grep -n "ownerBandList" packages/modules/dashboard/fixtures/index.ts` returns at least 1.
    - `grep -rl "ownerBandList" apps/web` lists only `apps/web/components/dashboard/BandMembers.tsx` (no platform panel reads member names, per D-03).
    - `grep -n "Math.random\|Date.now" packages/modules/dashboard/fixtures/owner-members.ts` prints nothing.
    - `grep -n "261012-pkd D-03" packages/modules/dashboard/README.md` returns at least 1 line, and `grep -n "Interage mais em" apps/web/messages/pt-BR/dashboard.json` returns 1.
    - The full gate command above prints `gate OK`. The suite includes the 5 per-scope band tests, the selector, fallback and no-JS cases, and the width loops.
    - 2 PNGs exist in this task's `screens/`, `apps/web/e2e-preview/` holds only `painel-preview.spec.ts`, and the ' 2' check prints nothing.
  </acceptance_criteria>
  <done>Every band in every scope opens a list of up to 10 named members, most recent first, with 'e mais N' matching the band count. The roster is deterministic and proven coherent across scopes. The privacy requirement is recorded. All gates and the full preview suite are green, the captures are taken, and there are three more commits (RED, GREEN, docs).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL query → server render | `?comunidade=` (and `?area=`) are untrusted input that picks what the server renders |
| Fixture data → client's team | The level-4 band lists now show member names and engagement levels to the client's own team (D-03) |
| Preview route → production | The preview must stay unreachable in production without `DASHBOARD_PREVIEW_ENABLED=1` |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-pkd-01 | Tampering | `parseOwnerCommunity` / `ownerMembersHref` | low | mitigate | Exact-match allow-list derived from the fixture ids. Only fixture ids and slugs ever reach markup or URLs. Unit tests cover '__proto__', 'constructor', wrong case, the raw id, empty, padded and repeated params, and e2e covers the fallback. |
| T-pkd-02 | Information disclosure | `BandMembers` member names | medium | accept | This is a user decision (D-03): the client's own team sees names and engagement levels. The README and SUMMARY require the privacy notice to say so before real data is wired. `ownerBandList` is read only by `BandMembers.tsx` (acceptance grep), so levels 1–3 stay aggregate-only, and the bell and support blocks still name no member. |
| T-pkd-03 | Elevation of privilege | proxy.ts, painel-preview layout, dashboard-preview.ts, page.tsx | high | mitigate | `git diff --quiet 75704bdd` on proxy.ts, layout.tsx and dashboard-preview.ts. page.tsx is limited to one import plus the 'dono-do-cliente' line, with `await connection()` still before `notFound()`. The fixture import lives in the new `owner-communities.ts`, so the proxy bundle never loads fixtures. |
| T-pkd-04 | Repudiation (misleading data) | `communityEngagement`, roster | low | mitigate | Unit tests prove each community sums to its base, cumulative dominance under the whole base, VIP novos ≤ VIP orders, list size + "e mais" = band count, and per-member coherence across scopes. |
| T-pkd-05 | Denial of service | roster builder in the server render | low | accept | The roster is built once at module load over 72 static rows. Each list is a filter + sort over those rows: bounded, with no I/O. |
</threat_model>

<verification>
- Task 1: the module tests (community bands), the web lib tests (allow-list) and both typechecks are green, and the scoped `-g "dono-do-cliente"` Playwright run is green. All of this before Task 2 starts.
- Task 2: with the placeholder env, `pnpm lint` (incl. check-ui-literals), `pnpm typecheck`, `pnpm test`, `pnpm boundaries`, `pnpm check:static-routes` and the full `playwright.preview.config.ts` suite are green.
- Only the :3000 listener is ever stopped. The dev server is not restarted, and Chrome is never touched.
- `git diff --quiet 75704bdd -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts` succeeds, and page.tsx's diff is the import plus the one line.
- 2 PNGs are in `screens/` (not versioned), the temporary spec is deleted, and there are no ' 2' copies in the touched dirs.
- Nothing is pushed or deployed.
</verification>

<success_criteria>
- D-01: a wrapping chip selector (Toda a base, Comunidade VIP, Geral, Iniciantes, Eventos) of plain links that keep `area=membros`. An allow-list derived from the fixture, with unknown values going to Toda a base. Per-community bands that sum to each base, unit-tested. Subiram/Caíram whole-base, with a note (planner decision, recorded in the SUMMARY).
- D-02: six native `<details>` bands with 'count · percent' plus a mini bar. Opened: ≤ 10 named members, most recent first, with since / last activity (plus 'Interage mais em' on Toda a base), and 'e mais N' matching the count. A deterministic roster, coherent across scopes, unit-tested.
- D-03: the privacy requirement is in the README and the SUMMARY, and levels 1–3 are untouched.
- D-04: Crescimento, Subiram/Caíram, Retenção and 'Recuperar quem está em risco' are unchanged.
- All gates and the full preview suite are green, and the production gate is untouched.
</success_criteria>

<output>
Create `.planning/quick/261012-pkd-faixas-de-engajamento-por-comunidade-com/261012-pkd-SUMMARY.md` when done, in pt-BR like the o00/oxi SUMMARYs. It includes:
- the commits table;
- D-01..D-04 as applied, including the planner decision that Subiram/Caíram stay whole-base (with the note line) and the 'Comunidade VIP' chip label (Conteúdo keeps 'VIP (exclusiva)');
- the community numbers table and the roster rules in short;
- the D-03 privacy paragraph, word for word as in the README;
- the gate evidence table (command → result);
- the capture paths;
- the pre-existing ' 2' files of older quick dirs (left alone);
- a final `**⚠️ NÃO FEITO**` block listing anything left. Candidates: critic and flow-critic, if this executor cannot launch subagents; the dark-theme/390 px human pass, if not done; the empty band state, documented only.

Do not commit STATE.md or touch the ROADMAP; the orchestrator owns them.
</output>
