import { Chip } from '@rede-social/ui';

export interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  /** A static, informative period chip ("30 dias"): the preview has no filter to change. */
  period?: string;
}

/**
 * The panel's top bar (the reference's app bar, without its device frame): a brand-filled initial
 * mark, the title and a subtitle, and the period on the right.
 */
export function PanelHeader({ title, subtitle, period }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-base font-extrabold text-on-brand"
        >
          {title.charAt(0)}
        </span>
        <div className="flex min-w-0 flex-col [overflow-wrap:anywhere]">
          <p className="text-base font-extrabold leading-tight text-text">{title}</p>
          {subtitle ? <p className="text-xs text-text-secondary">{subtitle}</p> : null}
        </div>
      </div>
      {period ? <Chip className="shrink-0">{period}</Chip> : null}
    </div>
  );
}
