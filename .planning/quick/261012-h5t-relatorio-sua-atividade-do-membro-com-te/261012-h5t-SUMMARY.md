---
phase: quick-261012-h5t
plan: 01
status: complete
subsystem: dashboard-preview
tags: [dashboard, preview, member, report, next-intl, pt-BR]
requires: [quick-261012-gf5]
provides: ["level 7 'Sua atividade' report", "ReportValue / ExampleValue shape", "KpiCard badge", "PanelSection period/as"]
affects: [packages/modules/dashboard, apps/web/components/dashboard, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview]
tech-stack:
  added: []
  patterns: ["example metrics typed in data, pill derived from `example` flag", "neutral (good: null) deltas for self-description"]
key-files:
  created:
    - apps/web/components/dashboard/MemberActivity.tsx
  modified:
    - packages/modules/dashboard/fixtures/shared.ts
    - packages/modules/dashboard/fixtures/tenant-panels.ts
    - packages/modules/dashboard/fixtures/index.ts
    - packages/modules/dashboard/ui/metrics.ts
    - packages/modules/dashboard/ui/index.ts
    - packages/modules/dashboard/ui/KpiCard.tsx
    - packages/modules/dashboard/tests/fixtures.test.ts
    - packages/modules/dashboard/tests/metrics.test.ts
    - packages/modules/dashboard/tests/kpi-card.test.tsx
    - packages/modules/dashboard/README.md
    - apps/web/components/dashboard/MemberPanel.tsx
    - apps/web/components/dashboard/PanelSection.tsx
    - apps/web/components/dashboard/format.ts
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "Member report deltas are all good: null (neutral tone, no sentiment): the report describes the member's behaviour, never grades it"
  - "ExampleValue<T> is the bounded exception to 'NotMeasured has no value', member report only; reason never rendered to the member"
  - "Presence and streak moved from the profile header into 'Presença e constância' (one place only), with window notes"
metrics:
  duration: "~10 min"
  completed: 2026-10-12
actuals:
  tokens: 11300
  tasks: 2
  commits: 4
---

# Quick 261012-h5t: member "Sua atividade" report Summary

Level 7 (`/painel-preview/membro`) now has a five-block "Sua atividade" report below the unchanged "Para você". Metrics the app does not collect yet are typed `ExampleValue` in the fixture and show a neutral "exemplo" pill derived from that flag. Every delta is neutral. Presence and streak live only in the report.

## Commits

| Task | Commit | Message |
|---|---|---|
| 1 RED | 7616dfda | test(quick-261012-h5t): pin the member report data and the example badge |
| 1 GREEN (tracer) | b0518be7 | feat(quick-261012-h5t): member "Sua atividade" section with the engagement grid |
| 2 | 3b964505 | feat(quick-261012-h5t): usage time, what you saw, communities and presence in the member report |
| 2 docs | 1efd6590 | docs(quick-261012-h5t): document the member report and which metrics need collection |

TDD gates: the RED `test(...)` commit 7616dfda failed as expected. In that run, 3 tests failed and `fixtures.test.ts` could not load because `activity` was undefined. The GREEN `feat(...)` commit b0518be7 follows it. No refactor commit was needed.

The tracer gate passed. Playwright `-g "membro"` ran 6 tests and all 6 passed, and only then did I start Task 2.

## Planner decisions applied (1–12)

1. In `shared.ts`, `MeasuredValue<T>`, `ExampleValue<T>` (with `reason`) and `ReportValue<T>` were added, with the D-03 doc comment. `needs_usage_sessions` was added to `NotMeasuredReason`, and the catalog text is "Precisa registrar as sessões de uso do app".
2. `DeltaBasis` `previous_7_days` was added, and the catalog reads "{amount} vs. semana anterior". All member-report deltas are `good: null`, so the tone is neutral and there is no sentiment. This extends the usage-time rule to the engagement deltas.
3. The usage chart is a `LineChart` in the "Média por dia" KpiCard `chart` slot, with `yStep` 10, `formatCount`, weekday x labels and the catalog aria-label.
4. "O que você viu" is 4 KpiCards: Posts vistos 128, Stories vistos 23, Vídeos e reels 41 "assistidos", and Tempo em vídeos e reels "1 h 12 min". Both video cards take their pill from `seen.videos`.
5. Presence and streak were moved into a KpiGrid pair:
   - "Presença nos encontros": 3, "de 4", note "nos últimos 30 dias".
   - "Sequência": 6, "semanas", note "com atividade toda semana". It is still gated by `MIN_STREAK_WEEKS`.
   - `member.attendance` and `member.streak` were deleted. The header keeps the avatar, the name and "Membro desde".
