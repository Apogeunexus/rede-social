---
phase: quick-261012-gf5
plan: 01
subsystem: dashboard-preview
status: complete
tags: [dashboard, preview, privacy, flow, next-intl, pt-BR]
requires: [quick-261012-fcr]
provides:
  - mergeBandsBelowFloor / BandGroup (level-3 floor survives subtraction)
  - isComplementBelowPrivacyFloor (never-acted complement hidden)
  - selectForYouCards skips NotMeasured data
  - formatBrlCompact in @rede-social/contracts/money
affects: [apps/web preview levels 1, 3, 4, 5, 7]
tech-stack:
  added: []
  patterns: ["merge-with-neighbour privacy floor", "grouped closed list for unmeasured metrics"]
key-files:
  created: []
  modified:
    - packages/modules/dashboard/ui/metrics.ts
    - packages/modules/dashboard/ui/index.ts
    - packages/modules/dashboard/tests/metrics.test.ts
    - packages/modules/dashboard/fixtures/tenant-panels.ts
    - packages/modules/dashboard/README.md
    - packages/contracts/src/money.ts
    - packages/contracts/tests/money.test.ts
    - apps/web/components/dashboard/format.ts
    - apps/web/components/dashboard/BandsBarList.tsx
    - apps/web/components/dashboard/PlatformSupportPanel.tsx
    - apps/web/components/dashboard/PlatformOwnerPanel.tsx
    - apps/web/components/dashboard/TenantOwnerPanel.tsx
    - apps/web/components/dashboard/TenantAdminPanel.tsx
    - apps/web/components/dashboard/MemberPanel.tsx
    - apps/web/components/dashboard/MissingKpi.tsx
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "Level-3 floor: a band under 5 merges with its smaller neighbour (ends: only neighbour; tie: previous), repeated until every row >= 5; rows still sum to the exact total"
  - "The 'X% em risco' summary on level 3 shows only while at_risk is a single-band row"
  - "Never-acted KPI: when joined - count < 5 and count >= 5, it reads 'Todos, exceto menos de 5 · 14 entraram'"
  - "Client status 'at_risk' reads 'Sem atividade da equipe' (pill and bell title); the column reads 'Membros em risco %'"
  - "Level 5: the six unmeasured metrics are one closed collapsible; a lone unmeasured KPI stays a MissingKpi"
metrics:
  duration: ~12 min
  completed: 2026-10-12
actuals:
  tokens: 21000
  tasks: 3
  commits: 5
---

# Quick 261012-gf5 Plan 01: Fixes for the fcr metrics review findings

Level 3 now merges any engagement band under 5 into its smaller neighbour ("Superfãs e engajados · 10"), so no band can be worked out by subtracting from the exact 310. The never-acted card hides its complement ("Todos, exceto menos de 5 · 14 entraram"). Levels 1, 4, 5 and 7 get the seven flow-review fixes: an unambiguous status and column, a compact "R$ 14,4 mil" in a 6-card grid, the recovery card moved up with formats and buyers closed, one closed "Métricas que dependem de coleta · 6 métricas" group, and member cards that only show measured data.

## Commits

| Task | Commit | Message |
|---|---|---|
| 1 RED | 0b71415a | test(quick-261012-gf5): pin the merged privacy floor and the hidden complement |
| 1 GREEN | de06a0e6 | fix(quick-261012-gf5): level-3 bands merge under the privacy floor and the never-acted complement stays hidden |
| 2 RED | be64a416 | test(quick-261012-gf5): pin the member's measured-only cards and the compact currency |
| 2 GREEN | 9020589a | fix(quick-261012-gf5): clearer level 1, 4, 5 and 7 panels from the flow review |
| 3 | 5fd6f08e | docs(quick-261012-gf5): document the merged privacy floor and the grouped unmeasured metrics |

## Findings closed

- **C-1:** `mergeBandsBelowFloor` plus the floor mode of `BandsBarList`. Level 3 shows 22 / 10 / 27 / 96 / 155, which sum to 310 (the members KPI). Unit tests cover both ends, two small neighbours, a 0 band, a whole base under the floor, and the all-≥5 case, plus a property check. The e2e parses every row.
- **C-2:** `isComplementBelowPrivacyFloor`, with unit tests for (13,14) (14,14) (5,9) true and (9,14) (5,10) (3,14) false. The e2e asserts there is no '13' and no 'que entraram'.
- **C-3:** `gsd-tools windows fixed 78` was run, and `.planning/WINDOWS.md` row 78 now reads `fixed`. The file is left uncommitted for the orchestrator.
- **F-1 to F-7:** done as the plan describes. The e2e pins each one: levels 1, 4, 5 and 7 tests, plus the bell/clients-list tests.

## Planner decisions 1-9 as applied

