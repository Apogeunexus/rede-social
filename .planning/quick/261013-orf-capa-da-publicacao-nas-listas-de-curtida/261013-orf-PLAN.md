---
phase: quick-261013-orf
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/modules/dashboard/fixtures/member-lists.ts
  - packages/modules/dashboard/fixtures/owner-member-insights.ts
  - packages/modules/dashboard/fixtures/owner-member-lists.ts
  - packages/modules/dashboard/fixtures/owner-content.ts
  - packages/modules/dashboard/fixtures/tenant-owner.ts
  - packages/modules/dashboard/fixtures/index.ts
  - packages/modules/dashboard/tests/member-lists.test.ts
  - packages/modules/dashboard/tests/owner-member-lists.test.ts
  - packages/modules/dashboard/tests/owner-member-insights.test.ts
  - packages/modules/dashboard/tests/owner-content.test.ts
  - packages/modules/dashboard/README.md
  - apps/web/lib/owner-content-view.ts
  - apps/web/lib/owner-content-view.test.ts
  - apps/web/components/dashboard/CoverThumb.tsx
  - apps/web/components/dashboard/CoverThumb.test.tsx
  - apps/web/components/dashboard/OwnerContentPostCard.tsx
  - apps/web/components/dashboard/MemberActivityList.tsx
  - apps/web/components/dashboard/OwnerMemberList.tsx
  - apps/web/components/dashboard/OwnerMemberList.test.tsx
  - apps/web/components/dashboard/OwnerContentPeople.tsx
  - apps/web/components/dashboard/OwnerContentOverview.tsx
  - apps/web/components/dashboard/OwnerContentTypes.tsx
  - apps/web/components/dashboard/OwnerContentPostDetail.tsx
  - apps/web/components/dashboard/OwnerContent.tsx
  - apps/web/components/dashboard/OwnerContentReplies.tsx
  - apps/web/components/dashboard/OwnerContentReplies.test.tsx
  - apps/web/components/dashboard/BandMembers.tsx
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, PWA-03, MOD-02, UI-03]
tags: [dashboard, preview, member-lists, owner-member-lists, content, thumbnail, compact-card, unanswered-comments, pt-BR]

estimate:
  tokens: 320000
  raw_tokens: 320000
  tasks: 4
  confidence: low

must_haves:
  truths:
    - "D-01/D-02 nível 7: nas 7 listas de `/painel-preview/membro?lista=` cada linha tem uma miniatura quadrada de 56 px (`size-14`, `rounded-lg`) à esquerda, com o `--brand-gradient` e o ícone do tipo; vídeo/reel com a duração (a primeira linha de Vídeos lê 10:12), story com o anel da marca, texto com o ícone de texto."
    - "D-01 nível 4: Curtidas, Comentários, Ações fortes e Posts vistos de um membro (vindos de Membros ou de Conteúdo) têm uma miniatura por linha (check-in = ingresso, pedido = sacola); Dias ativos não. Em Conteúdo, cada linha de Interações e de Precisa de atenção mostra a miniatura da publicação."
    - "D-02/D-04: um só mapa de ícones e um só estilo (`COVER_ICON`, `coverStyle`) em `CoverThumb` e `ContentCover`; o tom varia por publicação de forma determinística (5 posições do próprio `var(--brand-gradient)`), sem cor nova; toda miniatura é `aria-hidden` e o nome acessível de cada linha continua sendo o texto."
    - "D-03: cada post do nível 7 tem `kind` e `durationSeconds` só nos vídeos (23 vídeos, 16 textos, 7 carrosséis, 7 fotos, 7 links), coerentes com a lista de vídeos (11 pares com a mesma duração); no nível 4 todo post listado resolve em `ownerContentItem` com tipo de feed e duração só em vídeo — com teste de unidade."
    - "E-01: Melhores publicações, Publicações, as publicações de um tipo e as listas de Taxa/Visualizações/Alcance usam o cartão compacto: miniatura `CoverThumb` de ~7rem de altura na proporção original à esquerda e, à direita, a legenda em 2 linhas, a meta e os 4 números em linha; o cartão inteiro abre o detalhe. No detalhe a capa segue grande, as laterais são o mesmo degradê escurecido (nenhuma faixa cinza) e vídeo/story têm o ▶ redondo como botão desativado \"Assistir\"."
    - "E-02: tocar numa linha de Precisa de atenção abre `?area=conteudo&responder=<id>`: miniatura + legenda, a mesma linha de contagem da Visão geral e exatamente esse número de comentários sem resposta, do mais antigo ao mais novo, cada um com nome, faixa, o texto do comentário (fictício, pt-BR) e \"Comentou há …\" (o primeiro bate com \"o mais antigo há …\"), e \"Responder\" desativado; Voltar leva a `?area=conteudo#atencao-<id>`. `responder` fora da lista de atenção cai na Visão geral."
    - "E-03.1: toda lista Quem curtiu/comentou/salvou/compartilhou tem pelo menos min(total, 10) pessoas, exceto onde o roster não tem esse tanto de membros ativos desde a publicação (op-01, op-02, op-03 e os-01: o teto é o número desses membros, provado em teste); nenhuma lista com número > 0 abre vazia (unidade e e2e); os comentários de cada membro nos insights são exatamente os mesmos fatos."
    - "E-03.2..10: cartões de pessoas de Conteúdo dizem quando a pessoa fez (\"Curtiu há 3 dias\"); comentários dizem \"sem resposta primeiro, depois os mais recentes\"; Quem interage só abre faixas com interação (\"41 membros · 43% da faixa\" + mini barra) e Em risco/Inativos viram uma linha estática; dentro de uma faixa o cartão não repete \"Faixa:\"; alcance por faixa com Inativos 0 e Em risco ≤ 10%; eixo da retenção em tempo do vídeo (0:00 · 0:20 · 0:41); \"Inscritos em eventos nos 7 dias seguintes\" e \"Workshop, 01/10: 11 inscritos\"; \"e mais N\" na unidade da lista; `=0` (\"nenhum compartilhamento\"); \"por publicação\" em toda a tela; uma só nota de exemplo no tipo aberto; âncoras `post-`/`atencao-` sem repetição."
    - "Sem rolagem lateral em 360/390/430 px nem dentro do iPhone a 1440×900 em todas as telas novas ou alteradas."
    - "Gates verdes com o ambiente provisório: pnpm lint (com check-ui-literals), typecheck, test, boundaries, check:static-routes e a suíte Playwright do preview inteira; trava de produção sem diff desde 387a7fc4; 5 capturas em `screens/` (não versionadas); 200 em `/painel-preview/membro?lista=curtidas`; README atualizado; SUMMARY registra E-03.11. Sem push, sem publicar."
  artifacts:
    - path: apps/web/components/dashboard/CoverThumb.tsx
      provides: "CoverThumb (linha 56 px e cartão ~7rem na proporção), COVER_ICON, coverTone, coverStyle"
      contains: "export function CoverThumb"
    - path: packages/modules/dashboard/fixtures/owner-member-lists.ts
      provides: "atribuição global e determinística de curtidas e comentários do roster que cobre min(total, 10) por publicação"
      contains: "export function assignRosterInteractions"
    - path: packages/modules/dashboard/fixtures/owner-content.ts
      provides: "ownerContentUnanswered (comentários sem resposta com texto), alcance sem Inativos"
      contains: "export function ownerContentUnanswered"
    - path: apps/web/components/dashboard/OwnerContentReplies.tsx
      provides: "tela dos comentários a responder (E-02)"
      contains: "export function OwnerContentReplies"
    - path: apps/web/lib/owner-content-view.ts
      provides: "parâmetro `responder` validado contra a lista de atenção e âncora `atencao-`"
      contains: "contentAttentionAnchor"
    - path: apps/web/components/dashboard/OwnerContentPostCard.tsx
      provides: "cartão compacto e capa do detalhe sem faixas cinzas"
      contains: "CoverThumb"
  key_links:
    - from: packages/modules/dashboard/fixtures/owner-member-insights.ts
      to: packages/modules/dashboard/fixtures/owner-member-lists.ts
      via: "os insights montam as bases de todos os membros, chamam assignRosterInteractions e tiram curtidas/comentários das listas atribuídas"
      pattern: "assignRosterInteractions\\("
    - from: apps/web/components/dashboard/OwnerContentReplies.tsx
      to: packages/modules/dashboard/fixtures/owner-content.ts
      via: "ownerContentUnanswered(postId): a contagem é a do commentMeta"
      pattern: "ownerContentUnanswered\\("
    - from: apps/web/components/dashboard/OwnerContentOverview.tsx
      to: apps/web/lib/owner-content-view.ts
      via: "a linha de atenção leva a `responder` e usa contentAttentionAnchor; o parser usa o mesmo needsAttention"
      pattern: "needsAttention\\("
    - from: apps/web/components/dashboard/OwnerContentPostCard.tsx
      to: apps/web/components/dashboard/CoverThumb.tsx
      via: "cartão compacto e ContentCover usam COVER_ICON/coverStyle"
      pattern: "coverStyle\\("
