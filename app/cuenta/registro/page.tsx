import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage() {
  const { signUp, isAuthenticated, isLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
  } | null>(null);

  // Auto redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const searchParams = new URLSearchParams(window.location.search);
      const target = searchParams.get('redirect') || searchParams.get('returnTo') || '/mi-cuenta';
      window.location.href = target;
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);

    // Client-side validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('Por favor completa tu nombre y apellidos.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor proporciona un correo electrónico válido.');
      return;
    }

    if (password.length < 10) {
      setError('La contraseña debe tener al menos 10 caracteres para garantizar su seguridad.');
      return;
    }

    if (password.length > 128) {
      setError('La contraseña no debe exceder 128 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Revisa que ambas sean idénticas.');
      return;
    }

    if (!termsAccepted) {
      setError('Debes aceptar los Términos de Servicio y el Aviso de Privacidad para continuar.');
      return;
    }

    setSubmitting(true);

    const result = await signUp({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirm_password: confirmPassword,
      terms_accepted: termsAccepted,
      marketing_consent: marketingConsent,
    });

    setSubmitting(false);

    if (result.success) {
      setSuccessInfo({
        message: result.message || 'Tu cuenta ha sido creada exitosamente.',
      });
    } else {
      setError(result.error || 'No se pudo crear la cuenta. Por favor verifica tus datos.');
    }
  };

  if (successInfo) {
    return (
      <div className="bg-ivory min-h-[calc(100dvh-5rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#B39A6A]/20 text-center">
          <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="size-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-navy-50 text-navy-800 border border-navy-200/60 mb-3">
            Paso 2: Verificación de correo
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium mb-3">
            ¡Revisa tu bandeja de entrada!
          </h1>

          <p className="text-obsidian/75 text-sm leading-relaxed mb-6">
            Hemos enviado un enlace seguro de verificación a{' '}
            <strong>{email}</strong>.
          </p>

          <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#B39A6A]/20 text-xs text-obsidian/70 text-left leading-relaxed mb-6 space-y-2">
            <p>
              <strong>Confirmación requerida:</strong> Haz clic en el enlace recibido en tu correo electrónico para verificar tu cuenta y comenzar a explorar tus masterclasses.
            </p>
            <p className="text-[11px] text-obsidian/60">
              Si no encuentras el correo en tu bandeja principal, revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>

          <a
            href="/cuenta/iniciar-sesion"
            className="w-full h-12 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all flex items-center justify-center gap-2 text-xs tracking-wider uppercase"
          >
            Ir a Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="bg-ivory min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-9 border-3 border-champagne border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-serif text-base text-obsidian font-medium">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-[calc(100dvh-5rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#B39A6A]/20">
        
        {/* Header Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-navy-50 text-navy-800 border border-navy-200/60">
            <ShieldCheck className="size-3.5 text-champagne" />
            REGISTRO DE PACIENTES & ALUMNOS
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium text-center mb-2">
          Crea tu cuenta
        </h1>
        
        <p className="text-obsidian/70 text-center mb-6 sm:mb-8 text-sm leading-relaxed">
          Accede a tus masterclasses, continúa tus lecciones y gestiona tu historial de salud con total seguridad.
        </p>

        {/* Error Alert */}
        {error && (
          <div aria-live="polite" className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-red-600 mt-0.5" />
            <div className="font-medium leading-snug">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre y Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-obsidian/60 mb-1.5 tracking-wider uppercase">
                Nombre
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#B39A6A]/30 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-colors bg-ivory/20 text-sm text-obsidian placeholder:text-obsidian/40"
                  placeholder="Carlos"
                  autoComplete="given-name"
                />
                <User className="absolute left-3.5 top-3.5 size-4 text-obsidian/40 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-obsidian/60 mb-1.5 tracking-wider uppercase">
                Apellidos
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#B39A6A]/30 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-colors bg-ivory/20 text-sm text-obsidian placeholder:text-obsidian/40"
                  placeholder="Gómez"
                  autoComplete="family-name"
                />
                <User className="absolute left-3.5 top-3.5 size-4 text-obsidian/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Correo Electrónico */}
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
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#B39A6A]/30 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-colors bg-ivory/20 text-sm text-obsidian placeholder:text-obsidian/40"
                placeholder="carlos.gomez@ejemplo.com"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck="false"
              />
              <Mail className="absolute left-3.5 top-3.5 size-4 text-obsidian/40 pointer-events-none" />
            </div>
            <p className="text-[11px] text-obsidian/50 mt-1">
              Utiliza el correo electrónico con el que te registrarás o realizarás tus compras.
            </p>
          </div>

          {/* Contraseña */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold text-obsidian/60 tracking-wider uppercase">
                Contraseña
              </label>
              <span className="text-[11px] text-obsidian/50">Mínimo 10 caracteres</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={10}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#B39A6A]/30 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-colors bg-ivory/20 text-sm text-obsidian placeholder:text-obsidian/40"
                placeholder="Al menos 10 caracteres o frase segura"
                autoComplete="new-password"
              />
              <Lock className="absolute left-3.5 top-3.5 size-4 text-obsidian/40 pointer-events-none" />
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

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-[11px] font-semibold text-obsidian/60 mb-1.5 tracking-wider uppercase">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={10}
                maxLength={128}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#B39A6A]/30 focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne transition-colors bg-ivory/20 text-sm text-obsidian placeholder:text-obsidian/40"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
              />
              <Lock className="absolute left-3.5 top-3.5 size-4 text-obsidian/40 pointer-events-none" />
            </div>
          </div>

          {/* Checkboxes de Términos y Consentimiento */}
          <div className="pt-2 space-y-3">
            {/* Obligatorio: Términos y Privacidad */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 size-4 rounded border-gray-300 text-obsidian focus:ring-champagne accent-obsidian shrink-0 cursor-pointer"
              />
              <span className="text-xs text-obsidian/75 leading-relaxed">
                Acepto de manera expresa los{' '}
                <a
                  href="/terminos"
                  target="_blank"
                  className="text-champagne font-medium underline underline-offset-2 hover:text-[#8A7347]"
                >
                  Términos de Servicio
                </a>{' '}
                y el{' '}
                <a
                  href="/privacidad"
                  target="_blank"
                  className="text-champagne font-medium underline underline-offset-2 hover:text-[#8A7347]"
                >
                  Aviso de Privacidad
                </a>
                . <span className="text-red-600 font-semibold">*</span>
              </span>
            </label>

            {/* Opcional: Consentimiento de Marketing */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-1 size-4 rounded border-gray-300 text-obsidian focus:ring-champagne accent-obsidian shrink-0 cursor-pointer"
              />
              <span className="text-xs text-obsidian/65 leading-relaxed">
                (Opcional) Deseo recibir boletines médicos educativos y avisos de nuevas masterclasses del Dr. Mauricio Galindo.
              </span>
            </label>
          </div>

          {/* Botón Crear Cuenta */}
          <button
            type="submit"
            disabled={submitting || !termsAccepted}
            className="w-full h-12 rounded-xl bg-obsidian text-white font-medium hover:bg-[#07182A] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99] duration-150 text-sm tracking-wide uppercase mt-6"
          >
            {submitting ? 'Creando cuenta...' : 'CREAR MI CUENTA'}
            {!submitting && <ArrowRight className="size-4" />}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-[#B39A6A]/15 text-center text-sm text-obsidian/70">
          <span>¿Ya tienes una cuenta? </span>
          <a
            href="/cuenta/iniciar-sesion"
            className="text-champagne font-medium hover:text-[#8A7347] underline underline-offset-4 decoration-champagne/40"
          >
            Inicia sesión aquí.
          </a>
        </div>

      </div>
    </div>
  );
}
