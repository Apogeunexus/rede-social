# Proposta: área Financeiro do painel do dono (nível 4)

Não alterei nenhum arquivo. Li o código atual da área, as fixtures, os primitivos, o catálogo de textos, os esquemas e as funções SQL da loja, além das áreas Membros e Conteúdo como referência. Fiz também um levantamento rápido na web (fontes no fim).

---

## RESUMO DE UMA TELA (para mostrar ao dono)

**Hoje o Financeiro só diz "vendi R$ 8.940 em 96 pedidos".** São 2 números, 4 blocos fechados, nada clicável, nenhuma capa e nenhuma tendência. Os 3 blocos de "exemplo" (acessos vencendo, renovação, conversão) não levam a nenhuma ação.

**A proposta faz o Financeiro responder 4 perguntas, na ordem:**
1. **Quanto entrou e se está melhor** que nos 30 dias anteriores. São 6 números, e cada um abre a lista que está por trás dele.
2. **O que precisa de atenção agora:**
   - 40 membros pagaram a VIP e sumiram.
   - 6 acessos vencem em 7 dias.
   - Um produto está sem venda há 60 dias.
   - Um evento pago lotou e tem 17 pessoas na espera.
3. **De onde vem o dinheiro:** cada produto e cada evento pago vira um cartão com capa. Do cartão você chega aos compradores e de cada comprador às informações dele, que já existem em Membros.
4. **Quem compra e quem ainda não comprou:** a receita por faixa de engajamento. **84% da receita vem de superfãs e engajados, que são 22% da base.**

**O que nenhuma Hotmart, Kiwify ou Stripe consegue mostrar, e esta rede consegue:**
- receita por faixa de engajamento;
- vendas associadas a publicações ("29% da receita veio de quem interagiu com um post até 7 dias antes");
- vendas associadas a eventos;
- os pagantes que estão sumindo antes de o acesso vencer;
- os engajados que nunca compraram, ou seja, quem tem mais chance de comprar a próxima oferta.

**Formato:** uma única fileira de 3 abas (**Visão geral · Produtos · Quem compra**), 30 dias contra os 30 anteriores, sem seletor de período, só rolagem vertical no celular de 440 px e tudo com links simples, sem JavaScript.

**O que o app ainda não registra aparece com a pílula "exemplo":** ingressos de eventos, vencimento de acesso, visitas à página do produto e lista de espera. A pílula some quando o dado passar a ser registrado.

**Decisões que só o dono pode tomar** (detalhadas logo abaixo):
- (A) se a VIP é venda avulsa com vencimento ou assinatura mensal;
- (B) se a receita de ingressos entra no total;
- (C) o que é "cancelado" sem gateway de pagamento;
- (D) onde vale o piso de privacidade de 5.

---

## Decisões que o usuário precisa tomar (cada uma muda a arquitetura)

**A. A Comunidade VIP é venda avulsa com vencimento ou assinatura recorrente?**
- O esquema hoje só conhece venda avulsa:
  - `store_orders` não tem nenhuma noção de recorrência (`packages/modules/store/db/schema.ts:154-195`);
  - existe só um pedido "vivo" por membro e produto (`store_orders_live_uq`, `schema.ts:180-182`);
  - o campo `expires_at` existe, mas "is never set in 08.2" (`schema.ts:200, 222`).
- O exemplo das fixtures já trata a VIP como acesso de 1 ano: o vencimento é a data da compra + 365 dias (`packages/modules/dashboard/fixtures/owner-member-insights.ts:164`).
- **Hipótese adotada:** venda avulsa com acesso que vence.
- **Se for assinatura mensal,** entram receita recorrente mensal (MRR), cancelamento (churn) e falha de cobrança. Isso troca a seção "Acessos que vencem" por "Assinaturas" e muda a estrutura de dados.

**B. Os ingressos de eventos entram no total "Receita"?**
- Nas fixtures, a receita de eventos dos últimos 30 dias (exemplo) seria R$ 12.000: Encontro set. 100 × R$ 60 + Workshop 50 × R$ 120 (`tenant-owner.ts:503, 527`). Isso é maior que a loja (R$ 8.940).
- Somar as duas coisas criaria um total com 57% de valor fictício.
- **Hipótese adotada:** o número principal é só a loja (que existe de verdade). Eventos pagos aparecem como seção própria na aba Produtos, com a pílula "exemplo", e entram no total quando houver venda de ingresso registrada.

**C. O que conta como "cancelado"?**
- Sem gateway não existe estorno nem chargeback. O que existe é a revogação feita pelo administrador: o pedido vira `revoked` (`supabase/migrations/20261008190514_store_grants.sql:120-165`, `schema.ts:184`).
- **Hipótese adotada:** "Cancelados" = pedidos revogados no período. Eles não entram na receita.

**D. Onde vale o piso de 5?**
- O padrão atual é: uma venda associada a publicação com menos de 5 pedidos mostra "menos de 5 pedidos" e esconde o valor (`apps/web/components/dashboard/OwnerContentPostDetail.tsx:296-299`, `PRIVACY_FLOOR = 5` em `packages/modules/dashboard/ui/metrics.ts:83`).
- Ao mesmo tempo, o nível 4 já mostra o valor de cada compra nominal nas informações do membro (`OwnerMemberDetail.tsx:325-358`).
- **Hipótese adotada:**
  - o piso vale para totais de um **segmento** (faixa, publicação, evento, cancelados), que mostram "menos de 5 pedidos" sem o valor;
  - listas nominais (compradores de um produto, pedidos) mostram nome e valor, como o nível 4 já faz.

---

## 1. Visão geral

| Item | Definição |
|---|---|
| Nome | Financeiro, painel do dono do cliente (nível 4) |
| Objetivo | Mostrar quanto a comunidade fatura, de onde vem, o que está em risco e qual a próxima venda mais provável |
| Usuário principal | O dono do cliente (o criador ou o gestor do negócio) |
| Decisões suportadas | 1) Qual produto empurrar, repetir ou aposentar. 2) Para quem oferecer o próximo produto. 3) Quem recuperar antes de perder o pagante. 4) Se vale abrir mais vagas em evento pago. 5) Que tipo de publicação vende |
| Frequência | Semanal (HIPÓTESE). Por isso as 7 perguntas ficam na tela, distribuídas em 3 abas |
| Dispositivo | Celular de 440 px (maquete de iPhone, `apps/web/components/dashboard/PhoneMockup.tsx:41`); a coluna de 680 px no desktop (`TenantColumn.tsx`) |
| Resultado esperado | Em 10 segundos o dono sabe quanto entrou e se melhorou. Em 1 minuto sabe qual produto vende, quem compra e qual é a próxima ação |

