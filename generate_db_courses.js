const fs = require('fs');

const coursesData = [
  // 1. Glucosa
  {
    id: "course_glucosa_001",
    slug: "monitorea-tu-glucosa-con-confianza",
    title: "Monitorea tu glucosa con confianza",
    subtitle: "Aprende a usar tu glucómetro, evitar errores comunes y convertir tus lecturas en información útil para tu consulta.",
    shortDescription: "¿Tus lecturas cambian y no sabes si mediste bien? Aprende paso a paso a preparar el equipo, obtener una medición más confiable, registrar el contexto y reconocer cuándo una cifra necesita confirmación o atención profesional.",
    description: "Medirte la glucosa no debería sentirse como adivinar. En esta masterclass aprenderás, desde cero, cómo funciona un glucómetro, cómo preparar tus manos y tus materiales, cómo obtener la muestra y cuáles son los errores que pueden alterar una lectura. También conocerás la diferencia básica entre un glucómetro y un monitor continuo, y aprenderás a registrar horarios, alimentos, actividad, síntomas y medicamentos para que los números tengan contexto.\n\nNo recibirás metas universales ni cambios de tratamiento. Obtendrás algo más seguro y útil: un método sencillo para medir mejor, identificar patrones sin sacar conclusiones precipitadas y llevar información ordenada a tu consulta.",
    salesPromise: "Dejarás de coleccionar números sueltos y aprenderás a construir un registro que tú y tu equipo de salud puedan comprender.",
    recognitionPoints: [
      "“¿Lo estoy haciendo bien o estoy desperdiciando tiras?”",
      "“Me salió diferente dos veces; ¿cuál número vale?”",
      "“¿Esto significa que ya estoy peor?”",
      "“Tengo muchos números, pero no sé qué enseñarle al doctor”."
    ],
    beforeState: [
      "Información dispersa y miedo",
      "Datos sin contexto",
      "Dificultad para hablar con el médico",
      "Temor o juicio hacia cada cifra"
    ],
    afterState: [
      "Comprensión básica de tus herramientas",
      "Registro útil con contexto",
      "Preguntas mejor formuladas",
      "Capacidad para medir y revisar errores"
    ],
    learningOutcomes: [
      "Reconocer las partes del glucómetro y revisar tiras, caducidad y almacenamiento.",
      "Prepararse y realizar la medición siguiendo el manual específico de su equipo.",
      "Identificar causas frecuentes de resultados inesperados.",
      "Diferenciar una lectura puntual de una tendencia y de una prueba diagnóstica.",
      "Registrar el contexto de cada medición sin volverse esclavo de los números.",
      "Preparar preguntas útiles para su consulta y seguir su plan personal ante cifras o síntomas preocupantes."
    ],
    notFor: [
      "Quien busca un diagnóstico, una dosis de insulina, una meta individual o instrucciones para modificar medicamentos. Eso requiere evaluación profesional."
    ],
    includedFeatures: [
      "Bitácora de glucosa de siete días con contexto",
      "Tarjeta “Antes de repetir la medición, revisa esto”",
      "Guía visual del equipo y de los errores del medidor",
      "Hoja “Mis cuatro preguntas para la consulta”"
    ],
    targetAudience: [
      "Una persona adulta mexicana que acaba de recibir un diagnóstico de diabetes o prediabetes.",
      "Alguien que comenzó a usar glucómetro o cuida a un familiar.",
      "Quien utiliza monitoreo continuo o recibió la indicación de registrar su glucosa y no sabe exactamente cómo hacerlo.",
      "Personas que se sienten apenadas de preguntar algo “tan básico” en consulta."
    ],
    faqs: [
      { question: "Mi aparato es de otra marca", answer: "La técnica se enseña como base común, pero se recalca que cada persona debe seguir el manual de su modelo." },
      { question: "Ya sé picarme", answer: "La propuesta no es solo pinchar: es reconocer errores, registrar contexto y comunicar patrones." },
      { question: "El médico ya me dio metas", answer: "Perfecto; la clase ayuda a producir información más ordenada para seguir ese plan, no a reemplazarlo." },
      { question: "Me da ansiedad ver los números", answer: "El enfoque reduce juicios y presenta cada cifra como información, con límites claros sobre cuándo pedir ayuda." }
    ],
    ctaLabel: "Quiero aprender a medir y registrar mejor",
    level: "Introductorio",
    durationMinutes: 45,
    lessonCount: 9,
    category: "bienestar",
    categoryLabel: "Bienestar & Fisiología",
    modules: [
      {
        id: "mod_glucosa_1", courseId: "course_glucosa_001", title: "Módulo 1. Antes del pinchazo: entiende tu herramienta", description: "Qué mide el glucómetro y cómo prepararse", position: 1, status: "published",
        lessons: [
          { id: "les_gluc_1_1", slug: "glucosa-es-un-dato", title: "1. Tu glucosa es un dato, no una calificación", summary: "Qué mide el glucómetro, qué no puede concluir y por qué el contexto cambia la interpretación.", durationSeconds: 300, position: 1 },
          { id: "les_gluc_1_2", slug: "conoce-tu-equipo", title: "2. Conoce tu equipo sin tecnicismos", summary: "Medidor, tira, lanceta, dispositivo de punción, solución de control y manual del fabricante.", durationSeconds: 300, position: 2 },
          { id: "les_gluc_1_3", slug: "prepara-manos-tiras", title: "3. Prepara manos, tiras y superficie", summary: "Higiene, secado, caducidad, almacenamiento y lista previa para evitar repeticiones.", durationSeconds: 300, position: 3 }
        ]
      },
      {
        id: "mod_glucosa_2", courseId: "course_glucosa_001", title: "Módulo 2. Mide paso a paso y reduce errores", description: "La técnica correcta y cómo evitar resultados alterados", position: 2, status: "published",
        lessons: [
          { id: "les_gluc_2_1", slug: "obtener-muestra-menos-miedo", title: "4. Cómo obtener la muestra con menos miedo", summary: "Colocación, lateral del dedo, rotación de sitios y manejo seguro del material punzocortante conforme a indicaciones locales.", durationSeconds: 300, position: 1 },
          { id: "les_gluc_2_2", slug: "medicion-completa", title: "5. La medición completa, de principio a fin", summary: "Demostración pausada, carga correcta de la tira y lectura del resultado.", durationSeconds: 300, position: 2 },
          { id: "les_gluc_2_3", slug: "me-salio-raro", title: "6. “Me salió raro”: qué revisar antes de concluir", summary: "Manos contaminadas, poca muestra, tiras dañadas, temperatura, mensajes del aparato y cuándo repetir conforme al manual o plan clínico.", durationSeconds: 300, position: 3 }
        ]
      },
      {
        id: "mod_glucosa_3", courseId: "course_glucosa_001", title: "Módulo 3. Convierte números en una conversación útil", description: "Registros, monitores continuos y la consulta", position: 3, status: "published",
        lessons: [
          { id: "les_gluc_3_1", slug: "glucometro-y-monitor-continuo", title: "7. Glucómetro y monitor continuo: no son lo mismo", summary: "Diferencias básicas, retraso entre compartimentos y confirmación de lecturas inesperadas según dispositivo y plan médico.", durationSeconds: 300, position: 1 },
          { id: "les_gluc_3_2", slug: "el-registro-que-ayuda", title: "8. El registro que sí ayuda", summary: "Fecha, hora, relación con alimentos, actividad, síntomas, medicamentos y eventos fuera de rutina.", durationSeconds: 300, position: 2 },
          { id: "les_gluc_3_3", slug: "que-hacer-despues-de-medir", title: "9. Qué hacer después de medir", summary: "Patrones frente a cifras aisladas, plan personal de acción, síntomas de alarma y preparación de cuatro preguntas para la consulta.", durationSeconds: 300, position: 3 }
        ]
      }
    ]
  },
  
  // 2. Presión arterial
  {
    id: "course_presion_001",
    slug: "presion-arterial-midela-bien-en-casa",
    title: "Presión arterial en casa: mídela bien y entiende tu registro",
    subtitle: "Elige el equipo correcto, evita errores de postura y lleva a tu consulta lecturas que realmente sean útiles.",
    shortDescription: "Una medición puede cambiar por el brazalete, la postura o la preparación. Aprende un protocolo sencillo para medir tu presión en casa, registrar resultados y saber cuándo repetir la lectura o solicitar orientación médica.",
    description: "Tener un baumanómetro automático no garantiza una buena medición. El tamaño del brazalete, cinco minutos de reposo, la posición del brazo, la espalda, los pies e incluso hablar durante la toma pueden cambiar el resultado.\n\nEn esta masterclass aprenderás a seleccionar un equipo adecuado, preparar tu cuerpo, colocarte correctamente y seguir una rutina reproducible. También entenderás qué representan los dos números, por qué una lectura es solo una fotografía del momento y cómo organizar varias mediciones para conversar con tu médico con mayor claridad. Incluye un registro semanal y una guía visual de postura.",
    salesPromise: "En 40 minutos construirás una técnica repetible para dejar de dudar si el dato cambió o si cambió la forma de medirlo.",
    recognitionPoints: [
      "“En la consulta me sale alta y en casa no”",
      "“Me la tomé tres veces y cada vez salió diferente”",
      "“Si hoy salió bien, ¿ya puedo dejar la pastilla?”",
      "“¿El aparato de muñeca sirve igual?”"
    ],
    beforeState: [
      "Dudar de cada lectura",
      "Información dispersa y miedos",
      "Técnica incorrecta o variable",
      "Dificultad para hablar con el médico"
    ],
    afterState: [
      "Técnica repetible y segura",
      "Registro semanal confiable",
      "Comprensión básica de los números",
      "Capacidad para presentar un registro organizado"
    ],
    learningOutcomes: [
      "Diferenciar presión sistólica y diastólica con una explicación sencilla.",
      "Elegir un monitor automático de brazo validado y un brazalete que ajuste.",
      "Prepararse durante los minutos previos y adoptar la postura correcta.",
      "Realizar y registrar lecturas repetidas conforme a la indicación de su profesional.",
      "Reconocer factores que pueden alterar temporalmente la medición.",
      "Responder con seguridad ante una lectura inesperada siguiendo criterios de repetición, síntomas y atención médica."
    ],
    notFor: [
      "Quien busca diagnóstico inmediato o instrucciones para iniciar, suspender o ajustar medicamentos.",
      "Si existe una lectura muy alta acompañada de dolor torácico, falta de aire, debilidad, alteración visual o dificultad para hablar, se requiere atención de urgencia y no continuar viendo una clase."
    ],
    includedFeatures: [
      "Infografía de postura correcta",
      "Registro semanal con espacio para dos lecturas y contexto",
      "Guía para medir la circunferencia del brazo",
      "Tarjeta “Una cifra alta: pausa, repite y revisa”",
      "Checklist para llevar aparato y bitácora a consulta"
    ],
    targetAudience: [
      "Una persona con hipertensión, cifras variables, tratamiento nuevo, antecedentes familiares o indicación médica de llevar un registro.",
      "Familiar que mide la presión a padres o abuelos.",
      "Quien usa un aparato comprado en farmacia y supone que basta con presionar un botón sin conocer el protocolo."
    ],
    faqs: [
      { question: "Mi aparato ya hace todo", answer: "Automatiza el inflado y la lectura, pero la preparación, el brazalete y la postura siguen dependiendo de la persona." },
      { question: "En la farmacia me la toman gratis", answer: "La clase enseña una rutina reproducible en condiciones conocidas y un registro longitudinal." },
      { question: "Siempre me sale diferente", answer: "Cierta variación existe; el objetivo es reducir las variables de técnica y observar el conjunto con el médico." },
      { question: "Solo quiero saber si tengo hipertensión", answer: "La clase no diagnostica; enseña a obtener y organizar datos que pueden apoyar una valoración." }
    ],
    ctaLabel: "Quiero medir mi presión correctamente",
    level: "Introductorio",
    durationMinutes: 40,
    lessonCount: 10,
    category: "bienestar",
    categoryLabel: "Bienestar & Fisiología",
    modules: [
      {
        id: "mod_presion_1", courseId: "course_presion_001", title: "Módulo 1. El equipo correcto", description: "Comprende los números y elige el equipo", position: 1, status: "published",
        lessons: [
          { id: "les_pre_1_1", slug: "que-significan-los-dos-numeros", title: "1. Qué significan los dos números", summary: "Sístole, diástole y por qué una toma no cuenta toda la historia.", durationSeconds: 240, position: 1 },
          { id: "les_pre_1_2", slug: "brazo-muneca-reloj", title: "2. Brazo, muñeca o reloj: qué equipo buscar", summary: "Preferencia por monitor automático validado de brazo y límites de otros dispositivos.", durationSeconds: 240, position: 2 },
          { id: "les_pre_1_3", slug: "brazalete-si-importa", title: "3. El brazalete sí importa", summary: "Medición del brazo, ajuste y errores por talla inadecuada.", durationSeconds: 240, position: 3 }
        ]
      },
      {
        id: "mod_presion_2", courseId: "course_presion_001", title: "Módulo 2. La técnica que hace confiable el registro", description: "Preparación y postura", position: 2, status: "published",
        lessons: [
          { id: "les_pre_2_1", slug: "los-30-minutos-previos", title: "4. Los 30 minutos previos", summary: "Café, tabaco, ejercicio, vejiga y otras condiciones que se deben considerar.", durationSeconds: 240, position: 1 },
          { id: "les_pre_2_2", slug: "cinco-minutos-que-cambian", title: "5. Cinco minutos que cambian la toma", summary: "Reposo sin conversación, teléfono ni distracciones.", durationSeconds: 240, position: 2 },
          { id: "les_pre_2_3", slug: "postura-completa", title: "6. Postura completa, paso a paso", summary: "Espalda apoyada, pies en el piso, piernas descruzadas, brazo descubierto y apoyado a nivel del corazón.", durationSeconds: 240, position: 3 },
          { id: "les_pre_2_4", slug: "coloca-el-brazalete", title: "7. Coloca el brazalete y toma la lectura", summary: "Demostración, inmovilidad y errores comunes.", durationSeconds: 240, position: 4 }
        ]
      },
      {
        id: "mod_presion_3", courseId: "course_presion_001", title: "Módulo 3. Del dato a la consulta", description: "Organiza la información para tu médico", position: 3, status: "published",
        lessons: [
          { id: "les_pre_3_1", slug: "por-que-varias-lecturas", title: "8. Por qué se toman varias lecturas", summary: "Repetición, intervalo y horario según el plan indicado; evitar “perseguir” el número indefinidamente.", durationSeconds: 240, position: 1 },
          { id: "les_pre_3_2", slug: "registro-semanal", title: "9. Tu registro semanal", summary: "Cómo anotar hora, lecturas, síntomas y circunstancias relevantes; equipo con memoria.", durationSeconds: 240, position: 2 },
          { id: "les_pre_3_3", slug: "lecturas-inesperadas", title: "10. Lecturas inesperadas y señales de alarma", summary: "Repetir correctamente, valorar síntomas, contactar al equipo de salud y reconocer una emergencia sin suspender o duplicar medicamentos por cuenta propia.", durationSeconds: 240, position: 3 }
        ]
      }
    ]
  },
  
  // 3. Sueño
  {
    id: "course_sueno_001",
    slug: "dormir-mejor-energia-enfoque-y-rendimiento",
    title: "Dormir mejor: un plan práctico para recuperar energía y claridad",
    subtitle: "Entiende qué está interfiriendo con tu descanso y diseña una rutina realista para tus noches y tus mañanas.",
    shortDescription: "Si llegas cansado a la cama pero no logras descansar, esta masterclass te ayuda a identificar qué está interfiriendo. Organiza luz, horarios, cafeína, actividad, ambiente y rutina mediante un plan de 14 días adaptable a tu vida.",
    description: "Dormir mejor no empieza comprando un suplemento ni persiguiendo una noche perfecta. Empieza por comprender cómo se coordinan la presión de sueño y el reloj interno, y por observar qué señales recibe tu cuerpo durante el día y la noche.\n\nEn esta masterclass traduciremos la ciencia del sueño a decisiones cotidianas: a qué hora exponerte a luz, cómo ordenar horarios, cuándo revisar la cafeína, cómo usar el ejercicio, qué cambiar en tu habitación y cómo crear una transición nocturna aunque tengas una agenda exigente. Construirás un experimento personal de 14 días y aprenderás a reconocer señales de insomnio persistente, apnea u otros problemas que necesitan valoración.",
    salesPromise: "Pasarás de probar consejos al azar a seguir un plan sencillo, medible y adaptado a tu realidad.",
    recognitionPoints: [
      "“Estoy cansado todo el día, pero de noche no me da sueño”",
      "“Duermo varias horas y aun así amanezco agotado”",
      "“No puedo dejar el celular porque es mi único rato libre”",
      "“¿Necesito melatonina o un estudio del sueño?”"
    ],
    beforeState: [
      "Probar consejos de sueño al azar",
      "Información dispersa y mitos sobre el descanso",
      "Frustración por no poder dormir perfecto",
      "Desconocer señales de trastornos del sueño"
    ],
    afterState: [
      "Plan de 14 días adaptado a tu realidad",
      "Comprensión básica de tu reloj interno",
      "Rutina nocturna y matutina viable",
      "Saber cuándo pedir evaluación profesional"
    ],
    learningOutcomes: [
      "Diferenciar cantidad, calidad, regularidad y continuidad del sueño.",
      "Comprender de forma sencilla el reloj circadiano y la presión de sueño.",
      "Detectar las conductas y condiciones que más interfieren en su caso.",
      "Diseñar una mañana que favorezca alerta y una noche que facilite la transición al descanso.",
      "Utilizar un diario sin obsesionarse con relojes o puntuaciones.",
      "Reconocer ronquido intenso, pausas respiratorias, somnolencia peligrosa e insomnio persistente como motivos de evaluación."
    ],
    notFor: [
      "Quien requiere atención inmediata por somnolencia al conducir, pausas respiratorias observadas, síntomas neurológicos o crisis de salud mental.",
      "Tampoco sustituye la evaluación y tratamiento del insomnio crónico u otros trastornos del sueño."
    ],
    includedFeatures: [
      "Diario y plan de sueño de 14 días",
      "Calculadora sencilla de cafeína por horario",
      "Constructor de rutina nocturna con opciones de 15, 30 y 60 minutos",
      "Auditoría de dormitorio con alternativas gratuitas y completas",
      "Hoja “Señales para hablar con mi médico”"
    ],
    targetAudience: [
      "Un adulto con horarios largos, uso nocturno del celular, o cansancio matutino.",
      "Personas con dificultad ocasional para conciliar o mantener el sueño.",
      "Quienes sienten que duermen pero no descansan, ya sean profesionistas, cuidadores o padres de familia.",
      "Cualquiera que busque funcionar mejor de día sin convertirse en experto en sueño."
    ],
    faqs: [
      { question: "Ya intenté higiene del sueño", answer: "El curso no se limita a una lista: enseña mecanismos, diario, priorización y criterios para buscar evaluación." },
      { question: "No puedo apagar el celular una hora antes", answer: "Se construye un cambio gradual que considere trabajo y vida familiar." },
      { question: "Quiero saber qué suplemento tomar", answer: "La clase ayuda a entender el problema y preparar una consulta; no prescribe suplementos ni somníferos." },
      { question: "Mis horarios cambian", answer: "Incluye adaptación para semanas imperfectas y un ancla mínima de rutina." }
    ],
    ctaLabel: "Quiero construir mi plan de sueño de 14 días",
    level: "Introductorio",
    durationMinutes: 90,
    lessonCount: 12,
    category: "bienestar",
    categoryLabel: "Bienestar & Fisiología",
    modules: [
      {
        id: "mod_sueno_1", courseId: "course_sueno_001", title: "Módulo 1. Entiende tu sueño", description: "Bases del descanso y el reloj interno", position: 1, status: "published",
        lessons: [
          { id: "les_sue_1_1", slug: "dormir-mas-no-siempre-es-mejor", title: "1. Dormir más no siempre es dormir mejor", summary: "Duración, calidad, continuidad, regularidad y cómo definir un objetivo realista.", durationSeconds: 360, position: 1 },
          { id: "les_sue_1_2", slug: "tu-reloj-interno", title: "2. Tu reloj interno", summary: "Ritmo circadiano, luz y horarios explicados sin jerga.", durationSeconds: 420, position: 2 },
          { id: "les_sue_1_3", slug: "la-presion-de-sueno", title: "3. La presión de sueño", summary: "Cómo se acumula, efecto de las siestas y por qué estar agotado no siempre significa poder dormir.", durationSeconds: 420, position: 3 }
        ]
      },
      {
        id: "mod_sueno_2", courseId: "course_sueno_001", title: "Módulo 2. Diseña el día que prepara la noche", description: "Actividades diurnas y su impacto nocturno", position: 2, status: "published",
        lessons: [
          { id: "les_sue_2_1", slug: "primera-hora-de-tu-manana", title: "4. La primera hora de tu mañana", summary: "Horario de despertar, luz natural y activación gradual.", durationSeconds: 480, position: 1 },
          { id: "les_sue_2_2", slug: "cafeina-cantidad-horario", title: "5. Cafeína: cantidad, horario y sensibilidad", summary: "Identificar fuentes y diseñar un límite personal prudente.", durationSeconds: 420, position: 2 },
          { id: "les_sue_2_3", slug: "actividad-fisica-alcohol", title: "6. Actividad física, comidas y alcohol", summary: "Cómo observar su relación con el descanso sin reglas absolutas ni promesas.", durationSeconds: 420, position: 3 }
        ]
      },
      {
        id: "mod_sueno_3", courseId: "course_sueno_001", title: "Módulo 3. Construye una noche viable", description: "Transición nocturna y el ambiente de descanso", position: 3, status: "published",
        lessons: [
          { id: "les_sue_3_1", slug: "ultima-hora-despierto", title: "7. La última hora despierto", summary: "Crear una secuencia de cierre para trabajo, pendientes, contenido estimulante y preocupación.", durationSeconds: 480, position: 1 },
          { id: "les_sue_3_2", slug: "pantallas-sin-pensamiento-magico", title: "8. Pantallas sin pensamiento mágico", summary: "Luz, contenido, tiempo y estrategias graduales cuando “dejar el celular” no es realista.", durationSeconds: 480, position: 2 },
          { id: "les_sue_3_3", slug: "tu-dormitorio-posible", title: "9. Tu dormitorio dentro de lo posible", summary: "Oscuridad, ruido, temperatura, cama y soluciones de bajo costo.", durationSeconds: 480, position: 3 }
        ]
      },
      {
        id: "mod_sueno_4", courseId: "course_sueno_001", title: "Módulo 4. Mide, ajusta y pide ayuda a tiempo", description: "Diario, plan y evaluación clínica", position: 4, status: "published",
        lessons: [
          { id: "les_sue_4_1", slug: "diario-de-sueno-14-dias", title: "10. Diario de sueño de 14 días", summary: "Qué anotar, cómo interpretar tendencias y por qué no perseguir una puntuación perfecta.", durationSeconds: 480, position: 1 },
          { id: "les_sue_4_2", slug: "tu-plan-minimo-viable", title: "11. Tu plan mínimo viable", summary: "Elegir dos cambios, definir obstáculos y preparar alternativas para fines de semana o días difíciles.", durationSeconds: 480, position: 2 },
          { id: "les_sue_4_3", slug: "cuando-habitos-no-bastan", title: "12. Cuando los hábitos no son suficientes", summary: "Insomnio crónico, apnea, piernas inquietas, medicamentos, salud mental, trabajo por turnos y cuándo hablar con un profesional; introducción a la TCC-I.", durationSeconds: 480, position: 3 }
        ]
      }
    ]
  },
  
  // 4. Menopausia
  {
    id: "course_menopausia_001",
    slug: "menopausia-con-claridad",
    title: "Menopausia con claridad: entiende lo que cambia y conoce tus opciones",
    subtitle: "Una guía médica, comprensible y sin juicios para reconocer síntomas, preparar tu consulta y tomar decisiones informadas.",
    shortDescription: "¿Tu cuerpo cambió y no sabes qué puede relacionarse con la menopausia? Aprende a reconocer las etapas y síntomas, conoce las opciones disponibles y prepara las preguntas necesarias para decidir junto con tu profesional de salud.",
    description: "La transición a la menopausia puede sentirse distinta en cada mujer. Algunas notan cambios en el ciclo, bochornos o sudoraciones; otras consultan por sueño, estado de ánimo, concentración, sexualidad o molestias vaginales y urinarias. Entre consejos familiares, videos y mensajes contradictorios sobre hormonas, es fácil sentirse desorientada.\n\nEsta masterclass te ofrece un mapa. Entenderás qué significan perimenopausia, menopausia y posmenopausia; cómo registrar lo que estás viviendo; qué evaluaciones pueden ser útiles según el caso; y cuáles son las categorías principales de tratamiento hormonal, no hormonal y de estilo de vida. También revisarás mitos frecuentes y crearás una agenda personal para tu próxima consulta.\n\nLa clase no te dirá qué tratamiento tomar. Te ayudará a comprender las decisiones que deben individualizarse según síntomas, historia clínica, riesgos, objetivos y preferencias.",
    salesPromise: "Pasarás de vivir cambios difíciles de explicar a tener un mapa personal y una conversación clínica mucho más clara.",
    recognitionPoints: [
      "“¿Estoy exagerando o de verdad algo cambió?”",
      "“No quiero tomar hormonas a ciegas, pero tampoco quiero seguir así”",
      "“No sé qué estudios pedir ni con qué especialista empezar”",
      "“Me da pena hablar de lo que pasa en mi vida íntima”"
    ],
    beforeState: [
      "Sentirse confundida o minimizada",
      "Información contradictoria sobre hormonas",
      "Desconocer qué síntomas se relacionan",
      "Miedo a tratamientos o a no tratarse"
    ],
    afterState: [
      "Mapa personal de la transición y síntomas",
      "Comprensión de opciones de tratamiento",
      "Seguridad al conversar con tu médico",
      "Agenda de consulta estructurada"
    ],
    learningOutcomes: [
      "Diferenciar transición menopáusica, menopausia y posmenopausia.",
      "Reconocer síntomas vasomotores, del sueño, del ánimo y genitourinarios sin atribuir automáticamente todo a las hormonas.",
      "Entender qué suele evaluarse con historia clínica y cuándo los estudios dependen del contexto.",
      "Conocer las diferencias generales entre terapia hormonal sistémica, terapia vaginal/local y opciones no hormonales.",
      "Identificar por qué la indicación, formulación, vía, edad, tiempo desde la menopausia, antecedentes y preferencias importan.",
      "Preparar una consulta que incluya bienestar sexual, salud ósea, cardiovascular y metabólica."
    ],
    notFor: [
      "Quien busca una receta o confirmación de que una terapia específica es segura en su caso.",
      "Sangrado vaginal inesperado, dolor torácico, falta de aire, síntomas neurológicos u otras señales importantes requieren valoración inmediata."
    ],
    includedFeatures: [
      "Mapa de síntomas y agenda personal para consulta",
      "Línea del tiempo personal de ciclos y cambios",
      "Comparador educativo de categorías de tratamiento",
      "Checklist de antecedentes y preguntas",
      "Guía de vocabulario para conversar sobre salud vaginal y sexual"
    ],
    targetAudience: [
      "Mujeres aproximadamente entre los 38 y 60 años que han notado cambios corporales, emocionales o sexuales.",
      "Quienes recibieron información contradictoria sobre hormonas y quieren prepararse antes de una consulta.",
      "Cualquier pareja o familiar que desea acompañar mejor la transición."
    ],
    faqs: [
      { question: "Todavía menstruo; esto no es para mí", answer: "La transición puede empezar antes de la última menstruación; la clase explica cómo reconocerla sin autodiagnosticarse." },
      { question: "No quiero hormonas", answer: "El objetivo no es convencer de usarlas, sino conocer opciones y formular una decisión informada." },
      { question: "Tengo miedo de que las hormonas causen cáncer", answer: "La clase explica por qué el balance de beneficios y riesgos no es idéntico para todas y debe revisarse individualmente." },
      { question: "Mi médico ya me pidió estudios", answer: "El programa ayuda a entender qué preguntas hacer sobre el propósito de cada evaluación." }
    ],
    ctaLabel: "Quiero entender esta etapa y preparar mis decisiones",
    level: "Introductorio",
    durationMinutes: 145,
    lessonCount: 8,
    category: "salud_mujer",
    categoryLabel: "Salud de la Mujer",
    modules: [
      {
        id: "mod_meno_1", courseId: "course_menopausia_001", title: "Módulo 1. Ponle nombre a la etapa", description: "Etapas y mapa de síntomas", position: 1, status: "published",
        lessons: [
          { id: "les_men_1_1", slug: "peri-meno-posmenopausia", title: "1. Perimenopausia, menopausia y posmenopausia", summary: "Qué significa cada etapa, por qué la experiencia varía y cómo evitar pensar que “todo es hormonal”.", durationSeconds: 900, position: 1 },
          { id: "les_men_1_2", slug: "tu-mapa-de-sintomas", title: "2. Tu mapa de síntomas", summary: "Ciclo, bochornos, sudoración, sueño, ánimo, memoria percibida, sexualidad, vagina y vías urinarias; intensidad, frecuencia e impacto.", durationSeconds: 1080, position: 2 }
        ]
      },
      {
        id: "mod_meno_2", courseId: "course_menopausia_001", title: "Módulo 2. Evalúa sin pedir estudios al azar", description: "La historia clínica y los estudios necesarios", position: 2, status: "published",
        lessons: [
          { id: "les_men_2_1", slug: "informacion-buena-consulta", title: "3. Qué información necesita una buena consulta", summary: "Historia menstrual, medicamentos, anticoncepción, antecedentes, objetivos, banderas rojas y otras causas posibles.", durationSeconds: 1080, position: 1 },
          { id: "les_men_2_2", slug: "estudios-chequeos-prevencion", title: "4. Estudios, chequeos y prevención", summary: "Qué depende de edad, síntomas y antecedentes; salud ósea, cardiometabólica y tamizajes habituales sin vender un “panel hormonal universal”.", durationSeconds: 1200, position: 2 }
        ]
      },
      {
        id: "mod_meno_3", courseId: "course_menopausia_001", title: "Módulo 3. Conoce el menú de opciones", description: "Terapia hormonal, no hormonal y estilo de vida", position: 3, status: "published",
        lessons: [
          { id: "les_men_3_1", slug: "terapia-hormonal-beneficios", title: "5. Terapia hormonal: beneficios, límites y decisiones", summary: "Terapia sistémica frente a local, papel del progestágeno cuando corresponde, vías de administración, contraindicaciones y conversación individual de beneficios y riesgos.", durationSeconds: 1200, position: 1 },
          { id: "les_men_3_2", slug: "opciones-no-hormonales", title: "6. Opciones no hormonales y estilo de vida", summary: "Tratamientos prescritos no hormonales, sueño, actividad, tabaco, alcohol, ambiente y estrategias para síntomas; calidad variable de evidencia en productos y suplementos.", durationSeconds: 1080, position: 2 }
        ]
      },
      {
        id: "mod_meno_4", courseId: "course_menopausia_001", title: "Módulo 4. Convierte información en una decisión", description: "Intimidad y agenda de consulta", position: 4, status: "published",
        lessons: [
          { id: "les_men_4_1", slug: "intimidad-piso-pelvico", title: "7. Intimidad, piso pélvico y síntomas urinarios sin vergüenza", summary: "Vocabulario para hablarlo, categorías de apoyo y cuándo solicitar evaluación.", durationSeconds: 1080, position: 1 },
          { id: "les_men_4_2", slug: "tu-agenda-personal", title: "8. Tu agenda personal para la consulta", summary: "Priorizar tres síntomas, expresar preferencias y temores, preguntar alternativas, seguimiento, beneficios esperados y riesgos relevantes.", durationSeconds: 1080, position: 2 }
        ]
      }
    ]
  },
  
  // 5. Estrés y tensión
  {
    id: "course_estres_002",
    slug: "estres-y-tension-muscular",
    title: "Estrés y tensión muscular: entiende tu cuerpo y crea una rutina de alivio seguro",
    subtitle: "Aprende por qué la tensión puede repetirse, qué herramientas puedes probar y cuándo necesitas valoración profesional.",
    shortDescription: "Si cuello, hombros o mandíbula vuelven a tensarse después de un día difícil, aprende a identificar detonantes y practica una rutina breve de respiración, relajación y movimiento gradual con límites de seguridad claros.",
    description: "La tensión muscular no significa que estés fallando al relajarte. El estrés, la carga física, la inmovilidad, el sueño, las emociones y las expectativas pueden interactuar y aumentar la sensación de rigidez o dolor. Tampoco toda molestia debe atribuirse al estrés.\n\nEn esta masterclass aprenderás un modelo sencillo para entender esa interacción. Harás una auditoría de tu jornada, practicarás respiración lenta y relajación muscular progresiva, revisarás principios de movimiento y pausas, y construirás una rutina mínima para los días reales, no solo para los días perfectos. También aprenderás qué síntomas requieren valoración médica o fisioterapéutica.",
    salesPromise: "Dejarás de atacar cada episodio de forma aislada y construirás un plan breve para observar, regular y decidir el siguiente paso.",
    recognitionPoints: [
      "“Me soban y al rato vuelve”",
      "“Sé que es estrés, pero no sé cómo bajarlo del cuerpo”",
      "“¿Es contractura o me estoy lastimando?”",
      "“No tengo una hora diaria para hacer ejercicio”"
    ],
    beforeState: [
      "Perseguir alivios aislados",
      "Tensión recurrente y frustración",
      "Culparse por “no saber relajarse”",
      "Dudas sobre si hay una lesión"
    ],
    afterState: [
      "Rutina segura y viable de autocuidado",
      "Reconocer patrones y detonantes",
      "Habilidad para aplicar respiración y pausas",
      "Saber cuándo buscar valoración profesional"
    ],
    learningOutcomes: [
      "Comprender la respuesta de estrés y su relación posible con respiración, atención, tono y percepción del dolor.",
      "Reconocer que estrés no equivale a causa única ni a dolor imaginario.",
      "Registrar detonantes, actividades, descanso e impacto funcional.",
      "Practicar respiración lenta y relajación muscular progresiva de forma básica.",
      "Integrar movimiento gradual y pausas sin obsesionarse con una postura perfecta.",
      "Identificar señales que quedan fuera del autocuidado."
    ],
    notFor: [
      "Personas con dolor posterior a trauma importante, fiebre, dolor torácico, debilidad progresiva o pérdida de sensibilidad.",
      "Síntomas nuevos o intensos requieren valoración médica urgente."
    ],
    includedFeatures: [
      "Plan adaptable de 5, 10 y 20 minutos",
      "Audio guiado de respiración y relajación",
      "Registro corporal de siete días",
      "Tarjetas de pausas y Semáforo de autocuidado"
    ],
    targetAudience: [
      "Adultos con tensión recurrente en cuello, mandíbula, hombros o espalda asociada a jornadas largas.",
      "Personas con estrés percibido, poca movilidad o hábitos posturales rígidos.",
      "Quienes buscan autocuidado seguro para prevenir molestias sin tener una lesión grave."
    ],
    faqs: [
      { question: "Yo necesito masaje, no teoría", answer: "La clase incluye práctica y ayuda a entender por qué una herramienta aislada puede dar alivio temporal sin resolver todos los factores." },
      { question: "No tengo tiempo", answer: "Se diseñan versiones de 5, 10 y 20 minutos." },
      { question: "Si es estrés, entonces está en mi mente", answer: "No: la experiencia es real; el curso explica la interacción entre sistemas sin reducir todo a psicología." },
      { question: "Tengo una lesión diagnosticada", answer: "Debe seguirse el plan del equipo tratante; la masterclass no lo sustituye." }
    ],
    ctaLabel: "Quiero crear mi rutina de autocuidado",
    level: "Introductorio",
    durationMinutes: 120,
    lessonCount: 6,
    category: "bienestar",
    categoryLabel: "Bienestar & Fisiología",
    modules: [
      {
        id: "mod_estres_1", courseId: "course_estres_002", title: "Módulo 1. Entiende el ciclo", description: "Respuesta al estrés y mitos del dolor", position: 1, status: "published",
        lessons: [
          { id: "les_est_1_1", slug: "por-que-cuerpo-se-prepara", title: "1. Por qué el cuerpo se prepara para responder", summary: "Respuesta de estrés, respiración, atención, protección y tensión explicadas en lenguaje cotidiano; variabilidad individual.", durationSeconds: 1200, position: 1 },
          { id: "les_est_1_2", slug: "dolor-tension-postura", title: "2. Dolor, tensión y postura: qué sí sabemos", summary: "Modelo multifactorial, carga, sedentarismo, sueño, miedo y mitos del “nudo”; no atribuir todos los síntomas a estrés.", durationSeconds: 1200, position: 2 }
        ]
      },
      {
        id: "mod_estres_2", courseId: "course_estres_002", title: "Módulo 2. Aprende herramientas seguras", description: "Respiración, relajación y pausas", position: 2, status: "published",
        lessons: [
          { id: "les_est_2_1", slug: "respiracion-relajacion-guiadas", title: "3. Respiración y relajación muscular guiadas", summary: "Práctica acompañada, expectativas realistas, adaptación y circunstancias en las que detenerse.", durationSeconds: 1200, position: 1 },
          { id: "les_est_2_2", slug: "movimiento-gradual-pausas", title: "4. Movimiento gradual y pausas posibles", summary: "Variar posiciones, dosificar carga, microdescansos y exploración de movimiento cómodo; sin correcciones universales ni manipulaciones agresivas.", durationSeconds: 1200, position: 2 }
        ]
      },
      {
        id: "mod_estres_3", courseId: "course_estres_002", title: "Módulo 3. Construye tu protocolo personal", description: "Auditoría de hábitos y planes adaptables", position: 3, status: "published",
        lessons: [
          { id: "les_est_3_1", slug: "detecta-patron-7-dias", title: "5. Detecta tu patrón de siete días", summary: "Zona, intensidad, actividad, horas de pantalla, estrés, sueño, respuesta a herramientas e impacto en la función.", durationSeconds: 1200, position: 1 },
          { id: "les_est_3_2", slug: "plan-5-10-20", title: "6. Tu plan de 5, 10 y 20 minutos", summary: "Menú de acciones, plan para recaídas, cuándo acudir a medicina, fisioterapia o salud mental y señales de alarma.", durationSeconds: 1200, position: 2 }
        ]
      }
    ]
  },
  
  // 6. Hormonal masculino
  {
    id: "course_hormonal_003",
    slug: "salud-hormonal-masculina",
    title: "Salud hormonal masculina: entiende la testosterona antes de tomar decisiones",
    subtitle: "Síntomas, estudios, fertilidad, tratamiento y seguimiento explicados con claridad y sin promesas de “optimización”.",
    shortDescription: "¿Cansancio, baja libido o un resultado aislado significan testosterona baja? Aprende qué se necesita para una evaluación adecuada, qué otros factores deben revisarse y qué preguntas hacer antes de considerar suplementos o tratamiento.",
    description: "La testosterona se ha convertido en una cifra cargada de expectativas. En redes se presenta como explicación para cansancio, aumento de peso, falta de motivación, cambios sexuales o pérdida de fuerza. En realidad, esos síntomas pueden tener varias causas y un resultado aislado no cuenta toda la historia.\n\nEsta masterclass explica, paso a paso, cómo funciona el eje hormonal masculino, cómo se evalúan síntomas y análisis, por qué una prueba suele necesitar condiciones adecuadas y confirmación, y cómo se investigan posibles causas. También revisarás qué puede y qué no puede esperarse de la terapia, su relación con fertilidad y los controles de seguridad que exige. El objetivo no es decirte si necesitas testosterona, sino darte criterio para no decidir a partir de miedo, vergüenza o marketing.",
    salesPromise: "Pasarás de preguntar “¿cómo subo mi testosterona?” a saber “¿qué necesito evaluar y qué decisión tiene sentido para mi caso?”.",
    recognitionPoints: [
      "“¿Mi cansancio significa que tengo baja testosterona?”",
      "“El laboratorio la marcó baja; ¿con eso basta?”",
      "“¿La terapia me ayudará o me puede afectar?”",
      "“Quiero preguntar por libido y erecciones sin sentirme juzgado”"
    ],
    beforeState: [
      "Vincular masculinidad y síntomas a una cifra",
      "Confusión sobre suplementos y terapias",
      "Vergüenza para hablar de sexualidad",
      "Interpretar laboratorios fuera de contexto"
    ],
    afterState: [
      "Expediente organizado de una página",
      "Comprensión de evaluación y riesgos",
      "Criterio para proteger la fertilidad",
      "Preguntas maduras para tu médico"
    ],
    learningOutcomes: [
      "Comprender en términos básicos cómo se produce, regula y transporta la testosterona.",
      "Reconocer cuáles síntomas pueden justificar evaluación y por qué no son exclusivos de deficiencia hormonal.",
      "Entender la importancia del horario, método, repetición e interpretación profesional de los análisis.",
      "Diferenciar de forma básica causas testiculares y causas del eje hipotálamo–hipófisis.",
      "Reconocer la influencia de sueño, apnea, enfermedades, composición corporal, medicamentos y consumo de andrógenos.",
      "Conocer beneficios potenciales, límites, contraindicaciones, fertilidad y seguimiento de la terapia prescrita."
    ],
    notFor: [
      "Quien busca una receta, una dosis, un ciclo anabólico o validación para automedicarse.",
      "La terapia no debe iniciarse a partir de esta clase y requiere evaluación profesional completa."
    ],
    includedFeatures: [
      "Expediente hormonal de una página",
      "Mapa de síntomas y otras causas posibles",
      "Línea del tiempo de estudios",
      "Checklist de fertilidad y uso de andrógenos",
      "Guía de preguntas sobre beneficios, riesgos y monitoreo"
    ],
    targetAudience: [
      "Hombres con fatiga, cambios en deseo sexual, erecciones, fuerza, ánimo o composición corporal.",
      "Quienes tienen un resultado de laboratorio de testosterona que no comprenden del todo.",
      "Hombres considerando suplementos, boosters o terapia hormonal por recomendaciones de internet."
    ],
    faqs: [
      { question: "Solo quiero saber si mi nivel es bueno", answer: "Un número se interpreta con síntomas, condiciones de la toma, método y confirmación." },
      { question: "Me da pena hablar de esto", answer: "La clase ofrece vocabulario clínico, respetuoso y privado para preparar la conversación." },
      { question: "Ya me recomendaron testosterona", answer: "El contenido permite preguntar cuál es el diagnóstico, cómo se confirmó, qué causa se investigó y cómo se vigilará." },
      { question: "No quiero que me digan que todo es por mi peso", answer: "La evaluación es multifactorial y debe evitar juicios; el peso no reemplaza la historia ni el estudio clínico." }
    ],
    ctaLabel: "Quiero entender mis síntomas y mis estudios",
    level: "Introductorio",
    durationMinutes: 135,
    lessonCount: 7,
    category: "salud_hombre",
    categoryLabel: "Salud del Hombre",
    modules: [
      {
        id: "mod_hormonal_1", courseId: "course_hormonal_003", title: "Módulo 1. Quita la cifra del pedestal", description: "Bases de la testosterona y síntomas reales", position: 1, status: "published",
        lessons: [
          { id: "les_hor_1_1", slug: "que-hace-testosterona", title: "1. Qué hace la testosterona y qué no explica por sí sola", summary: "Funciones, variabilidad y relación no lineal con identidad, rendimiento y bienestar.", durationSeconds: 1080, position: 1 },
          { id: "les_hor_1_2", slug: "sintomas-reales-compartidos", title: "2. Síntomas reales, síntomas compartidos", summary: "Función sexual, energía, composición corporal, ánimo y fuerza; causas alternativas y mapa inicial.", durationSeconds: 1140, position: 2 }
        ]
      },
      {
        id: "mod_hormonal_2", courseId: "course_hormonal_003", title: "Módulo 2. Entiende una evaluación correcta", description: "Laboratorios e investigación de causas", position: 2, status: "published",
        lessons: [
          { id: "les_hor_2_1", slug: "como-se-mide-sin-sacar-conclusiones", title: "3. Cómo se mide sin sacar conclusiones rápidas", summary: "Momento de la toma, enfermedad intercurrente, ensayo de laboratorio, testosterona total y libre cuando corresponde, confirmación y rangos contextualizados.", durationSeconds: 1140, position: 1 },
          { id: "les_hor_2_2", slug: "si-esta-baja-falta-preguntar", title: "4. Si está baja, todavía falta preguntar por qué", summary: "Historia, medicamentos, consumo de andrógenos, sueño y apnea, obesidad, enfermedades crónicas, LH/FSH y distinción básica de origen.", durationSeconds: 1200, position: 2 }
        ]
      },
      {
        id: "mod_hormonal_3", courseId: "course_hormonal_003", title: "Módulo 3. Decide con beneficios y riesgos", description: "Hábitos y terapia hormonal", position: 3, status: "published",
        lessons: [
          { id: "les_hor_3_1", slug: "habitos-metabolismo-expectativas", title: "5. Hábitos, salud metabólica y expectativas realistas", summary: "Sueño, movimiento, masa muscular, nutrición, alcohol y peso sin prometer “elevar naturalmente” una cifra específica.", durationSeconds: 1200, position: 1 },
          { id: "les_hor_3_2", slug: "terapia-testosterona-indicaciones", title: "6. Terapia de testosterona: indicaciones, límites y seguridad", summary: "Qué requiere el diagnóstico, posibles beneficios, contraindicaciones, efectos adversos, fertilidad, hematocrito, próstata y seguimiento individual.", durationSeconds: 1200, position: 2 }
        ]
      },
      {
        id: "mod_hormonal_4", courseId: "course_hormonal_003", title: "Módulo 4. Prepara tu conversación", description: "Organiza tu caso", position: 4, status: "published",
        lessons: [
          { id: "les_hor_4_1", slug: "expediente-hormonal-pagina", title: "7. Tu expediente hormonal en una página", summary: "Línea del tiempo de síntomas, estudios previos, medicamentos y suplementos, objetivos reproductivos y preguntas para consulta.", durationSeconds: 1140, position: 1 }
        ]
      }
    ]
  },
  
  // 7. SOP
  {
    id: "course_sop_004",
    slug: "sindrome-ovario-poliquistico",
    title: "SOP con claridad: entiende tu diagnóstico y elige tu siguiente paso",
    subtitle: "Ciclos, síntomas, estudios y tratamientos explicados sin estigma, dietas extremas ni falsas promesas de curación.",
    shortDescription: "Tener “quistes” o folículos en una ecografía no siempre significa SOP. Aprende cómo se construye el diagnóstico, qué otros aspectos conviene evaluar y cómo se eligen opciones según tus síntomas, tu salud y tus objetivos.",
    description: "El síndrome de ovario poliquístico no se presenta igual en todas. Algunas mujeres consultan por ciclos irregulares; otras por acné, vello, caída de cabello, metabolismo o fertilidad. Por eso, una ecografía, un síntoma o una cifra aislada no deberían convertirse por sí solos en una etiqueta para toda la vida.\n\nEn esta masterclass entenderás cómo se construye el diagnóstico y por qué deben considerarse otras causas. Aprenderás qué relación pueden tener los andrógenos y la insulina, qué aspectos metabólicos y emocionales conviene revisar, y cómo se eligen intervenciones de estilo de vida y tratamientos médicos según la prioridad de cada persona. Terminarás con un mapa de síntomas, estudios y preguntas para coordinar mejor tu atención.\n\nNo encontrarás una dieta obligatoria ni una “cura en 30 días”. Encontrarás criterio, estructura y un siguiente paso más claro.",
    salesPromise: "Dejarás de ver el SOP como una etiqueta confusa y empezarás a entenderlo como un mapa de decisiones que debe adaptarse a ti.",
    recognitionPoints: [
      "“Me dijeron que tengo quistes; ¿eso significa que tengo SOP?”",
      "“¿Voy a poder embarazarme?”",
      "“¿Todo se debe a mi peso?”",
      "“Cada persona me recomienda una dieta o suplemento diferente”",
      "“¿Por qué me dieron anticonceptivos o metformina y qué se espera de ellos?”"
    ],
    beforeState: [
      "Culpa o estigma por peso, vello o fertilidad",
      "Diagnósticos contradictorios",
      "Probar dietas extremas o suplementos dudosos",
      "Miedo a infertilidad o diabetes"
    ],
    afterState: [
      "Mapa personal de SOP y prioridades",
      "Entender criterios clínicos reales",
      "Elegir tratamientos basados en objetivos",
      "Coordinar atención multidisciplinaria"
    ],
    learningOutcomes: [
      "Comprender qué es y qué no es el SOP.",
      "Conocer los componentes de los criterios diagnósticos y la necesidad de excluir otras causas.",
      "Entender por qué en adolescentes el proceso diagnóstico requiere consideraciones especiales.",
      "Reconocer la diversidad de presentaciones y evitar equiparar SOP con peso o infertilidad.",
      "Comprender la relación posible entre andrógenos, ovulación, insulina y riesgo metabólico.",
      "Conocer categorías de tratamiento según objetivos, sin automedicarse.",
      "Preparar un seguimiento coordinado y respetuoso."
    ],
    notFor: [
      "Quien busca autodiagnóstico, una dieta universal o indicaciones para suspender medicamentos.",
      "Sangrado intenso, dolor importante, embarazo o síntomas agudos necesitan orientación clínica directa."
    ],
    includedFeatures: [
      "Mapa personal de SOP y Rastreador de ciclos",
      "Hoja de criterios y exclusión de causas",
      "Mapa de objetivos: ciclo, piel, metabolismo, anticoncepción y fertilidad",
      "Comparador educativo de tratamientos",
      "Guía para coordinar especialistas"
    ],
    targetAudience: [
      "Adolescentes mayores o mujeres adultas con diagnóstico reciente o sospecha de SOP.",
      "Personas con inquietud por ciclos irregulares, acné, vello, dificultad reproductiva o riesgo metabólico.",
      "Quienes recibieron un diagnóstico basado únicamente en un ultrasonido y desean confirmarlo con bases sólidas."
    ],
    faqs: [
      { question: "Ya me hicieron un ultrasonido", answer: "Es información útil en algunos contextos, pero el diagnóstico completo no debe reducirse a una imagen." },
      { question: "No tengo sobrepeso", answer: "El SOP puede aparecer en distintos cuerpos; el curso no usa el peso como requisito ni explicación total." },
      { question: "Solo quiero una dieta", answer: "La alimentación puede formar parte del plan, pero no existe una pauta única que diagnostique o cure el síndrome." },
      { question: "Me preocupa no poder embarazarme", answer: "El SOP puede afectar la ovulación, pero no equivale automáticamente a infertilidad; la clase ayuda a preparar una evaluación." },
      { question: "Ya tomo medicamentos", answer: "No se deben suspender ni modificar; el programa ayuda a entender qué objetivo y seguimiento conviene discutir." }
    ],
    ctaLabel: "Quiero entender mi diagnóstico y mis opciones",
    level: "Introductorio",
    durationMinutes: 150,
    lessonCount: 8,
    category: "salud_mujer",
    categoryLabel: "Salud de la Mujer",
    modules: [
      {
        id: "mod_sop_1", courseId: "course_sop_004", title: "Módulo 1. Confirma qué significa el diagnóstico", description: "Qué es el SOP y cómo se evalúa", position: 1, status: "published",
        lessons: [
          { id: "les_sop_1_1", slug: "que-es-y-que-no-es-sop", title: "1. Qué es y qué no es el SOP", summary: "El nombre, la diversidad de presentaciones y por qué “quistes” puede confundir.", durationSeconds: 1080, position: 1 },
          { id: "les_sop_1_2", slug: "como-se-construye-diagnostico", title: "2. Cómo se construye el diagnóstico", summary: "Ciclos/ovulación, hiperandrogenismo clínico o bioquímico y morfología ovárica cuando corresponde; exclusión de otras causas y consideraciones en adolescentes.", durationSeconds: 1080, position: 2 }
        ]
      },
      {
        id: "mod_sop_2", courseId: "course_sop_004", title: "Módulo 2. Entiende lo que ocurre en tu cuerpo", description: "Andrógenos, insulina y riesgo metabólico", position: 2, status: "published",
        lessons: [
          { id: "les_sop_2_1", slug: "ciclo-ovulacion-androgenos", title: "3. Ciclo, ovulación y andrógenos", summary: "Cómo se relacionan con menstruación, acné, vello y cabello sin asumir que todas tendrán lo mismo.", durationSeconds: 1140, position: 1 },
          { id: "les_sop_2_2", slug: "insulina-salud-metabolica", title: "4. Insulina y salud metabólica sin culpa", summary: "Qué relación puede existir, por qué no define a todas, evaluación de glucosa, lípidos, presión y sueño según el caso.", durationSeconds: 1140, position: 2 }
        ]
      },
      {
        id: "mod_sop_3", courseId: "course_sop_004", title: "Módulo 3. Elige opciones según tu objetivo", description: "Tratamientos, alimentación y fertilidad", position: 3, status: "published",
        lessons: [
          { id: "les_sop_3_1", slug: "estilo-vida-sin-dietas", title: "5. Estilo de vida sin dietas castigo", summary: "Alimentación sostenible, actividad, sueño, prevención de ganancia de peso y beneficios incluso cuando la báscula no cambia; derivación a nutrición calificada.", durationSeconds: 1140, position: 1 },
          { id: "les_sop_3_2", slug: "opciones-medicas-ciclo", title: "6. Opciones médicas para ciclo, piel y metabolismo", summary: "Categorías como anticonceptivos combinados, sensibilizadores a la insulina y antiandrógenos, con propósito, límites, precauciones y necesidad de prescripción individual.", durationSeconds: 1140, position: 2 },
          { id: "les_sop_3_3", slug: "fertilidad-planes-reproductivos", title: "7. Fertilidad y planes reproductivos", summary: "Qué preguntar si busca embarazo ahora, después o nunca; anticoncepción, preconcepción y derivación oportuna.", durationSeconds: 1140, position: 3 }
        ]
      },
      {
        id: "mod_sop_4", courseId: "course_sop_004", title: "Módulo 4. Diseña seguimiento de largo plazo", description: "Tu mapa personal de atención", position: 4, status: "published",
        lessons: [
          { id: "les_sop_4_1", slug: "mapa-personal-sop", title: "8. Tu mapa personal de SOP", summary: "Criterios que te explicaron, prioridades, bienestar emocional, estudios, profesionales involucrados, metas de seguimiento y preguntas para la siguiente consulta.", durationSeconds: 1140, position: 1 }
        ]
      }
    ]
  }
];

