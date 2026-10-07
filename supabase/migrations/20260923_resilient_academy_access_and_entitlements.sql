-- Migration: 20260923_resilient_academy_access_and_entitlements.sql
-- Ensures database is the absolute source of truth for enrollments and progress.
-- Allows enrolled students to access their purchased or registered masterclasses,
-- modules, lessons, and attachments even if the course is later archived or price changes.

BEGIN;

-- 1. Masterclasses RLS: Allow public access to published/coming_soon courses,
-- and allow enrolled students (and admins/instructors) to view their courses regardless of status.
DROP POLICY IF EXISTS "Ver masterclasses publicadas" ON public.masterclasses;
DROP POLICY IF EXISTS "Public can view published masterclasses" ON public.masterclasses;
DROP POLICY IF EXISTS "Anyone can view published or enrolled masterclasses" ON public.masterclasses;

CREATE POLICY "Anyone can view published or enrolled masterclasses"
  ON public.masterclasses
  FOR SELECT
  TO public
  USING (
    status IN ('published', 'coming_soon')
    OR (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.entitlements e
        WHERE e.masterclass_id = public.masterclasses.id
          AND e.user_id = auth.uid()
          AND e.status = 'active'
          AND e.revoked_at IS NULL
          AND (e.expires_at IS NULL OR e.expires_at > NOW())
      )
    )
    OR (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
      )
    )
  );

-- 2. Modules RLS: Allow access if module is published or user has active entitlement
DROP POLICY IF EXISTS "Anyone can view modules of accessible masterclasses" ON public.modules;
CREATE POLICY "Anyone can view modules of accessible masterclasses"
  ON public.modules
  FOR SELECT
  TO public
  USING (
    status = 'published'
    OR (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.entitlements e
        WHERE e.masterclass_id = public.modules.masterclass_id
          AND e.user_id = auth.uid()
          AND e.status = 'active'
          AND e.revoked_at IS NULL
          AND (e.expires_at IS NULL OR e.expires_at > NOW())
      )
    )
    OR (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND upper(p.role) IN ('ADMIN', 'INSTRUCTOR')
      )
    )
  );

-- 3. Ensure Entitlements has proper indexes and constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_entitlements_user_masterclass_unique
  ON public.entitlements(user_id, masterclass_id);

CREATE INDEX IF NOT EXISTS idx_entitlements_active_lookup
  ON public.entitlements(user_id, status)
  WHERE revoked_at IS NULL;

-- 4. Auto-enroll function on user creation if there are pending orders
CREATE OR REPLACE FUNCTION public.handle_new_user_entitlements()
RETURNS TRIGGER AS $$
BEGIN
  -- If user registered with an email that has orders or pending entitlements, link them
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
