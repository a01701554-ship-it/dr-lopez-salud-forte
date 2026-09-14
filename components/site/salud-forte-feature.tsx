'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Container } from './container';
import { cn } from '@/lib/utils';
import { ScrollReveal, MaskReveal } from './motion-wrapper';

export type SaludForteFeatureProps = {
  context: 'home' | 'podcast';
  headingLevel?: 'h1' | 'h2';
  className?: string;
};

// ============================================================================
// CONFIGURACIÓN CENTRAL DEL FONDO — SALUD FORTE PODCAST
// FONDO INTERCAMBIABLE DE SALUD FORTE — cambiar esta ruta para sustituir el background
// ============================================================================
export const podcastHeroBackground = {
  /**
   * Modos disponibles:
   * - 'current': Fondo cinemático con resplandor + teléfono/mano independiente en columna derecha.
   * - 'photographic-background': Usa la composición oficial completa de Salud Forte como fondo.
   *   IMPORTANTE: En modo 'photographic-background', el teléfono/mano independiente se OCULTA AUTOMÁTICAMENTE
   *   para evitar una doble imagen del teléfono.
   */
  mode: 'photographic-background' as 'current' | 'photographic-background',
  desktopSrc: '/images/podcast/official/salud-forte-home-phone-final-2026.png',
  desktopWebp: '/images/podcast/official/salud-forte-home-phone-final-2026.webp',
  mobileSrc: '/images/podcast/official/salud-forte-home-phone-mobile-2026.png',
  mobileWebp: '/images/podcast/official/salud-forte-home-phone-mobile-2026.webp',
  desktopPosition: 'center center',
  mobilePosition: 'center center',
  size: 'cover' as const,
  overlay: true, // Overlay gradiente independiente para asegurar legibilidad
};

// Official Platform Brand Lockups
function SpotifyLockup() {
  return (
    <div className="inline-flex items-center gap-2 sm:gap-2.5 shrink-0">
      <svg viewBox="0 0 40 40" className="h-7 sm:h-9 lg:h-10 w-auto shrink-0" aria-hidden="true">
        <circle cx="20" cy="20" r="20" fill="#1ED760" />
        <path
          d="M29.2 28.8c-.3.5-1.1.7-1.6.4-4.6-2.8-10.4-3.5-17.2-1.9-.7.1-1.3-.3-1.5-.9-.1-.7.3-1.3.9-1.5 7.4-1.7 13.8-1 19 2.2.5.3.7 1.2.4 1.7zm2.4-5.2c-.4.6-1.3.9-2 .5-5.3-3.2-13.3-4.2-19.5-2.3-.7.2-1.6-.2-1.8-1-.2-.7.2-1.6 1-1.8 7.1-2.2 15.9-1.1 21.8 2.6.7.4.9 1.4.5 2zm.3-5.5c-6.3-3.7-16.7-4.1-22.8-2.3-1 .3-2-.2-2.3-1.2-.3-1 .2-2 1.2-2.3 7-2.1 18.5-1.7 25.8 2.6.9.5 1.2 1.7.7 2.5-.5.9-1.7 1.2-2.6.7z"
          fill="#000000"
        />
      </svg>
      <span className="font-sans font-bold text-lg sm:text-2xl lg:text-[25px] text-[#1ED760] tracking-[0.01em] leading-none whitespace-nowrap">
        Spotify<sup className="text-[10px] sm:text-xs font-normal ml-0.5">®</sup>
      </span>
    </div>
  );
}

