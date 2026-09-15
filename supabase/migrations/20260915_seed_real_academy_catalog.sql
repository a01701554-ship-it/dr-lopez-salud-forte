-- Generated from lib/academy/db.ts. Do not edit course rows by hand here.
BEGIN;

ALTER TABLE public.masterclasses
  DROP CONSTRAINT IF EXISTS masterclasses_access_type_check;
ALTER TABLE public.masterclasses
  ADD CONSTRAINT masterclasses_access_type_check CHECK (access_type IN ('free', 'paid', 'lifetime', 'limited_days'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_modules_masterclass_position_unique
  ON public.modules(masterclass_id, position);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_masterclass_slug_unique
  ON public.lessons(masterclass_id, slug);

-- Monitorea tu glucosa con confianza
INSERT INTO public.masterclasses (
  slug, title, subtitle, short_description, full_description, category,
  access_type, price, compare_at_price, currency, cover_image,
  duration_minutes, lesson_count, status, published_at, updated_at
) VALUES (
  'monitorea-tu-glucosa-con-confianza', 'Monitorea tu glucosa con confianza', 'Aprende a usar tu glucómetro, evitar errores comunes y convertir tus lecturas en información útil para tu consulta.',
  '¿Tus lecturas cambian y no sabes si mediste bien? Aprende paso a paso a preparar el equipo, obtener una medición más confiable, registrar el contexto y reconocer cuándo una cifra necesita confirmación o atención profesional.', 'Medirte la glucosa no debería sentirse como adivinar. En esta masterclass aprenderás, desde cero, cómo funciona un glucómetro, cómo preparar tus manos y tus materiales, cómo obtener la muestra y cuáles son los errores que pueden alterar una lectura. También conocerás la diferencia básica entre un glucómetro y un monitor continuo, y aprenderás a registrar horarios, alimentos, actividad, síntomas y medicamentos para que los números tengan contexto.

No recibirás metas universales ni cambios de tratamiento. Obtendrás algo más seguro y útil: un método sencillo para medir mejor, identificar patrones sin sacar conclusiones precipitadas y llevar información ordenada a tu consulta.', 'bienestar',
  'free', 0,
  0, 'MXN',
  '/images/masterclasses/official/glucosa-2026.webp', 45,
  9, 'draft', NULL, NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  short_description = EXCLUDED.short_description, full_description = EXCLUDED.full_description,
  category = EXCLUDED.category, access_type = EXCLUDED.access_type,
  price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price,
  currency = EXCLUDED.currency, cover_image = EXCLUDED.cover_image,
  duration_minutes = EXCLUDED.duration_minutes, lesson_count = EXCLUDED.lesson_count,
  status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 1. Antes del pinchazo: entiende tu herramienta', 'Qué mide el glucómetro y cómo prepararse', 1, 'published', NOW()
FROM public.masterclasses WHERE slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'glucosa-es-un-dato', '1. Tu glucosa es un dato, no una calificación',
  'Qué mide el glucómetro, qué no puede concluir y por qué el contexto cambia la interpretación.', 'Qué mide el glucómetro, qué no puede concluir y por qué el contexto cambia la interpretación.',
  1, 300,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'conoce-tu-equipo', '2. Conoce tu equipo sin tecnicismos',
  'Medidor, tira, lanceta, dispositivo de punción, solución de control y manual del fabricante.', 'Medidor, tira, lanceta, dispositivo de punción, solución de control y manual del fabricante.',
  2, 300,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'prepara-manos-tiras', '3. Prepara manos, tiras y superficie',
  'Higiene, secado, caducidad, almacenamiento y lista previa para evitar repeticiones.', 'Higiene, secado, caducidad, almacenamiento y lista previa para evitar repeticiones.',
  3, 300,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 2. Mide paso a paso y reduce errores', 'La técnica correcta y cómo evitar resultados alterados', 2, 'published', NOW()
FROM public.masterclasses WHERE slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'obtener-muestra-menos-miedo', '4. Cómo obtener la muestra con menos miedo',
  'Colocación, lateral del dedo, rotación de sitios y manejo seguro del material punzocortante conforme a indicaciones locales.', 'Colocación, lateral del dedo, rotación de sitios y manejo seguro del material punzocortante conforme a indicaciones locales.',
  1, 300,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'medicion-completa', '5. La medición completa, de principio a fin',
  'Demostración pausada, carga correcta de la tira y lectura del resultado.', 'Demostración pausada, carga correcta de la tira y lectura del resultado.',
  2, 300,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'me-salio-raro', '6. “Me salió raro”: qué revisar antes de concluir',
  'Manos contaminadas, poca muestra, tiras dañadas, temperatura, mensajes del aparato y cuándo repetir conforme al manual o plan clínico.', 'Manos contaminadas, poca muestra, tiras dañadas, temperatura, mensajes del aparato y cuándo repetir conforme al manual o plan clínico.',
  3, 300,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 3. Convierte números en una conversación útil', 'Registros, monitores continuos y la consulta', 3, 'published', NOW()
FROM public.masterclasses WHERE slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'glucometro-y-monitor-continuo', '7. Glucómetro y monitor continuo: no son lo mismo',
  'Diferencias básicas, retraso entre compartimentos y confirmación de lecturas inesperadas según dispositivo y plan médico.', 'Diferencias básicas, retraso entre compartimentos y confirmación de lecturas inesperadas según dispositivo y plan médico.',
  1, 300,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'el-registro-que-ayuda', '8. El registro que sí ayuda',
  'Fecha, hora, relación con alimentos, actividad, síntomas, medicamentos y eventos fuera de rutina.', 'Fecha, hora, relación con alimentos, actividad, síntomas, medicamentos y eventos fuera de rutina.',
  2, 300,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'que-hacer-despues-de-medir', '9. Qué hacer después de medir',
  'Patrones frente a cifras aisladas, plan personal de acción, síntomas de alarma y preparación de cuatro preguntas para la consulta.', 'Patrones frente a cifras aisladas, plan personal de acción, síntomas de alarma y preparación de cuatro preguntas para la consulta.',
  3, 300,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'monitorea-tu-glucosa-con-confianza'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

-- Presión arterial en casa: mídela bien y entiende tu registro
INSERT INTO public.masterclasses (
  slug, title, subtitle, short_description, full_description, category,
  access_type, price, compare_at_price, currency, cover_image,
  duration_minutes, lesson_count, status, published_at, updated_at
) VALUES (
  'presion-arterial-midela-bien-en-casa', 'Presión arterial en casa: mídela bien y entiende tu registro', 'Elige el equipo correcto, evita errores de postura y lleva a tu consulta lecturas que realmente sean útiles.',
  'Una medición puede cambiar por el brazalete, la postura o la preparación. Aprende un protocolo sencillo para medir tu presión en casa, registrar resultados y saber cuándo repetir la lectura o solicitar orientación médica.', 'Tener un baumanómetro automático no garantiza una buena medición. El tamaño del brazalete, cinco minutos de reposo, la posición del brazo, la espalda, los pies e incluso hablar durante la toma pueden cambiar el resultado.

En esta masterclass aprenderás a seleccionar un equipo adecuado, preparar tu cuerpo, colocarte correctamente y seguir una rutina reproducible. También entenderás qué representan los dos números, por qué una lectura es solo una fotografía del momento y cómo organizar varias mediciones para conversar con tu médico con mayor claridad. Incluye un registro semanal y una guía visual de postura.', 'bienestar',
  'free', 0,
  0, 'MXN',
  '/images/masterclasses/official/presion-arterial-2026.webp', 40,
  10, 'draft', NULL, NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  short_description = EXCLUDED.short_description, full_description = EXCLUDED.full_description,
  category = EXCLUDED.category, access_type = EXCLUDED.access_type,
  price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price,
  currency = EXCLUDED.currency, cover_image = EXCLUDED.cover_image,
  duration_minutes = EXCLUDED.duration_minutes, lesson_count = EXCLUDED.lesson_count,
  status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 1. El equipo correcto', 'Números y dispositivos', 1, 'published', NOW()
FROM public.masterclasses WHERE slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'que-significan-los-dos-numeros', '1. Qué significan los dos números',
  'Sístole, diástole y por qué una toma no cuenta toda la historia.', 'Sístole, diástole y por qué una toma no cuenta toda la historia.',
  1, 240,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'brazo-muneca-reloj', '2. Brazo, muñeca o reloj: qué equipo buscar',
  'Preferencia por monitor automático validado de brazo y límites de otros dispositivos.', 'Preferencia por monitor automático validado de brazo y límites de otros dispositivos.',
  2, 240,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'brazalete-importa', '3. El brazalete sí importa',
  'Medición del brazo, ajuste y errores por talla inadecuada.', 'Medición del brazo, ajuste y errores por talla inadecuada.',
  3, 240,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 2. La técnica que hace confiable el registro', 'Preparación del cuerpo', 2, 'published', NOW()
FROM public.masterclasses WHERE slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, '30-minutos-previos', '4. Los 30 minutos previos',
  'Café, tabaco, ejercicio, vejiga y otras condiciones que se deben considerar.', 'Café, tabaco, ejercicio, vejiga y otras condiciones que se deben considerar.',
  1, 240,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'cinco-minutos-reposo', '5. Cinco minutos que cambian la toma',
  'Reposo sin conversación, teléfono ni distracciones.', 'Reposo sin conversación, teléfono ni distracciones.',
  2, 240,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'postura-completa', '6. Postura completa, paso a paso',
  'Espalda apoyada, pies en el piso, piernas descruzadas, brazo descubierto y apoyado a nivel del corazón.', 'Espalda apoyada, pies en el piso, piernas descruzadas, brazo descubierto y apoyado a nivel del corazón.',
  3, 240,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'coloca-el-brazalete', '7. Coloca el brazalete y toma la lectura',
  'Demostración, inmovilidad y errores comunes.', 'Demostración, inmovilidad y errores comunes.',
  4, 240,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 3. Del dato a la consulta', 'Lecturas y repeticiones', 3, 'published', NOW()
FROM public.masterclasses WHERE slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'por-que-varias-lecturas', '8. Por qué se toman varias lecturas',
  'Repetición, intervalo y horario según el plan indicado; evitar “perseguir” el número indefinidamente.', 'Repetición, intervalo y horario según el plan indicado; evitar “perseguir” el número indefinidamente.',
  1, 240,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'tu-registro-semanal', '9. Tu registro semanal',
  'Cómo anotar hora, lecturas, síntomas y circunstancias relevantes; equipo con memoria.', 'Cómo anotar hora, lecturas, síntomas y circunstancias relevantes; equipo con memoria.',
  2, 240,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'lecturas-inesperadas', '10. Lecturas inesperadas y señales de alarma',
  'Repetir correctamente, valorar síntomas, contactar al equipo de salud y reconocer una emergencia sin suspender o duplicar medicamentos por cuenta propia.', 'Repetir correctamente, valorar síntomas, contactar al equipo de salud y reconocer una emergencia sin suspender o duplicar medicamentos por cuenta propia.',
  3, 240,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'presion-arterial-midela-bien-en-casa'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

-- Dormir mejor: un plan práctico para recuperar energía y claridad
INSERT INTO public.masterclasses (
  slug, title, subtitle, short_description, full_description, category,
  access_type, price, compare_at_price, currency, cover_image,
  duration_minutes, lesson_count, status, published_at, updated_at
) VALUES (
  'dormir-mejor-energia-enfoque-y-rendimiento', 'Dormir mejor: un plan práctico para recuperar energía y claridad', 'Entiende qué está interfiriendo con tu descanso y diseña una rutina realista para tus noches y tus mañanas.',
  'Si llegas cansado a la cama pero no logras descansar, esta masterclass te ayuda a identificar qué está interfiriendo. Organiza luz, horarios, cafeína, actividad, ambiente y rutina mediante un plan de 14 días adaptable a tu vida.', 'Dormir mejor no empieza comprando un suplemento ni persiguiendo una noche perfecta. Empieza por comprender cómo se coordinan la presión de sueño y el reloj interno, y por observar qué señales recibe tu cuerpo durante el día y la noche.

En esta masterclass traduciremos la ciencia del sueño a decisiones cotidianas: a qué hora exponerte a luz, cómo ordenar horarios, cuándo revisar la cafeína, cómo usar el ejercicio, qué cambiar en tu habitación y cómo crear una transición nocturna aunque tengas una agenda exigente. Construirás un experimento personal de 14 días y aprenderás a reconocer señales de insomnio persistente, apnea u otros problemas que necesitan valoración.', 'bienestar',
  'lifetime', 0,
  0, 'MXN',
  '/images/masterclasses/official/dormir-mejor-2026.webp', 90,
  12, 'coming_soon', NULL, NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  short_description = EXCLUDED.short_description, full_description = EXCLUDED.full_description,
  category = EXCLUDED.category, access_type = EXCLUDED.access_type,
  price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price,
  currency = EXCLUDED.currency, cover_image = EXCLUDED.cover_image,
  duration_minutes = EXCLUDED.duration_minutes, lesson_count = EXCLUDED.lesson_count,
  status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 1. Entiende tu sueño', 'La base de tu descanso', 1, 'published', NOW()
FROM public.masterclasses WHERE slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'dormir-mas-no-es-mejor', '1. Dormir más no siempre es dormir mejor',
  'Duración, calidad, continuidad, regularidad y cómo definir un objetivo realista.', 'Duración, calidad, continuidad, regularidad y cómo definir un objetivo realista.',
  1, 360,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'tu-reloj-interno', '2. Tu reloj interno',
  'Ritmo circadiano, luz y horarios explicados sin jerga.', 'Ritmo circadiano, luz y horarios explicados sin jerga.',
  2, 420,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'presion-de-sueno', '3. La presión de sueño',
  'Cómo se acumula, efecto de las siestas y por qué estar agotado no siempre significa poder dormir.', 'Cómo se acumula, efecto de las siestas y por qué estar agotado no siempre significa poder dormir.',
  3, 420,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 2. Diseña el día que prepara la noche', 'Mañanas y tardes estratégicas', 2, 'published', NOW()
FROM public.masterclasses WHERE slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'primera-hora-de-manana', '4. La primera hora de tu mañana',
  'Horario de despertar, luz natural y activación gradual.', 'Horario de despertar, luz natural y activación gradual.',
  1, 480,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'cafeina-cantidad-sensibilidad', '5. Cafeína: cantidad, horario y sensibilidad',
  'Identificar fuentes y diseñar un límite personal prudente.', 'Identificar fuentes y diseñar un límite personal prudente.',
  2, 420,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'actividad-comidas-alcohol', '6. Actividad física, comidas y alcohol',
  'Cómo observar su relación con el descanso sin reglas absolutas ni promesas.', 'Cómo observar su relación con el descanso sin reglas absolutas ni promesas.',
  3, 420,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 3. Construye una noche viable', 'Rutinas para relajar', 3, 'published', NOW()
FROM public.masterclasses WHERE slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'ultima-hora-despierto', '7. La última hora despierto',
  'Crear una secuencia de cierre para trabajo, pendientes, contenido estimulante y preocupación.', 'Crear una secuencia de cierre para trabajo, pendientes, contenido estimulante y preocupación.',
  1, 480,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'pantallas-sin-magia', '8. Pantallas sin pensamiento mágico',
  'Luz, contenido, tiempo y estrategias graduales cuando “dejar el celular” no es realista.', 'Luz, contenido, tiempo y estrategias graduales cuando “dejar el celular” no es realista.',
  2, 480,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'tu-dormitorio-dentro-posible', '9. Tu dormitorio dentro de lo posible',
  'Oscuridad, ruido, temperatura, cama y soluciones de bajo costo.', 'Oscuridad, ruido, temperatura, cama y soluciones de bajo costo.',
  3, 480,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 4. Mide, ajusta y pide ayuda a tiempo', 'Plan de 14 días', 4, 'published', NOW()
FROM public.masterclasses WHERE slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'diario-14-dias', '10. Diario de sueño de 14 días',
  'Qué anotar, cómo interpretar tendencias y por qué no perseguir una puntuación perfecta.', 'Qué anotar, cómo interpretar tendencias y por qué no perseguir una puntuación perfecta.',
  1, 480,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 4
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'tu-plan-minimo', '11. Tu plan mínimo viable',
  'Elegir dos cambios, definir obstáculos y preparar alternativas para fines de semana o días difíciles.', 'Elegir dos cambios, definir obstáculos y preparar alternativas para fines de semana o días difíciles.',
  2, 480,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 4
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'cuando-habitos-no-son-suficientes', '12. Cuando los hábitos no son suficientes',
  'Insomnio crónico, apnea, piernas inquietas, medicamentos, salud mental, trabajo por turnos y cuándo hablar con un profesional; introducción a la terapia cognitivo-conductual para insomnio como tratamiento estructurado.', 'Insomnio crónico, apnea, piernas inquietas, medicamentos, salud mental, trabajo por turnos y cuándo hablar con un profesional; introducción a la terapia cognitivo-conductual para insomnio como tratamiento estructurado.',
  3, 480,
  'none', NULL, NULL, FALSE,
  NULL, 'published', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 4
WHERE mc.slug = 'dormir-mejor-energia-enfoque-y-rendimiento'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

-- Menopausia con claridad: entiende lo que cambia y conoce tus opciones
INSERT INTO public.masterclasses (
  slug, title, subtitle, short_description, full_description, category,
  access_type, price, compare_at_price, currency, cover_image,
  duration_minutes, lesson_count, status, published_at, updated_at
) VALUES (
  'menopausia-con-claridad', 'Menopausia con claridad: entiende lo que cambia y conoce tus opciones', 'Una guía médica, comprensible y sin juicios para reconocer síntomas, preparar tu consulta y tomar decisiones informadas.',
  '¿Tu cuerpo cambió y no sabes qué puede relacionarse con la menopausia? Aprende a reconocer las etapas y síntomas, conoce las opciones disponibles y prepara las preguntas necesarias para decidir junto con tu profesional de salud.', 'La transición a la menopausia puede sentirse distinta en cada mujer. Algunas notan cambios en el ciclo, bochornos o sudoraciones; otras consultan por sueño, estado de ánimo, concentración, sexualidad o molestias vaginales y urinarias. Entre consejos familiares, videos y mensajes contradictorios sobre hormonas, es fácil sentirse desorientada.

Esta masterclass te ofrece un mapa. Entenderás qué significan perimenopausia, menopausia y posmenopausia; cómo registrar lo que estás viviendo; qué evaluaciones pueden ser útiles según el caso; y cuáles son las categorías principales de tratamiento hormonal, no hormonal y de estilo de vida. También revisarás mitos frecuentes y crearás una agenda personal para tu próxima consulta.

La clase no te dirá qué tratamiento tomar. Te ayudará a comprender las decisiones que deben individualizarse según síntomas, historia clínica, riesgos, objetivos y preferencias.', 'salud_mujer',
  'lifetime', 990,
  1350, 'MXN',
  '/images/masterclasses/official/menopausia-con-claridad-2026.webp', 145,
  8, 'draft', NULL, NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  short_description = EXCLUDED.short_description, full_description = EXCLUDED.full_description,
  category = EXCLUDED.category, access_type = EXCLUDED.access_type,
  price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price,
  currency = EXCLUDED.currency, cover_image = EXCLUDED.cover_image,
  duration_minutes = EXCLUDED.duration_minutes, lesson_count = EXCLUDED.lesson_count,
  status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 1. Ponle nombre a la etapa', 'Reconociendo los cambios', 1, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'perimenopausia-menopausia-posmenopausia', '1. Perimenopausia, menopausia y posmenopausia',
  'Qué significa cada etapa, por qué la experiencia varía y cómo evitar pensar que “todo es hormonal”.', 'Qué significa cada etapa, por qué la experiencia varía y cómo evitar pensar que “todo es hormonal”.',
  1, 900,
  'none', NULL, NULL, TRUE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'tu-mapa-sintomas', '2. Tu mapa de síntomas',
  'Ciclo, bochornos, sudoración, sueño, ánimo, memoria percibida, sexualidad, vagina y vías urinarias; intensidad, frecuencia e impacto.', 'Ciclo, bochornos, sudoración, sueño, ánimo, memoria percibida, sexualidad, vagina y vías urinarias; intensidad, frecuencia e impacto.',
  2, 1080,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 2. Evalúa sin pedir estudios al azar', 'Evaluación clínica inteligente', 2, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'que-necesita-buena-consulta', '3. Qué información necesita una buena consulta',
  'Historia menstrual, medicamentos, anticoncepción, antecedentes, objetivos, banderas rojas y otras causas posibles.', 'Historia menstrual, medicamentos, anticoncepción, antecedentes, objetivos, banderas rojas y otras causas posibles.',
  1, 1080,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'estudios-chequeos', '4. Estudios, chequeos y prevención',
  'Qué depende de edad, síntomas y antecedentes; salud ósea, cardiometabólica y tamizajes habituales sin vender un “panel hormonal universal”.', 'Qué depende de edad, síntomas y antecedentes; salud ósea, cardiometabólica y tamizajes habituales sin vender un “panel hormonal universal”.',
  2, 1200,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 3. Conoce el menú de opciones', 'Hormonas y estilo de vida', 3, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'terapia-hormonal-limites', '5. Terapia hormonal: beneficios, límites y decisiones',
  'Terapia sistémica frente a local, papel del progestágeno cuando corresponde, vías de administración, contraindicaciones y conversación individual de beneficios y riesgos.', 'Terapia sistémica frente a local, papel del progestágeno cuando corresponde, vías de administración, contraindicaciones y conversación individual de beneficios y riesgos.',
  1, 1200,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'opciones-no-hormonales', '6. Opciones no hormonales y estilo de vida',
  'Tratamientos prescritos no hormonales, sueño, actividad, tabaco, alcohol, ambiente y estrategias para síntomas; calidad variable de evidencia en productos y suplementos.', 'Tratamientos prescritos no hormonales, sueño, actividad, tabaco, alcohol, ambiente y estrategias para síntomas; calidad variable de evidencia en productos y suplementos.',
  2, 1080,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 4. Convierte información en una decisión compartida', 'Organiza tu consulta', 4, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'intimidad-piso-pelvico', '7. Intimidad, piso pélvico y síntomas urinarios sin vergüenza',
  'Vocabulario para hablarlo, categorías de apoyo y cuándo solicitar evaluación.', 'Vocabulario para hablarlo, categorías de apoyo y cuándo solicitar evaluación.',
  1, 1080,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 4
WHERE mc.slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'agenda-consulta', '8. Tu agenda personal para la consulta',
  'Priorizar tres síntomas, expresar preferencias y temores, preguntar alternativas, seguimiento, beneficios esperados y riesgos relevantes.', 'Priorizar tres síntomas, expresar preferencias y temores, preguntar alternativas, seguimiento, beneficios esperados y riesgos relevantes.',
  2, 1080,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 4
WHERE mc.slug = 'menopausia-con-claridad'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

-- Estrés y tensión muscular: entiende tu cuerpo y crea una rutina de alivio seguro
INSERT INTO public.masterclasses (
  slug, title, subtitle, short_description, full_description, category,
  access_type, price, compare_at_price, currency, cover_image,
  duration_minutes, lesson_count, status, published_at, updated_at
) VALUES (
  'estres-y-tension-muscular', 'Estrés y tensión muscular: entiende tu cuerpo y crea una rutina de alivio seguro', 'Aprende por qué la tensión puede repetirse, qué herramientas puedes probar y cuándo necesitas valoración profesional.',
  'Si cuello, hombros o mandíbula vuelven a tensarse después de un día difícil, aprende a identificar detonantes y practica una rutina breve de respiración, relajación y movimiento gradual con límites de seguridad claros.', 'La tensión muscular no significa que estés fallando al relajarte. El estrés, la carga física, la inmovilidad, el sueño, las emociones y las expectativas pueden interactuar y aumentar la sensación de rigidez o dolor. Tampoco toda molestia debe atribuirse al estrés.

En esta masterclass aprenderás un modelo sencillo para entender esa interacción. Harás una auditoría de tu jornada, practicarás respiración lenta y relajación muscular progresiva, revisarás principios de movimiento y pausas, y construirás una rutina mínima para los días reales, no solo para los días perfectos. También aprenderás qué síntomas requieren valoración médica o fisioterapéutica.', 'bienestar',
  'lifetime', 850,
  1100, 'MXN',
  '/images/masterclasses/official/estres-tension-muscular-2026.webp', 120,
  6, 'draft', NULL, NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  short_description = EXCLUDED.short_description, full_description = EXCLUDED.full_description,
  category = EXCLUDED.category, access_type = EXCLUDED.access_type,
  price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price,
  currency = EXCLUDED.currency, cover_image = EXCLUDED.cover_image,
  duration_minutes = EXCLUDED.duration_minutes, lesson_count = EXCLUDED.lesson_count,
  status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 1. Entiende el ciclo', 'Bases del cuerpo', 1, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'estres-y-tension-muscular'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'cuerpo-se-prepara', '1. Por qué el cuerpo se prepara para responder',
  'Respuesta de estrés, respiración, atención, protección y tensión explicadas en lenguaje cotidiano; variabilidad individual.', 'Respuesta de estrés, respiración, atención, protección y tensión explicadas en lenguaje cotidiano; variabilidad individual.',
  1, 1200,
  'none', NULL, NULL, TRUE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'estres-y-tension-muscular'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'dolor-tension-postura', '2. Dolor, tensión y postura: qué sí sabemos',
  'Modelo multifactorial, carga, sedentarismo, sueño, miedo y mitos del “nudo”; no atribuir todos los síntomas a estrés.', 'Modelo multifactorial, carga, sedentarismo, sueño, miedo y mitos del “nudo”; no atribuir todos los síntomas a estrés.',
  2, 1200,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'estres-y-tension-muscular'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 2. Aprende herramientas seguras', 'Movimiento y respiración', 2, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'estres-y-tension-muscular'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'respiracion-relajacion', '3. Respiración y relajación muscular guiadas',
  'Práctica acompañada, expectativas realistas, adaptación y circunstancias en las que detenerse.', 'Práctica acompañada, expectativas realistas, adaptación y circunstancias en las que detenerse.',
  1, 1200,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'estres-y-tension-muscular'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'movimiento-gradual-pausas', '4. Movimiento gradual y pausas posibles',
  'Variar posiciones, dosificar carga, microdescansos y exploración de movimiento cómodo; sin correcciones universales ni manipulaciones agresivas.', 'Variar posiciones, dosificar carga, microdescansos y exploración de movimiento cómodo; sin correcciones universales ni manipulaciones agresivas.',
  2, 1200,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'estres-y-tension-muscular'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 3. Construye tu protocolo personal', 'Tu rutina diaria', 3, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'estres-y-tension-muscular'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'detecta-tu-patron', '5. Detecta tu patrón de siete días',
  'Zona, intensidad, actividad, horas de pantalla, estrés, sueño, respuesta a herramientas e impacto en la función.', 'Zona, intensidad, actividad, horas de pantalla, estrés, sueño, respuesta a herramientas e impacto en la función.',
  1, 1200,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'estres-y-tension-muscular'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'tu-plan', '6. Tu plan de 5, 10 y 20 minutos',
  'Menú de acciones, plan para recaídas, cuándo acudir a medicina, fisioterapia o salud mental y señales de alarma.', 'Menú de acciones, plan para recaídas, cuándo acudir a medicina, fisioterapia o salud mental y señales de alarma.',
  2, 1200,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'estres-y-tension-muscular'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

-- Salud hormonal masculina: entiende la testosterona antes de tomar decisiones
INSERT INTO public.masterclasses (
  slug, title, subtitle, short_description, full_description, category,
  access_type, price, compare_at_price, currency, cover_image,
  duration_minutes, lesson_count, status, published_at, updated_at
) VALUES (
  'salud-hormonal-masculina', 'Salud hormonal masculina: entiende la testosterona antes de tomar decisiones', 'Síntomas, estudios, fertilidad, tratamiento y seguimiento explicados con claridad y sin promesas de “optimización”.',
  '¿Cansancio, baja libido o un resultado aislado significan testosterona baja? Aprende qué se necesita para una evaluación adecuada, qué otros factores deben revisarse y qué preguntas hacer antes de considerar suplementos o tratamiento.', 'La testosterona se ha convertido en una cifra cargada de expectativas. En redes se presenta como explicación para cansancio, aumento de peso, falta de motivación, cambios sexuales o pérdida de fuerza. En realidad, esos síntomas pueden tener varias causas y un resultado aislado no cuenta toda la historia.

Esta masterclass explica, paso a paso, cómo funciona el eje hormonal masculino, cómo se evalúan síntomas y análisis, por qué una prueba suele necesitar condiciones adecuadas y confirmación, y cómo se investigan posibles causas. También revisarás qué puede y qué no puede esperarse de la terapia, su relación con fertilidad y los controles de seguridad que exige. El objetivo no es decirte si necesitas testosterona, sino darte criterio para no decidir a partir de miedo, vergüenza o marketing.', 'salud_hombre',
  'lifetime', 950,
  1250, 'MXN',
  '/images/masterclasses/official/salud-hormonal-masculina-2026.webp', 135,
  7, 'draft', NULL, NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  short_description = EXCLUDED.short_description, full_description = EXCLUDED.full_description,
  category = EXCLUDED.category, access_type = EXCLUDED.access_type,
  price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price,
  currency = EXCLUDED.currency, cover_image = EXCLUDED.cover_image,
  duration_minutes = EXCLUDED.duration_minutes, lesson_count = EXCLUDED.lesson_count,
  status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 1. Quita la cifra del pedestal', 'Bases y síntomas', 1, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'que-hace-testosterona', '1. Qué hace la testosterona y qué no explica por sí sola',
  'Funciones, variabilidad y relación no lineal con identidad, rendimiento y bienestar.', 'Funciones, variabilidad y relación no lineal con identidad, rendimiento y bienestar.',
  1, 1080,
  'none', NULL, NULL, TRUE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'sintomas-reales-compartidos', '2. Síntomas reales, síntomas compartidos',
  'Función sexual, energía, composición corporal, ánimo y fuerza; causas alternativas y mapa inicial.', 'Función sexual, energía, composición corporal, ánimo y fuerza; causas alternativas y mapa inicial.',
  2, 1140,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 2. Entiende una evaluación correcta', 'Laboratorios', 2, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'como-se-mide', '3. Cómo se mide sin sacar conclusiones rápidas',
  'Momento de la toma, enfermedad intercurrente, ensayo de laboratorio, testosterona total y libre cuando corresponde, confirmación y rangos contextualizados.', 'Momento de la toma, enfermedad intercurrente, ensayo de laboratorio, testosterona total y libre cuando corresponde, confirmación y rangos contextualizados.',
  1, 1140,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'por-que-baja', '4. Si está baja, todavía falta preguntar por qué',
  'Historia, medicamentos, consumo de andrógenos, sueño y apnea, obesidad, enfermedades crónicas, LH/FSH y distinción básica de origen.', 'Historia, medicamentos, consumo de andrógenos, sueño y apnea, obesidad, enfermedades crónicas, LH/FSH y distinción básica de origen.',
  2, 1200,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 3. Decide con beneficios y riesgos sobre la mesa', 'Opciones y seguridad', 3, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'habitos-salud', '5. Hábitos, salud metabólica y expectativas realistas',
  'Sueño, movimiento, masa muscular, nutrición, alcohol y peso sin prometer “elevar naturalmente” una cifra específica.', 'Sueño, movimiento, masa muscular, nutrición, alcohol y peso sin prometer “elevar naturalmente” una cifra específica.',
  1, 1200,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'terapia-limites', '6. Terapia de testosterona: indicaciones, límites y seguridad',
  'Qué requiere el diagnóstico, posibles beneficios, contraindicaciones, efectos adversos, fertilidad, hematocrito, próstata y seguimiento individual.', 'Qué requiere el diagnóstico, posibles beneficios, contraindicaciones, efectos adversos, fertilidad, hematocrito, próstata y seguimiento individual.',
  2, 1200,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 4. Prepara tu conversación', 'Expediente organizado', 4, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'expediente-en-una-pagina', '7. Tu expediente hormonal en una página',
  'Línea del tiempo de síntomas, estudios previos, medicamentos y suplementos, objetivos reproductivos y preguntas para consulta.', 'Línea del tiempo de síntomas, estudios previos, medicamentos y suplementos, objetivos reproductivos y preguntas para consulta.',
  1, 1140,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 4
WHERE mc.slug = 'salud-hormonal-masculina'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

-- SOP con claridad: entiende tu diagnóstico y elige tu siguiente paso
INSERT INTO public.masterclasses (
  slug, title, subtitle, short_description, full_description, category,
  access_type, price, compare_at_price, currency, cover_image,
  duration_minutes, lesson_count, status, published_at, updated_at
) VALUES (
  'sindrome-ovario-poliquistico', 'SOP con claridad: entiende tu diagnóstico y elige tu siguiente paso', 'Ciclos, síntomas, estudios y tratamientos explicados sin estigma, dietas extremas ni falsas promesas de curación.',
  'Tener “quistes” o folículos en una ecografía no siempre significa SOP. Aprende cómo se construye el diagnóstico, qué otros aspectos conviene evaluar y cómo se eligen opciones según tus síntomas, tu salud y tus objetivos.', 'El síndrome de ovario poliquístico no se presenta igual en todas. Algunas mujeres consultan por ciclos irregulares; otras por acné, vello, caída de cabello, metabolismo o fertilidad. Por eso, una ecografía, un síntoma o una cifra aislada no deberían convertirse por sí solos en una etiqueta para toda la vida.

En esta masterclass entenderás cómo se construye el diagnóstico y por qué deben considerarse otras causas. Aprenderás qué relación pueden tener los andrógenos y la insulina, qué aspectos metabólicos y emocionales conviene revisar, y cómo se eligen intervenciones de estilo de vida y tratamientos médicos según la prioridad de cada persona. Terminarás con un mapa de síntomas, estudios y preguntas para coordinar mejor tu atención.

No encontrarás una dieta obligatoria ni una “cura en 30 días”. Encontrarás criterio, estructura y un siguiente paso más claro.', 'salud_mujer',
  'lifetime', 990,
  1300, 'MXN',
  '/images/masterclasses/official/sop-con-claridad-2026.webp', 150,
  8, 'draft', NULL, NOW()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
  short_description = EXCLUDED.short_description, full_description = EXCLUDED.full_description,
  category = EXCLUDED.category, access_type = EXCLUDED.access_type,
  price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price,
  currency = EXCLUDED.currency, cover_image = EXCLUDED.cover_image,
  duration_minutes = EXCLUDED.duration_minutes, lesson_count = EXCLUDED.lesson_count,
  status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 1. Confirma qué significa el diagnóstico', 'SOP y criterios', 1, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'que-es-sop', '1. Qué es y qué no es el SOP',
  'El nombre, la diversidad de presentaciones y por qué “quistes” puede confundir.', 'El nombre, la diversidad de presentaciones y por qué “quistes” puede confundir.',
  1, 1080,
  'none', NULL, NULL, TRUE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'como-se-construye', '2. Cómo se construye el diagnóstico',
  'Ciclos/ovulación, hiperandrogenismo clínico o bioquímico y morfología ovárica cuando corresponde; exclusión de otras causas y consideraciones especiales en adolescentes.', 'Ciclos/ovulación, hiperandrogenismo clínico o bioquímico y morfología ovárica cuando corresponde; exclusión de otras causas y consideraciones especiales en adolescentes.',
  2, 1080,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 1
WHERE mc.slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 2. Entiende lo que ocurre en tu cuerpo', 'Hormonas y metabolismo', 2, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'ciclo-ovulacion', '3. Ciclo, ovulación y andrógenos',
  'Cómo se relacionan con menstruación, acné, vello y cabello sin asumir que todas tendrán lo mismo.', 'Cómo se relacionan con menstruación, acné, vello y cabello sin asumir que todas tendrán lo mismo.',
  1, 1140,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'insulina-salud-metabolica', '4. Insulina y salud metabólica sin culpa',
  'Qué relación puede existir, por qué no define a todas, evaluación de glucosa, lípidos, presión y sueño según el caso.', 'Qué relación puede existir, por qué no define a todas, evaluación de glucosa, lípidos, presión y sueño según el caso.',
  2, 1140,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 2
WHERE mc.slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 3. Elige opciones según tu objetivo', 'Tratamiento personalizado', 3, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'estilo-vida', '5. Estilo de vida sin dietas castigo',
  'Alimentación sostenible, actividad, sueño, prevención de ganancia de peso y beneficios incluso cuando la báscula no cambia; derivación a nutrición calificada.', 'Alimentación sostenible, actividad, sueño, prevención de ganancia de peso y beneficios incluso cuando la báscula no cambia; derivación a nutrición calificada.',
  1, 1140,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'opciones-medicas', '6. Opciones médicas para ciclo, piel y metabolismo',
  'Categorías como anticonceptivos combinados, sensibilizadores a la insulina y antiandrógenos, con propósito, límites, precauciones y necesidad de prescripción individual.', 'Categorías como anticonceptivos combinados, sensibilizadores a la insulina y antiandrógenos, con propósito, límites, precauciones y necesidad de prescripción individual.',
  2, 1140,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'fertilidad', '7. Fertilidad y planes reproductivos',
  'Qué preguntar si busca embarazo ahora, después o nunca; anticoncepción, preconcepción y derivación oportuna.', 'Qué preguntar si busca embarazo ahora, después o nunca; anticoncepción, preconcepción y derivación oportuna.',
  3, 1140,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 3
WHERE mc.slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.modules (masterclass_id, title, description, position, status, updated_at)
SELECT id, 'Módulo 4. Diseña seguimiento de largo plazo', 'Tu mapa personal', 4, 'draft', NOW()
FROM public.masterclasses WHERE slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, position) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status, updated_at = NOW();

INSERT INTO public.lessons (
  masterclass_id, module_id, slug, title, summary, description, position,
  duration_seconds, video_provider, video_asset_id, video_external_id,
  is_preview, transcript, status, updated_at
) SELECT
  mc.id, mo.id, 'tu-mapa-personal', '8. Tu mapa personal de SOP',
  'Criterios que te explicaron, prioridades, bienestar emocional, estudios, profesionales involucrados, metas de seguimiento y preguntas para la siguiente consulta.', 'Criterios que te explicaron, prioridades, bienestar emocional, estudios, profesionales involucrados, metas de seguimiento y preguntas para la siguiente consulta.',
  1, 1140,
  'none', NULL, NULL, FALSE,
  NULL, 'draft', NOW()
FROM public.masterclasses mc
JOIN public.modules mo ON mo.masterclass_id = mc.id AND mo.position = 4
WHERE mc.slug = 'sindrome-ovario-poliquistico'
ON CONFLICT (masterclass_id, slug) DO UPDATE SET
  module_id = EXCLUDED.module_id, title = EXCLUDED.title, summary = EXCLUDED.summary,
  description = EXCLUDED.description, position = EXCLUDED.position,
  duration_seconds = EXCLUDED.duration_seconds, is_preview = EXCLUDED.is_preview,
  transcript = EXCLUDED.transcript, status = EXCLUDED.status, updated_at = NOW();

COMMIT;
