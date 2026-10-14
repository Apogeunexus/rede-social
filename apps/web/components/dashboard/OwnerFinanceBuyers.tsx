import { formatBrlWhole } from '@rede-social/contracts/money';
import {
  type EngagementBand,
  financeOffer,
  ownerFinanceBands,
  ownerFinanceNeverAgain,
  ownerFinancePaths,
  ownerFinanceProduct,
} from '@rede-social/module-dashboard/fixtures';
import {
  ActionCard,
  BarList,
  Collapsible,
  ENGAGEMENT_BAND_ORDER,
  isBelowPrivacyFloor,
  PRIVACY_FLOOR,
  percentOf,
} from '@rede-social/module-dashboard/ui';
import { Card } from '@rede-social/ui';
import { ChevronRight, Footprints, Sparkles } from 'lucide-react';
import {
  financeNeverAnchor,
  financeTabView,
  type OwnerFinanceView,
  ownerFinanceHref,
} from '@/lib/owner-finance-view';
import { BandSummary } from './BandMembers';
import { bandLabel, type DashboardT, formatCount, formatPercent } from './format';
import { BandBuyers } from './OwnerFinancePeople';
import { PanelSection, PreviewAction } from './PanelSection';

const KEY = 'tenantOwner.finance.buyers';
const ACTIVE: readonly EngagementBand[] = ['superfan', 'engaged'];

/**
 * (1) Receita por faixa (D-09): one sentence on how much superfãs and engajados bring, then the six
 * bands in order, each summing the month (under 5 orders, no value: D-06) with the band's mini bar;
 * opened, its buyers. Em risco and inativos bought nothing by definition (PD-4) and say so.
 */
function Bands({ t, view }: { t: DashboardT; view: OwnerFinanceView }) {
  const bands = ownerFinanceBands();
  const total = ENGAGEMENT_BAND_ORDER.reduce((sum, band) => sum + bands[band].cents, 0);
  const members = ENGAGEMENT_BAND_ORDER.reduce((sum, band) => sum + bands[band].members, 0);
  const activeCents = ACTIVE.reduce((sum, band) => sum + bands[band].cents, 0);
  const activeMembers = ACTIVE.reduce((sum, band) => sum + bands[band].members, 0);
  return (
    <PanelSection title={t(`${KEY}.bands.title`)}>
      <p className="text-sm text-text">
        {t(`${KEY}.bands.sentence`, {
          percent: formatPercent(percentOf(activeCents, total)),
          value: formatBrlWhole(activeCents),
          members: formatPercent(percentOf(activeMembers, members)),
        })}
      </p>
      <p className="text-xs text-text-secondary">{t(`${KEY}.bands.note`)}</p>
      {ENGAGEMENT_BAND_ORDER.map((band) => {
        const row = bands[band];
        const label =
          row.orders === 0
            ? t(`${KEY}.bands.none`)
            : isBelowPrivacyFloor(row.orders)
              ? t(`${KEY}.bands.floor`, { floor: PRIVACY_FLOOR })
              : t(`${KEY}.bands.summary`, {
                  value: formatBrlWhole(row.cents),
                  orders: row.orders,
                  buyers: row.buyers,
                  percent: formatPercent(percentOf(row.buyers, row.members)),
                });
        return (
          <Collapsible
            key={band}
            open={band === view.band}
            title={bandLabel(t, band)}
            summary={
              <BandSummary t={t} band={band} count={row.buyers} total={row.members} label={label} />
            }
          >
            {row.buyers === 0 ? (
              <p className="text-sm text-text-secondary">{t(`${KEY}.bands.idle`)}</p>
            ) : (
              <BandBuyers t={t} view={financeTabView('buyers')} band={band} />
            )}
          </Collapsible>
        );
      })}
    </PanelSection>
  );
}

/** "E-book de entrada → Comunidade VIP": the path's two offers by their products. */
function pathLabel(t: DashboardT, entry: string, next: string): string {
  return t(`${KEY}.ladder.path`, {
    from: ownerFinanceProduct(financeOffer(entry).productId).name,
    to: ownerFinanceProduct(financeOffer(next).productId).name,
  });
}

