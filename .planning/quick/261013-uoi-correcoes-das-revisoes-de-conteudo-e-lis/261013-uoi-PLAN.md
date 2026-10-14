---
phase: quick-261013-uoi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/modules/dashboard/fixtures/owner-members.ts
  - packages/modules/dashboard/fixtures/owner-member-lists.ts
  - packages/modules/dashboard/fixtures/owner-member-insights.ts
  - packages/modules/dashboard/fixtures/owner-content.ts
  - packages/modules/dashboard/fixtures/owner-posts.ts
  - packages/modules/dashboard/tests/owner-member-lists.test.ts
  - packages/modules/dashboard/tests/owner-member-insights.test.ts
  - packages/modules/dashboard/tests/owner-content.test.ts
  - packages/modules/dashboard/README.md
  - packages/modules/dashboard/ui/LineChart.tsx
  - packages/modules/dashboard/tests/charts.test.tsx
  - apps/web/components/dashboard/CoverThumb.tsx
  - apps/web/components/dashboard/CoverThumb.test.tsx
  - apps/web/components/dashboard/format.ts
  - apps/web/components/dashboard/OwnerContentPeople.tsx
  - apps/web/components/dashboard/OwnerContentReplies.tsx
  - apps/web/components/dashboard/OwnerContentReplies.test.tsx
  - apps/web/components/dashboard/OwnerMemberList.test.tsx
  - apps/web/lib/owner-content-view.ts
  - apps/web/lib/owner-content-view.test.ts
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, PWA-03, MOD-02, UI-03]
tags: [dashboard, preview, owner-member-lists, owner-member-insights, content, line-chart, cover-thumb, pt-BR]

estimate:
  tokens: 200000
  raw_tokens: 200000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Decisão nova + C-1/F-2: os comentários de cada membro em 30 dias ficam na faixa da tabela (superfã 6–9, engajado 3–5, ocasional 1–2, novo 0–2, em risco e inativo 0), no máximo 2 por dia; o roster soma 168 comentários (96 em 2f39aec6, 527 na orf); curtidas, dias ativos, check-ins e pedidos dos 72 membros são os mesmos de 2f39aec6. Toda lista de pessoas com número > 0 tem pelo menos 1 pessoa e mostra no máximo 10, com \"e mais N\" na unidade da lista e a linha \"Mostrando quem está na amostra de membros.\""
    - "C-3: o comentário sem resposta mais antigo de cada publicação está exatamente na espera registrada, contada a partir das 23:00 de 12/10 (op-04: \"Comentou hoje às 14:00\" ao lado de \"o mais antigo há 9 h\"; op-19: \"há 8 dias\"), e nenhum comentário da publicação é anterior a ele."
    - "F-1: no dia da última atividade de cada membro, só a ação mais recente leva o horário de `lastActive`; as outras têm horários anteriores, distintos e determinísticos; nenhum membro tem mais de 6 curtidas num mesmo dia (antes: até 23; om-13 tinha 13 \"curtido hoje 22:40\")."
    - "C-2: no `LineChart`, o último rótulo do eixo x nunca encosta no anterior (folga ≥ 2 px a 360 px) nem sai do gráfico: nível 1 \"Clientes ativos por mês\" e S12 do nível 4; a retenção segue 0:00 · 0:20 · 0:41."
    - "F-3/F-5/F-6: no cartão compacto a miniatura ocupa uma coluna fixa de 4,5rem (altura pela proporção, até 7rem); a 360/390/430 px, em `?area=conteudo&vista=tipos&tipo=video`, o título ocupa no máximo 2 linhas, os 4 números ficam numa linha e o texto tem a mesma largura em todo cartão; story é um círculo com o anel da marca e ícone próprio; os 5 tons variam pelo ângulo do degradê entre `--brand-primary` e `--brand-secondary`."
    - "F-4/F-7: todo \"quando\" lê \"hoje às 22:40\" / \"ontem às 18:20\" / \"ontem\" / \"há N dias\" pela chave global `moment`; a publicação no topo de \"Comentários sem resposta\" é um link para `?area=conteudo&post=<id>`, cujo Voltar leva a `#atencao-<id>`; o Voltar da tela de respostas não muda."
    - "Gates verdes com o ambiente provisório: pnpm lint (com a guarda de literais), typecheck, test, boundaries, check:static-routes e a suíte Playwright do preview inteira; trava de produção sem diff desde eeab1d39; sem rolagem lateral; 4 capturas em `screens/` (não versionadas). Sem publicar."
  artifacts:
    - path: packages/modules/dashboard/fixtures/owner-members.ts
      provides: "o \"agora\" do preview (23:00) e a conversão de uma espera em horas para dia e horário"
      contains: "export function momentHoursAgo"
    - path: packages/modules/dashboard/fixtures/owner-member-lists.ts
      provides: "atribuição de curtidas e comentários com orçamento realista e horários por ação"
      contains: "export function assignRosterInteractions"
    - path: packages/modules/dashboard/fixtures/owner-member-insights.ts
      provides: "tabela de comentários por faixa restaurada"
      contains: "const COMMENTS"
    - path: packages/modules/dashboard/ui/LineChart.tsx
      provides: "rótulo final sem colisão"
      contains: "data-x-label"
    - path: apps/web/components/dashboard/CoverThumb.tsx
      provides: "coluna fixa no cartão, story em círculo, tons por ângulo"
      contains: "CircleDashed"
    - path: apps/web/components/dashboard/OwnerContentReplies.tsx
      provides: "cabeçalho com link para o detalhe"
      contains: "Linked"
  key_links:
    - from: packages/modules/dashboard/fixtures/owner-member-insights.ts
      to: packages/modules/dashboard/fixtures/owner-member-lists.ts
      via: "a base de cada membro leva o orçamento de comentários (COMMENTS) para assignRosterInteractions"
      pattern: "assignRosterInteractions\\("
    - from: packages/modules/dashboard/fixtures/owner-member-lists.ts
      to: packages/modules/dashboard/fixtures/owner-members.ts
      via: "o comentário sem resposta mais antigo nasce em momentHoursAgo(espera)"
      pattern: "momentHoursAgo\\("
    - from: apps/web/components/dashboard/OwnerContentReplies.tsx
      to: apps/web/lib/owner-content-view.ts
      via: "o cabeçalho usa ownerContentHref com postId; contentBackHref devolve #atencao- para esse detalhe"
      pattern: "ownerContentHref\\("
