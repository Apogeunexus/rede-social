---
phase: quick-261014-dwc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/modules/dashboard/fixtures/owner-finance.ts
  - packages/modules/dashboard/fixtures/index.ts
  - packages/modules/dashboard/fixtures/tenant-owner.ts
  - packages/modules/dashboard/fixtures/tenant-panels.ts
  - packages/modules/dashboard/fixtures/owner-member-insights.ts
  - packages/modules/dashboard/fixtures/owner-member-lists.ts
  - packages/modules/dashboard/fixtures/owner-content.ts
  - packages/modules/dashboard/fixtures/owner-members.ts
  - packages/modules/dashboard/fixtures/owner-posts.ts
  - packages/modules/dashboard/tests/owner-finance.test.ts
  - packages/modules/dashboard/tests/tenant-owner.test.ts
  - packages/modules/dashboard/tests/fixtures.test.ts
  - packages/modules/dashboard/tests/owner-member-insights.test.ts
  - packages/modules/dashboard/tests/owner-member-lists.test.ts
  - packages/modules/dashboard/tests/owner-content.test.ts
  - packages/modules/dashboard/tests/owner-members.test.ts
  - packages/modules/dashboard/README.md
  - apps/web/lib/owner-finance-view.ts
  - apps/web/lib/owner-finance-view.test.ts
  - apps/web/lib/owner-band-scope.test.ts
  - apps/web/app/painel-preview/[nivel]/page.tsx
  - apps/web/components/dashboard/TenantOwnerPanel.tsx
  - apps/web/components/dashboard/TenantAdminPanel.tsx
  - apps/web/components/dashboard/OwnerFinance.tsx
  - apps/web/components/dashboard/OwnerFinanceOverview.tsx
  - apps/web/components/dashboard/OwnerFinanceProducts.tsx
  - apps/web/components/dashboard/OwnerFinanceProductDetail.tsx
  - apps/web/components/dashboard/OwnerFinanceBuyers.tsx
  - apps/web/components/dashboard/OwnerFinancePeople.tsx
  - apps/web/components/dashboard/OwnerContentPeople.tsx
  - apps/web/components/dashboard/OwnerMemberDetail.tsx
  - apps/web/components/dashboard/OwnerEvents.test.tsx
  - apps/web/components/dashboard/BandMembers.test.tsx
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, PWA-03, MOD-02, UI-03]
tags: [dashboard, preview, tenant-owner, finance, primary-secondary-revenue, cascade, pt-BR]

estimate:
  tokens: 460000
  raw_tokens: 460000
  tasks: 5
  confidence: low

must_haves:
  truths:
    - "D-01: `?area=financeiro` tem UMA fileira 'Vistas do financeiro' com três abas iguais (grid-cols-3, ±1 px): Visão geral | Produtos | Quem compra → `?area=financeiro`, `&vista=produtos`, `&vista=quem-compra`; nenhuma outra fileira de escolha e nenhum seletor de período em nível nenhum; cada passo é um link com parâmetro da lista permitida; um parâmetro inválido cai um nível, nunca dá erro; cada Voltar leva à URL exata do passo anterior."
    - "D-02/D-03/D-05: uma lista única de pedidos (`ownerFinanceOrders`) gera todos os totais: 1.240 membros, cada um com exatamente uma compra primária, no dia da entrada; nos últimos 30 dias, 96 entradas (R$ 4.162,00) + 30 compras adicionais (R$ 4.778,00) = 126 pedidos e R$ 8.940,00; 2 cancelados (revogados) fora da receita; a classificação é por pedido (o mesmo produto vende como entrada e como adicional, por ofertas diferentes); a mesma receita na Visão geral do painel e no nível 1; insights do membro (Compras), Conteúdo (vendas até 7 dias, vitrine) e os 7 dias dos níveis 5 e 6 coerentes, tudo provado por testes de soma."
    - "D-07: Visão geral, nesta ordem: seis números (Receita primária, Receita secundária, Parte da secundária no total, Membros que já compraram de novo, Tempo médio até a segunda compra, Receita por membro na vida toda), cada um com variação vs. 30 dias antes e abrindo uma lista cuja linha de contagem repete o valor; a linha da receita total registrada com 'valor registrado, não dinheiro recebido'; Precisa de atenção (40 pagantes da VIP sumindo, 6 acessos que vencem em 7 dias com 'exemplo', Workshop gravado sem venda há 60 dias, Imersão presencial lotada com espera 'exemplo'), cada linha abrindo sua lista ou destino; Receita por semana (primária e secundária, 12 semanas anteriores tracejadas); De onde vem a receita (produto e faixa); O que só o app sabe (vendas depois de publicação e de evento, com a nota de associação; VIP × uso); Próximos passos (3 ações desativadas)."
    - "D-08/D-04: Produtos mostra 4 cartões com capa 16:7 (degradê), preço, vendas como entrada e como adicional, receita e comparação; o Workshop gravado tem a pílula 'Parado'; o detalhe traz números, receita por semana, compradores por faixa (com piso), as ofertas (composição, preço, Entrada/Adicional, pedidos, receita) e as publicações que venderam; oferta → compradores → membro (`OwnerMemberDetail`); abaixo, os eventos pagos em `EventCard` 16:10 com uma só pílula 'exemplo', fora da receita total."
    - "D-09: Quem compra mostra a receita por faixa em seis `Collapsible` (compradores → membro), a escada de compra (oferta de entrada → próxima compra, quantas pessoas, tempo médio, caminhos com menos de 5 pessoas em 'Outros caminhos') e quem entrou e nunca comprou de novo, por faixa (lista → membro), com uma ação sugerida."
    - "D-06/D-11: todo total de grupo (faixa, publicação, evento, cancelados) com menos de 5 pedidos lê 'menos de 5 pedidos', sem valor; listas nominais de compradores mostram nome e valor, só no nível 4; os níveis 1 a 3 continuam só com agregados; o README do módulo registra."
    - "D-10: a base de comparação do financeiro é `previous_30_days` ('12% vs. 30 dias antes'); o Encontro mensal (u1) passa para 17/10 (sábado, 19h), com os números de Eventos iguais e o sino coerente."
    - "Gates com o ambiente provisório: pnpm lint (com a guarda de literais), typecheck, test, boundaries, check:static-routes e a suíte Playwright do preview inteira, verdes num servidor próprio na porta 3400; trava de produção sem diff desde 986a7de6; sem rolagem lateral a 360/390/430 nem dentro do iPhone a 1440×900; nenhuma das palavras em inglês proibidas pelo CONTEXT na tela; 4 capturas em `screens/` (não versionadas). Sem publicar."
  artifacts:
    - path: packages/modules/dashboard/fixtures/owner-finance.ts
      provides: "as ofertas, os 1.240 membros da base, a lista única de pedidos, a classificação primária/secundária e todos os agregados e listas do Financeiro"
      contains: "export const ownerFinanceOrders"
    - path: apps/web/lib/owner-finance-view.ts
      provides: "a cascata do Financeiro: leitura nível a nível da URL, links, Voltar e âncoras"
      contains: "export function parseOwnerFinanceView"
    - path: apps/web/components/dashboard/OwnerFinance.tsx
      provides: "o roteador da área: a fileira de abas nas telas de aba, senão o passo mais fundo com seu Voltar"
      contains: "financeBackHref"
    - path: apps/web/components/dashboard/OwnerFinancePeople.tsx
      provides: "toda lista com nomes do Financeiro (compradores da oferta, listas dos números, atenção, faixas, nunca compraram de novo)"
      contains: "ownerFinancePeople"
    - path: apps/web/components/dashboard/OwnerFinanceProducts.tsx
      provides: "os cartões de produto com capa 16:7 e a seção de eventos pagos"
      contains: "CommunityCover"
    - path: apps/web/components/dashboard/OwnerFinanceBuyers.tsx
      provides: "Quem compra: faixas, escada de compra, nunca compraram de novo"
      contains: "Collapsible"
  key_links:
    - from: packages/modules/dashboard/fixtures/owner-member-insights.ts
      to: packages/modules/dashboard/fixtures/owner-finance.ts
      via: "as compras do membro são os pedidos dele na lista única (data, oferta, valor)"
      pattern: "ownerFinanceOrders"
    - from: packages/modules/dashboard/fixtures/owner-content.ts
      to: packages/modules/dashboard/fixtures/owner-finance.ts
      via: "as vendas até 7 dias de cada publicação são pedidos secundários da lista única, com o preço da oferta"
      pattern: "ownerFinance"
    - from: apps/web/app/painel-preview/[nivel]/page.tsx
      to: apps/web/lib/owner-finance-view.ts
      via: "dono-do-cliente passa finance={parseOwnerFinanceView(query)}"
      pattern: "parseOwnerFinanceView\\("
    - from: apps/web/lib/owner-finance-view.ts
      to: packages/modules/dashboard/fixtures/owner-finance.ts
      via: "um membro só vale se pertence à lista aberta (predicado de pertença; o leitor da URL não lê nomes)"
      pattern: "ownerFinanceIncludes\\("
    - from: apps/web/components/dashboard/OwnerFinance.tsx
      to: apps/web/components/dashboard/OwnerMemberDetail.tsx
      via: "o membro aberto no Financeiro reaproveita os insights com backHref/listHref da cascata do Financeiro"
      pattern: "OwnerMemberDetail"
    - from: packages/modules/dashboard/tests/owner-finance.test.ts
      to: packages/modules/dashboard/fixtures/tenant-owner.ts
      via: "receita do mês, produtos, canais, Novos, VIP por faixa e semanas de entrada iguais aos da lista única"
      pattern: "tenantOwnerPanel"
---

<objective>
Refazer a área Financeiro do nível 4 (`/painel-preview/dono-do-cliente?area=financeiro`) em três abas (Visão geral | Produtos | Quem compra), com a receita dividida em primária (a primeira compra paga de cada membro, a que dá acesso ao app) e secundária (toda compra paga depois dela, renovação incluída), por pedido e por oferta, seguindo as decisões travadas D-01..D-11 de `261014-dwc-CONTEXT.md` (o CONTEXT prevalece sobre `.planning/research/FINANCEIRO-PROPOSTA.md`), na branch `feat/painel-preview`, HEAD 986a7de6.

Propósito: em 10 segundos o dono sabe quanto entrou pela porta e quanto veio de quem já estava dentro; em 1 minuto sabe qual oferta vende, quem compra de novo e para quem oferecer a próxima. Tudo sai de uma lista única de pedidos, então os números do Financeiro, dos insights do membro, do Conteúdo e da Visão geral do painel são o mesmo fato.

Saída: dados fictícios novos com testes de soma e coerência, leitor de URL com testes, roteador e cinco componentes novos da área, compras com oferta nos insights, catálogo pt-BR, testes de ponta a ponta, README, data do Encontro mensal corrigida, 4 capturas.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/quick/261014-dwc-financeiro-com-receita-primaria-e-secund/261014-dwc-CONTEXT.md
@.planning/research/FINANCEIRO-PROPOSTA.md
@.planning/quick/261013-uoi-correcoes-das-revisoes-de-conteudo-e-lis/261013-uoi-SUMMARY.md
@apps/web/AGENTS.md

Referência: na proposta, leia a seção final "Decisão do usuário (2026-10-14)" e, só para leiaute, as seções 5 e 9. Onde divergirem, vale o CONTEXT.