/**
 * (2) Escada de compra (PD-15): from the entry offer to the second purchase, since each member
 * joined; how many took each path and the average days, the paths under 5 people together last.
 * No row opens: who bought again is already the overview's number.
 */
function Ladder({ t }: { t: DashboardT }) {
  const { paths, others } = ownerFinancePaths();
  const days = (value: number) => t(`${KEY}.ladder.days`, { count: Math.round(value) });
  // A step icon on each row stacks the bar list: a path's name is too long for a side column.
  const step = (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand"
    >
      <Footprints size={16} />
    </span>
  );
  return (
    <PanelSection title={t(`${KEY}.ladder.title`)}>
      <p className="text-xs text-text-secondary">{t(`${KEY}.ladder.note`)}</p>
      <BarList
        rows={[
          ...paths.map((path, i) => ({
            id: `${path.entry}-${path.next}`,
            label: pathLabel(t, path.entry, path.next),
            value: path.people,
            display: t(`${KEY}.ladder.people`, { count: path.people }),
            rate: days(path.averageDays),
            highlight: i === 0,
            leading: step,
          })),
          ...(others
            ? [
                {
                  id: 'others',
                  label: t(`${KEY}.ladder.others`, { count: others.paths }),
                  value: isBelowPrivacyFloor(others.people) ? 0 : others.people,
                  display: isBelowPrivacyFloor(others.people)
                    ? t(`${KEY}.ladder.floor`, { floor: PRIVACY_FLOOR })
                    : t(`${KEY}.ladder.people`, { count: others.people }),
                  rate: isBelowPrivacyFloor(others.people) ? undefined : days(others.averageDays),
                  leading: step,
                },
              ]
            : []),
        ]}
      />
    </PanelSection>
  );
}

/**
 * (3) Entraram e nunca compraram de novo (D-09), by band: each row with someone opens the list;
 * then the suggested action, disabled as in the rest of the preview.
 */
function NeverAgain({ t }: { t: DashboardT }) {
  const never = ownerFinanceNeverAgain();
  const bands = ownerFinanceBands();
  const total = ENGAGEMENT_BAND_ORDER.reduce((sum, band) => sum + never[band], 0);
  return (
    <PanelSection title={t(`${KEY}.never.title`)}>
      <p className="text-xs text-text-secondary">{t(`${KEY}.never.note`)}</p>
      <Card>
        <ul className="divide-y divide-border">
          {ENGAGEMENT_BAND_ORDER.map((band) => {
            const text = (
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-bold text-text">{bandLabel(t, band)}</span>
                <span className="text-xs text-text-secondary">
                  {t(`${KEY}.never.row`, {
                    count: never[band],
                    value: formatCount(never[band]),
                    percent: formatPercent(percentOf(never[band], bands[band].members)),
                  })}
                </span>
              </span>
            );
            return (
              <li key={band}>
                {never[band] === 0 ? (
                  <div className="flex items-center gap-3 px-3 py-3">{text}</div>
                ) : (
                  <a
                    id={financeNeverAnchor(band)}
                    href={ownerFinanceHref({ ...financeTabView('buyers'), neverBand: band })}
                    className="flex scroll-mt-20 items-center gap-3 px-3 py-3 transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                  >
                    {text}
                    <ChevronRight aria-hidden size={18} className="shrink-0 text-brand" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
      <ActionCard
        icon={Sparkles}
        title={t(`${KEY}.never.action.title`)}
        detail={t(`${KEY}.never.action.detail`, { count: total, value: formatCount(total) })}
        action={<PreviewAction variant="outline">{t(`${KEY}.never.action.button`)}</PreviewAction>}
      />
    </PanelSection>
  );
}

/** Financeiro › Quem compra (D-09): revenue by band, the purchase ladder, who never bought again. */
export function OwnerFinanceBuyers({ t, view }: { t: DashboardT; view: OwnerFinanceView }) {
  return (
    <>
      <Bands t={t} view={view} />
      <Ladder t={t} />
      <NeverAgain t={t} />
    </>
  );
}