## 2. Diagnóstico

### 2.1 O que existe hoje (com arquivo:linha)

**A tela atual, `apps/web/components/dashboard/OwnerFinance.tsx`:**
- `:47-61`: "Vendas do mês" tem só 2 cartões, Valor registrado R$ 8.940 (+12%) e Pedidos 96 (+9), mais o aviso "valor registrado, não dinheiro recebido".
- `:63-82`: "Receita por produto" fica fechado, em barras, sem capa, sem comparação por produto e sem link.
- `:84-105`: "Quem compra" fica fechado, com pedidos por faixa só em contagem, sem valor nem link.
- `:107-125`: "Acessos e renovação" tem 2 cartões de exemplo sem ação.
- `:127-149`: "Conversão por produto" fica fechado e é todo exemplo.

**Fixtures (`packages/modules/dashboard/fixtures/tenant-owner.ts`):**
- `:295-298`: valor dos pedidos, 894000 centavos, delta +12% com base `previous_month`.
- `:479`: pedidos por faixa: novos 9, superfãs 31, engajados 38, ocasionais 14, em risco 3, inativos 1 (soma 96).
- `:609-633`: produtos:

  | Produto | Pedidos | Valor | Preço implícito |
  |---|---|---|---|
  | VIP | 21 | R$ 4.137 | R$ 197 |
  | Mentoria | 6 | R$ 2.940 | R$ 490 |
  | E-book | 69 | R$ 1.863 | R$ 27 |
  | Workshop gravado | 0 | R$ 0 | – |

- `:503-574`: preço do ingresso de cada evento, como exemplo.
- `:577-599`: lista de espera, como exemplo.

**Dados que já existem no app:**
- `store_products`, com preço, capa `image_asset_id` e status (`schema.ts:81-118`).
- Ligação produto↔comunidade (`:121-141`).
- `store_orders`, com status, `amount_cents`, `paid_at` e `revoked_at` (`:154-195`).
- `store_entitlements`, com origem compra ou cortesia (`grant`) e `expires_at` vazio (`:202-255`).
- Lista de compradores por produto: `GET /products/{productId}/buyers` (`packages/modules/store/server/routes.ts:297`) e índice `store_entitlements_tenant_product_created_idx` (`schema.ts:232`).
- A compra grava direto `paid` com `provider 'none'` (`supabase/migrations/20261009085216_store_purchase_owned_first.sql`, passo 5). **Portanto `pending` nunca acontece hoje.**

**Associação venda↔publicação já modelada como dado medido:**
- `BUSINESS` em `packages/modules/dashboard/fixtures/owner-content.ts:661-692`: op-11, op-15, op-19, op-41 e op-55 com pedidos até 7 dias depois, mais "vitrine" da VIP.
- É exibida em `OwnerContentPostDetail.tsx:264-310`.

**Componentes que dão o padrão de cascata e de cartão:**
- Abas: `OwnerContent.tsx:23-48`.
- Números clicáveis: `NumberLink` em `OwnerContentOverview.tsx:96-107`.
- Cartão com capa, `Cell` e `Linked`: `BandScopeCards.tsx:60-129`.
- Informações do membro com compras: `OwnerMemberDetail.tsx:325-358`.
- Pílula de exemplo: `ExamplePill.tsx`.

### 2.2 Problemas identificados

1. **Os 2 números não respondem "está bom?" além do total.** Faltam compradores, ticket médio, receita por membro, recompra e cancelados (`OwnerFinance.tsx:48-59`).
2. **O diagnóstico principal (qual produto vende) está escondido** num bloco fechado, sem capa, sem comparação por produto e sem clique (`:63-82`).
3. **"Quem compra" mostra só contagens.** Não mostra quanto cada faixa vale em R$ e não abre os compradores (`:93-103`). Ele exibe "em risco 3" e "inativo 1" isolados, abaixo do piso de 5, sem agrupar. O utilitário `mergeBandsBelowFloor` existe (`packages/modules/dashboard/README.md:18`) e não é usado.
4. **Não há tendência no tempo.** Membros e Conteúdo têm linha de 12 semanas (`OwnerMembers.tsx:140-148`, `OwnerContentOverview.tsx:240-249`); o Financeiro não.
5. **Faltam "Precisa de atenção" e "Próximos passos",** que Conteúdo tem (`OwnerContentOverview.tsx:194-229, 422-459`).
6. **A base de comparação está inconsistente.** O financeiro usa `previous_month` (`tenant-owner.ts:297, 616`), mas o painel declara 30 dias contra os 30 anteriores, e Membros usa `previous_30_days` (`:290`).
7. **A fixture não guarda o preço de cada produto.** Ele é deduzido como valor ÷ pedidos (`owner-member-insights.ts:43-47`, `owner-content.ts:710-715`), o que quebra quando há 0 pedidos: o Workshop gravado não tem preço. Também faltam período anterior por produto, compradores distintos, cancelados, cortesias, capa e comunidade liberada.
8. **O "valor registrado" aparece sem dimensão nova** tanto na Visão geral do painel (`OwnerOverview.tsx:68-71`) quanto no Financeiro. No Financeiro ele tem de ganhar a quebra por produto e por semana.

### 2.3 Benchmark: o que as plataformas de criadores mostram

| Plataforma | O que mostra ao criador | Serve aqui? |
|---|---|---|
| Hotmart | Total de vendas, receita líquida, taxa de reembolso, taxa de chargeback. Relatório de recorrências com receita, retenção e churn (cancelados ÷ ativas). Recuperação de inadimplentes. Exportação em CSV/XLS | Total, cancelados e retenção, sim. Líquido, reembolso e chargeback, só com gateway |
| Kiwify (via Reportei) | Vendas aguardando pagamento, vendas recusadas, aprovação de cartão, vendas por Pix, reembolsos, chargebacks | Nada disso existe sem gateway. Fica de fora, nas Limitações |
| Circle | Analytics 3.0 com painel de pagamentos e receita dos paywalls, junto de membros e eventos (não confirmei se mostra MRR ou churn) | Receita ao lado de membros e eventos, sim |
| Skool | No painel do dono: MRR e taxa de conversão da página "sobre" (visitante → membro). Analytics avançado ainda não confirmado | Conversão da página do produto, como exemplo (`needs_product_page_views`) |
| Patreon | Painel de ganhos (antes de taxas, reembolsos e recusas, mais as cobranças recusadas); painel de membros (ativos, novos, cancelamentos registrados quando o acesso termina, pesquisa de saída anônima); filtro grátis/pago | O "vencimento do acesso" segue a lógica do Patreon: cancelamento é quando o acesso termina |
| Stripe | Volume bruto e líquido (menos taxas, reembolsos e disputas), MRR normalizado, churn em janela de 30 dias, valor do cliente ao longo da vida (LTV) | Ticket médio e "receita por comprador", sim. MRR e churn, só se a decisão A for "assinatura" |