Fatos conferidos pelo planejador (HEAD 986a7de6):
- Tela atual: `apps/web/components/dashboard/OwnerFinance.tsx:32-152` (2 números, 4 blocos fechados, nada clicável), lendo `tenantOwnerPanel.kpis`, `store` e `ordersByBand`.
- `packages/modules/dashboard/fixtures/tenant-owner.ts`: alerta `event_today` do Encontro mensal (:276-283); `kpis.orderValue` 894.000 centavos, +12%, base `previous_month` (:295-298); faixas 96/62/205/150/168/559 = 1.240 (:304-307); VIP (`communityEngagement` c-vip) 14/38/61/33/22/18 = 186, `atRiskWithPush` 11 (:309-316); `growth.weeklyJoined` [14,17,15,19,18,21,16,19,20,22,23,28] (:369); `ordersByBand` soma 96 (:480); `channels` orders 96 (:485-491); u1 Encontro mensal 2026-10-12 19h, 92/100 (:543-554); `store.products` VIP 21/413.700, Mentoria 6/294.000, E-book 69/186.300, Workshop 0 (:611-616); `ordersDelta` `previous_month` (:617); `expiringAccess7d` 6 VIP, `renewal` e `conversion` de exemplo (:618-633).
- `owner-members.ts`: `PREVIEW_TODAY` '2026-10-12' (:20) e `PREVIEW_NOW_TIME` '23:00' (:26): às 23:00 o Encontro das 19h (180 min) já acabou — é o "já passou" do usuário; entrada do roster = 12+j dias (novos) ou 40 + 23·faixa + 9·j dias (:246), ou seja, de 63 a 254 dias para quem não é novo; acesso à VIP a partir do slot j ≥ 2 (:209-214).
- `owner-member-insights.ts`: a compra da VIP é 1 dia depois da entrada (:222-223), com preço = centavos ÷ pedidos do produto (:194-200), vencimento = compra + 365 (:362-366, exemplo); `last30.orders` (:303). `owner-member-lists.ts:337-338` aceita um único pedido de 30 dias (`order | null`).
- `owner-content.ts`: `BUSINESS` (:721-752) dá pedidos até 7 dias depois por publicação (op-11: 4 E-book + 2 VIP; op-15: 6 VIP e vitrine 6; op-19: 3 E-book; op-41: 5 E-book + 3 VIP + 1 Mentoria; op-55: 2 E-book), com preço por `unitCents` = centavos ÷ pedidos (:770-776), que lança erro quando o produto tem mais de um preço.
- Testes que fixam o modelo antigo: `tests/tenant-owner.test.ts:344-376` (96 pedidos, R$ 8.940, nível 5 ≥, preços do nível 6); `tests/fixtures.test.ts:110-111` (`ordersByBand` = canais) e :191-195 (c-igor = `orderValue` = 894.000); `tests/owner-member-insights.test.ts:316-349`; `tests/owner-member-lists.test.ts:199-241`; `tests/owner-content.test.ts` (pins op-11 6/50.200, op-15 6/118.200, a mais interagida 9/121.600; vitrine ≤ 21); `tests/owner-members.test.ts:118-120` (`PREVIEW_TODAY` = data do 1º próximo evento); `apps/web/lib/owner-band-scope.test.ts:57-60` (ordem de `OWNER_EVENTS`).
- Nível 5 (`tenant-panels.ts`): alerta `event_today` (:91-99) e loja de 7 dias Mentoria 6 / VIP 5 / E-book 3 / Workshop 0 (:162-167). Nível 6: `orders7d` 14, Workshop sem pedido em 30 dias, 6 acessos VIP, compras recentes VIP 19.700 e Mentoria 49.000 (:317-330).
- Nível 1: `platform-panels.ts:119-124` c-igor 894.000; o e2e fixa "R$ 14,4 mil" (`painel-preview.spec.ts:2903`).
- Esquema real da loja (`packages/modules/store/db/schema.ts`): um pedido vivo por membro e produto (`store_orders_live_uq`, :180-182); `expires_at` nunca preenchido (:200-222); não existe tabela de ofertas; `store_orders` só é lido pelo próprio usuário ou por `admin_tenant` (:147).
- Padrões a reaproveitar: abas `OwnerContent.tsx:24-49`, membro aberto `OwnerContent.tsx:73-99`, roteador `OwnerContent.tsx:110-125`; leitor de URL `apps/web/lib/owner-content-view.ts` (`pick`/`bySlug` :126-138, níveis :208-225, link :231-243, Voltar :252-286); `NumberLink` e `Kpis` em `OwnerContentOverview.tsx:94-189`; `AppLine`/`AppKnows` com piso em `OwnerContentPostDetail.tsx:255-316`; `PeopleCards` (10 cartões + linha da amostra + "e mais N" + "Ver todos" desativado) em `OwnerContentPeople.tsx:44-108` (ainda não exportado); `MemberCard` (faixa, linha `lead`, `id`, pílula) em `BandMembers.tsx:131-206`; `Cell`, `Linked`, `eventRevenue`, `EventCard`, `RevenueExampleNote` em `BandScopeCards.tsx:60-88, 140-247`; `CommunityCover` geometria `card` = `aspect-[16/7]` com fundo `--brand-gradient` e `data-testid="community-cover-fallback"` (`packages/modules/communities/ui/CommunityCover.tsx:70-73, 137-156`); `LineChart` tem uma série e um período anterior tracejado (`packages/modules/dashboard/ui/LineChart.tsx:9-19`), com `LegendStroke.tsx`; `isBelowPrivacyFloor`, `PRIVACY_FLOOR` e `mergeBandsBelowFloor` (`ui/metrics.ts:83-140`); `kpiDelta` (`format.ts:134-145`) e a chave `delta.previous_30_days` "vs. 30 dias antes" (`dashboard.json:50`); compras no detalhe do membro `OwnerMemberDetail.tsx:315-349`.
- e2e: auxiliares `ownerArea`, `ownerTabs`, `kpiCard`, `sectionTitled`, `areaDetails`, `cardCell`, `boxRatio`, `horizontalOverflow`, `pageOverflow`, `screenMetrics`, `openAllDetails`, `PHONE_WIDTHS`; `OWNER_AREA_CASES` financeiro (:463); Visão geral do painel com R$ 8.940,00 (:608-641); Por evento (:903-980); Eventos (:2689-2720); Financeiro antigo (:2779-2809); vendas do Conteúdo (:2376, :2436, :2444); sino (:310-334).
- `playwright.preview.config.ts` aponta para a 3000 com `reuseExistingServer: true`.

Decisões do planejador (aplicar como escritas; o SUMMARY lista todas):
- PD-1 A receita do mês continua R$ 8.940,00 (894.000 centavos). Assim a Visão geral do painel, o nível 1 (c-igor, "R$ 14,4 mil") e o Conteúdo não mudam de valor. Os pedidos do mês passam de 96 para 126, porque as 96 entradas dos Novos agora somam com as compras adicionais.
- PD-2 Ofertas (dado do cliente na lista única, `FINANCE_OFFERS`). Uma oferta tem produto, tipo, composição e preço:

  | id | produto | tipo | composição | preço |
  |---|---|---|---|---|
  | `ebook-entrada` | s3 E-book | entrada | E-book + 1 ano de acesso ao app | R$ 17 |
  | `vip-entrada` | s2 Comunidade VIP | entrada | Comunidade VIP + 1 ano de acesso ao app | R$ 247 |
  | `ebook-adicional` | s3 E-book | adicional | E-book | R$ 27 |
  | `vip-adicional` | s2 Comunidade VIP | adicional | Comunidade VIP por 1 ano | R$ 197 |
  | `mentoria-adicional` | s1 Mentoria em grupo | adicional | Mentoria em grupo: 4 encontros ao vivo | R$ 490 |
  | `workshop-adicional` | s4 Workshop gravado | adicional | Workshop gravado | R$ 97 |

  As adicionais mantêm o preço unitário de hoje, então as vendas do Conteúdo (R$ 502,00 em op-11 etc.) e os preços das compras recentes do nível 6 continuam valendo. A entrada de E-book é a oferta de porta (R$ 17), comum em produto digital. O "Preço" do cartão de produto é o preço de loja do produto, que é o da oferta adicional.
- PD-3 Metas exatas dos últimos 30 dias (os testes fixam):

  | oferta | pedidos | centavos |
  |---|---|---|
  | `vip-entrada` | 11 | 271.700 |
  | `ebook-entrada` | 85 | 144.500 |
  | **primária** | **96** | **416.200** |
  | `mentoria-adicional` | 6 | 294.000 |
  | `vip-adicional` | 7 | 137.900 |
  | `ebook-adicional` | 17 | 45.900 |
  | `workshop-adicional` | 0 | 0 |
  | **secundária** | **30** | **477.800** |
  | **total** | **126** | **894.000** |

  Por produto: VIP 18 / 409.600; Mentoria 6 / 294.000; E-book 102 / 190.400; Workshop 0 / 0. Pela faixa de hoje: Novos 99 / 475.300 (as 96 entradas + 3 VIP adicional); Superfãs 10 / 212.200 (4 Mentoria + 6 E-book adicional); Engajados 11 / 173.300 (2 Mentoria + 3 VIP adicional + 6 E-book adicional); Ocasionais 6 / 33.200 (1 VIP adicional + 5 E-book adicional); Em risco 0; Inativos 0. Os 14 Novos com VIP = 11 entradas VIP + 3 VIP adicional. Cancelados no período: 2 (1 VIP adicional e 1 Mentoria), fora da receita e das contagens acima. Parte da secundária: 53%. Valor médio de entrada: R$ 43,35. Período anterior (30 a 59 dias atrás): receita total entre 794.700 e 801.700 centavos, para que a variação seja +12%; o resto do período anterior é livre e fica fixado nos testes.
- PD-4 A faixa do comprador é a de hoje, como "Quem interage" no Conteúdo. Uma compra nos últimos 30 dias é ação, então Em risco e Inativos têm 0 por definição e dizem isso numa frase; as entradas do mês são exatamente os Novos. A nota antiga "faixa do dia anterior à compra" sai.
- PD-5 A comunidade abriu há cerca de 1 ano. Os 6 primeiros membros (entrada VIP) entraram entre 358 e 364 dias atrás, e ninguém mais entrou nessa semana. São os 6 acessos que vencem em 7 dias (D-03: compra + 365, marcado "exemplo"), iguais ao "6 · Comunidade VIP" do nível 6. Nenhum acesso venceu ainda, então ainda não há renovação. A regra de classificação vale para ela (é secundária) e é provada por um teste com uma renovação sintética. O bloco antigo de taxa de renovação sai.
- PD-6 Pedidos do roster (os 72 membros com nome):
  - A entrada é sempre no `memberSince`. Novos com acesso VIP (j ≥ 2) entram por `vip-entrada`. Quem não é novo, tem VIP e tem j par também. Os demais entram por `ebook-entrada`.
  - Quem tem VIP e j ímpar (≥ 3, fora os novos) compra `vip-adicional` depois. Esse é o caminho "E-book de entrada → Comunidade VIP".
  - Todo membro do roster com acesso VIP tem exatamente um pedido VIP pago. Quem não tem acesso não tem nenhum.
  - Secundária com mais de 30 dias fica a 90 dias ou mais (fora da janela de 90 dias dos insights, então faixa e histórico não mudam). Nunca é antes da entrada nem mais recente que o `lastActive`. Uma compra no próprio dia da entrada vale.
  - Secundária dos últimos 30 dias fica no dia do `lastActive`, que já é dia ativo. No máximo 1 pedido de 30 dias por membro do roster, contando a entrada dos novos.
  - Pelo menos um membro do roster compra, nos 30 dias, cada oferta adicional com pedidos (Mentoria, VIP adicional, E-book adicional). Prefira, para a VIP adicional, um ocasional ou engajado de j ímpar cujos dias ativos dos 30 dias caiam no dia da compra ou depois.
  - Um produto por membro (`store_orders_live_uq`).
  - Roster ≤ base em cada oferta, faixa e janela.
