'use client';

import React, { useState } from 'react';
import { OFFICIAL_INSTRUCTOR } from '@/lib/academy/instructor';

interface InstructorAvatarProps {
  size?: 'compact' | 'featured';
  className?: string;
}

/**
 * Componente oficial de fotografía del Dr. Mauricio Benjamín Galindo López
 * Centralizado, responsivo y con fallback visual "MBGL" de alta fidelidad.
 */
export function InstructorAvatar({ size = 'compact', className = '' }: InstructorAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[InstructorAvatar] Error al cargar la fotografía oficial en: ${OFFICIAL_INSTRUCTOR.profileImage}`
      );
    }
    setHasError(true);
  };

  if (size === 'compact') {
    return (
      <div
        className={`relative shrink-0 w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] rounded-full overflow-hidden border border-[#B39A6A]/40 bg-[#0D2235] shadow-xs select-none aspect-square ${className}`}
        style={{ aspectRatio: '1 / 1' }}
      >
        {!hasError ? (
          <img
            data-image-id="IMG-304-DR-MAURICIO-GALINDO-INSTRUCTOR"
            src={OFFICIAL_INSTRUCTOR.profileImage}
            alt={OFFICIAL_INSTRUCTOR.profileImageAlt}
            width={OFFICIAL_INSTRUCTOR.profileImageWidth}
            height={OFFICIAL_INSTRUCTOR.profileImageHeight}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleError}
            className="w-full h-full object-cover object-[center_20%] transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-[#0D2235] text-[#F5F3EE] font-serif font-semibold text-xs tracking-wider"
            title={OFFICIAL_INSTRUCTOR.name}
            aria-label={OFFICIAL_INSTRUCTOR.profileImageAlt}
          >
            {OFFICIAL_INSTRUCTOR.initials}
          </div>
        )}
      </div>
    );
  }

  // Variant "featured" para la sección grande "Instructor Oficial"
  return (
    <div
      className={`relative shrink-0 w-[180px] sm:w-[210px] md:w-[260px] aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden border border-[#B39A6A]/30 bg-white shadow-xs select-none ${className}`}
    >
      {!hasError ? (
        <img
          data-image-id="IMG-304-DR-MAURICIO-GALINDO-INSTRUCTOR"
          src={OFFICIAL_INSTRUCTOR.profileImage}
          alt={OFFICIAL_INSTRUCTOR.profileImageAlt}
          width={OFFICIAL_INSTRUCTOR.profileImageWidth}
          height={OFFICIAL_INSTRUCTOR.profileImageHeight}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleError}
          className="w-full h-full object-cover object-[center_20%] transition-transform duration-500 hover:scale-102"
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#0D2235] text-center border border-[#B39A6A]/30"
          aria-label={OFFICIAL_INSTRUCTOR.profileImageAlt}
        >
          <div className="size-2.5 rounded-full bg-[#B39A6A] mb-3" />
          <span className="font-serif text-2xl font-medium tracking-widest text-[#F5F3EE]">
            {OFFICIAL_INSTRUCTOR.initials}
          </span>
          <span className="mt-2 text-[10px] uppercase font-semibold tracking-[0.18em] text-[#B39A6A]/90">
            Dr. Mauricio Galindo
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Ficha compacta horizontal del instructor
 * Cumple con alineación vertical estricta, diámetro 56-64px desktop y 48-56px móvil.
 */
export function InstructorCompactBadge() {
  return (
    <div className="flex items-center gap-3.5 sm:gap-4 select-none">
      <InstructorAvatar size="compact" />
      <div className="min-w-0 flex flex-col justify-center">
        <h4 className="font-serif text-sm sm:text-base font-semibold text-obsidian tracking-tight leading-snug">
          {OFFICIAL_INSTRUCTOR.name}
        </h4>
        <p className="text-xs text-obsidian/65 font-sans leading-tight mt-0.5 sm:mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>{OFFICIAL_INSTRUCTOR.credentials}</span>
          <span className="hidden sm:inline text-obsidian/30">•</span>
          <span className="text-obsidian/60">{OFFICIAL_INSTRUCTOR.professionalLicense}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Sección completa "Instructor Oficial"
 * Utilizada en las páginas individuales de masterclasses.
 */
export function InstructorOfficialSection() {
  return (
    <section className="py-16 sm:py-20 border-b border-[#B39A6A]/15 bg-[#FAF8F5]/60">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8">
        <div className="p-7 sm:p-10 rounded-2xl bg-white border border-[#B39A6A]/25 shadow-xs flex flex-col md:flex-row gap-7 sm:gap-9 items-center md:items-center">
          <InstructorAvatar size="featured" />

          <div className="flex-1 text-center md:text-left">
            <span className="inline-block text-[10px] uppercase tracking-[0.22em] text-[#8A7347] font-semibold">
              Instructor Oficial
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium mt-1.5 leading-tight">
              {OFFICIAL_INSTRUCTOR.name}
            </h3>
            <p className="text-xs sm:text-sm text-obsidian/65 mt-1 font-sans">
              {OFFICIAL_INSTRUCTOR.credentials} · {OFFICIAL_INSTRUCTOR.professionalLicense}
            </p>
            <p className="mt-3.5 text-xs sm:text-sm text-obsidian/75 leading-relaxed font-sans">
              {OFFICIAL_INSTRUCTOR.shortBio}
            </p>
            <div className="mt-4 pt-3.5 border-t border-[#B39A6A]/15 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-obsidian/60">
              <span className="inline-flex items-center gap-1.5 font-medium text-obsidian/80">
                <span className="size-1.5 rounded-full bg-emerald-600" />
                Cédula verificada
              </span>
              <span>•</span>
              <span>{OFFICIAL_INSTRUCTOR.institution}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
