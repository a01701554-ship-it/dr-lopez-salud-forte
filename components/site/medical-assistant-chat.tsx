'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  Send,
  MessageCircle,
  User,
  Bot,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { DEFAULT_PRICING_CONFIG, formatProfessionalFee } from '@/config/pricing';
import { AvailabilityService } from '@/lib/calendar/availability';
import { AppointmentsRepository } from '@/lib/calendar/appointments-repo';
import { BookingNotificationService } from '@/lib/calendar/notifications';
import { AppointmentRecord, ConsultationTypeId, TimeSlot } from '@/lib/calendar/types';
import { normalizeWhatsAppNumber } from '@/lib/messaging/phone-utils';

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  type?:
    | 'text'
    | 'quick_actions'
    | 'type_selection'
    | 'slots_selection'
    | 'patient_form'
    | 'review_booking'
    | 'booking_confirmed'
    | 'manage_search'
    | 'appointment_card'
    | 'cancel_confirm'
    | 'handoff';
  data?: any;
}

interface MedicalAssistantChatProps {
  onOpenCalendar?: () => void;
  onOpenDirectBooking?: () => void;
  onOpenDoctorHandoff?: () => void;
}

const LOCAL_STORAGE_KEY = 'mbgl_medical_assistant_messages';

export function MedicalAssistantChat({
  onOpenCalendar,
  onOpenDirectBooking,
  onOpenDoctorHandoff,
}: MedicalAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing medical assistant messages from localStorage:', e);
        }
      }
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: `Hola. Soy el asistente digital del ${siteConfig.doctorName}.\n\nPuedo ayudarte a consultar horarios, agendar o gestionar una cita y resolver dudas sobre la atención.\n\n¿En qué puedo ayudarte?`,
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        type: 'quick_actions',
      },
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Booking Flow in Chat State
  const [bookingType, setBookingType] = useState<{
    id: ConsultationTypeId;
    label: string;
    price: number;
    priceFormatted: string;
    durationMinutes: number;
    durationLabel: string;
  } | null>(null);

  const [bookingSlot, setBookingSlot] = useState<TimeSlot | null>(null);
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    privacyConsent: true,
    whatsappConsent: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);

  // Appointment Management State
  const [manageQuery, setManageQuery] = useState('');
  const [selectedManageAppointment, setSelectedManageAppointment] = useState<AppointmentRecord | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const availabilityService = useRef(new AvailabilityService());
  const notificationService = useRef(new BookingNotificationService());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addAssistantMessage = (
    text: string,
    type: ChatMessage['type'] = 'text',
    data?: any,
    delayMs = 450,
  ) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sender: 'assistant',
          text,
          timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          type,
          data,
        },
      ]);
    }, delayMs);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue('');
    }

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 1. Emergency intent check
    if (
      norm.includes('urgencia') ||
      norm.includes('emergencia') ||
      norm.includes('infarto') ||
      (norm.includes('dolor') && norm.includes('pecho')) ||
      (norm.includes('falta') && norm.includes('aire')) ||
      norm.includes('desmayo') ||
      norm.includes('asfixia') ||
      norm.includes('inconsciente') ||
      (norm.includes('sangrado') && norm.includes('abundante'))
    ) {
      addAssistantMessage(
        `⚠️ Si consideras que se trata de una urgencia médica o existe riesgo inmediato para la vida, busca atención médica de urgencia de inmediato o llama al 911 en México.\n\nEste canal digital no sustituye una sala de emergencias ni atención médica inmediata.`,
        'text',
      );
      return;
    }

    // 2. Human handoff / Doctor WhatsApp
    if (
      norm.includes('hablar con el dr') ||
      norm.includes('hablar con doctor') ||
      norm.includes('humano') ||
      norm.includes('persona') ||
      norm.includes('asistencia whatsapp') ||
      norm.includes('secretaria') ||
      norm.includes('telefono') ||
      norm.includes('contacto directo')
    ) {
      addAssistantMessage(
        `Si prefieres comunicarte directamente con el ${siteConfig.doctorName}, puedes continuar por WhatsApp.`,
        'handoff',
      );
      return;
    }

    // 3. Pricing / Honorarios
    if (
      norm.includes('precio') ||
      norm.includes('costo') ||
      norm.includes('cuanto cuesta') ||
      norm.includes('honorarios') ||
      norm.includes('tarifa') ||
      norm.includes('cuanto cobra')
    ) {
      const p = DEFAULT_PRICING_CONFIG;
      const textResponse = [
        `Los honorarios médicos profesionales del ${siteConfig.doctorName} son claros y transparentes:`,
        ``,
        `• **${p.firstVisit.title}:** ${formatProfessionalFee(p.firstVisit.price)} (${p.firstVisit.duration})`,
        `• **${p.followUp.title}:** ${formatProfessionalFee(p.followUp.price)} (${p.followUp.duration})`,
        `• **${p.online.title}:** ${formatProfessionalFee(p.online.price)} (${p.online.duration})`,
        `• **${p.homeVisit.title}:** ${formatProfessionalFee(p.homeVisit.price, p.homeVisit.currency, true)} (sujeta a disponibilidad de zona)`,
        ``,
        `Formas de pago: ${p.paymentMethods.join(', ')}.`,
        `Si requieres factura fiscal (CFDI), se emite con gusto tras tu consulta.`,
        ``,
        `¿Deseas agendar alguna de estas modalidades?`,
      ].join('\n');

      addAssistantMessage(textResponse, 'quick_actions');
      return;
    }

    // 4. Location / Ubicación
    if (
      norm.includes('ubicacion') ||
      norm.includes('donde esta') ||
      norm.includes('direccion') ||
      norm.includes('donde queda') ||
      norm.includes('consultorio') ||
      norm.includes('queretaro')
    ) {
      addAssistantMessage(
        `El consultorio presencial del ${siteConfig.doctorName} se encuentra en la ciudad de **${siteConfig.city}**.\n\nPara pacientes fuera de Querétaro o que prefieran atención remota, se brinda consulta médica **En Línea (Telemedicina)** mediante videollamada confidencial con la misma dedicación clínica.\n\n¿Deseas revisar los horarios disponibles en alguna modalidad?`,
        'quick_actions',
      );
      return;
    }

    // 5. Booking / Agendar Cita
    if (
      norm.includes('agendar') ||
      norm.includes('reservar') ||
      norm.includes('sacar cita') ||
      norm.includes('hacer cita') ||
      norm.includes('quiero cita') ||
      norm.includes('nueva cita')
    ) {
      addAssistantMessage(
        `Con gusto. Puedo ayudarte a consultar la disponibilidad en tiempo real. ¿Qué tipo de consulta deseas agendar?`,
        'type_selection',
      );
      return;
    }

    // 6. Check Schedules / Ver Horarios
    if (
      norm.includes('horario') ||
      norm.includes('disponibilidad') ||
      norm.includes('cuando tiene') ||
      norm.includes('fechas') ||
      norm.includes('dias')
    ) {
      await handleShowRealSlots();
      return;
    }

    // 7. Manage / Reprogramar / Cancelar
    if (
      norm.includes('gestionar') ||
      norm.includes('cancelar') ||
      norm.includes('reprogramar') ||
      norm.includes('mover') ||
      norm.includes('mi cita') ||
      norm.includes('buscar cita') ||
      norm.includes('codigo') ||
      norm.startsWith('cit-')
    ) {
      // If code was pasted directly
      const matchCode = text.match(/CIT-[A-Z0-9]{4,8}/i);
      if (matchCode) {
        handleLookupAppointment(matchCode[0].toUpperCase());
      } else {
        addAssistantMessage(
          `Para consultar, reprogramar o cancelar tu cita, por favor ingresa tu código de cita (ejemplo: CIT-XXXXX) o el número de teléfono con el que agendaste:`,
          'manage_search',
        );
      }
      return;
    }

    // 8. Policy & Duration / Tolerancia
    if (
      norm.includes('tolerancia') ||
      norm.includes('puntualidad') ||
      norm.includes('cuanto dura') ||
      norm.includes('tiempo') ||
      norm.includes('politica')
    ) {
      addAssistantMessage(
        `La primera consulta médica tiene una duración aproximada de 50 minutos dedicados a escuchar con detenimiento y evaluar tu caso.\n\nContamos con una **tolerancia máxima de ${siteConfig.bookingSettings.gracePeriodMinutes || 15} minutos** de cortesía al inicio de tu consulta. Te sugerimos conectarte o llegar 5 minutos antes para aprovechar al máximo tu tiempo de atención.\n\nPara cancelaciones o cambios, agradecemos avisar con al menos 24 horas de antelación.`,
        'quick_actions',
      );
      return;
    }

    // 9. Personal medical advice / Clinical diagnosis safety
    if (
      norm.includes('siento') ||
      norm.includes('me duele') ||
      norm.includes('que tomo') ||
      norm.includes('que me recomienda') ||
      norm.includes('receta') ||
      norm.includes('medicamento') ||
      norm.includes('sintoma') ||
      norm.includes('diagnostico') ||
      norm.includes('enfermedad') ||
      norm.includes('presion') ||
      norm.includes('glucosa')
    ) {
      addAssistantMessage(
        `Puedo orientarte con información general sobre la atención, pero para valorar adecuadamente tu situación de salud es indispensable una consulta médica con el ${siteConfig.doctorName}.\n\nSi gustas, puedo ayudarte a revisar los próximos horarios disponibles para tu valoración.`,
        'quick_actions',
      );
      return;
    }

    // 10. Default fallback
    addAssistantMessage(
      `Puedo ayudarte con información sobre horarios disponibles, honorarios, ubicación de consultorio, agendar una consulta o gestionar una cita existente.\n\n¿Qué información necesitas?`,
      'quick_actions',
    );
  };

  // Helper: Query real upcoming availability slots from AvailabilityService (Single Source of Truth)
  const handleShowRealSlots = async (consultationType?: typeof bookingType) => {
    setIsTyping(true);
    try {
      const type = consultationType || {
        id: 'first-visit' as ConsultationTypeId,
        label: 'Primera consulta médica presencial',
        price: DEFAULT_PRICING_CONFIG.firstVisit.price,
        priceFormatted: formatProfessionalFee(DEFAULT_PRICING_CONFIG.firstVisit.price),
        durationMinutes: DEFAULT_PRICING_CONFIG.firstVisit.durationMinutes,
        durationLabel: DEFAULT_PRICING_CONFIG.firstVisit.duration,
      };

      setBookingType(type);

      const days = await availabilityService.current.getAvailability(
        new Date(),
        4,
        type.durationMinutes,
        type.id,
      );

      // Collect first 3 available slots
      const flatSlots: TimeSlot[] = [];
      for (const day of days) {
        for (const slot of day.slots) {
          if (slot.available) {
            flatSlots.push(slot);
            if (flatSlots.length >= 3) break;
          }
        }
        if (flatSlots.length >= 3) break;
      }

      setIsTyping(false);

      if (flatSlots.length === 0) {
        addAssistantMessage(
          `No localicé horarios libres inmediatos en los próximos días para esta modalidad. Puedes abrir el calendario completo o hablar directamente con el Dr. Mauricio por WhatsApp para coordinar un espacio.`,
          'handoff',
        );
      } else {
        addAssistantMessage(
          `Tengo estos próximos horarios disponibles en tiempo real para **${type.label}**:`,
          'slots_selection',
          { slots: flatSlots, type },
        );
      }
    } catch (err) {
      setIsTyping(false);
      addAssistantMessage(
        `Ocurrió un inconveniente al consultar la disponibilidad. Puedes revisar el calendario visual directamente.`,
        'quick_actions',
      );
    }
  };

  // Select Consultation Type in Chat
  const handleSelectType = (typeId: ConsultationTypeId) => {
    const p = DEFAULT_PRICING_CONFIG;
    let selected;
    if (typeId === 'first-visit') {
      selected = {
        id: 'first-visit' as ConsultationTypeId,
        label: 'Primera consulta médica presencial',
        price: p.firstVisit.price,
        priceFormatted: formatProfessionalFee(p.firstVisit.price),
        durationMinutes: p.firstVisit.durationMinutes,
        durationLabel: p.firstVisit.duration,
      };
    } else if (typeId === 'follow-up') {
      selected = {
        id: 'follow-up' as ConsultationTypeId,
        label: 'Consulta de seguimiento presencial',
        price: p.followUp.price,
        priceFormatted: formatProfessionalFee(p.followUp.price),
        durationMinutes: p.followUp.durationMinutes,
        durationLabel: p.followUp.duration,
      };
    } else {
      selected = {
        id: 'online' as ConsultationTypeId,
        label: 'Consulta médica en línea (Telemedicina)',
        price: p.online.price,
        priceFormatted: formatProfessionalFee(p.online.price),
        durationMinutes: p.online.durationMinutes,
        durationLabel: p.online.duration,
      };
    }

    setBookingType(selected);
    handleShowRealSlots(selected);
  };

  // Select Slot in Chat
  const handleSelectSlot = (slot: TimeSlot) => {
    setBookingSlot(slot);
    addAssistantMessage(
      `Has elegido el **${slot.fullDateLabel} a las ${slot.time} h**.\n\nPara completar tu reserva, por favor proporciona tus datos de contacto:`,
      'patient_form',
      { slot, type: bookingType },
    );
  };

  // Submit Patient Data in Chat
  const handleSubmitPatientForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!patientForm.firstName.trim()) errors.firstName = 'Ingresa tu nombre.';
    if (!patientForm.lastName.trim()) errors.lastName = 'Ingresa tus apellidos.';
    if (!patientForm.phone.trim() || patientForm.phone.replace(/[^0-9]/g, '').length < 10) {
      errors.phone = 'Ingresa un número telefónico de 10 dígitos.';
    }
    if (!patientForm.email.trim() || !patientForm.email.includes('@')) {
      errors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!patientForm.privacyConsent) {
      errors.privacyConsent = 'Es necesario aceptar el aviso de privacidad.';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    addAssistantMessage(
      `Por favor revisa los detalles antes de confirmar:`,
      'review_booking',
      {
        type: bookingType,
        slot: bookingSlot,
        patient: patientForm,
      },
    );
  };

  // Confirm Appointment in Chat (DATABASE -> GOOGLE CALENDAR -> WHATSAPP -> 2H REMINDER)
  const handleConfirmBookingInChat = async () => {
    if (!bookingSlot || !bookingType) return;

    setIsConfirmingBooking(true);
    try {
      // 1. Re-validate slot to prevent race conditions
      const isHeld = AppointmentsRepository.isSlotHeld(bookingSlot.isoString);
      if (isHeld) {
        setIsConfirmingBooking(false);
        addAssistantMessage(
          `Lo sentimos, ese espacio acaba de ser tomado. Por favor selecciona otro horario disponible.`,
          'quick_actions',
        );
        return;
      }

      const publicId = `CIT-${Date.now().toString(36).toUpperCase().slice(-5)}`;
      const token = `tok_${Math.random().toString(36).substring(2, 10)}`;

      const newRecord: AppointmentRecord = {
        id: `appt-${Date.now()}`,
        publicId,
        token,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        consultationTypeId: bookingType.id,
        consultationTypeTitle: bookingType.label,
        reasonId: 'consulta-general',
        reasonLabel: 'Consulta médica general',
        durationMinutes: bookingType.durationMinutes,
        durationLabel: bookingType.durationLabel,
        feeAmount: bookingType.price,
        feeFormatted: bookingType.priceFormatted,
        slotIso: bookingSlot.isoString,
        dateFormatted: bookingSlot.fullDateLabel,
        timeFormatted: bookingSlot.time,
        patient: {
          firstName: patientForm.firstName.trim(),
          lastName: patientForm.lastName.trim(),
          fullName: `${patientForm.firstName.trim()} ${patientForm.lastName.trim()}`,
          email: patientForm.email.trim().toLowerCase(),
          phone: patientForm.phone.trim(),
        },
        consents: {
          privacy: patientForm.privacyConsent,
          whatsappNotifications: patientForm.whatsappConsent,
        },
      };

      // 1. Save in persistent repository
      AppointmentsRepository.save(newRecord);

      // 2. Sync Google Calendar
      const gcalId = await notificationService.current.syncGoogleCalendar(newRecord);
      if (gcalId) {
        newRecord.googleCalendarEventId = gcalId;
        AppointmentsRepository.save(newRecord);
      }

      // 3. Dispatch WhatsApp notifications (Patient confirmation + Doctor alert)
      await Promise.allSettled([
        notificationService.current.notifyDoctor(newRecord),
        notificationService.current.notifyPatient(newRecord),
      ]);

      AppointmentsRepository.save(newRecord);

      setIsConfirmingBooking(false);

      addAssistantMessage(
        `¡Tu cita ha quedado confirmada exitosamente!\n\nCódigo de cita: **${newRecord.publicId}**\nEnviamos la confirmación por WhatsApp a **${newRecord.patient.phone}**.\n\nPuedes agregarla a tu calendario o gestionarla cuando lo requieras:`,
        'booking_confirmed',
        { appointment: newRecord },
      );
    } catch (err: any) {
      setIsConfirmingBooking(false);
      addAssistantMessage(
        `Ocurrió un inconveniente al confirmar la cita. Por favor intenta de nuevo o comunícate por WhatsApp con el Dr. Mauricio.`,
        'handoff',
      );
    }
  };

  // Lookup appointment by code or phone
  const handleLookupAppointment = (queryText: string) => {
    const q = queryText.trim().toLowerCase();
    if (!q) return;

    const all = AppointmentsRepository.getAll();
    const found = all.find(
      (a) =>
        a.publicId.toLowerCase() === q ||
        a.token.toLowerCase() === q ||
        normalizeWhatsAppNumber(a.patient.phone).includes(q.replace(/[^0-9]/g, '')) ||
        a.patient.email.toLowerCase() === q,
    );

    if (!found) {
      addAssistantMessage(
        `No encontré ninguna cita registrada con el dato «${queryText}». Si necesitas ayuda para localizarla, puedes comunicarte directamente con el Dr. Mauricio.`,
        'handoff',
      );
    } else {
      setSelectedManageAppointment(found);
      addAssistantMessage(
        `Localicé tu cita **${found.publicId}**. Estos son los detalles registrados:`,
        'appointment_card',
        { appointment: found },
      );
    }
  };

  // Cancel Appointment in Chat
  const handleConfirmCancellation = async (appointment: AppointmentRecord) => {
    setIsTyping(true);
    const updated = AppointmentsRepository.cancel(appointment.publicId, 'Cancelada por el paciente en el asistente digital');
    if (updated) {
      await notificationService.current.notifyCancelled(updated);
    }
    setIsTyping(false);
    addAssistantMessage(
      `Tu cita **${appointment.publicId}** programada para el ${appointment.dateFormatted} a las ${appointment.timeFormatted} h ha sido **cancelada**.\n\nSi deseas programar una nueva fecha en el futuro, con gusto te atenderemos.`,
      'quick_actions',
    );
  };

  const doctorWhatsappUrl = `https://wa.me/${siteConfig.doctorNotificationWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hola, Dr. Mauricio. Vengo desde su página web y necesito ayuda con mi cita.',
  )}`;

  return (
    <div className="flex h-full flex-col bg-[#F9F8F6]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[88%] sm:max-w-[82%]">
              {msg.sender === 'assistant' && (
                <div className="size-7 rounded-full bg-[#0A1624] text-[#B39A6A] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="size-4" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#0A1624] text-white rounded-br-none shadow-xs'
                    : 'bg-white text-obsidian border border-stone/80 rounded-bl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Quick Actions Chips */}
                {msg.type === 'quick_actions' && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-stone/50">
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Ver horarios')}
                      className="rounded-full border border-stone bg-[#F5F3EE] px-3 py-1.5 text-[11px] font-medium text-obsidian hover:bg-[#0A1624] hover:text-white transition-colors"
                    >
                      📅 Ver horarios
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Agendar consulta')}
                      className="rounded-full border border-stone bg-[#F5F3EE] px-3 py-1.5 text-[11px] font-medium text-obsidian hover:bg-[#0A1624] hover:text-white transition-colors"
                    >
                      📝 Agendar consulta
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Gestionar mi cita')}
                      className="rounded-full border border-stone bg-[#F5F3EE] px-3 py-1.5 text-[11px] font-medium text-obsidian hover:bg-[#0A1624] hover:text-white transition-colors"
                    >
                      🔍 Gestionar mi cita
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Honorarios')}
                      className="rounded-full border border-stone bg-[#F5F3EE] px-3 py-1.5 text-[11px] font-medium text-obsidian hover:bg-[#0A1624] hover:text-white transition-colors"
                    >
                      💳 Honorarios
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Ubicación')}
                      className="rounded-full border border-stone bg-[#F5F3EE] px-3 py-1.5 text-[11px] font-medium text-obsidian hover:bg-[#0A1624] hover:text-white transition-colors"
                    >
                      📍 Ubicación
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Hablar con el Dr. directamente')}
                      className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-900 hover:bg-emerald-100 transition-colors"
                    >
                      💬 Hablar con el Dr. directamente
                    </button>
                  </div>
                )}

                {/* Consultation Type Selection */}
                {msg.type === 'type_selection' && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-stone/50">
                    <button
                      type="button"
                      onClick={() => handleSelectType('first-visit')}
                      className="w-full text-left rounded-xl border border-stone p-2.5 bg-white hover:border-[#0A1624] hover:bg-[#F5F3EE] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-obsidian">Primera consulta presencial</span>
                        <span className="text-xs font-serif font-bold text-[#0D2235]">
                          {formatProfessionalFee(DEFAULT_PRICING_CONFIG.firstVisit.price)}
                        </span>
                      </div>
                      <span className="text-[11px] text-obsidian/60 block mt-0.5">
                        {DEFAULT_PRICING_CONFIG.firstVisit.duration} · Consultorio en Querétaro
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectType('follow-up')}
                      className="w-full text-left rounded-xl border border-stone p-2.5 bg-white hover:border-[#0A1624] hover:bg-[#F5F3EE] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-obsidian">Consulta de seguimiento</span>
                        <span className="text-xs font-serif font-bold text-[#0D2235]">
                          {formatProfessionalFee(DEFAULT_PRICING_CONFIG.followUp.price)}
                        </span>
                      </div>
                      <span className="text-[11px] text-obsidian/60 block mt-0.5">
                        {DEFAULT_PRICING_CONFIG.followUp.duration} · Consultorio en Querétaro
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectType('online')}
                      className="w-full text-left rounded-xl border border-stone p-2.5 bg-white hover:border-[#0A1624] hover:bg-[#F5F3EE] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-obsidian">Consulta médica en línea</span>
                        <span className="text-xs font-serif font-bold text-[#0D2235]">
                          {formatProfessionalFee(DEFAULT_PRICING_CONFIG.online.price)}
                        </span>
                      </div>
                      <span className="text-[11px] text-obsidian/60 block mt-0.5">
                        {DEFAULT_PRICING_CONFIG.online.duration} · Videollamada confidencial
                      </span>
                    </button>
                  </div>
                )}

                {/* Slots Selection (Real-Time availability) */}
                {msg.type === 'slots_selection' && msg.data?.slots && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-stone/50">
                    {msg.data.slots.map((slot: TimeSlot, idx: number) => (
                      <button
                        key={`${slot.isoString}-${idx}`}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        className="w-full flex items-center justify-between rounded-xl border border-stone/90 bg-[#F9F8F6] p-2.5 hover:border-[#0A1624] hover:bg-white transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="size-3.5 text-[#B39A6A]" />
                          <span className="text-xs font-medium text-obsidian">
                            {slot.fullDateLabel} · <strong>{slot.time} h</strong>
                          </span>
                        </div>
                        <span className="text-[11px] text-obsidian/70 group-hover:text-obsidian group-hover:translate-x-0.5 transition-all">
                          Elegir →
                        </span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={onOpenCalendar}
                      className="w-full text-center py-2 text-xs font-medium text-[#0D2235] hover:underline"
                    >
                      Ver todos los días y horarios en el calendario →
                    </button>
                  </div>
                )}

                {/* Patient Contact Form */}
                {msg.type === 'patient_form' && (
                  <form
                    onSubmit={handleSubmitPatientForm}
                    className="mt-3 space-y-3 pt-2 border-t border-stone/50"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-obsidian/70 uppercase tracking-wider mb-1">
                          Nombre
                        </label>
                        <input
                          type="text"
                          required
                          value={patientForm.firstName}
                          onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                          className="w-full rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs text-obsidian focus:border-[#0A1624] focus:outline-none"
                          placeholder="Tu nombre"
                        />
                        {formErrors.firstName && (
                          <span className="text-[10px] text-rose-600 block mt-0.5">{formErrors.firstName}</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-obsidian/70 uppercase tracking-wider mb-1">
                          Apellidos
                        </label>
                        <input
                          type="text"
                          required
                          value={patientForm.lastName}
                          onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                          className="w-full rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs text-obsidian focus:border-[#0A1624] focus:outline-none"
                          placeholder="Tus apellidos"
                        />
                        {formErrors.lastName && (
                          <span className="text-[10px] text-rose-600 block mt-0.5">{formErrors.lastName}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-obsidian/70 uppercase tracking-wider mb-1">
                        Teléfono WhatsApp (10 dígitos)
                      </label>
                      <input
                        type="tel"
                        required
                        value={patientForm.phone}
                        onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                        className="w-full rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs text-obsidian focus:border-[#0A1624] focus:outline-none"
                        placeholder="4421234567"
                      />
                      {formErrors.phone && (
                        <span className="text-[10px] text-rose-600 block mt-0.5">{formErrors.phone}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-obsidian/70 uppercase tracking-wider mb-1">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        required
                        value={patientForm.email}
                        onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                        className="w-full rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs text-obsidian focus:border-[#0A1624] focus:outline-none"
                        placeholder="tu@correo.com"
                      />
                      {formErrors.email && (
                        <span className="text-[10px] text-rose-600 block mt-0.5">{formErrors.email}</span>
                      )}
                    </div>

                    <div className="space-y-1 pt-1 text-[11px] text-obsidian/70">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={patientForm.privacyConsent}
                          onChange={(e) => setPatientForm({ ...patientForm, privacyConsent: e.target.checked })}
                          className="mt-0.5 rounded border-stone text-[#0A1624]"
                        />
                        <span>Acepto el aviso de privacidad y términos de atención médica.</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={patientForm.whatsappConsent}
                          onChange={(e) => setPatientForm({ ...patientForm, whatsappConsent: e.target.checked })}
                          className="mt-0.5 rounded border-stone text-[#0A1624]"
                        />
                        <span>Deseo recibir confirmación y recordatorios por WhatsApp.</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#0A1624] py-2 text-xs font-semibold text-white hover:bg-[#0D2235] transition-colors"
                    >
                      Continuar a revisión →
                    </button>
                  </form>
                )}

                {/* Review Booking Card */}
                {msg.type === 'review_booking' && msg.data && (
                  <div className="mt-3 space-y-3 pt-2 border-t border-stone/50">
                    <div className="rounded-xl border border-stone/80 bg-[#F5F3EE]/80 p-3 space-y-2 text-xs">
                      <div className="flex justify-between border-b border-stone/60 pb-1.5">
                        <span className="text-obsidian/60">Consulta:</span>
                        <span className="font-semibold text-obsidian">{msg.data.type?.label}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone/60 pb-1.5">
                        <span className="text-obsidian/60">Fecha y hora:</span>
                        <span className="font-semibold text-obsidian">
                          {msg.data.slot?.fullDateLabel} a las {msg.data.slot?.time} h
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone/60 pb-1.5">
                        <span className="text-obsidian/60">Paciente:</span>
                        <span className="font-semibold text-obsidian">
                          {msg.data.patient?.firstName} {msg.data.patient?.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone/60 pb-1.5">
                        <span className="text-obsidian/60">WhatsApp:</span>
                        <span className="font-semibold text-obsidian">{msg.data.patient?.phone}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone/60 pb-1.5">
                        <span className="text-obsidian/60">Honorarios:</span>
                        <span className="font-serif font-bold text-obsidian">{msg.data.type?.priceFormatted}</span>
                      </div>
                      <div className="text-[11px] text-obsidian/60 pt-0.5">
                        Tolerancia de inicio: {siteConfig.bookingSettings.gracePeriodMinutes || 15} minutos de cortesía.
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isConfirmingBooking}
                      onClick={handleConfirmBookingInChat}
                      className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors disabled:opacity-50"
                    >
                      {isConfirmingBooking ? 'Confirmando con el sistema...' : 'Confirmar y agendar cita'}
                    </button>
                  </div>
                )}

                {/* Booking Confirmed Card */}
                {msg.type === 'booking_confirmed' && msg.data?.appointment && (
                  <div className="mt-3 space-y-3 pt-2 border-t border-stone/50">
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <CheckCircle2 className="size-4" />
                        <span>Cita médica confirmada</span>
                      </div>
                      <p className="text-[11px] text-emerald-950/80">
                        Código de referencia: <strong>{msg.data.appointment.publicId}</strong>
                      </p>
                      <p className="text-[11px] text-emerald-950/80">
                        {msg.data.appointment.dateFormatted} a las {msg.data.appointment.timeFormatted} h
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href={`/cita/${msg.data.appointment.publicId}?token=${msg.data.appointment.token}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex-1 text-center rounded-lg border border-stone bg-white py-2 text-xs font-medium text-obsidian hover:bg-stone/20 transition-colors"
                      >
                        Gestionar cita →
                      </a>
                    </div>
                  </div>
                )}

                {/* Manage Search Input */}
                {msg.type === 'manage_search' && (
                  <div className="mt-3 flex gap-2 pt-2 border-t border-stone/50">
                    <input
                      type="text"
                      value={manageQuery}
                      onChange={(e) => setManageQuery(e.target.value)}
                      placeholder="CIT-XXXXX o teléfono"
                      className="flex-1 rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs text-obsidian focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleLookupAppointment(manageQuery)}
                      className="rounded-lg bg-[#0A1624] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0D2235]"
                    >
                      Buscar
                    </button>
                  </div>
                )}

                {/* Appointment Card with Cancel / Reschedule Options */}
                {msg.type === 'appointment_card' && msg.data?.appointment && (
                  <div className="mt-3 space-y-3 pt-2 border-t border-stone/50">
                    <div className="rounded-xl border border-stone bg-[#F5F3EE] p-3 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-obsidian/60">Código:</span>
                        <span className="font-mono font-bold text-obsidian">{msg.data.appointment.publicId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-obsidian/60">Estado:</span>
                        <span className={`font-semibold capitalize ${msg.data.appointment.status === 'confirmed' ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {msg.data.appointment.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-obsidian/60">Fecha:</span>
                        <span className="font-semibold text-obsidian">{msg.data.appointment.dateFormatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-obsidian/60">Hora:</span>
                        <span className="font-semibold text-obsidian">{msg.data.appointment.timeFormatted} h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-obsidian/60">Paciente:</span>
                        <span className="font-semibold text-obsidian">{msg.data.appointment.patient.fullName}</span>
                      </div>
                    </div>

                    {msg.data.appointment.status === 'confirmed' && (
                      <div className="flex gap-2">
                        <a
                          href={`/cita/${msg.data.appointment.publicId}?token=${msg.data.appointment.token}`}
                          className="flex-1 text-center rounded-lg border border-stone bg-white py-1.5 text-xs font-medium text-obsidian hover:bg-stone/20"
                        >
                          Reprogramar
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            addAssistantMessage(
                              `¿Confirmas que deseas cancelar definitivamente tu cita **${msg.data.appointment.publicId}** del ${msg.data.appointment.dateFormatted} a las ${msg.data.appointment.timeFormatted} h?`,
                              'cancel_confirm',
                              { appointment: msg.data.appointment },
                            );
                          }}
                          className="flex-1 rounded-lg border border-rose-200 bg-rose-50 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-100"
                        >
                          Cancelar cita
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Cancel Confirmation */}
                {msg.type === 'cancel_confirm' && msg.data?.appointment && (
                  <div className="mt-3 flex gap-2 pt-2 border-t border-stone/50">
                    <button
                      type="button"
                      onClick={() => handleConfirmCancellation(msg.data.appointment)}
                      className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800"
                    >
                      Sí, confirmar cancelación
                    </button>
                    <button
                      type="button"
                      onClick={() => addAssistantMessage('La cancelación ha sido descartada. Tu cita permanece activa.', 'quick_actions')}
                      className="rounded-lg border border-stone bg-white px-3 py-1.5 text-xs font-medium text-obsidian hover:bg-stone/20"
                    >
                      No cancelar
                    </button>
                  </div>
                )}

                {/* Human Doctor Handoff Card */}
                {msg.type === 'handoff' && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-stone/50">
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 text-xs space-y-1">
                      <p className="font-semibold text-emerald-900">Hablar con el Dr. directamente</p>
                      <p className="text-[11px] text-emerald-950/80">
                        Si prefieres comunicarte directamente con el {siteConfig.doctorName}, puedes continuar por WhatsApp.
                      </p>
                    </div>
                    <a
                      href={doctorWhatsappUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-emerald-800 transition-colors shadow-xs"
                    >
                      <MessageCircle className="size-4 text-emerald-200" />
                      <span>Abrir WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <span className="text-[9px] text-obsidian/40 mt-1 px-9">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-obsidian/60 italic px-2">
            <div className="size-6 rounded-full bg-[#0A1624] text-[#B39A6A] flex items-center justify-center shrink-0">
              <Bot className="size-3.5" />
            </div>
            <div className="flex items-center gap-1 bg-white border border-stone/70 rounded-full px-3 py-1.5">
              <span className="size-1.5 rounded-full bg-obsidian/50 animate-bounce" />
              <span className="size-1.5 rounded-full bg-obsidian/50 animate-bounce [animation-delay:0.2s]" />
              <span className="size-1.5 rounded-full bg-obsidian/50 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="border-t border-stone/70 bg-white p-3 sm:p-4 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe tu duda, pregunta por horarios, precios..."
          className="flex-1 rounded-xl border border-stone bg-[#F9F8F6] px-3.5 py-2 text-xs sm:text-sm text-obsidian focus:border-[#0A1624] focus:bg-white focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          aria-label="Enviar mensaje"
          className="rounded-xl bg-[#0A1624] p-2 sm:px-4 sm:py-2 text-white hover:bg-[#0D2235] disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <span className="hidden sm:inline">Enviar</span>
          <Send className="size-3.5" />
        </button>
      </form>
    </div>
  );
}