- PD-7 Os pedidos de 7 dias do nível 5 (`tenantAdminPanel.store`, por produto) e do nível 6 (`tenantStaffPanel.store.orders7d.count`) passam a ser os da lista única. O teste muda de "≥" para igualdade. Os preços das compras recentes do nível 6 continuam iguais ao preço de uma oferta do produto.
- PD-8 A capa do produto é o próprio `CommunityCover` com geometria `card` (16:7, degradê), sem componente novo. A proposta sugeria um `ProductCover`, mas o CONTEXT pede a proporção do `CommunityCover`.
- PD-9 Cartão de produto com quatro colunas: Preço · Entrada · Adicional · Receita (`formatBrlCompact`). Embaixo vem a linha da variação contra os 30 dias antes (`kpiDelta`). Se não houve venda nos dois períodos, a linha diz isso, sem seta. A pílula "Parado" (warning) aparece quando o último pedido pago tem mais de 60 dias.
- PD-10 Um produto também abre a partir da Visão geral: pela linha do produto parado e pela linha da VIP em "O que só o app sabe". O Voltar leva à linha de origem (`#produto-<id>`), como a publicação aberta da Visão geral no Conteúdo.
- PD-11 "Parte da secundária no total" abre a divisão por produto (entrada × adicional), sem nível abaixo. Os outros cinco números abrem cartões de membro da amostra, com "e mais N".
- PD-12 Eventos pagos: só os eventos com ingresso maior que zero, próximos primeiro e depois os passados. Cada um é um `EventCard` sem link, com Data · Inscritos · Receita (`eventRevenue`) e o ingresso na linha cinza. Há uma única linha `RevenueExampleNote` com a pílula, e um rodapé com quantos eventos gratuitos ficaram de fora. O `li` de cada evento tem `id="evento-<id>"`.
- PD-13 "Receita por semana" são dois `LineChart` (primária e secundária), cada um com as 12 semanas anteriores tracejadas e a legenda `LegendStroke`, porque o gráfico tem uma série e um período anterior.
- PD-14 "Compradores por faixa", no detalhe do produto, agrupa por `mergeBandsBelowFloor` sobre os pedidos (regra C-1 do módulo). Assim nenhuma faixa abaixo de 5 é deduzida pelo total. A "Receita por faixa" de Quem compra aplica o piso no código; a PD-3 deixa toda faixa compradora com 5 ou mais pedidos (há teste).
- PD-15 Escada de compra:
  - Um caminho vai da oferta de entrada até a oferta do 2º pedido pago, na vida toda.
  - Cada caminho mostra quantas pessoas e a média de dias.
  - Caminhos com menos de 5 pessoas viram "Outros caminhos", na última linha.
  - As linhas não têm link. D-09 não pede essa lista, e quem comprou de novo já está no número da Visão geral.
- PD-16 Encontro mensal (D-10): passa para 2026-10-17, sábado, 19h, o 3º sábado do mês, como o Encontro set. de 19/09.
  - `PREVIEW_TODAY` continua 2026-10-12 23:00, então nenhum "há N dias" muda.
  - Os próximos ficam em ordem de data: u2 15/10, u1 17/10, u3 24/10.
  - O alerta do sino deixa de ser "hoje": `event_today` vira `event_soon` com `date`, nos níveis 4 e 5, e a etiqueta passa a "17/10, 19h".
  - O post de 11/10 "Encontro mensal: o local preparado para hoje à noite" passa a "Encontro mensal: o local já está reservado para sábado".
- PD-17 A lista "acessos que vencem" não tem nomes: os 6 entraram há 358 dias ou mais, e o membro mais antigo da amostra entrou há 254. A tela mostra:
  - a contagem e a pílula "exemplo";
  - a linha da amostra;
  - "e mais 6 membros", com "Ver todos" desativado;
  - a ação sugerida, desativada.
- PD-18 Primária e secundária são calculadas por uma função pura (`classifyOrders`), nunca guardadas no pedido.
- PD-19 Campos e chaves de catálogo que só o Financeiro antigo lia saem quando a tarefa que os substitui termina. São eles: `ordersByBand`, `ordersDelta`, `renewal`, `conversion` e o `expiringAccess7d` digitado (passa a ser calculado). Antes de apagar, faça grep da chave exata.

Não construído porque o CONTEXT prevalece sobre a proposta:
- os 6 números antigos da proposta (Compradores, valor médio por pedido, Cancelados e cortesias etc.), trocados pelos de D-07;
- conversão por produto e cortesias;
- a lista nominal por caminho da escada;
- o componente `ProductCover`;
- a faixa "do dia anterior à compra";
- exportação.

Ambiente (vale para todas as tarefas):
- Pasta no iCloud. Antes de mexer e antes de cada commit, `find apps/web/components/dashboard apps/web/lib apps/web/app/painel-preview apps/web/e2e-preview apps/web/messages packages/modules/dashboard \( -name '* 2*' -o -flags +dataless \) -print` não imprime nada. Arquivo sem dados local: `brctl download <caminho>` e confira de novo. Nunca coloque `screens/` nem cópias '* 2*' no commit.
- Servidor próprio, numa cópia separada ou não: nunca pare a 3000 nem o Chrome.
  - Na Tarefa 1, crie `apps/web/playwright.dwc.config.ts` (não versionado; apague na Tarefa 5). Ele importa a config padrão de `playwright.preview.config.ts`, troca `use.baseURL` para `http://localhost:3400` e troca o `webServer` para `pnpm --filter @rede-social/web exec next dev -p 3400`, com `url` `http://localhost:3400/painel-preview/dono-da-plataforma` e `reuseExistingServer: true`.
  - Para subir: em `apps/web`, com `API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder INSTALL_GATE=off`, rode `nohup pnpm exec next dev -p 3400 > "$TMPDIR/dwc-dev.log" 2>&1 &`.
  - A cada mudança no catálogo, pare só o processo da 3400 (`lsof -nP -iTCP:3400 -sTCP:LISTEN -t`) e suba de novo. Se aparecer erro 500 por cache, apague também `apps/web/.next/dev/cache/turbopack`.
  - Antes de cada rodada de e2e, `curl -s -m 30 -o /dev/null -w '%{http_code}'` na URL da tarefa responde 200.
- Regras: dados fictícios determinísticos (duas montagens iguais); textos só no catálogo pt-BR, com acentos corretos, em `dashboard.tenantOwner.finance.*`; só tokens; `@3xl`; rolagem só vertical; tudo dentro da maquete do iPhone; links `<a>` e `<details>` nativos, sem JS no cliente.
- Nunca edite `apps/web/proxy.ts`, `apps/web/app/painel-preview/layout.tsx` nem `apps/web/lib/dashboard-preview.ts` (trava de produção).
- Comentários e commits em inglês. O assunto é `type(quick-261014-dwc): …`; o corpo numera cada mudança em termos humanos e termina com as checagens rodadas.
- Na tela, nenhuma das quatro palavras em inglês proibidas pelo CONTEXT. Os equivalentes são "venda adicional", "valor médio", "cancelamentos" e "receita recorrente". Sem publicar, sem push.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Tarefa 1: lista única de pedidos, ofertas, três abas e a cascata produto → oferta → comprador → membro (D-01, D-02, D-03, D-05, D-08 em parte, D-11 em parte)</name>
  <files>packages/modules/dashboard/fixtures/owner-finance.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/fixtures/tenant-owner.ts, packages/modules/dashboard/fixtures/owner-member-insights.ts, packages/modules/dashboard/fixtures/owner-member-lists.ts, packages/modules/dashboard/fixtures/owner-content.ts, packages/modules/dashboard/tests/owner-finance.test.ts, packages/modules/dashboard/tests/tenant-owner.test.ts, packages/modules/dashboard/tests/fixtures.test.ts, packages/modules/dashboard/tests/owner-member-insights.test.ts, packages/modules/dashboard/tests/owner-member-lists.test.ts, packages/modules/dashboard/tests/owner-content.test.ts, apps/web/lib/owner-finance-view.ts, apps/web/lib/owner-finance-view.test.ts, apps/web/app/painel-preview/[nivel]/page.tsx, apps/web/components/dashboard/TenantOwnerPanel.tsx, apps/web/components/dashboard/OwnerFinance.tsx, apps/web/components/dashboard/OwnerFinanceOverview.tsx, apps/web/components/dashboard/OwnerFinanceBuyers.tsx, apps/web/components/dashboard/OwnerFinanceProducts.tsx, apps/web/components/dashboard/OwnerFinanceProductDetail.tsx, apps/web/components/dashboard/OwnerFinancePeople.tsx, apps/web/components/dashboard/OwnerContentPeople.tsx, apps/web/components/dashboard/OwnerMemberDetail.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <precondition>`git merge-base --is-ancestor 986a7de6 HEAD` passa e as checagens do iCloud não imprimem nada.</precondition>
  <read_first>
    - 261014-dwc-CONTEXT.md (D-01..D-11 na íntegra) e as PD-1..PD-19 acima
    - packages/modules/dashboard/fixtures/tenant-owner.ts:266-340, 360-370, 480-491, 543-634; owner-members.ts (inteiro); owner-member-insights.ts (inteiro); owner-member-lists.ts:330-470; owner-content.ts:700-780
    - packages/modules/dashboard/tests/tenant-owner.test.ts:330-390, owner-member-insights.test.ts:300-350, owner-member-lists.test.ts:195-245
    - apps/web/lib/owner-content-view.ts (inteiro: o modelo do leitor de URL) e apps/web/lib/owner-content-view.test.ts:1-80
    - apps/web/components/dashboard/OwnerContent.tsx, OwnerContentPeople.tsx:36-160, BandScopeCards.tsx:56-130, OwnerMemberDetail.tsx:315-349 e 370-433, TenantOwnerPanel.tsx, app/painel-preview/[nivel]/page.tsx
    - apps/web/e2e-preview/painel-preview.spec.ts:1-90, 420-470, 715-740, 1605-1700, 2779-2810
  </read_first>
  <behavior>
    - owner-finance.test (novo) — a base: 1.240 membros com ids únicos. As faixas somam `engagement.counts`. Os 72 do roster estão na base com a mesma faixa e o mesmo `memberSince`. Os 1.168 restantes não têm nome. Duas montagens são iguais (`toEqual`).
    - Primária e secundária: cada membro tem exatamente uma primária, que é o 1º pedido pago e cai no dia da entrada. `classifyOrders` marca como secundária uma renovação sintética (mesmo membro, mesmo produto, 365 dias depois). Um revogado nunca é primário e nunca entra em receita nem contagem.
    - Entradas: as primárias de cada uma das 12 semanas = `growth.weeklyJoined`. As primárias de 30 dias = 96 = `engagement.counts.new` = `kpis.members.newMembers` = `growth.joined`.
    - Últimos 30 dias = a tabela da PD-3 exata: por oferta, por produto, pela faixa de hoje, primária 96/416.200 + secundária 30/477.800 = 126/894.000, e 2 cancelados.
    - Coerência com o painel: `kpis.orderValue.cents` = 894.000. `store.products` = os totais de 30 dias por produto. O canal `orders` = 126.
    - Restrições:
      - Donos da VIP (pedido VIP pago e não revogado nos últimos 365 dias) por faixa = c-vip (186). No roster, acesso VIP ⇔ exatamente um pedido VIP pago.
      - No máximo um pedido pago por produto e membro.
      - Nenhum pedido antes da entrada.
      - Pedidos de 30 dias só de Novos, Superfãs, Engajados e Ocasionais. Em risco: pedidos a 31 dias ou mais. Inativos: a 61 ou mais.
      - Workshop gravado: pelo menos 1 pedido na vida, e o mais recente com mais de 60 dias.
    - Vencimento: exatamente 6 acessos vencem nos próximos 7 dias (entrada + 365 em 1..7 dias), todos `vip-entrada`, e ninguém mais entrou de 358 a 364 dias atrás.
    - Roster (PD-6): roster ≤ base em cada oferta e faixa nos 30 dias. Cada oferta com pedidos em 30 dias tem pelo menos 1 comprador do roster. No máximo 1 pedido de 30 dias por membro do roster, no `lastActive` (ou na entrada, para os novos). As secundárias mais antigas que 30 dias ficam a 90 dias ou mais.
    - `ownerFinancePeople({ kind: 'offer', offerId: 'vip-entrada' })`: os 10 novos do roster com VIP, mais recentes primeiro, total 11. `ownerFinanceIncludes` concorda com a lista inteira. Um id desconhecido lança erro.
    - owner-member-insights.test (ajustado):
      - `purchases` = os pedidos pagos do membro na lista única (produto, oferta, entrada/adicional, data, valor). A entrada tem data = `memberSince`.
      - `expiresAt` = exemplo com data + 365 nas ofertas de entrada e nas da VIP, e null nas outras.
      - `last30.orders` = os pedidos de 30 dias (0 ou 1). `strongActions` os inclui.
      - As faixas de hoje e o histórico continuam passando pelas checagens que já lançam erro.
    - owner-member-lists.test: a linha de pedido de "Ações fortes" é o pedido de 30 dias, com o valor da oferta.
    - owner-content.test: os centavos das vendas por publicação vêm do preço da oferta adicional do produto. Os pins não mudam (op-11 6/50.200, op-15 6/118.200, a mais interagida 9/121.600). Vitrine ≤ pedidos VIP de 30 dias (18).
    - tenant-owner.test / fixtures.test: no lugar de "96 pedidos" e `ordersByBand`, as igualdades acima. O c-igor do nível 1 continua 894.000.
    - owner-finance-view.test (novo):
      - `{}` → Visão geral, com o resto null. `vista` aceita `produtos` e `quem-compra` (valor exato e único); qualquer outra coisa → Visão geral.
      - Em Produtos, `produto` ∈ ids dos produtos (s1..s4, como `evento=u1`). `oferta` só com produto, só uma oferta dele e só com pedidos em 30 dias (`produto=s4&oferta=workshop-adicional` cai no produto).
      - `membro` só com oferta e só se `ownerFinanceIncludes({ kind: 'offer', offerId }, id)`. `lista` ∈ `OWNER_MEMBER_LISTS`, só com membro. Valor repetido ou lista de valores → null.
      - Links na ordem vista, numero, atencao, produto, oferta, faixa, nunca, membro, lista; por exemplo `/painel-preview/dono-do-cliente?area=financeiro&vista=produtos&produto=s2&oferta=vip-entrada&membro=<id>&lista=curtidas`.
      - `financeBackHref`: lista → `…&membro=<id>#insight-<slug>`; membro → `…&oferta=<id>#membro-<id>`; oferta → `…&produto=<id>#oferta-<id>`; produto → `…&vista=produtos#produto-<id>`; tela de aba → null.
      - Ida e volta: parse(link(view)) é igual a view em toda combinação válida de Produtos.
  </behavior>
  <action>