**Conclusão do benchmark:** todas mostram dinheiro × produto × tempo. **Nenhuma liga dinheiro a comportamento dentro da comunidade,** porque nenhuma é dona da comunidade e do conteúdo ao mesmo tempo (o Circle chega perto, mas mostra lado a lado, não cruzado). Esse é o diferencial a explorar.

### 2.4 O que só esta rede pode mostrar

| Cruzamento | Fonte | Status |
|---|---|---|
| Receita por faixa de engajamento (faixa do comprador no dia anterior à compra) | `store_orders` + regras de faixa (`tenant-owner.ts:188-189`) | EXISTE (contagem). PRECISA CALCULAR o valor |
| Receita por membro de cada faixa | idem ÷ membros da faixa | EXISTE, PRECISA CALCULAR |
| Vendas até 7 dias depois de interagir com uma publicação | `owner-content.ts:656-692` (medido) | EXISTE por publicação. PRECISA CALCULAR o total de pedidos **distintos** |
| Vendas até 7 dias depois de ir a um evento | check-ins + `store_orders` | EXISTE, PRECISA CALCULAR |
| Pagantes que sumiram (acesso ativo em risco ou inativo) | `store_entitlements` ativos + faixa na comunidade (`tenant-owner.ts:310-315`: VIP em risco 22, inativos 18) | EXISTE, PRECISA CALCULAR |
| Engajados que nunca compraram (o próximo comprador) | faixa + ausência de pedido pago | EXISTE, PRECISA CALCULAR |
| Quem comprou o produto de entrada e ainda não o principal (E-book sem VIP) | `store_orders` | EXISTE, PRECISA CALCULAR |
| Receita da comunidade fechada contra o uso dela (ativos na semana) | ligação produto↔comunidade + `activeWeek` (`tenant-owner.ts:384`) | EXISTE |

### 2.5 Hipóteses adotadas

- Venda avulsa com vencimento de 1 ano (decisão A).
- Loja fora dos ingressos (decisão B).
- Cancelado = revogado (decisão C).
- Piso de 5 em totais de segmento (decisão D).
- Frequência semanal.
- Preço do Workshop gravado: R$ 97 (inventado; a fixture não tem).

## 3. Narrativa

| # | Pergunta | Onde responde |
|---|---|---|
| 1 | O que está acontecendo? | Visão geral › "Números do mês" (6 cartões) |
| 2 | Está bom ou ruim? | Os mesmos cartões, com variação contra os 30 dias anteriores e cor de status só na seta |
| 6 | O que precisa de atenção? | Visão geral › "Precisa de atenção", **logo abaixo dos números** |
| 3 | O que mudou? | Visão geral › "Receita por semana" (12 semanas contra as 12 anteriores, tracejada) |
| 4 | Onde está o problema ou a oportunidade? | Visão geral › "De onde vem a receita" (produto e faixa resumidos) → aba **Produtos** (cartões com capa) e aba **Quem compra** (faixas) |
| 5 | Por que aconteceu? | Visão geral › "O que só o app sabe" (conteúdo e evento associados a vendas) + detalhe do produto |
| 7 | Qual ação tomar? | Visão geral › "Próximos passos" (3 cartões de ação), mais as ações dentro do produto e do membro |

**Exceção declarada:** a pergunta 6 sobe para logo depois dos números porque o produto perde dinheiro sozinho se ninguém agir. Acesso que vence sem aviso não renova, pagante que some não renova, e vaga de evento lotado com fila parada é venda que não acontece.

**Divisão em abas:** a Visão geral responde 1, 2, 6, 3, 5 e 7 de forma resumida. As abas Produtos e Quem compra aprofundam a pergunta 4 nas duas dimensões que o dono usa para decidir: **o quê** vende e **quem** compra.

## 4. Arquitetura do dashboard

Há uma única fileira de abas, em grid de 3 colunas (o mesmo padrão de `OwnerContent.tsx:33-45`): **Visão geral · Produtos · Quem compra**. Todo nível mais fundo substitui a área inteira e mostra "Voltar" no topo (padrão PD-3).

| Seção | Objetivo | Posição | Prioridade | Componentes | Relação |
|---|---|---|---|---|---|
| V1 Números do mês | Perguntas 1 e 2 | Visão geral, topo | KPI principal | 6 `KpiCard` dentro de link | Cada número abre sua lista (C1) |
| V2 Precisa de atenção | Pergunta 6 | Visão geral, 2º | Alerta | Lista com ícone e contagem | Cada linha abre a lista de membros ou o produto/evento |
| V3 Receita por semana | Pergunta 3 | Visão geral, 3º | Diagnóstico | `LineChart` com `previous` | Mesmo total de V1, com a dimensão tempo |
| V4 De onde vem a receita | Pergunta 4, resumo | Visão geral, 4º | Diagnóstico | 2 `BarList` (por produto, por faixa) + link "ver produtos" e "ver quem compra" | Leva às abas Produtos e Quem compra |
| V5 O que só o app sabe | Pergunta 5 | Visão geral, 5º | Diagnóstico | Cartão com linhas (padrão `AppKnows`) | Abre publicações e eventos associados |
| V6 Próximos passos | Pergunta 7 | Visão geral, fim | Ação | 3 `ActionCard` | Usa os números de V2 e V5 |
| P1 Produtos da loja | Pergunta 4 (o quê) | Produtos, topo | Diagnóstico | Cartão de produto com capa, 1 por produto | Abre o detalhe do produto (C2) |
| P2 Eventos pagos | Pergunta 4 (o quê) | Produtos, 2º | Diagnóstico (exemplo) | Cartão de evento com capa (`EventScopeCard` adaptado) | Abre o detalhe do evento pago (C3) |
| Q1 Receita por faixa | Pergunta 4 (quem) | Quem compra, topo | Diagnóstico | Frase-resumo + 6 `Collapsible` por faixa | Faixa aberta lista os compradores → membro |
| Q2 Ainda não compraram | Perguntas 4 e 7 | Quem compra, 2º | Oportunidade | 2 linhas clicáveis + `ActionCard` | Abre a lista de membros → membro |
| Q3 Compraram mais de um | Pergunta 4 | Quem compra, 3º | Diagnóstico | `BarList` "caminhos de compra" | Abre a lista de quem fez o caminho |

