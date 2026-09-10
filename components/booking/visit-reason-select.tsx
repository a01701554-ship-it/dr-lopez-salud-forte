import React from 'react';
import { ChevronDown } from 'lucide-react';
import { VisitReasonOption } from '@/lib/calendar/types';

interface VisitReasonSelectProps {
  reasons: VisitReasonOption[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function VisitReasonSelect({
  reasons,
  selectedId,
  onChange,
  disabled = false,
  compact = false,
}: VisitReasonSelectProps) {
  return (
    <div className="w-full">
      <label
        htmlFor="select-motivo-consulta"
        className="block text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/70 mb-2"
      >
        Motivo de la consulta
      </label>
      <div className="relative">
        <select
          id="select-motivo-consulta"
          value={selectedId}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border border-stone bg-white px-4 text-sm font-medium text-obsidian transition-colors hover:border-[#B39A6A]/60 focus:border-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#0D2235] disabled:bg-stone/20 disabled:cursor-not-allowed cursor-pointer ${
            compact ? 'py-2.5 pr-9 text-xs sm:text-sm' : 'py-3.5 pr-10'
          }`}
        >
          {reasons.map((reason) => (
            <option key={reason.id} value={reason.id}>
              {reason.label}
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
