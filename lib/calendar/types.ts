/**
 * Centralized Booking Engine & Architecture
 * Dr. Mauricio Benjamín Galindo López - Médico Cirujano (Tecnológico de Monterrey)
 * Single source of truth for visit types, reasons, business hours, and availability.
 */

import { PricingConfig, ConsultationServiceConfig } from '@/config/pricing';

export type ConsultationTypeId = 'first-visit' | 'follow-up' | 'online' | 'home-visit';

export interface ConsultationTypeOption {
  id: ConsultationTypeId;
  label: string;
  durationLabel: string;
  durationMinutes: number;
  priceFormatted: string;
  price: number;
  available: boolean;
  isHomeVisit?: boolean;
}

export interface VisitReasonOption {
  id: string;
  label: string;
  appliesTo: ConsultationTypeId[];
}

export const VISIT_REASONS: VisitReasonOption[] = [
  // First visit / General
  { id: 'consulta-general', label: 'Consulta médica general', appliesTo: ['first-visit', 'online', 'home-visit'] },
  { id: 'primera-valoracion', label: 'Primera valoración y chequeo preventivo', appliesTo: ['first-visit', 'online'] },
  { id: 'evaluacion-sintomas', label: 'Evaluación de síntomas específicos', appliesTo: ['first-visit', 'online', 'home-visit'] },
  { id: 'estilo-vida-salud', label: 'Orientación en estilo de vida y prevención', appliesTo: ['first-visit', 'online'] },
  
  // Follow-up
  { id: 'seguimiento-previo', label: 'Seguimiento de consulta previa', appliesTo: ['follow-up', 'online'] },
  { id: 'revision-estudios', label: 'Revisión de estudios de laboratorio o imagen', appliesTo: ['follow-up', 'online'] },
  { id: 'ajuste-tratamiento', label: 'Ajuste o evolución de tratamiento', appliesTo: ['follow-up', 'online'] },

  // Generic other
  { id: 'otro-motivo', label: 'Otro motivo de valoración médica', appliesTo: ['first-visit', 'follow-up', 'online', 'home-visit'] },
];

export interface DoctorScheduleSettings {
  timezone: string;
  workDays: number[]; // 1 = Monday, ..., 6 = Saturday (0 = Sunday)
  startHour: number; // e.g. 9 for 09:00
  endHour: number; // e.g. 18 for 18:00
  lunchBreakStart: number; // 14 for 14:00
  lunchBreakEnd: number; // 15 for 15:00
  slotIntervalMinutes: number; // 30
  bufferAfterMinutes: number; // 10
  minimumAdvanceHours: number; // 12
  maximumBookingDays: number; // 30
}

export const DEFAULT_SCHEDULE_SETTINGS: DoctorScheduleSettings = {
  timezone: 'America/Mexico_City',
  workDays: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
  startHour: 9,
  endHour: 18,
  lunchBreakStart: 14,
  lunchBreakEnd: 15,
  slotIntervalMinutes: 30,
  bufferAfterMinutes: 10,
  minimumAdvanceHours: 6,
  maximumBookingDays: 30,
};

export interface TimeSlot {
  time: string; // "09:30"
  isoString: string; // "2026-09-15T09:30:00"
  dateFormatted: string; // "Martes, 15 sep"
  fullDateLabel: string; // "Martes 15 de septiembre"
  available: boolean;
}

export interface DayAvailability {
  date: Date;
  dateKey: string; // "YYYY-MM-DD"
  dayName: string; // "Lunes", "Martes"
  dayShort: string; // "LUN", "MAR"
  dayNumber: number; // 15
  monthShort: string; // "SEP"
  monthLong: string; // "septiembre"
  year: number;
  slots: TimeSlot[];
  isAvailable: boolean;
}

export interface AppointmentRecord {
  id: string;
  publicId: string;
  token: string;
  createdAt: string;
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  consultationTypeId: ConsultationTypeId;
  consultationTypeTitle: string;
  locationId?: 'jilotepec' | 'queretaro' | 'telemedicina';
  locationName?: string;
  addressSnapshot?: string | null;
  consultationMode?: 'in_person' | 'online';
  reasonId: string;
  reasonLabel: string;
  durationMinutes: number;
  durationLabel: string;
  feeAmount: number;
  feeFormatted: string;
  slotIso: string;
  dateFormatted: string;
  timeFormatted: string;
  patient: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
  };
  consents: {
    privacy: boolean;
    whatsappNotifications: boolean;
  };
  googleCalendarEventId?: string;
  cancellationReason?: string;

  // WhatsApp confirmation tracking
  confirmationWhatsAppStatus?: 'NOT_CONFIGURED' | 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  confirmationWhatsAppMessageId?: string;
  confirmationSentAt?: string;
  confirmationError?: string;

  // 2-hour reminder tracking
  reminder2hScheduledFor?: string; // ISO date string of scheduled trigger time (slotIso - 2h)
  reminder2hStatus?: 'NOT_SCHEDULED' | 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED' | 'CANCELLED';
  reminder2hMessageId?: string;
  reminder2hSentAt?: string;
  reminder2hError?: string;
  reminder2hAttemptCount?: number;

  whatsappOptIn?: boolean;
  whatsappAppointmentConsentAt?: string;
  timezone?: string;
}
