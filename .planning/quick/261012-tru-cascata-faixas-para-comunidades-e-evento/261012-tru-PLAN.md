---
phase: quick-261012-tru
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/modules/dashboard/fixtures/shared.ts
  - packages/modules/dashboard/fixtures/tenant-owner.ts
  - packages/modules/dashboard/fixtures/owner-members.ts
  - packages/modules/dashboard/fixtures/owner-posts.ts
  - packages/modules/dashboard/fixtures/owner-member-lists.ts
  - packages/modules/dashboard/fixtures/owner-member-insights.ts
  - packages/modules/dashboard/fixtures/index.ts
  - packages/modules/dashboard/tests/tenant-owner.test.ts
  - packages/modules/dashboard/tests/owner-members.test.ts
  - packages/modules/dashboard/tests/owner-member-lists.test.ts
  - packages/modules/dashboard/README.md
  - apps/web/lib/owner-band-scope.ts
  - apps/web/lib/owner-band-scope.test.ts
  - apps/web/components/dashboard/OwnerMembers.tsx
  - apps/web/components/dashboard/BandMembers.tsx
  - apps/web/components/dashboard/BandMembers.test.tsx
  - apps/web/components/dashboard/BandScopeCards.tsx
  - apps/web/components/dashboard/OwnerMemberDetail.tsx
  - apps/web/components/dashboard/OwnerMemberList.tsx
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, PWA-03, MOD-02]
tags: [dashboard, preview, tenant-owner, engagement-bands, member-insights, pt-BR]

estimate:
  tokens: 200000
  raw_tokens: 200000
  tasks: 4
  confidence: low

must_haves:
  truths:
    - "D-01: the Faixas de engajamento section holds exactly one `nav` (Recorte das faixas: Por membro | Por comunidade | Por evento, `grid grid-cols-3`, equal widths ±1 px) at every cascade level; no second row of chips exists anywhere (no 'Comunidade das faixas' / 'Evento das faixas' navigation). Tab links: `?area=membros#faixas`, `?area=membros&recorte=comunidade#faixas`, `?area=membros&recorte=evento#faixas`."
    - "D-02: the three tabs show the same six band summaries with the whole-base count · % (96 · 8%, 62 · 5%, 205 · 17%, 150 · 12%, 168 · 14%, 559 · 45%), 'menos de 1%' and the minimum bar kept in code. Por membro bodies are today's member cards. A band opened in Por comunidade lists the four community cards (VIP, Geral, Iniciantes, Eventos) each with 'N nesta faixa' from communityEngagement (Engajados: 61, 150, 38, 22); in Por evento the seven event cards (u1, u2, u3, e4, e3, e2, e1) with eventEngagement (Engajados: 34, 23, 16, 21, 18, 62, 45). A card with 0 in the band reads '0 nesta faixa' and is not a link (every event in Inativos)."
    - "D-03: a community card is a full-width CommunityCover `card` box measuring 16:7 (±0.02), top corners rounded, then the name (text-xl bold text-text), the description (text-text-secondary), a thin line, four columns Membros / Ativos na semana / Publicações no mês / Interações no mês (VIP: 186 / 104 / 22 / 1.650; Geral: 1.240 / 296 / 25 / 1.580), the note 'Interações: comentários e curtidas' and 'N nesta faixa'."
    - "D-04: an event card is a full-width EventCover `hero` box measuring 16:10 (±0.02), then the name, a brand-tone pill Presencial/Online, a thin line, three columns with vertical dividers Data / Duração / Receita (u1: 12/10 · 3h00 · R$ 5,5 mil). Each list of event cards and each opened event carries ONE line 'Receita: valores de exemplo' with the 'exemplo' pill; no card carries a pill."
    - "D-05/D-06: tapping a card opens `…&recorte=comunidade&comunidade=vip&faixa=engajados#faixas` with that band open, 'Voltar às comunidades' (or 'Voltar aos eventos') back to the band's cards, the card itself (not a link) and that band's members in that community/event (max 10 + 'e mais N', disabled 'Ver todos', empty sentence). A member card opens the insights; their Voltar returns to the exact previous step (`…&comunidade=vip&faixa=engajados#faixas`). Any invalid parameter falls to the level above, never an error: unknown/absent item, item with 0 in the band, or no faixa → the band's cards (or closed bands); `membro` only when it holds `faixa` in the opened scope (`ownerBandIncludes`)."
    - "D-07: in the insights, Dias ativos, Curtidas, Comentários, Ações fortes and Posts vistos are links to `…&membro=om-NN&lista=<slug>#lista`; each list has a title, 'Voltar' to `…&membro=om-NN#insight-<slug>`, its rows (post/content, when; views and time for Posts vistos), an order hint, an empty sentence, and a row count equal to the KPI value. Posts vistos keeps its 'exemplo' pill. The lists come from a pure, deterministic per-member builder."
    - "D-08: 'Recuperar quem está em risco' follows the opened community or event (VIP: '22 em risco · 11 com push'; u1: '6 em risco · 3 com push'); with none opened it shows the whole base ('168 em risco · 69 com push'). Crescimento, Subiram/Caíram and Retenção are unchanged."
    - "Gates with the placeholder env: lint (incl. check-ui-literals), typecheck, test, boundaries, check:static-routes and the full preview Playwright suite are green; proxy.ts, painel-preview/layout.tsx and lib/dashboard-preview.ts are unchanged since 6ca062b1; no sideways scroll at 360/390/430 nor inside the iPhone at 1440×900; four screenshots taken; the dev server is restarted with the CONTEXT command and answers 200. No push, no Vercel."
  artifacts:
    - path: apps/web/lib/owner-band-scope.ts
      provides: "the cascade view {kind, band, itemId, memberId, list}, its level-by-level parser, ownerListScope and one href builder"
      contains: "export function ownerMembersHref"
    - path: apps/web/components/dashboard/BandScopeCards.tsx
      provides: "community card (16:7) and event card (16:10) and the band's card list (D-03, D-04)"
      contains: "CommunityCover"
    - path: apps/web/components/dashboard/BandMembers.tsx
      provides: "per-band body: member list, the band's cards, or the opened community/event with its members (D-02, D-05)"
      contains: "ownerBandList"
    - path: packages/modules/dashboard/fixtures/owner-posts.ts
      provides: "the 61 posts of the last 30 days, matching byCommunity and byFormat"
      contains: "export const ownerPostTable"
    - path: packages/modules/dashboard/fixtures/owner-member-lists.ts
      provides: "pure per-member activity lists whose lengths are the insights KPIs (D-07)"
      contains: "export function buildOwnerMemberLists"
    - path: apps/web/components/dashboard/OwnerMemberList.tsx
      provides: "the list screen behind each insights KPI (D-07)"
      contains: "ownerMemberInsights"
  key_links:
    - from: apps/web/lib/owner-band-scope.ts
      to: packages/modules/dashboard/fixtures/owner-members.ts
      via: "an item is valid only when ownerScopeBands({kind, id}).counts[band] > 0; a member only when ownerBandIncludes(ownerListScope(view), band, id)"
      pattern: "ownerScopeBands\\(|ownerBandIncludes\\("
    - from: apps/web/components/dashboard/BandScopeCards.tsx
      to: packages/modules/communities/ui/CommunityCover.tsx
      via: "imports CommunityCover / EventCover from the modules' public `/ui` surface (apps/web already does in app/(app)/comunidades and eventos), cover-less branch = --brand-gradient"
      pattern: "module-(communities|events)/ui"
    - from: packages/modules/dashboard/fixtures/owner-member-insights.ts
      to: packages/modules/dashboard/fixtures/owner-member-lists.ts
      via: "build() calls buildOwnerMemberLists and throws when a list length differs from its last30 count; postsSeen.value = the seen list length"
      pattern: "buildOwnerMemberLists\\("
