---
phase: quick-261014-dwc
plan: 01
status: complete
subsystem: dashboard / painel do dono do cliente (nível 4) / Financeiro
tags: [dashboard, preview, tenant-owner, finance, primary-secondary-revenue, cascade, pt-BR]
requires: [quick-261013-uoi]
provides:
  - lista única de pedidos (owner-finance.ts) com ofertas e classificação primária/secundária
  - Financeiro em três abas (Visão geral | Produtos | Quem compra) com cascata por links
  - leitor de URL owner-finance-view.ts
affects:
  - insights do membro (Compras), Conteúdo (vendas até 7 dias), Visão geral do painel, níveis 5 e 6, Eventos, sino
tech-stack:
  added: []
  patterns:
    - uma lista de pedidos de onde saem todos os totais de dinheiro, provados por testes de soma
    - classificação por pedido calculada (classifyOrders), nunca guardada
key-files:
  created:
    - packages/modules/dashboard/fixtures/owner-finance.ts
    - packages/modules/dashboard/tests/owner-finance.test.ts
    - apps/web/lib/owner-finance-view.ts
    - apps/web/lib/owner-finance-view.test.ts
    - apps/web/components/dashboard/OwnerFinanceOverview.tsx
    - apps/web/components/dashboard/OwnerFinanceProducts.tsx
    - apps/web/components/dashboard/OwnerFinanceProductDetail.tsx
    - apps/web/components/dashboard/OwnerFinanceBuyers.tsx
    - apps/web/components/dashboard/OwnerFinancePeople.tsx
  modified:
    - apps/web/components/dashboard/OwnerFinance.tsx
    - apps/web/components/dashboard/OwnerMemberDetail.tsx
    - apps/web/components/dashboard/OwnerContentPeople.tsx
    - apps/web/components/dashboard/TenantOwnerPanel.tsx
    - apps/web/components/dashboard/TenantAdminPanel.tsx
    - apps/web/components/dashboard/format.ts
    - apps/web/app/painel-preview/[nivel]/page.tsx
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
    - packages/modules/dashboard/fixtures/{index,tenant-owner,tenant-panels,owner-member-insights,owner-member-lists,owner-content,owner-members,owner-posts}.ts
    - packages/modules/dashboard/README.md
    - packages/contracts/src/money.ts (formatBrlWhole) e packages/contracts/tests/money.test.ts
decisions:
  - a receita do mês continua R$ 8.940,00; os pedidos do mês passam de 96 para 126
  - as vendas associadas a publicações e eventos só usam membros anônimos da base, para não contradizer os insights do roster
  - o nível 5 também passa a ter o KPI Pedidos igual à soma de 7 dias (45), além da loja por produto
metrics:
  duration: ~2h20
  completed: 2026-10-14
estimate:
  tokens: 460000
actuals:
  tokens: 190000
  tasks: 5
  commits: 10
---

# Quick 261014-dwc: Financeiro com receita primária e secundária, em três abas — Resumo

**Uma lista única de 1.240 membros e seus pedidos (entrada no dia em que entraram + compras adicionais por oferta) passou a gerar todo número de dinheiro da prévia; o Financeiro virou três abas — Visão geral com seis números clicáveis, Produtos com capas 16:7, ofertas, compradores e eventos pagos, e Quem compra com faixas, escada de compra e quem nunca comprou de novo.**

Branch da cópia isolada: `worktree-agent-a9b8fe4f1440faf4a`, a partir de `e153d2aa` (branch de origem `feat/painel-preview`). Nada foi publicado nem enviado (sem push). O STATE.md não foi tocado.

## Commits

