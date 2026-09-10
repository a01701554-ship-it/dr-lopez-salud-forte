import { AppointmentService } from './appointment-service';
import { AvailabilityService } from './availability-service';
import { NotificationService } from './notification-service';
import { MEDICAL_CONTACT_CONFIG } from './config';
import { findKnowledgeMatch } from './knowledge-base';
import {
  ConversationSession,
  ConversationMessage,
  IntentType,
  TimeSlot,
  AppointmentModality,
} from './types';

export class ConversationOrchestrator {
  private appointmentService: AppointmentService;
  private availabilityService: AvailabilityService;
  private notificationService: NotificationService;
  private sessions: Map<string, ConversationSession> = new Map();

  constructor(
    appointmentService: AppointmentService,
    availabilityService: AvailabilityService,
    notificationService: NotificationService,
  ) {
    this.appointmentService = appointmentService;
    this.availabilityService = availabilityService;
    this.notificationService = notificationService;
  }

  getOrCreateSession(sessionId: string, phone: string, name?: string): ConversationSession {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        patientPhone: phone,
        patientName: name,
        state: 'IDLE',
        messages: [],
        lastInteractionAt: new Date().toISOString(),
        humanHandoff: false,
      };
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  detectIntent(text: string): IntentType {
    const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Emergency check first (cardiac, respiratory, neurological, hemorrhage)
    if (
      norm.includes('urgencia') ||
      norm.includes('emergencia') ||
      norm.includes('infarto') ||
      (norm.includes('dolor') && norm.includes('pecho')) ||
      (norm.includes('falta') && norm.includes('aire')) ||
      (norm.includes('dificultad') && norm.includes('respir')) ||
      norm.includes('asfixia') ||
      norm.includes('desmayo') ||
      norm.includes('inconsciente') ||
      norm.includes('convulsion') ||
      norm.includes('derrame') ||
      (norm.includes('sangrado') && (norm.includes('abundante') || norm.includes('grave')))
    ) {
      return 'POSSIBLE_EMERGENCY';
    }

    // Human support
    if (
      norm.includes('humano') ||
      norm.includes('persona') ||
      norm.includes('hablar con alguien') ||
      norm.includes('asistente humano') ||
      norm.includes('con el doctor') ||
      norm.includes('secretaria') ||
      norm.includes('recepcion')
    ) {
      return 'HUMAN_SUPPORT';
    }

    // Cancellation
    if (
      norm.includes('cancelar') ||
      norm.includes('anular cita') ||
      norm.includes('no puedo ir') ||
      norm.includes('dar de baja cita')
    ) {
      return 'CANCEL_APPOINTMENT';
    }

    // Reschedule
    if (
      norm.includes('mover') ||
      norm.includes('reprogramar') ||
      norm.includes('cambiar cita') ||
      norm.includes('cambiar hora') ||
      norm.includes('cambiar fecha') ||
      norm.includes('otro dia')
    ) {
      return 'RESCHEDULE_APPOINTMENT';
    }

    // Book appointment
    if (
      norm.includes('agendar') ||
      norm.includes('cita') ||
      norm.includes('consulta') ||
      norm.includes('reservar') ||
      norm.includes('sacar cita') ||
      norm.includes('quiero ir')
    ) {
      return 'BOOK_APPOINTMENT';
    }

    // Check availability
    if (
      norm.includes('horario') ||
      norm.includes('disponibilidad') ||
      norm.includes('cuando tiene') ||
      norm.includes('fechas') ||
      norm.includes('que dias')
    ) {
      return 'CHECK_AVAILABILITY';
    }

    // Greetings
    if (
      norm.startsWith('hola') ||
      norm.startsWith('buen') ||
      norm.startsWith('saludos') ||
      norm === 'hola'
    ) {
      return 'GREETING';
    }

    return 'GENERAL_INFORMATION';
  }

