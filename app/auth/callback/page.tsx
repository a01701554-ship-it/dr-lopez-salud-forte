'use client';

import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/lib/auth/auth-context';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function AuthCallbackPage() {
  const { refreshSession } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verificando tus credenciales de acceso...');
  const [redirectTarget, setRedirectTarget] = useState('/mi-cuenta/masterclasses');

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      if (!isSupabaseConfigured) {
        setStatus('error');
        setMessage('El servicio de autenticación no está disponible en este momento.');
        return;
      }

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        const code = urlParams.get('code');
        const tokenHash = urlParams.get('token_hash');
        const type = urlParams.get('type') || hashParams.get('type');
        const error = urlParams.get('error_description') || hashParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(decodeURIComponent(error));
          return;
        }

        // If authorization code is present (PKCE flow)
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setStatus('error');
            setMessage(exchangeError.message || 'No fue posible validar el código de autenticación.');
            return;
          }
        } else if (tokenHash && type) {
          // Token hash verification (OTP / Email confirmation)
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          if (verifyError) {
            setStatus('error');
            setMessage(verifyError.message || 'El enlace de confirmación ha expirado o ya fue utilizado.');
            return;
          }
        }

        // Refresh session and profile in context
        await refreshSession();

        if (!isMounted) return;

        setStatus('success');

        if (type === 'recovery') {
          setMessage('Enlace de recuperación validado correctamente.');
          setRedirectTarget('/cuenta/reset-password');
          setTimeout(() => {
            window.location.href = '/cuenta/reset-password';
          }, 1200);
        } else {
          setMessage('¡Tu correo electrónico ha sido verificado con éxito!');
          setRedirectTarget('/mi-cuenta/masterclasses');
          setTimeout(() => {
            window.location.href = '/mi-cuenta/masterclasses';
          }, 1500);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('error');
        setMessage(err.message || 'Ocurrió un error al procesar la verificación.');
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [refreshSession]);

  return (
    <div className="bg-ivory min-h-[calc(100dvh-5rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#B39A6A]/20 text-center">
        {status === 'verifying' && (
          <div>
            <div className="size-14 rounded-full bg-champagne/15 text-champagne flex items-center justify-center mx-auto mb-4">
              <Loader2 className="size-7 animate-spin text-champagne" />
            </div>
            <h1 className="font-serif text-2xl text-obsidian font-medium mb-2">
              Validando autenticación
            </h1>
            <p className="text-obsidian/70 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="size-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-7" />
            </div>
            <h1 className="font-serif text-2xl text-obsidian font-medium mb-2">
              Autenticación exitosa
            </h1>
            <p className="text-obsidian/75 text-sm leading-relaxed mb-6">
              {message}
            </p>
            <a
              href={redirectTarget}
              className="w-full h-11 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all flex items-center justify-center gap-2 text-xs tracking-wider uppercase shadow-xs"
            >
              <span>Acceder ahora</span>
              <ArrowRight className="size-4" />
            </a>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="size-14 rounded-full bg-red-50 border border-red-200 text-red-700 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="size-7" />
            </div>
            <h1 className="font-serif text-2xl text-obsidian font-medium mb-2">
              No se pudo completar la verificación
            </h1>
            <p className="text-obsidian/75 text-sm leading-relaxed mb-6">
              {message}
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href="/cuenta/iniciar-sesion"
                className="w-full h-11 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all flex items-center justify-center gap-2 text-xs tracking-wider uppercase shadow-xs"
              >
                <span>Ir a Iniciar Sesión</span>
                <ArrowRight className="size-4" />
              </a>
              <a
                href="/academia"
                className="w-full h-11 rounded-xl bg-transparent border border-[#B39A6A]/30 text-obsidian/80 font-medium hover:bg-ivory/50 transition-all flex items-center justify-center text-xs tracking-wider uppercase"
              >
                Volver a Academia
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
