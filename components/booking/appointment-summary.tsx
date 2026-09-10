import React from 'react';
import { siteConfig } from '@/config/site';
import { ShieldCheck } from 'lucide-react';

interface AppointmentSummaryProps {
  dateLabel: string;
  timeLabel: string;
  consultationTitle: string;
  reasonLabel: string;
  durationLabel: string;
  feeFormatted: string;
}

export function AppointmentSummary({
  dateLabel,
  timeLabel,
  consultationTitle,
  reasonLabel,
  durationLabel,
  feeFormatted,
}: AppointmentSummaryProps) {
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
