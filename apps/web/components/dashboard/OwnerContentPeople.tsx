import {
  type ContentPerson,
  type EngagementBand,
  OWNER_BAND_LIST_LIMIT,
  ownerContentInteractions,
  ownerContentInteractors,
  ownerContentItem,
  ownerContentPeople,
} from '@rede-social/module-dashboard/fixtures';
import { Card, StatusPill } from '@rede-social/ui';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  contentBackHref,
  contentMemberAnchor,
  contentPostAnchor,
  type OwnerContentView,
  ownerContentHref,
} from '@/lib/owner-content-view';
import { BackLink } from './BackLink';
import { MemberCard } from './BandMembers';
import { ExamplePill } from './ExamplePill';
import { bandLabel, type DashboardT, exampleBadge, formatCount, momentText } from './format';
import { PanelSection, PreviewAction } from './PanelSection';

/*
 * The only web file that reads `ownerContentPeople`, `ownerContentInteractors` and
 * `ownerContentInteractions`: the names behind the Conteúdo numbers (P1) reach the client's own team
 * only, never a comment's text, and no views or reach number ever leads here (P3).
 */

const KEY = 'tenantOwner.content.people';

/**
 * Member cards with their band, the first OWNER_BAND_LIST_LIMIT of `people`, then how many more the
 * number holds with a disabled "Ver todos" (the Membros pattern). When a listed daily time is an
 * example, one line on top says so. Each card opens the member one level down.
 */
function PeopleCards({
  t,
  people,
  total,
  hrefOf,
  statusOf,
}: {
  t: DashboardT;
  people: readonly ContentPerson[];
  total: number;
  hrefOf: (memberId: string) => string;
  statusOf?: (person: ContentPerson) => ReactNode;
}) {
  const shown = people.slice(0, OWNER_BAND_LIST_LIMIT);
  const more = total - shown.length;
  const daily = shown.find((person) => person.dailyMinutes.example)?.dailyMinutes;
  return (
    <>
      {daily ? (
        <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          {t('tenantOwner.bandMembers.exampleNote')}
          <ExamplePill text={exampleBadge(t, daily)} />
        </p>
      ) : null}
      {shown.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {shown.map((person) => (
            <li key={person.id} className="min-w-0">
              <MemberCard
                t={t}
                member={person}
                band={person.band}
                id={contentMemberAnchor(person.id)}
                href={hrefOf(person.id)}
                status={statusOf?.(person)}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {more > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">
            {t('tenantOwner.bandMembers.more', { count: more })}
          </p>
          <PreviewAction>{t('tenantOwner.bandMembers.seeAll')}</PreviewAction>
        </div>
      ) : null}
    </>
  );
}

/**
 * Who did one of a publication's numbers (D-06, P1): "Voltar" to that number, the title, which
 * publication, the count (the publication's own number, the list's "exemplo" for saves and shares),
 * then the member cards most recent first — commenters the team has not answered first, marked "Sem
 * resposta" (PD-9: never the comment's text). Each card opens the member's insights.
 */
export function OwnerContentPeople({ t, view }: { t: DashboardT; view: OwnerContentView }) {
  const back = contentBackHref(view);
  // The parser only sets `who` with a publication that has that number: a gap here is a bug.
  if (!view.postId || !view.who || back === null) throw new Error('a people list with no number');
  const item = ownerContentItem(view.postId);
  const { people, total, example } = ownerContentPeople(view.postId, view.who);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <BackLink href={back} label={t('tenantOwner.memberDetail.back')} />
      <PanelSection title={t(`${KEY}.title.${view.who}`)} prominent>
        <p className="text-sm text-text [overflow-wrap:anywhere]">{item.excerpt}</p>
        <p className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span>{t(`${KEY}.count.${view.who}`, { count: total })}</span>
          <ExamplePill text={exampleBadge(t, { example })} />
        </p>
        {total === 0 ? (
          <p className="text-sm text-text-secondary">{t(`${KEY}.empty.${view.who}`)}</p>
        ) : (
          <PeopleCards
            t={t}
            people={people}
            total={total}
            hrefOf={(memberId) => ownerContentHref({ ...view, memberId, list: null })}
            statusOf={(person) =>
              person.answered === false ? (
                <StatusPill tone="warning">{t(`${KEY}.unanswered`)}</StatusPill>
              ) : null
            }
          />
        )}
      </PanelSection>
    </div>
  );
}

/**
 * The members who interacted with the content in 30 days (PD-5): of one band (inside "Quem interage")
 * or all of them (the Membros que interagiram number), most recent first.
 */
export function InteractorList({
  t,
  view,
  band,
}: {
  t: DashboardT;
  view: OwnerContentView;
  band: EngagementBand | null;
}) {
  const { people, total } = ownerContentInteractors(band);
  return (
    <PeopleCards
      t={t}
      people={people}
      total={total}
      hrefOf={(memberId) => ownerContentHref({ ...view, band, memberId, list: null })}
    />
  );
}

/**
 * The interactions themselves (PD-7): who, their band, liked or commented, which publication and
 * when, most recent first; each row opens the publication. The first row of a publication carries its
 * anchor, so the detail's "Voltar" lands on it.
 */
export function InteractionList({ t, view }: { t: DashboardT; view: OwnerContentView }) {
  const { rows, total } = ownerContentInteractions();
  const shown = rows.slice(0, OWNER_BAND_LIST_LIMIT);
  const more = total - shown.length;
  const key = 'tenantOwner.content.interactions';
  const anchored = new Set<string>();
  return (
    <>
      <Card>
        <ul className="divide-y divide-border">
          {shown.map((row) => {
            const first = !anchored.has(row.itemId);
            anchored.add(row.itemId);
            return (
              <li key={`${row.person.id}-${row.action}-${row.itemId}`}>
                <a
                  id={first ? contentPostAnchor(row.itemId) : undefined}
                  href={ownerContentHref({ ...view, postId: row.itemId })}
                  className="flex scroll-mt-20 items-center gap-3 px-3 py-2.5 transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 [overflow-wrap:anywhere]">
                    <span className="text-sm font-bold text-text">{row.person.name}</span>
                    <span className="text-xs text-text-secondary">
                      {t(`${key}.line`, {
                        band: bandLabel(t, row.person.band),
                        action: t(`${key}.${row.action}`),
                        when: momentText(t, row.when),
                      })}
                    </span>
                    <span className="line-clamp-2 text-xs text-text">
                      {ownerContentItem(row.itemId).excerpt}
                    </span>
                  </span>
                  <ChevronRight aria-hidden size={18} className="shrink-0 text-brand" />
                </a>
              </li>
            );
          })}
        </ul>
      </Card>
      {more > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">
            {t(`${key}.more`, { count: more, value: formatCount(more) })}
          </p>
          <PreviewAction>{t(`${key}.seeAll`)}</PreviewAction>
        </div>
      ) : null}
    </>
  );
}
