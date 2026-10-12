---
phase: quick-261012-fcr
plan: 01
status: complete
subsystem: dashboard-preview
tags: [dashboard, preview, fixtures, engagement, privacy, next-intl, pt-BR]
requires: [quick-261011-jqy, quick-261011-l72, quick-261011-ndw]
provides:
  - "One engagement model (EngagementBands) + pure helpers in packages/modules/dashboard/ui/metrics.ts"
  - "NotMeasured type + MissingKpi: the single 'Ainda não medido' render (D-03)"
  - "BandsBarList with the D-02 privacy floor"
  - "Spec items 1.1–7.4 on the 7 preview panels"
affects: [apps/web/components/dashboard, packages/modules/dashboard, apps/web/e2e-preview]
tech-stack:
  added: []
  patterns:
    - "Percents and totals computed from the band counts, never typed next to them"
    - "Unmeasured metric = NotMeasured (no value field) rendered only through MissingKpi"
key-files:
  created:
    - packages/modules/dashboard/ui/metrics.ts
    - packages/modules/dashboard/tests/metrics.test.ts
    - apps/web/components/dashboard/BandsBarList.tsx
    - apps/web/components/dashboard/MissingKpi.tsx
  modified:
    - packages/modules/dashboard/fixtures/shared.ts
    - packages/modules/dashboard/fixtures/index.ts
    - packages/modules/dashboard/fixtures/platform-panels.ts
    - packages/modules/dashboard/fixtures/tenant-panels.ts
    - packages/modules/dashboard/ui/index.ts
    - packages/modules/dashboard/tests/fixtures.test.ts
    - packages/modules/dashboard/README.md
    - apps/web/components/dashboard/format.ts
    - apps/web/components/dashboard/PlatformOwnerPanel.tsx
    - apps/web/components/dashboard/PlatformAdminPanel.tsx
    - apps/web/components/dashboard/PlatformSupportPanel.tsx
    - apps/web/components/dashboard/TenantOwnerPanel.tsx
    - apps/web/components/dashboard/TenantAdminPanel.tsx
    - apps/web/components/dashboard/TenantStaffPanel.tsx
    - apps/web/components/dashboard/MemberPanel.tsx
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "D-03: one rule. Every uncollected metric is 'Ainda não medido' with a reason. It is never shown as a sample value."
  - "On level 7, Ana's 'Novidades' card is ranked out by the locked max-3 priority, so level 7 shows no 'Ainda não medido'."
  - "On level 2, the funnel and the failures table stack full width, because the 6-column table needs the room."
metrics:
  duration: "~18 min (14:27–14:45 UTC)"
  completed: 2026-10-12
  tasks: 3
  files: 21
actuals:
  tokens: 33000
  tasks: 3
  commits: 6
---

# Quick 261012-fcr: engagement bands and activity metrics on the 7 panels Summary

All 7 preview panels now share one engagement model: six exclusive bands with unit-tested helpers. Every band sum and percent matches the KPIs already on screen. The fixture contradictions are fixed, and Igor now has 1.240 members and 38% on every level. Level 3 shows a privacy floor ("menos de 5"). A metric the app does not collect renders as a dashed "Ainda não medido" card, never as a number.

## The D-03 rule

The app does not collect some metrics today: post reach, engagement per view, saves, shares, video % watched and completion, product conversion, news since the last visit, and monthly revenue. None of them has a number, either in the fixtures or on screen. Each is typed `NotMeasured` (`{ measured: false; reason }`), which has no value field, so no number can leak. It renders in exactly one way: `MissingKpi`, which is the existing `KpiCard variant="missing"`. The card shows the metric name as its label, "Ainda não medido" as its value, and `dashboard.notMeasuredReason.<reason>` as its note, which names what must be collected.

Where the spec put these metrics in table columns (5.1–5.3, 5.4, and Conversão on level 6), they become a `KpiGrid` of missing cards right under the table. Inside a member card (7.3), the same words appear as a neutral pill, with the reason as the detail. The CONTEXT sample values (reach 612/49%, saves and shares, video 58%/34%, conversion 6/420, novidades 5 posts) are stored nowhere.

## Planner decisions (applied as written)

