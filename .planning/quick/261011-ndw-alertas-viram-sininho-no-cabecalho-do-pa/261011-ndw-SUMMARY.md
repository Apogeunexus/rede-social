---
phase: quick-261011-ndw
plan: 01
subsystem: web/dashboard-preview
status: complete
tags: [dashboard, preview, disclosure, client-component, a11y, next-intl, pt-BR]
requires: [quick-261011-jqy, quick-261011-l72]
provides:
  - AlertsBell client disclosure (apps/web/components/dashboard/AlertsBell.tsx)
  - PanelHeader `alerts` prop (async server header)
  - IconButton `ref` typing + `badgeClassName`
affects: [apps/web/components/dashboard, packages/ui/src/primitives/IconButton.tsx, apps/web/messages/pt-BR/dashboard.json]
tech-stack:
  added: []
  patterns:
    - "Server component renders the list and passes it as children of a small 'use client' disclosure"
    - "Absolute dropdown anchored to the header's relative root (no portal/top layer/fixed) so it scales with the phone frame"
key-files:
  created:
    - apps/web/components/dashboard/AlertsBell.tsx
    - apps/web/components/dashboard/AlertsBell.test.tsx
  modified:
    - packages/ui/src/primitives/IconButton.tsx
    - packages/ui/tests/button.test.tsx
    - apps/web/components/dashboard/PanelHeader.tsx
    - apps/web/components/dashboard/TenantAdminPanel.tsx
    - apps/web/components/dashboard/PlatformOwnerPanel.tsx
    - apps/web/components/dashboard/PlatformAdminPanel.tsx
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "One title pattern for all three levels: 'Alertas (N)' (level 2 drops 'Pendências'), matching the bell's name 'Alertas, N'"
  - "Non-urgent badge is brand-filled (bg-brand text-on-brand); danger stays the primitive default when any alert is danger"
  - "Level 2's disabled 'Ver todas' action removed: the bell already lists every item"
metrics:
  duration: ~25 min
  completed: 2026-10-11
estimate:
  tokens: 55000
actuals:
  tokens: 6000
  tasks: 3
  commits: 4
---

# Phase quick-261011-ndw Plan 01: Alerts become a bell in the panel header Summary

On levels 1, 2 and 5 the inline "Atenção" and "Pendências" lists are gone. A lucide Bell `IconButton` now sits on the header's right with a count badge: "Alertas, 2" with a brand badge, "Alertas, 4" with a danger badge and "Alertas, 3" with a danger badge. It opens an absolutely positioned "Alertas (N)" panel under the header, inside the phone screen. The panel closes on Escape (focus returns to the bell), on a press outside and on a second press.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 (tracer) | 0a3361ae | feat(quick-261011-ndw): move the client admin's alerts into a header bell |
| 2 (test gate) | 756ec413 | test(quick-261011-ndw): pin the alerts bell's open/close behaviour |
| 2 (panels) | d14819e3 | feat(quick-261011-ndw): platform owner and admin alerts move into the bell |
| 3 | 61e177a9 | test(quick-261011-ndw): cover the alerts bell on every level that has one |

## Verification (real runs, PREVIEW_ENV exported)

- `pnpm lint`: exit 0. 16/16 turbo tasks passed, and check-ui-literals reported OK twice.
- `pnpm typecheck`: exit 0, 18/18 tasks.
- `pnpm test`: exit 0, 15/15 tasks. Web 2388 tests in 113 files, ui 180 (including the 2 new IconButton cases), module-dashboard 48. AlertsBell.test.tsx passed 8/8.
- `pnpm boundaries`: exit 0. 1264 files in 16 packages, no issues.
- `pnpm check:static-routes`: exit 0. 74 guarded routes, 0 offenders.
- Preview Playwright suite (`playwright.preview.config.ts`, Chrome): exit 0, **46/46 passed**. That includes 6 `alerts bell:` cases (levels 1, 2 and 5 at 1440x900 and at 390px) and `levels without alerts show no bell`.
- Task 1 tracer verify (both typechecks, the no-portal grep, `-g "alerts bell|admin-do-cliente"`): 6/6 passed.
- Task 2 catalog script printed "catalog OK". Exactly 3 panels pass `alerts=`, and none render `<AttentionList` inline.
- `git diff --quiet 0f6a0785 -- apps/web/proxy.ts apps/web/app/painel-preview` passed: both are unchanged (T-ndw-01).
- Mutation check of the unit test: removing the focus return made the Escape case fail, and removing the keydown cleanup made the listener-leak case fail (T-ndw-03). Both mutations were reverted.

## Screenshots (not committed)

