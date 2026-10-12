---
phase: quick-261012-hqr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/modules/dashboard/fixtures/member-lists.ts
  - packages/modules/dashboard/fixtures/index.ts
  - packages/modules/dashboard/fixtures/shared.ts
  - packages/modules/dashboard/fixtures/tenant-panels.ts
  - packages/modules/dashboard/ui/KpiCard.tsx
  - packages/modules/dashboard/ui/metrics.ts
  - packages/modules/dashboard/ui/index.ts
  - packages/modules/dashboard/tests/member-lists.test.ts
  - packages/modules/dashboard/tests/metrics.test.ts
  - packages/modules/dashboard/tests/kpi-card.test.tsx
  - packages/modules/dashboard/README.md
  - apps/web/lib/dashboard-preview.ts
  - apps/web/lib/dashboard-preview.test.ts
  - apps/web/app/painel-preview/[nivel]/page.tsx
  - apps/web/components/dashboard/MemberPanel.tsx
  - apps/web/components/dashboard/MemberActivity.tsx
  - apps/web/components/dashboard/MemberActivityList.tsx
  - apps/web/components/dashboard/format.ts
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, PWA-03, MOD-02]
tags: [dashboard, preview, member, report, drill-down, next-intl, pt-BR]

estimate:
  tokens: 120000
  raw_tokens: 120000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "On /painel-preview/membro exactly 8 KPI cards are links, and each shows 'Ver lista' with a chevron: Curtidas, Comentários, Salvamentos, Compartilhamentos, Posts vistos, Stories vistos, Vídeos e reels and Tempo em vídeos e reels. 'Média por dia', 'Presença nos encontros', 'Sequência' and the communities list are not links and carry no chevron (D-01, D-02)."
    - "Tapping a list card navigates to /painel-preview/membro?lista=<slug> (curtidas, comentarios, salvamentos, compartilhamentos, posts-vistos, videos, stories). Both video cards open ?lista=videos. The list screen keeps the profile header and replaces 'Para você' and 'Sua atividade' with a 'Voltar' link, an h3 title, the 'Últimos 7 dias' pill, the item count, and the rows (D-02)."
    - "Row counts match the report: curtidas 46, comentarios 12, salvamentos 9, compartilhamentos 3, posts-vistos 60 (views sum to 128), videos 41 (watched time sums to 72 min), stories 23 (D-03, D-04)."
    - "The 'exemplo' pill follows one rule: it sits next to the example value it marks. There is one pill on the header of an all-example list (salvamentos, compartilhamentos, posts-vistos, videos). There are no pills on curtidas or comentarios. On stories there is one pill per row, next to that row's time, because the list is measured and only the time per story is example (D-02, D-03)."
    - "An unknown, empty, repeated or wrong-case `lista` value renders the normal report, with no 'Voltar' link. Only allow-listed constants ever reach markup or URLs (D-02)."
    - "'Voltar' returns to /painel-preview/membro#atividade-<slug>, and the card that opened the list is in view. Card links and 'Voltar' are keyboard focusable and show a visible focus ring. Inside the 440 px phone, a long list scrolls vertically within the screen and the window does not scroll (D-02)."
    - "The 'Posts vistos' KPI reads 60, unit 'posts', note '128 visualizações'. No list shows another member's name: story authors are only 'Dr. Igor Alves' or a community. No list shows 'Precisa registrar' or 'Ainda não medido' (D-03, D-05)."
    - "There is no horizontal scroll at 360, 390 or 430 px or inside the 440 px phone, on the report or on any list. pnpm lint, typecheck, test, boundaries, check:static-routes and the full preview Playwright suite are green. The dev-only gate is intact."
  artifacts:
    - path: packages/modules/dashboard/fixtures/member-lists.ts
      provides: "MemberActivityLists (each list a ReportValue<Row[]>), the 60-post table, the 41-video table, the deterministic builders, and the `memberActivityLists` export"
      contains: "memberActivityLists"
    - path: packages/modules/dashboard/ui/metrics.ts
      provides: "totalViews / totalWatchedSeconds pure sum helpers"
      contains: "totalWatchedSeconds"
    - path: packages/modules/dashboard/tests/member-lists.test.ts
      provides: "D-04 proofs: 46/12/9/3, 60 rows summing to 128 views, 41 rows summing to 72 min, 23 stories, per-community likes + comments = byCommunity, example flags agree with the report"
    - path: apps/web/lib/dashboard-preview.ts
      provides: "MEMBER_LISTS allow-list, parseMemberList, memberListHref, memberReportHref, memberCardAnchor, MEMBER_LIST_ANCHOR"
      contains: "parseMemberList"
    - path: apps/web/components/dashboard/MemberActivityList.tsx
      provides: "the list screen (Voltar, title, period, count, exemplo, rows)"
    - path: packages/modules/dashboard/README.md
      provides: "drill-down lists section + needs_story_view_time row"
      contains: "needs_story_view_time"
  key_links:
    - from: "apps/web/app/painel-preview/[nivel]/page.tsx"
      to: apps/web/lib/dashboard-preview.ts
      via: "PANELS.membro passes parseMemberList(query) to MemberPanel"
      pattern: "parseMemberList\\(query\\)"
    - from: apps/web/components/dashboard/MemberActivityList.tsx
      to: packages/modules/dashboard/fixtures/member-lists.ts
      via: "the header pill comes from list.example and the story row pill from row.seconds.example, never from a position"
      pattern: "\\.example"
    - from: apps/web/components/dashboard/MemberActivity.tsx
      to: apps/web/lib/dashboard-preview.ts
      via: "the card anchor uses memberListHref(slug) and id=memberCardAnchor(slug)"
      pattern: "memberListHref"
    - from: packages/modules/dashboard/tests/member-lists.test.ts
      to: packages/modules/dashboard/fixtures/tenant-panels.ts
      via: "list lengths and sums are asserted equal to memberPanel.activity counts"
      pattern: "memberPanel\\.activity"
---

<objective>
In the member's "Sua atividade" report (level 7, `/painel-preview/membro`, branch `feat/painel-preview`, HEAD 80a489ff), each engagement and "O que você viu" metric opens its own list. The decisions D-01..D-05 in `261012-hqr-CONTEXT.md` are LOCKED.

Purpose: the member can see what is behind each number: the posts they liked, saved, shared or viewed, their own comments, the videos and reels they watched, and the stories they saw. The numbers stay consistent with the report, and fictional data stays marked "exemplo".

Output:
- A new typed list fixture in the dashboard module, with deterministic builders, sum helpers and consistency tests.
- A `footer` slot on `KpiCard`.
- A `lista` query parser and href helpers in `lib/dashboard-preview.ts`.
- `MemberActivityList.tsx`, plus card links in `MemberActivity.tsx` and the list branch in `MemberPanel.tsx`.
- Catalog keys, a README section, an extended preview e2e, and 10 screenshots (not committed).

Same constraints as quicks 261011-jqy..261012-h5t:
- fictional fixtures, and pt-BR strings only in the catalog;
- no hex in `.tsx`, tokens only, and `@3xl` container queries;
- vertical scroll only, and the iPhone frame from `lg`;
- the member sees only their own data and never a collection note;
- the "exemplo" pill is derived from typed data, and the tone is neutral.

The dev-only gate stays intact. Only the `PANELS.membro` entry and one import change in `app/painel-preview/[nivel]/page.tsx`: `await connection()` followed by `if (!dashboardPreviewEnabled()) notFound();` is untouched, and `proxy.ts` and `app/painel-preview/layout.tsx` are not modified.