1. **D-03 single rule.** Applied as described above. "Receita mensal" moved onto the shared reason catalog, and `platformOwner.kpi.revenueReason` was deleted.
2. **Level-1 KPI order.** "Membros engajados" is the 6th KPI and "Vendas nas lojas dos clientes" the 7th, after "Receita mensal". That makes 7 cards, so the grid cannot also be even.
3. **"Quem compra".** Each order counts in the band its buyer was in on the day before the order (footnote on screen). X is superfãs + engajados orders (72%); Y is `engagedPercent` (22%).
4. **"vs. mediana".** A post is compared once it is at least 24 h old (median 52 at 24 h). This gives +144%, +15% and "em andamento".
5. **D-02 floor scope (level 3).** The floor covers band counts, invites, novos who never acted and their joined count, blocked members ("/ menos de 5 bloq.") and devices that refused push ("Menos de 5 aparelhos recusaram a notificação"). A floored bar has value 0 and no rate. Error counts, rates, percents, days and staff accounts are not floored.
6. **Level-7 priority.** The order is event > support reply > access expiring > news > community, with at most 3 cards. Ana sees event, support reply and access expiring. "Novidades" and "comunidade liberada" are ranked out, and unit tests prove that news gets a slot when a higher card is absent.
7. **Level-2 layout.** The 2-column grid is gone, so the funnel and the failures table stack full width. The 900 px e2e checks that there is no overflow.
8. **Level-1 layout.** The `@3xl` 2x2 grid holds the active-clients chart, then Faixas de engajamento, then Membros por cliente, then Adoção de módulos (with "Uso real").
9. **Level-4 "Engajados" note.** It reuses `actionsPerActiveMember` 9,3.
10. **"Uso real" rows** follow the adoption list's module order.
11. **Igor's pushReach 58%** is not modeled, because nothing renders it.

## Commits

| Task | Commit | Message |
|---|---|---|
| 1 RED | 5941abdc | test(quick-261012-fcr): pin the engagement model and the fixed fixture numbers |
| 1 GREEN (tracer) | 4078504e | feat(quick-261012-fcr): engagement bands and unmeasured metrics on the client owner and admin panels |
| 2 RED | 215ebc32 | test(quick-261012-fcr): pin the platform bands, client rows and the privacy floor |
| 2 GREEN | 2ce83af1 | feat(quick-261012-fcr): engagement and activity metrics on the platform owner, admin and support panels |
| 3 RED | 57dff012 | test(quick-261012-fcr): pin the staff rules and the member card priority |
| 3 GREEN | 99ec9271 | feat(quick-261012-fcr): staff and member metrics, and the panels stay scroll-free with every section open |

## Gate evidence

All gates ran with the placeholder env inline. Before every Playwright run, only the :3000 listener was stopped: PID 79948 (`next-server (v16.3.5)`), once, at the start.

- `pnpm lint`: exit 0. "Tasks: 16 successful, 16 total". check-ui-literals: "OK — no hex/legacy-class/pt-BR/attribute literals … catalog files valid" and "OK — Biome noJsxLiterals is at error…".
- `pnpm typecheck`: exit 0, "Tasks: 18 successful, 18 total".
- `pnpm test`: exit 0, "Tasks: 15 successful, 15 total". module-dashboard 7 files / 92 tests; web 113 files / 2390 tests.
- `pnpm boundaries`: "Checked 1291 files in 16 packages, no issues found".
- `pnpm check:static-routes`: "guarded routes checked: 74 · offenders: 0 · check-static-routes: OK".
- Full preview Playwright suite (`playwright.preview.config.ts`, Chrome): **53 passed (34.5s)**.
- Per-task scoped e2e: Task 1 `-g "dono-do-cliente|admin-do-cliente"` 12/12. Task 2 `-g "dono-da-plataforma|admin-da-plataforma|suporte-da-plataforma|alerts bell|clients list"` 23/23.
- Catalog node checks: "catalog OK" for each of the 3 tasks.
- `git diff --quiet d94933ad -- apps/web/proxy.ts apps/web/app/painel-preview`: unchanged. The temporary spec is deleted, and there are 14 PNGs.
- Tracer gate: the Task 1 browser verification (12/12) passed before any expansion task started.

## Screenshots (not committed)

These are in `/Users/macos/Desktop/rede social/rede-social/.planning/quick/261012-fcr-enriquecer-metricas-dos-7-paineis-com-fa/screens/`. There are two per level, so 14 in total:

