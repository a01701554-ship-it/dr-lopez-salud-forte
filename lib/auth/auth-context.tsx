import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'CUSTOMER' | 'INSTRUCTOR' | 'ADMIN';

export type Profile = {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: UserRole;
  phone?: string;
  email_verified: boolean;
  marketing_consent?: boolean;
  marketing_consent_at?: string;
  marketing_opted_out_at?: string;
  marketing_consent_source?: string;
  marketing_consent_version?: string;
  privacy_policy_version?: string;
  terms_accepted_at?: string;
  created_at?: string;
  last_login_at?: string;
};

export type RegisterData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone?: string;
  terms_accepted: boolean;
  marketing_consent?: boolean;
};

type AuthContextType = {
  user: Profile | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  sessionToken: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: Profile; error?: string; isUnconfirmed?: boolean }>;
  signUp: (data: RegisterData) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateMarketingPreferences: (consent: boolean) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyEmail: (token?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
};

const UNCONFIGURED_ERROR = 'El servicio de autenticación de Supabase no está configurado. Por favor configura las variables VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.';

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isInstructor: false,
  sessionToken: null,
  signIn: async () => ({ success: false, error: 'No inicializado' }),
  signUp: async () => ({ success: false, error: 'No inicializado' }),
  updateMarketingPreferences: async () => ({ success: false, error: 'No inicializado' }),
  verifyEmail: async () => ({ success: false, error: 'No inicializado' }),
  resendVerification: async () => ({ success: false, error: 'No inicializado' }),
  requestPasswordReset: async () => ({ success: false, error: 'No inicializado' }),
  resetPassword: async () => ({ success: false, error: 'No inicializado' }),
  signOut: async () => {},
  refreshSession: async () => {},
  fetchWithAuth: async (url, options) => fetch(url, options),
});

