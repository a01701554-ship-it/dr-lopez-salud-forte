import React from 'react';
import { siteConfig } from '@/config/site';
import { ShieldCheck, MapPin, Video, ChevronDown, ExternalLink } from 'lucide-react';
import { ClinicLocationId, CLINIC_LOCATION_OPTIONS, getClinicLocation } from '@/config/locations';

interface AppointmentSummaryProps {
  dateLabel: string;
  timeLabel: string;
  consultationTitle: string;
  reasonLabel: string;
  durationLabel: string;
  feeFormatted: string;
  locationId: ClinicLocationId;
  onLocationChange: (locationId: ClinicLocationId) => void;
}

export function AppointmentSummary({
  dateLabel,
  timeLabel,
  consultationTitle,
  reasonLabel,
  durationLabel,
  feeFormatted,
  locationId,
  onLocationChange,
}: AppointmentSummaryProps) {
  const location = getClinicLocation(locationId);
  return (
    <div className="rounded-xl border border-stone bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-start justify-between border-b border-stone/60 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage block">
            Profesional a cargo
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-obsidian mt-0.5">
            {siteConfig.doctorName}
          </h3>
          <p className="text-xs text-obsidian/65">
            {siteConfig.degreeName} · {siteConfig.university}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage block">
            Cédula Profesional
          </span>
          <span className="font-mono text-xs font-semibold text-obsidian">
            {siteConfig.professionalLicense}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
            Cuándo
          </span>
          <span className="font-medium text-obsidian text-sm capitalize block mt-0.5">
            {dateLabel} · {timeLabel} h
          </span>
        </div>

        <div>
          <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
            Tipo de consulta
          </span>
          <span className="font-medium text-obsidian text-sm block mt-0.5">
            {consultationTitle}
          </span>
        </div>

        <div>
          <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
            Motivo
          </span>
          <span className="text-obsidian/85 text-xs block mt-0.5">
            {reasonLabel}
          </span>
        </div>

        <div>
          <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
            Duración estimada
          </span>
          <span className="text-obsidian/85 text-xs block mt-0.5">
            {durationLabel}
          </span>
        </div>
      </div>

      <div className={`rounded-xl border p-4 ${location.isOnline ? 'border-sky-200 bg-sky-50/70' : 'border-[#d9c8a6] bg-[#fbf8f1]'}`}>
        <div className="flex items-start gap-3">
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${location.isOnline ? 'bg-sky-100 text-sky-700' : 'bg-[#eee4cf] text-[#9b7b42]'}`}>
            {location.isOnline ? <Video className="size-4" /> : <MapPin className="size-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[.18em] text-obsidian/55">Lugar de la consulta</span>
            {location.isOnline ? (
              <>
                <p className="mt-1 font-serif text-lg text-[#0D2235]">Consulta en línea · Telemedicina</p>
                <p className="mt-1 text-xs leading-relaxed text-sky-900/75">La ubicación no puede modificarse para esta modalidad. Recibirás por correo electrónico la liga segura de la videollamada para tu consulta.</p>
              </>
            ) : (
              <>
                <div className="relative mt-2 max-w-md">
                  <select
                    value={locationId}
                    onChange={(event) => onLocationChange(event.target.value as ClinicLocationId)}
                    className="w-full appearance-none rounded-lg border border-[#d7c7a7] bg-white px-3.5 py-2.5 pr-9 text-sm font-semibold text-[#0D2235] outline-none transition focus:border-[#9b7b42] focus:ring-2 focus:ring-[#9b7b42]/15"
                  >
                    {CLINIC_LOCATION_OPTIONS.filter((option) => !option.location.isOnline).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9b7b42]" />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-obsidian/65">{location.address}</p>
                {location.googleMapsUrl && <a href={location.googleMapsUrl} target="_blank" rel="noreferrer noopener" className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#9b7b42] hover:underline">Ver ubicación en Google Maps <ExternalLink className="size-3" /></a>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Honorarios profesionales */}
      <div className="border-t border-stone/60 pt-4 flex items-baseline justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-obsidian/60 block">
            Honorarios Profesionales
          </span>
          <span className="text-[11px] text-obsidian/50">
            Sin cargos ocultos · Pago al momento de la consulta
          </span>
        </div>
        <div className="text-right">
          <span className="font-serif text-2xl sm:text-3xl font-medium text-[#0D2235]">
            {feeFormatted}
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-stone/[0.15] p-3 flex items-center gap-2.5 text-[11px] text-obsidian/70">
        <ShieldCheck className="size-4 text-[#B39A6A] shrink-0" />
        <span>
          Este horario se reservará temporalmente durante 5 minutos para que completes tu registro con tranquilidad.
        </span>
      </div>
    </div>
  );
}
