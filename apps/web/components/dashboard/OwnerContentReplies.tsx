import { ownerContentItem, ownerContentUnanswered } from '@rede-social/module-dashboard/fixtures';
import { Card } from '@rede-social/ui';
import { ChevronRight } from 'lucide-react';
import {
  contentBackHref,
  contentTabView,
  type OwnerContentView,
  ownerContentHref,
} from '@/lib/owner-content-view';
import { BackLink } from './BackLink';
import { Linked } from './BandScopeCards';
import { CoverThumb } from './CoverThumb';
import { type DashboardT, momentText } from './format';
import { contentAgeText, contentMeta } from './OwnerContentPostCard';
import { PanelSection, PreviewAction } from './PanelSection';

const KEY = 'tenantOwner.content';

/**
 * The comments of one "Precisa de atenção" post the team has not answered (quick 261013-orf E-02):
 * "Voltar" to its row, the publication (thumbnail, caption, meta: a link to its detail, quick
 * 261013-uoi F-7), the overview row's own count line,
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
        <Linked href={ownerContentHref({ ...contentTabView('overview'), postId: item.id })}>
          <span className="flex items-start gap-3">
            <CoverThumb
              t={t}
              kind={item.kind}
              seed={item.id}
              durationSeconds={item.durationSeconds}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 [overflow-wrap:anywhere]">
              <span className="text-sm font-bold text-text">{item.excerpt}</span>
              <span className="text-xs text-text-secondary">{contentMeta(t, item)}</span>
            </span>
            <ChevronRight aria-hidden size={18} className="shrink-0 self-center text-brand" />
          </span>
        </Linked>
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
                    {t(`${KEY}.replies.when`, { when: momentText(t, person.when) })}
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