6. Root key `durationLong` and `formatHoursMinutes(t, minutes)` were added. `formatDuration` is unchanged.
7. `KpiCard` gained `badge?: string`, which puts the value span and a `StatusPill tone="neutral" className="px-2 py-0.5"` in a flex-wrap row. Without a badge the markup is unchanged: the 'LV' and missing-variant tests still pass. The peak-hour line renders the same pill.
8. `PanelSection` gained `period?` (a StatusPill on the title row) and `as?: 'h3' | 'h4'`, default h3. "Sua atividade" is an h3 with the period, and its 5 blocks are h4s inside a `flex flex-col gap-6`.
9. Communities is a `BarList` in fixture order with the top row highlighted, followed by the caption "Curtidas e comentários nos posts de cada comunidade". The rows sum to 58, which equals 46 + 12.
10. `formatWeekdayShort(isoDate)` gives seg ter qua qui sex sáb dom, with the trailing dot stripped.
11. The fixture values are exactly as planned: days 32/41/28/45/36/52/32, a total of 266 and an average of 38. Peak is 20–22. Engagement is 46 (+8), 12 (+3), 9 (+2, example) and 3 (−1, example). Seen is 128 (example), 41 / 72 min (example) and 23. byCommunity is VIP 31, Geral 19, Eventos 8.
12. `totalMinutes` and `dailyAverageMinutes` are in `metrics.ts` and exported from `ui/index.ts`. The KPI value and the weekly note are computed through them.

## Metric → collection table (D-03)

| Metric | Source today | What must be collected (reason) |
|---|---|---|
| Tempo de uso (média, gráfico, total) | none — **exemplo** | App session start/end per member (`needs_usage_sessions`) |
| Horário em que você mais usa | none — **exemplo** | Same sessions by São Paulo hour (`needs_usage_sessions`) |
| Salvamentos | none — **exemplo** | `needs_saves` |
| Compartilhamentos | none — **exemplo** | `needs_shares` |
| Posts vistos | none — **exemplo** | `needs_post_views` |
| Vídeos e reels (count + watch time) | none — **exemplo** | `needs_video_playback` |
| Curtidas | `feed_likes` | measured |
| Comentários | `feed_comments` | measured |
| Stories vistos | member's own `story_views` | measured |
| Onde você mais participa | likes + comments joined to `feed_posts.community_id` | measured |
| Presença nos encontros | check-ins vs confirmed RSVPs, 30 days | measured |
| Sequência | weeks with a counted action | measured |

The same table is in `packages/modules/dashboard/README.md` under "Member report (level 7)".

## Verification (commands run, real output)

All commands below ran with the placeholder env inline.

- **Module (Task 1).**
  - `pnpm --filter @rede-social/module-dashboard test`: 7 files, 112 passed.
  - `typecheck`: exit 0.
  - `lint`: "Checked 29 files … No fixes applied."
- **Web (Task 1).**
  - `pnpm --filter @rede-social/web typecheck`: "✓ Types generated successfully", tsc exit 0.
  - `pnpm --filter @rede-social/web lint`: "Checked 667 files … No fixes applied."
  - `bash scripts/check-ui-literals.sh`: both lines OK.
  - Catalog checks for Task 1 and Task 2: both print `catalog OK`.
- **`pnpm lint`:** exit 0, "Tasks: 16 successful, 16 total", and check-ui-literals is OK.
- **`pnpm typecheck`:** exit 0, "Tasks: 18 successful, 18 total".
- **`pnpm test`:** exit 0, "Tasks: 15 successful, 15 total".
  - web 2390 passed and module-dashboard 112 passed.
  - core 405, feed 247, ui 180, contracts 166, stories 162, events 160, notifications 127, reels 126, api 60, store 54, communities 52, chat 44 and reuse-fixture 3 passed.