---

<objective>
Pôr a capa da publicação em miniatura em toda lista de publicações (D-01..D-04) e, no mesmo plano, os pedidos novos travados (E-01 cartão compacto, E-02 comentários a responder, E-03 os 11 achados do flow-critic da 261013-h51), na branch feat/painel-preview (base 387a7fc4; HEAD atual 8ba2f76d, que só acrescentou docs).

Propósito: as listas deixam de ser "secas"; os cartões grandes viram cartões compactos com miniatura e números; quem cuida da comunidade vê e responde os comentários parados; e nenhuma tela de Conteúdo contradiz outra (listas vazias com número, quando sem "quando", Inativos alcançados, rótulos e plurais errados).
Saída: `CoverThumb` (linha e cartão), dados fictícios coerentes (tipo dos posts do nível 7, atribuição global de curtidas/comentários do roster, comentários sem resposta com texto, alcance sem Inativos), as telas alteradas, testes de unidade e e2e, README, gates verdes e 5 capturas.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/261013-orf-capa-da-publicacao-nas-listas-de-curtida/261013-orf-CONTEXT.md
@apps/web/AGENTS.md

Fatos conferidos pelo planejador (HEAD 387a7fc4, sondas tsx sobre as fixtures):
- `ContentCover` (OwnerContentPostCard.tsx:68-102) pinta `var(--brand-gradient)` com `--brand-on-primary`, o ícone de `KIND_ICON` (só usado nesse arquivo; `text: null`, `story: Play`) e a duração com `formatClock`; o embrulho é `bg-bg-tertiary` (as faixas cinzas). `ContentPostCard`/`ContentPostList` são usados por Best (Overview), PostsTab (OwnerContent.tsx), o tipo aberto (OwnerContentTypes.tsx) e MetricPosts/numbers (Overview). O e2e lê `[data-testid="content-cover"]` (linhas ~1597, 1782-1795) e `cardCell(card, 'Curtidas'|'Comentários')` (~1699).
- `--brand-gradient` (packages/ui/src/styles/tokens.css:149) = `linear-gradient(135deg, primária escurecida, primária, secundária)`.
- Nível 7: `PostRef` (member-lists.ts:21) só tem `id`, `excerpt`, `community`; `WatchedVideo` já tem `kind` e `durationSeconds`. `MemberActivityList.tsx` monta as linhas em `VIEWS`.
- Nível 4: o id do `OwnerPost` é o id do `ContentItem`; `ownerContentItem` é exportado pelo barril.
- Pessoas de Conteúdo hoje: 292 listas, 55 vazias com número > 0 e 163 abaixo de min(total, 10). O roster (72; 48 ativos) tem 663 curtidas e 96 comentários; para cobrir são precisos ~606 curtidas e ~531 comentários. Curtidas: `likes = activeDays + EXTRA_LIKES` (owner-member-insights.ts:245); comentários: `COMMENTS[band](j)` (linha 244), um por dia num post curtido naquele dia (owner-member-lists.ts:101-105). As faixas dependem só dos dias ativos (`bandAt`), então mais comentários não mudam faixa.
- Protótipo da atribuição global descrita na Tarefa 2 (scratch, não versionado): curtidas cobrem tudo menos op-01 (2 elegíveis), op-02 (6) e op-03 (6) sem estourar o orçamento (todo dia ativo continua com ao menos uma ação); comentários cobrem tudo menos op-03 (6); superfãs ficam com ~24-28 comentários em 30 dias, engajados 4-15. Story os-01 (de hoje) tem 6 membros elegíveis para 18 curtidas.
- Precisa de atenção = op-24 (2 sem resposta, 250 h, 11 dias de idade, c-geral), op-19 (9, 192 h, 8 dias, c-geral), op-12 (4, 110 h, 5 dias, c-vip), op-08 (3, 60 h, 3 dias, c-vip) (`UNANSWERED`, owner-content.ts:~205).
- Alcance: base = novos 96 + superfãs 62 + engajados 205 + ocasionais 150 (513 ativos), em risco 168, inativos 559. Há posts com alcance 1.100, que só cabe com 419 inativos (`splitReach`, `REACH_WEIGHT` em owner-content.ts:640). `tenantOwnerPanel.reach.value.perPost` = 612 (tenant-owner.ts:456), soma 37.332 (owner-content.test.ts:171); e2e fixa "Taxa de engajamento de 10,6%" e "612" (~1823-1847).
- Retenção: 11 pontos (RETENTION_SHORT/LONG); rótulos hoje só 0% e 50% (OwnerContentPostDetail.tsx:414). op-41 tem `rsvps: [['e3', 11]]` (Workshop). O vídeo de 41 s é "Como organizar a agenda sem lotar todos os horários".
- Catálogo: `people.count.*` sem `=0`; `types.perPost` "Interações por post", `types.metric.photo` "Salvamentos por post", `overview.next.schedule.detail` "interações por post"; `detail.app.rsvps` "Inscrições em eventos até 7 dias depois", `detail.app.rsvp` "{name} · {date}: {count}"; `bandMembers.more` "e mais N membros" (usado pelas listas de pessoas de Conteúdo com o total de ações). O tipo aberto empilha `MetricsNote` e a nota de salvamentos/compartilhamentos.
- `BandSummary` (BandMembers.tsx:73) é privado; `MemberCard` mostra "Faixa:" quando recebe `band` (linha 162). `PreviewAction` é `Button` desativado com `aria-describedby={PREVIEW_NOTE_ID}` (de `@/lib/dashboard-preview`).
- `formatClock(t, 612)` = "10:12"; `momentText` = "hoje 22:40" / "ontem 22:40" / "há N dias". `text-[10px]` já é usado no app. lucide-react@1.46.0 tem `Type`, `Ticket`, `ShoppingBag`, `Heart`, `MessageCircle`, `Bookmark`, `Send`.
- O servidor da 3000 roda a partir deste checkout e responde 200; `playwright.preview.config.ts` o reaproveita. `pnpm typecheck` precisa do ambiente provisório exportado.

Decisões do planejador (discrição; as de antes que ainda valem e as novas):
- PD-A `CoverThumb.tsx` é arquivo próprio (o nível 7 não importa o arquivo do dono) e é a base da linha (56 px) e do cartão compacto (E-01); `ContentCover` usa o mesmo mapa e estilo, então a mesma publicação tem o mesmo tom em todo lugar.
- PD-B Tom: o próprio `var(--brand-gradient)` com `backgroundSize: '300% 300%'` e uma de cinco posições na diagonal (`0% 0%`, `25% 25%`, `50% 50%`, `75% 75%`, `100% 100%`) pela soma dos códigos dos caracteres do id módulo 5.
- PD-C Texto = `Type`; story = ícone da capa (Play) + anel `ring-2 ring-brand ring-offset-2 ring-offset-card`; vídeo e reel = Play + duração.
- PD-D Ações fortes: check-in = `Ticket`, pedido = `ShoppingBag`, semente = id do evento/produto (a coluna não desalinha).
- PD-E Interações e Precisa de atenção ganham a miniatura da publicação que a linha abre; o triângulo de alerta continua, pequeno, ao lado da contagem (status = ícone + texto).
- PD-G Tipos do nível 7 atribuídos post a post, com a duração do vídeo correspondente quando é o mesmo vídeo.
- PD-H A miniatura é decorativa; a duração usa a chave `clock` existente.
- PD-I Cartão compacto: miniatura com altura 7rem e largura `min(8rem, 7rem × proporção)` (proporção de `contentCoverRatio`, quadrada para texto); números com ícone `aria-hidden` + valor visível + nome em `sr-only` (plural do catálogo); story não mostra salvamentos; o cartão inteiro é o link, com o chevron à direita; some a linha "Ver publicação".
- PD-J Capa do detalhe: o embrulho usa `coverStyle(item.id)` com uma camada `bg-black/40` por cima (as laterais ficam o degradê escurecido) e, em vídeo e story, o ▶ vira um botão redondo desativado com `aria-label` "Assistir" e `aria-describedby={PREVIEW_NOTE_ID}` (toda ação do preview é desativada).
- PD-K E-02 entra na cascata como `responder=<id>` só na Visão geral (sem `numero` nem `faixa`) e só para um id que `needsAttention` aceita (mais de 24 h sem resposta); com ele, `post`, `quem`, `membro` e `lista` são ignorados. A espera de cada comentário é "Comentou {momentText}"; o primeiro tem `daysAgo = floor(horas/24)` da linha, então lê o mesmo "há N dias".
- PD-L E-03.1 — conflito com dado: op-01, op-02, op-03 e os-01 foram publicados hoje/ontem e o roster só tem 2-6 membros ativos desde então; atingir 10 exigiria mudar a última atividade de membros do roster (que fixa cartões, ordens e faixas em todo o painel). O plano cumpre min(total, 10, membros elegíveis), garante ≥ 1 em toda lista com número > 0 e prova em teste que o teto é o número de elegíveis. Precisa da confirmação do usuário (ver retorno do planejador).
- PD-M E-03.4: alcance de post limitado a 530 (os 513 ativos + 10% de Em risco); visualizações reduzidas na mesma proporção (nunca abaixo do alcance); `REACH_WEIGHT` com inativos 0 (a faixa nunca é aberta) e em risco 0,1. Taxa, alcance médio e visualizações da Visão geral mudam por consequência (os números novos ficam no SUMMARY).
- PD-N E-03.9 no tipo aberto: uma frase só, `types.openedNote`, que diz o que é exemplo naquele tipo (métrica do tipo quando for exemplo, salvamentos quando houver, compartilhamentos), passada como `exampleNote` ao `ContentPostList`; `MetricsNote` fica só na lista dos seis tipos.

