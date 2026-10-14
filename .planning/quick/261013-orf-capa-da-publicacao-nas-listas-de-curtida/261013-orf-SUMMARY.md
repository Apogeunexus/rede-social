---
phase: quick-261013-orf
plan: 01
subsystem: dashboard (preview, níveis 4 e 7)
status: complete
tags: [dashboard, preview, member-lists, owner-member-lists, content, thumbnail, compact-card, unanswered-comments, pt-BR]
requires: [quick-261013-h51]
provides:
  - CoverThumb (miniatura de linha 56 px e cartão compacto ~7rem), COVER_ICON, coverTone, coverStyle
  - assignRosterInteractions (curtidas e comentários do roster atribuídos de uma vez)
  - ownerContentUnanswered (comentários sem resposta com texto)
  - tela ?area=conteudo&responder=<id>
affects: [painel-preview nível 7, painel-preview nível 4 (Membros e Conteúdo)]
tech-stack:
  added: []
  patterns: [miniatura decorativa aria-hidden com o degradê da marca em 5 tons, atribuição global determinística em fixture]
key-files:
  created:
    - apps/web/components/dashboard/CoverThumb.tsx
    - apps/web/components/dashboard/CoverThumb.test.tsx
    - apps/web/components/dashboard/OwnerMemberList.test.tsx
    - apps/web/components/dashboard/OwnerContentReplies.tsx
    - apps/web/components/dashboard/OwnerContentReplies.test.tsx
  modified:
    - packages/modules/dashboard/fixtures/member-lists.ts
    - packages/modules/dashboard/fixtures/owner-member-lists.ts
    - packages/modules/dashboard/fixtures/owner-member-insights.ts
    - packages/modules/dashboard/fixtures/owner-content.ts
    - packages/modules/dashboard/fixtures/owner-posts.ts
    - packages/modules/dashboard/fixtures/tenant-owner.ts
    - packages/modules/dashboard/fixtures/index.ts
    - packages/modules/dashboard/ui/LineChart.tsx
    - packages/modules/dashboard/README.md
    - apps/web/lib/owner-content-view.ts
    - apps/web/components/dashboard/MemberActivityList.tsx
    - apps/web/components/dashboard/OwnerMemberList.tsx
    - apps/web/components/dashboard/OwnerContentPostCard.tsx
    - apps/web/components/dashboard/OwnerContentPostDetail.tsx
    - apps/web/components/dashboard/OwnerContentTypes.tsx
    - apps/web/components/dashboard/OwnerContentOverview.tsx
    - apps/web/components/dashboard/OwnerContentPeople.tsx
    - apps/web/components/dashboard/OwnerContent.tsx
    - apps/web/components/dashboard/BandMembers.tsx
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - Atribuição global de curtidas e comentários do roster (assignRosterInteractions) para nenhuma lista de pessoas com número abrir vazia
  - Teto aceito pelo orquestrador em op-01, op-02, op-03 e os-01 (todos os membros que puderam agir)
  - Alcance de publicação sem Inativos e com no máximo 10% de Em risco; teto de 530 por post
  - Texto dos comentários sem resposta visível à equipe do cliente (decisão E-02), só nessa tela
metrics:
  duration: "~3h40 (18:19–21:57)"
  completed: 2026-10-13
actuals:
  tokens: 95000
  tasks: 4
  commits: 8
---

# Quick 261013-orf: capa da publicação nas listas, cartão compacto, comentários a responder e correções do flow-critic — Resumo

Miniatura da capa (degradê da marca em 5 tons por publicação, ícone do tipo, duração do vídeo, anel do story) em toda lista de publicações dos níveis 7 e 4; cartões de publicação compactos com os 4 números; tela de comentários sem resposta com o texto de cada um; e os 11 achados do flow-critic da 261013-h51 corrigidos ou registrados.

Branch da cópia isolada: `worktree-agent-ae323edef0924d34a` (base `3adb3362`, sobre `feat/painel-preview`). Sem push, sem publicar. STATE.md não foi tocado (instrução do orquestrador).

## Commits

| # | Tarefa | Tipo | Commit | Mensagem |
|---|--------|------|--------|----------|
| 1 | T1 vermelho | test | `ab8a40cc` | pin post kinds and the cover thumbnail |
| 2 | T1 verde | feat | `322ccadd` | cover thumbnails on the member's activity lists |
| 3 | T2 vermelho | test | `827298f5` | pin people coverage, unanswered comments and reach by band |
| 4 | T2 verde | fix | `a1906293` | every content people list has people, reach skips inactive members |
| 5 | T3 vermelho | test | `69b55568` | pin the compact card thumbnail and owner-level list thumbnails |
| 6 | T3 verde | feat | `1affef8d` | compact publication cards and owner-level list thumbnails |
| 7 | T4 vermelho | test | `486c8ea7` | pin the unanswered comments screen and its link |
| 8 | T4 verde | feat | `952e2284` | reply-pending comments screen and clearer content people lists |