VERMELHO primeiro: escreva o `<behavior>` nos testes. Rode e confirme que falham por módulo ou exportação ausente, ou por asserção. Commit `test(quick-261014-dwc): pin the single order ledger, its offers and the products cascade`.

VERDE:

1. `packages/modules/dashboard/fixtures/owner-finance.ts`. É um arquivo novo de DADOS BRUTOS (MOD-02). O cabeçalho explica D-02, D-03, D-05 e PD-1..PD-6.
   - Tipos: `FinanceOfferKind` ('entry' | 'addon'), `FinanceOffer` (id, productId, kind, composition, priceCents) e `FinanceOrder` (id, memberId, offerId, productId, cents, daysAgo, status 'paid' | 'revoked').
   - Dados: `FINANCE_OFFERS` da PD-2.
   - A base: os 72 do roster e mais 1.168 anônimos (ids `ob-0001`…), cada um só com faixa e dias desde a entrada. As faixas batem com `engagement.counts`.
   - Dias de entrada:
     - novos de 0 a 29 (os do roster no `memberSince`);
     - por semana = `growth.weeklyJoined`, em blocos de 7 dias contados de hoje para trás, como `weeklyActiveDays` (owner-member-insights.ts:402-405); as semanas dão 93 entradas nos dias 0–27, e os dias 28 e 29 levam mais 3, fechando 96 nos 30 dias;
     - de 84 a 167 dias, entre 12 e 18 por semana;
     - os 6 fundadores de 358 a 364 (PD-5);
     - o resto de 168 a 357;
     - Em risco com 31 dias ou mais; Inativos com 61 ou mais.
   - Pedidos:
     - a entrada no dia de entrada;
     - as secundárias pelas metas da PD-3 (30 dias), pelas regras da PD-6 (roster) e pelas restrições do `<behavior>`;
     - os 2 revogados da PD-3 (o membro do VIP revogado não é dono da VIP);
     - o resto do estoque é livre, com estes alvos: quem comprou de novo entre 15% e 25% da base; tempo médio até a 2ª compra entre 20 e 60 dias; pelo menos 3 caminhos de escada com 5 ou mais pessoas e pelo menos 1 com menos de 5; algumas compras de Workshop, todas com mais de 60 dias.
   - Exportações:
     - `ownerFinanceMembers` e `ownerFinanceOrders`, montados uma vez e memoizados;
     - `classifyOrders` (pura, PD-18);
     - `financeOffer(id)` e `financeProductOffers(productId)`, que lançam erro com id desconhecido;
     - `ownerFinanceWindow(fromDaysAgo, toDaysAgo)`, com pedidos, centavos e compradores por oferta, produto e faixa de hoje, mais os revogados;
     - `ownerFinancePeople(list)` e `ownerFinanceIncludes(list, memberId)`, por enquanto só com `{ kind: 'offer', offerId }`: os compradores do roster nos 30 dias, mais recentes primeiro, cada um como `OwnerBandMember` + `band` + `when` + `cents` + `offerId`, com total = os pedidos da oferta.
   - Imports: `owner-finance.ts` lê `owner-members.ts` e `tenant-owner.ts`, e nunca `owner-member-insights.ts` (evita ciclo). Exporte tudo por `index.ts`.

2. Coerência (D-02):
   - `tenant-owner.ts`:
     - `store.products` passa a ter os números de 30 dias da PD-3. São literais, provados iguais à lista única pelo teste, porque `tenant-owner.ts` não pode importar `owner-finance.ts`.
     - `channels` orders 126.
     - Apague `ordersByBand` depois do grep; o bloco "Quem compra" passa a ler a lista única pela faixa de hoje (PD-4).
     - `kpis.orderValue.cents` fica 894.000 (PD-1).
   - `owner-member-insights.ts`:
     - `purchases` = os pedidos pagos do membro na lista única, do mais antigo para o mais recente, com `offerId`, `kind` (de `classifyOrders`), `date`, `cents` e `expiresAt` (exemplo `needs_access_expiry`, data + 365, só nas entradas e nas ofertas da VIP; null nas outras).
     - Os dias dos pedidos entram no conjunto de dias como a compra entrava hoje.
     - O `order` passado a `buildOwnerMemberLists` é o único pedido de 30 dias ou null.
     - Apague `vipUnitCents`. As checagens que já lançam erro ficam. Atualize o comentário do topo.
   - `owner-content.ts`: `unitCents(productId)` passa a ser o preço da oferta adicional do produto, porque o comprador associado a uma publicação já era membro, então a compra é secundária. Os centavos não mudam.
   - `owner-member-lists.ts`: só o comentário ("the VIP order" → "the 30-day order").

3. `apps/web/lib/owner-finance-view.ts`: arquivo novo, no molde de `owner-content-view.ts` (nunca edite `dashboard-preview.ts`).
   - Tipos: `FinanceTab` ('overview' | 'products' | 'buyers') e `OwnerFinanceView` com `tab`, `productId`, `offerId`, `memberId` e `list`. As Tarefas 2 e 4 acrescentam os seus campos.
   - `TAB_SLUGS`: produtos e quem-compra.
   - `parseOwnerFinanceView`: lê nível a nível, com `pick`/`bySlug`, como o `<behavior>`.
   - Links e Voltar: `ownerFinanceHref`, `financeBackHref` e `financeTabView`.
   - Âncoras: `financeProductAnchor` (`produto-<id>`), `financeOfferAnchor` (`oferta-<id>`) e `financeMemberAnchor` (`membro-<id>`). A âncora da lista é `ownerInsightAnchor`.
   - O comentário de documentação diz os níveis e a regra de cair um nível (D-01).

4. Ligação:
   - `page.tsx` passa `finance={parseOwnerFinanceView(query)}`.
   - `TenantOwnerPanel.tsx`: as props de `AreaComponent` passam a ser { members, content, finance }, e ele repassa as três.

5. Telas:
   - `OwnerFinance.tsx` vira o roteador `{ finance: view }`, no molde de `OwnerContent.tsx`.
     - Nas telas de aba: o `nav` com o rótulo do catálogo "Vistas do financeiro" e três `Chip` em `grid grid-cols-3 gap-2` (a mesma marcação de `ContentTabs`), e então o corpo da aba.
     - Um passo mais fundo aparece sozinho, com seu `BackLink`: lista do membro → `OwnerMemberList`; membro → `OwnerMemberDetail` (faixa do roster, escopo base toda, backHref/listHref da cascata); oferta → `OwnerFinancePeople`; produto → `OwnerFinanceProductDetail`.
   - `OwnerFinanceOverview.tsx`: o corpo atual do `OwnerFinance`, movido sem mudar, menos "Quem compra". Lê os mesmos campos, agora com os números da lista única. A Tarefa 2 substitui.
   - `OwnerFinanceBuyers.tsx`: o bloco atual "Quem compra", lendo os pedidos de 30 dias da lista única pela faixa de hoje, com a nota nova da PD-4. A Tarefa 4 substitui.
   - `OwnerFinanceProducts.tsx` (D-08, PD-8, PD-9):
     - os produtos pela receita de 30 dias;
     - cada `li` com `id="produto-<id>"` e `scroll-mt-20`;
     - o cartão inteiro é `Linked` para o detalhe, com `Card flex flex-col` e hover;
     - capa `CommunityCover` com `geometry="card"`, `coverAssetId={null}`, `coverVariantWidths={[]}` e `coverAlt` = nome;
     - o nome em `text-xl font-bold`, com `StatusPill tone="warning"` "Parado" quando for o caso;
     - `dl` de quatro `Cell` (Preço, Entrada, Adicional, Receita), separadas por linha como no `EventCard`;
     - a linha da variação.
   - `OwnerFinanceProductDetail.tsx`, nesta tarefa só o cabeçalho e as Ofertas:
     - cabeçalho com capa, nome, preço e "Parado";
     - seção "Ofertas": um `Card` por oferta (a entrada primeiro), com `id="oferta-<id>"`, a composição em negrito, a pílula "Entrada" (brand) ou "Adicional" (neutral), o preço e "N pedidos · R$ X" dos 30 dias;
     - com pedidos, o cartão é link para a oferta; sem pedidos, fica sem link e diz que não houve pedido em 30 dias.
   - `OwnerFinancePeople.tsx` é o único arquivo web que lê `ownerFinancePeople`, com um comentário no topo como o de `OwnerContentPeople.tsx`.
     - A lista de compradores da oferta: `BackLink`; `PanelSection prominent` com a composição como título e o produto como período; a linha "N compras nos últimos 30 dias · mais recentes primeiro".
     - Os cartões usam `PeopleCards`. Exporte-o de `OwnerContentPeople.tsx` sem mudar o comportamento. Cada cartão leva a faixa, a linha `lead` "Comprou {quando} · {valor}" (`momentText` + `formatBrl`) e `moreText` "e mais N compras".
   - `OwnerMemberDetail.tsx`, seção Compras (D-02, D-03): cada compra mostra o produto, a composição da oferta com a pílula Entrada/Adicional, "Comprado em {data} · {valor}" e, só quando `expiresAt` existe, "Vence em {data}" com a pílula "exemplo".

6. Catálogo `tenantOwner.finance.*`: abas (rótulo e três nomes), cartão de produto (Preço, Entrada, Adicional, Receita, Parado, variação sem venda), Ofertas (Entrada, Adicional, pedidos, sem pedido), compradores (contagem, compra, "e mais"). Em `memberDetail.purchases`, acrescente o tipo da oferta. Todo texto em pt-BR com acento, sem as palavras proibidas do CONTEXT.