- /Users/macos/Desktop/rede social/rede-social/.planning/quick/261011-ndw-alertas-viram-sininho-no-cabecalho-do-pa/screens/dono-da-plataforma-1440-open-light.png
- /Users/macos/Desktop/rede social/rede-social/.planning/quick/261011-ndw-alertas-viram-sininho-no-cabecalho-do-pa/screens/admin-da-plataforma-1440-open-light.png
- /Users/macos/Desktop/rede social/rede-social/.planning/quick/261011-ndw-alertas-viram-sininho-no-cabecalho-do-pa/screens/admin-do-cliente-1440-open-light.png
- /Users/macos/Desktop/rede social/rede-social/.planning/quick/261011-ndw-alertas-viram-sininho-no-cabecalho-do-pa/screens/admin-do-cliente-1440-open-dark.png
- /Users/macos/Desktop/rede social/rede-social/.planning/quick/261011-ndw-alertas-viram-sininho-no-cabecalho-do-pa/screens/admin-do-cliente-390-closed-light.png

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The plan's port-3000 kill would also have killed the user's Chrome**
- **Found during:** Task 1 verify.
- **Issue:** `lsof -ti tcp:3000` also returned PID 59258, a Google Chrome network-service helper holding a client connection to :3000. Running `kill $PIDS` would have killed part of the user's browser.
- **Fix:** I killed only the listener (`lsof -ti tcp:3000 -sTCP:LISTEN`), which was `next-server` 68971, plus its parent `next dev`, 68965. I did not restart the dev server.

**2. [Rule 3 - Blocking] The Turbopack dev cache was corrupted by iCloud-style duplicate files**
- **Found during:** Task 1 e2e.
- **Issue:** `next dev` failed with "Failed to open database … invalid digit found in string". The cause was `apps/web/.next/dev/cache/turbopack/v16.3.5-ca2c75eb/` containing `00000150 2.sst` and `00000160 2.sst`, the same " 2" duplicate pattern as the `" 2.md"` / `" 3.json"` files elsewhere in this Desktop checkout.
- **Fix:** I removed `apps/web/.next/dev/cache/turbopack`. It is gitignored (`.gitignore:11 .next/`) and regenerates on the next start, which it did.

**3. [Rule 1 - Lint] Listener name shadowed a global**
- Biome `noShadowRestrictedNames` flagged `const escape`. I renamed it to `onKeyDown` before committing Task 1 (0a3361ae).

**4. [Rule 3 - Type] ui test helpers**
- `toHaveClass` is not typed in `packages/ui/tests`. I used `classList.contains` instead, the same plain-DOM style the web tests use, and added the missing `createRef` import.

### Process notes

- **Tracer gate:** auto mode is off (`workflow.auto_advance` = false and `_auto_chain_active` = false), so an interactive run would checkpoint after Task 1. The orchestrator explicitly told me to execute every task in this run, so I re-ran the tracer's `<verify>` instead: 6/6 green, both typechecks passing. Then I continued.
- **TDD gate compliance:** Task 2 is `tdd="true"`, but the component under test was built by the Task 1 tracer, as the plan designed. The new tests were therefore green on their first run, and no RED commit was possible. As a stand-in for RED, two mutations of the component each turned one case red, which shows the tests can fail. The gate order still holds in git: `test(...)` 756ec413 comes before `feat(...)` d14819e3.

## Known Stubs

None.

## Threat Flags

None. The only new surface is a client disclosure that receives catalog strings, a number, a boolean and server-rendered children. No new routes and no input handling.

## Self-Check: PASSED

- FOUND: apps/web/components/dashboard/AlertsBell.tsx and AlertsBell.test.tsx.
- FOUND: commits 0a3361ae, 756ec413, d14819e3 and 61e177a9 (`git log`).
- FOUND: 5 PNGs in screens/, and the temporary spec `zz-screens.tmp.spec.ts` is deleted.

## ⚠️ NÃO FEITO

- **critic and flow-critic reviews:** not run, because this executor cannot launch subagents. The orchestrator needs to run them on the range 96d41abb..61e177a9 before the task is called done.
- **Dev server on :3000:** it was stopped for the e2e runs and not restarted, as instructed. Restart it with `pnpm --filter @rede-social/web dev` and the placeholder env.
- **Empty state for real alert data ("nenhum alerta"):** out of scope by plan decision; the fixtures always have alerts. It is the same follow-up the jqy flow-critic already recorded.


## Reviews (orchestrator, after execution)

- **critic: APPROVED**, nothing reproducible at any severity (shared IconButton unchanged for existing callers; no listener leak; no open-then-close race; hydration and stacking OK).
- **flow-critic: APPROVED**, nothing blocking. Fixed in af9d496e: urgency no longer colour-only (BellRing + "N urgente(s)" in the accessible name), visible "Fechar alertas" button. Left to the user: tinting the matching KPI (e.g. "Aguardando resposta") danger when its alert is danger. Future (real data): keep the bell with "Nenhum alerta agora" instead of hiding it.

After the fixes: pnpm lint OK, pnpm typecheck 18/18, pnpm test 15/15, pnpm boundaries no issues, preview Playwright 46/46.
