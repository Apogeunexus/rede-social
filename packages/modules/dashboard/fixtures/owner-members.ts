import type { RelativeMoment } from './platform-panels';
import type { EngagementBand } from './shared';

/** The page size of a band list (the future endpoint's page size). */
export const OWNER_BAND_LIST_LIMIT = 10;

/** The preview's today: the Encontro mensal day of the owner's event_today alert. */
export const PREVIEW_TODAY = '2026-10-12';

/** One row of a band list. `topCommunityId` is set only on the whole base. */
export interface OwnerBandMember {
  id: string;
  name: string;
  /** ISO date the member joined. */
  memberSince: string;
  lastActive: RelativeMoment;
  topCommunityId?: string;
}

export interface OwnerBandList {
  members: OwnerBandMember[];
  /** The band's members not listed (the band count minus the rows). */
  more: number;
}

export interface OwnerRosterMember {
  id: string;
  name: string;
  memberSince: string;
  band: EngagementBand;
  lastActive: RelativeMoment;
  topCommunityId: string;
  communities: Record<string, { band: EngagementBand; lastActive: RelativeMoment }>;
}

export const ownerBandRoster: readonly OwnerRosterMember[] = [];

export function ownerBandList(_communityId: string | null, _band: EngagementBand): OwnerBandList {
  throw new Error('not implemented');
}
