import { formatBrl } from '@rede-social/contracts/money';
import {
  type OwnerMemberInsights,
  ownerMemberInsights,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import { Card } from '@rede-social/ui';
import {
  OWNER_MEMBER_LIST_ANCHOR,
  type OwnerMemberListSlug,
  type OwnerMembersView,
  ownerInsightAnchor,
  ownerMembersHref,
} from '@/lib/owner-band-scope';
import { BackLink } from './BackLink';
import { ownerCommunity, ownerEvent } from './BandScopeCards';
import { ExamplePill } from './ExamplePill';
import {
  communityLabel,
  type DashboardT,
  exampleBadge,
  formatDayMonth,
  formatMinutesSeconds,
  momentText,
} from './format';
import { PanelSection } from './PanelSection';

interface ListRow {
  id: string;
  title: string;
  lines: string[];
  /** A short value on the right ("3 ações", "visto 2× · 40 s"). */
  aside?: string;
}

interface ListView {
  title: string;
  /** The count line, with the order the rows follow. */
  count: string;
  /** The whole list is an example: one "exemplo" pill next to the count. */
  badge: string | undefined;
  empty: string;
  rows: ListRow[];
}

type Lists = OwnerMemberInsights['lists'];

function communityName(t: DashboardT, id: string): string {
  return communityLabel(t, ownerCommunity(id));
}

function productName(id: string): string {
  const product = tenantOwnerPanel.store.products.find((row) => row.id === id);
  if (!product) throw new Error(`no product ${id}`);
  return product.product;
}

const KEY = 'tenantOwner.memberLists';

/** Every list slug has its view: a slug added to OWNER_MEMBER_LISTS without one fails typecheck. */
const VIEWS: Record<OwnerMemberListSlug, (t: DashboardT, lists: Lists) => ListView> = {
  'dias-ativos': (t, { activeDays }) => ({
    title: t(`${KEY}.activeDays.title`),
    count: t(`${KEY}.activeDays.count`, { count: activeDays.length }),
    badge: undefined,
    empty: t(`${KEY}.activeDays.empty`),
    rows: activeDays.map((day) => ({
      id: `day-${day.when.daysAgo}`,
      title: momentText(t, day.when),
      lines: [],
      aside: t(`${KEY}.activeDays.actions`, { count: day.actions }),
    })),
  }),
  curtidas: (t, { likes }) => ({
    title: t(`${KEY}.likes.title`),
    count: t(`${KEY}.likes.count`, { count: likes.length }),
    badge: undefined,
    empty: t(`${KEY}.likes.empty`),
    rows: likes.map((like) => ({
      id: like.post.id,
      title: like.post.excerpt,
      lines: [
        t(`${KEY}.likes.line`, {
          community: communityName(t, like.post.communityId),
          when: momentText(t, like.when),
        }),
      ],
    })),
  }),
  comentarios: (t, { comments }) => ({
    title: t(`${KEY}.comments.title`),
    count: t(`${KEY}.comments.count`, { count: comments.length }),
    badge: undefined,
    empty: t(`${KEY}.comments.empty`),
    rows: comments.map((comment) => ({
      id: comment.post.id,
      title: comment.post.excerpt,
      lines: [
        t(`${KEY}.comments.line`, {
          community: communityName(t, comment.post.communityId),
          when: momentText(t, comment.when),
        }),
      ],
    })),
  }),
  'acoes-fortes': (t, { strongActions }) => ({
    title: t(`${KEY}.strongActions.title`),
    count: t(`${KEY}.strongActions.count`, { count: strongActions.length }),
    badge: undefined,
    empty: t(`${KEY}.strongActions.empty`),
    rows: strongActions.map((action) => {
      const when = momentText(t, action.when);
      if (action.kind === 'comment') {
        return {
          id: `comment-${action.post.id}`,
          title: action.post.excerpt,
          lines: [
            t(`${KEY}.strongActions.comment`, {
              community: communityName(t, action.post.communityId),
              when,
            }),
          ],
        };
      }
      if (action.kind === 'check_in') {
        const event = ownerEvent(action.eventId);
        return {
          id: `check-in-${action.eventId}`,
          title: t('tenantOwner.bandScope.event', {
            name: event.name,
            date: formatDayMonth(event.date),
          }),
          lines: [t(`${KEY}.strongActions.checkIn`, { when })],
        };
      }
      return {
        id: `order-${action.productId}`,
        title: productName(action.productId),
        lines: [t(`${KEY}.strongActions.order`, { value: formatBrl(action.cents), when })],
      };
    }),
  }),
  'posts-vistos': (t, { postsSeen }) => ({
    title: t(`${KEY}.postsSeen.title`),
    count: t(`${KEY}.postsSeen.count`, {
      posts: postsSeen.value.length,
      views: postsSeen.value.reduce((total, row) => total + row.views, 0),
    }),
    badge: exampleBadge(t, postsSeen),
    empty: t(`${KEY}.postsSeen.empty`),
    rows: postsSeen.value.map((row) => ({
      id: row.post.id,
      title: row.post.excerpt,
      lines: [
        t(`${KEY}.postsSeen.line`, {
          community: communityName(t, row.post.communityId),
          when: momentText(t, row.lastSeen),
        }),
      ],
      aside: t(`${KEY}.postsSeen.times`, {
        count: row.views,
        time: formatMinutesSeconds(t, row.seconds),
      }),
    })),
  }),
};

/**
 * The list behind one of a member's insight numbers (quick 261012-tru D-07, the level-7 pattern of
 * quick 261012-hqr): "Voltar" to the number that opened it, the title, the member and the window,
 * the count with the order of the rows (and the "exemplo" pill for the example Posts vistos), then
 * the rows, or one sentence when there are none. Its count is the number on the insights card by
 * construction. Visible to the client's management only: which posts a member liked, commented on
 * and saw, never a comment's text.
 */
export function OwnerMemberList({ t, view }: { t: DashboardT; view: OwnerMembersView }) {
  // The parser only sets a list together with a member it let through, so a gap here is a bug.
  const insights = view.memberId ? ownerMemberInsights(view.memberId) : null;
  if (!insights || view.list === null) {
    throw new Error(`no list ${view.list} for member ${view.memberId ?? '(none)'}`);
  }
  const list = VIEWS[view.list](t, insights.lists);

  return (
    <div id={OWNER_MEMBER_LIST_ANCHOR} className="flex min-w-0 scroll-mt-20 flex-col gap-3">
      <BackLink
        href={`${ownerMembersHref({ ...view, list: null })}#${ownerInsightAnchor(view.list)}`}
        label={t('tenantOwner.memberDetail.back')}
      />
      <PanelSection
        title={list.title}
        period={t(`${KEY}.period`, { name: insights.name })}
        prominent
      >
        <p className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span>{list.count}</span>
          <ExamplePill text={list.badge} />
        </p>
        {list.rows.length === 0 ? (
          <p className="text-sm text-text-secondary">{list.empty}</p>
        ) : (
          <Card>
            <ul className="divide-y divide-border">
              {list.rows.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <div className="flex min-w-0 flex-col gap-0.5 [overflow-wrap:anywhere]">
                    <p className="text-sm font-semibold text-text">{row.title}</p>
                    {row.lines.map((line) => (
                      <p key={line} className="text-xs text-text-secondary">
                        {line}
                      </p>
                    ))}
                  </div>
                  {row.aside ? (
                    <span className="shrink-0 text-xs font-bold tabular-nums text-text">
                      {row.aside}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </PanelSection>
    </div>
  );
}
