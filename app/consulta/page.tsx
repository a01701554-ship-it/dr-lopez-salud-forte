import { Stethoscope, Clock, Video, Home, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
import { Container } from '@/components/site/container';
import { ActionLink } from '@/components/site/action-link';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/site/motion-wrapper';
import { ConsultationSteps } from '@/components/site/consultation-steps';
import { InteractiveDoctorAvatar } from '@/components/site/interactive-doctor-avatar';
import { MobileCarousel } from '@/components/site/mobile-carousel';
import { usePricing } from '@/lib/pricing-store';
import { siteConfig } from '@/config/site';
import Link from 'next/link';

function formatPrice(amount: number, currency: string, isFrom = false): string {
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
  return isFrom ? `Desde ${formatted}` : formatted;
}

export default function ConsultationPage() {
  const { pricing } = usePricing();
  const firstPrice = formatPrice(pricing.firstVisit.price, pricing.firstVisit.currency);
  const followUpPrice = formatPrice(pricing.followUp.price, pricing.followUp.currency);
  const onlinePrice = formatPrice(pricing.online.price, pricing.online.currency);
  const homeVisitPrice = formatPrice(pricing.homeVisit.price, pricing.homeVisit.currency, true);

  return (
    <main id="contenido-principal" className="bg-ivory">
      <section className="border-b border-[#B39A6A]/20 py-16 sm:py-24 lg:py-28 overflow-hidden">
        <Container>
          <Reveal direction="up" distance={12}>
            <p className="eyebrow text-sage">Consulta Médica</p>
          </Reveal>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
            <div>
              <Reveal direction="up" distance={16} delay={0.05}>
                <h1 className="max-w-4xl text-balance font-serif text-[clamp(3.4rem,7vw,7rem)] leading-[0.9] tracking-[-0.04em] text-obsidian">
                  Una consulta centrada en entender antes de decidir.
                </h1>
              </Reveal>
              <Reveal direction="up" distance={14} delay={0.1}>
                <p className="mt-8 max-w-2xl text-base leading-[1.8] text-obsidian/75 sm:text-lg">
                  La medicina no consiste únicamente en formular un diagnóstico o prescribir un tratamiento. Una buena atención médica parte de escuchar detenidamente la historia de cada paciente, dar contexto a los síntomas y construir en conjunto un plan de salud comprensible y sostenible.
                </p>
              </Reveal>
            </div>

            {/* Columna Derecha: Avatar Interactivo en zona superior + Atención Directa */}
            <div className="flex flex-col justify-between">
              {/* Avatar Interactivo: ubicado en la zona superior derecha del Hero sin marcos ni recuadros azules */}
              <div className="w-full max-w-[540px] xl:max-w-[600px] aspect-[1280/722] mx-auto lg:ml-auto lg:mr-0 mb-8 sm:mb-10 relative">
                <InteractiveDoctorAvatar
                  priority
                  className="w-full h-full"
                  imgClassName="size-full object-contain object-center"
                />
              </div>

              {/* Bloque Atención Directa */}
              <div className="border-l border-[#B39A6A]/20 pl-6 sm:pl-9">
                <Reveal direction="left" distance={14} delay={0.15}>
                  <p className="text-xs font-bold uppercase tracking-widest text-sage">Atención directa por</p>
                  <p className="mt-2 font-serif text-2xl text-obsidian sm:text-3xl">{siteConfig.doctorName}</p>
                  <p className="mt-1 text-xs text-obsidian/60 leading-relaxed">
                    {siteConfig.professionalTitle} · {siteConfig.university}
                    <br />
                    Cédula Profesional {siteConfig.professionalLicense}
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <ActionLink href="/agendar">Ver disponibilidad y agendar</ActionLink>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-24 sm:py-32 lg:py-40 border-b border-[#B39A6A]/15">
        <Container>
          <div className="max-w-2xl">
            <Reveal direction="up" distance={12}>
              <p className="eyebrow text-sage">El Proceso de Atención</p>
              <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-none text-obsidian">
                Cómo funciona la experiencia.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-obsidian/70 sm:text-base">
                Diseñamos cada etapa para garantizar tiempo de calidad, claridad conceptual y acompañamiento continuo.
              </p>
            </Reveal>
          </div>
          <div className="mt-12">
            <ConsultationSteps />
          </div>
        </Container>
      </section>

      <section className="bg-ivory py-24 sm:py-32 border-b border-[#B39A6A]/15">
        <Container>
          <div className="max-w-2xl mb-14">
            <Reveal direction="up" distance={12}>
              <p className="eyebrow text-sage">Honorarios Profesionales</p>
              <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-none text-obsidian">
                Valores claros y éticos.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-obsidian/70 sm:text-base">
                Sin sorpresas. Conoce los honorarios correspondientes a cada tipo de valoración clínica y el tiempo reservado exclusivamente para ti.
              </p>
            </Reveal>
          </div>

          {/* Mobile Auto Carousel (< 768px) */}
          <div className="md:hidden mt-6">
            <MobileCarousel
              id="honorarios-profesionales"
              ariaLabel="Tarjetas de honorarios profesionales de consulta"
              itemCount={4}
              intervalMs={2200}
              transitionDurationMs={300}
              cardMaxWidth="330px"
            >
              {/* Card 1: Primera Consulta Médica */}
              <div className="w-full flex-1 rounded-[20px] border border-[#B39A6A]/30 bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,31,54,0.04)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <Stethoscope className="size-4 text-champagne" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-sage">{pricing.firstVisit.duration}</span>
                  </div>
                  <h3 className="mt-3.5 font-serif text-xl sm:text-2xl leading-tight text-obsidian">{pricing.firstVisit.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-obsidian/75">{pricing.firstVisit.description}</p>
                  <ul className="mt-3 space-y-1.5 border-t border-stone/60 pt-2.5 text-xs text-obsidian/80">
                    {pricing.firstVisit.includedNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-champagne font-bold">✓</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 border-t border-stone/60 pt-3">
                  <span className="block text-[10px] uppercase tracking-wider text-obsidian/50 font-semibold">Honorarios</span>
                  <span className="font-serif text-2xl font-medium text-obsidian">{firstPrice}</span>
                  <div className="mt-3">
                    <Link href="/agendar?tipo=presencial" className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#0D2235] bg-[#0D2235] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE] hover:bg-obsidian active:scale-[0.99] transition-all">
                      <span>Agendar Cita</span>
                      <ArrowRight className="size-3.5 text-champagne" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 2: Consulta de Seguimiento */}
              <div className="w-full flex-1 rounded-[20px] border border-[#B39A6A]/30 bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,31,54,0.04)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <Clock className="size-4 text-champagne" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-sage">{pricing.followUp.duration}</span>
                  </div>
                  <h3 className="mt-3.5 font-serif text-xl sm:text-2xl leading-tight text-obsidian">{pricing.followUp.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-obsidian/75">{pricing.followUp.description}</p>
                  <ul className="mt-3 space-y-1.5 border-t border-stone/60 pt-2.5 text-xs text-obsidian/80">
                    {pricing.followUp.includedNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-champagne font-bold">✓</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 border-t border-stone/60 pt-3">
                  <span className="block text-[10px] uppercase tracking-wider text-obsidian/50 font-semibold">Honorarios</span>
                  <span className="font-serif text-2xl font-medium text-obsidian">{followUpPrice}</span>
                  <div className="mt-3">
                    <Link href="/agendar?tipo=presencial" className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#0D2235] bg-[#0D2235] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE] hover:bg-obsidian active:scale-[0.99] transition-all">
                      <span>Agendar Cita</span>
                      <ArrowRight className="size-3.5 text-champagne" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 3: Consulta Médica en Línea */}
              <div className="w-full flex-1 rounded-[20px] border border-[#B39A6A]/30 bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,31,54,0.04)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <Video className="size-4 text-champagne" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-sage">{pricing.online.duration}</span>
                  </div>
                  <h3 className="mt-3.5 font-serif text-xl sm:text-2xl leading-tight text-obsidian">{pricing.online.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-obsidian/75">{pricing.online.description}</p>
                  <ul className="mt-3 space-y-1.5 border-t border-stone/60 pt-2.5 text-xs text-obsidian/80">
                    {pricing.online.includedNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-champagne font-bold">✓</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 border-t border-stone/60 pt-3">
                  <span className="block text-[10px] uppercase tracking-wider text-obsidian/50 font-semibold">Honorarios</span>
                  <span className="font-serif text-2xl font-medium text-obsidian">{onlinePrice}</span>
                  <div className="mt-3">
                    <Link href="/agendar?tipo=online" className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#0D2235] bg-[#0D2235] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE] hover:bg-obsidian active:scale-[0.99] transition-all">
                      <span>Agendar Cita</span>
                      <ArrowRight className="size-3.5 text-champagne" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 4: Consulta a Domicilio */}
              <div className="w-full flex-1 rounded-[20px] border border-[#B39A6A]/30 bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,31,54,0.04)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <Home className="size-4 text-champagne" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-sage">{pricing.homeVisit.duration}</span>
                  </div>
                  <h3 className="mt-3.5 font-serif text-xl sm:text-2xl leading-tight text-obsidian">{pricing.homeVisit.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-obsidian/75">{pricing.homeVisit.description}</p>
                  <ul className="mt-3 space-y-1.5 border-t border-stone/60 pt-2.5 text-xs text-obsidian/80">
                    {pricing.homeVisit.includedNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-champagne font-bold">✓</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 border-t border-stone/60 pt-3">
                  <span className="block text-[10px] uppercase tracking-wider text-obsidian/50 font-semibold">Honorarios</span>
                  <span className="font-serif text-2xl font-medium text-obsidian">{homeVisitPrice}</span>
                  <div className="mt-3">
                    <a
                      href="https://wa.me/524421275952?text=Hola%20Dr.%20Mauricio%20Galindo,%20quisiera%20solicitar%20información%20sobre%20consulta%20a%20domicilio."
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-stone bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-obsidian hover:bg-stone/30 active:scale-[0.99] transition-all"
                    >
                      <span>Coordinar por WhatsApp</span>
                      <MessageSquare className="size-3.5 text-emerald-600" />
                    </a>
                  </div>
                </div>
              </div>
            </MobileCarousel>
          </div>

          {/* Desktop Grid (>= 768px) */}
          <StaggerGroup staggerDelay={0.08} className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StaggerItem distance={12} className="flex flex-col justify-between rounded-xl border border-stone/90 bg-white p-7 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <Stethoscope className="size-5 text-champagne" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sage">{pricing.firstVisit.duration}</span>
                </div>
                <h3 className="mt-5 font-serif text-2xl text-obsidian">{pricing.firstVisit.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-obsidian/70">{pricing.firstVisit.description}</p>
                <ul className="mt-4 space-y-1.5 border-t border-stone/60 pt-3 text-[11px] text-obsidian/75">
                  {pricing.firstVisit.includedNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-champagne font-bold">✓</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 border-t border-stone/60 pt-4">
                <span className="block text-[10px] uppercase tracking-wider text-obsidian/50 font-semibold">Honorarios</span>
                <span className="font-serif text-2xl font-medium text-obsidian">{firstPrice}</span>
                <div className="mt-4">
                  <Link href="/agendar?tipo=presencial" className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#0D2235] bg-[#0D2235] py-2 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE] hover:bg-obsidian transition-colors">
                    <span>Agendar</span>
                    <ArrowRight className="size-3 text-champagne" />
                  </Link>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem distance={12} className="flex flex-col justify-between rounded-xl border border-stone/90 bg-white p-7 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <Clock className="size-5 text-champagne" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sage">{pricing.followUp.duration}</span>
                </div>
                <h3 className="mt-5 font-serif text-2xl text-obsidian">{pricing.followUp.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-obsidian/70">{pricing.followUp.description}</p>
                <ul className="mt-4 space-y-1.5 border-t border-stone/60 pt-3 text-[11px] text-obsidian/75">
                  {pricing.followUp.includedNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-champagne font-bold">✓</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 border-t border-stone/60 pt-4">
                <span className="block text-[10px] uppercase tracking-wider text-obsidian/50 font-semibold">Honorarios</span>
                <span className="font-serif text-2xl font-medium text-obsidian">{followUpPrice}</span>
                <div className="mt-4">
                  <Link href="/agendar?tipo=presencial" className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#0D2235] bg-[#0D2235] py-2 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE] hover:bg-obsidian transition-colors">
                    <span>Agendar</span>
                    <ArrowRight className="size-3 text-champagne" />
                  </Link>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem distance={12} className="flex flex-col justify-between rounded-xl border border-stone/90 bg-white p-7 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <Video className="size-5 text-champagne" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sage">{pricing.online.duration}</span>
                </div>
                <h3 className="mt-5 font-serif text-2xl text-obsidian">{pricing.online.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-obsidian/70">{pricing.online.description}</p>
                <ul className="mt-4 space-y-1.5 border-t border-stone/60 pt-3 text-[11px] text-obsidian/75">
                  {pricing.online.includedNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-champagne font-bold">✓</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 border-t border-stone/60 pt-4">
                <span className="block text-[10px] uppercase tracking-wider text-obsidian/50 font-semibold">Honorarios</span>
                <span className="font-serif text-2xl font-medium text-obsidian">{onlinePrice}</span>
                <div className="mt-4">
                  <Link href="/agendar?tipo=online" className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#0D2235] bg-[#0D2235] py-2 text-xs font-semibold uppercase tracking-wider text-[#F5F3EE] hover:bg-obsidian transition-colors">
                    <span>Agendar</span>
                    <ArrowRight className="size-3 text-champagne" />
                  </Link>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem distance={12} className="flex flex-col justify-between rounded-xl border border-stone/90 bg-white p-7 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <Home className="size-5 text-champagne" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sage">{pricing.homeVisit.duration}</span>
                </div>
                <h3 className="mt-5 font-serif text-2xl text-obsidian">{pricing.homeVisit.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-obsidian/70">{pricing.homeVisit.description}</p>
                <ul className="mt-4 space-y-1.5 border-t border-stone/60 pt-3 text-[11px] text-obsidian/75">
                  {pricing.homeVisit.includedNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-champagne font-bold">✓</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 border-t border-stone/60 pt-4">
                <span className="block text-[10px] uppercase tracking-wider text-obsidian/50 font-semibold">Honorarios</span>
                <span className="font-serif text-2xl font-medium text-obsidian">{homeVisitPrice}</span>
                <div className="mt-4">
                  <a
                    href="https://wa.me/524421275952?text=Hola%20Dr.%20Mauricio%20Galindo,%20quisiera%20solicitar%20información%20sobre%20consulta%20a%20domicilio."
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone bg-white py-2 text-xs font-semibold uppercase tracking-wider text-obsidian hover:bg-stone/30 transition-colors"
                  >
                    <span>Coordinar por WhatsApp</span>
                    <MessageSquare className="size-3 text-emerald-600" />
                  </a>
                </div>
              </div>
            </StaggerItem>
          </StaggerGroup>

          <div className="mt-12 rounded-xl border border-[#B39A6A]/20 bg-white p-6 sm:p-8">
            <h4 className="font-serif text-xl text-obsidian">Formas de pago aceptadas</h4>
            <p className="mt-1 text-xs text-obsidian/70">{pricing.paymentMethods.join(' · ')}</p>
            <p className="mt-3 text-[11px] text-obsidian/60 border-t border-stone/60 pt-2.5">
              Si requiere comprobante fiscal digital por internet (CFDI), se emite con los datos fiscales correspondientes y cédula profesional del Dr. Galindo.
            </p>
          </div>

          <div className="mt-16 rounded-[10px] border border-[#B39A6A]/30 bg-white p-8 text-center sm:p-12">
            <Sparkles className="mx-auto size-8 text-champagne" />
            <h3 className="mt-4 font-serif text-3xl text-obsidian">¿Listo para coordinar tu consulta?</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm text-obsidian/70">
              Elige tu horario en nuestro sistema digital en tiempo real con confirmación inmediata.
            </p>
            <div className="mt-8 flex justify-center">
              <ActionLink href="/agendar">Agendar Cita Ahora</ActionLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
