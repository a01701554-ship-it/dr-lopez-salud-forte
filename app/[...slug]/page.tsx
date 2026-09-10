import { ComingSoonPage } from '@/components/site/coming-soon-page';
import { ManageAppointmentClient } from '@/components/booking/manage-appointment-client';

interface RouteConfig {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
}

export const routeConfigs: Record<string, RouteConfig> = {
  consulta: {
    eyebrow: 'Consulta médica',
    title: 'Una consulta centrada en entender antes de decidir.',
    description:
      'La experiencia de consulta y sus modalidades están en preparación. Horarios, ubicación, teleconsulta y condiciones se publicarán únicamente cuando estén confirmados.',
    primaryHref: '/agendar',
    primaryLabel: 'Ver estado de la agenda',
  },
  agendar: {
    eyebrow: 'Agenda',
    title: 'La disponibilidad estará aquí, en tiempo real.',
    description:
      'El sistema de citas se habilitará en la Fase 2. Antes de aceptar reservas, se validarán modalidades, horarios, duración, políticas y la conexión segura con el calendario.',
  },
  academia: {
    eyebrow: 'Academia',
    title: 'Aprender también es una forma de cuidar tu salud.',
    description:
      'Masterclasses, cursos y programas educativos se habilitarán únicamente cuando exista una oferta formativa revisada y confirmada.',
    primaryHref: '/#newsletter',
    primaryLabel: 'Conocer Salud Forte',
  },
  tienda: {
    eyebrow: 'Store',
    title: 'Una selección pensada para acompañar hábitos saludables.',
    description:
      'La tienda está preparada para crecer con productos físicos y digitales reales. No hay productos, precios ni inventario ficticios.',
  },
  contacto: {
    eyebrow: 'Contacto',
    title: 'Un canal claro para cada conversación.',
    description:
      'Los datos de contacto aparecerán aquí cuando el correo, teléfono y canales oficiales hayan sido confirmados. Este canal no se utilizará para urgencias médicas.',
  },
  privacidad: {
    eyebrow: 'Aviso de privacidad',
    title: 'Privacidad desde el diseño.',
    description:
      'Esta sección requiere revisión legal antes de producción. La versión final describirá los datos recabados, sus finalidades, bases, conservación y derechos aplicables.',
  },
  terminos: {
    eyebrow: 'Términos',
    title: 'Condiciones claras para utilizar la plataforma.',
    description:
      'Esta sección es un placeholder profesional y requiere revisión legal antes de producción. No constituye asesoría ni validación legal definitiva.',
  },
  cookies: {
    eyebrow: 'Cookies',
    title: 'Preferencias transparentes y controlables.',
    description:
      'La política definitiva se documentará cuando se hayan elegido las herramientas de analítica y medición. No se activarán tecnologías no esenciales sin la revisión correspondiente.',
  },
  'mi-cuenta': {
    eyebrow: 'Área privada',
    title: 'Tu información, accesible de forma segura.',
    description:
      'La autenticación y el dashboard se implementarán en una fase posterior. La primera versión contemplará citas, cursos, compras y perfil, sin expediente clínico.',
  },
  admin: {
    eyebrow: 'Administración',
    title: 'Un espacio privado para operar el ecosistema.',
    description:
      'El panel se habilitará únicamente cuando exista autenticación y control de acceso del lado del servidor. No se muestran datos operativos en esta fase.',
  },
};

export function resolveConfig(slug: string[]): RouteConfig | null {
  const root = slug[0];
  if (routeConfigs[root] && slug.length === 1) {
    return routeConfigs[root];
  }

  if (root === 'podcast' && slug.length === 2) {
    return {
      eyebrow: 'Salud Forte · Episodio',
      title: 'Página editorial preparada para futuros episodios.',
      description:
        'Esta ruta se publicará únicamente cuando exista metadata real del episodio: título, fecha, descripción, enlace oficial y referencias verificadas.',
      primaryHref: '/podcast',
      primaryLabel: 'Volver a Salud Forte',
    };
  }

  if (['masterclass', 'curso', 'producto'].includes(root) && slug.length === 2) {
    return {
      eyebrow: 'Próximamente',
      title: 'Esta experiencia está preparada para una fase futura.',
      description:
        'No hay una oferta publicada en esta ruta. Contenidos, precios y condiciones solo aparecerán cuando sean reales y estén revisados.',
      primaryHref: root === 'producto' ? '/tienda' : '/academia',
      primaryLabel: root === 'producto' ? 'Volver a la tienda' : 'Volver a Academia',
    };
  }

  if (root === 'cita' && slug.length === 2) {
    return {
      eyebrow: 'Administrar cita',
      title: 'El acceso seguro a citas se habilitará próximamente.',
      description:
        'Las citas utilizarán identificadores públicos no secuenciales y tokens seguros. Esta página no acepta ni revela información de pacientes en la Fase 1.',
    };
  }

  if (root === 'mi-cuenta' && slug.length === 2) {
    return routeConfigs['mi-cuenta'];
  }

  if (root === 'admin' && slug.length === 2) {
    return routeConfigs.admin;
  }

  return null;
}

export default function FoundationRoute({ slug }: { slug: string[] }) {
  if (slug[0] === 'cita' && slug.length === 2 && slug[1]) {
    return <ManageAppointmentClient publicId={slug[1]} />;
  }

  const config = resolveConfig(slug);
  if (config) {
    return <ComingSoonPage {...config} />;
  }

  return (
    <ComingSoonPage
      eyebrow="Página no encontrada"
      title="La página solicitada no está disponible."
      description="Verifica la dirección o regresa a la página de inicio."
      primaryHref="/"
      primaryLabel="Volver al inicio"
    />
  );
}