function ApplePodcastsLockup() {
  return (
    <div className="inline-flex items-center gap-2 sm:gap-2.5 shrink-0">
      <div className="h-7 sm:h-9 lg:h-10 w-7 sm:w-9 lg:w-10 rounded-[8px] sm:rounded-[10px] bg-gradient-to-b from-[#B83CF4] to-[#7928CA] flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="size-4.5 sm:size-6 text-white fill-current" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.2 6.9 9.5v-2.1c-2.9-1.1-5-3.9-5-7.4 0-4.4 3.6-8 8.1-8s8.1 3.6 8.1 8c0 3.5-2.1 6.3-5 7.4v2.1c4-1.3 6.9-5.1 6.9-9.5a10 10 0 0 0-10-10z" />
          <path d="M12 6a6 6 0 0 0-6 6c0 2.5 1.5 4.7 3.7 5.5v-2c-1.1-.6-1.8-1.8-1.8-3.5 0-2.2 1.8-4.1 4.1-4.1s4.1 1.9 4.1 4.1c0 1.7-.7 2.9-1.8 3.5v2c2.2-.8 3.7-3 3.7-5.5a6 6 0 0 0-6-6z" />
          <circle cx="12" cy="12" r="2.2" />
          <path d="M11 16.5h2v6h-2z" />
          <path d="M9.5 22h5v1.2h-5z" />
        </svg>
      </div>
      <span className="font-sans font-semibold text-lg sm:text-2xl lg:text-[25px] text-white tracking-[0.01em] leading-none whitespace-nowrap">
        Podcasts
      </span>
    </div>
  );
}

function YouTubeLockup() {
  return (
    <div className="inline-flex items-center gap-2 sm:gap-2.5 shrink-0">
      <div className="h-6 sm:h-7 lg:h-8 w-8 sm:w-10 lg:w-11 rounded-[6px] sm:rounded-[7px] bg-[#FF0000] flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="size-3.5 sm:size-4.5 text-white fill-current ml-0.5" aria-hidden="true">
          <polygon points="6,3 20,12 6,21" />
        </svg>
      </div>
      <span className="font-sans font-bold text-lg sm:text-2xl lg:text-[25px] text-white tracking-tight leading-none whitespace-nowrap">
        YouTube
      </span>
    </div>
  );
}