## 5. Especificação dos componentes

Rótulos usados: **EXISTE** (REAL, há campo no app), **CALCULAR** (REAL; os dados existem, mas a agregação é nova e precisa entrar na fixture), **COLETAR** (pílula "exemplo"; o app não registra) e **SUGESTÃO**.

Regras de cor da área inteira:
- Valores usam texto primário.
- A seta de variação usa `success`/`danger` (`KpiCard.tsx:39-41`).
- Barras usam a cor da marca, com a linha em destaque (`highlight`) só no item líder ou no item em alerta.
- O ícone de alerta usa `text-warning`.
- Nenhuma cor decorativa.

### V1 "Números do mês"

- **Tipo:** `KpiGrid` com 6 `KpiCard`, cada um dentro de um link no padrão `NumberLink` (`OwnerContentOverview.tsx:96-107`), com o rodapé "Ver lista ›".
- **Período:** 30 dias contra os 30 anteriores.
- **Estado vazio:** "Nenhuma venda nos últimos 30 dias" no lugar do grid e o link "Ver produtos".
- **Celular:** grid de 2 × 3.
- **Justificativa:** a pergunta é "qual é o valor agora", e para isso o número com comparação ganha. Gráfico de ponteiro (gauge) está proibido.

| # | Cartão | Definição | Valor (fictício) | Fonte | Abre | Por que importa |
|---|---|---|---|---|---|---|
| 1 | Receita registrada | Soma de `amount_cents` dos pedidos `paid` com `paid_at` nos últimos 30 dias, sem os revogados. Nota: "96 pedidos · valor registrado, sem pagamento integrado" | R$ 8.940 ▲ 12% (antes R$ 8.017) | EXISTE | Pedidos, mais recentes primeiro | O termômetro do negócio |
| 2 | Compradores | Membros distintos com pedido pago. Nota: "6,5% dos membros" | 81 ▲ 6 (antes 75) | CALCULAR | Compradores, por valor gasto | Separa "vendeu mais para os mesmos" de "vendeu para mais gente" |
| 3 | Ticket médio | Receita ÷ pedidos | R$ 93,13 ▲ 1% (antes R$ 92,15) | EXISTE (derivado) | Pedidos, por valor | Mostra se o mix está indo para produto caro ou barato |
| 4 | Receita por membro | Receita ÷ membros da base | R$ 7,21 ▲ 4% (antes R$ 6,95) | EXISTE (derivado; base em `tenant-owner.ts:288`) | Aba Quem compra | Quanto vale cada membro: decide quanto investir para atrair membros |
| 5 | Compraram 2 ou mais | Compradores com 2+ produtos pagos no período. Nota: "16% dos compradores" | 13 | CALCULAR | Lista desses membros | Fidelidade: quem já confia e compra de novo |
| 6 | Cancelados e cortesias | Pedidos revogados no período e acessos liberados à mão (`source = 'grant'`). Nota: "2 cancelados · 5 cortesias" | 7 | CALCULAR | Lista com tipo, produto e data | Receita perdida e acesso dado de graça |

O cartão 6 mostra o valor dos cancelados (R$ 394) só a partir de 5 pedidos (decisão D). Abaixo de 5, a nota diz "menos de 5 cancelados".

O aviso fixo continua embaixo do grid: "Enquanto não houver pagamento integrado, o valor é registrado, não dinheiro recebido." (catálogo `tenantOwner.sales.notice`).

### V2 "Precisa de atenção"

- **Tipo:** cartão com lista dividida por linhas e ícone `AlertTriangle` em warning (padrão `OwnerContentOverview.tsx:200-228`). Cada linha é um link. Fica em ordem fixa por urgência.
- **Período:** agora, mais os próximos 7 dias.
- **Estado vazio:** "Nada pedindo ação agora."
- **Celular:** igual, uma linha por item com até 2 linhas de texto.
- **Justificativa:** são exceções que exigem ação. Uma lista com contagem é mais rápida de ler que um gráfico.

| Linha | Métrica | Valor | Fonte | Abre |
|---|---|---|---|---|
| a | "40 pagantes da VIP sem ação em 30 dias", com nota "22 em risco · 18 inativos · 11 com push" | 40 | CALCULAR (`tenant-owner.ts:310-315`) | Lista de membros → membro |
| b | "6 acessos vencem em 7 dias · Comunidade VIP" | 6 | COLETAR (`needs_access_expiry`) | Lista de membros → membro |
| c | "Workshop gravado: nenhuma venda há 60 dias" | 0 pedidos | EXISTE | Detalhe do produto |
| d | "Imersão presencial lotada: 17 na espera (R$ 5.950 em ingressos)" | 17 | COLETAR (`needs_waitlist`, `needs_event_tickets`) | Detalhe do evento pago |

### V3 "Receita por semana"

- **Tipo:** `LineChart` com série atual e `previous` tracejado, legenda com `LegendStroke` (padrão `OwnerContentOverview.tsx:233-262`).
- **Métrica:** receita registrada por semana (EXISTE: `paid_at` agrupado por semana).
- **Período:** 12 semanas contra as 12 anteriores.
- **Eixo Y:** `formatBrlCompact`, `yStep` de R$ 500.
- **Rótulos do eixo X:** "sem. 4", "sem. 8", "sem. 12".
- **Valores (R$):**
  - atual: 1.610, 1.720, 1.580, 1.840, 1.760, 1.900, 1.690, 1.820, 2.050, 1.980, 2.310, 2.240
  - anterior: 1.380, 1.450, 1.520, 1.490, 1.600, 1.560, 1.640, 1.700, 1.580, 1.750, 1.690, 1.820
- **Cor:** marca (atual) e texto terciário (anterior), como já faz o componente.
- **Estado vazio:** "Ainda não há 12 semanas de vendas", com a linha só do que existe.
- **Celular:** largura total do cartão, 3 rótulos.
- **Justificativa:** a pergunta é evolução, e os dados são semanais e contínuos. Por isso linha. Semanal e não diário porque 96 pedidos por mês dão dias com zero, o que gera ruído.

### V4 "De onde vem a receita"

São dois cartões, cada um com uma `BarList` ordenada.

**(a) Por produto.** Mostra a receita e, na taxa, "21 pedidos · 46%". Destaque no líder.