## Planner decisions (state each as applied in the SUMMARY)

1. **URL slugs (D-02).**
   - `MEMBER_LISTS` in canonical order: `curtidas`, `comentarios`, `salvamentos`, `compartilhamentos`, `posts-vistos`, `videos`, `stories`.
   - `parseMemberList(query)` returns the slug only when `lista` is a single string that is exactly one of those values. Anything else returns null, and the report renders. This mirrors `parseStaffFunctions`.
   - The tuple grows task by task: Task 1 has `curtidas`, Task 2 adds 4, and Task 3 adds 2. The `Record<MemberListSlug, …>` in `MemberActivityList` makes a slug without a builder fail typecheck.
2. **Links are plain `<a href>` (D-02).** They follow the staff simulator's `Chip` pattern: a server navigation with no client JS.
   - Open: `/painel-preview/membro?lista=<slug>#lista`.
   - Voltar: `/painel-preview/membro#atividade-<slug>`, so the member lands back on the card they tapped.
   - Both fragment targets carry `scroll-mt-20`, so the phone's sticky 62 px status bar never covers them.
   - Fallback: if Chrome's fragment scroll does not reach inside the phone's scroll container, switch both links to `next/link` `Link`. It renders the same `<a>`, works without JS, and its hash handling calls `scrollIntoView`. Record that as a deviation. Never add a client component for this.