- **`pnpm boundaries`:** exit 0, "Checked 1277 files in 16 packages, no issues found".
- **`pnpm check:static-routes`:** exit 0, "guarded routes checked: 74, offenders: 0".
- **Preview Playwright:** `pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts` (full suite): exit 0, **54 passed (32.7s)**.
  - I stopped only the :3000 listener (pid 8227, `next-server (v16.3.5)`) first.
  - The member tests passed, including the new 'membro: Sua atividade report':
    - the h4 order;
    - 38 / "4 h 26 min na semana" / "6 min vs. semana anterior";
    - the chart labels seg..dom;
    - exactly 7 "exemplo" pills, at the 6 KpiCards plus the peak line;
    - none on the measured metrics or communities;
    - the values 128, 23, 41 and 1 h 12 min, and the community rows;
    - no "Ainda não medido" or "Precisa registrar".
  - The overflow loops (1440 framed, and 360/390/430 with every details open) also passed.
- **Hygiene:**
  - No `* 2*` copies under e2e-preview, components/dashboard, messages or packages/modules/dashboard.
  - The temporary spec `zz-screens.tmp.spec.ts` was deleted.
  - `git diff --quiet 76e7b5f6 -- apps/web/proxy.ts apps/web/app/painel-preview` succeeds, so the gate is untouched.
  - The README contains `needs_usage_sessions` and `ExampleValue`.

## Screenshots (not committed)

- `/Users/macos/Desktop/rede social/rede-social/.planning/quick/261012-h5t-relatorio-sua-atividade-do-membro-com-te/screens/membro-1440-light.png`
- `/Users/macos/Desktop/rede social/rede-social/.planning/quick/261012-h5t-relatorio-sua-atividade-do-membro-com-te/screens/membro-1440-dark.png`
- `/Users/macos/Desktop/rede social/rede-social/.planning/quick/261012-h5t-relatorio-sua-atividade-do-membro-com-te/screens/membro-390-full-light.png`

How they were captured:
- After `networkidle` plus 400 ms, with the console-error assertion green.
- For the framed shots, the phone screen was scrolled so "Sua atividade" sits at the top.

What I saw when I looked at them:
- The blocks read in the locked order.
- The pills sit next to their values.
- The −6 min delta is grey.
- The chart has 7 labelled days.
- The header no longer repeats presence or streak.
- In dark mode, the pills and the chart stay legible.

## Deviations from Plan

None. The plan was executed as written, and every check passed on the first full run.

One observation, not a deviation: the h3 "Sua atividade" and its h4 blocks share the same `SectionTitle variant="group"` style. The heading levels nest correctly, but on screen they look like one flat level. The plan did not ask for a separate h4 style.

## Known Stubs

None that block the goal. The six example metrics are intentional fictional values under D-03. Each carries an "exemplo" pill and is listed in the README collection table.

## Threat Flags

None. There is no new endpoint, auth path or schema change, and the dev-only gate is untouched.

## Self-Check: PASSED

- The file `apps/web/components/dashboard/MemberActivity.tsx` exists.
- Commits 7616dfda, b0518be7, 3b964505 and 1efd6590 are present in `git log`.
- All 3 screenshots exist.

**⚠️ NÃO FEITO**
- critic review (hostile behavioral review): this executor cannot launch subagents, so it was not run. To close it, the orchestrator runs `critic` on commits 7616dfda..1efd6590.
- flow-critic review (flow completeness of the user-facing report): not run, for the same reason. To close it, the orchestrator runs `flow-critic` on the same range.
- STATE.md and the WINDOWS.md ledger were not updated. The constraints say not to commit them, and the quick-task row is the orchestrator's. To close it, the orchestrator records the quick task in STATE.md.


## Reviews (orchestrator, after execution)

- **critic: APPROVED**, no CRITICAL/HIGH/MEDIUM. Fixed LOW in e5a0953b: whole hours rendered "1 h 0 min".
- **flow-critic: APPROVED**, nothing blocking. Fixed in e5a0953b: the 7-day pill covered a 30-day block (each block now states its window); flat heading hierarchy (report title one step stronger). For real data later: BarList empty state.

After the fixes: pnpm lint OK, pnpm typecheck 18/18, pnpm test 15/15, pnpm boundaries no issues, preview Playwright 54/54.
