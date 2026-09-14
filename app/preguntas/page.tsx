import { FAQSection } from '@/components/site/faq';
import Link from 'next/link';

export default function PreguntasPage() {
  return (
    <main id="contenido-principal" className="bg-ivory min-h-screen pb-16 sm:pb-24">
      {/* Encabezado Introductorio Compacto y Refinado */}
      <section className="pt-8 sm:pt-12 lg:pt-14 pb-4 sm:pb-6 text-center px-4 sm:px-6">
        <div className="w-[min(100%,850px)] mx-auto">
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500">
            {/* 1. Eyebrow */}
            <p className="font-sans text-[11px] sm:text-[12px] leading-tight font-semibold tracking-[0.18em] uppercase text-sage mb-3 sm:mb-4">
              PREGUNTAS FRECUENTES
            </p>

            {/* 2. Título Principal */}
            <h1 className="font-serif text-[clamp(32px,3.8vw,56px)] leading-[1.04] tracking-[-0.035em] text-obsidian font-normal max-w-[850px] mx-auto text-balance mb-4 sm:mb-5">
              Respuestas claras para tomar decisiones con confianza.
            </h1>

            {/* 3. Descripción */}
            <p className="font-sans text-[15.5px] sm:text-[clamp(17px,1.3vw,19px)] text-obsidian/75 max-w-[680px] mx-auto leading-[1.55]">
              Consulta información sobre modalidades, honorarios, citas, seguimiento, comunicación y privacidad.
            </p>
          </div>
        </div>
      </section>

      {/* Contenedor Principal (Search + Categories + Accordion) */}
      <div className="w-[min(100%-32px,1180px)] sm:w-[min(100%-48px,1180px)] mx-auto px-0">
        <FAQSection />
      </div>

      {/* Contenido Final de Ayuda */}
      <div className="w-[min(100%-32px,820px)] sm:w-[min(100%-48px,820px)] mx-auto mt-12 sm:mt-16 px-0">
        <div className="bg-[#FFFDF9] border border-[#B39A6A]/20 rounded-2xl p-6 sm:p-9 text-center shadow-xs">
          <h2 className="font-serif text-[1.45rem] sm:text-[1.65rem] text-obsidian mb-2.5 font-normal">
            ¿No encontraste la respuesta que buscabas?
          </h2>
          <p className="text-sm sm:text-[15px] text-obsidian/75 mb-6 max-w-[540px] mx-auto leading-relaxed">
            Podemos orientarte sobre horarios, modalidades y el proceso para agendar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {/* Este botón abre el ContactTrigger mediante un evento global (solo cliente) */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('open-medical-contact'));
                }
              }}
              className="inline-flex h-11 items-center justify-center px-7 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors w-full sm:w-auto cursor-pointer"
            >
              Contacto Médico
            </button>
            <Link
              href="/consulta"
              className="inline-flex h-11 items-center justify-center px-7 rounded-full border border-obsidian/20 text-obsidian text-xs font-semibold uppercase tracking-wider hover:border-obsidian/40 hover:bg-obsidian/5 transition-colors w-full sm:w-auto cursor-pointer"
            >
              Conocer la consulta
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
