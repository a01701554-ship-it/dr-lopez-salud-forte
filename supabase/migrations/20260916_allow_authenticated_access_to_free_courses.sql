-- Authenticated students may access published free courses without a purchase.
-- Paid courses still require a current entitlement and all materials remain private.

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
        FROM public.masterclasses m
        WHERE m.id = public.lessons.masterclass_id
          AND m.status = 'published'
          AND m.access_type = 'free'
          AND auth.uid() IS NOT NULL
      )
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

DROP POLICY IF EXISTS "Authorized users can view lesson attachments" ON public.lesson_attachments;
CREATE POLICY "Authorized users can view lesson attachments"
  ON public.lesson_attachments
  FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.masterclasses m ON m.id = l.masterclass_id
      WHERE l.id = public.lesson_attachments.lesson_id
        AND (
          l.is_preview = TRUE
          OR (m.status = 'published' AND m.access_type = 'free')
          OR EXISTS (
            SELECT 1
            FROM public.entitlements e
            WHERE e.user_id = auth.uid()
              AND e.masterclass_id = l.masterclass_id
              AND e.status = 'active'
              AND e.revoked_at IS NULL
              AND (e.expires_at IS NULL OR e.expires_at > NOW())
          )
          OR EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
          )
        )
    )
  );

DROP POLICY IF EXISTS "Authorized users can download academy materials" ON storage.objects;
CREATE POLICY "Authorized users can download academy materials"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'academy-materials'
    AND EXISTS (
      SELECT 1
      FROM public.lesson_attachments a
      JOIN public.lessons l ON l.id = a.lesson_id
      JOIN public.masterclasses m ON m.id = l.masterclass_id
      WHERE a.storage_path = storage.objects.name
        AND a.status = 'published'
        AND (
          l.is_preview = TRUE
          OR (m.status = 'published' AND m.access_type = 'free')
          OR EXISTS (
            SELECT 1
            FROM public.entitlements e
            WHERE e.user_id = auth.uid()
              AND e.masterclass_id = l.masterclass_id
              AND e.status = 'active'
              AND e.revoked_at IS NULL
              AND (e.expires_at IS NULL OR e.expires_at > NOW())
          )
          OR EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
          )
        )
    )
  );

DROP POLICY IF EXISTS "Users can insert own progress" ON public.lesson_progress;
CREATE POLICY "Users can insert own progress"
  ON public.lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.masterclasses m ON m.id = l.masterclass_id
      WHERE l.id = public.lesson_progress.lesson_id
        AND (
          l.is_preview = TRUE
          OR (m.status = 'published' AND m.access_type = 'free')
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

DROP POLICY IF EXISTS "Users can update own progress" ON public.lesson_progress;
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
      JOIN public.masterclasses m ON m.id = l.masterclass_id
      WHERE l.id = public.lesson_progress.lesson_id
        AND (
          l.is_preview = TRUE
          OR (m.status = 'published' AND m.access_type = 'free')
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
