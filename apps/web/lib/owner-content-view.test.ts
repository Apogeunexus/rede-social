import {
  type ContentItem,
  ownerContentIncludes,
  ownerContentItems,
  ownerContentPeople,
} from '@rede-social/module-dashboard/fixtures';
import { describe, expect, it } from 'vitest';
import { OWNER_MEMBER_LISTS } from './owner-band-scope';
import {
  CONTENT_KIND_SLUGS,
  CONTENT_WHO_SLUGS,
  contentBackHref,
  contentCoverRatio,
  type OwnerContentView,
  ownerContentHref,
  parseOwnerContentView,
} from './owner-content-view';

type Params = Parameters<typeof parseOwnerContentView>[0];

const AREA = '/painel-preview/dono-do-cliente?area=conteudo';

const EMPTY: OwnerContentView = {
  tab: 'overview',
  kind: null,
  postId: null,
  who: null,
  memberId: null,
  list: null,
};

function view(patch: Partial<OwnerContentView>): OwnerContentView {
  return { ...EMPTY, ...patch };
}

/** The query of an href, as the page receives it. */
function paramsOf(href: string): Params {
  const query = href.split('#')[0]?.split('?')[1] ?? '';
  const params: Record<string, string | string[]> = {};
  for (const [key, value] of new URLSearchParams(query)) {
    const before = params[key];
    params[key] = before === undefined ? value : [before, value].flat();
  }
  return params;
}

function firstLiker(postId: string): string {
  const id = ownerContentPeople(postId, 'likes').people[0]?.id;
  if (!id) throw new Error(`no likers for ${postId}`);
  return id;
}

const POSTS = ownerContentItems.filter((item) => item.kind !== 'story');

describe('parseOwnerContentView: the tabs (D-01)', () => {
  it('opens Visão geral with nothing else by default', () => {
    expect(parseOwnerContentView({})).toEqual(EMPTY);
    expect(parseOwnerContentView({ area: 'conteudo' })).toEqual(EMPTY);
  });

  it('reads vista exactly and singly, else Visão geral', () => {
    expect(parseOwnerContentView({ vista: 'tipos' }).tab).toBe('types');
    expect(parseOwnerContentView({ vista: 'publicacoes' }).tab).toBe('posts');
    for (const vista of ['TIPOS', 'xyz', '', ['tipos', 'tipos']]) {
      expect(parseOwnerContentView({ vista } as Params), String(vista)).toEqual(EMPTY);
    }
  });
});

describe('parseOwnerContentView: Por tipo (D-03)', () => {
  it('opens a type only under Por tipo', () => {
    for (const [kind, slug] of Object.entries(CONTENT_KIND_SLUGS)) {
      expect(parseOwnerContentView({ vista: 'tipos', tipo: slug })).toEqual(
        view({ tab: 'types', kind: kind as OwnerContentView['kind'] }),
      );
    }
    expect(CONTENT_KIND_SLUGS).toEqual({
      video: 'video',
      photo: 'foto',
      carousel: 'carrossel',
      text: 'texto',
      link: 'link',
      story: 'story',
    });
    expect(parseOwnerContentView({ tipo: 'video' })).toEqual(EMPTY);
    expect(parseOwnerContentView({ vista: 'publicacoes', tipo: 'video' })).toEqual(
      view({ tab: 'posts' }),
    );
    expect(parseOwnerContentView({ vista: 'tipos', tipo: 'reel' })).toEqual(
      view({ tab: 'types' }),
    );
  });

  it('opens a publication only of the opened type', () => {
    expect(parseOwnerContentView({ vista: 'tipos', tipo: 'video', post: 'op-11' })).toEqual(
      view({ tab: 'types', kind: 'video', postId: 'op-11' }),
    );
    expect(parseOwnerContentView({ vista: 'tipos', tipo: 'story', post: 'os-01' })).toEqual(
      view({ tab: 'types', kind: 'story', postId: 'os-01' }),
    );
    expect(parseOwnerContentView({ vista: 'tipos', tipo: 'video', post: 'op-15' })).toEqual(
      view({ tab: 'types', kind: 'video' }),
    );
    expect(parseOwnerContentView({ vista: 'tipos', tipo: 'story', post: 'op-11' })).toEqual(
      view({ tab: 'types', kind: 'story' }),
    );
    expect(parseOwnerContentView({ vista: 'tipos', post: 'op-11' })).toEqual(
      view({ tab: 'types' }),
    );
  });
});

