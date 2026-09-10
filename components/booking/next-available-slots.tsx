import React from 'react';
import { TimeSlot } from '@/lib/calendar/types';
import { ArrowRight } from 'lucide-react';

interface NextAvailableSlotsProps {
  slots: TimeSlot[];
  loading?: boolean;
  onSelectSlot: (slot: TimeSlot) => void;
  onMoreSlots: () => void;
}

export function NextAvailableSlots({
  slots,
  loading = false,
  onSelectSlot,
  onMoreSlots,
}: NextAvailableSlotsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[74px] rounded-lg border border-stone/60 bg-stone/20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Display top 3 slots
  const topSlots = slots.slice(0, 3);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
      {topSlots.map((slot) => (
        <button
          key={slot.isoString}
          type="button"
          onClick={() => onSelectSlot(slot)}
          className="group flex flex-col items-center justify-center min-h-[74px] rounded-lg border border-stone bg-white p-2.5 text-center transition-all duration-200 hover:border-[#0D2235] hover:bg-[#0D2235]/[0.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0D2235] cursor-pointer"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-obsidian/70 group-hover:text-obsidian">
            {slot.dateFormatted}
          </span>
          <span className="mt-1 text-base sm:text-lg font-serif font-medium text-[#0D2235]">
            {slot.time} h
          </span>
        </button>
      ))}

      {/* 4th button: Más horarios */}
      <button
        type="button"
        onClick={onMoreSlots}
        className="flex flex-col items-center justify-center min-h-[74px] rounded-lg border border-[#B39A6A]/40 bg-[#F5F3EE] p-2.5 text-center transition-all duration-200 hover:border-[#0D2235] hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0D2235] cursor-pointer text-obsidian"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/85 flex items-center gap-1">
          Más horarios
          <ArrowRight className="size-3 text-[#B39A6A]" />
        </span>
        <span className="mt-1 text-[11px] text-obsidian/50">Ver calendario completo</span>
      </button>
    </div>
  );
}
