---
phase: quick-261012-ri4
plan: 01
status: complete
subsystem: dashboard-preview (nível 4, área Membros)
tags: [dashboard, preview, tenant-owner, engagement-bands, member-insights, pt-BR]
requires: [quick-261012-qer]
provides:
  - ownerBandIncludes(scope, band, memberId): a mesma pertença que as listas das faixas usam
  - parseOwnerMembersView só abre o membro que está na faixa e no recorte da URL (R-5)
  - cabeçalho dos insights com a faixa na comunidade e a faixa na base toda quando diferem (R-4)
  - cartão do membro no tamanho do desenho, com chevron e uma pílula "exemplo" por lista (R-1..R-3)
affects: [apps/web área Membros do painel do dono do cliente, packages/modules/dashboard fixtures]
tech-stack:
  added: []
  patterns:
    - scopeEntry privado compartilhado por ownerBandList e ownerBandIncludes (uma regra de pertença)
    - parâmetro de URL validado contra os outros parâmetros (membro só com a faixa que ele tem no recorte)
key-files:
  created: []
  modified:
    - packages/modules/dashboard/fixtures/owner-members.ts
    - packages/modules/dashboard/fixtures/index.ts
    - packages/modules/dashboard/tests/owner-members.test.ts
    - apps/web/lib/owner-band-scope.ts
    - apps/web/lib/owner-band-scope.test.ts
    - apps/web/components/dashboard/OwnerMemberDetail.tsx
    - apps/web/components/dashboard/BandMembers.tsx
    - apps/web/components/dashboard/BandMembers.test.tsx
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "A pertença é checada contra a faixa inteira no recorte (roster), não só contra os 10 listados"
  - "'Hoje (base toda)' e 'Sugestão de ação (base toda)' em todo recorte: Evolução e sugestão seguem sempre a faixa da base toda"
  - "A linha 'Tempo médio diário: valores de exemplo' só aparece quando algum valor listado é exemplo"
  - "O cabeçalho lê a faixa da comunidade de view.band, que o parser garante ser a faixa do membro no recorte"
metrics:
  duration: ~12 min
  completed: 2026-10-12
actuals:
  tokens: 9000
  tasks: 2
  commits: 4
---

# Quick 261012-ri4: acabamento do cartão e da tela do membro — Resumo

Cartão do membro no tamanho do desenho (avatar de 48 px, nome `text-lg` em negrito, linhas `text-sm` com rótulo cinza e valor escuro, chevron à direita), uma única pílula "exemplo" por lista aberta, insights que mostram "Ocasional em Eventos" + "Engajado na base toda" quando a faixa na comunidade difere da base, e `membro` aceito só quando ele está na `faixa` e no recorte da URL.

## Commits

| # | SHA | Tipo | Mensagem |
|---|-----|------|----------|
| 1 | 1518e89b | test (RED) | pin member links to their band and scope |
| 2 | 441605d3 | feat (GREEN) | open a member only from their own band and show both bands in a community |
| 3 | 419ee0bf | test (RED) | pin the bigger member card, its chevron and one example pill per list |
| 4 | 1b130e8d | feat (GREEN) | member card as drawn, with a chevron and one example pill per list |

RED 1 falhou como esperado (`ownerBandIncludes is not a function`; om-13 abria sem `faixa`). RED 3 falhou 4/8 por asserção (pílula "exemplo" no cartão, sem `size-12`, sem `svg`, 10 pílulas na faixa).

## Ajustes aplicados

- **R-1** (`BandMembers.tsx`): `Card` com `p-4 gap-4 items-start`; avatar `size-12` com `text-base font-bold`; nome `text-lg font-bold leading-tight text-text`; `CardLine` em `text-sm` com `dt` `text-text-secondary` e `dd` `text-text`; coluna de texto mantém `min-w-0 flex-1 [overflow-wrap:anywhere]`, `gap-2`, `dl` `gap-1`.
- **R-2** (`BandMembers.tsx` + catálogo `tenantOwner.bandMembers.exampleNote`): pílula removida da linha "Tempo médio diário" do cartão; no topo da lista aberta, um bloco `flex flex-col gap-1` com "Os 10 com atividade mais recente" (quando há mais de 10) e "Tempo médio diário: valores de exemplo" + `ExamplePill` (quando algum valor listado é exemplo). O KPI "Tempo médio diário" dos insights mantém a pílula. A contagem de pílulas da área Membros no e2e passou de 60 para 6.
- **R-3** (`BandMembers.tsx`): `ChevronRight` `aria-hidden`, `size={18}`, `shrink-0 self-center text-brand` como último filho do cartão; o link continua envolvendo o cartão todo, então o nome acessível contém o nome do membro.
- **R-4** (`OwnerMemberDetail.tsx` + catálogo `memberDetail.bandIn`, `memberDetail.bandWhole`): no recorte por comunidade, quando `view.band` difere de `insights.band`, duas `StatusPill` num `flex flex-wrap gap-2` ("Ocasional em Eventos", "Engajado na base toda"); caso contrário, uma pílula como antes. Por evento não muda. `evolution.today` = "Hoje (base toda)", `suggestion.title` = "Sugestão de ação (base toda)". O guard agora também lança se `view.band` for nulo.
- **R-5** (`owner-members.ts`, `owner-band-scope.ts`): `scopeEntry` privado (Por membro: faixa da base; Por evento: idem só se inscrito; Por comunidade: `communities[id]`) alimenta `ownerBandList` (mesma saída) e o novo `ownerBandIncludes`, exportado em `fixtures/index.ts`. `parseOwnerMembersView` só devolve o `memberId` se `faixa` existe e `ownerBandIncludes(scope, band, id)`; senão `memberId` nulo com recorte e faixa mantidos (a área cai na lista com a faixa aberta, sem Voltar).

