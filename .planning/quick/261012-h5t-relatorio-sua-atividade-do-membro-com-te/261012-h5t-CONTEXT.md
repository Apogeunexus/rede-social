# Quick 261012-h5t: member "Sua atividade" report (level 7)

Follow-up to quicks 261011-jqy … 261012-gf5 (dev-only `/painel-preview/<nivel>`, branch `feat/painel-preview`). Same constraints: fictional fixtures, catalog-only pt-BR strings, no hex in `.tsx`, tokens only, `@3xl` container queries, vertical scroll only, iPhone mockup from `lg`, alerts only in the bell, dev-only gate untouched, Biome/boundaries/literal guard green.

## Locked decisions (user, 2026-10-12)

- D-01 **Audience = the member themself** (level 7, `membro`), own data only — like Instagram's "Sua atividade". No other member's data, no names of others, never the member's engagement band (decision from 261012-fcr stays).
- D-02 **Placement:** a new section "Sua atividade" in the level-7 panel, BELOW the existing "Para você" cards (which stay unchanged, max 3). Period: a static, non-interactive period pill "Últimos 7 dias" (period selection is out of scope).
- D-03 **Example values for metrics that need collection (exception to 261012-fcr D-03, for this report only):** usage time, posts viewed, videos/reels watched, saves and shares have NO data source today, but the user asked to see them. Show them with fictional example values, each marked with a small neutral pill "exemplo" (catalog text) next to its value — no internal collection note ("Precisa registrar…") is ever shown to the member (261012-gf5 F-6 stays). Which metrics need which collection goes into the module README and the SUMMARY. Metrics whose data EXISTS today show plainly (no pill).

## Report content (in reading order)

1. **Tempo de uso** [exemplo — needs usage sessions]: KPI "Média por dia" 38 min (Δ −6 min vs. semana anterior; less time is NOT framed as bad or good — neutral sentiment), note "4 h 26 min na semana"; a 7-day bar or line chart (seg–dom) of minutes per day drawn to scale with the existing chart primitives (LineChart or a BarList by day — planner's call, reuse, no new chart lib); a line "Horário em que você mais usa: 20h–22h" [exemplo].
2. **Seu engajamento** (KPI grid, 2 columns, even count): Curtidas 46 (exists: feed_likes), Comentários 12 (exists: feed_comments), Salvamentos 9 [exemplo — needs saves], Compartilhamentos 3 [exemplo — needs shares]. Each with Δ vs. previous 7 days.
3. **O que você viu**: Posts vistos 128 [exemplo — needs content views], Vídeos e reels 41 assistidos · 1 h 12 min [exemplo — needs video watch sessions], Stories vistos 23 (exists: the member's OWN story_views — own data, no privacy issue). Use a BarList or KPI pair, planner's call.
4. **Onde você mais participa**: BarList of the member's interactions by community (Comunidade VIP 31, Geral 19, Eventos 8) — exists (likes+comments joined to feed_posts.community_id).
5. **Presença e constância**: "Presença nos encontros: 3 de 4" and "Sequência: 6 semanas" — these already exist on the profile header line from 261012-fcr; do NOT duplicate them: either move them into this section or link to them — planner's call, one place only.

Fixture values must be internally consistent (e.g. daily minutes sum to the weekly total; interactions by community ≤ likes+comments). Add the report data to the member fixture in `packages/modules/dashboard/fixtures/tenant-panels.ts` with a typed shape that marks example metrics (e.g. `{ value, example: true }`) so the UI derives the "exemplo" pill from data, not from hard-coded positions. Unit tests: weekly total = sum of days; community interactions ≤ likes + comments; every metric that lacks a source is typed as example.

## Verification

pnpm lint (incl. check-ui-literals), pnpm typecheck, pnpm test, pnpm boundaries, pnpm check:static-routes with placeholder env (API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder). Full preview Playwright suite (stop ONLY the :3000 listener via `lsof -nP -iTCP:3000 -sTCP:LISTEN -t`; never Chrome helpers) extended for the new section: present on level 7, "exemplo" pills present exactly on the example metrics, no "Ainda não medido"/"Precisa registrar" text on level 7, no horizontal scroll at 360/390/430 and inside the 440 px phone. Screenshots of level 7 framed 1440×900 (light + dark) and 390 full (light) into this task folder `screens/` (not committed). Delete any temporary screenshot spec and check `apps/web/e2e-preview/` for iCloud " 2" copies before finishing.
