---
phase: quick-261012-tru
plan: 01
status: complete
subsystem: dashboard-preview (nível 4, área Membros)
tags: [dashboard, preview, tenant-owner, engagement-bands, member-insights, pt-BR]
requires: [quick-261012-ri4]
provides:
  - "parseOwnerMembersView em cascata {kind, band, itemId, memberId, list}: valor inválido em qualquer nível cai para o nível de cima"
  - "ownerMembersHref (um construtor de links para todos os níveis), ownerListScope, OWNER_MEMBER_LISTS, ownerInsightAnchor"
  - "cartões de comunidade (capa 16:7) e de evento (capa 16:10) nas faixas de Por comunidade e Por evento"
  - "ownerPostTable (61 posts) e buildOwnerMemberLists: as listas atrás dos números dos insights"
  - "OwnerMemberList: a tela da lista de cada número dos insights (curtidas, comentários, ações fortes, dias ativos, posts vistos)"
affects: [apps/web área Membros do painel do dono do cliente, packages/modules/dashboard fixtures e README]
tech-stack:
  added: []
  patterns:
    - "parser de URL nível a nível com queda para o nível de cima (nunca erro)"
    - "Record<slug, view> para que um slug novo sem tela quebre o typecheck"
    - "construtor puro que lança erro quando o tamanho de uma lista difere do seu KPI"
key-files:
  created:
    - apps/web/components/dashboard/BandScopeCards.tsx
    - apps/web/components/dashboard/BackLink.tsx
    - apps/web/components/dashboard/OwnerMemberList.tsx
    - packages/modules/dashboard/fixtures/owner-posts.ts
    - packages/modules/dashboard/fixtures/owner-member-lists.ts
    - packages/modules/dashboard/tests/owner-member-lists.test.ts
  modified:
    - apps/web/lib/owner-band-scope.ts
    - apps/web/lib/owner-band-scope.test.ts
    - apps/web/components/dashboard/OwnerMembers.tsx
    - apps/web/components/dashboard/BandMembers.tsx
    - apps/web/components/dashboard/BandMembers.test.tsx
    - apps/web/components/dashboard/OwnerMemberDetail.tsx
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
    - packages/modules/dashboard/fixtures/shared.ts
    - packages/modules/dashboard/fixtures/tenant-owner.ts
    - packages/modules/dashboard/fixtures/owner-members.ts
    - packages/modules/dashboard/fixtures/owner-member-insights.ts
    - packages/modules/dashboard/fixtures/index.ts
    - packages/modules/dashboard/tests/tenant-owner.test.ts
    - packages/modules/dashboard/tests/owner-members.test.ts
    - packages/modules/dashboard/README.md
decisions:
  - "Cabeçalhos das faixas sempre da base toda nas três abas, com uma nota sob Por comunidade e Por evento"
  - "Comunidade/evento com 0 na faixa: '0 nesta faixa', sem link; a URL forjada cai para os cartões"
  - "Capas reaproveitam CommunityCover/EventCover pela superfície pública /ui dos módulos (pnpm boundaries aceita)"
  - "Receita do cartão de evento = inscritos × preço de ingresso de exemplo, fora da receita da loja (Financeiro)"
  - "Posts vistos passa a contar posts distintos, e a lista é construída junto"
  - "As datas dos 61 posts não modelam a divisão por dia da semana e horário (nenhuma lista mostra dia da semana)"
metrics:
  duration: ~45 min
  completed: 2026-10-12
actuals:
  tokens: 30900
  tasks: 4
  commits: 7
---

# Quick 261012-tru: cascata única faixas → comunidade/evento → membro → insights → lista — Resumo

As três abas (Por membro | Por comunidade | Por evento) viraram um só modelo, numa fileira só: todas abrem nas mesmas seis faixas da base toda; em Por comunidade e Por evento a faixa aberta mostra os cartões desenhados pelo usuário (capa 16:7 / 16:10, colunas, "N nesta faixa"), o cartão abre os membros daquela faixa ali dentro, o membro abre os insights, e cada número dos insights abre a lista que está por trás dele, com contagem igual ao número.

