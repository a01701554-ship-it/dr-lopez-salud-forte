import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { BrandWordmark } from './brand-wordmark';
import { Container } from './container';

const clinicalLinks = [
  { label: 'Consulta médica', href: '/consulta' },
  { label: 'Agendar valoración', href: '/agendar' },
  { label: 'Sobre mí', href: '/sobre-mi' },
  { label: 'Preguntas frecuentes', href: '/preguntas' },
];

const initiativeLinks = [
  { label: 'Salud Forte Podcast', href: '/podcast' },
];

const legalLinks = [
  { label: 'Contacto', href: '/contacto' },
  { label: 'Aviso de privacidad', href: '/privacidad' },
  { label: 'Términos de servicio', href: '/terminos' },
];

export function Footer() {
  return (
    <footer className="border-t border-[#B39A6A]/20 bg-[#0A1624] text-[#F5F3EE]">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
          {/* Navigation Column 1: Atención */}
          <nav aria-label="Atención clínica" className="space-y-4">
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-champagne">
              Atención
            </h3>
            <ul className="space-y-3 font-sans text-sm">
              {clinicalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Navigation Column 2: Iniciativas */}
          <nav aria-label="Iniciativas y proyectos" className="space-y-4">
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-champagne">
              Iniciativas
            </h3>
            <ul className="space-y-3 font-sans text-sm">
              {initiativeLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Navigation Column 3: Institucional */}
          <nav aria-label="Legal y contacto" className="space-y-4">
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-champagne">
              Institucional
            </h3>
            <ul className="space-y-3 font-sans text-sm">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Disclaimer & Urgent care */}
        <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 text-xs leading-[1.8] text-white/45 lg:grid-cols-2 lg:gap-16">
          <p>
            El contenido compartido en este portal y en el podcast Salud Forte tiene fines exclusivamente informativos y pedagógicos. No reemplaza el juicio clínico ni una valoración médica presencial o individualizada.
          </p>
          <div className="flex items-start gap-3 rounded-md bg-white/[0.03] p-4 border border-white/5">
            <span className="shrink-0 font-bold uppercase tracking-wider text-red-400 text-[11px] pt-0.5">Urgencias:</span>
            <p className="text-white/60">
              Ante cualquier sintomatología de alarma o situación de riesgo vital, acude de inmediato al centro hospitalario más próximo o comunícate con el servicio local de urgencias (911).
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/8 pt-8 text-[11px] text-white/35 sm:flex-row sm:items-center font-sans tracking-wide">
          <p>
            © {new Date().getFullYear()} · {siteConfig.professionalTitle} · {siteConfig.university}
          </p>
          <p className="text-champagne/80">
            Cédula Profesional {siteConfig.professionalLicense}
          </p>
        </div>
      </Container>
    </footer>
  );
}