export function SaludForteFeature({
  context,
  headingLevel,
  className,
}: SaludForteFeatureProps) {
  const HeadingTag = headingLevel || (context === 'podcast' ? 'h1' : 'h2');
  const isHome = context === 'home';
  const isPhotographicMode = podcastHeroBackground.mode === 'photographic-background';

  const singleCta = {
    label: 'VER TODOS LOS EPISODIOS',
    href: isHome ? '/podcast#episodios' : '#episodios',
  };

  return (
    <section
      id="salud-forte"
      aria-label="Salud Forte Podcast con el Dr. Mauricio Benjamín Galindo López"
      className={cn(
        'relative w-full overflow-hidden bg-[#061522] text-white',
        isHome ? 'scroll-mt-20 sm:scroll-mt-24' : '',
        className,
      )}
    >
      {/* 1. CAPA DE FONDO Y ATMÓSFERA */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        {isPhotographicMode ? (
          <>
            {/* Capa 1: Fotografía de fondo intercambiable */}
            <picture className="absolute inset-0 hidden size-full lg:block">
              <source srcSet={podcastHeroBackground.desktopWebp} type="image/webp" />
              <img
                data-image-id="IMG-602-PODCAST-EDITORIAL-BG"
                src={podcastHeroBackground.desktopSrc}
                alt=""
                width={1812}
                height={868}
                className="size-full object-cover"
                style={{
                  objectPosition: podcastHeroBackground.desktopPosition,
                  objectFit: podcastHeroBackground.size,
                }}
              />
            </picture>
            <div className="absolute inset-0 bg-[#061522] lg:hidden" />
            {/* Capa 2: Overlay de degradado oscuro para legibilidad */}
            {podcastHeroBackground.overlay && (
              <div className="absolute inset-0 hidden bg-gradient-to-r from-[#061522]/95 via-[#061522]/75 to-transparent lg:block lg:w-[65%]" />
            )}
          </>
        ) : (
          <>
            {/* Deep dark navy base */}
            <div className="absolute inset-0 bg-[#061522]" />

            {/* Warm taupe / bronze studio glow centered behind the phone (~73% 48%) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_73%_48%,rgba(152,124,107,0.48)_0%,rgba(197,164,98,0.15)_35%,transparent_70%)]" />

            {/* Dark linear gradient on the left side to ensure text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#061522] via-[#061522]/90 to-transparent lg:w-[65%]" />
          </>
        )}

        {/* Top & bottom subtle hairline borders */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C5A462]/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C5A462]/15 to-transparent" />
      </div>

      {/* 2. MAIN CONTAINER & EDITORIAL LAYOUT (BALANCED UPPER PADDING WITHOUT TOP GAPS) */}
      <Container className="relative z-10 mx-auto max-w-[1520px] px-5 sm:px-8 lg:px-12 xl:px-16 pt-10 sm:pt-14 lg:pt-16 xl:pt-20 pb-12 sm:pb-16 lg:pb-0">
        <div
          className={cn(
            'grid grid-cols-1 gap-8 lg:gap-8 xl:gap-12 lg:grid-cols-12 lg:items-center',
          )}
        >
          {/* LEFT COLUMN: 58% (7 cols on 12-col grid) */}
          <div
            className={cn(
              'flex flex-col justify-center max-w-[780px]',
              isPhotographicMode ? 'lg:col-span-8 xl:col-span-7 py-2 lg:py-4' : 'lg:col-span-7 py-2 lg:py-6',
            )}
          >
            {/* 1. Eyebrow Tag con revelado de derecha a izquierda */}
            <ScrollReveal direction="right" distance={32} delay={0.05} duration={0.65}>
              <div className="inline-flex items-center gap-2 sm:gap-2.5">
                <span className="size-1.5 sm:size-2 rounded-full bg-[#C5A462]" aria-hidden="true" />
                <p className="text-[0.7rem] sm:text-[0.78rem] lg:text-[0.85rem] font-bold uppercase tracking-[0.22em] text-[#C5A462]">
                  SALUD FORTE
                </p>
              </div>
            </ScrollReveal>

            {/* 2. Main Title con revelado por máscara editorial */}
            <MaskReveal delay={0.12} duration={0.80} direction="up" distance={28}>
              <HeadingTag className="mt-3.5 sm:mt-4 font-serif text-[clamp(2.25rem,3.4vw,3.5rem)] leading-[0.96] tracking-[-0.035em] text-[#F4F0E8] font-normal">
                Medicina clara para la vida diaria.
              </HeadingTag>
            </MaskReveal>

            {/* 3. Single Description Paragraph */}
            <ScrollReveal direction="right" distance={28} delay={0.20} duration={0.70}>
              <p className="mt-5 sm:mt-6 max-w-[720px] font-sans text-base sm:text-lg lg:text-[1.12rem] leading-[1.6] text-[#F4F0E8]/90 font-normal">
                Salud, prevención y hábitos explicados con rigor científico y lenguaje accesible. Escúchalo en tu plataforma favorita.
              </p>
            </ScrollReveal>

            {/* 4. Platforms Row (Entrada secuencial de elementos de podcast) */}
            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-6 lg:gap-8">
              <ScrollReveal direction="right" distance={20} delay={0.26} duration={0.60}>
                <p className="font-sans font-light text-base sm:text-lg lg:text-xl text-[#F4F4F0] shrink-0">
                  Escúchalo en:
                </p>
              </ScrollReveal>

              <div className="flex flex-wrap items-center gap-5 sm:gap-7 lg:gap-8">
                {/* Spotify */}
                <ScrollReveal direction="right" distance={18} delay={0.32} duration={0.60}>
                  <a
                    href={siteConfig.spotifyShowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Escuchar SaludForte en Spotify"
                    className="group inline-flex items-center transition-all duration-200 hover:-translate-y-0.5 opacity-95 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A462] rounded-md"
                  >
                    <SpotifyLockup />
                  </a>
                </ScrollReveal>

                {/* Apple Podcasts */}
                <ScrollReveal direction="right" distance={18} delay={0.38} duration={0.60}>
                  <a
                    href={siteConfig.applePodcastsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Escuchar SaludForte en Apple Podcasts"
                    className="group inline-flex items-center transition-all duration-200 hover:-translate-y-0.5 opacity-95 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A462] rounded-md"
                  >
                    <ApplePodcastsLockup />
                  </a>
                </ScrollReveal>

                {/* YouTube */}
                <ScrollReveal direction="right" distance={18} delay={0.44} duration={0.60}>
                  <a
                    href={siteConfig.youtubePodcastUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visitar el canal de Salud Forte en YouTube; se abre en una pestaña nueva"
                    className="group inline-flex items-center transition-all duration-200 hover:-translate-y-0.5 opacity-95 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A462] rounded-md"
                  >
                    <YouTubeLockup />
                  </a>
                </ScrollReveal>
              </div>
            </div>

            {/* 5. Single CTA Button */}
            <div className="mt-7 sm:mt-9 flex items-center justify-start">
              <ScrollReveal direction="up" distance={16} delay={0.50} duration={0.65}>
                <Link
                  href={singleCta.href}
                  className="group inline-flex h-[48px] sm:h-[52px] w-full sm:w-auto min-w-[240px] items-center justify-center gap-3.5 sm:gap-4 rounded-full bg-[#F4F0E8] px-8 sm:px-10 lg:px-12 text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] text-[#07182A] shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_40px_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A462] focus-visible:ring-offset-4 focus-visible:ring-offset-[#061522] whitespace-nowrap"
                >
                  <span>{singleCta.label}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 sm:size-4.5 stroke-[2] transition-transform duration-200 group-hover:translate-x-1.5 text-[#07182A]"
                  />
                </Link>
              </ScrollReveal>
            </div>
          </div>

          {/* RIGHT COLUMN: 42% (5 cols on 12-col grid) - HAND & PHONE COMPOSITION */}
          {/* Se renderiza ÚNICAMENTE en modo 'current'. Entrada dominante desde la derecha con curva editorial */}
          {!isPhotographicMode && (
            <div className="lg:col-span-5 flex justify-center lg:justify-end items-end relative mt-2 lg:mt-0">
              <ScrollReveal
                direction="left"
                distance={68}
                delay={0.10}
                duration={1.0}
                easing="editorial"
                className="w-full flex justify-center lg:justify-end"
              >
                {/* Phone held by hand container */}
                <div className="relative w-[280px] sm:w-[360px] md:w-[420px] lg:w-[460px] xl:w-[520px] max-w-full select-none">
                  <div className="relative z-10 w-full drop-shadow-[0_30px_70px_rgba(0,0,0,0.85)]">
                    <picture className="block w-full">
                      <source
                        srcSet="/images/podcast/official/salud-forte-home-phone-mobile-2026.webp"
                        type="image/webp"
                      />
                      <img
                        data-image-id="IMG-601-PODCAST-PHONE-MOCKUP"
                        src="/images/podcast/official/salud-forte-home-phone-mobile-2026.png"
                        alt="Mano sosteniendo un teléfono con la página de Spotify del podcast SaludForte"
                        width={900}
                        height={1200}
                        loading="eager"
                        decoding="async"
                        className="w-full h-auto object-contain block"
                        referrerPolicy="no-referrer"
                      />
                    </picture>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          )}

          {isPhotographicMode && (
            <div className="lg:hidden overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <picture className="block w-full">
                <source srcSet={podcastHeroBackground.mobileWebp} type="image/webp" />
                <img
                  data-image-id="IMG-601-PODCAST-PHONE-MOCKUP"
                  src={podcastHeroBackground.mobileSrc}
                  alt="Mano sosteniendo un teléfono con el podcast Salud Forte abierto en Spotify"
                  width={900}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </picture>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
