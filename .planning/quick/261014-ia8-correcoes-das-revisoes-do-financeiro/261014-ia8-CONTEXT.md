# Quick 261014-ia8: correções das revisões do Financeiro (261014-dwc)

Continuação da 261014-dwc (commits bc4dfeca..797e99af, branch `feat/painel-preview`, HEAD 797e99af). Projeto em `/Users/macos/Desktop/rede social/rede-social`.

As duas revisões deram REPROVADO. Corrigir tudo o que está abaixo. Regras de sempre:
- dados fictícios determinísticos;
- textos só no catálogo pt-BR, **sem nenhuma palavra em inglês na tela**;
- tokens, `@3xl`, rolagem só vertical;
- trava de produção intacta;
- Biome, fronteiras e guarda de literais verdes.

Comentários e commits em inglês; tudo o que aparece na tela, em pt-BR. Sem publicar. Plano com no máximo 3 tarefas.

## Correções travadas

### Da revisão de comportamento
- **C-1 (ALTA) Variação de "Pedidos" nos níveis 5 e 6.** A contagem saiu da lista única (45), mas a variação ficou fixa no código: "2 a menos, piorou" (`packages/modules/dashboard/fixtures/tenant-panels.ts:125` e `:326`). A mesma lista dá 29 pedidos nos 7 dias anteriores.
  - Correção: calcular a variação pela lista (+16, melhorou).
  - Teste que fixe a variação.
  - Procurar outras variações fixas que deveriam sair da lista única e corrigir do mesmo jeito.
- **C-2 (MÉDIA) "Acessos que vencem" diz "e mais 6 membros" sem nenhum cartão** (`OwnerFinancePeople.tsx:239-250`, `:281-290`). Correção na F-2.

### Da revisão de fluxo (do que o usuário nota primeiro para o último)
- **F-1 (ALTA) Beco sem saída.** "Imersão presencial: vagas esgotadas e 17 na lista de espera" leva a um cartão de evento que não fala em esgotado nem em espera e não abre nada (`OwnerFinanceOverview.tsx:291-292`; `OwnerFinanceProducts.tsx:169-178` com `href={null}`).
  - O cartão de evento pago ganha a pílula "Vagas esgotadas · 17 na espera" quando for o caso.
  - O item de atenção, e o cartão, levam a um destino que mostra a espera. Opção recomendada: a área Eventos, na âncora da lista de espera daquele evento.
- **F-2 (ALTA) Lista vazia com "e mais N".** Quando a lista não tem nenhuma pessoa na amostra, não usar `PeopleCards`. Mostrar uma frase de lista vazia honesta, por exemplo "Nenhum destes membros está na amostra da prévia. O vencimento ainda não é gravado.", e manter o cartão de ação.
  - Vale para toda lista de pessoas do Financeiro e de Conteúdo que use o mesmo componente (`OwnerContentPeople.tsx:94-101`): "e mais N" nunca aparece sem cartões antes.
- **F-3 (ALTA, visual) Valor quebrado a 360 px.** No detalhe do produto, "R$ 4.096,0 / 0" (`OwnerFinanceProductDetail.tsx:107`). Correção: usar o formato inteiro e conferir todo valor em destaque a 360 px.
- **F-4 (MÉDIA) Primária e secundária sem definição na Visão geral.** Uma frase logo abaixo do título dos números: "Primária: a primeira compra de cada membro, a que dá acesso ao app. Secundária: tudo o que ele compra depois, inclusive a renovação."
- **F-5 (MÉDIA) Nota de Ofertas contradiz a regra** (`dashboard.json:981`). Novo texto: "O mesmo produto é vendido em ofertas diferentes: como entrada (a primeira compra, que dá acesso ao app) ou como adicional (para quem já é membro)."
- **F-6 (MÉDIA, visual) Barras quase invisíveis a 360 px** em "De onde vem a receita", por produto e por faixa (`OwnerFinanceOverview.tsx:411-451`).
  - Valor compacto e pedidos/percentual numa segunda linha, para a barra ocupar a largura.
  - E2e: a barra do líder tem pelo menos 40% da largura do cartão a 360 px.
- **F-7 (MÉDIA, visual) Oito capas iguais parecem espaço vazio.**
  - Produtos e eventos pagos usam a capa variada da `CoverThumb`: tom com profundidade por id, mais um ícone próprio por produto (comunidade, mentoria, e-book, workshop gravado) e por formato de evento.
  - Nos cartões da lista, uma capa mais baixa (faixa) para o cartão não ser 40% degradê.
  - Manter só tokens da marca.
- **F-8 (BAIXA) Três formatos de dinheiro na mesma área.**
  - Números de destaque e totais em reais inteiros ("R$ 8.940").
  - Barras e cartões em compacto ("R$ 4,1 mil").
  - Centavos só em pedidos individuais.
  - A regra vale para toda a área.
- **F-9 (BAIXA) A receita total não tem destaque.**
  - Um cartão principal, acima dos seis números, com o total do período, a variação e uma barra empilhada primária × secundária (com os dois valores).
  - O aviso "valor registrado, não dinheiro recebido" fica nesse cartão.
- **F-10 (BAIXA) "0 p.p." é jargão.** Nesta área: "igual aos 30 dias antes", ou "N pontos percentuais a mais/a menos".
- **F-11 (BAIXA) Concordância:** `=0 {nenhuma entrada}` e `=0 {nenhum adicional}` (`dashboard.json:1156`), e equivalentes.
- **F-12 (BAIXA) Título:** "Números do mês" agrupa números acumulados. Trocar o título por "Números" e marcar "desde a abertura" nos dois acumulados (recompra e receita por membro na vida toda).

### Palavras em inglês na tela, achadas fora desta mudança (corrigir também)
- **E-1** No seletor da prévia: "Plataforma (white label)" → "Plataforma (marca branca)" e "Cliente (tenant)" → "Cliente" (`dashboard.json:21-22`).
- **E-2** Tipo de publicação "Link" → **"Página externa"** (`dashboard.json:331`, `:679` e onde mais aparecer, inclusive na área Conteúdo). "por tipo de post" → "por tipo de publicação" (`:591`). Varrer o catálogo inteiro atrás de "post", "link", "story/stories", "reel", "feed", "white label", "tenant", "insights", "ticket", "upsell":
  - trocar o que tiver equivalente natural;
  - "story/stories" e "reel" ficam, porque são nomes de recurso do app que o usuário já usa;
  - listar no SUMMARY o que ficou e por quê.
- **E-3** O selo "30 dias" no cabeçalho do painel parece um botão. Deixar visualmente claro que é só uma indicação do período: texto, sem cara de botão.

## Verificação
Com o ambiente provisório (API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder), rodar:
- pnpm lint;
- pnpm typecheck;
- pnpm test;
- pnpm boundaries;
- pnpm check:static-routes;
- a suíte Playwright completa, num servidor próprio em outra porta e reiniciado a cada mudança no catálogo.

Nunca pare a 3000 nem o Chrome.

Capturas em largura de celular (360 e 390), em `screens/` (não versionar):
- Visão geral do Financeiro;
- Produtos;
- detalhe da VIP;
- "Acessos que vencem";
- seletor da prévia.
