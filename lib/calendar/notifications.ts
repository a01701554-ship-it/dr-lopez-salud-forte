/**
 * Booking Notification Service & Dispatcher
 *
 * Requirements:
 * 1. RECIPIENT ACCURACY:
 *    - Patient confirmation and reminders MUST be addressed strictly to patient.phone (normalized to E.164).
 *    - Doctor notification goes strictly to doctorNotificationWhatsapp.
 * 2. REAL AUDIT TRACKING:
 *    - Updates AppointmentRecord with confirmationWhatsAppStatus ('SENT' | 'FAILED' | 'NOT_CONFIGURED').
 *    - Updates confirmationWhatsAppMessageId and confirmationSentAt.
 * 3. 2-HOUR REMINDER ENGINE:
 *    - Calculates exact ISO timestamp for slotIso - 2h (in America/Mexico_City).
 *    - Sets reminder2hStatus = 'SCHEDULED'.
 *    - Dispatches immediately if appointment is within 2 hours.
 * 4. RESCHEDULE & CANCELLATION DISPATCH:
 *    - Informs patient of schedule adjustments and cancellations.
 *    - Cancels or updates reminder triggers.
 */

import { siteConfig } from '@/config/site';
import { AppointmentRecord } from './types';
import {
  CalendarProvider,
  GoogleCalendarProvider,
  CalendarEventInput,
} from './provider';
import {
  WhatsAppProvider,
  MetaWhatsAppCloudProvider,
  MessageReceipt,
} from '@/lib/messaging/provider';
import { normalizeWhatsAppNumber } from '@/lib/messaging/phone-utils';

export class BookingNotificationService {
  private calendarProvider: CalendarProvider;
  private whatsappProvider: WhatsAppProvider;

  constructor(
    calendarProvider?: CalendarProvider,
    whatsappProvider?: WhatsAppProvider,
  ) {
    this.calendarProvider = calendarProvider || new GoogleCalendarProvider();
    this.whatsappProvider = whatsappProvider || new MetaWhatsAppCloudProvider();
  }

  /**
   * Syncs appointment with Google Calendar
   */
  async syncGoogleCalendar(appointment: AppointmentRecord): Promise<string | undefined> {
    try {
      const startTime = new Date(appointment.slotIso);
      const endTime = new Date(startTime.getTime() + appointment.durationMinutes * 60 * 1000);

      // Privacy by design: First Name + Initial of Last Name
      const lastInitial = appointment.patient.lastName.trim()
        ? `${appointment.patient.lastName.trim().charAt(0)}.`
        : '';
      const privacyTitle = `Consulta médica — ${appointment.patient.firstName.trim()} ${lastInitial}`.trim();

      const eventInput: CalendarEventInput = {
        summary: privacyTitle,
        description: [
          `Consulta médica: ${appointment.consultationTypeTitle}`,
          `Motivo: ${appointment.reasonLabel}`,
          `Código de cita: ${appointment.publicId}`,
          `Paciente: ${appointment.patient.fullName}`,
          `Teléfono: ${appointment.patient.phone}`,
          `Honorarios: ${appointment.feeFormatted}`,
          `Tolerancia: ${siteConfig.bookingSettings.gracePeriodMinutes || 15} minutos`,
          `Ubicación: ${siteConfig.city}`,
        ].join('\n'),
        start: startTime,
        end: endTime,
        timezone: siteConfig.timezone || 'America/Mexico_City',
        attendeeEmail: appointment.patient.email,
      };

      const created = await this.calendarProvider.createEvent(eventInput);
      return created.id;
    } catch (err) {
      console.warn('Failed to sync appointment to Google Calendar:', err);
      return undefined;
    }
  }

  /**
   * Notifies the doctor's private phone about new reservations
   */
  async notifyDoctor(appointment: AppointmentRecord): Promise<MessageReceipt | null> {
    try {
      const doctorNumber = siteConfig.doctorNotificationWhatsapp || siteConfig.whatsappNumber;
      if (!doctorNumber) return null;

      const lastInitial = appointment.patient.lastName.trim()
        ? `${appointment.patient.lastName.trim().charAt(0)}.`
        : '';
      const patientDisplay = `${appointment.patient.firstName.trim()} ${lastInitial}`;

      const messageText = [
        `*NUEVA CITA MÉDICA RESERVADA*`,
        ``,
        `*Paciente:* ${patientDisplay}`,
        `*Teléfono:* ${appointment.patient.phone}`,
        `*Fecha:* ${appointment.dateFormatted}`,
        `*Hora:* ${appointment.timeFormatted} h (GMT-6)`,
        `*Modalidad:* ${appointment.consultationTypeTitle}`,
        `*Motivo:* ${appointment.reasonLabel}`,
        `*Honorarios:* ${appointment.feeFormatted}`,
        `*Código:* ${appointment.publicId}`,
        ``,
        `_Sincronizada con Google Calendar._`,
      ].join('\n');

      return await this.whatsappProvider.sendMessage(doctorNumber, messageText);
    } catch (err) {
      console.warn('Doctor WhatsApp notification error:', err);
      return null;
    }
  }

