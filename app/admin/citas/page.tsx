'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Ban, CalendarClock, CalendarDays, CheckCircle2, ChevronRight, Clock3, Mail, MapPin, MessageCircle, Phone, RefreshCw, Search, ShieldCheck, Sparkles, UserRound, Video, X } from 'lucide-react';
import { Container } from '@/components/site/container';
import { AccountHeader } from '@/components/account/account-nav';
import { useAuth } from '@/lib/auth/auth-context';
import { getClinicLocation } from '@/config/locations';

const API = 'https://salud-forte-academy-api-preview.a01701554.workers.dev';
const OWNER_EMAIL = 'a01701554@gmail.com';
const TIME_ZONE = 'America/Mexico_City';

type Appointment = {
  id: string; publicId: string; patientName: string; patientLastName?: string;
  email: string; phoneE164: string; modality: string; locationId?: string;
  startsAt: string; endsAt: string; timezone?: string; status: string;
  appointmentType?: { slug?: string; name?: string; durationMinutes?: number; priceMxn?: number };
  whatsappStatus?: string; whatsappError?: string;
};

type AvailableSlot = { isoString: string; time: string; fullDateLabel: string; available?: boolean };
type AvailabilityDay = { date: string; dayName: string; dayNumber: number; monthLong: string; slots: AvailableSlot[] };