describe('parseOwnerContentView: Publicações (D-04) and Visão geral', () => {
  it('opens any feed post, never a story', () => {
    for (const item of POSTS) {
      expect(parseOwnerContentView({ vista: 'publicacoes', post: item.id }).postId).toBe(item.id);
      expect(parseOwnerContentView({ post: item.id }).postId).toBe(item.id);
    }
    expect(parseOwnerContentView({ vista: 'publicacoes', post: 'os-01' }).postId).toBeNull();
    expect(parseOwnerContentView({ post: 'os-01' }).postId).toBeNull();
    for (const post of ['op-99', 'OP-11', ['op-11', 'op-11']]) {
      expect(
        parseOwnerContentView({ vista: 'publicacoes', post } as Params),
        String(post),
      ).toEqual(view({ tab: 'posts' }));
    }
  });
});

describe('parseOwnerContentView: who did it (D-06, P1, P3)', () => {
  it('opens the four interactions only with a post', () => {
    for (const [who, slug] of Object.entries(CONTENT_WHO_SLUGS)) {
      expect(
        parseOwnerContentView({ vista: 'publicacoes', post: 'op-11', quem: slug }).who,
      ).toBe(who);
    }
    expect(parseOwnerContentView({ vista: 'publicacoes', quem: 'curtidas' })).toEqual(
      view({ tab: 'posts' }),
    );
  });

  it('has no views or reach value: those never open people (P3)', () => {
    for (const quem of ['visualizacoes', 'alcance', 'xyz', 'CURTIDAS']) {
      expect(parseOwnerContentView({ vista: 'publicacoes', post: 'op-11', quem }), quem).toEqual(
        view({ tab: 'posts', postId: 'op-11' }),
      );
    }
  });

  it('a story has no saves', () => {
    expect(
      parseOwnerContentView({ vista: 'tipos', tipo: 'story', post: 'os-01', quem: 'salvamentos' }),
    ).toEqual(view({ tab: 'types', kind: 'story', postId: 'os-01' }));
  });

  it('opens a member only from the list that holds them', () => {
    const member = firstLiker('op-11');
    expect(
      parseOwnerContentView({
        vista: 'publicacoes',
        post: 'op-11',
        quem: 'curtidas',
        membro: member,
      }),
    ).toEqual(view({ tab: 'posts', postId: 'op-11', who: 'likes', memberId: member }));
    const outsider = ownerContentItems
      .flatMap((item) => ownerContentPeople(item.id, 'likes').people)
      .find((person) => !ownerContentIncludes('op-11', 'likes', person.id));
    expect(outsider).toBeDefined();
    expect(
      parseOwnerContentView({
        vista: 'publicacoes',
        post: 'op-11',
        quem: 'curtidas',
        membro: outsider?.id,
      }),
    ).toEqual(view({ tab: 'posts', postId: 'op-11', who: 'likes' }));
    expect(
      parseOwnerContentView({ vista: 'publicacoes', post: 'op-11', membro: member }),
    ).toEqual(view({ tab: 'posts', postId: 'op-11' }));
  });

  it('opens a member list only with a member', () => {
    const member = firstLiker('op-11');
    const base = { vista: 'publicacoes', post: 'op-11', quem: 'curtidas', membro: member };
    for (const lista of OWNER_MEMBER_LISTS) {
      expect(parseOwnerContentView({ ...base, lista }).list).toBe(lista);
    }
    expect(parseOwnerContentView({ ...base, lista: 'xyz' }).list).toBeNull();
    expect(
      parseOwnerContentView({ vista: 'publicacoes', post: 'op-11', lista: 'curtidas' }),
    ).toEqual(view({ tab: 'posts', postId: 'op-11' }));
  });
});

