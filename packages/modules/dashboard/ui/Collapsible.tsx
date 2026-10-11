import { Card } from '@rede-social/ui';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

export interface CollapsibleProps {
  title: string;
  /** Secondary text on the summary line ("6 módulos ligados"). */
  summary?: ReactNode;
  open?: boolean;
  children: ReactNode;
}

/**
 * A native `<details>` in a card: keyboard and screen-reader behaviour for free, and it works with no
 * JavaScript at all. The chevron turns when it is open.
 */
export function Collapsible({ title, summary, open = false, children }: CollapsibleProps) {
  return (
    <Card>
      <details open={open} className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-bold text-text">{title}</span>
            {summary ? <span className="text-xs text-text-secondary">{summary}</span> : null}
          </span>
          <ChevronDown
            aria-hidden
            size={18}
            className="shrink-0 text-text-tertiary transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>
      </details>
    </Card>
  );
}