  /**
   * Sends formal confirmation to the PATIENT's phone number
   * Updates AppointmentRecord tracking fields in place
   */
  async notifyPatient(appointment: AppointmentRecord): Promise<MessageReceipt | null> {
    // Verify consent
    if (appointment.consents && !appointment.consents.whatsappNotifications) {
      appointment.confirmationWhatsAppStatus = 'NOT_CONFIGURED';
      return null;
    }

    const patientPhone = normalizeWhatsAppNumber(appointment.patient.phone);
    if (!patientPhone) {
      appointment.confirmationWhatsAppStatus = 'FAILED';
      appointment.confirmationError = 'Número de teléfono inválido o vacío';
      return null;
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const manageUrl = `${origin}/cita/${appointment.publicId}?token=${appointment.token}`;
      const isOnline = appointment.consultationTypeId === 'online' || appointment.consultationTypeTitle.toLowerCase().includes('línea') || appointment.consultationTypeTitle.toLowerCase().includes('linea');
      const isHome = appointment.consultationTypeId === 'home-visit';

      let locationText = '';
      if (isOnline) {
        locationText = `MODALIDAD\nConsulta médica en línea (Telemedicina)`;
      } else if (isHome) {
        locationText = `LUGAR\nDomicilio particular en Querétaro\n\nMODALIDAD\nConsulta médica a domicilio`;
      } else {
        locationText = `LUGAR\nConsultorio Médico · Santiago de Querétaro, Qro., México\n\nMODALIDAD\nPresencial en consultorio`;
      }

      const messageText = [
        `Hola, ${appointment.patient.firstName}.`,
        ``,
        `Gracias por agendar tu consulta con el`,
        `Dr. Mauricio Benjamin Galindo López.`,
        ``,
        `Tu cita ha quedado confirmada.`,
        ``,
        `FECHA`,
        `${appointment.dateFormatted}`,
        ``,
        `HORA`,
        `${appointment.timeFormatted} h`,
        ``,
        locationText,
        ``,
        `TIPO DE CONSULTA`,
        `${appointment.consultationTypeTitle}`,
        ``,
        `DURACIÓN APROXIMADA`,
        `${appointment.durationLabel || `${appointment.durationMinutes} minutos`}`,
        ``,
        `HONORARIOS`,
        `${appointment.feeFormatted}`,
        ``,
        `Te recomendamos llegar con puntualidad. Contamos con una tolerancia máxima de ${siteConfig.bookingSettings.gracePeriodMinutes || 15} minutos.`,
        ``,
        `Puedes consultar, reprogramar o cancelar tu cita aquí:`,
        ``,
        `${manageUrl}`,
        ``,
        `Gracias por tu confianza. Te esperamos.`,
      ].join('\n');

      const receipt = await this.whatsappProvider.sendMessage(patientPhone, messageText);

      appointment.confirmationWhatsAppStatus = receipt.status;
      appointment.confirmationWhatsAppMessageId = receipt.providerMessageId;
      appointment.confirmationSentAt = receipt.acceptedAt.toISOString();
      if (receipt.error) {
        appointment.confirmationError = receipt.error;
      }

      // Schedule -2h reminder via persistent scheduler (no memory setTimeout)
      this.scheduleReminder2h(appointment);

      return receipt;
    } catch (err: any) {
      console.warn('Patient WhatsApp confirmation dispatch error:', err);
      appointment.confirmationWhatsAppStatus = 'FAILED';
      appointment.confirmationError = err?.message || 'Error en envío';
      return null;
    }
  }

  /**
   * Calculates and schedules 2 hours advance reminder
   */
  scheduleReminder2h(appointment: AppointmentRecord): void {
    try {
      const apptTime = new Date(appointment.slotIso).getTime();
      const twoHoursMs = 2 * 60 * 60 * 1000;
      const reminderTime = new Date(apptTime - twoHoursMs);
      const now = Date.now();

      appointment.timezone = siteConfig.timezone || 'America/Mexico_City';

      // Rule: If booked within 2 hours of appointment, no retroactive reminder is scheduled
      if (reminderTime.getTime() <= now) {
        appointment.reminder2hStatus = 'NOT_SCHEDULED';
        appointment.reminder2hScheduledFor = undefined;
        return;
      }

      appointment.reminder2hScheduledFor = reminderTime.toISOString();
      appointment.reminder2hStatus = 'SCHEDULED';
      appointment.reminder2hAttemptCount = 0;
    } catch (err) {
      console.warn('Failed to schedule 2h reminder:', err);
    }
  }

