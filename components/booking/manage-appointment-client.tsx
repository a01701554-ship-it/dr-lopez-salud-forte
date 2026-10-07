import { useState, useEffect } from 'react';
import { Container } from '@/components/site/container';
import { siteConfig } from '@/config/site';
import { AppointmentRecord } from '@/lib/calendar/types';
import { AppointmentsRepository } from '@/lib/calendar/appointments-repo';
import { AvailabilityService } from '@/lib/calendar/availability';
import { BookingNotificationService } from '@/lib/calendar/notifications';
import { AvailabilityCalendar } from '@/components/booking/availability-calendar';
import { TimeSlot, DayAvailability } from '@/lib/calendar/types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  ArrowLeft,
  CalendarCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { getClinicLocation } from '@/config/locations';

interface ManageAppointmentClientProps {
  publicId: string;
}

export function ManageAppointmentClient({ publicId }: ManageAppointmentClientProps) {
  const [appointment, setAppointment] = useState<AppointmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [managementSessionToken, setManagementSessionToken] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Calendar for rescheduling
  const [calendarStartDate, setCalendarStartDate] = useState<Date>(() => new Date());
  const [calendarDays, setCalendarDays] = useState<DayAvailability[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadAppointment = async () => {
      if (publicId !== 'administrar') {
        const found = AppointmentsRepository.getByPublicId(publicId);
        if (active) { setAppointment(found); setLoading(false); }
        return;
      }
      const rawToken = new URLSearchParams(window.location.search).get('token') || '';
      if (rawToken === 'admin') {
        window.location.replace('/admin/citas');
        return;
      }
      if (!rawToken) {
        if (active) { setLoadError('El enlace de acceso está incompleto.'); setLoading(false); }
        return;
      }
      const storageKey = `appointment-session:${rawToken.slice(-18)}`;
      try {
        let sessionToken = sessionStorage.getItem(storageKey) || '';
        const requestAppointment = async (session: string) => fetch('https://salud-forte-academy-api-preview.a01701554.workers.dev/api/appointments/manage', { headers: { Authorization: `AppointmentSession ${session}` }, cache: 'no-store' });
        let response = sessionToken ? await requestAppointment(sessionToken) : null;
        if (!response?.ok) {
          const exchange = await fetch('https://salud-forte-academy-api-preview.a01701554.workers.dev/api/appointments/manage/exchange', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: rawToken }) });
          const exchangeData = await exchange.json().catch(() => ({}));
          if (exchangeData.code === 'ADMIN_LINK_REQUIRES_LOGIN') {
            window.location.replace('/admin/citas');
            return;
          }
          if (!exchange.ok || !exchangeData.sessionToken) throw new Error(exchangeData.message || exchangeData.error || 'El enlace venció o ya no es válido.');
          sessionToken = exchangeData.sessionToken;
          sessionStorage.setItem(storageKey, sessionToken);
          response = await requestAppointment(sessionToken);
        }
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.appointment) throw new Error(data.message || data.error || 'No fue posible consultar la cita.');
        const item = data.appointment;
        const start = new Date(item.startsAt);
        const dateFormatted = new Intl.DateTimeFormat('es-MX', { timeZone: item.timezone || 'America/Mexico_City', weekday: 'long', day: 'numeric', month: 'long' }).format(start);
        const timeFormatted = new Intl.DateTimeFormat('es-MX', { timeZone: item.timezone || 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false }).format(start);
        const remote: AppointmentRecord = {
          id: item.id, publicId: item.publicId, token: rawToken, createdAt: new Date().toISOString(),
          status: String(item.status).includes('cancel') ? 'cancelled' : String(item.status).includes('resched') ? 'rescheduled' : 'confirmed',
          consultationTypeId: item.appointmentType?.slug || (item.modality === 'online' ? 'online' : 'first-visit'),
          consultationTypeTitle: item.appointmentType?.name || 'Consulta médica', locationId: item.locationId,
          locationName: getClinicLocation(item.locationId).name, addressSnapshot: getClinicLocation(item.locationId).address,
          consultationMode: item.modality === 'online' ? 'online' : 'in_person', reasonId: 'consulta-general', reasonLabel: 'Consulta médica',
          durationMinutes: item.appointmentType?.durationMinutes || 60, durationLabel: `${item.appointmentType?.durationMinutes || 60} minutos`,
          feeAmount: item.appointmentType?.priceMxn || 650, feeFormatted: `$${item.appointmentType?.priceMxn || 650} MXN`,
          slotIso: item.startsAt, dateFormatted, timeFormatted,
          patient: { firstName: item.patientName, lastName: item.patientLastName || '', fullName: `${item.patientName} ${item.patientLastName || ''}`.trim(), email: item.email, phone: item.phoneE164 },
          consents: { privacy: true, whatsappNotifications: true }, timezone: item.timezone || 'America/Mexico_City',
        };
        if (active) { setManagementSessionToken(sessionToken); setAppointment(remote); }
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : 'No fue posible consultar la cita.');
      } finally { if (active) setLoading(false); }
    };
    void loadAppointment();
    return () => { active = false; };
  }, [publicId]);

  // Load calendar when rescheduling is triggered
  useEffect(() => {
    if (!isRescheduling || !appointment) return;
    setSlotsLoading(true);
    const availabilityService = new AvailabilityService();

    availabilityService
      .getAvailability(calendarStartDate, 3, appointment.durationMinutes, appointment.consultationTypeId)
      .then((days) => {
        setCalendarDays(days);
        setSlotsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching reschedule availability:', err);
        setSlotsLoading(false);
      });
  }, [isRescheduling, calendarStartDate, appointment]);

  const handleConfirmCancel = async () => {
    if (!appointment) return;
    if (managementSessionToken) {
      const response = await fetch('https://salud-forte-academy-api-preview.a01701554.workers.dev/api/appointments/manage/cancel', { method: 'POST', headers: { Authorization: `AppointmentSession ${managementSessionToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: cancelReason }) });
      if (!response.ok) { setActionSuccess('No fue posible cancelar la cita. Inténtalo nuevamente.'); return; }
      setAppointment({ ...appointment, status: 'cancelled' }); setIsCancelling(false); setActionSuccess('Tu cita ha sido cancelada con éxito. El horario ha sido liberado.'); return;
    }
    const updated = AppointmentsRepository.cancel(appointment.publicId, cancelReason || 'Cancelado por el paciente');
    if (updated) {
      const notificationService = new BookingNotificationService();
      await notificationService.notifyCancelled(updated, cancelReason);
      setAppointment({ ...updated });
    }
    setIsCancelling(false);
    setActionSuccess('Tu cita ha sido cancelada con éxito. El horario ha sido liberado.');
  };

  const handleSelectNewSlot = async (slot: TimeSlot) => {
    if (!appointment) return;
    if (!slot.available) { setActionSuccess('Ese horario ya está reservado. Selecciona uno disponible en color verde.'); return; }
    if (managementSessionToken) {
      const response = await fetch('https://salud-forte-academy-api-preview.a01701554.workers.dev/api/appointments/manage/reschedule', { method: 'POST', headers: { Authorization: `AppointmentSession ${managementSessionToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ startsAt: slot.isoString }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setActionSuccess(data.message || data.error || 'No fue posible reprogramar la cita.'); return; }
      setAppointment({ ...appointment, status: 'rescheduled', slotIso: slot.isoString, dateFormatted: slot.fullDateLabel, timeFormatted: slot.time });
      setIsRescheduling(false); setActionSuccess(`Tu cita ha sido reprogramada para el ${slot.fullDateLabel} a las ${slot.time} h.`); return;
    }
    const prevDate = appointment.dateFormatted;
    const prevTime = appointment.timeFormatted;

    const updated = AppointmentsRepository.reschedule(
      appointment.publicId,
      slot.isoString,
      slot.fullDateLabel,
      slot.time,
    );
    if (updated) {
      const notificationService = new BookingNotificationService();
      await notificationService.notifyRescheduled(updated, prevDate, prevTime);
      setAppointment({ ...updated });
    }
    setIsRescheduling(false);
    setActionSuccess(`Tu cita ha sido reprogramada con éxito para el ${slot.fullDateLabel} a las ${slot.time} h.`);
  };

  if (loading) {
    return (
      <main className="bg-ivory py-20">
        <Container className="max-w-2xl text-center">
          <div className="size-8 border-2 border-[#0D2235] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-xs text-obsidian/60">Cargando información de tu cita...</p>
        </Container>
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="bg-ivory py-20">
        <Container className="max-w-xl text-center">
          <div className="rounded-2xl border border-stone bg-white p-8">
            <AlertCircle className="size-8 text-amber-600 mx-auto" />
            <h1 className="font-serif text-2xl text-obsidian mt-3">Cita no encontrada</h1>
            <p className="mt-2 text-xs text-obsidian/60 leading-relaxed">
              {loadError || <>No encontramos una cita médica asociada con este enlace seguro.</>}
            </p>
            <div className="mt-6">
              <Link
                href="/agendar"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0D2235] bg-[#0D2235] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE]"
              >
                <span>Agendar una nueva cita</span>
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main id="contenido-principal" className="bg-ivory py-12 sm:py-20">
      <Container className="max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-obsidian/70 hover:text-obsidian"
          >
            <ArrowLeft className="size-3.5" />
            <span>Volver al inicio</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone px-3 py-1 text-[11px] font-semibold text-obsidian">
            <ShieldCheck className="size-3 text-sage" />
            <span>Portal Seguro de Cita</span>
          </div>
        </div>

        {actionSuccess && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="rounded-2xl border border-stone/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone/50 gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage block">
                Detalle de consulta
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-obsidian mt-0.5">
                Código: {appointment.publicId}
              </h1>
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  appointment.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : appointment.status === 'rescheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-stone-200 text-stone-700'
                }`}
              >
                {appointment.status === 'confirmed' && 'Confirmada'}
                {appointment.status === 'rescheduled' && 'Reprogramada'}
                {appointment.status === 'cancelled' && 'Cancelada'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
                Médico
              </span>
              <span className="font-medium text-obsidian text-sm block mt-0.5">
                {siteConfig.doctorName}
              </span>
              <span className="text-obsidian/60 text-[11px]">
                {siteConfig.degreeName} · Cédula {siteConfig.professionalLicense}
              </span>
            </div>

            <div>
              <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
                Paciente
              </span>
              <span className="font-medium text-obsidian text-sm block mt-0.5">
                {appointment.patient.fullName}
              </span>
              <span className="text-obsidian/60 text-[11px]">
                {appointment.patient.phone} · {appointment.patient.email}
              </span>
            </div>

            <div>
              <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
                Fecha y Hora
              </span>
              <span className="font-serif text-base text-[#0D2235] capitalize block mt-0.5">
                {appointment.dateFormatted} · {appointment.timeFormatted} h
              </span>
            </div>

            <div>
              <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
                Tipo y Honorarios
              </span>
              <span className="font-medium text-obsidian text-sm block mt-0.5">
                {appointment.consultationTypeTitle}
              </span>
              <span className="text-[#0D2235] font-serif text-base block font-medium">
                {appointment.feeFormatted}
              </span>
            </div>

            {(() => {
              const loc = getClinicLocation(appointment.locationId);
              return (
                <div>
                  <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
                    Ubicación
                  </span>
                  <span className="font-medium text-obsidian text-sm block mt-0.5 flex items-center gap-1">
                    <MapPin className="size-3.5 text-[#B39A6A]" />
                    {loc.name}
                  </span>
                  <span className="text-xs text-obsidian/60 block mt-0.5 leading-tight">
                    {loc.isOnline ? loc.onlineInstructions : loc.address}
                  </span>
                  {!loc.isOnline && loc.googleMapsUrl && (
                    <a
                      href={loc.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[11px] font-medium text-[#B39A6A] hover:underline inline-flex items-center gap-0.5 mt-1"
                    >
                      Ver en Google Maps <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Action Buttons: Cancel / Reschedule */}
          {appointment.status !== 'cancelled' && !isRescheduling && !isCancelling && (
            <div className="border-t border-stone/50 pt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsRescheduling(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-stone bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-obsidian hover:border-[#0D2235] transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5 text-sage" />
                <span>Reprogramar fecha u hora</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCancelling(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-stone/80 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
              >
                <XCircle className="size-3.5" />
                <span>Cancelar consulta</span>
              </button>
            </div>
          )}

          {/* Cancellation modal / card */}
          {isCancelling && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 space-y-4">
              <h3 className="font-serif text-lg text-obsidian">Confirmar cancelación de consulta</h3>
              <p className="text-xs text-obsidian/70">
                Al cancelar, el horario será puesto a disposición de otros pacientes de inmediato.
              </p>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-obsidian/70 mb-1">
                  Motivo de cancelación (opcional)
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ej. Cambio de planes laborales"
                  className="w-full rounded-lg border border-stone bg-white px-3 py-2 text-xs text-obsidian"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCancelling(false)}
                  className="px-4 py-2 rounded-lg border border-stone text-xs font-semibold text-obsidian bg-white"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 rounded-lg bg-red-700 text-white text-xs font-semibold"
                >
                  Sí, cancelar cita
                </button>
              </div>
            </div>
          )}

          {/* Rescheduling Calendar View */}
          {isRescheduling && (
            <div className="rounded-xl border border-stone/80 bg-stone/[0.08] p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-stone/50">
                <h3 className="font-serif text-lg text-obsidian">Selecciona tu nuevo horario</h3>
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="text-xs font-semibold uppercase text-obsidian/60 hover:text-obsidian"
                >
                  Cerrar
                </button>
              </div>
              <AvailabilityCalendar
                days={calendarDays}
                loading={slotsLoading}
                onSelectSlot={handleSelectNewSlot}
                onPrevRange={() => {
                  const prev = new Date(calendarStartDate);
                  prev.setDate(prev.getDate() - 3);
                  setCalendarStartDate(prev);
                }}
                onNextRange={() => {
                  const next = new Date(calendarStartDate);
                  next.setDate(next.getDate() + 3);
                  setCalendarStartDate(next);
                }}
                canGoBack={calendarStartDate > new Date()}
              />
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
