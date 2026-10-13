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
| `./ui` | `KpiCard`, `KpiGrid`, `Sparkline`, `LineChart`, `BarList`, `ToneLabel`, `AttentionList`, `ResponsiveTable`, `Collapsible`, `CohortHeatmap`, `ActionCard`, the pure scale helpers `linearPoints`, `pathFrom`, `niceBounds`, `barPercent`, `funnelRates`, `largestDrop`, `heatBucket` / `HEAT_BUCKETS`, and the pure metric helpers (`ui/metrics.ts`): `ENGAGEMENT_BAND_ORDER`, `bandTotal`, `interactedCount`, `interactedPercent`, `engagedPercent`, `percentOf`, the privacy floor `PRIVACY_FLOOR` / `isBelowPrivacyFloor`, `mergeBandsBelowFloor` / `BandGroup` (bands under the floor merged with a neighbour, so none is recoverable by subtracting from the total) and `isComplementBelowPrivacyFloor` (a shown count whose complement would be under the floor), `NEW_MEMBER_DAYS` / `isNewMember`, `vsMedian`, `MIN_STREAK_WEEKS`, `totalMinutes` / `dailyAverageMinutes` (the member report's week total and daily average), and `sumOf` (a picked number summed over rows), `perItem` (a total per item, rounded, 0 with no items) and `attendancePercent` (check-ins over confirmed RSVPs, unrounded) for the client owner's panel. `KpiCard` takes an optional `badge` (a small neutral pill next to the value, worded by the host) |
| `./fixtures` | `previewTenant` (the Igor Alves tenant: display name + a `TenantBranding` record, the only colour values of the package), `platformOwnerPanel`, `platformAdminPanel`, `platformSupportPanel`, `tenantOwnerPanel` (in `fixtures/tenant-owner.ts`, with `tenantOwnerPanel.communityEngagement`: the six bands per community), `ownerBandList` / `OWNER_BAND_LIST_LIMIT` / `OwnerBandMember` / `OwnerBandList` (the level-4 band member lists, `fixtures/owner-members.ts`), `tenantAdminPanel`, `tenantStaffPanel`, `memberPanel`, with an exported type per shape, and the shared shapes in `fixtures/shared.ts`: `Delta`, the engagement model (`EngagementBand`, `EngagementBands`: six exclusive bands of the active members, with the counted actions and band rules in its doc comment) and `NotMeasured` / `NotMeasuredReason`. A metric the app does not collect yet is typed `NotMeasured`, which has no value field: it renders as "Ainda não medido" with the reason, never as a number. The one bounded exception is the member's "Sua atividade" report (261012-h5t D-03) and the client owner's panel (261012-o00 D-03): their metrics are `ReportValue<T>` = `MeasuredValue<T>` \| `ExampleValue<T>`, where `ExampleValue` carries a FICTIONAL value plus its `reason`; it always renders with the "exemplo" pill, and the reason is never shown on screen (the tables below list it) |

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

### Client owner panel (level 4)

The client owner's panel (`tenantOwnerPanel`, `fixtures/tenant-owner.ts`) has six areas, in this
order: Visão geral, Membros, Conteúdo, Eventos, Financeiro and Atendimento. The web tier picks the
area with `?area=<slug>` on the level-4 page, where the slug is one of `visao-geral`, `membros`,
`conteudo`, `eventos`, `financeiro` and `atendimento` (an allow-list in
`apps/web/lib/dashboard-preview.ts`); anything else, or no `area`, renders `visao-geral`. The tabs are
plain links, so they work without JavaScript, and the header keeps the period and the alerts bell in
every area. The bell holds three items: conversations waiting for an answer (no member is named), the
event happening today with its seats left, and the members who entered "em risco" this week.

Level-4 numbers equal level 5's where they describe the same thing (the support queue, the first
response, today's event, attendance, communities, top posts, moderation, store products), and
`tests/tenant-owner.test.ts` proves every sum. Percents and per-post figures are computed from the
raw counts, never typed. The metrics the app does not collect yet are `ExampleValue`s with the
"exemplo" pill next to the value they mark. The top posts are the exception: their saves and shares
are examples on every row, so the block carries one pill on a note line under its title instead of
one per row (261012-oxi C-3):

| Metric | Source today | What must be collected (reason) |
|---|---|---|
| Salvamentos (posts que mais renderam) | none | Saves per post (`needs_saves`) |
| Compartilhamentos (posts que mais renderam) | none | Shares per post (`needs_shares`) |
| Alcance por post | none | Post views per member (`needs_post_views`) |
| % assistido e conclusão (vídeos e reels) | none | Video playback per member (`needs_video_playback`) |
| Lista de espera | only `events.capacity` (no waiting list) | A waiting list per full event: who joined it, who got a seat, who came (`needs_waitlist`) |
| Acessos que vencem em 7 dias, taxa de renovação | the `store` access `expires_at` column, never set | Fill `expires_at` when a time-limited access is granted (`needs_access_expiry`) |
| Conversão por produto | none | Product page visits (`needs_product_page_views`) |
| Atendimentos por assunto | none | A subject on each support conversation (`needs_support_subject`) |
| Receita do cartão de evento | none (no ticket sale is recorded) | The ticket price and sales of each event (`needs_event_tickets`) |
| Crescimento (entraram, saíram, novos por semana) | memberships (joined / left dates) | measured |
| Interações por post, por comunidade | likes + comments joined to `feed_posts.community_id` | measured |
| Melhor dia e horário para publicar | likes + comments by the post's São Paulo publication weekday and hour | measured |
| Visualizações por story | aggregate `story_views` (totals only, never who viewed) | measured |
| Próximos eventos, comparecimento, presencial × online, quem vai | `events.capacity`, RSVPs "vou", check-ins and walk-ins | measured |
| Receita por produto, quem compra | paid `store` orders by product, and by the buyer's band | measured |
| Fila, 1ª resposta, atendimentos por semana, equipe | support chat conversations; staff answers from `chat_messages.author_user_id` | measured |
| Moderação | removed comments, blocks and unblocks | measured |
| Faixas por comunidade | the counted actions joined to the community, plus access for the base (paid access for the exclusive VIP, membership for the others) | measured |
| Membros de cada faixa | the same per-member band, plus the member's last counted action | measured |
| Faixas por evento | the whole-base band of each member with an RSVP "vou" to the event | measured |
| Cartão de comunidade | `communities.description`, access (the base), members with a counted action in the community in the last 7 days, the 30-day posts and their likes + comments (the Conteúdo numbers) | measured |
| Cartão de evento | `events.starts_at` (data) and `ends_at` − `starts_at` (duração); receita = RSVPs "vou" × the ticket price | measured + receita example |
| Insights do membro | one member's counted actions, RSVPs and check-ins, paid orders and support conversation counts; daily time, posts seen and access expiry are examples | measured + examples |

#### Faixas por comunidade e membros de cada faixa (261012-pkd, 261012-qer, 261012-tru)

The "Faixas de engajamento" block of the Membros area is one cascade in three equal tabs
(261012-tru D-01): **Por membro**, **Por comunidade** and **Por evento**, one row and no other menu
below it at any level. Every tab opens on the same six bands with the whole base's counts, each
member counted once (D-02); a note under the Por comunidade and Por evento tabs says so. A band
opens its member cards (Por membro), or the four community cards or the seven event cards (upcoming
soonest first, then past most recent first), each saying how many of the band it holds ("N nesta
faixa"). A card with members in the band opens, in the same place, that band's members in that
community or event (D-05), with a "Voltar às comunidades" / "Voltar aos eventos" link back to the
cards; a member card opens the insights (D-06), whose "Voltar" returns to that exact step. A card
with 0 in the band reads "0 nesta faixa" and is not a link (every event's Inativos).

The levels live in the URL and the web tier reads them in `apps/web/lib/owner-band-scope.ts`, in
order: `?recorte=` (`comunidade` or `evento`, else Por membro), `?faixa=` (one of six slugs, else all
bands closed), `?comunidade=` (the fixture id without its `c-` prefix) or `?evento=` (the event id),
then `?membro=`. An invalid value at any level falls one level up, never to an error: an unknown or
repeated item, an item with no band, or an item with nobody in the band shows the band's cards; a
`membro` outside the band of the opened list shows that list. `ownerMembersHref` builds every link
in the same parameter order; until a member opens, it ends in `#faixas`, so it lands on the block,
and every level works without JavaScript.

The community card (D-03) is the communities module's own cover (`CommunityCover`, the `card` box at
16:7, its `--brand-gradient` fallback since the preview has no photo), then the name, the
description, a thin line, four columns (Membros = the community's base, Ativos na semana, Publicações
no mês, Interações no mês) and the note "Interações: comentários e curtidas". The event card (D-04)
is the events module's cover (`EventCover`, the `hero` box at 16:10), the name, a Presencial/Online
pill, a thin line and three columns split by thin lines: Data, Duração and Receita (RSVPs "vou" × the
example ticket price, one "Receita: valores de exemplo" line with the pill per list, never per
card). Planner decision: this receita is a card example only, not part of the Financeiro store
revenue, which counts paid store orders. Both covers come through the modules' public `/ui`
surface, which `pnpm boundaries` allows for `apps/web`.

Por evento shows today's whole-base band of everyone who RSVP'd "vou" to the event
(`eventEngagement`). `tests/tenant-owner.test.ts` proves that each event's bands sum to its
`confirmed`, that no band exceeds the base's, that nobody is inactive (no fixture RSVP is older than
60 days), that a past event's em risco fit in its no-shows (a check-in within 30 days makes a member
active today), and that past registrants are mostly superfãs and engajados, as `attendanceByBand`.
The roster knows each member's registrations: per event and band, the first eligible slots up to the
band count, never a past event the member joined after.

