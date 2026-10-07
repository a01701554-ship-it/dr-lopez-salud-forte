import React from 'react';

export interface BookingFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  privacyConsent: boolean;
  whatsappConsent: boolean;
}

interface BookingPatientFormProps {
  data: BookingFormData;
  errors: Record<string, string>;
  submitting?: boolean;
  onChange: (field: keyof BookingFormData, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function BookingPatientForm({
  data,
  errors,
  submitting = false,
  onChange,
  onSubmit,
  onBack,
}: BookingPatientFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label
            htmlFor="patient-first-name"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/75 mb-1.5"
          >
            Nombre(s) *
          </label>
          <input
            id="patient-first-name"
            type="text"
            required
            value={data.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="Ej. Sofía"
            className="w-full rounded-lg border border-stone bg-white px-3.5 py-2.5 text-sm text-obsidian transition-colors placeholder:text-obsidian/30 focus:border-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#0D2235]"
          />
          {errors.firstName && (
            <p className="mt-1 text-[11px] text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Apellidos */}
        <div>
          <label
            htmlFor="patient-last-name"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/75 mb-1.5"
          >
            Apellidos *
          </label>
          <input
            id="patient-last-name"
            type="text"
            required
            value={data.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Ej. Morales Vega"
            className="w-full rounded-lg border border-stone bg-white px-3.5 py-2.5 text-sm text-obsidian transition-colors placeholder:text-obsidian/30 focus:border-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#0D2235]"
          />
          {errors.lastName && (
            <p className="mt-1 text-[11px] text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* WhatsApp */}
        <div>
          <label
            htmlFor="patient-whatsapp"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/75 mb-1.5"
          >
            Teléfono WhatsApp *
          </label>
          <input
            id="patient-whatsapp"
            type="tel"
            required
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+52 442 123 4567"
            className="w-full rounded-lg border border-stone bg-white px-3.5 py-2.5 text-sm text-obsidian transition-colors placeholder:text-obsidian/30 focus:border-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#0D2235]"
          />
          {errors.phone ? (
            <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>
          ) : (
            <p className="mt-1 text-[10px] text-obsidian/45">
              Utilizado para confirmación y recordatorios de la cita.
            </p>
          )}
        </div>

        {/* Correo electrónico */}
        <div>
          <label
            htmlFor="patient-email"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/75 mb-1.5"
          >
            Correo electrónico *
          </label>
          <input
            id="patient-email"
            type="email"
            required
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="sofia@ejemplo.com"
            className="w-full rounded-lg border border-stone bg-white px-3.5 py-2.5 text-sm text-obsidian transition-colors placeholder:text-obsidian/30 focus:border-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#0D2235]"
          />
          {errors.email ? (
            <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>
          ) : (
            <p className="mt-1 text-[10px] text-obsidian/45">
              Recibirás el acceso digital o instrucciones previas.
            </p>
          )}
        </div>
      </div>

      {/* Privacidad & Consentimientos Médicos */}
      <div className="pt-3 space-y-3 border-t border-stone/50">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={data.privacyConsent}
            onChange={(e) => onChange('privacyConsent', e.target.checked)}
            className="mt-0.5 size-4 rounded border-stone text-[#0D2235] focus:ring-[#0D2235] cursor-pointer"
          />
          <span className="text-xs text-obsidian/75 leading-relaxed">
            He leído y acepto el{' '}
            <a
              href="/privacidad"
              target="_blank"
              rel="noreferrer noopener"
              className="text-[#0D2235] font-semibold underline decoration-[#B39A6A]/60 underline-offset-2"
            >
              Aviso de Privacidad
            </a>
            . Consiento expresamente el tratamiento de los datos de salud que proporcione para gestionar y atender esta consulta. Confirmo que esta valoración es de medicina general y preventiva (no urgencias vitales).
          </span>
        </label>
        {errors.privacyConsent && (
          <p className="text-[11px] text-red-600">{errors.privacyConsent}</p>
        )}

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={data.whatsappConsent}
            onChange={(e) => onChange('whatsappConsent', e.target.checked)}
            className="mt-0.5 size-4 rounded border-stone text-[#0D2235] focus:ring-[#0D2235] cursor-pointer"
          />
          <span className="text-xs text-obsidian/65 leading-relaxed">
            Acepto recibir recordatorios e información de mi consulta por WhatsApp.
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-stone/60">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="text-xs font-semibold uppercase tracking-wider text-obsidian/70 hover:text-obsidian py-2 transition-colors cursor-pointer"
        >
          ← Cambiar horario
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="min-h-12 rounded-lg border border-[#0D2235] bg-[#0D2235] px-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#F5F3EE] transition-all hover:bg-obsidian disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {submitting ? 'Procesando...' : 'Continuar'}
        </button>
      </div>
    </form>
  );
}