---

<objective>
Corrigir os achados das revisões da 261013-orf (C-1..C-3, F-1..F-7) e aplicar a decisão nova sobre listas de pessoas e atividade realista, na branch `feat/painel-preview` (HEAD eeab1d39). C-4 (SHAs do SUMMARY da orf) é do orquestrador e não entra.

Propósito: os membros fictícios voltam a ter atividade crível (comentários perto de 2f39aec6, horários que não se repetem), toda espera de comentário bate com a data e a hora mostradas, e a tela fica limpa no celular (eixo sem rótulos colados, cartão de vídeo horizontal sem quebra, story reconhecível, tons distintos, "quando" num formato só, cabeçalho de respostas clicável).
Saída: fixtures e testes de unidade ajustados, `LineChart`, `CoverThumb`, catálogo, tela de respostas, e2e, gates verdes, 4 capturas e SUMMARY com a comparação com 2f39aec6.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/quick/261013-uoi-correcoes-das-revisoes-de-conteudo-e-lis/261013-uoi-CONTEXT.md
@.planning/quick/261013-orf-capa-da-publicacao-nas-listas-de-curtida/261013-orf-SUMMARY.md
@apps/web/AGENTS.md

Fatos conferidos pelo planejador (HEAD eeab1d39; sondas tsx sobre as fixtures, fora do repositório):
- Comentários hoje: `assignRosterInteractions` (owner-member-lists.ts:195-220) dá a cada post min(comentários, 10, elegíveis) comentaristas; a contagem do membro é o que sobrou disso (owner-member-insights.ts:281-282), e a tabela `COMMENTS` de 2f39aec6 foi apagada. Resultado: 527 comentários; superfãs com 26 a 36.
- 2f39aec6 (`git show 2f39aec6:packages/modules/dashboard/fixtures/owner-member-insights.ts`): `COMMENTS` = novo `j % 3`, superfã `3 + (j % 4)`, engajado `1 + (j % 3)`, ocasional `j % 2`, em risco/inativo 0 — total 96 (54 / 24 / 6 / 12).
- Roster ativo: 48 membros. Dias ativos: novo 2–6, superfã 14–19, engajado 4–11, ocasional 1–3. Ativos hoje (lastActive dia 0): om-01 e om-13 (22:40), om-14 (21:15), om-15 (20:30), om-16 (19:05), om-25 (22:40). O maior `lastActive.time` é 22:40 (`TIMES`, owner-members.ts:141).
- Esperas (`OWNER_POST_UNANSWERED`, owner-posts.ts:275-283): op-02 [1, 3 h] (idade 0, c-geral), op-03 [2, 18 h] (idade 1, c-vip), op-04 [1, 9 h] (idade 1, c-geral), op-08 [3, 60 h], op-12 [4, 110 h], op-19 [9, 192 h], op-24 [2, 250 h]. Hoje só a espera ≥ 48 h é respeitada (owner-member-lists.ts:196-197): op-04 mostra "Comentou ontem às 12:35" com "há 9 h".
- F-1: `moment` (owner-member-lists.ts:265-266) copia `lastActive` em toda ação do dia; o dia da curtida é o mais recente livre ou, senão, o mais recente (linhas 160-162), e as sobras vão em rodízio a partir do dia mais recente (168-189). Hoje: até 23 curtidas no último dia de um membro.
- Protótipo das curtidas (só a escolha do dia trocada para "dia permitido com menos curtidas, empate o mais recente", nas duas passadas): máximo 6 curtidas num dia (om-36, 20 curtidas em 7 dias, preso aos posts publicados até cada dia), om-13 com 3 no último dia, nenhum dia ativo sem ação, total 663 inalterado.
- Protótipo dos comentários com a ordem da Tarefa 1 e a tabela da PD-A: 168 comentários, 61/61 posts com pelo menos 1 comentarista, no máximo 9 por post, no máximo 2 por membro por dia; op-02 → om-13, op-04 → om-14, op-03 → om-15 + om-16, op-19 com 9 comentaristas a partir de "há 8 dias".
- `answerFlags` (owner-content.ts:349-358) marca como sem resposta os n comentários mais antigos do roster; `byRecency` de owner-content.ts:305 já ordena por dia e horário. `ownerContentUnanswered` lê esses n. Os testes fixam 527 comentários (owner-content.test.ts:264) e 1.190 interações (linha 453); viram 168 e 831 (663 + 168).
- `LineChart` (ui/LineChart.tsx:117-133): o último rótulo é ancorado no fim desde a orf. Nível 1 (PlatformOwnerPanel.tsx:151-153) rotula os meses pares e o último: "set" (índice 10) e "out" (11) ficam colados. Nível 4 rotula S4, S8, S12 (OwnerOverview.tsx:85-87).
- `CoverThumb` (CoverThumb.tsx:69-111): cartão com largura 7rem × proporção e `maxWidth: 8rem`, então um vídeo 16:9 ocupa 8rem e espreme o texto a 360 px. A 360 px o texto do cartão com coluna de 4,5rem tem ~190 px, e os 4 números (≤ 2 dígitos) ~164 px.
- Story hoje usa o mesmo ▶ do vídeo (`COVER_ICON.story = Play`) e `rounded-lg`. `CircleDashed` existe em lucide-react@1.46.0 (`dist/esm/icons/circle-dashed.mjs`). Os tons hoje são 5 posições do mesmo `--brand-gradient` (CoverThumb.tsx:31-55); tokens em packages/ui/src/styles/tokens.css:64-65 e :149.
- Catálogo: `moment` global (dashboard.json:90) sem "às"; `tenantOwner.content.people.moment` (linha 851) com "às"; `momentText` (format.ts:241) e `personMoment` (OwnerContentPeople.tsx:39) convivem.
- Tela de respostas (OwnerContentReplies.tsx:31-44): miniatura + legenda + meta sem link. `contentBackHref` (owner-content-view.ts:251-276) manda Visão geral + post para `#post-<id>`, âncora que só existe nas 3 melhores (op-41, op-55, op-37; nenhuma precisa de atenção). `Linked` (BandScopeCards.tsx:78) é o link de cartão já usado.
- Observação fora do escopo: o evento u1 "Encontro mensal" está como próximo hoje às 19h (tenant-owner.ts:545-549), mas há membros ativos hoje às 22:40; a contradição já existia.

