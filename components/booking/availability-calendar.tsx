import React from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { DayAvailability, TimeSlot } from '@/lib/calendar/types';

interface AvailabilityCalendarProps {
  days: DayAvailability[];
  loading?: boolean;
  selectedSlotIso?: string;
  onSelectSlot: (slot: TimeSlot) => void;
  onUnavailableSlot?: (slot: TimeSlot) => void;
  onPrevRange: () => void;
  onNextRange: () => void;
  canGoBack: boolean;
}

export function AvailabilityCalendar({
  days,
  loading = false,
  selectedSlotIso,
  onSelectSlot,
  onUnavailableSlot,
  onPrevRange,
  onNextRange,
  canGoBack,
}: AvailabilityCalendarProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-stone/50">
          <div className="h-6 w-36 bg-stone/30 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="size-8 rounded bg-stone/30 animate-pulse" />
            <div className="size-8 rounded bg-stone/30 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-h-[260px] rounded-lg border border-stone/60 p-4 space-y-3">
              <div className="h-5 w-24 bg-stone/30 rounded animate-pulse" />
              <div className="h-4 w-16 bg-stone/20 rounded animate-pulse" />
              <div className="space-y-2 pt-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-10 bg-stone/20 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Navigator Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-stone/60 mb-5">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-obsidian/65">
          Horarios de Ciudad de México (GMT-6)
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={onPrevRange}
            aria-label="Días anteriores"
            className="p-2 rounded border border-stone bg-white text-obsidian transition-colors hover:bg-stone/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNextRange}
            aria-label="Días siguientes"
            className="p-2 rounded border border-stone bg-white text-obsidian transition-colors hover:bg-stone/20 cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-wider">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" />Disponible</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-red-700"><span className="size-2 rounded-full bg-red-500" />Reservado</span>
      </div>

      {/* Days Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {days.map((day) => {
          const availableSlots = day.slots.filter((s) => s.available);
          const reservedSlots = day.slots.filter((s) => !s.available);

          return (
            <div
              key={day.dateKey}
              className="rounded-xl border border-stone/80 bg-white p-4 flex flex-col justify-between"
            >
              {/* Day Header */}
              <div className="text-center pb-3.5 border-b border-stone/50">
                <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-sage">
                  {day.dayShort}
                </span>
                <span className="font-serif text-xl sm:text-2xl text-[#0D2235] font-medium mt-0.5 block">
                  {day.dayNumber} {day.monthShort}
                </span>
              </div>

              {/* Slots List */}
              <div className="py-3 flex-1">
                {day.slots.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="size-4 text-obsidian/30 mb-1.5" />
                    <span className="text-xs text-obsidian/45 font-medium">Sin disponibilidad</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {day.slots.map((slot) => {
                      const isSelected = selectedSlotIso === slot.isoString;
                      return (
                        <button
                          key={slot.isoString}
                          type="button"
                          onClick={() => slot.available ? onSelectSlot(slot) : onUnavailableSlot?.(slot)}
                          aria-label={`${slot.time} ${slot.available ? 'disponible' : 'reservado'}`}
                          className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-[#0D2235] text-white shadow-sm ring-1 ring-[#0D2235]'
                              : slot.available
                                ? 'border border-emerald-200 bg-emerald-50/70 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-50'
                                : 'border border-red-200 bg-red-50/80 text-red-800 hover:border-red-400 hover:bg-red-50'
                          }`}
                        >
                          <span>{slot.time} h</span>
                          <span className="text-[9px] uppercase tracking-wider">{slot.available ? 'Disponible' : 'Reservado'}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-stone/40 text-center">
                <span className="text-[10px] uppercase tracking-wider text-obsidian/40">
                  {availableSlots.length} disponibles · {reservedSlots.length} reservados
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