3. **Tappable affordance (D-02).**
   - `KpiCard` gets an optional `footer?: ReactNode`, rendered last. Without it the markup is byte-for-byte unchanged.
   - The label span stays a direct child of the Card, so the e2e helper `kpiCard(page, label)` still works.
   - The web passes the catalog text "Ver lista" plus `ChevronRight` (`aria-hidden`, size 14) in `text-brand`.
   - The whole card is the anchor. Its classes are `grid` (so the card fills its grid cell), `rounded-xl` (the Card's radius) and `scroll-mt-20`, plus the Chip focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg`.
   - Only the 8 list cards get this.
4. **One post table feeds every post list (D-03, D-05).** `fixtures/member-lists.ts` holds the 60 posts the member viewed in the window, in recency order (index 0 = most recent).
   - Likes, comments, saves and shares reference these posts.
   - An action's moment is the post's last-seen moment, so no row contradicts another. For example, a post is never "curtido ontem" but "última vez há 6 dias".
5. **Moments.** `spreadMoments(count)` is a pure, exported builder that returns `count` `RelativeMoment`s, newest first:
   - day = 1 + floor(i × 7 / count);
   - the j-th item of a day takes `TIMES[j]` from the fixed table 23:10, 22:05, 21:30, 20:45, 19:20, 18:10, 13:40, 12:15, 08:30, 07:05.
   - The largest day group is 9 for 60 items, which fits the 10 times. The report window is days 1..7: "hoje" never appears.
6. **Views (D-03).**
   - The distribution is 1 post × 6, 2 × 5, 4 × 4, 8 × 3, 27 × 2 and 18 × 1. That makes 60 posts and 128 views.
   - Expand it, in that order, into `VIEW_COUNTS` (60 entries). Post i gets `VIEW_COUNTS[(i × 7) % 60]`. Since gcd(7, 60) = 1, this is a permutation, so the sum is exactly 128.
   - The list is sorted by views desc, then most recent first. Table index order already is recency order.
7. **Likes and comments agree with "Onde você mais participa" (31/19/8).**
   - Likes: the first 25 VIP, the first 15 Geral and the first 6 Eventos posts in table order. That is 46.
   - Comments: 12 hand-written `[postId, text]` pairs on 12 distinct posts: 6 VIP, 4 Geral and 2 Eventos.
   - So for each community, likes + comments = the `byCommunity` interactions.
   - Saves: the posts at table index i with i % 7 === 2 (indices 2, 9, 16, 23, 30, 37, 44, 51, 58). That is 9.
   - Shares: the posts at indices 5, 25 and 45, via `link`, `native` and `link`.
8. **Videos (D-03).** These are the 41 rows from `<fixture_contract>`, already sorted by time watched desc:
   - 16 `video` and 25 `reel`;
   - the watched seconds sum to 4320, which is 72 min;
   - every row has 0 < watched ≤ duration × plays;
   - they include the D-03 sample row: 130 s watched of a 252 s video, 2 plays, which reads "2 min 10 s de 4 min 12 s · 2×".
9. **Stories (D-03, D-05).** 23 rows: `when = spreadMoments(23)[i]`.
   - Author: when i % 4 === 3, it is the community `['Comunidade VIP','Geral','Eventos'][floor(i / 4) % 3]`. Otherwise it is `previewTenant.displayName` ("Dr. Igor Alves").
   - `seconds` is an `ExampleValue<number>` with value 5 + ((i × 7) % 11), which stays within 5–15, and reason `needs_story_view_time` (a new `NotMeasuredReason`).
   - The list itself is a `MeasuredValue`.
   - The single "exemplo" rule from the must-haves applies, which is why there is one pill per row.
10. **"Posts vistos" KPI (D-03).** The report fixture `seen.posts` becomes `ReportValue<{ posts: number; views: number }>` with `{ posts: 60, views: 128 }`, still an example with reason `needs_post_views`. The card shows value 60, unit "posts" and note "128 visualizações".
11. **Wording adjusted for correct pt-BR (record in the SUMMARY).**
    - The D-03 row text "vista N×" is written "visto N×", to agree with "post" (masculine, as in "Posts vistos").
    - "Compartilhamento nativo" is written "Compartilhado pelo celular", because "nativo" is developer jargon.
12. **Copy.** The exact catalog strings are in `<copy_contract>`. Rows are not links and carry no chevron.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/261012-hqr-listas-detalhadas-ao-tocar-nas-metricas-/261012-hqr-CONTEXT.md
@.planning/quick/261012-h5t-relatorio-sua-atividade-do-membro-com-te/261012-h5t-SUMMARY.md
@apps/web/AGENTS.md
@apps/web/app/painel-preview/[nivel]/page.tsx
@apps/web/lib/dashboard-preview.ts
@apps/web/components/dashboard/MemberPanel.tsx
@apps/web/components/dashboard/MemberActivity.tsx
@packages/modules/dashboard/fixtures/shared.ts
@packages/modules/dashboard/ui/KpiCard.tsx

<interfaces>
Existing code the executor builds on (verified at 80a489ff):

- `apps/web/app/painel-preview/[nivel]/page.tsx`:
  - `PANELS: Record<PreviewSlug, (query: SearchParams) => ReactNode>`. `membro: () => <MemberPanel />` today. `equipe-do-cliente` shows the pattern `(query) => <TenantStaffPanel {...parseStaffFunctions(query)} />`.
  - The default export runs `await connection(); if (!dashboardPreviewEnabled()) notFound();` before anything else. That is the gate, and it is not touched.
- `apps/web/lib/dashboard-preview.ts`:
  - `previewLevelPath('membro')` returns `/painel-preview/membro`.
  - `type SearchParams = Record<string, string | string[] | undefined>` (module-private).
  - `STAFF_FUNCTIONS` `as const` plus an `isStaffFunction` guard plus `parseStaffFunctions` is the allow-list pattern to copy.
  - Unit tests are in `apps/web/lib/dashboard-preview.test.ts`.
- `packages/ui` `Chip` (`packages/ui/src/primitives/Chip.tsx`) renders a plain `<a>` with an `href` and the focus classes quoted in decision 3. `Card` is `overflow-hidden rounded-xl bg-card …`. `StatusPill` (tone neutral) with `className="px-2 py-0.5"` is the small "exemplo" pill already used in `MemberActivity.tsx` (the peak line).
- `packages/modules/dashboard/ui/KpiCard.tsx`:
  - The props are `label, value, unit?, delta?, note?, chart?, variant?, badge?`.
  - The children render in this order: label span, value (or value plus badge row), delta, note, chart in `<div className="mt-1">`.
  - The module holds no words and no route: the host passes every string and node.
- `apps/web/components/dashboard/MemberActivity.tsx`:
  - `engagementCards` maps likes, comments, saves and shares to a `KpiCard` in a `KpiGrid`.
  - "O que você viu" has 4 KpiCards: posts, stories, videos (count), and videoTime (`formatHoursMinutes`).
  - `exampleBadge(t, metric)` derives the pill from `metric.example`.
- `apps/web/components/dashboard/PanelSection.tsx`: `PanelSection({ title, period?, as?: 'h3'|'h4', prominent?, children })`.
- `apps/web/components/dashboard/format.ts`:
  - `formatCount` and `formatHoursMinutes(t, minutes)` (catalog `durationLong`).
  - `momentText(t, { daysAgo, time })` gives "hoje 09:12", "ontem 21:40" or "há 3 dias".
  - `DashboardT`.
- `packages/modules/dashboard/fixtures`:
  - `RelativeMoment { daysAgo: number; time?: string }` lives in `platform-panels.ts` and is re-exported.
  - `ReportValue<T> = MeasuredValue<T> | ExampleValue<T>`; `ExampleValue` carries `reason: NotMeasuredReason`.
  - `memberPanel.activity`:
    - `engagement.{likes 46, comments 12}` are measured; `{saves 9, shares 3}` are example.
    - `seen.posts` is example 128 today (Task 3 reshapes it).
    - `seen.videos` is example `{ count: 41, minutes: 72 }`; `seen.stories` is measured 23.
    - `byCommunity` is measured: Comunidade VIP 31, Geral 19, Eventos 8.
  - `previewTenant.displayName` is 'Dr. Igor Alves'.
- `apps/web/e2e-preview/painel-preview.spec.ts`:
  - Helpers: `kpiCard(page, label)` is the label's parent; `sectionTitled(page, title)` is the heading's nearest `section`; `horizontalOverflow`, `screenMetrics`, `openAllDetails`.
  - The test 'membro: Sua atividade report' (lines ~733-822) asserts exactly 7 "exemplo" pills on the report. That count stays 7.
  - `seenValues` has `['Posts vistos', '128']`, which Task 3 updates.
</interfaces>

<fixture_contract>
**Post table** (Task 1 writes all 60; later tasks only read it).
- Each row is `{ id: 'p01'..'p60', community, excerpt }`, in recency order, with community counts VIP 30, Geral 20 and Eventos 10, interleaved.
- `community` is one of 'Comunidade VIP', 'Geral', 'Eventos'.
- The excerpts are distinct, at most 70 characters, written by and about the creator's content in the tone of the existing fixtures: classes, the group mentoring, lives, the monthly meeting, workshops, routine and habits. Examples: "Aula 14 da mentoria: como montar a rotina da semana", "Live de dúvidas confirmada para quinta às 20h", "Encontro mensal: fotos e os próximos passos".
- No person names other than "Dr. Igor Alves", and no medical claims.

**Comment pairs** (Task 2): 12 `[postId, text]` pairs on distinct posts, 6 VIP, 4 Geral and 2 Eventos.
- The texts are in the member's own voice (Ana), at most 90 characters, neutral and friendly, with no names. Example: "Comecei a aplicar a rotina da aula e já senti diferença".
- Each text must fit its post's excerpt.

**Video rows** (Task 3): `{ id: 'v01'..'v41', kind, community, title, durationSeconds, plays, watchedSeconds }`.
- Titles are distinct, at most 50 characters, in the same tone. Communities can be any of the three.
- Write the rows in exactly this order, as `kind duration/plays/watched` (v = video, r = reel):
  v612/1/540 v540/1/300 v290/2/290 v498/1/250 v420/1/210 v360/1/200 v385/1/180 v312/1/150 r90/2/150 r70/3/140 v252/2/130 v240/1/120 r80/2/110 v225/1/100 v210/1/90 r62/2/90 r85/1/85 v198/1/80 r55/2/80 r75/1/75 r48/2/70 r68/1/68 v185/1/60 r72/1/60 r60/1/60 r40/2/60 r58/1/58 r52/1/52 r65/1/50 v170/1/45 r45/1/45 r30/2/45 r42/1/42 r38/1/38 r50/1/35 r35/1/35 r32/1/32 r44/1/30 r36/1/25 v150/1/20 r28/1/20
- The sum of watched is 4320, which is 72 min. There are 16 videos and 25 reels.

**Row types** (all exported):
- `PostRef { id; excerpt; community }`
- `LikedPost = PostRef & { when: RelativeMoment }`
- `OwnComment { id; text; post: PostRef; when }`
- `SavedPost = PostRef & { when }`
- `SharedPost = PostRef & { when; via: 'link' | 'native' }`
- `ViewedPost = PostRef & { views; lastSeen: RelativeMoment }`
- `WatchedVideo { id; kind: 'video' | 'reel'; community; title; durationSeconds; plays; watchedSeconds }`
- `SeenStory { id; author; when; seconds: ReportValue<number> }`

`MemberActivityLists` has one field per list:
- likes, comments and stories are `MeasuredValue`;
- saves (`needs_saves`), shares (`needs_shares`), posts (`needs_post_views`) and videos (`needs_video_playback`) are `ExampleValue`.
</fixture_contract>

<copy_contract>
These are the new catalog keys in `apps/web/messages/pt-BR/dashboard.json`, under the root `dashboard`.

**`member.lists`:**
- `back`: "Voltar"
- `seeList`: "Ver lista"
- `likes`:
  - `title`: "Posts que você curtiu"
  - `count`: "{count, plural, one {# curtida} other {# curtidas}}"
  - `line`: "{community} · curtido {when}"
- `comments`:
  - `title`: "Seus comentários"
  - `count`: "{count, plural, one {# comentário} other {# comentários}}"
  - `text`: "“{text}”"
  - `on`: "Em “{post}”"
  - `line`: "{community} · {when}"
- `saves`:
  - `title`: "Posts que você salvou"
  - `count`: "{count, plural, one {# salvamento} other {# salvamentos}}"
  - `line`: "{community} · salvo {when}"
- `shares`:
  - `title`: "Posts que você compartilhou"
  - `count`: "{count, plural, one {# compartilhamento} other {# compartilhamentos}}"
  - `line`: "{via} · {when}"
  - `via.link`: "Link copiado"
  - `via.native`: "Compartilhado pelo celular"
- `posts`:
  - `title`: "Posts que você viu"
  - `count`: "{posts, plural, one {# post} other {# posts}} · {views, plural, one {# visualização} other {# visualizações}}"
  - `line`: "{community} · última vez {when}"
  - `times`: "visto {count}×"
- `videos`:
  - `title`: "Vídeos e reels que você assistiu"
  - `count`: "{count, plural, one {# assistido} other {# assistidos}} · {duration}"
  - `kind.video`: "Vídeo"
  - `kind.reel`: "Reel"
  - `line`: "{kind} · {community}"
  - `watched`: "{watched} de {duration} · {plays}×"
- `stories`:
  - `title`: "Stories que você viu"
  - `count`: "{count, plural, one {# story} other {# stories}}"

**`member.activity.seen`:**
- `postsUnit`: "{count, plural, one {post} other {posts}}"
- `postsViews`: "{count, plural, one {# visualização} other {# visualizações}}"

**Root:**
- `durationSeconds`: "{minutes, plural, =0 {{seconds} s} other {# min{seconds, plural, =0 {} other { # s}}}}"
  - 130 gives "2 min 10 s", 252 gives "4 min 12 s", 45 gives "45 s", 180 gives "3 min".
- `notMeasuredReason.needs_story_view_time`: "Precisa registrar quanto tempo cada story fica na tela"

Reused: `member.activity.period` ("Últimos 7 dias") and `member.activity.example` ("exemplo").
</copy_contract>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer — the Curtidas card opens its list and "Voltar" returns (one path through every layer)</name>
  <files>packages/modules/dashboard/fixtures/member-lists.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/ui/KpiCard.tsx, packages/modules/dashboard/tests/member-lists.test.ts, packages/modules/dashboard/tests/kpi-card.test.tsx, apps/web/lib/dashboard-preview.ts, apps/web/lib/dashboard-preview.test.ts, apps/web/app/painel-preview/[nivel]/page.tsx, apps/web/components/dashboard/MemberPanel.tsx, apps/web/components/dashboard/MemberActivity.tsx, apps/web/components/dashboard/MemberActivityList.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - .planning/quick/261012-hqr-listas-detalhadas-ao-tocar-nas-metricas-/261012-hqr-CONTEXT.md (D-01..D-05)
    - apps/web/lib/dashboard-preview.ts and apps/web/lib/dashboard-preview.test.ts (the parseStaffFunctions pattern and its tests)
    - apps/web/components/dashboard/MemberActivity.tsx, MemberPanel.tsx, PanelSection.tsx
    - packages/modules/dashboard/ui/KpiCard.tsx and tests/kpi-card.test.tsx
    - packages/ui/src/primitives/Chip.tsx (the anchor plus focus-ring classes)
    - apps/web/e2e-preview/painel-preview.spec.ts lines 1-100 (helpers) and 733-822 (the member report test)
  </read_first>
  <behavior>
    - member-lists.test: `memberActivityLists.likes` is a MeasuredValue with 46 rows. Its `example` equals `memberPanel.activity.engagement.likes.example`, and its length equals `engagement.likes.value.count` (D-04).
    - member-lists.test: the likes are distinct post ids, all from the 60-post table. Per community they are VIP 25, Geral 15 and Eventos 6. They are sorted newest first (daysAgo asc, then time desc). Every `when` has daysAgo in 1..7.
    - member-lists.test: the post table has 60 distinct ids and 60 distinct excerpts, each at most 70 characters, with community counts VIP 30, Geral 20 and Eventos 10.
    - member-lists.test: `spreadMoments(n)` for n in 60, 46, 23, 12, 9 and 3 returns n moments, newest first, with daysAgo in 1..7. The output is deterministic: two calls are deep-equal.
    - member-lists.test (D-05): no string anywhere in `memberActivityLists` (walk every value) matches a person name used by other fixtures: João, Lia, Vieira, Rui, Matos.
    - kpi-card.test: `footer` renders after the note. Without `footer`, the rendered markup is identical to today's, so the existing tests stay green.
    - dashboard-preview.test: `parseMemberList({ lista: 'curtidas' })` returns 'curtidas'. It returns null for `{}`, `{ lista: '' }`, `{ lista: 'CURTIDAS' }`, `{ lista: 'xyz' }`, `{ lista: '__proto__' }` and `{ lista: ['curtidas', 'curtidas'] }`.
    - dashboard-preview.test: `memberListHref('curtidas')` returns '/painel-preview/membro?lista=curtidas#lista'; `memberReportHref('curtidas')` returns '/painel-preview/membro#atividade-curtidas'; `memberCardAnchor('curtidas')` returns 'atividade-curtidas'.
  </behavior>
  <action>
RED first. Write the behaviors above in a new `packages/modules/dashboard/tests/member-lists.test.ts`, in `tests/kpi-card.test.tsx`, and in `apps/web/lib/dashboard-preview.test.ts`. Run them and see them fail, then commit as `test(quick-261012-hqr): …`.

GREEN, module:
- Create `packages/modules/dashboard/fixtures/member-lists.ts`, following decisions 4, 5 and 7 and `<fixture_contract>`. It holds:
  - the exported row types from `<fixture_contract>` (likes needs `PostRef` and `LikedPost`);
  - the 60-row post table, typed with a doc comment on recency order and the community split;
  - `spreadMoments(count)` (pure, exported);
  - a `lastSeen` moment per post, equal to `spreadMoments(60)[i]`;
  - the likes builder (first 25 VIP, 15 Geral, 6 Eventos in table order, with `when` equal to the post's last-seen moment);
  - `export interface MemberActivityLists { likes: ReportValue<LikedPost[]> }`;
  - `export const memberActivityLists: MemberActivityLists` with likes `{ example: false, value }`.
- The file doc comment states:
  - that this is raw data shaped like the future list endpoints (no words, units or clock, per MOD-02);
  - the one-table rule from decision 4;
  - that the member sees only their own actions (D-05).
- Import `RelativeMoment` as a type from `./platform-panels` and `ReportValue` from `./shared`. Re-export the new names by name from `fixtures/index.ts`, following the existing pattern.
- In `ui/KpiCard.tsx`, add `footer?: ReactNode`, documented as "a last line under everything (e.g. the host's 'Ver lista' when it makes the card a link)". Render it last, after the chart, as `<div className="mt-1">` only when present (decision 3).

GREEN, web:
- In `lib/dashboard-preview.ts`, following decision 1 and the `parseStaffFunctions` style, add:
  - `MEMBER_LISTS = ['curtidas'] as const` and `type MemberListSlug`;
  - an `isMemberList` guard that uses `(MEMBER_LISTS as readonly unknown[]).includes`;
  - `parseMemberList(params)`;
  - `MEMBER_LIST_ANCHOR = 'lista'`;
  - `memberCardAnchor(slug)`, `memberListHref(slug)` and `memberReportHref(slug)`, built on `previewLevelPath('membro')`.
  - Its doc comment says the query is untrusted and only allow-listed constants reach markup or URLs.
- In `app/painel-preview/[nivel]/page.tsx`, change ONLY two things: the import list (add `parseMemberList`) and `membro: (query) => <MemberPanel list={parseMemberList(query)} />`. Do not touch `connection()`, `notFound()`, `generateMetadata` or anything else.
- In `MemberPanel.tsx`, take a `list: MemberListSlug | null` prop and update the doc comment.
  - The PanelHeader and the avatar/name row always render.
  - When `list` is set, render `<MemberActivityList slug={list} />` in place of "Para você" and `<MemberActivity />`. Otherwise keep today's body unchanged (D-02).
- Create `apps/web/components/dashboard/MemberActivityList.tsx`, an async server component `MemberActivityList({ slug })`.
  - It builds a view from `const VIEWS: Record<MemberListSlug, (t) => { title; count; example; rows }>`. Each row is `{ id, title, lines: string[], aside?, asideBadge? }`. In Task 1 only `curtidas` is built from `memberActivityLists.likes`:
    - row title = excerpt;
    - line = `member.lists.likes.line` with `community` and `when` = `momentText(t, row.when)`;
    - count = `member.lists.likes.count`;
    - example = `list.example`.
  - It renders a wrapper `div` with `id={MEMBER_LIST_ANCHOR}` and `className="flex scroll-mt-20 flex-col gap-3"`, containing:
    - An `<a href={memberReportHref(slug)}>` with `ChevronLeft` (`aria-hidden`) and `t('member.lists.back')`, styled `inline-flex min-h-11 w-fit items-center gap-1 text-sm font-bold text-brand` plus the Chip focus-ring classes.
    - `<PanelSection title={…} period={t('member.activity.period')} prominent>` containing:
      - a count line `<p className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">` with the count and, only when `example` is true, the same small neutral StatusPill as the peak line, with text `t('member.activity.example')`;
      - a `Card` holding a `<ul className="divide-y divide-border">` of `<li className="flex items-start justify-between gap-3 px-3 py-2.5">`;
      - each row: a left column `flex min-w-0 flex-col gap-0.5 [overflow-wrap:anywhere]` with the title in `text-sm font-semibold text-text` and each line in `text-xs text-text-secondary`;
      - an optional right aside `flex shrink-0 items-center gap-1.5 text-xs font-bold tabular-nums text-text` holding `aside` and, when `asideBadge` is set, that pill.
  - Rows are not links and have no chevron (D-02).
- In `MemberActivity.tsx`, add a local `ListLink({ slug, anchor = true, children })`. It renders `<a href={memberListHref(slug)} id={anchor ? memberCardAnchor(slug) : undefined}>` with the classes from decision 3. Add a local `seeList` node: `<span className="flex items-center gap-1 text-xs font-bold text-brand">{t('member.lists.seeList')}<ChevronRight aria-hidden size={14} /></span>`.
  - Wrap ONLY the Curtidas KpiCard in `ListLink slug="curtidas"` and pass `footer={seeList}`. Do this by giving `engagementCards` an optional slug, where only likes has one for now.
- Add the catalog keys `member.lists.back`, `member.lists.seeList` and `member.lists.likes.*` exactly as in `<copy_contract>`.

E2E (`painel-preview.spec.ts`):
- Add a typed `MEMBER_LIST_CASES` table with fields `{ slug, card, title, rows, count, listExample, rowExamples, sample? }`. Its first entry is `{ slug: 'curtidas', card: 'Curtidas', title: 'Posts que você curtiu', rows: 46, count: '46 curtidas', listExample: false, rowExamples: 0 }`.
- Add a loop test `membro: the ${card} card opens its list and Voltar returns`, at 390x844:
  1. Go to the report.
  2. Click the card's anchor (`kpiCard(page, card).locator('xpath=ancestor::a[1]')`).
  3. Expect the URL to match `/\?lista=${slug}#lista$/`.
  4. Expect the h3 title to be visible and in viewport, the count text to be visible, and `sectionTitled(page, title).getByRole('listitem')` to have count `rows`.
  5. Expect the page's exact-text 'exemplo' count to equal `(listExample ? 1 : 0) + rowExamples`, and the `sample` text to be visible when given.
  6. Expect the headings 'Para você' and 'Sua atividade' to have count 0, and no 'Precisa registrar' or 'Ainda não medido'.
  7. Click the 'Voltar' link. Expect the URL to end with `#atividade-${slug}`, the 'Sua atividade' h3 to be visible, and the card to be in viewport.
- Add a test `membro: an unknown lista falls back to the report`. For `?lista=xyz`, `?lista=`, `?lista=CURTIDAS` and `?lista=curtidas&lista=curtidas`, expect the 'Sua atividade' h3 to be visible and the 'Voltar' link to have count 0.
- Add a test `membro: only the list cards are links`, with an expected-labels array of `['Curtidas']`, which later tasks extend. On the report:
  - `[data-phone-screen] a[href*="?lista="]` has count equal to the labels' length;
  - each label's card has an `a` ancestor;
  - the exact text 'Ver lista' has count equal to the labels' length;
  - 'Média por dia', 'Presença nos encontros' and 'Sequência' have no `a` ancestor;
  - the 'Onde você mais participa' section contains no `a`.
- Add a test `membro: list links are keyboard-focusable with a visible ring`, at 390. Call `.focus()` on the Curtidas card link and assert it is focused, `matches(':focus-visible')` is true, and the computed `box-shadow` is not 'none'. Then navigate to `?lista=curtidas` and assert the same for 'Voltar'.
- Add a test `membro: a list scrolls inside the phone at 1440x900`:
  1. Click the Curtidas card link inside the phone.
  2. Expect the title to be in viewport.
  3. Expect `screenMetrics` to show scrollWidth ≤ clientWidth and scrollHeight > clientHeight.
  4. `scrollBy(0, 300)` on the screen should give screen scrollTop > 0 and `window.scrollY` = 0.
  5. Click 'Voltar' and expect the Curtidas card to be in viewport.
- Add a loop over `MEMBER_LIST_CASES` × `PHONE_WIDTHS`: `membro ?lista=${slug} at ${width}px: no horizontal scroll`, with `horizontalOverflow` scrollWidth ≤ clientWidth.

Then run the verify command. It ends with Playwright `-g "membro"`, which is the tracer gate. Do not start Task 2 until it is green. Commit as `feat(quick-261012-hqr): …`.
  </action>
  <verify>
    <automated>set -e; cd "/Users/macos/Desktop/rede social/rede-social"; export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder; pnpm --filter @rede-social/module-dashboard test; pnpm --filter @rede-social/module-dashboard typecheck; pnpm --filter @rede-social/module-dashboard lint; pnpm --filter @rede-social/web exec vitest run lib/dashboard-preview.test.ts; pnpm --filter @rede-social/web typecheck; pnpm --filter @rede-social/web lint; bash scripts/check-ui-literals.sh; node -e "const d=require('./apps/web/messages/pt-BR/dashboard.json').dashboard.member.lists; const eq=[[d?.back,'Voltar'],[d?.seeList,'Ver lista'],[d?.likes?.title,'Posts que você curtiu'],[d?.likes?.line,'{community} · curtido {when}']]; for (const [a,b] of eq) if (a!==b) throw new Error('catalog: '+a); console.log('catalog OK')"; node -e "const s=require('fs').readFileSync('apps/web/app/painel-preview/[nivel]/page.tsx','utf8'); const a=s.indexOf('await connection();'); const b=s.indexOf('if (!dashboardPreviewEnabled()) notFound();',a); if(a<0||b<0) throw new Error('gate'); if(!s.includes('parseMemberList(query)')) throw new Error('wiring'); console.log('gate OK')"; git diff --quiet 80a489ff -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx; PIDS=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t || true); if [ -n "$PIDS" ]; then kill $PIDS; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts -g "membro"</automated>
  </verify>
  <done>
- The RED test commit precedes the GREEN feat commit.
- Tapping Curtidas at 390 and inside the 1440 phone opens `?lista=curtidas#lista` with 46 rows, a title, "Últimos 7 dias", "46 curtidas" and no "exemplo".
- "Voltar" lands on the Curtidas card.
- Unknown `lista` values render the report.
- The links focus with a visible ring.
- There is no horizontal scroll at 360, 390 or 430.
- The gate is intact, and Playwright `-g "membro"` is green.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Comentários, Salvamentos, Compartilhamentos and Stories vistos lists (per-row "exemplo" on story time)</name>
  <files>packages/modules/dashboard/fixtures/member-lists.ts, packages/modules/dashboard/fixtures/shared.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/tests/member-lists.test.ts, apps/web/lib/dashboard-preview.ts, apps/web/lib/dashboard-preview.test.ts, apps/web/components/dashboard/MemberActivity.tsx, apps/web/components/dashboard/MemberActivityList.tsx, apps/web/components/dashboard/format.ts, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - packages/modules/dashboard/fixtures/member-lists.ts (as left by Task 1)
    - apps/web/components/dashboard/MemberActivityList.tsx (as left by Task 1)
    - packages/modules/dashboard/fixtures/shared.ts (NotMeasuredReason)
    - apps/web/messages/pt-BR/dashboard.json (`notMeasuredReason` block)
  </read_first>
  <behavior>
    - comments: 12 rows, measured, `example` equals that of `engagement.comments`. The posts are distinct and from the table: VIP 6, Geral 4, Eventos 2. Each row's `when` equals its post's last-seen moment, sorted newest first. The texts are at most 90 characters.
    - For each `byCommunity` row, likes in that community + comments in that community = `interactions` (31, 19, 8) (D-03, D-04).
    - saves: 9 rows, example with reason `needs_saves`, ids p03, p10, p17, p24, p31, p38, p45, p52, p59 (table indices 2..58 step 7), newest first.
    - shares: 3 rows, example with reason `needs_shares`, at indices 5, 25 and 45, with `via` link, native and link, newest first.
    - stories: 23 rows. The list is measured and agrees with `seen.stories` (count and example flag). Every author is either `previewTenant.displayName` or one of the 3 community names. Every `seconds` is an ExampleValue with reason `needs_story_view_time` and a value in 5..15. The rows are newest first.
    - parseMemberList accepts comentarios, salvamentos, compartilhamentos and stories, and MEMBER_LISTS keeps canonical order.
  </behavior>
  <action>
RED: extend `tests/member-lists.test.ts` and `apps/web/lib/dashboard-preview.test.ts` with the behaviors above. They must fail, then commit as `test(quick-261012-hqr): …`.

GREEN, module:
- In `fixtures/shared.ts`, add `'needs_story_view_time'` to `NotMeasuredReason`.
- In `member-lists.ts`, add the following, per decisions 7 and 9 and `<fixture_contract>`:
  - the 12 hand-written comment pairs (D-05: own voice, no names, each text matching its post);
  - the comments, saves, shares and stories builders;
  - the `OwnComment`, `SavedPost`, `SharedPost` and `SeenStory` types.
- Extend `MemberActivityLists` and `memberActivityLists`:
  - comments: measured;
  - saves: `{ example: true, reason: 'needs_saves', value }`;
  - shares: `{ example: true, reason: 'needs_shares', value }`;
  - stories: measured, with per-row `seconds`.
- A doc comment on `SeenStory` states the rule: the list is real (`story_views`), and only the time per story is example.
- Re-export the new types from `fixtures/index.ts`.

GREEN, web:
- Extend `MEMBER_LISTS` in canonical order to curtidas, comentarios, salvamentos, compartilhamentos and stories, leaving room for posts-vistos and videos before stories in Task 3.
- In `MemberActivityList.tsx`, add these VIEWS, per `<copy_contract>` and decision 11:
  - comentarios: row title `member.lists.comments.text`; lines `member.lists.comments.on` with the post excerpt, then `member.lists.comments.line`.
  - salvamentos: line `member.lists.saves.line`.
  - compartilhamentos: line `member.lists.shares.line` with `via` = `t('member.lists.shares.via.' + row.via)`.
  - stories:
    - row title = author, line = `momentText(t, row.when)`;
    - aside = `formatMinutesSeconds(t, row.seconds.value)`;
    - `asideBadge` = the "exemplo" text ONLY when `row.seconds.example` (derived per row, never positional);
    - list `example` = `list.example` (false).
  - Their count keys.
- In `format.ts`, add `formatMinutesSeconds(t, seconds)`. It calls `t('durationSeconds', { minutes: Math.floor(seconds / 60), seconds: seconds % 60 })`, with a doc comment giving the examples from `<copy_contract>`. Task 3 reuses it for the video rows.
- In `MemberActivity.tsx`, give comments, saves and shares a slug and wrap them in `ListLink` with the `seeList` footer. Wrap the 'Stories vistos' card in `ListLink slug="stories"`.
- Catalog: add `member.lists.comments.*`, `saves.*`, `shares.*`, `stories.*`, root `durationSeconds`, and `notMeasuredReason.needs_story_view_time`, exactly as in `<copy_contract>`.

E2E:
- Append the following to `MEMBER_LIST_CASES`:
  - comentarios: 'Comentários' / 'Seus comentários' / 12 / '12 comentários' / no list example / 0 row examples.
  - salvamentos: 'Salvamentos' / 'Posts que você salvou' / 9 / '9 salvamentos' / list example / 0.
  - compartilhamentos: 'Compartilhamentos' / 'Posts que você compartilhou' / 3 / '3 compartilhamentos' / list example / 0 / sample 'Link copiado'.
  - stories: 'Stories vistos' / 'Stories que você viu' / 23 / '23 stories' / no list example / rowExamples 23 / sample 'Dr. Igor Alves'.
- Extend the expected link labels with 'Comentários', 'Salvamentos', 'Compartilhamentos' and 'Stories vistos'.
- In the stories case, also assert that no row text contains João, Lia, Vieira or Rui.

Run the verify command. Commit as `feat(quick-261012-hqr): …`.
  </action>
  <verify>
    <automated>set -e; cd "/Users/macos/Desktop/rede social/rede-social"; export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder; pnpm --filter @rede-social/module-dashboard test; pnpm --filter @rede-social/module-dashboard typecheck; pnpm --filter @rede-social/module-dashboard lint; pnpm --filter @rede-social/web exec vitest run lib/dashboard-preview.test.ts; pnpm --filter @rede-social/web typecheck; pnpm --filter @rede-social/web lint; bash scripts/check-ui-literals.sh; node -e "const r=require('./apps/web/messages/pt-BR/dashboard.json').dashboard; const d=r.member.lists; const eq=[[d?.shares?.via?.link,'Link copiado'],[d?.shares?.via?.native,'Compartilhado pelo celular'],[d?.comments?.on,'Em “{post}”'],[d?.stories?.title,'Stories que você viu'],[typeof r.notMeasuredReason?.needs_story_view_time,'string'],[typeof r.durationSeconds,'string']]; for (const [a,b] of eq) if (a!==b) throw new Error('catalog: '+a); console.log('catalog OK')"; PIDS=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t || true); if [ -n "$PIDS" ]; then kill $PIDS; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts -g "membro"</automated>
  </verify>
  <done>
