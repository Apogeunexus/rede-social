import { formatBrl } from '@rede-social/contracts/money';
import {
  previewTenant,
  type StaffBlockKey,
  tenantStaffPanel,
} from '@rede-social/module-dashboard/fixtures';
import {
  isNewMember,
  KpiCard,
  KpiGrid,
  percentOf,
  ResponsiveTable,
  ToneLabel,
  vsMedian,
} from '@rede-social/module-dashboard/ui';
import { Badge, Button, Card, Chip, EmptyState } from '@rede-social/ui';
import { UserCog } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { previewLevelPath, STAFF_FUNCTIONS, type StaffFunction } from '@/lib/dashboard-preview';
import {
  type DashboardT,
  formatChange,
  formatCount,
  formatDuration,
  formatList,
  formatRatio,
  initials,
  kpiDelta,
  momentText,
} from './format';
import { MissingKpi } from './MissingKpi';
import { PanelHeader } from './PanelHeader';
import { PanelSection, PreviewAction } from './PanelSection';
import { TenantColumn } from './TenantColumn';

const BLOCK_OF: Record<StaffFunction, StaffBlockKey> = {
  atendimento: 'support',
  moderacao: 'moderation',
  conteudo: 'content',
  loja: 'store',
};

const LEVEL_PATH = previewLevelPath('equipe-do-cliente');

function tabHref(functions: readonly StaffFunction[], tab: StaffFunction): string {
  const query = new URLSearchParams({ simular: '1' });
  for (const id of functions) query.append('funcoes', id);
  query.set('aba', tab);
  return `${LEVEL_PATH}?${query.toString()}`;
}

/**
 * One person row of a list card: initials, bold name (with an optional tag after it), secondary
 * line, and a trailing slot.
 */
