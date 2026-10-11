import { type AttentionItem, AttentionList } from '@rede-social/module-dashboard/ui';
import { SectionTitle, StatusPill } from '@rede-social/ui';
import { getTranslations } from 'next-intl/server';
import { AlertsBell } from './AlertsBell';

export interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  /** A static, informative period chip ("30 dias"): the preview has no filter to change. */
  period?: string;
  /** Already-translated alerts: a non-empty list puts a bell on the right that opens them. */
  alerts?: readonly AttentionItem[];
}

/**
 * The panel's top bar (the reference's app bar, without its device frame): a brand-filled initial
 * mark, the title and a subtitle, and on the right the period and, when there are alerts, a bell
 * whose list opens under the header.
 */
export async function PanelHeader({ title, subtitle, period, alerts }: PanelHeaderProps) {
  const t = await getTranslations('dashboard.alerts');
  const count = alerts?.length ?? 0;

  return (
    <div className="relative flex items-center justify-between gap-3">
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
      <div className="flex shrink-0 items-center gap-1">
        {period ? <StatusPill className="shrink-0">{period}</StatusPill> : null}
        {alerts && count > 0 ? (
          <AlertsBell
            label={t('button', { count })}
            count={count}
            urgent={alerts.some((item) => item.tone === 'danger')}
          >
            <div className="flex flex-col gap-3">
              <SectionTitle as="h3" variant="group">
                {t('title', { count })}
              </SectionTitle>
              <AttentionList items={alerts} />
            </div>
          </AlertsBell>
        ) : null}
      </div>
    </div>
  );
}