Decisões do planejador (discrição):
- PD-A Tabela de comentários mais perto de 2f39aec6 dentro da faixa travada: novo `j % 3` (0–2, igual), superfã `6 + (j % 4)` (6–9), engajado `3 + (j % 3)` (3–5), ocasional `1 + (j % 2)` (1–2), em risco/inativo 0. Total 168 (90 / 48 / 18 / 12). Ocasional com 1 dia ativo fica com até 2 comentários nesse dia, dentro do limite.
- PD-B "Agora" do preview = 23:00 de PREVIEW_TODAY (`PREVIEW_NOW_TIME`, depois do último 22:40). `momentHoursAgo(horas)`: minutos = 23×60 − 60×horas; `daysAgo` = max(0, ⌈−minutos/1440⌉); `time` = HH:MM de minutos + 1440×daysAgo. 3 → hoje 20:00; 9 → hoje 14:00; 18 → hoje 05:00; 60 → 2 dias 11:00; 110 → 4 dias 09:00; 192 → 8 dias 23:00; 250 → 10 dias 13:00. `daysAgo` = ⌊horas/24⌋ para toda espera inteira, então "há N dias" continua batendo.
- PD-C Ordem dos comentários (validada no protótipo): (a) posts com espera, (b) um comentarista para cada post ainda sem ninguém, (c) o resto do orçamento. Detalhe na Tarefa 1.
- PD-D Horários do último dia: a ação mais recente leva `lastActive.time`; cada próxima, 35 min antes; horários já usados no dia são pulados.
- PD-E Curtidas: o alvo de até 10 curtidores por post continua (o orçamento de curtidas é fixo, então ele só decide em qual post), e só a escolha do dia muda.
- PD-F `LineChart`: o último rótulo segue ancorado no fim; o rótulo anterior não é desenhado quando encostaria (largura estimada = caracteres × 11 × 0,6, folga de 4 unidades).
- PD-G Cartão: coluna de 4,5rem; a capa tem largura min(4,5; 7 × proporção) rem calculada em JS (o happy-dom descarta `min()`) e `aspect-ratio` da proporção, centralizada na coluna.
- PD-H Story: círculo (proporção 1, `rounded-full`) com o anel da marca nos dois tamanhos, ícone `CircleDashed`. O ▶ "Assistir" do detalhe não muda.
- PD-I Tons: ângulos 0, 72, 144, 216 e 288 graus de `linear-gradient(<ângulo>deg, var(--brand-primary), var(--brand-secondary))`, escolhidos pela mesma soma dos códigos do id.
- PD-J F-7: o cabeçalho da tela de respostas abre `?area=conteudo&post=<id>` (Visão geral + publicação, já aceito pelo parser). Para essa combinação, quando a publicação precisa de atenção, o Voltar do detalhe vai para `#atencao-<id>`, porque `#post-<id>` não existe na Visão geral.
- PD-K Linha da amostra: chave `tenantOwner.content.people.sample` = "Mostrando quem está na amostra de membros.", só quando a lista tem menos pessoas que o número.
- PD-L F-4: a chave global `moment` ganha o `select` de horário; `momentText` passa `timed`; a chave `people.moment` e a função de momento própria de OwnerContentPeople são apagadas; Conteúdo e respostas usam `momentText`.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Tarefa 1: atividade realista dos membros, esperas exatas e horários do dia (decisão nova, C-1, F-2, C-3, F-1)</name>
  <files>packages/modules/dashboard/fixtures/owner-members.ts, packages/modules/dashboard/fixtures/owner-member-lists.ts, packages/modules/dashboard/fixtures/owner-member-insights.ts, packages/modules/dashboard/fixtures/owner-content.ts, packages/modules/dashboard/fixtures/owner-posts.ts, packages/modules/dashboard/tests/owner-member-lists.test.ts, packages/modules/dashboard/tests/owner-member-insights.test.ts, packages/modules/dashboard/tests/owner-content.test.ts, packages/modules/dashboard/README.md, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>packages/modules/dashboard/fixtures/owner-member-lists.ts, packages/modules/dashboard/fixtures/owner-member-insights.ts (e a versão de 2f39aec6), packages/modules/dashboard/fixtures/owner-content.ts:296-430, packages/modules/dashboard/fixtures/owner-posts.ts:265-283, packages/modules/dashboard/tests/owner-content.test.ts:223-330 e 586-690</read_first>
  <behavior>
    - owner-member-insights.test: cada membro tem `last30.comments` na faixa (superfã 6–12, engajado 3–8, ocasional 1–3, novo 0–3, em risco/inativo 0) e igual à fórmula da PD-A; o roster soma 168 (90 / 48 / 18 / 12); `strongActions` = comentários + check-ins + pedidos (já existe).
    - owner-member-lists.test: no máximo 2 comentários por membro por dia; nenhum membro com mais de 6 curtidas num dia; no dia de `lastActive`, toda ação tem horário, os horários são distintos e nunca depois de `lastActive.time`, e exatamente uma ação tem esse horário; nos outros dias só o comentário sem resposta mais antigo tem horário (o mesmo valor em Comentários e Ações fortes).
    - owner-content.test: `momentHoursAgo` com os 7 casos da PD-B e `daysAgo` = ⌊h/24⌋ para h = 0..300; para cada publicação com espera, o primeiro de `ownerContentUnanswered` tem exatamente `momentHoursAgo(horas)` (op-04 = hoje 14:00, op-02 = hoje 20:00, op-03 = hoje 05:00) e nenhum comentarista da publicação é anterior a ele (dia maior, ou mesmo dia com horário menor); o bloco CEILING / min(total, 10) vira "toda lista com número > 0 tem ≥ 1 pessoa" e "comentaristas do roster ≤ min(comentários, 10)"; 527 → 168 e 1.190 → 831.
  </behavior>
  <action>
