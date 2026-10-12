# Quick 261012-qer: ajustes de fluxo nas faixas por comunidade (revisão da 261012-pkd)

Continuação da 261012-pkd (commits 7c1a60b9..79f756bf, branch `feat/painel-preview`, área Membros do painel do dono do cliente). Revisões: critic APROVADO sem achados; flow-critic APROVADO com 4 ajustes leves — fazer todos. Mesmas regras de sempre (dados fictícios, textos só no catálogo pt-BR, tokens, `@3xl`, rolagem só vertical, trava de produção intacta, Biome/fronteiras/guarda de literais verdes). Comentários e commits em inglês; tudo na tela em pt-BR. **Sem publicar na Vercel.** Ao terminar, religar o servidor local.

## Ajustes travados

- A-1 **"3 · 0%" engana** (`apps/web/components/dashboard/BandMembers.tsx:53`, `format.ts:19`): quando a contagem > 0 e o percentual arredondado dá 0, mostrar "menos de 1%" (chave nova no catálogo). A mini barra ganha uma largura mínima visível quando a contagem > 0 (`BandMembers.tsx:61`). Decisão do usuário (perguntada antes): aplicar.
- A-2 **"Recuperar quem está em risco" não segue o recorte** (`OwnerMembers.tsx:168`): com uma comunidade escolhida, o cartão usa os números daquela comunidade (em risco da comunidade e quantos deles têm notificação ativa — adicionar `withPush` por comunidade na fixture, coerente: ≤ em risco da comunidade). Em "Toda a base" continua 168 / 69. Teste de unidade da coerência.
- A-3 **Lista corta em 10 sem explicar** (`BandMembers.tsx:107-111`): no topo da lista aberta, a linha "Os 10 com atividade mais recente" (só quando a faixa tem mais de 10); no fim, ao lado de "e mais N membros", um "Ver todos" desativado (`PreviewAction`, mesmo padrão de `PanelSection.tsx:11-21`).
- A-4 **Faixa vazia** (`BandMembers.tsx:85-111`): faixa com 0 membros não abre um cartão em branco — mostrar a frase "Nenhum membro nesta faixa." (ou renderizar sem `<details>`; decisão do planejador, uma regra só). Teste de unidade/componente com contagem 0.

## Verificação

pnpm lint (inclui check-ui-literals), pnpm typecheck, pnpm test, pnpm boundaries, pnpm check:static-routes com o ambiente provisório (API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder). Suíte Playwright completa (parar SÓ o processo da porta 3000; nunca o Chrome), com asserções novas para A-1..A-3. Ao final religar: `cd "/Users/macos/Desktop/rede social/rede-social" && API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder nohup pnpm --filter @rede-social/web dev > /tmp/rede-dev.log 2>&1 &` e confirmar 200 em `/painel-preview/dono-do-cliente?area=membros&comunidade=eventos`.

## Pedidos novos do usuário (2026-10-12, enviados durante o planejamento — TRAVADOS, incluir neste mesmo plano)

- B-1 **Cartão do membro na lista de cada faixa** (`BandMembers.tsx`), conforme o desenho enviado pelo usuário: cada membro vira um cartão próprio — fundo branco (`bg-card`), cantos arredondados, sombra suave; à esquerda um **círculo de avatar** (por enquanto as **iniciais** do nome sobre a cor da marca — não usar foto de pessoa real; quando houver foto de perfil, ela substitui as iniciais); à direita o **nome em destaque** (maior, negrito, cor de texto principal escura) e, abaixo, uma informação por linha com **rótulo + valor**:
  - "Membro desde: set. de 2026"
  - "Última atividade: hoje às 22:40" (formato com hora: "hoje às HH:MM", "ontem às HH:MM", senão "há N dias"; a fixture precisa guardar data E hora da última atividade, coerente com as janelas das faixas; "hoje" = 2026-10-12)
  - "Comunidade que mais interage: Geral" (como hoje, inclusive nos recortes)
  - "Tempo médio diário: 35 min" — **não existe no app** (precisa de registro de sessões) → valor de exemplo por membro, com a pílula "exemplo" (padrão `ExamplePill`/`exampleBadge`), uma vez por lista ou por cartão — decisão do planejador, sem poluir.
  Cartões empilhados na vertical dentro da faixa aberta (sem rolagem lateral; texto quebra linha).
