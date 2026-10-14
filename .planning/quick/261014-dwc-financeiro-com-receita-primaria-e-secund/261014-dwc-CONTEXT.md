# Quick 261014-dwc: Financeiro com receita primária e secundária, em três abas

O projeto fica em `/Users/macos/Desktop/rede social/rede-social`, branch `feat/painel-preview`, HEAD 986a7de6. A tela é o painel do dono do cliente (nível 4), área **Financeiro** (`/painel-preview/dono-do-cliente?area=financeiro`). Hoje ela é montada em `apps/web/components/dashboard/OwnerFinance.tsx`.

A referência completa é `.planning/research/FINANCEIRO-PROPOSTA.md`. Leia também a seção final, "Decisão do usuário (2026-10-14): receita primária e receita secundária". **Onde a proposta e este CONTEXT divergirem, vale este CONTEXT.**

O usuário aprovou com "execute" em 2026-10-14, depois de ver as recomendações.

Regras de sempre:
- dados fictícios determinísticos;
- textos só no catálogo pt-BR;
- tokens;
- `@3xl`;
- rolagem só vertical;
- maquete do iPhone;
- sem JS no cliente;
- trava de produção intacta;
- Biome, fronteiras e guarda de literais verdes.

Comentários e commits em inglês; tudo o que aparece na tela fica em pt-BR. **Nada de palavras em inglês na tela:** nunca "upsell", "ticket", "churn" ou "MRR". Os equivalentes são "venda adicional", "valor médio", "cancelamentos" e "receita recorrente". Sem publicar.

Plano com até 5 tarefas.

## Decisões travadas

- **D-01 Mesmo modelo das áreas Membros e Conteúdo.**
  - Uma fileira de três abas iguais (`grid grid-cols-3`): **Visão geral | Produtos | Quem compra**.
  - **Nenhuma segunda linha de escolha** e **nenhum seletor de período**: são 30 dias contra os 30 anteriores.
  - A cascata é feita por links com parâmetro e lista de valores permitidos. Um parâmetro inválido cai um nível acima, nunca dá erro.
  - Cada passo tem um "Voltar" que leva ao passo anterior exato.
  - Siga o padrão de `apps/web/lib/owner-content-view.ts`, num arquivo novo `owner-finance-view.ts`.
- **D-02 Receita primária × secundária** (decisão do usuário):
  - **Primária** é a primeira compra paga de cada membro, a que dá acesso ao app.
  - **Secundária** é toda compra paga depois da primeira (venda adicional), **inclusive renovação**.
  - A classificação é **por pedido, não por produto**. O mesmo produto pode ser vendido como entrada ou como adicional, com **ofertas** diferentes: composição e preço próprios.
  - Todo membro tem uma compra primária, datada da entrada (`joined_at`). Os 96 "Novos" do mês são as 96 compras primárias do mês.
  - Os números já mostrados em outras áreas têm de continuar coerentes:
    - compras/compradores nos insights do membro (`owner-member-insights.ts`);
    - "Compras" e "vendas até 7 dias depois" em Conteúdo (`owner-content.ts`, `BUSINESS`);
    - a Visão geral do painel.
  - Se algum precisar mudar, mude de forma coerente e diga no SUMMARY.
  - **A fixture nova sai de uma lista única de pedidos**, e os totais são calculados a partir dela, com testes de soma.
