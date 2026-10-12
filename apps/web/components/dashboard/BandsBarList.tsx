import type { EngagementBands } from '@rede-social/module-dashboard/fixtures';
import {
  BarList,
  bandTotal,
  ENGAGEMENT_BAND_ORDER,
  mergeBandsBelowFloor,
  percentOf,
} from '@rede-social/module-dashboard/ui';
import { bandGroupLabel, bandLabel, type DashboardT, formatCount, formatPercent } from './format';

export interface BandsBarListProps {
  t: DashboardT;
  bands: EngagementBands;
  /**
   * Platform support (D-02, C-1): a band under the privacy floor is merged with a neighbour into one
   * row ("Superfãs e engajados"), so every row is ≥ 5 and the rows still sum to the exact total —
   * no band can be read directly or recovered by subtracting the others from the total.
   */
  floor?: boolean;
}

/**
 * The engagement bands as bars (D-04): in band order (never sorted by size), each bar a share of the
 * whole base, with its percent. Only "Em risco" is the solid bar: it is the band to act on.
 */
export function BandsBarList({ t, bands, floor = false }: BandsBarListProps) {
  const total = bandTotal(bands);
  const rows = floor
    ? mergeBandsBelowFloor(bands).map((group) => ({
        id: group.bands.join('-'),
        label: bandGroupLabel(t, group.bands),
        value: group.count,
        display: formatCount(group.count),
        rate: formatPercent(percentOf(group.count, total)),
        highlight: group.bands.includes('at_risk'),
      }))
    : ENGAGEMENT_BAND_ORDER.map((band) => {
        const count = bands.counts[band];
        return {
          id: band,
          label: bandLabel(t, band),
          value: count,
          display: formatCount(count),
          rate: formatPercent(percentOf(count, total)),
          highlight: band === 'at_risk',
        };
      });
  return <BarList max={total} rows={rows} />;
}
