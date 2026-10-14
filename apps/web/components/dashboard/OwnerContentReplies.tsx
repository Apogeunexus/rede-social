import { ownerContentItem, ownerContentUnanswered } from '@rede-social/module-dashboard/fixtures';
import { Card } from '@rede-social/ui';
import { contentBackHref, type OwnerContentView } from '@/lib/owner-content-view';
import { BackLink } from './BackLink';
import { CoverThumb } from './CoverThumb';
import type { DashboardT } from './format';
import { personMoment } from './OwnerContentPeople';
import { contentAgeText, contentMeta } from './OwnerContentPostCard';
import { PanelSection, PreviewAction } from './PanelSection';

const KEY = 'tenantOwner.content';

/**
 * The comments of one "Precisa de atenção" post the team has not answered (quick 261013-orf E-02):
 * "Voltar" to its row, the publication (thumbnail, caption, meta), the overview row's own count line,
 * then each comment, oldest first — who wrote it, their band, the text, when, and "Responder"
 * (disabled, as every preview action). The only web file that reads `ownerContentUnanswered`: by the
 * user's decision E-02 it shows the text of the unanswered comments, to the client's team only.
 */
export function OwnerContentReplies({ t, view }: { t: DashboardT; view: OwnerContentView }) {
  const back = contentBackHref(view);
  // The parser only sets `reply` for a post that needs attention: a gap here is a bug.
  if (!view.reply || back === null) throw new Error('an unanswered comments screen with no post');
  const item = ownerContentItem(view.reply);
  const comments = ownerContentUnanswered(item.id);
  const hours = item.commentMeta.oldestUnansweredHours ?? 0;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <BackLink href={back} label={t('tenantOwner.memberDetail.back')} />
      <PanelSection title={t(`${KEY}.replies.title`)} prominent>
        <div className="flex items-start gap-3">
          <CoverThumb
            t={t}
            kind={item.kind}
            seed={item.id}
            durationSeconds={item.durationSeconds}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 [overflow-wrap:anywhere]">
            <p className="text-sm font-bold text-text">{item.excerpt}</p>
            <p className="text-xs text-text-secondary">{contentMeta(t, item)}</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-warning">
          {t(`${KEY}.overview.attention.row`, {
            count: item.comments - item.commentMeta.answered,
            age: contentAgeText(t, hours),
          })}
        </p>
        <Card>
          <ul className="divide-y divide-border">
            {comments.map(({ person, text }) => (
              <li key={person.id} className="flex flex-col gap-1.5 px-3 py-3">
                <p className="flex flex-wrap items-baseline gap-x-2 text-sm [overflow-wrap:anywhere]">
                  <span className="font-bold text-text">{person.name}</span>
                  <span className="text-xs text-text-secondary">
                    {t(`tenantOwner.memberDetail.band.${person.band}`)}
                  </span>
                </p>
                <p className="text-sm text-text [overflow-wrap:anywhere]">{text}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-text-secondary">
                    {t(`${KEY}.replies.when`, { when: personMoment(t, person.when) })}
                  </span>
                  <PreviewAction variant="outline">{t(`${KEY}.replies.reply`)}</PreviewAction>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </PanelSection>
    </div>
  );
}
