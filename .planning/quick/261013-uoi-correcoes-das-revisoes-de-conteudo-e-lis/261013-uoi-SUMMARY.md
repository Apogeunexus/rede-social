---
phase: quick-261013-uoi
plan: 01
subsystem: dashboard-preview
status: complete
tags: [dashboard, preview, owner-member-lists, owner-member-insights, content, line-chart, cover-thumb, pt-BR]
requires:
  - quick-261013-orf (listas com capa, cartão compacto, comentários sem resposta)
provides:
  - atividade realista dos membros fictícios (168 comentários, no máximo 2 por dia)
  - momentHoursAgo (espera em horas vira dia e horário a partir das 23:00)
  - um horário por ação no último dia de cada membro
  - rótulo final do LineChart sem colisão
  - cartão compacto com coluna fixa de 4,5rem, story em círculo, tons por ângulo
  - "quando" num formato só, linha da amostra, cabeçalho das respostas como link
affects:
  - packages/modules/dashboard (fixtures e LineChart)
  - apps/web/components/dashboard, apps/web/lib/owner-content-view.ts, catálogo pt-BR
tech-stack:
  added: []
  patterns:
    - orçamento de comentários por faixa colocado em três passadas determinísticas
    - horário carimbado por ação no último dia (35 min entre ações)
key-files:
  created: []
  modified:
    - packages/modules/dashboard/fixtures/owner-members.ts
    - packages/modules/dashboard/fixtures/owner-member-lists.ts
    - packages/modules/dashboard/fixtures/owner-member-insights.ts
    - packages/modules/dashboard/fixtures/owner-content.ts
    - packages/modules/dashboard/fixtures/owner-posts.ts
    - packages/modules/dashboard/README.md
    - packages/modules/dashboard/ui/LineChart.tsx
    - apps/web/components/dashboard/CoverThumb.tsx
    - apps/web/components/dashboard/format.ts
    - apps/web/components/dashboard/OwnerContentPeople.tsx
    - apps/web/components/dashboard/OwnerContentReplies.tsx
    - apps/web/lib/owner-content-view.ts
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "Tabela de comentários PD-A (superfã 6–9, engajado 3–5, ocasional 1–2, novo 0–2): 168 no total"
  - "O agora do preview é 23:00 de 12/10; toda espera vira dia e horário por momentHoursAgo"
  - "Cartão de capa horizontal: ícone menor à esquerda do selo de duração (desvio, Regra 1)"
metrics:
  completed: 2026-10-14
  duration: "noite de 13/10 a 14/10 (o relógio de parede inclui a máquina suspensa durante uma rodada do Playwright)"
actuals:
  tokens: 22000
  tasks: 3
  commits: 7
---

# Quick 261013-uoi: correções das revisões de Conteúdo e listas — Resumo

Membros fictícios com atividade crível (168 comentários em vez de 527, no máximo 2 por dia e um horário por ação), esperas de comentário que batem com a data e a hora mostradas, eixo sem rótulos colados, cartão de vídeo horizontal sem quebra a 360 px, story em círculo, tons distintos, "quando" num formato só e cabeçalho de respostas clicável.

Branch da cópia isolada: `worktree-agent-a997c090370c23876`, por cima de `ecafca9b` (plano na `feat/painel-preview`). Sem publicar e sem push.

## Commits

| Tarefa | Tipo | Commit | O quê |
|---|---|---|---|
| 1 | test (vermelho) | eb83e4c6 | comentários por faixa, ≤ 2 por dia, ≤ 6 curtidas por dia, horários do último dia, esperas exatas |
| 1 | fix (verde) | 14623cff | tabela COMMENTS, momentHoursAgo, nova atribuição, horários por ação, README |
| 2 | test (vermelho) | 79b4716d | rótulos do eixo, coluna do cartão, story, tons |
| 2 | fix (verde) | daaa6b63 | LineChart, CoverThumb |
| 3 | test (vermelho) | 3f94f927 | "às" global, linha da amostra, cabeçalho das respostas, Voltar |
| 3 | feat (verde) | 166ab652 | catálogo, momentText, OwnerContentPeople, OwnerContentReplies, contentBackHref |
| — | fix (desvio) | e30a9577 | ícone do cartão horizontal livre do selo de duração |

Cada vermelho falhou pelo motivo certo antes do verde: `momentHoursAgo` ausente, om-13 com 13 comentários num dia e 13 "22:40", op-04 em "ontem às 12:35", "set" e "out" a 0,69 px, números do cartão 20 px abaixo, story quadrado, sem "às", sem linha da amostra, sem link e Voltar para `#post-op-19`.

## O que mudou

