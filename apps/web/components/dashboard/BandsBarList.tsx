import type { EngagementBands } from '@rede-social/module-dashboard/fixtures';
import {
  BarList,
  bandTotal,
  ENGAGEMENT_BAND_ORDER,
  percentOf,
} from '@rede-social/module-dashboard/ui';
import { bandLabel, type DashboardT, formatCount, formatPercent } from './format';

export interface BandsBarListProps {
  t: DashboardT;
  bands: EngagementBands;
}

/**
 * The engagement bands as bars (D-04): in band order (never sorted by size), each bar a share of the
 * whole base, with its percent. Only "Em risco" is the solid bar: it is the band to act on.
 */
export function BandsBarList({ t, bands }: BandsBarListProps) {
  const total = bandTotal(bands);
  return (
    <BarList
      max={bandTotal(bands)}
      rows={ENGAGEMENT_BAND_ORDER.map((band) => {
        const count = bands.counts[band];
        return {
          id: band,
          label: bandLabel(t, band),
          value: count,
          display: formatCount(count),
          rate: formatPercent(percentOf(count, total)),
          highlight: band === 'at_risk',
        };
      })}
    />
  );
}
