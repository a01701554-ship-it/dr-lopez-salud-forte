-- Migración inicial para Academia Salud Forte
-- UUID y tablas base

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PERFILES (profiles)
-- ==========================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins pueden ver todos los perfiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Función para insertar automáticamente un perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- MASTERCLASSES
-- ==========================================
CREATE TABLE public.masterclasses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  short_description TEXT,
  full_description TEXT,
  category TEXT,
  access_type TEXT CHECK (access_type IN ('free', 'paid')) DEFAULT 'paid',
  price NUMERIC(10, 2),
  currency TEXT DEFAULT 'MXN',
  cover_image TEXT,
  trailer_provider TEXT,
  trailer_asset_id TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'coming_soon', 'archived')) DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.masterclasses ENABLE ROW LEVEL SECURITY;

-- Políticas: Cualquiera puede ver las publicadas
CREATE POLICY "Ver masterclasses publicadas" ON public.masterclasses FOR SELECT USING (status IN ('published', 'coming_soon'));

-- ==========================================
-- LECCIONES (lessons)
-- ==========================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  masterclass_id UUID REFERENCES public.masterclasses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  duration_seconds INTEGER,
  video_provider TEXT,
  video_asset_id TEXT,
  is_preview BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver lecciones de masterclasses publicadas" ON public.lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.masterclasses WHERE id = public.lessons.masterclass_id AND status IN ('published', 'coming_soon'))
);

-- ==========================================
-- INSCRIPCIONES Y DERECHOS (entitlements)
-- ==========================================
CREATE TABLE public.entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  masterclass_id UUID REFERENCES public.masterclasses(id) ON DELETE CASCADE,
  source TEXT CHECK (source IN ('free_enrollment', 'purchase', 'admin', 'promotion')),
  order_id TEXT, -- Referencia opcional al sistema de pagos (e.g. Shopify o Stripe)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, masterclass_id)
);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus inscripciones" ON public.entitlements FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- PROGRESO DE LECCIONES (lesson_progress)
-- ==========================================
CREATE TABLE public.lesson_progress (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  position_seconds INTEGER DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven y actualizan su progreso" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- PEDIDOS (orders) - Réplica local o principal
-- ==========================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  provider_order_id TEXT UNIQUE, -- ej. ID de Stripe o Shopify
  payment_status TEXT,
  fulfillment_status TEXT,
  subtotal NUMERIC(10, 2),
  shipping NUMERIC(10, 2),
  tax NUMERIC(10, 2),
  total NUMERIC(10, 2),
  currency TEXT DEFAULT 'MXN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven sus pedidos" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- ENVÍOS (shipments)
-- ==========================================
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  status TEXT DEFAULT 'pending',
  shipped_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven envíos de sus pedidos" ON public.shipments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = public.shipments.order_id AND user_id = auth.uid())
);

-- ==========================================
-- EVENTOS DE ENVÍO (shipment_events)
-- ==========================================
CREATE TABLE public.shipment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven eventos de envíos de sus pedidos" ON public.shipment_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.shipments s 
    JOIN public.orders o ON s.order_id = o.id 
    WHERE s.id = public.shipment_events.shipment_id AND o.user_id = auth.uid()
  )
);
