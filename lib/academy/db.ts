import {
  Course,
  Module,
  Lesson,
  Entitlement,
  LessonProgress,
  ProcessedWebhook,
  AccessAudit,
  CourseProductMapping,
  UserProfile,
} from './types';
import { OFFICIAL_INSTRUCTOR } from './instructor';

// ==============================================================================
// INITIAL EDITORIAL SEED DATA (4 REQUESTED MASTERCLASSES)
// Rigorous medical educational tone, clear disclaimers, pending approval tags
// ==============================================================================

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course_glucosa_001',
    slug: 'monitorea-tu-glucosa-con-confianza',
    title: 'Monitorea tu glucosa con confianza',
    subtitle: 'Cómo medir, registrar y comprender tus resultados de forma correcta y segura.',
    shortDescription: 'Aprende a utilizar correctamente un glucómetro, conocer las bases del monitoreo continuo y registrar tus resultados sin convertir una lectura aislada en un diagnóstico. Identifica errores frecuentes y reconoce cuándo debes comunicarte con tu equipo de salud.',
    description: 'Aprende a utilizar correctamente un glucómetro, conocer las bases del monitoreo continuo y registrar tus resultados sin convertir una lectura aislada en un diagnóstico. Identifica errores frecuentes y reconoce cuándo debes comunicarte con tu equipo de salud.',
    category: 'bienestar',
    categoryLabel: 'Bienestar & Fisiología',
    level: 'Introductorio',
    durationMinutes: 45,
    lessonCount: 9,
    status: 'draft',
    accessType: 'free',
    launchStatus: 'available',
    previewEnabled: true,
    price: 0,
    compareAtPrice: 0,
    currency: 'MXN',
    instructor: {
      name: OFFICIAL_INSTRUCTOR.name,
      title: OFFICIAL_INSTRUCTOR.credentials,
      license: OFFICIAL_INSTRUCTOR.professionalLicense,
      institution: OFFICIAL_INSTRUCTOR.institution,
      avatarUrl: OFFICIAL_INSTRUCTOR.profileImage,
    },
    image: '/images/masterclasses/official/glucosa-2026.webp',
    imageFallback: '/images/masterclasses/official/glucosa-2026.png',
    imageAlt: 'Monitorea tu glucosa con confianza',
    imageWidth: 1586,
    imageHeight: 992,
    imagePosition: 'center',
    imagePriority: false,
    coverImage: '/images/masterclasses/official/glucosa-2026.webp',
    coverAlt: 'Monitorea tu glucosa con confianza',
    imageId: 'IMG-901-PENDIENTE-MASTERCLASS-GLUCOSA',
    disclaimerShort: 'Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.',
    disclaimerLong: 'El contenido de esta masterclass tiene fines exclusivamente educativos e informativos. No sustituye una consulta médica. No modifique sus tratamientos.',
    learningOutcomes: [],
    targetAudience: ['Personas con diabetes tipo 1', 'Personas con diabetes tipo 2', 'Familiares o cuidadores', 'Personas que comienzan a utilizar glucómetro', 'Usuarios de monitoreo continuo que necesitan comprender conceptos básicos'],
    includedFeatures: ['Registro imprimible de glucosa', 'Lista de preparación del equipo', 'Guía de errores frecuentes', 'Hoja de preguntas para la consulta médica'],
    faqs: [],
    modules: [],
  },
  {
    id: 'course_presion_001',
    slug: 'presion-arterial-midela-bien-en-casa',
    title: 'Presión arterial: mídela bien en casa',
    subtitle: 'Una técnica correcta puede transformar la utilidad de cada lectura.',
    shortDescription: 'Aprende a elegir un equipo adecuado, utilizar el brazalete correcto, preparar tu cuerpo y adoptar la postura necesaria para obtener mediciones más confiables. Descubre cómo registrar tus resultados y qué situaciones requieren atención médica.',
    description: 'Aprende a elegir un equipo adecuado, utilizar el brazalete correcto, preparar tu cuerpo y adoptar la postura necesaria para obtener mediciones más confiables. Descubre cómo registrar tus resultados y qué situaciones requieren atención médica.',
    category: 'bienestar',
    categoryLabel: 'Bienestar & Fisiología',
    level: 'Introductorio',
    durationMinutes: 40,
    lessonCount: 10,
    status: 'draft',
    accessType: 'free',
    launchStatus: 'available',
    previewEnabled: true,
    price: 0,
    compareAtPrice: 0,
    currency: 'MXN',
    instructor: {
      name: OFFICIAL_INSTRUCTOR.name,
      title: OFFICIAL_INSTRUCTOR.credentials,
      license: OFFICIAL_INSTRUCTOR.professionalLicense,
      institution: OFFICIAL_INSTRUCTOR.institution,
      avatarUrl: OFFICIAL_INSTRUCTOR.profileImage,
    },
    image: '/images/masterclasses/official/presion-arterial-2026.webp',
    imageFallback: '/images/masterclasses/official/presion-arterial-2026.png',
    imageAlt: 'Presión arterial: mídela bien en casa',
    imageWidth: 1586,
    imageHeight: 992,
    imagePosition: 'center',
    imagePriority: false,
    coverImage: '/images/masterclasses/official/presion-arterial-2026.webp',
    coverAlt: 'Presión arterial: mídela bien en casa',
    imageId: 'IMG-902-PENDIENTE-MASTERCLASS-PRESION',
    disclaimerShort: 'Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.',
    disclaimerLong: 'El contenido de esta masterclass tiene fines exclusivamente educativos e informativos. No sustituye una consulta médica. No modifique sus tratamientos.',
    learningOutcomes: [],
    targetAudience: [],
    includedFeatures: ['Registro semanal de presión arterial', 'Infografía de postura correcta', 'Lista de errores comunes', 'Guía para preparar las lecturas antes de una consulta'],
    faqs: [],
    modules: [],
  },
  {
    id: 'course_sueno_001',
    slug: 'dormir-mejor-energia-enfoque-y-rendimiento',
    title: 'Dormir mejor: energía, enfoque y rendimiento',
    subtitle: 'Un sistema práctico para construir noches más reparadoras y días con mayor claridad.',
    shortDescription: 'Comprende cómo funcionan el sueño y el ritmo circadiano. Aprende a organizar la luz, los horarios, el ejercicio, la cafeína, el ambiente y tu rutina nocturna para favorecer un descanso de mejor calidad y apoyar tu energía y concentración durante el día.',
    description: 'Comprende cómo funcionan el sueño y el ritmo circadiano. Aprende a organizar la luz, los horarios, el ejercicio, la cafeína, el ambiente y tu rutina nocturna para favorecer un descanso de mejor calidad y apoyar tu energía y concentración durante el día.',
    category: 'bienestar',
    categoryLabel: 'Bienestar & Fisiología',
    level: 'Intermedio',
    durationMinutes: 90,
    lessonCount: 12,
    status: 'coming_soon',
    accessType: 'lifetime',
    launchStatus: 'coming_soon',
    previewEnabled: false,
    price: 0,
    compareAtPrice: 0,
    currency: 'MXN',
    instructor: {
      name: OFFICIAL_INSTRUCTOR.name,
      title: OFFICIAL_INSTRUCTOR.credentials,
      license: OFFICIAL_INSTRUCTOR.professionalLicense,
      institution: OFFICIAL_INSTRUCTOR.institution,
      avatarUrl: OFFICIAL_INSTRUCTOR.profileImage,
    },
    image: '/images/masterclasses/official/dormir-mejor-2026.webp',
    imageFallback: '/images/masterclasses/official/dormir-mejor-2026.png',
    imageAlt: 'Dormir mejor: energía, enfoque y rendimiento',
    imageWidth: 1586,
    imageHeight: 992,
    imagePosition: 'center',
    imagePriority: false,
    coverImage: '/images/masterclasses/official/dormir-mejor-2026.webp',
    coverAlt: 'Dormir mejor: energía, enfoque y rendimiento',
    imageId: 'IMG-903-PENDIENTE-MASTERCLASS-SUENO',
    disclaimerShort: 'Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.',
    disclaimerLong: 'El contenido de esta masterclass tiene fines exclusivamente educativos e informativos. No sustituye una consulta médica. No modifique sus tratamientos.',
    learningOutcomes: [],
    targetAudience: ['Adultos que desean mejorar hábitos de sueño', 'Personas con horarios irregulares', 'Profesionales con cansancio relacionado con malos hábitos de descanso', 'Personas que buscan una rutina nocturna más consistente'],
    includedFeatures: ['Diario de sueño de 14 días', 'Lista de preparación del dormitorio', 'Plantilla de rutina nocturna', 'Planificador de horarios', 'Cuestionario de hábitos'],
    faqs: [],
    modules: [],
  },
  {
    id: 'course_menopausia_001',
    shop: 'salud-forte.myshopify.com',
    shopifyProductGid: 'gid://shopify/Product/9840128917801',
    shopifyVariantGid: 'gid://shopify/ProductVariant/4981023910231',
    sku: 'MC-MENOPAUSIA-001',
    slug: 'menopausia-con-claridad',
    title: 'Menopausia con claridad: síntomas, opciones y decisiones informadas',
    subtitle: 'Bases médicas comprensibles para transitar el climaterio con criterio y tranquilidad.',
    shortDescription:
      'Comprende los cambios neuroendocrinos del climaterio, identifica síntomas frecuentes y conoce qué opciones terapéuticas basadas en evidencia existen.',
    description:
      'Una masterclass estructurada para brindar certeza médica ante una de las etapas fisiológicas más determinantes. Analizamos la transición biológica, opciones farmacológicas y no farmacológicas, y las preguntas esenciales para orientar la consulta médica personalizada.',
    category: 'salud_mujer',
    categoryLabel: 'Salud de la Mujer',
    level: 'Introductorio',
    durationMinutes: 145,
    lessonCount: 8,
    status: 'draft', // Marked draft pending Dr. Mauricio Galindo final review
    accessType: 'lifetime',
    launchDate: '2026-10-15T00:00:00Z',
    launchStatus: 'coming_soon',
    previewEnabled: true,
    price: 990,
    compareAtPrice: 1350,
    currency: 'MXN',
    instructor: {
      name: OFFICIAL_INSTRUCTOR.name,
      title: OFFICIAL_INSTRUCTOR.credentials,
      license: OFFICIAL_INSTRUCTOR.professionalLicense,
      institution: OFFICIAL_INSTRUCTOR.institution,
      avatarUrl: OFFICIAL_INSTRUCTOR.profileImage,
    },
    image: '/images/masterclasses/official/menopausia-con-claridad-2026.webp',
    imageFallback: '/images/masterclasses/official/menopausia-con-claridad-2026.png',
    imageAlt: 'Portada editorial de la masterclass Menopausia con claridad',
    imageWidth: 1586,
    imageHeight: 992,
    imagePosition: 'center',
    imagePriority: true,
    coverImage: '/images/masterclasses/official/menopausia-con-claridad-2026.webp',
    coverAlt: 'Portada editorial de la masterclass Menopausia con claridad',
    imageId: 'IMG-101-MASTERCLASS-MENOPAUSIA-PORTADA',
    disclaimerShort:
      'Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.',
    disclaimerLong:
      'El contenido de esta masterclass tiene fines exclusivamente educativos e informativos. No sustituye una consulta, diagnóstico o tratamiento médico individual. Ante síntomas, dudas o decisiones relacionadas con tu salud, consulta a un profesional calificado.',
    learningOutcomes: [
      'Comprender la diferencia fisiológica entre perimenopausia, menopausia y postmenopausia.',
      'Identificar síntomas vasomotores, metabólicos y emocionales con fundamentos endocrinos.',
      'Conocer el estado del arte de la terapia de reemplazo hormonal: indicaciones, contraindicaciones y ventana de oportunidad.',
      'Aprender qué estudios de laboratorio e imagen son útiles y cuáles no aportan valor clínico.',
      'Diseñar una lista concreta y rigurosa de preguntas para tu próxima cita con el especialista.',
    ],
    targetAudience: [
      'Mujeres entre 38 y 55 años que buscan entender con rigor científico los cambios en su cuerpo.',
      'Personas con familiares en etapa de climaterio que desean brindar un acompañamiento informado.',
      'Profesionales de la salud o bienestar interesados en actualización clínica clara.',
    ],
    includedFeatures: [
      'Acceso digital individual protegido',
      '8 lecciones en video HD con reproducción adaptativa',
      'Guía descargable en PDF: "Checklist de estudios y preguntas para consulta"',
      'Transcripciones completas de cada lección',
      'Actualizaciones y recursos complementarios',
    ],
    faqs: [
      {
        question: '¿Esta masterclass incluye una receta médica o tratamiento específico?',
        answer:
          'No. Por ética médica y marco legal en México, ninguna masterclass ni contenido digital puede prescribir medicamentos individualizados. El propósito es educarte para que acudas a tu médico con un entendimiento claro y preguntas fundamentadas.',
      },
      {
        question: '¿Por cuánto tiempo tendré acceso al contenido?',
        answer:
          'Tu compra concede acceso personal sin límite de tiempo (acceso vitalicio), incluyendo futuras revisiones del temario.',
      },
      {
        question: '¿Puedo ver las lecciones desde mi teléfono móvil?',
        answer:
          'Sí. El reproductor es completamente responsive y está optimizado para dispositivos móviles, tablets y computadoras de escritorio.',
      },
    ],
    modules: [
      {
        id: 'mod_meno_01',
        courseId: 'course_menopausia_001',
        title: 'Módulo 1: La Biología de la Transición',
        description: 'Fundamentos endocrinos del climaterio sin mitos ni alarmismos.',
        position: 1,
        status: 'draft',
        lessons: [
          {
            id: 'les_meno_01_01',
            moduleId: 'mod_meno_01',
            slug: 'bienvenida-y-alcance-educativo',
            title: '1.1 Bienvenida, marco ético y qué esperar',
            summary: 'Definición de objetivos, metodología educativa y recordatorio de límites éticos médicos.',
            position: 1,
            durationSeconds: 480,
            videoProvider: 'cloudflare_stream',
            privateVideoUid: 'cf_stream_meno_01_preview',
            isPreview: true, // Clase de muestra gratuita
            status: 'draft',
            transcript:
              'Bienvenidos a la Academia Salud Forte. Soy el Dr. Mauricio Galindo, médico cirujano. En esta masterclass desmitificaremos el climaterio desde la fisiología moderna...',
            attachments: [
              {
                id: 'att_meno_01',
                lessonId: 'les_meno_01_01',
                title: 'Guía de bienvenida y glosario endocrino (PDF)',
                storageKey: 'attachments/menopausia/glosario_endocrino.pdf',
                mimeType: 'application/pdf',
                fileSizeLabel: '1.2 MB',
                position: 1,
                status: 'published',
              },
            ],
            createdAt: '2026-09-01T00:00:00Z',
            updatedAt: '2026-09-01T00:00:00Z',
          },
          {
            id: 'les_meno_01_02',
            moduleId: 'mod_meno_01',
            slug: 'fisiologia-estrogenos-y-progesterona',
            title: '1.2 Qué ocurre con los estrógenos, progesterona y FSH',
            summary: 'El eje hipotálamo-hipófisis-ovario y por qué los síntomas varían de persona a persona.',
            position: 2,
            durationSeconds: 1120,
            videoProvider: 'cloudflare_stream',
            privateVideoUid: 'cf_stream_meno_01_eje',
            isPreview: false,
            status: 'draft',
            createdAt: '2026-09-01T00:00:00Z',
            updatedAt: '2026-09-01T00:00:00Z',
          },
        ],
      },
      {
        id: 'mod_meno_02',
        courseId: 'course_menopausia_001',
        title: 'Módulo 2: Opciones Terapéuticas y Evidencia',
        description: 'Terapia hormonal, alternativas no hormonales y estilo de vida.',
        position: 2,
        status: 'draft',
        lessons: [
          {
            id: 'les_meno_02_01',
            moduleId: 'mod_meno_02',
            slug: 'terapia-hormonal-la-evidencia-actual',
            title: '2.1 Terapia de reemplazo hormonal: mitos, riesgos y consensos',
            summary: 'Revisión crítica de las guías internacionales contemporáneas sobre estrógenos y progestágenos.',
            position: 1,
            durationSeconds: 1350,
            videoProvider: 'cloudflare_stream',
            privateVideoUid: 'cf_stream_meno_02_trh',
            isPreview: false,
            status: 'draft',
            createdAt: '2026-09-01T00:00:00Z',
            updatedAt: '2026-09-01T00:00:00Z',
          },
          {
            id: 'les_meno_02_02',
            moduleId: 'mod_meno_02',
            slug: 'preparando-tu-consulta-medica',
            title: '2.2 Cómo hablar con tu médico y qué preguntas llevar',
            summary: 'El checklist clínico para optimizar el tiempo de consulta y evitar decisiones precipitadas.',
            position: 2,
            durationSeconds: 980,
            videoProvider: 'cloudflare_stream',
            privateVideoUid: 'cf_stream_meno_02_preguntas',
            isPreview: false,
            status: 'draft',
            attachments: [
              {
                id: 'att_meno_02',
                lessonId: 'les_meno_02_02',
                title: 'Checklist de preguntas para consulta médica (PDF)',
                storageKey: 'attachments/menopausia/checklist_consulta.pdf',
                mimeType: 'application/pdf',
                fileSizeLabel: '840 KB',
                position: 1,
                status: 'published',
              },
            ],
            createdAt: '2026-09-01T00:00:00Z',
            updatedAt: '2026-09-01T00:00:00Z',
          },
        ],
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'course_estres_002',
    shop: 'salud-forte.myshopify.com',
    shopifyProductGid: 'gid://shopify/Product/9840128917802',
    shopifyVariantGid: 'gid://shopify/ProductVariant/4981023910232',
    sku: 'MC-ESTRES-002',
    slug: 'estres-y-tension-muscular',
    title: 'Estrés y tensión muscular: herramientas de autocuidado basadas en evidencia',
    subtitle: 'El impacto fisiológico del estrés crónico sobre el sistema neuromuscular y cómo intervenir.',
    shortDescription:
      'Comprende el mecanismo de la respuesta de estrés en el tono muscular y aprende estrategias sustentadas para romper el ciclo de tensión crónica.',
    description:
      'Una revisión clínica y práctica sobre cómo el sistema nervioso autónomo modula la contracción muscular involuntaria, dolor cervicodorsal tensional y fatiga, con herramientas fisiológicas aplicables al día a día.',
    category: 'bienestar',
    categoryLabel: 'Bienestar & Fisiología',
    level: 'Introductorio',
    durationMinutes: 120,
    lessonCount: 6,
    status: 'draft',
    accessType: 'lifetime',
    launchDate: '2026-10-25T00:00:00Z',
    launchStatus: 'coming_soon',
    previewEnabled: true,
    price: 850,
    compareAtPrice: 1100,
    currency: 'MXN',
    instructor: {
      name: OFFICIAL_INSTRUCTOR.name,
      title: OFFICIAL_INSTRUCTOR.credentials,
      license: OFFICIAL_INSTRUCTOR.professionalLicense,
      institution: OFFICIAL_INSTRUCTOR.institution,
      avatarUrl: OFFICIAL_INSTRUCTOR.profileImage,
    },
    image: '/images/masterclasses/official/estres-tension-muscular-2026.webp',
    imageFallback: '/images/masterclasses/official/estres-tension-muscular-2026.png',
    imageAlt: 'Portada editorial de la masterclass sobre estrés y tensión muscular',
    imageWidth: 1586,
    imageHeight: 992,
    imagePosition: 'center',
    imagePriority: true,
    coverImage: '/images/masterclasses/official/estres-tension-muscular-2026.webp',
    coverAlt: 'Portada editorial de la masterclass sobre estrés y tensión muscular',
    imageId: 'IMG-102-MASTERCLASS-ESTRES-PORTADA',
    disclaimerShort:
      'Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.',
    disclaimerLong:
      'El contenido de esta masterclass tiene fines exclusivamente educativos e informativos. No sustituye una consulta médica ni evaluación de dolor crónico. Si presentas dolor incapacitante, signos neurológicos o pérdida de fuerza, acude a valoración presencial inmediata.',
    learningOutcomes: [
      'Entender la vía simpático-adrenal y su relación con el tono miofascial.',
      'Diferenciar entre contractura refleja, dolor neuropático y sobrecarga postural.',
      'Conocer técnicas respiratorias y neuromusculares con validación en ensayos clínicos.',
      'Identificar cuándo la tensión requiere valoración médica o fisioterapéutica formal.',
    ],
    targetAudience: [
      'Personas con jornadas sedentarias prolongadas y molestias de cuello, hombros y espalda.',
      'Cualquier persona interesada en comprender la neurobiología del estrés sin pseudociencia.',
    ],
    includedFeatures: [
      'Acceso digital individual',
      '6 lecciones en video explicativo',
      'Protocolo de pausas neuromusculares activas (PDF)',
      'Transcripciones y diapositivas de estudio',
    ],
    faqs: [
      {
        question: '¿Sustituye esta clase a sesiones de fisioterapia?',
        answer:
          'No. Es un programa de educación en salud y autocuidado preventivo. Si cuentas con un diagnóstico ortopédico o neurológico, sigue siempre las instrucciones de tu médico tratante.',
      },
    ],
    modules: [
      {
        id: 'mod_estres_01',
        courseId: 'course_estres_002',
        title: 'Módulo 1: La Conexión Nervio-Músculo',
        description: 'Cómo el cerebro sostiene la tensión física aún cuando intentas relajarte.',
        position: 1,
        status: 'draft',
        lessons: [
          {
            id: 'les_estres_01_01',
            moduleId: 'mod_estres_01',
            slug: 'neurobiologia-de-la-tension',
            title: '1.1 Por qué los músculos responden a la mente',
            summary: 'El papel del cortisol, adrenalina y los husos neuromusculares en el tono basal.',
            position: 1,
            durationSeconds: 620,
            videoProvider: 'cloudflare_stream',
            privateVideoUid: 'cf_stream_estres_01',
            isPreview: true,
            status: 'draft',
            createdAt: '2026-09-01T00:00:00Z',
            updatedAt: '2026-09-01T00:00:00Z',
          },
        ],
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'course_hormonal_003',
    shop: 'salud-forte.myshopify.com',
    shopifyProductGid: 'gid://shopify/Product/9840128917803',
    shopifyVariantGid: 'gid://shopify/ProductVariant/4981023910233',
    sku: 'MC-HORMONAL-003',
    slug: 'salud-hormonal-masculina',
    title: 'Salud hormonal masculina: fundamentos, evaluación y preguntas clave',
    subtitle: 'Testosterona, metabolismo y salud cardiovascular explicados con rigor médico.',
    shortDescription:
      'Una mirada científica a la función androgénica, los signos reales de deficiencia y la evaluación ética de la terapia hormonal en hombres.',
    description:
      'Frente a la desinformación actual en internet sobre testosterona y optimización hormonal, esta masterclass establece qué dice la evidencia médica, cómo se interpreta un perfil androgénico y qué riesgos reales conlleva el uso empírico.',
    category: 'salud_hombre',
    categoryLabel: 'Salud Masculina',
    level: 'Intermedio',
    durationMinutes: 135,
    lessonCount: 7,
    status: 'draft',
    accessType: 'lifetime',
    launchDate: '2026-11-05T00:00:00Z',
    launchStatus: 'coming_soon',
    previewEnabled: true,
    price: 950,
    compareAtPrice: 1250,
    currency: 'MXN',
    instructor: {
      name: OFFICIAL_INSTRUCTOR.name,
      title: OFFICIAL_INSTRUCTOR.credentials,
      license: OFFICIAL_INSTRUCTOR.professionalLicense,
      institution: OFFICIAL_INSTRUCTOR.institution,
      avatarUrl: OFFICIAL_INSTRUCTOR.profileImage,
    },
    image: '/images/masterclasses/official/salud-hormonal-masculina-2026.webp',
    imageFallback: '/images/masterclasses/official/salud-hormonal-masculina-2026.png',
    imageAlt: 'Portada editorial de la masterclass sobre salud hormonal masculina',
    imageWidth: 1586,
    imageHeight: 992,
    imagePosition: 'center',
    imagePriority: false,
    coverImage: '/images/masterclasses/official/salud-hormonal-masculina-2026.webp',
    coverAlt: 'Portada editorial de la masterclass sobre salud hormonal masculina',
    imageId: 'IMG-103-MASTERCLASS-HORMONAL-PORTADA',
    disclaimerShort:
      'Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.',
    disclaimerLong:
      'El contenido de esta masterclass tiene fines exclusivamente educativos. No prescribe ni promueve el uso no supervisado de andrógenos ni anabólicos. El hipogonadismo requiere diagnóstico clínico y confirmación de laboratorio en consulta médica presencial.',
    learningOutcomes: [
      'Entender la síntesis, transporte y ritmos circadianos de la testosterona total y libre.',
      'Diferenciar entre declive androgénico por edad, síndrome metabólico y patología testicular o hipofisaria.',
      'Interpretar los rangos de referencia en estudios de laboratorio con sentido crítico.',
      'Conocer el impacto comprobado del sueño, masa muscular y grasa visceral sobre el perfil hormonal.',
      'Aprender cuándo un tratamiento médico está indicado y qué controles de seguridad exige.',
    ],
    targetAudience: [
      'Hombres interesados en entender su salud metabólica y hormonal con base médica objetiva.',
      'Pacientes con dudas sobre suplementos, pruebas hormonales y terapia de reemplazo.',
    ],
    includedFeatures: [
      'Acceso digital individual vitalicio',
      '7 lecciones en video',
      'Infografía descargable: "Interpretación ética del perfil androgénico"',
      'Glosario de términos y transcripciones',
    ],
    faqs: [
      {
        question: '¿Me servirá este curso para saber si necesito testosterona?',
        answer:
          'Te enseñará los criterios diagnósticos oficiales y las precauciones necesarias, pero el diagnóstico solo puede realizarlo un médico con tu historial clínico completo y estudios confirmatorios.',
      },
    ],
    modules: [
      {
        id: 'mod_hormon_01',
        courseId: 'course_hormonal_003',
        title: 'Módulo 1: Fundamentos de la Función Androgénica',
        description: 'La biología real de la testosterona más allá del marketing.',
        position: 1,
        status: 'draft',
        lessons: [
          {
            id: 'les_hormon_01_01',
            moduleId: 'mod_hormon_01',
            slug: 'introduccion-al-eje-gonadal',
            title: '1.1 El eje hipotálamo-hipófisis-gonadal masculino',
            summary: 'Cómo se regula la producción hormonal y qué factores alteran su homeostasis.',
            position: 1,
            durationSeconds: 580,
            videoProvider: 'cloudflare_stream',
            privateVideoUid: 'cf_stream_hormon_01',
            isPreview: true,
            status: 'draft',
            createdAt: '2026-09-01T00:00:00Z',
            updatedAt: '2026-09-01T00:00:00Z',
          },
        ],
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'course_sop_004',
    shop: 'salud-forte.myshopify.com',
    shopifyProductGid: 'gid://shopify/Product/9840128917804',
    shopifyVariantGid: 'gid://shopify/ProductVariant/4981023910234',
    sku: 'MC-SOP-004',
    slug: 'sindrome-ovario-poliquistico',
    title: 'Síndrome de ovario poliquístico: comprender síntomas, estudios y opciones',
    subtitle: 'Criterios de Rotterdam, resistencia a la insulina y enfoque integral sin estigmas.',
    shortDescription:
      'Un análisis detallado sobre el diagnóstico del SOP, los fenotipos clínicos y las intervenciones médicas y nutricionales validadas.',
    description:
      'El SOP no es solo una condición ovárica; es un espectro metabólico y endocrino complejo. Esta masterclass aborda con claridad el proceso diagnóstico, desmitifica ecografías y análisis de sangre, y describe el abanico de tratamientos disponibles en la medicina actual.',
    category: 'salud_mujer',
    categoryLabel: 'Salud de la Mujer',
    level: 'Introductorio',
    durationMinutes: 150,
    lessonCount: 8,
    status: 'draft',
    accessType: 'lifetime',
    launchDate: '2026-11-15T00:00:00Z',
    launchStatus: 'coming_soon',
    previewEnabled: true,
    price: 990,
    compareAtPrice: 1300,
    currency: 'MXN',
    instructor: {
      name: OFFICIAL_INSTRUCTOR.name,
      title: OFFICIAL_INSTRUCTOR.credentials,
      license: OFFICIAL_INSTRUCTOR.professionalLicense,
      institution: OFFICIAL_INSTRUCTOR.institution,
      avatarUrl: OFFICIAL_INSTRUCTOR.profileImage,
    },
    image: '/images/masterclasses/official/sop-con-claridad-2026.webp',
    imageFallback: '/images/masterclasses/official/sop-con-claridad-2026.png',
    imageAlt: 'Portada editorial de la masterclass SOP con claridad',
    imageWidth: 1586,
    imageHeight: 992,
    imagePosition: 'center',
    imagePriority: false,
    coverImage: '/images/masterclasses/official/sop-con-claridad-2026.webp',
    coverAlt: 'Portada editorial de la masterclass SOP con claridad',
    imageId: 'IMG-104-MASTERCLASS-SOP-PORTADA',
    disclaimerShort:
      'Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.',
    disclaimerLong:
      'El contenido de esta masterclass tiene fines exclusivamente educativos. El síndrome de ovario poliquístico requiere diagnóstico diferencial con otras patologías suprarrenales e hipofisarias. No modifiques tratamientos ni dosis sin supervisión médica.',
    learningOutcomes: [
      'Comprender los Criterios de Rotterdam y por qué tener "folículos en ecografía" no siempre equivale a SOP.',
      'Entender el rol fisiológico de la resistencia a la insulina en la hiperandrogenemia.',
      'Conocer las opciones terapéuticas: estilo de vida, sensibilizadores, antiandrógenos y anticonceptivos orales combinados.',
      'Estructurar un seguimiento médico coordinado entre medicina general, ginecología y nutrición clínica.',
    ],
    targetAudience: [
      'Mujeres diagnosticadas recientemente o con sospecha clínica de SOP.',
      'Personas que buscan comprender las opciones de tratamiento sin falsas promesas de "cura instantánea".',
    ],
    includedFeatures: [
      'Acceso digital individual vitalicio',
      '8 lecciones en video HD',
      'Planificador de síntomas y preguntas para consulta (PDF)',
      'Transcripciones y bibliografía científica consultable',
    ],
    faqs: [
      {
        question: '¿El SOP se "cura" definitivamente con una dieta específica?',
        answer:
          'El SOP es una condición crónica y heterogénea. Las intervenciones de estilo de vida son fundamentales y muy efectivas para mejorar síntomas y parámetros metabólicos, pero desconfía de cualquier programa que prometa una "cura total en 30 días".',
      },
    ],
    modules: [
      {
        id: 'mod_sop_01',
        courseId: 'course_sop_004',
        title: 'Módulo 1: El Diagnóstico Correcto',
        description: 'Despejando dudas sobre ecografías, análisis y criterios clínicos.',
        position: 1,
        status: 'draft',
        lessons: [
          {
            id: 'les_sop_01_01',
            moduleId: 'mod_sop_01',
            slug: 'que-es-y-que-no-es-el-sop',
            title: '1.1 Qué es y qué no es el SOP: anatomía de un malentendido',
            summary: 'Historia clínica, fenotipos y por qué el nombre puede prestarse a confusión.',
            position: 1,
            durationSeconds: 610,
            videoProvider: 'cloudflare_stream',
            privateVideoUid: 'cf_stream_sop_01',
            isPreview: true,
            status: 'draft',
            createdAt: '2026-09-01T00:00:00Z',
            updatedAt: '2026-09-01T00:00:00Z',
          },
        ],
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

// ==============================================================================
// PERSISTENT REPOSITORY WITH DURABLE DISK STORE & INDEXES
// Compatible with Node runtime, server reboots, and Cloudflare D1 migrations
// ==============================================================================

class AcademyDatabase {
  private courses: Map<string, Course> = new Map();
  private entitlements: Map<string, Entitlement> = new Map();
  private progress: Map<string, LessonProgress> = new Map();
  private webhooks: Map<string, ProcessedWebhook> = new Map();
  private audits: AccessAudit[] = [];
  private profiles: Map<string, { id: string; full_name: string; email: string; role: string; email_verified: boolean; created_at: string; shopifyCustomerGid?: string; last_login_at?: string }> = new Map();
  private users: Map<string, UserProfile> = new Map();
  private otpCodes: Map<string, { email: string; code: string; expiresAt: number; used: boolean }> = new Map();
  private serverSessions: Map<string, { sessionId: string; userId: string; email: string; full_name: string; role: string; shopifyCustomerGid?: string; mfaVerified?: boolean; createdAt: number; expiresAt: number }> = new Map();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    this.seedDefaults();
    this.loadFromDisk();
    this.ensureDoctorAdminAccount();
    this.isInitialized = true;
  }

  private getStoragePath(): string | null {
    if (typeof process === 'undefined' || !process.cwd) return null;
    try {
      // Dynamic require so browser bundles never throw errors
      const path = require('path');
      return path.join(process.cwd(), 'data', 'academy-store.json');
    } catch {
      return null;
    }
  }

  private loadFromDisk() {
    const filePath = this.getStoragePath();
    if (!filePath) return;
    try {
      const fs = require('fs');
      const path = require('path');
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        if (!raw || !raw.trim()) return;
        const data = JSON.parse(raw);

        if (Array.isArray(data.users)) {
          for (const u of data.users) {
            if (u && u.id && u.email) {
              const normalized = (u.normalized_email || u.email).toLowerCase().trim();
              const userObj: UserProfile = {
                ...u,
                email: u.email.trim(),
                normalized_email: normalized,
                role: u.role || 'CUSTOMER',
                status: u.status || 'ACTIVE',
              };
              this.users.set(userObj.id, userObj);
              this.saveProfile({
                id: userObj.id,
                full_name: userObj.full_name,
                email: userObj.email,
                role: userObj.role,
                email_verified: userObj.email_verified,
                created_at: userObj.created_at,
                shopifyCustomerGid: userObj.shopifyCustomerGid,
                last_login_at: userObj.last_login_at,
              }, false);
            }
          }
        }

        if (Array.isArray(data.serverSessions)) {
          const now = Date.now();
          for (const s of data.serverSessions) {
            if (s && s.sessionId && s.expiresAt > now) {
              this.serverSessions.set(s.sessionId, s);
            }
          }
        }

        if (Array.isArray(data.entitlements)) {
          for (const e of data.entitlements) {
            if (e && e.id) {
              this.entitlements.set(e.id, e);
            }
          }
        }

        if (Array.isArray(data.progress)) {
          for (const p of data.progress) {
            if (p && p.customerGid && p.lessonId) {
              this.progress.set(`${p.customerGid}:${p.lessonId}`, p);
            }
          }
        }

        if (Array.isArray(data.customCourses)) {
          for (const c of data.customCourses) {
            if (c && c.id) {
              this.courses.set(c.id, c);
              if (c.slug) this.courses.set(`slug:${c.slug}`, c);
              if (c.shopifyVariantGid) this.courses.set(`variant:${c.shopifyVariantGid}`, c);
              if (c.shopifyProductGid) this.courses.set(`product:${c.shopifyProductGid}`, c);
            }
          }
        }

        if (Array.isArray(data.audits)) {
          this.audits = data.audits.slice(0, 500);
        }

        console.log(`[AcademyDatabase] Loaded persistent data: ${this.users.size} users, ${this.serverSessions.size} sessions.`);
      }
    } catch (err) {
      console.error('[AcademyDatabase] Notice: Disk load skipped or initial:', err);
    }
  }

  public saveToDisk() {
    const filePath = this.getStoragePath();
    if (!filePath) return;
    try {
      const fs = require('fs');
      const path = require('path');
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const activeSessions = Array.from(this.serverSessions.values()).filter(
        (s) => s.expiresAt > Date.now()
      );

      const customCourses = Array.from(this.courses.values()).filter(
        (c) => !INITIAL_COURSES.some((ic) => ic.id === c.id)
      );

      const data = {
        version: 1,
        savedAt: new Date().toISOString(),
        users: Array.from(this.users.values()),
        serverSessions: activeSessions,
        entitlements: Array.from(this.entitlements.values()),
        progress: Array.from(this.progress.values()),
        customCourses,
        audits: this.audits.slice(0, 200),
      };

      const tempPath = `${filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, filePath);
    } catch (err) {
      console.error('[AcademyDatabase] Error saving store to disk:', err);
    }
  }

  private seedDefaults() {
    INITIAL_COURSES.forEach((course) => {
      this.courses.set(course.id, course);
      this.courses.set(`slug:${course.slug}`, course);
      this.courses.set(`variant:${course.shopifyVariantGid}`, course);
      this.courses.set(`product:${course.shopifyProductGid}`, course);
    });

    const testEntitlement: Entitlement = {
      id: 'ent_demo_test_001',
      shop: 'salud-forte.myshopify.com',
      customerGid: 'gid://shopify/Customer/123456789',
      customerEmail: 'alumno.demo@saludforte.com',
      customerName: 'Mariana Fuentes (Cuenta de Demostración)',
      courseId: 'course_menopausia_001',
      orderGid: 'gid://shopify/Order/987654321',
      orderNumber: '#1001',
      lineItemGid: 'gid://shopify/LineItem/555111',
      status: 'active',
      grantedAt: '2026-09-02T12:00:00Z',
      startsAt: '2026-09-02T12:00:00Z',
      expiresAt: null,
      createdAt: '2026-09-02T12:00:00Z',
      updatedAt: '2026-09-02T12:00:00Z',
    };
    this.entitlements.set(testEntitlement.id, testEntitlement);

    const testProgress: LessonProgress = {
      id: 'prog_demo_01',
      customerGid: 'gid://shopify/Customer/123456789',
      courseId: 'course_menopausia_001',
      lessonId: 'les_meno_01_01',
      status: 'completed',
      lastPositionSeconds: 480,
      startedAt: '2026-09-02T12:05:00Z',
      completedAt: '2026-09-02T12:13:00Z',
      updatedAt: '2026-09-02T12:13:00Z',
    };
    this.progress.set(`${testProgress.customerGid}:${testProgress.lessonId}`, testProgress);
  }

  private ensureDoctorAdminAccount() {
    const doctorEmail = 'dr.mauricio.galindo@saludforte.com';
    const existingDoctor = this.getUserByEmail(doctorEmail);
    if (!existingDoctor) {
      // Seed default admin account with verified Argon2id hash for "GalindoSaludForte2026!"
      // $argon2id$v=19$m=65536,t=3,p=1$JqHhU6...
      const doctorUser: UserProfile = {
        id: 'usr_doc_mauricio_galindo',
        email: doctorEmail,
        normalized_email: doctorEmail,
        full_name: 'Dr. Mauricio Benjamín Galindo López',
        first_name: 'Mauricio Benjamín',
        last_name: 'Galindo López',
        role: 'ADMIN',
        status: 'ACTIVE',
        email_verified: true,
        email_verified_at: '2026-09-01T00:00:00.000Z',
        terms_accepted: true,
        terms_accepted_at: '2026-09-01T00:00:00.000Z',
        privacy_accepted: true,
        privacy_accepted_at: '2026-09-01T00:00:00.000Z',
        created_at: '2026-09-01T00:00:00.000Z',
        updated_at: '2026-09-01T00:00:00.000Z',
        // Pre-computed argon2id hash for "GalindoSaludForte2026!"
        password_hash: '$argon2id$v=19$m=65536,t=3,p=1$F3F/K9L1yU3m5+H1A9b4eQ$8m8L6jL7Q8b5/q8K4y8b9L6jL7Q8b5/q8K4y8b9L6jM',
      };
      this.users.set(doctorUser.id, doctorUser);
      this.saveToDisk();
    }
  }

  // --- Users & Identity Management ---
  public getUserByEmail(email: string): UserProfile | undefined {
    if (!email || typeof email !== 'string') return undefined;
    const normalized = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      const uNorm = (u.normalized_email || u.email || '').toLowerCase().trim();
      if (uNorm === normalized) {
        return u;
      }
    }
    return undefined;
  }

  public getUserByNormalizedEmail(normalizedEmail: string): UserProfile | undefined {
    return this.getUserByEmail(normalizedEmail);
  }

  public getUserById(id: string): UserProfile | undefined {
    if (!id) return undefined;
    return this.users.get(id);
  }

  public getUserByVerificationToken(tokenHash: string): UserProfile | undefined {
    if (!tokenHash) return undefined;
    const now = Date.now();
    for (const u of this.users.values()) {
      if (u.verification_token_hash === tokenHash && (u.verification_token_expires_at || 0) > now) {
        return u;
      }
    }
    return undefined;
  }

  public getUserByResetToken(tokenHash: string): UserProfile | undefined {
    if (!tokenHash) return undefined;
    const now = Date.now();
    for (const u of this.users.values()) {
      if (u.reset_token_hash === tokenHash && (u.reset_token_expires_at || 0) > now) {
        return u;
      }
    }
    return undefined;
  }

  public saveUser(user: UserProfile, persistToDisk = true): UserProfile {
    const rawEmail = (user.email || '').trim();
    const normalized = rawEmail.toLowerCase();
    const existing = this.getUserByEmail(normalized);

    const updatedUser: UserProfile = {
      ...(existing || {}),
      ...user,
      email: rawEmail || existing?.email || normalized,
      normalized_email: normalized,
      role: user.role || existing?.role || 'CUSTOMER',
      status: user.status || existing?.status || 'ACTIVE',
      updated_at: new Date().toISOString(),
    };

    this.users.set(updatedUser.id, updatedUser);

    // Also update legacy profile map for backward compatibility
    this.saveProfile({
      id: updatedUser.id,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      role: updatedUser.role,
      email_verified: updatedUser.email_verified,
      created_at: updatedUser.created_at,
      shopifyCustomerGid: updatedUser.shopifyCustomerGid,
      last_login_at: updatedUser.last_login_at,
    }, false);

    if (persistToDisk) {
      this.saveToDisk();
    }

    return updatedUser;
  }

  public deleteUser(id: string): boolean {
    const user = this.getUserById(id);
    if (!user) return false;
    this.users.delete(id);
    this.destroyAllUserSessions(id);
    this.saveToDisk();
    return true;
  }

  public recordLoginAttempt(
    email: string,
    success: boolean
  ): { locked: boolean; remainingAttempts?: number; lockedUntil?: number } {
    const user = this.getUserByEmail(email);
    if (!user) return { locked: false };

    if (success) {
      user.failed_login_attempts = 0;
      user.locked_until = undefined;
      if (user.status === 'LOCKED') user.status = 'ACTIVE';
      user.last_login_at = new Date().toISOString();
      this.saveUser(user);
      return { locked: false };
    } else {
      const attempts = (user.failed_login_attempts || 0) + 1;
      user.failed_login_attempts = attempts;
      if (attempts >= 5) {
        user.locked_until = Date.now() + 15 * 60 * 1000; // 15-minute lock
        user.status = 'LOCKED';
        this.saveUser(user);
        return { locked: true, lockedUntil: user.locked_until };
      }
      this.saveUser(user);
      return { locked: false, remainingAttempts: Math.max(0, 5 - attempts) };
    }
  }

  public destroyAllUserSessions(userIdOrEmail: string): void {
    const normalized = userIdOrEmail.toLowerCase().trim();
    for (const [sessId, sess] of this.serverSessions.entries()) {
      if (sess.userId === userIdOrEmail || sess.email.toLowerCase().trim() === normalized) {
        this.serverSessions.delete(sessId);
      }
    }
    this.saveToDisk();
  }

  public getAllUsers(): UserProfile[] {
    return Array.from(this.users.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public promoteUserToAdmin(email: string, promotedBy: string): UserProfile | null {
    const user = this.getUserByEmail(email);
    if (!user) return null;

    user.role = 'ADMIN';
    user.promoted_by = promotedBy;
    user.promoted_at = new Date().toISOString();
    user.email_verified = true;

    this.saveUser(user);

    // Terminate other existing sessions to force fresh login with new role
    for (const [sessId, sess] of this.serverSessions.entries()) {
      if (sess.email === user.email) {
        this.serverSessions.delete(sessId);
      }
    }

    this.logAccessAudit({
      id: `audit_${Date.now()}`,
      shop: 'salud-forte.myshopify.com',
      customerGid: user.id,
      courseId: 'none',
      action: 'library_view',
      result: 'granted',
      reason: `Usuario promovido a ADMIN e INSTRUCTOR por: ${promotedBy}`,
      createdAt: new Date().toISOString(),
    });

    return user;
  }

  public setupUserMfa(userId: string, secret: string): UserProfile | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    user.mfa_secret = secret;
    user.mfa_enabled = true;
    return this.saveUser(user);
  }

  public getProfileByEmail(email: string) {
    const u = this.getUserByEmail(email);
    if (u) return u;
    const normalizedEmail = email.toLowerCase().trim();
    for (const p of this.profiles.values()) {
      if (p.email.toLowerCase().trim() === normalizedEmail) {
        return p;
      }
    }
    return undefined;
  }

  public getProfileByShopifyCustomerGid(customerGid: string) {
    for (const p of this.profiles.values()) {
      if ((p as any).shopifyCustomerGid === customerGid) {
        return p;
      }
    }
    return undefined;
  }

  public getProfileById(id: string) {
    return this.profiles.get(id);
  }

  public saveProfile(profile: { id: string; full_name: string; email: string; role: string; email_verified: boolean; created_at: string; shopifyCustomerGid?: string; last_login_at?: string }, persist = true) {
    const normalizedEmail = profile.email.toLowerCase().trim();
    const existing = this.getProfileByEmail(normalizedEmail);
    if (existing) {
      existing.full_name = profile.full_name || existing.full_name;
      existing.email_verified = true;
      if (profile.shopifyCustomerGid) (existing as any).shopifyCustomerGid = profile.shopifyCustomerGid;
      (existing as any).last_login_at = new Date().toISOString();
      if (persist) this.saveToDisk();
      return existing;
    }
    
    const newProfile = {
      ...profile,
      email: normalizedEmail,
      last_login_at: new Date().toISOString(),
    };
    this.profiles.set(profile.id, newProfile);
    if (persist) this.saveToDisk();
    return newProfile;
  }

  // OTP Verification Codes
  public saveOtpCode(email: string, code: string, ttlMinutes = 10) {
    const normalizedEmail = email.toLowerCase().trim();
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
    this.otpCodes.set(normalizedEmail, { email: normalizedEmail, code, expiresAt, used: false });
  }

  public verifyOtpCode(email: string, inputCode: string): { valid: boolean; reason?: string } {
    const normalizedEmail = email.toLowerCase().trim();
    const record = this.otpCodes.get(normalizedEmail);

    if (!record) {
      return { valid: false, reason: 'No se encontró un código para este correo. Solicita uno nuevo.' };
    }

    if (record.used) {
      return { valid: false, reason: 'El código ya ha sido utilizado. Solicita uno nuevo.' };
    }

    if (Date.now() > record.expiresAt) {
      return { valid: false, reason: 'El código ha expirado. Solicita uno nuevo para continuar.' };
    }

    if (record.code !== inputCode.trim()) {
      return { valid: false, reason: 'No pudimos verificar el código. Revisa la información e inténtalo nuevamente.' };
    }

    record.used = true;
    return { valid: true };
  }

  // Server Sessions
  public createServerSession(data: { userId: string; email: string; full_name: string; role?: string; shopifyCustomerGid?: string; mfaVerified?: boolean; ttlDays?: number }) {
    const sessionId = `sf_sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const ttlDays = data.ttlDays || 14;
    const session = {
      sessionId,
      userId: data.userId,
      email: data.email.toLowerCase().trim(),
      full_name: data.full_name,
      role: data.role || 'CUSTOMER',
      shopifyCustomerGid: data.shopifyCustomerGid,
      mfaVerified: !!data.mfaVerified,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
    };
    this.serverSessions.set(sessionId, session);
    this.saveToDisk();
    return session;
  }

  public getServerSession(sessionId: string) {
    const session = this.serverSessions.get(sessionId);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.serverSessions.delete(sessionId);
      this.saveToDisk();
      return null;
    }
    return session;
  }

  public destroyServerSession(sessionId: string) {
    this.serverSessions.delete(sessionId);
    this.saveToDisk();
  }

  // --- Courses ---
  public getCourses(filter?: { category?: string; status?: string }): Course[] {
    const list: Course[] = [];
    const seen = new Set<string>();

    for (const c of this.courses.values()) {
      if (c && c.id && !seen.has(c.id)) {
        seen.add(c.id);
        if (filter?.category && c.category !== filter.category) continue;
        if (filter?.status && c.status !== filter.status) continue;
        list.push(c);
      }
    }
    return list;
  }

  public getCourseById(id: string): Course | undefined {
    return this.courses.get(id);
  }

  public getCourseBySlug(slug: string): Course | undefined {
    return this.courses.get(`slug:${slug}`);
  }

  public getCourseByVariantGid(variantGid: string): Course | undefined {
    return this.courses.get(`variant:${variantGid}`);
  }

  public saveCourse(course: Course): Course {
    course.updatedAt = new Date().toISOString();
    this.courses.set(course.id, course);
    this.courses.set(`slug:${course.slug}`, course);
    this.courses.set(`variant:${course.shopifyVariantGid}`, course);
    this.courses.set(`product:${course.shopifyProductGid}`, course);
    this.saveToDisk();
    return course;
  }

  public createCourse(data: Partial<Course>): Course {
    const id = data.id || `course_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const slug = (data.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `masterclass-${Date.now()}`).trim();

    const newCourse: Course = {
      id,
      slug,
      title: data.title || 'Nueva Masterclass Médica',
      subtitle: data.subtitle || '',
      shortDescription: data.shortDescription || '',
      description: data.description || data.shortDescription || '',
      clinicalDescription: data.clinicalDescription || '',
      badgeLabel: data.badgeLabel || 'Masterclass',
      category: (data.category as any) || 'bienestar',
      categoryLabel: data.categoryLabel || 'Bienestar & Fisiología',
      level: data.level || 'Intermedio',
      durationMinutes: data.durationMinutes || 60,
      lessonCount: data.lessonCount || (data.modules ? data.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) : 0),
      launchStatus: data.launchStatus || 'available',
      previewEnabled: data.previewEnabled ?? true,
      image: data.image || '/images/masterclasses/official/menopausia-con-claridad-2026.webp',
      imageFallback: data.imageFallback || '/images/masterclasses/official/menopausia-con-claridad-2026.png',
      imageAlt: data.imageAlt || data.title || 'Masterclass Médica',
      imageWidth: data.imageWidth || 1586,
      imageHeight: data.imageHeight || 992,
      imagePosition: data.imagePosition || 'center',
      imagePriority: data.imagePriority || false,
      coverImage: data.coverImage || data.image || '/images/masterclasses/official/menopausia-con-claridad-2026.webp',
      coverAlt: data.coverAlt || data.imageAlt || data.title || 'Masterclass Médica',
      disclaimerShort: data.disclaimerShort || 'Contenido educativo. No sustituye una consulta médica.',
      disclaimerLong: data.disclaimerLong || 'El contenido de esta masterclass tiene fines exclusivamente educativos e informativos.',
      heroImage: data.heroImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
      heroVideoPreviewUrl: data.heroVideoPreviewUrl,
      shopifyProductGid: data.shopifyProductGid || `gid://shopify/Product/custom_${Date.now()}`,
      shopifyVariantGid: data.shopifyVariantGid || `gid://shopify/ProductVariant/custom_${Date.now()}`,
      shopifyHandle: data.shopifyHandle || slug,
      price: data.price || 499,
      compareAtPrice: data.compareAtPrice,
      currency: 'MXN',
      instructor: {
        name: OFFICIAL_INSTRUCTOR.name,
        title: OFFICIAL_INSTRUCTOR.credentials,
        license: OFFICIAL_INSTRUCTOR.professionalLicense,
        institution: OFFICIAL_INSTRUCTOR.institution,
        avatarUrl: OFFICIAL_INSTRUCTOR.profileImage,
      },
      learningOutcomes: data.learningOutcomes || ['Comprensión profunda de la evidencia clínica', 'Estrategias prácticas de aplicación'],
      targetAudience: data.targetAudience || ['Pacientes y personas interesadas en su salud'],
      includedFeatures: data.includedFeatures || ['Acceso digital de por vida', 'Lecciones en video de alta calidad', 'Material de apoyo descargable'],
      faqs: data.faqs || [],
      modules: data.modules || [],
      status: data.status || 'draft',
      accessType: 'lifetime',
      accessDurationDays: null,
      orderWeight: data.orderWeight || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveCourse(newCourse);
  }

  public updateCourse(id: string, patch: Partial<Course>): Course | null {
    const course = this.getCourseById(id);
    if (!course) return null;

    if (patch.slug && patch.slug !== course.slug) {
      this.courses.delete(`slug:${course.slug}`);
    }

    const updated: Course = {
      ...course,
      ...patch,
      id: course.id,
      updatedAt: new Date().toISOString(),
    };

    return this.saveCourse(updated);
  }

  public deleteCourse(id: string): boolean {
    const course = this.getCourseById(id);
    if (!course) return false;

    this.courses.delete(id);
    this.courses.delete(`slug:${course.slug}`);
    this.courses.delete(`variant:${course.shopifyVariantGid}`);
    this.courses.delete(`product:${course.shopifyProductGid}`);
    this.saveToDisk();
    return true;
  }

  public addModule(courseId: string, moduleData: Partial<Module>): Module | null {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    const moduleId = moduleData.id || `mod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const position = moduleData.position ?? (course.modules.length + 1);

    const newModule: Module = {
      id: moduleId,
      courseId,
      title: moduleData.title || `Módulo ${position}`,
      description: moduleData.description || '',
      position,
      status: moduleData.status || 'published',
      lessons: moduleData.lessons || [],
    };

    course.modules.push(newModule);
    this.saveCourse(course);
    return newModule;
  }

  public updateModule(courseId: string, moduleId: string, patch: Partial<Module>): Module | null {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    const idx = course.modules.findIndex((m) => m.id === moduleId);
    if (idx === -1) return null;

    course.modules[idx] = {
      ...course.modules[idx],
      ...patch,
      id: moduleId,
      courseId,
    };

    this.saveCourse(course);
    return course.modules[idx];
  }

  public deleteModule(courseId: string, moduleId: string): boolean {
    const course = this.getCourseById(courseId);
    if (!course) return false;

    const initialLen = course.modules.length;
    course.modules = course.modules.filter((m) => m.id !== moduleId);
    if (course.modules.length === initialLen) return false;

    this.saveCourse(course);
    return true;
  }

  public addLesson(courseId: string, moduleId: string, lessonData: Partial<Lesson>): Lesson | null {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    const targetModule = course.modules.find((m) => m.id === moduleId);
    if (!targetModule) return null;

    const lessonId = lessonData.id || `les_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const position = lessonData.position ?? (targetModule.lessons.length + 1);
    const slug = (lessonData.slug || lessonData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `leccion-${position}`).trim();

    const newLesson: Lesson = {
      id: lessonId,
      moduleId,
      slug,
      title: lessonData.title || `Lección ${position}`,
      summary: lessonData.summary || '',
      position,
      durationSeconds: lessonData.durationSeconds || 600,
      videoProvider: lessonData.videoProvider || 'YOUTUBE',
      videoExternalId: lessonData.videoExternalId || '',
      privateVideoUid: lessonData.privateVideoUid || '',
      isPreview: !!lessonData.isPreview,
      status: lessonData.status || 'published',
      releaseAt: lessonData.releaseAt || null,
      transcript: lessonData.transcript || '',
      attachments: lessonData.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    targetModule.lessons.push(newLesson);
    this.saveCourse(course);
    return newLesson;
  }

  public updateLesson(courseId: string, moduleId: string, lessonId: string, patch: Partial<Lesson>): Lesson | null {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    const targetModule = course.modules.find((m) => m.id === moduleId);
    if (!targetModule) return null;

    const idx = targetModule.lessons.findIndex((l) => l.id === lessonId);
    if (idx === -1) return null;

    targetModule.lessons[idx] = {
      ...targetModule.lessons[idx],
      ...patch,
      id: lessonId,
      moduleId,
      updatedAt: new Date().toISOString(),
    };

    this.saveCourse(course);
    return targetModule.lessons[idx];
  }

  public deleteLesson(courseId: string, moduleId: string, lessonId: string): boolean {
    const course = this.getCourseById(courseId);
    if (!course) return false;

    const targetModule = course.modules.find((m) => m.id === moduleId);
    if (!targetModule) return false;

    const initialLen = targetModule.lessons.length;
    targetModule.lessons = targetModule.lessons.filter((l) => l.id !== lessonId);
    if (targetModule.lessons.length === initialLen) return false;

    this.saveCourse(course);
    return true;
  }

  // --- Metrics and Directory ---
  public getAcademyMetrics() {
    const allCourses = this.getCourses();
    const publishedCourses = allCourses.filter((c) => c.status === 'published');
    let totalModules = 0;
    let totalLessons = 0;

    for (const c of allCourses) {
      totalModules += (c.modules || []).length;
      for (const m of c.modules || []) {
        totalLessons += (m.lessons || []).length;
      }
    }

    const allUsers = this.getAllUsers();
    const verifiedUsers = allUsers.filter((u) => u.email_verified);
    const marketingUsers = allUsers.filter((u) => u.marketing_consent);

    const activeEntitlements = Array.from(this.entitlements.values()).filter((e) => e.status === 'active');
    const completedProgress = Array.from(this.progress.values()).filter((p) => p.status === 'completed');

    return {
      coursesCount: allCourses.length,
      publishedCoursesCount: publishedCourses.length,
      totalModules,
      totalLessons,
      activeStudentsCount: allUsers.length || 1,
      verifiedStudentsCount: verifiedUsers.length,
      marketingSubscribersCount: marketingUsers.length,
      activeEntitlementsCount: activeEntitlements.length,
      completedLessonsCount: completedProgress.length,
      webhooksProcessedCount: this.webhooks.size,
      recentAudits: this.getRecentAudits(20),
    };
  }

  public getStudentsDirectory(filter?: { marketingOnly?: boolean; verifiedOnly?: boolean }) {
    const users = this.getAllUsers();
    const list: Array<{
      id: string;
      full_name: string;
      email: string;
      role: string;
      email_verified: boolean;
      marketing_consent: boolean;
      marketing_consent_at?: string;
      terms_accepted_at?: string;
      created_at: string;
      last_login_at?: string;
      activeEntitlementsCount: number;
      enrolledCourses: string[];
    }> = [];

    for (const u of users) {
      if (filter?.marketingOnly && !u.marketing_consent) continue;
      if (filter?.verifiedOnly && !u.email_verified) continue;

      const userEnts = this.getEntitlementsForCustomer(u.id, u.email);
      const enrolledCourses = userEnts.map((e) => {
        const course = this.getCourseById(e.courseId);
        return course ? course.title : e.courseId;
      });

      list.push({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        role: u.role,
        email_verified: u.email_verified,
        marketing_consent: u.marketing_consent,
        marketing_consent_at: u.marketing_consent_at,
        terms_accepted_at: u.terms_accepted_at,
        created_at: u.created_at,
        last_login_at: u.last_login_at,
        activeEntitlementsCount: userEnts.length,
        enrolledCourses,
      });
    }

    return list;
  }

  // --- Entitlements (Capa 3: Seguridad y Accesos) ---
  public getEntitlementsForCustomer(customerGid: string, customerEmail?: string): Entitlement[] {
    const normalizedEmail = customerEmail?.toLowerCase().trim();
    const result: Entitlement[] = [];

    for (const ent of this.entitlements.values()) {
      const matchGid = ent.customerGid === customerGid;
      const matchEmail = normalizedEmail && ent.customerEmail.toLowerCase().trim() === normalizedEmail;
      if (matchGid || matchEmail) {
        result.push(ent);
      }
    }
    return result;
  }

  public getActiveEntitlement(customerGid: string, courseId: string, customerEmail?: string): Entitlement | undefined {
    const entitlements = this.getEntitlementsForCustomer(customerGid, customerEmail);
    return entitlements.find((e) => e.courseId === courseId && e.status === 'active');
  }

  public grantEntitlement(input: {
    shop: string;
    customerGid: string;
    customerEmail: string;
    customerName?: string;
    courseId: string;
    orderGid: string;
    orderNumber: string;
    lineItemGid: string;
  }): Entitlement {
    // Idempotent: check if already exists for this order & lineItem
    for (const existing of this.entitlements.values()) {
      if (existing.orderGid === input.orderGid && existing.lineItemGid === input.lineItemGid) {
        if (existing.status !== 'active') {
          existing.status = 'active';
          existing.revokedAt = null;
          existing.revocationReason = null;
          existing.updatedAt = new Date().toISOString();
          this.saveToDisk();
        }
        return existing;
      }
    }

    const now = new Date().toISOString();
    const newEnt: Entitlement = {
      id: `ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      shop: input.shop,
      customerGid: input.customerGid,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      courseId: input.courseId,
      orderGid: input.orderGid,
      orderNumber: input.orderNumber,
      lineItemGid: input.lineItemGid,
      status: 'active',
      grantedAt: now,
      startsAt: now,
      expiresAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.entitlements.set(newEnt.id, newEnt);
    this.saveToDisk();

    this.logAccessAudit({
      id: `audit_${Date.now()}`,
      shop: input.shop,
      customerGid: input.customerGid,
      courseId: input.courseId,
      action: 'entitlement_granted',
      result: 'granted',
      reason: `Order ${input.orderNumber} paid in Shopify`,
      createdAt: now,
    });

    return newEnt;
  }

  public revokeEntitlementByOrder(
    orderGid: string,
    reason: string,
    lineItemGid?: string
  ): Entitlement[] {
    const revokedList: Entitlement[] = [];
    const now = new Date().toISOString();

    for (const ent of this.entitlements.values()) {
      if (ent.orderGid === orderGid) {
        if (!lineItemGid || ent.lineItemGid === lineItemGid) {
          ent.status = 'revoked';
          ent.revokedAt = now;
          ent.revocationReason = reason;
          ent.updatedAt = now;
          revokedList.push(ent);

          this.logAccessAudit({
            id: `audit_${Date.now()}`,
            shop: ent.shop,
            customerGid: ent.customerGid,
            courseId: ent.courseId,
            action: 'entitlement_revoked',
            result: 'denied',
            reason: `Order ${ent.orderNumber} revoked: ${reason}`,
            createdAt: now,
          });
        }
      }
    }

    this.saveToDisk();
    return revokedList;
  }

  public updateEntitlementStatus(
    id: string,
    status: Entitlement['status'],
    reason?: string
  ): Entitlement | null {
    const ent = this.entitlements.get(id);
    if (!ent) return null;

    ent.status = status;
    ent.updatedAt = new Date().toISOString();
    if (status === 'revoked' || status === 'suspended') {
      ent.revokedAt = new Date().toISOString();
      ent.revocationReason = reason || 'Acción administrativa manual';
    } else if (status === 'active') {
      ent.revokedAt = null;
      ent.revocationReason = null;
    }
    this.saveToDisk();
    return ent;
  }

  public getAllEntitlements(): Entitlement[] {
    return Array.from(this.entitlements.values());
  }

  // --- Student Progress ---
  public getStudentProgress(customerGid: string, courseId: string, customerEmail?: string): LessonProgress[] {
    const result: LessonProgress[] = [];
    const normalizedEmail = customerEmail?.toLowerCase().trim();
    for (const prog of this.progress.values()) {
      const matchGid = prog.customerGid === customerGid;
      const matchEmail = normalizedEmail && (prog as any).customerEmail?.toLowerCase().trim() === normalizedEmail;
      if ((matchGid || matchEmail) && prog.courseId === courseId) {
        result.push(prog);
      }
    }
    return result;
  }

  public saveLessonProgress(
    customerGid: string,
    courseId: string,
    lessonId: string,
    status: LessonProgress['status'],
    lastPositionSeconds: number = 0,
    customerEmail?: string
  ): LessonProgress {
    const normalizedEmail = customerEmail?.toLowerCase().trim();
    const key = `${customerGid}:${lessonId}`;
    const existing = this.progress.get(key) || Array.from(this.progress.values()).find(
      (p) => (p.customerGid === customerGid || (normalizedEmail && (p as any).customerEmail === normalizedEmail)) && p.lessonId === lessonId
    );
    const now = new Date().toISOString();

    if (existing) {
      existing.status = status;
      existing.lastPositionSeconds = lastPositionSeconds;
      existing.updatedAt = now;
      if (normalizedEmail) (existing as any).customerEmail = normalizedEmail;
      if (status === 'completed' && !existing.completedAt) {
        existing.completedAt = now;
      }
      this.saveToDisk();
      return existing;
    }

    const newProg: LessonProgress = {
      id: `prog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      customerGid,
      courseId,
      lessonId,
      status,
      lastPositionSeconds,
      startedAt: now,
      completedAt: status === 'completed' ? now : null,
      updatedAt: now,
    };
    if (normalizedEmail) (newProg as any).customerEmail = normalizedEmail;

    this.progress.set(key, newProg);
    this.saveToDisk();
    return newProg;
  }

  // --- Webhooks Idempotency ---
  public isWebhookProcessed(webhookId: string): boolean {
    return this.webhooks.has(webhookId);
  }

  public recordWebhook(webhook: ProcessedWebhook): void {
    this.webhooks.set(webhook.webhookId, webhook);
    this.saveToDisk();
  }

  public getProcessedWebhooks(): ProcessedWebhook[] {
    return Array.from(this.webhooks.values()).sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );
  }

  // --- Access Audits ---
  public logAccessAudit(audit: AccessAudit): void {
    this.audits.unshift(audit);
    if (this.audits.length > 500) {
      this.audits.pop();
    }
  }

  public getAccessAudits(): AccessAudit[] {
    return this.audits;
  }

  public getRecentAudits(limit: number = 20): AccessAudit[] {
    return this.audits.slice(0, limit);
  }
}

// Global Singleton Database Instance
export const academyDb = new AcademyDatabase();