Regras (CONTEXT): dados fictícios determinísticos, todo texto da tela no catálogo pt-BR (check-ui-literals), só tokens, `@3xl`, rolagem só vertical, trava de produção intacta, Biome/fronteiras/guarda de literais verdes. Comentários de código e commits em inglês; tela em pt-BR. Sem publicar.

Pasta no iCloud: antes de mexer e antes de cada commit, `find apps/web/components/dashboard apps/web/lib apps/web/e2e-preview apps/web/messages packages/modules/dashboard \( -name '* 2*' -o -flags +dataless \) -print` não imprime nada (dataless: `brctl download <caminho>` e conferir de novo). Nunca versionar `screens/` nem cópias "* 2*".

Servidor e Chrome: nunca parar o Chrome. Se este checkout é o que a 3000 serve (`git rev-parse --show-toplevel` = "/Users/macos/Desktop/rede social/rede-social"), o Playwright reaproveita a 3000; se a tela parecer desatualizada, pare só o processo de `lsof -nP -iTCP:3000 -sTCP:LISTEN -t` e religue com o comando de sempre. Numa cópia separada (worktree), não use a 3000: config temporária, não versionada, em apps/web dessa cópia, estendendo `playwright.preview.config.ts` com `testDir` absoluto de `e2e-preview`, `use.baseURL` `http://localhost:3100` e `webServer` `pnpm --filter @rede-social/web exec next dev -p 3100` (url na 3100); apagar no fim. Comando de sempre: `cd "/Users/macos/Desktop/rede social/rede-social" && API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder nohup pnpm --filter @rede-social/web dev > /tmp/rede-dev.log 2>&1 &`.

Trabalho em paralelo: durante o planejamento a branch avançou para 8ba2f76d (só docs da quick 261013-p31, capas de eventos), e a p31 está sendo executada no worktree `.claude/worktrees/agent-a034b49d41d221dae`, mexendo também em `apps/web/messages/pt-BR/dashboard.json`, `apps/web/e2e-preview/painel-preview.spec.ts` e `packages/modules/dashboard/README.md` (além de OwnerEvents, BandScopeCards, BarList). Esta quick não toca nas seções de Eventos desses arquivos. Antes de começar e antes de cada commit, conferir `git log --oneline -3`; se a p31 já entrou na branch, trabalhar sobre ela e, em conflito, manter as duas mudanças. A trava de produção continua comparada com 387a7fc4 (a p31 não a toca).

