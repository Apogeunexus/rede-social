import { formatBrlCompact } from '@rede-social/contracts/money';
import { CommunityCover } from '@rede-social/module-communities/ui';
import {
  type EngagementBand,
  ownerScopeBands,
  tenantOwnerPanel,
} from '@rede-social/module-dashboard/fixtures';
import { bandTotal } from '@rede-social/module-dashboard/ui';
import { EventCover } from '@rede-social/module-events/ui';
import { Card, StatusPill } from '@rede-social/ui';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { OWNER_COMMUNITIES, OWNER_EVENTS, ownerMembersHref } from '@/lib/owner-band-scope';
import { ExamplePill } from './ExamplePill';
import {
  communityLabel,
  type DashboardT,
  exampleBadge,
  formatCount,
  formatDayMonth,
  formatDuration,
} from './format';

const ALL_EVENTS = [...tenantOwnerPanel.events.past, ...tenantOwnerPanel.events.upcoming];

export function ownerCommunity(id: string) {
  const community = tenantOwnerPanel.byCommunity.find((row) => row.id === id);
  if (!community) throw new Error(`no community ${id}`);
  return community;
}

export function ownerEvent(id: string) {
  const event = ALL_EVENTS.find((row) => row.id === id);
  if (!event) throw new Error(`no event ${id}`);
  return event;
}

interface ScopeCardProps {
  t: DashboardT;
  id: string;
  band: EngagementBand;
  /** The opened item's link; null = not a link (the opened item, or nobody in the band). */
  href: string | null;
}

/** The card's last row: how many of the band are in the item, and a chevron when it opens. */
function InBand({ t, count, linked }: { t: DashboardT; count: number; linked: boolean }) {
  return (
    <p className="flex items-center justify-between gap-2 text-sm font-bold text-brand">
      <span>{t('tenantOwner.scopeCards.inBand', { count: formatCount(count) })}</span>
      {linked ? <ChevronRight aria-hidden size={18} className="shrink-0" /> : null}
    </p>
  );
}

/**
 * One column of a card: the small gray label, then the large bold value. `justify-between` keeps the
 * values on one line when a label wraps to two and its neighbor does not.
 */
