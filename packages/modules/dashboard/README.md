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
| Salvamentos (cartões e detalhe da publicação) | none | Saves per post (`needs_saves`) |
| Compartilhamentos (cartões e detalhe da publicação) | none | Shares per post (`needs_shares`) |
| Alcance e visualizações por publicação, alcance por faixa, taxa de engajamento | none | Post views per member (`needs_post_views`), kept only to count (P3) |
| % assistido, retenção do vídeo | none | Video playback per member (`needs_video_playback`) |
| Até o último cartão (carrossel) | none | How far each member swiped a gallery (`needs_gallery_swipes`) |
| Cliques no link | none | Link clicks per post (`needs_link_clicks`) |
| Toques no story (avançaram, voltaram, saíram) | none | Story taps per viewer (`needs_story_taps`) |
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
| Tipo de publicação (Conteúdo) | SPEC §2.3: `feed_posts.media_kind` video; gallery with 1 `feed_post_media` row = foto, 2+ = carrossel; `none` with a link preview = link, else texto; a `stories` row = story | measured |
| Curtidas e comentários por publicação, e quem curtiu ou comentou | `feed_posts.like_count` / `comment_count` and `feed_likes` / `feed_comments` per member (`stories.like_count` / replies for a story) | measured |
| Comentários respondidos pela equipe e 1ª resposta | the staff replies under each comment (author role) and their time | measured |
| Reativados, inscrições, vendas e assinaturas da vitrine até 7 dias | the same member's counted actions, RSVPs "vou", paid orders and VIP purchases within 7 days after interacting with the publication | measured association, not cause |
| Visualizações únicas de story | aggregate `story_views` (totals only, never who viewed) | measured |

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

On screen, Dias ativos, Curtidas, Comentários, Ações fortes and Posts vistos are links ("Ver lista")
to `&membro=om-NN&lista=<slug>#lista`, the slug one of `dias-ativos`, `curtidas`, `comentarios`,
`acoes-fortes` and `posts-vistos` (same pattern as level 7's lists). The list screen has "Voltar" to
that number (`#insight-<slug>`), the title, the member and the window, the count with the order of
the rows (and the "exemplo" pill on Posts vistos only), then the rows, or one sentence when there
are none. `lista` is read only with a valid member: anything else shows the insights (or the level
above). Tempo médio diário stays a plain card.

**Privacy (261012-pkd D-03, 261012-qer B-1/B-3, user decisions).** Until 261012-pkd, the level-4
panel showed only counts. The band lists show member names and their engagement level to the
client's team, and the insights screen shows one member's individual behavior: 30-day numbers,
events, purchases and support counts, never message text. Since 261012-tru the lists behind the
numbers also show which posts a member liked, commented on and viewed (never a comment's text).
Before real data is wired, the app's privacy notice must tell members that the client's management
sees each member's individual behavior, including those posts. Platform levels 1–3 keep aggregates
only. Only `OwnerMemberDetail.tsx` and `OwnerMemberList.tsx` read `ownerMemberInsights`, and only
`BandMembers.tsx` reads `ownerBandList`.

#### Conteúdo (261013-h51)

The Conteúdo area is one cascade of plain links in three equal tabs, as Membros: **Visão geral**,
**Por tipo** and **Publicações** (`?vista=` none, `tipos`, `publicacoes`), one row and no period
selector (30 days against the 30 before). The params, in order: `vista`, `numero` (an overview
number: `publicacoes`, `interacoes`, `taxa`, `membros`, `visualizacoes`, `alcance`), `faixa` (a band
of "Quem interage" with interactors), `tipo` (`video`, `foto`, `carrossel`, `texto`, `link`,
`story`), `post`, `quem` (`curtidas`, `comentarios`, `salvamentos`, `compartilhamentos`; there is no
views or reach value), `membro` and `lista`. `apps/web/lib/owner-content-view.ts` reads them level by
level: each is an exact, single, allow-listed value that the opened list holds (a post of the opened
type, a member of the opened people through `ownerContentIncludes` / `ownerContentInteractorIncludes`),
and anything else falls one level up, never to an error. Every deeper step has a "Voltar" to the exact
previous URL, landing on the card or number it closed. A member opens the same `MemberCard`,
`OwnerMemberDetail` and `OwnerMemberList` as Membros.

Data: `fixtures/owner-content.ts` holds the 61 posts of `owner-posts.ts` (now with likes, comments
and media) and 16 stories, the people behind each number (the inverse of the roster's insights lists,
so a member's like and a post's liker are one fact), the overview aggregates and each publication's
detail; `tests/owner-content.test.ts` proves the sums and both directions. Only
`OwnerContentPeople.tsx` reads `ownerContentPeople`, `ownerContentInteractors` and
`ownerContentInteractions`.

Planner decisions:

- PD-1 Reel is folded into Vídeo; stories are the sixth type only in Por tipo; the numbers and lists count the 61 feed posts.
- PD-2 The cover takes the feed's ratio (video 9:16–1.91, gallery 4:5–1.91, link 16:9, story 9:16, no cover for text), capped in height by narrowing it.
- PD-3 The tab row shows on the tab screens (an opened type or band included); deeper steps replace the area under a "Voltar".
- PD-4 Post dates do not model the weekday and slot split; the heatmap is its own aggregate (rows and columns add up to `byWeekday` / `bySlot`).
- PD-5 Quem interage uses today's band; em risco and inativos are 0 by definition; the percent is the share of the band that interacted.
- PD-6 The heatmap tint is `heatBucket` of the min–max-normalized value, so only the best cell is solid.
- PD-7 The Interações list is the interactions themselves (who, band, liked or commented, which publication, when).
- PD-8 Saves and shares people are example subsets of the likers; story likers and repliers are picked from the active roster.
- PD-9 A comment's text is never shown; the commenters list puts the unanswered first.
- PD-10 Any order count under 5, zero included, reads "menos de 5 pedidos" with no value.
- PD-11 Canais left Conteúdo with nothing moved: the panel's Visão geral already has one number per area.
- PD-12 Taxa de engajamento = likes + comments ÷ the reach of the 61 posts (an example, because the reach is).

#### Para quando os dados reais forem ligados

**Privacy of Conteúdo (261013-h51 D-07, user decisions, next to the notice above).**

- P1: the names of who liked or commented on a publication are shown at level 4 only, to the client's
  team, as in Membros; platform levels 1–3 keep aggregates only. The privacy notice must say so.
- P2: revenue per publication is shown only from 5 orders on; below that it reads "menos de 5
  pedidos", with no value.
- P3: views per member are recorded only to count them, never to list who viewed; they are kept 90
  days. No views or reach number opens a list of people (the parser has no such `quem` value).

Notes from the 261012-oxi review, for the change that replaces the fixture with API answers.

Empty lists (C-7, not implemented). The fixture always has rows, so no level-4 block has an empty
state yet. Once real data is wired, each of these blocks needs a pt-BR sentence for "no rows" that
says what will appear there and when. What each one renders today with no rows:

- **Conteúdo** (`OwnerContent*`): the publication lists, the people lists and Precisa de atenção
  already have their empty sentence; the trend, the heatmap and the type cards still assume rows.
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
