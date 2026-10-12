---
phase: quick-261012-hqr
plan: 01
status: complete
subsystem: dashboard-preview (level 7, member report)
tags: [dashboard, preview, member, report, drill-down, next-intl, pt-BR]
requires: [quick-261012-h5t]
provides:
  - memberActivityLists fixture (7 typed lists, ReportValue per list)
  - KpiCard footer slot
  - parseMemberList / memberListHref / memberReportHref / memberCardAnchor
  - MemberActivityList screen
affects: [apps/web /painel-preview/membro]
tech-stack:
  added: []
  patterns:
    - allow-listed query slug -> server-rendered sub-screen (same as parseStaffFunctions)
    - plain <a href> + fragment anchors, no client JS
key-files:
  created:
    - packages/modules/dashboard/fixtures/member-lists.ts
    - packages/modules/dashboard/tests/member-lists.test.ts
    - apps/web/components/dashboard/MemberActivityList.tsx
  modified:
    - packages/modules/dashboard/fixtures/{index,shared,tenant-panels}.ts
    - packages/modules/dashboard/ui/{KpiCard.tsx,metrics.ts,index.ts}
    - packages/modules/dashboard/tests/{kpi-card.test.tsx,metrics.test.ts}
    - packages/modules/dashboard/README.md
    - apps/web/lib/dashboard-preview.ts (+ .test.ts)
    - apps/web/app/painel-preview/[nivel]/page.tsx (PANELS.membro + one import only)
    - apps/web/components/dashboard/{MemberPanel,MemberActivity}.tsx, format.ts
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "Exemplo rule: the pill sits next to the example value it marks — one header pill on an all-example list (saves, shares, posts-vistos, videos), none on curtidas/comentarios, one pill per row on the story time (stories list is measured)"
  - "Wording: 'visto N×' (agrees with masculine 'post'); 'Compartilhado pelo celular' instead of 'Compartilhamento nativo'"
  - "Links stay plain <a href>: fragment scroll reaches inside the phone's scroll container in Chrome, so the next/link fallback was not needed"
metrics:
  duration: 12min
  completed: 2026-10-12
  tasks: 3
  files: 20
actuals:
  tokens: 19800
  tasks: 3
  commits: 7
---

# Quick 261012-hqr Plan 01: Drill-down lists behind the member report Summary

Eight "Sua atividade" cards on `/painel-preview/membro` now open server-rendered lists at `?lista=<allow-listed slug>` (likes 46, comments 12, saves 9, shares 3, viewed posts 60 / 128 views, videos 41 / 72 min, stories 23). The lists are built from a single deterministic 60-post table, and unit tests prove they agree with the report numbers.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 RED | 91445857 | test: failing tests for the Curtidas drill-down list |
| 1 GREEN (tracer) | 0d782784 | feat: the Curtidas card opens the list of liked posts |
| 2 RED | 8dd8c387 | test: failing tests for the comments, saves, shares and stories lists |
| 2 GREEN | 3aac975c | feat: comments, saves, shares and stories open their lists |
| 3 RED | 8cc4f3c1 | test: failing tests for the viewed-posts and videos lists |
| 3 GREEN | ca2d57a6 | feat: viewed posts and watched videos open their lists |
| 3 docs | 4d05a47b | docs: document the member report's drill-down lists |

## Planner decisions as applied

1. **URL slugs.** `MEMBER_LISTS` = curtidas, comentarios, salvamentos, compartilhamentos, posts-vistos, videos, stories (canonical order, grown task by task). `parseMemberList` returns a slug only when `lista` is a single string that exactly matches. The `Record<MemberListSlug, …>` VIEWS map makes a slug without a view fail typecheck.
2. **Plain `<a href>` links.** Open: `/painel-preview/membro?lista=<slug>#lista`. Voltar: `/painel-preview/membro#atividade-<slug>`. Both targets carry `scroll-mt-20`. Chrome's fragment scroll reached inside the phone's scroll container (the e2e at 1440x900 is green), so the `next/link` fallback was not used.
3. **Tappable affordance.** `KpiCard.footer?: ReactNode` renders last in `<div className="mt-1">`, and only when present, so cards without it are unchanged (unit test). The whole card is an `<a>` with `grid rounded-xl scroll-mt-20` plus the Chip focus ring. Only the 8 list cards get "Ver lista" with `ChevronRight`.
4. **One post table.** `memberPostTable` holds 60 posts in recency order (VIP 30, Geral 20, Eventos 10, interleaved). Likes, comments, saves and shares use each post's last-seen moment, and a unit test checks that every acted-on post is also in the viewed list.
5. **Moments.** `spreadMoments(count)` puts item i on day `1 + floor(i*7/count)` with the j-th item of a day at `TIMES[j]`. It is pure and deterministic, and returns days 1..7 only.
6. **Views.** `VIEW_COUNTS` = 1×6, 2×5, 4×4, 8×3, 27×2, 18×1. Post i gets `VIEW_COUNTS[(i*7)%60]` and the list is stable-sorted by views desc. Sum = 128 (tested).
7. **Likes/comments/saves/shares.** Likes are the first 25 VIP, 15 Geral and 6 Eventos posts. Comments are 12 hand-written pairs (6/4/2) on p01, p02, p04, p05, p11, p14, p25, p31, p32, p34, p45, p56. Likes + comments per community = 31/19/8 (tested). Saves are p03, p10 … p59 (i%7==2). Shares are p06/link, p26/native, p46/link.
8. **Videos.** The 41 rows are written in the given order (16 videos, 25 reels), sum 4320 s = 72 min. Every row satisfies 0 < watched ≤ duration×plays. The D-03 sample row is v11 "Aula 12: prioridades da semana" (252 s, 2 plays, 130 s).
9. **Stories.** 23 rows with `when = spreadMoments(23)[i]`. Authors are "Dr. Igor Alves", or a community when i%4==3. `seconds` is an `ExampleValue` 5..15 s with the new reason `needs_story_view_time`. The list itself is a `MeasuredValue`.
10. **Posts vistos KPI.** `seen.posts` is now `ReportValue<{ posts: 60; views: 128 }>`. The card reads "60 posts" with the note "128 visualizações" and keeps its pill. The report still shows exactly 7 "exemplo" pills (e2e).
11. **Wording.** "visto N×" (not "vista") and "Compartilhado pelo celular" (not "Compartilhamento nativo").
12. **Copy.** All strings follow `<copy_contract>` and live in `dashboard.json`. Rows are not links and have no chevron.

