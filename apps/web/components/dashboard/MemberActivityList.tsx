import { memberActivityLists } from '@rede-social/module-dashboard/fixtures';
import { Card, cn, StatusPill } from '@rede-social/ui';
import { ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { MEMBER_LIST_ANCHOR, type MemberListSlug, memberReportHref } from '@/lib/dashboard-preview';
import { type DashboardT, momentText } from './format';
import { PanelSection } from './PanelSection';

interface ListRow {
  id: string;
  title: string;
  lines: string[];
  /** A short value on the right ("12 s", "visto 3×"). */
  aside?: string;
  /** The "exemplo" pill next to `aside`, when that value alone is fictional. */
  asideBadge?: string;
}

interface ListView {
  title: string;
  count: string;
  /** The whole list is fictional: one "exemplo" pill next to the count. */
  example: boolean;
  rows: ListRow[];
}

/** Every allow-listed slug has its view: a slug added to MEMBER_LISTS without one fails typecheck. */
const VIEWS: Record<MemberListSlug, (t: DashboardT) => ListView> = {
  curtidas: (t) => {
    const list = memberActivityLists.likes;
    return {
      title: t('member.lists.likes.title'),
      count: t('member.lists.likes.count', { count: list.value.length }),
      example: list.example,
      rows: list.value.map((row) => ({
        id: row.id,
        title: row.excerpt,
        lines: [
          t('member.lists.likes.line', { community: row.community, when: momentText(t, row.when) }),
        ],
      })),
    };
  },
};

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

function ExamplePill({ children }: { children: string }) {
  return (
    <StatusPill tone="neutral" className="px-2 py-0.5">
      {children}
    </StatusPill>
  );
}

/**
 * The list behind one "Sua atividade" card (quick 261012-hqr): "Voltar" to the card that opened it,
 * the title, the window, the item count and the rows, newest or most first. The "exemplo" pill sits
 * next to the example value it marks: once next to the count when the whole list is fictional, or
 * on a row's value when only that value is (the story time). Rows are not links.
 */
export async function MemberActivityList({ slug }: { slug: MemberListSlug }) {
  const t = await getTranslations('dashboard');
  const view = VIEWS[slug](t);
  const example = t('member.activity.example');

  return (
    <div id={MEMBER_LIST_ANCHOR} className="flex scroll-mt-20 flex-col gap-3">
      <a
        href={memberReportHref(slug)}
        className={cn(
          'inline-flex min-h-11 w-fit items-center gap-1 rounded-md text-sm font-bold text-brand',
          FOCUS_RING,
        )}
      >
        <ChevronLeft aria-hidden size={18} />
        {t('member.lists.back')}
      </a>
      <PanelSection title={view.title} period={t('member.activity.period')} prominent>
        <p className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span>{view.count}</span>
          {view.example ? <ExamplePill>{example}</ExamplePill> : null}
        </p>
        <Card>
          <ul className="divide-y divide-border">
            {view.rows.map((row) => (
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
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold tabular-nums text-text">
                    {row.aside}
                    {row.asideBadge ? <ExamplePill>{row.asideBadge}</ExamplePill> : null}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      </PanelSection>
    </div>
  );
}
