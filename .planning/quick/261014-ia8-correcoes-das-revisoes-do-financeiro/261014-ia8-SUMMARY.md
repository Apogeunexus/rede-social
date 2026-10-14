---
phase: quick-261014-ia8
plan: 01
subsystem: dashboard / prévia dos painéis (nível 4, Financeiro)
status: complete
tags: [dashboard, preview, tenant-owner, finance, review-fixes, pt-BR]
requires:
  - quick-261014-dwc (Financeiro em três abas, lista única de pedidos)
provides:
  - variação de Pedidos dos níveis 5 e 6 tirada da lista única (+16)
  - saída da lista de espera (Eventos#espera-<id>) a partir do Financeiro
  - listas de pessoas sem "e mais N" quando não há cartões
  - regra única do dinheiro (inteiro, compacto, centavos)
  - cartão principal da receita, definição de primária e secundária
  - capas variadas (faixa e destaque) por produto e por formato de evento
  - catálogo sem palavras em inglês na tela (exceto stories e reels)
affects:
  - apps/web/components/dashboard (Financeiro, Eventos, Conteúdo, cabeçalho)
  - packages/contracts/src/money.ts (formatBrlWhole, formatBrlCompact)
  - packages/modules/dashboard (BarList, fixture dos níveis 5 e 6)
tech-stack:
  added: []
  patterns:
    - "BarList: `anchor` por linha e leiaute `stacked` sem visual à esquerda"
    - "CoverThumb: variantes `strip` e `banner`, tipos de produto e de formato de evento"
key-files:
  created:
    - apps/web/components/dashboard/OwnerContentPeople.test.tsx
  modified:
    - packages/modules/dashboard/fixtures/tenant-panels.ts
    - packages/modules/dashboard/ui/BarList.tsx
    - packages/contracts/src/money.ts
    - apps/web/lib/owner-band-scope.ts
    - apps/web/components/dashboard/OwnerContentPeople.tsx
    - apps/web/components/dashboard/OwnerFinanceOverview.tsx
    - apps/web/components/dashboard/OwnerFinancePeople.tsx
    - apps/web/components/dashboard/OwnerFinanceProducts.tsx
    - apps/web/components/dashboard/OwnerFinanceProductDetail.tsx
    - apps/web/components/dashboard/OwnerFinanceBuyers.tsx
    - apps/web/components/dashboard/OwnerEvents.tsx
    - apps/web/components/dashboard/BandScopeCards.tsx
    - apps/web/components/dashboard/CoverThumb.tsx
    - apps/web/components/dashboard/PanelHeader.tsx
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "Lista de espera do evento lotado abre a área Eventos na âncora #espera-<id> (opção recomendada do CONTEXT)."
  - "formatBrlCompact arredonda para reais antes de compactar: R$ 999,50 vira R$ 1 mil, nunca R$ 1.000 nem R$ 999,5."
  - "O preço no cartão de produto voltou a ter centavos: é o valor de um pedido (regra F-8)."
  - "Compradores por faixa (detalhe) e as listas de Parte da secundária também usam o leiaute empilhado, pelo mesmo motivo do F-6."
  - "O slug de URL `?lista=posts-vistos` ficou: não aparece na tela e mudá-lo quebraria links."
metrics:
  duration: "~75 min"
  completed: 2026-10-14
actuals:
  tokens: 30400
  tasks: 3
  commits: 6
---

# Quick 261014-ia8 Plano 01: correções das revisões do Financeiro — Resumo

Pedidos dos níveis 5 e 6 com +16 tirado da lista única, o evento lotado levando à lista de espera em Eventos, listas de pessoas sem "e mais N" no vazio, cartão principal da receita com primária × secundária, uma regra só para dinheiro, capas variadas por produto e por formato de evento e o catálogo sem palavras em inglês na tela.

Branch da cópia isolada: `worktree-agent-ab8a40d50214b7044`, a partir de `9e99a56a` (`feat/painel-preview`). Nada publicado, sem push. O STATE.md não foi tocado, a pedido do orquestrador.

## Tarefas e commits

| Tarefa | Vermelho | Verde |
|---|---|---|
| 1. ALTAS de ponta a ponta (C-1, F-1, C-2/F-2, F-3) | `53454da0` | `26445c27` |
| 2. Visão geral (F-4, F-6, F-8 base, F-9, F-10, F-12) | `958ff12a` | `ce1c4cc4` |
| 3. Produtos, detalhe, Quem compra, inglês (F-5, F-7, F-8, F-11, E-1..E-3) | `7b9c484b` | `9b8015b2` |

### Vermelho antes do verde (saídas registradas)
- Tarefa 1: módulo `2 failed | 362 passed` (variação de Pedidos e âncora do BarList); web `4 failed | 43 passed` (âncora da espera, OwnerEvents e as duas de PeopleCards).
- Tarefa 2: contracts `2 failed | 28 passed` (inteiro arredondado e compacto sem centavos); módulo `1 failed | 14 passed` (BarList `stacked`).
- Tarefa 3: CoverThumb `2 failed | 12 passed`; e2e novos (seletor/período e varredura de inglês) `2 failed`.

## O que mudou, item a item

- **C-1** Níveis 5 e 6: Pedidos 45 com 16 para cima, "melhorou" (45 dos últimos 7 dias − 29 dos 7 anteriores, `ownerFinanceWindow(7, 13)`), fixado em `owner-finance.test.ts` e no e2e.
- **F-1** "Imersão presencial: vagas esgotadas…" abre `?area=eventos#espera-u3`, onde a linha diz "17 na espera". Em Produtos, Imersão (17), Workshop (12) e Encontro set. (38) têm a pílula "Vagas esgotadas · N na espera", "Ver lista de espera" e abrem a mesma âncora; o Encontro mensal (92 de 100) não tem pílula nem link. A nota de exemplo da lista virou "Receita e lista de espera: valores de exemplo".
- **C-2/F-2** `PeopleCards` sem ninguém na amostra mostra uma frase só; "e mais N", "Mostrando quem está na amostra" e "Ver todos" só depois de pelo menos um cartão. "Acessos que vencem" diz "Nenhum destes membros está na amostra da prévia. O vencimento ainda não é gravado." e mantém o cartão de ação.
- **F-3** Receita do detalhe em reais inteiros ("R$ 4.096"); e2e confere que nenhum `span.text-2xl` da Visão geral e dos 4 detalhes quebra linha a 360 px.
- **F-4** Frase de definição logo abaixo de "Números".
- **F-6** `BarList stacked`: valor compacto e "18 pedidos · 46%" em duas linhas, barra na largura toda; a 360 px a barra do líder passa de 40% do cartão nas duas listas.
- **F-9** Cartão principal acima dos seis números: R$ 8.940 numa linha, "12% vs. 30 dias antes", "126 pedidos nos últimos 30 dias", barra empilhada (larguras na razão 4.162 : 4.778, ±2 px no e2e), legenda Primária R$ 4.162 / Secundária R$ 4.778, aviso de valor registrado e cancelamentos com o piso.
- **F-10** "Parte da secundária" diz "igual aos 30 dias antes"; com mudança, "N pontos percentuais a mais/a menos que nos 30 dias antes". Nenhum "p.p." no Financeiro (o e2e confere em toda tela da área).
- **F-12** Título "Números"; recompra "16% da base, desde a abertura"; receita por membro já dizia "desde a abertura". O detalhe de produto segue "Números do mês" (lá tudo é do mês).
- **F-5** Nota de Ofertas com o texto do CONTEXT.
- **F-7** Capas `CoverThumb` em faixa (`strip`, h-16) nos cartões da lista e em destaque (`banner`, 16:7) no detalhe; ícones Users, GraduationCap, BookOpen, MonitorPlay (produtos) e MapPin, Video (formato do evento); tons distintos dentro de cada lista; só tokens da marca. Eventos e faixas seguem com a capa 16:10 de antes.
- **F-11** Toda plural com `#` em `tenantOwner.finance` ganhou `=0` com concordância (27 formas); de quebra, "1 acesso da … vence" (antes "1 acesso … vencem").
- **E-1/E-2/E-3** Ver as listas abaixo; o período "30 dias" é texto cinza, sem fundo nem borda.

## Varredura das variações fixas (C-1)

Todos os `delta:` de `packages/modules/dashboard/fixtures/`:
- **Corrigidas:** `tenant-panels.ts` nível 5 `kpis.orders` e nível 6 `store.orders7d` (de "2 a menos, piorou" para 16 para cima, `good: true`).
- **Já provadas, ficaram:** `tenant-owner.ts` receita +12% (`owner-finance.test.ts`), membros +8% e novos do nível 5 (`tenant-owner.test.ts`).
- **Ficou de propósito:** nível 1, vendas nas lojas +9% vs. mês anterior (`platform-panels.ts`): soma c-igor e c-aurora, e c-aurora não está na lista única.
- **Não são de dinheiro nem de pedido** (ficam): 1ª resposta, interagindo, comentários 24 h, publicações 7 d, uso em minutos, curtidas/comentários/salvamentos/compartilhamentos, engajados e presença em pontos, e as métricas da plataforma (clientes, membros, armazenamento, falhas).

## Regra do dinheiro aplicada, campo a campo

- **Inteiro (`formatBrlWhole`, arredonda):** os seis números e o cartão principal; valor médio da primária (R$ 43); receita por membro (R$ 74); cancelamentos (Visão geral e detalhe); contagens das listas (primária, secundária, parte da secundária, receita por membro e total); "Pagou R$ X desde que entrou" (soma da vida toda); "O que só o app sabe" (total, por publicação, por evento, linha da VIP); Receita do detalhe; "N pedidos · R$ X" das ofertas e das publicações do detalhe; frase e resumo de cada faixa em Quem compra.
- **Compacto (`formatBrlCompact`, sem centavos abaixo de mil):** barras de "De onde vem a receita" (produto e faixa), barras de "Parte da secundária" (entradas e adicionais por produto), barras de "Compradores por faixa", célula Receita do cartão de produto ("R$ 0" no Workshop), Receita do cartão de evento.
- **Centavos (`formatBrl`):** preço no cartão de produto, "Preço na loja", preço de cada oferta, ingresso do evento, e a linha de cada pessoa que diz o que comprou (compradores da oferta, primária, secundária, pagantes da VIP, compradores da faixa).
- Fora do Financeiro, o compacto só serve o nível 1 (R$ 14,4 mil) e a receita de evento das faixas e de Eventos (mil ou mais, ou "Gratuito"): textos iguais.

## Palavras em inglês (E-1, E-2)

Trocadas no `dashboard.json`:
- "Plataforma (white label)" → "Plataforma (marca branca)"; "Cliente (tenant)" → "Cliente".
- Tipo "Link" → "Página externa" (tipos de publicação e tipos do Conteúdo); "dos links" → "das páginas externas"; "Os links" → "As páginas externas"; "Clicaram no link" → "Abriram a página externa"; "cliques nos links" → "cliques nas páginas externas"; "Link copiado" → "Endereço copiado".
- post/posts → publicação/publicações, com concordância: "Posts vistos" → "Publicações vistas" (painel do membro e insights do dono), "mais vistos primeiro" → "mais vistas primeiro", "Nenhum post visto" → "Nenhuma publicação vista", "Posts que você curtiu/salvou/compartilhou/viu" → "Publicações que você …", "nenhum post" → "nenhuma publicação", "por tipo de post" → "por tipo de publicação", "nos posts de cada comunidade" → "nas publicações de cada comunidade", "em {posts} posts" → "em {posts} publicações", "Posts 30d" → "Publicações 30d", "Posts que mais renderam (14 dias)" → "Publicações que mais renderam (14 dias)", "visualizações dos posts" → "visualizações das publicações".
- "Feed" (nome do módulo) → "Início", e "no feed" → "no Início": o app já chama o mural de Início (`app.json`).

Ficaram, e por quê:
- **story/stories, reel/reels:** nomes de recurso do app que o usuário já usa (CONTEXT).
- **ticket, upsell, insights:** não aparecem como texto (só chaves e ids).
- **"Chat de suporte", "Status":** não estão na lista do CONTEXT e são de uso corrente em pt-BR; não mexi.
- **Slugs de URL** (`?lista=posts-vistos`, `#tipo-link`): não são texto da tela.
- Um teste novo percorre os 7 níveis e as 6 áreas do nível 4 e recusa `posts?|links?|feed|tenant|white label` (e os anteriores) no texto visível.

## Decisões

- **Destino da espera:** a área Eventos na âncora `#espera-<id>` (opção recomendada). Funções novas em `owner-band-scope.ts`, nada em `dashboard-preview.ts` (trava intacta).
- **Arredondamento do compacto:** arredonda para reais e decide pelo valor arredondado; assim nunca sai "R$ 999,5" nem "R$ 1.000" ao lado de "R$ 1 mil".
- **Preço do cartão de produto em centavos:** a tarefa 2 trocou o compacto e o preço virou "R$ 197"; pela regra, preço é valor de um pedido, então `formatBrl`.
- **Leiaute empilhado também no detalhe e em Parte da secundária:** na captura a 360 px, "Novos, engajados e ocasionais" quebrava em 4 linhas com uma barra mínima, o mesmo defeito do F-6.
- **Pílula do evento lotado em linha própria:** a 360 px, Presencial + pílula + ingresso não cabem numa linha; o `flex-wrap` já existente leva a pílula para baixo, sem cortar nada.
- **Teste de 360 px em `span.text-2xl`:** o valor do cartão principal é `text-3xl` e tem verificação própria (altura < 1,5 linha).

## Desvios do plano

### Corrigidos automaticamente
1. **[Regra 1] Preço do cartão de produto perdeu os centavos** — achado na tarefa 2 (e2e "Produtos" falhou com "R$ 197"); corrigido para `formatBrl` no mesmo commit `ce1c4cc4`.
2. **[Regra 1] Seletor do teste do F-6** — o `rate` fica dentro do `span` do valor, então `getByText(/^R$ 4,1 mil$/)` não acha nada; o teste passou a medir o `rate` contra o seu pai. Mesmo commit.
3. **[Regra 2] Concordância do verbo em `lists.expiring.count`** ("1 acesso … vencem") — corrigida junto do F-11 em `9b8015b2`.
4. **[Regra 1] Barras estreitas no detalhe e em Parte da secundária** — `stacked` aplicado, `9b8015b2`.
5. **Ambiente:** `pnpm test` (turbo em paralelo, com a 3000 e o Chrome rodando) estourou o tempo de 5 s em testes de pacotes que não mudaram (core, notifications, ui, feed). Rodado de novo com `turbo run test --concurrency=2`: 15/15 verdes. Uma rodada do e2e completo teve 1 timeout ("membro: a list scrolls inside the phone") enquanto o `pnpm test` rodava junto; sozinho passou, e a rodada final foi 245/245.

## Verificação (cópia isolada, ambiente provisório inline)

| Verificação | Resultado |
|---|---|
| `pnpm lint` (com a guarda de literais) | 16/16 tarefas; `check-ui-literals: OK` |
| `pnpm typecheck` | 18/18 tarefas |
| `pnpm test` (`turbo run test --concurrency=2`) | 15/15 tarefas; web 2.513, módulo dashboard 365, contracts 167, core 405, feed 247, stories 162, events 160, ui 180, notifications 127, reels 126, api 60, store 54, communities 52, chat 44, reuse 3 — todos verdes |
| `pnpm boundaries` | 1.325 arquivos em 16 pacotes, nenhum problema |
| `pnpm check:static-routes` | 74 rotas guardadas, 0 ofensores |
| Playwright do preview inteiro (porta 3400, servidor próprio por rodada) | **245/245** (21,6 min); linha de base antes das mudanças: 240/240 |
| Trava de produção (`git diff --quiet 986a7de6 -- proxy.ts painel-preview/layout.tsx lib/dashboard-preview.ts`) | sem diff |
| Só um arquivo lê `ownerFinancePeople` | 1 (`OwnerFinancePeople.tsx`) |
| Cópias "* 2*" ou arquivos sem dados do iCloud | 0 |
| Capturas | 10 em `screens/` (360 e 390: visão geral, produtos, VIP, acessos que vencem, seletor), olhadas uma a uma, fora do commit |

A configuração temporária (`playwright.ia8.config.ts`, a de capturas e o roteiro) foi apagada; o servidor da 3400 parou com o Playwright; a 3000 segue com o mesmo processo (PID 92383).

## Ameaças

Nenhuma superfície nova: a âncora `#espera-<id>` é só fragmento, montada com ids da fixture; nenhum parâmetro de URL novo é lido; a frase de lista vazia não cita ninguém.

## Observado fora do escopo (não mexi)

- A Visão geral do nível 4 (fora do Financeiro) ainda mostra "Vendas do mês R$ 8.940,00" e "2 p.p." / "5 p.p.": a regra do dinheiro e o "sem p.p." do CONTEXT valem "nesta área" (Financeiro). Alinhar exige uma decisão de escopo.

## ⚠️ NÃO FEITO

- Revisões `critic` e `flow-critic` desta correção: não rodadas aqui (o executor não abre subagentes de revisão); ficam para o orquestrador.
- Vermelho do e2e das tarefas 1 e 2 não foi rodado contra o código antigo (só o da tarefa 3); o vermelho dessas tarefas foi provado pelos testes de unidade.
- A Visão geral do nível 4 fora do Financeiro com "R$ 8.940,00" e "p.p.": fora do escopo; precisa de decisão para estender a regra.

## Self-Check: PASSED

- Arquivos: `OwnerContentPeople.test.tsx` existe; `owner-band-scope.ts` tem `ownerWaitlistHref`; `money.ts` tem `Math.round`; `OwnerFinanceOverview.tsx` tem `data-finance-total`; `CoverThumb.tsx` tem `strip`; `tenant-panels.ts` tem `amount: 16`.
- Commits: `53454da0`, `26445c27`, `958ff12a`, `ce1c4cc4`, `7b9c484b`, `9b8015b2` presentes no log.

## Revisões e integração (orquestrador)

- **Integração:** avanço simples na `feat/painel-preview` (cf7ff7d5).
- **Revisão de comportamento:** APROVADO. Dois achados menores:
  - espera em eventos que já passaram;
  - "check-in" ainda na tela.
- **Revisão de fluxo:** APROVADO. Seis achados menores:
  - variação lida como preço no detalhe;
  - eventos passados com espera;
  - "Números do mês" no detalhe;
  - "vs." e "Admin" na tela;
  - escala das barras;
  - linha de destino sem destaque.
- **Correção:** todos os achados menores das duas revisões foram corrigidos em c6b1e6e1.
- **Fica de fora:** "Fazer check-in" está na tela real de eventos do app (`messages/pt-BR/events.json`), fora da prévia dos painéis.
- **Verificações finais:**
  - lint 16/16;
  - typecheck 18/18;
  - testes 15/15;
  - fronteiras limpas;
  - rotas estáticas OK;
  - Playwright 244/245. O único caso que mudou de propósito foi atualizado, e o grupo do Financeiro passou 39/39.