- Comentários (12), Salvamentos (9, "exemplo" on the header), Compartilhamentos (3, "exemplo" on the header) and Stories vistos (23, one "exemplo" per row next to the time, none on the header) open from their cards and return with "Voltar".
- Likes + comments per community equal 31/19/8 in the unit test.
- 5 card links, each with "Ver lista".
- Playwright `-g "membro"` is green.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Posts vistos (60 posts, 128 views) and Vídeos e reels (41, 72 min) lists, sum helpers, README, full gates and screenshots</name>
  <files>packages/modules/dashboard/fixtures/member-lists.ts, packages/modules/dashboard/fixtures/tenant-panels.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/ui/metrics.ts, packages/modules/dashboard/ui/index.ts, packages/modules/dashboard/tests/member-lists.test.ts, packages/modules/dashboard/tests/metrics.test.ts, packages/modules/dashboard/README.md, apps/web/lib/dashboard-preview.ts, apps/web/lib/dashboard-preview.test.ts, apps/web/components/dashboard/MemberActivity.tsx, apps/web/components/dashboard/MemberActivityList.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - packages/modules/dashboard/fixtures/member-lists.ts (as left by Task 2)
    - packages/modules/dashboard/fixtures/tenant-panels.ts lines 490-640 (MemberPanel.activity, memberPanel.activity.seen)
    - packages/modules/dashboard/ui/metrics.ts (totalMinutes pattern) and tests/metrics.test.ts
    - packages/modules/dashboard/README.md "Member report (level 7)"
    - apps/web/e2e-preview/painel-preview.spec.ts 'membro: Sua atividade report' (seenValues)
  </read_first>
  <behavior>
    - metrics.test: `totalViews([])` is 0, and `totalViews([{views:2},{views:3}])` is 5. `totalWatchedSeconds([])` is 0, and `totalWatchedSeconds([{watchedSeconds:130},{watchedSeconds:20}])` is 150.
    - member-lists.test (D-04): posts has 60 rows. `totalViews(posts)` is 128, which equals `seen.posts.value.views`, and the length equals `seen.posts.value.posts` (60). The list is sorted by views desc, with ties in recency order. Every views value is ≥ 1. Every post id is from the table, and each appears once. The example flag equals that of `seen.posts`, with reason `needs_post_views`.
    - member-lists.test (D-04): videos has 41 rows, which equals `seen.videos.value.count`. `totalWatchedSeconds(videos)` is 4320, which equals `seen.videos.value.minutes` × 60. Every row has 0 < watched ≤ duration × plays. The watched values never increase down the list. There are 16 `video` and 25 `reel`, and one row has duration 252, plays 2 and watched 130. The example flag equals that of `seen.videos`, with reason `needs_video_playback`.
    - member-lists.test: every saved, shared, liked and commented post id is also in the viewed posts list (you only act on what you saw).
    - member-lists.test: the exact example set of lists is {saves, shares, posts, videos}; the measured set is {likes, comments, stories}.
    - parseMemberList accepts posts-vistos and videos. The final MEMBER_LISTS equals the 7 slugs in canonical order.
  </behavior>
  <action>