- **Decisão nova / C-1 / F-2:** `COMMENTS` voltou (PD-A). `assignRosterInteractions` coloca o orçamento todo de cada membro em três passadas: (a) as publicações com espera, (b) um comentarista para cada publicação ainda sem nenhum, (c) o resto, na publicação com menos comentaristas abaixo de min(comentários, 10). Ninguém comenta 3 vezes no mesmo dia. Toda lista com número > 0 tem de 1 a 10 pessoas (61/61 publicações com comentarista; no máximo 9 por publicação).
- **C-3:** `momentHoursAgo` (owner-members.ts) com `PREVIEW_NOW_TIME = '23:00'`. op-02 → om-13 hoje às 20:00; op-03 → om-15 hoje às 05:00 (+ om-16); op-04 → om-14 hoje às 14:00 ("há 9 h"); op-08 → 2 dias às 11:00; op-12 → 4 dias às 09:00; op-19 → 8 dias às 23:00 (9 comentaristas); op-24 → 10 dias às 13:00. Nenhum comentário da publicação é anterior ao mais antigo sem resposta.
- **F-1:** curtidas vão para o dia ativo com menos curtidas (máximo 6 num dia, om-36; antes até 23). No último dia, a primeira ação leva `lastActive.time` e cada próxima 35 min antes, pulando horários já fixados. om-13 hoje: 22:40, 22:05, 21:30 nas curtidas; comentários 20:55 e 20:00.
- **C-2:** o rótulo anterior ao último cai quando encostaria nele (largura estimada + 4 unidades). Nível 1: "set" some, "out" inteiro. S4/S8/S12 e 0:00/0:20/0:41 seguem.
- **F-3:** coluna fixa `w-[4.5rem]`; capa com largura min(4,5; 7 × proporção) rem e altura pela proporção. A 360/390/430 px: título em até 2 linhas, os 4 números numa linha, texto com a mesma largura em todo cartão.
- **F-5:** story com `rounded-full`, anel da marca e ícone `CircleDashed` (o ▶ "Assistir" do detalhe não mudou).
- **F-6:** tons = ângulos 0/72/144/216/288 de `linear-gradient(<ângulo>deg, var(--brand-primary), var(--brand-secondary))`.
- **F-4:** a chave global `moment` diz "às" quando há horário; `momentText` passa `timed`; `people.moment` e `personMoment` foram apagados. O catálogo tem uma só chave `moment`.
- **Linha da amostra (PD-K):** "Mostrando quem está na amostra de membros." logo antes de "e mais N" quando a lista é menor que o número.
- **F-7:** miniatura + legenda + meta da tela de respostas formam um `Linked` para `?area=conteudo&post=<id>`, com chevron e anel de foco. O Voltar desse detalhe vai para `#atencao-<id>` (a Visão geral não tem cartão `post-` para publicação que precisa de atenção); o Voltar da tela de respostas não mudou.

## Comparação com 2f39aec6

Sonda tsx sobre `packages/modules/dashboard/fixtures` de 2f39aec6 (extraída com `git archive`, fora do repositório) e sobre o HEAD.

| Faixa | Comentários em 30 dias (2f39aec6 → agora) | Ações fortes (2f39aec6 → agora) |
|---|---|---|
| superfã (12) | 54 (3–6 por membro) → 90 (6–9) | 88 (6–9) → 124 (9–12) |
| engajado (12) | 24 (1–3) → 48 (3–5) | 51 (3–6) → 75 (5–8) |
| ocasional (12) | 6 (0–1) → 18 (1–2) | 10 (0–2) → 22 (1–3) |
| novo (12) | 12 (0–2) → 12 (0–2) | 31 (1–5) → 31 (1–5) |
| em risco / inativo (24) | 0 → 0 | 0 → 0 |
| **Total** | **96 → 168** (527 na orf) | **180 → 252** |

- Curtidas, dias ativos, check-ins e pedidos: iguais nos 72 membros (zero diferenças na sonda).
- Por que os comentários sobem em relação a 2f39aec6: a faixa travada no CONTEXT começa em 6 para superfã, 3 para engajado e 1 para ocasional, acima dos mínimos antigos (3, 1 e 0). A PD-A fica no piso de cada faixa, o mais perto possível de 2f39aec6. As ações fortes sobem exatamente o mesmo tanto (comentários + check-ins + pedidos).
- `communities[0].actions` mudou só para **om-03** (novo, j=2): 10 → 11, pelo `Math.max` da orf (curtidas + comentários + check-ins + pedidos = 11 > 10 desde a entrada).

## Decisões