const dateKey = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date(iso));
const dayLabel = (iso: string) => new Intl.DateTimeFormat('es-MX', { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
const shortDayLabel = (iso: string) => new Intl.DateTimeFormat('es-MX', { timeZone: TIME_ZONE, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso));
const timeLabel = (iso: string) => new Intl.DateTimeFormat('es-MX', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(iso));

export default function AdminAppointmentsPage() {
  const { user, isLoading: authLoading, isAuthenticated, isAdmin, fetchWithAuth } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [actionMode, setActionMode] = useState<'reschedule' | 'cancel' | null>(null);
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');
  const allowed = !!user && (user.email.toLowerCase() === OWNER_EMAIL || isAdmin);
  const today = dateKey(new Date().toISOString());

  const load = useCallback(async () => {
    if (!allowed) return;
    setLoading(true); setError('');
    try {
      const response = await fetchWithAuth(`${API}/api/admin/appointments`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || 'No fue posible cargar las citas.');
      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible cargar las citas.');
    } finally { setLoading(false); }
  }, [allowed, fetchWithAuth]);

  useEffect(() => { void load(); }, [load]);

  const openReschedule = async (appointment: Appointment) => {
    setEditingAppointment(appointment); setActionMode('reschedule'); setSelectedSlot(null); setActionError(''); setAvailabilityDays([]);
    setAvailabilityLoading(true);
    try {
      const from = dateKey(new Date().toISOString());
      const end = new Date(); end.setDate(end.getDate() + 30);
      const params = new URLSearchParams({ appointment_type: appointment.appointmentType?.slug || (appointment.modality === 'online' ? 'online' : 'first-visit'), timezone: TIME_ZONE, from, to: dateKey(end.toISOString()) });
      const response = await fetch(`${API}/api/appointments/availability?${params}`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'No fue posible consultar los horarios disponibles.');
      setAvailabilityDays((data.days || []).map((day: AvailabilityDay) => ({ ...day, slots: (day.slots || []).filter((slot) => slot.available !== false) })).filter((day: AvailabilityDay) => day.slots.length > 0));
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No fue posible consultar los horarios disponibles.');
    } finally { setAvailabilityLoading(false); }
  };

  const openCancel = (appointment: Appointment) => {
    setEditingAppointment(appointment); setActionMode('cancel'); setCancelReason(''); setActionError('');
  };

  const closeAction = () => {
    setEditingAppointment(null); setActionMode(null); setSelectedSlot(null); setCancelReason(''); setActionError('');
  };

  const confirmAction = async () => {
    if (!editingAppointment || !actionMode) return;
    if (actionMode === 'reschedule' && !selectedSlot) { setActionError('Selecciona el nuevo día y horario.'); return; }
    setActionLoading(true); setActionError('');
    try {
      const endpoint = actionMode === 'reschedule'
        ? `${API}/api/admin/appointments/${editingAppointment.id}/reschedule`
        : `${API}/api/admin/appointments/${editingAppointment.id}/status`;
      const body = actionMode === 'reschedule'
        ? { startsAt: selectedSlot?.isoString }
        : { status: 'cancelled_by_admin', reason: cancelReason.trim() || 'Cancelada a solicitud del paciente' };
      const response = await fetchWithAuth(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'No fue posible actualizar la cita.');
      const name = `${editingAppointment.patientName} ${editingAppointment.patientLastName || ''}`.trim();
      setSuccess(actionMode === 'reschedule' ? `La cita de ${name} se reprogramó correctamente.` : `La cita de ${name} fue cancelada y el horario quedó disponible.`);
      closeAction();
      await load();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No fue posible actualizar la cita.');
    } finally { setActionLoading(false); }
  };

  const activeAppointments = useMemo(() => appointments
    .filter((item) => !['CANCELLED', 'cancelled_by_patient', 'cancelled_by_admin'].includes(item.status))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()), [appointments]);

  const dateGroups = useMemo(() => activeAppointments.reduce<Record<string, Appointment[]>>((result, item) => {
    (result[dateKey(item.startsAt)] ||= []).push(item); return result;
  }, {}), [activeAppointments]);
  const dateKeys = useMemo(() => Object.keys(dateGroups).sort(), [dateGroups]);
  const upcomingDates = dateKeys.filter((key) => key >= today);

  useEffect(() => {
    if (selectedDate === 'today') setSelectedDate(dateGroups[today] ? today : (upcomingDates[0] || dateKeys[0] || today));
  }, [dateGroups, dateKeys, selectedDate, today, upcomingDates]);

  const visibleAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = selectedDate === 'all' ? activeAppointments : (dateGroups[selectedDate] || []);
    return base.filter((item) => !query || `${item.patientName} ${item.patientLastName || ''} ${item.email} ${item.phoneE164} ${item.publicId}`.toLowerCase().includes(query));
  }, [activeAppointments, dateGroups, search, selectedDate]);

  const visibleGroups = useMemo(() => visibleAppointments.reduce<Record<string, Appointment[]>>((result, item) => {
    (result[dateKey(item.startsAt)] ||= []).push(item); return result;
  }, {}), [visibleAppointments]);

  if (authLoading) return <main className="min-h-[70vh] bg-[#f8f6f1] py-16"><Container><p>Cargando acceso seguro…</p></Container></main>;
  if (!isAuthenticated) return <main className="min-h-[70vh] bg-[#f8f6f1] py-16"><Container className="max-w-2xl"><section className="rounded-3xl border border-[#e6ddcb] bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto mb-4 h-12 w-12 text-[#b6975d]" /><h1 className="font-serif text-4xl text-[#0c2538]">Panel privado de citas</h1><p className="mt-4 text-gray-600">Inicia sesión con <strong>{OWNER_EMAIL}</strong> para consultar tu agenda.</p><Link href="/cuenta/iniciar-sesion?redirect=/admin/citas" className="mt-7 inline-flex rounded-full bg-[#0c2538] px-7 py-3 font-semibold text-white">Iniciar sesión</Link></section></Container></main>;
  if (!allowed) return <main className="min-h-[70vh] bg-[#f8f6f1] py-16"><Container><div className="rounded-2xl border bg-white p-8"><h1 className="font-serif text-3xl text-[#0c2538]">Acceso restringido</h1><p className="mt-3 text-gray-600">Esta sección es exclusiva del administrador autorizado.</p></div></Container></main>;

  const todayCount = dateGroups[today]?.length || 0;
  const upcomingCount = activeAppointments.filter((item) => new Date(item.startsAt).getTime() >= Date.now()).length;

  return <div className="min-h-screen bg-[linear-gradient(180deg,#faf8f3_0%,#f5f1e9_100%)]">
    <AccountHeader currentTab="citas" />
    <main className="py-9 sm:py-14"><Container>
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-[#dfd2bc] bg-[#0c2538] p-6 text-white shadow-[0_24px_70px_rgba(12,37,56,.15)] sm:p-9">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d6bb84]/30 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.22em] text-[#d6bb84]"><ShieldCheck className="h-4 w-4" /> Área clínica privada</div><h1 className="font-serif text-4xl sm:text-6xl">Agenda de pacientes</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">Consulta cada jornada, horario y ubicación desde un solo panel confidencial.</p></div>
          <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Actualizar agenda</button>
        </div>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Summary label="Citas registradas" value={activeAppointments.length} active={selectedDate === 'all'} onClick={() => setSelectedDate('all')} icon={<CalendarDays />} />
        <Summary label="Citas de hoy" value={todayCount} active={selectedDate === today} onClick={() => setSelectedDate(today)} icon={<Clock3 />} />
        <Summary label="Próximas citas" value={upcomingCount} active={selectedDate === upcomingDates[0] && selectedDate !== today} onClick={() => setSelectedDate(upcomingDates.find((key) => key > today) || upcomingDates[0] || today)} icon={<Sparkles />} />
      </div>

      {dateKeys.length > 0 && <section className="mb-7 rounded-3xl border border-[#e4dac8] bg-white/90 p-4 shadow-sm sm:p-5">
        <div className="mb-3"><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9b7b42]">Selecciona una fecha</p><p className="mt-1 text-sm text-gray-500">Cada día muestra sus pacientes en orden de horario.</p></div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dateKeys.map((key) => { const first = dateGroups[key][0]; const active = selectedDate === key; return <button key={key} onClick={() => setSelectedDate(key)} className={`min-w-[165px] rounded-2xl border p-4 text-left transition ${active ? 'border-[#0c2538] bg-[#0c2538] text-white shadow-lg' : 'border-[#e6ddcb] bg-[#fbfaf7] text-[#0c2538] hover:border-[#b6975d]'}`}><span className={`block text-[10px] font-bold uppercase tracking-[.16em] ${active ? 'text-[#d8c39a]' : 'text-[#9b7b42]'}`}>{key === today ? 'Hoy' : 'Agenda'}</span><span className="mt-1 block font-serif text-lg capitalize">{shortDayLabel(first.startsAt)}</span><span className={`mt-2 flex items-center justify-between text-xs ${active ? 'text-white/70' : 'text-gray-500'}`}><span>{dateGroups[key].length} {dateGroups[key].length === 1 ? 'cita' : 'citas'}</span><ChevronRight className="size-4" /></span></button>; })}
        </div>
      </section>}

      <div className="mb-8 rounded-2xl border border-[#e4dac8] bg-white p-3 shadow-sm"><label className="relative block" htmlFor="appointment-search"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9b7b42]" /><input id="appointment-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por paciente, correo, teléfono o folio…" className="w-full rounded-xl border border-[#e5ddd0] bg-[#fbfaf7] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#b6975d] focus:ring-2 focus:ring-[#b6975d]/15" /></label></div>
      {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">{error}</div>}
      {success && <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"><span className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-5" />{success}</span><button onClick={() => setSuccess('')} aria-label="Cerrar aviso"><X className="size-4" /></button></div>}
      {!loading && !error && visibleAppointments.length === 0 && <div className="rounded-3xl border border-[#e6ddcb] bg-white p-12 text-center"><CalendarDays className="mx-auto h-12 w-12 text-[#b6975d]" /><h2 className="mt-4 font-serif text-3xl text-[#0c2538]">No hay citas para esta fecha</h2><p className="mt-2 text-gray-600">Selecciona otro día de la agenda para consultar sus pacientes.</p></div>}

      <div className="space-y-10">
        {Object.entries(visibleGroups).sort(([a], [b]) => a.localeCompare(b)).map(([key, items]) => <section key={key}>
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-[#d9c9aa] pb-3"><div><span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9b7b42]">Jornada clínica</span><h2 className="mt-1 flex items-center gap-3 font-serif text-2xl capitalize text-[#0c2538] sm:text-3xl"><CalendarDays className="h-6 w-6 text-[#b6975d]" />{dayLabel(items[0].startsAt)}</h2></div><span className="rounded-full bg-[#0c2538] px-3 py-1 text-xs font-bold text-white">{items.length} {items.length === 1 ? 'cita' : 'citas'}</span></div>
          <div className="grid gap-4">{items.map((item, index) => <AppointmentCard key={item.id} appointment={item} order={index + 1} onReschedule={openReschedule} onCancel={openCancel} />)}</div>
        </section>)}
      </div>
      <p className="mt-10 flex items-center gap-2 text-sm text-gray-500"><ShieldCheck className="h-4 w-4" />Información clínica confidencial y protegida.</p>
    </Container></main>
    {editingAppointment && actionMode && <AppointmentActionModal appointment={editingAppointment} mode={actionMode} days={availabilityDays} loadingDays={availabilityLoading} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} cancelReason={cancelReason} onCancelReason={setCancelReason} error={actionError} saving={actionLoading} onClose={closeAction} onConfirm={() => void confirmAction()} />}
  </div>;
}

function Summary({ label, value, active, onClick, icon }: { label: string; value: number; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return <button onClick={onClick} className={`group rounded-3xl border p-5 text-left shadow-sm transition ${active ? 'border-[#0c2538] bg-[#0c2538] text-white shadow-lg' : 'border-[#e4dac8] bg-white text-[#0c2538] hover:-translate-y-0.5 hover:border-[#b6975d]'}`}><div className="flex items-center justify-between"><p className={`text-xs font-bold uppercase tracking-[.14em] ${active ? 'text-[#d8c39a]' : 'text-gray-500'}`}>{label}</p>{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `h-5 w-5 ${active ? 'text-[#d8c39a]' : 'text-[#b6975d]'}` })}</div><div className="mt-3 flex items-end justify-between"><p className="font-serif text-5xl">{value}</p><span className={`flex items-center gap-1 text-xs font-semibold ${active ? 'text-white/70' : 'text-[#9b7b42]'}`}>Ver detalle <ChevronRight className="size-4" /></span></div></button>;
}

