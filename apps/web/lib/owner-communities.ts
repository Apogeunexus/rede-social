type SearchParams = Record<string, string | string[] | undefined>;

export const OWNER_BANDS_ANCHOR = 'faixas';

export const OWNER_COMMUNITIES: readonly { id: string; slug: string }[] = [];

export function parseOwnerCommunity(_params: SearchParams): string | null {
  throw new Error('not implemented');
}

export function ownerMembersHref(_communityId: string | null): string {
  throw new Error('not implemented');
}
