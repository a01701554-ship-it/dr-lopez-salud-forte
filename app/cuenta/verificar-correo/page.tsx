import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, ShieldCheck, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('El enlace de verificación no contiene un token válido.');
      return;
    }

    const runVerification = async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Tu correo electrónico ha sido verificado satisfactoriamente.');
      } else {
        setStatus('error');
        setMessage(result.error || 'El enlace de verificación es inválido o ha expirado.');
      }
    };

    runVerification();
  }, [verifyEmail]);

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
              Por favor espera mientras validamos tu token criptográfico de seguridad.
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
              IDENTIDAD CONFIRMADA
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium">
              ¡Correo verificado!
            </h1>

            <p className="text-obsidian/75 text-sm leading-relaxed">
              {message} Todas las compras y masterclasses asociadas a tu dirección han sido vinculadas a tu cuenta.
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
              Enlace no válido o expirado
            </h1>

            <p className="text-obsidian/75 text-sm leading-relaxed">
              {message} Por seguridad, los enlaces de verificación expiran tras 24 horas y sólo pueden utilizarse una sola vez.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/cuenta/iniciar-sesion"
                className="w-full h-11 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all flex items-center justify-center gap-2 text-xs tracking-wider uppercase"
              >
                Volver a Iniciar Sesión
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
