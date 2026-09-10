import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Container } from './container';

type ComingSoonPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export function ComingSoonPage({
  eyebrow,
  title,
  description,
  primaryHref = '/',
  primaryLabel = 'Volver al inicio',
}: ComingSoonPageProps) {
  return (
    <main id="contenido-principal" className="bg-ivory">
      <Container className="flex min-h-[66svh] items-center py-20 sm:py-28">
        <div className="grid w-full gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-champagne">
              Próximamente
            </p>
          </div>
          <div>
            <h1 className="max-w-4xl text-balance font-serif text-[clamp(3.4rem,7vw,7.2rem)] leading-[0.9] tracking-[-0.045em] text-obsidian">
              {title}
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-[1.75] text-obsidian/64 sm:text-lg">
              {description}
            </p>
            <Link
              href={primaryHref}
              prefetch={false}
              className="mt-9 inline-flex min-h-12 items-center gap-3 border border-obsidian bg-obsidian px-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
            >
              {primaryHref === '/' ? (
                <ArrowLeft aria-hidden="true" className="size-3.5" />
              ) : null}
              {primaryLabel}
              {primaryHref !== '/' ? (
                <ArrowRight aria-hidden="true" className="size-3.5" />
              ) : null}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
