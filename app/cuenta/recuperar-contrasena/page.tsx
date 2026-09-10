import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;

    setSubmitting(true);
    setError(null);

    const res = await requestPasswordReset(email);
    setSubmitting(false);

    if (res.success) {
      setSent(true);
    } else {
      setError(res.error || 'Ocurrió un error. Intenta nuevamente.');
    }
  };

  return (
    <div className="bg-ivory min-h-[calc(100dvh-5rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#B39A6A]/20">
        
        {/* Header Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-navy-50 text-navy-800 border border-navy-200/60">
            <ShieldCheck className="size-3.5 text-champagne" />
            RECUPERACIÓN SEGURA
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium text-center mb-2">
          ¿Olvidaste tu contraseña?
        </h1>

        <p className="text-obsidian/70 text-center mb-6 text-sm leading-relaxed">
          Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace de un solo uso para restablecerla.
        </p>

        {error && (
          <div aria-live="polite" className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-red-600 mt-0.5" />
            <div className="font-medium leading-snug">{error}</div>
          </div>
        )}

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="size-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-7" />
            </div>
            <p className="text-sm text-obsidian/80 leading-relaxed">
              Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un correo con las instrucciones para restablecer tu contraseña. El enlace es válido durante 1 hora.
            </p>
            <div className="pt-4">
              <a
                href="/cuenta/iniciar-sesion"
                className="w-full h-11 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all flex items-center justify-center gap-2 text-xs tracking-wider uppercase"
              >
                Volver a Iniciar Sesión
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-obsidian/60 mb-1.5 tracking-wider uppercase">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#B39A6A]/30 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-colors bg-ivory/20 text-sm text-obsidian placeholder:text-obsidian/40"
                  placeholder="tu.correo@ejemplo.com"
                  autoComplete="email"
                />
                <Mail className="absolute left-3.5 top-3.5 size-5 text-obsidian/40 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !email}
              className="w-full h-12 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs tracking-wider uppercase cursor-pointer mt-4"
            >
              {submitting ? 'Enviando...' : 'ENVIAR ENLACE DE RECUPERACIÓN'}
              {!submitting && <ArrowRight className="size-4" />}
            </button>

            <div className="pt-4 text-center">
              <a
                href="/cuenta/iniciar-sesion"
                className="inline-flex items-center gap-1.5 text-xs text-obsidian/60 hover:text-obsidian transition-colors font-medium"
              >
                <ArrowLeft className="size-3.5" />
                <span>Regresar al inicio de sesión</span>
              </a>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
