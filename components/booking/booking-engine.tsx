import React, { useState, useEffect, useMemo } from 'react';
import { siteConfig } from '@/config/site';
import { usePricing } from '@/lib/pricing-store';
import { formatProfessionalFee } from '@/config/pricing';
import {
  ConsultationTypeId,
  ConsultationTypeOption,
  VISIT_REASONS,
  TimeSlot,
  DayAvailability,
  AppointmentRecord,
} from '@/lib/calendar/types';
import { AvailabilityService } from '@/lib/calendar/availability';
import { AppointmentsRepository } from '@/lib/calendar/appointments-repo';
import { BookingNotificationService } from '@/lib/calendar/notifications';
import { DoctorBookingPhoto } from './doctor-booking-photo';
import { ConsultationTypeSelect } from './consultation-type-select';
import { VisitReasonSelect } from './visit-reason-select';
import { NextAvailableSlots } from './next-available-slots';
import { AvailabilityCalendar } from './availability-calendar';
import { AppointmentSummary } from './appointment-summary';
import { BookingPatientForm, BookingFormData } from './booking-patient-form';
import { BookingReview } from './booking-review';
import { BookingConfirmation } from './booking-confirmation';
import { Shield, Sparkles, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';

type BookingStep =
  | 'type-and-slots'
  | 'calendar-view'
  | 'patient-data'
  | 'review'
  | 'confirmed';

interface BookingEngineProps {
  initialTypeId?: ConsultationTypeId;
  onStepChange?: (step: BookingStep) => void;
}

export function BookingEngine({ initialTypeId, onStepChange }: BookingEngineProps) {
  const { pricing } = usePricing();

  // 1. Build Consultation Types from reactive single source of truth (usePricing)
  const consultationTypes: ConsultationTypeOption[] = useMemo(() => {
    return [
      {
        id: 'first-visit',
        label: 'Primera consulta médica presencial',
        durationLabel: pricing.firstVisit.duration,
        durationMinutes: pricing.firstVisit.durationMinutes,
        priceFormatted: formatProfessionalFee(pricing.firstVisit.price),
        price: pricing.firstVisit.price,
        available: true,
      },
      {
        id: 'follow-up',
        label: 'Consulta de seguimiento presencial',
        durationLabel: pricing.followUp.duration,
        durationMinutes: pricing.followUp.durationMinutes,
        priceFormatted: formatProfessionalFee(pricing.followUp.price),
        price: pricing.followUp.price,
        available: true,
      },
      {
        id: 'online',
        label: 'Consulta médica en línea (Telemedicina)',
        durationLabel: pricing.online.duration,
        durationMinutes: 45,
        priceFormatted: formatProfessionalFee(pricing.online.price),
        price: pricing.online.price,
        available: pricing.onlineConsultationEnabled,
      },
      {
        id: 'home-visit',
        label: 'Consulta médica a domicilio',
        durationLabel: pricing.homeVisit.duration,
        durationMinutes: 60,
        priceFormatted: formatProfessionalFee(pricing.homeVisit.price),
        price: pricing.homeVisit.price,
        available: pricing.homeVisitEnabled,
        isHomeVisit: true,
      },
    ];
  }, [pricing]);

  // State Management
  const [selectedTypeId, setSelectedTypeId] = useState<ConsultationTypeId>(() => {
    if (initialTypeId && consultationTypes.some((t) => t.id === initialTypeId && t.available)) {
      return initialTypeId;
    }
    return 'first-visit';
  });

  const selectedType = useMemo(() => {
    return consultationTypes.find((t) => t.id === selectedTypeId) || consultationTypes[0];
  }, [consultationTypes, selectedTypeId]);

  // Filter reasons matching current type
  const availableReasons = useMemo(() => {
    return VISIT_REASONS.filter((r) => r.appliesTo.includes(selectedTypeId));
  }, [selectedTypeId]);

  const [selectedReasonId, setSelectedReasonId] = useState<string>(() => {
    return availableReasons[0]?.id || 'consulta-general';
  });

  // Whenever type changes, verify reason still belongs
  useEffect(() => {
    if (!availableReasons.some((r) => r.id === selectedReasonId)) {
      setSelectedReasonId(availableReasons[0]?.id || 'consulta-general');
    }
  }, [availableReasons, selectedReasonId]);

  const selectedReason = useMemo(() => {
    return (
      availableReasons.find((r) => r.id === selectedReasonId) ||
      availableReasons[0] || { id: 'consulta-general', label: 'Consulta médica general' }
    );
  }, [availableReasons, selectedReasonId]);

  // Step state
  const [step, setStep] = useState<BookingStep>('type-and-slots');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [activeHoldId, setActiveHoldId] = useState<string | undefined>(undefined);

  // Calendar dates navigation
  const [calendarStartDate, setCalendarStartDate] = useState<Date>(() => new Date());
  const [calendarDays, setCalendarDays] = useState<DayAvailability[]>([]);
  const [quickSlots, setQuickSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(true);

  // Patient Form State
  const [patientData, setPatientData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    privacyConsent: false,
    whatsappConsent: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<AppointmentRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Availability service singleton
  const availabilityService = useMemo(() => new AvailabilityService(), []);
  const notificationService = useMemo(() => new BookingNotificationService(), []);

  // Fetch slots whenever type or start date changes
  useEffect(() => {
    let isMounted = true;
    setSlotsLoading(true);

    async function loadAvailability() {
      try {
        const [nextSlots, days] = await Promise.all([
          availabilityService.getNextAvailableSlots(new Date(), 3, selectedType.durationMinutes),
          availabilityService.getAvailability(calendarStartDate, 3, selectedType.durationMinutes),
        ]);

        if (isMounted) {
          setQuickSlots(nextSlots);
          setCalendarDays(days);
          setSlotsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching calendar availability:', err);
          setSlotsLoading(false);
        }
      }
    }

    loadAvailability();
    return () => {
      isMounted = false;
    };
  }, [availabilityService, calendarStartDate, selectedType.durationMinutes]);

  // Handle slot selection (with 5-minute temporary hold)
  const handleSelectSlot = (slot: TimeSlot) => {
    // Release previous hold if any
    if (activeHoldId) {
      AppointmentsRepository.releaseHold(activeHoldId);
    }

    const holdResult = AppointmentsRepository.acquireHold(slot.isoString, 5);
    if (!holdResult.success) {
      setErrorMessage('Este horario fue seleccionado por otra persona hace un instante. Por favor elija otro.');
      return;
    }

    setActiveHoldId(holdResult.holdId);
    setSelectedSlot(slot);
    setErrorMessage(null);
    setStep('patient-data');
    if (onStepChange) onStepChange('patient-data');
  };

  // Calendar Pagination
  const handlePrevDays = () => {
    const prev = new Date(calendarStartDate);
    prev.setDate(prev.getDate() - 3);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (prev >= today) {
      setCalendarStartDate(prev);
    } else {
      setCalendarStartDate(today);
    }
  };

  const handleNextDays = () => {
    const next = new Date(calendarStartDate);
    next.setDate(next.getDate() + 3);
    setCalendarStartDate(next);
  };

  const canGoBack = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return calendarStartDate > today;
  }, [calendarStartDate]);

  // Form Validation & Progress to Review
  const handlePatientDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!patientData.firstName.trim()) {
      errors.firstName = 'Ingresa tu nombre.';
    }
    if (!patientData.lastName.trim()) {
      errors.lastName = 'Ingresa tus apellidos.';
    }
    if (!patientData.phone.trim() || patientData.phone.replace(/[^0-9]/g, '').length < 10) {
      errors.phone = 'Ingresa un número telefónico válido (mínimo 10 dígitos con lada).';
    }
    if (!patientData.email.trim() || !patientData.email.includes('@')) {
      errors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!patientData.privacyConsent) {
      errors.privacyConsent = 'Debes aceptar el aviso de privacidad para continuar.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setStep('review');
      if (onStepChange) onStepChange('review');
    }
  };

  // Final Confirmation: Save in repo + Google Calendar + WhatsApp
  const handleConfirmAppointment = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const publicId = `CIT-${Date.now().toString(36).toUpperCase().slice(-5)}`;
      const token = `tok_${Math.random().toString(36).substring(2, 10)}`;

      const newRecord: AppointmentRecord = {
        id: `appt-${Date.now()}`,
        publicId,
        token,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        consultationTypeId: selectedType.id,
        consultationTypeTitle: selectedType.label,
        reasonId: selectedReason.id,
        reasonLabel: selectedReason.label,
        durationMinutes: selectedType.durationMinutes,
        durationLabel: selectedType.durationLabel,
        feeAmount: selectedType.price,
        feeFormatted: selectedType.priceFormatted,
        slotIso: selectedSlot.isoString,
        dateFormatted: selectedSlot.fullDateLabel,
        timeFormatted: selectedSlot.time,
        patient: {
          firstName: patientData.firstName.trim(),
          lastName: patientData.lastName.trim(),
          fullName: `${patientData.firstName.trim()} ${patientData.lastName.trim()}`,
          email: patientData.email.trim().toLowerCase(),
          phone: patientData.phone.trim(),
        },
        consents: {
          privacy: patientData.privacyConsent,
          whatsappNotifications: patientData.whatsappConsent,
        },
      };

      // 1. Persistent Repository Save
      AppointmentsRepository.save(newRecord);

      // 2. Google Calendar Sync
      const gcalEventId = await notificationService.syncGoogleCalendar(newRecord);
      if (gcalEventId) {
        newRecord.googleCalendarEventId = gcalEventId;
        AppointmentsRepository.save(newRecord);
      }

      // 3. WhatsApp Dispatch (Doctor + Patient)
      await Promise.allSettled([
        notificationService.notifyDoctor(newRecord),
        notificationService.notifyPatient(newRecord),
      ]);

      // 4. Save updated WhatsApp delivery and reminder states in persistent repository
      AppointmentsRepository.save(newRecord);

      // Release hold
      if (activeHoldId) {
        AppointmentsRepository.releaseHold(activeHoldId);
      }

      setConfirmedAppointment(newRecord);
      setStep('confirmed');
      if (onStepChange) onStepChange('confirmed');
    } catch (err: any) {
      console.error('Error confirming appointment:', err);
      setErrorMessage('Ocurrió un inconveniente al confirmar su cita. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToNewBooking = () => {
    setSelectedSlot(null);
    setActiveHoldId(undefined);
    setConfirmedAppointment(null);
    setStep('type-and-slots');
    if (onStepChange) onStepChange('type-and-slots');
  };

  return (
    <div className="w-full">
      {errorMessage && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          <AlertCircle className="size-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Confirmation View */}
      {step === 'confirmed' && confirmedAppointment ? (
        <BookingConfirmation
          appointment={confirmedAppointment}
          onNewBooking={handleResetToNewBooking}
        />
      ) : (
        /* Multi-column or Step Container */
        <div className="space-y-6">
          {/* STEP 1: Type selection & Next Available Slots / Calendar View */}
          {step === 'type-and-slots' && (
            <div className="space-y-6">
              {/* Type and Reason Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ConsultationTypeSelect
                  types={consultationTypes}
                  selectedId={selectedTypeId}
                  onChange={(newId) => setSelectedTypeId(newId)}
                />
                <VisitReasonSelect
                  reasons={availableReasons}
                  selectedId={selectedReasonId}
                  onChange={(newId) => setSelectedReasonId(newId)}
                />
              </div>

              {/* Next Available Slots Section */}
              <div className="rounded-xl border border-stone/80 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone/50">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage block">
                      Disponibilidad inmediata
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl text-obsidian mt-0.5">
                      Próximos horarios disponibles
                    </h3>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-obsidian/50">
                    <Clock className="size-3 text-[#B39A6A]" /> Sincronización en tiempo real
                  </span>
                </div>

                <div className="mt-3">
                  <NextAvailableSlots
                    slots={quickSlots}
                    loading={slotsLoading}
                    onSelectSlot={handleSelectSlot}
                    onMoreSlots={() => setStep('calendar-view')}
                  />
                </div>
              </div>

              {/* Consultation Guarantee Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg border border-stone/60 bg-white p-3.5 text-xs">
                  <span className="font-semibold text-obsidian block text-[11px] uppercase tracking-wider">
                    Sin llamadas ni esperas
                  </span>
                  <p className="text-obsidian/60 text-[11px] mt-0.5">
                    Tu lugar queda reservado en firme al momento de elegir horario.
                  </p>
                </div>
                <div className="rounded-lg border border-stone/60 bg-white p-3.5 text-xs">
                  <span className="font-semibold text-obsidian block text-[11px] uppercase tracking-wider">
                    Honorarios transparentes
                  </span>
                  <p className="text-obsidian/60 text-[11px] mt-0.5">
                    Tarifa clara y fija de {selectedType.priceFormatted}. Sin cobros imprevistos.
                  </p>
                </div>
                <div className="rounded-lg border border-stone/60 bg-white p-3.5 text-xs">
                  <span className="font-semibold text-obsidian block text-[11px] uppercase tracking-wider">
                    Privacidad garantizada
                  </span>
                  <p className="text-obsidian/60 text-[11px] mt-0.5">
                    Tus datos son confidenciales y solo para la atención médica.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1.B: Expanded Calendar View */}
          {step === 'calendar-view' && (
            <div className="space-y-6">
              {/* Type and Reason Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone/60">
                <div>
                  <button
                    type="button"
                    onClick={() => setStep('type-and-slots')}
                    className="text-xs font-semibold uppercase tracking-wider text-[#0D2235] hover:text-obsidian flex items-center gap-1 cursor-pointer"
                  >
                    ← Volver a próximos horarios
                  </button>
                  <h3 className="font-serif text-2xl text-obsidian mt-1">
                    Selecciona tu fecha y horario preferido
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-stone/20 px-3 py-1 text-xs font-medium text-obsidian">
                    {selectedType.label}
                  </span>
                </div>
              </div>

              <AvailabilityCalendar
                days={calendarDays}
                loading={slotsLoading}
                selectedSlotIso={selectedSlot?.isoString}
                onSelectSlot={handleSelectSlot}
                onPrevRange={handlePrevDays}
                onNextRange={handleNextDays}
                canGoBack={canGoBack}
              />
            </div>
          )}

          {/* STEP 2: Patient Data Form */}
          {step === 'patient-data' && selectedSlot && (
            <div className="space-y-6">
              {/* Summary pill */}
              <AppointmentSummary
                dateLabel={selectedSlot.fullDateLabel}
                timeLabel={selectedSlot.time}
                consultationTitle={selectedType.label}
                reasonLabel={selectedReason.label}
                durationLabel={selectedType.durationLabel}
                feeFormatted={selectedType.priceFormatted}
              />

              {/* Form Card */}
              <div className="rounded-xl border border-stone/80 bg-white p-6 shadow-xs">
                <div className="border-b border-stone/50 pb-4 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage block">
                    Paso 2 de 3
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-obsidian mt-0.5">
                    Datos del paciente
                  </h3>
                  <p className="text-xs text-obsidian/60 mt-0.5">
                    Ingresa tus datos para registrar tu cita y enviarte el recordatorio oficial.
                  </p>
                </div>

                <BookingPatientForm
                  data={patientData}
                  errors={formErrors}
                  submitting={isSubmitting}
                  onChange={(field, value) => {
                    setPatientData((prev) => ({ ...prev, [field]: value }));
                    if (formErrors[field]) {
                      setFormErrors((prev) => {
                        const copy = { ...prev };
                        delete copy[field];
                        return copy;
                      });
                    }
                  }}
                  onSubmit={handlePatientDataSubmit}
                  onBack={() => setStep('type-and-slots')}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Review and Confirm */}
          {step === 'review' && selectedSlot && (
            <BookingReview
              dateLabel={selectedSlot.fullDateLabel}
              timeLabel={selectedSlot.time}
              consultationTitle={selectedType.label}
              reasonLabel={selectedReason.label}
              durationLabel={selectedType.durationLabel}
              feeFormatted={selectedType.priceFormatted}
              patient={patientData}
              confirming={isSubmitting}
              onConfirm={handleConfirmAppointment}
              onModify={() => setStep('patient-data')}
            />
          )}
        </div>
      )}
    </div>
  );
}
