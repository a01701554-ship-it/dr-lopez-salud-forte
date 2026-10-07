import React from 'react';
import { siteConfig } from '@/config/site';
import { AppointmentRecord } from '@/lib/calendar/types';
import { CheckCircle2, Calendar, Download, Clock, Shield, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getClinicLocation } from '@/config/locations';

interface BookingConfirmationProps {
  appointment: AppointmentRecord;
  onNewBooking?: () => void;
}

export function BookingConfirmation({ appointment, onNewBooking }: BookingConfirmationProps) {
  // Build Google Calendar Add Link
  const startIso = appointment.slotIso;
  const startDate = new Date(startIso);
  const endDate = new Date(startDate.getTime() + appointment.durationMinutes * 60 * 1000);

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const gcalDates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
  const gcalTitle = encodeURIComponent(`Consulta Médica — ${siteConfig.doctorName}`);
  const gcalDetails = encodeURIComponent(
    `Consulta médica: ${appointment.consultationTypeTitle}\nCódigo de cita: ${appointment.publicId}\nPaciente: ${appointment.patient.fullName}\nHonorarios: ${appointment.feeFormatted}\nMédico: ${siteConfig.doctorName} (Cédula: ${siteConfig.professionalLicense})\nTolerancia: ${siteConfig.bookingSettings.gracePeriodMinutes || 15} min`,
  );
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${gcalDates}&details=${gcalDetails}`;

  // Download .ics file
  const handleDownloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dr Mauricio Galindo//Consulta Medica//ES',
      'BEGIN:VEVENT',
      `UID:${appointment.publicId}@drmauriciogalindo.com`,
      `DTSTAMP:${formatGCalDate(new Date())}`,
      `DTSTART:${formatGCalDate(startDate)}`,
      `DTEND:${formatGCalDate(endDate)}`,
      `SUMMARY:Consulta Médica — ${siteConfig.doctorName}`,
      `DESCRIPTION:Consulta con ${siteConfig.doctorName}. Cédula: ${siteConfig.professionalLicense}. Tolerancia: 15 minutos. Referencia: ${appointment.publicId}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Cita-${appointment.publicId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isWaDelivered = appointment.confirmationWhatsAppStatus === 'SENT' || appointment.confirmationWhatsAppStatus === 'DELIVERED';
  const isWaFailed = appointment.confirmationWhatsAppStatus === 'FAILED';
  const isWaPending = !appointment.confirmationWhatsAppStatus || appointment.confirmationWhatsAppStatus === 'NOT_CONFIGURED';

  const location = getClinicLocation(appointment.locationId);

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner: CITA CONFIRMADA */}
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800 block">
            CITA CONFIRMADA
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-obsidian">
            Gracias por tu confianza
          </h2>
          <p className="text-xs text-obsidian/75 leading-relaxed max-w-xl">
            Tu consulta médica con el <strong>{siteConfig.doctorName}</strong> ha quedado registrada en firme.
            {isWaDelivered && (
              <span className="block mt-1 text-emerald-800 font-medium">
                Hemos enviado la confirmación y los detalles de acceso a tu WhatsApp ({appointment.patient.phone}).
              </span>
            )}
            {isWaFailed && (
              <span className="block mt-1 text-amber-800">
                Tu cita está confirmada en agenda. No se pudo entregar la notificación por WhatsApp ({appointment.confirmationError || 'intenta guardar el comprobante'}).
              </span>
            )}
            {isWaPending && (
              <span className="block mt-1 text-obsidian/70">
                Tu cita está programada con éxito. Puedes guardar tu comprobante o añadirla a tu calendario a continuación.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 2. Main Appointment Voucher Card */}
      <div className="rounded-xl border border-stone bg-white p-6 shadow-xs space-y-6">
        {/* Doctor & Reference Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone/50 gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sage block">
              Médico Tratante
            </span>
            <span className="font-serif text-lg sm:text-xl text-obsidian font-medium">
              {siteConfig.doctorName}
            </span>
            <span className="text-[11px] text-obsidian/55 block">
              {siteConfig.degreeName} · {siteConfig.university} · Cédula: {siteConfig.professionalLicense}
            </span>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sage block">
              Folio de Cita
            </span>
            <span className="font-mono text-xs font-semibold text-obsidian/70 bg-stone/20 px-2.5 py-1 rounded">
              {appointment.publicId}
            </span>
          </div>
        </div>

        {/* 4 Core Blocks: Fecha/Hora, Modalidad/Motivo, Ubicación, Honorarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="rounded-lg bg-stone/[0.12] p-4">
            <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px] flex items-center gap-1">
              <Calendar className="size-3 text-sage" /> Fecha y Horario
            </span>
            <span className="font-serif text-lg text-[#0D2235] capitalize block mt-1">
              {appointment.dateFormatted}
            </span>
            <span className="text-xs font-semibold text-obsidian/80 block mt-0.5">
              {appointment.timeFormatted} h (Hora Centro, CDMX)
            </span>
            <span className="text-[11px] text-emerald-800 font-medium block mt-1">
              Tolerancia de 15 minutos
            </span>
          </div>

          <div className="rounded-lg bg-stone/[0.12] p-4">
            <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px] flex items-center gap-1">
              <Clock className="size-3 text-sage" /> Modalidad y Motivo
            </span>
            <span className="font-serif text-lg text-obsidian block mt-1">
              {appointment.consultationTypeTitle}
            </span>
            <span className="text-xs text-obsidian/75 truncate block mt-0.5">
              {appointment.reasonLabel}
            </span>
            <span className="text-[11px] text-obsidian/50 block mt-1">
              Duración: {appointment.durationLabel}
            </span>
          </div>

          <div className="rounded-lg bg-stone/[0.12] p-4">
            <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px] flex items-center gap-1">
              <MapPin className="size-3 text-sage" /> Ubicación
            </span>
            <span className="font-serif text-lg text-obsidian block mt-1">
              {location.name}
            </span>
            <span className="text-xs text-obsidian/75 block mt-0.5">
              {location.isOnline ? location.onlineInstructions : location.address}
            </span>
            {!location.isOnline && location.googleMapsUrl && (
              <a
                href={location.googleMapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[11px] text-[#B39A6A] hover:underline font-medium inline-flex items-center gap-0.5 mt-1"
              >
                Abrir en Google Maps <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          <div className="rounded-lg bg-stone/[0.12] p-4">
            <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px] flex items-center gap-1">
              <Shield className="size-3 text-sage" /> Honorarios
            </span>
            <span className="font-serif text-lg text-[#0D2235] block mt-1">
              {appointment.feeFormatted}
            </span>
            <span className="text-[11px] text-obsidian/50 block mt-0.5">
              Tarifa transparente y fija
            </span>
            <span className="text-[11px] text-obsidian/50 block mt-1">
              Liquidación al término de la cita
            </span>
          </div>
        </div>

        {/* 3. 15-Minute Grace Period & Clinical Policies */}
        <div className="rounded-lg border border-amber-200/60 bg-amber-50/40 p-4 text-xs text-obsidian/75 space-y-1.5">
          <p className="font-medium text-obsidian">
            <strong>Política de puntualidad y tolerancia:</strong> Cuentas con <strong>15 minutos de tolerancia</strong> para el inicio de tu consulta. Te recomendamos conectarte o llegar 5 minutos antes para aprovechar al máximo tu tiempo de atención médica.
          </p>
          <p>
            <strong>Cancelaciones o reprogramaciones:</strong> Agradecemos notificarnos con al menos 24 horas de antelación para reasignar este espacio a otro paciente.
          </p>
        </div>

        {/* 4. Calendar Integration Actions */}
        <div className="border-t border-stone/50 pt-5 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-obsidian/60 block mb-2">
            AÑADIR A TU CALENDARIO PERSONAL
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={gcalUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone bg-white px-4 py-2.5 text-xs font-medium text-obsidian hover:border-[#0D2235] hover:bg-stone/10 transition-colors cursor-pointer"
            >
              <Calendar className="size-3.5 text-[#0D2235]" />
              <span>Añadir a Google Calendar</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadIcs}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone bg-white px-4 py-2.5 text-xs font-medium text-obsidian hover:border-[#0D2235] hover:bg-stone/10 transition-colors cursor-pointer"
            >
              <Download className="size-3.5 text-[#0D2235]" />
              <span>Descargar .ICS (Apple / Outlook)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Return */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-obsidian/75 hover:text-obsidian py-2 transition-colors"
        >
          <span>Ir a la página principal</span>
        </Link>

        {onNewBooking && (
          <button
            type="button"
            onClick={onNewBooking}
            className="text-xs font-semibold uppercase tracking-wider text-[#0D2235] underline underline-offset-4 hover:text-obsidian cursor-pointer"
          >
            Agendar otra consulta
          </button>
        )}
      </div>
    </div>
  );
}
