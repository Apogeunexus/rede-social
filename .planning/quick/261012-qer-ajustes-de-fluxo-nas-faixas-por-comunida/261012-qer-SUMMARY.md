---
phase: quick-261012-qer
plan: 01
status: complete
subsystem: dashboard-preview (nível 4, área Membros)
tags: [dashboard, preview, tenant-owner, engagement-bands, member-insights, pt-BR]
requires: [quick-261012-pkd]
provides:
  - três abas de recorte nas faixas (Por membro | Por comunidade | Por evento)
  - faixas dos inscritos de cada evento (eventEngagement) e atRiskWithPush por comunidade e por evento
  - cartão do membro (iniciais, nome, quatro linhas rotuladas, tempo diário de exemplo)
  - "menos de 1%", barra mínima, aviso de corte em 10 com "Ver todos" desativado, faixa vazia
  - tela de insights do membro (ownerMemberInsights + OwnerMemberDetail) com Voltar para a faixa de origem
affects: [apps/web área Membros do painel do dono do cliente, packages/modules/dashboard fixtures]
tech-stack:
  added: []
  patterns:
    - builder puro de insights sobre o roster (um conjunto de dias ativos por membro alimenta tudo)
    - parâmetros de URL com lista de valores permitidos (recorte/comunidade/evento/faixa/membro)
key-files:
  created:
    - apps/web/lib/owner-band-scope.ts (git mv de owner-communities.ts)
    - apps/web/lib/owner-band-scope.test.ts (git mv de owner-communities.test.ts)
    - apps/web/components/dashboard/OwnerMemberDetail.tsx
    - apps/web/components/dashboard/BandMembers.test.tsx
    - packages/modules/dashboard/fixtures/owner-member-insights.ts
    - packages/modules/dashboard/tests/owner-member-insights.test.ts
  modified:
    - packages/modules/dashboard/fixtures/tenant-owner.ts
    - packages/modules/dashboard/fixtures/owner-members.ts
    - packages/modules/dashboard/fixtures/index.ts
    - packages/modules/dashboard/tests/tenant-owner.test.ts
    - packages/modules/dashboard/tests/owner-members.test.ts
    - packages/modules/dashboard/README.md
    - apps/web/app/painel-preview/[nivel]/page.tsx
    - apps/web/components/dashboard/TenantOwnerPanel.tsx
    - apps/web/components/dashboard/OwnerMembers.tsx
    - apps/web/components/dashboard/BandMembers.tsx
    - apps/web/components/dashboard/format.ts
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "A-4 mantém o <details>: faixa com 0 membros abre só a frase 'Nenhum membro nesta faixa.' (o corpo segue a contagem da faixa)"
  - "A pílula 'exemplo' fica em cada cartão, na linha 'Tempo médio diário'"
  - "O cartão 'Recuperar quem está em risco' segue todo recorte, inclusive os eventos"
  - "A linha 'Novos: X ativados de Y.' some no modo evento (todo inscrito agiu: seria sempre X de X)"
  - "Um ?comunidade= antigo sozinho cai em Por membro"
  - "Voltar reabre a faixa de origem por faixa= e cai em #faixas"
  - "Sugestão para ocasional diz 'Participa de vez em quando' (o plano repetia o texto do engajado, que seria falso)"
metrics:
  duration: "~30 min (commits 19:23 a 19:43)"
  completed: 2026-10-12
estimate:
  tokens: 260000
actuals:
  tokens: 28300
  tasks: 4
  commits: 9
---

# Quick 261012-qer: ajustes de fluxo nas faixas por comunidade, cartão do membro e insights do membro

Faixas do nível 4 com três abas de recorte (inclusive os inscritos de cada evento), cartão
por membro com faixas honestas ("menos de 1%", aviso de corte, faixa vazia) e, ao tocar no cartão,
os insights daquele membro, gerados por um builder puro e coerente com o roster e os totais do painel.

## Commits

