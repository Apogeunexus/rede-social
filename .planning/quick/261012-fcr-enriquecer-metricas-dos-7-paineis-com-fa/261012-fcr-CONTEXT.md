# Quick 261012-fcr: enrich the 7 panels with engagement bands and activity metrics

Follow-up to quick 261011-jqy / -l72 / -ndw (dev-only `/painel-preview/<nivel>`, branch `feat/painel-preview`). Same constraints: FICTIONAL fixtures only (no API/DB/migration), catalog-only pt-BR strings, no hex in `.tsx`, tokens only, vertical scroll only, container queries (`@3xl`) for layout, alerts only in the header bell (never in the body), iPhone mockup from `lg`, dev-only gate untouched, Biome/boundaries/literal guard green. Spec author: data-story-architect (2026-10-11), approved by the user ("vamos continuar com o enriquecimento das métricas", 2026-10-12).

## Locked decisions

- D-01 **"Nível de membros" = engagement segmentation** (user's choice).
- D-02 **Privacy (preview assumption, user went with the recommendation):** no member names in at-risk/segment lists — counts and segment actions only; story views may appear as aggregate totals per story; never "who viewed". Any count below 5 shown to platform support (level 3) renders as "menos de 5".
- D-03 **Metrics without data today render as "Ainda não medido"** using the existing `KpiCard variant="missing"` pattern (like "Receita mensal"), or an equivalent "não medido" cell/line inside tables/lists — never a fake number presented as real. Each such item names what must be collected (short catalog text). Columns that need collection: reach, engagement-per-view, saves, shares (level 5), video retention (level 5 section), "novidades desde sua última visita" (level 7), product conversion (level 6). Show their fixture values ONLY if the planner prefers "valor de exemplo" labelling — default is "Ainda não medido".
  - NOTE: decide one consistent rule and state it in the SUMMARY.
- D-04 **No new chart components** unless unavoidable: bands distribution = `BarList` with `max` = total members, rows in band order (not by size), `rate` = %, highlight only "Em risco". Funnels via `BarList` + `funnelRates`/`largestDrop`.
- D-05 **Fix the fixture contradictions first** (all numbers below assume the fix):
  1. Igor's members: platform says 5,230 (`platform-panels.ts:119`, `:179`) vs client panel 1,240. Use **1,240**. Rebalance keeping total 8,430: `membersByClient` Dr. Igor Alves 1,240 · Instituto Aurora 3,110 · Rede Lab 1,760 · Escola Horizonte 1,210 · Outros 8 clientes 1,110 (Clube Corrida Sul 310 is inside those 1,110). Same values in the `clients` table; BarList order changes (Aurora now largest; the "maior cliente concentra X%" sentence must be computed, not typed).
  2. Igor's "interagiu": platform 46% vs client 38% → **38%** everywhere.
  3. Admin "membros que interagiram" 7d = 412 vs weekly chart last point 380 → use **380** in both.

## Engagement model (shared)

Population: `role='member'`, `status='active'` members of one tenant. Counted actions (v1, all exist today): like (light), comment (strong), post (strong), RSVP going (light), check-in/walk-in (strong), paid order (strong). Support messages and moderated comments do NOT count. Active day = calendar day (America/Sao_Paulo) with ≥1 counted action. Window 30 rolling days.

Bands, exclusive, evaluated in order:
1. **Novos** — joined < 30 days (sub-state "ativados" = ≥1 action).
2. **Superfãs** — ≥12 active days in 30 AND ≥3 strong actions in 30.
3. **Engajados** — ≥4 active days in 30.
4. **Ocasionais** — 1–3 active days in 30.
5. **Em risco** — 0 active days in last 30, ≥1 in days 31–60.
6. **Inativos** — 0 active days in 60.
"Interagiu" (existing KPI) = superfãs + engajados + ocasionais + novos ativados (so it always matches). Movement = band today vs 30 days ago (scale inativo 0, em risco 1, ocasional 2, engajado 3, superfã 4), excluding novos. Model these as typed fixture data + small pure helpers (e.g. band sum, interacted %, engaged %) with unit tests proving the sums match the KPIs.

## New metrics per level (≤ ~6 each; position relative to the current order)

### 1 Dono da plataforma
- 1.1 KPI **Membros engajados** 22% (Δ +1 pt), note "8,1 ações por membro ativo" → 6th KPI (grid even).
- 1.2 Section **Faixas de engajamento** (BarList) right AFTER "Clientes ativos, 12 meses".
- 1.3 Clients table: columns **Em risco %** (visible) and **Engajados %** (hidden on phone); "piores primeiro" = highest Em risco %.
- 1.4 Inside "Adoção de módulos": second list **Uso real** (% of active members who used the module in 30d).
- 1.5 KPI **Vendas nas lojas dos clientes** (30d) after "Receita mensal".
### 2 Admin da plataforma
- 2.1 Activation funnel last step **10 membros ativos** (clients: 2) → 8→5→4→4→3→2.
- 2.2 KPI **Alcance de push** 52% next to "Push com falha".
- 2.3 Bell item **queda de engajamento**: Escola Horizonte 17% → 12%.
- 2.4 Column **Vídeos parados** in "Falhas nas últimas 24h" (Rede Lab 2, others 0).
### 3 Suporte da plataforma (aggregates only)
- 3.1 KPI **Convites não aceitos** 37. 3.2 KPI **Novos que nunca agiram (7 dias)** 13, note "de 14 que entraram". 3.3 KPI **Atividade 24h vs. média** 2/h vs 6/h, −67%.
- 3.4 Collapsible **Engajamento (agregado)** after "Configuração": bands with "menos de 5" for superfãs.
- 3.5 Line **Alcance de push** 21% inside "Erros nas últimas 24h".
### 4 Dono do cliente (30d)
- 4.1 KPI **Engajados** 22% (Δ −2 pts, bad) → 6th KPI.
- 4.2 Section **Faixas de engajamento** after "Membros que interagiram por semana"; novos note "54 ativados".
- 4.3 In the same section: KPIs **Subiram** 77 / **Caíram** 171 + Collapsible "Ver movimentos" (BarList of the 4 biggest flows).
- 4.4 Section **Interações por post, por formato** after "Onde os membros interagem".
- 4.5 Section **Quem compra** (orders by band) after 4.4, with the computed sentence "X% das compras vêm de Y% dos membros".
- 4.6 ActionCard **Recuperar quem está em risco** (168 em risco · 69 com push) before "Conta", action disabled ("Avisar sobre o próximo evento").
### 5 Admin do cliente (7d)
- 5.1 / 5.2 / 5.3 "Posts que mais renderam": columns **Alcance %**, **Engaj. %**, **Salvamentos**, **Compartilhamentos** → per D-03 (needs collection).
- 5.4 Section **Vídeos e reels** after "Posts que mais renderam": per-video % assistido and conclusão → per D-03.
- 5.5 KPI **Entraram em risco nesta semana** 23 (note "9 com push") replacing "Interações por post" in the grid.
- 5.6 Note on "Novos membros": "15 de 28 ativados (54%)".
- Stories line (aggregate, D-02): "4 stories, média de 310 visualizações únicas (25%)" in the 5.4 section.
### 6 Equipe do cliente (per function block)
- Atendimento: KPI **Minha 1ª resposta (mediana, 7d)** 64 min; queue tag **novo** on a member who joined < 30 days (Rui Matos, 9 days).
- Moderação: KPI **Taxa de remoção (7d)** 0,9% (2 de 214) — "Removidos 7d" becomes its note; KPI **1º comentário de novos (24h)** 4.
- Conteúdo: per recent post **vs. mediana** text (+144%, +15%, "em andamento" < 48h).
- Loja: KPI **Acessos que vencem em 7 dias** 6 (note "Comunidade VIP"); **Conversão** per product → D-03.
### 7 Membro (own data only; never show the member's own band)
- 7.1 ActionCard **Seu acesso vence em 5 dias** (Comunidade VIP) with disabled "Renovar".
- 7.2 Support line in the profile header **Presença nos encontros: 3 de 4**.
- 7.3 ActionCard **Novidades desde sua última visita** (VIP, 5 posts) → D-03 (needs visits).
- 7.4 Support line **Sequência: 6 semanas** (shown only if ≥2).
- Card priority (max 3): event soon > support reply > access expiring > novidades/comunidade liberada.

## Fixture values (consistent with D-05)

Client Dr. Igor Alves (1,240 members, 30d): bands new 96 (newActivated 54), superfan 62, engaged 205, occasional 150, atRisk 168, inactive 559 (sum 1,240; interagiu 471 = 38%); engagedPercent 22, Δ −2 pts; actionsPerActiveMember 9,3; movement up 77, down 171, top flows ocasional→engajado 38, ativos→em risco 57, em risco→inativo 64, engajado→ocasional 41; atRiskWithPush 69; pushReach 58%. byFormat (61 posts): vídeo 18 posts 96/post, galeria 15 · 71, texto 20 · 48, link 8 · 23. ordersByBand: superfãs 31, engajados 38, ocasionais 14, novos 9, em risco 3, inativos 1 (96 orders).
Admin 7d: atRiskThisWeek 23 (9 com push); newActivation 15/28. Example values for D-03 columns if labelled as example: p1 reach 612 (49%) saves 22 shares 9; p2 188 (78% of 240 VIP) 15/0; p3 410 (33%) 31/4; p4 150 (12%) 6/2; videos p1 252 s 58% / 34%, reel-1 41 s 71% / 52%, reel-2 38 s 44% / 21%.
Team: myFirstResponseMedian 64 min; removal 2/214 = 0,9%; firstCommentsFromNew24h 4; recent posts vs median 52: +144%, +15%, em andamento; expiring7d 6 (Comunidade VIP); conversion Mentoria em grupo 6/420 = 1,4%.
Member (Ana Souza): access expires in 5 days (Comunidade VIP); attendance 3/4; streak 6 weeks; novidades VIP 5 posts.
Platform (12 clients, 8,430): bands new 480 (activated 296), superfan 380, engaged 1,440, occasional 1,340, atRisk 1,150, inactive 3,640 (sum 8,430; interagiu 3,456 = 41%); engaged 22% Δ +1 pt; actions per active member 8,1; clients engaged%/atRisk%: Corrida Sul 3/31 · Horizonte 12/24 · Lab 18/19 · Aurora 25/15 · Igor 22/14; module usage feed 96 · comunidades 64 · stories 38 · eventos 31 · loja 14 · suporte 9; store GMV 30d R$ 14.380,00 (Igor 8.940 + Aurora 5.440), Δ +9%; push reach 52%.
Support (Clube Corrida Sul, 310): invited 37; never acted 13 of 14; activity 2/h vs 6/h (−67%); bands new 22, superfan "<5" (real 2), engaged 8, occasional 27, atRisk 96, inactive 155; push reach 21%.

## Verification

pnpm lint (incl. check-ui-literals), pnpm typecheck, pnpm test (incl. new unit tests: band sums = members, interagiu % matches the existing KPI, platform member total 8,430, "menos de 5" rule), pnpm boundaries, pnpm check:static-routes — placeholder env API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder. Full preview Playwright suite (stop the listener on :3000 only — `lsof -nP -iTCP:3000 -sTCP:LISTEN -t`, never kill Chrome helpers) updated for the new sections, still no horizontal scroll at 360/390/430 and inside the 440 px phone, "Ainda não medido" present where D-03 applies. Screenshots per level framed 1440×900 (light) into this task folder `screens/` (not committed). NOTE: the project sits in an iCloud-synced Desktop; if `next dev` fails with a Turbopack "Failed to open database", delete only `apps/web/.next/dev/cache/turbopack` (gitignored).