  /**
   * Processes an incoming message from WhatsApp or the web widget
   */
  async handleIncomingMessage(
    sessionId: string,
    phone: string,
    incomingText: string,
    userName?: string,
  ): Promise<string> {
    const session = this.getOrCreateSession(sessionId, phone, userName);
    session.lastInteractionAt = new Date().toISOString();

    const userMsg: ConversationMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: incomingText,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(userMsg);

    const intent = this.detectIntent(incomingText);
    let replyText = '';

    // If session is paused waiting for human and user didn't explicitly request to resume
    if (session.humanHandoff && intent !== 'BOOK_APPOINTMENT' && intent !== 'CHECK_AVAILABILITY') {
      replyText =
        'Su mensaje ha sido registrado para el Dr. Mauricio Galindo. En cuanto esté disponible le responderá directamente a este número.';
      this.addAssistantMessage(session, replyText);
      return replyText;
    }

    switch (intent) {
      case 'POSSIBLE_EMERGENCY': {
        replyText = MEDICAL_CONTACT_CONFIG.assistant.emergencyWarning;
        session.state = 'EMERGENCY_DISPATCHED';
        await this.notificationService.notifyDoctorEmergency(session.patientPhone, incomingText);
        break;
      }

      case 'HUMAN_SUPPORT': {
        session.humanHandoff = true;
        session.state = 'WAITING_FOR_HUMAN';
        replyText =
          'Comprendo. He notificado de inmediato al Dr. Mauricio Benjamín Galindo López para que revise su conversación y se comunique con usted en cuanto le sea posible. Mientras tanto, quedo atento por si requiere agendar o consultar información.';
        await this.notificationService.notifyDoctorHumanRequested(
          session.patientPhone,
          session.patientName,
          incomingText,
        );
        break;
      }

      case 'GREETING': {
        replyText = MEDICAL_CONTACT_CONFIG.assistant.welcomeMessage;
        session.state = 'IDLE';
        break;
      }

      case 'BOOK_APPOINTMENT':
      case 'CHECK_AVAILABILITY': {
        const modality: AppointmentModality = incomingText.toLowerCase().includes('linea') ||
          incomingText.toLowerCase().includes('online') ||
          incomingText.toLowerCase().includes('virtual')
          ? 'en-linea'
          : 'presencial';

        session.selectedModality = modality;
        const slots = await this.availabilityService.getAvailableSlots({
          modality,
          daysAhead: 5,
          existingHolds: this.appointmentService.getActiveHolds(),
        });

        if (slots.length === 0) {
          replyText =
            'Por el momento no encuentro horarios inmediatos en el calendario para los próximos días. Si gusta, notificaré al Dr. Galindo para verificar un espacio especial para usted.';
          await this.notificationService.notifyDoctorUnansweredQuestion(
            session.patientPhone,
            `Solicitud de cita sin espacios disponibles (${modality})`,
          );
        } else {
          session.state = 'SELECTING_SLOT';
          // Save candidate slots in session
          (session as any).candidateSlots = slots.slice(0, 4);

          replyText =
            `Con gusto. El Dr. Mauricio Galindo ofrece consulta ${modality === 'en-linea' ? 'En línea' : 'Presencial'}. Tengo los siguientes horarios próximos disponibles:\n\n` +
            slots
              .slice(0, 4)
              .map((s, idx) => `${idx + 1}. ${s.formattedDate} a las ${s.formattedTime}`)
              .join('\n') +
            '\n\nPor favor responda con el número de la opción deseada (ej. 1) o indíqueme si prefiere otra fecha.';
        }
        break;
      }

      case 'CANCEL_APPOINTMENT': {
        const active = this.appointmentService.findActiveAppointmentByPhone(session.patientPhone);
        if (!active) {
          replyText =
            'No localizo una cita activa asociada a este número telefónico. Si agendó con otro nombre o teléfono, por favor indíquemelo para buscarla.';
        } else {
          session.state = 'CANCEL_CONFIRMATION';
          session.pendingAppointmentId = active.id;
          replyText =
            `Tiene programada una consulta para el ${active.slot.formattedDate} a las ${active.slot.formattedTime}. ¿Desea confirmar la cancelación definitiva de esta cita? (Responda "Sí" para confirmar).`;
        }
        break;
      }

      case 'RESCHEDULE_APPOINTMENT': {
        const active = this.appointmentService.findActiveAppointmentByPhone(session.patientPhone);
        if (!active) {
          replyText =
            'No encuentro una cita previa registrada con este número para reprogramar. ¿Gusta que agendemos una nueva consulta?';
        } else {
          session.state = 'RESCHEDULING_SELECT_SLOT';
          session.pendingAppointmentId = active.id;

          const slots = await this.availabilityService.getAvailableSlots({
            modality: active.slot.modality || 'presencial',
            daysAhead: 6,
            existingHolds: this.appointmentService.getActiveHolds(),
          });

          (session as any).candidateSlots = slots.slice(0, 4);
          replyText =
            `Su cita actual es para el ${active.slot.formattedDate} a las ${active.slot.formattedTime}.\n\nPara reprogramarla, tengo estos nuevos horarios disponibles:\n` +
            slots
              .slice(0, 4)
              .map((s, idx) => `${idx + 1}. ${s.formattedDate} a las ${s.formattedTime}`)
              .join('\n') +
            '\n\n¿Cuál de ellos prefiere? (Responda 1, 2, 3...)';
        }
        break;
      }

      default: {
        // Evaluate session state machine transitions
        replyText = await this.handleStateStep(session, incomingText);
        break;
      }
    }

    this.addAssistantMessage(session, replyText);
    return replyText;
  }