- **D-03 Acesso por prazo:** a compra primária dá acesso por 1 ano. A renovação conta como receita secundária. Não existe assinatura mensal. "Acessos que vencem" usa a data da compra + 365 dias, como já faz `owner-member-insights.ts:164`, e continua marcado "exemplo", porque o vencimento não é gravado.
- **D-04 Ingressos fora do total:** a receita de eventos pagos não entra na receita total. Ela aparece numa seção própria dentro de Produtos, marcada "exemplo", com uma pílula por lista. Reaproveite o `EventCard` com capa 16:10 da 261013-p31.
- **D-05 Cancelado** é o pedido revogado pelo administrador. Ele não entra na receita.
- **D-06 Mínimo de 5 pedidos** em totais por grupo (faixa, publicação, evento, cancelados). Abaixo disso, mostrar "menos de 5 pedidos", sem valor. Listas nominais de compradores mostram nome e valor, como já acontece no nível 4.
- **D-07 Visão geral, nesta ordem:**
  1. Seis números do mês, cada um abrindo a sua lista:
     - **Receita primária**, com entradas e valor médio de entrada;
     - **Receita secundária**, com compras adicionais;
     - **Parte da secundária no total**;
     - **Membros que já compraram de novo** (% da base);
     - **Tempo médio até a segunda compra**;
     - **Receita por membro na vida toda**.
     
     Abaixo dos seis números, uma linha com a receita total registrada e o aviso de que ainda não há sistema de pagamento ("valor registrado, não dinheiro recebido").
  2. **Precisa de atenção:** pagantes da VIP sumindo, acessos que vencem em 7 dias (exemplo), produto sem venda há 60 dias, evento lotado com espera (exemplo). Cada linha abre a lista correspondente.
  3. **Receita por semana:** 12 semanas, com primária e secundária, e as 12 semanas anteriores tracejadas.
  4. **De onde vem a receita:** por produto e por faixa.
  5. **O que só o app sabe:** vendas depois de publicação ou evento (associação, não causa), e receita da VIP comparada com o uso da comunidade.
  6. **Próximos passos:** 3 ações desativadas, como no resto da prévia.
- **D-08 Produtos:**
  - Cartões de produto com capa (proporção 16:7 do `CommunityCover`, fallback de degradê). Cada cartão mostra:
    - preço;
    - vendas como entrada e como adicional;
    - receita;
    - comparação com o período anterior.
  - Produto parado ganha a pílula "Parado".
  - Tocar no produto abre o detalhe:
    - números;
    - receita por semana;
    - compradores por faixa;
    - **as ofertas** (cada uma com composição, preço, tipo entrada/adicional, pedidos e receita);
    - publicações que venderam o produto.
  - Oferta → compradores → membro (`OwnerMemberDetail`).
  - Abaixo dos produtos, a seção de eventos pagos (D-04).
- **D-09 Quem compra:**
  - Receita por faixa: `Collapsible` por faixa, no mesmo estilo de "Quem interage". Ao abrir, aparecem os compradores (cartões de membro), e cada um leva ao membro.
  - **Escada de compra:**
    - oferta de entrada → próxima compra;
    - quantos fizeram cada caminho;
    - tempo médio de cada caminho;
    - caminhos com menos de 5 pessoas agrupados em "Outros caminhos".
  - **Entraram e nunca compraram de novo**, por faixa: lista que leva ao membro, mais uma ação sugerida.
- **D-10 Itens de apoio:**
  - Corrigir a base de comparação do financeiro para `previous_30_days`. Hoje ela está em `previous_month`, em `tenant-owner.ts`.
  - Corrigir a data do evento "Encontro mensal" (u1, `tenant-owner.ts`, 2026-10-12, que já passou) para uma data futura coerente. Os números de Eventos não mudam.
- **D-11 Privacidade:** nomes de membros aparecem só no nível 4. Os níveis 1 a 3 continuam só com agregados. Registre no README do módulo.

## Verificação

Rode com o ambiente provisório (API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder):
- pnpm lint;
- pnpm typecheck;
- pnpm test;
- pnpm boundaries;
- pnpm check:static-routes.

Depois, a suíte Playwright completa.

Servidor:
- Numa cópia separada, use um servidor próprio em outra porta e reinicie esse servidor a cada mudança no catálogo.
- Nunca pare a 3000 nem o Chrome.

Asserções novas no e2e:
- uma fileira de três abas;
- primária + secundária = total;
- cascata produto → oferta → comprador → membro;
- números clicáveis com contagem igual;
- mínimo de 5 pedidos;
- URLs forjadas;
- sem rolagem lateral em 360/390/430;
- dentro do iPhone.

Capturas em largura de celular, em `screens/` (não versionar):
- Visão geral;
- Produtos;
- detalhe de um produto com ofertas;
- Quem compra com a escada.
