-- Private downloadable materials for academy lessons.
-- Files are stored in the private `academy-materials` bucket and are only
-- readable by staff, preview users, or students with a current entitlement.

BEGIN;

CREATE TABLE IF NOT EXISTS public.lesson_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 180),
  storage_path TEXT NOT NULL UNIQUE CHECK (char_length(trim(storage_path)) BETWEEN 1 AND 500),
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  file_size_bytes BIGINT CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  position INTEGER NOT NULL DEFAULT 1 CHECK (position > 0),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_attachments_lesson_id
  ON public.lesson_attachments(lesson_id, position);

ALTER TABLE public.lesson_attachments ENABLE ROW LEVEL SECURITY;

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
      WHERE l.id = public.lesson_attachments.lesson_id
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
          OR EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
          )
        )
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'academy-materials',
  'academy-materials',
  FALSE,
  52428800,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

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
      WHERE a.storage_path = storage.objects.name
        AND a.status = 'published'
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
          OR EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
          )
        )
    )
  );

COMMIT;