function Cell({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col justify-between gap-0.5 ${className ?? ''}`}>
      <dt className="text-xs text-text-secondary">{label}</dt>
      <dd className="text-lg font-bold text-text tabular-nums [overflow-wrap:normal]">{value}</dd>
    </div>
  );
}

/** The whole card is the link when it opens (the member card's focus ring), else plain. */
function Linked({ href, children }: { href: string | null; children: ReactNode }) {
  if (href === null) return children;
  return (
    <a
      href={href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {children}
    </a>
  );
}

/**
 * A community as the user drew it (quick 261012-tru D-03): the full-width cover at its original
 * 16:7 (the communities module's own `card` box; no photo in the preview, so its `--brand-gradient`
 * fallback), the name below it, the description, a thin line, four columns (members, active in the
 * week, posts and likes + comments in the month), the note on what an interaction is, and how many
 * of the band are in it.
 */
export function CommunityScopeCard({ t, id, band, href }: ScopeCardProps) {
  const community = ownerCommunity(id);
  // The members with access to it: the sum of its own six bands.
  const bands = ownerScopeBands({ kind: 'community', id });
  const name = communityLabel(t, community);
  const key = 'tenantOwner.scopeCards.community';
  return (
    <Linked href={href}>
      <Card className="flex flex-col transition-colors hover:bg-card-hover">
        <CommunityCover
          geometry="card"
          coverAssetId={null}
          coverVariantWidths={[]}
          coverAlt={name}
        />
        <div className="flex flex-col gap-3 p-4 [overflow-wrap:anywhere]">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold leading-tight text-text">{name}</span>
            <span className="text-sm text-text-secondary">{community.description}</span>
          </div>
          <dl className="grid grid-cols-4 gap-2 border-t border-border pt-3">
            <Cell label={t(`${key}.members`)} value={formatCount(bandTotal(bands))} />
            <Cell label={t(`${key}.activeWeek`)} value={formatCount(community.activeWeek)} />
            <Cell label={t(`${key}.posts`)} value={formatCount(community.posts)} />
            <Cell label={t(`${key}.interactions`)} value={formatCount(community.interactions)} />
          </dl>
          <p className="text-xs text-text-secondary">{t(`${key}.interactionsNote`)}</p>
          <InBand t={t} count={bands.counts[band]} linked={href !== null} />
        </div>
      </Card>
    </Linked>
  );
}

/**
 * An event as the user drew it (quick 261012-tru D-04): the full-width cover at its original 16:10
 * (the events module's own `hero` box, `--brand-gradient` fallback), the name, a Presencial/Online
 * pill, a thin line, three columns split by thin lines (date, duration, revenue = RSVPs × the example
 * ticket price; the list says once that it is an example) and how many of the band registered.
 */
export function EventScopeCard({ t, id, band, href }: ScopeCardProps) {
  const event = ownerEvent(id);
  const key = 'tenantOwner.scopeCards.event';
  return (
    <Linked href={href}>
      <Card className="flex flex-col transition-colors hover:bg-card-hover">
        <EventCover
          geometry="hero"
          coverAssetId={null}
          coverVariantWidths={[]}
          coverAlt={event.name}
        />
        <div className="flex flex-col gap-3 p-4 [overflow-wrap:anywhere]">
          <div className="flex flex-col items-start gap-2">
            <span className="text-xl font-bold leading-tight text-text">{event.name}</span>
            <StatusPill tone="brand" className="w-fit">
              {t(`tenantOwner.formatsCompared.${event.format}`)}
            </StatusPill>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-border border-t border-border pt-3">
            <Cell
              label={t(`${key}.date`)}
              value={formatDayMonth(event.date)}
              className="px-2 first:pl-0 last:pr-0"
            />
            <Cell
              label={t(`${key}.duration`)}
              value={formatDuration(t, event.durationMinutes)}
              className="px-2 first:pl-0 last:pr-0"
            />
            <Cell
              label={t(`${key}.revenue`)}
              value={formatBrlCompact(event.confirmed * event.ticketCents.value)}
              className="px-2 first:pl-0 last:pr-0"
            />
          </dl>
          <InBand
            t={t}
            count={ownerScopeBands({ kind: 'event', id }).counts[band]}
            linked={href !== null}
          />
        </div>
      </Card>
    </Linked>
  );
}

/** The one line saying every receita of a list is an example (D-04: one pill per list). */
export function RevenueExampleNote({ t }: { t: DashboardT }) {
  const first = ALL_EVENTS[0];
  if (!first) throw new Error('no event');
  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
      {t('tenantOwner.scopeCards.event.revenueNote')}
      <ExamplePill text={exampleBadge(t, first.ticketCents)} />
    </p>
  );
}

/**
 * The body of a band opened in Por comunidade or Por evento (D-02): every community or event in the
 * panel's order, each linked one level down when it has members in the band, else unlinked with
 * "0 nesta faixa" (its URL would fall back here anyway).
 */
export function ScopeItemCards({
  t,
  kind,
  band,
}: {
  t: DashboardT;
  kind: 'community' | 'event';
  band: EngagementBand;
}) {
  const ids = (kind === 'community' ? OWNER_COMMUNITIES : OWNER_EVENTS).map((row) => row.id);
  const Item = kind === 'community' ? CommunityScopeCard : EventScopeCard;
  return (
    <>
      {kind === 'event' ? <RevenueExampleNote t={t} /> : null}
      <ul className="flex flex-col gap-3">
        {ids.map((id) => {
          const count = ownerScopeBands({ kind, id }).counts[band];
          const href =
            count > 0
              ? ownerMembersHref({ kind, band, itemId: id, memberId: null, list: null })
              : null;
          return (
            <li key={id} className="min-w-0">
              <Item t={t} id={id} band={band} href={href} />
            </li>
          );
        })}
      </ul>
    </>
  );
}
