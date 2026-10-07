-- Migration: 20260924_manage_lesson_attachments_rls.sql
-- Enables full CRUD management of lesson attachments for staff (ADMIN, INSTRUCTOR)
-- while preserving strict read-only access for enrolled students.

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

-- 1. Insert policy for instructors / admins
DROP POLICY IF EXISTS "Staff can insert lesson attachments" ON public.lesson_attachments;
CREATE POLICY "Staff can insert lesson attachments"
  ON public.lesson_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
    )
  );

-- 2. Update policy for instructors / admins
DROP POLICY IF EXISTS "Staff can update lesson attachments" ON public.lesson_attachments;
CREATE POLICY "Staff can update lesson attachments"
  ON public.lesson_attachments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
    )
  );

-- 3. Delete policy for instructors / admins
DROP POLICY IF EXISTS "Staff can delete lesson attachments" ON public.lesson_attachments;
CREATE POLICY "Staff can delete lesson attachments"
  ON public.lesson_attachments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
    )
  );

-- 4. Storage bucket setup
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

-- Storage INSERT for staff
DROP POLICY IF EXISTS "Staff can upload academy materials" ON storage.objects;
CREATE POLICY "Staff can upload academy materials"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'academy-materials'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
    )
  );

-- Storage UPDATE for staff
DROP POLICY IF EXISTS "Staff can update academy materials" ON storage.objects;
CREATE POLICY "Staff can update academy materials"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'academy-materials'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
    )
  );

-- Storage DELETE for staff
DROP POLICY IF EXISTS "Staff can delete academy materials" ON storage.objects;
CREATE POLICY "Staff can delete academy materials"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'academy-materials'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
    )
  );

COMMIT;