- `<level>-1440-light.png`: framed at 1440x900, light theme.
- `<level>-390-full-light.png`: full page at 390 px, with every collapsible open.

The levels are dono-da-plataforma, admin-da-plataforma, suporte-da-plataforma, dono-do-cliente, admin-do-cliente, equipe-do-cliente and membro.

## Deviations from Plan

**1. [Rule 3 - Blocking] RED commits include type contracts and throwing helper skeletons.**
- A PostToolUse typecheck hook rejects test files that import missing modules. So each RED commit also carries the new types, plus helper signatures that throw `not implemented`.
- The RED runs failed on assertions as intended: 19, 9 and 13 new failures.
- A few checks were already green in RED: the 8.430 sum and named-row invariants, and the contract constants `PRIVACY_FLOOR` and `MIN_STREAK_WEEKS`. They are guards or contract values, not new behavior.
- The fixture-field tests still had type errors in the RED commits until GREEN.

**2. [Rule 1 - Test fix] E2E section scoping uses `ancestor::section[1]`.**
- The plan's `locator('section').filter({ has: heading })` also matched an outer wrapping section: 23 list items instead of 6.
- The fix scopes to the heading's nearest section, which is more precise and does not weaken the assertion.

**3. Screenshot capture flow.**
- Setting `details.open` before hydration triggered a React hydration-attribute warning: the dev overlay showed "1 Issue" on the three levels that have collapsibles.
- I confirmed this was test-induced. Clean loads of all 7 levels showed no console errors and no overlay issue.
- The screenshots were retaken after `networkidle` plus a wait, with an assertion of no overlay issue and no console errors. All 7 passed.

No other deviations. Notes on STATE.md and ROADMAP.md are in the "⚠️ NÃO FEITO" block at the end.

## Threat Flags

| Flag | File | Description |
|---|---|---|
| threat_flag: info-disclosure (complement) | apps/web/components/dashboard/PlatformSupportPanel.tsx | Level 3 floors superfãs (2), but it shows the exact members total (310) and the other five band counts. 310 − 308 = 2, so the floored count can be recovered by subtraction. The same applies to "bloq." (2), which can be derived only if other blocked counts are shown, and they are not. Planner decision 5 did not cover complements. Closing it needs rounding the other bands, or the total, to the floor. Logged in .planning/WINDOWS.md as a deviation. |

## Known Stubs

None that block the goal. All data is fictional by design: this is a dev-only preview. Unmeasured metrics are deliberate D-03 items, not stubs.

## Self-Check: PASSED

- Created files exist: ui/metrics.ts, tests/metrics.test.ts, BandsBarList.tsx, MissingKpi.tsx.
- Commits 5941abdc, 4078504e, 215ebc32, 2ce83af1, 57dff012 and 99ec9271 are present in `git log`.

**⚠️ NÃO FEITO**
- `critic` and `flow-critic` reviews: this executor cannot launch subagents. To close, the orchestrator or the user should run both on commits 4078504e..99ec9271 ("rodo o critic e o flow-critic?").
- Privacy complement gap on level 3 (see Threat Flags): left as planned. To close, round or floor the complement bands or the total on the support panel.
- STATE.md and ROADMAP.md: not updated by this executor. ROADMAP is out of scope per the caller, and the quick-task STATE row is left to the orchestrator.
- Human check from the plan: walk the 7 levels in light and dark at 1440, then at 390 px. Only light screenshots were taken; dark mode was not captured. Also confirm the ranked-out "Novidades" card on level 7.


## Reviews (orchestrator, after execution)

- **critic: REJECTED** — HIGH: level-3 privacy floor defeated by subtraction (exact total 310 − the five exact bands = superfãs 2); MEDIUM: "13 de 14" new members reveals 1 by complement. LOW: WINDOWS.md #78 uncommitted; iCloud copy `zz-screens.tmp.spec 2.ts` left in e2e-preview (deleted by the orchestrator). Fixtures integrity, computed sentences, "Ainda não medido" (no leaked values) and the production gate verified OK.
- **flow-critic: APPROVED** with 7 fixes (ambiguous "Em risco", stories under "Vídeos e reels", six "Ainda não medido" cards as noise, level 4 too long, R$ value wrapping + odd KPI grid, member could see a collection note, contradictory member fixture).
- All of the above are fixed in quick task 261012-gf5.
