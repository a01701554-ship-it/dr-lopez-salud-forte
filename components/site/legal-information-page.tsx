import { Container } from './container';

type LegalKind = 'privacy' | 'terms';

const privacySections = [
  {
    title: 'Responsable y contacto',
    body: 'El Dr. Mauricio Benjamín Galindo López, bajo la iniciativa Salud Forte, es responsable del tratamiento de los datos personales recabados mediante este sitio. Para asuntos de privacidad y solicitudes relacionadas con sus datos puede utilizar el formulario de contacto disponible en el sitio.',
  },
  {
    title: 'Datos que podemos recabar',
    body: 'Podemos tratar datos de identificación y contacto; información necesaria para agendar, confirmar, reprogramar o cancelar una consulta; datos de cuenta, compras y avance académico; comunicaciones enviadas por el usuario; y datos técnicos indispensables para la seguridad y operación del sitio. Cuando una persona proporciona información relacionada con su salud, esta se considera información sensible y recibe protección reforzada.',
  },
  {
    title: 'Finalidades del tratamiento',
    body: 'Usamos los datos para gestionar citas y disponibilidad; enviar confirmaciones y recordatorios por correo o WhatsApp; sincronizar la agenda con Google Calendar; facilitar consultas por telemedicina; autenticar cuentas; entregar masterclasses y contenidos adquiridos; atender solicitudes; prevenir fraude y accesos no autorizados; y cumplir obligaciones aplicables. Las comunicaciones promocionales se enviarán únicamente cuando exista consentimiento y podrán cancelarse en cualquier momento.',
  },
  {
    title: 'Servicios tecnológicos y transferencias',
    body: 'Para operar la plataforma podemos utilizar proveedores de alojamiento, base de datos, autenticación, correo, mensajería, calendario, videollamada, comercio electrónico y pagos. Entre ellos pueden encontrarse Google, Meta/WhatsApp, Supabase, Cloudflare y las plataformas de comercio o pago mostradas durante la compra. Solo se comparte la información necesaria para prestar cada servicio y algunos proveedores pueden procesarla fuera de México bajo sus propias medidas contractuales y de seguridad.',
  },
  {
    title: 'Derechos ARCO y revocación',
    body: 'La persona titular puede solicitar acceso, rectificación, cancelación u oposición al tratamiento de sus datos, así como revocar su consentimiento o limitar determinadas comunicaciones. La solicitud debe enviarse al correo indicado, especificar el derecho que desea ejercer, describir los datos involucrados y acompañarse de información suficiente para acreditar la identidad de la persona titular o de su representante.',
  },
  {
    title: 'Conservación y seguridad',
    body: 'Los datos se conservan durante el tiempo necesario para cumplir las finalidades informadas, atender responsabilidades médicas, contractuales o legales y proteger la seguridad de la plataforma. Se aplican controles razonables de acceso, autenticación, cifrado en tránsito y minimización de datos; ningún sistema conectado a internet puede garantizar un riesgo absoluto de cero.',
  },
  {
    title: 'Cambios al aviso',
    body: 'Las actualizaciones relevantes se publicarán en esta misma dirección. La versión vigente es la mostrada en esta página y su fecha de actualización aparece al final.',
  },
];

const termsSections = [
  {
    title: 'Objeto del sitio',
    body: 'Este portal permite conocer los servicios del Dr. Mauricio Benjamín Galindo López, reservar consultas, administrar citas y acceder a contenidos educativos de Salud Forte. El uso del sitio implica la aceptación de estas condiciones y del Aviso de Privacidad vigente.',
  },
  {
    title: 'Citas médicas',
    body: 'Una cita queda confirmada cuando el sistema muestra el comprobante correspondiente. Los horarios están sujetos a disponibilidad en tiempo real. La persona usuaria debe proporcionar datos correctos y avisar con al menos 24 horas de anticipación cuando necesite cancelar o reprogramar, salvo una situación justificada. Los honorarios, modalidad, duración y ubicación aplicables se muestran antes de confirmar.',
  },
  {
    title: 'Telemedicina y urgencias',
    body: 'Las consultas en línea dependen de una conexión adecuada y de que la persona se encuentre en condiciones compatibles con atención remota. El sitio no es un servicio de emergencias. Ante síntomas de alarma o riesgo vital debe llamarse al 911 o acudirse de inmediato al servicio de urgencias más cercano.',
  },
  {
    title: 'Contenido educativo',
    body: 'Las masterclasses, publicaciones y materiales de Salud Forte tienen fines informativos y educativos. No sustituyen una valoración médica individual, un diagnóstico, una receta ni la relación profesional entre médico y paciente. El acceso adquirido es personal y no autoriza copiar, redistribuir, revender o publicar el contenido.',
  },
  {
    title: 'Cuentas y seguridad',
    body: 'Cada usuario es responsable de mantener la confidencialidad de sus credenciales y de la actividad realizada desde su cuenta. No está permitido intentar acceder a información ajena, alterar la disponibilidad del servicio, eludir controles de acceso o utilizar la plataforma con fines ilícitos.',
  },
  {
    title: 'Servicios de terceros',
    body: 'Algunas funciones dependen de proveedores externos de calendario, videollamada, mensajería, comercio electrónico o pagos. Sus servicios pueden estar sujetos a condiciones adicionales propias. Salud Forte procura mantener las integraciones disponibles, pero no controla interrupciones originadas exclusivamente en dichos proveedores.',
  },
  {
    title: 'Contacto y actualizaciones',
    body: 'Las dudas sobre estas condiciones pueden enviarse mediante el formulario de contacto disponible en el sitio. Las modificaciones relevantes se publicarán en esta página y aplicarán desde la fecha de actualización indicada.',
  },
];

export function LegalInformationPage({ kind }: { kind: LegalKind }) {
  const isPrivacy = kind === 'privacy';
  const sections = isPrivacy ? privacySections : termsSections;

  return (
    <main id="contenido-principal" className="bg-ivory py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">
            {isPrivacy ? 'Protección de datos personales' : 'Condiciones de uso'}
          </p>
          <h1 className="mt-5 max-w-4xl text-balance font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.04em] text-obsidian">
            {isPrivacy ? 'Aviso de Privacidad Integral' : 'Términos de Servicio'}
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-obsidian/68 sm:text-lg">
            {isPrivacy
              ? 'Información clara sobre los datos que utiliza Salud Forte y las opciones disponibles para cada persona titular.'
              : 'Reglas claras para reservar consultas, utilizar la plataforma y acceder a contenidos educativos.'}
          </p>

          <div className="mt-12 grid gap-5">
            {sections.map((section, index) => (
              <section
                key={section.title}
                className="rounded-[1.6rem] border border-obsidian/10 bg-white px-6 py-7 shadow-[0_18px_50px_rgba(14,35,51,0.06)] sm:px-9 sm:py-9"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <span className="mt-1 font-serif text-2xl text-champagne" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className="font-serif text-2xl leading-tight text-obsidian sm:text-3xl">
                      {section.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-obsidian/68 sm:text-base">
                      {section.body}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-obsidian/48">
            Última actualización: 1 de octubre de 2026
          </p>
        </div>
      </Container>
    </main>
  );
}