## Commits

| # | SHA | Tipo | Mensagem |
|---|-----|------|----------|
| 1 | c572b4bc | test (RED) | pin the band cascade, the scope cards and their fixture fields |
| 2 | 79db0b9b | feat (GREEN) | one cascade for the bands with community and event cards |
| 3 | 620b4f94 | test (RED) | pin each member's activity lists to their insight numbers |
| 4 | a04694c7 | feat (GREEN) | build each member's likes, comments, strong actions, active days and posts seen |
| 5 | 2a8a6f1f | test (RED) | pin the member list links |
| 6 | f96abe44 | feat (GREEN) | open the list behind each member number |
| 7 | cc9026da | fix | keep the card values on one line when a label wraps |

RED 1 falhou como esperado: 4 testes do fixture (campos `description`/`activeWeek`/`durationMinutes`/`ticketCents` e `ownerScopeBands` ausentes) e 26 testes web (formato novo da view, `ownerListScope`/`ownerMembersHref` ausentes, prop `view`). RED 3 falhou por módulo ausente (`fixtures/owner-posts`). RED 5 falhou 16 testes (sem `list` na view, exports ausentes). O tracer (Tarefa 1) passou ponta a ponta antes da expansão (69/69 no e2e "dono-do-cliente").

## D-01..D-08 como aplicados

- **D-01** Uma `nav` "Recorte das faixas" (`grid grid-cols-3`, larguras iguais ±1 px). A segunda fileira de chips (`ScopeItems`) e as notas por item foram removidas; nenhuma navegação "Comunidade das faixas"/"Evento das faixas" em nível nenhum (e2e conta uma `nav` na seção em 5 níveis). Abas: `?area=membros#faixas`, `…&recorte=comunidade#faixas`, `…&recorte=evento#faixas`.
- **D-02** As três abas mostram as mesmas seis faixas da base toda (96 · 8%, 62 · 5%, 205 · 17%, 150 · 12%, 168 · 14%, 559 · 45%) e a linha "Novos: 54 ativados de 96." em todas. Por membro: os cartões de membro de hoje. Por comunidade: 4 cartões; Por evento: 7 cartões. "menos de 1%" e a barra mínima continuam no código e no teste de componente.
- **D-03** Cartão de comunidade: `CommunityCover geometry="card"` sem foto (fallback `--brand-gradient`, 16:7 medido no e2e), nome `text-xl` negrito, descrição cinza, linha fina, 4 colunas, nota "Interações: comentários e curtidas", "N nesta faixa".
- **D-04** Cartão de evento: `EventCover geometry="hero"` (16:10 medido), nome, pílula Presencial/Online, linha fina, 3 colunas com divisórias (Data, Duração, Receita), "N nesta faixa"; uma linha "Receita: valores de exemplo" com a pílula por lista e no evento aberto, nunca no cartão.
- **D-05** O cartão abre `…&recorte=comunidade&comunidade=vip&faixa=engajados#faixas`: "Voltar às comunidades" (ou "Voltar aos eventos"), o próprio cartão sem link, "Engajados em Comunidade VIP" e os membros daquela faixa ali (máx. 10 + "e mais N", "Ver todos" desativado).
- **D-06** O membro abre os insights; "Voltar" volta exatamente ao passo anterior (`…&comunidade=vip&faixa=engajados#faixas`). URL forjada cai um nível: item desconhecido/repetido/sem faixa/com 0 na faixa → cartões (ou faixas fechadas); `membro` só quando está na faixa da lista aberta.
- **D-07** Dias ativos, Curtidas, Comentários, Ações fortes e Posts vistos viraram links ("Ver lista") para `…&membro=om-NN&lista=<slug>#lista`; a lista tem "Voltar" para `#insight-<slug>`, título, "Nome · últimos 30 dias", contagem com a ordem, linhas, frase de vazio; contagem = KPI (teste do fixture nos 72 membros e e2e nos 5 números de om-13). Posts vistos mantém a pílula "exemplo". Tempo médio diário continua cartão simples.
- **D-08** "Recuperar quem está em risco" segue o item aberto (VIP: 22 em risco · 11 com push; u1: 6 · 3), senão a base toda (168 · 69). Crescimento, Subiram/Caíram e Retenção sem mudança.

