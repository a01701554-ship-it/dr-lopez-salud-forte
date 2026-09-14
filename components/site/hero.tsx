'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { usePrefersReducedMotion } from './motion-wrapper';

export function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const photoMediaRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  // Monitor responsive desktop breakpoint (>= 1024px)
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop, { passive: true });
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Discrete, elegant desktop-only vertical parallax (range bounded to ±28px)
  useEffect(() => {
    if (prefersReduced || !isDesktop) {
      if (photoMediaRef.current) {
        photoMediaRef.current.style.transform = 'none';
      }
      return;
    }

    let rafId: number | null = null;
    let targetY = 0;
    let currentY = 0;
    let isHeroVisible = true;

    // IntersectionObserver to pause calculations when Hero is out of viewport
    let observer: IntersectionObserver | null = null;
    if (heroRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isHeroVisible = entry.isIntersecting;
          });
        },
        { threshold: 0 }
      );
      observer.observe(heroRef.current);
    }

    const onScroll = () => {
      if (!isHeroVisible || !heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      // Distance scrolled past top of hero
      const scrollY = -rect.top;
      // Map scroll progress to subtle travel within [-28px, +28px]
      const rawY = scrollY * -0.09;
      targetY = Math.max(-28, Math.min(28, rawY));
    };

    const renderLoop = () => {
      // Lerp smooth interpolation factor
      currentY += (targetY - currentY) * 0.09;

      if (photoMediaRef.current) {
        photoMediaRef.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      if (photoMediaRef.current) {
        photoMediaRef.current.style.transform = 'none';
      }
    };
  }, [prefersReduced, isDesktop]);

  const animate = !prefersReduced && isLoaded;

  return (
    <section
      ref={heroRef}
      aria-label="Dr. Mauricio Galindo — Médico Cirujano"
      className="relative w-full bg-[#F3F7FC] overflow-hidden min-h-0 flex flex-col justify-start"
    >
      {/* 
        ========================================================================
        HERO PRINCIPAL CON FOTOGRAFÍA REAL INTEGRADA DIRECTA (ESTILO DOCTOR MIKE)
        - Fondo único y continuo (#F3F7FC) en toda la sección.
        - Persona recortada integrada sobre el fondo (sin recuadro, sin marco, sin líneas).
        - Desvanecido inferior progresivo por debajo de las manos y el reloj.
        - Parallax vertical muy discreto (±28px) activo solo en computadora.
        - Teléfono: composición vertical limpia, compacta y estable.
        ========================================================================
      */}
      <div className="relative z-10 mx-auto max-w-[1728px] w-full px-5 sm:px-10 lg:px-14 xl:px-20 pt-6 sm:pt-9 lg:pt-11 xl:pt-12 pb-6 sm:pb-8 lg:pb-9 xl:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[50%_50%] xl:grid-cols-[52%_48%] 2xl:grid-cols-[52%_48%] gap-y-6 lg:gap-x-10 xl:gap-x-14 items-end">
          
          {/* ------------------------------------------------------------------
              COLUMNA DE TEXTO PRINCIPAL + CREDENCIALES
              ------------------------------------------------------------------ */}
          <div className="w-full flex flex-col justify-center relative z-10 lg:max-w-[620px] xl:max-w-[680px]">
            
            {/* 1. Distintivo profesional (Eyebrow) */}
            <div
              className="gpu-accel mb-4 sm:mb-6"
              style={{
                opacity: prefersReduced ? 1 : animate ? 1 : 0,
                transform: prefersReduced ? 'none' : animate ? 'translate3d(0, 0, 0)' : 'translate3d(-28px, 0, 0)',
                transition: prefersReduced ? 'none' : 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.05s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.05s',
              }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-[#162039]/10 shadow-xs backdrop-blur-xs">
                <span className="size-2 rounded-full bg-[#48A4F5]" aria-hidden="true" />
                <span className="font-sans text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.12em] text-[#162039]/90">
                  Dr. Mauricio Galindo · Médico Cirujano
                </span>
              </div>
            </div>

            {/* 2. Encabezado Principal (Título) */}
            <div className="overflow-hidden">
              <h1
                className="font-sans font-extrabold text-[clamp(30px,3.8vw,60px)] leading-[1.1] tracking-[-0.03em] text-[#162039] text-balance gpu-accel"
                style={{
                  opacity: prefersReduced ? 1 : animate ? 1 : 0,
                  transform: prefersReduced ? 'none' : animate ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
                  transition: prefersReduced ? 'none' : 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.12s, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.12s',
                }}
              >
                Entiende tu salud. Decide con confianza.
              </h1>
            </div>

            {/* 3. Párrafo de Apoyo (Descripción) */}
            <p
              className="mt-4 sm:mt-6 font-sans font-normal text-[clamp(15px,1.15vw,20px)] leading-[1.6] text-[#162039]/80 max-w-[620px] text-pretty gpu-accel"
              style={{
                opacity: prefersReduced ? 1 : animate ? 1 : 0,
                transform: prefersReduced ? 'none' : animate ? 'translate3d(0, 0, 0)' : 'translate3d(0, 18px, 0)',
                transition: prefersReduced ? 'none' : 'opacity 0.70s cubic-bezier(0.22, 1, 0.36, 1) 0.20s, transform 0.70s cubic-bezier(0.22, 1, 0.36, 1) 0.20s',
              }}
            >
              El Dr. Mauricio Galindo combina criterio clínico riguroso, atención médica personalizada y divulgación basada en evidencia para ayudarte a tomar mejores decisiones sobre tu bienestar.
            </p>

            {/* 4. Botones de Acción (CTAs) */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <div
                className="gpu-accel"
                style={{
                  opacity: prefersReduced ? 1 : animate ? 1 : 0,
                  transform: prefersReduced ? 'none' : animate ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
                  transition: prefersReduced ? 'none' : 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.28s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.28s',
                }}
              >
                <Link
                  href="/agendar"
                  className="group/cta inline-flex items-center justify-center gap-3 h-[52px] sm:h-[60px] px-8 sm:px-9 rounded-full bg-[#162039] text-white font-sans text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.08em] shadow-[0_8px_22px_rgba(22,32,57,0.25)] transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#0c1324] hover:shadow-[0_12px_28px_rgba(22,32,57,0.35)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#162039] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F3F7FC] text-center w-full sm:w-auto cursor-pointer"
                >
                  <span>Agendar consulta</span>
                  <ArrowRight className="size-4 stroke-[2.5] transition-transform duration-200 group-hover/cta:translate-x-1" />
                </Link>
              </div>

              <div
                className="gpu-accel"
                style={{
                  opacity: prefersReduced ? 1 : animate ? 1 : 0,
                  transform: prefersReduced ? 'none' : animate ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
                  transition: prefersReduced ? 'none' : 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.35s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.35s',
                }}
              >
                <Link
                  href="/sobre-mi"
                  className="inline-flex items-center justify-center h-[52px] sm:h-[60px] px-7 sm:px-8 rounded-full bg-white/90 border border-[#162039]/15 text-[#162039] font-sans text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:border-[#162039]/30 hover:shadow-sm active:translate-y-0 text-center w-full sm:w-auto cursor-pointer"
                >
                  Conoce mi enfoque
                </Link>
              </div>
            </div>

            {/* 5. Credenciales Profesionales (Separador superior preservado intacto) */}
            <div className="mt-6 sm:mt-7 pt-5 sm:pt-6 border-t border-[#162039]/10 relative max-w-[640px]">
              <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-3">
                <div
                  className="flex items-center gap-2.5 text-[#162039]/85 font-sans text-[13px] sm:text-[13.5px] gpu-accel"
                  style={{
                    opacity: prefersReduced ? 1 : animate ? 1 : 0,
                    transform: prefersReduced ? 'none' : animate ? 'translate3d(0, 0, 0)' : 'translate3d(0, 12px, 0)',
                    transition: prefersReduced ? 'none' : 'opacity 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.42s, transform 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.42s',
                  }}
                >
                  <CheckCircle2 className="size-4 sm:size-[18px] text-[#48A4F5] shrink-0 stroke-[2.5]" />
                  <span className="leading-snug font-medium">Tecnológico de Monterrey</span>
                </div>
                <div
                  className="flex items-center gap-2.5 text-[#162039]/85 font-sans text-[13px] sm:text-[13.5px] gpu-accel"
                  style={{
                    opacity: prefersReduced ? 1 : animate ? 1 : 0,
                    transform: prefersReduced ? 'none' : animate ? 'translate3d(0, 0, 0)' : 'translate3d(0, 12px, 0)',
                    transition: prefersReduced ? 'none' : 'opacity 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.49s, transform 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.49s',
                  }}
                >
                  <ShieldCheck className="size-4 sm:size-[18px] text-[#48A4F5] shrink-0 stroke-[2.5]" />
                  <span className="leading-snug font-medium">Cédula Prof. 15851723</span>
                </div>
                <div
                  className="flex items-center gap-2.5 text-[#162039]/85 font-sans text-[13px] sm:text-[13.5px] gpu-accel"
                  style={{
                    opacity: prefersReduced ? 1 : animate ? 1 : 0,
                    transform: prefersReduced ? 'none' : animate ? 'translate3d(0, 0, 0)' : 'translate3d(0, 12px, 0)',
                    transition: prefersReduced ? 'none' : 'opacity 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.56s, transform 0.60s cubic-bezier(0.22, 1, 0.36, 1) 0.56s',
                  }}
                >
                  <CheckCircle2 className="size-4 sm:size-[18px] text-[#48A4F5] shrink-0 stroke-[2.5]" />
                  <span className="leading-snug font-medium">Presencial y en línea</span>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------
              COLUMNA DERECHA: FOTOGRAFÍA REAL INTEGRADA (ESTILO DOCTOR MIKE)
              - Persona integrada directamente sobre el fondo (sin marco ni caja visible).
              - Desvanecido inferior progresivo exclusivamente por debajo de las manos.
              - Parallax vertical discreto (±28px) en computadora.
              - Estable y sin movimiento en móvil (< 1024px).
              ------------------------------------------------------------------ */}
          <div className="w-full flex justify-center lg:justify-end items-end relative z-0 mt-2 lg:mt-0 bg-transparent border-0 outline-0 shadow-none">
            <div
              ref={photoMediaRef}
              className="w-[min(84vw,360px)] lg:w-[clamp(410px,36vw,530px)] xl:w-[clamp(450px,38vw,580px)] max-w-full my-2 lg:my-0 relative bg-transparent border-0 outline-0 shadow-none will-change-transform"
              style={{
                opacity: prefersReduced ? 1 : animate ? 1 : 0.05,
                transition: prefersReduced ? 'none' : 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.25s',
              }}
            >
              <img
                src="/images/doctor-mauricio-hero-cutout-clean-v3.png"
                alt="Dr. Mauricio Galindo, médico cirujano"
                width={1068}
                height={1250}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="block w-full h-auto aspect-[1068/1250] object-contain object-bottom mx-auto border-0 outline-0 shadow-none"
                style={{
                  WebkitMaskImage:
                    'linear-gradient(to bottom, #000 0%, #000 78%, rgba(0, 0, 0, 0.96) 83%, rgba(0, 0, 0, 0.72) 88%, rgba(0, 0, 0, 0.32) 94%, transparent 100%)',
                  maskImage:
                    'linear-gradient(to bottom, #000 0%, #000 78%, rgba(0, 0, 0, 0.96) 83%, rgba(0, 0, 0, 0.72) 88%, rgba(0, 0, 0, 0.32) 94%, transparent 100%)',
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== '/images/doctor-mauricio-hero-real-clean-v3.png') {
                    target.src = '/images/doctor-mauricio-hero-real-clean-v3.png';
                  }
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