7. e2e, num describe novo "dono-do-cliente financeiro". Apague o teste antigo `dono-do-cliente ?area=financeiro` e ajuste `OWNER_AREA_CASES` financeiro (título e pílulas como aparecerem).
   - Crie o auxiliar `expectNoEnglish(area)`: falha se o texto da área tiver uma das quatro palavras proibidas do CONTEXT (sem diferenciar maiúsculas). Use-o em toda tela do Financeiro.
   - (a) Abas: um `nav` "Vistas do financeiro" com três abas de largura igual (±1 px), links e `aria-current` certos, presente nas três telas de aba e ausente nos passos fundos. Nenhum outro `nav` de escolha na área e nenhum "7 dias"/"90 dias".
   - (b) Produtos:
     - 4 cartões nesta ordem: Comunidade VIP, Mentoria em grupo, E-book, Workshop gravado;
     - capa `community-cover-fallback` em 16/7 (±0,02);
     - VIP com Entrada 11, Adicional 7 e Receita "R$ 4,1 mil";
     - "Parado" só no Workshop.
   - (c) Caminho do traçador:
     - cartão VIP → detalhe com duas ofertas: a de entrada ("Comunidade VIP + 1 ano de acesso ao app", R$ 247,00, 11 pedidos · R$ 2.717,00) e a adicional ("Comunidade VIP por 1 ano", R$ 197,00, 7 pedidos · R$ 1.379,00);
     - → "Comunidade VIP + 1 ano de acesso ao app" → a contagem começa por 11, com 10 cartões e "e mais 1 compra";
     - → primeiro cartão → insights do membro, com a compra "Comunidade VIP + 1 ano de acesso ao app", "Entrada" e R$ 247,00;
     - → "Últimos 30 dias" → número Curtidas → lista;
     - cada Voltar volta exatamente um passo, até `&vista=produtos#produto-s2`.
   - (d) URLs forjadas caem um nível: `produto=xyz`, `produto=s2&oferta=ebook-entrada`, `produto=s4&oferta=workshop-adicional`, `oferta=vip-entrada&membro=<id fora da lista>`, `lista=xyz`.
   - (e) Sem rolagem lateral a 360/390/430 em Produtos, no detalhe da VIP e na lista da oferta; as mesmas telas dentro do iPhone a 1440×900, sem `table` visível.
   - (f) Sem JS: as abas e um cartão de produto são links que funcionam.
   - (g) Os testes de Membros e Conteúdo continuam verdes. Fixe de novo só o que a entrada no `memberSince` mudou (dias ativos dos novos, pessoas de uma publicação) e liste cada mudança no SUMMARY.

Rode o verify. Commit `feat(quick-261014-dwc): finance products down to each offer's buyers and their insights`, com corpo citando D-01, D-02, D-03, D-05, D-08, PD-1..PD-9, PD-18 e as checagens rodadas.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/module-dashboard exec vitest run && pnpm --filter @rede-social/web exec vitest run lib/owner-finance-view.test.ts lib/owner-content-view.test.ts lib/owner-band-scope.test.ts components/dashboard/BandMembers.test.tsx components/dashboard/OwnerMemberList.test.tsx && pnpm typecheck && test "$(curl -s -m 30 -o /dev/null -w '%{http_code}' 'http://localhost:3400/painel-preview/dono-do-cliente?area=financeiro&vista=produtos&produto=s2')" = 200 && cd apps/web && pnpm exec playwright test --config playwright.dwc.config.ts -g "dono-do-cliente"</automated>
  </verify>
  <done>
    - O vermelho falhou antes do verde; testes do módulo, testes web, typecheck e todo e2e "dono-do-cliente" verdes.
    - A lista única fecha a PD-3 (126 pedidos, R$ 8.940,00 = R$ 4.162,00 + R$ 4.778,00), os insights mostram as compras com oferta, e o Conteúdo segue com os mesmos valores.
    - Produtos → VIP → oferta → membro → lista, e volta um passo exato por vez; URLs forjadas caem um nível.
    - `grep -rl ownerFinancePeople apps/web/app apps/web/components apps/web/lib` lista só OwnerFinancePeople.tsx; `grep -rl ownerMemberInsights` nos mesmos lugares continua só OwnerMemberDetail.tsx e OwnerMemberList.tsx.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Tarefa 2: Visão geral do Financeiro — seis números com listas, atenção, receita por semana, origem, o que só o app sabe, próximos passos; base de 30 dias; Conteúdo e níveis 5/6 coerentes (D-06, D-07, D-10 base, D-02 coerência)</name>
  <files>packages/modules/dashboard/fixtures/owner-finance.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/fixtures/tenant-owner.ts, packages/modules/dashboard/fixtures/tenant-panels.ts, packages/modules/dashboard/fixtures/owner-content.ts, packages/modules/dashboard/tests/owner-finance.test.ts, packages/modules/dashboard/tests/tenant-owner.test.ts, packages/modules/dashboard/tests/owner-content.test.ts, apps/web/lib/owner-finance-view.ts, apps/web/lib/owner-finance-view.test.ts, apps/web/components/dashboard/OwnerFinance.tsx, apps/web/components/dashboard/OwnerFinanceOverview.tsx, apps/web/components/dashboard/OwnerFinancePeople.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - CONTEXT D-06, D-07, D-10; PD-3, PD-5, PD-7, PD-10, PD-11, PD-13, PD-17
    - apps/web/components/dashboard/OwnerContentOverview.tsx:60-310 e 400-600 (números como link, atenção, tendência, faixas, próximos passos, listas dos números)
    - apps/web/components/dashboard/OwnerContentPostDetail.tsx:255-316 (AppLine e piso)
    - packages/modules/dashboard/fixtures/owner-finance.ts e apps/web/lib/owner-finance-view.ts como a Tarefa 1 deixou
    - packages/modules/dashboard/fixtures/tenant-panels.ts:155-170 e 310-331
  </read_first>
  <behavior>
    - owner-finance.test — `ownerFinanceSummary(asOfDaysAgo)`:
      - Com 0: os seis números (primária 416.200 em 96 entradas, valor médio 4.335; secundária 477.800 em 30 compras adicionais; parte 53%; quem já comprou de novo e % da base; tempo médio até a 2ª compra; receita da vida toda ÷ 1.240).
      - Com 30: os mesmos números calculados como se hoje fosse 30 dias atrás (a base de então, os pedidos até então).
      - Primária + secundária = total nas duas datas. A variação do total é +12%, igual a `kpis.orderValue.delta` (amount 12, `previous_30_days`).
    - Por semana: `ownerFinanceWeekly()` dá primária e secundária em 12 semanas e nas 12 anteriores (centavos). A soma das primárias de cada semana = entradas da semana × preço da oferta.
    - Atenção:
      - pagantes da VIP sumindo = 40 (22 em risco + 18 inativos), com push 11;
      - acessos que vencem em 7 dias = exemplo `needs_access_expiry` com 6 e o produto Comunidade VIP;
      - produtos sem venda há 60 dias = [s4], com os dias desde o último pedido;
      - eventos lotados com espera = u3, com 17, vindo de `events.waitlist` (exemplo).
    - Associações:
      - `ownerFinanceContentSales()` e `ownerContentDetail(id).orders` são o mesmo fato. Cada pedido associado é um pedido secundário pago de 30 dias na lista única, do produto dito. As contagens por publicação são as de hoje (op-11, op-15, op-19, op-41, op-55). O total distinto é 12 pedidos / 180.700.
      - `ownerFinanceEventSales()`: por evento passado, pedidos secundários até 7 dias depois do check-in, cada um ≤ check-ins do evento; total distinto fixado.
      - VIP: receita 409.600, 104 ativos na semana e 186 com acesso.
    - Pessoas (roster, + "e mais N"): `ownerFinancePeople` e `ownerFinanceIncludes` aceitam `primary`, `secondary`, `rebought`, `timeToSecond`, `lifetime`, `vipFading` e `expiring`. O total de cada uma repete o número de onde ela abre. `expiring` tem 0 pessoas do roster e total 6 (PD-17).
    - Níveis 5 e 6 (PD-7): `tenantAdminPanel.store` por produto = pedidos pagos dos últimos 7 dias na lista única; `tenantStaffPanel.store.orders7d.count` = a soma; o teste antigo "≥" vira igualdade.
    - owner-finance-view.test:
      - `numero` ∈ primaria, secundaria, parte-secundaria, recompra, tempo-recompra, por-membro (só na Visão geral). Sem `numero`, `atencao` ∈ pagantes-sumindo, vencendo. Na Visão geral sem número nem atenção, `produto` ∈ ids (PD-10), com `oferta`, `membro` e `lista` abaixo, como em Produtos.
      - `membro` sob um número de pessoas ou uma atenção só se `ownerFinanceIncludes` daquela lista. `parte-secundaria` não aceita membro.
      - Âncoras: `numero-<slug>`, `atencao-<slug>` e `produto-<id>` (Voltar do produto aberto da Visão geral → `?area=financeiro#produto-<id>`).
      - Ida e volta estendida. Forjadas: `numero=xyz`, `atencao=xyz`, `numero=parte-secundaria&membro=…`, `numero=recompra&membro=<fora>`, `produto=xyz` caem um nível.
  </behavior>
  <action>
VERMELHO primeiro: rode os testes do `<behavior>` e confirme as falhas. Commit `test(quick-261014-dwc): pin the finance overview numbers, attention and associations`.

VERDE:

1. Dados.
   - Em `owner-finance.ts`: `ownerFinanceSummary`, `ownerFinanceWeekly`, `ownerFinanceAttention`, `ownerFinanceContentSales`, `ownerFinanceEventSales` e `ownerFinanceVipUsage`.
   - Nos pedidos secundários de 30 dias, as associações: publicações e eventos dos 7 dias antes. Monte-as para que as contagens por publicação de hoje fiquem exatas e o total distinto dê 12 / 180.700.
   - As listas novas de `ownerFinancePeople`.
   - Exporte tudo por `index.ts`.
2. Conteúdo coerente: `owner-content.ts` troca a tabela de pedidos do `BUSINESS` pelas associações da lista única. `reactivated`, `rsvps` e `vitrine` continuam no `BUSINESS`. Os números da tela não mudam.
3. D-10, base:
   - Em `tenant-owner.ts`, `kpis.orderValue.delta` passa a ser `{ amount: 12, kind: 'percent', direction: 'up', good: true, basis: 'previous_30_days' }`, provado pela lista única.
   - Apague `store.ordersDelta`, `store.renewal`, `store.conversion` e `store.expiringAccess7d` (PD-19), depois do grep de cada um.
   - Atualize os testes de exemplos que os citavam.
