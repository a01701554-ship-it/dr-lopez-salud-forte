'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ManagedImage } from './managed-image';
import { usePrefersReducedMotion } from './motion-wrapper';

export function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    // Trigger immediate load choreography on mount
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  // Parallax Scroll Listener using rAF & passive scroll
  useEffect(() => {
    if (prefersReduced) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!heroRef.current) return;

        const rect = heroRef.current.getBoundingClientRect();
        const heroHeight = rect.height || 740;
        // Calculate normalized scroll progress: 0 when at top of hero, 1 when hero scrolled past
        const scrollY = Math.max(0, -rect.top);
        const rawProgress = scrollY / heroHeight;
        const clampedProgress = Math.min(1, Math.max(0, rawProgress));

        setScrollProgress(clampedProgress);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [prefersReduced]);

  const animate = !prefersReduced && isLoaded;

  // Compute precise translation ranges based on device progress
  // Desktop: +75px to -115px (190px total travel)
  const desktopY = prefersReduced ? 0 : 75 + scrollProgress * -190;
  // Mobile / Tablet: +15px to -35px (50px total travel)
  const mobileY = prefersReduced ? 0 : 15 + scrollProgress * -50;

  return (
    <section
      ref={heroRef}
      aria-label="Dr. Mauricio Galindo — Médico Cirujano"
      className="relative w-full bg-[#F3F7FC] overflow-hidden min-h-[calc(100svh-80px)] lg:min-h-[740px] xl:min-h-[800px] 2xl:min-h-[840px] flex flex-col justify-between"
    >
      {/* 
        ========================================================================
        1. CAPA FOTOGRÁFICA EN ESCRITORIO (>= 1024px)
        Dr. Mauricio en el cuadrante derecho sin invasión del área de texto.
        Parallax ligado al scroll mediante dos capas:
        - hero-avatar-scroll-wrapper (posicionamiento y movimiento parallax)
        - hero-avatar-reveal-wrapper (animación inicial de entrada)
        ========================================================================
      */}
      <div
        className="hidden lg:block absolute inset-0 size-full pointer-events-none select-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="size-full gpu-accel hero-avatar-scroll-wrapper"
          style={{
            transform: prefersReduced
              ? 'none'
              : `translate3d(0, ${desktopY}px, 0)`,
            willChange: prefersReduced ? 'auto' : 'transform',
          }}
        >
          <div
            className="size-full gpu-accel hero-avatar-reveal-wrapper"
            style={{
              clipPath: prefersReduced
                ? 'inset(0 0 0 0)'
                : animate
                ? 'inset(0 0 0 0)'
                : 'inset(0 6% 0 0)',
              transform: prefersReduced
                ? 'none'
                : animate
                ? 'scale(1)'
                : 'scale(1.025)',
              opacity: prefersReduced ? 1 : animate ? 1 : 0.05,
              transition: prefersReduced
                ? 'none'
                : 'clip-path 1.05s cubic-bezier(0.16, 1, 0.3, 1), transform 1.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <ManagedImage
              slot="homeHero"
              device="desktop"
              priority
              sizes="100vw"
              className="size-full bg-transparent"
            />
          </div>
        </div>
        {/* Sutil difuminado inferior para fundir con la siguiente sección */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F3F7FC] via-[#F3F7FC]/60 to-transparent z-10" />
      </div>

      {/* 
        ========================================================================
        2. CAPA DE CONTENIDO EDITORIAL (TEXTO + CTA + CREDENCIALES)
        Coreografía secuencial de izquierda a derecha sin layout shifts.
        ========================================================================
      */}
      <div className="relative z-10 mx-auto max-w-[1728px] w-full px-6 sm:px-10 lg:px-14 xl:px-20 py-10 sm:py-14 lg:py-16 xl:py-20 my-auto flex flex-col justify-center">
        <div className="w-full lg:max-w-[660px] xl:max-w-[720px] 2xl:max-w-[760px]">
          
          {/* 1. Eyebrow de bienvenida / Contexto (Entra desde la izquierda) */}
          <div
            className="gpu-accel mb-6 sm:mb-7"
            style={{
              opacity: prefersReduced ? 1 : animate ? 1 : 0,
              transform: prefersReduced
                ? 'none'
                : animate
                ? 'translate3d(0, 0, 0)'
                : 'translate3d(-28px, 0, 0)',
              transition: prefersReduced
                ? 'none'
                : 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.05s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.05s',
            }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#162039]/10 shadow-xs backdrop-blur-xs">
              <span className="size-2 rounded-full bg-[#48A4F5]" aria-hidden="true" />
              <span className="font-sans text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.12em] text-[#162039]/90">
                Dr. Mauricio Galindo · Médico Cirujano
              </span>
            </div>
          </div>

          {/* 2. Encabezado Principal (H1) con revelado por máscara vertical */}
          <div className="overflow-hidden">
            <h1
              className="font-sans font-extrabold text-[clamp(32px,3.8vw,60px)] leading-[1.08] tracking-[-0.03em] text-[#162039] text-balance gpu-accel"
              style={{
                opacity: prefersReduced ? 1 : animate ? 1 : 0,
                transform: prefersReduced
                  ? 'none'
                  : animate
                  ? 'translate3d(0, 0, 0)'
                  : 'translate3d(0, 24px, 0)',
                transition: prefersReduced
                  ? 'none'
                  : 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.12s, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.12s',
              }}
            >
              Entiende tu salud. Decide con confianza.
            </h1>
          </div>

          {/* 3. Párrafo de Apoyo */}
          <p
            className="mt-6 sm:mt-8 font-sans font-normal text-[clamp(16px,1.15vw,20px)] leading-[1.6] text-[#162039]/80 max-w-[620px] text-pretty gpu-accel"
            style={{
              opacity: prefersReduced ? 1 : animate ? 1 : 0,
              transform: prefersReduced
                ? 'none'
                : animate
                ? 'translate3d(0, 0, 0)'
                : 'translate3d(0, 18px, 0)',
              transition: prefersReduced
                ? 'none'
                : 'opacity 0.70s cubic-bezier(0.22, 1, 0.36, 1) 0.20s, transform 0.70s cubic-bezier(0.22, 1, 0.36, 1) 0.20s',
            }}
          >
            El Dr. Mauricio Galindo combina criterio clínico riguroso, atención médica personalizada y divulgación basada en evidencia para ayudarte a tomar mejores decisiones sobre tu bienestar.
          </p>

          {/* 4. Botones de Acción (CTAs) con entrada escalonada e interacción hover independiente */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div
              className="gpu-accel"
              style={{
                opacity: prefersReduced ? 1 : animate ? 1 : 0,
                transform: prefersReduced
                  ? 'none'
                  : animate
                  ? 'translate3d(0, 0, 0)'
                  : 'translate3d(0, 16px, 0)',
                transition: prefersReduced
                  ? 'none'
                  : 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.28s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.28s',
              }}
            >
              <Link
                href="/agendar"
                className="group/cta inline-flex items-center justify-center gap-3 h-[56px] sm:h-[60px] px-8 sm:px-9 rounded-full bg-[#162039] text-white font-sans text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.08em] shadow-[0_8px_22px_rgba(22,32,57,0.25)] transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#0c1324] hover:shadow-[0_12px_28px_rgba(22,32,57,0.35)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#162039] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3F7FC] text-center w-full sm:w-auto cursor-pointer"
              >
                <span>AGENDAR CONSULTA</span>
                <ArrowRight className="size-4 stroke-[2.5] transition-transform duration-200 group-hover/cta:translate-x-1" />
              </Link>
            </div>

            <div
              className="gpu-accel"
              style={{
                opacity: prefersReduced ? 1 : animate ? 1 : 0,
                transform: prefersReduced
                  ? 'none'
                  : animate
                  ? 'translate3d(0, 0, 0)'
                  : 'translate3d(0, 16px, 0)',
                transition: prefersReduced
                  ? 'none'
                  : 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.35s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.35s',
              }}
            >
              <Link
                href="/sobre-mi"
                className="inline-flex items-center justify-center h-[56px] sm:h-[60px] px-7 sm:px-8 rounded-full bg-white/90 border border-[#162039]/15 text-[#162039] font-sans text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:border-[#162039]/30 hover:shadow-sm active:translate-y-0 text-center w-full sm:w-auto cursor-pointer"
              >
                Conoce mi enfoque
              </Link>
            </div>
          </div>

          {/* 5. Línea divisoria con expansión progresiva (Draw effect) */}
          <div
            className="mt-10 sm:mt-12 pt-6 sm:pt-7 border-t border-[#162039]/10 relative max-w-[640px]"
          >
            {/* Indicadores de confianza con aparición secuencial */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <div
                className="flex items-center gap-2 text-[#162039]/80 font-sans text-[12px] sm:text-[13px] gpu-accel"
                style={{
                  opacity: prefersReduced ? 1 : animate ? 1 : 0,
                  transform: prefersReduced
                    ? 'none'
                    : animate
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(0, 12px, 0)',
                  transition: prefersReduced
                    ? 'none'
                    : 'opacity 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.42s, transform 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.42s',
                }}
              >
                <CheckCircle2 className="size-4 text-[#48A4F5] shrink-0 stroke-[2.5]" />
                <span className="leading-snug">Tecnológico de Monterrey</span>
              </div>

              <div
                className="flex items-center gap-2 text-[#162039]/80 font-sans text-[12px] sm:text-[13px] gpu-accel"
                style={{
                  opacity: prefersReduced ? 1 : animate ? 1 : 0,
                  transform: prefersReduced
                    ? 'none'
                    : animate
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(0, 12px, 0)',
                  transition: prefersReduced
                    ? 'none'
                    : 'opacity 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.49s, transform 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.49s',
                }}
              >
                <ShieldCheck className="size-4 text-[#48A4F5] shrink-0 stroke-[2.5]" />
                <span className="leading-snug">Cédula Prof. 15851723</span>
              </div>

              <div
                className="flex items-center gap-2 text-[#162039]/80 font-sans text-[12px] sm:text-[13px] gpu-accel"
                style={{
                  opacity: prefersReduced ? 1 : animate ? 1 : 0,
                  transform: prefersReduced
                    ? 'none'
                    : animate
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(0, 12px, 0)',
                  transition: prefersReduced
                    ? 'none'
                    : 'opacity 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.56s, transform 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.56s',
                }}
              >
                <CheckCircle2 className="size-4 text-[#48A4F5] shrink-0 stroke-[2.5]" />
                <span className="leading-snug">Presencial y en línea</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        3. RETRATO INTEGRADO EN DISPOSITIVOS MÓVILES (< 1024px)
        ========================================================================
      */}
      <div
        className="lg:hidden relative w-full h-[420px] sm:h-[480px] overflow-hidden select-none pointer-events-none mt-2 gpu-accel"
      >
        <div
          className="size-full gpu-accel hero-avatar-scroll-wrapper"
          style={{
            transform: prefersReduced
              ? 'none'
              : `translate3d(0, ${mobileY}px, 0)`,
            willChange: prefersReduced ? 'auto' : 'transform',
          }}
        >
          <div
            className="size-full gpu-accel hero-avatar-reveal-wrapper relative"
            style={{
              opacity: prefersReduced ? 1 : animate ? 1 : 0.05,
              transform: prefersReduced ? 'none' : animate ? 'scale(1)' : 'scale(1.02)',
              transition: prefersReduced
                ? 'none'
                : 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            }}
          >
            <ManagedImage
              slot="homeHero"
              device="mobile"
              priority
              sizes="100vw"
              className="size-full bg-transparent"
            />
          </div>
        </div>
        {/* Difuminado superior y base para integración limpia */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#F3F7FC] to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#F3F7FC] to-transparent z-10" />
      </div>
    </section>
  );
}


