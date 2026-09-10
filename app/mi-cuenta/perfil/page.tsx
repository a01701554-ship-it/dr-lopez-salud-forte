'use client';

import React, { useEffect } from 'react';
import { Container } from '@/components/site/container';
import { AccountHeader } from '@/components/account/account-nav';
import { useAuth } from '@/lib/auth/auth-context';
import Link from 'next/link';
import { User, Mail, Shield, AlertCircle, KeyRound, Lock } from 'lucide-react';

export default function MiPerfilPage() {
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/cuenta/iniciar-sesion?redirect=/mi-cuenta/perfil';
      }
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center">
          <div className="size-10 rounded-full border-2 border-[#B39A6A] border-t-transparent animate-spin mb-4" />
          <p className="font-serif text-lg text-obsidian">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen text-obsidian pb-20">
      <AccountHeader currentTab="perfil" />

      <Container className="max-w-[1120px] mx-auto px-5 sm:px-8 mt-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="pb-4 border-b border-[#B39A6A]/20">
            <h2 className="font-serif text-2xl text-obsidian font-medium">
              Datos Personales y Seguridad
            </h2>
            <p className="text-xs sm:text-sm text-obsidian/70 mt-0.5">
              Administra tu perfil de usuario y credenciales de acceso.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#B39A6A]/20 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="font-serif text-xl font-medium text-obsidian pb-3 border-b border-[#B39A6A]/10">
              Información de la Cuenta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-[#B39A6A]/10 text-champagne flex items-center justify-center shrink-0">
                  <User className="size-5 text-[#8A7347]" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-obsidian/50">
                    Nombre completo
                  </div>
                  <div className="text-base font-medium text-obsidian mt-0.5">
                    {profile?.full_name || 'No proporcionado'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-[#B39A6A]/10 text-champagne flex items-center justify-center shrink-0">
                  <Mail className="size-5 text-[#8A7347]" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-obsidian/50">
                    Correo electrónico
                  </div>
                  <div className="text-base font-medium text-obsidian mt-0.5">
                    {user?.email}
                  </div>
                  {!user?.email_verified && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      <AlertCircle className="size-3" />
                      <span>Correo no verificado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security & Password */}
          <div className="bg-white rounded-2xl border border-[#B39A6A]/20 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="font-serif text-xl font-medium text-obsidian pb-3 border-b border-[#B39A6A]/10 flex items-center justify-between">
              <span>Seguridad de Acceso</span>
              <Shield className="size-5 text-champagne" />
            </h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-[#0D2235]/5 text-obsidian flex items-center justify-center shrink-0">
                  <KeyRound className="size-5 text-champagne" />
                </div>
                <div>
                  <div className="text-base font-medium text-obsidian">
                    Contraseña de la cuenta
                  </div>
                  <div className="text-xs text-obsidian/65 mt-0.5">
                    Se recomienda actualizar periódicamente para mayor seguridad.
                  </div>
                </div>
              </div>

              <Link
                href="/cuenta/recuperar-contrasena"
                className="inline-flex items-center justify-center h-[42px] px-5 rounded-full border border-obsidian/30 text-obsidian text-xs font-semibold uppercase tracking-wider hover:bg-obsidian/5 transition-colors shrink-0"
              >
                Cambiar contraseña
              </Link>
            </div>
          </div>

          {/* Privacy & Compliance */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#B39A6A]/20 flex items-start gap-4">
            <Lock className="size-5 text-champagne shrink-0 mt-0.5" />
            <div className="text-xs text-obsidian/75 leading-relaxed">
              <strong>Protección de Privacidad Médica:</strong> Salud Forte protege rigurosamente tu identidad digital. No almacenamos registros clínicos ni expedientes médicos en este panel general de usuario.
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