4. PD-7: em `tenant-panels.ts`, os pedidos de 7 dias por produto do nível 5 e `orders7d.count` do nível 6 recebem os números da lista única. É literal provado por teste. O delta do nível 6 fica como está.
5. Leitor de URL: acrescente `number` e `attention` a `OwnerFinanceView`, o `produto` na Visão geral (PD-10), os links e as âncoras do `<behavior>`.
6. `OwnerFinanceOverview.tsx` é reescrito (D-07), nesta ordem:
   - (1) "Números do mês":
     - `KpiGrid` com seis links no molde de `NumberLink` (`id="numero-<slug>"`, rodapé "Ver lista");
     - `kpiDelta` contra o resumo de 30 dias atrás;
     - as notas "96 entradas · valor médio R$ 43,35", "30 compras adicionais", "da receita", "% da base", "dias" e "na vida toda";
     - abaixo do grid, a linha "Receita total registrada: R$ 8.940,00 em 126 pedidos", o aviso "valor registrado, não dinheiro recebido" e a linha dos cancelados com o piso (D-05, D-06: "menos de 5 pedidos").
   - (2) "Precisa de atenção": quatro linhas com o ícone de alerta (`text-warning`), cada uma um link:
     - pagantes da VIP → `atencao=pagantes-sumindo`, com a nota "22 em risco · 18 inativos · 11 com push";
     - acessos → `atencao=vencendo`, com a pílula "exemplo";
     - produto parado → `produto=s4` na Visão geral, com o `id="produto-s4"` na linha;
     - Imersão lotada → `?area=financeiro&vista=produtos#evento-u3`, com a pílula "exemplo" (a âncora passa a existir com a seção de eventos pagos da Tarefa 4; até lá o link abre a aba Produtos).
     - Ordem fixa.
   - (3) "Receita por semana": os dois `LineChart` da PD-13 (primária e secundária, eixo com `formatBrlCompact`, rótulos S4, S8, S12), cada um com a legenda `LegendStroke`.
   - (4) "De onde vem a receita":
     - `BarList` por produto (receita; na taxa, "N pedidos · X%"; destaque no líder; o Workshop diz que não houve pedido);
     - `BarList` pela faixa de hoje (piso pelo `isBelowPrivacyFloor`), com Em risco e Inativos na frase da PD-4;
     - links "Ver produtos" e "Ver quem compra", que trocam de aba.
   - (5) "O que só o app sabe", em linhas no molde de `AppLine`:
     - vendas depois de publicação: total distinto e valor (piso), e as publicações uma por linha (legenda curta, "N pedidos · R$ X" ou "menos de 5 pedidos"), cada uma link para `?area=conteudo&vista=publicacoes&post=<id>` (sai da área, como a proposta aceitou; o Voltar dali é o do Conteúdo);
     - vendas depois de evento: total e uma linha por evento, com piso;
     - VIP: "R$ 4.096,00 em 30 dias · 104 ativos na semana de 186 com acesso", link para `produto=s2` na Visão geral (`id="produto-s2"`);
     - a nota "Associação, não causa".
   - (6) "Próximos passos": três `ActionCard` com `PreviewAction` desativado:
     - oferecer a VIP a quem entrou pelo E-book e participa (a contagem vem da lista única);
     - recuperar os 40 pagantes que sumiram (11 com push);
     - lembrar os 6 acessos que vencem (pílula "exemplo").
7. Listas dos números e da atenção (passo fundo, `BackLink` para `#numero-<slug>` ou `#atencao-<slug>`, e a linha de contagem repete o valor do número):
   - `primaria`: "R$ 4.162,00 em 96 entradas", cartões de membro com `lead` "Entrou por {oferta} · {valor} · {quando}";
   - `secundaria`: "R$ 4.778,00 em 30 compras adicionais";
   - `parte-secundaria` (PD-11): a frase com 53% e um `BarList` por produto, entrada × adicional, sem link;
   - `recompra`: "N membros · X% da base";
   - `tempo-recompra`: "média de N dias até a 2ª compra, em M membros", e cada cartão diz os dias dele;
   - `por-membro`: "R$ X por membro na vida toda", e cada cartão diz o gasto dele;
   - `pagantes-sumindo`: "40 pagantes da Comunidade VIP sem ação há mais de 30 dias";
   - `vencendo` (PD-17).
   - Tudo isso em `OwnerFinancePeople.tsx`, com `PeopleCards`.
   - O roteador abre o membro dessas listas como na Tarefa 1.
8. Catálogo: os textos novos. Apague as chaves que só os blocos antigos liam: `tenantOwner.sales.*` (exceto o que for reusado), `revenue`, `access` e `conversion`, sempre depois do grep da chave exata; mantenha toda chave que outro arquivo lê.
9. e2e:
   - (a) Ordem dos títulos da Visão geral.
   - (b) Os seis números com valor e variação.
   - (c) R$ 4.162,00 + R$ 4.778,00 = R$ 8.940,00: some os três valores lidos da tela e compare.
   - (d) Cada número abre a sua lista, cuja linha de contagem contém o valor do número, e o Voltar leva a `#numero-<slug>`.
   - (e) Atenção:
     - pagantes → 10 cartões e "e mais 30 membros" → membro → Voltar a `atencao=pagantes-sumindo#membro-<id>`;
     - vencendo → "e mais 6 membros", sem cartão;
     - Workshop → detalhe → Voltar `?area=financeiro#produto-s4`;
     - Imersão → aba Produtos.
   - (f) Piso: as linhas de op-19 e op-55 dizem "menos de 5 pedidos" e não têm "R$"; a linha dos cancelados, idem.
   - (g) A Visão geral do painel continua com R$ 8.940,00 e agora "12% vs. 30 dias antes"; o nível 1 continua com "R$ 14,4 mil"; o Conteúdo continua com R$ 502,00 em op-11, "menos de 5 pedidos" em op-19 e a vitrine em op-15.
   - (h) Forjadas do `<behavior>`.
   - (i) Sem rolagem lateral a 360/390/430 na Visão geral e nas 8 listas; as mesmas dentro do iPhone.
   - (j) `expectNoEnglish` em todas.

Rode o verify. Commit `feat(quick-261014-dwc): finance overview with primary and secondary revenue and numbers that open their lists`, com corpo citando D-02, D-05, D-06, D-07, D-10, PD-7, PD-10, PD-11, PD-13, PD-17, PD-19 e as checagens rodadas.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/module-dashboard exec vitest run && pnpm --filter @rede-social/web exec vitest run lib/owner-finance-view.test.ts && pnpm typecheck && test "$(curl -s -m 30 -o /dev/null -w '%{http_code}' 'http://localhost:3400/painel-preview/dono-do-cliente?area=financeiro')" = 200 && cd apps/web && pnpm exec playwright test --config playwright.dwc.config.ts -g "dono-do-cliente|dono-da-plataforma|admin-do-cliente|equipe-do-cliente"</automated>
  </verify>
  <done>
    - O vermelho falhou antes do verde; testes do módulo, leitor de URL, typecheck e e2e dos níveis 1, 4, 5 e 6 verdes.
    - A Visão geral tem os seis blocos de D-07 na ordem; cada número abre uma lista com a mesma contagem; primária + secundária = total na tela.
    - Vendas por publicação e o total do mês são o mesmo fato da lista única; o piso aparece onde há menos de 5 pedidos.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Tarefa 3: Encontro mensal no futuro e sino coerente (D-10)</name>
  <files>packages/modules/dashboard/fixtures/tenant-owner.ts, packages/modules/dashboard/fixtures/tenant-panels.ts, packages/modules/dashboard/fixtures/owner-members.ts, packages/modules/dashboard/fixtures/owner-posts.ts, packages/modules/dashboard/tests/tenant-owner.test.ts, packages/modules/dashboard/tests/owner-members.test.ts, apps/web/lib/owner-band-scope.test.ts, apps/web/components/dashboard/TenantOwnerPanel.tsx, apps/web/components/dashboard/TenantAdminPanel.tsx, apps/web/components/dashboard/OwnerEvents.test.tsx, apps/web/components/dashboard/BandMembers.test.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - CONTEXT D-10; PD-16
    - packages/modules/dashboard/fixtures/tenant-owner.ts:12-35, 266-285, 543-577; tenant-panels.ts:20-40 e 80-100; owner-members.ts:16-30; owner-posts.ts:240-262
    - apps/web/components/dashboard/TenantOwnerPanel.tsx:23-55 e TenantAdminPanel.tsx:30-60
    - apps/web/e2e-preview/painel-preview.spec.ts:310-410, 903-980, 2689-2720
  </read_first>
  <behavior>
    - tenant-owner.test: u1 tem data 2026-10-17 e `startsAtHour` 19, e os números são os de hoje (92 de 100, as faixas do evento iguais). `events.upcoming` está em ordem de data (u2, u1, u3), todas depois de `PREVIEW_TODAY`. Os dois níveis têm um alerta `event_soon` com o evento, `date` = data do u1, hora, confirmados e capacidade iguais ao u1.
    - owner-members.test: `PREVIEW_TODAY` continua '2026-10-12' e toda data de próximo evento é posterior a ela (no lugar de "igual à do 1º próximo").
    - owner-band-scope.test: `OWNER_EVENTS` é ['u2', 'u1', 'u3', 'e4', 'e3', 'e2', 'e1'], e u1 tem date '2026-10-17'.
    - OwnerEvents.test: os horários dos próximos são '15/10, 20h', '17/10, 19h' e '24/10, 9h', nessa ordem. BandMembers.test: a Data do cartão do Encontro mensal é '17/10'.
  </behavior>
  <action>
VERMELHO primeiro, depois VERDE (PD-16):
1. Dados:
   - Em `tenant-owner.ts`, u1 vai para `date: '2026-10-17'` (19h, 180 min, 92/100, ingresso de exemplo igual) e `events.upcoming` fica em ordem de data.
   - O tipo e o alerta `event_today` viram `event_soon` com `date: string`, aqui e no nível 5 (`tenant-panels.ts`).
   - Em `owner-members.ts`, o comentário de `PREVIEW_TODAY` diz que é o dia do preview, não mais o dia do Encontro.
   - Em `owner-posts.ts`, o texto do post de 11/10 passa a "Encontro mensal: o local já está reservado para sábado".
   - Os números de Eventos não mudam (D-10).
2. Telas:
   - `TenantOwnerPanel.tsx` e `TenantAdminPanel.tsx` tratam `event_soon` com a etiqueta `{date}, {hour}h` (`formatDayMonth`).
   - No catálogo, `tenantOwner.alerts.event_today` e `tenantAdmin.alerts.event_today` viram `event_soon`, com a etiqueta nova; título e detalhe iguais.
   - A frase do sino no README fica para a Tarefa 5 (um único commit de documentação).
3. e2e:
   - O sino do dono continua com "8 vagas restantes" uma vez e mostra "17/10, 19h".
   - Em Eventos, a ordem é Live de dúvidas, Encontro mensal, Imersão presencial, com "17/10, 19h".
   - No Por evento de Membros, a ordem e as contagens seguem a nova ordem dos eventos (Engajados: 23, 34, 16, 21, 18, 62, 45). O cartão do Encontro mensal é achado pelo nome (não por `first()`), tem Data 17/10 e abre "Engajados em Encontro mensal · 17/10".
   - Ajuste só o que mudou.

