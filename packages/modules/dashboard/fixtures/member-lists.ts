import type { RelativeMoment } from './platform-panels';
import { previewTenant } from './preview-tenant';
import type { MeasuredValue, ReportValue } from './shared';

/**
 * The drill-down lists behind the member's "Sua atividade" report (quick 261012-hqr): RAW DATA,
 * shaped like the future list endpoints — ids, community names, excerpts and relative moments, never
 * a word, a unit or a clock reading of the web tier (MOD-02).
 *
 * One table feeds every post list: `memberPostTable` holds the 60 posts the member viewed in the
 * window, and the likes, comments, saves and shares point at those posts with the post's last-seen
 * moment, so no row contradicts another ("curtido ontem" never sits next to "última vez há 6 dias").
 *
 * The member sees only their OWN actions: the authors are the creator or a community, never another
 * member (D-05).
 */

export type MemberCommunity = 'Comunidade VIP' | 'Geral' | 'Eventos';

/** A post the member saw, as every list refers to it. */
export interface PostRef {
  id: string;
  excerpt: string;
  community: MemberCommunity;
}

export type LikedPost = PostRef & { when: RelativeMoment };

/** A post the member viewed: how many times, and when last. */
export type ViewedPost = PostRef & { views: number; lastSeen: RelativeMoment };

/** A video or reel the member watched: its length, how often it played and the seconds watched. */
export interface WatchedVideo {
  id: string;
  kind: 'video' | 'reel';
  community: MemberCommunity;
  title: string;
  durationSeconds: number;
  plays: number;
  watchedSeconds: number;
}

/** One of the member's own comments. */
export interface OwnComment {
  id: string;
  text: string;
  post: PostRef;
  when: RelativeMoment;
}

export type SavedPost = PostRef & { when: RelativeMoment };

/** `link`: the link was copied; `native`: the phone's share sheet. */
export type SharedPost = PostRef & { when: RelativeMoment; via: 'link' | 'native' };

/**
 * A story the member saw. The list is real (the member's own `story_views` rows); only the time the
 * story stayed on screen is not collected yet, so each row's `seconds` is an example on its own.
 */
export interface SeenStory {
  id: string;
  /** The creator or a community, never another member. */
  author: string;
  when: RelativeMoment;
  seconds: ReportValue<number>;
}