## Números por cartão

| Comunidade | Membros | Ativos na semana | Publicações no mês | Interações no mês | Engajados nesta faixa |
|---|---|---|---|---|---|
| Comunidade VIP | 186 | 104 | 22 | 1.650 | 61 |
| Geral | 1.240 | 296 | 25 | 1.580 | 150 |
| Iniciantes | 1.240 | 92 | 8 | 430 | 38 |
| Eventos | 1.240 | 41 | 6 | 280 | 22 |

| Evento | Formato | Data | Duração | Receita (exemplo) | Engajados nesta faixa |
|---|---|---|---|---|---|
| Encontro mensal | Presencial | 12/10 | 3h00 | R$ 5,5 mil (92 × R$ 60) | 34 |
| Live de dúvidas | Online | 15/10 | 1h00 | R$ 0,00 | 23 |
| Imersão presencial | Presencial | 24/10 | 8h00 | R$ 14 mil (40 × R$ 350) | 16 |
| Aula aberta | Online | 07/10 | 1h30 | R$ 0,00 | 21 |
| Workshop | Presencial | 01/10 | 4h00 | R$ 6 mil (50 × R$ 120) | 18 |
| Live de dúvidas | Online | 24/09 | 1h00 | R$ 0,00 | 62 |
| Encontro set. | Presencial | 19/09 | 3h00 | R$ 6 mil (100 × R$ 60) | 45 |

Inativos: todo evento tem 0 ("0 nesta faixa", sem link).

## Decisões

Decisões do planejador, aplicadas como escritas:

1. **Cabeçalhos sempre da base toda**, com uma nota sob Por comunidade ("…o membro aparece na faixa das ações feitas nela") e sob Por evento. Por isso um cartão de comunidade pode ter mais de uma faixa que o cabeçalho (Geral Ocasionais 170 contra 150).
2. **Item com 0 na faixa** aparece com "0 nesta faixa" e sem link; a URL forjada para ele cai para os cartões da faixa.
3. **Capas** reaproveitam `CommunityCover`/`EventCover` pela superfície pública `@rede-social/module-communities/ui` e `@rede-social/module-events/ui` (o `apps/web` já importa ambas; `pnpm boundaries` verde).
4. **Receita** = inscritos "vou" × preço de ingresso de exemplo (`ticketCents`, motivo `needs_event_tickets`, 0 nos online); é exemplo do cartão e não entra na receita da loja (Financeiro).
5. **Posts vistos** passa a contar posts distintos (todo post curtido + um por dia ativo) e a lista é construída junto; continua exemplo (`needs_post_views`).
6. **Datas dos posts** não modelam a divisão por dia da semana/horário de "Melhor dia e horário" (nenhuma lista mostra dia da semana).
7. Duração dos eventos é campo medido (`ends_at − starts_at`) com valores fictícios coerentes; `description` da comunidade é conteúdo do cliente (como `name`), não texto de UI.

Desvios do plano:

