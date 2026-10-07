import type { AppointmentRecord, ConsultationTypeId } from './types';

const APPOINTMENTS_API =
  'https://salud-forte-academy-api-preview.a01701554.workers.dev/api/appointments';

export type CreateAppointmentInput = {
  consultationTypeId: ConsultationTypeId;
  consultationTypeTitle: string;
  reasonId: string;
  reasonLabel: string;
  durationMinutes: number;
  durationLabel: string;
  feeAmount: number;
  feeFormatted: string;
  slotIso: string;
  dateFormatted: string;
  timeFormatted: string;
  locationId?: 'jilotepec' | 'queretaro' | 'telemedicina';
  locationName?: string;
  locationAddress?: string | null;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  consents: {
    privacy: boolean;
    whatsappNotifications: boolean;
  };
};

export class AppointmentApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'AppointmentApiError';
  }
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<AppointmentRecord> {
  const modality =
    input.consultationTypeId === 'online'
      ? 'online'
      : input.consultationTypeId === 'home-visit'
        ? 'home_visit'
        : 'in_person';

  const response = await fetch(APPOINTMENTS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': `appointment:${crypto.randomUUID()}`,
    },
    body: JSON.stringify({
      firstName: input.patient.firstName,
      lastName: input.patient.lastName,
      email: input.patient.email,
      phone: input.patient.phone,
      appointmentType: input.consultationTypeId,
      modality,
      locationId:
        input.locationId || (modality === 'online' ? 'telemedicina' : 'queretaro'),
      startsAt: input.slotIso,
      timezone: 'America/Mexico_City',
      generalReason: input.reasonLabel,
      isFirstVisit: input.consultationTypeId !== 'follow-up',
      privacyConsent: input.consents.privacy,
      whatsappConsent: input.consents.whatsappNotifications,
      website: '',
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result?.appointment?.id) {
    throw new AppointmentApiError(
      result?.message || result?.error || 'No fue posible registrar la cita.',
      response.status,
    );
  }

  const managementToken = (() => {
    try {
      return new URL(result.managementUrl).searchParams.get('token') || '';
    } catch {
      return '';
    }
  })();

  return {
    id: result.appointment.id,
    publicId: result.appointment.publicId,
    token: managementToken,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    consultationTypeId: input.consultationTypeId,
    consultationTypeTitle: input.consultationTypeTitle,
    locationId: input.locationId,
    locationName: input.locationName,
    addressSnapshot: input.locationAddress,
    consultationMode: modality === 'online' ? 'online' : 'in_person',
    reasonId: input.reasonId,
    reasonLabel: input.reasonLabel,
    durationMinutes: input.durationMinutes,
    durationLabel: input.durationLabel,
    feeAmount: input.feeAmount,
    feeFormatted: input.feeFormatted,
    slotIso: result.appointment.startsAt || input.slotIso,
    dateFormatted: input.dateFormatted,
    timeFormatted: input.timeFormatted,
    patient: {
      ...input.patient,
      fullName: `${input.patient.firstName} ${input.patient.lastName}`.trim(),
    },
    consents: input.consents,
    whatsappOptIn: input.consents.whatsappNotifications,
    timezone: 'America/Mexico_City',
    confirmationWhatsAppStatus:
      result?.integrations?.whatsapp === 'sent'
        ? 'SENT'
        : result?.integrations?.whatsapp === 'failed'
          ? 'FAILED'
          : input.consents.whatsappNotifications
            ? 'QUEUED'
            : 'NOT_CONFIGURED',
  };
}
