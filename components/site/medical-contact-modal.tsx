import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Download,
  CalendarCheck,
  X,
  ArrowRight,
  MessageCircle,
  Bot,
} from 'lucide-react';
import {
  appointmentService,
  notificationService,
  MEDICAL_CONTACT_CONFIG,
  TimeSlot,
  AppointmentRecord,
} from '@/lib/medical-contact';
import { MedicalAssistantChat } from './medical-assistant-chat';

interface MedicalContactModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const DAYS_OF_WEEK = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export function MedicalContactModal({ id = 'medical-contact-modal', isOpen, onClose }: MedicalContactModalProps) {
  const [mounted, setMounted] = useState(false);

  // Available Tabs: 1) Asistente Digital (Default), 2) Horarios, 3) Agendar, 4) Hablar con el Dr. directamente
  const [activeTab, setActiveTab] = useState<'asistente' | 'horarios' | 'agendar' | 'whatsapp'>('asistente');

  // Interactive booking state
  const [scheduleStep, setScheduleStep] = useState<1 | 2 | 3>(1);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => new Date());

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Skip Sunday
    return d;
  });

  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [modality, setModality] = useState<'Presencial en consultorio' | 'En línea (Telemedicina)'>('Presencial en consultorio');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<AppointmentRecord | null>(null);

  // Mounted check & URL params check when modal opens
  useEffect(() => {
    setMounted(true);
    if (isOpen && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tipo = params.get('tipo') || params.get('type') || params.get('modalidad');
      if (tipo === 'online' || tipo === 'linea' || tipo === 'telemedicina' || tipo === 'consulta-linea') {
        setModality('En línea (Telemedicina)');
      }
    }
  }, [isOpen]);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Mobile Back Button / Popstate Historial Management
  useEffect(() => {
    if (!isOpen) return;

    // Push state to browser history to catch mobile physical "back button"
    window.history.pushState({ modalOpen: 'medical-contact' }, '');

    const handlePopState = (e: PopStateEvent) => {
      // Direct call onClose without triggering another history change
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen]);

  // Document body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Restore focus to contact trigger button upon closing
  useEffect(() => {
    if (!isOpen) {
      const trigger = document.querySelector('[data-contact-trigger="primary"]') as HTMLButtonElement | null;
      if (trigger) {
        trigger.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleClose = () => {
    // Sincronizar el historial si fue cerrado por botón X, Escape, o Backdrop
    if (typeof window !== 'undefined' && window.history.state?.modalOpen === 'medical-contact') {
      window.history.back();
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Calendar calculations
  const currentYear = calendarViewDate.getFullYear();
  const currentMonth = calendarViewDate.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Monday = 0, Sunday = 6
  let startingDay = firstDayOfMonth.getDay() - 1;
  if (startingDay === -1) startingDay = 6;

  const handlePrevMonth = () => {
    const prev = new Date(currentYear, currentMonth - 1, 1);
    const now = new Date();
    if (
      prev.getFullYear() < now.getFullYear() ||
      (prev.getFullYear() === now.getFullYear() && prev.getMonth() < now.getMonth())
    ) {
      return;
    }
    setCalendarViewDate(prev);
  };

  const handleNextMonth = () => {
    setCalendarViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Format date in Spanish (e.g. "Martes, 8 de Septiembre de 2026")
  const formatCapitalDate = (date: Date) => {
    const raw = date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return raw
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formattedSelectedDate = formatCapitalDate(selectedDate);

  // Available slots for selected date
  const getSlotsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return []; // Sunday closed
    if (dayOfWeek === 6) {
      return ['09:00', '10:00', '11:30', '12:30'];
    }
    return ['09:00', '10:00', '11:30', '13:00', '15:30', '16:30', '17:30'];
  };

  const availableTimeSlots = getSlotsForDate(selectedDate);

  // Handle appointment confirmation
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setBookingError('Por favor introduzca su nombre completo.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setBookingError('Por favor introduzca un número de teléfono o WhatsApp válido.');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const [hourStr, minStr] = selectedTime.split(':');
      const start = new Date(selectedDate);
      start.setHours(parseInt(hourStr, 10), parseInt(minStr, 10), 0, 0);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 50);

      const slotId = `slot-${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}-${selectedTime.replace(':', '')}`;
      const slot: TimeSlot = {
        id: slotId,
        start: start.toISOString(),
        end: end.toISOString(),
        formattedDate: formattedSelectedDate,
        formattedTime: `${selectedTime} hrs`,
        modality: modality.includes('En línea') ? 'en-linea' : 'presencial',
      };

      const idempotencyKey = `booking-${Date.now()}-${phoneNumber.replace(/[^0-9]/g, '')}`;

      const record = await appointmentService.confirmAppointment({
        patient: {
          fullName: patientName.trim(),
          phone: phoneNumber.trim(),
          notes: notes.trim() || undefined,
        },
        slot,
        idempotencyKey,
      });

      // Notify Dr. Mauricio Galindo via WhatsApp at +524421275952
      await notificationService.notifyDoctorNewAppointment(record);

      setConfirmedAppointment(record);
      setScheduleStep(3);
    } catch (err: any) {
      setBookingError(err.message || 'Ocurrió un inconveniente al apartar la cita. Por favor intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGoogleCalendarUrl = () => {
    if (!confirmedAppointment) return '#';
    const [hour, min] = selectedTime.split(':');
    const startYear = selectedDate.getFullYear();
    const startMonth = ('0' + (selectedDate.getMonth() + 1)).slice(-2);
    const startDay = ('0' + selectedDate.getDate()).slice(-2);
    const endHour = ('0' + (parseInt(hour, 10) + 1)).slice(-2);

    const startIso = `${startYear}${startMonth}${startDay}T${hour}${min}00`;
    const endIso = `${startYear}${startMonth}${startDay}T${endHour}${min}00`;

    const title = encodeURIComponent(
      `Consulta Médica: Dr. Mauricio Benjamín Galindo López - ${patientName}`,
    );
    const details = encodeURIComponent(
      `Consulta médica con el Dr. Mauricio Benjamín Galindo López (Cédula 15851723).\nPaciente: ${patientName}\nCódigo: ${confirmedAppointment.id}\nModalidad: ${modality}`,
    );
    const location = encodeURIComponent(
      modality.includes('En línea') ? 'Videoconsulta confidencial' : 'Consultorio Médico',
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  const downloadIcs = () => {
    if (!confirmedAppointment) return;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dr Mauricio Galindo//Consulta Medica//ES',
      'BEGIN:VEVENT',
      `SUMMARY:Consulta médica con Dr. Mauricio Galindo`,
      `DESCRIPTION:Dr. Mauricio Benjamín Galindo López (Cédula 15851723) - Paciente: ${patientName} - Código: ${confirmedAppointment.id}`,
      `LOCATION:${modality}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `cita-${confirmedAppointment.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const whatsappDirectUrl = `https://wa.me/524421275952?text=${encodeURIComponent(
    'Hola, Dr. Mauricio. Vengo desde su página web y necesito ayuda con mi cita.',
  )}`;

  return createPortal(
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#07182A]/70 p-0 md:p-6 backdrop-blur-md overflow-hidden"
    >
      <div className="relative flex w-full flex-col bg-ivory shadow-2xl overflow-hidden border border-[#B39A6A]/30 transition-all duration-300
                     md:max-w-[920px] md:h-[calc(100dvh-48px)] md:max-h-[760px] md:rounded-2xl
                     h-[100dvh] max-h-[100dvh] rounded-none inset-0">
        
        {/* Header - Fixed Height Sticky */}
        <div className="flex items-center justify-between border-b border-[#B39A6A]/20 bg-[#0A1624] px-5 py-3.5 text-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 id="modal-title" className="font-serif text-base sm:text-lg font-medium leading-none text-[#F5F3EE]">
                Contacto Médico
              </h3>
              <span className="rounded-full bg-emerald-950/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                Disponibilidad Activa
              </span>
            </div>
            <p className="mt-1 text-[11px] text-white/60">
              {MEDICAL_CONTACT_CONFIG.doctor.name} · Cédula {MEDICAL_CONTACT_CONFIG.doctor.license}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-champagne"
            aria-label="Cerrar contacto médico"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Action Tabs - Horizontal Scrollable Sticky */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-[#B39A6A]/20 bg-stone/30 px-4 py-2.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('asistente')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${
              activeTab === 'asistente'
                ? 'bg-[#0A1624] text-white shadow-xs'
                : 'text-obsidian/70 hover:bg-stone/50 hover:text-obsidian'
            }`}
          >
            <Bot className="size-3.5 text-[#B39A6A]" />
            <span>Asistente Digital</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('horarios');
              setScheduleStep(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${
              activeTab === 'horarios'
                ? 'bg-[#0A1624] text-white shadow-xs'
                : 'text-obsidian/70 hover:bg-stone/50 hover:text-obsidian'
            }`}
          >
            <Calendar className="size-3.5 animate-pulse" />
            <span>Ver horarios</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('agendar');
              setScheduleStep(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${
              activeTab === 'agendar'
                ? 'bg-[#0A1624] text-white shadow-xs'
                : 'text-obsidian/70 hover:bg-stone/50 hover:text-obsidian'
            }`}
          >
            <Clock className="size-3.5" />
            <span>Agendar cita</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-950 bg-emerald-500/10 hover:bg-emerald-500/20'
            }`}
          >
            <MessageCircle className="size-3.5 text-emerald-600" />
            <span>Hablar con el Dr. directamente</span>
          </button>
        </div>

        {/* Content Area - Independent Scroll */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#F9F8F6]">
          {/* TAB 1: ASISTENTE DIGITAL INTERACTIVO */}
          {activeTab === 'asistente' && (
            <div className="flex-1 overflow-hidden">
              <MedicalAssistantChat
                onOpenCalendar={() => {
                  setActiveTab('horarios');
                  setScheduleStep(1);
                }}
                onOpenDirectBooking={() => {
                  setActiveTab('agendar');
                  setScheduleStep(1);
                }}
                onOpenDoctorHandoff={() => {
                  setActiveTab('whatsapp');
                }}
              />
            </div>
          )}

          {/* TAB 2 & TAB 3: VER HORARIOS Y AGENDAR CITA */}
          {(activeTab === 'horarios' || activeTab === 'agendar') && (
            <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
              {/* STEP 1: Selección de Fecha y Horario */}
              {scheduleStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-serif text-2xl text-obsidian sm:text-3xl">
                      {activeTab === 'horarios' ? 'Horarios disponibles' : 'Paso 1: Elige fecha y hora'}
                    </h4>
                    <p className="mt-1.5 text-xs text-obsidian/65 sm:text-sm max-w-xl">
                      Consulta médica integral (50 minutos). Selecciona el día y el horario de tu preferencia en Querétaro o por Telemedicina.
                    </p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    {/* Calendar Widget */}
                    <div className="rounded-xl border border-stone bg-white p-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-stone/50 pb-3">
                        <span className="font-serif text-base font-semibold text-obsidian capitalize">
                          {MONTH_NAMES[currentMonth]} {currentYear}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            aria-label="Mes anterior"
                            className="rounded p-1.5 text-obsidian/70 hover:bg-stone/50 hover:text-obsidian transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            aria-label="Mes siguiente"
                            className="rounded p-1.5 text-obsidian/70 hover:bg-stone/50 hover:text-obsidian transition-colors cursor-pointer"
                          >
                            <ChevronRight className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold tracking-wider text-obsidian/50">
                        {DAYS_OF_WEEK.map((d) => (
                          <div key={d} className="py-1">
                            {d}
                          </div>
                        ))}
                      </div>

                      <div className="mt-1 grid grid-cols-7 gap-1 text-xs">
                        {Array.from({ length: startingDay }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-9" />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dayNum = i + 1;
                          const dateObj = new Date(currentYear, currentMonth, dayNum);
                          const isSunday = dateObj.getDay() === 0;

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isPast = dateObj < today;
                          const isSelected =
                            selectedDate.getDate() === dayNum &&
                            selectedDate.getMonth() === currentMonth &&
                            selectedDate.getFullYear() === currentYear;

                          const isDisabled = isPast || isSunday;

                          return (
                            <button
                              key={dayNum}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setSelectedDate(dateObj)}
                              className={`flex h-9 w-full items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0A1624] font-bold text-white shadow-xs'
                                  : isDisabled
                                    ? 'cursor-not-allowed text-stone-300'
                                    : 'text-obsidian hover:bg-stone/50'
                              }`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots Widget */}
                    <div className="flex flex-col justify-between rounded-xl border border-stone bg-white p-4 shadow-xs">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-sage">
                          Día seleccionado:
                        </p>
                        <h5 className="mt-1 font-serif text-lg font-medium text-obsidian">
                          {formattedSelectedDate}
                        </h5>

                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-obsidian/75">
                          Horarios disponibles:
                        </p>

                        {availableTimeSlots.length === 0 ? (
                          <div className="mt-4 rounded-lg bg-stone/30 p-3 text-center text-xs text-obsidian/60">
                            No hay consultas disponibles para este día (domingo o no laborable).
                          </div>
                        ) : (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {availableTimeSlots.map((time) => {
                              const isTimeSelected = selectedTime === time;
                              return (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => setSelectedTime(time)}
                                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all cursor-pointer ${
                                    isTimeSelected
                                      ? 'border-[#0A1624] bg-[#0A1624] text-white shadow-xs'
                                      : 'border-stone/80 bg-ivory/50 text-obsidian/85 hover:border-champagne hover:bg-white'
                                  }`}
                                >
                                  <Clock className="size-3" />
                                  <span>{time} hrs</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 border-t border-stone/50 pt-4">
                        <button
                          type="button"
                          disabled={availableTimeSlots.length === 0}
                          onClick={() => setScheduleStep(2)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0D2235] bg-[#0D2235] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE] transition-colors hover:bg-obsidian disabled:opacity-40 cursor-pointer"
                        >
                          <span>Continuar con este horario</span>
                          <ArrowRight className="size-3.5 text-champagne" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Datos del Paciente */}
              {scheduleStep === 2 && (
                <form onSubmit={handleConfirmBooking} className="flex flex-1 flex-col justify-between h-full space-y-6">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-stone/50 pb-3">
                      <div>
                        <h4 className="font-serif text-2xl text-obsidian sm:text-3xl">
                          Paso 2: Datos del paciente
                        </h4>
                        <p className="mt-1.5 text-xs text-obsidian/65">
                          {formattedSelectedDate} a las {selectedTime} hrs
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setScheduleStep(1)}
                        className="text-xs font-semibold text-champagne hover:underline cursor-pointer"
                      >
                        ← Cambiar horario
                      </button>
                    </div>

                    {bookingError && (
                      <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
                        {bookingError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/80">
                          Nombre completo del paciente *
                        </label>
                        <input
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="Ej. Roberto Sánchez Martínez"
                          className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3.5 py-2.5 text-xs text-obsidian focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/80">
                            Teléfono o WhatsApp *
                          </label>
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+52 442 123 4567"
                            className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3.5 py-2.5 text-xs text-obsidian focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/80">
                            Modalidad de consulta
                          </label>
                          <select
                            value={modality}
                            onChange={(e) => setModality(e.target.value as any)}
                            className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3.5 py-2.5 text-xs text-obsidian focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne cursor-pointer"
                          >
                            <option value="Presencial en consultorio">Presencial (Querétaro)</option>
                            <option value="En línea (Telemedicina)">En línea (Telemedicina)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/80">
                          Motivo principal o notas breves (opcional)
                        </label>
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Describa brevemente síntomas o motivo de consulta..."
                          className="mt-1.5 w-full rounded-lg border border-stone bg-white px-3.5 py-2 text-xs text-obsidian focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone/50 pt-4 flex items-center justify-between gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setScheduleStep(1)}
                      className="rounded-lg border border-stone px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-obsidian/75 hover:bg-stone/40 transition-colors cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg border border-[#0D2235] bg-[#0D2235] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE] transition-colors hover:bg-obsidian disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Apartando horario...' : 'Confirmar y agendar cita'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Confirmación Exitosa */}
              {scheduleStep === 3 && confirmedAppointment && (
                <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                  <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h4 className="font-serif text-2xl text-obsidian sm:text-3xl">
                    ¡Cita agendada con éxito!
                  </h4>
                  <p className="text-xs text-obsidian/70 sm:text-sm max-w-md">
                    Hemos reservado tu espacio con el Dr. Mauricio Benjamín Galindo López.
                  </p>

                  <div className="w-full max-w-md rounded-xl border border-stone bg-white p-5 text-left text-xs space-y-2.5 shadow-xs">
                    <div className="flex justify-between border-b border-stone/30 pb-2">
                      <span className="text-obsidian/60">Paciente:</span>
                      <span className="font-semibold text-obsidian">{patientName}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone/30 pb-2">
                      <span className="text-obsidian/60">Fecha:</span>
                      <span className="font-semibold text-obsidian">{formattedSelectedDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone/30 pb-2">
                      <span className="text-obsidian/60">Hora:</span>
                      <span className="font-semibold text-obsidian">{selectedTime} hrs</span>
                    </div>
                    <div className="flex justify-between border-b border-stone/30 pb-2">
                      <span className="text-obsidian/60">Modalidad:</span>
                      <span className="font-semibold text-obsidian">{modality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-obsidian/60">Código:</span>
                      <span className="font-mono font-bold text-champagne">{confirmedAppointment.id}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md pt-3">
                    <a
                      href={getGoogleCalendarUrl()}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#0D2235] bg-[#0D2235] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE] hover:bg-obsidian transition-colors cursor-pointer"
                    >
                      <CalendarCheck className="size-3.5" />
                      <span>Google Calendar</span>
                    </a>
                    <button
                      type="button"
                      onClick={downloadIcs}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-stone bg-white py-2.5 text-xs font-semibold uppercase tracking-wider text-obsidian hover:bg-stone/30 transition-colors cursor-pointer"
                    >
                      <Download className="size-3.5" />
                      <span>Descargar .ICS</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASISTENCIA DIRECTA VÍA WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 sm:p-8 text-center space-y-6">
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-xs animate-bounce">
                <MessageCircle className="size-9" />
              </div>

              <div className="space-y-2">
                <h4 className="font-serif text-2.5xl text-obsidian sm:text-3xl">
                  Hablar con el Dr. directamente
                </h4>
                <p className="max-w-md mx-auto text-xs leading-relaxed text-obsidian/75 sm:text-sm">
                  Si prefieres comunicarte directamente con el Dr. Mauricio Benjamín Galindo López, puedes continuar por WhatsApp.
                </p>
              </div>

              <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950 text-left space-y-2.5">
                <p className="font-bold flex items-center gap-2 text-emerald-900">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  Canal Oficial de WhatsApp: +52 442 127 5952
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  • Atención personalizada directamente con el médico.
                  <br />
                  • Los mensajes se responden a la brevedad conforme a la agenda clínica.
                </p>
              </div>

              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#20ba59] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                <MessageCircle className="size-4" />
                <span>ABRIR WHATSAPP</span>
              </a>

              <div className="flex items-center gap-2 text-[11px] text-obsidian/50 max-w-md justify-center">
                <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                <span>En caso de una urgencia médica con riesgo vital, llame al 911 de inmediato.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
