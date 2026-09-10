'use client';

import { siteConfig } from '@/config/site';
import { StaggerGroup, StaggerItem } from './motion-wrapper';

const trustItems = [
  () => 'Médico General',
  () => 'Egresado del Tecnológico de Monterrey',
  () => `Cédula Profesional ${siteConfig.professionalLicense}`,
  () => `${siteConfig.podcastName} Podcast`,
];

export function TrustBar() {
  return (
    <section aria-label="Credenciales y proyectos" className="bg-white overflow-hidden border-b border-[#B39A6A]/15">
      <StaggerGroup
        staggerDelay={0.06}
        className="mx-auto grid max-w-[1728px] sm:grid-cols-2 lg:grid-cols-4"
      >
        {trustItems.map((getItem, index) => (
          <StaggerItem
            key={getItem()}
            distance={6}
            className={`flex min-h-[72px] sm:min-h-[78px] items-center justify-center border-[#B39A6A]/15 px-6 text-center text-[0.67rem] font-medium uppercase tracking-[0.2em] text-obsidian/70 transition-colors hover:bg-stone/20 ${
              index > 0 ? 'border-t sm:border-t-0' : ''
            } ${index % 2 === 1 ? 'sm:border-l' : ''} ${
              index === 2 ? 'lg:border-l' : ''
            }`}
          >
            {getItem()}
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

export const CredentialStrip = TrustBar;

