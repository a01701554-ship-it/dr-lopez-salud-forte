import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

// --- Client (Browser) Configuration ---
export function getClientSupabaseConfig() {
  const metaEnv = import.meta.env as Record<string, string | undefined>;
  const procEnv =
    typeof process !== 'undefined' && process.env
      ? (process.env as Record<string, string | undefined>)
      : {};
  const env = metaEnv || procEnv;

  // Resolution order:
  // 1. SUPABASE_URL / PUBLISHABLE
  // 2. VITE_SUPABASE_URL / PUBLISHABLE
  // 3. NEXT_PUBLIC_SUPABASE_URL / ANON
  const url =
    env.SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    '';

  const key =
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  return {
    url: url.trim(),
    key: key.trim(),
  };
}

// --- Server (Node.js) Configuration ---
export function getServerSupabaseConfig() {
  const env = typeof process !== 'undefined' && process.env ? process.env : {};

  // Strict resolution order required:
  // 1. SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY (o SUPABASE_ANON_KEY)
  // 2. VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY (o VITE_SUPABASE_ANON_KEY)
  // 3. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
  const url =
    env.SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    '';

  const key =
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  const serviceRoleKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  return {
    url: url.trim(),
    key: key.trim(),
    serviceRoleKey,
  };
}

const clientConfig = getClientSupabaseConfig();
const initialServerConfig = getServerSupabaseConfig();

export const isSupabaseConfigured = Boolean(
  (clientConfig.url && clientConfig.key) ||
    (initialServerConfig.url && initialServerConfig.key),
);

// Browser singleton client
export const supabase: SupabaseClient | null =
  clientConfig.url && clientConfig.key
    ? createClient(clientConfig.url, clientConfig.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : initialServerConfig.url && initialServerConfig.key
      ? createClient(initialServerConfig.url, initialServerConfig.key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        })
      : null;

// Server per-request user client
export function createSupabaseServerUserClient(
  accessToken: string,
): SupabaseClient {
  const { url, key } = getServerSupabaseConfig();

  if (!url || !key) {
    throw new Error('Supabase no está configurado en el servidor');
  }

  const normalizedToken = accessToken.trim();
  if (!normalizedToken) {
    throw new Error('Falta el token de acceso');
  }

  return createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${normalizedToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Server client with Service Role privileges for administrative tasks.
// CRITICAL: NEVER call or expose this client on the browser/client-side.
export function createSupabaseServerAdminClient(): SupabaseClient | null {
  const { url, serviceRoleKey } = getServerSupabaseConfig();
  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Server client limited to the public/anonymous permissions defined by RLS.
// It never uses a service-role key and therefore cannot bypass database rules.
export function createSupabaseServerPublicClient(): SupabaseClient {
  const { url, key } = getServerSupabaseConfig();

  if (!url || !key) {
    throw new Error('Supabase no está configurado en el servidor');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