Cada vermelho falhou pelo motivo certo antes do verde (campo/módulo ausente, listas curtas, Inativos > 0, variante/miniatura ausente, parâmetro `responder`/componente ausente).

## O que foi aplicado

**D-01..D-04 (miniaturas).**
- Nível 7: as 7 listas de `/painel-preview/membro?lista=` têm uma miniatura de 56 px por linha; a primeira curtida e o primeiro vídeo leem "10:12"; stories com o anel da marca; texto com o ícone `Type`.
- Nível 4: Curtidas, Comentários, Ações fortes (check-in = ingresso, pedido = sacola) e Posts vistos de um membro têm miniatura; Dias ativos não. Em Conteúdo, Interações, Precisa de atenção e a tela de respostas também.
- Um só mapa de ícones e um só estilo (`COVER_ICON`, `coverStyle`) em `CoverThumb` e `ContentCover`. O tom é o próprio `var(--brand-gradient)` em uma de 5 posições pela soma dos códigos do id (PD-B); nenhuma cor nova. Toda miniatura é `aria-hidden`.
- D-03: cada post do nível 7 tem `kind` (23 vídeos, 16 textos, 7 carrosséis, 7 fotos, 7 links) e `durationSeconds` só nos vídeos, igual ao vídeo da lista de vídeos nos 11 pares; no nível 4 todo post listado resolve no `ownerContentItem` com tipo de feed (teste de unidade).

**E-01 (cartão compacto).** Melhores publicações, Publicações, o tipo aberto e as listas de número usam o cartão em linha: miniatura na proporção do feed (vídeo 9:16 com 7rem de altura, nunca mais de 8rem de largura), legenda em 2 linhas, meta e os 4 números com nome em `sr-only`; o cartão inteiro é o link, com chevron; some "Ver publicação". No detalhe, as laterais da capa são o mesmo degradê escurecido (`bg-black/40`) e vídeo/story têm o ▶ redondo como botão desativado "Assistir" com `aria-describedby` da nota de prévia.

**E-02 (comentários a responder).** Tocar numa linha de Precisa de atenção abre `?area=conteudo&responder=<id>`: miniatura, legenda, meta, a mesma linha de contagem da Visão geral e exatamente esse número de comentários, do mais antigo ao mais novo, cada um com nome, faixa (no singular: "Superfã"), texto fictício em pt-BR, "Comentou há …" e "Responder" desativado. O primeiro lê o mesmo "há N dias" da linha (op-19: 9 comentários, "há 8 dias"; op-24: 2, "há 10 dias"). Voltar leva a `?area=conteudo#atencao-<id>`. `responder` fora da lista de atenção (op-11, xyz) ou junto de `numero`/`faixa`/`vista` cai na Visão geral.

**E-03 (achados do flow-critic da 261013-h51).**
1. Nenhuma lista "Quem curtiu/comentou/salvou/compartilhou" com número > 0 abre vazia (unidade e e2e sobre as 292 listas). Toda lista tem pelo menos min(total, 10) pessoas, exceto o teto aceito: op-01 (2 curtidas, 2 salvamentos), op-02 (6 curtidas), op-03 (6 curtidas, 6 comentários) e os-01 (6 curtidas), provado em teste como o número de membros ativos elegíveis. Os comentários de cada membro nos insights são exatamente os mesmos fatos das listas de Conteúdo.
2. Cartões de pessoas dizem quando ("Curtiu há 3 dias", "Comentou hoje às 22:40", "Interagiu …"); comentários dizem "sem resposta primeiro, depois os mais recentes".
3. Quem interage só abre as 4 faixas com interação ("41 membros · 43% da faixa" + mini barra de Membros, `BandSummary` exportado); Em risco e Inativos viraram uma linha estática; dentro de uma faixa o cartão não repete "Faixa:".
4. Alcance por faixa com Inativos 0 e Em risco ≤ 10% em todo item.
5. Eixo da retenção em tempo do vídeo (0:00 · 0:20 · 0:41).
6. "Inscritos em eventos nos 7 dias seguintes" e "Workshop, 01/10: 11 inscritos".
7. "e mais N" na unidade da lista ("e mais 21 comentários").
8. `=0` nas chaves de contagem ("nenhum compartilhamento" etc.).
9. "por publicação" em todo o catálogo; uma só nota de exemplo no tipo aberto.
10. Âncoras `post-`/`atencao-` sem repetição na Visão geral (e2e).
11. **Registro E-03.11:** a mensagem do commit 387a7fc4 diz "Not yet verified", mas o critic já verificou aquele trabalho; o histórico não foi reescrito.

