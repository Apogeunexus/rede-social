import { StatusPill } from '@rede-social/ui';

/**
 * The "exemplo" pill next to a fictional value (the KpiCard badge's markup, for values outside a
 * KpiCard). Renders nothing without text, so a host passes `exampleBadge(t, metric)` straight in.
 */
export function ExamplePill({ text }: { text: string | undefined }) {
  if (text === undefined) return null;
  return (
    <StatusPill tone="neutral" className="px-2 py-0.5">
      {text}
    </StatusPill>
  );
}
