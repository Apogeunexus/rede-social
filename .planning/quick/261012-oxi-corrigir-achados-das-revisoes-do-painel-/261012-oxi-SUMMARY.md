---
phase: quick-261012-oxi
plan: 01
status: complete
subsystem: dashboard-preview
tags: [dashboard, preview, tenant-owner, review-fixes, pt-BR]
requires: [261012-o00 (painel do dono em seis áreas)]
provides:
  - "topBy(rows, score): destaque escolhido pelo valor (C-6)"
  - "byFormat com interações brutas por formato, por post calculado (C-4)"
  - "Pílulas corrigidas em Eventos (3) e Conteúdo (4); resumo do assunto líder em Atendimento"
  - "README do módulo: seção 'Para quando os dados reais forem ligados' (C-7, C-8)"
affects: [apps/web nível 4 da pré-visualização, módulo dashboard (métricas, fixture, README), e2e da pré-visualização]
tech-stack:
  added: []
  patterns: ["destaque por topBy (passada única, empate fica com o primeiro, sem semente 0)", "uma pílula por bloco de exemplo numa linha de nota, não por linha"]
key-files:
  created: []
  modified:
    - packages/modules/dashboard/ui/metrics.ts
    - packages/modules/dashboard/ui/index.ts
    - packages/modules/dashboard/fixtures/tenant-owner.ts
    - packages/modules/dashboard/tests/metrics.test.ts
    - packages/modules/dashboard/tests/tenant-owner.test.ts
    - packages/modules/dashboard/README.md
    - apps/web/components/dashboard/OwnerContent.tsx
    - apps/web/components/dashboard/OwnerEvents.tsx
    - apps/web/components/dashboard/OwnerSupport.tsx
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "Destaques do nível 4 (comunidade, melhor dia/horário, canal, comparecimento) escolhidos por topBy, nunca pela ordem do array (C-6)"
  - "Posts que mais renderam: uma única pílula 'exemplo' numa linha de nota, renderizada só enquanto algum salvamento/compartilhamento for exemplo (C-3)"
metrics:
  duration: "~8 min"
  completed: 2026-10-12
actuals:
  tokens: 7267
  tasks: 2
  commits: 4
---

# Quick 261012-oxi Plano 01: correções das revisões do painel do dono — Resumo

Helper puro `topBy` decide todo destaque do nível 4 pelo valor; `byFormat` passa a guardar interações brutas (1.729 / 1.067 / 960 / 184 = 3.940) com o "por post" calculado; pílulas de exemplo corrigidas (Eventos 3, Conteúdo 4), um só nome para comparecimento ("inscritos") e o resumo fechado de "Atendimentos por assunto" diz "Acesso e login lidera: 26 (35%)".

## Commits

| # | SHA | Mensagem |
|---|-----|----------|
| 1 (RED) | 8ac269ce | test(quick-261012-oxi): pin per-format interactions and value-picked highlights |
| 2 (GREEN) | c64c1c4d | fix(quick-261012-oxi): compute per-format interactions and pick highlights by value |
| 3 | 3fc0c943 | fix(quick-261012-oxi): one pill per example block, one name for attendance, subject leader in the summary |
| 4 | e181dfcd | docs(quick-261012-oxi): what the owner panel needs when real data is wired |

Portão TDD: `test(...)` (8ac269ce, 8 casos novos falhando por asserção/stub com typecheck verde) seguido de `fix(...)` (c64c1c4d, 184/184 verdes).

## Correções aplicadas (C-1..C-8)

- **C-1** `OwnerEvents.tsx`: "Conseguiram vaga" e "Foram ao evento" recebem `badge={exampleBadge(t, waitlist)}`. A seção Lista de espera tem 3 pílulas; a área Eventos, 3.
- **C-2** `dashboard.json`: `tenantOwner.kpi.attendanceNote` = "check-in ÷ inscritos", igual ao rodapé de Eventos. O rodapé do nível 5 (`tenantAdmin`, "confirmados") ficou como está, fora do escopo de C-2.
- **C-3** `OwnerContent.tsx`: sem pílula nas linhas de post (continuam "18 salvamentos · 7 compartilhamentos"); `postsExample` vem dos dados e, quando verdadeiro, mostra a linha "Curtidas e comentários são medidos; salvamentos e compartilhamentos são valores de exemplo." com UMA pílula. Os 3 KPIs (Alcance por post, % assistido, Conclusão) mantêm a pílula. Conteúdo: 4 pílulas.
- **C-4** `tenant-owner.ts`: `byFormat` = `{ type; posts; interactions }` com vídeo 18 · 1.729, galeria 15 · 1.067, texto 20 · 960, link 8 · 184. Tela calcula `perItem` → 96 / 71 / 48 / 23 (iguais a antes). Teste prova soma 3.940 = curtidas 3.100 + comentários 840 e posts = 61.
- **C-5** `OwnerSupport.tsx`: `leader = subjects[0]` (cópia já ordenada por conversas); resumo fechado = "{subject} lidera: {count} ({percent})" + pílula, no padrão de `OwnerFinance`. Renderiza "Acesso e login lidera: 26 (35%)".
- **C-6** `metrics.ts` `topBy`: uma passada, troca só com pontuação estritamente maior (empate fica com o primeiro), `undefined` sem linhas, sem semente 0. Usado em: comunidade "rende mais" e destaque da barra (`row.id === topCommunity.id`), melhor dia/horário, comparecimento por evento (`topBy(past, eventPercent)`, destaque `row.id === best?.id`). **Discricionário do planejador:** canal do topo (`topBy(channels, row => row.count)`) e destaque do canal. Testes giram e invertem as linhas da fixture: sempre c-vip (75), e1 (82%) e likes.
- **C-7** README: seção `#### Para quando os dados reais forem ligados` lista os seis blocos (Posts que mais renderam, Próximos eventos, Lista de espera, Atendimentos por assunto, Equipe, Conversão por produto) e o que cada um renderiza hoje sem linhas. Estados vazios NÃO implementados (por desenho).
- **C-8** README: nível 6 (`TenantStaffPanel`, `tenantStaffPanel.store.expiringAccess7d`) mostra "Acessos que vencem em 7 dias: 6" como medido, mas `expires_at` nunca é gravado; nível 4 mostra o mesmo 6 com pílula. Dois caminhos para fechar registrados.
- O parágrafo da regra "exemplo" no README agora diz que os top posts levam uma pílula por bloco.