RED: extend `tests/metrics.test.ts`, `tests/member-lists.test.ts` and `apps/web/lib/dashboard-preview.test.ts` with the behaviors above. They must fail, then commit as `test(quick-261012-hqr): …`.

GREEN, module:
- In `ui/metrics.ts`, add `totalViews(rows: readonly { views: number }[])` and `totalWatchedSeconds(rows: readonly { watchedSeconds: number }[])` as pure sums, documented in the existing style. Export them by name from `ui/index.ts` (D-04).
- In `member-lists.ts`, per decisions 6 and 8 and `<fixture_contract>`, add:
  - `VIEW_COUNTS`, expanded from the distribution;
  - the viewed-posts builder: `views = VIEW_COUNTS[(i * 7) % 60]`, `lastSeen` = the post's moment, then a stable sort by views desc with recency kept for ties;
  - the 41-row video table, written in the exact given order with distinct titles, at most 50 characters;
  - the `ViewedPost` and `WatchedVideo` types;
  - posts as `{ example: true, reason: 'needs_post_views', value }` and videos as `{ example: true, reason: 'needs_video_playback', value }`.
  - Re-export the new types.
- In `tenant-panels.ts`, reshape `MemberPanel.activity.seen.posts` to `ReportValue<{ posts: number; views: number }>` with `{ example: true, reason: 'needs_post_views', value: { posts: 60, views: 128 } }` (decision 10). Update its doc comment.
  - If any existing test or component reads `seen.posts.value` as a number, update it. `MemberActivity` does, and the fixtures test walker does not need to change.

