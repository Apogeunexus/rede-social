import { memberPanel, previewTenant } from '@rede-social/module-dashboard/fixtures';
import { ActionCard } from '@rede-social/module-dashboard/ui';
import { CalendarDays, Lock, MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { formatCount, formatMonthYear, initials } from './format';
import { PanelHeader } from './PanelHeader';
import { PanelSection, PreviewAction } from './PanelSection';
import { TenantColumn } from './TenantColumn';

/**
 * Level 7, "Membro": what is there for me now that I must not miss? Not a new page in the app: a
 * "Para você" block at the top of the profile, with up to three cards — the next event (with the
 * check-in), a support reply (unread dot) and a community the member's purchase unlocked. A card
 * whose data is absent is simply not rendered.
 */
export async function MemberPanel() {
  const t = await getTranslations('dashboard');
  const { profile, forYou } = memberPanel;
  const { nextEvent, supportReply, unlockedCommunity } = forYou;
  const hasCards = Boolean(nextEvent || supportReply || unlockedCommunity);

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

      {hasCards ? (
        <PanelSection title={t('member.forYou.title')}>
          <div className="flex flex-col gap-3">
            {nextEvent ? (
              <ActionCard
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
                action={
                  <PreviewAction variant="brand">{t('member.forYou.event.checkIn')}</PreviewAction>
                }
              />
            ) : null}
            {supportReply ? (
              <ActionCard
                icon={MessageCircle}
                title={t('member.forYou.support.title')}
                detail={t('member.forYou.support.detail', { preview: supportReply.preview })}
                {...(supportReply.unread ? { unreadLabel: t('member.forYou.support.unread') } : {})}
                navigable
              />
            ) : null}
            {unlockedCommunity ? (
              <ActionCard
                icon={Lock}
                title={unlockedCommunity.name}
                detail={t('member.forYou.community.detail', { count: unlockedCommunity.posts })}
                navigable
              />
            ) : null}
          </div>
        </PanelSection>
      ) : null}
    </TenantColumn>
  );
}
