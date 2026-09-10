'use client';

import React, { useState } from 'react';
import { Plus, ExternalLink, ShieldAlert, HeartPulse, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePricing } from '@/lib/pricing-store';
import { formatProfessionalFee } from '@/config/pricing';
import { siteConfig } from '@/config/site';
import Link from 'next/link';

export interface FAQItem {
  id: string;
  question: string;
  renderAnswer: (props: {
    firstPrice: string;
    firstDuration: string;
    followPrice: string;
    followDuration: string;
    onlinePrice: string;
    onlineDuration: string;
    homePrice: string;
    paymentMethods: string[];
    paymentPolicy: string | null;
  }) => React.ReactNode;
  category?: 'consulta' | 'agendar' | 'digital' | 'medico';
  isVisible?: (pricing: ReturnType<typeof usePricing>['pricing']) => boolean;
}

export function buildFAQList(): FAQItem[] {
  return [
    {
      id: 'faq-01-precio',
      question: '¿Cuánto cuesta una consulta médica?',
      category: 'consulta',
      renderAnswer: ({ firstPrice, firstDuration }) => (
        <div className="space-y-2.5">
          <p>
            La primera consulta médica tiene un costo de <span className="font-semibold text-obsidian">{firstPrice}</span> y una duración aproximada de {firstDuration}.
          </p>
          <p>
            Este tiempo permite realizar una valoración con calma, escuchar el motivo de consulta, realizar la evaluación correspondiente y explicar de manera clara los siguientes pasos.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-02-primera-consulta',
      question: '¿Qué incluye la primera consulta?',
      category: 'consulta',
      renderAnswer: ({ firstDuration }) => (
        <div className="space-y-2.5">
          <p>
            La primera consulta está pensada para conocer con mayor detalle el motivo de consulta, realizar la valoración médica correspondiente y explicar de forma clara el plan a seguir según cada caso.
          </p>
          <p>
            La duración aproximada es de {firstDuration}.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-03-seguimiento',
      question: '¿Cuánto cuesta una consulta de seguimiento?',
      category: 'consulta',
      renderAnswer: ({ followPrice, followDuration }) => (
        <div className="space-y-2.5">
          <p>
            La consulta de seguimiento tiene un costo de <span className="font-semibold text-obsidian">{followPrice}</span> y una duración aproximada de {followDuration}.
          </p>
          <p>
            Está destinada al seguimiento de una consulta previa, revisión de la evolución y, cuando corresponda, ajustes al plan indicado.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-04-diferencia',
      question: '¿Cuál es la diferencia entre primera consulta y seguimiento?',
      category: 'consulta',
      renderAnswer: ({ firstDuration, followDuration, firstPrice, followPrice }) => (
        <div className="space-y-3">
          <p>
            La primera consulta permite realizar una valoración inicial con mayor tiempo y tiene una duración aproximada de {firstDuration}.
          </p>
          <p>
            El seguimiento está dirigido principalmente a revisar la evolución de un problema previamente valorado y tiene una duración aproximada de {followDuration}.
          </p>
          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-obsidian/75 font-medium border-t border-stone/50">
            <span>Primera consulta · <strong className="text-obsidian">{firstPrice}</strong></span>
            <span>Seguimiento · <strong className="text-obsidian">{followPrice}</strong></span>
          </div>
        </div>
      ),
    },
    {
      id: 'faq-05-online',
      question: '¿Ofrece consulta médica en línea?',
      category: 'consulta',
      isVisible: (pricing) => pricing.onlineConsultationEnabled,
      renderAnswer: ({ onlinePrice, onlineDuration }) => (
        <div className="space-y-2.5">
          <p>
            La consulta en línea puede estar disponible para situaciones en las que la modalidad remota resulte adecuada.
          </p>
          <p>
            Tiene una duración aproximada de {onlineDuration} y un costo de <span className="font-semibold text-obsidian">{onlinePrice}</span>.
          </p>
          <p className="text-xs text-obsidian/70">
            Dependiendo del motivo de consulta, puede ser necesaria una valoración presencial.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-06-domicilio',
      question: '¿Ofrece consultas a domicilio?',
      category: 'consulta',
      isVisible: (pricing) => pricing.homeVisitEnabled,
      renderAnswer: ({ homePrice }) => (
        <div className="space-y-2.5">
          <p>
            Las consultas a domicilio, cuando se encuentren disponibles, tienen un costo {homePrice}.
          </p>
          <p>
            El precio final puede variar dependiendo de la ubicación, distancia y disponibilidad.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-07-duracion',
      question: '¿Cuánto dura la consulta?',
      category: 'consulta',
      renderAnswer: ({ firstDuration, followDuration }) => (
        <div className="space-y-2.5">
          <p>
            La primera consulta tiene una duración aproximada de {firstDuration}.
          </p>
          <p>
            Las consultas de seguimiento tienen una duración aproximada de {followDuration}.
          </p>
          <p className="text-xs text-obsidian/70">
            La duración puede variar ligeramente dependiendo de las necesidades de cada caso.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-08-como-agendar',
      question: '¿Cómo puedo agendar una consulta?',
      category: 'agendar',
      renderAnswer: () => (
        <div className="space-y-2.5">
          <p>
            Puede consultar los horarios disponibles y reservar directamente desde la sección correspondiente de esta página.
          </p>
          <p>
            También puede utilizar «Contacto médico» para recibir ayuda por WhatsApp para gestionar su cita.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-09-whatsapp-agendar',
      question: '¿Puedo agendar por WhatsApp?',
      category: 'agendar',
      renderAnswer: () => (
        <div className="space-y-2.5">
          <p>
            Sí. Desde «Contacto médico» puede solicitar horarios disponibles y recibir ayuda para agendar, mover o cancelar una cita.
          </p>
          <p className="text-xs leading-relaxed text-obsidian/70">
            Un asistente digital puede ayudarle con estas gestiones y, cuando sea necesario, solicitar seguimiento del Dr. Mauricio Benjamin Galindo López o su equipo.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-10-mover-cita',
      question: '¿Cómo puedo mover o reprogramar mi cita?',
      category: 'agendar',
      renderAnswer: () => (
        <div className="space-y-2.5">
          <p>
            Puede modificar su cita desde el enlace de administración de su reserva o solicitar el cambio por WhatsApp a través de «Contacto médico».
          </p>
          <p className="text-xs text-obsidian/70">
            El sistema le mostrará únicamente los horarios disponibles.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-11-cancelar-cita',
      question: '¿Cómo puedo cancelar una cita?',
      category: 'agendar',
      renderAnswer: () => (
        <div className="space-y-2.5">
          <p>
            Puede cancelar su cita desde el enlace de administración incluido en su confirmación o solicitarlo por WhatsApp.
          </p>
          <p className="text-xs text-obsidian/70">
            Antes de cancelar definitivamente, se le pedirá confirmar la operación.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-12-recordatorio',
      question: '¿Recibiré un recordatorio de mi cita?',
      category: 'agendar',
      renderAnswer: () => (
        <p>
          Cuando haya autorizado recibir comunicaciones relacionadas con su cita, podrá recibir una confirmación y recordatorios por WhatsApp.
        </p>
      ),
    },
    {
      id: 'faq-13-formas-pago',
      question: '¿Qué formas de pago acepta?',
      category: 'consulta',
      isVisible: (pricing) => pricing.paymentMethods && pricing.paymentMethods.length > 0,
      renderAnswer: ({ paymentMethods }) => (
        <div className="space-y-2.5">
          <p>Aceptamos las siguientes formas de pago:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-obsidian/80">
            {paymentMethods.map((method, idx) => (
              <li key={idx}>{method}</li>
            ))}
          </ul>
          <p className="text-xs text-obsidian/65 pt-1">
            Si requiere comprobante fiscal (CFDI), se emite con los requisitos oficiales correspondientes.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-14-pago-al-reservar',
      question: '¿Necesito pagar al momento de reservar?',
      category: 'agendar',
      isVisible: (pricing) => pricing.bookingPaymentPolicy !== null,
      renderAnswer: ({ paymentPolicy }) => (
        <div className="space-y-2">
          {paymentPolicy === 'PAY_AT_APPOINTMENT' && (
            <p>
              No es necesario pagar al momento de reservar en línea. El pago de los honorarios se efectúa el día de su consulta en la modalidad que haya elegido.
            </p>
          )}
          {paymentPolicy === 'PAY_TO_CONFIRM' && (
            <p>
              Para asegurar su espacio, se solicita completar el pago al momento de confirmar la reserva en la plataforma.
            </p>
          )}
          {paymentPolicy === 'DEPOSIT_REQUIRED' && (
            <p>
              Se requiere un anticipo de confirmación para apartar el horario, liquidando el resto al momento de su consulta.
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'faq-15-alcance-problemas',
      question: '¿Para qué problemas puedo agendar una consulta?',
      category: 'medico',
      renderAnswer: () => (
        <div className="space-y-2.5">
          <p>
            Puede agendar una consulta de medicina general para realizar una valoración inicial de diferentes motivos de salud.
          </p>
          <p className="text-xs text-obsidian/75">
            Cuando el problema requiera atención especializada, estudios adicionales o valoración por otro profesional, se le orientará según corresponda.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-16-estudios-whatsapp',
      question: '¿Puedo enviar estudios o resultados por WhatsApp?',
      category: 'digital',
      renderAnswer: () => (
        <div className="space-y-2.5">
          <p>
            Para proteger su información, evite enviar datos clínicos sensibles por WhatsApp salvo que se le indique expresamente un medio adecuado para hacerlo.
          </p>
          <p className="text-xs text-obsidian/70">
            Durante su consulta se podrá determinar qué información es necesario revisar con estricto apego al secreto profesional.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-17-whatsapp-consulta',
      question: '¿WhatsApp sirve para recibir una consulta médica?',
      category: 'digital',
      renderAnswer: () => (
        <div className="space-y-2.5">
          <p>
            WhatsApp está destinado principalmente a la gestión de citas e información administrativa.
          </p>
          <p className="text-xs text-obsidian/75">
            No sustituye una valoración médica individual.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-18-urgencias',
      question: '¿Qué hago si tengo una urgencia?',
      category: 'medico',
      renderAnswer: () => (
        <div className="space-y-2.5 rounded-lg bg-red-50/60 p-4 border border-red-200/50 text-red-950">
          <p className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-red-900">
            <ShieldAlert className="size-4 text-red-600" />
            Atención de urgencias
          </p>
          <p className="text-xs sm:text-sm leading-relaxed text-red-950/90">
            Este sitio y el servicio de Contacto médico no sustituyen la atención de urgencias. Si presenta una situación que requiere atención inmediata, busque atención médica de urgencia en el hospital más cercano o contacte a los servicios de emergencia correspondientes.
          </p>
          <p className="text-xs font-bold text-red-900">
            Emergencias en México: 911.
          </p>
        </div>
      ),
    },
    {
      id: 'faq-19-salud-forte',
      question: '¿Dónde puedo escuchar Salud Forte?',
      category: 'digital',
      renderAnswer: () => (
        <div className="space-y-3">
          <p>
            Salud Forte está disponible en Spotify.
          </p>
          <p>
            Puede escucharlo directamente desde la sección de podcast de esta página o abrirlo en Spotify.
          </p>
          <div className="pt-1">
            <a
              href={siteConfig.spotifyShowUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-obsidian hover:text-champagne transition-colors"
            >
              <span>Escuchar Salud Forte en Spotify</span>
              <ExternalLink className="size-3 text-champagne" />
            </a>
          </div>
        </div>
      ),
    },
    {
      id: 'faq-20-quien-es-dr-mauricio',
      question: '¿Quién es el Dr. Mauricio Benjamin Galindo López?',
      category: 'medico',
      renderAnswer: () => (
        <div className="space-y-3">
          <p>
            El Dr. Mauricio Benjamin Galindo López es Médico Cirujano egresado del Tecnológico de Monterrey. Cédula Profesional 15851723.
          </p>
          <div className="flex flex-wrap items-center gap-5 pt-1">
            <Link
              href="/sobre-mi"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-obsidian hover:text-champagne transition-colors"
            >
              <span>Conoce mi trayectoria</span>
              <ArrowRight className="size-3 text-champagne" />
            </Link>
            <a
              href={siteConfig.credentialVerificationUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-obsidian/75 hover:text-champagne transition-colors"
            >
              <span>Ver credencial académica</span>
              <ExternalLink className="size-3 text-champagne" />
            </a>
          </div>
        </div>
      ),
    },
  ];
}

const CATEGORIES = [
  { id: 'all', label: 'Todas las preguntas' },
  { id: 'consulta', label: 'Consulta y Honorarios' },
  { id: 'agendar', label: 'Citas y Gestión' },
  { id: 'digital', label: 'Canales y Privacidad' },
  { id: 'medico', label: 'Criterio médico' },
] as const;

function extractText(node: any): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (React.isValidElement(node)) return extractText((node.props as any).children);
  return '';
}

export interface FAQSectionProps {
  showConsultationLink?: boolean;
}

export function FAQSection({ showConsultationLink = true }: FAQSectionProps) {
  const { pricing } = usePricing();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle URL Hash on Mount
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      if (hashId) {
        setOpenItemId(hashId);
        // We can't easily know the category, so we just switch to 'all' to ensure it's visible
        setSelectedCategory('all');
        // Scroll slightly offset
        setTimeout(() => {
          const el = document.getElementById(`faq-btn-${hashId}`);
          if (el) {
             const y = el.getBoundingClientRect().top + window.scrollY - 100;
             window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, []);

  const allFaqs = buildFAQList();

  const renderedProps = {
    firstPrice: formatProfessionalFee(pricing.firstVisit.price, pricing.firstVisit.currency),
    firstDuration: pricing.firstVisit.duration,
    followPrice: formatProfessionalFee(pricing.followUp.price, pricing.followUp.currency),
    followDuration: pricing.followUp.duration,
    onlinePrice: formatProfessionalFee(pricing.online.price, pricing.online.currency),
    onlineDuration: pricing.online.duration,
    homePrice: formatProfessionalFee(pricing.homeVisit.price, pricing.homeVisit.currency, true),
    paymentMethods: pricing.paymentMethods,
    paymentPolicy: pricing.bookingPaymentPolicy,
  };

  const visibleFaqs = allFaqs.filter((item) => {
    if (item.isVisible && !item.isVisible(pricing)) {
      return false;
    }
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const questionText = item.question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const answerText = extractText(item.renderAnswer(renderedProps)).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      if (!questionText.includes(q) && !answerText.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const toggleItem = (id: string) => {
    setOpenItemId((prev) => {
      const next = prev === id ? null : id;
      if (next && typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${next}`);
      } else if (!next && typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return next;
    });
  };

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    setOpenItemId(null);
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="max-w-[700px] mx-auto mb-10 px-4 sm:px-0">
        <div className="relative flex items-center w-full h-[54px] bg-[#FFFDF9] border border-[#B39A6A]/30 rounded-2xl shadow-sm focus-within:border-[#B39A6A] focus-within:ring-2 focus-within:ring-[#B39A6A]/20 transition-all duration-200">
          <svg className="absolute left-4 size-5 text-obsidian/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input
            type="text"
            placeholder="Buscar una pregunta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full bg-transparent pl-12 pr-12 text-obsidian placeholder:text-obsidian/40 focus:outline-none rounded-2xl text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 p-1 text-obsidian/40 hover:text-obsidian transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
              aria-label="Limpiar búsqueda"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      {!searchQuery && (
        <div className="mb-10 px-4 sm:px-0">
          <div className="flex flex-nowrap sm:flex-wrap items-center sm:justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`relative px-5 py-2.5 rounded-full text-[13px] font-medium tracking-wide transition-all duration-200 whitespace-nowrap border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obsidian focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-obsidian border-obsidian text-[#FFFDF9] shadow-sm'
                      : 'bg-transparent border-[#B39A6A]/30 text-obsidian/70 hover:border-[#B39A6A] hover:text-obsidian'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Accordion List */}
      <div className="w-full motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 motion-safe:duration-700">
        {visibleFaqs.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-obsidian font-serif text-2xl mb-3">No encontramos una respuesta con esos términos.</p>
            <p className="text-obsidian/70 text-sm sm:text-base">Prueba otra búsqueda o comunícate con nuestro asistente médico.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleFaqs.map((faq) => {
              const isOpen = openItemId === faq.id;
              const contentId = `faq-answer-${faq.id}`;
              const buttonId = `faq-btn-${faq.id}`;

              return (
                <div
                  key={faq.id}
                  className={`group relative rounded-2xl sm:rounded-3xl transition-all duration-300 border ${
                    isOpen 
                      ? 'bg-[#FFFDF9] border-[#B39A6A]/40 shadow-sm' 
                      : 'bg-[#F9F7F2]/60 border-[#B39A6A]/15 hover:bg-[#FFFDF9] hover:border-[#B39A6A]/30'
                  }`}
                >
                  {/* Decorative left border accent when open */}
                  <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-[#B39A6A] transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                      onClick={() => toggleItem(faq.id)}
                      className="flex w-full items-center justify-between gap-4 sm:gap-8 px-5 sm:px-9 py-6 sm:py-8 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 rounded-2xl sm:rounded-3xl cursor-pointer"
                    >
                      <span className={`font-serif text-[1.25rem] sm:text-[clamp(1.45rem,2vw,2rem)] leading-snug transition-colors duration-300 pr-2 ${isOpen ? 'text-obsidian font-medium' : 'text-obsidian/90 font-normal'}`}>
                        {faq.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                          isOpen 
                            ? 'border-[#B39A6A] bg-[#B39A6A]/10 text-obsidian' 
                            : 'border-[#B39A6A]/30 text-obsidian/50 group-hover:border-[#B39A6A]/50 group-hover:text-obsidian/80'
                        }`}
                      >
                        <div className="relative size-3.5 sm:size-4">
                          <div className={`absolute inset-0 bg-current rounded-full transition-transform duration-300 h-[1.5px] w-full top-1/2 -translate-y-1/2 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                          <div className={`absolute inset-0 bg-current rounded-full transition-transform duration-300 w-[1.5px] h-full left-1/2 -translate-x-1/2 ${isOpen ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
                        </div>
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={contentId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0, y: -10 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -10 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-9 pb-7 sm:pb-9 pt-1 max-w-[980px]">
                          <div className="text-[16px] sm:text-[18px] leading-[1.7] text-obsidian/80 font-sans">
                            {faq.renderAnswer(renderedProps)}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function FAQAccordion({ showCategoryTabs = true }: { showCategoryTabs?: boolean }) {
  return <FAQSection showConsultationLink={showCategoryTabs} />;
}
