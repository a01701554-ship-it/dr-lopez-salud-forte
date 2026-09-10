import { CalendarProvider } from '../calendar/provider';
import { MEDICAL_CONTACT_CONFIG } from './config';
import { TimeSlot, AppointmentModality } from './types';

export class AvailabilityService {
  private calendarProvider: CalendarProvider;

  constructor(calendarProvider: CalendarProvider) {
    this.calendarProvider = calendarProvider;
  }

  /**
   * Generates candidate available time slots for a given target date or upcoming week
   */
  async getAvailableSlots(options: {
    targetDate?: Date;
    daysAhead?: number;
    modality?: AppointmentModality;
    existingHolds?: Array<{ start: string; end: string; expiresAt: string }>;
  }): Promise<TimeSlot[]> {
    const {
      targetDate = new Date(),
      daysAhead = 7,
      modality = 'presencial',
      existingHolds = [],
    } = options;

    const durationMs = MEDICAL_CONTACT_CONFIG.consultation.durationMinutes * 60 * 1000;
    const bufferAfterMs = MEDICAL_CONTACT_CONFIG.consultation.bufferAfterMinutes * 60 * 1000;
    const minAdvanceMs = MEDICAL_CONTACT_CONFIG.consultation.minimumAdvanceHours * 60 * 60 * 1000;
    const now = new Date();
    const earliestAllowed = new Date(now.getTime() + minAdvanceMs);

    const rangeStart = new Date(targetDate);
    rangeStart.setHours(0, 0, 0, 0);

    const rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + Math.max(1, daysAhead));
    rangeEnd.setHours(23, 59, 59, 999);

    // Fetch busy intervals from calendar provider (e.g., Google Calendar)
    const busyIntervals = await this.calendarProvider.getBusyIntervals({
      start: rangeStart,
      end: rangeEnd,
    });

    const activeHolds = existingHolds.filter((h) => new Date(h.expiresAt).getTime() > Date.now());

    const availableSlots: TimeSlot[] = [];

    // Iterate through each day in the requested window
    const currentDay = new Date(rangeStart);
    while (currentDay < rangeEnd && availableSlots.length < 12) {
      const dayOfWeek = currentDay.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      const schedule = MEDICAL_CONTACT_CONFIG.consultation.weeklySchedule[dayOfWeek];

      if (schedule) {
        const [openHour, openMin] = schedule.open.split(':').map(Number);
        const [closeHour, closeMin] = schedule.close.split(':').map(Number);

        const slotStart = new Date(currentDay);
        slotStart.setHours(openHour, openMin, 0, 0);

        const dayClose = new Date(currentDay);
        dayClose.setHours(closeHour, closeMin, 0, 0);

        while (slotStart.getTime() + durationMs <= dayClose.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + durationMs);

          // Must respect minimum advance notice
          if (slotStart >= earliestAllowed) {
            // Check calendar overlap
            const isCalendarBusy = busyIntervals.some(
              (busy) => slotEnd > busy.start && slotStart < busy.end,
            );

            // Check holds overlap
            const isHoldBusy = activeHolds.some((hold) => {
              const hStart = new Date(hold.start);
              const hEnd = new Date(hold.end);
              return slotEnd > hStart && slotStart < hEnd;
            });

            if (!isCalendarBusy && !isHoldBusy) {
              const id = `slot-${slotStart.getTime()}`;
              availableSlots.push({
                id,
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
                formattedDate: slotStart.toLocaleDateString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                }),
                formattedTime: slotStart.toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }),
                modality,
              });
            }
          }

          // Advance by duration + buffer
          slotStart.setTime(slotStart.getTime() + durationMs + bufferAfterMs);
        }
      }

      currentDay.setDate(currentDay.getDate() + 1);
      currentDay.setHours(0, 0, 0, 0);
    }

    return availableSlots;
  }
}
