-- ==============================================================================
-- SALUD FORTE MEDICAL & ACADEMIA - SUPABASE AUTHENTICATION & PROFILES SCHEMA
-- Migration: 20260910_create_profiles_schema.sql
-- Description: Creates or updates the public.profiles table, sets RLS policies,
--              column-level grants, automated set_profiles_updated_at trigger, 
--              and secure handle_new_user without public shopify_customer_gid intake.
-- ==============================================================================

BEGIN;

-- 1. Ensure Table Structure for public.profiles (conserving shopify_customer_gid for backend webhooks)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  terms_accepted_at TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT false,
  shopify_customer_gid TEXT, -- Reserved exclusively for secure server webhooks
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Safely add missing columns if upgrading from earlier schema
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shopify_customer_gid TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ensure full_name is NOT NULL for compatibility with init schema
ALTER TABLE public.profiles ALTER COLUMN full_name SET NOT NULL;

-- Drop outdated column email_verified if present from legacy drafts
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email_verified;

-- 2. Migrate legacy roles & enforce constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_role_valid;

-- Normalize existing data to allowed roles ('CUSTOMER', 'INSTRUCTOR', 'ADMIN')
UPDATE public.profiles
SET role = CASE
  WHEN role IN ('admin', 'ADMIN') THEN 'ADMIN'
  WHEN role IN ('instructor', 'INSTRUCTOR') THEN 'INSTRUCTOR'
  ELSE 'CUSTOMER'
END
WHERE role IS NOT NULL;

UPDATE public.profiles
SET role = 'CUSTOMER'
WHERE role IS NULL OR role NOT IN ('CUSTOMER', 'INSTRUCTOR', 'ADMIN');

-- Set default role, NOT NULL, and re-add strict CHECK constraint
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'CUSTOMER';
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('CUSTOMER', 'INSTRUCTOR', 'ADMIN'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to guarantee clean state
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can select own profile authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;

-- Policy A: Authenticated user can select only their own profile
CREATE POLICY "Users can select own profile authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy B: Authenticated user can update only their own profile
CREATE POLICY "Users can update own profile authenticated"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy C: Admin can select all profiles when app_metadata role is ADMIN
CREATE POLICY "Admins can select all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'ADMIN'
  );

-- 4. Explicit SQL Permissions (REVOKE & GRANT)
REVOKE ALL ON public.profiles FROM PUBLIC;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;

-- Authenticated users can SELECT
GRANT SELECT ON public.profiles TO authenticated;

-- Authenticated users can UPDATE ONLY specific safe columns (shopify_customer_gid NOT granted)
GRANT UPDATE (
  full_name,
  first_name,
  last_name,
  phone,
  marketing_consent
) ON public.profiles TO authenticated;

-- Note: No INSERT or DELETE grants on public.profiles for authenticated or anon.
-- Profiles are created exclusively via handle_new_user trigger.

-- 5. Drop outdated problematic triggers/functions if they exist
DROP TRIGGER IF EXISTS tr_protect_profile_fields ON public.profiles;
DROP FUNCTION IF EXISTS public.protect_profile_fields();

-- 6. Updated_at Trigger & Function (Exclusive to profiles)
CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profiles_updated_at();

-- 7. Automatic Profile Creation Trigger on auth.users Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_phone TEXT;
  v_terms_at TIMESTAMPTZ := NULL;
  v_marketing_consent BOOLEAN := false;
  v_raw_terms TEXT;
  v_raw_marketing TEXT;
  v_email_username TEXT;
BEGIN
  v_first_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '')), '');
  v_last_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'last_name', '')), '');
  v_full_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');
  v_phone := NEW.raw_user_meta_data->>'phone';

  -- Normalize full_name according to fallback rules (never insert NULL)
  IF v_full_name IS NULL THEN
    IF v_first_name IS NOT NULL OR v_last_name IS NOT NULL THEN
      v_full_name := TRIM(CONCAT_WS(' ', v_first_name, v_last_name));
    ELSE
      -- Extract username part before @ from email
      v_email_username := SPLIT_PART(COALESCE(NEW.email, 'usuario@saludforte.com'), '@', 1);
      IF v_email_username IS NOT NULL AND TRIM(v_email_username) <> '' THEN
        v_full_name := INITCAP(REPLACE(REPLACE(v_email_username, '.', ' '), '_', ' '));
      else
        v_full_name := 'Usuario';
      END IF;
    END IF;
  END IF;

  -- Safe parsing of terms_accepted_at (no fallback to NOW() if missing/invalid)
  v_raw_terms := NEW.raw_user_meta_data->>'terms_accepted_at';
  IF v_raw_terms IS NOT NULL AND TRIM(v_raw_terms) <> '' THEN
    BEGIN
      v_terms_at := v_raw_terms::TIMESTAMPTZ;
    EXCEPTION WHEN OTHERS THEN
      v_terms_at := NULL;
    END;
  END IF;

  -- Safe parsing of marketing_consent via CASE (no exception on arbitrary text)
  v_raw_marketing := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'marketing_consent', '')));
  v_marketing_consent := CASE
    WHEN v_raw_marketing IN ('true', '1', 'yes', 'on', 't', 'y') THEN true
    ELSE false
  END;

  -- ALWAYS assign role 'CUSTOMER' for public signup. shopify_customer_gid remains NULL.
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
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Re-attach trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;