Comandos e2e por grupo (de apps/web, ambiente provisório exportado): nível 7 = `--grep "membro(:| \?lista=)"`; nível 4 e Conteúdo = `--grep "dono-do-cliente (membros|conteudo)"`.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Tarefa 1: tipo de cada post do nível 7 (D-03) + CoverThumb de linha (D-02, D-04) + miniatura nas 7 listas do membro, de ponta a ponta</name>
  <files>packages/modules/dashboard/fixtures/member-lists.ts, packages/modules/dashboard/tests/member-lists.test.ts, apps/web/components/dashboard/CoverThumb.tsx, apps/web/components/dashboard/CoverThumb.test.tsx, apps/web/components/dashboard/OwnerContentPostCard.tsx, apps/web/components/dashboard/MemberActivityList.tsx, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <precondition>`git merge-base --is-ancestor 387a7fc4 HEAD` dá certo, `git status --short` não mostra nada fora de `.planning/quick/261013-orf-…/` e `.claude/worktrees/`, e o `find` do iCloud não imprime nada.</precondition>
  <read_first>
    - packages/modules/dashboard/fixtures/member-lists.ts (PostRef, POST_ROWS, memberPostTable, VIDEO_ROWS)
    - packages/modules/dashboard/tests/member-lists.test.ts (estilo, countBy)
    - apps/web/components/dashboard/OwnerContentPostCard.tsx linhas 1-102 (KIND_ICON, ContentCover)
    - apps/web/components/dashboard/MemberActivityList.tsx (ListRow, VIEWS, o li)
    - apps/web/components/dashboard/BandMembers.test.tsx linhas 1-35 (happy-dom, catálogo real, mock de `@/lib/registry`)
    - apps/web/e2e-preview/painel-preview.spec.ts linhas 2757-2860 (MemberListCase, MEMBER_LIST_CASES e o laço "the X card opens its list")
  </read_first>
  <behavior>
    - member-lists.test.ts, describe "memberPostTable kinds (quick 261013-orf D-03)": todo post tem `kind` em {video, photo, carousel, text, link}; vídeo ⇒ `durationSeconds` inteiro > 0; os demais ⇒ null; contagem { video: 23, text: 16, carousel: 7, photo: 7, link: 7 }; toda linha de likes, saves, shares e posts (e o `post` de cada comentário) tem o `kind`/`durationSeconds` do post da tabela de mesmo id; os pares [p01,v01], [p02,v09], [p05,v02], [p07,v04], [p08,v03], [p09,v06], [p15,v11], [p21,v23], [p28,v05], [p38,v22], [p57,v40] têm a mesma duração.
    - CoverThumb.test.tsx: `coverTone` é estável por semente, dá cinco valores distintos para p01..p05 e sempre uma das cinco posições; CoverThumb de vídeo (p01, 612 s): `aria-hidden="true"`, `data-testid="cover-thumb"`, `data-kind="video"`, classes `size-14`, `rounded-lg`, `shrink-0`, texto "10:12", um `svg`, style com `var(--brand-gradient)` e `300% 300%`; texto: um `svg`, sem texto, sem `ring-2`; foto sem duração: sem selo; story: `ring-2`, sem selo; evento e pedido: um `svg` e o `data-kind` certo.
  </behavior>
  <action>
    RED: os casos de behavior em member-lists.test.ts e no novo CoverThumb.test.tsx (`// @vitest-environment happy-dom`, catálogo pt-BR real, mesmo `vi.mock('@/lib/registry', …)` de BandMembers.test.tsx porque format.ts o importa). Rodar e ver falhar por campo/módulo ausente. Commit `test(quick-261013-orf): pin post kinds and the cover thumbnail`.

    GREEN, dados (D-03, PD-G), member-lists.ts:
    1. `import type { ContentKind } from './owner-content'`; `PostRef` ganha `kind: Exclude<ContentKind, 'story'>` e `durationSeconds: number | null` (só vídeos), com JSDoc.
    2. `POST_ROWS` vira `[excerpt, community, media]` (`media`: `Pick<PostRef, 'kind' | 'durationSeconds'>`, helper `video(seconds)` e constantes PHOTO, CAROUSEL, TEXT, LINK); `memberPostTable` espalha `media`. Tabela por id: vídeo — p01 612, p02 90, p05 540, p07 498, p08 290, p09 360, p15 252, p19 3300, p21 185, p27 330, p28 420, p33 300, p35 2700, p38 68, p39 270, p45 280, p47 2400, p49 320, p50 58, p53 300, p57 150, p58 1800, p59 3120; carrossel — p04, p16, p29, p41, p43, p46, p51; foto — p10, p12, p22, p31, p34, p52, p60; link — p03, p17, p25, p26, p30, p37, p48; texto — p06, p11, p13, p14, p18, p20, p23, p24, p32, p36, p40, p42, p44, p54, p55, p56. Atualizar o comentário do arquivo.

    GREEN, componente (D-02, D-04, PD-A..PD-C), novo CoverThumb.tsx:
    3. Exportar `CoverKind` = `ContentKind | 'event' | 'order'`; `COVER_ICON: Record<CoverKind, LucideIcon>` (video Play, photo Image, carousel GalleryHorizontal, text Type, link Link2, story Play, event Ticket, order ShoppingBag); `coverTone(seed)` (PD-B); `coverStyle(seed): CSSProperties` com `backgroundImage: 'var(--brand-gradient)'`, `backgroundSize: '300% 300%'`, `backgroundPosition: coverTone(seed)`, `color: 'var(--brand-on-primary)'`; `CoverThumbProps` = { kind, seed, durationSeconds?: number | null }.
    4. `CoverThumb({ t, kind, seed, durationSeconds })`: `span` com `aria-hidden`, `data-testid="cover-thumb"`, `data-kind`, classes `relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg` (+ o anel só no story), `style={coverStyle(seed)}`; ícone size 24 `opacity-90`; com duração, selo `absolute right-1 bottom-1 rounded bg-black/50 px-1 text-[10px] leading-4 font-bold tabular-nums text-white` com `formatClock`. JSDoc: miniatura decorativa da capa de Conteúdo; com dados reais vira a mídia do post (`MediaImage`).
    5. OwnerContentPostCard.tsx: apagar `KIND_ICON`, usar `COVER_ICON[item.kind]` e `...coverStyle(item.id)` em `ContentCover` (mantendo `aspectRatio` e `width`); atualizar o JSDoc.

    GREEN, nível 7 (D-01), MemberActivityList.tsx:
    6. `ListRow` ganha `thumb: CoverThumbProps` obrigatório. curtidas/salvamentos/compartilhamentos/posts-vistos: `{ kind: row.kind, seed: row.id, durationSeconds: row.durationSeconds }`; comentarios: do `row.post`; videos: `{ kind: 'video', seed: row.id, durationSeconds: row.durationSeconds }`; stories: `{ kind: 'story', seed: row.id }`.
    7. `li` = `flex items-start gap-3 px-3 py-2.5`, miniatura primeiro, coluna de texto `min-w-0 flex-1 [overflow-wrap:anywhere]`, `aside` igual. Atualizar o JSDoc.

    e2e, no laço "membro: the ${list.card} card opens its list and Voltar returns": `list.rows` miniaturas em `#lista`, uma por `listitem`, todas `aria-hidden="true"`, a primeira com 56×56 (±1); curtidas: a primeira `data-kind="video"` com "10:12" e ao menos uma `data-kind="text"` com `svg`; videos: a primeira "10:12" e todas `^\d+:\d\d$`; stories: todas `data-kind="story"`. Os laços de 360/390/430 e 1440×900 de MEMBER_LIST_CASES já cobrem a largura.

    Commit `feat(quick-261013-orf): cover thumbnails on the member's activity lists` (corpo com D-01..D-04, PD-A..PD-C, PD-G e os checks). Com o verify verde, seguir direto para a Tarefa 2.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/module-dashboard exec vitest run tests/member-lists.test.ts && pnpm --filter @rede-social/web exec vitest run components/dashboard/CoverThumb.test.tsx && cd apps/web && pnpm exec playwright test --config playwright.preview.config.ts --grep "membro(:| \?lista=)|dono-do-cliente conteudo"</automated>
  </verify>
  <done>
    - RED falhou por campo/módulo ausente; GREEN passa as duas unidades, o e2e do nível 7 e o de Conteúdo.
    - As 7 listas do membro têm uma miniatura de 56 px por linha, decorativa; `ContentCover` e `CoverThumb` dividem `COVER_ICON` e `coverStyle`.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Tarefa 2: dados coerentes — pessoas de toda lista (E-03.1), comentários sem resposta com texto (E-02), alcance sem Inativos (E-03.4) e tipo no nível 4 (D-03)</name>
  <files>packages/modules/dashboard/fixtures/owner-member-insights.ts, packages/modules/dashboard/fixtures/owner-member-lists.ts, packages/modules/dashboard/fixtures/owner-content.ts, packages/modules/dashboard/fixtures/tenant-owner.ts, packages/modules/dashboard/fixtures/index.ts, packages/modules/dashboard/tests/owner-member-lists.test.ts, packages/modules/dashboard/tests/owner-member-insights.test.ts, packages/modules/dashboard/tests/owner-content.test.ts, packages/modules/dashboard/README.md, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - packages/modules/dashboard/fixtures/owner-member-insights.ts (COMMENTS, EXTRA_LIKES, LIFETIME_ACTIONS, build, a chamada a buildOwnerMemberLists)
    - packages/modules/dashboard/fixtures/owner-member-lists.ts (inteiro)
    - packages/modules/dashboard/fixtures/owner-content.ts linhas 84-110 (ContentPerson), 200-225 (UNANSWERED, commentMeta), 300-440 (storyPeople, answerFlags, buildOwnerContentPeople, ownerContentPeople), 630-760 (REACH_WEIGHT, BUSINESS, splitReach, ownerContentDetail) e POST_EXAMPLES
    - packages/modules/dashboard/tests/owner-member-lists.test.ts linhas 85-230 e owner-content.test.ts linhas 155-195, 222-330, 467-611
    - packages/modules/dashboard/README.md linhas 228-300
  </read_first>
  <behavior>
    - owner-content.test.ts, "every people list (quick 261013-orf E-03.1)": para todo item × quem (salvamentos só com valor), `people.length >= min(total, 10, teto)`, onde teto vem de uma tabela no teste — { 'op-01/likes': 2, 'op-01/saves': 2, 'op-02/likes': 6, 'op-03/likes': 6, 'op-03/comments': 6, 'os-01/likes': 6 } — e, para cada entrada da tabela, o teto é igual ao número de membros ativos do roster que alcançam a comunidade e têm um dia ativo até a idade do item (o teste calcula); toda lista com total > 0 tem ao menos 1 pessoa; os testes "same fact (both directions)", "never outnumber", "most recent first" e "saves and shares subset of likers" seguem verdes.
    - "unanswered comments (quick 261013-orf E-02)": para cada item de `UNANSWERED`, `ownerContentUnanswered(id)` tem exatamente `comments - answered` linhas, do mais antigo ao mais novo, cada pessoa está em `ownerContentPeople(id, 'comments')` com `answered: false`, cada texto é não vazio, distinto e com até 160 caracteres; para horas ≥ 48, a primeira tem `when.daysAgo === Math.floor(horas / 24)` e nenhum comentador do item tem `daysAgo` maior; um id fora de `UNANSWERED` devolve lista vazia.
    - "reach without inativos (quick 261013-orf E-03.4)": todo item tem `reachByBand.value.inactive === 0` e `at_risk <= 10%` do alcance; todo post tem alcance ≤ 530 e visualizações ≥ alcance; a soma e `tenantOwnerPanel.reach.value.perPost` (= arredondamento da média dos 61) seguem iguais entre si (novos valores fixados).
    - owner-member-lists.test.ts: o caso "comment once a day …" vira "comments: distinct reachable posts, each on an active day no later than the post's age, one per post, and the count is the KPI"; continua: o comprimento de cada lista é o KPI, todo dia ativo tem ao menos uma ação, curtidas = dias ativos + EXTRA_LIKES (KPI de curtidas inalterado); novo "every listed post has a feed kind (D-03)": todo post de likes, comments, strongActions (comentário) e postsSeen resolve em `ownerContentItem` com tipo diferente de story, vídeo ⇔ duração > 0, e a mesma duração do `OwnerPost`.
    - owner-member-insights.test.ts: as ações desde a entrada (`LIFETIME_ACTIONS` e o que deriva delas) nunca ficam abaixo das ações dos últimos 30 dias (curtidas + comentários + check-ins + pedidos).
  </behavior>
  <action>
    RED: escrever os casos acima nos três arquivos de teste. Rodar e ver falhar (listas curtas, export ausente, inativos > 0). Commit `test(quick-261013-orf): pin people coverage, unanswered comments and reach by band`.

    GREEN, E-03.1 (atribuição global, PD-L):
    1. owner-member-lists.ts: exportar `assignRosterInteractions(bases)` — `bases` são, por membro ativo do roster, o row, os dias ativos (daysAgo) e o orçamento de curtidas (o KPI atual) — devolvendo, por id de membro, `likes` e `comments` como `{ postId, daysAgo }[]`. Regras determinísticas: (a) um membro é elegível para um post se alcança a comunidade (`row.communities`) e tem um dia ativo ≤ idade do post; (b) curtidas, posts do mais novo ao mais velho (empate na ordem da tabela): precisa de min(curtidas, 10, elegíveis); candidatos que ainda não curtiram e estão "disponíveis" (orçamento restante > dias ativos ainda sem curtida, ou orçamento > 0 e um dia sem curtida ≤ idade), em ordem de maior orçamento restante e depois ordem do roster; o dia é o dia sem curtida mais recente ≤ idade, senão o dia ativo mais recente ≤ idade; (c) depois, cada dia ativo ainda sem curtida recebe uma (o post mais novo não usado e alcançável publicado até aquele dia) e o resto do orçamento vai em rodízio a partir do dia mais recente, como hoje; lança erro se faltar orçamento; (d) comentários, posts do mais novo ao mais velho: limite de dia = `floor(horas/24)` para os itens de `UNANSWERED` com horas ≥ 48, senão a idade; precisa de min(comentários, 10, elegíveis até o limite); nesses itens de `UNANSWERED`, primeiro um elegível com dia ativo exatamente no limite (comenta nesse dia); depois quem curtiu o post num dia ≤ limite (comenta no dia da curtida), depois os demais elegíveis (no dia ativo mais recente ≤ limite), em ordem de faixa superfã, engajado, novo, ocasional, depois menos comentários até ali, depois ordem do roster; um comentário por membro por post. Exportar o tipo do retorno; JSDoc com a regra e o porquê (toda lista de Conteúdo com número tem pessoas, e o comentário de um membro e o comentador de um post são o mesmo fato).
    2. owner-member-lists.ts: `buildOwnerMemberLists` recebe as curtidas e comentários atribuídos em vez de sorteá-los; `comments` de cada membro = os atribuídos (mais recentes primeiro); strongActions, activeDays (ações por dia) e postsSeen seguem as regras atuais sobre essas listas.
    3. owner-member-insights.ts: montar as bases de todos os membros primeiro, chamar `assignRosterInteractions` uma vez, e então montar insights e listas; `comments` do KPI = tamanho da lista atribuída (sai `COMMENTS`); `strongActions = comments + checkIns + orders`; as ações desde a entrada passam a ser o maior entre a regra atual e as ações dos últimos 30 dias (e o que deriva delas, como `postTypes` e `communities`).
    4. owner-content.ts: em `storyPeople`, curtidas = min(curtidas, 10) e respostas = min(respostas, 10) (rotate já limita aos candidatos); salvamentos = os primeiros min(valor, curtidores) curtidores e compartilhamentos = os últimos min(valor, curtidores), em vez de pares/ímpares (seguem subconjunto dos curtidores, nunca maiores que o valor).

    GREEN, E-02 (dados, PD-K):
    5. owner-content.ts: `UNANSWERED_TEXTS: Record<string, readonly string[]>` com exatamente o número de sem-resposta de cada item de `UNANSWERED` (op-02 1, op-03 2, op-04 1, op-08 3, op-12 4, op-19 9, op-24 2), na ordem do mais antigo ao mais novo: comentários fictícios em pt-BR natural sobre o assunto da publicação (pergunta, dúvida ou relato), até 160 caracteres, sem nome de outra pessoa. Exportar `ContentUnansweredComment` = { person: ContentPerson; text: string } e `ownerContentUnanswered(itemId)`: as pessoas `answered === false` de `ownerContentPeople(itemId, 'comments')`, do mais antigo ao mais novo, com o texto; lança se faltar texto. JSDoc: muda a regra da 261013-h51 (texto de comentário nunca) por decisão do usuário E-02, só para os sem resposta, só no nível 4. Exportar pelo barril.

    GREEN, E-03.4 (PD-M):
    6. owner-content.ts: em `POST_EXAMPLES`, alcance novo = min(alcance, 530) e visualizações novas = as mesmas se o alcance não mudou, senão `max(alcance novo, round(visualizações × alcance novo / alcance))` — gravar os valores literais calculados (um script em scratch, não versionado). `REACH_WEIGHT`: inactive 0 e at_risk 0,1; em `splitReach`, uma faixa de peso 0 nunca é aberta. Atualizar o comentário do arquivo (o alcance de um post cabe nos membros ativos e numa parte pequena de Em risco; Inativos não são alcançados; a vitrine VIP de 06/10 segue a exceção dos 186).
    7. tenant-owner.ts: `reach.value.perPost` = média arredondada dos 61 alcances novos; atualizar a soma fixada em owner-content.test.ts e qualquer outro número fixado que mude.

    D-03 nível 4: o caso "every listed post has a feed kind" já passa com os dados (é cobertura).

    e2e (painel-preview.spec.ts):
    8. Novo teste "dono-do-cliente conteudo: every people list with a number has people" (`test.setTimeout(600_000)`, 390×844, `waitUntil: 'domcontentloaded'`): para op-01..op-61 em `&vista=publicacoes&post=<id>&quem=<slug>` (curtidas, comentarios, salvamentos, compartilhamentos) e os-01..os-16 em `&vista=tipos&tipo=story&post=<id>&quem=<slug>` (sem salvamentos), ler o número do início da linha de contagem (sem número = 0) e, se > 0, exigir ao menos um link de cartão de membro na área.
    9. Atualizar os números fixados que mudaram com os dados (Taxa de engajamento, Alcance por publicação, Visualizações, contagens "e mais", e o que mais o grupo `dono-do-cliente (membros|conteudo)` acusar), cada um conferido contra a fixture.

    README (inglês): na seção de listas do nível 4 e em Conteúdo, trocar a regra antiga de comentários pela atribuição global (cobertura min(total, 10), o teto dos itens recém-publicados, os mesmos fatos nos dois sentidos), o alcance sem Inativos (teto 530, novo `perPost`) e `ownerContentUnanswered` (só para os sem resposta; só OwnerContentReplies.tsx o lê).

    Commit `fix(quick-261013-orf): every content people list has people, reach skips inactive members`, corpo com E-03.1, E-03.4, a parte de dados de E-02, PD-L/PD-M e os números que mudaram.
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/module-dashboard exec vitest run && pnpm typecheck && cd apps/web && pnpm exec playwright test --config playwright.preview.config.ts --grep "dono-do-cliente (membros|conteudo)"</automated>
  </verify>
  <done>
    - RED falhou pelos motivos certos; GREEN deixa verdes todos os testes do módulo dashboard, o typecheck e o grupo e2e de Membros/Conteúdo, inclusive o novo teste de listas de pessoas.
    - Nenhuma lista de pessoas com número > 0 abre vazia; só op-01, op-02, op-03 e os-01 ficam abaixo de 10, no teto de elegíveis provado em teste.
    - Inativos 0 no alcance por faixa de todo item; números novos de Taxa/Alcance/Visualizações anotados para o SUMMARY.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Tarefa 3: cartão compacto e capa do detalhe (E-01), miniatura nas listas do membro no nível 4 (D-01), retenção, inscritos e "por publicação" (E-03.5, E-03.6, E-03.9)</name>
  <files>apps/web/components/dashboard/CoverThumb.tsx, apps/web/components/dashboard/CoverThumb.test.tsx, apps/web/components/dashboard/OwnerContentPostCard.tsx, apps/web/components/dashboard/OwnerContentTypes.tsx, apps/web/components/dashboard/OwnerContentPostDetail.tsx, apps/web/components/dashboard/OwnerMemberList.tsx, apps/web/components/dashboard/OwnerMemberList.test.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - apps/web/components/dashboard/OwnerContentPostCard.tsx (inteiro, depois da Tarefa 1)
    - apps/web/components/dashboard/OwnerContentTypes.tsx linhas 100-160 (MetricsNote, o tipo aberto)
    - apps/web/components/dashboard/OwnerContentPostDetail.tsx linhas 69-95 (Header), 254-311 (AppKnows) e 391-423 (Retention)
    - apps/web/components/dashboard/OwnerMemberList.tsx (ListRow, VIEWS, o li)
    - apps/web/lib/owner-content-view.ts linhas 250-280 (contentCoverRatio)
    - apps/web/e2e-preview/painel-preview.spec.ts linhas 1420-1567 (OWNER_LIST_CASES, "the insights' numbers open their lists", OWNER_LIST_VIEWPORT_SLUGS) e 1587-1800 (postCards, coverRatio, cardCell, os testes de capas e de ordem)
  </read_first>
  <behavior>
    - CoverThumb.test.tsx: variante `card` de um vídeo 9:16 tem `data-ratio="0.5625"`, altura 7rem e largura `min(8rem, …)` no style; texto na variante `card` é quadrado (ratio 1) com ícone; a duração na variante `card` usa `text-xs`.
    - OwnerMemberList.test.tsx (happy-dom, catálogo real, mock de `@/lib/registry`): para om-13, curtidas, comentarios, posts-vistos e acoes-fortes têm uma miniatura por `li` (comprimentos lidos de `ownerMemberInsights('om-13').lists`), acoes-fortes com 4 `data-kind="event"`; dias-ativos sem miniatura; om-03 acoes-fortes com exatamente uma `data-kind="order"`; todas `aria-hidden="true"`.
  </behavior>
  <action>
    RED: casos acima em CoverThumb.test.tsx e no novo OwnerMemberList.test.tsx. Ver falhar. Commit `test(quick-261013-orf): pin the compact card thumbnail and owner-level list thumbnails`.

    GREEN, E-01 (PD-I, PD-J):
    1. CoverThumb.tsx: prop `variant?: 'row' | 'card'` (padrão `row`) e `ratio?: number | null`. Em `card`: `data-ratio`, `aspectRatio` = ratio ?? 1, altura 7rem e largura `min(8rem, ${7 × ratio}rem)` no style (sem `size-14`), ícone 28, selo `text-xs` em `right-1.5 bottom-1.5`.
    2. OwnerContentPostCard.tsx: `ContentPostCard` vira o cartão compacto — `Linked` + `Card` com `flex items-start gap-3 p-3 hover:bg-card-hover`; à esquerda `CoverThumb variant="card"` com `ratio={contentCoverRatio(item)}` e `seed={item.id}`; à direita (`min-w-0 flex-1 [overflow-wrap:anywhere]`) a legenda `line-clamp-2 text-sm font-bold`, a meta (`contentMeta`) e a linha dos números `flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold tabular-nums` — Heart curtidas, MessageCircle comentários, Bookmark salvamentos (não em story), Send compartilhamentos — cada um com ícone `aria-hidden` size 14, `formatCount` visível e o nome em `sr-only` por chave plural nova `tenantOwner.content.card.compact.{likes,comments,saves,shares}`; depois o `extra` e, à direita, `ChevronRight` (`shrink-0 self-center text-brand`). Sai o bloco `Numbers` e a linha "Ver publicação" (apagar `card.open` se ficar sem uso). `ContentPostList` não muda de assinatura. Atualizar os JSDocs.
    3. `ContentCover` (detalhe): o embrulho troca `bg-bg-tertiary` por `relative overflow-hidden` com `style={coverStyle(item.id)}` e um filho absoluto `inset-0 bg-black/40` `aria-hidden`; a capa fica acima (`relative`). Em vídeo e story, o ícone central vira um `button` desativado redondo (`flex size-16 items-center justify-center rounded-full bg-black/40`) com Play 32, `aria-label={t('tenantOwner.content.detail.watch')}` ("Assistir") e `aria-describedby={PREVIEW_NOTE_ID}`; nos outros tipos, o ícone como hoje.

    GREEN, D-01 nível 4 (PD-D), OwnerMemberList.tsx:
    4. `ListRow.thumb?: CoverThumbProps`; helper `postThumb(post)` com `ownerContentItem(post.id)` → `{ kind, seed: item.id, durationSeconds }`; curtidas, comentarios, posts-vistos e o comentário de acoes-fortes usam-no; check-in `{ kind: 'event', seed: action.eventId }`; pedido `{ kind: 'order', seed: action.productId }`; dias-ativos sem miniatura. `li` = `flex items-start gap-3 px-3 py-2.5`, miniatura primeiro, texto `min-w-0 flex-1`.

    GREEN, E-03.5, E-03.6, E-03.9 (PD-N):
    5. Retention recebe o item: rótulos do eixo só nos pontos 0, 5 e 10, com `formatClock(t, Math.floor(duração × i / 10))` (41 s → 0:00 · 0:20 · 0:41); conferir que o último rótulo não é cortado a 360 px.
    6. dashboard.json: `detail.app.rsvps` = "Inscritos em eventos nos 7 dias seguintes"; `detail.app.rsvp` = "{name}, {date}: {count, plural, =0 {nenhum inscrito} one {# inscrito} other {# inscritos}}" (passar `count` como número); `detail.watch` = "Assistir"; as chaves `card.compact.*`.
    7. dashboard.json: trocar "por post" por "por publicação" em toda string (`types.perPost`, `types.metric.photo`, `overview.next.schedule.detail` e qualquer outra do arquivo). OwnerContentTypes: no tipo aberto sai `MetricsNote` e o `ContentPostList` recebe `exampleNote={t('tenantOwner.content.types.openedNote', { metric, saves })}` — chave nova com select: métrica do tipo quando `kindMetric(kind).metric.example`, salvamentos quando o tipo não é story, sempre compartilhamentos, terminando em ": valores de exemplo" (texto: "Salvamentos e compartilhamentos: valores de exemplo"; story: "Métrica do tipo e compartilhamentos: valores de exemplo"). A lista dos seis tipos mantém `MetricsNote`.

    e2e (painel-preview.spec.ts):
    8. Os testes que liam `content-cover`/`cardCell(card, 'Curtidas'|'Comentários')` em listas passam a ler `[data-testid="cover-thumb"]` (proporção por `data-ratio`/caixa) e os números do cartão compacto (pelo texto `sr-only`); o detalhe continua com `content-cover` e ganha: o embrulho tem `background-image` com gradiente, e em vídeo existe um botão desativado "Assistir".
    9. "the insights' numbers open their lists": miniaturas = `value` e uma por `listitem` em todo slug, exceto dias-ativos (0); acoes-fortes com 4 `data-kind="event"`. Acrescentar 'comentarios' a OWNER_LIST_VIEWPORT_SLUGS.
    10. Detalhe do vídeo de 41 s: rótulos "0:00", "0:20" e "0:41". `&vista=publicacoes&post=op-41`: "Inscritos em eventos nos 7 dias seguintes" e "Workshop, 01/10: 11 inscritos". Visão geral, Por tipo e um tipo aberto: nenhum texto com "por post"; tipo aberto de vídeo: exatamente um "exemplo". Trocar os textos fixados que mudaram ("Interações por publicação" etc.).

    Commit `feat(quick-261013-orf): compact publication cards and owner-level list thumbnails` (corpo com E-01, D-01 nível 4, E-03.5/6/9, PD-D/PD-I/PD-J/PD-N e os checks).
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/web exec vitest run components/dashboard/CoverThumb.test.tsx components/dashboard/OwnerMemberList.test.tsx && pnpm typecheck && cd apps/web && pnpm exec playwright test --config playwright.preview.config.ts --grep "dono-do-cliente (membros|conteudo)|membro(:| \?lista=)"</automated>
  </verify>
  <done>
    - RED falhou por variante/miniatura ausente; GREEN deixa as unidades, o typecheck e os grupos e2e verdes.
    - Melhores publicações, Publicações, tipo aberto e listas de métrica mostram cartões compactos; o detalhe não tem faixa cinza e mostra "Assistir" desativado em vídeo/story.
    - Listas do membro no nível 4 com miniatura (Dias ativos sem); retenção em tempo do vídeo; "Inscritos … nos 7 dias seguintes"; nenhum "por post"; uma nota de exemplo no tipo aberto.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Tarefa 4: comentários a responder (E-02), pessoas e faixas de Conteúdo (E-03.2, .3, .7, .8, .10), miniatura em Interações (D-01), README, gate completo, capturas e servidor</name>
  <files>apps/web/lib/owner-content-view.ts, apps/web/lib/owner-content-view.test.ts, apps/web/components/dashboard/OwnerContentReplies.tsx, apps/web/components/dashboard/OwnerContentReplies.test.tsx, apps/web/components/dashboard/OwnerContent.tsx, apps/web/components/dashboard/OwnerContentOverview.tsx, apps/web/components/dashboard/OwnerContentPeople.tsx, apps/web/components/dashboard/BandMembers.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts, packages/modules/dashboard/README.md</files>
  <read_first>
    - apps/web/lib/owner-content-view.ts linhas 27-240 (OwnerContentView, parseOwnerContentView, ownerContentHref, contentBackHref, contentTabView) e o teste
    - apps/web/components/dashboard/OwnerContentOverview.tsx linhas 185-232 (attentionPosts, Attention) e 380-416 (Bands)
    - apps/web/components/dashboard/OwnerContentPeople.tsx (inteiro)
    - apps/web/components/dashboard/BandMembers.tsx linhas 60-186 (BandSummary, MemberCard)
    - apps/web/components/dashboard/OwnerContent.tsx linhas 100-122 (despacho)
    - apps/web/e2e-preview/painel-preview.spec.ts linhas 1895-2110 (Visão geral, atenção, faixas, pessoas, CONTENT_OVERVIEW_VIEWS)
  </read_first>
  <behavior>
    - owner-content-view.test.ts: `{ responder: 'op-24' }` → `reply: 'op-24'`, demais níveis null; `{ responder: 'op-11' }` (sem atenção), `{ responder: 'xyz' }`, `{ numero: 'interacoes', responder: 'op-24' }`, `{ faixa: 'superfas', responder: 'op-24' }` e `{ vista: 'tipos', responder: 'op-24' }` → `reply: null`; `{ responder: 'op-24', post: 'op-11', quem: 'curtidas' }` → reply op-24 e post/quem null; `ownerContentHref` round-trip termina em `&responder=op-24`; `contentBackHref` de reply = `/painel-preview/dono-do-cliente?area=conteudo#atencao-op-24`; `contentAttentionAnchor('op-24')` = `atencao-op-24`; `needsAttention` aceita só op-24, op-19, op-12 e op-08.
    - OwnerContentReplies.test.tsx: com `reply: 'op-19'`, a tela tem uma miniatura, a legenda do item, a linha "9 comentários sem resposta · o mais antigo há 8 dias", 9 itens; o primeiro lê "Comentou há 8 dias"; cada item tem nome, faixa, um texto e um botão "Responder" desativado.
  </behavior>
  <action>
    RED: os casos acima. Ver falhar. Commit `test(quick-261013-orf): pin the unanswered comments screen and its link`.

    GREEN, E-02 + E-03.10 (PD-K, PD-E):
    1. owner-content-view.ts: `ATTENTION_HOURS = 24` e `needsAttention(item)` (comentário sem resposta há mais de 24 h); `contentAttentionAnchor(postId)` = `atencao-<id>`; `OwnerContentView.reply: string | null`; `parseOwnerContentView` lê `responder` logo depois de `faixa`: só na Visão geral sem `numero` e sem `faixa`, só um id de item com `needsAttention`; com reply, post/quem/membro/lista ficam null; `ownerContentHref` põe `&responder=` logo depois de `faixa`; `contentBackHref` de reply = a Visão geral + `#atencao-<id>`; `contentTabView` com `reply: null`. Atualizar JSDocs (lista de níveis).
    2. Novo OwnerContentReplies.tsx (`{ t, view }`): BackLink (`tenantOwner.memberDetail.back`); `PanelSection` prominent com título `tenantOwner.content.replies.title` ("Comentários sem resposta"); cabeçalho em linha com `CoverThumb` (linha), a legenda e a meta; a linha de contagem com a mesma chave `overview.attention.row` (contagem = comments − answered, idade = `contentAgeText` de `oldestUnansweredHours`); um `Card` com `ul divide-y` dos `ownerContentUnanswered(id)`: nome em negrito + faixa (`bandLabel`), o texto (`text-sm`, quebra livre), "Comentou {momentText}" (`replies.when`) e `PreviewAction` "Responder" (`replies.reply`). JSDoc: único leitor de `ownerContentUnanswered`; mostra o texto por decisão E-02. OwnerContent.tsx: `if (view.reply)` antes de `postId`.
    3. OwnerContentOverview.tsx: `attentionPosts` usa `needsAttention`; cada linha leva a `ownerContentHref({ ...contentTabView('overview'), reply: item.id })`, com `id={contentAttentionAnchor(item.id)}`, a `CoverThumb` (linha) da publicação primeiro e o `AlertTriangle` pequeno (14) ao lado da contagem.

    GREEN, E-03.2, E-03.3, E-03.7, E-03.8:
    4. BandMembers.tsx: exportar `BandSummary` com `label?: string` (substitui o texto padrão; a barra continua); `MemberCard` ganha `lead?: string` (linha `text-sm font-semibold text-text` logo abaixo do nome).
    5. OwnerContentPeople.tsx: `PeopleCards` recebe `leadOf`, `showBand` e `moreText`; em `OwnerContentPeople`, lead = `people.when.<who>` ("Curtiu {when}", "Comentou {when}", "Salvou {when}", "Compartilhou {when}") com `momentText(t, person.when)` e "e mais" = `people.more.<who>` (unidade da lista); em `InteractorList`, lead = `people.when.interacted` ("Interagiu {when}"), "e mais N membros" como hoje, e `showBand` false quando a faixa é fixa (some o "Faixa:" redundante). `InteractionList`: `CoverThumb` (linha) da publicação como primeiro filho do link (D-01).
    6. OwnerContentOverview `Bands`: só as faixas com interação viram `Collapsible`, com `summary={<BandSummary … label={t('…bands.summary', …)} />}` ("{count, plural, =0 {nenhum membro} one {# membro} other {# membros}} · {percent} da faixa"); Em risco e Inativos viram uma linha estática `bands.idle` ("Em risco e Inativos: ninguém curtiu nem comentou em 30 dias — é o que define essas faixas."), sem seta; apagar `bands.none` se ficar sem uso.
    7. dashboard.json: `people.count.comments` termina em "· sem resposta primeiro, depois os mais recentes"; `=0` em `people.count.*` ("nenhuma curtida", "nenhum comentário", "nenhum salvamento", "nenhum compartilhamento"), em `detail.interactions`, em `people.more.*` e em toda chave plural nova; chaves `replies.*`, `people.when.*`, `people.more.*`, `bands.summary`, `bands.idle`.

    e2e (painel-preview.spec.ts):
    8. E-02: da Visão geral, a primeira linha de atenção tem uma miniatura e leva a `?area=conteudo&responder=op-24`; a tela mostra a legenda de op-24, a mesma linha "2 comentários sem resposta · o mais antigo há 10 dias" (250 h), 2 itens, o primeiro com "Comentou há 10 dias", "Responder" desativado com `aria-describedby`; Voltar termina em `?area=conteudo#atencao-op-24` e a linha fica na tela; `responder=op-19` tem 9 itens; `responder=op-11`, `responder=xyz` e `numero=interacoes&responder=op-24` caem na Visão geral/lista sem a tela. Acrescentar `&responder=op-19` a CONTENT_OVERVIEW_VIEWS (largura e iPhone).
    9. E-03.10: na Visão geral, todos os `id` que começam com `post-` ou `atencao-` são únicos.
    10. E-03.2/7/8: curtidores de op-11 — o primeiro cartão tem a linha "Curtiu hoje …", "Curtiu ontem …" ou "Curtiu há N dias" (`/^Curtiu (hoje|ontem|há \d+ dias)/` no texto do lead); comentadores de op-11 — contagem com "sem resposta primeiro, depois os mais recentes" e "e mais N comentários" com N = total − cartões; `&vista=publicacoes&post=op-57&quem=compartilhamentos` mostra "nenhum compartilhamento".
    11. E-03.3: Quem interage tem 4 faixas abríveis, a de Novos com "41 membros · 43% da faixa", e a linha estática de Em risco/Inativos sem link nem `details`; dentro de Superfãs nenhum cartão tem "Faixa:".
    12. Interações: miniaturas = `listitem`, `aria-hidden`, e o nome acessível do link da primeira linha começa pelo nome em negrito.

    README (inglês): miniatura (`CoverThumb`, linha e cartão; decorativa; com dados reais vira a mídia via `MediaImage`, packages/core/ui/MediaImage.tsx, e o degradê fica só para posts sem mídia), cartão compacto e capa do detalhe, a tela `responder` na cascata, a mudança de privacidade (o texto dos comentários sem resposta aparece para a equipe do cliente no nível 4; o aviso de privacidade precisa dizer isso), as âncoras `atencao-`, e as listas de pessoas com o "quando".

    Gate completo (verify). Capturas em largura de celular (390×844, claro, não versionadas) em `.planning/quick/261013-orf-capa-da-publicacao-nas-listas-de-curtida/screens/` com `pnpm --filter @rede-social/web exec playwright screenshot --channel chrome --viewport-size "390,844" --color-scheme light <url> <png absoluto>`: `01-membro-curtidas.png` = `http://localhost:3000/painel-preview/membro?lista=curtidas#lista`; `02-membro-videos.png` = `…/membro?lista=videos#lista`; `03-dono-curtidas-membro.png` = `…/dono-do-cliente?area=membros&faixa=superfas&membro=om-13&lista=curtidas#lista`; `04-publicacoes-compactas.png` = `…/dono-do-cliente?area=conteudo&vista=publicacoes`; `05-comentarios-a-responder.png` = `…/dono-do-cliente?area=conteudo&responder=op-19`. Olhar as cinco (miniaturas, tons, texto quebrando, selos legíveis, nada cortado); corrigir e refazer se não.

    Ao final: se a 3000 não estiver escutando, religar com o comando de sempre; confirmar 200 em `/painel-preview/membro?lista=curtidas` (curl -m 30). Commit `feat(quick-261013-orf): reply-pending comments screen and clearer content people lists` (corpo com E-02, E-03.2/3/7/8/10, D-01 Interações e o resultado de cada gate). Não versionar `screens/` nem "* 2*".
  </action>
  <verify>
    <automated>cd "/Users/macos/Desktop/rede social/rede-social" && export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder && pnpm --filter @rede-social/web exec vitest run lib/owner-content-view.test.ts components/dashboard/OwnerContentReplies.test.tsx && pnpm lint && pnpm typecheck && pnpm test && pnpm boundaries && pnpm check:static-routes && (cd apps/web && pnpm exec playwright test --config playwright.preview.config.ts) && git diff --quiet 387a7fc4 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts && test -z "$(find apps/web/components/dashboard apps/web/lib apps/web/e2e-preview apps/web/messages packages/modules/dashboard \( -name '* 2*' -o -flags +dataless \) -print)" && ls .planning/quick/261013-orf-capa-da-publicacao-nas-listas-de-curtida/screens/0[1-5]-*.png && test "$(curl -s -m 30 -o /dev/null -w '%{http_code}' 'http://localhost:3000/painel-preview/membro?lista=curtidas')" = 200</automated>
  </verify>
  <done>
    - RED falhou por parâmetro/componente ausente; GREEN deixa verdes as unidades e todos os gates (lint com check-ui-literals, typecheck, test, boundaries, check:static-routes, suíte inteira do preview).
    - Precisa de atenção abre os comentários a responder, com a contagem igual à da linha e Voltar na âncora `atencao-`; pessoas de Conteúdo com "quando"; faixas sem interação numa linha estática; "e mais" e `=0` corretos; Interações com miniatura.
    - Trava de produção sem diff desde 387a7fc4; nenhum "* 2*" nem dataless; README atualizado; 5 capturas inspecionadas e não versionadas; 200 na 3000.
    - Oito commits no total (quatro RED, quatro GREEN); nada publicado.
  </done>
