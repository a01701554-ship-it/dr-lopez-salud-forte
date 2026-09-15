import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

// --- Client (Browser) Configuration ---
export function getClientSupabaseConfig() {
  const url =
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_SUPABASE_URL) ||
    '';
  const key =
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
    '';
  return {
    url: url.trim(),
    key: key.trim(),
  };
}

// --- Server (Node.js) Configuration ---
export function getServerSupabaseConfig() {
  const url =
    (typeof process !== 'undefined' &&
      (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)) ||
    '';

  const key =
    (typeof process !== 'undefined' &&
      (process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY)) ||
    '';

  return {
    url: url.trim(),
    key: key.trim(),
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