/** `[excerpt, community]`, in the table's order. */
const POST_ROWS: readonly (readonly [string, MemberCommunity])[] = [
  ['Aula 14 da mentoria: como montar a rotina da semana', 'Comunidade VIP'],
  ['Três hábitos simples para começar a semana com foco', 'Geral'],
  ['Material de apoio da aula 14 já está na área da mentoria', 'Comunidade VIP'],
  ['Encontro mensal: fotos e os próximos passos', 'Eventos'],
  ['Live exclusiva VIP: perguntas sobre a rotina da manhã', 'Comunidade VIP'],
  ['Live de dúvidas confirmada para quinta às 20h', 'Geral'],
  ['Mentoria em grupo: o exercício de planejamento desta semana', 'Comunidade VIP'],
  ['Como organizar a agenda sem lotar todos os horários', 'Geral'],
  ['Aula 13 da mentoria: revisão da semana em 15 minutos', 'Comunidade VIP'],
  ['Workshop de sábado: inscrições abertas para a turma 2', 'Eventos'],
  ['Desafio VIP: registre um hábito por dia até domingo', 'Comunidade VIP'],
  ['Bastidores da gravação das novas aulas', 'Geral'],
  ['Resumo da mentoria em grupo de terça', 'Comunidade VIP'],
  ['Uma pergunta da caixinha: como manter a constância?', 'Geral'],
  ['Aula 12 da mentoria: prioridades e o que deixar para depois', 'Comunidade VIP'],
  ['Workshop de sábado: o que levar e o horário de chegada', 'Eventos'],
  ['Checklist da rotina noturna para baixar na área VIP', 'Comunidade VIP'],
  ['Recado da semana: obrigado pelas mensagens de vocês', 'Geral'],
  ['Live exclusiva VIP: como retomar a rotina depois de uma pausa', 'Comunidade VIP'],
  ['Dica rápida: prepare a semana no domingo à noite', 'Geral'],
  ['Aula 11 da mentoria: metas pequenas e possíveis', 'Comunidade VIP'],
  ['Encontro mensal de outubro: data e local confirmados', 'Eventos'],
  ['Mentoria em grupo: respostas às perguntas da última sessão', 'Comunidade VIP'],
  ['O que vem por aí nas próximas semanas da comunidade', 'Geral'],
  ['Planilha de hábitos da mentoria atualizada', 'Comunidade VIP'],
  ['Leitura da semana: um capítulo sobre rotina e descanso', 'Geral'],
  ['Aula 10 da mentoria: como lidar com os dias mais corridos', 'Comunidade VIP'],
  ['Encontro mensal: a gravação da conversa já está disponível', 'Eventos'],
  ['Desafio VIP: compartilhe sua manhã ideal em três passos', 'Comunidade VIP'],
  ['Por que começar pequeno funciona melhor para criar hábitos', 'Geral'],
  ['Mentoria em grupo: o mapa da semana preenchido juntos', 'Comunidade VIP'],
  ['Enquete: qual horário vocês preferem para as lives?', 'Geral'],
  ['Aula 9 da mentoria: revisão do mês e ajustes de rota', 'Comunidade VIP'],
  ['Workshop de organização: vagas para a próxima turma', 'Eventos'],
  ['Live exclusiva VIP: a rotina de estudos que eu sigo', 'Comunidade VIP'],
  ['Boas-vindas aos novos membros da comunidade', 'Geral'],
  ['Material extra: modelo de agenda semanal para imprimir', 'Comunidade VIP'],
  ['Como evitar o excesso de tarefas no começo do dia', 'Geral'],
  ['Aula 8 da mentoria: hábitos de pausa ao longo do dia', 'Comunidade VIP'],
  ['Encontro mensal: perguntas que ficaram para a próxima', 'Eventos'],
  ['Mentoria em grupo: troca de experiências da turma', 'Comunidade VIP'],
  ['Dica rápida: uma lista curta vale mais que uma longa', 'Geral'],
  ['Desafio VIP: uma semana sem pular o planejamento', 'Comunidade VIP'],
  ['Respondendo comentários: rotina com filhos pequenos', 'Geral'],
  ['Aula 7 da mentoria: como medir o próprio progresso', 'Comunidade VIP'],
  ['Workshop de sábado: o resumo do que fizemos juntos', 'Eventos'],
  ['Live exclusiva VIP: dúvidas sobre a planilha de hábitos', 'Comunidade VIP'],
  ['Recomendação de leitura para o fim de semana', 'Geral'],
  ['Aula 6 da mentoria: a manhã em três blocos', 'Comunidade VIP'],
  ['Bastidores: como eu preparo o conteúdo da semana', 'Geral'],
  ['Mentoria em grupo: metas do mês revisadas', 'Comunidade VIP'],
  ['Encontro mensal: inscrições abertas para novembro', 'Eventos'],
  ['Aula 5 da mentoria: o descanso também entra na agenda', 'Comunidade VIP'],
  ['Enquete: qual tema vocês querem na próxima live?', 'Geral'],
  ['Desafio VIP: escreva as três prioridades de amanhã', 'Comunidade VIP'],
  ['Um lembrete gentil: constância não é perfeição', 'Geral'],
  ['Aula 4 da mentoria: o que tirar da sua lista', 'Comunidade VIP'],
  ['Workshop online: gravação disponível para quem se inscreveu', 'Eventos'],
  ['Live exclusiva VIP: rotina de fim de semana', 'Comunidade VIP'],
  ['Calendário de lives do mês publicado', 'Geral'],
];

/**
 * The 60 posts the member viewed in the last 7 days, in recency order (index 0 = the most recently
 * seen): 30 in Comunidade VIP, 20 in Geral and 10 in Eventos, interleaved.
 */
export const memberPostTable: readonly PostRef[] = POST_ROWS.map(([excerpt, community], i) => ({
  id: `p${String(i + 1).padStart(2, '0')}`,
  excerpt,
  community,
}));