</task>

</tasks>

<threat_model>
## Fronteiras de confiança

| Fronteira | Descrição |
|-----------|-----------|
| Query da URL → render no servidor | `responder` é novo e não confiável; os demais parâmetros seguem nos parsers existentes |
| Dados fictícios → gestão do cliente (nível 4) | nomes, faixas e agora o texto dos comentários sem resposta aparecem para a equipe do cliente |
| Rota de preview → produção | o preview não pode ficar acessível em produção |

## Registro STRIDE

| ID | Categoria | Componente | Severidade | Disposição | Plano |
|----|-----------|------------|------------|------------|-------|
| T-orf-01 | Tampering | `parseOwnerContentView` (`responder`) | low | mitigate | Valor exato de uma lista permitida (`needsAttention`), só na Visão geral sem número nem faixa; testes de unidade e e2e com ids forjados caindo um nível |
| T-orf-02 | Information disclosure | OwnerContentReplies, `ownerContentUnanswered` | medium | accept | Decisão do usuário E-02 (substitui a regra "texto nunca" da 261013-h51): só comentários sem resposta, só no nível 4, um único componente lê a função; README registra que o aviso de privacidade precisa dizer isso antes dos dados reais |
| T-orf-03 | Repudiation (dado enganoso) | fixtures de pessoas e alcance | medium | mitigate | Testes provam: nenhuma lista com número abre vazia, os mesmos fatos nos dois sentidos, o teto dos itens recém-publicados, Inativos fora do alcance, a contagem da tela de respostas igual à da linha; as pílulas "exemplo" não mudam |
| T-orf-04 | Elevation of privilege | proxy.ts, painel-preview/layout.tsx, lib/dashboard-preview.ts | high | mitigate | `git diff --quiet 387a7fc4` nos três arquivos no verify final; nenhum está em files_modified |
</threat_model>

