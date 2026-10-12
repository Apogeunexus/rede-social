# Quick 261012-j2w: the member panel keeps only "Sua atividade" and below

Follow-up to quicks 261012-h5t / -hqr (dev-only `/painel-preview/membro`, branch `feat/painel-preview`). Same constraints as before (catalog-only pt-BR strings, tokens, vertical scroll only, dev-only gate untouched, Biome/boundaries/literal guard green).

## Locked decision (user, 2026-10-12, with a screenshot of the block)

"Remova esse trecho. Mantenha só de Sua atividade para baixo."

- D-01 In the level-7 member panel, remove EVERYTHING above the "Sua atividade" report: the panel header ("Dr. Igor Alves · Perfil" PanelHeader), the profile header (avatar initials, "Ana Souza", "Membro desde mar. de 2026") and the whole "Para você" section (event / support reply / access expiring / news / unlocked community cards). The panel starts directly with "Sua atividade"; the preview chrome (page title, "Dados de exemplo" tag, level navigation) and the iPhone mockup stay. In list mode (`?lista=`) the list screen (with "Voltar") is shown alone, also without those headers.
- D-02 **No dead code left behind** (project rule): remove what only served the removed UI — `selectForYouCards`, `ForYouCard`, `FOR_YOU_PRIORITY` (and their tests in `packages/modules/dashboard/tests/metrics.test.ts`), the member fixture's `forYou` and `profile` data in `fixtures/tenant-panels.ts` (and any type/test that only covered them), the unused catalog keys (`member.forYou.*`, `member.memberSince`, `member.header.*` if unused afterwards), helpers left unused (e.g. `initials`, `formatMonthYear` in `apps/web/components/dashboard/format.ts` — only if nothing else uses them), README lines describing "Para você", and the e2e cases asserting those blocks (replace them with an assertion that they are absent and that "Sua atividade" is the first section of the panel). KEEP `ActionCard` (still used by `TenantOwnerPanel` on level 4) and its tests.
- D-03 The level-7 `PanelSection` heading levels must stay valid after removing the header (the panel still has the visually hidden level h2 from PreviewChrome; "Sua atividade" stays h3).

## Verification

pnpm lint (incl. check-ui-literals), pnpm typecheck, pnpm test, pnpm boundaries, pnpm check:static-routes with placeholder env (API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder). Full preview Playwright suite (stop ONLY the :3000 listener via `lsof -nP -iTCP:3000 -sTCP:LISTEN -t`; never Chrome helpers). A `git grep` proving no reference remains to the removed symbols/keys. One screenshot of `/painel-preview/membro` framed 1440×900 (light) into this task folder `screens/` (not committed). Delete any temporary screenshot spec; check `apps/web/e2e-preview/` for iCloud " 2" copies.