GREEN, web:
- Final `MEMBER_LISTS`: curtidas, comentarios, salvamentos, compartilhamentos, posts-vistos, videos, stories.
- In `MemberActivity.tsx`, the 'Posts vistos' card shows:
  - value `formatCount(seen.posts.value.posts)`;
  - unit `t('member.activity.seen.postsUnit', { count })`;
  - note `t('member.activity.seen.postsViews', { count: formatCount(views) })`. The ICU `#` formats the raw number, so pass the number and let ICU format it, as `videosUnit` does;
  - the pill from `seen.posts`;
  - wrapped in `ListLink slug="posts-vistos"` with the footer.
- Wrap 'Vídeos e reels' in `ListLink slug="videos"` (with the anchor). Wrap 'Tempo em vídeos e reels' in `ListLink slug="videos" anchor={false}`, which has no id and so keeps ids unique. Both get the footer (D-01).
- In `MemberActivityList.tsx`, add these VIEWS:
  - posts-vistos:
    - row title excerpt, line `member.lists.posts.line` with `when` = `momentText(t, row.lastSeen)`, aside `member.lists.posts.times`;
    - count `member.lists.posts.count` with `posts` = rows length and `views` = `totalViews(rows)`.
  - videos:
    - row title = title;
    - lines `member.lists.videos.line` with `kind` = `t('member.lists.videos.kind.' + row.kind)`, then `member.lists.videos.watched` with `watched` = `formatMinutesSeconds(t, row.watchedSeconds)`, `duration` = `formatMinutesSeconds(t, row.durationSeconds)` and `plays`;
    - count `member.lists.videos.count` with `count` = rows length and `duration` = `formatHoursMinutes(t, totalWatchedSeconds(rows) / 60)`. Assert in the module test that the sum is a whole number of minutes, so no rounding is needed.