| # | Tarefa | Commit | Mensagem |
|---|--------|--------|----------|
| 1 | T1 RED | 4af4af0d | test(quick-261012-qer): pin the event scope, the three scope tabs and the per-scope push reach |
| 2 | T1 GREEN | 01ddd6bb | feat(quick-261012-qer): scope the bands by member, community or event |
| 3 | T2 RED | eaf7911e | test(quick-261012-qer): pin the member card, the share floor, the list cap hint and the empty band |
| 4 | T2 GREEN | 53cf12d7 | feat(quick-261012-qer): member cards and honest band bodies |
| 5 | T3 RED | 2f0a935a | test(quick-261012-qer): pin the member insights' coherence with the roster and the panel totals |
| 6 | T3 GREEN | 251d9b16 | feat(quick-261012-qer): build each member's insights from the roster |
| 7 | T4 RED | 0c6457fe | test(quick-261012-qer): pin the member insights route and the way back to the band |
| 8 | T4 GREEN | 64c70d05 | feat(quick-261012-qer): open a member's insights from their band card |
| 9 | T4 docs | 050a4f02 | docs(quick-261012-qer): scope tabs, member cards, member insights and the privacy note |

Cada RED falhou por asserção ou export ausente antes do GREEN (T1: `eventEngagement` e o módulo
`owner-band-scope` ausentes; T2: 3 testes do roster e 4 do componente; T3: `ownerMemberInsights is not a
function`; T4: 7 testes do parser).

## O que foi aplicado

- **B-2, três abas.** "Recorte das faixas" virou `grid grid-cols-3` com Por membro | Por comunidade |
  Por evento (larguras iguais, testado em ±1 px). Por comunidade abre a segunda fileira "Comunidade das
  faixas" (VIP, Geral, Iniciantes, Eventos; padrão VIP). Por evento abre "Evento das faixas" com os 7
  eventos (u1, u2, u3, e4, e3, e2, e1, cada um "nome · dd/mm"; padrão "Encontro mensal · 12/10") e a
  nota "Encontro mensal · 12/10: 92 inscritos. Cada um aparece na faixa que tem hoje na base toda.".
  Todos são `<a>` comuns que mantêm `area=membros` e terminam em `#faixas`. O parser
  (`lib/owner-band-scope.ts`) só aceita strings únicas e exatas: `recorte` desconhecido, repetido,
  com caixa errada, vazio, com espaço, `__proto__` ou `constructor` → Por membro; `comunidade`/`evento`
  desconhecido sob `recorte` válido → o primeiro da fileira; `?comunidade=vip` sozinho → Por membro.
- **A-2.** O cartão "Recuperar quem está em risco" usa o em risco e o `atRiskWithPush` do recorte.
- **B-1.** Cada membro é um `Card` empilhado: círculo de iniciais na cor da marca (`aria-hidden`), nome
  em negrito `text-base` e um `<dl>` com "Membro desde: set. de 2026", "Última atividade: hoje às
  22:40" (ou "ontem às HH:MM", "há N dias"), "Comunidade que mais interage: Geral" (em todo recorte) e
  "Tempo médio diário: 18 min" com a pílula "exemplo" na mesma linha.