export function translateSupabaseError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'Correo electrónico o contraseña incorrectos.';
  }
  if (lower.includes('user already registered') || lower.includes('already_exists')) {
    return 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.';
  }
  if (lower.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 10 caracteres.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Demasiados intentos. Por favor espera un minuto antes de reintentar.';
  }
  return msg || 'Ocurrió un error al procesar la solicitud.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser: User): Promise<Profile> => {
    const meta = authUser.user_metadata || {};

    if (isSupabaseConfigured) {
      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (dbProfile) {
          let role: UserRole = 'CUSTOMER';
          if (dbProfile.role === 'ADMIN' || dbProfile.role === 'admin') role = 'ADMIN';
          else if (dbProfile.role === 'INSTRUCTOR') role = 'INSTRUCTOR';

          return {
            id: authUser.id,
            full_name: dbProfile.full_name || meta.full_name || 'Usuario',
            first_name: dbProfile.first_name || meta.first_name,
            last_name: dbProfile.last_name || meta.last_name,
            email: authUser.email || dbProfile.email || '',
            role,
            phone: dbProfile.phone || meta.phone,
            email_verified: !!authUser.email_confirmed_at,
            marketing_consent: dbProfile.marketing_consent ?? meta.marketing_consent ?? false,
            marketing_consent_at: dbProfile.marketing_consent_at || meta.marketing_consent_at,
            marketing_opted_out_at: dbProfile.marketing_opted_out_at || meta.marketing_opted_out_at,
            marketing_consent_source: dbProfile.marketing_consent_source || meta.marketing_consent_source,
            marketing_consent_version: dbProfile.marketing_consent_version || meta.marketing_consent_version,
            privacy_policy_version: dbProfile.privacy_policy_version || meta.privacy_policy_version,
            terms_accepted_at: dbProfile.terms_accepted_at || meta.terms_accepted_at,
            created_at: dbProfile.created_at || authUser.created_at,
            last_login_at: authUser.last_sign_in_at || dbProfile.updated_at,
          };
        }
      } catch (err) {
        console.warn('[AuthProvider] Could not read profile table:', err);
      }
    }

    // Default fallback when row does not exist yet
    return {
      id: authUser.id,
      full_name: meta.full_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || 'Usuario',
      first_name: meta.first_name,
      last_name: meta.last_name,
      email: authUser.email || '',
      role: 'CUSTOMER',
      email_verified: !!authUser.email_confirmed_at,
      marketing_consent: !!meta.marketing_consent,
      marketing_consent_at: meta.marketing_consent_at,
      marketing_opted_out_at: meta.marketing_opted_out_at,
      marketing_consent_source: meta.marketing_consent_source,
      marketing_consent_version: meta.marketing_consent_version,
      privacy_policy_version: meta.privacy_policy_version,
      terms_accepted_at: meta.terms_accepted_at,
      created_at: authUser.created_at,
      last_login_at: authUser.last_sign_in_at,
    };
  }, []);

  const syncSession = useCallback(async (session: Session | null) => {
    if (session?.user) {
      setSessionToken((prev) => (prev === session.access_token ? prev : session.access_token));
      const userProfile = await fetchProfile(session.user);
      setProfile((prev) => {
        if (!prev) return userProfile;
        if (
          prev.id === userProfile.id &&
          prev.email === userProfile.email &&
          prev.role === userProfile.role &&
          prev.first_name === userProfile.first_name &&
          prev.last_name === userProfile.last_name &&
          prev.email_verified === userProfile.email_verified &&
          prev.marketing_consent === userProfile.marketing_consent
        ) {
          return prev;
        }
        return userProfile;
      });

      // Synchronize with server-side store to guarantee student directory is always comprehensive
      if (session.access_token) {
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            profile: userProfile,
            email_confirmed_at: session.user.email_confirmed_at,
            last_sign_in_at: session.user.last_sign_in_at,
          }),
        }).catch(() => {});
      }
    } else {
      setSessionToken((prev) => (prev === null ? null : null));
      setProfile((prev) => (prev === null ? null : null));
    }
    setIsLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        syncSession(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        await syncSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncSession]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: UNCONFIGURED_ERROR };
    }

    try {
      setIsLoading(true);
      const normalizedEmail = email.toLowerCase().trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setIsLoading(false);
        const isUnconfirmed = error.message.toLowerCase().includes('email not confirmed');
        return {
          success: false,
          error: translateSupabaseError(error.message),
          isUnconfirmed,
        };
      }

      if (data.session && data.user) {
        setSessionToken(data.session.access_token);
        const userProfile = await fetchProfile(data.user);
        setProfile(userProfile);
        setIsLoading(false);
        return { success: true, user: userProfile };
      }

      setIsLoading(false);
      return { success: false, error: 'No se pudo iniciar sesión. Por favor intenta de nuevo.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Error al conectar con el servidor.' };
    }
  };

  const signUp = async (data: RegisterData) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: UNCONFIGURED_ERROR };
    }

    try {
      if (data.password !== data.confirm_password) {
        return { success: false, error: 'Las contraseñas no coinciden.' };
      }

      if (data.password.length < 10) {
        return { success: false, error: 'La contraseña debe tener al menos 10 caracteres.' };
      }

      if (data.password.length > 128) {
        return { success: false, error: 'La contraseña no debe exceder 128 caracteres.' };
      }

      if (!data.terms_accepted) {
        return { success: false, error: 'Debes aceptar los Términos de Servicio y el Aviso de Privacidad.' };
      }

      const normalizedEmail = data.email.toLowerCase().trim();
      const fullName = `${data.first_name.trim()} ${data.last_name.trim()}`;
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?type=signup` : undefined;

      const { data: authData, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: data.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName,
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            phone: data.phone?.trim() || '',
            terms_accepted_at: new Date().toISOString(),
            marketing_consent: !!data.marketing_consent,
            marketing_consent_at: data.marketing_consent ? new Date().toISOString() : null,
            marketing_consent_source: 'registration_form',
            marketing_consent_version: 'v1.0',
            privacy_policy_version: 'v1.0',
          },
        },
      });

      if (error) {
        return { success: false, error: translateSupabaseError(error.message) };
      }

      if (!authData.user) {
        return { success: false, error: 'No se pudo crear el registro de usuario.' };
      }

      // Sync registered user to backend store
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            id: authData.user.id,
            full_name: fullName,
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            email: normalizedEmail,
            phone: data.phone?.trim() || '',
            role: 'CUSTOMER',
            email_verified: false,
            marketing_consent: !!data.marketing_consent,
            marketing_consent_at: data.marketing_consent ? new Date().toISOString() : undefined,
            marketing_consent_source: 'registration_form',
            marketing_consent_version: 'v1.0',
            privacy_policy_version: 'v1.0',
            terms_accepted_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          email_confirmed_at: null,
        }),
      }).catch(() => {});

      return {
        success: true,
        message: 'Cuenta creada exitosamente. Te hemos enviado un correo de confirmación a tu bandeja de entrada.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error inesperado durante el registro.' };
    }
  };

  const verifyEmail = async (token?: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: UNCONFIGURED_ERROR };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userProfile = await fetchProfile(session.user);
        setProfile(userProfile);
        return {
          success: true,
          message: 'Tu correo electrónico ha sido verificado satisfactoriamente.',
        };
      }

      if (token) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(token);
        if (error) {
          return { success: false, error: translateSupabaseError(error.message) };
        }
        if (data.session && data.user) {
          setSessionToken(data.session.access_token);
          const userProfile = await fetchProfile(data.user);
          setProfile(userProfile);
          return { success: true, message: 'Correo verificado exitosamente.' };
        }
      }

      return {
        success: false,
        error: 'No se pudo verificar el correo o el enlace ha expirado.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al verificar correo.' };
    }
  };

  const resendVerification = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: UNCONFIGURED_ERROR };
    }

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?type=signup` : undefined;

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        return { success: false, error: translateSupabaseError(error.message) };
      }

      return {
        success: true,
        message: 'Se ha reenviado el correo de verificación. Revisa tu bandeja de entrada o spam.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al reenviar correo de verificación.' };
    }
  };

  const requestPasswordReset = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: UNCONFIGURED_ERROR };
    }

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?type=recovery` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
      });

      if (error) {
        return { success: false, error: translateSupabaseError(error.message) };
      }

      return {
        success: true,
        message: 'Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión.' };
    }
  };

  const resetPassword = async (password: string, confirmPassword: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: UNCONFIGURED_ERROR };
    }

    try {
      if (password !== confirmPassword) {
        return { success: false, error: 'Las contraseñas no coinciden.' };
      }
      if (password.length < 10) {
        return { success: false, error: 'La contraseña debe tener al menos 10 caracteres.' };
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        return { success: false, error: translateSupabaseError(error.message) };
      }

      return {
        success: true,
        message: 'Tu contraseña ha sido actualizada con éxito.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar la contraseña.' };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('[AuthProvider] SignOut error:', err);
    } finally {
      setProfile(null);
      setSessionToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/cuenta/iniciar-sesion?logout=true';
      }
    }
  };

  const updateMarketingPreferences = async (consent: boolean): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!profile) return { success: false, error: 'Usuario no autenticado' };
    const now = new Date().toISOString();
    try {
      if (isSupabaseConfigured && supabase) {
        const updatePayload: Record<string, any> = {
          marketing_consent: consent,
          updated_at: now,
        };
        if (consent) {
          updatePayload.marketing_consent_at = now;
          updatePayload.marketing_opted_out_at = null;
          updatePayload.marketing_consent_source = 'user_profile_preferences';
          updatePayload.marketing_consent_version = 'v1.0';
          updatePayload.privacy_policy_version = 'v1.0';
        } else {
          updatePayload.marketing_opted_out_at = now;
        }

        await supabase.from('profiles').update(updatePayload).eq('id', profile.id);
      }

      // Notify backend server
      if (sessionToken) {
        await fetch('/api/account/marketing-preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            marketing_consent: consent,
            source: 'user_profile_preferences',
          }),
        }).catch(() => {});
      }

      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          marketing_consent: consent,
          marketing_consent_at: consent ? now : prev.marketing_consent_at,
          marketing_opted_out_at: !consent ? now : prev.marketing_opted_out_at,
          marketing_consent_source: consent ? 'user_profile_preferences' : prev.marketing_consent_source,
        };
      });

      return {
        success: true,
        message: consent
          ? 'Has activado voluntariamente la recepción de novedades médicas y promociones de Salud Forte.'
          : 'Has dejado de recibir correos informativos y promociones. Continuarás recibiendo comunicaciones necesarias relacionadas con tu cuenta, compras y cursos.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Error al actualizar las preferencias de comunicación.',
      };
    }
  };

  const refreshSession = async () => {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      await syncSession(session);
    }
  };

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (sessionToken) {
      headers.set('Authorization', `Bearer ${sessionToken}`);
    }
    return fetch(url, { ...options, headers });
  }, [sessionToken]);

  const isAuthenticated = !!profile;
  const isAdmin = profile?.role === 'ADMIN';
  const isInstructor = profile?.role === 'INSTRUCTOR' || profile?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user: profile,
        profile,
        isLoading,
        isAuthenticated,
        isAdmin,
        isInstructor,
        sessionToken,
        signIn,
        signUp,
        updateMarketingPreferences,
        verifyEmail,
        resendVerification,
        requestPasswordReset,
        resetPassword,
        signOut,
        refreshSession,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