## Números que mudaram com os dados

| Número | Antes | Depois |
|--------|-------|--------|
| Taxa de engajamento (Visão geral) | 10,6% | 16,8% |
| Alcance por publicação (`reach.value.perPost`) | 612 | 385 |
| Soma do alcance dos 61 posts | 37.332 | 23.488 |
| Visualizações | 62.963 | 39.727 |
| Comentários do roster (todos os membros) | 96 | 527 (superfãs 26–36 em 30 dias, engajados 3–13) |
| Interações do roster listadas | 759 | 1.190 (curtidas seguem 663) |
| KPI de curtidas por membro | dias ativos + extras | inalterado |
| Ações fortes por membro | comentários + check-ins + pedidos | idem, com os novos comentários (ex.: om-13: 26 comentários, 30 ações fortes) |
| "e mais" nas curtidas de op-11 | "e mais N membros" | "e mais N curtidas" |

"Interações" (3.940), "Membros que interagiram" (428) e as contagens por faixa não mudaram.

## Evidência dos gates (ambiente provisório: API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

| Comando | Resultado |
|---------|-----------|
| `pnpm lint` (biome + check-ui-literals) | OK, exit 0 |
| `pnpm typecheck` | 18/18 tarefas |
| `pnpm test` | 15/15 tarefas, 4.562 testes (web 2.477, module-dashboard 299) |
| `pnpm boundaries` | 1.312 arquivos em 16 pacotes, nenhum problema |
| `pnpm check:static-routes` | 74 rotas, 0 infratores |
| Playwright do preview inteiro (servidor próprio na 3300) | 199/199 |
| `git diff --quiet 387a7fc4 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts` | sem diff (trava de produção intacta) |
| `find … \( -name '* 2*' -o -flags +dataless \)` | nada |
| `curl` em `http://localhost:3000/painel-preview/membro?lista=curtidas` | 200 (a 3000 não foi parada nem tocada) |

## Capturas (390×844, claro, em `screens/`, não versionadas; servidor da 3300)

1. `01-membro-curtidas.png`: miniaturas de vídeo com 10:12, 1:30, 9:00, link, carrossel e texto; tons variados; texto quebra à direita; nada cortado.
2. `02-membro-videos.png`: todas as linhas com ▶ e duração legível (10:12, 9:00, 4:50…).
3. `03-dono-curtidas-membro.png`: curtidas de Fernanda Paiva (om-13) com miniatura por tipo. Observação: várias curtidas caem no dia mais recente ("curtido hoje 22:40"), efeito da regra de atribuição (dia sem curtida mais recente primeiro); ver pendências.
4. `04-publicacoes-compactas.png`: cartão compacto com a miniatura vertical do vídeo de 0:41, meta e os 4 números em linha.
5. `05-comentarios-a-responder.png`: op-19 com miniatura de texto, "9 comentários sem resposta · o mais antigo há 8 dias", Diego Valença · Superfã, o texto e "Comentou há 8 dias" com "Responder" desativado.

## Decisões

- PD-A..PD-N do plano aplicadas como escritas, com os ajustes listados em Desvios.
- PD-L: teto de op-01/op-02/op-03/os-01 aceito pelo orquestrador; a regra que não falha é "nenhuma lista com número abre vazia".
- PD-M: alcance por post limitado a 530, visualizações escaladas na mesma proporção (nunca abaixo do alcance); `REACH_WEIGHT` com Inativos 0 e Em risco 0,1; faixa de peso 0 nunca é aberta.
- A tabela de comentários sem resposta foi para `owner-posts.ts` (`OWNER_POST_UNANSWERED`), lida por Conteúdo e pela atribuição do roster, para evitar import circular.
- Nome da faixa no singular ("Superfã") na tela de respostas, como no detalhe do membro.
- Uma chave compartilhada `people.moment` monta "hoje às 22:40" / "ontem" / "há N dias" para as linhas de "quando".

## Desvios do plano

