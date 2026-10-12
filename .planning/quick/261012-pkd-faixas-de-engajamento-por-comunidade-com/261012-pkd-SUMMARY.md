---
phase: quick-261012-pkd
plan: 01
status: complete
subsystem: dashboard-preview
tags: [dashboard, preview, tenant-owner, engagement-bands, communities, pt-BR]
requires: [261012-o00 (painel do dono em seis áreas), 261012-oxi (correções das revisões)]
provides:
  - "tenantOwnerPanel.communityEngagement: seis faixas por comunidade, mesmos ids/ordem de byCommunity (D-01)"
  - "apps/web/lib/owner-communities.ts: allow-list de ?comunidade=, parseOwnerCommunity, ownerMembersHref, OWNER_BANDS_ANCHOR (D-01)"
  - "fixtures/owner-members.ts: 72 membros fictícios (tabela fixa + construtor puro) e ownerBandList (D-02)"
  - "BandMembers.tsx: seis <details> por faixa com minibarra, até 10 membros e 'e mais N' (D-02)"
  - "README do módulo: faixas por comunidade, listas de membros e o requisito de privacidade (D-03)"
affects: [apps/web nível 4 da pré-visualização (área Membros), módulo dashboard (fixture, README), e2e da pré-visualização]
tech-stack:
  added: []
  patterns:
    - "allow-list da query em arquivo próprio que importa fixtures (owner-communities.ts), para o proxy nunca carregar fixtures"
    - "roster determinístico: tabela fixa + construtor puro, coerente entre recortes (faixa nunca sobe numa comunidade)"
    - "âncora dentro da maquete do iPhone com scroll-mt-20 (fica abaixo da barra de status fixa)"
key-files:
  created:
    - apps/web/lib/owner-communities.ts
    - apps/web/lib/owner-communities.test.ts
    - apps/web/components/dashboard/BandMembers.tsx
    - packages/modules/dashboard/fixtures/owner-members.ts
    - packages/modules/dashboard/tests/owner-members.test.ts
  modified:
    - packages/modules/dashboard/fixtures/tenant-owner.ts
    - packages/modules/dashboard/fixtures/index.ts
    - packages/modules/dashboard/tests/tenant-owner.test.ts
    - packages/modules/dashboard/README.md
    - apps/web/app/painel-preview/[nivel]/page.tsx
    - apps/web/components/dashboard/TenantOwnerPanel.tsx
    - apps/web/components/dashboard/OwnerMembers.tsx
    - apps/web/components/dashboard/PanelSection.tsx
    - apps/web/components/dashboard/format.ts
    - apps/web/messages/pt-BR/dashboard.json
    - apps/web/e2e-preview/painel-preview.spec.ts
decisions:
  - "Subiram/Caíram e 'Ver movimentos' ficam na base toda; com uma comunidade escolhida aparece 'Subiram e Caíram contam toda a base.' (decisão do planejador para D-01)"
  - "Chip do seletor diz 'Comunidade VIP' (rótulo de D-01); a área Conteúdo continua com 'VIP (exclusiva)'"
  - "A âncora #faixas usa scroll-mt-20 para não cair sob a barra de status fixa da maquete do iPhone (mesmo padrão das âncoras do relatório do membro)"
  - "owner-members.ts importa ENGAGEMENT_BAND_ORDER de ../ui/metrics (puro, mesmo pacote) em vez de duplicar a ordem das faixas"
metrics:
  duration: "~15 min (relógio de parede, 21:41Z–21:57Z)"
  completed: 2026-10-12
actuals:
  tokens: 16330
  tasks: 2
  commits: 6
---

# Quick 261012-pkd Plano 01: faixas de engajamento por comunidade, com a lista de membros de cada faixa — Resumo

Na área Membros do nível 4, o bloco "Faixas de engajamento" ganhou um seletor de recorte (Toda a base, Comunidade VIP, Geral, Iniciantes, Eventos) feito de links simples `?area=membros&comunidade=<slug>#faixas`, com allow-list derivada da fixture. Cada uma das seis faixas virou um `<details>` fechado ("contagem · percentual" + minibarra); aberto, mostra os 10 membros com atividade mais recente no recorte e "e mais N membros". Os nomes vêm de um roster determinístico de 72 membros, provado coerente entre recortes.