// Helper to keep preserved values from the original array
const preservedFields = ['shop', 'shopifyProductGid', 'shopifyVariantGid', 'sku', 'price', 'compareAtPrice', 'currency', 'status', 'accessType', 'accessDurationDays', 'launchDate', 'launchStatus', 'previewEnabled', 'instructor', 'image', 'imageFallback', 'imageAlt', 'imageWidth', 'imageHeight', 'imagePosition', 'imagePriority', 'coverImage', 'coverAlt', 'imageId', 'disclaimerShort', 'disclaimerLong'];

// Read the original db.ts
let dbContent = fs.readFileSync('lib/academy/db.ts', 'utf-8');

// We need to parse or find the INITIAL_COURSES array and inject ours. 
// A safer way is to just replace the whole array by string replacing from `export const INITIAL_COURSES: Course[] = [` to `];`
// Wait, I can just evaluate the old one if it was commonJS, but it's TS.
// Let's use regex to find the block.

const startIndex = dbContent.indexOf('export const INITIAL_COURSES: Course[] = [');
if (startIndex === -1) {
  console.error("Could not find INITIAL_COURSES array");
  process.exit(1);
}

// Find the ending `];` of INITIAL_COURSES
// Since there might be other `];` we search until the line `  private audits: AccessAudit[] = [];` or similar, 
// wait, the block ends with `  }\n];` or similar. Let's find `];` that is at the root level before `export class AcademyDatabase`.
const endClassIndex = dbContent.indexOf('export class AcademyDatabase');
let endIndex = dbContent.lastIndexOf('];', endClassIndex);

if (endIndex === -1 || endIndex < startIndex) {
  console.error("Could not find the end of INITIAL_COURSES array");
  process.exit(1);
}

// We don't want to lose preserved fields. Let's merge them manually in TS using a trick or just output the JS string as TS.
// Wait, if I just replace it completely, I need to make sure I include the correct image paths and instructor object!
// Let's look at the original db.ts to get the instructor and image paths.