- Catalog: add `member.lists.posts.*`, `member.lists.videos.*`, `member.activity.seen.postsUnit` and `member.activity.seen.postsViews`, per `<copy_contract>`.

E2E:
- Append to `MEMBER_LIST_CASES`:
  - posts-vistos: 'Posts vistos' / 'Posts que você viu' / 60 / '60 posts · 128 visualizações' / list example / 0 / sample 'visto 6×'.
  - videos: 'Vídeos e reels' / 'Vídeos e reels que você assistiu' / 41 / '41 assistidos · 1 h 12 min' / list example / 0 / sample '2 min 10 s de 4 min 12 s · 2×'.
- Add a check that clicking the 'Tempo em vídeos e reels' card also lands on `?lista=videos#lista`.
- Extend the expected link labels to 8 by adding 'Posts vistos', 'Vídeos e reels' and 'Tempo em vídeos e reels'.
- In 'membro: Sua atividade report', replace `['Posts vistos', '128']` with assertions that the Posts vistos card contains '60' and '128 visualizações'. The 7-pill count stays.
- Add a framed 1440x900 loop over all `MEMBER_LIST_CASES`. Go to `/painel-preview/membro?lista=${slug}` and assert:
  - the screen's scrollWidth ≤ clientWidth;
  - the page scrollWidth ≤ clientWidth;
  - the page scrollHeight ≤ clientHeight + 1.

README: under "Member report (level 7)", add a short "Drill-down lists" subsection. It names:
- the `memberActivityLists` export;
- the one-table rule;
- the exemplo rule (the pill sits next to the example value it marks: list header vs. per-row story time);
- the `?lista=` slugs;
- a table row "Tempo por story | none | Time each story stays on screen (`needs_story_view_time`)".

Screenshots (not committed):
- Write a TEMPORARY spec `apps/web/e2e-preview/zz-screens.tmp.spec.ts` that captures, for the report and for the curtidas, posts-vistos, videos and stories lists:
  - a framed 1440x900 light shot, after `networkidle` + 400 ms. For the report, scroll the phone screen so "Sua atividade" sits at the top. Lists open at their `#lista` fragment;
  - a 390 full-page shot.
- Save them into `.planning/quick/261012-hqr-listas-detalhadas-ao-tocar-nas-metricas-/screens/` with names like `membro-report-1440-light.png` and `membro-curtidas-390-full.png` (10 PNGs).
- Run it, look at every image (check the pills, the chevrons only on the 8 cards, nothing clipped, and the rows readable), then DELETE the temp spec.
- Check `apps/web/e2e-preview/` and the touched dirs for iCloud " 2" copies.

