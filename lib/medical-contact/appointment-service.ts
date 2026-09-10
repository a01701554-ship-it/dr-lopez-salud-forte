import { CalendarProvider } from '../calendar/provider';
import { MEDICAL_CONTACT_CONFIG } from './config';
import { AppointmentRecord, PatientInfo, TimeSlot, AppointmentStatus } from './types';

export class AppointmentService {
  private calendarProvider: CalendarProvider;
  private appointments: Map<string, AppointmentRecord> = new Map();
  private idempotencyStore: Set<string> = new Set();

  constructor(calendarProvider: CalendarProvider) {
    this.calendarProvider = calendarProvider;
  }

  getAllAppointments(): AppointmentRecord[] {
    return Array.from(this.appointments.values());
  }

  getAppointmentById(id: string): AppointmentRecord | undefined {
    return this.appointments.get(id);
  }

  findActiveAppointmentByPhone(phone: string): AppointmentRecord | undefined {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    for (const appt of this.appointments.values()) {
      const apptPhone = appt.patient.phone.replace(/[^0-9]/g, '');
      if (apptPhone === cleanPhone && (appt.status === 'CONFIRMED' || appt.status === 'HOLD')) {
        return appt;
      }
    }
    return undefined;
  }

  getActiveHolds(): Array<{ start: string; end: string; expiresAt: string }> {
    const now = Date.now();
    const holds: Array<{ start: string; end: string; expiresAt: string }> = [];

    for (const appt of this.appointments.values()) {
      if (appt.status === 'HOLD' && appt.holdExpiresAt) {
        if (new Date(appt.holdExpiresAt).getTime() > now) {
          holds.push({
            start: appt.slot.start,
            end: appt.slot.end,
            expiresAt: appt.holdExpiresAt,
          });
        }
      }
    }
    return holds;
  }

  /**
   * Puts a slot on temporary hold (e.g., 5 minutes) while patient confirms info
   */
  async placeSlotHold(patient: PatientInfo, slot: TimeSlot): Promise<AppointmentRecord> {
    const holdDurationMs = MEDICAL_CONTACT_CONFIG.consultation.holdDurationMinutes * 60 * 1000;
    const holdExpiresAt = new Date(Date.now() + holdDurationMs).toISOString();

    const id = `appt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const record: AppointmentRecord = {
      id,
      idempotencyKey: `hold-${id}`,
      patient,
      slot,
      status: 'HOLD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      holdExpiresAt,
    };

    this.appointments.set(id, record);
    return record;
  }

  /**
   * Confirms appointment atomically:
   * 1. Check idempotency
   * 2. Re-validate slot is free in Calendar
   * 3. Create Google Calendar event
   * 4. Persist in database
   * Throws if either fails, strictly ensuring no confirmation without both.
   */
  async confirmAppointment(options: {
    holdId?: string;
    patient: PatientInfo;
    slot: TimeSlot;
    idempotencyKey: string;
  }): Promise<AppointmentRecord> {
    const { holdId, patient, slot, idempotencyKey } = options;

    if (this.idempotencyStore.has(idempotencyKey)) {
      const existing = Array.from(this.appointments.values()).find(
        (a) => a.idempotencyKey === idempotencyKey,
      );
      if (existing) return existing;
    }

    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);

    // 1. Re-validate Free/Busy in calendar
    const busy = await this.calendarProvider.getBusyIntervals({
      start: slotStart,
      end: slotEnd,
    });

    const isConflict = busy.some((b) => slotEnd > b.start && slotStart < b.end);
    if (isConflict) {
      throw new Error('El horario seleccionado ya no se encuentra disponible. Por favor seleccione otro.');
    }

    // 2. Create Event in Google Calendar
    const eventSummary = `Consulta médica — ${patient.fullName}`;
    const eventDescription =
      `Consulta médica con el ${MEDICAL_CONTACT_CONFIG.doctor.name} (${MEDICAL_CONTACT_CONFIG.doctor.title}).\n` +
      `Paciente: ${patient.fullName}\n` +
      `Teléfono: ${patient.phone}\n` +
      `Modalidad: ${slot.modality || 'Presencial'}\n` +
      (patient.notes ? `Notas: ${patient.notes}\n` : '') +
      `Cédula profesional: ${MEDICAL_CONTACT_CONFIG.doctor.license}\n` +
      `Agendado vía Asistente Digital.`;

    const gcalEvent = await this.calendarProvider.createEvent({
      summary: eventSummary,
      description: eventDescription,
      start: slotStart,
      end: slotEnd,
      timezone: MEDICAL_CONTACT_CONFIG.consultation.timezone,
      attendeeEmail: patient.email,
    });

    if (!gcalEvent || !gcalEvent.id) {
      throw new Error('Error al sincronizar con Google Calendar. La cita no fue reservada.');
    }

    // 3. Persist in Database
    const id = holdId || `appt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const confirmedRecord: AppointmentRecord = {
      id,
      idempotencyKey,
      patient,
      slot,
      calendarEventId: gcalEvent.id,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      holdExpiresAt: undefined,
    };

    this.appointments.set(id, confirmedRecord);
    this.idempotencyStore.add(idempotencyKey);

    return confirmedRecord;
  }

  /**
   * Reschedules an existing appointment
   */
  async rescheduleAppointment(appointmentId: string, newSlot: TimeSlot): Promise<AppointmentRecord> {
    const existing = this.appointments.get(appointmentId);
    if (!existing) {
      throw new Error('No se encontró la cita especificada.');
    }

    const slotStart = new Date(newSlot.start);
    const slotEnd = new Date(newSlot.end);

    // Revalidate calendar
    const busy = await this.calendarProvider.getBusyIntervals({
      start: slotStart,
      end: slotEnd,
    });

    const isConflict = busy.some((b) => slotEnd > b.start && slotStart < b.end);
    if (isConflict) {
      throw new Error('El nuevo horario solicitado ya está ocupado. Elija otra opción.');
    }

    // Update in Google Calendar
    if (existing.calendarEventId) {
      await this.calendarProvider.updateEvent(existing.calendarEventId, {
        summary: `Consulta médica — ${existing.patient.fullName}`,
        description: `Cita reprogramada. Paciente: ${existing.patient.fullName}, Tel: ${existing.patient.phone}`,
        start: slotStart,
        end: slotEnd,
        timezone: MEDICAL_CONTACT_CONFIG.consultation.timezone,
        attendeeEmail: existing.patient.email,
      });
    }

    existing.slot = newSlot;
    existing.status = 'CONFIRMED';
    existing.updatedAt = new Date().toISOString();
    this.appointments.set(appointmentId, existing);

    return existing;
  }

  /**
   * Cancels an existing appointment
   */
  async cancelAppointment(appointmentId: string): Promise<AppointmentRecord> {
    const existing = this.appointments.get(appointmentId);
    if (!existing) {
      throw new Error('No se encontró la cita a cancelar.');
    }

    if (existing.calendarEventId) {
      try {
        await this.calendarProvider.deleteEvent(existing.calendarEventId);
      } catch (err) {
        console.warn('Could not delete calendar event:', err);
      }
    }

    existing.status = 'CANCELLED';
    existing.updatedAt = new Date().toISOString();
    this.appointments.set(appointmentId, existing);

    return existing;
  }
}
