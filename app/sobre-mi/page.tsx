import { Container } from '@/components/site/container';
import { ActionLink } from '@/components/site/action-link';
import { DoctorPortrait } from '@/components/site/doctor-portrait';
import { CredentialCard } from '@/components/site/credential-card';

export default function AboutPage() {
  return (
    <main id="contenido-principal" className="bg-ivory">
      <section className="border-b border-obsidian/10">
        <div className="mx-auto grid max-w-[1728px] lg:grid-cols-2">
          <div className="flex items-center px-5 py-20 sm:px-10 sm:py-28 lg:px-14 xl:px-20">
            <div className="max-w-2xl">
              <p className="eyebrow">Sobre mí</p>
              <h1 className="mt-6 text-balance font-serif text-[clamp(3.7rem,7vw,7.4rem)] leading-[0.88] tracking-[-0.045em] text-obsidian">
                Medicina que comienza escuchando.
              </h1>
              <p className="mt-9 text-base leading-[1.8] text-obsidian/66 sm:text-lg">
                Soy Mauricio Benjamín Galindo López, Médico Cirujano egresado del Tecnológico de Monterrey.
              </p>
              <p className="mt-5 text-base leading-[1.8] text-obsidian/66 sm:text-lg">
                Creo en una medicina que comienza escuchando, continúa explicando y permite que cada persona comprenda mejor las decisiones relacionadas con su salud.
              </p>
              <p className="mt-5 text-base leading-[1.8] text-obsidian/66 sm:text-lg">
                A través de la consulta, el contenido educativo y Salud Forte, busco acercar información médica de manera clara, responsable y basada en evidencia.
              </p>
              <ActionLink href="/consulta" variant="secondary" className="mt-9">
                Conoce la consulta
              </ActionLink>
            </div>
          </div>
          <DoctorPortrait variant="about" className="min-h-[620px]" />
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-36">
        <Container className="grid items-start gap-12 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
          <div>
            <p className="eyebrow">Formación y credenciales</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-obsidian sm:text-5xl">
              Información profesional, presentada con transparencia.
            </h2>
          </div>
          <CredentialCard />
        </Container>
      </section>
    </main>
  );
}
