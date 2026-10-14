# Quick 261013-uoi: correções das revisões da 261013-orf (Conteúdo e listas)

Continuação da 261013-orf (commits ab8a40cc..9340480e na branch `feat/painel-preview`, por cima das capas de Eventos da 261013-p31). Projeto em `/Users/macos/Desktop/rede social/rede-social`.

Resultado das revisões:
- **comportamento:** REPROVADO;
- **fluxo:** APROVADO com ressalvas.

Corrigir tudo o que está abaixo.

Regras de sempre:
- dados fictícios determinísticos;
- textos só no catálogo pt-BR;
- tokens;
- `@3xl`;
- rolagem só vertical;
- trava de produção intacta;
- Biome, fronteiras e guarda de literais verdes.

Comentários e commits em inglês. Tudo o que aparece na tela fica em pt-BR. Sem publicar. Plano com no máximo 3 tarefas.

## Decisão nova do orquestrador (substitui o E-03.1 da 261013-orf)

A regra "toda lista de pessoas tem pelo menos min(total, 10) pessoas" obrigou cada membro fictício a comentar demais:
- superfãs com 26 a 36 comentários em 30 dias;
- 13 comentários no mesmo minuto;
- 41 dos 72 membros com os insights alterados;
- 527 dos 840 comentários do canal concentrados em 72 dos 1.240 membros.

Isso é inverossímil e contraria a decisão de não mexer nos insights.

**A regra passa a ser:**
- toda lista de pessoas com número maior que 0 mostra **pelo menos 1** pessoa e **no máximo 10**;
- o resto aparece como "e mais N" na unidade da lista ("e mais 31 comentários").

O roster fictício é uma amostra da base, então é normal ele não cobrir o número inteiro. A lista pode dizer isso numa linha discreta, por exemplo: "Mostrando quem está na amostra de membros".

Atividade de cada membro: volta a números realistas, perto dos de 2f39aec6, com no máximo 2 comentários por dia:

| Faixa | Comentários em 30 dias |
|---|---|
| superfã | 6 a 12 |
| engajado | 3 a 8 |
| ocasional | 1 a 3 |
| novo | 0 a 3 |
| em risco / inativo | 0 |

Curtidas não mudam. As faixas dos membros não mudam. Os testes de coerência acompanham.

## Correções travadas

### Da revisão de comportamento

- C-1 (ALTA) **Insights dos membros alterados:** aplicar a decisão nova acima.
  - Onde: `owner-member-insights.ts:280-281`, que removeu `COMMENTS`, e `:312`.
  - Teste: os comentários de cada membro ficam dentro da faixa da tabela; no máximo 2 por dia; nenhuma lista de pessoas vazia com número maior que 0.
  - Comparar com 2f39aec6: `comments`/`strongActions` mudam pouco e de forma justificada no SUMMARY.
- C-2 (MÉDIA) **`LineChart` compartilhado:** o rótulo final ancorado à direita (`packages/modules/dashboard/ui/LineChart.tsx:125-126`) colou "set" e "out" no nível 1 (`/painel-preview/dono-da-plataforma`, "Clientes ativos por mês", 0,8 unidade entre eles a 360 px).
  - Correção: o rótulo final ancorado não pode encostar no anterior. Pule o rótulo anterior quando a distância for pequena, ou ancore só quando não houver colisão.
  - Teste: medir no nível 1 e no S12 do nível 4.
- C-3 (BAIXA) **op-04 com a espera errada:** o detalhe diz "1 sem resposta · o mais antigo há 9 h", mas a lista mostra "Comentou ontem às 12:35".
  - Onde: `owner-member-lists.ts:197-198`. Só respeita a espera quando ela é de 48 h ou mais.
  - Correção: a espera de todo comentário sem resposta bate com a data e a hora mostradas.
- C-4 (BAIXA) **SHAs do SUMMARY da 261013-orf:** o orquestrador corrige; não entra no plano.

### Da revisão de fluxo

- F-1 (ALTA) **Mesmo horário repetido:** "curtido hoje 22:40" aparece 13 vezes no mesmo membro (`owner-member-lists.ts:265-266`, `moment` copia `lastActive`).
  - Só a ação mais recente do dia leva o horário de `lastActive`. As outras recebem horários anteriores e determinísticos.
  - Na atribuição (`assignRosterInteractions`, `owner-member-lists.ts:~150`), escolher o dia ativo `<= age` com menos ações, e não sempre o mais recente.
- F-2 (ALTA) **Comentários demais:** é o mesmo problema da C-1.
- F-3 (MÉDIA) **Cartão compacto quebra em vídeo horizontal (16:9):** a 360 px, a miniatura fica com 8rem, o título corta, a meta quebra e o ícone de compartilhamentos cai de linha (`CoverThumb.tsx:274-276, 309-314`; `OwnerContentPostCard.tsx`).
  - Correção: coluna de largura fixa para a miniatura no modo cartão (cerca de 4,5rem). A altura sai da proporção, limitada a 7rem. O texto tem sempre a mesma largura.
  - E2e em 360/390/430: nos cartões de `?area=conteudo&vista=tipos&tipo=video`, o título ocupa no máximo 2 linhas e os 4 números ficam numa linha só.
- F-4 (BAIXA) **"Quando" em dois formatos:** "curtido hoje 22:40" e "hoje às 22:40" convivem.
  - Correção: pôr "às" na chave global `moment` (`dashboard.json:90`) e fazer `personMoment` reaproveitar a mesma chave.
- F-5 (BAIXA) **Miniatura de story:** hoje é igual à de vídeo, quadrada e com ▶.
  - Correção: story com `rounded-full` e anel da marca (padrão do Instagram), mais um ícone próprio.
- F-6 (BAIXA) **Variação de tom quase invisível:** aumentar o contraste entre os 5 tons, por exemplo girando o ângulo do `linear-gradient` entre `--brand-primary` e `--brand-secondary` conforme a publicação. Só tokens da marca.
- F-7 (BAIXA) **Tela "Comentários sem resposta":** a publicação no topo vira link para o detalhe dela (`&post=<id>`), que mostra o desempenho. "Voltar" continua indo para a linha de atenção.

## Verificação

Com o ambiente provisório (API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder), rodar:
- pnpm lint;
- pnpm typecheck;
- pnpm test;
- pnpm boundaries;
- pnpm check:static-routes.

Depois, a suíte Playwright completa, num servidor próprio em outra porta se a execução for numa cópia separada. Nunca pare a 3000 nem o Chrome.

Capturas em largura de celular, em `screens/` (não versionar):
- nível 4, curtidas de om-13 (horários variados);
- tipo vídeo com cartões compactos a 360 px;
- `membro?lista=stories`;
- nível 1, gráfico "Clientes ativos por mês".