1. **[Regra 3] Tabela UNANSWERED movida** de `owner-content.ts` para `owner-posts.ts` como `OWNER_POST_UNANSWERED` (o `owner-member-lists.ts` precisa dela e importar de `owner-content.ts` criaria ciclo).
2. **[Regra 1] Posts vistos incluem os comentados**: com a atribuição global um membro pode comentar um post que não curtiu; "Posts vistos" agora inclui todo post curtido ou comentado (senão "comentou mas não viu").
3. **[Regra 1] Largura do cartão**: em vez de altura fixa 7rem + `min(8rem, …)`, o cartão usa largura `7rem × proporção` com `max-width: 8rem` e `aspect-ratio`, para mídia larga manter a proporção (altura menor) e porque o happy-dom descarta `min()`. O teste de unidade foi ajustado depois do commit vermelho para checar `width`/`max-width`/`aspect-ratio`.
4. **[Regra 1] Último rótulo do eixo** do `LineChart` (módulo compartilhado) ancorado no fim, para "0:41"/"10:12" não serem cortados a 360 px.
5. **[Regra 3] e2e das 292 listas de pessoas por HTTP** (`request`), não pelo navegador: no navegador o teste estourava 10 min com a máquina sob carga; lê a linha de contagem e exige um link de cartão de membro.
6. **Servidor próprio na porta 3300** (instrução do orquestrador; o plano dizia 3100), com config temporária não versionada, já apagada. O `next dev` guarda o catálogo na partida: depois de mudar o `dashboard.json` foi preciso reiniciar o servidor da 3300.
7. **"por post" → "por publicação" em todo o catálogo**, incluindo o KPI da Visão geral do nível 4 e a nota da equipe (admin); e2e ajustados.
8. **Texto da linha estática**: "Em risco e Inativos: ninguém curtiu nem comentou em 30 dias, e é isso que define essas faixas." (vírgula em vez de travessão).
9. **`data-count`** nos números do cartão compacto, para o e2e ler cada número junto do nome em `sr-only`.

## Ameaças

Sem superfície nova além do registro do plano: `responder` é validado contra a lista de atenção (T-orf-01, unidade + e2e com ids forjados); o texto dos comentários sem resposta só aparece no nível 4 (T-orf-02, README registra o P4 do aviso de privacidade); trava de produção sem diff (T-orf-04).

## Self-Check: PASSED

- Arquivos criados existem: `CoverThumb.tsx`, `CoverThumb.test.tsx`, `OwnerMemberList.test.tsx`, `OwnerContentReplies.tsx`, `OwnerContentReplies.test.tsx`.
- Os 8 commits estão no log da branch: ab8a40cc, 322ccadd, 827298f5, a1906293, 69b55568, 1affef8d, 486c8ea7, 952e2284.

**⚠️ NÃO FEITO**
- Revisões `critic` e `flow-critic` dos 8 commits: este executor não consegue abrir subagentes; falta rodá-las antes de declarar a feature pronta.
- Concentração de curtidas no dia mais recente no nível 4 (captura 03: várias "curtido hoje 22:40"): efeito da regra de atribuição do plano; não é erro de dado, mas pode parecer artificial; espalhar exige outra regra de escolha do dia (decisão do usuário/planejador).
- Religar a 3000 não foi necessário: ela respondeu 200 o tempo todo e não foi parada; a cópia isolada não está no checkout que a 3000 serve, então a 3000 só mostra este trabalho depois do merge na `feat/painel-preview`.
- STATE.md, ROADMAP e REQUIREMENTS não foram atualizados (instrução do orquestrador).

## Integração e revisões (orquestrador)

- **Commits:** entraram na `feat/painel-preview` por cherry-pick, por cima das capas de Eventos. Os SHAs acima já são os da branch principal.
- **Revisão de comportamento: REPROVADO.**
  - Insights dos membros alterados, com comentários inflados (41 de 72 membros mudaram).
  - Rótulos colados no `LineChart` do nível 1.
  - Espera de op-04 incoerente.
  - SHAs deste SUMMARY (já corrigidos).
- **Revisão de fluxo: APROVADO com ressalvas.**
  - Horário repetido.
  - Comentários demais.
  - Cartão compacto em vídeo 16:9.
  - "Quando" em dois formatos.
  - Miniatura de story.
  - Tons pouco variados.
  - Cabeçalho da tela de respostas sem link.
- **Encaminhamento:** tudo segue na quick 261013-uoi. Lá a regra do E-03.1 passou a ser "pelo menos 1 pessoa, no máximo 10, com atividade realista".
