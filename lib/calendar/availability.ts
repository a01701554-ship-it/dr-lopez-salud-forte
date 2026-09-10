/**
 * Booking Availability Generator & Double-Booking Protection
 * Calculates available slots by intersecting:
 * - Doctor's business schedule (Mon-Sat, 9:00 - 18:00, lunch break)
 * - Minimum booking advance & maximum window
 * - Stored appointments
 * - Google Calendar Free/Busy intervals
 * - Active temporary holds
 */

import {
  CalendarProvider,
  CalendarInterval,
  GoogleCalendarProvider,
  MockCalendarProvider,
} from './provider';
import {
  DEFAULT_SCHEDULE_SETTINGS,
  DayAvailability,
  TimeSlot,
  DoctorScheduleSettings,
} from './types';
import { AppointmentsRepository } from './appointments-repo';

export class AvailabilityService {
  private calendarProvider: CalendarProvider;
  private settings: DoctorScheduleSettings;

  constructor(
    calendarProvider?: CalendarProvider,
    settings: DoctorScheduleSettings = DEFAULT_SCHEDULE_SETTINGS,
  ) {
    this.calendarProvider = calendarProvider || new GoogleCalendarProvider();
    this.settings = settings;
  }

  /**
   * Generates next available days with slots starting from a given date
   */
  async getAvailability(
    startDate: Date,
    daysCount = 3,
    durationMinutes = 50,
  ): Promise<DayAvailability[]> {
    const results: DayAvailability[] = [];
    const now = new Date();

    // Query Google Calendar for the overall window
    const windowStart = new Date(startDate);
    windowStart.setHours(0, 0, 0, 0);

    const windowEnd = new Date(startDate);
    windowEnd.setDate(windowEnd.getDate() + daysCount + 1);
    windowEnd.setHours(23, 59, 59, 999);

    let busyIntervals: CalendarInterval[] = [];
    try {
      busyIntervals = await this.calendarProvider.getBusyIntervals({
        start: windowStart,
        end: windowEnd,
      });
    } catch (err) {
      console.warn('Google Calendar free/busy query failed, falling back to local records:', err);
    }

    const existingAppointments = AppointmentsRepository.getAll().filter(
      (a) => a.status === 'confirmed',
    );

    const dayCursor = new Date(startDate);
    dayCursor.setHours(0, 0, 0, 0);

    let daysFound = 0;
    let lookaheadAttempts = 0;
    const maxLookahead = daysCount + 14;

    while (daysFound < daysCount && lookaheadAttempts < maxLookahead) {
      lookaheadAttempts++;
      const currentDay = new Date(dayCursor);
      const dayOfWeek = currentDay.getDay(); // 0 = Sun, 1 = Mon...

      // Check if doctor works on this day
      if (this.settings.workDays.includes(dayOfWeek)) {
        const slots = this.generateSlotsForDay(
          currentDay,
          now,
          durationMinutes,
          busyIntervals,
          existingAppointments,
        );

        const dayName = currentDay.toLocaleDateString('es-MX', { weekday: 'long' });
        const dayShort = currentDay.toLocaleDateString('es-MX', { weekday: 'short' }).toUpperCase().replace('.', '');
        const monthShort = currentDay.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase().replace('.', '');
        const monthLong = currentDay.toLocaleDateString('es-MX', { month: 'long' });

        const dateKey = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;

        results.push({
          date: new Date(currentDay),
          dateKey,
          dayName,
          dayShort,
          dayNumber: currentDay.getDate(),
          monthShort,
          monthLong,
          year: currentDay.getFullYear(),
          slots,
          isAvailable: slots.some((s) => s.available),
        });

        daysFound++;
      }

      dayCursor.setDate(dayCursor.getDate() + 1);
    }

    return results;
  }

  /**
   * Retrieves the first 3 immediately next available slots across the schedule
   */
  async getNextAvailableSlots(
    startDate: Date = new Date(),
    count = 3,
    durationMinutes = 50,
  ): Promise<TimeSlot[]> {
    const days = await this.getAvailability(startDate, 10, durationMinutes);
    const availableSlots: TimeSlot[] = [];

    for (const day of days) {
      for (const slot of day.slots) {
        if (slot.available) {
          availableSlots.push(slot);
          if (availableSlots.length >= count) {
            return availableSlots;
          }
        }
      }
    }

    return availableSlots;
  }

  private generateSlotsForDay(
    day: Date,
    now: Date,
    durationMinutes: number,
    gcalBusy: CalendarInterval[],
    existingAppointments: { slotIso: string }[],
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const minAdvanceMs = this.settings.minimumAdvanceHours * 60 * 60 * 1000;

    const dayName = day.toLocaleDateString('es-MX', { weekday: 'short' });
    const dayNumber = day.getDate();
    const monthShort = day.toLocaleDateString('es-MX', { month: 'short' });
    const dateFormatted = `${dayName}, ${dayNumber} ${monthShort}`.toLowerCase();
    const fullDateLabel = day.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    const isSaturday = day.getDay() === 6;
    const endHour = isSaturday ? 14 : this.settings.endHour;

    for (let hour = this.settings.startHour; hour < endHour; hour++) {
      // Lunch break
      if (!isSaturday && hour >= this.settings.lunchBreakStart && hour < this.settings.lunchBreakEnd) {
        continue;
      }

      for (let min = 0; min < 60; min += this.settings.slotIntervalMinutes) {
        const slotStart = new Date(day);
        slotStart.setHours(hour, min, 0, 0);

        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

        const timeString = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        const isoString = slotStart.toISOString();

        // 1. Must be in future + satisfy minimum advance
        const isPastOrTooSoon = slotStart.getTime() - now.getTime() < minAdvanceMs;

        // 2. Google Calendar conflict check
        const hasGcalConflict = gcalBusy.some(
          (busy) => slotStart < busy.end && slotEnd > busy.start,
        );

        // 3. Database appointment conflict check
        const hasDbConflict = existingAppointments.some((a) => {
          const apptStart = new Date(a.slotIso);
          const apptEnd = new Date(apptStart.getTime() + durationMinutes * 60 * 1000);
          return slotStart < apptEnd && slotEnd > apptStart;
        });

        // 4. Temporary hold check
        const isHeld = AppointmentsRepository.isSlotHeld(isoString);

        const isAvailable = !isPastOrTooSoon && !hasGcalConflict && !hasDbConflict && !isHeld;

        slots.push({
          time: timeString,
          isoString,
          dateFormatted,
          fullDateLabel,
          available: isAvailable,
        });
      }
    }

    return slots;
  }
}