**Exemplo rule (D-03 choice):** the pill sits next to the example value it marks. All-example lists (salvamentos, compartilhamentos, posts-vistos, videos) get one pill next to the count. Curtidas and comentarios get none. Stories gets none on the header and one per row next to that row's time. The pills come from `list.example` / `row.seconds.example` and never from a row's position.

## Verification (real output)

- `pnpm lint` → turbo 16/16 successful; `check-ui-literals: OK` (both lines). Exit 0.
- `pnpm typecheck` → `Tasks: 18 successful, 18 total`. Exit 0.
- `pnpm test` → `Tasks: 15 successful`; module-dashboard `Tests 147 passed (147)`; web `Tests 2394 passed (2394)`. Exit 0.
- `pnpm boundaries` → `Checked 1272 files in 16 packages, no issues found`.
- `pnpm check:static-routes` → `guarded routes checked: 74, offenders: 0 … OK`.
- Catalog checks (Tasks 1–3) → `catalog OK`. Gate check → `gate OK`. `git diff --quiet 80a489ff -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx` → unchanged.
- Tracer gate (Task 1): Playwright `-g "membro"` → `14 passed`. Task 2 → `30 passed`. Task 3 → `46 passed`.
- Full preview Playwright suite → `94 passed (1.0m)`.
- Temp spec deleted. `find … -name '* 2*'` over the touched dirs returned nothing.

## Screenshots (not committed)

In `.planning/quick/261012-hqr-listas-detalhadas-ao-tocar-nas-metricas-/screens/`: `membro-report-1440-light.png`, `membro-report-390-full.png`, `membro-curtidas-1440-light.png`, `membro-curtidas-390-full.png`, `membro-posts-vistos-1440-light.png`, `membro-posts-vistos-390-full.png`, `membro-videos-1440-light.png`, `membro-videos-390-full.png`, `membro-stories-1440-light.png`, `membro-stories-390-full.png`. I looked at each one: "Ver lista" appears on exactly the 8 cards, the pills sit where the rule says, nothing is clipped, and long titles wrap.

## Deviations from Plan

- **Tracer checkpoint.** Auto mode is off, so the agent protocol would stop for a human checkpoint after the tracer. The orchestrator asked for all tasks, and the plan defines the tracer gate as the automated `-g "membro"` run. That run was green (14/14) before Task 2 started.
- **Minor additions.**
  - The Voltar link gets `rounded-md` so its focus ring has rounded corners.
  - `MemberCommunity` is an exported union type for the three community names.
  - The `stories` field is typed `MeasuredValue<SeenStory[]>` rather than the wider `ReportValue`. This matches the contract's "stories is MeasuredValue".
- Nothing else changed: no Rule 1–4 fixes were needed.

## Known Stubs

None. Every list is wired to its fixture. Example data is marked by design (D-03).

## Threat Flags

None beyond the plan's threat model. `lista` reaches nothing except through the allow-list (T-hqr-01: unit and e2e tests). Lists hold only the member's own actions, and a name walker runs in both the module and e2e tests (T-hqr-02). `reason` is never rendered (T-hqr-04: e2e asserts no "Precisa registrar"/"Ainda não medido").

## Self-Check: PASSED

- FOUND: packages/modules/dashboard/fixtures/member-lists.ts, apps/web/components/dashboard/MemberActivityList.tsx, packages/modules/dashboard/tests/member-lists.test.ts
- FOUND commits: 91445857, 0d782784, 8dd8c387, 3aac975c, 8cc4f3c1, ca2d57a6, 4d05a47b
- README contains `needs_story_view_time` and `memberActivityLists`; 10 PNGs in screens/

**⚠️ NÃO FEITO**
- critic review (hostile behavioural review): this executor cannot launch subagents. To close it, the orchestrator runs `critic` on commits 91445857..4d05a47b.
- flow-critic review (user-facing flow completeness): same reason and same fix — the orchestrator runs `flow-critic` on the same range.
- The `next dev` that was listening on :3000 (PID 18251) was stopped before e2e and not restarted, as instructed. To close it, the user restarts it if they want it.


## Reviews (orchestrator, after execution)

- **critic: APPROVED**, nothing found (query parsing allow-list, gate intact, fixture totals verified by running them, no other member's data, "exemplo" flags, KpiCard footer isolated).
- **flow-critic: APPROVED**, nothing blocking. Fixed in bcf683f7: empty-list sentence per list (for real data), order stated on the two ranked lists. Not unit-tested: the empty branch (fixtures are never empty and the list is an async server component); exercised only by code review.

After the fixes: pnpm lint OK, pnpm typecheck 18/18, pnpm test 15/15, pnpm boundaries no issues, preview Playwright 94/94.
