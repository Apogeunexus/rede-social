import type { MemberListSlug } from '@/lib/dashboard-preview';
// smaug-ignore dead-imports: used in the JSX ternary below, which the scanner reads as a regex literal
import { MemberActivity } from './MemberActivity';
import { MemberActivityList } from './MemberActivityList';
import { TenantColumn } from './TenantColumn';

/**
 * Level 7, "Membro": the "Sua atividade" report, which also holds the presence at events and the
 * weekly streak. Own data only: the member never sees their engagement band.
 *
 * With `list` (an allow-listed `?lista=` slug, quick 261012-hqr) the list behind that report card
 * replaces the report, with a "Voltar" link back.
 */
export function MemberPanel({ list }: { list: MemberListSlug | null }) {
  return (
    <TenantColumn>{list ? <MemberActivityList slug={list} /> : <MemberActivity />}</TenantColumn>
  );
}