/** The clock readings a day's items take, latest first (at most 10 items share a day). */
const TIMES = [
  '23:10',
  '22:05',
  '21:30',
  '20:45',
  '19:20',
  '18:10',
  '13:40',
  '12:15',
  '08:30',
  '07:05',
] as const;

/**
 * `count` moments spread over the report's window (days 1..7, never "hoje"), newest first: item `i`
 * falls on day `1 + floor(i * 7 / count)`, and the j-th item of a day takes `TIMES[j]`.
 */
export function spreadMoments(count: number): RelativeMoment[] {
  const moments: RelativeMoment[] = [];
  let day = 0;
  let slot = 0;
  for (let i = 0; i < count; i += 1) {
    const daysAgo = 1 + Math.floor((i * 7) / count);
    slot = daysAgo === day ? slot + 1 : 0;
    day = daysAgo;
    moments.push({ daysAgo, time: TIMES[slot % TIMES.length] });
  }
  return moments;
}

/** When the member last saw each post of the table (same index). */
const lastSeen = spreadMoments(memberPostTable.length);

function seenAt(index: number): RelativeMoment {
  const moment = lastSeen[index];
  if (!moment) throw new Error(`no post at index ${index}`);
  return moment;
}

/** The first `n` posts of a community, in table (recency) order, with their table index. */
function firstOf(community: MemberCommunity, n: number): { post: PostRef; index: number }[] {
  return memberPostTable
    .map((post, index) => ({ post, index }))
    .filter(({ post }) => post.community === community)
    .slice(0, n);
}

/** Likes: the first 25 VIP, 15 Geral and 6 Eventos posts, newest first (31/19/8 with comments). */
function buildLikes(): LikedPost[] {
  return [...firstOf('Comunidade VIP', 25), ...firstOf('Geral', 15), ...firstOf('Eventos', 6)]
    .sort((a, b) => a.index - b.index)
    .map(({ post, index }) => ({ ...post, when: seenAt(index) }));
}

/**
 * The member's 12 comments, `[post id, text]` in table order: 6 VIP, 4 Geral and 2 Eventos, each on
 * its own post, in the member's voice.
 */
const COMMENTS: readonly (readonly [string, string])[] = [
  ['p01', 'Comecei a aplicar a rotina da aula e já senti diferença'],
  ['p02', 'O segundo hábito eu já faço, vou tentar os outros dois'],
  ['p04', 'Foi ótimo encontrar todo mundo, já quero o próximo'],
  ['p05', 'Adorei as respostas da live, anotei tudo sobre a manhã'],
  ['p11', 'Topei o desafio! Meu hábito desta semana é caminhar cedo'],
  ['p14', 'Essa pergunta era a minha também, obrigada pela resposta'],
  ['p25', 'A planilha nova ficou bem mais fácil de preencher'],
  ['p31', 'Preencher o mapa junto com a turma ajudou muito'],
  ['p32', 'Para mim o melhor horário é depois das 20h'],
  ['p34', 'Garanti minha vaga para a próxima turma'],
  ['p45', 'Gostei da ideia de olhar o progresso toda sexta'],
  ['p56', 'Precisava ler isso, obrigada pelo lembrete'],
];

function postAt(id: string): { post: PostRef; index: number } {
  const index = memberPostTable.findIndex((post) => post.id === id);
  const post = memberPostTable[index];
  if (!post) throw new Error(`no post ${id}`);
  return { post, index };
}

function buildComments(): OwnComment[] {
  return COMMENTS.map(([postId, text], i) => {
    const { post, index } = postAt(postId);
    return { id: `c${String(i + 1).padStart(2, '0')}`, text, post, when: seenAt(index) };
  });
}

/** Saves: the posts at table index i with i % 7 === 2 (9 posts), newest first. */
function buildSaves(): SavedPost[] {
  return memberPostTable
    .map((post, index) => ({ post, index }))
    .filter(({ index }) => index % 7 === 2)
    .map(({ post, index }) => ({ ...post, when: seenAt(index) }));
}