| # | Tarefa | Commit | Mensagem |
|---|---|---|---|
| 1 | T1 vermelho | `bc4dfeca` | test(quick-261014-dwc): pin the single order ledger, its offers and the products cascade |
| 2 | T1 verde | `28d03bf4` | feat(quick-261014-dwc): finance products down to each offer's buyers and their insights |
| 3 | T2 vermelho | `409a3bec` | test(quick-261014-dwc): pin the finance overview numbers, attention and associations |
| 4 | T2 verde | `f8da6f77` | feat(quick-261014-dwc): finance overview with primary and secondary revenue and numbers that open their lists |
| 5 | T3 vermelho | `44f4695c` | test(quick-261014-dwc): pin the monthly meetup on a future Saturday and a bell that says when |
| 6 | T3 verde | `998b61ac` | fix(quick-261014-dwc): move the monthly meetup to a future Saturday and make the bell say when |
| 7 | T4 vermelho | `71a379af` | test(quick-261014-dwc): pin who buys, the purchase ladder and the full product detail |
| 8 | T4 verde | `865bd861` | feat(quick-261014-dwc): who buys, the purchase ladder and the full product detail |
| 9 | T5 | `4f891121` | docs(quick-261014-dwc): finance tabs, sources, privacy and the store gaps for real data |
| 10 | resumo | (este arquivo) | docs(quick-261014-dwc): … |

Cada vermelho foi rodado antes do verde e falhou por exportação ausente ou asserção (T1: 6 arquivos do módulo + teste web; T2: 3 testes do painel + arquivo do Financeiro + 7 do leitor de URL; T3: 5 do módulo + 3 web; T4: arquivo do Financeiro + 6 do leitor de URL).

## Decisões travadas aplicadas (D-01..D-11)

- **D-01** Uma fileira "Vistas do financeiro" com três abas iguais (`grid-cols-3`, medido ±1 px no e2e), presente só nas telas de aba (uma faixa aberta em Quem compra também é tela de aba); nenhum seletor de período; cascata por links; parâmetro inválido cai um nível; cada Voltar leva à URL exata anterior (`apps/web/lib/owner-finance-view.ts`).
- **D-02** Lista única (`ownerFinanceOrders`): primária = 1º pedido pago de cada membro, no dia da entrada; secundária = qualquer pedido pago depois, renovação incluída (provado com uma renovação sintética); classificação por pedido, com ofertas próprias.
- **D-03** Entrada e VIP dão 1 ano; vencimento = compra + 365, marcado "exemplo".
- **D-04** Eventos pagos numa seção própria de Produtos, uma única pílula "exemplo", fora da receita da loja.
- **D-05** Cancelado = revogado: fora da receita, das contagens e da classificação (2 no mês).
- **D-06** Piso de 5 em todo total de grupo (faixa, publicação, evento, cancelamentos, caminho da escada); compradores por faixa do produto agrupados com `mergeBandsBelowFloor`.
- **D-07** Visão geral na ordem pedida: seis números → Precisa de atenção → Receita por semana → De onde vem a receita → O que só o app sabe → Próximos passos.
- **D-08** Produtos com capa 16:7 do `CommunityCover`, "Parado" no Workshop, detalhe com números, semanas, faixas, ofertas e publicações; oferta → compradores → membro.
- **D-09** Quem compra: receita por faixa em `Collapsible`, escada de compra e "entraram e nunca compraram de novo" com ação sugerida.
- **D-10** Base `previous_30_days` ("12% vs. 30 dias antes"); Encontro mensal em 17/10 (sábado, 19h), números de Eventos iguais, sino coerente.
- **D-11** Nomes só no nível 4: apenas `OwnerFinancePeople.tsx` lê `ownerFinancePeople`; nenhum arquivo dos níveis 1–3 importa `owner-finance`; README registra.

## Decisões do planejador aplicadas (PD-1..PD-19)

