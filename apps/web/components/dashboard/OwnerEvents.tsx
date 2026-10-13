import { type EventFormat, tenantOwnerPanel } from '@rede-social/module-dashboard/fixtures';
import {
  attendancePercent,
  BarList,
  Collapsible,
  ENGAGEMENT_BAND_ORDER,
  engagedPercent,
  KpiCard,
  KpiGrid,
  percentOf,
  sumOf,
  topBy,
} from '@rede-social/module-dashboard/ui';
import { getTranslations } from 'next-intl/server';
import { EventCard, eventRevenue, RevenueExampleNote } from './BandScopeCards';
import { ExamplePill } from './ExamplePill';
import { bandLabel, exampleBadge, formatCount, formatDayMonth, formatPercent } from './format';
import { PanelSection } from './PanelSection';

const FORMATS: readonly EventFormat[] = ['in_person', 'online'];

/**
 * Level 4, "Eventos": the next events as the bands' event cards (quick 261013-p31) with their seats
 * left and example receita, unlinked because no single place lists who registered for one event
 * (its RSVPs spread over the bands), then the waiting lists of the full events
 * (one example block: no table records a waiting list yet, D-04), then closed: attendance per past
 * event (check-ins over RSVPs, with the walk-ins), in person against online, and who comes by
 * engagement band. Counts only: no member is named.
 */