Rode o verify. Commit `fix(quick-261014-dwc): move the monthly meetup to a future Saturday and make the bell say when`, com corpo citando D-10, PD-16 e as checagens rodadas.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/module-dashboard exec vitest run && pnpm --filter @rede-social/web exec vitest run lib/owner-band-scope.test.ts components/dashboard/OwnerEvents.test.tsx components/dashboard/BandMembers.test.tsx && pnpm typecheck && test "$(curl -s -m 30 -o /dev/null -w '%{http_code}' 'http://localhost:3400/painel-preview/dono-do-cliente?area=eventos')" = 200 && cd apps/web && pnpm exec playwright test --config playwright.dwc.config.ts -g "dono-do-cliente|admin-do-cliente|alerts bell"</automated>
  </verify>
  <done>
    - O vermelho falhou antes do verde; testes e e2e dos níveis 4 e 5 e do sino verdes.
    - O Encontro mensal está em 17/10, 19h, sábado, com os mesmos números; nenhum sino diz "hoje" para um evento que não é hoje.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Tarefa 4: Quem compra (faixas, escada, nunca compraram de novo), detalhe completo do produto e eventos pagos (D-04, D-06, D-08, D-09)</name>
  <files>packages/modules/dashboard/fixtures/owner-finance.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/tests/owner-finance.test.ts, apps/web/lib/owner-finance-view.ts, apps/web/lib/owner-finance-view.test.ts, apps/web/components/dashboard/OwnerFinance.tsx, apps/web/components/dashboard/OwnerFinanceBuyers.tsx, apps/web/components/dashboard/OwnerFinanceProducts.tsx, apps/web/components/dashboard/OwnerFinanceProductDetail.tsx, apps/web/components/dashboard/OwnerFinancePeople.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - CONTEXT D-04, D-06, D-08, D-09; PD-4, PD-12, PD-14, PD-15
    - apps/web/components/dashboard/OwnerContentOverview.tsx:400-440 (Collapsible por faixa com `open`), BandScopeCards.tsx:136-247 (EventCard, eventRevenue, RevenueExampleNote), BandsBarList.tsx, packages/modules/dashboard/ui/metrics.ts:96-140 (mergeBandsBelowFloor)
    - owner-finance.ts, owner-finance-view.ts, OwnerFinanceProductDetail.tsx e OwnerFinanceBuyers.tsx como as tarefas anteriores deixaram
  </read_first>
  <behavior>
    - owner-finance.test — faixas: `ownerFinanceBands()` dá, pela faixa de hoje, pedidos, centavos e compradores de 30 dias, e o % da faixa (compradores ÷ membros da faixa). Novos 99 / 475.300 com 96 compradores; Superfãs 10 / 212.200; Engajados 11 / 173.300; Ocasionais 6 / 33.200; Em risco e Inativos 0. Toda faixa compradora tem 5 ou mais pedidos.
    - Escada: `ownerFinancePaths()` dá, na vida toda, (oferta de entrada, oferta do 2º pedido, pessoas, média de dias). A soma das pessoas = quem comprou de novo. Pelo menos 3 caminhos com 5 ou mais pessoas. "Outros caminhos" junta todos os caminhos com menos de 5 pessoas e vem por último; se o grupo somar menos de 5, a linha diz "menos de 5 pessoas", sem número.
    - Nunca compraram de novo: `ownerFinanceNeverAgain()` dá, pela faixa de hoje, os membros com exatamente um pedido pago. A soma + quem comprou de novo = 1.240.
    - Listas de pessoas novas: `{ kind: 'band', band }` (compradores de 30 dias da faixa) e `{ kind: 'never', band }`, com predicados.
    - Produto: `ownerFinanceProductDetail(id)` dá:
      - 30 dias e período anterior (pedidos, centavos, compradores) e cancelados;
      - receita por semana em 12 semanas e nas 12 anteriores;
      - pedidos e centavos pela faixa de hoje (soma = o produto);
      - publicações que o venderam (das associações), com contagem e centavos por publicação.
      - Para a VIP: 18 pedidos e 409.600; op-15 com 6 VIP; op-41 com 3; op-11 com 2.
    - owner-finance-view.test:
      - Em Quem compra, `faixa` só para faixas com compradores (em-risco e inativos caem para a aba). Sem `faixa`, `nunca` só para faixas com alguém.
      - `membro` sob `faixa` só se for comprador dessa faixa; sob `nunca`, só se estiver nela.
      - Voltar do membro de uma faixa → `?area=financeiro&vista=quem-compra&faixa=<slug>#membro-<id>` (reabre a faixa). Voltar de `nunca` → `…&vista=quem-compra#nunca-<slug>`.
      - Ida e volta estendida. Forjadas: `faixa=em-risco`, `faixa=xyz`, `nunca=xyz`, `faixa=superfas&membro=<id de outra faixa>`.
  </behavior>
  <action>
VERMELHO primeiro, depois VERDE:

1. Dados (`owner-finance.ts`): as funções do `<behavior>`, exportadas por `index.ts`.
2. Leitor de URL: acrescente `band` e `neverBand` a `OwnerFinanceView`, com slugs `OWNER_BAND_SLUGS`, âncoras `nunca-<slug>` e links. Uma faixa aberta é tela de aba (a fileira de abas aparece), como no Conteúdo.
3. `OwnerFinanceBuyers.tsx` é reescrito (D-09):
   - (1) "Receita por faixa":
     - uma frase-resumo calculada (quanto da receita vem de superfãs e engajados e qual a parte da base deles);
     - seis `Collapsible` em `ENGAGEMENT_BAND_ORDER`, com `open` quando a faixa é `view.band`;
     - resumo "R$ X · N pedidos · M compradores (Z% da faixa)" com piso: com menos de 5 pedidos, "menos de 5 pedidos" e sem valor;
     - corpo: os cartões de comprador (`OwnerFinancePeople` com `PeopleCards`, `lead` "Comprou {oferta} · {valor} · {quando}"), cada um levando ao membro;
     - Em risco e Inativos: a frase da PD-4 no lugar dos cartões.
   - (2) "Escada de compra": um `BarList` com uma linha por caminho ("E-book de entrada → Comunidade VIP"), valor "N pessoas", taxa "em média N dias", sem link, com "Outros caminhos" por último, mais a nota de que conta a vida toda (PD-15).
   - (3) "Entraram e nunca compraram de novo": uma linha por faixa com contagem, cada uma link para `nunca=<slug>` (com `id="nunca-<slug>"`). Faixa com 0 fica sem link. Depois vem um `ActionCard` com `PreviewAction` desativado (oferecer a próxima compra para quem só tem a entrada).
   - A lista `nunca` é passo fundo em `OwnerFinancePeople`, com o `BackLink`. O roteador abre o membro de `faixa` e de `nunca` como nas tarefas anteriores.
4. `OwnerFinanceProductDetail.tsx` (D-08), entre o cabeçalho e as Ofertas:
   - "Números": `KpiGrid` com Receita, Pedidos (entrada + adicional), Compradores e Cancelados (piso). Os três primeiros têm `kpiDelta` vs. 30 dias antes.
   - "Receita por semana": `LineChart` com as 12 anteriores tracejadas e `LegendStroke`.
   - "Compradores por faixa" (PD-14): `BarList` sobre os grupos de `mergeBandsBelowFloor` dos pedidos, com rótulo do grupo por `bandGroupLabel`, valor em R$ só para grupo com 5 ou mais pedidos e a nota da faixa de hoje.
   - Depois das Ofertas, "Publicações que venderam": uma linha por publicação (legenda curta, "N pedidos · R$ X" ou "menos de 5 pedidos"), link para o detalhe no Conteúdo, mais a nota "Associação, não causa"; ou uma frase quando não há nenhuma.
   - O Workshop gravado mostra os números zerados e a frase de que não houve venda há N dias.
5. `OwnerFinanceProducts.tsx`: abaixo dos cartões, a seção "Eventos pagos" (D-04, PD-12) com `RevenueExampleNote` (uma pílula), os `EventCard` e o rodapé dos gratuitos.
6. Catálogo: os textos novos.
7. e2e:
   - (a) Quem compra: as seis faixas com resumos (Novos "R$ 4.753,00 · 99 pedidos · 96 compradores", Superfãs R$ 2.122,00 · 10 pedidos, Engajados R$ 1.733,00 · 11 pedidos, Ocasionais R$ 332,00 · 6 pedidos, Em risco e Inativos com a frase). Abrir Engajados → cartões → membro → Voltar reabre Engajados em `#membro-<id>`.
   - (b) Escada: pelo menos 3 linhas e "Outros caminhos" por último; nenhum caminho aparece sozinho com menos de 5 pessoas.
   - (c) Nunca compraram de novo: uma faixa → lista → membro → Voltar `#membro-<id>` → Voltar `#nunca-<slug>`.
   - (d) Detalhe da VIP:
     - os quatro números;
     - o gráfico com a legenda;
     - compradores por faixa sem nenhum valor em R$ num grupo com menos de 5 pedidos;
     - Publicações que venderam: op-15 "6 pedidos · R$ 1.182,00"; op-41 e op-11 com "menos de 5 pedidos" e sem "R$".
   - (e) Eventos pagos:
     - 4 cartões, próximos primeiro e depois passados: Encontro mensal 17/10, Imersão presencial 24/10, Workshop 01/10, Encontro set. 19/09;
     - capa `event-cover-fallback` em 16/10 (±0,02);
     - uma só pílula "exemplo" na seção;
     - o rodapé com os 3 eventos gratuitos que ficaram de fora;
     - nenhum valor de evento entra nos R$ 8.940,00.
   - (f) Forjadas do `<behavior>`.
   - (g) Sem rolagem lateral a 360/390/430 e dentro do iPhone em Quem compra (com as faixas abertas), em uma lista de faixa, em uma lista `nunca`, no detalhe da VIP e no do Workshop, e em Produtos com os eventos.
   - (h) Sem JS: abrir uma faixa (`details`) e um link de `nunca` funcionam.
   - (i) `expectNoEnglish` em todas.

Rode o verify. Commit `feat(quick-261014-dwc): who buys, the purchase ladder and the full product detail`, com corpo citando D-04, D-06, D-08, D-09, PD-12, PD-14, PD-15 e as checagens rodadas.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/module-dashboard exec vitest run && pnpm --filter @rede-social/web exec vitest run lib/owner-finance-view.test.ts && pnpm typecheck && test "$(curl -s -m 30 -o /dev/null -w '%{http_code}' 'http://localhost:3400/painel-preview/dono-do-cliente?area=financeiro&vista=quem-compra&faixa=engajados')" = 200 && cd apps/web && pnpm exec playwright test --config playwright.dwc.config.ts -g "dono-do-cliente"</automated>
  </verify>
  <done>
    - O vermelho falhou antes do verde; testes do módulo, leitor de URL, typecheck e e2e do nível 4 verdes.
    - Quem compra tem as três partes de D-09 e leva ao membro; o detalhe do produto tem as cinco partes de D-08; os eventos pagos ficam fora do total, com uma pílula.
    - Nenhum total de grupo com menos de 5 pedidos mostra R$.
  </done>
</task>

<task type="auto">
  <name>Tarefa 5: README (D-11 e o que falta no esquema real), gates completos, capturas e limpeza do servidor próprio</name>
  <files>packages/modules/dashboard/README.md (capturas em .planning/quick/261014-dwc-financeiro-com-receita-primaria-e-secund/screens/, nunca no commit; apps/web/playwright.dwc.config.ts é apagado)</files>
  <read_first>
    - 261014-dwc-CONTEXT.md, seção "Verificação" (comandos na íntegra)
    - packages/modules/dashboard/README.md:69-121 (tabela de fontes do nível 4), 272-334 (Conteúdo) e 335-380 ("Para quando os dados reais forem ligados")
  </read_first>
  <action>
1. README do módulo:
   - Uma subseção "Financeiro (261014-dwc)" no nível 4: as três abas; os parâmetros (vista, numero, atencao, produto, oferta, faixa, nunca, membro, lista); a regra de cair um nível; primária = o 1º pedido pago de cada membro, a que dá acesso ao app, e secundária = qualquer pedido pago depois, renovação incluída, classificada por pedido, nunca por produto; as ofertas; acesso de 1 ano; ingressos fora do total; cancelado = revogado; piso de 5 em totais de grupo; e as PD-1..PD-19, uma linha cada.
   - Linhas novas na tabela de fontes: primária/secundária (o 1º `store_orders` pago por `user_id`; calculada); ofertas (nenhuma tabela hoje); faixa do comprador (a de hoje); escada (2º pedido pago); vendas depois de publicação e de evento (associação medida, não causa); acessos que vencem (compra + 365, exemplo `needs_access_expiry`). Troque a linha "Receita por produto, quem compra" pela nova.
   - Em "Para quando os dados reais forem ligados":
     - a privacidade do Financeiro (D-11): nomes e valores de compradores só no nível 4, para a equipe do cliente; os níveis 1 a 3 só veem agregados (receita por cliente); o aviso de privacidade precisa dizer isso; e o piso de 5 em totais de grupo (D-06);
     - o que falta no esquema real, achado neste trabalho: não existe tabela de ofertas nem `offer_id` no pedido; `store_orders_live_uq` (um pedido vivo por membro e produto) impede renovar o mesmo produto sem revogar o anterior; `expires_at` nunca é preenchido; `store_orders` só é lido por `admin_tenant` (decidir se o papel de dono lê); decidir se um acesso vencido sem renovação encerra a participação.
   - Remova as linhas de conversão por produto e de renovação que não existem mais. A frase do sino ("o evento de hoje") vira "o próximo evento com poucas vagas" (PD-16).
   - Commit `docs(quick-261014-dwc): finance tabs, sources, privacy and the store gaps for real data`.
