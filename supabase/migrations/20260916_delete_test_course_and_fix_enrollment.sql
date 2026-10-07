-- Migration: Delete test course and allow free masterclass enrollment
-- Date: 2026-09-16

BEGIN;

-- 1. Permisos y política RLS para que alumnos autenticados se inscriban en masterclasses gratuitas
GRANT SELECT, INSERT ON public.entitlements TO authenticated;

DROP POLICY IF EXISTS "Users can enroll in free masterclasses" ON public.entitlements;
CREATE POLICY "Users can enroll in free masterclasses"
  ON public.entitlements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'active'
    AND EXISTS (
      SELECT 1
      FROM public.masterclasses m
      WHERE m.id = public.entitlements.masterclass_id
        AND m.status = 'published'
        AND m.access_type = 'free'
    )
  );

-- 2. Asegurar que los alumnos puedan ver sus propias inscripciones activas
DROP POLICY IF EXISTS "Users can view own entitlements" ON public.entitlements;
CREATE POLICY "Users can view own entitlements"
  ON public.entitlements
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('ADMIN', 'INSTRUCTOR')
  );

-- 3. Eliminación permanente y en cascada del curso técnico de prueba "Prueba de Cloudflare Stream"
DELETE FROM public.lesson_progress
WHERE masterclass_id IN (
  SELECT id FROM public.masterclasses
  WHERE slug = 'prueba-cloudflare-stream'
     OR title ILIKE '%prueba%cloudflare%'
);

DELETE FROM public.entitlements
WHERE masterclass_id IN (
  SELECT id FROM public.masterclasses
  WHERE slug = 'prueba-cloudflare-stream'
     OR title ILIKE '%prueba%cloudflare%'
);

DELETE FROM public.lessons
WHERE masterclass_id IN (
  SELECT id FROM public.masterclasses
  WHERE slug = 'prueba-cloudflare-stream'
     OR title ILIKE '%prueba%cloudflare%'
);

DELETE FROM public.modules
WHERE masterclass_id IN (
  SELECT id FROM public.masterclasses
  WHERE slug = 'prueba-cloudflare-stream'
     OR title ILIKE '%prueba%cloudflare%'
);

DELETE FROM public.masterclasses
WHERE slug = 'prueba-cloudflare-stream'
   OR title ILIKE '%prueba%cloudflare%';

-- 4. Asegurar que las masterclasses gratuitas oficiales tengan status = 'published' y access_type = 'free'
UPDATE public.masterclasses
SET access_type = 'free', status = 'published'
WHERE slug IN (
  'monitorea-tu-glucosa-con-confianza',
  'presion-arterial-en-casa',
  'presion-arterial-en-casa-midela-bien-y-entiende-tu-registro'
);

COMMIT;
