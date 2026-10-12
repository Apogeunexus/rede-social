import { memberPanel, previewTenant } from '@rede-social/module-dashboard/fixtures';
import { ActionCard, type ForYouCard, selectForYouCards } from '@rede-social/module-dashboard/ui';
import { CalendarClock, CalendarDays, Lock, MessageCircle, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { formatCount, formatMonthYear, initials } from './format';
import { MemberActivity } from './MemberActivity';
import { PanelHeader } from './PanelHeader';
import { PanelSection, PreviewAction } from './PanelSection';
import { TenantColumn } from './TenantColumn';

/**
 * Level 7, "Membro": what is there for me now that I must not miss? Not a new page in the app: the
 * profile header (name and "Membro desde"), then a "Para você" block of at most three cards, by
 * priority: the next event (with the check-in) > a support reply (unread dot) > an access about to
 * expire (renew) > news since the last visit (once last visits are recorded) > a community the
 * member's purchase unlocked. A card whose data is
 * absent or not measured is not a candidate, so the member never sees "Ainda não medido". Then the
 * "Sua atividade" report, which also holds the presence at events and the weekly streak. Own data
 * only: the member never sees their engagement band.
 */
export async function MemberPanel() {
  const t = await getTranslations('dashboard');
  const { profile, forYou } = memberPanel;
  const { nextEvent, supportReply, accessExpiring, newSinceLastVisit, unlockedCommunity } = forYou;
  const cards = selectForYouCards(forYou);

  const renderCard: Record<ForYouCard, () => ReactNode> = {
    event: () =>
      nextEvent ? (
        <ActionCard
          key="event"
          icon={CalendarDays}
          title={t('member.forYou.event.title', {
            title: nextEvent.title,
            hour: nextEvent.startsAtHour,
          })}
          detail={nextEvent.place}
          pill={{
            tone: 'warning',
            text: t('member.forYou.event.startsIn', {
              minutes: formatCount(nextEvent.startsInMinutes),
            }),
          }}
          action={<PreviewAction variant="brand">{t('member.forYou.event.checkIn')}</PreviewAction>}
        />
      ) : null,
    support: () =>
      supportReply ? (
        <ActionCard
          key="support"
          icon={MessageCircle}
          title={t('member.forYou.support.title')}
          detail={t('member.forYou.support.detail', { preview: supportReply.preview })}
          {...(supportReply.unread ? { unreadLabel: t('member.forYou.support.unread') } : {})}
        />
      ) : null,
    access: () =>
      accessExpiring ? (
        <ActionCard
          key="access"
          icon={CalendarClock}
          title={t('member.forYou.access.title', { days: accessExpiring.daysLeft })}
          detail={accessExpiring.product}
          action={<PreviewAction variant="brand">{t('member.forYou.access.renew')}</PreviewAction>}
        />
      ) : null,
    news: () =>
      newSinceLastVisit && typeof newSinceLastVisit.posts === 'number' ? (
        <ActionCard
          key="news"
          icon={Sparkles}
          title={t('member.forYou.news.title', { community: newSinceLastVisit.community })}
          detail={t('member.forYou.news.detail', { count: newSinceLastVisit.posts })}
        />
      ) : null,
    community: () =>
      unlockedCommunity ? (
        <ActionCard
          key="community"
          icon={Lock}
          title={unlockedCommunity.name}
          detail={t('member.forYou.community.detail', { count: unlockedCommunity.posts })}
        />
      ) : null,
  };

  return (
    <TenantColumn>
      <PanelHeader title={previewTenant.displayName} subtitle={t('member.header.subtitle')} />

      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-on-brand"
        >
          {initials(profile.name)}
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="text-lg font-extrabold text-text">{profile.name}</p>
          <p className="text-xs text-text-secondary">
            {t('member.memberSince', { date: formatMonthYear(profile.memberSince) })}
          </p>
        </div>
      </div>

      {cards.length > 0 ? (
        <PanelSection title={t('member.forYou.title')}>
          <div className="flex flex-col gap-3">{cards.map((card) => renderCard[card]())}</div>
        </PanelSection>
      ) : null}

      <MemberActivity />
    </TenantColumn>
  );
}
