'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Video, Clock, CheckCircle2, HeartHandshake, BookOpen, ShieldCheck } from 'lucide-react';
import { ActionLink } from './action-link';
import { Container } from './container';
import { DoctorPortrait } from './doctor-portrait';
import { ScrollReveal, MaskReveal, EditorialCurtain, LineReveal } from './motion-wrapper';
import { SaludForteFeature } from './salud-forte-feature';
import { MobileCarousel } from './mobile-carousel';

export function HomeSections() {
  return (
    <>
      {/* 
        ========================================================================
        1. SECCIÓN: FILOSOFÍA Y ENFOQUE MÉDICO (Pilares de Atención)
        - Móvil (< 768px): Carrusel horizontal táctil con autoplay suave (5s)
        - Escritorio (>= 768px): Cuadrícula original con entrada escalonada
        ========================================================================
      */}
      <section id="enfoque" className="bg-ivory pt-8 sm:pt-12 lg:pt-14 pb-16 sm:pb-24 lg:pb-28 border-b border-[#B39A6A]/15 overflow-hidden">
        <Container>
          <div className="max-w-3xl">
            {/* Tag de sección desde la izquierda */}
            <ScrollReveal direction="right" distance={32} delay={0.05} duration={0.65}>
              <div className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-champagne" aria-hidden="true" />
                <p className="eyebrow">Enfoque médico</p>
              </div>
            </ScrollReveal>

            {/* Título revelado por máscara editorial */}
            <MaskReveal delay={0.12} duration={0.80} direction="up" distance={26}>
              <h2 className="mt-4 text-balance font-serif text-[clamp(2.4rem,4.5vw,4.5rem)] leading-[0.98] tracking-[-0.035em] text-obsidian">
                Una medicina basada en evidencia, claridad y tiempo para escuchar.
              </h2>
            </MaskReveal>

            {/* Párrafo explicativo */}
            <ScrollReveal direction="up" distance={18} delay={0.20} duration={0.70}>
              <p className="mt-6 text-base sm:text-lg lg:text-xl leading-[1.65] text-obsidian/75">
                Una buena consulta no se limita a emitir una receta. Requiere entender el contexto de cada paciente, explicar con claridad diagnósticos y tratamientos, y construir un plan de salud sostenible.
              </p>
            </ScrollReveal>
          </div>

          {/* 
            CARRUSEL MÓVIL (< 768px): 4 Tarjetas de Enfoque Médico
            Respuesta inmediata con seguimiento del dedo, transición fluida de 310ms (cubic-bezier) e indicadores interactivos
          */}
          <div className="mt-6 md:hidden">
            <MobileCarousel
              id="enfoque-medico"
              ariaLabel="Principios del enfoque médico"
              itemCount={4}
              intervalMs={2000}
              transitionDurationMs={300}
              cardMaxWidth="320px"
            >
              {/* Tarjeta 1: Atención personalizada */}
              <div className="h-full p-4 sm:p-5 rounded-[20px] bg-white border border-[#B39A6A]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-9 rounded-lg bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-3">
                    <Clock className="size-4 text-champagne" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-obsidian font-medium">
                    Atención personalizada
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-obsidian/70">
                    Consultas con tiempo suficiente para profundizar en antecedentes, síntomas y dudas, sin prisas.
                  </p>
                </div>
              </div>

              {/* Tarjeta 2: Criterio basado en evidencia */}
              <div className="h-full p-4 sm:p-5 rounded-[20px] bg-white border border-[#B39A6A]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-9 rounded-lg bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-3">
                    <ShieldCheck className="size-4 text-champagne" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-obsidian font-medium">
                    Criterio basado en evidencia
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-obsidian/70">
                    Recomendaciones y decisiones fundamentadas en la mejor literatura médica y guías clínicas vigentes.
                  </p>
                </div>
              </div>

              {/* Tarjeta 3: Comunicación clara */}
              <div className="h-full p-4 sm:p-5 rounded-[20px] bg-white border border-[#B39A6A]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-9 rounded-lg bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-3">
                    <BookOpen className="size-4 text-champagne" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-obsidian font-medium">
                    Comunicación clara
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-obsidian/70">
                    Explicaciones comprensibles para que comprendas el porqué de cada diagnóstico, estudio o indicación.
                  </p>
                </div>
              </div>

              {/* Tarjeta 4: Prevención y hábitos */}
              <div className="h-full p-4 sm:p-5 rounded-[20px] bg-white border border-[#B39A6A]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-9 rounded-lg bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-3">
                    <HeartHandshake className="size-4 text-champagne" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-obsidian font-medium">
                    Prevención y hábitos
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-obsidian/70">
                    Enfoque proactivo para cuidar tu salud a largo plazo, anticipando riesgos y fomentando un estilo de vida saludable.
                  </p>
                </div>
              </div>
            </MobileCarousel>
          </div>

          {/* 
            CUADRÍCULA ESCRITORIO (>= 768px): 4 Pilares Fundamentales
            Conserva el diseño original, clases, espaciados y animaciones de revelado
          */}
          <div className="mt-14 sm:mt-16 hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Pilar 1 */}
            <ScrollReveal
              direction="up"
              distance={28}
              delay={0.10}
              duration={0.75}
              className="h-full"
            >
              <div className="group h-full p-7 sm:p-8 rounded-2xl bg-white/75 border border-[#B39A6A]/20 shadow-xs flex flex-col justify-between transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:bg-white hover:border-[#B39A6A]/45 hover:shadow-[0_12px_28px_rgba(17,24,32,0.08)]">
                <div>
                  <div className="size-11 rounded-xl bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-5 transition-transform duration-250 group-hover:scale-[1.04]">
                    <Clock className="size-5 text-champagne" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-obsidian font-medium">
                    Atención personalizada
                  </h3>
                  <p className="mt-3 text-sm sm:text-base leading-[1.6] text-obsidian/70">
                    Consultas con tiempo suficiente para profundizar en antecedentes, síntomas y dudas, sin prisas.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Pilar 2 */}
            <ScrollReveal
              direction="up"
              distance={28}
              delay={0.19}
              duration={0.75}
              className="h-full"
            >
              <div className="group h-full p-7 sm:p-8 rounded-2xl bg-white/75 border border-[#B39A6A]/20 shadow-xs flex flex-col justify-between transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:bg-white hover:border-[#B39A6A]/45 hover:shadow-[0_12px_28px_rgba(17,24,32,0.08)]">
                <div>
                  <div className="size-11 rounded-xl bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-5 transition-transform duration-250 group-hover:scale-[1.04]">
                    <ShieldCheck className="size-5 text-champagne" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-obsidian font-medium">
                    Criterio basado en evidencia
                  </h3>
                  <p className="mt-3 text-sm sm:text-base leading-[1.6] text-obsidian/70">
                    Recomendaciones y decisiones fundamentadas en la mejor literatura médica y guías clínicas vigentes.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Pilar 3 */}
            <ScrollReveal
              direction="up"
              distance={28}
              delay={0.28}
              duration={0.75}
              className="h-full"
            >
              <div className="group h-full p-7 sm:p-8 rounded-2xl bg-white/75 border border-[#B39A6A]/20 shadow-xs flex flex-col justify-between transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:bg-white hover:border-[#B39A6A]/45 hover:shadow-[0_12px_28px_rgba(17,24,32,0.08)]">
                <div>
                  <div className="size-11 rounded-xl bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-5 transition-transform duration-250 group-hover:scale-[1.04]">
                    <BookOpen className="size-5 text-champagne" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-obsidian font-medium">
                    Comunicación clara
                  </h3>
                  <p className="mt-3 text-sm sm:text-base leading-[1.6] text-obsidian/70">
                    Explicaciones comprensibles para que comprendas el porqué de cada diagnóstico, estudio o indicación.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Pilar 4 */}
            <ScrollReveal
              direction="up"
              distance={28}
              delay={0.37}
              duration={0.75}
              className="h-full"
            >
              <div className="group h-full p-7 sm:p-8 rounded-2xl bg-white/75 border border-[#B39A6A]/20 shadow-xs flex flex-col justify-between transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:bg-white hover:border-[#B39A6A]/45 hover:shadow-[0_12px_28px_rgba(17,24,32,0.08)]">
                <div>
                  <div className="size-11 rounded-xl bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-5 transition-transform duration-250 group-hover:scale-[1.04]">
                    <HeartHandshake className="size-5 text-champagne" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-obsidian font-medium">
                    Prevención y hábitos
                  </h3>
                  <p className="mt-3 text-sm sm:text-base leading-[1.6] text-obsidian/70">
                    Enfoque proactivo para cuidar tu salud a largo plazo, anticipando riesgos y fomentando un estilo de vida saludable.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        2. SECCIÓN: SALUD FORTE PODCAST
        Revelado de derecha a izquierda con dominante visual fotográfica
        ========================================================================
      */}
      <SaludForteFeature context="home" />

      {/* 
        ========================================================================
        3. SECCIÓN: MODALIDADES DE CONSULTA
        - Móvil (< 768px): Carrusel horizontal táctil de 2 modalidades (8s autoplay)
        - Escritorio (>= 768px): Cuadrícula original de 2 columnas
        ========================================================================
      */}
      <section className="bg-ivory py-14 sm:py-18 lg:py-20 border-b border-[#B39A6A]/15 overflow-hidden">
        <Container className="max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
            {/* Tag centrado */}
            <ScrollReveal direction="down" distance={14} delay={0.05} duration={0.65}>
              <div className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-champagne" aria-hidden="true" />
                <p className="eyebrow">Consulta médica</p>
              </div>
            </ScrollReveal>

            {/* Título de sección */}
            <MaskReveal delay={0.12} duration={0.80} direction="up" distance={24}>
              <h2 className="mt-3.5 text-balance font-serif text-[clamp(2.1rem,3.6vw,3.2rem)] leading-[1.02] tracking-[-0.035em] text-obsidian">
                Opciones de consulta adaptadas a tus necesidades.
              </h2>
            </MaskReveal>

            {/* Subtítulo */}
            <ScrollReveal direction="up" distance={16} delay={0.20} duration={0.70}>
              <p className="mt-4 text-sm sm:text-base lg:text-[1.02rem] leading-[1.6] text-obsidian/75 max-w-[660px]">
                Atención médica profesional, rigurosa y enfocada en tu bienestar, disponible en dos modalidades según tus requerimientos.
              </p>
            </ScrollReveal>

            {/* Línea central sutil en champagne que se expande */}
            <LineReveal
              origin="center"
              delay={0.28}
              duration={0.85}
              className="mt-5 w-16 h-[1.5px] bg-[#B39A6A]/40"
            />
          </div>

          {/* 
            CARRUSEL MÓVIL (< 768px): 2 Modalidades de Consulta
            Respuesta inmediata con seguimiento del dedo, transición fluida de 310ms (cubic-bezier) e indicadores interactivos
          */}
          <div className="mt-6 md:hidden">
            <MobileCarousel
              id="opciones-consulta"
              ariaLabel="Modalidades de consulta médica"
              itemCount={2}
              intervalMs={2000}
              transitionDurationMs={300}
              cardMaxWidth="320px"
            >
              {/* Modalidad 1: Consulta Presencial */}
              <div className="h-full rounded-[20px] bg-white p-5 sm:p-6 border border-[#B39A6A]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-10 rounded-lg bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-3">
                    <Calendar className="size-5 text-champagne" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-obsidian font-medium">
                    Consulta Presencial
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-obsidian/70">
                    Valoración integral en consultorio con exploración física y revisión de estudios.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-obsidian/80">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-champagne shrink-0" />
                      <span>Exploración física</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-champagne shrink-0" />
                      <span>Revisión de estudios</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-champagne shrink-0" />
                      <span>Plan y seguimiento</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-5 pt-4 border-t border-[#B39A6A]/20">
                  <Link
                    href="/agendar?tipo=presencial"
                    className="inline-flex items-center justify-center w-full h-[42px] rounded-full bg-obsidian text-white font-sans text-xs font-semibold uppercase tracking-[0.1em] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#07182A] active:translate-y-0"
                  >
                    Agendar presencial
                  </Link>
                </div>
              </div>

              {/* Modalidad 2: Consulta en Línea */}
              <div className="h-full rounded-[20px] bg-white p-5 sm:p-6 border border-[#B39A6A]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-10 rounded-lg bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-3">
                    <Video className="size-5 text-champagne" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-obsidian font-medium">
                    Consulta en Línea
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-obsidian/70">
                    Consulta por videollamada para orientación, revisión de resultados y seguimiento clínico.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-obsidian/80">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-champagne shrink-0" />
                      <span>Videollamada médica</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-champagne shrink-0" />
                      <span>Revisión de resultados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-champagne shrink-0" />
                      <span>Receta digital cuando corresponda</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-5 pt-4 border-t border-[#B39A6A]/20">
                  <Link
                    href="/agendar?tipo=online"
                    className="inline-flex items-center justify-center w-full h-[42px] rounded-full bg-obsidian text-white font-sans text-xs font-semibold uppercase tracking-[0.1em] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#07182A] active:translate-y-0"
                  >
                    Agendar en línea
                  </Link>
                </div>
              </div>
            </MobileCarousel>
          </div>

          {/* 
            CUADRÍCULA ESCRITORIO (>= 768px): 2 Modalidades de Consulta
            Conserva el diseño original, columnas, espaciados y animaciones de revelado
          */}
          <div className="mt-10 sm:mt-12 hidden md:grid md:grid-cols-2 gap-6 sm:gap-7 max-w-[920px] mx-auto">
            {/* Modalidad 1: Presencial (Entrada desde la izquierda) */}
            <ScrollReveal
              direction="right"
              distance={36}
              delay={0.16}
              duration={0.80}
              className="h-full"
            >
              <div className="group h-full rounded-2xl bg-white p-6 sm:p-7 lg:p-8 border border-[#B39A6A]/25 shadow-xs flex flex-col justify-between transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#B39A6A]/50 hover:shadow-[0_12px_30px_rgba(17,24,32,0.07)]">
                <div>
                  <div className="size-11 sm:size-12 rounded-xl bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-5 transition-transform duration-250 group-hover:scale-[1.04]">
                    <Calendar className="size-5 sm:size-6 text-champagne" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-obsidian font-medium">
                    Consulta Presencial
                  </h3>
                  <p className="mt-3 text-sm leading-[1.65] text-obsidian/70">
                    Valoración clínica integral, exploración física completa, revisión de estudios y diseño de un plan de tratamiento personalizado en consultorio.
                  </p>
                  <ul className="mt-5 space-y-2 text-xs sm:text-sm text-obsidian/80">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 sm:size-4 text-champagne shrink-0" />
                      <span>Exploración física detallada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 sm:size-4 text-champagne shrink-0" />
                      <span>Revisión de estudios de laboratorio</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 sm:size-4 text-champagne shrink-0" />
                      <span>Plan médico y seguimiento personalizado</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-5 border-t border-[#B39A6A]/20">
                  <Link
                    href="/agendar?tipo=presencial"
                    className="inline-flex items-center justify-center w-full h-[46px] sm:h-[48px] rounded-full bg-obsidian text-white font-sans text-xs font-semibold uppercase tracking-[0.1em] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#07182A]"
                  >
                    Agendar presencial
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* Modalidad 2: En Línea (Entrada desde la derecha) */}
            <ScrollReveal
              direction="left"
              distance={36}
              delay={0.24}
              duration={0.80}
              className="h-full"
            >
              <div className="group h-full rounded-2xl bg-white p-6 sm:p-7 lg:p-8 border border-[#B39A6A]/25 shadow-xs flex flex-col justify-between transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#B39A6A]/50 hover:shadow-[0_12px_30px_rgba(17,24,32,0.07)]">
                <div>
                  <div className="size-11 sm:size-12 rounded-xl bg-ivory border border-[#B39A6A]/30 flex items-center justify-center text-obsidian mb-5 transition-transform duration-250 group-hover:scale-[1.04]">
                    <Video className="size-5 sm:size-6 text-champagne" />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-obsidian font-medium">
                    Consulta en Línea
                  </h3>
                  <p className="mt-3 text-sm leading-[1.65] text-obsidian/70">
                    Orientación médica profesional, resolución de dudas, interpretación de resultados y seguimiento clínico desde cualquier lugar con conexión a internet.
                  </p>
                  <ul className="mt-5 space-y-2 text-xs sm:text-sm text-obsidian/80">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 sm:size-4 text-champagne shrink-0" />
                      <span>Videollamada médica segura</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 sm:size-4 text-champagne shrink-0" />
                      <span>Orientación y segunda opinión médica</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 sm:size-4 text-champagne shrink-0" />
                      <span>Receta y recomendaciones digitales</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-5 border-t border-[#B39A6A]/20">
                  <Link
                    href="/agendar?tipo=online"
                    className="inline-flex items-center justify-center w-full h-[46px] sm:h-[48px] rounded-full bg-obsidian text-white font-sans text-xs font-semibold uppercase tracking-[0.1em] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#07182A]"
                  >
                    Agendar en línea
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        4. SECCIÓN: TRAYECTORIA Y COMPROMISO (Sobre Mí)
        - Integración visual médica idéntica al Hero con fondo continuo #F3F7FC.
        - Sin tarjetas, sin marcos, sin esquinas redondeadas ni dobles paneles.
        - Proporción equilibrada: Columna foto (40%) y texto (60%).
        - Fotografía con fondo transparente integrada directamente sobre la sección.
        ========================================================================
      */}
      <section className="relative w-full bg-[#F3F7FC] border-b border-[#B39A6A]/15 overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1220px] px-6 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-10 sm:gap-12 lg:gap-16 items-center">
            
            {/* Columna Izquierda: Fotografía transparente integrada directamente sobre el fondo */}
            <div className="flex justify-center items-end w-full">
              <ScrollReveal direction="up" distance={20} delay={0.10} duration={0.75} className="w-full flex justify-center">
                <div className="w-full max-w-[min(88vw,360px)] lg:max-w-[440px] aspect-[3/4] relative bg-transparent overflow-visible">
                  <DoctorPortrait
                    variant="about"
                    className="size-full bg-transparent overflow-visible"
                    imgClassName="size-full object-contain object-bottom"
                  />
                </div>
              </ScrollReveal>
            </div>

            {/* Columna Derecha: Bloque de texto editorial */}
            <div className="flex flex-col justify-center">
              <div className="max-w-2xl">
                {/* Eyebrow */}
                <ScrollReveal direction="up" distance={14} delay={0.08} duration={0.65}>
                  <div className="inline-flex items-center gap-2 mb-3.5">
                    <span className="size-2 rounded-full bg-champagne" aria-hidden="true" />
                    <p className="eyebrow">Trayectoria y compromiso</p>
                  </div>
                </ScrollReveal>
                
                {/* Nombre completo con máscara vertical */}
                <MaskReveal delay={0.15} duration={0.80} direction="up" distance={20}>
                  <h2 className="text-balance font-serif text-[clamp(2rem,3vw,2.85rem)] leading-[1.04] tracking-[-0.03em] text-obsidian">
                    Dr. Mauricio Benjamín Galindo López
                  </h2>
                </MaskReveal>

                {/* Título profesional en champagne */}
                <ScrollReveal direction="right" distance={16} delay={0.22} duration={0.70}>
                  <p className="mt-2.5 font-sans text-sm sm:text-base font-semibold uppercase tracking-wider text-champagne">
                    Médico Cirujano · Educador en Salud
                  </p>
                </ScrollReveal>

                {/* Párrafo 1 */}
                <ScrollReveal direction="up" distance={14} delay={0.30} duration={0.70}>
                  <p className="mt-5 text-base leading-[1.75] text-obsidian/75 sm:text-[1.06rem]">
                    Egresado del Tecnológico de Monterrey, con Cédula Profesional 15851723. Integra atención clínica y educación en salud para que cada paciente comprenda sus opciones y participe en sus decisiones.
                  </p>
                </ScrollReveal>
                
                {/* Párrafo 2 */}
                <ScrollReveal direction="up" distance={14} delay={0.36} duration={0.70}>
                  <p className="mt-4 text-base leading-[1.75] text-obsidian/70 sm:text-[1.06rem]">
                    Mediante consulta presencial, atención en línea y Salud Forte, promueve prevención, pensamiento crítico y hábitos basados en evidencia.
                  </p>
                </ScrollReveal>

                {/* Línea divisoria y llamada a la acción */}
                <div className="mt-8 pt-5 border-t border-[#B39A6A]/20 flex flex-col gap-4">
                  <ScrollReveal direction="up" distance={12} delay={0.42} duration={0.65}>
                    <ActionLink href="/sobre-mi">Conocer trayectoria completa</ActionLink>
                  </ScrollReveal>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