Finally run the full verify command. Commit as `feat(quick-261012-hqr): …` and `docs(quick-261012-hqr): …`. The executor cannot launch subagents, so the SUMMARY's `**⚠️ NÃO FEITO**` block names critic and flow-critic for the orchestrator.
  </action>
  <verify>
    <automated>set -e; cd "/Users/macos/Desktop/rede social/rede-social"; export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder; pnpm lint; pnpm typecheck; pnpm test; pnpm boundaries; pnpm check:static-routes; node -e "const r=require('./apps/web/messages/pt-BR/dashboard.json').dashboard; const d=r.member.lists; const eq=[[d?.posts?.times,'visto {count}×'],[d?.videos?.watched,'{watched} de {duration} · {plays}×'],[d?.videos?.title,'Vídeos e reels que você assistiu'],[typeof r.member.activity.seen.postsViews,'string'],[typeof r.member.activity.seen.postsUnit,'string']]; for (const [a,b] of eq) if (a!==b) throw new Error('catalog: '+a); console.log('catalog OK')"; node -e "const s=require('fs').readFileSync('apps/web/app/painel-preview/[nivel]/page.tsx','utf8'); const a=s.indexOf('await connection();'); const b=s.indexOf('if (!dashboardPreviewEnabled()) notFound();',a); if(a<0||b<0) throw new Error('gate'); console.log('gate OK')"; git diff --quiet 80a489ff -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx; PIDS=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t || true); if [ -n "$PIDS" ]; then kill $PIDS; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts; test ! -e apps/web/e2e-preview/zz-screens.tmp.spec.ts; test -z "$(find apps/web/e2e-preview apps/web/components/dashboard apps/web/lib apps/web/messages packages/modules/dashboard -name '* 2*' -not -path '*/node_modules/*')"; test "$(ls .planning/quick/261012-hqr-listas-detalhadas-ao-tocar-nas-metricas-/screens/*.png | wc -l | tr -d ' ')" -ge 10; grep -q 'needs_story_view_time' packages/modules/dashboard/README.md; grep -q 'memberActivityLists' packages/modules/dashboard/README.md</automated>
  </verify>
  <done>
- All 7 lists open from their 8 cards, and "Voltar" returns to the right card.
- Posts vistos reads 60 posts, 128 visualizações, with 60 rows. Vídeos reads 41 assistidos, 1 h 12 min, with 41 rows and the sample row.
- The D-04 unit tests are green.
- The full gates are green: lint, typecheck, test, boundaries, check:static-routes and the full preview Playwright suite.
- 10 screenshots were inspected, the temp spec is deleted, and there are no " 2" copies.
- The README is updated and the gate is intact.
- The SUMMARY records decisions 1-12, the exemplo rule, the two wording adjustments, the real command output, and the `**⚠️ NÃO FEITO**` block.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser query string → `/painel-preview/membro` page | `lista` is untrusted input selecting which list renders |
| member list fixtures → level-7 HTML | Only the member's own actions plus creator/community names cross into the page |
| Dev-only gate (`proxy.ts`, preview layout/page guards) | Unchanged; the page's PANELS entry gains one argument |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-hqr-01 | Tampering / injection (reflected query) | `parseMemberList`, `memberListHref`, `memberReportHref` | medium | mitigate | `lista` is checked with `includes` against the `MEMBER_LISTS` const tuple, and only the matched constant is used. Arrays, empty strings, wrong case and prototype keys all return null, which renders the report. Unit tests pin these cases, and the e2e asserts the fallback. Nothing from the raw query reaches markup, ids or hrefs |
| T-hqr-02 | Information disclosure (other members' data) | `memberActivityLists`, `MemberActivityList.tsx` | medium | mitigate | Rows hold only the member's own actions. Story authors are restricted to `previewTenant.displayName` or the 3 community names. A module test walks every string against the other fixtures' person names, and the e2e repeats that on the stories list (D-05) |
| T-hqr-03 | Spoofing (fictional data read as real) | Example lists, story seconds | medium | mitigate | `example: true` is required by `ReportValue`. The pills are derived from `list.example` or `row.seconds.example`. Unit tests pin the exact example set, and the e2e pins the pill count per list |
| T-hqr-04 | Information disclosure (internal collection notes) | `reason` on ExampleValue (incl. `needs_story_view_time`) | low | mitigate | `reason` is never rendered on level 7. The e2e asserts no 'Precisa registrar' and no 'Ainda não medido' on every list |
| T-hqr-05 | Information disclosure (preview in production) | `app/painel-preview/[nivel]/page.tsx` gate | medium | mitigate | Only the PANELS entry and one import change. The verify checks that `await connection();` precedes `if (!dashboardPreviewEnabled()) notFound();`, and that `proxy.ts` and `layout.tsx` are unchanged since 80a489ff. `pnpm test` re-runs the gate tests, and `check:static-routes` stays green |
| T-hqr-06 | Tampering (markup injection) | Fixture strings | low | accept | Repo-static data rendered as React text nodes. There is no raw-HTML API, and Biome plus check-ui-literals run in every task |
</threat_model>

<verification>
- Task 1 (tracer gate):
  - module tests (RED then GREEN), typecheck and lint;
  - the web lib unit test, web typecheck and lint;
  - check-ui-literals and the catalog check;
  - the gate check;
  - Playwright `-g "membro"`: the Curtidas list at 390 and inside the 1440 phone, Voltar, the fallback, focus, and no horizontal scroll at 360/390/430.
- Task 2: the same set, with the comments, saves, shares and stories cases in the data-driven e2e loop.
- Task 3:
  - `pnpm lint` (incl. check-ui-literals), `pnpm typecheck`, `pnpm test`, `pnpm boundaries` and `pnpm check:static-routes`, with the placeholder env;
  - the catalog and gate checks;
  - the FULL preview Playwright suite;
  - 10 screenshots, no temp spec, no " 2" copies, and the README content.
- Before every Playwright run, stop ONLY the :3000 listener (`lsof -nP -iTCP:3000 -sTCP:LISTEN -t`), never Chrome helpers.
</verification>

<success_criteria>
- D-01: exactly the 8 named cards open a list; Tempo de uso, communities and Presença do not.
- D-02:
  - each list is a server-rendered screen at `?lista=<allow-listed slug>`, with Voltar, title, period, count and exemplo where due;
  - unknown values fall back to the report;
  - keyboard focus is visible;
  - lists scroll vertically inside the phone;
  - chevrons appear only on list cards.
- D-03 / D-04: the lists match the report:
  - 46 / 12 / 9 / 3;
  - 60 posts summing to 128 views, with the KPI at 60 and "128 visualizações";
  - 41 videos summing to 72 min;
  - 23 stories;
  - likes + comments per community = 31 / 19 / 8.
  All of this is proven by unit tests.
- D-05: the tone is consistent with the Igor Alves fixtures, and no other member's name appears.
- All gates are green, with the command output quoted in the SUMMARY.
- The SUMMARY:
  - lists Planner decisions 1-12 as applied;
  - states the exemplo rule (header pill for an all-example list, per-row pill on story time);
  - names the 10 screenshots;
  - ends with a `**⚠️ NÃO FEITO**` block naming the critic and flow-critic reviews (the orchestrator runs them on this task's commits) and anything else left undone.
</success_criteria>

<output>
Create `.planning/quick/261012-hqr-listas-detalhadas-ao-tocar-nas-metricas-/261012-hqr-SUMMARY.md` when done.
</output>
