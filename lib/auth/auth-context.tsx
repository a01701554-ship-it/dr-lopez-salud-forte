import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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
  mfa_enabled?: boolean;
  shopifyCustomerGid?: string;
};

export type RegisterData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
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
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: Profile; error?: string }>;
  signUp: (data: RegisterData) => Promise<{ success: boolean; message?: string; verificationUrl?: string; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  // Backward compatibility hooks
  requestCode?: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  verifyCode?: (email: string, code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginWithShopify?: (returnTo?: string) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isInstructor: false,
  signIn: async () => ({ success: false, error: 'No inicializado' }),
  signUp: async () => ({ success: false, error: 'No inicializado' }),
  verifyEmail: async () => ({ success: false, error: 'No inicializado' }),
  requestPasswordReset: async () => ({ success: false, error: 'No inicializado' }),
  resetPassword: async () => ({ success: false, error: 'No inicializado' }),
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          const userObj: Profile = {
            id: data.user.id,
            full_name: data.user.full_name || 'Usuario',
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            email: data.user.email,
            role: (data.user.role as UserRole) || 'CUSTOMER',
            email_verified: !!data.user.email_verified,
            marketing_consent: !!data.user.marketing_consent,
            mfa_enabled: !!data.user.mfa_enabled,
            shopifyCustomerGid: data.user.shopifyCustomerGid,
          };
          setProfile(userObj);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('[AuthContext] Session check error:', err);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Correo o contraseña incorrectos.' };
      }

      if (data.user) {
        const userObj: Profile = {
          id: data.user.id,
          full_name: data.user.full_name,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          email: data.user.email,
          role: (data.user.role as UserRole) || 'CUSTOMER',
          email_verified: !!data.user.email_verified,
          marketing_consent: !!data.user.marketing_consent,
          mfa_enabled: !!data.user.mfa_enabled,
          shopifyCustomerGid: data.user.shopifyCustomerGid,
        };
        setProfile(userObj);
      }

      await checkSession();
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
    }
  };

  const signUp = async (data: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'No se pudo crear la cuenta.' };
      }

      return {
        success: true,
        message: resData.message || 'Cuenta creada correctamente.',
        verificationUrl: resData.verificationUrl,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'El enlace de verificación es inválido o ha expirado.' };
      }

      await checkSession();
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al verificar correo.' };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'No se pudo procesar la solicitud.' };
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirm_password: confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al restablecer contraseña.' };
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('[AuthContext] SignOut error:', err);
    } finally {
      setProfile(null);
      window.location.href = '/cuenta/iniciar-sesion?logout=true';
    }
  };

  const refreshSession = async () => {
    await checkSession();
  };

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
        signIn,
        signUp,
        verifyEmail,
        requestPasswordReset,
        resetPassword,
        signOut,
        refreshSession,
        requestCode: async (email) => {
          return { success: true, message: 'Función en transición.' };
        },
        verifyCode: async () => ({ success: false, error: 'Utiliza inicio de sesión con correo y contraseña.' }),
        loginWithShopify: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
