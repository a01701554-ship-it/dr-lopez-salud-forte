import { WhatsAppProvider } from '../messaging/provider';
import { MEDICAL_CONTACT_CONFIG } from './config';
import { AppointmentRecord, DoctorAlert } from './types';

export class NotificationService {
  private whatsappProvider: WhatsAppProvider;
  private alertsLog: DoctorAlert[] = [];

  constructor(whatsappProvider: WhatsAppProvider) {
    this.whatsappProvider = whatsappProvider;
  }

  getAlertsLog(): DoctorAlert[] {
    return [...this.alertsLog];
  }

  /**
   * Notifies Dr. Mauricio Galindo at +524421275952 of a newly confirmed appointment
   */
  async notifyDoctorNewAppointment(appointment: AppointmentRecord): Promise<DoctorAlert> {
    const message = `🩺 *NUEVA CITA CONFIRMADA*\n` +
      `• Paciente: ${appointment.patient.fullName}\n` +
      `• Teléfono: ${appointment.patient.phone}\n` +
      `• Modalidad: ${appointment.slot.modality || 'Presencial'}\n` +
      `• Fecha: ${appointment.slot.formattedDate}\n` +
      `• Hora: ${appointment.slot.formattedTime}\n` +
      `• ID Cita: ${appointment.id}\n` +
      `• Google Calendar: Sincronizado`;

    return this.dispatchDoctorAlert({
      eventType: 'NEW_APPOINTMENT',
      patientName: appointment.patient.fullName,
      patientPhone: appointment.patient.phone,
      details: message,
    });
  }

  /**
   * Notifies Dr. Mauricio Galindo when an appointment is rescheduled
   */
  async notifyDoctorRescheduled(appointment: AppointmentRecord, oldSlotDesc: string): Promise<DoctorAlert> {
    const message = `🔄 *CITA REPROGRAMADA*\n` +
      `• Paciente: ${appointment.patient.fullName}\n` +
      `• Teléfono: ${appointment.patient.phone}\n` +
      `• Horario anterior: ${oldSlotDesc}\n` +
      `• Nuevo horario: ${appointment.slot.formattedDate} a las ${appointment.slot.formattedTime}\n` +
      `• ID Cita: ${appointment.id}`;

    return this.dispatchDoctorAlert({
      eventType: 'RESCHEDULED_APPOINTMENT',
      patientName: appointment.patient.fullName,
      patientPhone: appointment.patient.phone,
      details: message,
    });
  }

  /**
   * Notifies Dr. Mauricio Galindo when an appointment is cancelled
   */
  async notifyDoctorCancelled(appointment: AppointmentRecord, reason?: string): Promise<DoctorAlert> {
    const message = `❌ *CITA CANCELADA*\n` +
      `• Paciente: ${appointment.patient.fullName}\n` +
      `• Teléfono: ${appointment.patient.phone}\n` +
      `• Horario liberado: ${appointment.slot.formattedDate} a las ${appointment.slot.formattedTime}\n` +
      (reason ? `• Motivo: ${reason}\n` : '') +
      `• ID Cita: ${appointment.id}`;

    return this.dispatchDoctorAlert({
      eventType: 'CANCELLED_APPOINTMENT',
      patientName: appointment.patient.fullName,
      patientPhone: appointment.patient.phone,
      details: message,
    });
  }

  /**
   * Notifies Dr. Mauricio Galindo when a patient requests to speak with a human
   */
  async notifyDoctorHumanRequested(patientPhone: string, patientName?: string, context?: string): Promise<DoctorAlert> {
    const message = `🙋 *SOLICITUD DE ATENCIÓN HUMANA*\n` +
      `• Paciente: ${patientName || 'No especificado'}\n` +
      `• Teléfono: ${patientPhone}\n` +
      (context ? `• Mensaje: "${context}"\n` : '') +
      `• Estado: Asistente en pausa esperando contacto médico directo.`;

    return this.dispatchDoctorAlert({
      eventType: 'HUMAN_SUPPORT_REQUEST',
      patientName,
      patientPhone,
      details: message,
    });
  }

  /**
   * Critical alert when medical triage detects emergency keywords
   */
  async notifyDoctorEmergency(patientPhone: string, query: string): Promise<DoctorAlert> {
    const message = `⚠️ *ALERTA MÉDICA URGENTE*\n` +
      `• Teléfono: ${patientPhone}\n` +
      `• Consulta detectada: "${query}"\n` +
      `• Acción asistencial: Se indicó al paciente acudir a Urgencias / llamar al 911 de inmediato.`;

    return this.dispatchDoctorAlert({
      eventType: 'MEDICAL_EMERGENCY_DETECTED',
      patientPhone,
      details: message,
    });
  }

  /**
   * Notifies doctor of questions not found in knowledge base
   */
  async notifyDoctorUnansweredQuestion(patientPhone: string, question: string): Promise<DoctorAlert> {
    const message = `❓ *CONSULTA SIN RESPUESTA EN BASE DE CONOCIMIENTO*\n` +
      `• Teléfono: ${patientPhone}\n` +
      `• Pregunta: "${question}"`;

    return this.dispatchDoctorAlert({
      eventType: 'UNANSWERED_QUESTION',
      patientPhone,
      details: message,
    });
  }

  private async dispatchDoctorAlert(data: {
    eventType: DoctorAlert['eventType'];
    patientName?: string;
    patientPhone: string;
    details: string;
  }): Promise<DoctorAlert> {
    const alert: DoctorAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventType: data.eventType,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      details: data.details,
      status: 'PENDING',
    };

    try {
      const receipt = await this.whatsappProvider.sendMessage(
        MEDICAL_CONTACT_CONFIG.whatsapp.doctorNotificationNumber,
        data.details,
      );
      alert.status = 'SENT';
      alert.deliveryReceipt = receipt.providerMessageId;
    } catch (err) {
      console.error('Failed sending doctor WhatsApp alert:', err);
      alert.status = 'FAILED';
    }

    this.alertsLog.unshift(alert);
    return alert;
  }
}