## Evidência dos portões

Ambiente provisório inline: `API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder`.

| Comando | Resultado |
|---------|-----------|
| checagem node do catálogo | `catalog OK` |
| `pnpm lint` (turbo lint + check-ui-literals) | exit 0 — 16/16 tasks; check-ui-literals OK |
| `pnpm typecheck` | exit 0 — 18/18 tasks |
| `pnpm test` | exit 0 — 15/15 tasks; web 2400/2400; module-dashboard 184/184 |
| `pnpm boundaries` | exit 0 — "Checked 1281 files in 16 packages, no issues found" |
| `pnpm check:static-routes` | exit 0 — "no authenticated or host-branded route is static" |
| Playwright `-g "dono-do-cliente"` (Tarefa 1) | 40 passed |
| Playwright suíte completa da pré-visualização | 129 passed (1.5m), exit 0 |
| `git diff --quiet d8e8155c -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx "apps/web/app/painel-preview/[nivel]/page.tsx"` | `gate OK` |
| `find apps/web/e2e-preview packages/modules/dashboard apps/web/components/dashboard -name '* 2*'` | nada impresso |

Antes de cada execução do Playwright só o processo de `lsof -nP -iTCP:3000 -sTCP:LISTEN -t` foi parado (next-server pid 60000 na primeira; nas seguintes, nenhum ouvinte). O servidor de desenvolvimento não foi reiniciado.

## Capturas (não versionadas)

- `.planning/quick/261012-oxi-corrigir-achados-das-revisoes-do-painel-/screens/dono-do-cliente-conteudo-1440-light.png` — linha de nota com uma pílula; nenhuma pílula nas linhas
- `.planning/quick/261012-oxi-corrigir-achados-das-revisoes-do-painel-/screens/dono-do-cliente-eventos-1440-light.png` — topo da área (o quadro do iPhone rola por dentro, então os cartões da espera ficam abaixo)
- `.planning/quick/261012-oxi-corrigir-achados-das-revisoes-do-painel-/screens/dono-do-cliente-eventos-lista-de-espera-1440-light.png` — extra, rolada até "Conseguiram vaga 15 exemplo" e "Foram ao evento 10 exemplo"
- `.planning/quick/261012-oxi-corrigir-achados-das-revisoes-do-painel-/screens/dono-do-cliente-atendimento-1440-light.png` — "Acesso e login lidera: 26 (35%)" + pílula no bloco fechado

Nenhum erro de console nas quatro capturas (asserção na spec temporária, já apagada).

## Desvios do plano

1. **[Regra 1 - correção no README] Plural de zero em pt-BR** — Encontrado na Tarefa 2 ao descrever o estado sem linhas da Lista de espera. `Intl.PluralRules('pt-BR').select(0)` retorna `one`, então a frase hoje sairia "0 pessoa entrou na espera de 0 evento lotado", não "0 pessoas…". O README registra a frase real. Commit e181dfcd.
2. **Captura extra** de Eventos rolada até os cartões da lista de espera, porque a captura de página inteira não mostra o conteúdo que rola dentro do quadro do iPhone. As três capturas do plano continuam lá.
3. **Comparação do destaque da comunidade/canal** usa `topCommunity.id` / `topChannel.channel` (sem `?.`), porque o `const` já está estreitado dentro do ramo `topCommunity ? … : null`; mesmo comportamento do plano.

## Observações fora do escopo

- Durante o Playwright, o log do `next dev` ([WebServer]) mostra um diff `open={false}` vs `open=""` em `<details>` do `Collapsible` (`packages/modules/dashboard/ui/Collapsible.tsx`, sem mudanças desde b6504a7f). Não falha nenhum teste nem gera erro de console nas capturas; não foi mexido.

## Self-Check: PASSED

- FOUND: os 11 arquivos modificados (git diff 08005185..HEAD, 11 files changed)
- FOUND: 8ac269ce, c64c1c4d, 3fc0c943, e181dfcd em `git log`
- FOUND: 4 PNGs em `screens/`; spec temporária apagada (`apps/web/e2e-preview/` só tem `painel-preview.spec.ts`)

**⚠️ NÃO FEITO**
- Re-revisão do critic e do flow-critic: este executor não consegue lançar subagentes; falta o orquestrador rodá-las sobre 8ac269ce..e181dfcd.
- Passada humana em tema escuro e 390 px: só as capturas claras de 1440×900 foram feitas; falta alguém abrir `/painel-preview/dono-do-cliente?area=conteudo|eventos|atendimento` no escuro e a 390 px.
- Estados vazios dos seis blocos (C-7): só documentados no README, por desenho; fecham quando os dados reais forem ligados.


## Revisões (orquestrador, após a execução)

- **critic: APROVADO**, sem achado crítico/alto/médio. Leve 1 (nível 5 ainda dizia "confirmados") → corrigido logo depois, num commit rápido. Leve 2 (pílulas e destaques só cobertos pelo e2e, não por teste de unidade do JSX) → aceito; a suíte Playwright cobre e passou 129/129.
- **flow-critic: APROVADO**, sem achados.
