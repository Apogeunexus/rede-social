# Quick 261013-orf: capa da publicação nas listas de curtidas, comentários, salvamentos e afins

Projeto em `/Users/macos/Desktop/rede social/rede-social` (branch `feat/painel-preview`, HEAD 387a7fc4). Pedido do usuário (2026-10-13), sobre `http://localhost:3000/painel-preview/membro?lista=curtidas#lista`: "nas páginas que contêm lista — lista de curtidas, comentários, salvamentos e afins — preciso que a imagem da capa apareça para ficar menos seco". Mesmas regras de sempre (dados fictícios determinísticos, textos só no catálogo pt-BR, tokens, `@3xl`, rolagem só vertical, trava de produção intacta, Biome/fronteiras/guarda de literais verdes). Comentários e commits em inglês; tudo na tela em pt-BR. Sem publicar. Plano com no máximo 2 tarefas.

## Decisões travadas

- D-01 **Onde:** toda lista cujas linhas são publicações (post, vídeo/reel, story):
  - nível 7 (`apps/web/components/dashboard/MemberActivityList.tsx`, todas as `?lista=`: curtidas, comentarios, salvamentos, compartilhamentos, posts-vistos, videos, stories);
  - nível 4, listas do membro (`OwnerMemberList.tsx`: curtidas, comentários, ações fortes, posts vistos; a lista de Dias ativos não é de publicações, então fica como está, a menos que cada dia mostre uma publicação);
  - na área Conteúdo, a lista "Interações", se as linhas forem publicações.
  - As listas de **pessoas** (quem curtiu etc.) já têm avatar e não mudam.
- D-02 **Como:** uma miniatura quadrada à esquerda de cada linha, com cantos arredondados, de uns 56 px (`size-14`), estilo "Sua atividade" do Instagram. O texto quebra linha à direita e nunca há rolagem lateral a 360 px. A miniatura é a **mesma capa** dos cartões de Conteúdo (`ContentCover` em `OwnerContentPostCard.tsx:68`): o fundo da marca (`--brand-gradient`) com o ícone do tipo. No vídeo vai também a duração em selo pequeno; no story, o anel ou o ícone de story. Publicação de texto ganha uma miniatura com o ícone de texto, para a coluna não ficar desalinhada. Para não ficarem todas iguais e secas, **variar o tom do degradê por publicação** de forma determinística (por exemplo, girar o ângulo/posição do degradê ou alternar primária/secundária da marca a partir do id), sempre só com tokens da marca. Sem foto real: quando os dados reais forem ligados, a miniatura vira a mídia do post (`MediaImage`). Registrar isso no README do módulo.
- D-03 **Dado:** as listas precisam saber o tipo de cada publicação. Se `PostRef` (`packages/modules/dashboard/fixtures/member-lists.ts:21`) não tem o tipo, acrescentar de forma determinística e coerente. No nível 4, usar o tipo dos 61 posts de `owner-posts.ts`/`owner-content.ts`, que já existe. Teste de unidade da coerência (cada linha tem um tipo válido; vídeos têm duração).
- D-04 A miniatura é decorativa (`aria-hidden`). O nome acessível da linha continua sendo o texto.

## Verificação

pnpm lint (inclui check-ui-literals), pnpm typecheck, pnpm test, pnpm boundaries, pnpm check:static-routes, todos com o ambiente provisório (API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder).

E2e das listas:
- cada lista de publicações mostra uma miniatura por linha;
- sem rolagem lateral em 360/390/430 px e dentro do iPhone.

Regras para o e2e:
- O servidor da porta 3000 serve o checkout principal. Se a execução acontecer numa cópia separada, use um servidor próprio em outra porta.
- Nunca pare o Chrome. Na 3000, pare só o processo que escuta a porta: `lsof -nP -iTCP:3000 -sTCP:LISTEN -t`.

Capturas em largura de celular, salvas em `screens/` (não versionar):
- nível 7, curtidas;
- nível 7, vídeos;
- nível 4, curtidas de um membro.

Ao final:
- religue o servidor da 3000 com o comando de sempre;
- confirme 200 em `/painel-preview/membro?lista=curtidas`.

## Pedidos novos do usuário (2026-10-13, durante o planejamento — TRAVADOS, entram neste mesmo plano; até 4 tarefas)

