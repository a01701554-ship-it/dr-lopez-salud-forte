import { Container } from '@/components/site/container';
import { FAQSection } from '@/components/site/faq';
import Link from 'next/link';

export default function PreguntasPage() {
  return (
    <main id="contenido-principal" className="bg-ivory min-h-screen pb-24 sm:pb-32">
      {/* Nuevo Encabezado Compacto */}
      <section className="pt-[calc(64px+40px)] pb-8 sm:pb-14 text-center px-6">
        <Container className="max-w-[850px] mx-auto">
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <p className="eyebrow text-sage mb-4 sm:mb-5">PREGUNTAS FRECUENTES</p>
            <h1 className="font-serif text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.05] tracking-tight text-obsidian font-normal mb-5 sm:mb-7">
              Respuestas claras para tomar decisiones con confianza.
            </h1>
            <p className="text-base sm:text-[1.125rem] text-obsidian/75 max-w-[640px] mx-auto leading-[1.6]">
              Consulta información sobre modalidades, honorarios, citas, seguimiento, comunicación y privacidad.
            </p>
          </div>
        </Container>
      </section>

      {/* Contenedor Principal (Search + Categories + Accordion) */}
      <Container className="max-w-[min(1320px,calc(100%-36px))] mx-auto px-0">
        <FAQSection />
      </Container>

      {/* Contenido Final de Ayuda */}
      <Container className="max-w-[800px] mx-auto mt-20 sm:mt-28 px-6">
        <div className="bg-[#FFFDF9] border border-[#B39A6A]/20 rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          <h2 className="font-serif text-[1.6rem] sm:text-[1.8rem] text-obsidian mb-3 font-normal">¿No encontraste la respuesta que buscabas?</h2>
          <p className="text-sm sm:text-base text-obsidian/75 mb-8">Podemos orientarte sobre horarios, modalidades y el proceso para agendar.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Este botón abre el ContactTrigger mediante un evento global (solo cliente) */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('open-medical-contact'));
                }
              }}
              className="inline-flex h-12 sm:h-11 items-center justify-center px-8 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors w-full sm:w-auto"
            >
              Contacto Médico
            </button>
            <Link
              href="/consulta"
              className="inline-flex h-12 sm:h-11 items-center justify-center px-8 rounded-full border border-obsidian/20 text-obsidian text-xs font-semibold uppercase tracking-wider hover:border-obsidian/40 hover:bg-obsidian/5 transition-colors w-full sm:w-auto"
            >
              Conocer la consulta
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