## Commits

| # | SHA | Mensagem |
|---|-----|----------|
| 1 (RED T1) | 7c1a60b9 | test(quick-261012-pkd): pin the community bands and the comunidade allow-list |
| 2 (GREEN T1) | 478fcfa6 | feat(quick-261012-pkd): scope the owner's engagement bands by community |
| 3 (RED T2) | 6ccef0de | test(quick-261012-pkd): pin the band member lists and the roster's coherence |
| 4 (GREEN T2) | ea48bed1 | feat(quick-261012-pkd): each engagement band opens the list of its members |
| 5 (docs) | 0aaa90d2 | docs(quick-261012-pkd): community bands, member lists and the privacy note |
| 6 (fix) | 79f756bf | fix(quick-261012-pkd): land the #faixas anchor below the phone's status bar |

Portão TDD: T1 `test` (2 falhas por asserção na fixture e 5 no allow-list, typecheck verde) → `feat` (module 190/190, lib web 22/22). T2 `test` (4 falhas por asserção, typecheck verde) → `feat` (module 202/202).

## D-01..D-04 como aplicadas

- **D-01, recorte.** `nav` "Recorte das faixas" com 5 chips em `<ul class="flex flex-wrap gap-2">`, que quebram linha a 360 px sem rolagem lateral. Cada chip é um `<a>` (funciona sem JS) para `/painel-preview/dono-do-cliente?area=membros[&comunidade=<slug>]#faixas`. O chip ativo tem `aria-current`, e a aba Membros continua ativa em todo recorte. `?comunidade=` só vale se for uma string única igual a `vip`, `geral`, `iniciantes` ou `eventos`; qualquer outro valor (`VIP`, `c-vip`, vazio, repetido, `__proto__`, `vip `) cai em Toda a base. `proxy.ts`, o layout da pré-visualização e `dashboard-preview.ts` ficaram intocados (`git diff --quiet 75704bdd` passa).
- **D-01, escopo (decisão do planejador).** O recorte vale para as faixas e para "Novos: X ativados de Y.". Subiram/Caíram e "Ver movimentos" continuam na base toda, e com uma comunidade escolhida aparece "Subiram e Caíram contam toda a base.". Um recorte de comunidade também mostra "<Comunidade>: N membros com acesso. Contam só as ações feitas nesta comunidade.".
- **Rótulo.** O chip do VIP diz "Comunidade VIP" (D-01); Conteúdo mantém "VIP (exclusiva)".
- **D-02.** Seis Collapsibles nativos fechados; resumo "contagem · percentual" + minibarra (`h-1.5 w-16`, sólida só em Em risco). Abertos: até 10 membros, os mais recentes primeiro, com nome, "Membro desde <mês> de <ano> · última atividade <relativo>" e, só em Toda a base, "Interage mais em <comunidade>". Por fim "e mais N membros", que some quando N = 0.
- **D-03.** Registrada no README e abaixo. Só `BandMembers.tsx` lê `ownerBandList` (`grep -rl` em apps/web), então os níveis 1–3 seguem só com agregados.
- **D-04.** Crescimento, Retenção e "Recuperar quem está em risco" sem mudança (o ActionCard continua com 168 em risco da base toda).

## Números por comunidade

| Comunidade | Base | Novos | Superfãs | Engajados | Ocasionais | Em risco | Inativos | Novos ativados |
|---|---|---|---|---|---|---|---|---|
| Toda a base | 1.240 | 96 | 62 | 205 | 150 | 168 | 559 | 54 |
| Comunidade VIP | 186 (quem comprou) | 14 | 38 | 61 | 33 | 22 | 18 | 11 |
| Geral | 1.240 | 96 | 41 | 150 | 170 | 190 | 593 | 48 |
| Iniciantes | 1.240 | 96 | 6 | 38 | 104 | 120 | 876 | 31 |
| Eventos | 1.240 | 96 | 3 | 22 | 88 | 97 | 934 | 14 |

Os testes provam:
- cada comunidade soma a sua base;
- os novos das comunidades abertas são os da base;
- os novos do VIP (14) cabem nos 21 pedidos do produto VIP;
- `newActivated` ≤ min(novos da comunidade, 54);
- nenhum prefixo acumulado de superfã até em risco passa o da base.

