import { type Delta, memberPanel, type ReportValue } from '@rede-social/module-dashboard/fixtures';
import {
  BarList,
  dailyAverageMinutes,
  KpiCard,
  KpiGrid,
  LineChart,
  MIN_STREAK_WEEKS,
  totalMinutes,
} from '@rede-social/module-dashboard/ui';
import { ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { type MemberListSlug, memberCardAnchor, memberListHref } from '@/lib/dashboard-preview';
import { ExamplePill } from './ExamplePill';
import {
  exampleBadge,
  formatCount,
  formatHoursMinutes,
  formatWeekdayShort,
  kpiDelta,
} from './format';
import { PanelSection } from './PanelSection';

/**
 * A report card that opens its list (quick 261012-hqr): the whole card is a plain link (a server
 * navigation, no client JS) and carries the id "Voltar" returns to, unless another card already
 * holds it (`anchor={false}`, so ids stay unique).
 */
function ListLink({
  slug,
  anchor = true,
  children,
}: {
  slug: MemberListSlug;
  anchor?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={memberListHref(slug)}
      id={anchor ? memberCardAnchor(slug) : undefined}
      className="grid scroll-mt-20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      {children}
    </a>
  );
}

/**
 * Level 7's "Sua atividade": the member's OWN activity over the last 7 days, like Instagram's, in
 * five blocks: usage time, engagement, what they saw, where they participate, and presence and
 * streak (the presence and streak live here only, nowhere else on the panel). Own data only, never
 * another member's and never the member's engagement band (D-01). A metric the app does not collect
 * yet shows a fictional value with the "exemplo" pill, derived from the data's `example` flag and
 * never from a position; its collection reason is never shown here (D-03). The deltas are neutral:
 * the report describes the member's behaviour, it never grades it.
 */
export async function MemberActivity() {
  const t = await getTranslations('dashboard');
  const { activity, profile } = memberPanel;
  const { usage, peakHours, engagement, seen, byCommunity } = activity;
  const days = usage.value.days;
  const engagementCards: {
    key: 'likes' | 'comments' | 'saves' | 'shares';
    metric: ReportValue<{ count: number; delta: Delta }>;
    list?: MemberListSlug;
  }[] = [
    { key: 'likes', metric: engagement.likes, list: 'curtidas' },
    { key: 'comments', metric: engagement.comments, list: 'comentarios' },
    { key: 'saves', metric: engagement.saves, list: 'salvamentos' },
    { key: 'shares', metric: engagement.shares, list: 'compartilhamentos' },
  ];
  const peakBadge = exampleBadge(t, peakHours);
  const seeList = (
    <span className="flex items-center gap-1 text-xs font-bold text-brand">
      {t('member.lists.seeList')}
      <ChevronRight aria-hidden size={14} />
    </span>
  );

  return (
    <PanelSection title={t('member.activity.title')} prominent>
      <div className="flex flex-col gap-6">
        <PanelSection
          as="h4"
          title={t('member.activity.usage.title')}
          period={t('member.activity.period')}
        >
          <KpiCard
            label={t('member.activity.usage.average')}
            value={formatCount(dailyAverageMinutes(days))}
            unit={t('member.activity.usage.unit')}
            delta={kpiDelta(t, usage.value.delta)}
            note={t('member.activity.usage.weekTotal', {
              duration: formatHoursMinutes(t, totalMinutes(days)),
            })}
            badge={exampleBadge(t, usage)}
            chart={
              <LineChart
                series={days.map((day) => day.minutes)}
                xLabels={days.map((day) => formatWeekdayShort(day.date))}
                yStep={10}
                formatValue={formatCount}
                ariaLabel={t('member.activity.usage.chartLabel')}
              />
            }
          />
          <p className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <span>
              {t('member.activity.usage.peak', {
                from: peakHours.value.fromHour,
                to: peakHours.value.toHour,
              })}
            </span>
            <ExamplePill text={peakBadge} />
          </p>
        </PanelSection>

        <PanelSection
          as="h4"
          title={t('member.activity.engagement.title')}
          period={t('member.activity.period')}
        >
          <KpiGrid>
            {engagementCards.map(({ key, metric, list }) => {
              const card = (
                <KpiCard
                  key={key}
                  label={t(`member.activity.engagement.${key}`)}
                  value={formatCount(metric.value.count)}
                  delta={kpiDelta(t, metric.value.delta)}
                  badge={exampleBadge(t, metric)}
                  footer={list ? seeList : undefined}
                />
              );
              return list ? (
                <ListLink key={key} slug={list}>
                  {card}
                </ListLink>
              ) : (
                card
              );
            })}
          </KpiGrid>
        </PanelSection>

        <PanelSection
          as="h4"
          title={t('member.activity.seen.title')}
          period={t('member.activity.period')}
        >
          <KpiGrid>
            <ListLink slug="posts-vistos">
              <KpiCard
                label={t('member.activity.seen.posts')}
                value={formatCount(seen.posts.value.posts)}
                unit={t('member.activity.seen.postsUnit', { count: seen.posts.value.posts })}
                note={t('member.activity.seen.postsViews', { count: seen.posts.value.views })}
                badge={exampleBadge(t, seen.posts)}
                footer={seeList}
              />
            </ListLink>
            <ListLink slug="stories">
              <KpiCard
                label={t('member.activity.seen.stories')}
                value={formatCount(seen.stories.value)}
                badge={exampleBadge(t, seen.stories)}
                footer={seeList}
              />
            </ListLink>
            <ListLink slug="videos">
              <KpiCard
                label={t('member.activity.seen.videos')}
                value={formatCount(seen.videos.value.count)}
                unit={t('member.activity.seen.videosUnit', { count: seen.videos.value.count })}
                badge={exampleBadge(t, seen.videos)}
                footer={seeList}
              />
            </ListLink>
            <ListLink slug="videos" anchor={false}>
              <KpiCard
                label={t('member.activity.seen.videoTime')}
                value={formatHoursMinutes(t, seen.videos.value.minutes)}
                badge={exampleBadge(t, seen.videos)}
                footer={seeList}
              />
            </ListLink>
          </KpiGrid>
        </PanelSection>

        <PanelSection
          as="h4"
          title={t('member.activity.communities.title')}
          period={t('member.activity.period')}
        >
          <BarList
            rows={byCommunity.value.map((row, i) => ({
              id: row.id,
              label: row.name,
              value: row.interactions,
              display: formatCount(row.interactions),
              highlight: i === 0,
            }))}
          />
          <p className="text-xs text-text-secondary">{t('member.activity.communities.caption')}</p>
        </PanelSection>

        <PanelSection
          as="h4"
          title={t('member.activity.presence.title')}
          period={t('member.activity.presencePeriod')}
        >
          <KpiGrid>
            <KpiCard
              label={t('member.activity.presence.attendance')}
              value={formatCount(profile.attendance.attended)}
              unit={t('member.activity.presence.attendanceOf', {
                total: formatCount(profile.attendance.events),
              })}
              note={t('member.activity.presence.attendanceWindow')}
            />
            {profile.weeklyStreak >= MIN_STREAK_WEEKS ? (
              <KpiCard
                label={t('member.activity.presence.streak')}
                value={formatCount(profile.weeklyStreak)}
                unit={t('member.activity.presence.streakUnit', { weeks: profile.weeklyStreak })}
                note={t('member.activity.presence.streakNote')}
              />
            ) : null}
          </KpiGrid>
        </PanelSection>
      </div>
    </PanelSection>
  );
}
