'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Video, Clock, CheckCircle2, HeartHandshake, BookOpen, ShieldCheck } from 'lucide-react';
import { ActionLink } from './action-link';
import { Container } from './container';
import { DoctorPortrait } from './doctor-portrait';
import { ScrollReveal, MaskReveal, EditorialCurtain, LineReveal } from './motion-wrapper';
import { SaludForteFeature } from './salud-forte-feature';

export function HomeSections() {
  return (
    <>
      {/* 
        ========================================================================
        1. SECCIÓN: FILOSOFÍA Y ENFOQUE MÉDICO (Pilares de Atención)
        Entrada en ola de izquierda a derecha con 90ms de desfase
        ========================================================================
      */}
      <section id="enfoque" className="bg-ivory py-20 sm:py-28 lg:py-32 border-b border-[#B39A6A]/15 overflow-hidden">
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

          {/* 4 Pilares Fundamentales: Entrada en ola de izquierda a derecha */}
          <div className="mt-14 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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
        Revelado simétrico desde el centro con tarjeta compacta
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

          <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 max-w-[920px] mx-auto">
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
                    href="/agendar"
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
                    href="/agendar"
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
        Revelado de fotografía con efecto cortina editorial (doble panel dividido)
        ========================================================================
      */}
      <section className="bg-white border-b border-[#B39A6A]/15 overflow-hidden">
        <div className="mx-auto grid max-w-[1728px] lg:grid-cols-2">
          {/* Fotografía con revelado tipo cortina editorial */}
          <EditorialCurtain
            curtainColor="#ffffff"
            delay={0.10}
            className="w-full"
          >
            <DoctorPortrait
              variant="about"
              className="min-h-[520px] lg:min-h-[720px]"
            />
          </EditorialCurtain>

          {/* Bloque de texto editorial (Columna derecha) */}
          <div className="flex items-center px-6 py-20 sm:px-12 sm:py-24 lg:px-16 xl:px-20">
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <ScrollReveal direction="up" distance={16} delay={0.08} duration={0.65}>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="size-2 rounded-full bg-champagne" aria-hidden="true" />
                  <p className="eyebrow">Trayectoria y compromiso</p>
                </div>
              </ScrollReveal>
              
              {/* Nombre completo con máscara vertical */}
              <MaskReveal delay={0.15} duration={0.80} direction="up" distance={24}>
                <h2 className="text-balance font-serif text-[clamp(2.5rem,4.5vw,4.5rem)] leading-[0.94] tracking-[-0.035em] text-obsidian">
                  Dr. Mauricio Benjamín Galindo López
                </h2>
              </MaskReveal>

              {/* Título profesional en champagne */}
              <ScrollReveal direction="right" distance={20} delay={0.22} duration={0.70}>
                <p className="mt-3 font-sans text-sm sm:text-base font-semibold uppercase tracking-wider text-champagne">
                  Médico Cirujano · Educador en Salud
                </p>
              </ScrollReveal>

              {/* Párrafo 1 */}
              <ScrollReveal direction="up" distance={16} delay={0.30} duration={0.70}>
                <p className="mt-6 text-base leading-[1.8] text-obsidian/75 sm:text-lg">
                  Egresado del Tecnológico de Monterrey con Cédula Profesional 15851723. Su práctica médica integra la atención clínica con la educación en salud, con el objetivo de que cada paciente comprenda su condición y participe activamente en las decisiones sobre su bienestar.
                </p>
              </ScrollReveal>
              
              {/* Párrafo 2 */}
              <ScrollReveal direction="up" distance={16} delay={0.38} duration={0.70}>
                <p className="mt-5 text-base leading-[1.8] text-obsidian/70 sm:text-lg">
                  A través de la consulta presencial y en línea, y del proyecto Salud Forte, promueve una cultura de prevención, pensamiento crítico en salud y hábitos fundamentados en la evidencia científica.
                </p>
              </ScrollReveal>

              {/* Línea divisoria y llamada a la acción */}
              <div className="mt-9 pt-6 border-t border-[#B39A6A]/20 flex flex-col gap-4">
                <ScrollReveal direction="up" distance={14} delay={0.46} duration={0.65}>
                  <ActionLink href="/sobre-mi">Conocer trayectoria completa</ActionLink>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