RED primeiro (commit test): escreva os testes do `<behavior>` e confirme que falham pelo motivo certo (função ausente, 26–36 comentários, 13+ curtidas no mesmo dia, horário repetido, op-04 em "ontem").

GREEN (commit fix):
1. owner-members.ts (PD-B): exporte `PREVIEW_NOW_TIME = '23:00'` ao lado de PREVIEW_TODAY e `momentHoursAgo(hours): RelativeMoment` com a fórmula da PD-B. Comentário curto do porquê: depois do último 22:40, e transforma uma espera em dia e horário.
2. owner-member-insights.ts (C-1, PD-A): volte a tabela `COMMENTS` por faixa com a fórmula da PD-A. `baseOf` devolve `comments` (0 sem dias ativos). `rosterInteractions` passa `comments` na base. `build` continua com a contagem da atribuição: a checagem de comprimento existente pega qualquer divergência. Mantenha `lifetime = Math.max(...)`. Atualize o comentário do topo (regra da 261013-uoi no lugar do E-03.1).
3. owner-member-lists.ts:
   - `RosterInteractionBase` ganha `comments` (orçamento, todo colocado). `RosterInteraction` ganha `time?: string`, só no comentário sem resposta mais antigo.
   - Curtidas (F-1, PD-E): mesmas regras de quem curte. Nas duas passadas, o dia passa a ser o dia ativo ≤ idade do post com menos curtidas do membro até ali (empate: o mais recente). Na segunda passada, cada curtida que sobra vai, uma a uma, para o dia ativo com menos curtidas que ainda tem um post publicado até ele, alcançável, não curtido e abaixo das curtidas do post; nesse dia, o post mais novo assim. O KPI e o total de 663 não mudam.
   - Comentários (C-1, F-2, C-3, PD-C), no lugar da cobertura de 10:
     (a) publicações de OWNER_POST_UNANSWERED, da menor espera para a maior. O mais antigo fica em `momentHoursAgo(horas)` (dia d0, hora t0). O autor alcança a comunidade, tem d0 como dia ativo, ainda tem orçamento, tem menos de 2 comentários em d0 e, se d0 é o dia do seu `lastActive`, `lastActive.time` > t0. Depois vêm mais n−1 comentaristas: em dias ativos < d0 quando d0 ≥ 1, ou hoje quando d0 = 0. A publicação com d0 = 0 fica fechada com exatamente n comentaristas. Nas outras, todo comentário seguinte cai em dia < d0.
     (b) toda publicação ainda sem comentarista ganha um, da mais nova para a mais antiga.
     (c) o orçamento que sobra a cada membro, na ordem do roster: a publicação alcançável que ele ainda não comentou, com menos comentaristas e abaixo de min(comentários, 10); empate: a mais nova.
     Em (a), (b) e (c) vale:
     - um comentário por membro por publicação;
     - o dia é ativo e cabe no limite da publicação (a idade, ou < d0);
     - o dia escolhido é o permitido com menos comentários do membro (empate: o mais recente);
     - nunca 3 comentários no mesmo dia;
     - quem comenta primeiro: superfã, engajado, novo, ocasional; depois quem tem menos comentários; depois a ordem do roster.
     Lance erro se um membro não conseguir colocar o orçamento todo ou se uma publicação com comentários ficar sem ninguém.
   - `buildOwnerMemberLists` (F-1, PD-D): um horário por ação, calculado uma vez e reaproveitado em Curtidas, Comentários, Ações fortes, Dias ativos e Posts vistos. A ação com `time` fixo o mantém. No dia de `lastActive`, as demais ações do dia (curtidas, comentários, check-ins, pedido), na ordem atual das listas, recebem `lastActive.time` na primeira e 35 min a menos em cada próxima, pulando horários já usados no dia. Nos outros dias, nada muda. O `byRecency` do arquivo ordena por dia e, no mesmo dia, por horário decrescente.
   - Reescreva o JSDoc de `assignRosterInteractions` e o comentário do topo com a regra nova: pelo menos 1 e no máximo 10 na tela; o roster é uma amostra.