## Testes novos

- Unidade (dashboard): `ownerBandIncludes` — casos om-28 Eventos/VIP, om-13 VIP, om-61 u1, id fora do roster; concordância com todas as listas de todos os 12 recortes; ninguém em duas faixas do mesmo recorte.
- Unidade (web): URLs forjadas no parser (sem faixa, faixa errada, comunidade errada, evento sem inscrição); teste de id do roster agora com faixa correspondente.
- Componente: R-1 (classes), R-2 (uma pílula por faixa, nenhuma no cartão, nenhuma na faixa vazia), R-3 (um `svg` `aria-hidden` depois da coluna de texto).
- e2e: "a member demoted in a community shows both bands" (om-28 em Eventos e em VIP); "a member outside the named band or scope shows that list" (4 URLs forjadas, faixa aberta, aba/chip `aria-current`); om-28 Eventos no laço sem rolagem lateral a 360/390/430; por faixa e recorte, exatamente uma pílula e a linha de exemplo; fonte do nome 18px e da linha 14px; um `svg` no link.

## Evidência dos gates

| Comando | Resultado |
|---------|-----------|
| `pnpm lint` (inclui check-ui-literals) | exit 0, 16/16 tarefas; check-ui-literals OK |
| `pnpm typecheck` com env provisório | exit 0, 18/18 tarefas (sem o env, `web#build` falha só por `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ausente) |
| `pnpm test` | exit 0, 15/15 tarefas (web 2425, dashboard 241 testes) |
| `pnpm boundaries` | "Checked 1290 files in 16 packages, no issues found" |
| `pnpm check:static-routes` com env provisório | 74 rotas protegidas, 0 infratores, OK |
| Suíte Playwright preview completa | 158 passed (2,2 min) |
| `git diff --quiet 6ca062b1 -- proxy.ts painel-preview/layout.tsx dashboard-preview.ts` | sem diferença |
| `grep -rl ownerBandList apps/web/{app,components,lib}` | só BandMembers.tsx |
| `grep -rl ownerMemberInsights apps/web/{app,components,lib}` | só OwnerMemberDetail.tsx |
| `find … -name '* 2*'` nas pastas do plano | nada |

## Servidor local

Parado só o processo da porta 3000 (PID 97278, `next-server`), nunca o Chrome. Religado com o comando do CONTEXT (`nohup … > /tmp/rede-dev.log`), PID 6644. 200 em:
- `/painel-preview/dono-do-cliente?area=membros`
- `…?area=membros&recorte=comunidade&comunidade=eventos&faixa=ocasionais&membro=om-28`
- `…?area=membros&recorte=comunidade&comunidade=vip&faixa=superfas&membro=om-13` (URL forjada, cai na lista)

## Capturas (1440×900, claro, não versionadas)

- `screens/01-faixa-aberta-cartoes.png` — Engajados aberta: uma linha "Tempo médio diário: valores de exemplo" + pílula, cartões grandes com chevron.
- `screens/02-insights-rebaixado-eventos.png` — Rodrigo Aguiar com "Ocasional em Eventos" e "Engajado na base toda".

Inspecionadas: sem corte nem rolagem lateral.

## Desvios do plano

- O plano marca a Tarefa 1 como `tracer`. A configuração tem `auto_advance: false`, o que pediria um checkpoint humano depois dela; segui sem parar porque o orquestrador mandou executar todas as tarefas. O `<verify>` do tracer passou de ponta a ponta antes da Tarefa 2 (unidade 19/19 e 17/17, e2e "dono-do-cliente membros" 27/27).
- `pnpm typecheck` precisa do env provisório inline porque depende de `@rede-social/web#build`. Só muda o comando; o código não mudou.

## Observação fora do escopo

- Os testes "comunidade=vip at …px" chamam `openAllDetails` antes da hidratação, e o React mostra um aviso de hidratação (`open=""` vs `open={false}`) no log do servidor. Não quebra nada e já acontecia antes desta tarefa; não foi mexido.

## Self-Check: PASSED

- Commits 1518e89b, 441605d3, 419ee0bf, 1b130e8d presentes em `git log`.
- Capturas presentes em `screens/`.

**⚠️ NÃO FEITO**
- Revisão `critic` (comportamento hostil) dos commits 1518e89b..1b130e8d: este executor não consegue abrir subagentes; o orquestrador precisa rodar.
- Revisão `flow-critic` (completude de fluxo) dos mesmos commits: mesmo motivo; o orquestrador precisa rodar.
- STATE.md não foi atualizado por este executor (tarefa rápida; o orquestrador registra na tabela de quick tasks).


## Revisões (orquestrador, após a execução)

- **critic: APROVADO**, sem achados (equivalência `ownerBandIncludes` × `ownerBandList` conferida nos 72 pares; URLs forjadas caem na lista; faixa dupla correta; trava de produção intacta). O e2e de R-4/R-5 foi executado pelo executor (158/158).
- **flow-critic: APROVADO**, sem achados.