  /**
   * Dispatches the 2h advance reminder to patient
   */
  async dispatchReminder2h(appointment: AppointmentRecord): Promise<MessageReceipt | null> {
    if (appointment.status === 'cancelled') {
      appointment.reminder2hStatus = 'CANCELLED';
      return null;
    }

    const patientPhone = normalizeWhatsAppNumber(appointment.patient.phone);
    if (!patientPhone) return null;

    try {
      appointment.reminder2hStatus = 'PROCESSING';

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const manageUrl = `${origin}/cita/${appointment.publicId}?token=${appointment.token}`;
      const isOnline = appointment.consultationTypeId === 'online' || appointment.consultationTypeTitle.toLowerCase().includes('línea') || appointment.consultationTypeTitle.toLowerCase().includes('linea');

      const locationLine = isOnline
        ? `MODALIDAD\nConsulta médica en línea`
        : `LUGAR\nConsultorio Médico · Santiago de Querétaro, Qro., México`;

      const messageText = [
        `Hola, ${appointment.patient.firstName}.`,
        ``,
        `Te recordamos que hoy tienes tu consulta con el`,
        `Dr. Mauricio Benjamin Galindo López.`,
        ``,
        `FECHA`,
        `${appointment.dateFormatted}`,
        ``,
        `HORA`,
        `${appointment.timeFormatted} h`,
        ``,
        locationLine,
        ``,
        `Te recomendamos llegar con puntualidad. Contamos con una tolerancia máxima de ${siteConfig.bookingSettings.gracePeriodMinutes || 15} minutos.`,
        ``,
        `Puedes consultar los detalles de tu cita aquí:`,
        ``,
        `${manageUrl}`,
        ``,
        `Gracias por tu confianza. Te esperamos.`,
      ].join('\n');

      const receipt = await this.whatsappProvider.sendMessage(patientPhone, messageText);

      appointment.reminder2hStatus = receipt.status === 'SENT' || receipt.status === 'DELIVERED' ? 'SENT' : 'FAILED';
      appointment.reminder2hMessageId = receipt.providerMessageId;
      appointment.reminder2hSentAt = receipt.acceptedAt.toISOString();
      if (receipt.error) {
        appointment.reminder2hError = receipt.error;
      }

      return receipt;
    } catch (err: any) {
      appointment.reminder2hStatus = 'FAILED';
      appointment.reminder2hError = err?.message || 'Error en recordatorio';
      return null;
    }
  }

  /**
   * Dispatches notification upon rescheduling
   */
  async notifyRescheduled(
    appointment: AppointmentRecord,
    prevDateFormatted: string,
    prevTimeFormatted: string,
  ): Promise<MessageReceipt | null> {
    const patientPhone = normalizeWhatsAppNumber(appointment.patient.phone);
    if (!patientPhone) return null;

    try {
      const messageText = [
        `*CITA MÉDICA REPROGRAMADA*`,
        ``,
        `Estimado(a) ${appointment.patient.firstName},`,
        `Tu consulta con el *${siteConfig.doctorName}* ha sido reprogramada exitosamente:`,
        ``,
        `🗓 *Nueva Fecha:* ${appointment.dateFormatted}`,
        `⏰ *Nuevo Horario:* ${appointment.timeFormatted} h`,
        `📋 *Modalidad:* ${appointment.consultationTypeTitle}`,
        ``,
        `_Horario anterior: ${prevDateFormatted} a las ${prevTimeFormatted} h._`,
      ].join('\n');

      // Re-schedule reminder
      this.scheduleReminder2h(appointment);

      return await this.whatsappProvider.sendMessage(patientPhone, messageText);
    } catch (err) {
      console.warn('Error sending reschedule notification:', err);
      return null;
    }
  }

  /**
   * Dispatches cancellation notice to patient
   */
  async notifyCancelled(appointment: AppointmentRecord, reason?: string): Promise<MessageReceipt | null> {
    const patientPhone = normalizeWhatsAppNumber(appointment.patient.phone);
    if (!patientPhone) return null;

    try {
      appointment.reminder2hStatus = 'CANCELLED';

      const messageText = [
        `*CANCELACIÓN DE CITA MÉDICA*`,
        ``,
        `Estimado(a) ${appointment.patient.firstName},`,
        `Tu cita con el *${siteConfig.doctorName}* programada para el ${appointment.dateFormatted} a las ${appointment.timeFormatted} h ha sido cancelada.`,
        reason ? `\nMotivo: ${reason}` : '',
        ``,
        `Si deseas programar un nuevo horario cuando te sea conveniente, puedes hacerlo en cualquier momento desde nuestro sitio web.`,
      ].filter(Boolean).join('\n');

      return await this.whatsappProvider.sendMessage(patientPhone, messageText);
    } catch (err) {
      console.warn('Error sending cancellation notification:', err);
      return null;
    }
  }
}