The "Recuperar quem está em risco" card follows the opened community or event (261012-tru D-08,
after 261012-qer A-2): with none opened it reads the whole base's 168 em risco with 69 reachable by
push; each community and event carries its own `atRiskWithPush`, always between 0 and its em risco
(VIP 22 · 11, Encontro mensal 6 · 3).

A community's bands follow the same rules as the whole base, counting only the member's actions in
that community. Its base is who has access: the exclusive VIP counts who bought it (186), the other
communities count every member (1.240), and their novos are the base's novos.
`tests/tenant-owner.test.ts` proves that each community sums to its base, that the VIP novos fit in
the VIP orders, that no community activates more novos than it has or than the base activated, and
that no community ranks more members from superfã down to em risco than the whole base. Subiram and
Caíram stay whole-base (a planner decision: per-community movement would need its own flows), and a
line says so in the Por comunidade and Por evento tabs. Because every header is the whole base and a
community lists the band of the actions made there, a community card can hold more of a band than
the header (Geral Ocasionais 170 against 150): the note under the tab explains it.

Each band is a closed `<details>` whose summary reads "count · percent" with a mini share bar (only
Em risco is solid). A band with members whose share rounds to 0% reads "menos de 1%", and its bar
keeps a 6 px minimum (A-1). A member list shows the 10 members of the band with the most recent
activity in its list (the whole base, or the opened community or event). A band over 10 says "Os 10 com atividade mais recente" on top and ends with
"e mais N membros" beside a disabled "Ver todos" (A-3); a band with 0 members opens to "Nenhum membro
nesta faixa." (A-4, live in every event's Inativos). The body keys on the band count, so it always
agrees with the summary.

