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
  "id": "course_glucosa_001",
  "slug": "monitorea-tu-glucosa-con-confianza",
  "title": "Monitorea tu glucosa con confianza",
  "subtitle": "Aprende a usar tu glucómetro, evitar errores comunes y convertir tus lecturas en información útil para tu consulta.",
  "shortDescription": "¿Tus lecturas cambian y no sabes si mediste bien? Aprende paso a paso a preparar el equipo, obtener una medición más confiable, registrar el contexto y reconocer cuándo una cifra necesita confirmación o atención profesional.",
  "description": "Medirte la glucosa no debería sentirse como adivinar. En esta masterclass aprenderás, desde cero, cómo funciona un glucómetro, cómo preparar tus manos y tus materiales, cómo obtener la muestra y cuáles son los errores que pueden alterar una lectura. También conocerás la diferencia básica entre un glucómetro y un monitor continuo, y aprenderás a registrar horarios, alimentos, actividad, síntomas y medicamentos para que los números tengan contexto.\n\nNo recibirás metas universales ni cambios de tratamiento. Obtendrás algo más seguro y útil: un método sencillo para medir mejor, identificar patrones sin sacar conclusiones precipitadas y llevar información ordenada a tu consulta.",
  "salesPromise": "Dejarás de coleccionar números sueltos y aprenderás a construir un registro que tú y tu equipo de salud puedan comprender.",
  "recognitionPoints": [
    "“¿Lo estoy haciendo bien o estoy desperdiciando tiras?”",
    "“Me salió diferente dos veces; ¿cuál número vale?”",
    "“¿Esto significa que ya estoy peor?”",
    "“Tengo muchos números, pero no sé qué enseñarle al doctor”"
  ],
  "beforeState": [
    "Información dispersa",
    "Miedo y mitos",
    "Datos sin contexto",
    "Dificultad para hablar con el médico"
  ],
  "afterState": [
    "Comprensión básica de herramientas",
    "Registro útil con contexto",
    "Preguntas mejor formuladas",
    "Siguiente paso más seguro"
  ],
  "notFor": [
    "Quien busca un diagnóstico, una dosis de insulina, una meta individual o instrucciones para modificar medicamentos. Eso requiere evaluación profesional."
  ],
  "learningOutcomes": [
    "Reconocer las partes del glucómetro y revisar tiras, caducidad y almacenamiento.",
    "Prepararse y realizar la medición siguiendo el manual específico de su equipo.",
    "Identificar causas frecuentes de resultados inesperados.",
    "Diferenciar una lectura puntual de una tendencia y de una prueba diagnóstica.",
    "Registrar el contexto de cada medición sin volverse esclavo de los números.",
    "Preparar preguntas útiles para su consulta y seguir su plan personal ante cifras o síntomas preocupantes."
  ],
  "includedFeatures": [
    "Bitácora de glucosa de siete días con contexto",
    "Tarjeta “Antes de repetir la medición, revisa esto”",
    "Guía visual del equipo y de los errores del medidor",
    "Hoja “Mis cuatro preguntas para la consulta”"
  ],
  "targetAudience": [
    "Una persona adulta mexicana que acaba de recibir un diagnóstico de diabetes o prediabetes.",
    "Alguien que comenzó a usar glucómetro o cuida a un familiar.",
    "Quien utiliza monitoreo continuo o recibió la indicación de registrar su glucosa y no sabe exactamente cómo hacerlo."
  ],
  "faqs": [
    {
      "question": "Mi aparato es de otra marca",
      "answer": "La técnica se enseña como base común, pero se recalca que cada persona debe seguir el manual de su modelo."
    },
    {
      "question": "Ya sé picarme",
      "answer": "La propuesta no es solo pinchar: es reconocer errores, registrar contexto y comunicar patrones."
    },
    {
      "question": "El médico ya me dio metas",
      "answer": "Perfecto; la clase ayuda a producir información más ordenada para seguir ese plan, no a reemplazarlo."
    },
    {
      "question": "Me da ansiedad ver los números",
      "answer": "El enfoque reduce juicios y presenta cada cifra como información, con límites claros sobre cuándo pedir ayuda."
    }
  ],
  "ctaLabel": "Quiero aprender a medir y registrar mejor",
  "category": "bienestar",
  "categoryLabel": "Bienestar & Fisiología",
  "level": "Introductorio",
  "durationMinutes": 45,
  "lessonCount": 9,
  "status": "draft",
  "accessType": "free",
  "launchStatus": "available",
  "previewEnabled": true,
  "price": 0,
  "compareAtPrice": 0,
  "currency": "MXN",
  "image": "/images/masterclasses/official/glucosa-2026.webp",
  "imageFallback": "/images/masterclasses/official/glucosa-2026.png",
  "imageAlt": "Monitorea tu glucosa con confianza",
  "imageWidth": 1586,
  "imageHeight": 992,
  "imagePosition": "center",
  "imagePriority": false,
  "coverImage": "/images/masterclasses/official/glucosa-2026.webp",
  "coverAlt": "Monitorea tu glucosa con confianza",
  "imageId": "IMG-901-PENDIENTE-MASTERCLASS-GLUCOSA",
  "disclaimerShort": "Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.",
  "disclaimerLong": "El contenido de esta masterclass tiene fines exclusivamente educativos e informativos. No sustituye una consulta médica. No modifique sus tratamientos.",
  "modules": [
    {
      "id": "mod_glucosa_1",
      "courseId": "course_glucosa_001",
      "title": "Módulo 1. Antes del pinchazo: entiende tu herramienta",
      "description": "Qué mide el glucómetro y cómo prepararse",
      "position": 1,
      "status": "published",
      "lessons": [
        {
          "id": "les_gluc_1_1",
          "slug": "glucosa-es-un-dato",
          "title": "1. Tu glucosa es un dato, no una calificación",
          "summary": "Qué mide el glucómetro, qué no puede concluir y por qué el contexto cambia la interpretación.",
          "durationSeconds": 300,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_glucosa_1"
        },
        {
          "id": "les_gluc_1_2",
          "slug": "conoce-tu-equipo",
          "title": "2. Conoce tu equipo sin tecnicismos",
          "summary": "Medidor, tira, lanceta, dispositivo de punción, solución de control y manual del fabricante.",
          "durationSeconds": 300,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_glucosa_1"
        },
        {
          "id": "les_gluc_1_3",
          "slug": "prepara-manos-tiras",
          "title": "3. Prepara manos, tiras y superficie",
          "summary": "Higiene, secado, caducidad, almacenamiento y lista previa para evitar repeticiones.",
          "durationSeconds": 300,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_glucosa_1"
        }
      ]
    },
    {
      "id": "mod_glucosa_2",
      "courseId": "course_glucosa_001",
      "title": "Módulo 2. Mide paso a paso y reduce errores",
      "description": "La técnica correcta y cómo evitar resultados alterados",
      "position": 2,
      "status": "published",
      "lessons": [
        {
          "id": "les_gluc_2_1",
          "slug": "obtener-muestra-menos-miedo",
          "title": "4. Cómo obtener la muestra con menos miedo",
          "summary": "Colocación, lateral del dedo, rotación de sitios y manejo seguro del material punzocortante conforme a indicaciones locales.",
          "durationSeconds": 300,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_glucosa_2"
        },
        {
          "id": "les_gluc_2_2",
          "slug": "medicion-completa",
          "title": "5. La medición completa, de principio a fin",
          "summary": "Demostración pausada, carga correcta de la tira y lectura del resultado.",
          "durationSeconds": 300,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_glucosa_2"
        },
        {
          "id": "les_gluc_2_3",
          "slug": "me-salio-raro",
          "title": "6. “Me salió raro”: qué revisar antes de concluir",
          "summary": "Manos contaminadas, poca muestra, tiras dañadas, temperatura, mensajes del aparato y cuándo repetir conforme al manual o plan clínico.",
          "durationSeconds": 300,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_glucosa_2"
        }
      ]
    },
    {
      "id": "mod_glucosa_3",
      "courseId": "course_glucosa_001",
      "title": "Módulo 3. Convierte números en una conversación útil",
      "description": "Registros, monitores continuos y la consulta",
      "position": 3,
      "status": "published",
      "lessons": [
        {
          "id": "les_gluc_3_1",
          "slug": "glucometro-y-monitor-continuo",
          "title": "7. Glucómetro y monitor continuo: no son lo mismo",
          "summary": "Diferencias básicas, retraso entre compartimentos y confirmación de lecturas inesperadas según dispositivo y plan médico.",
          "durationSeconds": 300,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_glucosa_3"
        },
        {
          "id": "les_gluc_3_2",
          "slug": "el-registro-que-ayuda",
          "title": "8. El registro que sí ayuda",
          "summary": "Fecha, hora, relación con alimentos, actividad, síntomas, medicamentos y eventos fuera de rutina.",
          "durationSeconds": 300,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_glucosa_3"
        },
        {
          "id": "les_gluc_3_3",
          "slug": "que-hacer-despues-de-medir",
          "title": "9. Qué hacer después de medir",
          "summary": "Patrones frente a cifras aisladas, plan personal de acción, síntomas de alarma y preparación de cuatro preguntas para la consulta.",
          "durationSeconds": 300,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_glucosa_3"
        }
      ]
    }
  ]
