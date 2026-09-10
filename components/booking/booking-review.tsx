import React from 'react';
import { siteConfig } from '@/config/site';
import { ShieldCheck, Calendar, Clock, DollarSign } from 'lucide-react';
import { BookingFormData } from './booking-patient-form';

interface BookingReviewProps {
  dateLabel: string;
  timeLabel: string;
  consultationTitle: string;
  reasonLabel: string;
  durationLabel: string;
  feeFormatted: string;
  patient: BookingFormData;
  confirming: boolean;
  onConfirm: () => void;
  onModify: () => void;
}

export function BookingReview({
  dateLabel,
  timeLabel,
  consultationTitle,
  reasonLabel,
  durationLabel,
  feeFormatted,
  patient,
  confirming,
  onConfirm,
  onModify,
}: BookingReviewProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone/60 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage block">
          Paso final
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-obsidian mt-1">
          Revisa los detalles de tu cita
        </h2>
        <p className="text-xs text-obsidian/60 mt-1">
          Por favor verifica que la fecha y tus datos de contacto sean correctos antes de confirmar.
        </p>
      </div>

      <div className="rounded-xl border border-stone/80 bg-white p-6 space-y-4">
        {/* Doctor */}
        <div className="pb-4 border-b border-stone/50 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sage block">
              Médico Cirujano
            </span>
            <h3 className="font-serif text-xl text-obsidian">{siteConfig.doctorName}</h3>
            <p className="text-xs text-obsidian/60">
              {siteConfig.university} · Cédula {siteConfig.professionalLicense}
            </p>
          </div>
          <span className="rounded bg-stone/20 px-2.5 py-1 text-[11px] font-semibold text-obsidian/75">
            {consultationTitle}
          </span>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-stone/50 text-xs">
          <div>
            <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
              Fecha y Hora
            </span>
            <span className="font-serif text-base text-[#0D2235] capitalize block mt-0.5">
              {dateLabel} · {timeLabel} h
            </span>
          </div>
          <div>
            <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
              Duración
            </span>
            <span className="font-serif text-base text-obsidian block mt-0.5">
              {durationLabel}
            </span>
          </div>
        </div>

        {/* Patient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-stone/50 text-xs">
          <div>
            <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
              Paciente
            </span>
            <span className="font-medium text-obsidian block mt-0.5">
              {patient.firstName} {patient.lastName}
            </span>
          </div>
          <div>
            <span className="font-semibold uppercase tracking-wider text-obsidian/50 block text-[10px]">
              WhatsApp y Correo
            </span>
            <span className="text-obsidian block mt-0.5">
              {patient.phone} · {patient.email}
            </span>
          </div>
        </div>

        {/* Honorarios */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/60 block">
              Honorarios Profesionales
            </span>
            <span className="text-[11px] text-obsidian/50">Pago el día de la consulta</span>
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-medium text-[#0D2235]">
            {feeFormatted}
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-emerald-50 border border-emerald-200/80 p-3.5 flex items-center gap-2.5 text-xs text-emerald-900">
        <ShieldCheck className="size-4 shrink-0 text-emerald-700" />
        <span>
          Al presionar <strong>Confirmar Cita</strong> se sincronizará automáticamente con Google Calendar y recibirás los detalles por WhatsApp.
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-stone/60">
        <button
          type="button"
          disabled={confirming}
          onClick={onModify}
          className="text-xs font-semibold uppercase tracking-wider text-obsidian/70 hover:text-obsidian py-2 transition-colors cursor-pointer"
        >
          ← Modificar datos
        </button>

        <button
          type="button"
          disabled={confirming}
          onClick={onConfirm}
          className="min-h-12 rounded-lg border border-[#0D2235] bg-[#0D2235] px-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#F5F3EE] transition-all hover:bg-obsidian disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-2"
        >
          {confirming ? (
            <>
              <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sincronizando con Google Calendar...</span>
            </>
          ) : (
            <span>Confirmar Cita</span>
          )}
        </button>
      </div>
    </div>
  );
}
