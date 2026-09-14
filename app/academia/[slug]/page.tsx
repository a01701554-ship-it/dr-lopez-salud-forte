'use client';

import { useState } from 'react';


import { 
  PlayCircle, Lock, ArrowRight, ShieldCheck, FileText, ChevronDown, CheckCircle2, 
  GraduationCap, Clock, AlertCircle, Info, XCircle, Users, Check, BrainCircuit
} from 'lucide-react';
import { Container } from '@/components/site/container';

import { InstructorOfficialSection } from '@/components/academia/instructor-portrait';
import { INITIAL_COURSES } from '@/lib/academy/db';
import { Course } from '@/lib/academy/types';

export default function MasterclassDetailPage({ slugProp }: { slugProp?: string }) {
  // Use slugProp if provided, otherwise try to extract from window.location
  const currentSlug = slugProp || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '');
  const course = INITIAL_COURSES.find((c) => c.slug === currentSlug) as Course | undefined;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Masterclass no encontrada.</p>
      </div>
    );
  }

  const isShopifyConnected = !!course.shopifyProductGid;
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleModule = (index: number) => {
    setOpenModuleIndex(openModuleIndex === index ? null : index);
  };
  
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const hasAccess = false;
  const isFree = course.accessType === 'free';
  const isComingSoon = course.launchStatus === 'coming_soon';

  return (
    <div className="min-h-screen bg-sand-50 selection:bg-champagne/30 font-sans">
      

      {/* 1. HERO Y CONTEXTO EDUCATIVO */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-[#B39A6A]/15 overflow-hidden">
        <Container className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7">
              {/* Etiqueta de Categoría y Nivel */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-[#B39A6A]/10 text-xs font-semibold uppercase tracking-wider text-[#8A7347] border border-[#B39A6A]/20">
                  {course.categoryLabel}
                </span>
                <span className="px-3 py-1 rounded-full bg-obsidian/5 text-xs font-semibold uppercase tracking-wider text-obsidian/70 border border-obsidian/10">
                  Nivel {course.level}
                </span>
                {isComingSoon && (
                  <span className="px-3 py-1 rounded-full bg-emerald-800 text-xs font-semibold uppercase tracking-wider text-white">
                    Próximamente
                  </span>
                )}
              </div>

              {/* Título Principal */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-obsidian font-medium leading-[1.15] tracking-tight text-balance">
                {course.title}
              </h1>
              
              <p className="mt-5 text-lg text-obsidian/80 leading-relaxed text-balance">
                {course.subtitle}
              </p>
              
              <p className="mt-4 text-sm text-obsidian/60 leading-relaxed max-w-[90%]">
                {course.shortDescription}
              </p>

              {/* Datos de contexto */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm text-obsidian/70 font-medium border-t border-[#B39A6A]/15 pt-6">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-champagne" />
                  {course.durationMinutes} minutos de contenido
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <PlayCircle className="size-4 text-champagne" />
                  {course.lessonCount} lecciones de video
                </span>
              </div>
            </div>

            {/* Tarjeta Flotante (Sales / Preview) */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl bg-white border border-[#B39A6A]/25 p-5 shadow-sm sticky top-28">
                {/* Imagen del Curso */}
                <div className="relative aspect-video rounded-xl overflow-hidden mb-6 bg-[#0A1624]">
                  {course.coverImage ? (
                    <img src={course.coverImage} alt={course.coverAlt || course.title} className="w-full h-full object-cover object-center" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className="size-2 rounded-full bg-[#B39A6A] mb-2.5" />
                      <span className="font-serif text-base text-[#F5F3EE] font-medium leading-tight">
                        {course.title}
                      </span>
                    </div>
                  )}
                  {course.previewEnabled && (
                    <div className="absolute inset-0 bg-obsidian/20 flex items-center justify-center group-hover:bg-obsidian/30 transition-colors cursor-pointer pointer-events-none">
                      <div className="size-14 rounded-full bg-white/90 flex items-center justify-center backdrop-blur-md shadow-lg border border-white/40">
                        <PlayCircle className="size-6 text-[#8A7347] ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Precios */}
                <div className="mb-6">
                  {isFree ? (
                    <div className="font-serif text-3xl text-emerald-800 font-medium">Gratis</div>
                  ) : (
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-3xl text-obsidian font-medium">
                        ${course.price.toLocaleString('es-MX')} {course.currency}
                      </span>
                      {Boolean(course.compareAtPrice && course.compareAtPrice > course.price) && (
                        <span className="text-sm line-through text-obsidian/45">
                          ${course.compareAtPrice?.toLocaleString('es-MX')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Botones de acción principales */}
                {isComingSoon ? (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full h-[52px] rounded-full bg-obsidian/15 text-obsidian/55 text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] cursor-not-allowed select-none border border-obsidian/10"
                  >
                    <Clock className="size-4 text-obsidian/40" />
                    <span>Próximamente</span>
                  </button>
                ) : isShopifyConnected || isFree ? (
                  <a
                    href={isFree ? `/cuenta/registro?redirect=/academia/${course.slug}` : `/api/checkout?course=${course.id}`}
                    className="flex items-center justify-center gap-2 w-full h-[52px] rounded-full bg-emerald-800 text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] hover:bg-emerald-900 transition-colors shadow-xs"
                  >
                    <GraduationCap className="size-4" />
                    <span>{course.ctaLabel || (isFree ? 'Inscribirme Gratis' : 'Comprar ahora')}</span>
                  </a>
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
                
                {/* Garantías */}
                <div className="mt-6 pt-5 border-t border-[#B39A6A]/15 space-y-2 text-xs text-obsidian/70">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-champagne shrink-0" />
                    <span>{isShopifyConnected || isFree ? 'Acceso seguro' : 'Próximamente'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-champagne shrink-0" />
                    <span>Incluye materiales de apoyo descargables</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. PRESENTACIÓN */}
      <section className="py-16 sm:py-24 border-b border-[#B39A6A]/15 bg-white">
        <Container className="max-w-[800px] mx-auto px-5 sm:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium tracking-tight mb-6">
            La realidad de este tema
          </h2>
          <div className="prose prose-sm sm:prose-base prose-p:text-obsidian/75 prose-p:leading-relaxed text-obsidian/80">
            {course.description.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. TAL VEZ TE HA PASADO */}
      {course.recognitionPoints && course.recognitionPoints.length > 0 && (
        <section className="py-16 sm:py-24 border-b border-[#B39A6A]/15 bg-[#FAF8F5]">
          <Container className="max-w-[1000px] mx-auto px-5 sm:px-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium tracking-tight mb-10 text-center">
              Tal vez te ha pasado
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {course.recognitionPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-5 rounded-2xl bg-white border border-[#B39A6A]/20 shadow-xs">
                  <BrainCircuit className="size-5 text-champagne shrink-0 mt-0.5" />
                  <p className="text-sm text-obsidian/85 leading-relaxed italic">"{point.replace(/^“|”$/g, '')}"</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 4 y 5. TRANSFORMACIÓN Y PROMESA */}
      {course.beforeState && course.afterState && course.salesPromise && (
        <section className="py-16 sm:py-24 border-b border-[#B39A6A]/15 bg-white">
          <Container className="max-w-[1000px] mx-auto px-5 sm:px-8">
            <div className="max-w-3xl mx-auto mb-14 text-center">
              <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium tracking-tight mb-4">
                El objetivo de esta masterclass
              </h2>
              <p className="text-base sm:text-lg text-emerald-800 font-medium">
                {course.salesPromise}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              <div className="p-8 rounded-2xl bg-obsidian/5 border border-obsidian/10">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-obsidian/60 mb-6 flex items-center gap-2">
                  <XCircle className="size-5" /> Dejarás atrás
                </h3>
                <ul className="space-y-4">
                  {course.beforeState.map((state, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-obsidian/75">
                      <span className="text-obsidian/40 mt-0.5">•</span>
                      {state}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 rounded-2xl bg-[#E8F3ED] border border-emerald-900/10">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-800 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="size-5" /> Para enfocarte en
                </h3>
                <ul className="space-y-4">
                  {course.afterState.map((state, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-obsidian/85">
                      <Check className="size-4 text-emerald-700 shrink-0 mt-0.5" />
                      {state}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 6. QUÉ APRENDERÁS */}
      <section className="py-16 sm:py-24 border-b border-[#B39A6A]/15 bg-[#FAF8F5]">
        <Container className="max-w-[1000px] mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-obsidian font-medium tracking-tight">
              Qué aprenderás en esta masterclass
            </h2>
            <p className="mt-2 text-sm sm:text-base text-obsidian/70">
              Conocimiento práctico para tomar decisiones fundamentadas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {course.learningOutcomes.map((outcome, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-5 rounded-2xl bg-white border border-[#B39A6A]/20 shadow-xs">
                <CheckCircle2 className="size-5 text-champagne shrink-0 mt-0.5" />
                <p className="text-sm text-obsidian/85 leading-relaxed">{outcome}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 7. HERRAMIENTAS / RECURSOS */}
      {course.includedFeatures && course.includedFeatures.length > 0 && (
        <section className="py-16 sm:py-24 border-b border-[#B39A6A]/15 bg-white">
          <Container className="max-w-[800px] mx-auto px-5 sm:px-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium tracking-tight mb-8">
              Herramientas de apoyo
            </h2>
            <ul className="space-y-4">
              {course.includedFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-obsidian/80 p-4 rounded-xl bg-sand-50 border border-[#B39A6A]/10">
                  <FileText className="size-5 text-champagne shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* 8. TEMARIO COMPLETO */}
      <section className="py-16 sm:py-24 border-b border-[#B39A6A]/15 bg-[#FAF8F5]">
        <Container className="max-w-[1000px] mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-obsidian font-medium tracking-tight">
              Temario del programa
            </h2>
            <p className="mt-2 text-sm text-obsidian/70">
              Lecciones estructuradas con acceso secuencial y materiales descargables.
            </p>
          </div>
          <div className="space-y-4">
            {course.modules?.map((module, modIdx) => (
              <div key={module.id} className="rounded-2xl bg-white border border-[#B39A6A]/25 overflow-hidden shadow-xs">
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
                  <ChevronDown className={`size-5 text-champagne shrink-0 transition-transform duration-200 ${openModuleIndex === modIdx ? 'rotate-180' : ''}`} />
                </button>
                {openModuleIndex === modIdx && (
                  <div className="px-6 pb-5 pt-2 border-t border-[#B39A6A]/15 divide-y divide-[#B39A6A]/10">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="py-3.5 flex items-center justify-between gap-4 text-xs sm:text-sm">
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
                            <span className="px-2.5 py-1 rounded-full bg-champagne/20 text-[#8A7347] text-[11px] font-semibold uppercase tracking-wider">
                              Muestra
                            </span>
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

      {/* 9 y 10. PARA QUIÉN ES Y NO ES */}
      {((course.targetAudience && course.targetAudience.length > 0) || (course.notFor && course.notFor.length > 0)) && (
        <section className="py-16 sm:py-24 border-b border-[#B39A6A]/15 bg-white">
          <Container className="max-w-[1000px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {course.targetAudience && course.targetAudience.length > 0 && (
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-obsidian font-medium mb-6 flex items-center gap-3">
                    <Users className="size-6 text-champagne" /> Para quién es
                  </h3>
                  <ul className="space-y-4">
                    {course.targetAudience.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-obsidian/80">
                        <Check className="size-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {course.notFor && course.notFor.length > 0 && (
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-obsidian font-medium mb-6 flex items-center gap-3">
                    <AlertCircle className="size-6 text-obsidian/40" /> Para quién NO es
                  </h3>
                  <ul className="space-y-4">
                    {course.notFor.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-obsidian/70">
                        <XCircle className="size-4 text-obsidian/40 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* 11. INSTRUCTOR */}
      <InstructorOfficialSection />

      {/* 12. PREGUNTAS FRECUENTES */}
      {course.faqs && course.faqs.length > 0 && (
        <section className="py-16 sm:py-24 border-b border-[#B39A6A]/15 bg-white">
          <Container className="max-w-[800px] mx-auto px-5 sm:px-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium tracking-tight mb-10 text-center">
              Preguntas frecuentes
            </h2>
            <div className="space-y-3">
              {course.faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-[#B39A6A]/20 bg-[#FAF8F5] overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-[#F2EEE6] transition-colors"
                  >
                    <span className="font-medium text-sm text-obsidian">{faq.question}</span>
                    <ChevronDown className={`size-4 text-champagne shrink-0 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-5 pb-4 pt-1 text-sm text-obsidian/70 leading-relaxed border-t border-[#B39A6A]/10 mx-5 mt-1">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 13. AVISO MÉDICO */}
      <section className="py-12 bg-[#E9E6DF]/50 border-b border-[#B39A6A]/20">
        <Container className="max-w-[880px] mx-auto px-5 sm:px-8">
          <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-white border border-[#B39A6A]/25 text-xs text-obsidian/80">
            <Info className="size-5 text-champagne shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm text-obsidian font-semibold">
                Aviso de Responsabilidad Médica
              </strong>
              <p className="leading-relaxed">{course.disclaimerLong}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 14. CTA FINAL */}
      <section className="py-24 bg-obsidian text-center">
        <Container className="max-w-[600px] mx-auto px-5 sm:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-medium tracking-tight mb-6 text-balance">
            {course.title}
          </h2>
          <p className="text-white/70 mb-10 text-sm sm:text-base">
            {course.salesPromise || course.shortDescription}
          </p>
          <div className="flex flex-col items-center gap-4">
            {isComingSoon ? (
               <button disabled className="inline-flex items-center justify-center h-[52px] px-8 rounded-full bg-white/10 text-white/50 text-sm font-semibold uppercase tracking-wider cursor-not-allowed">
                 Próximamente
               </button>
            ) : isShopifyConnected || isFree ? (
              <a href={isFree ? `/cuenta/registro?redirect=/academia/${course.slug}` : `/api/checkout?course=${course.id}`} className="inline-flex items-center justify-center gap-2 h-[52px] px-8 rounded-full bg-emerald-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-emerald-600 transition-colors shadow-lg">
                <GraduationCap className="size-4" />
                <span>{course.ctaLabel || (isFree ? 'Inscribirme Gratis' : 'Comprar ahora')}</span>
              </a>
            ) : null}
            {!isFree && (
               <span className="text-xs text-white/50">${course.price.toLocaleString('es-MX')} {course.currency} • Pago único</span>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