function AppointmentCard({ appointment: item, order, onReschedule, onCancel }: { appointment: Appointment; order: number; onReschedule: (appointment: Appointment) => void; onCancel: (appointment: Appointment) => void }) {
  const fullName = `${item.patientName} ${item.patientLastName || ''}`.trim();
  const location = getClinicLocation(item.locationId || item.modality);
  const cancelled = ['CANCELLED', 'cancelled_by_patient', 'cancelled_by_admin'].includes(item.status);
  const status = cancelled ? 'Cancelada' : item.status === 'COMPLETED' || item.status === 'completed' ? 'Completada' : 'Confirmada';
  const whatsAppOk = ['sent', 'delivered', 'read', 'accepted'].includes(String(item.whatsappStatus || '').toLowerCase());
  return <article className="overflow-hidden rounded-[1.75rem] border border-[#e2d7c4] bg-white shadow-[0_12px_35px_rgba(12,37,56,.07)]">
    <div className="grid lg:grid-cols-[190px_1fr]">
      <div className="flex flex-row items-center justify-between bg-[#0c2538] p-5 text-white lg:flex-col lg:items-start lg:justify-center lg:p-7"><div><span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d8c39a]">Cita {String(order).padStart(2, '0')}</span><div className="mt-2 flex items-baseline gap-2 lg:block"><p className="text-3xl font-bold">{timeLabel(item.startsAt)}</p><p className="text-sm text-white/55 lg:mt-1">a {timeLabel(item.endsAt)}</p></div></div><Clock3 className="size-7 text-[#d8c39a]/70" /></div>
      <div className="p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-serif text-2xl text-[#0c2538] sm:text-3xl">{fullName}</h3><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${cancelled ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{status}</span></div><p className="mt-1 font-mono text-xs text-gray-400">{item.publicId}</p></div><div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${whatsAppOk ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{whatsAppOk ? <CheckCircle2 className="size-4" /> : <MessageCircle className="size-4" />} WhatsApp {whatsAppOk ? 'enviado' : item.whatsappStatus || 'pendiente'}</div></div>
        <div className="mt-6 grid gap-5 border-t border-[#eee7db] pt-5 md:grid-cols-2 xl:grid-cols-3"><Detail icon={<UserRound />} label="Consulta" value={item.appointmentType?.name || 'Consulta médica'} /><Detail icon={<Mail />} label="Correo" value={item.email} /><Detail icon={<Phone />} label="WhatsApp" value={item.phoneE164} /><Detail icon={location.isOnline ? <Video /> : <MapPin />} label={location.isOnline ? 'Modalidad' : 'Lugar'} value={location.name} /><Detail icon={<MapPin />} label={location.isOnline ? 'Acceso' : 'Dirección'} value={location.isOnline ? 'La liga de videollamada se enviará por correo.' : (location.address || 'Ubicación por confirmar')} /></div>
        {item.whatsappError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">Notificación: {item.whatsappError}</p>}
        {!cancelled && <div className="mt-6 flex flex-col gap-3 border-t border-[#eee7db] pt-5 sm:flex-row"><button onClick={() => onReschedule(item)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0c2538] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#153b55]"><CalendarClock className="size-4" />Cambiar fecha y horario</button><button onClick={() => onCancel(item)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"><Ban className="size-4" />Cancelar cita</button></div>}
      </div>
    </div>
  </article>;
}

function AppointmentActionModal({ appointment, mode, days, loadingDays, selectedSlot, onSelectSlot, cancelReason, onCancelReason, error, saving, onClose, onConfirm }: { appointment: Appointment; mode: 'reschedule' | 'cancel'; days: AvailabilityDay[]; loadingDays: boolean; selectedSlot: AvailableSlot | null; onSelectSlot: (slot: AvailableSlot) => void; cancelReason: string; onCancelReason: (value: string) => void; error: string; saving: boolean; onClose: () => void; onConfirm: () => void }) {
  const fullName = `${appointment.patientName} ${appointment.patientLastName || ''}`.trim();
  return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#071622]/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
    <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border border-[#d8c6a6] bg-[#faf8f3] shadow-2xl sm:rounded-[2rem]">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0c2538] p-6 text-white sm:p-8"><div><span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d8c39a]">Gestión privada de consulta</span><h2 className="mt-1 font-serif text-3xl">{mode === 'reschedule' ? 'Reprogramar cita' : 'Cancelar cita'}</h2><p className="mt-2 text-sm text-white/65">{fullName} · {appointment.publicId}</p></div><button onClick={onClose} disabled={saving} className="rounded-full border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/15" aria-label="Cerrar"><X className="size-5" /></button></header>
      <div className="p-6 sm:p-8">
        <div className="mb-6 grid gap-3 rounded-2xl border border-[#e2d7c4] bg-white p-4 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Horario actual</p><p className="mt-1 font-serif text-xl capitalize text-[#0c2538]">{dayLabel(appointment.startsAt)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Hora</p><p className="mt-1 text-lg font-bold text-[#0c2538]">{timeLabel(appointment.startsAt)} – {timeLabel(appointment.endsAt)}</p></div></div>
        {mode === 'reschedule' ? <>
          <div className="mb-5"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#9b7b42]">Selecciona el nuevo horario</p><p className="mt-1 text-sm text-gray-600">Solo aparecen espacios disponibles; el cambio se validará nuevamente antes de guardarse.</p></div>
          {loadingDays ? <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#e2d7c4] bg-white p-10 text-[#0c2538]"><RefreshCw className="size-5 animate-spin" />Consultando agenda…</div> : days.length === 0 ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">No hay horarios disponibles durante los próximos 30 días.</div> : <div className="space-y-4">{days.map((day) => <div key={day.date} className="rounded-2xl border border-[#e2d7c4] bg-white p-4"><h3 className="font-serif text-xl capitalize text-[#0c2538]">{day.dayName}, {day.dayNumber} de {day.monthLong}</h3><div className="mt-3 flex flex-wrap gap-2">{day.slots.map((slot) => { const active = selectedSlot?.isoString === slot.isoString; return <button key={slot.isoString} onClick={() => onSelectSlot(slot)} className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${active ? 'border-[#0c2538] bg-[#0c2538] text-white shadow-md' : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-500'}`}>{slot.time} h</button>; })}</div></div>)}</div>}
          {selectedSlot && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><strong>Nuevo horario:</strong> <span className="capitalize">{selectedSlot.fullDateLabel}</span> a las {selectedSlot.time} h.</div>}
        </> : <>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5"><div className="flex gap-3"><Ban className="mt-0.5 size-5 shrink-0 text-red-700" /><div><h3 className="font-bold text-red-900">Esta acción liberará el horario</h3><p className="mt-1 text-sm leading-relaxed text-red-800/80">La cita dejará de aparecer como activa y el espacio podrá ser reservado por otro paciente.</p></div></div></div>
          <label className="mt-5 block text-[11px] font-bold uppercase tracking-[.16em] text-gray-600">Motivo administrativo (opcional)</label><textarea value={cancelReason} onChange={(event) => onCancelReason(event.target.value.slice(0, 500))} rows={3} placeholder="Ej. Cancelada a solicitud del paciente por mensaje privado." className="mt-2 w-full rounded-xl border border-[#ded3c1] bg-white px-4 py-3 text-sm outline-none focus:border-[#b6975d] focus:ring-2 focus:ring-[#b6975d]/15" />
        </>}
        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</div>}
        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#e2d7c4] pt-5 sm:flex-row sm:justify-end"><button onClick={onClose} disabled={saving} className="rounded-xl border border-[#d8cdbb] bg-white px-6 py-3 text-sm font-bold text-[#0c2538]">Conservar sin cambios</button><button onClick={onConfirm} disabled={saving || (mode === 'reschedule' && !selectedSlot)} className={`rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${mode === 'cancel' ? 'bg-red-700 hover:bg-red-800' : 'bg-[#0c2538] hover:bg-[#153b55]'}`}>{saving ? 'Guardando cambio…' : mode === 'cancel' ? 'Confirmar cancelación' : 'Confirmar nuevo horario'}</button></div>
      </div>
    </section>
  </div>;
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex min-w-0 gap-3 text-[#9b7b42]">{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'mt-0.5 h-5 w-5 shrink-0' })}<div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-gray-500">{label}</p><p className="mt-1 break-words text-sm font-semibold leading-relaxed text-[#0c2538]">{value}</p></div></div>;
}