4. owner-content.ts: só o parágrafo "People (P1)" (regra nova). `answerFlags` não muda: os n mais antigos do roster continuam sendo os sem resposta e agora nunca são anteriores à espera. owner-posts.ts: comentário de OWNER_POST_UNANSWERED (o mais antigo fica exatamente em `momentHoursAgo`).
5. README.md do módulo: troque as frases de min(…, 10) e do teto (por volta das linhas 232 e 281) pela regra nova, com a tabela de comentários.
6. e2e (nos blocos `dono-do-cliente membros`/`conteudo`):
   - `?area=conteudo&vista=publicacoes&post=op-04&quem=comentarios`: o primeiro cartão diz "Sem resposta" e "Comentou hoje às 14:00"; o detalhe `&post=op-04` diz "o mais antigo há 9 h".
   - `?area=membros&faixa=superfas&membro=om-13&lista=curtidas`: os horários de "hoje" (regex `hoje (às )?(\d{2}:\d{2})`) são distintos e 22:40 aparece no máximo uma vez.
   - O teste HTTP das 292 listas (≥ 1 cartão quando o número > 0) continua.
   - Ajuste o que fixava números antigos.
7. Comparação com 2f39aec6 (para o SUMMARY): extraia `packages/modules/dashboard/{fixtures,ui}` de 2f39aec6 com `git archive` para o scratchpad e rode uma sonda tsx nas duas versões. Tabela por faixa de comentários e ações fortes (antes → depois). Confirme que curtidas, dias ativos, check-ins e pedidos ficaram iguais nos 72 membros. Cite quem mudou `communities[0].actions` pelo `Math.max`.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/module-dashboard exec vitest run && pnpm typecheck && cd apps/web && pnpm exec playwright test --config playwright.preview.config.ts --grep "dono-do-cliente (membros|conteudo)"</automated>
  </verify>
  <done>
    - O vermelho falhou antes do verde.
    - Unidade e e2e de membros/conteúdo verdes.
    - 168 comentários na faixa, no máximo 2 por dia.
    - op-04 lê "hoje às 14:00" e "há 9 h".
    - om-13 sem horário repetido.
    - Nenhuma lista com número > 0 vazia.
    - A tabela de comparação com 2f39aec6 está pronta para o SUMMARY.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Tarefa 2: rótulo do eixo, cartão compacto, story e tons (C-2, F-3, F-5, F-6)</name>
  <files>packages/modules/dashboard/ui/LineChart.tsx, packages/modules/dashboard/tests/charts.test.tsx, apps/web/components/dashboard/CoverThumb.tsx, apps/web/components/dashboard/CoverThumb.test.tsx, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>packages/modules/dashboard/ui/LineChart.tsx, apps/web/components/dashboard/CoverThumb.tsx, apps/web/components/dashboard/OwnerContentPostCard.tsx:64-188 (só leitura), apps/web/components/dashboard/PlatformOwnerPanel.tsx:146-158, apps/web/e2e-preview/painel-preview.spec.ts:1700-1760 e 1834-1850</read_first>
  <behavior>
    - charts.test: com 12 pontos e rótulos nos índices pares e no 11 (3 letras), o rótulo do índice 10 não é desenhado e o 11 tem `text-anchor="end"`; com 12 pontos e S4/S8/S12 nos índices 3/7/11, os 3 aparecem; com 11 pontos e 0:00/0:20/0:41 nos índices 0/5/10, os 3 aparecem.
    - CoverThumb.test: o cartão tem a coluna de 4,5rem e a capa com largura min(4,5; 7 × proporção) rem (9:16 → 3.938rem, 16:9 → 4.500rem, texto → 4.500rem) e `aspect-ratio` da proporção, sem `max-width`; story tem `rounded-full`, `ring-2` e o ícone `lucide-circle-dashed` nos dois tamanhos, com `data-ratio` "1" no cartão; vídeo segue com `lucide-play` e `rounded-lg`; `coverStyle(seed).backgroundImage` é `linear-gradient(<ângulo>deg, var(--brand-primary), var(--brand-secondary))` com 5 ângulos distintos e p01..p05 em 5 tons.
  </behavior>
  <action>
