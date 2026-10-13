import { daysBefore, PREVIEW_TODAY } from './owner-members';
import type { PostType } from './tenant-panels';

/**
 * The client's 61 feed posts of the last 30 days (quick 261012-tru D-07): the table behind the
 * level-4 member lists (what a member liked, commented on and saw). RAW DATA (MOD-02): ids,
 * community ids, formats, ISO dates and short excerpts — tenant content, as `member-lists.ts` holds
 * for level 7 — never a UI sentence.
 *
 * The counts match the Conteúdo area: 22 / 25 / 8 / 6 per community (`byCommunity`) and 18 / 15 / 20
 * / 8 per format (`byFormat`); each of the four top posts is here with its date, format and
 * community. The dates do not model the weekday and time-slot split of "Melhor dia e horário para
 * publicar": no list shows a weekday (a planner decision).
 */

export interface OwnerPost {
  id: string;
  communityId: string;
  type: PostType;
  /** ISO date it was published. */
  date: string;
  excerpt: string;
}

/** `[communityId, days ago, format, excerpt]`, per community, newest last. */
const ROWS: readonly (readonly [string, number, PostType, string])[] = [
  ['c-vip', 29, 'video', 'Aula 1 da mentoria: o ponto de partida de cada um'],
  ['c-vip', 28, 'text', 'Boas-vindas à nova turma VIP'],
  ['c-vip', 27, 'gallery', 'Fotos do primeiro encontro da turma VIP'],
  ['c-vip', 25, 'video', 'Aula 2 da mentoria: como montar a rotina da semana'],
  ['c-vip', 24, 'link', 'Planilha de hábitos da mentoria para baixar'],
  ['c-vip', 22, 'text', 'Desafio VIP: registre um hábito por dia até domingo'],
  ['c-vip', 21, 'video', 'Live exclusiva VIP: perguntas sobre a rotina da manhã'],
  ['c-vip', 19, 'gallery', 'Bastidores da gravação das aulas da mentoria'],
  ['c-vip', 18, 'video', 'Aula 3 da mentoria: prioridades e o que deixar para depois'],
  ['c-vip', 16, 'text', 'Mentoria em grupo: respostas às perguntas da última sessão'],
  ['c-vip', 15, 'video', 'Aula 4 da mentoria: metas pequenas e possíveis'],
  ['c-vip', 14, 'text', 'Desafio VIP: compartilhe sua manhã ideal em três passos'],
  ['c-vip', 12, 'video', 'Live exclusiva VIP: como retomar a rotina depois de uma pausa'],
  ['c-vip', 11, 'link', 'Material extra: modelo de agenda semanal para imprimir'],
  ['c-vip', 9, 'video', 'Aula 5 da mentoria: como lidar com os dias mais corridos'],
  ['c-vip', 8, 'gallery', 'Mapa da semana preenchido na mentoria em grupo'],
  ['c-vip', 6, 'gallery', 'Galeria: as manhãs ideais que vocês compartilharam'],
  ['c-vip', 5, 'text', 'Resumo da mentoria em grupo de terça'],
  ['c-vip', 4, 'video', 'Aula 6 da mentoria: hábitos de pausa ao longo do dia'],
  ['c-vip', 3, 'gallery', 'Checklist da rotina noturna em imagens'],
  ['c-vip', 1, 'text', 'Desafio VIP: escreva as três prioridades de amanhã'],
  ['c-vip', 0, 'video', 'Live exclusiva VIP: rotina de fim de semana'],
  ['c-geral', 29, 'text', 'Boas-vindas aos novos membros da comunidade'],
  ['c-geral', 28, 'link', 'Leitura da semana: um capítulo sobre rotina e descanso'],
  ['c-geral', 27, 'video', 'Três hábitos simples para começar a semana com foco'],
  ['c-geral', 26, 'text', 'Recado da semana: obrigado pelas mensagens de vocês'],
  ['c-geral', 25, 'gallery', 'Fotos dos bastidores da gravação das novas aulas'],
  ['c-geral', 24, 'text', 'Dica rápida: prepare a semana no domingo à noite'],
  ['c-geral', 23, 'link', 'Recomendação de leitura para o fim de semana'],
  ['c-geral', 22, 'text', 'Uma pergunta da caixinha: como manter a constância?'],
  ['c-geral', 20, 'video', 'Como organizar a agenda sem lotar todos os horários'],
  ['c-geral', 19, 'gallery', 'Galeria: a mesa de trabalho de quem participa'],
  ['c-geral', 17, 'text', 'Enquete: qual horário vocês preferem para as lives?'],
  ['c-geral', 16, 'link', 'Artigo: por que começar pequeno funciona melhor'],
  ['c-geral', 14, 'text', 'Respondendo comentários: rotina com filhos pequenos'],
  ['c-geral', 13, 'video', 'Como evitar o excesso de tarefas no começo do dia'],
  ['c-geral', 12, 'gallery', 'Galeria: os cadernos de planejamento da comunidade'],
  ['c-geral', 11, 'text', 'Dica rápida: uma lista curta vale mais que uma longa'],
  ['c-geral', 9, 'link', 'Podcast da semana: rotina e descanso'],
  ['c-geral', 8, 'text', 'Um lembrete gentil: constância não é perfeição'],
  ['c-geral', 7, 'gallery', 'Fotos da live de dúvidas de setembro'],
  ['c-geral', 5, 'text', 'O que vem por aí nas próximas semanas da comunidade'],
  ['c-geral', 4, 'video', 'Bastidores: como eu preparo o conteúdo da semana'],
  ['c-geral', 3, 'link', 'Lista de ferramentas para organizar a semana'],
  ['c-geral', 2, 'gallery', 'Galeria: as metas de outubro de quem participa'],
  ['c-geral', 1, 'text', 'Enquete: qual tema vocês querem na próxima live?'],
  ['c-geral', 0, 'video', 'Live de dúvidas confirmada para quinta às 20h'],
  ['c-iniciantes', 29, 'text', 'Comece por aqui: como a comunidade funciona'],
  ['c-iniciantes', 25, 'video', 'Primeiro passo: escolha um hábito só'],
  ['c-iniciantes', 21, 'text', 'Apresente-se: conte de onde você é e o que busca'],
  ['c-iniciantes', 17, 'video', 'Como usar a planilha de hábitos na primeira semana'],
  ['c-iniciantes', 13, 'gallery', 'Galeria: a primeira semana de quem acabou de chegar'],
  ['c-iniciantes', 10, 'link', 'Guia para iniciantes: as perguntas mais comuns'],
  ['c-iniciantes', 6, 'text', 'Dúvidas da primeira semana respondidas'],
  ['c-iniciantes', 2, 'video', 'Primeiros passos: montando a sua primeira rotina'],
  ['c-eventos', 28, 'text', 'Encontro de setembro: inscrições abertas e local confirmado'],
  ['c-eventos', 23, 'gallery', 'Encontro de setembro: as fotos da turma'],
  ['c-eventos', 18, 'video', 'Live de dúvidas: a gravação já está disponível'],
  ['c-eventos', 11, 'gallery', 'Workshop de sábado: fotos do que fizemos juntos'],
  ['c-eventos', 5, 'gallery', 'Aula aberta: os melhores momentos'],
  ['c-eventos', 1, 'gallery', 'Encontro mensal: o local preparado para hoje à noite'],
];

/** The 61 posts, newest first (ties in the communities' order), ids `op-01`..`op-61`. */
export const ownerPostTable: readonly OwnerPost[] = ROWS.map((row, order) => ({ row, order }))
  .sort((a, b) => a.row[1] - b.row[1] || a.order - b.order)
  .map(({ row: [communityId, daysAgo, type, excerpt] }, i) => ({
    id: `op-${String(i + 1).padStart(2, '0')}`,
    communityId,
    type,
    date: daysBefore(PREVIEW_TODAY, daysAgo),
    excerpt,
  }));
