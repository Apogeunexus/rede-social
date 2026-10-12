---
phase: quick-261012-j2w
plan: 01
subsystem: dashboard-preview
status: complete
tags: [dashboard, preview, member, removal, dead-code, pt-BR]
requires: [quick-261012-hqr]
provides: ["Level-7 member panel that starts at 'Sua atividade'"]
affects: [apps/web/components/dashboard, packages/modules/dashboard, apps/web/messages/pt-BR/dashboard.json]
tech-stack:
  added: []
  patterns: ["e2e structural check via xpath preceding-sibling for 'nothing before X'"]
key-files:
  created: []
  modified:
    - apps/web/components/dashboard/MemberPanel.tsx
    - apps/web/e2e-preview/painel-preview.spec.ts
    - apps/web/components/dashboard/format.ts
    - apps/web/components/dashboard/MemberActivity.tsx
    - apps/web/messages/pt-BR/dashboard.json
    - packages/modules/dashboard/ui/metrics.ts
    - packages/modules/dashboard/ui/index.ts
    - packages/modules/dashboard/ui/ActionCard.tsx
    - packages/modules/dashboard/tests/metrics.test.ts
    - packages/modules/dashboard/fixtures/tenant-panels.ts
    - packages/modules/dashboard/fixtures/shared.ts
    - packages/modules/dashboard/README.md
decisions:
  - "MemberPanel is a plain (non-async) component rendering TenantColumn with MemberActivityList or MemberActivity only"
  - "A smaug-ignore dead-imports comment sits on the MemberActivity import: the gate's code stripper reads `/> : <MemberActivity /` in the JSX ternary as a regex literal (false positive)"
metrics:
  duration: ~25min
  completed: 2026-10-12
actuals:
  tokens: 9000
  tasks: 2
  commits: 2
---

# Quick 261012-j2w Plan 01: Member panel keeps only "Sua atividade" Summary

The level-7 member panel now renders only the "Sua atividade" report (or the `?lista=` list screen on its own). The "Dr. Igor Alves · Perfil" header, the avatar/"Ana Souza"/"Membro desde" block and the "Para você" cards are gone, along with every helper, fixture field, catalog key, test and README line that only served them.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | ad04c003 | feat(quick-261012-j2w): member panel starts at the activity report |
| 2 | c9742e0f | refactor(quick-261012-j2w): drop the member panel's unused for-you and profile code |

## What changed

- **MemberPanel.tsx**: returns `<TenantColumn>{list ? <MemberActivityList slug={list} /> : <MemberActivity />}</TenantColumn>`. It is no longer async and has no translations or fixtures. page.tsx, proxy.ts and the preview layout are unchanged since a9ed223e.
- **e2e**: the old card-order test was renamed to 'membro: the panel starts at Sua atividade; presence and streak, no band'. It asserts that 'Para você', 'Ana Souza', 'Dr. Igor Alves', 'Perfil', /Membro desde/, 'Encontro mensal · hoje 19h', 'O suporte respondeu' and the 'Renovar'/'Fazer check-in' buttons are absent. It also checks that the report section has no preceding sibling and that the heading after the level h2 'Membro' is 'Sua atividade'. The "Para você" y-comparison was removed. Each list case now asserts that `#lista` has no preceding sibling and that there is no /Membro desde/.
- **Dead code removed**: ForYouCard, FOR_YOU_PRIORITY, FOR_YOU_FIELD, MAX_FOR_YOU_CARDS, isNotMeasured and selectForYouCards (with their re-exports and tests); the fixture's `forYou`, `profile.name` and `profile.memberSince`; the `needs_last_visit` reason (whose only producer was the fixture, checked with git grep) and its catalog line; the catalog keys `member.header`, `member.memberSince` and `member.forYou`; formatMonthYear with its MONTH_YEAR formatter.
- **Kept**: ActionCard (TenantOwnerPanel) and its tests, only with a neutral doc comment; `initials` (TenantStaffPanel); `profile.attendance` and `profile.weeklyStreak` (read by MemberActivity).

## Verification (all run with the placeholder env)

- `pnpm lint`: exit 0. Biome: "Checked 668 files … No fixes applied". check-ui-literals: OK.
- `pnpm typecheck`: exit 0, 18/18 tasks.
- `pnpm test`: exit 0, 15/15 tasks. module-dashboard: 141 passed. web: 2394 passed.
- `pnpm boundaries`: "Checked 1272 files in 16 packages, no issues found".
- `pnpm check:static-routes`: OK, 74 guarded routes, 0 offenders.
- Preview Playwright `-g membro` (Task 1): 46 passed. Full preview suite (Task 2): 94 passed.
- The removal git grep (apps/web, packages) returned nothing. The 'Para você|Membro desde' grep over the dashboard code and catalog returned nothing. The catalog node check printed "catalog OK".
- `git diff --quiet a9ed223e -- apps/web/proxy.ts apps/web/app/painel-preview` passed, so the dev-only gate is unchanged.
- Screenshot: `.planning/quick/261012-j2w-remover-cabecalho-do-perfil-e-para-voce-/screens/membro-1440-light.png` (1440x900, light). Inspection shows the phone opening at "Sua atividade" → "Tempo de uso", with the preview chrome and level nav unchanged. The temp spec was deleted. There are no " 2" copies under e2e-preview, components/dashboard, messages or packages/modules/dashboard.

## Deviations from Plan

**1. [Rule 3 - Blocking] smaug gate false positive on the MemberActivity import**
- **Found during:** Task 1
- **Issue:** The global smaug PreToolUse gate blocked the Write and reported `MemberActivity` as an unused import. Its code stripper treats the span `/> : <MemberActivity /` in the JSX ternary as a regex literal.
- **Fix:** Added `// smaug-ignore dead-imports: <reason>` above the import. The code is otherwise exactly what the plan specified. Biome and typecheck confirm the import is used.
- **Files modified:** apps/web/components/dashboard/MemberPanel.tsx
- **Commit:** ad04c003

## Notes

- Pre-existing untracked iCloud copies (`261011-jqy-CONTEXT 2.md`, `261011-jqy-PLAN 2.md`, `reference-prototype 2.html`) are in `.planning/quick/261011-jqy-…/`. They are outside this task's scope and were left untouched.
- STATE.md was not modified. The orchestrator owns quick-task state.

## Self-Check: PASSED

- FOUND: apps/web/components/dashboard/MemberPanel.tsx
- FOUND: screens/membro-1440-light.png
- FOUND: ad04c003, c9742e0f in git log


## Reviews (orchestrator, after execution)

- **critic: APPROVED.** Nothing removed is still referenced, nothing kept is dead, heading structure valid, gate untouched. LOW accepted: the `smaug-ignore dead-imports` suppression in MemberPanel.tsx is justified (the import is used in the JSX ternary; the hook misreads it); rewriting the ternary as if/return is optional.
- **flow-critic: APPROVED**, no findings.