---

<objective>
Turn the level-4 Membros "Faixas de engajamento" block into one cascade in all three tabs — faixa → comunidade/evento → membro → insights → list — per the LOCKED decisions D-01..D-08 of 261012-tru-CONTEXT.md, on top of HEAD 824a7724 (quick 261012-ri4).

Purpose: one model, one row of tabs, no second chip row (D-01); every tab opens on the same six bands (D-02); communities and events appear as the user's drawn cards with their original cover ratios (D-03, D-04); tapping goes one level down with an exact way back and forged URLs fall one level up (D-05, D-06); the member's numbers open the items behind them, like level 7 (D-07); the win-back card follows what is open (D-08).
Output: cascade parser and hrefs, two card types, restructured band bodies, a 61-post table and per-member lists, a KPI list screen, unit + component + e2e tests, README, four screenshots, dev server restarted.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/quick/261012-tru-cascata-faixas-para-comunidades-e-evento/261012-tru-CONTEXT.md
@.planning/quick/261012-ri4-acabamento-do-cartao-e-da-tela-do-membro/261012-ri4-SUMMARY.md
@apps/web/AGENTS.md

Facts checked by the planner (HEAD 824a7724):
- OwnerMembers.tsx renders the tab row (`grid grid-cols-3`, lines 184-200), the second chip row `ScopeItems` (lines 89-118, used at line 201) and per-item notes (`tenantOwner.bandScope.note` / `eventNote`); headers use the scope's bands; the recover card follows the scope. TenantOwnerPanel.tsx only passes `OwnerMembersView` through; page.tsx calls `parseOwnerMembersView` (no change needed there).
- `ownerScopeHref` / `ownerMemberHref` are used only by OwnerMembers.tsx, BandMembers.tsx, OwnerMemberDetail.tsx and lib/owner-band-scope.test.ts.
- apps/web already imports `@rede-social/module-communities/ui` and `@rede-social/module-events/ui` (app/(app)/comunidades, app/(app)/eventos; components/media/useCoverPreview.test.tsx renders them under happy-dom), so `pnpm boundaries` allows it. CommunityCover `geometry="card"` = `relative aspect-[16/7] w-full`, EventCover `geometry="hero"` = `relative aspect-[16/10] w-full overflow-hidden`; with `coverAssetId={null}` both render the `--brand-gradient` fallback (defined globally in packages/ui/src/styles/tokens.css) with `data-testid="community-cover-fallback"` / `"event-cover-fallback"` and `data-geometry`. `Card` (@rede-social/ui) already has `overflow-hidden rounded-xl`, so a cover placed first gets rounded top corners.
- Community base = bandTotal(communityEngagement): VIP 186, Geral/Iniciantes/Eventos 1.240. byCommunity posts 22/25/8/6 (sum 61 = byFormat 18+15+20+8), interactions 1.650/1.580/430/280 (likes + comments, the Conteúdo area's numbers). weeklyInteracting.current.at(-1) = 380.
- Engajados per item: VIP 61, Geral 150, Iniciantes 38, Eventos 22; u1 34, u2 23, u3 16, e4 21, e3 18, e2 62, e1 45. Every event has 0 Inativos. Roster VIP engajados = 10 (j 2..11) → VIP Engajados lists 10 + 'e mais 51 membros'; u1 Engajados lists 10 + 'e mais 24 membros'.
- `formatBrlCompact` (@rede-social/contracts/money): < R$ 1.000 full, else Intl compact pt-BR ('R$ 5,5 mil', 'R$ 6 mil', 'R$ 14 mil'; Intl may put a no-break space after 'R$', so e2e matches with `\s`). `formatDuration(t, 180)` = '3h00', `formatDuration(t, 90)` = '1h30'. `formatDayMonth('2026-10-12')` = '12/10'. Catalog already has `tenantOwner.formatsCompared.in_person` = 'Presencial' and `.online` = 'Online'.
- `RelativeMoment` = `{ daysAgo: number; time?: string }`; `momentText` uses the catalog `moment`. `daysSince`, `daysBefore`, `PREVIEW_TODAY` are exported from fixtures/owner-members.ts.
- `ReportValue` reasons live in fixtures/shared.ts `NotMeasuredReason`, the catalog `dashboard.notMeasuredReason.*` and the README reasons table.
- owner-member-insights.ts build() keeps the member's active days in a local `days` set (0..89), `attended` (event ids), `purchaseDay`, and computes `likes = activeDays + EXTRA_LIKES` (one like per active day plus extras), `comments`, `checkIns`, `orders`, `postsSeen = 6 * activeDays + likes` (example). VIP access exactly for j ≥ 2 (COMMUNITY_RULES), so a VIP-less member's pool is Geral + Iniciantes + Eventos (39 posts).
- Level-7 list pattern: lib/dashboard-preview.ts `parseMemberList` / `memberListHref` / `memberCardAnchor`, MemberActivity.tsx `ListLink` + `seeList` footer (`member.lists.seeList` = 'Ver lista'), MemberActivityList.tsx (Voltar, PanelSection with `period`, count line + ExamplePill, empty sentence, `Card` with `divide-y` rows: title, lines, aside). lib/dashboard-preview.ts is part of the production lock: the level-4 list helpers go in lib/owner-band-scope.ts, never there.
- The preview Playwright config reuses an existing :3000 server, which lacks `INSTALL_GATE=off`; so before EVERY Playwright run stop only the :3000 listener with `lsof -nP -iTCP:3000 -sTCP:LISTEN -t` (never Chrome).
- Privacy rule (261012-qer): in apps/web/{app,components,lib}, only BandMembers.tsx reads `ownerBandList`; after this plan only OwnerMemberDetail.tsx and OwnerMemberList.tsx read `ownerMemberInsights`.

Rules (CONTEXT): fictional data only, every on-screen string in the pt-BR catalog with correct accents (check-ui-literals), design tokens only, `@3xl` container queries, vertical scroll only, iPhone mockup, the production lock untouched, Biome/boundaries/literal guard green. Comments and commits in English; screen text in pt-BR. Commit bodies name each change in human terms and close with the checks run. No push, no Vercel. Never stage `screens/` nor any iCloud "* 2.*" copy.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: one cascade in the three tabs — bands → community/event cards → members → insights (D-01..D-06, D-08)</name>
  <files>packages/modules/dashboard/fixtures/shared.ts, packages/modules/dashboard/fixtures/tenant-owner.ts, packages/modules/dashboard/fixtures/owner-members.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/tests/tenant-owner.test.ts, packages/modules/dashboard/tests/owner-members.test.ts, packages/modules/dashboard/README.md, apps/web/lib/owner-band-scope.ts, apps/web/lib/owner-band-scope.test.ts, apps/web/components/dashboard/BandScopeCards.tsx, apps/web/components/dashboard/BandMembers.tsx, apps/web/components/dashboard/BandMembers.test.tsx, apps/web/components/dashboard/OwnerMembers.tsx, apps/web/components/dashboard/OwnerMemberDetail.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - .planning/quick/261012-tru-cascata-faixas-para-comunidades-e-evento/261012-tru-CONTEXT.md (D-01..D-08, verbatim)
    - apps/web/lib/owner-band-scope.ts and apps/web/lib/owner-band-scope.test.ts (whole files)
    - apps/web/components/dashboard/OwnerMembers.tsx, BandMembers.tsx, BandMembers.test.tsx (whole files)
    - apps/web/components/dashboard/OwnerMemberDetail.tsx lines 71-124 (Header) and 320-363 (Voltar)
    - packages/modules/communities/ui/CommunityCover.tsx and packages/modules/events/ui/EventCover.tsx (props, fallback branch)
    - packages/modules/dashboard/fixtures/tenant-owner.ts lines 35-62 (event types), 130-140 (byCommunity type), 357-362 and 440-511 (data); fixtures/owner-members.ts lines 264-274 (scopeBands) and 310-353
    - apps/web/e2e-preview/painel-preview.spec.ts lines 519-553 (no-JS), 678-1068 (scope tests), 1083-1240 (insights, demoted, forged)
    - packages/modules/dashboard/README.md lines 100-175 (sources table, Faixas por comunidade, Insights do membro)
  </read_first>
  <behavior>
    - Parser levels (parseOwnerMembersView → {kind, band, itemId, memberId}): {} → {member, null, null, null}; {recorte:'comunidade'} → {community, null, null, null}; {recorte:'comunidade', faixa:'engajados'} → {community, engaged, null, null}; + comunidade:'vip' → itemId 'c-vip'; comunidade 'xyz' / 'VIP' / 'c-geral' / '' / ['vip'] or the param `evento` instead → itemId null with band kept; {recorte:'comunidade', comunidade:'vip'} without faixa → band null, itemId null; {recorte:'evento', evento:'u1', faixa:'engajados'} → itemId 'u1'; {recorte:'evento', evento:'u1', faixa:'inativos'} → itemId null, band 'inactive' (0 in the band); {recorte:'evento', evento:['e2','e2'], faixa:'engajados'} → itemId null; any other recorte (COMUNIDADE, '', '__proto__', repeated, 'xyz') → kind member, comunidade/evento ignored, faixa still read.
    - Member level: {faixa:'superfas', membro:'om-13'} → memberId 'om-13'; {membro:'om-13'} → null; {faixa:'novos', membro:'om-13'} → null with band new; {recorte:'comunidade', comunidade:'eventos', faixa:'ocasionais', membro:'om-28'} → 'om-28'; same with faixa 'engajados' → memberId null, itemId 'c-eventos', band engaged; {recorte:'comunidade', comunidade:'vip', faixa:'superfas', membro:'om-13'} → null, itemId 'c-vip'; {recorte:'comunidade', faixa:'engajados', membro:'om-25'} (no item) → null; {recorte:'evento', evento:'u1', faixa:'engajados', membro:<first id of ownerBandList({event u1}, engaged)>} → that id.
    - ownerListScope: member → {kind:'member'}; community/event with itemId → {kind, id}; without → null.
    - ownerMembersHref exact strings: {member,null,null,null} → '/painel-preview/dono-do-cliente?area=membros#faixas'; {community,null,null,null} → '…?area=membros&recorte=comunidade#faixas'; {event,null,null,null} → '…?area=membros&recorte=evento#faixas'; {community, engaged, 'c-vip', null} → '…?area=membros&recorte=comunidade&comunidade=vip&faixa=engajados#faixas'; {community, engaged, null, null} → '…&recorte=comunidade&faixa=engajados#faixas'; {community, occasional, 'c-eventos', 'om-28'} → '…?area=membros&recorte=comunidade&comunidade=eventos&faixa=ocasionais&membro=om-28' (no anchor); {member, at_risk, null, 'om-49'} → '…?area=membros&faixa=em-risco&membro=om-49'. Round trip: for every kind × band (incl. null) × valid item (incl. null; only items with count > 0 when band is set) × memberId (null, or the first listed member of that list scope), parse(href query) deep-equals the view.
    - Fixtures: byCommunity rows carry a non-empty `description` and `activeWeek` [104, 296, 92, 41] with community superfãs ≤ activeWeek ≤ min(newActivated + superfan + engaged + occasional of that community, weeklyInteracting.current.at(-1)); every past and upcoming event has `durationMinutes` (e1 180, e2 60, e3 240, e4 90, u1 180, u2 60, u3 480) and `ticketCents` example with reason 'needs_event_tickets', 0 for online events and > 0 in person (e1 6000, e3 12000, u1 6000, u3 35000). `ownerScopeBands(scope)` returns engagement / the community entry / the event entry bands and throws for an unknown id.
    - Component (BandMembers with view): Por membro unchanged (first Novos card still Luana Ferraz; A-1, A-3, A-4 tests stay green with the new props). {community, engaged, null}: the Engajados details holds 4 listitems with a `[data-geometry="card"]` cover each, texts '61 nesta faixa', '150 nesta faixa', '38 nesta faixa', '22 nesta faixa', each card an `a` whose href is the item URL; VIP card shows Membros 186, Ativos na semana 104, Publicações no mês 22, Interações no mês 1.650 and 'Interações: comentários e curtidas'. {event, inactive, null}: 7 cards '0 nesta faixa', no `a` inside the details. {event, engaged, null}: 7 `[data-geometry="hero"]` covers, exactly one exact 'exemplo' and one 'Receita: valores de exemplo' in the details. {community, engaged, 'c-vip'}: a link 'Voltar às comunidades' to '…&recorte=comunidade&faixa=engajados#faixas', one VIP card that is not inside an `a`, then 10 member listitems and 'e mais 51 membros'.
  </behavior>
  <action>
    RED first: write the behavior cases into packages/modules/dashboard/tests/tenant-owner.test.ts (new describe "scope cards (quick 261012-tru D-03, D-04)"), tests/owner-members.test.ts (ownerScopeBands), apps/web/lib/owner-band-scope.test.ts (replace the scope/href describes with the cascade levels, the member level, ownerListScope, exact hrefs and the round trip; keep OWNER_COMMUNITIES, OWNER_EVENTS and OWNER_BAND_SLUGS tests) and apps/web/components/dashboard/BandMembers.test.tsx (render with the new `view` prop; new describes for the community cards, the event cards and the opened item). Run them, confirm they fail by missing export/field or assertion, commit `test(quick-261012-tru): pin the band cascade, the scope cards and their fixture fields`.

    GREEN:
    1. Fixtures (D-03, D-04). shared.ts: add 'needs_event_tickets' to NotMeasuredReason. tenant-owner.ts: byCommunity gains `description: string` (the community's own text from communities.description — tenant content like `name`, not a UI sentence; say so in the type doc) and `activeWeek: number` (members with a counted action in that community in the last 7 days), values: VIP "Aulas, lives e materiais exclusivos para quem é VIP." 104; Geral "Conversa aberta com toda a comunidade: dicas, recados e novidades." 296; Iniciantes "Primeiros passos para quem acabou de chegar." 92; Eventos "Avisos, fotos e conversas dos encontros e das lives." 41. OwnerPastEvent and OwnerUpcomingEvent gain `durationMinutes: number` (ends_at − starts_at, measured) and `ticketCents: ReportValue<number>` (example, reason needs_event_tickets, 0 = free; the receita shown is confirmed × ticket, computed in the web tier like every per-item figure) with the values in behavior. owner-members.ts: rename the private scopeBands to exported `ownerScopeBands` (same body, internal callers updated) and export it from fixtures/index.ts.
    2. apps/web/lib/owner-band-scope.ts (D-05, D-06). Replace OwnerMembersView with `{ kind: OwnerBandScope['kind']; band: EngagementBand | null; itemId: string | null; memberId: string | null }`. parseOwnerMembersView reads level by level and every invalid value falls to the level above: kind from `recorte` (pick over RECORTES, else member); band from parseBand; itemId only when kind is community/event, band is set, the exact single `comunidade` slug (community) or `evento` id (event) is allow-listed, and `ownerScopeBands({kind, id}).counts[band] > 0` — else null (no more "first item" fallback); memberId only when the roster id is exact, band is set, `ownerListScope(view)` is non-null and `ownerBandIncludes(listScope, band, id)`. Export `ownerListScope` and one href builder `ownerMembersHref(view)`: `ownerAreaHref('membros')` + `&recorte=comunidade|evento` + `&comunidade=<slug>` or `&evento=<id>` when itemId + `&faixa=<slug>` when band + `&membro=<id>` when memberId, then `#faixas` only when memberId is null (same parameter order as today, so the om-28 URL keeps working). Remove ownerScopeHref and ownerMemberHref (replace every caller). Doc comments describe the levels and the fallback rule.
    3. New apps/web/components/dashboard/BandScopeCards.tsx (D-03, D-04): `CommunityScopeCard({t, id, band, href})`, `EventScopeCard({t, id, band, href})` and `ScopeItemCards({t, kind, band})`. Each card is a `Card` with `flex flex-col` (no outer padding) — first the cover with no asset (`CommunityCover geometry="card"` / `EventCover geometry="hero"`, `coverAssetId={null}`, `coverVariantWidths={[]}`, `coverAlt` = the name, no overlay: the name sits below, as drawn), then a `p-4 flex flex-col gap-3 [overflow-wrap:anywhere]` body. Community body: name (communityLabel, `text-xl font-bold leading-tight text-text`), description (`text-sm text-text-secondary`), a thin `border-t border-border` line, a `dl` `grid grid-cols-4 gap-2` of four cells (`min-w-0`; `dt` `text-xs text-text-secondary`, `dd` `text-lg font-bold text-text tabular-nums`) Membros = bandTotal(community bands), Ativos na semana = activeWeek, Publicações no mês = posts, Interações no mês = interactions (formatCount), then the note, then the in-band row. Event body: name (`text-xl font-bold`), a `StatusPill tone="brand"` with `tenantOwner.formatsCompared.<format>`, the thin line, a `dl` `grid grid-cols-3 divide-x divide-border` (cells `px-3 first:pl-0 last:pr-0 min-w-0`) Data = formatDayMonth(date), Duração = formatDuration(durationMinutes), Receita = formatBrlCompact(confirmed × ticketCents.value), then the in-band row. In-band row: `flex items-center justify-between gap-2 text-sm font-bold text-brand` with `tenantOwner.scopeCards.inBand` and, only when `href` is set, a `ChevronRight` (aria-hidden, size 18). With `href` the whole Card sits in an `a` with the member card's focus ring; with `href` null it is plain (the opened item, and every card with 0 in the band). ScopeItemCards renders OWNER_COMMUNITIES or OWNER_EVENTS in order as `ul flex flex-col gap-3` of `li min-w-0`, each card linked to `ownerMembersHref({kind, band, itemId: id, memberId: null})` when that item's count in the band is > 0, else unlinked; for events it heads the list with ONE `p` `flex flex-wrap items-center gap-2 text-xs text-text-secondary`: `tenantOwner.scopeCards.event.revenueNote` + `ExamplePill` from exampleBadge of the first event's ticketCents (one pill per list, never per card, D-04).
    4. BandMembers.tsx (D-02, D-05): props become `{ t, bands, view }` (view = kind, band, itemId). Extract today's body into a local `MemberList({t, view, scope, band, count})` (same empty sentence, recent line, example line, cards, 'e mais', disabled 'Ver todos'; member hrefs = `ownerMembersHref({...view, band, memberId: member.id})`); ownerBandList stays read only here. Each band's body: kind member → MemberList(scope whole base, count = bands.counts[band]); kind community/event with `band === view.band` and itemId set → the opened item: a 'Voltar às comunidades' / 'Voltar aos eventos' link (`ChevronLeft`, same classes as OwnerMemberDetail's Voltar) to `ownerMembersHref({...view, itemId: null, memberId: null})`, for events the revenue example line, the item card with `href` null, a `p` `text-sm font-bold text-text` with `tenantOwner.scopeCards.membersIn` ({band}: bandLabel, {item}: communityLabel or `tenantOwner.bandScope.event` name · dd/mm), then MemberList(scope {kind, id}, count = ownerScopeBands(scope).counts[band]); otherwise → ScopeItemCards. `open` stays `band === view.band`. Update the JSDoc (cascade, D-refs).
    5. OwnerMembers.tsx (D-01, D-02, D-08): delete the second-row component and the per-item notes; the three tabs link to `ownerMembersHref({kind, band: null, itemId: null, memberId: null})`, active = view.kind. Under the tabs, community → `tenantOwner.bandScope.communityNote`, event → `tenantOwner.bandScope.eventNote`. The band summaries and the 'Novos: X ativados de Y.' line always use the whole base `tenantOwnerPanel.engagement` (D-02: each member counts once; the line now shows in every tab because the header is the whole base). The recover card reads the em risco and `atRiskWithPush` of `ownerListScope(view)` when kind is community/event with an item open, else the whole base (D-08). movementNote unchanged. `if (members.memberId)` still returns OwnerMemberDetail.
    6. OwnerMemberDetail.tsx (D-06): Voltar = `ownerMembersHref({...view, memberId: null})`; Header gets `scope = ownerListScope(view)` (throw if null next to the existing guard — the parser only sets memberId with a list scope).
    7. dashboard.json: tenantOwner.bandScope — remove `communityLabel`, `eventLabel`, `note` (grep first that nothing else reads them); `eventNote` becomes "A contagem de cada faixa é da base toda. Em cada evento, o inscrito aparece na faixa que tem hoje na base toda."; add `communityNote` "A contagem de cada faixa é da base toda. Em cada comunidade, o membro aparece na faixa das ações feitas nela.". New tenantOwner.scopeCards: inBand "{count} nesta faixa", membersIn "{band} em {item}", backCommunities "Voltar às comunidades", backEvents "Voltar aos eventos", community.{members "Membros", activeWeek "Ativos na semana", posts "Publicações no mês", interactions "Interações no mês", interactionsNote "Interações: comentários e curtidas"}, event.{date "Data", duration "Duração", revenue "Receita", revenueNote "Receita: valores de exemplo"}; notMeasuredReason.needs_event_tickets "Precisa registrar a venda de ingressos dos eventos".
    8. README (dashboard module): rewrite the "three equal tabs … second row" paragraphs as the cascade (levels, URL params, fallback one level up, whole-base headers, cards, D-08), add sources-table rows "Cartão de comunidade" (communities.description, access, 7-day counted actions per community, 30-day posts and likes + comments — measured) and "Cartão de evento" (date and ends_at − starts_at measured; receita example `needs_event_tickets`), and the reasons row for needs_event_tickets. Planner decision recorded there: event ticket revenue is not part of the Financeiro store revenue.
    9. e2e (painel-preview.spec.ts), replacing the obsolete scope tests (second-row helper, chip constants, SCOPE_FALLBACKS, VIP_QUERY loops, per-scope band loop, event-registrant Voltar, no-JS chip test) with: (a) "the scope tabs, one row at every level": tab hrefs and aria-current, equal widths, notes per tab, and for the area, a band of cards, an opened community, an opened event and a member's insights the Faixas section (when present) has exactly one `nav` and the page has no navigation named 'Comunidade das faixas' or 'Evento das faixas'; (b) "Por comunidade cascade": tab → Engajados (summary '205 · 17%') → the four cards in order with their 'N nesta faixa' and the VIP numbers, VIP cover ratio 16/7 ±0.02 (boundingBox of `[data-testid="community-cover-fallback"]`), recover '168 em risco · 69 com push' → click VIP → URL `&recorte=comunidade&comunidade=vip&faixa=engajados#faixas`, 'Voltar às comunidades', 10 member rows + 'e mais 51 membros', recover '22 em risco · 11 com push' → first member → insights, Voltar href `…&comunidade=vip&faixa=engajados#faixas` → back → 'Voltar às comunidades' → cards again; (c) "Por evento cascade": the same with u1 (cards u1..e1 with 34, 23, 16, 21, 18, 62, 45; u1 card 'Presencial', '12/10', '3h00', receita matching /R\$\s?5,5\s?mil/; event cover ratio 16/10 ±0.02; one 'exemplo' in Engajados; Inativos: 7 '0 nesta faixa' and no link; u1 opened: 'Voltar aos eventos', 10 rows + 'e mais 24 membros', recover '6 em risco · 3 com push'; member Voltar `…&recorte=evento&evento=u1&faixa=engajados#faixas`); (d) per-list loop over Por membro (as today, kept), the four communities and the seven events: for each band with a count > 0 in that item, goto the item URL and check rows = min(10, count), CARD_LABELS, more/recent/'Ver todos', the empty sentence never, 'exemplo' pills = 1 (community) or 2 (event: receita + daily time) and zero inside member rows, and the item's recover line; keep VIP Inativos 'e mais 8 membros' and Iniciantes/Eventos Superfãs 6/3 rows with no 'e mais' ('menos de 1%' and the bar floor stay covered by the BandMembers component test, since every header is now whole base); (e) "fallbacks one level up": recorte=xyz → Por membro closed; recorte=COMUNIDADE&comunidade=geral&faixa=engajados and comunidade=vip&faixa=engajados → Por membro with Engajados member cards; recorte=comunidade&comunidade=vip → Por comunidade all closed; comunidade=xyz / VIP / evento=u1 under recorte=comunidade with faixa=engajados → the 4 cards, no 'Voltar às comunidades'; recorte=evento&evento=xyz|evento=e2&evento=e2 with faixa=engajados → 7 cards; recorte=evento&evento=u1&faixa=inativos → 7 cards '0 nesta faixa'; recorte=evento&evento=u1&faixa=xyz → Por evento all closed; (f) update the demoted test to go Por comunidade → Ocasionais → Eventos card → Rodrigo Aguiar (same assertions, Voltar ends `&comunidade=eventos&faixa=ocasionais#faixas`), and the forged-member test (membro=om-13; faixa=novos&membro=om-13 → Novos member cards; VIP superfas om-13 and Eventos engajados om-28 → that community opened in that band with 'Voltar às comunidades' and no insights; recorte=comunidade&faixa=engajados&membro=om-25 → the 4 cards); (g) viewport: for `&recorte=comunidade&faixa=engajados`, `&recorte=comunidade&comunidade=vip&faixa=engajados`, `&recorte=evento&faixa=engajados`, `&recorte=evento&evento=u1&faixa=engajados` at 360/390/430 (openAllDetails, no horizontal overflow) and at 1440×900 inside the phone (screen and page without sideways scroll; clicking the Geral card from the cards view lands the Faixas heading in view below the status bar with the phone screen scrolled), plus the om-28 and SUPERFAN insights loops kept; (h) no-JS: the Por comunidade tab is a plain link (`recorte=comunidade#faixas`), Engajados opens natively, the Geral card link goes to `&recorte=comunidade&comunidade=geral&faixa=engajados#faixas` and shows 'Voltar às comunidades'. The area-tabs test keeps `pills: 6` (Por membro default).

    Run the verify, then commit `feat(quick-261012-tru): one cascade for the bands with community and event cards` (body: D-01..D-06 and D-08 in human terms, the planner decisions — whole-base headers with a note per tab, an item with 0 in the band is unlinked and its URL falls back to the cards, receita outside Financeiro — and the checks run).
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && pnpm --filter @rede-social/module-dashboard exec vitest run tests/tenant-owner.test.ts tests/owner-members.test.ts && pnpm --filter @rede-social/web exec vitest run lib/owner-band-scope.test.ts components/dashboard/BandMembers.test.tsx && API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder pnpm --filter @rede-social/web typecheck && (lsof -nP -iTCP:3000 -sTCP:LISTEN -t | xargs kill 2>/dev/null; true) && cd apps/web && API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder pnpm exec playwright test --config playwright.preview.config.ts -g "dono-do-cliente"</automated>
  </verify>
  <done>
    - The RED commit failed by missing export/field or assertion; the GREEN commit passes the four commands (unit, component, web typecheck, every "dono-do-cliente" e2e incl. the area tabs and the no-JS describe).
    - One row of tabs at every level; the three tabs open on the whole-base bands; community cards measure 16:7 and event cards 16:10; tapping walks band → item → member → insights and every Voltar returns exactly one step; forged URLs fall one level up; the recover card follows the opened item.
    - `grep -rl ownerBandList apps/web/app apps/web/components apps/web/lib` lists only BandMembers.tsx.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: each member's activity behind the numbers — the 61 posts and pure per-member lists (D-07, data)</name>
  <files>packages/modules/dashboard/fixtures/owner-posts.ts, packages/modules/dashboard/fixtures/owner-member-lists.ts, packages/modules/dashboard/fixtures/owner-member-insights.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/tests/owner-member-lists.test.ts, packages/modules/dashboard/README.md</files>
  <read_first>
    - packages/modules/dashboard/fixtures/owner-member-insights.ts (whole file: build(), days, attended, purchaseDay, last30)
    - packages/modules/dashboard/fixtures/member-lists.ts lines 1-140 (level-7 post table and row types: the shape and voice to follow)
    - packages/modules/dashboard/tests/owner-member-insights.test.ts lines 1-60 and 100-112 (ALL helper, postsSeen example test)
    - packages/modules/dashboard/fixtures/tenant-owner.ts lines 351-404 (byFormat, byCommunity, topPosts)
  </read_first>
  <behavior>
    - ownerPostTable: 61 rows with unique ids `op-01`..`op-61`, unique excerpts, `communityId` counts equal byCommunity.posts (22, 25, 8, 6), `type` counts equal byFormat.posts (video 18, gallery 15, text 20, link 8), every `date` within [PREVIEW_TODAY − 29 days, PREVIEW_TODAY], each community's posts spread over the window (VIP and Geral each have a post 27-29 days old), and for each of the four topPosts a row with the same date, type and community (topPosts name → byCommunity id).
    - For all 72 roster members, `insights.lists`: activeDays.length = last30.activeDays; likes.length = last30.likes; comments.length = last30.comments; strongActions.length = last30.strongActions; postsSeen.value.length = last30.postsSeen.value; postsSeen is an example with reason 'needs_post_views'; em risco and inativos have every list empty.
    - likes: distinct posts; each post's community is one the member can access (a key of the roster row's `communities`); each like's daysAgo ≤ daysSince(post.date); like days are the member's 30-day active days and every active day has at least one like; the most recent like equals the roster lastActive (daysAgo and time); sorted most recent first.
    - comments: one per day on the `comments` most recent active days, each on the post liked that day. strongActions: exactly the comments, one check-in per attended event (daysAgo = daysSince(event date)) and the VIP order when purchased in 30 days (product s2, its cents), sorted most recent first.
    - activeDays rows: one per 30-day active day, most recent first, each with actions ≥ 1 and Σ actions = likes + comments + checkIns + orders.
    - postsSeen rows: distinct accessible posts that include every liked and commented post, views ≥ 1, seconds > 0, sorted by views desc then most recent; a member never sees more posts than their pool holds.
    - ownerMemberInsights stays deterministic (two calls deep-equal) and every existing owner-member-insights test stays green.
  </behavior>
  <action>
    RED first: create packages/modules/dashboard/tests/owner-member-lists.test.ts with the behavior above (iterate the whole roster through ownerMemberInsights, like the ALL helper). Run, confirm it fails by missing module/field, commit `test(quick-261012-tru): pin each member's activity lists to their insight numbers`.

    GREEN, per D-07 (data, pure, no clock, no randomness):
    1. New fixtures/owner-posts.ts: `OwnerPost { id; communityId; type: PostType; date; excerpt }` and `ownerPostTable` — the client's 61 posts of the last 30 days, satisfying the behavior. Excerpts are short pt-BR tenant content in the same voice as memberPostTable (rotina, hábitos, mentoria, encontros, lives); reusing its excerpts is fine; Iniciantes posts are about getting started. Header doc: raw content (MOD-02 allows excerpts like member-lists.ts), the table backs the level-4 member lists; post dates do not model the Conteúdo weekday/slot split (no list shows a weekday) — say so.
    2. New fixtures/owner-member-lists.ts: the row types (`activeDays: { when: RelativeMoment; actions: number }[]`, `likes` and `comments`: `{ post: OwnerPost; when }[]`, `strongActions`: a union of `{ kind: 'comment'; post; when }`, `{ kind: 'check_in'; eventId; when }`, `{ kind: 'order'; productId; cents; when }`, `postsSeen: ReportValue<{ post; views; seconds; lastSeen }[]>`), the `OwnerMemberLists` interface and `buildOwnerMemberLists(input)` taking the roster row, its slot j, the 30-day active days, the likes and comments counts, the attended events with their daysAgo and the 30-day order (or null). Algorithm: pool = posts of the member's accessible communities; like slots = one per active day plus the extras round-robin over the active days from the most recent; assign posts from the oldest slot to the newest, each taking the unused pool post with the smallest age ≥ its day (none left → throw naming the member and day, fail loud); `when` carries the roster lastActive time on the lastActive day only; comments on the most recent active days, on that day's first like; strong actions and active days as in behavior; postsSeen = every liked post (views 2 + ((k + j) % 3)) plus, per active day from the most recent, the newest unused pool post published by then (views 1 + ((k + j) % 2)), seconds 20 + 10 × ((k + j) % 6), example with reason needs_post_views.
    3. owner-member-insights.ts: build() collects the 30-day active days from `days`, calls buildOwnerMemberLists, adds `lists: OwnerMemberLists` to OwnerMemberInsights, sets `last30.postsSeen.value` to the seen list length (Posts vistos now means distinct posts seen — the KPI and its list agree by construction; still an example), and throws when activeDays/likes/comments/strongActions list lengths differ from their last30 counts (same fail-loud style as "disagree with the roster"). Update the header doc.
    4. fixtures/index.ts: export the types OwnerPost and OwnerMemberLists (the builder and the table stay internal; tests import them by path).
    5. README "Insights do membro": one paragraph on the post table and the lists (each list's length is its KPI; Posts vistos = distinct posts, example).

    Run the verify, then commit `feat(quick-261012-tru): build each member's likes, comments, strong actions, active days and posts seen` with the body naming the coherence rules and the checks run.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && pnpm --filter @rede-social/module-dashboard exec vitest run && pnpm --filter @rede-social/module-dashboard exec tsc --noEmit</automated>
  </verify>
  <done>
    - RED failed by missing module/field; GREEN makes every module-dashboard test green and tsc clean.
    - For all 72 members each list length equals its KPI, likes are distinct accessible posts published before the like, the newest like is the roster's last activity, and the em risco/inativos lists are empty.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: tapping a member's number opens the list behind it (D-07, screen and route)</name>
  <files>apps/web/lib/owner-band-scope.ts, apps/web/lib/owner-band-scope.test.ts, apps/web/components/dashboard/OwnerMembers.tsx, apps/web/components/dashboard/BandMembers.tsx, apps/web/components/dashboard/BandScopeCards.tsx, apps/web/components/dashboard/OwnerMemberDetail.tsx, apps/web/components/dashboard/OwnerMemberList.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts, packages/modules/dashboard/README.md</files>
  <read_first>
    - apps/web/components/dashboard/MemberActivity.tsx lines 25-80 (ListLink, seeList) and MemberActivityList.tsx (whole file: the level-7 list screen to mirror)
    - apps/web/components/dashboard/OwnerMemberDetail.tsx lines 126-153 (Last30)
    - apps/web/lib/owner-band-scope.ts after Task 1
    - apps/web/e2e-preview/painel-preview.spec.ts lines 1789-2029 (level-7 list e2e: the pattern to mirror)
  </read_first>
  <behavior>
    - Parser: OWNER_MEMBER_LISTS = ['dias-ativos', 'curtidas', 'comentarios', 'acoes-fortes', 'posts-vistos']; {faixa:'superfas', membro:'om-13', lista:'curtidas'} → list 'curtidas'; lista 'xyz' / 'CURTIDAS' / ['curtidas','curtidas'] → list null with memberId kept (the insights); {lista:'curtidas'} without a valid membro → list null (and memberId null); {faixa:'novos', membro:'om-13', lista:'curtidas'} → memberId null, list null, band new.
    - ownerMembersHref with a list: '…?area=membros&faixa=superfas&membro=om-13&lista=curtidas#lista'; with memberId and no list: no anchor (unchanged); `ownerInsightAnchor('curtidas')` = 'insight-curtidas'; OWNER_MEMBER_LIST_ANCHOR = 'lista'. The Task 1 round trip extends to list (null, or each slug when memberId is set).
  </behavior>
  <action>
    RED first: add the behavior cases to apps/web/lib/owner-band-scope.test.ts. Run, confirm failures by missing export or assertion, commit `test(quick-261012-tru): pin the member list links`.

    GREEN, per D-07 (same pattern as the level-7 lists, quick 261012-hqr):
    1. owner-band-scope.ts (never lib/dashboard-preview.ts — production lock): OWNER_MEMBER_LISTS, type OwnerMemberListSlug, OWNER_MEMBER_LIST_ANCHOR = 'lista', `ownerInsightAnchor(slug)` = `insight-${slug}`; the view gains `list: OwnerMemberListSlug | null`, parsed last: an exact single allow-listed `lista` only when memberId is set, else null (falls to the insights, or the level above). ownerMembersHref appends `&lista=<slug>` after membro and ends with `#lista` when list is set. Every non-list link built in Task 1 (tabs, cards, member cards, Voltar links in OwnerMembers, BandMembers, BandScopeCards, OwnerMemberDetail) passes `list: null` explicitly so no link ever carries a list it should not (typecheck lists them).
    2. OwnerMemberDetail.tsx Last30: Dias ativos, Curtidas, Comentários, Ações fortes and Posts vistos become plain `a` links (`grid scroll-mt-20 rounded-xl` + the focus ring, like level-7 ListLink) to `ownerMembersHref({...view, list: slug})` with `id={ownerInsightAnchor(slug)}`, each KpiCard gaining the footer 'Ver lista' (`member.lists.seeList` + ChevronRight 14, as MemberActivity). Tempo médio diário stays a plain card with its pill; Posts vistos keeps its pill.
    3. New apps/web/components/dashboard/OwnerMemberList.tsx: `OwnerMemberList({t, view})`, mirroring MemberActivityList: wrapper `id="lista"` `scroll-mt-20`; Voltar (`tenantOwner.memberDetail.back`) to `${ownerMembersHref({...view, list: null})}#${ownerInsightAnchor(slug)}`; PanelSection title + period `tenantOwner.memberLists.period` ({name}); the count line with the order hint and, for posts-vistos only, the ExamplePill; the empty sentence when no rows; else a Card `ul divide-y` of rows (title, lines, aside). A `Record<OwnerMemberListSlug, …>` of views so a slug without a view fails typecheck. Rows: dias-ativos → title momentText(when), aside actions; curtidas → title excerpt, line community · curtido when; comentarios → title excerpt, line community · comentado when; acoes-fortes → comment: excerpt + 'Comentário · community · when'; check_in: `tenantOwner.bandScope.event` (name · dd/mm) + 'Presença · when'; order: product name + 'Compra · formatBrl(cents) · when'; posts-vistos → title excerpt, line community · última vez when, aside 'visto N× · formatMinutesSeconds(seconds)'. Community names via communityLabel. It reads `ownerMemberInsights(view.memberId).lists` and throws when the member is missing (the parser guarantees it). OwnerMembers.tsx: when memberId is set, render OwnerMemberList if `list` is set, else OwnerMemberDetail.
    4. dashboard.json tenantOwner.memberLists: period "{name} · últimos 30 dias"; activeDays {title "Dias ativos", count "{count, plural, one {# dia ativo} other {# dias ativos}} · mais recentes primeiro", actions "{count, plural, one {# ação} other {# ações}}", empty "Nenhum dia ativo nos últimos 30 dias."}; likes {title "Curtidas", count "{count, plural, one {# curtida} other {# curtidas}} · mais recentes primeiro", line "{community} · curtido {when}", empty "Nenhuma curtida nos últimos 30 dias."}; comments {title "Comentários", count "{count, plural, one {# comentário} other {# comentários}} · mais recentes primeiro", line "{community} · comentado {when}", empty "Nenhum comentário nos últimos 30 dias."}; strongActions {title "Ações fortes", count "{count, plural, one {# ação forte} other {# ações fortes}} · mais recentes primeiro", comment "Comentário · {community} · {when}", checkIn "Presença · {when}", order "Compra · {value} · {when}", empty "Nenhuma ação forte nos últimos 30 dias."}; postsSeen {title "Posts vistos", count "{posts, plural, one {# post} other {# posts}} · {views, plural, one {# visualização} other {# visualizações}} · mais vistos primeiro", line "{community} · última vez {when}", times "visto {count}× · {time}", empty "Nenhum post visto nos últimos 30 dias."}.
    5. e2e: (a) "the insights numbers open their lists": om-13 (`?area=membros&faixa=superfas&membro=om-13`) — for each of the five KPIs read the value (`span.text-2xl`), click the card link, expect URL `&faixa=superfas&membro=om-13&lista=<slug>#lista`, the title heading, a count line starting with that value, listitems equal to the value, the order hint, 'exemplo' next to the count only for Posts vistos; Voltar href ends `&membro=om-13#insight-<slug>` and, clicked, shows the insights with that KPI in the viewport; (b) the community chain: om-28 in Eventos (DEMOTED_DETAIL) → Curtidas → URL `…&comunidade=eventos&faixa=ocasionais&membro=om-28&lista=curtidas#lista` and Voltar back to that insights; (c) empty: om-49 (`faixa=em-risco&membro=om-49`) Curtidas shows '0' and its list 'Nenhuma curtida nos últimos 30 dias.' with no rows; (d) forged: `lista=xyz` on om-13 → the insights; `lista=curtidas` with no membro → the Membros bands; `faixa=novos&membro=om-13&lista=curtidas` → Por membro with Novos open; (e) curtidas, acoes-fortes and posts-vistos of om-13 at 360/390/430 with no horizontal overflow and at 1440×900 inside the phone with no sideways scroll.
    6. README "Insights do membro": the five KPI links, the `lista` parameter and its fallback, and the privacy note extended (the client's management sees which posts a member liked, commented on and viewed).

    Run the verify, then commit `feat(quick-261012-tru): open the list behind each member number` (body: D-07, the list views, the fallback, the checks run).
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && pnpm --filter @rede-social/web exec vitest run lib/owner-band-scope.test.ts components/dashboard/BandMembers.test.tsx && API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder pnpm --filter @rede-social/web typecheck && (lsof -nP -iTCP:3000 -sTCP:LISTEN -t | xargs kill 2>/dev/null; true) && cd apps/web && API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder pnpm exec playwright test --config playwright.preview.config.ts -g "dono-do-cliente"</automated>
  </verify>
  <done>
    - RED failed by missing export/assertion; GREEN passes the unit, web typecheck and every "dono-do-cliente" e2e.
    - Each of the five KPIs opens a list whose row count equals the KPI, Voltar returns to that KPI, Posts vistos keeps its 'exemplo' pill, empty lists say so, forged `lista` falls back.
    - `grep -rl ownerMemberInsights apps/web/app apps/web/components apps/web/lib` lists only OwnerMemberDetail.tsx and OwnerMemberList.tsx.
  </done>
</task>

<task type="auto">
  <name>Task 4: full gate, screenshots and the dev server back up</name>
  <files>(no source files; screenshots under .planning/quick/261012-tru-cascata-faixas-para-comunidades-e-evento/screens/, not committed)</files>
  <read_first>
    - .planning/quick/261012-tru-cascata-faixas-para-comunidades-e-evento/261012-tru-CONTEXT.md (## Verificação, verbatim commands)
  </read_first>
  <action>
    Run the CONTEXT verification exactly: `pnpm lint` (incl. check-ui-literals), `pnpm typecheck`, `pnpm test`, `pnpm boundaries`, and `pnpm check:static-routes` with the placeholder env inline (API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder; typecheck needs it too because it depends on web#build). Stop ONLY the :3000 listener (`lsof -nP -iTCP:3000 -sTCP:LISTEN -t`, kill that PID; never Chrome) and run the FULL preview suite (`pnpm exec playwright test --config playwright.preview.config.ts` in apps/web with the same env). Fix any red check at its source in the file that owns it (with a fix commit naming the cause) before continuing; never declare done with a red check.

    Then restart the dev server with the CONTEXT command verbatim: `cd "/Users/macos/Desktop/rede social/rede-social" && API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder nohup pnpm --filter @rede-social/web dev > /tmp/rede-dev.log 2>&1 &`, wait until it answers, and confirm 200 (curl -s -o /dev/null -w '%{http_code}' with a timeout) on `/painel-preview/dono-do-cliente?area=membros` and on the four screenshot URLs.

    Screenshots (iPhone, 1440×900, light; e.g. `pnpm --filter @rede-social/web exec playwright screenshot --viewport-size "1440,900" --color-scheme light <url> <absolute png path>`) into `.planning/quick/261012-tru-cascata-faixas-para-comunidades-e-evento/screens/`: `01-por-comunidade-faixa-aberta.png` = `http://localhost:3000/painel-preview/dono-do-cliente?area=membros&recorte=comunidade&faixa=engajados#faixas`; `02-comunidade-aberta-membros.png` = `…?area=membros&recorte=comunidade&comunidade=vip&faixa=engajados#faixas`; `03-por-evento-faixa-aberta.png` = `…?area=membros&recorte=evento&faixa=engajados#faixas`; `04-lista-curtidas-membro.png` = `…?area=membros&faixa=superfas&membro=om-13&lista=curtidas#lista`. Look at each image: covers at their ratio, nothing clipped, no sideways scroll; fix and re-shoot if not.

    Final checks: `git diff --quiet 6ca062b1 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts`; the two privacy greps; `find apps/web/components/dashboard apps/web/lib apps/web/e2e-preview apps/web/messages packages/modules/dashboard -name '* 2*'` prints nothing (iCloud copies), and `git status --short` shows no staged screens or " 2" files. No push, no Vercel.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm lint && pnpm typecheck && pnpm test && pnpm boundaries && pnpm check:static-routes && git diff --quiet 6ca062b1 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts && grep -rl ownerBandList apps/web/app apps/web/components apps/web/lib && grep -rl ownerMemberInsights apps/web/app apps/web/components apps/web/lib && ls .planning/quick/261012-tru-cascata-faixas-para-comunidades-e-evento/screens/0[1-4]-*.png && curl -s -m 30 -o /dev/null -w '%{http_code}\n' "http://localhost:3000/painel-preview/dono-do-cliente?area=membros"</automated>
  </verify>
  <done>
    - lint, typecheck, test, boundaries, check:static-routes and the FULL preview Playwright suite are green (command + result recorded for the SUMMARY).
    - Production lock diff empty; ownerBandList read only by BandMembers.tsx; ownerMemberInsights only by OwnerMemberDetail.tsx and OwnerMemberList.tsx; no " 2" copies in the touched folders.
    - Four screenshots exist (uncommitted) and were inspected; the dev server runs from the CONTEXT command and answers 200.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL query → server render | `recorte`, `comunidade`, `evento`, `faixa`, `membro` and `lista` are untrusted and pick what the server renders |
| Fixture data → client's management | Cards, member lists, insights and the new activity lists show one member's individual behavior to the client's team |
| Preview route → production | The preview must stay unreachable in production without its env gate |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-tru-01 | Tampering | `parseOwnerMembersView` | low | mitigate | Every parameter is an exact single allow-listed value read level by level; an item needs a band and a count > 0 there, a member needs `ownerBandIncludes` in the opened scope, a list needs a valid member; anything else falls one level up. Unit tests cover each level and the round trip; e2e covers forged URLs at every level. |
| T-tru-02 | Information disclosure | `OwnerMemberList`, `OwnerMemberDetail`, `BandMembers` | medium | accept | Same audience and decision as 261012-qer B-3 (management sees individual behavior); the lists add which posts a member liked, commented on and viewed, never message text; README privacy note extended; `ownerMemberInsights` read by two components only and `ownerBandList` by one (Task 4 greps). |
| T-tru-03 | Repudiation (misleading data) | band headers, scope cards, Posts vistos | low | mitigate | Headers are whole base with a note per tab; each card says 'N nesta faixa' for that item; receita, daily time and posts seen carry one 'exemplo' pill per list; fixture tests pin card numbers to the Conteúdo totals and list lengths to the KPIs. |
| T-tru-04 | Elevation of privilege | proxy.ts, painel-preview layout, dashboard-preview.ts | high | mitigate | No production-lock file is in files_modified; the level-4 list helpers live in owner-band-scope.ts; `git diff --quiet 6ca062b1` on the three files is in Task 4's verify. |
</threat_model>

<verification>
- Tasks 1-3 are TDD: each RED commit fails by missing export/field or assertion before its GREEN commit; each task's verify is green before the next starts.
- Task 4 runs the CONTEXT gate verbatim with the placeholder env and the full preview suite, after stopping only the :3000 listener; Chrome is never touched.
- Dev server restarted with the CONTEXT command, 200 on the Membros area and the four screenshot URLs.
- No push, no Vercel; screens and iCloud " 2" copies never staged.
</verification>

<success_criteria>
- D-01: one row of three tabs, no second chip row at any level (e2e).
- D-02: the same six whole-base bands in every tab; member cards / community cards / event cards as bodies; 0-in-band cards unlinked.
- D-03 / D-04: cards as drawn, covers measured at 16:7 and 16:10, numbers coherent with the fixture (unit + e2e), one receita 'exemplo' pill per list.
- D-05 / D-06: band → item → member → insights with an exact Voltar at each step; forged parameters fall one level up (unit + e2e).
- D-07: five clickable KPIs, each list's row count equals the KPI (fixture test + e2e), Posts vistos still 'exemplo', deterministic per member.
- D-08: recover card follows the opened item, else the whole base.
- All gates green, four screenshots inspected, server back at 200.
</success_criteria>

<output>
Create `.planning/quick/261012-tru-cascata-faixas-para-comunidades-e-evento/261012-tru-SUMMARY.md` in pt-BR, like the 261012-ri4 SUMMARY: commits table; D-01..D-08 as applied; the planner decisions (headers always whole base with a note per tab — a community card can show more in a band than the header, e.g. Geral Ocasionais 170 vs 150, because it counts the band of the actions made there; an item with 0 in the band is unlinked and its URL falls back to the cards; covers reuse CommunityCover/EventCover through the modules' `/ui` surface, which `pnpm boundaries` allows; receita is an example outside the Financeiro store revenue; Posts vistos now counts distinct posts and its list is built with it; post dates do not model the weekday split); the numbers per card; the gate evidence table (command → result); the restart with its 200s; the screenshot names; and a final `**⚠️ NÃO FEITO**` block with at least the critic and flow-critic reviews over the new commits if this executor cannot launch subagents.
</output>