## Roster (resumo)

- 72 nomes fixos, 12 por faixa da base. O membro i = faixa·12 + j, com id `om-NN` e horário `TIMES[j]`.
- Dias desde a última ação na base: novo j; superfã ⌊j/4⌋; engajado j; ocasional 4+2j; em risco 31+2j; inativo 64+9j.
- Entrada: novos 12+j dias atrás; os demais 40+23·faixa+9j dias atrás, a partir de `PREVIEW_TODAY = 2026-10-12`.
- Acesso: o VIP só com j ≥ 2; as abertas para todos.
- Uma faixa abaixo na comunidade com Geral j ≥ 10, Iniciantes j ≥ 6, Eventos j ≥ 3. O VIP e os novos nunca caem.
- Sem queda, a última ação na comunidade = a da base + deslocamento (0 a 3 dias). Com queda, ela vai para a janela da nova faixa.
- "Interage mais em" = a comunidade elegível de índice j mod n.
- Os testes provam:
  - as janelas por faixa;
  - a entrada antes de qualquer atividade;
  - a faixa nunca sobe numa comunidade;
  - lista = min(10, contagem) e lista + "e mais" = contagem;
  - a ordenação por recência.

## Privacidade (D-03), igual ao README

**Privacy (261012-pkd D-03, user decision).** Until this task, the level-4 panel showed only counts.
The band lists now show member names and their engagement level to the client's team. Before real
data is wired, the app's privacy notice must tell members that the client's team sees each member's
engagement level. Platform levels 1–3 keep aggregates only.

## Desvios do plano

### Corrigidos automaticamente

**1. [Regra 1 - Bug] A âncora #faixas caía sob a barra de status da maquete do iPhone**
- **Achado em:** capturas da Tarefa 2.
- **Problema:** a 1440×900, seguir um chip rolava a tela do telefone e deixava o título "Faixas de engajamento" e a primeira linha de chips sob a barra de status fixa (62 px). O `toBeInViewport()` do e2e não detecta sobreposição, então passava.
- **Correção:** `scroll-mt-20` na seção (mesmo padrão de `MemberActivityList.tsx:187`). O e2e de 1440 agora também exige que o topo do título fique abaixo da barra; sem a margem ele falha (41 px vs 87 px).
- **Arquivos:** `apps/web/components/dashboard/OwnerMembers.tsx`, `apps/web/e2e-preview/painel-preview.spec.ts`.
- **Commit:** 79f756bf.

**2. [Formatação] page.tsx tem 4 linhas adicionadas e 1 removida (o critério dizia no máximo 3/1)**
- A linha `community={parseOwnerCommunity(query)}` passa da largura do Biome, que quebra o JSX em 3 linhas. O conteúdo é o previsto: um import + a entrada 'dono-do-cliente'. `await connection()` continua antes do `notFound()`.

### Portão do tracer

`workflow.human_verify_mode = end-of-phase` e o orquestrador pediu o plano inteiro, então o portão da Tarefa 1 foi automático. O verify completo (testes do módulo, lib web, typechecks e Playwright `-g dono-do-cliente` 47/47) passou antes de a Tarefa 2 começar.

## Evidência dos portões (ambiente provisório inline)

| Comando | Resultado |
|---|---|
| `pnpm lint` | exit 0; 16/16 tarefas; check-ui-literals OK (2 linhas) |
| `pnpm typecheck` | exit 0; 18/18 tarefas |
| `pnpm test` | exit 0; 15/15 tarefas; web 2405, module-dashboard 202, core 405, ui 180, demais verdes |
| `pnpm boundaries` | exit 0; "Checked 1286 files in 16 packages, no issues found" |
| `pnpm check:static-routes` | exit 0; "no authenticated or host-branded route is static" (74 rotas protegidas, 0 infratores) |
| Playwright preview completo (`playwright.preview.config.ts`) | exit 0; **142 passed** (depois da correção do commit 79f756bf) |
| `git diff --quiet 75704bdd -- proxy.ts layout.tsx dashboard-preview.ts` | OK |
| `grep -rl ownerBandList apps/web/{app,components,lib,e2e-preview}` | só `components/dashboard/BandMembers.tsx` |
| `grep Math.random\|Date.now owner-members.ts` | nada |
| `find … -name '* 2*'` nos diretórios tocados | nada |

