BEGIN;

CREATE OR REPLACE FUNCTION public.is_academy_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND UPPER(COALESCE(role, '')) IN ('ADMIN', 'INSTRUCTOR')
  );
$$;

REVOKE ALL ON FUNCTION public.is_academy_manager() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_academy_manager() TO authenticated;

GRANT SELECT, UPDATE ON public.lessons TO authenticated;

DROP POLICY IF EXISTS "Academy managers can view all lessons" ON public.lessons;
CREATE POLICY "Academy managers can view all lessons"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (public.is_academy_manager());

DROP POLICY IF EXISTS "Academy managers can assign lesson videos" ON public.lessons;
CREATE POLICY "Academy managers can assign lesson videos"
  ON public.lessons
  FOR UPDATE
  TO authenticated
  USING (public.is_academy_manager())
  WITH CHECK (public.is_academy_manager());

COMMIT;