- **PD-A a PD-L do plano** seguidas como escritas. Em (c), os membros vão na ordem do roster, como o plano diz explicitamente; o ranking por faixa vale em (a) e (b).
- **Tons (F-6):** os ângulos aumentam a variação, mas o contraste fica limitado pelo par da marca. No tenant do preview `--brand-primary` (#2e6fd0) e `--brand-secondary` (#5b9cf8) são dois azuis, então os tons continuam próximos. Usamos só tokens da marca, como o CONTEXT exige.
- **Cartão horizontal (desvio, Regra 1):** com a coluna de 4,5rem, uma capa 16:9 fica com cerca de 2,5rem de altura. Na captura a 360 px, o selo "27:00" cobria o ▶. Agora a capa horizontal tem ícone de 18 px à esquerda e selo compacto à direita.
- **Revisões critic e flow-critic** ficam com o orquestrador, como pedido no plano; não foram rodadas aqui.

## Desvios do plano

### Corrigidos automaticamente

1. **[Regra 1 - Premissa de teste] e2e "the commenters put the unanswered first" passou de op-12 para op-24.** Com a atividade realista, os 4 comentaristas do roster em op-12 são todos sem resposta; op-24 tem sem resposta e respondidos. A asserção continua a mesma. Commit 14623cff.
2. **[Regra 1 - Premissa de teste] Largura do cartão no CoverThumb.test lida como número.** O happy-dom normaliza `4.500rem` para `4.5rem`. O teste confere a unidade `rem` e o valor exato (3,938 / 4,5 / 4,5). Commit daaa6b63.
3. **[Regra 1 - Premissa de teste] e2e F-7:** a seção "Interações" do detalhe é `h4`, abaixo do título `h3` da publicação. O teste agora confere os dois. Commit 166ab652.
4. **[Regra 1 - Bug] Selo de duração sobre o ícone na capa 16:9.** Causado pela coluna fixa da Tarefa 2; teste novo e correção no commit e30a9577.

### Ambiente

- Durante a primeira rodada do grep da Tarefa 2, a máquina ficou suspensa (7,3 h de relógio). 28 casos estouraram tempo, inclusive `browserType.launch`, sem nenhuma asserção falhando. Todos passaram ao rodar de novo (25 + 3), e a suíte inteira depois passou duas vezes (208/208).

## Verificação

Com o ambiente provisório (`API_URL=http://127.0.0.1:8787`, `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder`):

- `pnpm lint`: verde, com a guarda de literais (check-ui-literals OK).
- `pnpm typecheck`: verde (18/18 tarefas).
- `pnpm test`: verde; web 120 arquivos / 2487 testes, módulo dashboard 13 / 309.
- `pnpm boundaries`: 1.313 arquivos em 16 pacotes, nenhum problema.
- `pnpm check:static-routes`: 74 rotas protegidas, 0 infratores.
- Playwright do preview inteiro contra um servidor próprio na porta 3400, com config temporária não versionada: **208/208** (5,2 min), duas vezes.
- Trava de produção: `git diff --quiet eeab1d39 -- apps/web/proxy.ts apps/web/app/painel-preview/layout.tsx apps/web/lib/dashboard-preview.ts` → sem diff.
- Catálogo: `grep -c '"moment":'` = 1.
- A 3000 (checkout principal) responde 200 em `/painel-preview/membro?lista=curtidas`; ela não foi parada.
- Capturas, não versionadas, em `screens/`: `01-om13-curtidas.png` (390), `02-tipo-video-360.png`, `03-membro-stories.png` (390) e `04-nivel1-clientes-ativos.png` (360). Todas foram inspecionadas.

## Observação fora do escopo

O evento u1 "Encontro mensal" aparece como próximo hoje às 19h (`tenant-owner.ts:545-549`), mas há membros ativos hoje até 22:40 e check-ins carimbados hoje. A contradição já existia antes desta quick e não foi mexida.

## Known Stubs

Nenhum novo.

## Self-Check: PASSED

- Arquivos: todos os key-files existem; as 4 capturas existem em `screens/`.
- Commits: eb83e4c6, 14623cff, 79b4716d, daaa6b63, 3f94f927, 166ab652 e e30a9577 estão no `git log`.

## Revisões e integração (orquestrador)

- **Integração:** os commits entraram na `feat/painel-preview` por avanço simples (HEAD 0eef01e2). A cópia separada foi removida.
- **Revisão de comportamento: APROVADO.** Dois achados baixos:
  1. A âncora do Voltar do detalhe escolhe a linha de atenção quando a publicação está nas duas seções (Atenção e Melhores). Hoje isso não acontece com os dados fictícios. Fica registrado como risco latente.
  2. Este SUMMARY dizia "de 1 a 10 pessoas" para toda lista. Os dados de curtidas têm até 16 pessoas, e a tela corta em 10. A regra vale para a tela, e para comentários vale também nos dados (no máximo 9).
- **Revisão de fluxo: APROVADO.** Os 4 achados baixos foram corrigidos em 26932391:
  - tons com profundidade (luminosidade) além do ângulo, só com tokens da marca;
  - toda ação de "ontem" com horário, começando num minuto próprio de cada membro;
  - ícone do story trocado por `Aperture`;
  - "nenhum" no lugar de "nenhuma".
- **Checks finais:** lint 16/16, typecheck 18/18, testes 15/15, boundaries limpo, Playwright do preview 208/208.