<verification>
- Cada tarefa tem o verify verde antes de seguir; as quatro são TDD (RED falhando pelo motivo certo, depois GREEN).
- Gate final (Tarefa 4) com o ambiente provisório: lint (com check-ui-literals), typecheck, test, boundaries, check:static-routes e a suíte Playwright do preview inteira; trava de produção sem diff desde 387a7fc4.
- Largura: os laços de 360/390/430 e de 1440×900 cobrem as listas do nível 7, as quatro listas com miniatura do nível 4, Conteúdo (Visão geral, números, Interações, `responder=op-19`), Publicações e o detalhe.
- Só o processo que escuta a 3000 pode ser parado; o Chrome nunca. 200 em `/painel-preview/membro?lista=curtidas` no fim.
- Sem push, sem publicar; `screens/` e cópias "* 2*" nunca versionados.
</verification>

<success_criteria>
- D-01..D-04: miniatura decorativa à esquerda em toda linha de publicação (nível 7, nível 4, Interações, Precisa de atenção), mesma capa de Conteúdo, tom por publicação; tipos do nível 7 coerentes, com teste.
- E-01: cartão compacto com miniatura de ~7rem na proporção e os 4 números; detalhe sem faixa cinza, com "Assistir" desativado.
- E-02: tela de comentários a responder com texto, contagem igual à da linha, do mais antigo ao mais novo, Voltar na âncora.
- E-03.1..10 corrigidos como descrito nas tarefas; E-03.11 registrado no SUMMARY.
- Gates verdes, 5 capturas inspecionadas, 200 na 3000.
</success_criteria>

