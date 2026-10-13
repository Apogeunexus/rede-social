import {
  OWNER_BAND_LIST_LIMIT,
  ownerContentItem,
  ownerContentPeople,
} from '@rede-social/module-dashboard/fixtures';
import {
  contentBackHref,
  contentMemberAnchor,
  type OwnerContentView,
  ownerContentHref,
} from '@/lib/owner-content-view';
import { BackLink } from './BackLink';
import { MemberCard } from './BandMembers';
import { ExamplePill } from './ExamplePill';
import { type DashboardT, exampleBadge } from './format';
import { PanelSection, PreviewAction } from './PanelSection';

const KEY = 'tenantOwner.content.people';

/**
 * Who did one of a publication's numbers (D-06, P1): "Voltar" to that number, the title, which
 * publication, the count (the publication's own number, the list's "exemplo" for saves and shares),
 * then the member cards with their band, most recent first; over 10 it says how many more with a
 * disabled "Ver todos". Each card opens the member's insights. The only web file that reads
 * `ownerContentPeople`: names reach the client's own team only, never a comment's text.
 */
export function OwnerContentPeople({ t, view }: { t: DashboardT; view: OwnerContentView }) {
  const back = contentBackHref(view);
  // The parser only sets `who` with a publication that has that number: a gap here is a bug.
  if (!view.postId || !view.who || back === null) throw new Error('a people list with no number');
  const item = ownerContentItem(view.postId);
  const { people, total, example } = ownerContentPeople(view.postId, view.who);
  const shown = people.slice(0, OWNER_BAND_LIST_LIMIT);
  const more = total - shown.length;
  const daily = shown.find((person) => person.dailyMinutes.example)?.dailyMinutes;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <BackLink href={back} label={t('tenantOwner.memberDetail.back')} />
      <PanelSection title={t(`${KEY}.title.${view.who}`)} prominent>
        <p className="text-sm text-text [overflow-wrap:anywhere]">{item.excerpt}</p>
        <p className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span>{t(`${KEY}.count.${view.who}`, { count: total })}</span>
          <ExamplePill text={exampleBadge(t, { example })} />
        </p>
        {daily ? (
          <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            {t('tenantOwner.bandMembers.exampleNote')}
            <ExamplePill text={exampleBadge(t, daily)} />
          </p>
        ) : null}
        {total === 0 ? (
          <p className="text-sm text-text-secondary">{t(`${KEY}.empty.${view.who}`)}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((person) => (
              <li key={person.id} className="min-w-0">
                <MemberCard
                  t={t}
                  member={person}
                  band={person.band}
                  id={contentMemberAnchor(person.id)}
                  href={ownerContentHref({ ...view, memberId: person.id, list: null })}
                />
              </li>
            ))}
          </ul>
        )}
        {more > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-text-secondary">
              {t('tenantOwner.bandMembers.more', { count: more })}
            </p>
            <PreviewAction>{t('tenantOwner.bandMembers.seeAll')}</PreviewAction>
          </div>
        ) : null}
      </PanelSection>
    </div>
  );
}
