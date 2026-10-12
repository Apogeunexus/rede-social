import { Button, type ButtonVariant, cn, SectionTitle, StatusPill } from '@rede-social/ui';
import type { ReactNode } from 'react';
import { PREVIEW_NOTE_ID } from '@/lib/dashboard-preview';

export interface PreviewActionProps {
  children: ReactNode;
  variant?: ButtonVariant;
}

/**
 * An action the real panel will have ("Ver todos", "Escalar para admin"), drawn disabled: the preview
 * has nothing behind it, so nothing may look clickable that does nothing. It points at the page's
 * "Dados de exemplo" note, which says why.
 */
export function PreviewAction({ children, variant = 'ghost' }: PreviewActionProps) {
  return (
    <Button variant={variant} size="sm" disabled aria-describedby={PREVIEW_NOTE_ID}>
      {children}
    </Button>
  );
}

export interface PanelSectionProps {
  title: string;
  /** The section's disabled action label, on the right of the title. */
  action?: string;
  /** A static period pill on the right of the title ("Últimos 7 dias"), like the panel header's. */
  period?: string;
  /** `h4` for a block nested in another section. */
  as?: 'h3' | 'h4';
  children: ReactNode;
  className?: string;
}

/** A titled block of a panel (h3 under the level's h2, or h4 inside another section). */
export function PanelSection({
  title,
  action,
  period,
  as = 'h3',
  children,
  className,
}: PanelSectionProps) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-3', className)}>
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-3">
        <SectionTitle as={as} variant="group">
          {title}
        </SectionTitle>
        {period ? <StatusPill className="shrink-0">{period}</StatusPill> : null}
        {action ? <PreviewAction>{action}</PreviewAction> : null}
      </div>
      {children}
    </section>
  );
}
