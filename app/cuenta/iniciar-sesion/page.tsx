import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

function sanitizeRedirect(param: string | null, fallback: string): string {
  if (!param) return fallback;
  const decoded = decodeURIComponent(param).trim();
  if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes(':\\')) {
    return decoded;
  }
  return fallback;
}

export default function LoginPage() {
  const { signIn, resendVerification, isAuthenticated, isLoading, isAdmin } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const searchParams = new URLSearchParams(window.location.search);
      const target = sanitizeRedirect(
        searchParams.get('redirect') || searchParams.get('returnTo'),
        isAdmin ? '/admin/academia' : '/mi-cuenta'
      );
      window.location.href = target;
    }
  }, [isAuthenticated, isLoading, isAdmin]);

  // Check URL parameters for notice messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setSuccessMsg('¡Correo verificado con éxito! Ahora puedes iniciar sesión.');
    } else if (params.get('reset') === 'true') {
      setSuccessMsg('Contraseña restablecida exitosamente. Inicia sesión con tu nueva contraseña.');
    } else if (params.get('logout') === 'true') {
      setSuccessMsg('Has cerrado sesión de forma segura.');
    }
  }, []);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    setUnconfirmedEmail(null);

    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Acceso concedido. Entrando a tu área privada...');
      setTimeout(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const target = sanitizeRedirect(
          searchParams.get('redirect') || searchParams.get('returnTo'),
          result.user?.role === 'ADMIN' ? '/admin/academia' : '/mi-cuenta'
        );
        window.location.href = target;
      }, 400);
    } else {
      setError(result.error || 'Correo electrónico o contraseña incorrectos.');
      if (result.isUnconfirmed) {
        setUnconfirmedEmail(email.toLowerCase().trim());
      }
    }
  };

  const handleResendClick = async () => {
    if (!unconfirmedEmail || resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);

    const res = await resendVerification(unconfirmedEmail);
    setResending(false);

    if (res.success) {
      setSuccessMsg('Te hemos enviado un nuevo correo de verificación. Por favor revisa tu bandeja de entrada o spam.');
      setResendCooldown(60);
    } else {
      setError(res.error || 'No se pudo reenviar el correo de verificación.');
    }
  };

  return (
    <div className="bg-ivory min-h-[calc(100dvh-5rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#B39A6A]/20">
        
        {/* Header Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-navy-50 text-navy-800 border border-navy-200/60">
            <ShieldCheck className="size-3.5 text-champagne" />
            ÁREA PRIVADA
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium text-center mb-2">
          Inicia sesión
        </h1>
        
        <p className="text-obsidian/70 text-center mb-6 sm:mb-8 text-sm leading-relaxed">
          Consulta tus compras, continúa tus masterclasses y revisa tu avance desde un solo lugar.
        </p>

        {/* Status Alerts */}
        {error && (
          <div aria-live="polite" className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 text-red-600 mt-0.5" />
              <div className="font-medium leading-snug">{error}</div>
            </div>

            {unconfirmedEmail && (
              <div className="pt-2 border-t border-red-200/60 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleResendClick}
                  disabled={resendCooldown > 0 || resending}
                  className="w-full h-9 rounded-lg bg-red-700 text-white font-medium hover:bg-red-800 transition-colors disabled:opacity-50 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`size-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0
                    ? `Reenviar en ${resendCooldown}s`
                    : resending
                    ? 'Enviando...'
                    : 'Reenviar correo de verificación'}
                </button>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div aria-live="polite" className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="font-medium leading-snug">{successMsg}</div>
          </div>
        )}

        {/* Email & Password Login Form */}
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
                autoCapitalize="none"
                spellCheck="false"
              />
              <Mail className="absolute left-3.5 top-3.5 size-5 text-obsidian/40 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold text-obsidian/60 tracking-wider uppercase">
                Contraseña
              </label>
              <a 
                href="/cuenta/recuperar-contrasena" 
                className="text-xs text-champagne hover:text-[#8A7347] font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-11 rounded-xl border border-[#B39A6A]/30 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-colors bg-ivory/20 text-sm text-obsidian placeholder:text-obsidian/40"
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
              <Lock className="absolute left-3.5 top-3.5 size-5 text-obsidian/40 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 text-obsidian/40 hover:text-obsidian transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting || !email || !password}
            className="w-full h-12 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99] duration-150 text-sm tracking-wide uppercase mt-4"
          >
            {submitting ? 'Verificando...' : 'ENTRAR A MI CUENTA'}
            {!submitting && <ArrowRight className="size-4" />}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-[#B39A6A]/15 text-center text-sm text-obsidian/70">
          <span>¿No tienes una cuenta? </span>
          <a 
            href="/cuenta/registro" 
            className="text-champagne font-medium hover:text-[#8A7347] underline underline-offset-4 decoration-champagne/40"
          >
            Créala aquí.
          </a>
        </div>

      </div>
    </div>
  );
}
