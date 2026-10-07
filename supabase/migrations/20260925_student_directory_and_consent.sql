-- Migration: 20260925_student_directory_and_consent.sql
-- Enables comprehensive student and registered user directory for academy managers
-- with verifiable, explicit marketing consent audit fields and strict transactional separation.

BEGIN;

-- 1. Extend public.profiles with verifiable marketing consent audit columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_opted_out_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent_source TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent_version TEXT DEFAULT 'v1.0';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT DEFAULT 'v1.0';

-- Indexes for efficient directory queries and marketing segmentation
CREATE INDEX IF NOT EXISTS idx_profiles_marketing_consent ON public.profiles(marketing_consent) WHERE marketing_consent = true;
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON public.profiles(email);

-- 2. Allow authenticated users to update their own marketing preferences
GRANT UPDATE (
  marketing_consent,
  marketing_consent_at,
  marketing_opted_out_at,
  marketing_consent_source,
  marketing_consent_version,
  privacy_policy_version,
  updated_at
) ON public.profiles TO authenticated;

-- 3. Upgrade RLS on public.profiles: Academy managers (ADMIN or INSTRUCTOR) can view all registered users
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;
CREATE POLICY "Admins can select all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    public.is_academy_manager()
    OR auth.uid() = id
    OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'ADMIN'
  );

-- 4. Update handle_new_user() to persist verifiable marketing consent details upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_phone TEXT;
  v_terms_at TIMESTAMPTZ := NULL;
  v_marketing_consent BOOLEAN := false;
  v_marketing_at TIMESTAMPTZ := NULL;
  v_marketing_source TEXT := 'registration_form';
  v_marketing_version TEXT := 'v1.0';
  v_privacy_version TEXT := 'v1.0';
  v_raw_terms TEXT;
  v_raw_marketing TEXT;
  v_email_username TEXT;
BEGIN
  v_first_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '')), '');
  v_last_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'last_name', '')), '');
  v_full_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');
  v_phone := NEW.raw_user_meta_data->>'phone';

  IF v_full_name IS NULL THEN
    IF v_first_name IS NOT NULL OR v_last_name IS NOT NULL THEN
      v_full_name := TRIM(CONCAT_WS(' ', v_first_name, v_last_name));
    ELSE
      v_email_username := SPLIT_PART(COALESCE(NEW.email, 'usuario@saludforte.com'), '@', 1);
      IF v_email_username IS NOT NULL AND TRIM(v_email_username) <> '' THEN
        v_full_name := INITCAP(REPLACE(REPLACE(v_email_username, '.', ' '), '_', ' '));
      ELSE
        v_full_name := 'Usuario';
      END IF;
    END IF;
  END IF;

  v_raw_terms := NEW.raw_user_meta_data->>'terms_accepted_at';
  IF v_raw_terms IS NOT NULL AND TRIM(v_raw_terms) <> '' THEN
    BEGIN
      v_terms_at := v_raw_terms::TIMESTAMPTZ;
    EXCEPTION WHEN OTHERS THEN
      v_terms_at := NULL;
    END;
  END IF;

  v_raw_marketing := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'marketing_consent', '')));
  v_marketing_consent := CASE
    WHEN v_raw_marketing IN ('true', '1', 'yes', 'on', 't', 'y') THEN true
    ELSE false
  END;

  IF v_marketing_consent THEN
    v_marketing_at := NOW();
  END IF;

  IF NEW.raw_user_meta_data->>'marketing_consent_source' IS NOT NULL THEN
    v_marketing_source := NEW.raw_user_meta_data->>'marketing_consent_source';
  END IF;

  IF NEW.raw_user_meta_data->>'marketing_consent_version' IS NOT NULL THEN
    v_marketing_version := NEW.raw_user_meta_data->>'marketing_consent_version';
  END IF;

  IF NEW.raw_user_meta_data->>'privacy_policy_version' IS NOT NULL THEN
    v_privacy_version := NEW.raw_user_meta_data->>'privacy_policy_version';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    role,
    terms_accepted_at,
    marketing_consent,
    marketing_consent_at,
    marketing_consent_source,
    marketing_consent_version,
    privacy_policy_version,
    shopify_customer_gid,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_first_name,
    v_last_name,
    v_phone,
    'CUSTOMER',
    v_terms_at,
    v_marketing_consent,
    v_marketing_at,
    v_marketing_source,
    v_marketing_version,
    v_privacy_version,
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5. Helper RPC to provide academy instructors with complete student records securely
CREATE OR REPLACE FUNCTION public.get_admin_student_directory()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT,
  marketing_consent BOOLEAN,
  marketing_consent_at TIMESTAMPTZ,
  marketing_opted_out_at TIMESTAMPTZ,
  marketing_consent_source TEXT,
  marketing_consent_version TEXT,
  privacy_policy_version TEXT,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Strict permission guard: caller must be ADMIN or INSTRUCTOR
  IF NOT public.is_academy_manager() THEN
    RAISE EXCEPTION 'Acceso denegado: se requieren privilegios de administración o instructor.';
  END IF;

  -- Backfill any accounts in auth.users that might be missing in public.profiles
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name, phone, role, created_at, updated_at)
  SELECT
    u.id,
    u.email,
    COALESCE(
      NULLIF(TRIM(CONCAT_WS(' ', u.raw_user_meta_data->>'first_name', u.raw_user_meta_data->>'last_name')), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
      SPLIT_PART(COALESCE(u.email, 'usuario@saludforte.com'), '@', 1)
    ),
    u.raw_user_meta_data->>'first_name',
    u.raw_user_meta_data->>'last_name',
    u.raw_user_meta_data->>'phone',
    'CUSTOMER',
    u.created_at,
    NOW()
  FROM auth.users u
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = u.id)
  ON CONFLICT (id) DO NOTHING;

  -- Return comprehensive directory with auth timestamps
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.first_name,
    p.last_name,
    p.phone,
    p.role,
    COALESCE(p.marketing_consent, false) AS marketing_consent,
    p.marketing_consent_at,
    p.marketing_opted_out_at,
    p.marketing_consent_source,
    p.marketing_consent_version,
    p.privacy_policy_version,
    p.terms_accepted_at,
    p.created_at,
    p.updated_at,
    u.email_confirmed_at,
    u.last_sign_in_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_student_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_student_directory() TO authenticated;

COMMIT;