export async function OwnerEvents() {
  const t = await getTranslations('dashboard');
  const { events, engagement } = tenantOwnerPanel;
  const { past, upcoming, waitlist, attendanceByBand } = events;
  const waitRows = [...waitlist.value].sort((a, b) => b.waiting - a.waiting);
  const mostWaited = waitRows[0];
  const happened = waitlist.value.filter((row) => row.attended !== null);
  const walkIns = sumOf(past, (row) => row.walkIns);
  const walkInEvent = past.find((row) => row.walkIns > 0);
  const eventPercent = (row: (typeof past)[number]) =>
    Math.round(percentOf(row.checkIns, row.confirmed));
  const byPercent = [...past].sort((a, b) => eventPercent(b) - eventPercent(a));
  const best = topBy(past, eventPercent);
  const worst = byPercent.at(-1);
  const formats = FORMATS.map((format) => {
    const rows = past.filter((row) => row.format === format);
    return {
      format,
      percent: attendancePercent(rows),
      events: rows.length,
      full: rows.filter((row) => row.capacity !== null && row.confirmed >= row.capacity).length,
    };
  });
  const presences = sumOf(ENGAGEMENT_BAND_ORDER, (band) => attendanceByBand[band]);
  const formatOf = (format: EventFormat) =>
    formatPercent(formats.find((row) => row.format === format)?.percent ?? 0);

  return (
    <>
      <PanelSection title={t('tenantOwner.upcoming.title')}>
        <RevenueExampleNote t={t} />
        <ul className="flex flex-col gap-3">
          {upcoming.map((row) => (
            <li key={row.id} className="min-w-0">
              <EventCard
                t={t}
                id={row.id}
                href={null}
                detail={t('tenantOwner.upcoming.when', {
                  date: formatDayMonth(row.date),
                  hour: row.startsAtHour,
                })}
                cells={[
                  {
                    label: t('tenantOwner.upcoming.columns.confirmed'),
                    value: formatCount(row.confirmed),
                  },
                  {
                    label: t('tenantOwner.upcoming.columns.left'),
                    value:
                      row.capacity === null
                        ? t('tenantOwner.upcoming.unlimited')
                        : row.capacity - row.confirmed <= 0
                          ? t('tenantOwner.upcoming.full')
                          : formatCount(row.capacity - row.confirmed),
                  },
                  { label: t('tenantOwner.scopeCards.event.revenue'), value: eventRevenue(row) },
                ]}
              />
            </li>
          ))}
        </ul>
      </PanelSection>

      <PanelSection title={t('tenantOwner.waitlist.title')}>
        <p className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span>
            {t('tenantOwner.waitlist.summary', {
              waiting: sumOf(waitlist.value, (row) => row.waiting),
              events: waitlist.value.length,
            })}
          </span>
          <ExamplePill text={exampleBadge(t, waitlist)} />
        </p>
        <BarList
          rows={waitRows.map((row, i) => ({
            id: row.eventId,
            label: row.name,
            value: row.waiting,
            display: t('tenantOwner.waitlist.waiting', { count: formatCount(row.waiting) }),
            rate: t('tenantOwner.waitlist.capacity', { count: formatCount(row.capacity) }),
            highlight: i === 0,
          }))}
        />
        {mostWaited ? (
          <p className="text-xs text-text-secondary">
            {t('tenantOwner.waitlist.demand', {
              event: mostWaited.name,
              capacity: formatCount(mostWaited.capacity),
              waiting: formatCount(mostWaited.waiting),
            })}
          </p>
        ) : null}
        <KpiGrid>
          <KpiCard
            label={t('tenantOwner.waitlist.gotSeat')}
            value={formatCount(sumOf(waitlist.value, (row) => row.gotSeat))}
            note={t('tenantOwner.waitlist.gotSeatNote')}
            badge={exampleBadge(t, waitlist)}
          />
          <KpiCard
            label={t('tenantOwner.waitlist.attended')}
            value={formatCount(sumOf(happened, (row) => row.attended ?? 0))}
            note={t('tenantOwner.waitlist.attendedNote', {
              count: formatCount(sumOf(happened, (row) => row.gotSeat)),
            })}
            badge={exampleBadge(t, waitlist)}
          />
        </KpiGrid>
      </PanelSection>

      <Collapsible
        title={t('tenantOwner.attendance.title')}
        summary={t('tenantOwner.attendance.summary', {
          percent: formatPercent(attendancePercent(past)),
        })}
      >
        <BarList
          max={100}
          rows={past.map((row) => ({
            id: row.id,
            label: row.name,
            value: eventPercent(row),
            display: formatPercent(eventPercent(row)),
            rate: t('tenantOwner.attendance.rate', {
              checkIns: formatCount(row.checkIns),
              confirmed: formatCount(row.confirmed),
            }),
            highlight: row.id === best?.id,
          }))}
        />
        {walkInEvent ? (
          <p className="text-xs text-text-secondary">
            {t('tenantOwner.attendance.footnote', {
              count: formatCount(walkIns),
              event: walkInEvent.name,
            })}
          </p>
        ) : null}
      </Collapsible>

      <Collapsible
        title={t('tenantOwner.formatsCompared.title')}
        summary={t('tenantOwner.formatsCompared.summary', {
          inPerson: formatOf('in_person'),
          online: formatOf('online'),
        })}
      >
        <BarList
          max={100}
          rows={formats.map((row) => ({
            id: row.format,
            label: t(`tenantOwner.formatsCompared.${row.format}`),
            value: row.percent,
            display: formatPercent(row.percent),
            rate: t('tenantOwner.formatsCompared.rate', { events: row.events, full: row.full }),
          }))}
        />
        {best && worst ? (
          <p className="text-xs text-text-secondary">
            {t('tenantOwner.formatsCompared.footnote', {
              best: best.name,
              bestPercent: formatPercent(eventPercent(best)),
              worst: worst.name,
              worstPercent: formatPercent(eventPercent(worst)),
            })}
          </p>
        ) : null}
      </Collapsible>

      <Collapsible
        title={t('tenantOwner.whoAttends.title')}
        summary={t('tenantOwner.whoAttends.sentence', {
          presences: formatPercent(
            percentOf(attendanceByBand.superfan + attendanceByBand.engaged, presences),
          ),
          members: formatPercent(engagedPercent(engagement)),
        })}
      >
        <BarList
          max={presences}
          rows={ENGAGEMENT_BAND_ORDER.map((band) => ({
            id: band,
            label: bandLabel(t, band),
            value: attendanceByBand[band],
            display: formatCount(attendanceByBand[band]),
            rate: formatPercent(percentOf(attendanceByBand[band], presences)),
            highlight: band === 'superfan' || band === 'engaged',
          }))}
        />
        <p className="text-xs text-text-secondary">{t('tenantOwner.whoAttends.footnote')}</p>
      </Collapsible>
    </>
  );
}