/** Shares: the posts at indices 5, 25 and 45. */
const SHARES: readonly (readonly [number, SharedPost['via']])[] = [
  [5, 'link'],
  [25, 'native'],
  [45, 'link'],
];

function buildShares(): SharedPost[] {
  return SHARES.map(([index, via]) => {
    const post = memberPostTable[index];
    if (!post) throw new Error(`no post at index ${index}`);
    return { ...post, when: seenAt(index), via };
  });
}

const STORY_COMMUNITIES: readonly MemberCommunity[] = ['Comunidade VIP', 'Geral', 'Eventos'];

/**
 * Stories: 23 rows, newest first. Every 4th story (i % 4 === 3) is a community's, the rest the
 * creator's; the time on screen is 5..15 s, an example.
 */
function buildStories(): SeenStory[] {
  return spreadMoments(23).map((when, i) => ({
    id: `s${String(i + 1).padStart(2, '0')}`,
    author:
      i % 4 === 3
        ? (STORY_COMMUNITIES[Math.floor(i / 4) % STORY_COMMUNITIES.length] ?? 'Geral')
        : previewTenant.displayName,
    when,
    seconds: { example: true, reason: 'needs_story_view_time', value: 5 + ((i * 7) % 11) },
  }));
}

/**
 * How many times each viewed post was seen: 1 post x 6, 2 x 5, 4 x 4, 8 x 3, 27 x 2 and 18 x 1 —
 * 60 posts, 128 views.
 */
const VIEW_COUNTS: readonly number[] = (
  [
    [6, 1],
    [5, 2],
    [4, 4],
    [3, 8],
    [2, 27],
    [1, 18],
  ] as const
).flatMap(([views, posts]) => Array.from({ length: posts }, () => views));

/**
 * Viewed posts: post i was seen `VIEW_COUNTS[(i * 7) % 60]` times (7 and 60 are coprime, so this is
 * a permutation and the sum stays 128), sorted by views, most first; the stable sort keeps recency
 * order for ties.
 */
function buildViewedPosts(): ViewedPost[] {
  return memberPostTable
    .map((post, index) => ({
      ...post,
      views: VIEW_COUNTS[(index * 7) % VIEW_COUNTS.length] ?? 1,
      lastSeen: seenAt(index),
    }))
    .sort((a, b) => b.views - a.views);
}

