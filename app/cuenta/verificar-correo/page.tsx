import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const { verifyEmail, resendVerification } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('token') || params.get('code') || hashParams.get('access_token');
    const emailParam = params.get('email') || '';

    if (emailParam) {
      setUserEmail(emailParam);
    }

    const runVerification = async () => {
      const result = await verifyEmail(token || undefined);
      
      // Sanitize URL to remove sensitive tokens from address bar
      if (typeof window !== 'undefined' && (token || window.location.hash)) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Tu correo electrónico ha sido verificado satisfactoriamente.');
      } else {
        setStatus('error');
        setMessage(result.error || 'El enlace de verificación no es válido o ha expirado.');
      }
    };

    runVerification();
  }, [verifyEmail]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!userEmail || resendCooldown > 0 || resending) return;
    setResending(true);

    const res = await resendVerification(userEmail);
    setResending(false);

    if (res.success) {
      setMessage(res.message || 'Te hemos enviado un nuevo correo de verificación. Revisa tu bandeja de entrada o spam.');
      setResendCooldown(60);
    } else {
      setMessage(res.error || 'No se pudo reenviar el correo de verificación.');
    }
  };

  return (
    <div className="bg-ivory min-h-[calc(100dvh-5rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#B39A6A]/20 text-center">
        
        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="py-8 space-y-4">
            <Loader2 className="size-12 animate-spin text-champagne mx-auto" />
            <h1 className="font-serif text-2xl text-obsidian font-medium">
              Verificando tu correo...
            </h1>
            <p className="text-obsidian/70 text-sm">
              Por favor espera mientras validamos tu confirmación de seguridad.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="space-y-5">
            <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-navy-50 text-navy-800 border border-navy-200/60">
              <ShieldCheck className="size-3.5 text-champagne" />
              CORREO VERIFICADO
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium">
              ¡Bienvenido a Salud Forte!
            </h1>

            <p className="text-obsidian/75 text-sm leading-relaxed">
              {message} Tu cuenta está completamente activa y lista para ser utilizada.
            </p>

            <a
              href="/cuenta/iniciar-sesion?verified=true"
              className="w-full h-12 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all flex items-center justify-center gap-2 text-xs tracking-wider uppercase mt-4"
            >
              <span>INICIAR SESIÓN</span>
              <ArrowRight className="size-4" />
            </a>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-5">
            <div className="size-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="size-8" />
            </div>

            <h1 className="font-serif text-2xl text-obsidian font-medium">
              Verificación de correo
            </h1>

            <p className="text-obsidian/75 text-sm leading-relaxed">
              {message}
            </p>

            {userEmail ? (
              <div className="p-4 rounded-xl bg-ivory border border-[#B39A6A]/20 text-left space-y-3">
                <p className="text-xs text-obsidian/70">
                  Dirección: <strong>{userEmail}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resending}
                  className="w-full h-10 rounded-lg bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                >
                  <RefreshCw className={`size-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0
                    ? `Reenviar en ${resendCooldown}s`
                    : resending
                    ? 'Enviando...'
                    : 'Reenviar enlace de verificación'}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-ivory border border-[#B39A6A]/20 text-xs text-obsidian/70">
                Si aún no has recibido tu enlace de confirmación, puedes solicitarlo nuevamente desde la pantalla de inicio de sesión.
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/cuenta/iniciar-sesion"
                className="w-full h-11 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all flex items-center justify-center gap-2 text-xs tracking-wider uppercase"
              >
                Volver al inicio de sesión
              </a>
              <a
                href="/cuenta/registro"
                className="w-full h-11 rounded-xl bg-ivory text-obsidian font-medium border border-[#B39A6A]/30 hover:bg-ivory/60 transition-all flex items-center justify-center gap-2 text-xs tracking-wider uppercase"
              >
                Registrar nueva cuenta
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