function PersonRow({
  name,
  tag,
  line,
  end,
}: {
  name: string;
  tag?: ReactNode;
  line: string;
  end?: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 p-4">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand"
      >
        {initials(name)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col [overflow-wrap:anywhere]">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-bold text-text">{name}</span>
          {tag}
        </span>
        <span className="text-xs text-text-secondary">{line}</span>
      </div>
      {end ? <div className="shrink-0">{end}</div> : null}
    </li>
  );
}

function SupportBlock({ t }: { t: DashboardT }) {
  const { support } = tenantStaffPanel;
  return (
    <>
      <KpiGrid>
        <KpiCard label={t('tenantStaff.support.waiting')} value={formatCount(support.waiting)} />
        <KpiCard
          label={t('tenantStaff.support.oldest')}
          value={
            <ToneLabel tone="danger">
              {t('tenantStaff.support.hours', { hours: support.oldestWaitHours })}
            </ToneLabel>
          }
        />
        <KpiCard
          label={t('tenantStaff.support.answered')}
          value={formatCount(support.answeredByMe.count)}
          delta={kpiDelta(t, support.answeredByMe.delta)}
        />
        <KpiCard
          label={t('tenantStaff.support.myFirstResponse')}
          value={formatDuration(t, support.myFirstResponseMedianMinutes)}
        />
      </KpiGrid>
      <PanelSection
        title={t('tenantStaff.support.queue')}
        action={t('tenantStaff.support.queueAction')}
      >
        <Card>
          <ul className="divide-y divide-divider">
            {support.queue.map((item) => (
              <PersonRow
                key={item.id}
                name={item.name}
                {...(isNewMember(item.joinedDaysAgo)
                  ? {
                      tag: <ToneLabel tone="brand">{t('tenantStaff.support.newMember')}</ToneLabel>,
                    }
                  : {})}
                line={item.preview}
                end={
                  <ToneLabel tone={item.severity}>
                    {t('tenantStaff.support.hours', { hours: item.waitingHours })}
                  </ToneLabel>
                }
              />
            ))}
          </ul>
        </Card>
      </PanelSection>
    </>
  );
}

function ModerationBlock({ t }: { t: DashboardT }) {
  const { moderation } = tenantStaffPanel;
  return (
    <>
      <KpiGrid>
        <KpiCard
          label={t('tenantStaff.moderation.newComments')}
          value={formatCount(moderation.newComments24h.count)}
          delta={kpiDelta(t, moderation.newComments24h.delta)}
        />
        <KpiCard
          label={t('tenantStaff.moderation.removalRate')}
          value={formatRatio(percentOf(moderation.removed7d, moderation.comments7d) / 100)}
          note={t('tenantStaff.moderation.removalRateNote', {
            removed: formatCount(moderation.removed7d),
            total: formatCount(moderation.comments7d),
          })}
        />
        <KpiCard
          label={t('tenantStaff.moderation.blocks')}
          value={formatCount(moderation.blocks7d)}
        />
        <KpiCard
          label={t('tenantStaff.moderation.firstComments')}
          value={formatCount(moderation.firstCommentsFromNew24h)}
        />
      </KpiGrid>
      <PanelSection title={t('tenantStaff.moderation.recent')}>
        <Card>
          <ul className="divide-y divide-divider">
            {moderation.recentComments.map((comment) => (
              <PersonRow
                key={comment.id}
                name={comment.name}
                line={comment.text}
                end={
                  <PreviewAction variant="danger">
                    {t('tenantStaff.moderation.remove')}
                  </PreviewAction>
                }
              />
            ))}
          </ul>
        </Card>
      </PanelSection>
    </>
  );
}

function ContentBlock({ t }: { t: DashboardT }) {
  const { content } = tenantStaffPanel;
  return (
    <>
      <KpiGrid>
        <KpiCard
          label={t('tenantStaff.content.posts')}
          value={formatCount(content.posts7d.count)}
          delta={kpiDelta(t, content.posts7d.delta)}
        />
        <KpiCard
          label={t('tenantStaff.content.stories')}
          value={formatCount(content.activeStories.count)}
          note={t('tenantStaff.content.storiesNote', {
            count: content.activeStories.expiringSoon,
            hours: content.activeStories.withinHours,
          })}
        />
      </KpiGrid>
      <PanelSection title={t('tenantStaff.content.recent')}>
        <ResponsiveTable
          caption={t('tenantStaff.content.recent')}
          columns={[
            { key: 'when', header: t('tenantStaff.content.columns.when') },
            { key: 'type', header: t('tenantStaff.content.columns.type') },
            { key: 'likes', header: t('tenantStaff.content.columns.likes'), numeric: true },
            { key: 'comments', header: t('tenantStaff.content.columns.comments'), numeric: true },
            { key: 'vsMedian', header: t('tenantStaff.content.columns.vsMedian'), numeric: true },
          ]}
          rows={content.recentPosts.map((post) => {
            const ratio = vsMedian(
              post.likes + post.comments,
              content.medianInteractions,
              post.ageHours,
              content.comparableAfterHours,
            );
            return {
              id: post.id,
              cells: {
                when: momentText(t, post.when),
                type: t(`postTypes.${post.type}`),
                likes: formatCount(post.likes),
                comments: formatCount(post.comments),
                vsMedian:
                  ratio === null ? t('tenantStaff.content.inProgress') : formatChange(ratio),
              },
            };
          })}
        />
        <p className="text-xs text-text-secondary">
          {t('tenantStaff.content.medianNote', {
            median: formatCount(content.medianInteractions),
            hours: content.comparableAfterHours,
          })}
        </p>
      </PanelSection>
    </>
  );
}

function StoreBlock({ t }: { t: DashboardT }) {
  const { store } = tenantStaffPanel;
  return (
    <>
      <KpiGrid>
        <KpiCard
          label={t('tenantStaff.store.orders')}
          value={formatCount(store.orders7d.count)}
          delta={kpiDelta(t, store.orders7d.delta)}
        />
        <KpiCard
          label={t('tenantStaff.store.noOrders')}
          value={formatCount(store.productsWithoutOrder30d.count)}
          note={formatList(store.productsWithoutOrder30d.names)}
        />
        <KpiCard
          label={t('tenantStaff.store.expiring')}
          value={formatCount(store.expiringAccess7d.count)}
          note={formatList(store.expiringAccess7d.products)}
        />
        <MissingKpi t={t} label={t('tenantStaff.store.conversion')} item={store.conversion} />
      </KpiGrid>
      <PanelSection title={t('tenantStaff.store.recent')}>
        <Card>
          <ul className="divide-y divide-divider">
            {store.recentPurchases.map((purchase) => (
              <li key={purchase.id} className="flex items-center gap-3 p-4">
                <div className="flex min-w-0 flex-1 flex-col [overflow-wrap:anywhere]">
                  <span className="text-sm font-bold text-text">{purchase.product}</span>
                  <span className="text-xs text-text-secondary">
                    {t(`tenantStaff.store.source.${purchase.source}`)}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-text">
                  {purchase.amountCents === null
                    ? t('tenantStaff.store.noAmount')
                    : formatBrl(purchase.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </PanelSection>
    </>
  );
}

const BLOCKS: Record<StaffBlockKey, (props: { t: DashboardT }) => ReactNode> = {
  support: SupportBlock,
  moderation: ModerationBlock,
  content: ContentBlock,
  store: StoreBlock,
};

export interface TenantStaffPanelProps {
  /** The granted functions (allow-listed, canonical order) and the open tab. */
  functions: StaffFunction[];
  active: StaffFunction | null;
}

/**
 * Level 6, "Equipe do cliente": what of my function is waiting for me now? One block per granted
 * function; with two or more, a row of tab links each with its count; with one, the block alone; with
 * none, an empty state. Above it, the preview's simulator: a plain GET form (no client JavaScript)
 * that picks which functions this person has.
 */
export async function TenantStaffPanel({ functions, active }: TenantStaffPanelProps) {
  const t = await getTranslations('dashboard');
  const { counts } = tenantStaffPanel;
  const Block = active ? BLOCKS[BLOCK_OF[active]] : null;

  return (
    <TenantColumn>
      <Card className="border border-dashed border-border-secondary bg-transparent p-4 shadow-none">
        <form method="get" action={LEVEL_PATH} className="flex flex-col gap-3">
          <input type="hidden" name="simular" value="1" />
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-xs font-bold text-text-secondary">
              {t('tenantStaff.simulator.legend')}
            </legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {STAFF_FUNCTIONS.map((id) => (
                <label key={id} className="flex min-h-9 items-center gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    name="funcoes"
                    value={id}
                    defaultChecked={functions.includes(id)}
                    className="size-4 accent-brand"
                  />
                  {t(`tenantStaff.functions.${id}`)}
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" variant="secondary" size="sm" className="self-start">
            {t('tenantStaff.simulator.submit')}
          </Button>
        </form>
      </Card>

      {functions.length > 0 ? (
        <PanelHeader
          title={previewTenant.displayName}
          subtitle={t('tenantStaff.header.subtitle')}
        />
      ) : null}

      {functions.length > 1 ? (
        <nav aria-label={t('tenantStaff.tabsLabel')}>
          <ul className="flex flex-wrap gap-2">
            {functions.map((id) => (
              <li key={id}>
                <Chip href={tabHref(functions, id)} active={id === active}>
                  {t(`tenantStaff.functions.${id}`)}
                  <Badge count={counts[BLOCK_OF[id]]} />
                </Chip>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {Block ? (
        <div className="flex flex-col gap-6">
          <Block t={t} />
        </div>
      ) : (
        <EmptyState
          variant="card"
          icon={UserCog}
          title={t('tenantStaff.empty.title')}
          body={t('tenantStaff.empty.body')}
        />
      )}
    </TenantColumn>
  );
}