Todas aplicadas como escritas (detalhe linha a linha no README do módulo, seção "Financeiro (261014-dwc)"). Destaques: PD-1 receita do mês R$ 8.940,00 e 126 pedidos; PD-2 seis ofertas (E-book de entrada R$ 17, VIP de entrada R$ 247, E-book R$ 27, VIP por 1 ano R$ 197, Mentoria R$ 490, Workshop R$ 97); PD-3 a tabela exata do mês; PD-7 níveis 5/6 da lista; PD-16 Encontro em 17/10 e alerta `event_soon`; PD-19 campos antigos removidos (`ordersByBand`, `ordersDelta`, `renewal`, `conversion`, `expiringAccess7d` digitado) e as chaves de catálogo `tenantOwner.sales/revenue/access/conversion/buyers`.

## Decisões (minhas, durante a execução)

1. **Valor dos KPIs em reais inteiros** (`formatBrlWhole`, em `packages/contracts/src/money.ts`, onde mora toda divisão por 100): "R$ 4.162,00" quebrava em duas linhas ("R$ 4.162,0 / 0") a 360 px; agora "R$ 4.162". A linha do total e as listas mantêm os centavos.
2. **Cartão de produto em 2×2 abaixo de 20rem** (container query `@xs`): a 360 px "R$ 4,1 mil" era cortado; a 390/430 e dentro do iPhone continuam as quatro colunas. O e2e confere que nenhuma `dl` passa da largura.
3. **Eixo dos gráficos semanais em milhares de reais** ("1,5 mil", título "…, em reais"): "R$ 1 mil" não cabia na coluna de rótulos do `LineChart`.
4. **Escada de compra em linhas empilhadas** (ícone de passos à esquerda): o nome do caminho espremia a barra.
5. **"Imersão presencial: vagas esgotadas e 17 na lista de espera"** em vez de "lotado/lotada", para concordar com qualquer nome de evento.
6. **Associações de venda só com membros anônimos da base**: assim nenhum membro do roster aparece como comprador associado a uma publicação que ele não curtiu.
7. **KPI Pedidos do nível 5 = 45** (a mesma soma de 7 dias da loja), para o nível 5 não dizer 14 ao lado de uma loja que soma 45.
8. **`PeopleCards` exportado e genérico** (mesmo comportamento), reaproveitado nas listas do Financeiro.
9. A chave do sino do nível 5 é `tenantAdmin.attention.*` (o plano dizia `alerts`); renomeada para `event_soon` ali.

## Números finais fixados

- **Mês:** primária R$ 4.162,00 em 96 entradas (valor médio R$ 43,35, +13%); secundária R$ 4.778,00 em 30 compras adicionais (+11%); total R$ 8.940,00 em 126 pedidos (+12% contra R$ 7.982,00 nos 30 dias antes); parte da secundária 53% (0 p.p.); 201 membros já compraram de novo (16% da base, +17%); tempo médio até a 2ª compra 48 dias (+7%, em vermelho); receita por membro na vida toda R$ 73,61 (+2%); cancelamentos: menos de 5 pedidos.
- **Por oferta (30 dias):** VIP entrada 11 / R$ 2.717; E-book entrada 85 / R$ 1.445; Mentoria 6 / R$ 2.940; VIP adicional 7 / R$ 1.379; E-book adicional 17 / R$ 459; Workshop 0.
- **Por produto:** VIP 18 / R$ 4.096 (+6%); Mentoria 6 / R$ 2.940 (+20%); E-book 102 / R$ 1.904 (+13%); Workshop 0, sem venda há 74 dias ("Parado").
- **Faixas (hoje):** Novos 99 pedidos / R$ 4.753 / 96 compradores; Superfãs 10 / R$ 2.122; Engajados 11 / R$ 1.733; Ocasionais 6 / R$ 332; Em risco e Inativos 0. Superfãs + engajados = 43% da receita, 22% dos membros.
- **Escada:** E-book de entrada → Comunidade VIP 80 pessoas (30 dias em média); VIP de entrada → E-book 59 (93 dias); E-book de entrada → Mentoria 50 (29 dias); E-book de entrada → Workshop 9 (32 dias); Outros caminhos (2) menos de 5 pessoas.
- **Nunca compraram de novo:** Novos 93, Superfãs 23, Engajados 134, Ocasionais 108, Em risco 140, Inativos 541 (1.039 + 201 = 1.240).
- **Atenção:** 40 pagantes da VIP sumindo (22 em risco, 18 inativos, 11 com notificação), 6 acessos vencem em 7 dias (exemplo), Workshop sem venda há 74 dias, Imersão com 17 na espera (exemplo).
- **Associações:** vendas depois de publicação 12 pedidos distintos / R$ 1.807,00 (op-11 6 / R$ 502, op-15 6 / R$ 1.182, op-19 3, op-41 9 / R$ 1.216, op-55 2); depois de evento 13 pedidos distintos / R$ 2.080,00 (Workshop 01/10 com 6 / R$ 965, os outros com menos de 5); VIP R$ 4.096,00 · 104 ativos na semana de 186 com acesso.

