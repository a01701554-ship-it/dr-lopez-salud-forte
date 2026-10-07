import { Container } from '@/components/site/container';
import { ActionLink } from '@/components/site/action-link';
import { DoctorPortrait } from '@/components/site/doctor-portrait';
import { CredentialCard } from '@/components/site/credential-card';

export default function AboutPage() {
  return (
    <main id="contenido-principal" className="bg-ivory">
      <section className="border-b border-obsidian/10 overflow-hidden relative">
        <div className="mx-auto grid max-w-[1728px] lg:grid-cols-2 items-end">
          <div className="flex items-center px-5 pt-16 pb-12 sm:px-10 sm:pt-24 sm:pb-16 lg:px-14 lg:py-24 xl:px-20">
            <div className="max-w-2xl">
              <p className="eyebrow">Sobre mí</p>
              <h1 className="mt-6 text-balance font-serif text-[clamp(3.2rem,6vw,6.4rem)] leading-[0.92] tracking-[-0.045em] text-obsidian">
                Medicina que comienza escuchando.
              </h1>
              <p className="mt-8 text-base leading-[1.8] text-obsidian/75 sm:text-lg">
                Soy Mauricio Benjamín Galindo López, médico cirujano egresado del Tecnológico de Monterrey. Mi formación se ha enriquecido con experiencias internacionales: una rotación de tres meses en cirugía cardiaca en Dortmund, Alemania, y una estancia de dos meses en Bogotá, Colombia, con rotaciones en cirugía plástica y neurocirugía.
              </p>
              <p className="mt-5 text-base leading-[1.8] text-obsidian/70 sm:text-lg">
                Estas experiencias ampliaron mi perspectiva clínica y reafirmaron una convicción: la medicina comienza escuchando, continúa explicando y permite que cada persona comprenda mejor las decisiones relacionadas con su salud.
              </p>
              <p className="mt-5 text-base leading-[1.8] text-obsidian/70 sm:text-lg">
                A través de la consulta, el contenido educativo y Salud Forte, busco acercar información médica clara, responsable y basada en evidencia, con una atención humana y una perspectiva internacional.
              </p>
              <ActionLink href="/agendar" variant="premium-schedule" className="mt-9 w-full sm:w-auto">
                VER DISPONIBILIDAD Y AGENDAR
              </ActionLink>
            </div>
          </div>

          {/* Columna Derecha: Fotografía real integrada directamente sobre el fondo (estilo Hero) */}
          <div className="w-full flex justify-center lg:justify-end items-end relative z-0 mt-4 lg:mt-0 px-5 sm:px-10 lg:pr-14 xl:pr-20 bg-transparent border-0 outline-0 shadow-none">
            <div className="w-[min(86vw,380px)] sm:w-[420px] lg:w-[clamp(440px,38vw,560px)] xl:w-[clamp(480px,40vw,620px)] max-w-full relative bg-transparent border-0 outline-0 shadow-none">
              <DoctorPortrait
                variant="about"
                priority
                className="w-full bg-transparent border-0 shadow-none"
                imgClassName="w-full h-auto aspect-[1086/1448] object-contain object-bottom"
              />
            </div>
          </div>
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
