'use client';

import { StaggerGroup, StaggerItem } from './motion-wrapper';

const consultationSteps = [
  {
    number: '01',
    title: 'Agenda',
    detail: 'Elige un horario disponible en nuestro sistema seguro.',
  },
  {
    number: '02',
    title: 'Consulta',
    detail: 'Escuchamos con calma, revisamos antecedentes y damos contexto.',
  },
  {
    number: '03',
    title: 'Plan',
    detail: 'Construimos un plan médico claro, comprensible y basado en evidencia.',
  },
  {
    number: '04',
    title: 'Seguimiento',
    detail: 'Revisamos la evolución clínica y ajustamos oportunamente.',
  },
];

export function ConsultationSteps() {
  return (
    <StaggerGroup
      staggerDelay={0.09}
      className="mt-12 grid border-l border-t border-[#B39A6A]/20 sm:grid-cols-2 lg:grid-cols-4"
    >
      {consultationSteps.map((step) => (
        <StaggerItem
          key={step.number}
          distance={12}
          className="group relative min-h-[220px] sm:min-h-[240px] border-b border-r border-[#B39A6A]/20 p-7 sm:p-8 transition-colors duration-200 hover:bg-stone/30"
        >
          <span className="text-xs font-semibold tracking-[0.18em] text-champagne">
            {step.number}
          </span>
          <h3 className="mt-12 sm:mt-16 font-serif text-2xl sm:text-3xl text-obsidian group-hover:text-navy transition-colors">
            {step.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-obsidian/70">
            {step.detail}
          </p>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