RED primeiro (commit test), depois GREEN (commit fix).

1. LineChart.tsx (C-2, PD-F): mantenha o último rótulo ancorado no fim. Ache o último rótulo não vazio e o anterior não vazio. Largura estimada = caracteres × LABEL_SIZE × 0,6. Se a borda direita do anterior (x + largura/2) + 4 passar da borda esquerda do último (x − largura), não desenhe o anterior. Só esse rótulo cai. Comentário curto do porquê: "set"/"out" colados no nível 1.
2. CoverThumb.tsx:
   - F-3, PD-G: no `card`, um invólucro de coluna fixa (`w-[4.5rem] shrink-0 flex justify-center`) e, dentro, a capa com `data-testid="cover-thumb"`, `data-kind` e `data-ratio`, largura `${Math.min(4.5, 7 × proporção).toFixed(3)}rem` e `aspectRatio` da proporção. Some o `maxWidth` de 8rem. A linha de 56 px não muda.
   - F-5, PD-H: `COVER_ICON.story` = `CircleDashed`. Story é `rounded-full` com o anel atual nos dois tamanhos. No cartão, a proporção do story é 1, um círculo de 4,5rem.
   - F-6, PD-I: `COVER_TONES` = os 5 ângulos. `coverTone` devolve o ângulo pela mesma soma. `coverStyle` usa `backgroundImage: linear-gradient(<ângulo>deg, var(--brand-primary), var(--brand-secondary))` e a cor `var(--brand-on-primary)`, sem `backgroundSize`/`backgroundPosition`. Só tokens da marca. Atualize os JSDoc (PD-B → PD-I).
3. e2e:
   - Nível 1 (`/painel-preview/dono-da-plataforma`, 360×844, svg "Clientes ativos por mês"): os `[data-x-label]` em ordem de x têm folga ≥ 2 px entre vizinhos e ficam dentro da caixa do svg.
   - Nível 4 (Visão geral, svg "Membros que interagiram por semana"): S4, S8 e S12 presentes, com as mesmas checagens.
   - F-3: em `?area=conteudo&vista=tipos&tipo=video`, a 360, 390 e 430:
     - em cada cartão, o título (`.line-clamp-2`) tem altura ≤ 2 × line-height + 1;
     - os 4 `[data-count]` têm o mesmo topo (±2 px);
     - a coluna de texto tem a mesma largura em todos os cartões (±1 px);
     - sem rolagem lateral.
   - O primeiro cartão de vídeo vertical continua 0.5625 e ~112 px.
   - F-5: em `/painel-preview/membro?lista=stories`, toda miniatura `[data-kind="story"]` tem `rounded-full`.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/module-dashboard exec vitest run tests/charts.test.tsx && pnpm --filter @rede-social/web exec vitest run components/dashboard/CoverThumb.test.tsx && pnpm typecheck && cd apps/web && pnpm exec playwright test --config playwright.preview.config.ts --grep "dono-da-plataforma|dono-do-cliente|membro(:| \?lista=)"</automated>
  </verify>
  <done>
    - O vermelho falhou antes do verde.
    - "set" some e "out" fica inteiro a 360 px.
    - S12 está dentro do gráfico.
    - O cartão de vídeo 16:9 a 360 px tem título em ≤ 2 linhas e os 4 números numa linha.
    - Story é um círculo com anel e ícone próprio.
    - Os tons são 5 ângulos distintos só com tokens da marca.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Tarefa 3: "quando" num formato só, linha da amostra, cabeçalho das respostas como link e fechamento (F-4, F-7, decisão nova)</name>
  <files>apps/web/messages/pt-BR/dashboard.json, apps/web/components/dashboard/format.ts, apps/web/components/dashboard/OwnerContentPeople.tsx, apps/web/components/dashboard/OwnerContentReplies.tsx, apps/web/components/dashboard/OwnerContentReplies.test.tsx, apps/web/components/dashboard/OwnerMemberList.test.tsx, apps/web/lib/owner-content-view.ts, apps/web/lib/owner-content-view.test.ts, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>apps/web/components/dashboard/format.ts:235-245, apps/web/components/dashboard/OwnerContentPeople.tsx:36-110, apps/web/components/dashboard/OwnerContentReplies.tsx, apps/web/lib/owner-content-view.ts:244-276, apps/web/components/dashboard/BandScopeCards.tsx:78-88, apps/web/messages/pt-BR/dashboard.json:90 e 838-877</read_first>
  <behavior>
    - OwnerMemberList.test (catálogo real): em om-13 Curtidas, a linha mais recente lê "curtido hoje às HH:MM"; uma linha sem horário de ontem lê "curtido ontem"; nenhum "hoje 22:40" sem "às".
    - OwnerContentReplies.test: o bloco miniatura + legenda + meta é um único link para `/painel-preview/dono-do-cliente?area=conteudo&post=op-19`; o primeiro comentário segue com "Comentou há 8 dias".
    - owner-content-view.test: `contentBackHref` de `{ post: 'op-19' }` (Visão geral) termina em `#atencao-op-19`; `{ post: 'op-41' }` termina em `#post-op-41`; `{ vista: 'publicacoes', post: 'op-19' }` termina em `#post-op-19`; o Voltar de `responder=op-19` não muda.
  </behavior>
  <action>