- **A-1.** Participação > 0 que arredonda para 0% lê "menos de 1%" (Eventos Superfãs "3 · menos de
  1%", Iniciantes "6 · menos de 1%") e a barra ganha `min-w-1.5` (≥ 6 px, e2e mede ≥ 5 px).
- **A-3.** Faixa com mais de 10: "Os 10 com atividade mais recente" no topo e, no fim, "e mais N
  membros" ao lado de "Ver todos" desativado (`PreviewAction`).
- **A-4.** Faixa com 0 membros abre só "Nenhum membro nesta faixa." (ao vivo nos Inativos de todo
  evento; teste de componente com em risco = 0).
- **B-3.** Tocar no cartão abre os insights em `&faixa=<slug>&membro=om-NN` (slugs novos, superfas,
  engajados, ocasionais, em-risco, inativos; ids do roster; inválido → a área normal). De cima para
  baixo: Voltar; cabeçalho (iniciais, nome em `<h3>`, pílula da faixa no singular, Membro desde,
  comunidade principal); Últimos 30 dias (Dias ativos, Curtidas, Comentários, Ações fortes, Tempo
  médio diário e Posts vistos com "exemplo"); Evolução (faixa há 60 dias, há 30 dias e hoje, mais o
  `LineChart` de 12 semanas); Onde interage (comunidades e tipos de post em `BarList`); Eventos (Foi /
  Não foi / Inscrito); Compras (valor, data, vencimento "exemplo"); Atendimento (só contagens e datas);
  Sugestão de ação por faixa com botão desativado. Voltar leva ao mesmo recorte com a faixa aberta em
  `#faixas`.

### Decisões do planejador (registradas)

- A-4 mantém o `<details>`; contagem 0 → frase.
- Pílula "exemplo" por cartão, na linha do tempo diário.
- O cartão de recuperação segue todo recorte, eventos incluídos.
- "Novos: X ativados de Y." escondido no modo evento (o rodapé fica).
- `?comunidade=` antigo sozinho cai em Por membro.
- Voltar reabre a faixa de origem por `faixa=`.

## Números por recorte

| Recorte | Novos | Superfãs | Engajados | Ocasionais | Em risco | Inativos | Com push |
|---------|------:|---------:|----------:|-----------:|---------:|---------:|---------:|
| Por membro (base) | 96 | 62 | 205 | 150 | 168 | 559 | 69 |
| Comunidade VIP | 14 | 38 | 61 | 33 | 22 | 18 | 11 |
| Geral | 96 | 41 | 150 | 170 | 190 | 593 | 78 |
| Iniciantes | 96 | 6 | 38 | 104 | 120 | 876 | 49 |
| Eventos | 96 | 3 | 22 | 88 | 97 | 934 | 40 |
| u1 Encontro mensal 12/10 (92) | 14 | 26 | 34 | 12 | 6 | 0 | 3 |
| u2 Live de dúvidas 15/10 (64) | 11 | 12 | 23 | 14 | 4 | 0 | 2 |
| u3 Imersão presencial 24/10 (40) | 3 | 15 | 16 | 4 | 2 | 0 | 1 |
| e4 Aula aberta 07/10 (61) | 9 | 9 | 21 | 17 | 5 | 0 | 2 |
| e3 Workshop 01/10 (50) | 6 | 16 | 18 | 7 | 3 | 0 | 1 |
| e2 Live de dúvidas 24/09 (148) | 5 | 28 | 62 | 41 | 12 | 0 | 5 |
| e1 Encontro set. 19/09 (100) | 1 | 30 | 45 | 18 | 6 | 0 | 3 |

Testado: cada evento soma o seu `confirmed`; nenhuma faixa passa a da base; ninguém inativo; em risco
≤ confirmados − check-ins nos eventos passados; superfãs + engajados = 229 de 359 inscritos passados
(> metade, como os 164 de 236 do `attendanceByBand`); `newActivated` = novos; 0 ≤ push ≤ em risco nos
12 recortes. No roster, os inscritos de cada evento × faixa são os primeiros min(contagem, 12) slots
elegíveis (nunca um evento passado anterior à entrada do membro).

## Insights do membro, em resumo

`ownerMemberInsights(id)` (puro, sem relógio nem aleatoriedade; `null` fora do roster) deriva tudo de
um conjunto de dias ativos por membro, nunca depois da última ação nem antes da entrada:

- 30 dias dentro da regra da faixa (superfã ≥ 12 dias e ≥ 3 ações fortes; engajado 4–11; ocasional
  1–3; em risco e inativo tudo 0; novo ≥ 1); ações fortes = comentários + presenças + compras.
- 12 semanas: a última semana não zerada é a da última ação; Σ 4 semanas ≤ dias ativos ≤ Σ 5 semanas;
  zero antes da entrada.
- Histórico: hoje = faixa do roster; null antes da entrada; em risco estava ativo há 30 dias; inativo
  estava em risco ou inativo.
- Comunidades com acesso, a principal estritamente à frente; tipos de post em ordem.
- Presença só em evento passado, de quem não é em risco/inativo e esteve ativo desde então; cada
  presença é um dia ativo; presentes do roster ≤ check-ins de cada evento.
- Compra VIP exatamente para quem tem acesso ao VIP (j ≥ 2), no dia seguinte à entrada, 19700
  centavos, vencimento de exemplo em +365 dias; compras VIP do roster em 30 dias ≤ 21.
- Atendimento: só `conversations`, `lastDaysAgo`, `medianResponseMinutes`; Σ ≤ 127.
- Sugestão: `{ kind: faixa, days }` (dias desde a entrada para novos, senão desde a última ação).

## Privacidade (como no README)

Até a 261012-pkd o painel do nível 4 só mostrava contagens. As listas das faixas mostram nomes e o
nível de engajamento à equipe do cliente, e a tela de insights mostra o comportamento individual de
um membro: números de 30 dias, eventos, compras e contagens de atendimento, nunca o texto das
mensagens. Antes de ligar dados reais, o aviso de privacidade do app precisa dizer aos membros que a
gestão do cliente vê o comportamento individual de cada membro. Os níveis 1–3 da plataforma seguem só
com agregados. Só `OwnerMemberDetail.tsx` lê `ownerMemberInsights` e só `BandMembers.tsx` lê
`ownerBandList`. O nível 5 (admin do cliente) não ganhou a tela (não tem lista de membros).

## Evidência dos gates (ambiente provisório API_URL/NEXT_PUBLIC_SUPABASE_* inline)

| Comando | Resultado |
|---------|-----------|
| `pnpm lint` | verde (biome; check-ui-literals OK nas duas checagens) |
| `pnpm typecheck` | 18/18 tarefas ok |
| `pnpm test` | 15/15 tarefas ok; web 115 arquivos / 2421 testes; module-dashboard 11 / 239 |
| `pnpm boundaries` | 1290 arquivos em 16 pacotes, sem problemas |
| `pnpm check:static-routes` | 74 rotas, 0 infratores |
| `playwright test --config playwright.preview.config.ts` (suíte completa) | 156 passed (1,9 min) |
| `git diff --quiet 6ca062b1 -- proxy.ts painel-preview/layout.tsx dashboard-preview.ts` | sem mudanças |
| `grep -rl ownerMemberInsights apps/web/{app,components,lib}` | só `OwnerMemberDetail.tsx` |
| `grep -rl ownerBandList apps/web/{app,components,lib}` | só `BandMembers.tsx` |
| `find … -name '* 2*'` (pastas do plano) | nada |

Servidor local religado com o comando do CONTEXT (`nohup … > /tmp/rede-dev.log`), pronto em ~5 s:
`?area=membros&comunidade=eventos` → 200, `?area=membros&recorte=evento&evento=u1` → 200,
`?area=membros&faixa=em-risco&membro=om-49` → 200 (o HTML contém "Sugestão de ação"). Sem push, sem
Vercel.

Capturas (1440×900, claro, dentro do iPhone; não commitadas) em `screens/`:
`01-por-evento-faixas.png`, `02-por-evento-engajados-cartoes.png`, `03-insights-membro-topo.png`,
`04-insights-membro-evolucao.png`, `05-insights-membro-eventos-compras.png`.

## Desvios do plano

### Corrigidos automaticamente

1. **[Regra 1 - Bug] O teste "dono-do-cliente: the area tabs" contava 0 pílulas "exemplo" em Membros.**
   - Achado na T4 (o verify da T2 filtrava só `-g "dono-do-cliente membros"` e não pegou).
   - A premissa mudou por decisão do plano (pílula por cartão): agora espera 60 (10 por faixa
     fechada), com comentário. Commit 64c70d05.
2. **[Regra 1 - Texto] Sugestão do ocasional.** O plano repetia "Participa com frequência" do
   engajado, falso para quem tem 1–3 dias ativos; ficou "Participa de vez em quando. Mostre o próximo
   evento: {event}." (mesma ação). Commit 64c70d05.
3. **[Regra 2 - Clareza] Linhas da Evolução e pílula no singular.** Em vez de "ago.: Ocasionais", as
   linhas leem "ago. (há 60 dias): Novo", "set. (há 30 dias): Ocasional", "Hoje: Engajado", com rótulos
   no singular (`tenantOwner.memberDetail.band.*`) para um membro só.
4. **[Regra 3 - Bloqueio] `formatDate` em `format.ts`** (fora da lista de arquivos) para
   "Comprado em dd/mm/aaaa" com `Intl` pt-BR.
5. **[Regra 3 - Bloqueio] `BandMembers.test.tsx` monta o caminho do catálogo com `node:path`**, porque
   o happy-dom troca o `URL` global e `new URL(…, import.meta.url)` quebrava o `fileURLToPath`.
6. **[Regra 3] `ownerBandRoster` exportado em `fixtures/index.ts`** para derivar `OWNER_MEMBER_IDS` na
   lib sem tocar em `ownerMemberInsights`.

### Observação (fora do escopo, não corrigido)

- Durante o e2e, o log do `next dev` mostra avisos de hidratação `open={false}` × `open=""` em
  `<details>`. Vêm do `openAllDetails` dos testes, que abre os `<details>` antes da hidratação; todos
  os testes passam.

## Stubs conhecidos

- `PreviewAction` "Ver todos" e o botão da sugestão: desativados de propósito, como toda ação da prévia.
- Iniciais no lugar da foto (cartão e cabeçalho): a foto entra quando houver perfis reais (registrado
  no WINDOWS.md).
- Valores de exemplo marcados com "exemplo": tempo médio diário, posts vistos, vencimento do acesso.

## Self-Check: PASSED

- Arquivos criados existem: `owner-band-scope.ts`, `owner-band-scope.test.ts`, `OwnerMemberDetail.tsx`,
  `BandMembers.test.tsx`, `owner-member-insights.ts`, `owner-member-insights.test.ts`.
- Commits presentes no `git log`: 4af4af0d, 01ddd6bb, eaf7911e, 53cf12d7, 2f0a935a, 251d9b16,
  0c6457fe, 64c70d05, 050a4f02.

**⚠️ NÃO FEITO**

- Tela de insights no nível 5 (admin do cliente): não existe lista de membros lá; fica pendente (B-3),
  registrada no README e no WINDOWS.md; fecha quando o nível 5 ganhar a lista.
- Foto de perfil no lugar das iniciais: depende de perfis reais ligados à API; registrada no WINDOWS.md.
- Revisões `critic` e `flow-critic` sobre os commits 4af4af0d..050a4f02: este executor não consegue
  lançar subagentes; rodar as duas antes de dar a feature por encerrada (registrada no WINDOWS.md).
- Aviso de privacidade do app (gestão vê o comportamento individual): só documentado; precisa entrar
  no texto de privacidade antes de dados reais.


## Revisões (orquestrador, após a execução)

- **critic: APROVADO**, sem achado crítico/alto/médio. Leves: `membro` validado só contra o roster (URL forjada com faixa/recorte que não contém o membro abre os insights e o "Voltar" fica incoerente) → próxima tarefa; WINDOWS #81–83 não commitados → commitados agora, #83 marcado como resolvido (revisões feitas).
- **flow-critic: APROVADO**, 1 achado leve (faixa no cabeçalho dos insights é a da base toda, sem dizer, e contradiz a lista no recorte por comunidade) + sugestões (seta de "abre detalhe" no cartão, uma pílula "exemplo" por lista). Tudo → próxima tarefa, junto com nome/linhas maiores no cartão (pedido do usuário pelo desenho).
