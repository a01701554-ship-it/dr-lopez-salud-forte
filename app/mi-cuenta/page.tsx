'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Container } from '@/components/site/container';
import { AccountHeader } from '@/components/account/account-nav';
import { useAuth } from '@/lib/auth/auth-context';
import {
  fetchStudentDashboardData,
  StudentDashboardData,
} from '@/lib/academy/student-dashboard-service';
import {
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Package,
  Award,
  ShieldCheck,
  Headphones,
  Sparkles,
  AlertCircle,
  RefreshCw,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';

export default function MyAccountPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDashboard = useCallback(async (userId: string) => {
    setDataLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchStudentDashboardData(userId);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error al cargar panel de alumno:', err?.message || err);
      setErrorMsg('No pudimos cargar tu información en este momento.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!authLoading) {
      if (!user) {
        if (typeof window !== 'undefined') {
          window.location.href = '/cuenta/iniciar-sesion?redirect=/mi-cuenta';
        }
      } else if (user.id) {
        loadDashboard(user.id);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, loadDashboard]);

  if (authLoading || (dataLoading && !dashboardData)) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center">
          <div className="size-10 rounded-full border-2 border-[#B39A6A] border-t-transparent animate-spin mb-4" />
          <p className="font-serif text-lg text-obsidian font-medium">Cargando tu área privada...</p>
        </div>
      </div>
    );
  }

  const activeMasterclasses = dashboardData?.activeEntitlements || [];
  const continueItem = dashboardData?.continueItem;
  const orders = dashboardData?.orders || [];

  return (
    <div className="bg-ivory min-h-screen text-obsidian pb-20">
      <AccountHeader currentTab="resumen" />

      <Container className="max-w-[1120px] mx-auto px-5 sm:px-8 mt-10">
        {/* Error banner */}
        {errorMsg && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
            {user?.id && (
              <button
                onClick={() => loadDashboard(user.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-semibold transition-colors"
              >
                <RefreshCw className="size-3.5" />
                <span>Intentar nuevamente</span>
              </button>
            )}
          </div>
        )}

        {/* 1. Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-[#0D2235]/5 text-obsidian flex items-center justify-center shrink-0">
              <BookOpen className="size-5 text-champagne" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-obsidian">
                {dashboardData?.activeMasterclassesCount ?? 0}
              </div>
              <div className="text-xs text-obsidian/65 font-medium">Masterclasses activas</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-obsidian">
                {dashboardData?.overallProgressPercent ?? 0}%
              </div>
              <div className="text-xs text-obsidian/65 font-medium">Avance general</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-[#B39A6A]/15 text-[#8A7347] flex items-center justify-center shrink-0">
              <Award className="size-5 text-champagne" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-obsidian">
                {dashboardData?.programsInProgressCount ?? 0}
              </div>
              <div className="text-xs text-obsidian/65 font-medium">Programas en curso</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Package className="size-5 text-amber-700" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-obsidian">
                {dashboardData?.registeredOrdersCount ?? 0}
              </div>
              <div className="text-xs text-obsidian/65 font-medium">Pedidos registrados</div>
            </div>
          </div>
        </div>

        {/* 2. Continuar Aprendiendo (Only when real progress exists) */}
        {continueItem && (
          <div className="mt-10 bg-[#0D2235] text-white rounded-[24px] p-6 sm:p-8 relative overflow-hidden shadow-md">
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-[#B39A6A]/10 pointer-events-none blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-champagne text-[10px] font-semibold uppercase tracking-wider border border-white/10 mb-3">
                  <Sparkles className="size-3" />
                  <span>Continuar donde lo dejaste</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium leading-tight">
                  {continueItem.masterclassTitle}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed line-clamp-2">
                  Lección actual: <strong>{continueItem.lessonTitle}</strong>
                </p>

                {/* Progress bar */}
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between text-xs text-white/70 mb-1.5 font-medium">
                    <span>Avance: {continueItem.progressPercent}%</span>
                    {continueItem.remainingSeconds !== null && (
                      <span>{Math.ceil(continueItem.remainingSeconds / 60)} min restantes</span>
                    )}
                  </div>
                  <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-champagne rounded-full transition-all duration-500"
                      style={{ width: `${continueItem.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  href={`/aprender/${continueItem.masterclassSlug}/${continueItem.lessonSlug || continueItem.lessonId}`}
                  className="inline-flex items-center justify-center gap-2.5 h-[50px] px-7 rounded-full bg-champagne text-obsidian text-xs font-bold uppercase tracking-wider hover:bg-[#C2AA7B] transition-colors shadow-sm"
                >
                  <Play className="size-4 fill-obsidian" />
                  <span>Reanudar clase</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3. Section Grid: Recent Masterclasses & Recent Orders */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Masterclasses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#B39A6A]/20">
              <h3 className="font-serif text-xl text-obsidian font-medium">
                Mis Masterclasses
              </h3>
              <Link
                href="/mi-cuenta/masterclasses"
                className="text-xs font-semibold uppercase tracking-wider text-champagne hover:text-[#8A7347] inline-flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {activeMasterclasses.length === 0 ? (
              /* FASE 7: Premium Empty State */
              <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#B39A6A]/20 text-center shadow-xs">
                <div className="size-14 rounded-full bg-[#B39A6A]/10 text-champagne flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="size-7 text-[#8A7347]" />
                </div>
                <h4 className="font-serif text-xl font-medium text-obsidian mb-2">
                  Tu biblioteca está lista para comenzar
                </h4>
                <p className="text-xs sm:text-sm text-obsidian/70 max-w-md mx-auto mb-6 leading-relaxed">
                  Cuando adquieras o recibas acceso a una masterclass, aparecerá aquí junto con tus lecciones y avance.
                </p>
                <Link
                  href="/academia"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors shadow-xs"
                >
                  <span>Explorar Masterclasses</span>
                  <ArrowRight className="size-3.5 text-champagne" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMasterclasses.map((ent) => {
                  const mc = ent.masterclass;
                  if (!mc) return null;

                  const mcLessons = dashboardData?.lessons.filter(
                    (l) => l.masterclass_id === mc.id
                  ) || [];

                  return (
                    <div
                      key={ent.id}
                      className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs hover:border-[#B39A6A]/45 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="size-16 rounded-xl overflow-hidden bg-[#0D2235] shrink-0">
                          <img
                            src={mc.cover_image || '/images/course-default.jpg'}
                            alt={mc.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="px-2 py-0.5 rounded-md bg-[#B39A6A]/15 text-[#8A7347] text-[10px] font-semibold uppercase tracking-wider">
                            {mc.category || 'Educación Médica'}
                          </span>
                          <h4 className="font-serif text-base text-obsidian font-medium mt-1 truncate">
                            {mc.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-obsidian/60 mt-1">
                            <span>{mcLessons.length} lecciones</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/aprender/${mc.slug}/${mcLessons[0]?.slug || mcLessons[0]?.id || 'inicio'}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-[42px] px-5 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors shrink-0"
                      >
                        <Play className="size-3.5 fill-champagne text-champagne" />
                        <span>Entrar</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Side Column: Orders & Support */}
          <div className="space-y-6">
            <div className="pb-3 border-b border-[#B39A6A]/20">
              <h3 className="font-serif text-xl text-obsidian font-medium">
                Últimos Pedidos
              </h3>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs text-center">
                <Package className="size-10 text-[#B39A6A]/50 mx-auto mb-3" />
                <h4 className="font-serif text-lg font-medium text-obsidian">
                  Sin pedidos recientes
                </h4>
                <p className="text-xs text-obsidian/70 mt-1 leading-relaxed">
                  Aquí aparecerá el estado de tus compras de suplementos y comprobantes digitales.
                </p>
                <Link
                  href="/tienda"
                  className="mt-4 inline-flex items-center justify-center h-[40px] px-5 rounded-full border border-obsidian/30 text-obsidian text-xs font-semibold uppercase tracking-wider hover:bg-obsidian/5 transition-colors"
                >
                  Explorar Tienda
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white p-4 rounded-xl border border-[#B39A6A]/20 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-obsidian font-mono">
                        #{ord.id.slice(0, 8)}
                      </div>
                      <div className="text-obsidian/60 text-[11px]">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-obsidian">
                        ${ord.total} {ord.currency || 'MXN'}
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-medium capitalize">
                        {ord.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Patient Support Card */}
            <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#B39A6A]/25 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[#8A7347]">
                <ShieldCheck className="size-4 text-champagne" />
                <span>Atención a Pacientes</span>
              </div>
              <h4 className="font-serif text-lg text-obsidian font-medium mt-2">
                ¿Dudas sobre tu cuenta o acceso?
              </h4>
              <p className="text-xs text-obsidian/70 mt-1 leading-relaxed">
                Si requieres asistencia con tus compras, credenciales o confirmaciones de pedido, contáctanos directamente.
              </p>
              <a
                href="https://wa.me/5215512345678?text=Hola,%20requiero%20asistencia%20con%20mi%20cuenta%20en%20Salud%20Forte"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 w-full h-[42px] rounded-full bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-900 transition-colors shadow-xs"
              >
                <Headphones className="size-4" />
                <span>Contacto por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