O e2e novo cobre:
- o seletor (ordem, hrefs, `aria-current`, VIP 186 / "Novos: 11 ativados de 14." / nota de movimento / KPIs inalterados / resumos '14 · 8%' e '22 · 12%', volta para Toda a base, 360 px sem rolagem);
- o fallback de 5 valores;
- sem JS: o chip Geral e o `<details>` Em risco;
- 5 testes por recorte, abrindo as 6 faixas: linhas = min(10, contagem), "e mais N" coerente e "Interage mais em" só na base toda;
- os casos fixos: Em risco "e mais 158 membros", VIP Inativos "e mais 8 membros", Iniciantes Superfãs 6 linhas e Eventos Superfãs 3 linhas sem "e mais", e "Membro desde set. de 2026 · última atividade hoje 22:40";
- 360/390/430 e iPhone 1440 com tudo aberto.

## Capturas (não versionadas)

- `.planning/quick/261012-pkd-faixas-de-engajamento-por-comunidade-com/screens/dono-do-cliente-membros-toda-a-base-em-risco-1440-light.png`
- `.planning/quick/261012-pkd-faixas-de-engajamento-por-comunidade-com/screens/dono-do-cliente-membros-vip-1440-light.png`

As duas foram conferidas visualmente, e a spec temporária afirmou que não houve erro de console. A spec `zz-screens.tmp.spec.ts` foi apagada; `apps/web/e2e-preview/` tem só `painel-preview.spec.ts`.

## Cópias " 2" pré-existentes (deixadas como estão)

- `.planning/quick/261011-jqy-criar-pre-visualizacao-dos-paineis-de-mo/261011-jqy-CONTEXT 2.md`
- `.planning/quick/261011-jqy-criar-pre-visualizacao-dos-paineis-de-mo/261011-jqy-PLAN 2.md`
- `.planning/quick/261011-jqy-criar-pre-visualizacao-dos-paineis-de-mo/reference-prototype 2.html`

## Observações

- Uma faixa pequena numa base grande arredonda para 0%: Eventos Superfãs mostra "3 · 0%" (3 de 1.240 = 0,24%). A conta está certa (`formatPercent` sem casas), mas pode parecer contraditório. Um "<1%" seria uma melhoria fora do plano.
- Os testes que abrem `<details>` logo após o `goto` geram no log do `next dev` um aviso de hidratação (`open`), porque o atributo muda antes da hidratação. É artefato de teste; nenhum teste falha.

## Self-Check: PASSED

- Arquivos criados existem: `owner-communities.ts`, `owner-communities.test.ts`, `BandMembers.tsx`, `owner-members.ts`, `owner-members.test.ts` e as 2 PNGs.
- Commits existem: 7c1a60b9, 478fcfa6, 6ccef0de, ea48bed1, 0aaa90d2, 79f756bf.

**⚠️ NÃO FEITO**
- critic e flow-critic: este executor não tem ferramenta para lançar subagentes. Para fechar, rodar os dois sobre os commits 7c1a60b9..79f756bf antes de dar a feature por pronta ("rodo o critic?").
- Passada humana no tema escuro a 390 px e dentro do iPhone: não foi feita por um humano. Tentei com `colorScheme: 'dark'` e a página ficou clara (o tema não segue `prefers-color-scheme`). Claro a 390 e a 1440 foi conferido nas capturas. Para fechar, o usuário troca o tema no servidor local e confere VIP/Eventos com Em risco e Superfãs abertos.
- Estado vazio de faixa com 0 membros: só documentado no README ("0 · 0%", abre vazio). Precisa de uma frase pt-BR quando os dados reais forem ligados.


## Revisões (orquestrador, após a execução)

- **critic: APROVADO**, sem achados (parse de `comunidade`, trava de produção, coerência das faixas e listas, nomes restritos à área Membros do nível 4, sem colisão de nomes).
- **flow-critic: APROVADO**, 4 ajustes leves → tratados na tarefa seguinte: "3 · 0%" → "menos de 1%" e barra mínima; cartão "Recuperar quem está em risco" seguindo o recorte; dica "os 10 com atividade mais recente" + "Ver todos" desativado; frase para faixa vazia.