,  instructor: OFFICIAL_INSTRUCTOR
},
{
  "id": "course_presion_001",
  "slug": "presion-arterial-midela-bien-en-casa",
  "title": "Presión arterial en casa: mídela bien y entiende tu registro",
  "subtitle": "Elige el equipo correcto, evita errores de postura y lleva a tu consulta lecturas que realmente sean útiles.",
  "shortDescription": "Una medición puede cambiar por el brazalete, la postura o la preparación. Aprende un protocolo sencillo para medir tu presión en casa, registrar resultados y saber cuándo repetir la lectura o solicitar orientación médica.",
  "description": "Tener un baumanómetro automático no garantiza una buena medición. El tamaño del brazalete, cinco minutos de reposo, la posición del brazo, la espalda, los pies e incluso hablar durante la toma pueden cambiar el resultado.\n\nEn esta masterclass aprenderás a seleccionar un equipo adecuado, preparar tu cuerpo, colocarte correctamente y seguir una rutina reproducible. También entenderás qué representan los dos números, por qué una lectura es solo una fotografía del momento y cómo organizar varias mediciones para conversar con tu médico con mayor claridad. Incluye un registro semanal y una guía visual de postura.",
  "salesPromise": "En 40 minutos construirás una técnica repetible para dejar de dudar si el dato cambió o si cambió la forma de medirlo.",
  "recognitionPoints": [
    "“En la consulta me sale alta y en casa no”",
    "“Me la tomé tres veces y cada vez salió diferente”",
    "“Si hoy salió bien, ¿ya puedo dejar la pastilla?”",
    "“¿El aparato de muñeca sirve igual?”"
  ],
  "beforeState": [
    "Información dispersa",
    "Miedo",
    "Datos sin contexto",
    "Dificultad para hablar con el médico"
  ],
  "afterState": [
    "Comprensión básica",
    "Registro útil",
    "Preguntas mejor formuladas",
    "Siguiente paso más seguro"
  ],
  "notFor": [
    "Quien busca diagnóstico inmediato o instrucciones para iniciar, suspender o ajustar medicamentos.",
    "Si existe una lectura muy alta acompañada de dolor torácico, falta de aire, debilidad, alteración visual o dificultad para hablar, se requiere atención de urgencia y no continuar viendo una clase."
  ],
  "learningOutcomes": [
    "Diferenciar presión sistólica y diastólica con una explicación sencilla.",
    "Elegir un monitor automático de brazo validado y un brazalete que ajuste.",
    "Prepararse durante los minutos previos y adoptar la postura correcta.",
    "Realizar y registrar lecturas repetidas conforme a la indicación de su profesional.",
    "Reconocer factores que pueden alterar temporalmente la medición.",
    "Responder con seguridad ante una lectura inesperada siguiendo criterios de repetición, síntomas y atención médica."
  ],
  "includedFeatures": [
    "Infografía de postura correcta",
    "Guía para medir la circunferencia del brazo",
    "Registro semanal con espacio para dos lecturas y contexto",
    "Tarjeta “Una cifra alta: pausa, repite y revisa”",
    "Checklist para llevar aparato y bitácora a consulta"
  ],
  "targetAudience": [
    "Una persona con hipertensión, cifras variables, tratamiento nuevo, antecedentes familiares o indicación médica de llevar un registro.",
    "Un familiar que mide la presión a padres o abuelos.",
    "Quien usa un aparato comprado en farmacia o por internet y supone que basta con colocar el brazalete y presionar un botón."
  ],
  "faqs": [
    {
      "question": "Mi aparato ya hace todo",
      "answer": "Automatiza el inflado y la lectura, pero la preparación, el brazalete y la postura siguen dependiendo de la persona."
    },
    {
      "question": "En la farmacia me la toman gratis",
      "answer": "La clase enseña una rutina reproducible en condiciones conocidas y un registro longitudinal."
    },
    {
      "question": "Siempre me sale diferente",
      "answer": "Cierta variación existe; el objetivo es reducir las variables de técnica y observar el conjunto con el médico."
    },
    {
      "question": "Solo quiero saber si tengo hipertensión",
      "answer": "La clase no diagnostica; enseña a obtener y organizar datos que pueden apoyar una valoración."
    }
  ],
  "ctaLabel": "Quiero medir mi presión correctamente",
  "category": "bienestar",
  "categoryLabel": "Bienestar & Fisiología",
  "level": "Introductorio",
  "durationMinutes": 40,
  "lessonCount": 10,
  "status": "draft",
  "accessType": "free",
  "launchStatus": "available",
  "previewEnabled": true,
  "price": 0,
  "compareAtPrice": 0,
  "currency": "MXN",
  "image": "/images/masterclasses/official/presion-arterial-2026.webp",
  "imageFallback": "/images/masterclasses/official/presion-arterial-2026.png",
  "imageAlt": "Presión arterial: mídela bien en casa",
  "imageWidth": 1586,
  "imageHeight": 992,
  "imagePosition": "center",
  "imagePriority": false,
  "coverImage": "/images/masterclasses/official/presion-arterial-2026.webp",
  "coverAlt": "Presión arterial: mídela bien en casa",
  "imageId": "IMG-902-PENDIENTE-MASTERCLASS-PRESION",
  "disclaimerShort": "Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.",
  "disclaimerLong": "El contenido de esta masterclass tiene fines exclusivamente educativos e informativos. No sustituye una consulta médica. No modifique sus tratamientos.",
  "modules": [
    {
      "id": "mod_presion_1",
      "courseId": "course_presion_001",
      "title": "Módulo 1. El equipo correcto",
      "description": "Números y dispositivos",
      "position": 1,
      "status": "published",
      "lessons": [
        {
          "id": "les_pre_1_1",
          "slug": "que-significan-los-dos-numeros",
          "title": "1. Qué significan los dos números",
          "summary": "Sístole, diástole y por qué una toma no cuenta toda la historia.",
          "durationSeconds": 240,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_presion_1"
        },
        {
          "id": "les_pre_1_2",
          "slug": "brazo-muneca-reloj",
          "title": "2. Brazo, muñeca o reloj: qué equipo buscar",
          "summary": "Preferencia por monitor automático validado de brazo y límites de otros dispositivos.",
          "durationSeconds": 240,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_presion_1"
        },
        {
          "id": "les_pre_1_3",
          "slug": "brazalete-importa",
          "title": "3. El brazalete sí importa",
          "summary": "Medición del brazo, ajuste y errores por talla inadecuada.",
          "durationSeconds": 240,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_presion_1"
        }
      ]
    },
    {
      "id": "mod_presion_2",
      "courseId": "course_presion_001",
      "title": "Módulo 2. La técnica que hace confiable el registro",
      "description": "Preparación del cuerpo",
      "position": 2,
      "status": "published",
      "lessons": [
        {
          "id": "les_pre_2_1",
          "slug": "30-minutos-previos",
          "title": "4. Los 30 minutos previos",
          "summary": "Café, tabaco, ejercicio, vejiga y otras condiciones que se deben considerar.",
          "durationSeconds": 240,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_presion_2"
        },
        {
          "id": "les_pre_2_2",
          "slug": "cinco-minutos-reposo",
          "title": "5. Cinco minutos que cambian la toma",
          "summary": "Reposo sin conversación, teléfono ni distracciones.",
          "durationSeconds": 240,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_presion_2"
        },
        {
          "id": "les_pre_2_3",
          "slug": "postura-completa",
          "title": "6. Postura completa, paso a paso",
          "summary": "Espalda apoyada, pies en el piso, piernas descruzadas, brazo descubierto y apoyado a nivel del corazón.",
          "durationSeconds": 240,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_presion_2"
        },
        {
          "id": "les_pre_2_4",
          "slug": "coloca-el-brazalete",
          "title": "7. Coloca el brazalete y toma la lectura",
          "summary": "Demostración, inmovilidad y errores comunes.",
          "durationSeconds": 240,
          "position": 4,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_presion_2"
        }
      ]
    },
    {
      "id": "mod_presion_3",
      "courseId": "course_presion_001",
      "title": "Módulo 3. Del dato a la consulta",
      "description": "Lecturas y repeticiones",
      "position": 3,
      "status": "published",
      "lessons": [
        {
          "id": "les_pre_3_1",
          "slug": "por-que-varias-lecturas",
          "title": "8. Por qué se toman varias lecturas",
          "summary": "Repetición, intervalo y horario según el plan indicado; evitar “perseguir” el número indefinidamente.",
          "durationSeconds": 240,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_presion_3"
        },
        {
          "id": "les_pre_3_2",
          "slug": "tu-registro-semanal",
          "title": "9. Tu registro semanal",
          "summary": "Cómo anotar hora, lecturas, síntomas y circunstancias relevantes; equipo con memoria.",
          "durationSeconds": 240,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_presion_3"
        },
        {
          "id": "les_pre_3_3",
          "slug": "lecturas-inesperadas",
          "title": "10. Lecturas inesperadas y señales de alarma",
          "summary": "Repetir correctamente, valorar síntomas, contactar al equipo de salud y reconocer una emergencia sin suspender o duplicar medicamentos por cuenta propia.",
          "durationSeconds": 240,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_presion_3"
        }
      ]
    }
  ]
,  instructor: OFFICIAL_INSTRUCTOR
},
{
  "id": "course_sueno_001",
  "slug": "dormir-mejor-energia-enfoque-y-rendimiento",
  "title": "Dormir mejor: un plan práctico para recuperar energía y claridad",
  "subtitle": "Entiende qué está interfiriendo con tu descanso y diseña una rutina realista para tus noches y tus mañanas.",
  "shortDescription": "Si llegas cansado a la cama pero no logras descansar, esta masterclass te ayuda a identificar qué está interfiriendo. Organiza luz, horarios, cafeína, actividad, ambiente y rutina mediante un plan de 14 días adaptable a tu vida.",
  "description": "Dormir mejor no empieza comprando un suplemento ni persiguiendo una noche perfecta. Empieza por comprender cómo se coordinan la presión de sueño y el reloj interno, y por observar qué señales recibe tu cuerpo durante el día y la noche.\n\nEn esta masterclass traduciremos la ciencia del sueño a decisiones cotidianas: a qué hora exponerte a luz, cómo ordenar horarios, cuándo revisar la cafeína, cómo usar el ejercicio, qué cambiar en tu habitación y cómo crear una transición nocturna aunque tengas una agenda exigente. Construirás un experimento personal de 14 días y aprenderás a reconocer señales de insomnio persistente, apnea u otros problemas que necesitan valoración.",
  "salesPromise": "Pasarás de probar consejos al azar a seguir un plan sencillo, medible y adaptado a tu realidad.",
  "recognitionPoints": [
    "“Estoy cansado todo el día, pero de noche no me da sueño”",
    "“Duermo varias horas y aun así amanezco agotado”",
    "“No puedo dejar el celular porque es mi único rato libre”",
    "“¿Necesito melatonina o un estudio del sueño?”"
  ],
  "beforeState": [
    "Información dispersa",
    "Miedo",
    "Datos sin contexto",
    "Dificultad para hablar con el médico"
  ],
  "afterState": [
    "Comprensión básica",
    "Registro útil",
    "Preguntas mejor formuladas",
    "Siguiente paso más seguro"
  ],
  "notFor": [
    "Quien requiere atención inmediata por somnolencia al conducir, pausas respiratorias observadas, síntomas neurológicos o crisis de salud mental.",
    "Tampoco sustituye la evaluación y tratamiento del insomnio crónico u otros trastornos del sueño."
  ],
  "learningOutcomes": [
    "Diferenciar cantidad, calidad, regularidad y continuidad del sueño.",
    "Comprender de forma sencilla el reloj circadiano y la presión de sueño.",
    "Detectar las conductas y condiciones que más interfieren en su caso.",
    "Diseñar una mañana que favorezca alerta y una noche que facilite la transición al descanso.",
    "Utilizar un diario sin obsesionarse con relojes o puntuaciones.",
    "Reconocer ronquido intenso, pausas respiratorias, somnolencia peligrosa e insomnio persistente como motivos de evaluación."
  ],
  "includedFeatures": [
    "Diario de sueño de 14 días en versión impresa y móvil",
    "Calculadora sencilla de cafeína por horario",
    "Constructor de rutina nocturna con opciones de 15, 30 y 60 minutos",
    "Auditoría de dormitorio con alternativas gratuitas, económicas y completas",
    "Hoja “Señales para hablar con mi médico”"
  ],
  "targetAudience": [
    "Un adulto con horarios largos, uso nocturno del celular, cansancio matutino, dificultad ocasional para conciliar o mantener el sueño.",
    "Profesionistas, emprendedores, cuidadores o padres de familia con fines de semana desordenados.",
    "Personas que quieren funcionar mejor de día, no convertirse en expertos en sueño."
  ],
  "faqs": [
    {
      "question": "Ya intenté higiene del sueño",
      "answer": "El curso no se limita a una lista: enseña mecanismos, diario, priorización y criterios para buscar evaluación."
    },
    {
      "question": "No puedo apagar el celular una hora antes",
      "answer": "Se construye un cambio gradual que considere trabajo y vida familiar."
    },
    {
      "question": "Quiero saber qué suplemento tomar",
      "answer": "La clase ayuda a entender el problema y preparar una consulta; no prescribe suplementos ni somníferos."
    },
    {
      "question": "Mis horarios cambian",
      "answer": "Incluye adaptación para semanas imperfectas y un ancla mínima de rutina."
    }
  ],
  "ctaLabel": "Quiero construir mi plan de sueño de 14 días",
  "category": "bienestar",
  "categoryLabel": "Bienestar & Fisiología",
  "level": "Introductorio",
  "durationMinutes": 90,
  "lessonCount": 12,
  "status": "coming_soon",
  "accessType": "lifetime",
  "launchStatus": "coming_soon",
  "previewEnabled": false,
  "price": 0,
  "compareAtPrice": 0,
  "currency": "MXN",
  "image": "/images/masterclasses/official/dormir-mejor-2026.webp",
  "imageFallback": "/images/masterclasses/official/dormir-mejor-2026.png",
  "imageAlt": "Dormir mejor: energía, enfoque y rendimiento",
  "imageWidth": 1586,
  "imageHeight": 992,
  "imagePosition": "center",
  "imagePriority": false,
  "coverImage": "/images/masterclasses/official/dormir-mejor-2026.webp",
  "coverAlt": "Dormir mejor: energía, enfoque y rendimiento",
  "imageId": "IMG-903-PENDIENTE-MASTERCLASS-SUENO",
  "disclaimerShort": "Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.",
  "disclaimerLong": "El contenido de esta masterclass tiene fines exclusivamente educativos e informativos. No sustituye una consulta médica. No modifique sus tratamientos.",
  "modules": [
    {
      "id": "mod_sueno_1",
      "courseId": "course_sueno_001",
      "title": "Módulo 1. Entiende tu sueño",
      "description": "La base de tu descanso",
      "position": 1,
      "status": "published",
      "lessons": [
        {
          "id": "les_sue_1_1",
          "slug": "dormir-mas-no-es-mejor",
          "title": "1. Dormir más no siempre es dormir mejor",
          "summary": "Duración, calidad, continuidad, regularidad y cómo definir un objetivo realista.",
          "durationSeconds": 360,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_1"
        },
        {
          "id": "les_sue_1_2",
          "slug": "tu-reloj-interno",
          "title": "2. Tu reloj interno",
          "summary": "Ritmo circadiano, luz y horarios explicados sin jerga.",
          "durationSeconds": 420,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_1"
        },
        {
          "id": "les_sue_1_3",
          "slug": "presion-de-sueno",
          "title": "3. La presión de sueño",
          "summary": "Cómo se acumula, efecto de las siestas y por qué estar agotado no siempre significa poder dormir.",
          "durationSeconds": 420,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_1"
        }
      ]
    },
    {
      "id": "mod_sueno_2",
      "courseId": "course_sueno_001",
      "title": "Módulo 2. Diseña el día que prepara la noche",
      "description": "Mañanas y tardes estratégicas",
      "position": 2,
      "status": "published",
      "lessons": [
        {
          "id": "les_sue_2_1",
          "slug": "primera-hora-de-manana",
          "title": "4. La primera hora de tu mañana",
          "summary": "Horario de despertar, luz natural y activación gradual.",
          "durationSeconds": 480,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_2"
        },
        {
          "id": "les_sue_2_2",
          "slug": "cafeina-cantidad-sensibilidad",
          "title": "5. Cafeína: cantidad, horario y sensibilidad",
          "summary": "Identificar fuentes y diseñar un límite personal prudente.",
          "durationSeconds": 420,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_2"
        },
        {
          "id": "les_sue_2_3",
          "slug": "actividad-comidas-alcohol",
          "title": "6. Actividad física, comidas y alcohol",
          "summary": "Cómo observar su relación con el descanso sin reglas absolutas ni promesas.",
          "durationSeconds": 420,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_2"
        }
      ]
    },
    {
      "id": "mod_sueno_3",
      "courseId": "course_sueno_001",
      "title": "Módulo 3. Construye una noche viable",
      "description": "Rutinas para relajar",
      "position": 3,
      "status": "published",
      "lessons": [
        {
          "id": "les_sue_3_1",
          "slug": "ultima-hora-despierto",
          "title": "7. La última hora despierto",
          "summary": "Crear una secuencia de cierre para trabajo, pendientes, contenido estimulante y preocupación.",
          "durationSeconds": 480,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_3"
        },
        {
          "id": "les_sue_3_2",
          "slug": "pantallas-sin-magia",
          "title": "8. Pantallas sin pensamiento mágico",
          "summary": "Luz, contenido, tiempo y estrategias graduales cuando “dejar el celular” no es realista.",
          "durationSeconds": 480,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_3"
        },
        {
          "id": "les_sue_3_3",
          "slug": "tu-dormitorio-dentro-posible",
          "title": "9. Tu dormitorio dentro de lo posible",
          "summary": "Oscuridad, ruido, temperatura, cama y soluciones de bajo costo.",
          "durationSeconds": 480,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_3"
        }
      ]
    },
    {
      "id": "mod_sueno_4",
      "courseId": "course_sueno_001",
      "title": "Módulo 4. Mide, ajusta y pide ayuda a tiempo",
      "description": "Plan de 14 días",
      "position": 4,
      "status": "published",
      "lessons": [
        {
          "id": "les_sue_4_1",
          "slug": "diario-14-dias",
          "title": "10. Diario de sueño de 14 días",
          "summary": "Qué anotar, cómo interpretar tendencias y por qué no perseguir una puntuación perfecta.",
          "durationSeconds": 480,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_4"
        },
        {
          "id": "les_sue_4_2",
          "slug": "tu-plan-minimo",
          "title": "11. Tu plan mínimo viable",
          "summary": "Elegir dos cambios, definir obstáculos y preparar alternativas para fines de semana o días difíciles.",
          "durationSeconds": 480,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_4"
        },
        {
          "id": "les_sue_4_3",
          "slug": "cuando-habitos-no-son-suficientes",
          "title": "12. Cuando los hábitos no son suficientes",
          "summary": "Insomnio crónico, apnea, piernas inquietas, medicamentos, salud mental, trabajo por turnos y cuándo hablar con un profesional; introducción a la terapia cognitivo-conductual para insomnio como tratamiento estructurado.",
          "durationSeconds": 480,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "published",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sueno_4"
        }
      ]
    }
  ]
,  instructor: OFFICIAL_INSTRUCTOR
},
{
  "id": "course_menopausia_001",
  "slug": "menopausia-con-claridad",
  "title": "Menopausia con claridad: entiende lo que cambia y conoce tus opciones",
  "subtitle": "Una guía médica, comprensible y sin juicios para reconocer síntomas, preparar tu consulta y tomar decisiones informadas.",
  "shortDescription": "¿Tu cuerpo cambió y no sabes qué puede relacionarse con la menopausia? Aprende a reconocer las etapas y síntomas, conoce las opciones disponibles y prepara las preguntas necesarias para decidir junto con tu profesional de salud.",
  "description": "La transición a la menopausia puede sentirse distinta en cada mujer. Algunas notan cambios en el ciclo, bochornos o sudoraciones; otras consultan por sueño, estado de ánimo, concentración, sexualidad o molestias vaginales y urinarias. Entre consejos familiares, videos y mensajes contradictorios sobre hormonas, es fácil sentirse desorientada.\n\nEsta masterclass te ofrece un mapa. Entenderás qué significan perimenopausia, menopausia y posmenopausia; cómo registrar lo que estás viviendo; qué evaluaciones pueden ser útiles según el caso; y cuáles son las categorías principales de tratamiento hormonal, no hormonal y de estilo de vida. También revisarás mitos frecuentes y crearás una agenda personal para tu próxima consulta.\n\nLa clase no te dirá qué tratamiento tomar. Te ayudará a comprender las decisiones que deben individualizarse según síntomas, historia clínica, riesgos, objetivos y preferencias.",
  "salesPromise": "Pasarás de vivir cambios difíciles de explicar a tener un mapa personal y una conversación clínica mucho más clara.",
  "recognitionPoints": [
    "“¿Estoy exagerando o de verdad algo cambió?”",
    "“No quiero tomar hormonas a ciegas, pero tampoco quiero seguir así”",
    "“No sé qué estudios pedir ni con qué especialista empezar”",
    "“Me da pena hablar de lo que pasa en mi vida íntima”"
  ],
  "beforeState": [
    "Información dispersa",
    "Miedo",
    "Datos sin contexto",
    "Dificultad para hablar con el médico"
  ],
  "afterState": [
    "Comprensión básica",
    "Registro útil",
    "Preguntas mejor formuladas",
    "Siguiente paso más seguro"
  ],
  "notFor": [
    "Quien busca una receta o confirmación de que una terapia específica es segura en su caso.",
    "Sangrado vaginal inesperado, dolor torácico, falta de aire, síntomas neurológicos u otras señales importantes requieren valoración inmediata."
  ],
  "learningOutcomes": [
    "Diferenciar transición menopáusica, menopausia y posmenopausia.",
    "Reconocer síntomas vasomotores, del sueño, del ánimo y genitourinarios sin atribuir automáticamente todo a las hormonas.",
    "Entender qué suele evaluarse con historia clínica y cuándo los estudios dependen del contexto.",
    "Conocer las diferencias generales entre terapia hormonal sistémica, terapia vaginal/local y opciones no hormonales.",
    "Identificar por qué la indicación, formulación, vía, edad, tiempo desde la menopausia, antecedentes y preferencias importan.",
    "Preparar una consulta que incluya bienestar sexual, salud ósea, cardiovascular y metabólica."
  ],
  "includedFeatures": [
    "Mapa de síntomas de cuatro semanas",
    "Línea del tiempo personal de ciclos y cambios",
    "Comparador educativo de categorías de tratamiento",
    "Checklist de antecedentes y preguntas para consulta",
    "Guía de vocabulario para conversar sobre salud vaginal, urinaria y sexual"
  ],
  "targetAudience": [
    "Una mujer aproximadamente entre los 38 y 60 años que ha notado cambios en su ciclo, sueño, temperatura, estado de ánimo o sexualidad.",
    "Quien recibió información contradictoria sobre hormonas y quiere prepararse antes de una consulta.",
    "También puede ser una pareja o familiar que desea acompañarla mejor."
  ],
  "faqs": [
    {
      "question": "Todavía menstruo; esto no es para mí",
      "answer": "La transición puede empezar antes de la última menstruación; la clase explica cómo reconocerla sin autodiagnosticarse."
    },
    {
      "question": "No quiero hormonas",
      "answer": "El objetivo no es convencer de usarlas, sino conocer opciones y formular una decisión informada."
    },
    {
      "question": "Tengo miedo de que las hormonas causen cáncer",
      "answer": "La clase explica por qué el balance de beneficios y riesgos no es idéntico para todas y debe revisarse individualmente."
    },
    {
      "question": "Mi médico ya me pidió estudios",
      "answer": "El programa ayuda a entender qué preguntas hacer sobre el propósito de cada evaluación."
    }
  ],
  "ctaLabel": "Quiero entender esta etapa y preparar mis decisiones",
  "category": "salud_mujer",
  "categoryLabel": "Salud de la Mujer",
  "level": "Introductorio",
  "durationMinutes": 145,
  "lessonCount": 8,
  "shop": "salud-forte.myshopify.com",
  "shopifyProductGid": "gid://shopify/Product/9840128917801",
  "shopifyVariantGid": "gid://shopify/ProductVariant/4981023910231",
  "sku": "MC-MENOPAUSIA-001",
  "status": "draft",
  "accessType": "lifetime",
  "launchDate": "2026-10-15T00:00:00Z",
  "launchStatus": "coming_soon",
  "previewEnabled": true,
  "price": 990,
  "compareAtPrice": 1350,
  "currency": "MXN",
  "image": "/images/masterclasses/official/menopausia-con-claridad-2026.webp",
  "imageFallback": "/images/masterclasses/official/menopausia-con-claridad-2026.png",
  "imageAlt": "Portada editorial de la masterclass Menopausia con claridad",
  "imageWidth": 1586,
  "imageHeight": 992,
  "imagePosition": "center",
  "imagePriority": true,
  "coverImage": "/images/masterclasses/official/menopausia-con-claridad-2026.webp",
  "coverAlt": "Portada editorial de la masterclass Menopausia con claridad",
  "imageId": "IMG-101-MASTERCLASS-MENOPAUSIA-PORTADA",
  "disclaimerShort": "Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.",
  "disclaimerLong": "El contenido de esta masterclass tiene fines exclusivamente educativos e informativos. No sustituye una consulta, diagnóstico o tratamiento médico individual. Ante síntomas, dudas o decisiones relacionadas con tu salud, consulta a un profesional calificado.",
  "modules": [
    {
      "id": "mod_meno_01",
      "courseId": "course_menopausia_001",
      "title": "Módulo 1. Ponle nombre a la etapa",
      "description": "Reconociendo los cambios",
      "position": 1,
      "status": "draft",
      "lessons": [
        {
          "id": "les_meno_01_01",
          "slug": "perimenopausia-menopausia-posmenopausia",
          "title": "1. Perimenopausia, menopausia y posmenopausia",
          "summary": "Qué significa cada etapa, por qué la experiencia varía y cómo evitar pensar que “todo es hormonal”.",
          "durationSeconds": 900,
          "position": 1,
          "videoProvider": "cloudflare_stream",
          "privateVideoUid": "cf_stream_meno_01_preview",
          "isPreview": true,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_meno_01"
        },
        {
          "id": "les_meno_01_02",
          "slug": "tu-mapa-sintomas",
          "title": "2. Tu mapa de síntomas",
          "summary": "Ciclo, bochornos, sudoración, sueño, ánimo, memoria percibida, sexualidad, vagina y vías urinarias; intensidad, frecuencia e impacto.",
          "durationSeconds": 1080,
          "position": 2,
          "videoProvider": "cloudflare_stream",
          "privateVideoUid": "cf_stream_meno_01_eje",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_meno_01"
        }
      ]
    },
    {
      "id": "mod_meno_02",
      "courseId": "course_menopausia_001",
      "title": "Módulo 2. Evalúa sin pedir estudios al azar",
      "description": "Evaluación clínica inteligente",
      "position": 2,
      "status": "draft",
      "lessons": [
        {
          "id": "les_meno_02_01",
          "slug": "que-necesita-buena-consulta",
          "title": "3. Qué información necesita una buena consulta",
          "summary": "Historia menstrual, medicamentos, anticoncepción, antecedentes, objetivos, banderas rojas y otras causas posibles.",
          "durationSeconds": 1080,
          "position": 1,
          "videoProvider": "cloudflare_stream",
          "privateVideoUid": "cf_stream_meno_02_trh",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_meno_02"
        },
        {
          "id": "les_meno_02_02",
          "slug": "estudios-chequeos",
          "title": "4. Estudios, chequeos y prevención",
          "summary": "Qué depende de edad, síntomas y antecedentes; salud ósea, cardiometabólica y tamizajes habituales sin vender un “panel hormonal universal”.",
          "durationSeconds": 1200,
          "position": 2,
          "videoProvider": "cloudflare_stream",
          "privateVideoUid": "cf_stream_meno_02_preguntas",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_meno_02"
        }
      ]
    },
    {
      "id": "mod_meno_03",
      "courseId": "course_menopausia_001",
      "title": "Módulo 3. Conoce el menú de opciones",
      "description": "Hormonas y estilo de vida",
      "position": 3,
      "status": "draft",
      "lessons": [
        {
          "id": "les_meno_03_01",
          "slug": "terapia-hormonal-limites",
          "title": "5. Terapia hormonal: beneficios, límites y decisiones",
          "summary": "Terapia sistémica frente a local, papel del progestágeno cuando corresponde, vías de administración, contraindicaciones y conversación individual de beneficios y riesgos.",
          "durationSeconds": 1200,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_meno_03"
        },
        {
          "id": "les_meno_03_02",
          "slug": "opciones-no-hormonales",
          "title": "6. Opciones no hormonales y estilo de vida",
          "summary": "Tratamientos prescritos no hormonales, sueño, actividad, tabaco, alcohol, ambiente y estrategias para síntomas; calidad variable de evidencia en productos y suplementos.",
          "durationSeconds": 1080,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_meno_03"
        }
      ]
    },
    {
      "id": "mod_meno_04",
      "courseId": "course_menopausia_001",
      "title": "Módulo 4. Convierte información en una decisión compartida",
      "description": "Organiza tu consulta",
      "position": 4,
      "status": "draft",
      "lessons": [
        {
          "id": "les_meno_04_01",
          "slug": "intimidad-piso-pelvico",
          "title": "7. Intimidad, piso pélvico y síntomas urinarios sin vergüenza",
          "summary": "Vocabulario para hablarlo, categorías de apoyo y cuándo solicitar evaluación.",
          "durationSeconds": 1080,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_meno_04"
        },
        {
          "id": "les_meno_04_02",
          "slug": "agenda-consulta",
          "title": "8. Tu agenda personal para la consulta",
          "summary": "Priorizar tres síntomas, expresar preferencias y temores, preguntar alternativas, seguimiento, beneficios esperados y riesgos relevantes.",
          "durationSeconds": 1080,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_meno_04"
        }
      ]
    }
  ]
,  instructor: OFFICIAL_INSTRUCTOR
},
{
  "id": "course_estres_002",
  "slug": "estres-y-tension-muscular",
  "title": "Estrés y tensión muscular: entiende tu cuerpo y crea una rutina de alivio seguro",
  "subtitle": "Aprende por qué la tensión puede repetirse, qué herramientas puedes probar y cuándo necesitas valoración profesional.",
  "shortDescription": "Si cuello, hombros o mandíbula vuelven a tensarse después de un día difícil, aprende a identificar detonantes y practica una rutina breve de respiración, relajación y movimiento gradual con límites de seguridad claros.",
  "description": "La tensión muscular no significa que estés fallando al relajarte. El estrés, la carga física, la inmovilidad, el sueño, las emociones y las expectativas pueden interactuar y aumentar la sensación de rigidez o dolor. Tampoco toda molestia debe atribuirse al estrés.\n\nEn esta masterclass aprenderás un modelo sencillo para entender esa interacción. Harás una auditoría de tu jornada, practicarás respiración lenta y relajación muscular progresiva, revisarás principios de movimiento y pausas, y construirás una rutina mínima para los días reales, no solo para los días perfectos. También aprenderás qué síntomas requieren valoración médica o fisioterapéutica.",
  "salesPromise": "Dejarás de atacar cada episodio de forma aislada y construirás un plan breve para observar, regular y decidir el siguiente paso.",
  "recognitionPoints": [
    "“Me soban y al rato vuelve”",
    "“Sé que es estrés, pero no sé cómo bajarlo del cuerpo”",
    "“¿Es contractura o me estoy lastimando?”",
    "“No tengo una hora diaria para hacer ejercicio”"
  ],
  "beforeState": [
    "Información dispersa",
    "Miedo",
    "Datos sin contexto",
    "Dificultad para hablar con el médico"
  ],
  "afterState": [
    "Comprensión básica",
    "Registro útil",
    "Preguntas mejor formuladas",
    "Siguiente paso más seguro"
  ],
  "notFor": [
    "Personas con dolor posterior a trauma importante, fiebre, dolor torácico, debilidad progresiva, pérdida de sensibilidad u otros síntomas nuevos o intensos sin valoración."
  ],
  "learningOutcomes": [
    "Comprender la respuesta de estrés y su relación posible con respiración, atención, tono y percepción del dolor.",
    "Reconocer que estrés no equivale a causa única ni a dolor imaginario.",
    "Registrar detonantes, actividades, descanso e impacto funcional.",
    "Practicar respiración lenta y relajación muscular progresiva de forma básica.",
    "Integrar movimiento gradual y pausas sin obsesionarse con una postura perfecta.",
    "Identificar señales que quedan fuera del autocuidado."
  ],
  "includedFeatures": [
    "Audio guiado de respiración y relajación muscular progresiva",
    "Registro corporal de siete días",
    "Tarjetas de pausas de 2, 5 y 10 minutos",
    "Constructor de rutina según tiempo disponible",
    "Semáforo de autocuidado, consulta programada y atención urgente"
  ],
  "targetAudience": [
    "Un adulto con tensión recurrente en cuello, mandíbula, hombros o espalda asociada a jornadas largas.",
    "Personas con estrés percibido, poca movilidad o hábitos posturales.",
    "Cualquiera que busque autocuidado seguro sin tener una lesión grave conocida sin valorar."
  ],
  "faqs": [
    {
      "question": "Yo necesito masaje, no teoría",
      "answer": "La clase incluye práctica y ayuda a entender por qué una herramienta aislada puede dar alivio temporal sin resolver todos los factores."
    },
    {
      "question": "No tengo tiempo",
      "answer": "Se diseñan versiones de 5, 10 y 20 minutos."
    },
    {
      "question": "Si es estrés, entonces está en mi mente",
      "answer": "No: la experiencia es real; el curso explica la interacción entre sistemas sin reducir todo a psicología."
    },
    {
      "question": "Tengo una lesión diagnosticada",
      "answer": "Debe seguirse el plan del equipo tratante; la masterclass no lo sustituye."
    }
  ],
  "ctaLabel": "Quiero crear mi rutina de autocuidado",
  "category": "bienestar",
  "categoryLabel": "Bienestar & Fisiología",
  "level": "Introductorio",
  "durationMinutes": 120,
  "lessonCount": 6,
  "shop": "salud-forte.myshopify.com",
  "shopifyProductGid": "gid://shopify/Product/9840128917802",
  "shopifyVariantGid": "gid://shopify/ProductVariant/4981023910232",
  "sku": "MC-ESTRES-002",
  "status": "draft",
  "accessType": "lifetime",
  "launchDate": "2026-10-25T00:00:00Z",
  "launchStatus": "coming_soon",
  "previewEnabled": true,
  "price": 850,
  "compareAtPrice": 1100,
  "currency": "MXN",
  "image": "/images/masterclasses/official/estres-tension-muscular-2026.webp",
  "imageFallback": "/images/masterclasses/official/estres-tension-muscular-2026.png",
  "imageAlt": "Portada editorial de la masterclass sobre estrés y tensión muscular",
  "imageWidth": 1586,
  "imageHeight": 992,
  "imagePosition": "center",
  "imagePriority": true,
  "coverImage": "/images/masterclasses/official/estres-tension-muscular-2026.webp",
  "coverAlt": "Portada editorial de la masterclass sobre estrés y tensión muscular",
  "imageId": "IMG-102-MASTERCLASS-ESTRES-PORTADA",
  "disclaimerShort": "Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.",
  "disclaimerLong": "El contenido de esta masterclass tiene fines exclusivamente educativos e informativos. No sustituye una consulta médica ni evaluación de dolor crónico. Si presentas dolor incapacitante, signos neurológicos o pérdida de fuerza, acude a valoración presencial inmediata.",
  "modules": [
    {
      "id": "mod_estres_01",
      "courseId": "course_estres_002",
      "title": "Módulo 1. Entiende el ciclo",
      "description": "Bases del cuerpo",
      "position": 1,
      "status": "draft",
      "lessons": [
        {
          "id": "les_estres_01_01",
          "slug": "cuerpo-se-prepara",
          "title": "1. Por qué el cuerpo se prepara para responder",
          "summary": "Respuesta de estrés, respiración, atención, protección y tensión explicadas en lenguaje cotidiano; variabilidad individual.",
          "durationSeconds": 1200,
          "position": 1,
          "videoProvider": "cloudflare_stream",
          "privateVideoUid": "cf_stream_estres_01",
          "isPreview": true,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_estres_01"
        },
        {
          "id": "les_estres_01_02",
          "slug": "dolor-tension-postura",
          "title": "2. Dolor, tensión y postura: qué sí sabemos",
          "summary": "Modelo multifactorial, carga, sedentarismo, sueño, miedo y mitos del “nudo”; no atribuir todos los síntomas a estrés.",
          "durationSeconds": 1200,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_estres_01"
        }
      ]
    },
    {
      "id": "mod_estres_02",
      "courseId": "course_estres_002",
      "title": "Módulo 2. Aprende herramientas seguras",
      "description": "Movimiento y respiración",
      "position": 2,
      "status": "draft",
      "lessons": [
        {
          "id": "les_estres_02_01",
          "slug": "respiracion-relajacion",
          "title": "3. Respiración y relajación muscular guiadas",
          "summary": "Práctica acompañada, expectativas realistas, adaptación y circunstancias en las que detenerse.",
          "durationSeconds": 1200,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_estres_02"
        },
        {
          "id": "les_estres_02_02",
          "slug": "movimiento-gradual-pausas",
          "title": "4. Movimiento gradual y pausas posibles",
          "summary": "Variar posiciones, dosificar carga, microdescansos y exploración de movimiento cómodo; sin correcciones universales ni manipulaciones agresivas.",
          "durationSeconds": 1200,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_estres_02"
        }
      ]
    },
    {
      "id": "mod_estres_03",
      "courseId": "course_estres_002",
      "title": "Módulo 3. Construye tu protocolo personal",
      "description": "Tu rutina diaria",
      "position": 3,
      "status": "draft",
      "lessons": [
        {
          "id": "les_estres_03_01",
          "slug": "detecta-tu-patron",
          "title": "5. Detecta tu patrón de siete días",
          "summary": "Zona, intensidad, actividad, horas de pantalla, estrés, sueño, respuesta a herramientas e impacto en la función.",
          "durationSeconds": 1200,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_estres_03"
        },
        {
          "id": "les_estres_03_02",
          "slug": "tu-plan",
          "title": "6. Tu plan de 5, 10 y 20 minutos",
          "summary": "Menú de acciones, plan para recaídas, cuándo acudir a medicina, fisioterapia o salud mental y señales de alarma.",
          "durationSeconds": 1200,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_estres_03"
        }
      ]
    }
  ]
,  instructor: OFFICIAL_INSTRUCTOR
},
{
  "id": "course_hormonal_003",
  "slug": "salud-hormonal-masculina",
  "title": "Salud hormonal masculina: entiende la testosterona antes de tomar decisiones",
  "subtitle": "Síntomas, estudios, fertilidad, tratamiento y seguimiento explicados con claridad y sin promesas de “optimización”.",
  "shortDescription": "¿Cansancio, baja libido o un resultado aislado significan testosterona baja? Aprende qué se necesita para una evaluación adecuada, qué otros factores deben revisarse y qué preguntas hacer antes de considerar suplementos o tratamiento.",
  "description": "La testosterona se ha convertido en una cifra cargada de expectativas. En redes se presenta como explicación para cansancio, aumento de peso, falta de motivación, cambios sexuales o pérdida de fuerza. En realidad, esos síntomas pueden tener varias causas y un resultado aislado no cuenta toda la historia.\n\nEsta masterclass explica, paso a paso, cómo funciona el eje hormonal masculino, cómo se evalúan síntomas y análisis, por qué una prueba suele necesitar condiciones adecuadas y confirmación, y cómo se investigan posibles causas. También revisarás qué puede y qué no puede esperarse de la terapia, su relación con fertilidad y los controles de seguridad que exige. El objetivo no es decirte si necesitas testosterona, sino darte criterio para no decidir a partir de miedo, vergüenza o marketing.",
  "salesPromise": "Pasarás de preguntar “¿cómo subo mi testosterona?” a saber “¿qué necesito evaluar y qué decisión tiene sentido para mi caso?”.",
  "recognitionPoints": [
    "“¿Mi cansancio significa que tengo baja testosterona?”",
    "“El laboratorio la marcó baja; ¿con eso basta?”",
    "“¿La terapia me ayudará o me puede afectar?”",
    "“Quiero preguntar por libido y erecciones sin sentirme juzgado”"
  ],
  "beforeState": [
    "Información dispersa",
    "Miedo",
    "Datos sin contexto",
    "Dificultad para hablar con el médico"
  ],
  "afterState": [
    "Comprensión básica",
    "Registro útil",
    "Preguntas mejor formuladas",
    "Siguiente paso más seguro"
  ],
  "notFor": [
    "Quien busca una receta, una dosis, un ciclo anabólico o validación para automedicarse.",
    "La terapia no debe iniciarse a partir de esta clase y requiere evaluación profesional; el deseo de fertilidad debe discutirse antes de cualquier decisión."
  ],
  "learningOutcomes": [
    "Comprender en términos básicos cómo se produce, regula y transporta la testosterona.",
    "Reconocer cuáles síntomas pueden justificar evaluación y por qué no son exclusivos de deficiencia hormonal.",
    "Entender la importancia del horario, método, repetición e interpretación profesional de los análisis.",
    "Diferenciar de forma básica causas testiculares y causas del eje hipotálamo–hipófisis.",
    "Reconocer la influencia de sueño, apnea, enfermedades, composición corporal, medicamentos y consumo de andrógenos.",
    "Conocer beneficios potenciales, límites, contraindicaciones, fertilidad y seguimiento de la terapia prescrita."
  ],
  "includedFeatures": [
    "Expediente hormonal de una página",
    "Mapa de síntomas y otras causas posibles",
    "Línea del tiempo de estudios con hora, condiciones y laboratorio",
    "Glosario de testosterona total, libre, SHBG, LH y FSH",
    "Checklist de fertilidad, medicamentos, suplementos y uso previo de andrógenos",
    "Guía de preguntas sobre beneficio esperado, monitoreo, costo y criterios"
  ],
  "targetAudience": [
    "Un hombre adulto con fatiga, cambios en deseo sexual, erecciones, fuerza, composición corporal, ánimo o concentración.",
    "Alguien con un resultado de testosterona que no entiende.",
    "Quien está considerando suplementos, “boosters”, anabólicos o terapia por recomendaciones de internet."
  ],
  "faqs": [
    {
      "question": "Solo quiero saber si mi nivel es bueno",
      "answer": "Un número se interpreta con síntomas, condiciones de la toma, método y confirmación."
    },
    {
      "question": "Me da pena hablar de esto",
      "answer": "La clase ofrece vocabulario clínico, respetuoso y privado para preparar la conversación."
    },
    {
      "question": "Ya me recomendaron testosterona",
      "answer": "El contenido permite preguntar cuál es el diagnóstico, cómo se confirmó, qué causa se investigó y cómo se vigilará."
    },
    {
      "question": "No quiero que me digan que todo es por mi peso",
      "answer": "La evaluación es multifactorial y debe evitar juicios; el peso no reemplaza la historia ni el estudio clínico."
    }
  ],
  "ctaLabel": "Quiero entender mis síntomas y mis estudios",
  "category": "salud_hombre",
  "categoryLabel": "Salud del Hombre",
  "level": "Introductorio",
  "durationMinutes": 135,
  "lessonCount": 7,
  "shop": "salud-forte.myshopify.com",
  "shopifyProductGid": "gid://shopify/Product/9840128917803",
  "shopifyVariantGid": "gid://shopify/ProductVariant/4981023910233",
  "sku": "MC-HORMONAL-003",
  "status": "draft",
  "accessType": "lifetime",
  "launchDate": "2026-11-05T00:00:00Z",
  "launchStatus": "coming_soon",
  "previewEnabled": true,
  "price": 950,
  "compareAtPrice": 1250,
  "currency": "MXN",
  "image": "/images/masterclasses/official/salud-hormonal-masculina-2026.webp",
  "imageFallback": "/images/masterclasses/official/salud-hormonal-masculina-2026.png",
  "imageAlt": "Portada editorial de la masterclass sobre salud hormonal masculina",
  "imageWidth": 1586,
  "imageHeight": 992,
  "imagePosition": "center",
  "imagePriority": false,
  "coverImage": "/images/masterclasses/official/salud-hormonal-masculina-2026.webp",
  "coverAlt": "Portada editorial de la masterclass sobre salud hormonal masculina",
  "imageId": "IMG-103-MASTERCLASS-HORMONAL-PORTADA",
  "disclaimerShort": "Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.",
  "disclaimerLong": "El contenido de esta masterclass tiene fines exclusivamente educativos. No prescribe ni promueve el uso no supervisado de andrógenos ni anabólicos. El hipogonadismo requiere diagnóstico clínico y confirmación de laboratorio en consulta médica presencial.",
  "modules": [
    {
      "id": "mod_hormon_01",
      "courseId": "course_hormonal_003",
      "title": "Módulo 1. Quita la cifra del pedestal",
      "description": "Bases y síntomas",
      "position": 1,
      "status": "draft",
      "lessons": [
        {
          "id": "les_hormon_01_01",
          "slug": "que-hace-testosterona",
          "title": "1. Qué hace la testosterona y qué no explica por sí sola",
          "summary": "Funciones, variabilidad y relación no lineal con identidad, rendimiento y bienestar.",
          "durationSeconds": 1080,
          "position": 1,
          "videoProvider": "cloudflare_stream",
          "privateVideoUid": "cf_stream_hormon_01",
          "isPreview": true,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_hormon_01"
        },
        {
          "id": "les_hormon_01_02",
          "slug": "sintomas-reales-compartidos",
          "title": "2. Síntomas reales, síntomas compartidos",
          "summary": "Función sexual, energía, composición corporal, ánimo y fuerza; causas alternativas y mapa inicial.",
          "durationSeconds": 1140,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_hormon_01"
        }
      ]
    },
    {
      "id": "mod_hormon_02",
      "courseId": "course_hormonal_003",
      "title": "Módulo 2. Entiende una evaluación correcta",
      "description": "Laboratorios",
      "position": 2,
      "status": "draft",
      "lessons": [
        {
          "id": "les_hormon_02_01",
          "slug": "como-se-mide",
          "title": "3. Cómo se mide sin sacar conclusiones rápidas",
          "summary": "Momento de la toma, enfermedad intercurrente, ensayo de laboratorio, testosterona total y libre cuando corresponde, confirmación y rangos contextualizados.",
          "durationSeconds": 1140,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_hormon_02"
        },
        {
          "id": "les_hormon_02_02",
          "slug": "por-que-baja",
          "title": "4. Si está baja, todavía falta preguntar por qué",
          "summary": "Historia, medicamentos, consumo de andrógenos, sueño y apnea, obesidad, enfermedades crónicas, LH/FSH y distinción básica de origen.",
          "durationSeconds": 1200,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_hormon_02"
        }
      ]
    },
    {
      "id": "mod_hormon_03",
      "courseId": "course_hormonal_003",
      "title": "Módulo 3. Decide con beneficios y riesgos sobre la mesa",
      "description": "Opciones y seguridad",
      "position": 3,
      "status": "draft",
      "lessons": [
        {
          "id": "les_hormon_03_01",
          "slug": "habitos-salud",
          "title": "5. Hábitos, salud metabólica y expectativas realistas",
          "summary": "Sueño, movimiento, masa muscular, nutrición, alcohol y peso sin prometer “elevar naturalmente” una cifra específica.",
          "durationSeconds": 1200,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_hormon_03"
        },
        {
          "id": "les_hormon_03_02",
          "slug": "terapia-limites",
          "title": "6. Terapia de testosterona: indicaciones, límites y seguridad",
          "summary": "Qué requiere el diagnóstico, posibles beneficios, contraindicaciones, efectos adversos, fertilidad, hematocrito, próstata y seguimiento individual.",
          "durationSeconds": 1200,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_hormon_03"
        }
      ]
    },
    {
      "id": "mod_hormon_04",
      "courseId": "course_hormonal_003",
      "title": "Módulo 4. Prepara tu conversación",
      "description": "Expediente organizado",
      "position": 4,
      "status": "draft",
      "lessons": [
        {
          "id": "les_hormon_04_01",
          "slug": "expediente-en-una-pagina",
          "title": "7. Tu expediente hormonal en una página",
          "summary": "Línea del tiempo de síntomas, estudios previos, medicamentos y suplementos, objetivos reproductivos y preguntas para consulta.",
          "durationSeconds": 1140,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_hormon_04"
        }
      ]
    }
  ]
,  instructor: OFFICIAL_INSTRUCTOR
},
{
  "id": "course_sop_004",
  "slug": "sindrome-ovario-poliquistico",
  "title": "SOP con claridad: entiende tu diagnóstico y elige tu siguiente paso",
  "subtitle": "Ciclos, síntomas, estudios y tratamientos explicados sin estigma, dietas extremas ni falsas promesas de curación.",
  "shortDescription": "Tener “quistes” o folículos en una ecografía no siempre significa SOP. Aprende cómo se construye el diagnóstico, qué otros aspectos conviene evaluar y cómo se eligen opciones según tus síntomas, tu salud y tus objetivos.",
  "description": "El síndrome de ovario poliquístico no se presenta igual en todas. Algunas mujeres consultan por ciclos irregulares; otras por acné, vello, caída de cabello, metabolismo o fertilidad. Por eso, una ecografía, un síntoma o una cifra aislada no deberían convertirse por sí solos en una etiqueta para toda la vida.\n\nEn esta masterclass entenderás cómo se construye el diagnóstico y por qué deben considerarse otras causas. Aprenderás qué relación pueden tener los andrógenos y la insulina, qué aspectos metabólicos y emocionales conviene revisar, y cómo se eligen intervenciones de estilo de vida y tratamientos médicos según la prioridad de cada persona. Terminarás con un mapa de síntomas, estudios y preguntas para coordinar mejor tu atención.\n\nNo encontrarás una dieta obligatoria ni una “cura en 30 días”. Encontrarás criterio, estructura y un siguiente paso más claro.",
  "salesPromise": "Dejarás de ver el SOP como una etiqueta confusa y empezarás a entenderlo como un mapa de decisiones que debe adaptarse a ti.",
  "recognitionPoints": [
    "“Me dijeron que tengo quistes; ¿eso significa que tengo SOP?”",
    "“¿Voy a poder embarazarme?”",
    "“¿Todo se debe a mi peso?”",
    "“Cada persona me recomienda una dieta o suplemento diferente”",
    "“¿Por qué me dieron anticonceptivos o metformina y qué se espera de ellos?”"
  ],
  "beforeState": [
    "Información dispersa",
    "Miedo",
    "Datos sin contexto",
    "Dificultad para hablar con el médico"
  ],
  "afterState": [
    "Comprensión básica",
    "Registro útil",
    "Preguntas mejor formuladas",
    "Siguiente paso más seguro"
  ],
  "notFor": [
    "Quien busca autodiagnóstico, una dieta universal, indicaciones para suspender anticonceptivos o dosis de medicamentos o suplementos.",
    "Sangrado intenso, dolor importante, embarazo o síntomas agudos necesitan orientación clínica directa."
  ],
  "learningOutcomes": [
    "Comprender qué es y qué no es el SOP.",
    "Conocer los componentes de los criterios diagnósticos y la necesidad de excluir otras causas.",
    "Entender por qué en adolescentes el proceso diagnóstico requiere consideraciones especiales.",
    "Reconocer la diversidad de presentaciones y evitar equiparar SOP con peso o infertilidad.",
    "Comprender la relación posible entre andrógenos, ovulación, insulina y riesgo metabólico.",
    "Conocer categorías de tratamiento según objetivos, sin automedicarse.",
    "Preparar un seguimiento coordinado y respetuoso."
  ],
  "includedFeatures": [
    "Rastreador de ciclos y síntomas sin juicios",
    "Hoja “¿Qué criterios me explicaron y qué otras causas se revisaron?”",
    "Mapa de objetivos: ciclo, piel/cabello, metabolismo, anticoncepción, fertilidad",
    "Comparador educativo de categorías de tratamiento",
    "Guía para coordinar especialistas según necesidades"
  ],
  "targetAudience": [
    "Adolescente mayor o mujer adulta con diagnóstico reciente o sospecha de SOP.",
    "Quien presenta ciclos irregulares, acné, crecimiento de vello, caída de cabello, dificultad reproductiva o inquietud metabólica.",
    "Mujer que recibió el diagnóstico solo porque una ecografía mostró “quistes” y quiere confirmarlo con un profesional."
  ],
  "faqs": [
    {
      "question": "Ya me hicieron un ultrasonido",
      "answer": "Es información útil en algunos contextos, pero el diagnóstico completo no debe reducirse a una imagen."
    },
    {
      "question": "No tengo sobrepeso",
      "answer": "El SOP puede aparecer en distintos cuerpos; el curso no usa el peso como requisito ni explicación total."
    },
    {
      "question": "Solo quiero una dieta",
      "answer": "La alimentación puede formar parte del plan, pero no existe una pauta única que diagnostique o cure el síndrome."
    },
    {
      "question": "Me preocupa no poder embarazarme",
      "answer": "El SOP puede afectar la ovulación, pero no equivale automáticamente a infertilidad; la clase ayuda a preparar una evaluación individual."
    },
    {
      "question": "Ya tomo medicamentos",
      "answer": "No se deben suspender ni modificar; el programa ayuda a entender qué objetivo y seguimiento conviene discutir."
    }
  ],
  "ctaLabel": "Quiero entender mi diagnóstico y mis opciones",
  "category": "salud_mujer",
  "categoryLabel": "Salud de la Mujer",
  "level": "Introductorio",
  "durationMinutes": 150,
  "lessonCount": 8,
  "shop": "salud-forte.myshopify.com",
  "shopifyProductGid": "gid://shopify/Product/9840128917804",
  "shopifyVariantGid": "gid://shopify/ProductVariant/4981023910234",
  "sku": "MC-SOP-004",
  "status": "draft",
  "accessType": "lifetime",
  "launchDate": "2026-11-15T00:00:00Z",
  "launchStatus": "coming_soon",
  "previewEnabled": true,
  "price": 990,
  "compareAtPrice": 1300,
  "currency": "MXN",
  "image": "/images/masterclasses/official/sop-con-claridad-2026.webp",
  "imageFallback": "/images/masterclasses/official/sop-con-claridad-2026.png",
  "imageAlt": "Portada editorial de la masterclass SOP con claridad",
  "imageWidth": 1586,
  "imageHeight": 992,
  "imagePosition": "center",
  "imagePriority": false,
  "coverImage": "/images/masterclasses/official/sop-con-claridad-2026.webp",
  "coverAlt": "Portada editorial de la masterclass SOP con claridad",
  "imageId": "IMG-104-MASTERCLASS-SOP-PORTADA",
  "disclaimerShort": "Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.",
  "disclaimerLong": "El contenido de esta masterclass tiene fines exclusivamente educativos. El síndrome de ovario poliquístico requiere diagnóstico diferencial con otras patologías suprarrenales e hipofisarias. No modifiques tratamientos ni dosis sin supervisión médica.",
  "modules": [
    {
      "id": "mod_sop_01",
      "courseId": "course_sop_004",
      "title": "Módulo 1. Confirma qué significa el diagnóstico",
      "description": "SOP y criterios",
      "position": 1,
      "status": "draft",
      "lessons": [
        {
          "id": "les_sop_01_01",
          "slug": "que-es-sop",
          "title": "1. Qué es y qué no es el SOP",
          "summary": "El nombre, la diversidad de presentaciones y por qué “quistes” puede confundir.",
          "durationSeconds": 1080,
          "position": 1,
          "videoProvider": "cloudflare_stream",
          "privateVideoUid": "cf_stream_sop_01",
          "isPreview": true,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sop_01"
        },
        {
          "id": "les_sop_01_02",
          "slug": "como-se-construye",
          "title": "2. Cómo se construye el diagnóstico",
          "summary": "Ciclos/ovulación, hiperandrogenismo clínico o bioquímico y morfología ovárica cuando corresponde; exclusión de otras causas y consideraciones especiales en adolescentes.",
          "durationSeconds": 1080,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sop_01"
        }
      ]
    },
    {
      "id": "mod_sop_02",
      "courseId": "course_sop_004",
      "title": "Módulo 2. Entiende lo que ocurre en tu cuerpo",
      "description": "Hormonas y metabolismo",
      "position": 2,
      "status": "draft",
      "lessons": [
        {
          "id": "les_sop_02_01",
          "slug": "ciclo-ovulacion",
          "title": "3. Ciclo, ovulación y andrógenos",
          "summary": "Cómo se relacionan con menstruación, acné, vello y cabello sin asumir que todas tendrán lo mismo.",
          "durationSeconds": 1140,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sop_02"
        },
        {
          "id": "les_sop_02_02",
          "slug": "insulina-salud-metabolica",
          "title": "4. Insulina y salud metabólica sin culpa",
          "summary": "Qué relación puede existir, por qué no define a todas, evaluación de glucosa, lípidos, presión y sueño según el caso.",
          "durationSeconds": 1140,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sop_02"
        }
      ]
    },
    {
      "id": "mod_sop_03",
      "courseId": "course_sop_004",
      "title": "Módulo 3. Elige opciones según tu objetivo",
      "description": "Tratamiento personalizado",
      "position": 3,
      "status": "draft",
      "lessons": [
        {
          "id": "les_sop_03_01",
          "slug": "estilo-vida",
          "title": "5. Estilo de vida sin dietas castigo",
          "summary": "Alimentación sostenible, actividad, sueño, prevención de ganancia de peso y beneficios incluso cuando la báscula no cambia; derivación a nutrición calificada.",
          "durationSeconds": 1140,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sop_03"
        },
        {
          "id": "les_sop_03_02",
          "slug": "opciones-medicas",
          "title": "6. Opciones médicas para ciclo, piel y metabolismo",
          "summary": "Categorías como anticonceptivos combinados, sensibilizadores a la insulina y antiandrógenos, con propósito, límites, precauciones y necesidad de prescripción individual.",
          "durationSeconds": 1140,
          "position": 2,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sop_03"
        },
        {
          "id": "les_sop_03_03",
          "slug": "fertilidad",
          "title": "7. Fertilidad y planes reproductivos",
          "summary": "Qué preguntar si busca embarazo ahora, después o nunca; anticoncepción, preconcepción y derivación oportuna.",
          "durationSeconds": 1140,
          "position": 3,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sop_03"
        }
      ]
    },
    {
      "id": "mod_sop_04",
      "courseId": "course_sop_004",
      "title": "Módulo 4. Diseña seguimiento de largo plazo",
      "description": "Tu mapa personal",
      "position": 4,
      "status": "draft",
      "lessons": [
        {
          "id": "les_sop_04_01",
          "slug": "tu-mapa-personal",
          "title": "8. Tu mapa personal de SOP",
          "summary": "Criterios que te explicaron, prioridades, bienestar emocional, estudios, profesionales involucrados, metas de seguimiento y preguntas para la siguiente consulta.",
          "durationSeconds": 1140,
          "position": 1,
          "videoProvider": "none",
          "privateVideoUid": "",
          "isPreview": false,
          "status": "draft",
          "createdAt": "2026-09-01T00:00:00Z",
          "updatedAt": "2026-09-01T00:00:00Z",
          "moduleId": "mod_sop_04"
        }
      ]
    }
  ]
,  instructor: OFFICIAL_INSTRUCTOR
}
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
      instructor: OFFICIAL_INSTRUCTOR,
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
