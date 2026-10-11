import { Card } from '@rede-social/ui';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { type LabelTone, ToneLabel } from './ToneLabel';

export interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  detail: string;
  /** A status pill under the row ("Começa em 40 min"). */
  pill?: { tone: LabelTone; text: string };
  /** The card's action (a button or link the host decides). */
  action?: ReactNode;
  /** When set, the unread dot shows and this word is read to screen readers ("não lida"). */
  unreadLabel?: string;
  /** Draws the trailing chevron of a row that leads somewhere. */
  navigable?: boolean;
}

/**
 * One "Para você" card of the member's profile: an icon, a bold title and a detail line, then an
 * optional pill and action. The module holds no words: every string is the host's.
 */
export function ActionCard({
  icon: Icon,
  title,
  detail,
  pill,
  action,
  unreadLabel,
  navigable = false,
}: ActionCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon aria-hidden size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 [overflow-wrap:anywhere]">
          <span className="text-sm font-bold text-text">{title}</span>
          <span className="text-xs text-text-secondary">{detail}</span>
        </div>
        {unreadLabel ? (
          <>
            <span
              data-unread-dot
              aria-hidden
              className="size-2.5 shrink-0 rounded-full bg-danger"
            />
            <span className="sr-only">{unreadLabel}</span>
          </>
        ) : null}
        {navigable ? (
          <ChevronRight aria-hidden size={18} className="shrink-0 text-text-tertiary" />
        ) : null}
      </div>
      {pill || action ? (
        <div className="flex flex-wrap items-center gap-2">
          {pill ? <ToneLabel tone={pill.tone}>{pill.text}</ToneLabel> : null}
          {action}
        </div>
      ) : null}
    </Card>
  );
}
