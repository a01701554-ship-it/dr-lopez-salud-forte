'use client';

import React, { useState } from 'react';
import { Container } from '@/components/site/container';
import { INITIAL_COURSES } from '@/lib/academy/db';
import { useCart } from '@/lib/shopify/cart-context';
import {
  InstructorCompactBadge,
  InstructorOfficialSection,
} from '@/components/academia/instructor-portrait';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  PlayCircle,
  Lock,
  ChevronDown,
  Info,
  UserCheck,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface MasterclassDetailPageProps {
  params?: { slug?: string };
  slugProp?: string;
}

export default function MasterclassDetailPage({ params, slugProp }: MasterclassDetailPageProps) {
  const slug = slugProp || params?.slug || 'menopausia-con-claridad';
  const { addItem, isShopifyConnected } = useCart();

  // Find course in database
  const course = INITIAL_COURSES.find((c) => c.slug === slug) || INITIAL_COURSES[0];

  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [imageError, setImageError] = useState(false);

  const toggleModule = (index: number) => {
    setOpenModuleIndex(openModuleIndex === index ? null : index);
  };

  return (
    <div className="bg-ivory min-h-screen text-obsidian">
      {/* 
        ========================================================================
        1. HERO DE VENTA (DOS COLUMNAS EN ESCRITORIO)
        ========================================================================
      */}
      <section className="pt-28 pb-14 sm:pt-36 sm:pb-20 border-b border-[#B39A6A]/20 bg-[#F9F7F2]">
        <Container className="max-w-[1180px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Columna Izquierda: Información Editorial */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B39A6A]/15 text-[#8A7347] text-[11px] font-semibold uppercase tracking-[0.14em]">
                <span>{course.categoryLabel}</span>
                <span>•</span>
                <span>Academia Salud Forte</span>
              </div>

              <h1 className="mt-4 font-serif text-[clamp(2.1rem,4vw,3.6rem)] leading-[1.02] tracking-[-0.03em] text-obsidian font-medium">
                {course.title}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-obsidian/75 leading-[1.6]">
                {course.subtitle || course.shortDescription}
              </p>

              {/* Ficha técnica rápida */}
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-obsidian/70 py-3.5 px-4 rounded-xl bg-white border border-[#B39A6A]/20">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-champagne" />
                  <span>{course.durationMinutes} minutos totales</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="size-4 text-champagne" />
                  <span>{course.lessonCount} lecciones</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-champagne" />
                  <span>Acceso vitalicio</span>
                </div>
              </div>

              {/* Instructor badge oficial */}
              <div className="mt-6">
                <InstructorCompactBadge />
              </div>
            </div>

            {/* Columna Derecha: Tarjeta de Compra Sticky */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-white border border-[#B39A6A]/35 shadow-lg overflow-hidden p-6 sm:p-7 sticky top-24">
                {/* Portada en miniatura con relación 8/5 */}
                <div className="relative aspect-[8/5] rounded-xl overflow-hidden mb-6 border border-[#B39A6A]/20 bg-[#0D2235]">
                  {!imageError ? (
                    <picture className="w-full h-full block">
                      <source
                        srcSet={course.image || course.coverImage}
                        type="image/webp"
                      />
                      <img
                        src={course.imageFallback || course.coverImage}
                        alt={course.imageAlt || course.coverAlt || course.title}
                        width={course.imageWidth || 1586}
                        height={course.imageHeight || 992}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                    </picture>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0D2235] via-[#111820] to-[#0A1624] flex flex-col items-center justify-center p-6 text-center select-none">
                      <div className="absolute inset-3 border border-white/10 rounded-xl pointer-events-none" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="size-2 rounded-full bg-[#B39A6A] mb-2" />
                        <span className="font-serif text-sm text-[#F5F3EE] font-medium leading-tight max-w-[90%] line-clamp-2">
                          {course.title}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D2235]/80 backdrop-blur-md text-[11px] font-semibold text-white shadow-xs border border-white/20">
                      <PlayCircle className="size-3.5 text-champagne" />
                      Clase de muestra disponible
                    </span>
                  </div>
                </div>

                {/* Precios oficiales */}
                <div className="mb-5">
                  <div className="text-xs uppercase font-semibold tracking-wider text-obsidian/50">
                    Inversión única
                  </div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="font-serif text-3xl sm:text-4xl font-semibold text-obsidian">
                      ${course.price.toLocaleString('es-MX')} {course.currency}
                    </span>
                    {course.compareAtPrice && course.compareAtPrice > course.price && (
                      <span className="text-sm sm:text-base line-through text-obsidian/45">
                        ${course.compareAtPrice.toLocaleString('es-MX')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Licencia personal individual · Sin mensualidades recurrentes
                  </p>
                </div>

                {/* Botón Añadir a la bolsa / Compra disponible próximamente */}
                {isShopifyConnected ? (
                  <button
                    onClick={() => addItem(course)}
                    className="flex items-center justify-center gap-2 w-full h-[52px] rounded-full bg-obsidian text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] shadow-md hover:bg-[#07182A] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    <ShoppingBag className="size-4" />
                    <span>Añadir al carrito</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full h-[52px] rounded-full bg-obsidian/15 text-obsidian/55 text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] cursor-not-allowed select-none border border-obsidian/10"
                    title="La pasarela de pago oficial se habilitará próximamente"
                  >
                    <Clock className="size-4 text-obsidian/40" />
                    <span>Compra disponible próximamente</span>
                  </button>
                )}

                {/* Enlace ya comprada */}
                <div className="mt-4 text-center">
                  <a
                    href="/academia/mis-masterclasses"
                    className="text-xs text-obsidian/70 hover:text-obsidian underline transition-colors"
                  >
                    ¿Ya la compraste? Inicia sesión aquí
                  </a>
                </div>

                {/* Garantías y Seguridad */}
                <div className="mt-6 pt-5 border-t border-[#B39A6A]/15 space-y-2 text-xs text-obsidian/70">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-champagne shrink-0" />
                    <span>
                      {isShopifyConnected ? 'Pago seguro y cifrado' : 'Compra disponible próximamente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-champagne shrink-0" />
                    <span>Incluye materiales de apoyo en PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        2. QUÉ APRENDERÁS (OBJETIVOS EDUCATIVOS CONCRETOS)
        ========================================================================
      */}
      <section className="py-16 sm:py-24 border-b border-[#B39A6A]/15">
        <Container className="max-w-[1000px] mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-obsidian font-medium tracking-tight">
              Qué aprenderás en esta masterclass
            </h2>
            <p className="mt-2 text-sm sm:text-base text-obsidian/70">
              Conocimiento fisiológico y práctico para tomar decisiones con evidencia científica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {course.learningOutcomes.map((outcome, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-5 rounded-2xl bg-white border border-[#B39A6A]/20 shadow-xs"
              >
                <CheckCircle2 className="size-5 text-champagne shrink-0 mt-0.5" />
                <p className="text-sm text-obsidian/85 leading-relaxed">{outcome}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        3. TEMARIO Y PROGRAMA COMPLETO (ACORDEONES ACCESIBLES)
        ========================================================================
      */}
      <section className="py-16 sm:py-24 border-b border-[#B39A6A]/15 bg-[#FAF8F5]">
        <Container className="max-w-[1000px] mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-obsidian font-medium tracking-tight">
              Temario y contenido del programa
            </h2>
            <p className="mt-2 text-sm text-obsidian/70">
              Lecciones estructuradas paso a paso con acceso secuencial y materiales descargables.
            </p>
          </div>

          <div className="space-y-4">
            {course.modules?.map((module, modIdx) => (
              <div
                key={module.id}
                className="rounded-2xl bg-white border border-[#B39A6A]/25 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => toggleModule(modIdx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-[#FAF8F5] transition-colors"
                  aria-expanded={openModuleIndex === modIdx}
                >
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-obsidian">
                      {module.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-obsidian/65 mt-0.5">
                      {module.description}
                    </p>
                  </div>
                  <ChevronDown
                    className={`size-5 text-champagne shrink-0 transition-transform duration-200 ${
                      openModuleIndex === modIdx ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openModuleIndex === modIdx && (
                  <div className="px-6 pb-5 pt-2 border-t border-[#B39A6A]/15 divide-y divide-[#B39A6A]/10">
                    {module.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="py-3.5 flex items-center justify-between gap-4 text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-3">
                          {lesson.isPreview ? (
                            <PlayCircle className="size-4 text-champagne shrink-0" />
                          ) : (
                            <Lock className="size-4 text-obsidian/40 shrink-0" />
                          )}
                          <div>
                            <div className="font-medium text-obsidian">{lesson.title}</div>
                            <div className="text-[11px] text-obsidian/60 mt-0.5">{lesson.summary}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {lesson.isPreview ? (
                            <a
                              href={`/academia/${course.slug}/leccion/${lesson.slug}`}
                              className="px-2.5 py-1 rounded-full bg-champagne/20 text-[#8A7347] text-[11px] font-semibold uppercase tracking-wider hover:bg-champagne/30 transition-colors"
                            >
                              Ver muestra
                            </a>
                          ) : (
                            <span className="text-[11px] text-obsidian/45">
                              {Math.round(lesson.durationSeconds / 60)} min
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        4. PERFIL DEL INSTRUCTOR OFICIAL
        ========================================================================
      */}
      <InstructorOfficialSection />

      {/* 
        ========================================================================
        5. AVISO MÉDICO ÉTICO
        ========================================================================
      */}
      <section className="py-12 bg-[#E9E6DF]/50 border-b border-[#B39A6A]/20">
        <Container className="max-w-[880px] mx-auto px-5 sm:px-8">
          <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-white border border-[#B39A6A]/25 text-xs text-obsidian/80">
            <Info className="size-5 text-champagne shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm text-obsidian font-semibold">
                Aviso de Responsabilidad Médica y Ética
              </strong>
              <p className="leading-relaxed">{course.disclaimerLong}</p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