describe('ownerContentHref and contentBackHref', () => {
  it('builds the tabs and the params in order', () => {
    expect(ownerContentHref(EMPTY)).toBe(AREA);
    expect(ownerContentHref(view({ tab: 'types' }))).toBe(`${AREA}&vista=tipos`);
    expect(ownerContentHref(view({ tab: 'posts' }))).toBe(`${AREA}&vista=publicacoes`);
    expect(ownerContentHref(view({ tab: 'types', kind: 'carousel', postId: 'op-15' }))).toBe(
      `${AREA}&vista=tipos&tipo=carrossel&post=op-15`,
    );
    const member = firstLiker('op-11');
    expect(
      ownerContentHref(
        view({ tab: 'posts', postId: 'op-11', who: 'likes', memberId: member, list: 'curtidas' }),
      ),
    ).toBe(`${AREA}&vista=publicacoes&post=op-11&quem=curtidas&membro=${member}&lista=curtidas`);
  });

  it('goes back one level, landing on what was closed', () => {
    const member = firstLiker('op-11');
    const list = view({
      tab: 'posts',
      postId: 'op-11',
      who: 'likes',
      memberId: member,
      list: 'curtidas',
    });
    expect(contentBackHref(list)).toBe(
      `${AREA}&vista=publicacoes&post=op-11&quem=curtidas&membro=${member}#insight-curtidas`,
    );
    expect(contentBackHref({ ...list, list: null })).toBe(
      `${AREA}&vista=publicacoes&post=op-11&quem=curtidas#membro-${member}`,
    );
    expect(contentBackHref({ ...list, list: null, memberId: null })).toBe(
      `${AREA}&vista=publicacoes&post=op-11#quem-curtidas`,
    );
    expect(contentBackHref(view({ tab: 'posts', postId: 'op-11' }))).toBe(
      `${AREA}&vista=publicacoes#post-op-11`,
    );
    expect(contentBackHref(view({ tab: 'types', kind: 'video', postId: 'op-11' }))).toBe(
      `${AREA}&vista=tipos&tipo=video#post-op-11`,
    );
    expect(contentBackHref(view({ tab: 'types', kind: 'story' }))).toBe(
      `${AREA}&vista=tipos#tipo-story`,
    );
    expect(contentBackHref(view({ tab: 'types' }))).toBeNull();
    expect(contentBackHref(EMPTY)).toBeNull();
  });

  it('round-trips every valid level (parse of the href is the view)', () => {
    const views: OwnerContentView[] = [EMPTY, view({ tab: 'types' }), view({ tab: 'posts' })];
    for (const kind of Object.keys(CONTENT_KIND_SLUGS) as NonNullable<
      OwnerContentView['kind']
    >[]) {
      views.push(view({ tab: 'types', kind }));
    }
    const withPost = (base: OwnerContentView, item: ContentItem) => {
      views.push({ ...base, postId: item.id });
      for (const who of Object.keys(CONTENT_WHO_SLUGS) as NonNullable<OwnerContentView['who']>[]) {
        if (who === 'saves' && item.saves === null) continue;
        views.push({ ...base, postId: item.id, who });
        const member = ownerContentPeople(item.id, who).people[0]?.id;
        if (!member) continue;
        views.push({ ...base, postId: item.id, who, memberId: member });
        for (const list of OWNER_MEMBER_LISTS) {
          views.push({ ...base, postId: item.id, who, memberId: member, list });
        }
      }
    };
    for (const item of ownerContentItems) {
      withPost(view({ tab: 'types', kind: item.kind }), item);
      if (item.kind !== 'story') {
        withPost(view({ tab: 'posts' }), item);
        withPost(EMPTY, item);
      }
    }
    for (const expected of views) {
      expect(parseOwnerContentView(paramsOf(ownerContentHref(expected)))).toEqual(expected);
      const back = contentBackHref(expected);
      if (back !== null) expect(back.startsWith(AREA)).toBe(true);
    }
  });
});

describe('contentCoverRatio (PD-2, the feed ratios)', () => {
  const item = (kind: ContentItem['kind'], media: ContentItem['media']) => ({ kind, media });

  it('clamps a video to [9:16, 1.91] with the 4:5 fallback', () => {
    expect(contentCoverRatio(item('video', { width: 1080, height: 1920 }))).toBeCloseTo(0.5625);
    expect(contentCoverRatio(item('video', { width: 1920, height: 1080 }))).toBeCloseTo(16 / 9);
    expect(contentCoverRatio(item('video', { width: 900, height: 2100 }))).toBeCloseTo(9 / 16);
    expect(contentCoverRatio(item('video', { width: 3000, height: 1000 }))).toBeCloseTo(1.91);
    expect(contentCoverRatio(item('video', null))).toBeCloseTo(0.8);
  });

  it('clamps a photo or a carousel to [4:5, 1.91] with the square fallback', () => {
    expect(contentCoverRatio(item('photo', { width: 1080, height: 1350 }))).toBeCloseTo(0.8);
    expect(contentCoverRatio(item('photo', { width: 1080, height: 2400 }))).toBeCloseTo(0.8);
    expect(contentCoverRatio(item('carousel', { width: 1080, height: 1080 }))).toBeCloseTo(1);
    expect(contentCoverRatio(item('carousel', null))).toBeCloseTo(1);
  });

  it('draws a link at 16:9, a story at 9:16 and no cover for text', () => {
    expect(contentCoverRatio(item('link', null))).toBeCloseTo(16 / 9);
    expect(contentCoverRatio(item('story', { width: 1080, height: 1920 }))).toBeCloseTo(9 / 16);
    expect(contentCoverRatio(item('text', null))).toBeNull();
  });
});