## Tudo o que mudou fora do Financeiro

- **Visão geral do painel:** "Vendas do mês" continua R$ 8.940,00; a variação passou de "12% vs. mês anterior" para "12% vs. 30 dias antes". Canal `orders` 96 → 126.
- **Loja do painel (`store.products`):** VIP 21 / R$ 4.137 → 18 / R$ 4.096; E-book 69 / R$ 1.863 → 102 / R$ 1.904; Mentoria e Workshop iguais. O total continua R$ 8.940,00.
- **Nível 1:** sem mudança (c-igor R$ 8.940,00, "R$ 14,4 mil").
- **Nível 5:** loja de 7 dias Mentoria 6 → 3, VIP 5 → 7, E-book 3 → 35, Workshop 0; KPI Pedidos 14 → 45 (a variação "-2" ficou como estava).
- **Nível 6:** Pedidos 7d 14 → 45 (variação igual); preços das compras recentes iguais (VIP R$ 197, Mentoria R$ 490).
- **Insights do membro:** "Compras" agora lista todos os pedidos pagos do membro: a entrada (no `memberSince`, antes era a VIP um dia depois e só para quem tinha VIP), com a composição da oferta e a pílula Entrada/Adicional; "Vence em" só nas entradas e na VIP. Pedidos de 30 dias: todos os 12 novos (antes só os 10 com VIP) e om-13 (Mentoria), om-15, om-27, om-39 (E-book) e om-40 (VIP).
- **Dias ativos:** o dia da entrada virou dia ativo; só om-01 mudou de contagem (3 → 4 dias, 1 curtida a mais). Total de curtidas do roster 663 → 664 e Interações 831 → 832 (testes do Conteúdo refixados). Histórico de faixas de todos os 72 conferido igual ao de antes.
- **Conteúdo:** vendas até 7 dias iguais em valor (op-11 R$ 502, op-15 R$ 1.182 com vitrine 6, op-41 R$ 1.216, op-19 e op-55 "menos de 5 pedidos"), agora pedidos da lista única.
- **Eventos e sino:** Encontro mensal 12/10 → 17/10 (sábado, 19h, 92 de 100); ordem dos próximos Live 15/10, Encontro 17/10, Imersão 24/10; Por evento na mesma ordem (Engajados 23, 34, 16, 21, 18, 62, 45); sino dos níveis 4 e 5 "Hoje 19h" → "17/10, 19h"; post de 11/10 "o local preparado para hoje à noite" → "o local já está reservado para sábado".

## Evidências

