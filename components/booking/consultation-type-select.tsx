import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ConsultationTypeOption, ConsultationTypeId } from '@/lib/calendar/types';

interface ConsultationTypeSelectProps {
  types: ConsultationTypeOption[];
  selectedId: ConsultationTypeId;
  onChange: (id: ConsultationTypeId) => void;
  disabled?: boolean;
}

export function ConsultationTypeSelect({
  types,
  selectedId,
  onChange,
  disabled = false,
}: ConsultationTypeSelectProps) {
  return (
    <div className="w-full">
      <label
        htmlFor="select-tipo-consulta"
        className="block text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/70 mb-2"
      >
        Tipo de consulta
      </label>
      <div className="relative">
        <select
          id="select-tipo-consulta"
          value={selectedId}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as ConsultationTypeId)}
          className="w-full appearance-none rounded-lg border border-stone bg-white px-4 py-3.5 pr-10 text-sm font-medium text-obsidian transition-colors hover:border-[#B39A6A]/60 focus:border-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#0D2235] disabled:bg-stone/20 disabled:cursor-not-allowed cursor-pointer"
        >
          {types.map((type) => (
            <option key={type.id} value={type.id} disabled={!type.available}>
              {type.label} {!type.isHomeVisit ? `(${type.durationLabel}) — ${type.priceFormatted}` : `(${type.priceFormatted})`}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-obsidian/60">
          <ChevronDown className="size-4" />
        </div>
      </div>
    </div>
  );
}
