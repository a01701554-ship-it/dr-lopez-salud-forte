-- Reestructura editorial de la masterclass de glucosa para alinear cada lección
-- con los videos reales de la entrevista. Conserva IDs, adjuntos, progreso y
-- cualquier video que ya haya sido asignado desde el panel administrativo.
BEGIN;

UPDATE public.masterclasses
SET
  subtitle = 'Una conversación cercana con una paciente para comprender la diabetes tipo 2, interpretar tus mediciones con contexto y prepararte para medir con mayor confianza.',
  short_description = 'Acompaña al Dr. Mauricio Galindo en una conversación honesta con una paciente que comparte aprendizajes, retos y consejos sobre vivir con diabetes tipo 2. Cierra con una demostración práctica de medición de glucosa paso a paso.',
  full_description = 'Medir la glucosa es más que obtener un número. En esta masterclass, el Dr. Mauricio Galindo conversa con una paciente sobre su experiencia viviendo con diabetes tipo 2: los retos del día a día, los aprendizajes que le han dado mayor confianza y los consejos que pueden ayudar a otras personas a sentirse acompañadas.

A lo largo de la clase conocerás el propósito del monitoreo, aprenderás a observar cada lectura con contexto y organizarás tus próximos pasos. La experiencia se complementará con una demostración práctica, clara y pausada para revisar cómo medir la glucosa de principio a fin. El contenido es educativo y no sustituye una valoración médica ni modifica tu tratamiento.',
  lesson_count = 6,
  updated_at = NOW()
WHERE slug = 'monitorea-tu-glucosa-con-confianza';

UPDATE public.modules mo
SET
  title = CASE mo.position
    WHEN 1 THEN 'Módulo 1. Comprender para medir con confianza'
    WHEN 2 THEN 'Módulo 2. La experiencia detrás de cada lectura'
    WHEN 3 THEN 'Módulo 3. De la comprensión a la práctica'
  END,
  description = CASE mo.position
    WHEN 1 THEN 'Presentación, propósito y ruta de aprendizaje'
    WHEN 2 THEN 'Una conversación honesta sobre vivir con diabetes tipo 2'
    WHEN 3 THEN 'Ideas clave, próximos pasos y demostración guiada'
  END,
  status = 'published',
  updated_at = NOW()
FROM public.masterclasses mc
WHERE mo.masterclass_id = mc.id
  AND mc.slug = 'monitorea-tu-glucosa-con-confianza'
  AND mo.position IN (1, 2, 3);

-- Las primeras cuatro filas conservan su módulo y su slug para no romper
-- enlaces, adjuntos descargables ni progreso existente.
UPDATE public.lessons l
SET
  title = CASE l.slug
    WHEN 'glucosa-es-un-dato' THEN '1. Monitorea tu glucosa con confianza'
    WHEN 'conoce-tu-equipo' THEN '2. Bienvenida: comprender antes de interpretar'
    WHEN 'prepara-manos-tiras' THEN '3. Tu ruta de aprendizaje: medir, registrar y conversar'
    WHEN 'obtener-muestra-menos-miedo' THEN '4. Vivir con diabetes tipo 2: aprendizajes desde la experiencia'
  END,
  summary = CASE l.slug
    WHEN 'glucosa-es-un-dato' THEN 'Una apertura cercana para comprender por qué medir bien importa y cómo esta masterclass puede ayudarte.'
    WHEN 'conoce-tu-equipo' THEN 'El punto de partida para acercarte a tus mediciones con claridad, contexto y menos ansiedad.'
    WHEN 'prepara-manos-tiras' THEN 'Qué aprenderás y cómo aprovechar cada conversación, recurso y demostración de la masterclass.'
    WHEN 'obtener-muestra-menos-miedo' THEN 'Consejos, retos cotidianos y aprendizajes compartidos por una paciente desde su experiencia personal.'
  END,
  description = CASE l.slug
    WHEN 'glucosa-es-un-dato' THEN 'Una apertura cercana para comprender por qué medir bien importa y cómo esta masterclass puede ayudarte.'
    WHEN 'conoce-tu-equipo' THEN 'El punto de partida para acercarte a tus mediciones con claridad, contexto y menos ansiedad.'
    WHEN 'prepara-manos-tiras' THEN 'Qué aprenderás y cómo aprovechar cada conversación, recurso y demostración de la masterclass.'
    WHEN 'obtener-muestra-menos-miedo' THEN 'Consejos, retos cotidianos y aprendizajes compartidos por una paciente desde su experiencia personal.'
  END,
  is_preview = (l.slug = 'glucosa-es-un-dato'),
  status = 'published',
  updated_at = NOW()
FROM public.masterclasses mc
WHERE l.masterclass_id = mc.id
  AND mc.slug = 'monitorea-tu-glucosa-con-confianza'
  AND l.slug IN (
    'glucosa-es-un-dato',
    'conoce-tu-equipo',
    'prepara-manos-tiras',
    'obtener-muestra-menos-miedo'
  );

-- Reubica la recapitulación y reserva la sexta fila para el video práctico que
-- el doctor grabará después. No toca las columnas del proveedor de video.
UPDATE public.lessons l
SET
  module_id = mo.id,
  title = CASE l.slug
    WHEN 'medicion-completa' THEN '5. Lo esencial: decisiones informadas y próximos pasos'
    WHEN 'me-salio-raro' THEN '6. Demostración práctica: medición de glucosa paso a paso'
  END,
  summary = CASE l.slug
    WHEN 'medicion-completa' THEN 'Recapitulación de los aprendizajes centrales y una guía clara para continuar con mayor confianza.'
    WHEN 'me-salio-raro' THEN 'Preparación del equipo, obtención de la muestra, lectura del resultado y registro del contexto.'
  END,
  description = CASE l.slug
    WHEN 'medicion-completa' THEN 'Recapitulación de los aprendizajes centrales y una guía clara para continuar con mayor confianza.'
    WHEN 'me-salio-raro' THEN 'Preparación del equipo, obtención de la muestra, lectura del resultado y registro del contexto.'
  END,
  position = CASE l.slug WHEN 'medicion-completa' THEN 1 ELSE 2 END,
  is_preview = FALSE,
  status = CASE l.slug WHEN 'medicion-completa' THEN 'published' ELSE 'draft' END,
  updated_at = NOW()
FROM public.masterclasses mc
JOIN public.modules mo
  ON mo.masterclass_id = mc.id
 AND mo.position = 3
WHERE l.masterclass_id = mc.id
  AND mc.slug = 'monitorea-tu-glucosa-con-confianza'
  AND l.slug IN ('medicion-completa', 'me-salio-raro');

-- Retira del catálogo visible las tres lecciones editoriales antiguas sin
-- borrarlas; así pueden recuperarse si se necesitan posteriormente.
UPDATE public.lessons l
SET status = 'draft', is_preview = FALSE, updated_at = NOW()
FROM public.masterclasses mc
WHERE l.masterclass_id = mc.id
  AND mc.slug = 'monitorea-tu-glucosa-con-confianza'
  AND l.slug IN (
    'glucometro-y-monitor-continuo',
    'el-registro-que-ayuda',
    'que-hacer-despues-de-medir'
  );

COMMIT;