| Comando (ambiente provisório exportado) | Resultado |
|---|---|
| `pnpm lint` (com a guarda de literais) | 16/16 tarefas; check-ui-literals OK |
| `pnpm typecheck` | 18/18 tarefas |
| `pnpm test` | 15/15 tarefas; módulo dashboard 362, web 2.506, contracts 167, core 405 (… todos verdes) |
| `pnpm boundaries` | 1.322 arquivos em 16 pacotes, nenhum problema |
| `pnpm check:static-routes` | 74 rotas protegidas, 0 infratores |
| Playwright do preview inteiro (`playwright.dwc.config.ts`, porta 3400), 1ª rodada | 237/240; as 3 falhas foram `net::ERR_NETWORK_IO_SUSPENDED` e timeouts com a máquina suspensa (rodada de 32,8 min) |
| As 3 falhas, rodadas de novo (`-g "financeiro"`, 37 casos) | 37/37 |
| Playwright do preview inteiro, 2ª rodada | **240/240** em 5,6 min |
| Limpeza | processo da 3400 parado (nada mais escuta nela); `playwright.dwc.config.ts` apagado; a 3000 continua com o mesmo processo (PID 96634); Chrome não foi tocado |
| `git diff --quiet 986a7de6 -- proxy.ts layout.tsx dashboard-preview.ts` | sem diff (trava intacta) |
| `grep -rl ownerFinancePeople apps/web/{app,components,lib}` | só `OwnerFinancePeople.tsx` |
| `grep -rl ownerMemberInsights …` | `OwnerMemberDetail.tsx`, `OwnerMemberList.tsx` (e o teste deste último) |
| Painéis dos níveis 1–3 importando `owner-finance` | nenhum |
| `find … \( -name '* 2*' -o -flags +dataless \)` | vazio |
| e2e `expectNoEnglish` (upsell, ticket, churn, MRR, insights) | nenhuma ocorrência em todas as telas do Financeiro |

## Capturas (390×844, claro, página inteira; não versionadas)

`.planning/quick/261014-dwc-financeiro-com-receita-primaria-e-secund/screens/`:
`01-visao-geral.png`, `02-produtos.png`, `03-produto-vip-ofertas.png`, `04-quem-compra-escada.png`. Olhadas uma a uma: capas na proporção, nada cortado, sem rolagem lateral, sem palavra em inglês. O círculo "N" no canto é o indicador do servidor de desenvolvimento do Next, não faz parte da tela.

## Desvios do plano

- [Regra 1] Cartão de produto cortava "R$ 4,1 mil" a 360 px → 2×2 abaixo de 20rem (commit `28d03bf4`).
- [Regra 1] Valor dos KPIs quebrava a 360 px → `formatBrlWhole` (commit `f8da6f77`); arquivo fora da lista `files_modified` (pacote contracts), com teste.
- [Regra 2] KPI Pedidos do nível 5 alinhado à soma de 7 dias (45) (commit `f8da6f77`).
- O teste de e2e antigo do Financeiro foi apagado, como o plano pedia; nenhum outro teste foi enfraquecido (os refixados estão listados acima).

## Known Stubs

Nenhum stub que impeça o objetivo. Seguem como "exemplo" (dado que o app ainda não grava): vencimento do acesso, lista de espera, ingressos dos eventos.

**⚠️ NÃO FEITO**
- Revisões `critic` e `flow-critic` sobre os commits novos: este executor não abre subagentes; ficam com o orquestrador antes de declarar a feature pronta.
- Merge na branch `feat/painel-preview`: o trabalho está na branch da cópia isolada `worktree-agent-a9b8fe4f1440faf4a`; integrar cabe ao orquestrador (sem push, como pedido).
- Estados vazios do Financeiro com dados reais (gráficos, barras e cartões ainda supõem linhas): registrado no README; fecha quando a fixture virar resposta da API.

## Self-Check: PASSED

- Arquivos criados existem: `owner-finance.ts`, `owner-finance.test.ts`, `owner-finance-view.ts`, `owner-finance-view.test.ts`, os cinco `OwnerFinance*.tsx` novos e as 4 capturas.
- Commits existem em `git log e153d2aa..HEAD`: bc4dfeca, 28d03bf4, 409a3bec, f8da6f77, 44f4695c, 998b61ac, 71a379af, 865bd861, 4f891121.
- `screens/` fica fora do commit; nenhuma cópia "* 2*" nem arquivo sem dados do iCloud.