RED primeiro (commit test), depois GREEN (commit feat).

1. F-4, PD-L:
   - Em dashboard.json:90, `moment` vira `{days, plural, =0 {hoje{timed, select, yes { às {time}} other {}}} =1 {ontem{timed, select, yes { às {time}} other {}}} other {há # dias}}`.
   - `momentText` (format.ts) passa `timed: moment.time ? 'yes' : 'no'`.
   - Apague `tenantOwner.content.people.moment` e a função de momento própria de OwnerContentPeople.tsx. Os 4 usos nesse arquivo e o de OwnerContentReplies.tsx passam a `momentText`.
2. Decisão nova, PD-K:
   - Chave `tenantOwner.content.people.sample` = "Mostrando quem está na amostra de membros.".
   - Em `PeopleCards`, quando `people.length < total`, mostre um `<p className="text-xs text-text-secondary">` com ela logo antes da linha "e mais N".
3. F-7, PD-J:
   - Em OwnerContentReplies.tsx, a miniatura + legenda + meta ficam dentro de `Linked` com `href = ownerContentHref({ ...contentTabView('overview'), postId: item.id })` e um `ChevronRight` `aria-hidden` à direita, com foco visível (o de `Linked`).
   - Em `contentBackHref`, com `postId` na Visão geral (sem `number` nem `band`) e `needsAttention(item)`, a âncora é `contentAttentionAnchor(postId)`; nos outros casos não muda.
4. e2e:
   - `?area=conteudo&vista=publicacoes&post=op-11&quem=comentarios` mostra "Mostrando quem está na amostra de membros." e "e mais N comentários".
   - `?area=conteudo&responder=op-19`: o link do cabeçalho leva a `?area=conteudo&post=op-19`, com o título da publicação e a seção "Interações", e o Voltar desse detalhe leva a `?area=conteudo#atencao-op-19`. O Voltar da tela de respostas segue em `#atencao-op-19`.
   - Um cartão de pessoas lê "Curtiu hoje às" ou "Curtiu há".
   - Ajuste textos antigos se algum quebrar.
5. Fechamento (ambiente provisório exportado):
   - Rode `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm boundaries`, `pnpm check:static-routes` e a suíte Playwright do preview inteira. Numa cópia isolada, use um servidor próprio numa porta livre (ex.: 3300) com config temporária não versionada, apagada no fim. Nunca pare a 3000 nem o Chrome.
   - Rode `git diff --quiet eeab1d39 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts`.
   - Tire 4 capturas em `.planning/quick/261013-uoi-correcoes-das-revisoes-de-conteudo-e-lis/screens/` (não versionar):
     - `01-om13-curtidas.png` (390, horários variados);
     - `02-tipo-video-360.png` (cartões compactos a 360);
     - `03-membro-stories.png` (390);
     - `04-nivel1-clientes-ativos.png` (360).
   - As revisões critic e flow-critic ficam com o orquestrador; registre isso no SUMMARY.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/web exec vitest run lib/owner-content-view.test.ts components/dashboard/OwnerContentReplies.test.tsx components/dashboard/OwnerMemberList.test.tsx && pnpm lint && pnpm typecheck && pnpm test && pnpm boundaries && pnpm check:static-routes && (cd apps/web && pnpm exec playwright test --config playwright.preview.config.ts) && git diff --quiet eeab1d39 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts && test "$(grep -c '"moment":' apps/web/messages/pt-BR/dashboard.json)" = 1 && ls .planning/quick/261013-uoi-correcoes-das-revisoes-de-conteudo-e-lis/screens/0[1-4]-*.png && test "$(curl -s -m 30 -o /dev/null -w '%{http_code}' 'http://localhost:3000/painel-preview/membro?lista=curtidas')" = 200</automated>
  </verify>
  <done>
    - O vermelho falhou antes do verde.
    - Todo "quando" com horário lê "às".
    - O catálogo tem uma só chave `moment`.
    - A linha da amostra aparece nas listas incompletas.
    - O cabeçalho das respostas abre o detalhe, e o Voltar desse detalhe cai na linha de atenção.
    - Todos os gates, a suíte Playwright inteira e a trava de produção estão verdes.
    - As 4 capturas existem.
    - A 3000 responde 200.
  </done>