Each member is a card (B-1): an initials circle on the brand color (the profile photo replaces the
initials once real profiles are wired), the name, and four labeled lines: Membro desde, Última
atividade ("hoje às 22:40", "ontem às HH:MM", else "há N dias"), Comunidade que mais interage (in
every scope) and Tempo médio diário, an example (`needs_usage_sessions`) with its "exemplo" pill on
that line. The roster behind the lists
(`fixtures/owner-members.ts`) is a fixed table of 72 fictional names, 12 per band, and a pure builder
with no randomness and no clock. A member keeps their band or drops one level in a community, never
rises, and their last activity there is never more recent than overall; `tests/owner-members.test.ts`
proves this, the band windows, and that every list adds up to its band count.

#### Insights do membro (261012-qer B-3)

Tapping a member card opens that member's insights in place of the Membros area
(`&faixa=<band>&membro=om-NN`, after the tab and the opened community or event; `membro` must sit
in that band of that list, anything else renders the list). "Voltar" returns one step: the same
tab, band and opened community or event, at `#faixas`. Top to
bottom: the header (initials, name, band pill, Membro desde, top community); the last 30 days
(active days, likes, comments, strong actions, plus the example daily time and posts seen); the
band 60 and 30 days ago and today with a 12-week chart of active days; where they interact
(communities and post types); their event registrations and presences; their purchases (the access
expiry is an example, `needs_access_expiry`); support as counts and dates only; and a suggestion by
band whose button is disabled like every preview action.

`fixtures/owner-member-insights.ts` builds it from the roster row, purely. Every number comes from
one set of active days per member, never after the last action nor before joining, so the 30-day
counts, the weekly chart and the band history agree with each other and with the band rules.
Attended events and the VIP purchase (exactly the members with VIP access, at 19700 cents) are active
days. Across the roster, each event's attendees stay within its check-ins, the 30-day VIP purchases
within the 21 VIP orders and the support conversations within the 8 weeks' 127.
`tests/owner-member-insights.test.ts` proves all of it over the 72 members, and that the support
object has no field for message text.