## Auditoria de fontes

| Fonte | Item | Coberto por |
|-------|------|-------------|
| GOAL | capa nas listas de curtidas, comentários, salvamentos e afins | Tarefas 1, 3 e 4 |
| CONTEXT | D-01 nível 7 / nível 4 / Interações | T1 passos 6-7; T3 passo 4; T4 passo 5 |
| CONTEXT | D-02 forma, capa igual, duração, anel, texto, tom, README | T1 passos 3-5; T4 README |
| CONTEXT | D-03 tipo no PostRef + nível 4 + teste | T1 passos 1-2; T2 behavior |
| CONTEXT | D-04 aria-hidden, nome acessível | T1 passo 4; T4 e2e passo 12 |
| CONTEXT | E-01 cartão compacto, capa do detalhe, ▶, fim das faixas cinzas | T3 passos 1-3 e 8 |
| CONTEXT | E-02 tela de comentários a responder, miniatura na linha, contagem, Voltar | T2 passo 5 (dados); T4 passos 1-3 e 8 |
| CONTEXT | E-03.1 pessoas ≥ min(total, 10), coerente, unidade + e2e | T2 passos 1-4 e 8 (com PD-L) |
| CONTEXT | E-03.2 "quando" e ordem dos comentários | T4 passos 5, 7 e 10 |
| CONTEXT | E-03.3 faixas com interação, BandSummary, linha estática, sem "Faixa:" | T4 passos 4-6 e 11 |
| CONTEXT | E-03.4 Inativos ≈ 0, Em risco baixo, teste | T2 passos 6-7 |
| CONTEXT | E-03.5 eixo da retenção em tempo | T3 passos 5 e 10 |
| CONTEXT | E-03.6 inscritos | T3 passos 6 e 10 |
| CONTEXT | E-03.7 "e mais N" na unidade certa | T4 passos 5 e 10 |
| CONTEXT | E-03.8 `=0` | T4 passos 7 e 10 |
| CONTEXT | E-03.9 "por publicação" e uma nota de exemplo | T3 passos 7 e 10 |
| CONTEXT | E-03.10 âncoras prefixadas | T4 passos 1, 3 e 9 |
| CONTEXT | E-03.11 registro no SUMMARY | output |
| CONTEXT | Verificação: gates, e2e de miniatura por linha e largura, capturas, 200 | T1, T3, T4 |
| REQ | V2-PLAT-04, PWA-03, MOD-02, UI-03 | painel; catálogo pt-BR; fixtures só com dados; só tokens |
| RESEARCH | não há RESEARCH.md nesta quick | — |

<output>
Criar `.planning/quick/261013-orf-capa-da-publicacao-nas-listas-de-curtida/261013-orf-SUMMARY.md` em pt-BR, como o de 261012-ri4: tabela de commits; D-01..D-04 e E-01..E-03 como aplicados, com PD-A..PD-N; os números que mudaram com os dados (Taxa, Alcance, Visualizações, KPIs de comentários e ações fortes dos membros, contagens "e mais") e o teto de op-01/op-02/op-03/os-01; tabela de evidência dos gates (comando → resultado); o 200 no fim; as cinco capturas e o que se viu; desvios do plano; a nota E-03.11 ("a mensagem do commit 387a7fc4 diz 'Not yet verified', mas o critic já verificou; o histórico não foi reescrito"); e, no fim, o bloco `**⚠️ NÃO FEITO**` com, no mínimo, as revisões `critic` e `flow-critic` dos novos commits se este executor não conseguir abrir subagentes.
</output>
