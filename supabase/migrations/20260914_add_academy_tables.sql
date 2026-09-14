-- ==============================================================================
-- SALUD FORTE ACADEMIA - SCHEMA CONSOLIDATION & COMPREHENSIVE RLS POLICIES
-- Migration: 20260914_add_academy_tables.sql
-- Description: Consolidates masterclasses, modules, lessons, enrollments, 
--              and lesson progress tables with strict Row Level Security (RLS)
--              and prevents clinical data storage in profiles.
-- ==============================================================================

BEGIN;

-- 1. Ensure masterclasses columns and constraints
CREATE TABLE IF NOT EXISTS public.masterclasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  short_description TEXT,
  full_description TEXT,
  category TEXT,
  access_type TEXT CHECK (access_type IN ('free', 'paid', 'lifetime', 'limited_days')) DEFAULT 'paid',
  price NUMERIC(10, 2) DEFAULT 0,
  compare_at_price NUMERIC(10, 2),
  currency TEXT DEFAULT 'MXN',
  cover_image TEXT,
  trailer_provider TEXT DEFAULT 'youtube',
  trailer_asset_id TEXT,
  duration_minutes INTEGER DEFAULT 0,
  lesson_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'published', 'coming_soon', 'archived')) DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2);
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;
ALTER TABLE public.masterclasses ADD COLUMN IF NOT EXISTS lesson_count INTEGER DEFAULT 0;

-- 2. Modules table
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  masterclass_id UUID REFERENCES public.masterclasses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 1,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_masterclass_id ON public.modules(masterclass_id);

-- 3. Lessons table enhancements
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  masterclass_id UUID REFERENCES public.masterclasses(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 1,
  duration_seconds INTEGER DEFAULT 0,
  video_provider TEXT CHECK (video_provider IN ('youtube', 'cloudflare', 'YOUTUBE', 'CLOUDFLARE_STREAM', 'none')) DEFAULT 'youtube',
  video_asset_id TEXT,
  video_external_id TEXT,
  is_preview BOOLEAN DEFAULT FALSE,
  transcript TEXT,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_external_id TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_lessons_masterclass_id ON public.lessons(masterclass_id);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON public.lessons(slug);

-- 4. Entitlements / Enrollments Table
CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  masterclass_id UUID REFERENCES public.masterclasses(id) ON DELETE CASCADE NOT NULL,
  source TEXT CHECK (source IN ('free_enrollment', 'purchase', 'admin', 'promotion')) DEFAULT 'purchase',
  order_id TEXT,
  status TEXT CHECK (status IN ('active', 'revoked', 'expired', 'suspended')) DEFAULT 'active',
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, masterclass_id)
);

ALTER TABLE public.entitlements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.entitlements ADD COLUMN IF NOT EXISTS revocation_reason TEXT;
ALTER TABLE public.entitlements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.entitlements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON public.entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_masterclass_id ON public.entitlements(masterclass_id);

-- Create a convenience view `enrollments` matching `entitlements`
CREATE OR REPLACE VIEW public.enrollments AS
  SELECT 
    id,
    user_id,
    masterclass_id,
    source,
    order_id,
    status,
    granted_at,
    expires_at,
    revoked_at,
    revocation_reason,
    created_at,
    updated_at
  FROM public.entitlements;

-- 5. Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  masterclass_id UUID REFERENCES public.masterclasses(id) ON DELETE CASCADE,
  position_seconds INTEGER DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ADD COLUMN IF NOT EXISTS masterclass_id UUID REFERENCES public.masterclasses(id) ON DELETE CASCADE;
ALTER TABLE public.lesson_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course ON public.lesson_progress(user_id, masterclass_id);

-- 6. Row Level Security (RLS) Configuration
ALTER TABLE public.masterclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Ver masterclasses publicadas" ON public.masterclasses;
DROP POLICY IF EXISTS "Public can view published masterclasses" ON public.masterclasses;
DROP POLICY IF EXISTS "Admins can manage masterclasses" ON public.masterclasses;

CREATE POLICY "Public can view published masterclasses"
  ON public.masterclasses
  FOR SELECT
  TO public
  USING (status IN ('published', 'coming_soon'));

CREATE POLICY "Admins can manage masterclasses"
  ON public.masterclasses
  FOR ALL
  TO authenticated
  USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('ADMIN', 'INSTRUCTOR')
  );

-- Modules RLS
DROP POLICY IF EXISTS "Public can view published modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;

CREATE POLICY "Public can view published modules"
  ON public.modules
  FOR SELECT
  TO public
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM public.masterclasses m 
      WHERE m.id = public.modules.masterclass_id 
      AND m.status IN ('published', 'coming_soon')
    )
  );

CREATE POLICY "Admins can manage modules"
  ON public.modules
  FOR ALL
  TO authenticated
  USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('ADMIN', 'INSTRUCTOR')
  );

-- Lessons RLS
DROP POLICY IF EXISTS "Ver lecciones de masterclasses publicadas" ON public.lessons;
DROP POLICY IF EXISTS "Public can view preview or enrolled lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;

CREATE POLICY "Public can view preview or enrolled lessons"
  ON public.lessons
  FOR SELECT
  TO public
  USING (
    status = 'published' AND (
      is_preview = true
      OR EXISTS (
        SELECT 1 FROM public.entitlements e
        WHERE e.masterclass_id = public.lessons.masterclass_id
        AND e.user_id = auth.uid()
        AND e.status = 'active'
      )
    )
  );

CREATE POLICY "Admins can manage lessons"
  ON public.lessons
  FOR ALL
  TO authenticated
  USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('ADMIN', 'INSTRUCTOR')
  );

-- Entitlements RLS
-- Crucial: Authenticated users can ONLY SELECT their own entitlements.
-- Authenticated users CANNOT insert, update, or delete entitlements (no self-granting).
DROP POLICY IF EXISTS "Usuarios ven sus inscripciones" ON public.entitlements;
DROP POLICY IF EXISTS "Users can view own entitlements" ON public.entitlements;
DROP POLICY IF EXISTS "Admins can manage entitlements" ON public.entitlements;

CREATE POLICY "Users can view own entitlements"
  ON public.entitlements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage entitlements"
  ON public.entitlements
  FOR ALL
  TO authenticated
  USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('ADMIN', 'INSTRUCTOR')
  );

-- Lesson Progress RLS
-- Users can view and update their own progress.
DROP POLICY IF EXISTS "Usuarios ven y actualizan su progreso" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.lesson_progress;

CREATE POLICY "Users can view own progress"
  ON public.lesson_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress"
  ON public.lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON public.lesson_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7. SQL Grants
REVOKE ALL ON public.masterclasses FROM PUBLIC;
REVOKE ALL ON public.modules FROM PUBLIC;
REVOKE ALL ON public.lessons FROM PUBLIC;
REVOKE ALL ON public.entitlements FROM PUBLIC;
REVOKE ALL ON public.lesson_progress FROM PUBLIC;

GRANT SELECT ON public.masterclasses TO anon, authenticated;
GRANT SELECT ON public.modules TO anon, authenticated;
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT SELECT ON public.entitlements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lesson_progress TO authenticated;

COMMIT;