| Produto | Receita | Pedidos | Participação |
|---|---|---|---|
| Comunidade VIP | R$ 4.137 | 21 | 46% |
| Mentoria em grupo | R$ 2.940 | 6 | 33% |
| E-book | R$ 1.863 | 69 | 21% |
| Workshop gravado | R$ 0 | 0 | 0% |

**(b) Por faixa.** Os valores estão em Q1; destaque em superfãs e engajados. Faixas com menos de 5 pedidos são agrupadas.

- **Fonte:** EXISTE (a) e CALCULAR (b).
- **Comparação:** a participação no total, dentro de cada barra.
- **Interação:** links no rodapé, "Ver produtos ›" e "Ver quem compra ›", que trocam de aba.
- **Celular:** mostra os 3 primeiros; o resto fica no link.
- **Justificativa:** a pergunta é comparar categorias, então barras horizontais ordenadas. Pizza está vetada: o 4º item tem zero.

O gráfico (b) não repete Q1: aqui é resumo, Q1 acrescenta compradores e valor por membro.

### V5 "O que só o app sabe"

- **Tipo:** cartão com linhas (o mesmo `AppLine` de `OwnerContentPostDetail.tsx:270-308`) e uma nota de rodapé: "Associação, não causa."

| Linha | Valor | Fonte | Abre |
|---|---|---|---|
| Vendas de quem interagiu com uma publicação até 7 dias antes | 22 pedidos · R$ 2.587 (29%) | CALCULAR (pedidos distintos, a partir de `owner-content.ts:661-692`) | Publicações ordenadas pela venda associada:<br>op-41 9 pedidos R$ 1.216<br>op-15 6 R$ 1.182<br>op-11 6 R$ 502<br>op-19 e op-55 "menos de 5 pedidos"<br>Cada uma abre a publicação no Conteúdo |
| Vendas de quem foi a um evento até 7 dias antes | 11 pedidos · R$ 1.147 | CALCULAR (check-ins + pedidos) | Eventos ordenados pela venda associada |
| Receita da VIP contra o uso da comunidade | R$ 4.137 · 104 ativos na semana de 186 com acesso | EXISTE (`tenant-owner.ts:378-385`) | Detalhe do produto VIP |

- **Estado vazio:** "Nenhuma venda associada a conteúdo ou evento no período."
- **Justificativa:** responde "por quê" com o que só esta rede tem. Linhas de texto em vez de gráfico porque são 3 fatos de naturezas diferentes.

### V6 "Próximos passos"

Três `ActionCard`, cada um com `PreviewAction` desativado (padrão `OwnerContentOverview.tsx:422-459`):

1. **"Oferecer a VIP a quem já engaja":** "31 engajados compraram o E-book e não têm a VIP." Botão: Enviar oferta. CALCULAR.
2. **"Recuperar pagantes que sumiram":** "22 pagantes da VIP em risco, 11 com push." Botão: Avisar sobre o próximo encontro. CALCULAR.
3. **"Abrir segunda turma da Imersão":** "17 pessoas na espera, R$ 5.950 em ingressos." Botão: Duplicar evento. Com pílula "exemplo".

### P1 Cartão de produto (aba Produtos)

- **Tipo:**
  - capa de largura total em 16:7, vinda de `store_products.image_asset_id`, com o gradiente da marca quando não há imagem;
  - nome e linha "Abre: Comunidade VIP" (ligação produto↔comunidade);
  - uma linha fina e 4 colunas `Cell`: **Preço · Pedidos · Receita · vs. antes**;
  - a última linha "Ver compradores ›".
- **Ordem:** pela receita.
- **Avaliado e não serviu:** `ProductCard` (`packages/modules/store/ui/ProductCard.tsx:50-130`) é vitrine em 4:5, sem espaço para números, e aponta para `/loja`. Por isso reaproveito `Card`, `Cell` e `Linked` de `BandScopeCards.tsx:60-88` e a estrutura de `CommunityScopeCard`. **Componente novo: só a capa de produto** (`ProductCover`, no módulo store, no formato 16:7 do `CommunityCover`).

| Produto | Preço | Pedidos | Receita | vs. antes |
|---|---|---|---|---|
| Comunidade VIP | R$ 197 | 21 | R$ 4.137 | +24% |
| Mentoria em grupo | R$ 490 | 6 | R$ 2.940 | = |
| E-book | R$ 27 | 69 | R$ 1.863 | +8% |
| Workshop gravado | R$ 97 | 0 | R$ 0 | sem venda, com pílula warning "Parado" |

- **Antes (período anterior):** VIP 17 pedidos, Mentoria 6, E-book 64, Workshop 0, total 87 pedidos e R$ 8.017.
- **Fonte:** EXISTE, menos o "vs. antes" (CALCULAR).
- **Estado vazio:** "Nenhum produto cadastrado", com link para a loja.
- **Justificativa:** o dono decide por produto e reconhece o produto pela capa. A variação fica no próprio cartão, sem uma seção a mais.

### P2 Cartão de evento pago (aba Produtos)

- **Tipo:** `EventScopeCard` reaproveitado (`BandScopeCards.tsx:137-182`), com estas colunas: **Data · Ingresso · Inscritos · Receita**.
- **Exemplo:** acima da lista vai uma única linha `RevenueExampleNote` (`:185-194`): "Receita: valores de exemplo", com a pílula.
- **Ordem:** próximos primeiro, depois os passados.

| Evento | Data | Ingresso | Inscritos | Receita |
|---|---|---|---|---|
| Encontro mensal | hoje | R$ 60 | 92 | R$ 5.520 |
| Imersão presencial | 24/out | R$ 350 | 40, lotado, 17 na espera | R$ 14.000 |
| Workshop | 1/out | R$ 120 | 50 | R$ 6.000 |
| Encontro set. | 19/set | R$ 60 | 100 | R$ 6.000 |

- **Eventos gratuitos ficam fora,** em linha de rodapé: "2 eventos gratuitos no período".
- **Fonte:** inscritos e capacidade EXISTEM; ingresso é COLETAR.
- **Justificativa:** evento pago é produto. Separado da loja porque é exemplo (decisão B).

### Q1 "Receita por faixa" (aba Quem compra)

- **Frase-resumo:** "84% da receita (R$ 7.531) vem de superfãs e engajados, que são 22% dos membros."
- **Tipo:** 6 `Collapsible`, o mesmo padrão de "Quem interage" (`OwnerContentOverview.tsx:390-420`). O resumo de cada um é "R$ X · N pedidos · Y compradores (Z% da faixa)". Aberto, mostra o cartão de cada comprador → membro.