- B-2 **Só três filtros nas faixas de engajamento**: substituir os 5 chips atuais (Toda a base, Comunidade VIP, Geral, Iniciantes, Eventos) por **três abas iguais em uma fileira de três**, mesma largura, cobrindo a barra (mesmo padrão das abas de área, `grid grid-cols-3`): **Por membro | Por comunidade | Por evento**.
  - **Por membro** = a base toda (o recorte de hoje "Toda a base").
  - **Por comunidade** = aparece uma segunda linha de escolha com as comunidades (VIP, Geral, Iniciantes, Eventos); padrão = a primeira; as faixas e listas seguem a comunidade escolhida (o que já existe).
  - **Por evento** = aparece uma segunda linha com os eventos (os mesmos eventos do painel: próximos e passados recentes que já existem na fixture do nível 4); as faixas mostram a distribuição de engajamento de **quem se inscreveu naquele evento** (dado EXISTE: `event_attendances` × faixas; coerente com `attendanceByBand` que já existe), e cada faixa abre a lista desses membros.
  - Parâmetros por links com lista de valores permitidos (ex.: `recorte=membro|comunidade|evento` + `comunidade=…` / `evento=…`), valor inválido → Por membro; manter `area=membros` e a âncora `#faixas`. A-2 (cartão "Recuperar") segue o recorte também no modo evento (ou mostra a base com a ressalva — decisão do planejador, dizer no SUMMARY).
  - Atualizar o e2e e os testes de parse.

- B-3 **Tocar no cartão do membro abre os insights daquele membro** (pedido do usuário, 2026-10-12: "ao clicar no perfil da pessoa quero que o ADM consiga ver os insights daquele perfil"). O cartão de B-1 vira um link (mesma rota com parâmetro, ex.: `&membro=<id>`, lista de valores permitidos = ids do roster; inválido → volta à lista) que abre uma tela de detalhe do membro **no painel do dono do cliente (nível 4)**, com "Voltar" para a faixa/recorte de origem (âncora `#faixas`). Conteúdo, de cima para baixo:
  1. Cabeçalho: avatar (iniciais), nome em destaque, selo da faixa atual, "Membro desde", comunidade que mais interage.
  2. Números dos últimos 30 dias (grade de 2): dias ativos, curtidas, comentários, ações fortes; tempo médio diário e posts vistos com pílula "exemplo" (não existem no app).
  3. Evolução: faixa nos últimos 3 meses (ex.: ocasional → engajado; derivável das tabelas → sem pílula) e atividade por semana (12 semanas, `LineChart`).
  4. Onde interage: comunidades (`BarList`) e tipos de conteúdo que mais o engajam.
  5. Eventos: inscrições e presenças (passados e próximos).
  6. Compras: produtos/acessos, valor e acessos que vencem (vencimento = exemplo, a data nunca é gravada).
  7. Atendimento: conversas com o suporte (quantidade, última, tempo de resposta) — sem texto das mensagens.
  8. Sugestão de ação determinística conforme a faixa (ex.: em risco há 34 dias → "Convide para o próximo encontro"; botão desativado como os demais da prévia).
  Dados fictícios coerentes com o roster (faixa, datas, comunidade principal) e com os totais do painel; testes de coerência. Privacidade: registrar no README/SUMMARY que com dados reais o aviso de privacidade precisa informar que a gestão vê o comportamento individual. Painel do admin do cliente (nível 5) NÃO ganha a tela agora (não tem lista de membros) — registrar como pendência.
  Com B-3 o plano pode ter até 4 tarefas.