  private async handleStateStep(
    session: ConversationSession,
    text: string,
  ): Promise<string> {
    const norm = text.trim().toLowerCase();

    // 1. Selecting Slot during Booking
    if (session.state === 'SELECTING_SLOT') {
      const candidateSlots: TimeSlot[] = (session as any).candidateSlots || [];
      const choiceIdx = parseInt(norm, 10) - 1;

      if (!isNaN(choiceIdx) && candidateSlots[choiceIdx]) {
        const chosenSlot = candidateSlots[choiceIdx];
        session.pendingSlot = chosenSlot;
        session.state = 'COLLECTING_PATIENT_INFO';

        // Place temporary hold
        await this.appointmentService.placeSlotHold(
          { fullName: session.patientName || 'Paciente', phone: session.patientPhone },
          chosenSlot,
        );

        return `Perfecto. He apartado provisionalmente su espacio para el ${chosenSlot.formattedDate} a las ${chosenSlot.formattedTime}.\n\nPara completar el registro, ¿me podría proporcionar su Nombre Completo?`;
      } else {
        return 'Por favor elija una de las opciones numéricas (1, 2, 3...) o dígame si busca un día u horario diferente.';
      }
    }

    // 2. Collecting Patient Info
    if (session.state === 'COLLECTING_PATIENT_INFO') {
      session.patientName = text.trim();
      session.state = 'AWAITING_CONFIRMATION';

      const slot = session.pendingSlot;
      return (
        `Muchas gracias, ${session.patientName}.\n\n` +
        `Detalles de su cita:\n` +
        `• Médico: ${MEDICAL_CONTACT_CONFIG.doctor.name}\n` +
        `• Modalidad: ${session.selectedModality === 'en-linea' ? 'En línea' : 'Presencial'}\n` +
        `• Fecha y Hora: ${slot?.formattedDate} a las ${slot?.formattedTime}\n` +
        `• Teléfono: ${session.patientPhone}\n\n` +
        `¿Confirmamos su cita? (Responda "Sí" para confirmar).`
      );
    }

    // 3. Awaiting final confirmation
    if (session.state === 'AWAITING_CONFIRMATION') {
      if (norm.includes('si') || norm.includes('confirmo') || norm.includes('de acuerdo') || norm.includes('adelante')) {
        if (!session.pendingSlot) {
          session.state = 'IDLE';
          return 'No tengo un horario seleccionado en memoria. ¿Gusta que revisemos la disponibilidad nuevamente?';
        }

        try {
          // CRITICAL STEP: Atomic reservation in Google Calendar + Database
          const appointment = await this.appointmentService.confirmAppointment({
            patient: {
              fullName: session.patientName || 'Paciente',
              phone: session.patientPhone,
            },
            slot: session.pendingSlot,
            idempotencyKey: `booking-${session.sessionId}-${session.pendingSlot.id}`,
          });

          session.state = 'BOOKED';

          // Notify Dr. Mauricio Galindo at +524421275952
          await this.notificationService.notifyDoctorNewAppointment(appointment);

          return (
            `✅ Su cita está confirmada con éxito.\n\n` +
            `• Especialista: ${MEDICAL_CONTACT_CONFIG.doctor.name}\n` +
            `• Fecha: ${appointment.slot.formattedDate}\n` +
            `• Hora: ${appointment.slot.formattedTime}\n` +
            `• Modalidad: ${appointment.slot.modality || 'Presencial'}\n` +
            `• Identificador: ${appointment.id}\n\n` +
            `Hemos sincronizado el evento en la agenda del doctor. Le recomendamos tener a la mano estudios previos y lista de medicamentos. ¡Que tenga un excelente día!`
          );
        } catch (err: any) {
          session.state = 'IDLE';
          return `Lo lamento, ocurrió una inconsistencia al apartar el horario: ${err.message}. Por favor intentemos con otro horario.`;
        }
      } else {
        session.state = 'IDLE';
        return 'Entendido. No he confirmado la cita. Si desea elegir otro horario o hacer alguna consulta, estoy a su servicio.';
      }
    }

    // 4. Cancellation confirmation
    if (session.state === 'CANCEL_CONFIRMATION') {
      if (norm.includes('si') || norm.includes('confirmo')) {
        if (session.pendingAppointmentId) {
          const cancelled = await this.appointmentService.cancelAppointment(session.pendingAppointmentId);
          session.state = 'IDLE';
          session.pendingAppointmentId = undefined;

          // Notify doctor
          await this.notificationService.notifyDoctorCancelled(cancelled);

          return `Su cita del ${cancelled.slot.formattedDate} a las ${cancelled.slot.formattedTime} ha sido cancelada correctamente y el horario ha sido liberado. Cuando desee volver a agendar, con gusto le atenderemos.`;
        }
      }
      session.state = 'IDLE';
      return 'Su cita se mantiene vigente sin cambios. ¿Hay algo más en lo que le pueda colaborar?';
    }

    // 5. Rescheduling Selection
    if (session.state === 'RESCHEDULING_SELECT_SLOT') {
      const candidateSlots: TimeSlot[] = (session as any).candidateSlots || [];
      const choiceIdx = parseInt(norm, 10) - 1;

      if (!isNaN(choiceIdx) && candidateSlots[choiceIdx] && session.pendingAppointmentId) {
        const newSlot = candidateSlots[choiceIdx];
        const oldAppt = this.appointmentService.getAppointmentById(session.pendingAppointmentId);
        const oldDesc = oldAppt ? `${oldAppt.slot.formattedDate} a las ${oldAppt.slot.formattedTime}` : 'Previa';

        const updated = await this.appointmentService.rescheduleAppointment(
          session.pendingAppointmentId,
          newSlot,
        );

        session.state = 'IDLE';
        session.pendingAppointmentId = undefined;

        await this.notificationService.notifyDoctorRescheduled(updated, oldDesc);

        return `✅ Su cita ha sido reprogramada con éxito para el ${updated.slot.formattedDate} a las ${updated.slot.formattedTime}. La agenda del Dr. Galindo ha sido actualizada.`;
      } else {
        return 'Por favor seleccione una opción válida (1, 2, 3...) para reprogramar su cita.';
      }
    }

    // 6. Knowledge Base Lookup
    const kbAnswer = findKnowledgeMatch(text);
    if (kbAnswer) {
      return kbAnswer;
    }

    // If query is unknown, don't hallucinate. Notify doctor.
    await this.notificationService.notifyDoctorUnansweredQuestion(session.patientPhone, text);
    return (
      `Entiendo su consulta. Para brindarle información certera sobre ese punto en particular, he canalizado su duda con el Dr. Mauricio Galindo. Mientras tanto, si requiere agendar o revisar horarios disponibles, con gusto le asisto.`
    );
  }

  private addAssistantMessage(session: ConversationSession, text: string) {
    const msg: ConversationMessage = {
      id: `msg-${Date.now()}-assistant`,
      sender: 'assistant',
      text,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(msg);
  }
}