| Faixa | Pedidos | Receita | Compradores | % da faixa | R$ por membro |
|---|---|---|---|---|---|
| Superfãs | 31 | R$ 4.049 | 26 | 42% | R$ 65,31 |
| Engajados | 38 | R$ 3.482 | 32 | 16% | R$ 16,99 |
| Novos | 9 | R$ 753 | 8 | 8% | R$ 7,84 |
| Ocasionais | 14 | R$ 548 | 12 | 8% | R$ 3,65 |
| Em risco + inativos | 4 | menos de 5 pedidos | 3 | – | – |

- **Composição dos pedidos por faixa** (fecha com os produtos): superfãs VIP 8 / Mentoria 4 / E-book 19; engajados 9/2/27; novos 3/0/6; ocasionais 1/0/13; em risco + inativos 0/0/4.
- **Fonte:** CALCULAR. A contagem existe em `tenant-owner.ts:479`.
- **Regra:** a faixa é a do comprador no dia anterior à compra (rodapé atual `tenantOwner.buyers.footnote`).
- **Justificativa:** é a pergunta "onde" vista pela dimensão pessoa. Lista sanfonada porque cada faixa abre pessoas.

### Q2 "Ainda não compraram"

Duas linhas clicáveis, mais o `ActionCard` 1 de V6 (o mesmo dado, sem duplicar número):

- "112 superfãs e engajados nunca compraram" → lista → membro.
- "58 compraram o E-book e não têm a VIP" (31 deles engajados) → lista.

Fonte: CALCULAR. É a lista de prospecção que nenhuma plataforma de checkout tem.

### Q3 "Caminhos de compra"

- **Tipo:** `BarList` de pares "primeiro produto → segundo produto", com os compradores, contando desde a entrada do membro:
  - E-book → VIP: 9
  - VIP → Mentoria: 4
  - Pares com menos de 5 compradores viram "Outros caminhos: 3".
- **Fonte:** CALCULAR (`store_orders` por membro, por ordem de `paid_at`).
- **Justificativa:** mostra a escada de produtos. Barras porque é comparação entre categorias.
- **Celular:** mostra os 3 primeiros.

## 6. Direção visual

Tudo é reaproveitado; nada novo além da capa de produto.

- **Coluna:** `TenantColumn` (`TenantColumn.tsx`), largura do app até 680 px.
- **Espaço:** `gap-6` entre seções (`TenantOwnerPanel.tsx:119`), `gap-3` dentro delas.
- **Seção:** `PanelSection`; no detalhe, `prominent` com `BackLink` (`OwnerContentOverview.tsx:560-567`).
- **Grade de números:** `KpiGrid`, com 2 colunas em 360–430 px e mais colunas em telas largas (`KpiCard.tsx:112-119`).
- **Cartão:** `Card` de `@rede-social/ui`, com `hover:bg-card-hover`. Link do cartão inteiro com `focus-visible:ring-brand` (`BandScopeCards.tsx:78-88`).
- **Tipografia:** nome do cartão em `text-xl font-bold`, valores de `Cell` em `text-lg font-bold tabular-nums`, rótulos em `text-xs text-text-secondary` (`BandScopeCards.tsx:60-75, 114-115`).
- **Cores:**
  - marca para séries e destaques;
  - `success`/`danger` só na seta de variação;
  - `warning` no ícone de atenção e na pílula "Parado";
  - `ExamplePill` neutra (`ExamplePill.tsx`).
- **Valores:** `formatBrl` para valores inteiros, `formatBrlCompact` em eixo e em `Cell` estreita (`BandScopeCards.tsx:1, 169`).
- **Densidade:** a mesma de Conteúdo, com no máximo 6 números por grade e 3 cartões de ação.

## 7. Interações

- **Filtros globais:** nenhum (sem seletor de período, por pedido do dono). O cabeçalho já diz "30 dias".
- **Abas:** 3 links `<a>` em `grid-cols-3`, sem JavaScript.
- **Número → lista:** cada cartão de V1 abre a lista com "Voltar", que retorna ao próprio cartão pela âncora `scroll-mt-20`.
- **Exportação:** fora do escopo da prévia. Fica como SUGESTÃO para a versão real (CSV de pedidos, como Hotmart e Kiwify).
- **Ações:** todos os botões são `PreviewAction` desativados, como no resto da prévia.

### Cascata (o detalhe de cada nível substitui a área, com "Voltar" um passo)

```
Visão geral
 ├─ número ─────────────► lista (pedidos | compradores | 2+ | cancelados/cortesias)
 │                          └─ linha ► MEMBRO (OwnerMemberDetail) ► lista do número do membro
 ├─ atenção (a, b) ─────► lista de membros ► MEMBRO
 ├─ atenção (c) ────────► PRODUTO
 ├─ atenção (d) ────────► EVENTO PAGO
 └─ só o app sabe ──────► publicações com venda associada ► publicação (área Conteúdo)

Produtos
 ├─ cartão produto ─────► PRODUTO: 4 números (pedidos, receita, compradores, vs. antes)
 │                          · receita/semana (LineChart 12 sem.)
 │                          · compradores por faixa (BarList, faixas <5 agrupadas)
 │                          · comunidade liberada: com acesso, ativos, em risco (VIP)
 │                          · publicações que venderam este produto
 │                          · conversão visita→compra [exemplo]
 │                          · "Ver compradores" ► lista nominal (nome, faixa, data, valor)
 │                                                 └─ MEMBRO ► lista do número
 └─ cartão evento pago ─► EVENTO PAGO: inscritos, check-ins, receita [exemplo],
                            espera [exemplo], quem foi e comprou depois
                            └─ inscritos ► MEMBRO

Quem compra
 ├─ faixa aberta ───────► cartões de comprador ► MEMBRO
 ├─ ainda não compraram ► lista ► MEMBRO
 └─ caminho de compra ──► lista ► MEMBRO
```

O membro aberto pelo Financeiro usa o `OwnerMemberDetail` existente com `scope={{kind:'member'}}` e a faixa de hoje, como o Conteúdo já faz (`OwnerContent.tsx:72-98`). A seção "Compras" dele já existe (`OwnerMemberDetail.tsx:325-358`).

O link para a publicação sai da área (vai ao Conteúdo). **Hipótese:** é aceitável, porque o "Voltar" da publicação leva à Visão geral do Conteúdo. A alternativa é guardar a origem na URL (está nas Limitações).

## 8. Responsividade