/** `[kind, community, title, durationSeconds, plays, watchedSeconds]`, most watched first. */
const VIDEO_ROWS: readonly (readonly [
  WatchedVideo['kind'],
  MemberCommunity,
  string,
  number,
  number,
  number,
])[] = [
  ['video', 'Comunidade VIP', 'Aula 14 completa: a rotina da semana', 612, 1, 540],
  ['video', 'Comunidade VIP', 'Live VIP: perguntas sobre a rotina da manhã', 540, 1, 300],
  ['video', 'Geral', 'Como eu organizo a minha agenda', 290, 2, 290],
  ['video', 'Comunidade VIP', 'Mentoria em grupo: planejamento da semana', 498, 1, 250],
  ['video', 'Eventos', 'Encontro mensal: a conversa completa', 420, 1, 210],
  ['video', 'Comunidade VIP', 'Aula 13 completa: revisão em 15 minutos', 360, 1, 200],
  ['video', 'Geral', 'Live de dúvidas: o que vocês perguntaram', 385, 1, 180],
  ['video', 'Eventos', 'Workshop de sábado: abertura', 312, 1, 150],
  ['reel', 'Geral', 'Três hábitos para começar a semana', 90, 2, 150],
  ['reel', 'Comunidade VIP', 'Desafio VIP em 1 minuto', 70, 3, 140],
  ['video', 'Comunidade VIP', 'Aula 12: prioridades da semana', 252, 2, 130],
  ['video', 'Geral', 'Bastidores da gravação das aulas', 240, 1, 120],
  ['reel', 'Geral', 'Dica rápida: prepare a semana no domingo', 80, 2, 110],
  ['video', 'Comunidade VIP', 'Checklist da rotina noturna explicado', 225, 1, 100],
  ['video', 'Eventos', 'Workshop de organização: os primeiros passos', 210, 1, 90],
  ['reel', 'Comunidade VIP', 'A manhã em três blocos', 62, 2, 90],
  ['reel', 'Geral', 'Uma lista curta vale mais que uma longa', 85, 1, 85],
  ['video', 'Geral', 'Leitura da semana comentada', 198, 1, 80],
  ['reel', 'Eventos', 'Encontro mensal em 1 minuto', 55, 2, 80],
  ['reel', 'Geral', 'Constância não é perfeição', 75, 1, 75],
  ['reel', 'Comunidade VIP', 'Planilha de hábitos: como preencher', 48, 2, 70],
  ['reel', 'Geral', 'Como evitar o excesso de tarefas', 68, 1, 68],
  ['video', 'Comunidade VIP', 'Aula 11: metas pequenas e possíveis', 185, 1, 60],
  ['reel', 'Geral', 'Recado da semana', 72, 1, 60],
  ['reel', 'Eventos', 'Workshop de sábado: o que levar', 60, 1, 60],
  ['reel', 'Comunidade VIP', 'O mapa da semana em 40 segundos', 40, 2, 60],
  ['reel', 'Geral', 'Pausas ao longo do dia', 58, 1, 58],
  ['reel', 'Comunidade VIP', 'Revisão do mês em poucas palavras', 52, 1, 52],
  ['reel', 'Geral', 'Boas-vindas aos novos membros', 65, 1, 50],
  ['video', 'Eventos', 'Encontro mensal: perguntas finais', 170, 1, 45],
  ['reel', 'Geral', 'Enquete das lives: o resultado', 45, 1, 45],
  ['reel', 'Comunidade VIP', 'Três prioridades para amanhã', 30, 2, 45],
  ['reel', 'Geral', 'Começar pequeno funciona', 42, 1, 42],
  ['reel', 'Eventos', 'Fotos do encontro mensal', 38, 1, 38],
  ['reel', 'Comunidade VIP', 'Rotina de fim de semana', 50, 1, 35],
  ['reel', 'Geral', 'Calendário de lives do mês', 35, 1, 35],
  ['reel', 'Comunidade VIP', 'O descanso também entra na agenda', 32, 1, 32],
  ['reel', 'Geral', 'Rotina com filhos pequenos: uma ideia', 44, 1, 30],
  ['reel', 'Eventos', 'Inscrições do encontro de novembro', 36, 1, 25],
  ['video', 'Comunidade VIP', 'Aula 4: o que tirar da sua lista', 150, 1, 20],
  ['reel', 'Geral', 'Uma pergunta da caixinha', 28, 1, 20],
];

/** The 41 videos and reels watched in the window: 72 minutes in all. */
function buildVideos(): WatchedVideo[] {
  return VIDEO_ROWS.map(([kind, community, title, durationSeconds, plays, watchedSeconds], i) => ({
    id: `v${String(i + 1).padStart(2, '0')}`,
    kind,
    community,
    title,
    durationSeconds,
    plays,
    watchedSeconds,
  }));
}

export interface MemberActivityLists {
  /** The member's `feed_likes` rows in the window. */
  likes: ReportValue<LikedPost[]>;
  /** The member's `feed_comments` rows in the window. */
  comments: ReportValue<OwnComment[]>;
  saves: ReportValue<SavedPost[]>;
  shares: ReportValue<SharedPost[]>;
  posts: ReportValue<ViewedPost[]>;
  videos: ReportValue<WatchedVideo[]>;
  /** The member's own `story_views` rows: a measured list whose rows carry an example time. */
  stories: MeasuredValue<SeenStory[]>;
}

export const memberActivityLists: MemberActivityLists = {
  likes: { example: false, value: buildLikes() },
  comments: { example: false, value: buildComments() },
  saves: { example: true, reason: 'needs_saves', value: buildSaves() },
  shares: { example: true, reason: 'needs_shares', value: buildShares() },
  posts: { example: true, reason: 'needs_post_views', value: buildViewedPosts() },
  videos: { example: true, reason: 'needs_video_playback', value: buildVideos() },
  stories: { example: false, value: buildStories() },
};
