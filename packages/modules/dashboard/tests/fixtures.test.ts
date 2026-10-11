import { resolveBranding, tenantBrandingSchema } from '@rede-social/contracts/branding';
import { describe, expect, it } from 'vitest';
import { platformOwnerPanel, previewTenant } from '../fixtures';

describe('previewTenant (the Igor Alves brand record)', () => {
  it('parses as a stored tenant branding', () => {
    expect(() => tenantBrandingSchema.parse(previewTenant.branding)).not.toThrow();
  });

  it('resolves to the blue pair with the lighter blue as the dark primary', () => {
    const { colors } = resolveBranding(previewTenant.branding);
    expect(colors.primary).toBe('#2e6fd0');
    expect(colors.secondary).toBe('#5b9cf8');
    expect(colors.primaryDark).toBe('#5b9cf8');
  });

  it('is named Dr. Igor Alves', () => {
    expect(previewTenant.displayName).toBe('Dr. Igor Alves');
  });
});

describe('platformOwnerPanel', () => {
  it('carries a 12-point active-clients series ending at the current count', () => {
    const { series, count } = platformOwnerPanel.kpis.activeClients;
    expect(series).toHaveLength(12);
    expect(series.at(-1)).toBe(count);
  });

  it('reports storage against the 1 GB plan', () => {
    const { usedGb, planGb } = platformOwnerPanel.kpis.storage;
    expect(planGb).toBe(1);
    expect(usedGb).toBeLessThan(planGb);
  });
});
