import { ExternalLink } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function CredentialCard() {
  return (
    <article className="border border-[#B39A6A]/25 bg-white p-7 shadow-sm sm:p-10 lg:p-12">
      <div className="flex items-start justify-between gap-8 border-b border-[#B39A6A]/20 pb-7">
        <div>
          <p className="eyebrow">Formación y credenciales</p>
          <h3 className="mt-4 font-serif text-3xl leading-none text-obsidian sm:text-4xl">
            {siteConfig.professionalTitle}
          </h3>
        </div>
        <span
          aria-hidden="true"
          className="hidden size-12 items-center justify-center border border-champagne font-serif text-xl text-champagne sm:flex"
        >
          M
        </span>
      </div>
      <dl className="divide-y divide-[#B39A6A]/15 text-sm">
        <div className="grid gap-2 py-5 sm:grid-cols-[11rem_1fr]">
          <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-obsidian/48">
            Grado
          </dt>
          <dd className="text-obsidian">{siteConfig.degreeName}</dd>
        </div>
        <div className="grid gap-2 py-5 sm:grid-cols-[11rem_1fr]">
          <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-obsidian/48">
            Institución
          </dt>
          <dd className="leading-relaxed text-obsidian">
            {siteConfig.universityLegalName}
            <span className="mt-1 block text-obsidian/54">
              {siteConfig.university}
            </span>
          </dd>
        </div>
        <div className="grid gap-2 py-5 sm:grid-cols-[11rem_1fr]">
          <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-obsidian/48">
            Cédula Profesional
          </dt>
          <dd className="font-medium text-obsidian">
            {siteConfig.professionalLicense}
          </dd>
        </div>
      </dl>
      <a
        href={siteConfig.credentialVerificationUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-champagne text-xs font-semibold uppercase tracking-widest text-obsidian transition-colors hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
      >
        Verificar credencial
        <ExternalLink aria-hidden="true" className="size-3.5" />
      </a>
    </article>
  );
}
