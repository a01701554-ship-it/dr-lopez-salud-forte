import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
    } else {
      setError('Enlace inválido o sin token de seguridad.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !token) return;

    if (password.length < 10) {
      setError('La nueva contraseña debe tener al menos 10 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await resetPassword(token, password, confirmPassword);
    setSubmitting(false);

    if (res.success) {
      window.location.href = '/cuenta/iniciar-sesion?reset=true';
    } else {
      setError(res.error || 'No se pudo actualizar la contraseña.');
    }
  };

  return (
    <div className="bg-ivory min-h-[calc(100dvh-5rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#B39A6A]/20">
        
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-navy-50 text-navy-800 border border-navy-200/60">
            <ShieldCheck className="size-3.5 text-champagne" />
            NUEVA CONTRASEÑA
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium text-center mb-2">
          Restablece tu contraseña
        </h1>

        <p className="text-obsidian/70 text-center mb-6 text-sm leading-relaxed">
          Ingresa una nueva contraseña segura de al menos 10 caracteres.
        </p>

        {error && (
          <div aria-live="polite" className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-red-600 mt-0.5" />
            <div className="font-medium leading-snug">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-obsidian/60 mb-1.5 tracking-wider uppercase">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-11 rounded-xl border border-[#B39A6A]/30 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-colors bg-ivory/20 text-sm text-obsidian placeholder:text-obsidian/40"
                placeholder="Mínimo 10 caracteres"
                autoComplete="new-password"
              />
              <Lock className="absolute left-3.5 top-3.5 size-5 text-obsidian/40 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 text-obsidian/40 hover:text-obsidian transition-colors"
                aria-label={showPassword ? 'Ocultar' : 'Ver'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-obsidian/60 mb-1.5 tracking-wider uppercase">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={10}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-11 rounded-xl border border-[#B39A6A]/30 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-colors bg-ivory/20 text-sm text-obsidian placeholder:text-obsidian/40"
                placeholder="Repite la contraseña"
                autoComplete="new-password"
              />
              <Lock className="absolute left-3.5 top-3.5 size-5 text-obsidian/40 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !password || !token}
            className="w-full h-12 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs tracking-wider uppercase cursor-pointer mt-4"
          >
            {submitting ? 'Guardando...' : 'GUARDAR NUEVA CONTRASEÑA'}
            {!submitting && <ArrowRight className="size-4" />}
          </button>
        </form>

      </div>
    </div>
  );
}