- **Desktop (coluna de 680 px fora da maquete):** a mesma ordem. `KpiGrid` em 3 a 4 colunas e cartões de produto em 1 coluna (a capa precisa da largura). Nada a mais aparece.
- **Tablet:** idêntico ao desktop; a coluna é a mesma.
- **Celular de 440 px (principal), redesenhado, não empilhado:**
  - Os números ficam em 2 × 3.
  - "Precisa de atenção" tem no máximo 4 linhas, cada uma com até 2 linhas de texto.
  - V4 mostra só o top 3 de cada lista, mais "ver todos", que leva à aba.
  - V5 mostra 3 linhas; as listas de publicações e eventos ficam a um toque.
  - O detalhe do produto deixa a conversão (exemplo) fechada em `Collapsible`.
  - Os cartões de evento pago mostram 4 colunas `Cell` com `formatBrlCompact` ("R$ 14 mil").
  - Q3 mostra o top 3.
  - Não há tabela em lugar nenhum (`ResponsiveTable` fica de fora) e não há rolagem lateral.
  - Não há filtro a acessar.

## 9. Wireframe

**Celular, 440 px (12 colunas):**

```
|01 02 03 04 05 06 07 08 09 10 11 12|
[  Visão geral ][  Produtos  ][Quem compra]
NÚMEROS DO MÊS
[ Receita R$ 8.940 ▲12%][ Compradores 81 ▲6 ]
[ 96 pedidos     Ver › ][ 6,5% dos membros › ]
[ Ticket R$ 93,13 ▲1%  ][ Por membro R$ 7,21 ▲4%]
[ 2+ produtos 13     › ][ Cancel./cortesias 7 ›]
 valor registrado, sem pagamento integrado
PRECISA DE ATENÇÃO
[⚠ 40 pagantes da VIP sem ação em 30 dias  ›]
[⚠ 6 acessos vencem em 7 dias [exemplo]    ›]
[⚠ Workshop gravado sem venda há 60 dias   ›]
[⚠ Imersão lotada: 17 na espera [exemplo]  ›]
RECEITA POR SEMANA
[ ╱‾╲_╱‾‾╲__╱‾‾‾  (- - - 12 sem. antes)      ]
DE ONDE VEM A RECEITA
[ VIP ████████████ R$ 4.137  46% ]
[ Mentoria ████████ R$ 2.940 33% ]
[ E-book █████ R$ 1.863      21% ]  Ver produtos ›
[ Superfãs ███████ R$ 4.049 ] ...   Ver quem compra ›
O QUE SÓ O APP SABE
[ Vendas após publicação   22 · R$ 2.587 › ]
[ Vendas após evento       11 · R$ 1.147 › ]
[ VIP: R$ 4.137 · 104 de 186 ativos      › ]
PRÓXIMOS PASSOS
[💡 Oferecer a VIP a quem engaja   [Enviar]]
[💡 Recuperar pagantes             [Avisar]]
[💡 2ª turma da Imersão [ex.]    [Duplicar]]
```

**Aba Produtos (celular):**

```
[======= capa 16:7 (gradiente) ========]
 Comunidade VIP        Abre: Comunidade VIP
 ───────────────────────────────────────
 Preço   | Pedidos | Receita  | vs. antes
 R$ 197  |   21    | R$ 4,1 mil | +24%
 Ver compradores                       ›
...
EVENTOS PAGOS   Receita: valores de exemplo [exemplo]
[======= capa 16:10 ========]
 Imersão presencial [Presencial] [Lotado]
 Data 24/out | Ingresso R$ 350 | 40 | R$ 14 mil
```

**Desktop (coluna de 680 px, 12 colunas):**

```
|01-03      |04-06      |07-09      |10-12      |
[Receita    ][Compradores][Ticket    ][Por membro ]
[2+ produtos][Cancel.    ]
[ Precisa de atenção ─────────────────────────────]
[ Receita por semana ─────────────────────────────]
[ De onde vem ────────────────────────────────────]
[ O que só o app sabe ────────────────────────────]
[ Próximos passos ────────────────────────────────]
```

## 10. Especificação para desenvolvimento

**Estrutura de URL**, espelhando `apps/web/lib/owner-content-view.ts`, num arquivo novo `apps/web/lib/owner-finance-view.ts`:
- `?area=financeiro` mais:
  - `vista=produtos|quem-compra`;
  - `numero=receita|compradores|ticket|por-membro|recompra|cancelados`;
  - `atencao=pagantes-sumindo|vencendo`;
  - `produto=<id>`, `evento=<id>`, `faixa=<slug>`, `caminho=<id>`;
  - `compradores=1`, `membro=<id>`, `lista=<slug>`.
- **Tipo:** `OwnerFinanceView { tab: 'overview'|'products'|'buyers'; number; attention; productId; eventId; band; path; buyers: boolean; memberId; list }`, montado por lista permitida e com cada nível só valendo junto com os de cima.
- `TenantOwnerPanel.tsx:67-80` passa a repassar `finance`.

**Componentes a reaproveitar (caminho real):**
- de `packages/modules/dashboard/ui/`: `KpiCard`, `KpiGrid`, `BarList`, `LineChart`, `Collapsible`, `ActionCard`, `mergeBandsBelowFloor`, `isBelowPrivacyFloor`, `percentOf`, `sumOf`, `perItem`;
- `apps/web/components/dashboard/`: `PanelSection`, `PreviewAction`, `BackLink`, `ExamplePill`, `LegendStroke`;
- de `BandScopeCards.tsx`: `Cell`, `Linked`, `EventScopeCard`, `RevenueExampleNote`;
- `OwnerMemberDetail` e `OwnerMemberList`;
- `Chip` e `Card` de `@rede-social/ui`.

**Componentes novos:**
- `ProductCover` em `packages/modules/store/ui/` (avaliado: `ProductCard` não serve);
- `OwnerFinance*.tsx` divididos como no Conteúdo: `OwnerFinance`, `OwnerFinanceOverview`, `OwnerFinanceProducts`, `OwnerFinanceBuyers`, `OwnerFinanceProductDetail`.

**Dados esperados**, numa fixture nova `packages/modules/dashboard/fixtures/owner-finance.ts`. Só dados brutos, em centavos; os percentuais são calculados na interface:

