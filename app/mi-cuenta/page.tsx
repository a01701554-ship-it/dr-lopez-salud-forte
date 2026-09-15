'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Container } from '@/components/site/container';
import { AccountHeader } from '@/components/account/account-nav';
import { useAuth } from '@/lib/auth/auth-context';
import {
  fetchStudentDashboardData,
  StudentDashboardData,
} from '@/lib/academy/student-dashboard-service';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Play,
  Package,
  User,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function MyAccountPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async (userId: string) => {
    setDataLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchStudentDashboardData(userId);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error al cargar datos de la cuenta:', err?.message || err);
      setErrorMsg('No pudimos cargar tu información en este momento.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        if (typeof window !== 'undefined') {
          window.location.href = '/cuenta/iniciar-sesion?redirect=/mi-cuenta';
        }
      } else if (user.id) {
        loadData(user.id);
      }
    }
  }, [user, authLoading, loadData]);

  if (authLoading || (dataLoading && !dashboardData)) {
    return (
      <div className="bg-ivory min-h-screen text-obsidian">
        <AccountHeader currentTab="resumen" />
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="size-10 border-3 border-champagne border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-lg text-obsidian font-medium">Cargando tu área personal...</p>
          <p className="text-xs text-obsidian/60 mt-1">Sincronizando estado académico y pedidos</p>
        </div>
      </div>
    );
  }

  const activeEntitlements = dashboardData?.activeEntitlements || [];
  const continueItem = dashboardData?.continueItem;
  const orders = dashboardData?.orders || [];

  return (
    <div className="bg-ivory min-h-screen text-obsidian pb-20 font-sans">
      <AccountHeader currentTab="resumen" />

      <Container className="max-w-[1120px] mx-auto px-5 sm:px-8 mt-10 space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
            {user?.id && (
              <button
                onClick={() => loadData(user.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Intentar nuevamente</span>
              </button>
            )}
          </div>
        )}

        {/* Continue Learning Banner */}
        {continueItem && (
          <div className="rounded-2xl border border-[#B39A6A]/30 bg-gradient-to-r from-[#0D2235] to-[#111820] text-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-champagne bg-white/10 px-3 py-1 rounded-full">
                  <Play className="size-3 fill-current" />
                  Continuar aprendiendo
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                  {continueItem.masterclassTitle}
                </h2>
                <p className="text-xs sm:text-sm text-white/70">
                  Lección {continueItem.lessonPosition}: {continueItem.lessonTitle}
                </p>
                <div className="w-full max-w-xs bg-white/20 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-champagne h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, continueItem.progressPercent))}%` }}
                  />
                </div>
              </div>

              <Link
                href={`/academia/${continueItem.masterclassSlug}/leccion/${continueItem.lessonSlug}`}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-champagne text-obsidian text-xs font-semibold uppercase tracking-wider hover:bg-[#c9b183] transition-colors shrink-0 shadow-sm"
              >
                <span>Reanudar clase</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-obsidian/60">
                Masterclasses
              </span>
              <GraduationCap className="size-5 text-champagne" />
            </div>
            <div className="font-serif text-3xl text-obsidian font-medium mt-3">
              {activeEntitlements.length}
            </div>
            <Link
              href="/mi-cuenta/masterclasses"
              className="mt-3 text-xs text-champagne hover:text-[#8A7347] font-semibold inline-flex items-center gap-1"
            >
              <span>Ver mis masterclasses</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-obsidian/60">
                Progreso General
              </span>
              <CheckCircle2 className="size-5 text-emerald-600" />
            </div>
            <div className="font-serif text-3xl text-obsidian font-medium mt-3">
              {dashboardData?.overallProgressPercent || 0}%
            </div>
            <div className="text-xs text-obsidian/60 mt-3">
              {dashboardData?.programsInProgressCount || 0} programas en progreso
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-obsidian/60">
                Pedidos Registrados
              </span>
              <Package className="size-5 text-champagne" />
            </div>
            <div className="font-serif text-3xl text-obsidian font-medium mt-3">
              {orders.length}
            </div>
            <Link
              href="/mi-cuenta/pedidos"
              className="mt-3 text-xs text-champagne hover:text-[#8A7347] font-semibold inline-flex items-center gap-1"
            >
              <span>Ver pedidos</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Quick Links / Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Courses Preview */}
          <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#B39A6A]/15">
                <h3 className="font-serif text-xl font-medium text-obsidian">Masterclasses Activas</h3>
                <Link
                  href="/mi-cuenta/masterclasses"
                  className="text-xs font-semibold text-champagne hover:text-[#8A7347] flex items-center gap-1"
                >
                  <span>Ver todas</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              {activeEntitlements.length === 0 ? (
                <div className="py-8 text-center text-xs text-obsidian/60 space-y-3">
                  <GraduationCap className="size-8 text-[#B39A6A]/40 mx-auto" />
                  <p>Aún no tienes masterclasses activas en tu biblioteca.</p>
                  <Link
                    href="/academia"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-champagne hover:underline"
                  >
                    <span>Explorar catálogo educativo</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              ) : (
                <div className="mt-4 divide-y divide-[#B39A6A]/10">
                  {activeEntitlements.slice(0, 3).map((ent) => (
                    <div key={ent.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-obsidian truncate">
                          {ent.masterclass?.title || 'Masterclass'}
                        </div>
                        <div className="text-[11px] text-obsidian/50">
                          {ent.masterclass?.category || 'Educación Médica'}
                        </div>
                      </div>
                      <Link
                        href={`/academia/${ent.masterclass?.slug || ''}`}
                        className="text-xs text-champagne font-semibold shrink-0 hover:underline"
                      >
                        Abrir
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#B39A6A]/15 flex items-center justify-between text-xs text-obsidian/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-champagne" />
                <span>Acceso ilimitado a contenidos oficiales</span>
              </span>
            </div>
          </div>

          {/* User Profile & Security Overview */}
          <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#B39A6A]/15">
                <h3 className="font-serif text-xl font-medium text-obsidian">Perfil y Seguridad</h3>
                <Link
                  href="/mi-cuenta/perfil"
                  className="text-xs font-semibold text-champagne hover:text-[#8A7347] flex items-center gap-1"
                >
                  <span>Administrar</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-stone/40">
                  <span className="text-obsidian/60">Nombre completo</span>
                  <span className="font-medium text-obsidian">{profile?.full_name || 'No proporcionado'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone/40">
                  <span className="text-obsidian/60">Correo electrónico</span>
                  <span className="font-medium text-obsidian">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-stone/40">
                  <span className="text-obsidian/60">Estado de la cuenta</span>
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Activa
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#B39A6A]/15 flex items-center justify-between">
              <Link
                href="/mi-cuenta/perfil"
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-ivory border border-[#B39A6A]/30 text-obsidian text-xs font-semibold hover:bg-ivory/80 transition-colors"
              >
                <User className="size-3.5 text-champagne" />
                <span>Editar información de perfil</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