2. Gates, com os comandos do CONTEXT na íntegra e o ambiente provisório exportado: `pnpm lint` (com a guarda de literais), `pnpm typecheck`, `pnpm test`, `pnpm boundaries` e `pnpm check:static-routes`; depois a suíte Playwright do preview inteira com `playwright.dwc.config.ts` no servidor da 3400. Corrija qualquer vermelho na origem, com um commit `fix(quick-261014-dwc): …` que diga a causa. Nunca declare pronto com algo vermelho.
3. Trava e privacidade:
   - `git diff --quiet 986a7de6 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts`;
   - `grep -rl ownerFinancePeople apps/web/app apps/web/components apps/web/lib` → só OwnerFinancePeople.tsx;
   - `grep -rl ownerMemberInsights` nos mesmos lugares → só OwnerMemberDetail.tsx e OwnerMemberList.tsx;
   - nenhum arquivo do nível 1, 2 ou 3 (`PlatformOwnerPanel.tsx`, `PlatformAdminPanel.tsx`, `PlatformSupportPanel.tsx`) importa `owner-finance`.
4. Capturas, em largura de celular (390×844, claro, página inteira), na 3400, em `screens/` (não versionar). Use `pnpm --filter @rede-social/web exec playwright screenshot --viewport-size "390,844" --color-scheme light --full-page <url> <png absoluto>`:
   - `01-visao-geral.png` = `?area=financeiro`;
   - `02-produtos.png` = `&vista=produtos`;
   - `03-produto-vip-ofertas.png` = `&vista=produtos&produto=s2`;
   - `04-quem-compra-escada.png` = `&vista=quem-compra`.
   - Olhe cada uma: capas na proporção, nada cortado, sem rolagem lateral, nenhuma palavra em inglês. Se algo estiver errado, corrija e tire de novo.
5. Limpeza:
   - pare só o processo da 3400 e apague `apps/web/playwright.dwc.config.ts`;
   - confirme que nada escuta na 3400 e que a 3000, se estava no ar antes, continua com o mesmo processo;
   - rode as duas checagens do iCloud;
   - `git status --short` não mostra `screens/` nem cópias '* 2*' no commit.
6. O SUMMARY registra:
   - a tabela de commits;
   - D-01..D-11 aplicados e as PD-1..PD-19;
   - os números finais fixados (seis números e variações, faixas, escada, nunca compraram de novo, vendas associadas);
   - tudo o que mudou fora do Financeiro (pedidos 96 → 126; nível 5/6 de 7 dias; Compras do membro com oferta e entrada no `memberSince`; dias ativos e pessoas do Conteúdo que mudaram; Encontro mensal e sino);
   - a tabela de evidências (comando → resultado);
   - as capturas;
   - um bloco final "⚠️ NÃO FEITO" (o quê, por quê, o que fecha), com pelo menos as revisões critic e flow-critic sobre os commits novos, que ficam com o orquestrador se este executor não puder abrir subagentes.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm lint && pnpm typecheck && pnpm test && pnpm boundaries && pnpm check:static-routes && (cd apps/web && pnpm exec playwright test --config playwright.dwc.config.ts) && git diff --quiet 986a7de6 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts && test "$(grep -rl ownerFinancePeople apps/web/app apps/web/components apps/web/lib | wc -l | tr -d ' ')" = 1 && test -z "$(find apps/web/components/dashboard apps/web/lib apps/web/app/painel-preview apps/web/e2e-preview apps/web/messages packages/modules/dashboard \( -name '* 2*' -o -flags +dataless \) -print)" && ls .planning/quick/261014-dwc-financeiro-com-receita-primaria-e-secund/screens/0[1-4]-*.png</automated>
  </verify>
  <done>
    - lint, typecheck, test, boundaries, check:static-routes e a suíte Playwright do preview inteira verdes, cada comando com o resultado anotado para o SUMMARY.
    - Trava de produção sem diff; nomes do Financeiro lidos por um só arquivo web; nenhuma cópia do iCloud nem arquivo sem dados.
    - 4 capturas olhadas e fora do commit; servidor da 3400 parado e a config temporária apagada, com a 3000 e o Chrome intactos.
  </done>
</task>

</tasks>

<threat_model>
## Limites de confiança

| Limite | Descrição |
|--------|-----------|
| URL → renderização no servidor | `vista`, `numero`, `atencao`, `produto`, `oferta`, `faixa`, `nunca`, `membro` e `lista` vêm da query (não confiáveis) e escolhem o que aparece |
| Dados fictícios → equipe do cliente | quem comprou, o quê, quando e por quanto aparece para a equipe do cliente no nível 4 |
| Rota de prévia → produção | a prévia tem de continuar inacessível em produção sem a variável que a liga |

## Registro STRIDE

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-dwc-01 | Tampering | `parseOwnerFinanceView` | low | mitigate | Cada parâmetro é um valor único e exato da lista permitida, lido nível a nível; um membro só vale pelo predicado de pertença da lista aberta (`ownerFinanceIncludes`); o resto cai um nível. Testes de ida e volta e de URLs forjadas em todos os níveis; só constantes da lista permitida chegam à marcação e aos links |
| T-dwc-02 | Information disclosure | `OwnerFinancePeople`, totais de grupo | medium | mitigate | D-11: nomes e valores só no nível 4, lidos por um único arquivo web (grep na Tarefa 5); os níveis 1–3 só recebem a receita agregada por cliente; D-06: total de faixa, publicação, evento e cancelados abaixo de 5 lê "menos de 5 pedidos" por `isBelowPrivacyFloor`, e compradores por faixa do produto agrupam por `mergeBandsBelowFloor`, para que nenhuma faixa pequena seja deduzida pelo total; e2e confere a ausência de "R$" nessas linhas; README registra |
| T-dwc-03 | Repudiation (dado enganoso) | números da Visão geral, vendas associadas | low | mitigate | "valor registrado, não dinheiro recebido" sob os números; pílula "exemplo" em vencimento, ingressos e espera; nota "Associação, não causa"; testes fixam todas as somas a partir da lista única |
| T-dwc-04 | Elevation of privilege | proxy.ts, layout da prévia, dashboard-preview.ts | high | mitigate | nenhum desses arquivos está em files_modified; `git diff --quiet 986a7de6` sobre os três no verify da Tarefa 5 |

Sem instalação de pacote: tudo reaproveita o que o repositório já tem.
</threat_model>

<verification>
- Tarefas 1 a 4 são TDD: cada commit vermelho falha por exportação ausente ou asserção antes do verde; o verify de cada tarefa fica verde antes da próxima.
- Todo e2e roda no servidor próprio da 3400, depois de um 200; a 3000 e o Chrome nunca são parados.
- A Tarefa 5 roda os gates do CONTEXT na íntegra, com o ambiente provisório, e a suíte Playwright do preview inteira; trava de produção sem diff; capturas fora do commit.
- Regras de sempre: dados determinísticos, textos só no catálogo pt-BR, tokens, `@3xl`, rolagem só vertical, maquete do iPhone, sem JS no cliente, nenhuma palavra em inglês proibida na tela. Sem publicar, sem push.
</verification>

<success_criteria>
- D-01: uma fileira de três abas, nenhuma outra fileira de escolha e nenhum seletor de período; cascata por links; URLs forjadas caem um nível; Voltar exato em todo passo (unidade + e2e).
- D-02: lista única → 126 pedidos, R$ 4.162,00 primária + R$ 4.778,00 secundária = R$ 8.940,00; insights, Conteúdo, Visão geral do painel e níveis 1, 5 e 6 coerentes (testes de soma).
- D-03 / D-05: entrada dá 1 ano de acesso, renovação é secundária, 6 acessos vencem em 7 dias ("exemplo"); cancelados fora da receita.
- D-04 / D-08: quatro cartões de produto com capa 16:7, "Parado" no Workshop, detalhe com ofertas, oferta → compradores → membro; eventos pagos em seção própria com uma pílula.
- D-06 / D-11: piso de 5 em todo total de grupo; nomes só no nível 4; README.
- D-07: os seis blocos da Visão geral na ordem, números clicáveis com contagem igual.
- D-09: faixas, escada e nunca compraram de novo, levando ao membro.
- D-10: base `previous_30_days`; Encontro mensal em 17/10 com o sino coerente.
- Todos os gates verdes, 4 capturas olhadas, servidor próprio limpo.
</success_criteria>

## Auditoria de cobertura das fontes

| Fonte | Item | Tarefa |
|-------|------|--------|
| GOAL (CONTEXT, título) | Financeiro em três abas com receita primária e secundária | T1–T4 |
| CONTEXT D-01 | três abas iguais, sem segunda linha, sem período, cascata com lista permitida, cai um nível, Voltar exato, `owner-finance-view.ts` | T1 (abas, Produtos), T2 (Visão geral), T4 (Quem compra) |
| CONTEXT D-02 | primária × secundária por pedido, ofertas, todo membro com primária no `joined_at`, 96 Novos = 96 primárias, coerência (insights, Conteúdo, Visão geral do painel), lista única com testes de soma | T1 (lista, insights, painel), T2 (Conteúdo, níveis 5/6) |
| CONTEXT D-03 | acesso de 1 ano, renovação secundária, vencimento = compra + 365 com "exemplo" | T1 (regra e insights), T2 (atenção) |
| CONTEXT D-04 | ingressos fora do total, seção própria em Produtos, "exemplo" com uma pílula, `EventCard` 16:10 | T4 |
| CONTEXT D-05 | cancelado = revogado, fora da receita | T1 (dados), T2 (linha do total), T4 (detalhe do produto) |
| CONTEXT D-06 | piso de 5 em faixa, publicação, evento e cancelados; listas nominais com nome e valor | T2, T4 |
| CONTEXT D-07 | seis números + linha do total; atenção; receita por semana; de onde vem; o que só o app sabe; próximos passos | T2 |
| CONTEXT D-08 | cartões com capa 16:7, preço, entrada/adicional, receita, comparação, "Parado"; detalhe com números, semana, faixas, ofertas, publicações; oferta → compradores → membro | T1 (cartões, ofertas, cascata), T4 (detalhe completo) |
| CONTEXT D-09 | receita por faixa com compradores; escada; nunca compraram de novo + ação | T4 |
| CONTEXT D-10 | base `previous_30_days`; Encontro mensal em data futura, números de Eventos iguais | T2 (base), T3 (data e sino) |
| CONTEXT D-11 | nomes só no nível 4, níveis 1–3 agregados, README | T1 (arquivo único), T5 (README e grep) |
| CONTEXT, regras de sempre | determinístico, catálogo pt-BR, tokens, `@3xl`, só vertical, iPhone, sem JS, trava de produção, Biome, fronteiras, guarda de literais, sem palavras em inglês | T1–T5 |
| CONTEXT, verificação | lint, typecheck, test, boundaries, check:static-routes, Playwright completo em porta própria; asserções novas (abas, soma, cascata, contagem igual, piso, forjadas, 360/390/430, iPhone) | T1–T4 (asserções), T5 (gates) |
| CONTEXT, capturas | Visão geral, Produtos, detalhe com ofertas, Quem compra com a escada | T5 |
| RESEARCH (proposta) | cascata, componentes e regras de cor reaproveitados; o que diverge do CONTEXT está em "Não construído" | T1–T4 |
| REQ | V2-PLAT-04, PWA-03, MOD-02, UI-03 | T1–T5 |

<output>
Criar `.planning/quick/261014-dwc-financeiro-com-receita-primaria-e-secund/261014-dwc-SUMMARY.md` ao terminar, em pt-BR, no formato do SUMMARY da 261013-uoi, com o que a Tarefa 5, passo 6, pede.
</output>