The items behind the 30-day numbers (261012-tru D-07) come from two more pure fixtures.
`fixtures/owner-posts.ts` holds the client's 61 posts of the last 30 days, matching Conteúdo per
community (22 / 25 / 8 / 6) and per format (18 / 15 / 20 / 8), with the four top posts among them;
their dates do not model the weekday and time-slot split (no list shows a weekday).
`fixtures/owner-member-lists.ts` builds, from the same active days, attended events and VIP order,
the member's active days (with their actions), likes (distinct posts the member can reach, published
before the like, the newest at the roster's last activity), comments (one a day on the most recent
active days, on a post liked that day), strong actions (comments, check-ins, the 30-day order) and
posts seen. Each list's length is its KPI, and the builder throws otherwise. "Posts vistos" now
counts the distinct posts of that list (every liked one plus one per active day) and stays an
example (`needs_post_views`); `tests/owner-member-lists.test.ts` proves all of it for the 72 members.

**Privacy (261012-pkd D-03, 261012-qer B-1/B-3, user decisions).** Until 261012-pkd, the level-4
panel showed only counts. The band lists show member names and their engagement level to the
client's team, and the insights screen shows one member's individual behavior: 30-day numbers,
events, purchases and support counts, never message text. Before real data is wired, the app's
privacy notice must tell members that the client's management sees each member's individual
behavior. Platform levels 1–3 keep aggregates only. Only `OwnerMemberDetail.tsx` reads
`ownerMemberInsights`, and only `BandMembers.tsx` reads `ownerBandList`.

#### Para quando os dados reais forem ligados

Notes from the 261012-oxi review, for the change that replaces the fixture with API answers.

Empty lists (C-7, not implemented). The fixture always has rows, so no level-4 block has an empty
state yet. Once real data is wired, each of these blocks needs a pt-BR sentence for "no rows" that
says what will appear there and when. What each one renders today with no rows:

- **Posts que mais renderam** (`OwnerContent`): an empty card; the example note line also hides,
  because it only shows while a post's saves or shares are examples.
- **Próximos eventos** (`OwnerEvents`, `ResponsiveTable`): on a phone, nothing under the heading; at
  `@3xl`, a table with its column headers and no body rows.
- **Lista de espera** (`OwnerEvents`): "0 pessoa entrou na espera de 0 evento lotado" (pt-BR plural
  rules put 0 in `one`), an empty bar card, no demand line, and the "Conseguiram vaga" / "Foram ao
  evento" cards at 0.
- **Atendimentos por assunto** (`OwnerSupport`): the closed summary drops the leader sentence and
  keeps only the pill; opened, an empty bar card.
- **Equipe** (`OwnerSupport`): "0 conversas respondidas por 0 pessoas em 30 dias" and, opened, an
  empty bar card.
- **Conversão por produto** (`OwnerFinance`): the "visitas à página → compra" summary with its pill
  and, opened, an empty bar card.
- **Faixas de engajamento** (`BandMembers`): done in 261012-qer A-4. A band with 0 members reads
  "0 · 0%" and opens to "Nenhum membro nesta faixa.".

Level 5 (admin do cliente) has no member list, so it does not get the insights screen yet
(261012-qer B-3, pending).

Expiring access shown as measured (C-8, accepted, out of scope). Level 6 (`TenantStaffPanel`,
`tenantStaffPanel.store.expiringAccess7d`) shows "Acessos que vencem em 7 dias: 6" as a measured
value, but the `store` access `expires_at` column is never written, so nothing can be counted yet.
Level 4 shows the same 6 with the "exemplo" pill. To close it, either level 6 adopts `ReportValue`
with the pill, or the app starts filling `expires_at` when it grants a time-limited access
(`needs_access_expiry`).

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
activity metrics of each level (band order, computed percents, the member panel starting at 'Sua atividade'). On
platform support the floor merges any band under 5 with a neighbour (every row ≥ 5, the rows sum to
the exact total) and hides the "nunca agiram" complement when it is under 5. An unmeasured metric
shows as a `MissingKpi` ("Ainda não medido") when it stands alone, and as the grouped, closed
"Métricas que dependem de coleta" list on level 5, and level 7's "Sua atividade" report carries the "exemplo" pill exactly on its example
metrics (seven pills, none on a measured one):

```bash
pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts
```