- E-01 **Cartão de publicação compacto** (pedido do usuário, com print do cartão grande de vídeo: "ao invés de estar grande assim, eu quero uma miniatura e os dados de engajamento da publicação ao lado, em um card menor; se a pessoa apertar, consegue assistir e ver o desempenho"). Em Melhores publicações, Publicações e nas publicações de um tipo: cartão em linha, com a miniatura à esquerda (a mesma `CoverThumb` da D-02, um pouco maior, ~6–7rem de altura, proporção original) e, à direita, a legenda em 2 linhas, meta (data · comunidade · tipo) e os 4 números (curtidas, comentários, salvamentos, compartilhamentos) em linha compacta. Tocar abre o detalhe. No detalhe, a capa continua grande, mas as laterais de mídia vertical deixam de ser cinza (fundo com o mesmo degradê da marca, escurecido/desfocado), com o ▶ como "assistir". Acabam as faixas cinzas.
- E-02 **"Precisa de atenção" abre os comentários a responder** (pedido do usuário, com print do bloco): tocar numa linha abre uma tela com a **miniatura da publicação** + legenda e, abaixo, **os comentários sem resposta**: nome do membro + faixa (P1 já permite nome no nível 4), **o texto do comentário** (fictício, determinístico, em pt-BR natural; isto substitui a decisão PD "sem texto de comentário" da 261013-h51) e há quanto tempo espera, do mais antigo para o mais novo, com "Responder" desativado (prévia). "Voltar" para a Visão geral na âncora da linha. A miniatura da publicação também entra na própria linha do bloco. A contagem bate com o número da linha ("9 comentários sem resposta" → 9 comentários).
- E-03 **Achados do flow-critic da 261013-h51 (REPROVADO) — corrigir todos:**
  1. ALTA: 54 das 244 listas "Quem curtiu/comentou/salvou/compartilhou" abrem vazias com número > 0 (ex.: `&vista=publicacoes&post=op-41&quem=comentarios`). A fixture tem de garantir `pessoas >= min(total, 10)` em todo post × quem (completar com membros do roster de forma coerente com `owner-member-lists.ts`); teste de unidade com isso e e2e: toda lista com contagem > 0 tem ao menos um cartão.
  2. ALTA: "mais recentes primeiro" sem mostrar quando. Nas listas de pessoas de Conteúdo, o cartão mostra quando a pessoa fez ("Curtiu há 3 dias", "Comentou hoje às 22:40", o `when` já existe em `ContentPerson`); em comentários, dizer "sem resposta primeiro, depois os mais recentes".
  3. MÉDIA: "Quem interage, por faixa": mostrar só as faixas com interação, com "41 membros · 43% da faixa" e a mini barra de Membros (reusar `BandSummary`); Em risco e Inativos viram uma linha estática sem seta ("ninguém curtiu nem comentou em 30 dias, é o que define essas faixas"). Dentro de uma faixa, tirar a linha "Faixa:" redundante do cartão.
  4. MÉDIA: alcance por faixa no detalhe mostra Inativos 419 — contradiz a definição. Inativos ≈ 0 e Em risco baixo na fixture, com teste de coerência.
  5. MÉDIA: eixo da retenção só com 0% e 50% → rotular em tempo do vídeo (0:00 · 0:20 · 0:41).
  6. MÉDIA: "Inscrições em eventos até 7 dias depois / Workshop · 01/10: 11" → "Inscritos em eventos nos 7 dias seguintes" e "Workshop, 01/10: 11 inscritos".
  7. BAIXA: "e mais N membros" em listas de comentários usa o total de ações → usar a unidade certa ou contar pessoas.
  8. BAIXA: "0 compartilhamento" → `=0 {nenhum compartilhamento}` (e equivalentes) nas chaves de contagem.
  9. BAIXA: padronizar "por publicação" (não "por post") na tela; juntar as duas notas de "exemplo" empilhadas no tipo aberto numa frase.
  10. BAIXA: âncora `post-{id}` pode repetir entre "Precisa de atenção" e "Melhores publicações" → prefixar a da atenção e o "Voltar" usar o prefixo.
  11. BAIXA (critic): a mensagem do commit 387a7fc4 diz "Not yet verified" — já foi verificado pelo critic; registrar no SUMMARY (não reescrever histórico).

## Decisão do orquestrador sobre o teto do E-03.1 (2026-10-13)

Aceito o teto: op-01, op-02, op-03 e os-01 (publicações de hoje e de ontem) mostram todas as pessoas que puderam agir, mesmo que sejam menos de 10. É realista: há pouca gente ativa desde a publicação. A regra que não pode falhar é outra: nenhuma lista com número acima de 0 abre vazia. Os insights dos membros fictícios não mudam.
