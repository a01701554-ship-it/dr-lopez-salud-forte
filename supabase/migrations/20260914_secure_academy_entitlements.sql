-- Enforce revocation and expiration consistently at the database boundary.
-- The application server performs the same checks before issuing a Stream URL.

BEGIN;

DROP POLICY IF EXISTS "Public can view preview or enrolled lessons" ON public.lessons;

CREATE POLICY "Public can view preview or enrolled lessons"
  ON public.lessons
  FOR SELECT
  TO public
  USING (
    status = 'published'
    AND (
      is_preview = TRUE
      OR EXISTS (
        SELECT 1
        FROM public.entitlements e
        WHERE e.masterclass_id = public.lessons.masterclass_id
          AND e.user_id = auth.uid()
          AND e.status = 'active'
          AND e.revoked_at IS NULL
          AND (e.expires_at IS NULL OR e.expires_at > NOW())
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.lesson_progress;

CREATE POLICY "Users can insert own progress"
  ON public.lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.lessons l
      WHERE l.id = public.lesson_progress.lesson_id
        AND (
          l.is_preview = TRUE
          OR EXISTS (
            SELECT 1
            FROM public.entitlements e
            WHERE e.user_id = auth.uid()
              AND e.masterclass_id = l.masterclass_id
              AND e.status = 'active'
              AND e.revoked_at IS NULL
              AND (e.expires_at IS NULL OR e.expires_at > NOW())
          )
        )
    )
  );

CREATE POLICY "Users can update own progress"
  ON public.lesson_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.lessons l
      WHERE l.id = public.lesson_progress.lesson_id
        AND (
          l.is_preview = TRUE
          OR EXISTS (
            SELECT 1
            FROM public.entitlements e
            WHERE e.user_id = auth.uid()
              AND e.masterclass_id = l.masterclass_id
              AND e.status = 'active'
              AND e.revoked_at IS NULL
              AND (e.expires_at IS NULL OR e.expires_at > NOW())
          )
        )
    )
  );

COMMIT;
