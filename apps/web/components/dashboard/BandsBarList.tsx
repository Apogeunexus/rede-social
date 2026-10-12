import type { EngagementBands } from '@rede-social/module-dashboard/fixtures';
import {
  BarList,
  bandTotal,
  ENGAGEMENT_BAND_ORDER,
  isBelowPrivacyFloor,
  percentOf,
} from '@rede-social/module-dashboard/ui';
import { bandLabel, type DashboardT, formatCount, formatFloored, formatPercent } from './format';

export interface BandsBarListProps {
  t: DashboardT;
  bands: EngagementBands;
  /**
   * Platform support (D-02): a band under the privacy floor reads "menos de 5", with an empty bar and
   * no percent, so neither the width nor a rate can give the true count away.
   */
  floor?: boolean;
}

/**
 * The engagement bands as bars (D-04): in band order (never sorted by size), each bar a share of the
 * whole base, with its percent. Only "Em risco" is the solid bar: it is the band to act on.
 */
export function BandsBarList({ t, bands, floor = false }: BandsBarListProps) {
  const total = bandTotal(bands);
  return (
    <BarList
      max={bandTotal(bands)}
      rows={ENGAGEMENT_BAND_ORDER.map((band) => {
        const count = bands.counts[band];
        const hidden = floor && isBelowPrivacyFloor(count);
        return {
          id: band,
          label: bandLabel(t, band),
          value: hidden ? 0 : count,
          display: hidden ? formatFloored(t, count) : formatCount(count),
          ...(hidden ? {} : { rate: formatPercent(percentOf(count, total)) }),
          highlight: band === 'at_risk',
        };
      })}
    />
  );
}