1. Merge rule applied exactly as specified. Unit tests reproduce the worked example (two small neighbours → [superfan, engaged, occasional] 33).
2. The engagement summary is rendered only when `at_risk` is a single-band group. With the fixture, "31% em risco" is unchanged.
3. Complement rule = `!isBelowPrivacyFloor(part) && isBelowPrivacyFloor(whole - part)`.
4. Catalog-only rename, covering `clientStatus.at_risk`, `platformOwner.clients.columns.atRisk` and `platformOwner.attention.atRisk.title`. Fixture ids are unchanged.
5. The durations table and the stories line stay in "Vídeos, reels e stories". The six metrics are one closed `Collapsible` before "Eventos", with one `li` per metric (bold label + reason).
6. The formats summary reads "Vídeo rende mais: 96 por post". The buyers sentence moved into the summary, and its body paragraph was removed.
7. `formatBrlCompact` lives in money.ts and is used for level-1 store sales only. "Receita mensal" `MissingKpi` sits after the 6-card grid.
8. `newSinceLastVisit.posts` is widened to `number | NotMeasured`. `selectForYouCards` drops cards with any NotMeasured value, and a measured news card shows "{n} publicações novas".
9. Ana's support reply now reads "Oi, Ana! Pode levar um acompanhante no encontro de hoje."

## Verification (placeholder env exported)

- `pnpm lint` exit 0: 16/16 tasks, and check-ui-literals is OK on both checks.
- `pnpm typecheck` exit 0: 18/18 tasks.
- `pnpm test` exit 0: 15/15 tasks. module-dashboard 102 tests, contracts 166 tests, web 113 files.
- `pnpm boundaries` exit 0: "Checked 1268 files in 16 packages, no issues found".
- `pnpm check:static-routes` exit 0: 74 guarded routes, 0 offenders.
- Full preview Playwright (`playwright.preview.config.ts`): **53 passed**. Only the :3000 listener was stopped before each run.
- RED gates: Task 1 had 9 failed / 92 passed, and Task 2 had 1 failed (module) and 1 failed (contracts) before GREEN. TDD gate sequence: test → fix for both tasks.
- `git diff --quiet e94ed7ce -- apps/web/proxy.ts apps/web/app/painel-preview` passes, so the dev-only gate is untouched.
- The temporary spec was deleted. `find … -name '* 2*'` over the touched trees printed nothing.

## Screenshots (not committed)

In `/Users/macos/Desktop/rede social/rede-social/.planning/quick/261012-gf5-corrigir-achados-das-revisoes-das-metric/screens/`, for dono-da-plataforma, suporte-da-plataforma, dono-do-cliente, admin-do-cliente and membro:
- `<level>-1440-light.png`
- `<level>-390-full-light.png`

That makes 10 PNGs. No console errors were asserted during capture.

## Deviations from Plan

1. **[Rule 1 - test premise] Level-3 "no 'menos de 5'" assertion scoped to the band list.** The plan's own new footnote reads "uma faixa com menos de 5 membros aparece somada…", so asserting that the whole details element has no "menos de 5" could never pass. The intent (no band row reads "menos de 5") is asserted on `engagement.getByRole('list')`. The footnote is asserted separately. The assertion was not weakened: its premise was wrong.
2. **[Rule 3 - blocking] RED commit of Task 2 includes a type-only narrowing in `MemberPanel.tsx`.** The widened `posts` type broke web typecheck. RED narrows it with no visible change, so every commit compiles, and GREEN replaces it.
3. **[Rule 2 - accuracy] Comment-only updates outside files_modified.** These are `MissingKpi.tsx` (no longer "the one way" D-03 renders) and the money.ts header (÷100 now in one *file*: `formatBrl` and `formatBrlCompact`).
4. **Tracer gate:** the run is not in auto mode (`auto_advance` false). The tracer `<verify>` passed (suporte-da-plataforma 5/5), and execution continued because the orchestrator asked for all tasks in one pass. No interactive checkpoint was returned.
5. The `notCollected` entries carry a `key` field for the React key, in addition to `label` and `item`.

## Known Stubs

None. Level 3's KPI grid still has 7 cards, so "Atividade 24h" is an orphan at 390 px. That was outside F-5's scope (level 1 only) and was left unchanged.

## Self-Check: PASSED

- Commits 0b71415a, de06a0e6, be64a416, 9020589a and 5fd6f08e are present in `git log`.
- There are 10 PNGs in screens/.
- README contains `mergeBandsBelowFloor`.
- WINDOWS.md row 78 reads `fixed`.

**⚠️ NÃO FEITO**
- Re-review by critic and flow-critic: this executor cannot launch subagents. The orchestrator must run both on commits 0b71415a..5fd6f08e before declaring the work done.
- Committing `.planning/WINDOWS.md` (#78 fixed) and this SUMMARY is left to the orchestrator's docs commit, as instructed.


## Re-reviews (orchestrator, after execution)

- **critic: APPROVED.** Both privacy leaks from 261012-fcr are closed (merged bands, hidden complement). New, non-blocking, logged in WINDOWS.md: MEDIUM pre-existing "+14 em 7 dias" vs "14 entraram" derives 0 departures (#79); LOW formatBrlCompact does not compact negatives (#80).
- **flow-critic: APPROVED**, F-1..F-7 resolved, no new findings. Optional: shorten "Todos, exceto menos de 5" to "Quase todos"; level-3 KPI orphan is cosmetic.
