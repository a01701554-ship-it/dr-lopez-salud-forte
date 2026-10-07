/**
 * Centralized Consultation & Medical Services Pricing
 * Single Source of Truth for Dr. Mauricio Benjamín Galindo López
 * 
 * Used by:
 * - Homepage narrative
 * - /consulta & /agendar
 * - FAQ Accordion
 * - WhatsApp Assistant & Knowledge Base
 * - Admin Panel (/admin/precios)
 */

export interface ConsultationServiceConfig {
  id: string;
  title: string;
  shortTitle: string;
  price: number;
  priceFrom?: number;
  isStartingPrice?: boolean;
  currency: string;
  duration: string;
  durationMinutes: number;
  description: string;
  includedNotes: string[];
  active: boolean;
  bookingEnabled: boolean;
  onlineEnabled?: boolean;
  homeVisitEnabled?: boolean;
}

export interface PricingConfig {
  firstVisit: ConsultationServiceConfig;
  followUp: ConsultationServiceConfig;
  online: ConsultationServiceConfig;
  homeVisit: ConsultationServiceConfig;
  onlineConsultationEnabled: boolean;
  homeVisitEnabled: boolean;
  paymentMethods: string[];
  bookingPaymentPolicy: 'PAY_AT_APPOINTMENT' | 'PAY_TO_CONFIRM' | 'DEPOSIT_REQUIRED' | null;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  firstVisit: {
    id: 'first-visit',
    title: 'Primera Consulta Médica',
    shortTitle: 'Primera Consulta',
    price: 650,
    currency: 'MXN',
    duration: '45–60 minutos',
    durationMinutes: 50,
    description:
      'Valoración clínica individualizada con tiempo para escuchar con calma, explorar el motivo de consulta y explicar claramente los siguientes pasos.',
    includedNotes: [
      'Entrevista médica detallada y antecedentes',
      'Exploración clínica orientada al motivo de atención',
      'Revisión minuciosa de análisis previos',
      'Explicación clara del plan médico a seguir',
    ],
    active: true,
    bookingEnabled: true,
  },
  followUp: {
    id: 'follow-up',
    title: 'Consulta de Seguimiento',
    shortTitle: 'Seguimiento',
    price: 600,
    currency: 'MXN',
    duration: '25–30 minutos',
    durationMinutes: 30,
    description:
      'Destinada a la revisión de la evolución de un problema previamente valorado, evaluación de nuevos estudios y ajustes al plan indicado.',
    includedNotes: [
      'Evaluación de respuesta a recomendaciones previas',
      'Interpretación de estudios de control',
      'Ajuste oportuno de pautas o prescripciones',
    ],
    active: true,
    bookingEnabled: true,
  },
  online: {
    id: 'online',
    title: 'Consulta Médica en Línea',
    shortTitle: 'Consulta en Línea',
    price: 650,
    currency: 'MXN',
    duration: '30–45 minutos',
    durationMinutes: 40,
    description:
      'Videoconsulta mediante plataforma confidencial para situaciones donde la modalidad remota sea clínicamente adecuada.',
    includedNotes: [
      'Conexión segura y cifrada de alta definición',
      'Orientación preventiva y estilo de vida',
      'Revisión remota de análisis de laboratorio',
    ],
    active: true,
    bookingEnabled: true,
    onlineEnabled: true,
  },
  homeVisit: {
    id: 'home-visit',
    title: 'Consulta a Domicilio',
    shortTitle: 'Domicilio',
    price: 1500,
    priceFrom: 1500,
    isStartingPrice: true,
    currency: 'MXN',
    duration: 'Según requerimiento',
    durationMinutes: 60,
    description:
      'Atención médica en domicilio para pacientes con movilidad limitada o requerimientos especiales. Sujeto a verificación previa de zona y disponibilidad.',
    includedNotes: [
      'Valoración médica en su residencia',
      'Revisión física y signos vitales',
      'Sujeto a confirmación de cobertura y disponibilidad',
    ],
    active: true,
    bookingEnabled: false, // Managed via direct WhatsApp verification
    homeVisitEnabled: true,
  },
  onlineConsultationEnabled: true,
  homeVisitEnabled: true,
  paymentMethods: [
    'Transferencia electrónica (SPEI)',
    'Tarjeta de débito y crédito (Visa / Mastercard / AMEX)',
    'Efectivo en consultorio',
  ],
  bookingPaymentPolicy: 'PAY_AT_APPOINTMENT',
};

/**
 * Format professional fee string e.g. "$800 MXN" or "Desde $1,500 MXN"
 */
export function formatProfessionalFee(
  amount: number,
  currency: string = 'MXN',
  isStartingPrice?: boolean,
): string {
  const formatted = `$${amount.toLocaleString('es-MX')} ${currency}`;
  return isStartingPrice ? `Desde ${formatted}` : formatted;
}