</task>

</tasks>

<threat_model>
## Limites de confiança

| Limite | Descrição |
|--------|-----------|
| URL → parser de Conteúdo | `post`/`responder` vêm da query (não confiável); o novo link só monta ids da lista permitida |
| Fixtures → tela do nível 4 | dados fictícios; o texto dos comentários sem resposta segue só na tela de respostas |

## Registro STRIDE

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-uoi-01 | Tampering | `contentBackHref` / link do cabeçalho de respostas | low | mitigate | o href é montado por `ownerContentHref` com `item.id` vindo de REPLY_IDS; o parser segue com `pick` sobre listas permitidas; teste de unidade com `post=op-19`, `post=op-41` e o caso de `vista=publicacoes` |
| T-uoi-02 | Information disclosure | OwnerContentReplies | low | accept | o link não expõe dado novo: leva ao detalhe que o mesmo nível já vê; texto de comentário continua só nessa tela (decisão E-02) |
| T-uoi-03 | Tampering | trava de produção do preview | medium | mitigate | `git diff --quiet eeab1d39 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts` no verify da Tarefa 3 |

Sem instalação de pacote: `CircleDashed` já está em lucide-react@1.46.0.
</threat_model>

<verification>
- Tarefa 1: módulo do dashboard verde, typecheck, e2e de membros e conteúdo.
- Tarefa 2: charts e CoverThumb verdes, e2e dos níveis 1, 4 e 7 tocados.
- Tarefa 3: todos os gates (lint com guarda de literais, typecheck, test, boundaries, check:static-routes), a suíte Playwright do preview inteira, a trava de produção sem diff, 4 capturas e a 3000 respondendo 200.
- Regras de sempre: dados determinísticos, textos só no catálogo pt-BR, tokens, `@3xl`, rolagem só vertical (e2e existentes de overflow seguem verdes).
</verification>

<success_criteria>
- Comentários do roster: 168, cada membro na faixa da tabela, no máximo 2 por dia.
- Toda lista de pessoas com número > 0 mostra de 1 a 10 pessoas.
- O comentário sem resposta mais antigo bate com a espera (op-04: "hoje às 14:00" / "há 9 h").
- No último dia de cada membro, só a ação mais recente leva o horário de `lastActive`; nenhum horário se repete no dia.
- Os rótulos do eixo não se encostam a 360 px (nível 1 e S12).
- O cartão de vídeo horizontal não quebra a 360/390/430.
- Story é um círculo com anel e ícone próprio, e os tons são visivelmente distintos.
- "Quando" está num formato só.
- O cabeçalho de respostas é um link para o detalhe.
- O SUMMARY traz a comparação com 2f39aec6 (comentários e ações fortes por faixa; curtidas, dias ativos, check-ins e pedidos iguais) e a observação do evento u1.
</success_criteria>

## Auditoria de cobertura das fontes

| Fonte | Item | Tarefa |
|-------|------|--------|
| CONTEXT, decisão nova | ≥ 1 e ≤ 10 por lista; "e mais N"; linha da amostra; tabela de comentários; ≤ 2 por dia; curtidas e faixas iguais; testes de coerência | T1 (dados e testes), T3 (linha da amostra) |
| CONTEXT C-1 / F-2 | insights realistas, comparação com 2f39aec6 no SUMMARY | T1 |
| CONTEXT C-2 | rótulo final do `LineChart`, medido no nível 1 e no S12 | T2 |
| CONTEXT C-3 | espera de todo comentário sem resposta bate com data e hora | T1 |
| CONTEXT C-4 | SHAs do SUMMARY da orf | fora: é do orquestrador |
| CONTEXT F-1 | horários do último dia; dia com menos ações na atribuição | T1 |
| CONTEXT F-3 | coluna de 4,5rem, altura até 7rem, e2e 360/390/430 | T2 |
| CONTEXT F-4 | "às" na chave global, uma só chave | T3 |
| CONTEXT F-5 | story em círculo com anel e ícone próprio | T2 |
| CONTEXT F-6 | 5 tons por ângulo, só tokens | T2 |
| CONTEXT F-7 | cabeçalho de respostas como link; Voltar na linha de atenção | T3 |
| CONTEXT, verificação | gates, Playwright completo em porta própria, 4 capturas | T3 |
| REQ | V2-PLAT-04, PWA-03, MOD-02, UI-03 | T1–T3 |

<output>
Criar `.planning/quick/261013-uoi-correcoes-das-revisoes-de-conteudo-e-lis/261013-uoi-SUMMARY.md` ao terminar.
</output>
