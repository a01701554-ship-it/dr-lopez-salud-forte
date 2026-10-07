export type IntentType =
  | 'BOOK_APPOINTMENT'
  | 'CHECK_AVAILABILITY'
  | 'RESCHEDULE_APPOINTMENT'
  | 'CANCEL_APPOINTMENT'
  | 'CONFIRM_APPOINTMENT'
  | 'GENERAL_INFORMATION'
  | 'HUMAN_SUPPORT'
  | 'MEDICAL_QUESTION'
  | 'POSSIBLE_EMERGENCY'
  | 'GREETING'
  | 'UNKNOWN';

export type SessionState =
  | 'IDLE'
  | 'SELECTING_DATE'
  | 'SELECTING_SLOT'
  | 'COLLECTING_PATIENT_INFO'
  | 'AWAITING_CONFIRMATION'
  | 'BOOKED'
  | 'RESCHEDULING_LOOKUP'
  | 'RESCHEDULING_SELECT_SLOT'
  | 'CANCEL_CONFIRMATION'
  | 'WAITING_FOR_HUMAN'
  | 'EMERGENCY_DISPATCHED';

export type AppointmentStatus =
  | 'HOLD'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED';

export type AppointmentModality = 'presencial' | 'en-linea';
export type AppointmentLocationId = 'jilotepec' | 'queretaro' | 'telemedicina';

export interface TimeSlot {
  id: string;
  start: string; // ISO string
  end: string;   // ISO string
  formattedDate: string;
  formattedTime: string;
  modality?: AppointmentModality;
  locationId?: AppointmentLocationId;
  locationName?: string;
  addressSnapshot?: string | null;
}

export interface PatientInfo {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface AppointmentRecord {
  id: string;
  idempotencyKey: string;
  patient: PatientInfo;
  slot: TimeSlot;
  locationId?: AppointmentLocationId;
  locationName?: string;
  addressSnapshot?: string | null;
  consultationMode?: 'in_person' | 'online';
  calendarEventId?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  holdExpiresAt?: string;
}

export interface DoctorAlert {
  id: string;
  timestamp: string;
  eventType:
    | 'NEW_APPOINTMENT'
    | 'RESCHEDULED_APPOINTMENT'
    | 'CANCELLED_APPOINTMENT'
    | 'HUMAN_SUPPORT_REQUEST'
    | 'MEDICAL_EMERGENCY_DETECTED'
    | 'UNANSWERED_QUESTION';
  patientName?: string;
  patientPhone: string;
  details: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  deliveryReceipt?: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  metadata?: {
    intent?: IntentType;
    slots?: TimeSlot[];
    requiresAction?: boolean;
    appointmentId?: string;
  };
}

export interface ConversationSession {
  sessionId: string;
  patientPhone: string;
  patientName?: string;
  state: SessionState;
  selectedModality?: AppointmentModality;
  pendingSlot?: TimeSlot;
  pendingAppointmentId?: string;
  messages: ConversationMessage[];
  lastInteractionAt: string;
  humanHandoff: boolean;
}
