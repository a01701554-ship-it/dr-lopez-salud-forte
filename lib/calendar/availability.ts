/**
 * Disponibilidad médica centralizada.
 *
 * El Worker y Supabase son la única fuente de verdad. Nunca se generan
 * horarios disponibles sólo con datos del navegador: así una cita confirmada
 * desaparece para todos los pacientes y no únicamente para quien la creó.
 */

import type { ConsultationTypeId, DayAvailability, TimeSlot } from './types';

const APPOINTMENTS_API =
  'https://salud-forte-academy-api-preview.a01701554.workers.dev/api/appointments';
const TIMEZONE = 'America/Mexico_City';

type AvailabilityResponse = {
  days?: Array<{
    date: string;
    dateKey?: string;
    dayName: string;
    dayShort: string;
    dayNumber: number;
    monthShort: string;
    monthLong: string;
    year: number;
    slots?: TimeSlot[];
    isAvailable?: boolean;
  }>;
  nextSlots?: TimeSlot[];
  message?: string;
  error?: string;
};

function dateKey(value: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
}

function addDays(value: Date, days: number): Date {
  const result = new Date(value);
  result.setDate(result.getDate() + days);
  return result;
}

async function requestAvailability(
  startDate: Date,
  daysCount: number,
  appointmentType: ConsultationTypeId,
): Promise<AvailabilityResponse> {
  const safeDays = Math.max(1, Math.min(31, Math.trunc(daysCount)));
  const params = new URLSearchParams({
    appointment_type: appointmentType,
    timezone: TIMEZONE,
    from: dateKey(startDate),
    to: dateKey(addDays(startDate, safeDays - 1)),
  });
  const response = await fetch(`${APPOINTMENTS_API}/availability?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const result = (await response.json().catch(() => ({}))) as AvailabilityResponse;
  if (!response.ok) {
    throw new Error(
      result.message || result.error || 'No fue posible consultar los horarios disponibles.',
    );
  }
  return result;
}

export class AvailabilityService {
  async getAvailability(
    startDate: Date,
    daysCount = 3,
    _durationMinutes = 50,
    appointmentType: ConsultationTypeId = 'first-visit',
  ): Promise<DayAvailability[]> {
    const result = await requestAvailability(startDate, daysCount, appointmentType);
    return (result.days || []).map((day) => {
      const slots = (day.slots || []).map((slot) => ({
        ...slot,
        available: slot.available !== false,
      }));
      return {
        date: new Date(`${day.date}T12:00:00`),
        dateKey: day.dateKey || day.date,
        dayName: day.dayName,
        dayShort: day.dayShort,
        dayNumber: day.dayNumber,
        monthShort: day.monthShort,
        monthLong: day.monthLong,
        year: day.year,
        slots,
        isAvailable: slots.length > 0,
      };
    });
  }

  async getNextAvailableSlots(
    startDate: Date = new Date(),
    count = 3,
    _durationMinutes = 50,
    appointmentType: ConsultationTypeId = 'first-visit',
  ): Promise<TimeSlot[]> {
    const result = await requestAvailability(startDate, 31, appointmentType);
    const slots = result.nextSlots?.length
      ? result.nextSlots
      : (result.days || []).flatMap((day) => day.slots || []);
    return slots.slice(0, Math.max(1, count)).map((slot) => ({
      ...slot,
      available: slot.available !== false,
    }));
  }
}