```
products: { id, name, priceCents, coverAssetId: null, communityId: string|null,
            status, current: {orders, cents}, previous: {orders, cents},
            weeklyCents: number[12] }[]                         // EXISTE / CALCULAR
orders: { id, memberId, productId, cents, paidAt, status:'paid'|'revoked',
          bandBefore }[]  // fonte única: total, compradores, recompra, faixa e caminhos saem daqui
grants: { memberId, productId, date }[]                          // CALCULAR
weeklyCents: { current: number[12], previous: number[12] }       // CALCULAR
vipHoldersByBand: EngagementBands                                // CALCULAR (= communityEngagement c-vip)
eventSales: { eventId, orders, cents }[]                         // CALCULAR
contentSales: { distinctOrders, cents }                          // CALCULAR (vs BUSINESS)
neverBought: { memberIds }  ;  ebookNoVip: { memberIds }         // CALCULAR
expiringAccess7d / conversion / ticketCents / waitlist           // ReportValue, COLETAR
```

Os testes da fixture (como `tests/tenant-owner.test.ts`) têm de provar:
- `orders` soma 96 pedidos e R$ 8.940 e bate com `tenant-owner.ts:611-614` e `:479`;
- 81 compradores distintos;
- pedidos de VIP no roster ≤ 21;
- `contentSales` ≤ a soma de `BUSINESS`.

Corrigir também a base para `previous_30_days` em `tenant-owner.ts:297, 616`.

**Estados:**
- **Carregando:** não se aplica (servidor e fixture).
- **Vazio:** a frase de cada seção, conforme as fichas.
- **Erro:** id desconhecido na URL volta à aba (o mesmo comportamento do parser de Conteúdo).
- **Sem permissão:** a área é só do nível 4. Na versão real, com dados reais, `store_orders` só é lido por `admin_tenant` (`schema.ts:147, 189-193`). Será preciso decidir se o papel "dono" tem essa leitura.

**Critérios de aceite** (verificáveis sem ler a proposta):
1. `?area=financeiro` mostra 3 abas numa só fileira, e nenhuma outra fileira de escolha.
2. A Visão geral mostra 6 cartões. Tocar em "Receita" abre 96 pedidos, e "Voltar" retorna ao cartão.
3. "Precisa de atenção" aparece antes de "Receita por semana", e a linha da VIP abre 40 membros.
4. A aba Produtos mostra 4 cartões de produto com capa ou gradiente. O Workshop gravado mostra "Parado".
5. VIP → "Ver compradores" → um nome → informações do membro com a compra de R$ 197. "Voltar" retorna à lista de compradores.
6. Qualquer total de segmento com menos de 5 pedidos mostra "menos de 5 pedidos" e nenhum R$.
7. Todo valor de ingresso, vencimento, visita ou espera tem a pílula "exemplo"; os eventos têm uma só pílula por lista.
8. A soma das receitas por produto é igual à receita do cartão 1 (R$ 8.940).
9. No celular de 440 px não há rolagem horizontal, nem tabela, e a página funciona com JavaScript desligado.

---

## Limitações

- **Sem gateway de pagamento:** não há receita líquida, taxas, reembolso, chargeback, Pix ou cartão recusado, parcelamento, nem pedido pendente (a compra grava `paid` direto). Tudo o que Hotmart e Kiwify mostram nessa linha fica fora até existir provedor (`schema.ts:187`, que só aceita `provider in ('none')`).
- **MRR e churn** só fazem sentido se a decisão A for "assinatura". Hoje não há recorrência no esquema.
- **A associação conteúdo/evento → venda é correlação** (janela de 7 dias), não causa. O total precisa contar pedidos distintos, senão um pedido conta em várias publicações.
- **Conversão por produto, vencimento, ingressos e lista de espera** continuam fictícios (pílula), porque o app não os registra.
- **O link da publicação sai do Financeiro;** o "Voltar" não retorna ao Financeiro sem guardar a origem na URL.
- **Vários valores foram inventados por mim** para manter a coerência: compradores 81 e 75, cancelados 2, cortesias 5, 13 recompradores, 112 que nunca compraram, 58 de E-book sem VIP, caminhos 9 e 4, vendas pós-evento 11 / R$ 1.147, 22 pedidos distintos pós-publicação, as séries semanais e o preço de R$ 97 do Workshop. Eles precisam ser gerados a partir de uma lista única de pedidos na fixture, para os testes provarem as somas.
- **A janela "30 dias" contra o "mês anterior"** está inconsistente hoje nas fixtures e precisa ser corrigida junto.
- **O benchmark** se apoia parcialmente em fontes secundárias (Kiwify via Reportei, Skool via blogs), e não confirmei MRR/churn do Circle. Não testei os painéis por dentro.

**Fontes:**
- [Hotmart: relatórios e análises](https://help.hotmart.com/pt-br/article/115006453448/como-acompanho-meus-relatorios-e-analises-na-hotmart-)
- [Hotmart: Minhas análises](https://help.hotmart.com/pt-br/article/24363977355533/como-utilizar-o-minhas-analises-para-acompanhar-os-resultados-do-meu-negocio-)
- [Hotmart: chargeback](https://help.hotmart.com/pt-br/article/208294658/o-que-e-chargeback-e-como-posso-evita-lo-)
- [Reportei: relatórios da Hotmart](https://reportei.com/hotmart/)
- [Reportei: relatórios da Kiwify](https://reportei.com/relatorios-e-dashboards-da-kiwify/)
- [Circle: Analytics 3.0](https://circle.so/product-updates/introducing-analytics-3-0)
- [SkoolPrep: analytics do Skool](https://skoolprep.com/skool-analytics-community-owner)
- [Skool: post sobre metas de conversão](https://www.skool.com/the-visionary-vibe-8324/target-skool-conversion-rates-how-do-you-stack-up)
- [Patreon: painéis de insights](https://support.patreon.com/hc/en-us/articles/207346316)
- [Patreon: Earnings Insights](https://support.patreon.com/hc/en-us/articles/47114923757197-Earnings-Insights)
- [Stripe: métricas de assinaturas](https://docs.stripe.com/billing/subscriptions/view-metrics)
- [Stripe: analytics](https://docs.stripe.com/billing/subscriptions/analytics.md)
- [Uscreen: Stripe billing analytics](https://help.uscreen.tv/en/articles/8700446-stripe-billing-analytics)

**⚠️ NÃO FEITO**
- As 4 decisões (A–D) não foram validadas com o dono. Todas seguem como hipóteses rotuladas; basta uma resposta por decisão para fechar.
- Os valores inventados não foram conferidos por teste, porque a fixture `owner-finance.ts` não existe. Para fechar, é preciso implementar a fixture com a lista única de pedidos e os testes de soma.
- Não houve prova visual na maquete de 440 px, porque esta é só a especificação, sem código. Depende de implementar e capturar a tela.