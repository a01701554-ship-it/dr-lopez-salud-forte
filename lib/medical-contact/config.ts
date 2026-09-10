const whatsappBusinessNumber =
  typeof process !== 'undefined' ? process.env.WHATSAPP_BUSINESS_NUMBER : undefined;

export const MEDICAL_CONTACT_CONFIG = {
  doctor: {
    name: 'Dr. Mauricio Benjamín Galindo López',
    shortName: 'Dr. Mauricio Galindo',
    title: 'Médico Cirujano',
    university: 'Tecnológico de Monterrey',
    license: '15851723',
    credentialVerificationUrl:
      'https://certificados.tec.mx/certificate/2f5cb12495c15b16b59a21f52552f646',
  },
  whatsapp: {
    // Verified notification number where Dr. Mauricio Galindo receives critical alerts
    doctorNotificationNumber: '+524421275952',
    // Configurable business number (fallback to site WhatsApp or notification number)
    businessNumber: whatsappBusinessNumber || '+524421275952',
    prefilledMessage:
      'Hola, vengo de la página del Dr. Mauricio Benjamín Galindo López y quisiera información.',
  },
  consultation: {
    durationMinutes: 45,
    bufferAfterMinutes: 15,
    minimumAdvanceHours: 12,
    maximumAdvanceDays: 60,
    cancellationNoticeHours: 24,
    holdDurationMinutes: 5,
    timezone: 'America/Mexico_City',
    weeklySchedule: {
      1: { open: '09:00', close: '18:00' }, // Lunes
      2: { open: '09:00', close: '18:00' }, // Martes
      3: { open: '09:00', close: '18:00' }, // Miércoles
      4: { open: '09:00', close: '18:00' }, // Jueves
      5: { open: '09:00', close: '18:00' }, // Viernes
      6: { open: '09:00', close: '13:00' }, // Sábado
      0: null,                              // Domingo (Cerrado)
    },
  },
  assistant: {
    welcomeMessage:
      'Hola, soy el asistente digital del Dr. Mauricio Benjamín Galindo López. Con gusto puedo ayudarle. Puede:\n• Agendar una consulta\n• Mover una cita\n• Cancelar una cita\n• Pedir información administrativa\n\n¿En qué le puedo orientar hoy?',
    emergencyWarning:
      '⚠️ Si presenta dolor en el pecho, dificultad para respirar severa, pérdida de conciencia, debilidad súbita o cualquier situación crítica, diríjase de inmediato a un servicio de urgencias hospitalario o llame al 911. Este canal no sustituye una atención de urgencias.',
  },
} as const;