1. **[Ambiente] Execução no worktree, não no checkout principal.** O executor foi isolado pelo harness em `.claude/worktrees/agent-af0fa7bc274728be6` (branch `worktree-agent-af0fa7bc274728be6`), que bloqueia git no checkout principal. Alinhei o worktree em 271dd5d3 (commit do plano) e instalei as dependências com `pnpm install --frozen-lockfile` (nenhum pacote novo). Os 7 commits estão nessa branch, em fast-forward sobre `feat/painel-preview` (271dd5d3); falta levá-los para `feat/painel-preview`.
2. **[Ambiente] Servidor religado com o comando do CONTEXT, que roda no checkout principal.** Ele responde 200 nas 5 URLs, mas serve o código de 271dd5d3 até a branch do worktree entrar em `feat/painel-preview` (o `next dev` recarrega sozinho depois). As capturas vieram de um servidor temporário rodando no worktree (código novo), parado antes do religamento.
3. **[Regra 2 - qualidade] `BackLink.tsx` novo** (fora de `files_modified`): o "Voltar" de 44 px já existia duplicado; os três "Voltar" da cascata (cartões, insights, lista) usam um componente só.
4. **[Regra 1 - bug visual] Commit `cc9026da`:** no celular, "Membros" cabia numa linha e os outros rótulos quebravam em duas, então 186 ficava uma linha acima de 104/22/1.650. A coluna agora empurra o valor para baixo; visto na captura 01 e corrigido antes de fechar.
5. **Teste unitário sem `ownerBandList`:** o comportamento pedia "o primeiro listado de ownerBandList"; usei `ownerBandRoster` + `ownerBandIncludes` (qualquer membro da faixa serve) para que a varredura de privacidade liste só `BandMembers.tsx`, como a tarefa pede.
6. **e2e da nota de receita sem `exact`:** o `p` contém o texto e a pílula, então a correspondência exata nunca bate; usei o mesmo padrão já usado para "Tempo médio diário: valores de exemplo". A pílula é contada à parte (1 por lista).
7. Os avisos de hidratação nos logs do Playwright vêm dos testes que abrem os `<details>` antes da hidratação (já registrado na 261012-fcr). As capturas, sem abrir nada, carregaram sem o aviso "Issue" do Next.

## Evidência dos checks (ambiente provisório inline)

| Comando | Resultado |
|---|---|
| `pnpm lint` (Biome + check-ui-literals) | 16/16 tarefas ok; check-ui-literals OK |
| `pnpm typecheck` | 18/18 tarefas ok |
| `pnpm test` | 15/15 pacotes, 4.477 testes verdes (web 2.436, module-dashboard 255) |
| `pnpm boundaries` | 1.296 arquivos em 16 pacotes, nenhum problema |
| `pnpm check:static-routes` | 74 rotas protegidas, 0 infratores |
| Playwright preview completo (`playwright.preview.config.ts`, porta 3000 parada antes) | 166/166 verdes (4,6 min), rodado de novo depois do commit de correção |
| `git diff --quiet 6ca062b1 -- proxy.ts painel-preview/layout.tsx lib/dashboard-preview.ts` | sem diferença (trava de produção intacta) |
| `grep -rl ownerBandList apps/web/{app,components,lib}` | só `BandMembers.tsx` |
| `grep -rl ownerMemberInsights apps/web/{app,components,lib}` | só `OwnerMemberDetail.tsx` e `OwnerMemberList.tsx` |
| `find … -name '* 2*'` (cópias do iCloud) | nenhuma |

## Servidor e capturas

- Religado com `cd "/Users/macos/Desktop/rede social/rede-social" && API_URL=… nohup pnpm --filter @rede-social/web dev > /tmp/rede-dev.log 2>&1 &`. HTTP 200 em `/painel-preview/dono-do-cliente?area=membros` e nas 4 URLs das capturas.
- Capturas (iPhone, 1440×900, claro) em `screens/` (não versionadas; cópia também no checkout principal): `01-por-comunidade-faixa-aberta.png`, `02-comunidade-aberta-membros.png`, `03-por-evento-faixa-aberta.png`, `04-lista-curtidas-membro.png`. Conferidas: capas na proporção, nada cortado, sem rolagem lateral.

## Known Stubs

Nenhum novo. Receita, Posts vistos e Tempo médio diário são valores de exemplo marcados com a pílula, como decidido.

**⚠️ NÃO FEITO**
- Revisões `critic` e `flow-critic` dos 7 commits — este executor não consegue abrir subagentes; falta rodar as duas antes de dar a feature por pronta.
- Levar os 7 commits do branch `worktree-agent-af0fa7bc274728be6` para `feat/painel-preview` (fast-forward a partir de 271dd5d3) — o harness bloqueou git no checkout principal; até lá o servidor religado mostra o código antigo.
- STATE.md não atualizado — por instrução do orquestrador.

## Self-Check: PASSED
