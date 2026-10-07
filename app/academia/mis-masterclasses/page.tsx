'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Container } from '@/components/site/container';
import { useAuth } from '@/lib/auth/auth-context';
import {
  fetchStudentDashboardData,
  StudentDashboardData,
} from '@/lib/academy/student-dashboard-service';
import {
  GraduationCap,
  BookOpen,
  LogOut,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  LayoutDashboard,
  AlertCircle,
  Mail,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function MisMasterclassesPage() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadData = useCallback(async (userId: string) => {
    setDataLoading(true);
    setFetchError(null);
    try {
      const data = await fetchStudentDashboardData(userId);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error al cargar masterclasses:', err?.message || err);
      setFetchError('No pudimos cargar tu información en este momento.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!authLoading) {
      if (!user) {
        window.location.href = '/cuenta/iniciar-sesion?returnTo=/academia/mis-masterclasses';
      } else if (user.id) {
        loadData(user.id);
      }
    }

    const handleFocus = () => {
      if (user?.id) {
        loadData(user.id);
      }
    };

    const handleCustomProgress = () => {
      if (user?.id) {
        loadData(user.id);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('storage', handleFocus);
    window.addEventListener('salud_forte_progress_updated', handleCustomProgress);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('storage', handleFocus);
      window.removeEventListener('salud_forte_progress_updated', handleCustomProgress);
    };
  }, [user, authLoading, loadData]);

  if (authLoading || (dataLoading && !dashboardData)) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-10 border-3 border-champagne border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg text-obsidian font-medium">Accediendo a tu biblioteca clínica...</p>
        <p className="text-xs text-obsidian/60 mt-1">Sincronizando licencias y progreso académico</p>
      </div>
    );
  }

  const isDoctor = profile?.role === 'ADMIN' || profile?.role === 'INSTRUCTOR';
  const activeEntitlements = dashboardData?.activeEntitlements || [];
  const lessons = dashboardData?.lessons || [];
  const progress = dashboardData?.progress || [];

  return (
    <div className="bg-ivory min-h-screen text-obsidian">
      {/* Top Header */}
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 border-b border-[#B39A6A]/20 bg-[#F9F7F2]">
        <Container className="max-w-[1140px] mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B39A6A]/15 text-[#8A7347] text-[11px] font-semibold uppercase tracking-[0.14em]">
                <GraduationCap className="size-3.5 text-champagne" />
                <span>Área Académica Privada</span>
              </div>
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl text-obsidian font-medium tracking-tight">
                Mis Masterclasses
              </h1>
              <p className="mt-2 text-sm sm:text-base text-obsidian/70 max-w-xl">
                Tus programas de educación médica continuada impartidos por el Dr. Mauricio Benjamín Galindo López.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isDoctor && (
                <Link
                  href="/admin/academia"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian text-champagne text-xs font-semibold hover:bg-[#07182A] transition-all border border-champagne/30 shadow-xs"
                >
                  <LayoutDashboard className="size-3.5" />
                  <span>Panel del Instructor</span>
                </Link>
              )}

              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#B39A6A]/20 text-xs shadow-xs">
                <div className="size-8 rounded-full bg-champagne/20 text-obsidian font-bold flex items-center justify-center uppercase">
                  {profile?.first_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </div>
                <div className="truncate max-w-[140px]">
                  <div className="font-semibold text-obsidian truncate">{profile?.full_name || 'Alumno Salud Forte'}</div>
                  <div className="text-[11px] text-obsidian/50 truncate">{user?.email}</div>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-obsidian/40 hover:text-obsidian hover:bg-obsidian/5 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <section className="py-12 sm:py-16">
        <Container className="max-w-[1140px] mx-auto px-5 sm:px-8">
          {/* Email verification reminder banner if not verified */}
          {user && !user.email_verified && !isDoctor && (
            <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-amber-600 shrink-0" />
                <span>
                  Tu correo electrónico aún no ha sido verificado. Recuerda verificarlo para acceder al reproductor de lecciones.
                </span>
              </div>
              <Link
                href="/cuenta/verificar"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
              >
                Verificar ahora
              </Link>
            </div>
          )}

          {fetchError && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-800 border border-red-200 text-xs mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{fetchError}</span>
              </div>
              {user?.id && (
                <button
                  onClick={() => loadData(user.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-semibold transition-colors"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Intentar nuevamente</span>
                </button>
              )}
            </div>
          )}

          {activeEntitlements.length === 0 ? (
            /* FASE 7 & 8: Premium Empty State */
            <div className="p-10 sm:p-14 rounded-3xl bg-white border border-[#B39A6A]/25 text-center max-w-xl mx-auto shadow-xs">
              <div className="size-16 rounded-full bg-champagne/10 text-champagne flex items-center justify-center mx-auto mb-4 border border-champagne/20">
                <GraduationCap className="size-8 text-[#8A7347]" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-obsidian mb-2">
                Tu biblioteca está lista para comenzar
              </h2>
              <p className="text-xs sm:text-sm text-obsidian/70 leading-relaxed mb-6">
                Cuando adquieras o recibas acceso a una masterclass, aparecerá aquí junto con tus lecciones y avance.
              </p>
              <Link
                href="/academia"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-obsidian text-white text-xs font-semibold hover:bg-[#07182A] transition-all shadow-md"
              >
                <span>Explorar Masterclasses</span>
                <ExternalLink className="size-3.5 text-champagne" />
              </Link>
            </div>
          ) : (
            /* Grid of Enrolled Masterclasses */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#B39A6A]/15">
                <span className="text-xs font-semibold tracking-wider uppercase text-obsidian/60">
                  {activeEntitlements.length} {activeEntitlements.length === 1 ? 'Masterclass activa' : 'Masterclasses activas'}
                </span>
                <Link
                  href="/academia"
                  className="text-xs text-champagne hover:text-[#8A7347] font-semibold flex items-center gap-1"
                >
                  <span>Ver catálogo completo</span>
                  <ExternalLink className="size-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeEntitlements.map((ent) => {
                  const course = ent.masterclass;
                  if (!course) return null;

                  const mcLessons = lessons.filter(
                    (l) =>
                      l.masterclass_id === course.id ||
                      l.masterclass_id === ent.masterclass_id ||
                      (course.slug && (l.masterclass_id === course.slug || l.slug?.startsWith(course.slug)))
                  );

                  const isLessonCompleted = (l: (typeof mcLessons)[0]) => {
                    const p = progress.find(
                      (prog) =>
                        prog.lesson_id === l.id ||
                        prog.lesson_id === l.slug ||
                        (l.slug && prog.lesson_id?.includes(l.slug))
                    );
                    return p?.completed === true || p?.progress_percent === 100;
                  };

                  const totalLessonsCount = mcLessons.length;
                  const completedCount = mcLessons.filter(isLessonCompleted).length;

                  const progressPercent =
                    totalLessonsCount > 0
                      ? Math.min(100, Math.round((completedCount / totalLessonsCount) * 100))
                      : 0;

                  const isComplete = totalLessonsCount > 0 && completedCount === totalLessonsCount;

                  const inProgressLesson = progress
                    .filter((p) => p.progress_percent > 0 && mcLessons.some((l) => l.id === p.lesson_id || l.slug === p.lesson_id))
                    .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())[0];

                  const targetLesson =
                    mcLessons.find((item) => item.id === inProgressLesson?.lesson_id || item.slug === inProgressLesson?.lesson_id) || mcLessons[0];
                  const playUrl = targetLesson?.slug
                    ? `/academia/${course.slug}/leccion/${targetLesson.slug}`
                    : `/academia/${course.slug}`;

                  return (
                    <div
                      key={ent.id}
                      className="p-5 rounded-2xl bg-white border border-[#B39A6A]/25 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        {/* Course Image */}
                        <Link href={playUrl} className="block aspect-16/10 rounded-xl overflow-hidden mb-4 bg-[#0D2235] relative group/img">
                          <img
                            src={course.cover_image || '/images/course-default.jpg'}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#0D2235]/85 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider">
                            {course.category || 'Educación Médica'}
                          </div>
                          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                            <ShieldCheck className="size-3" />
                            <span>Acceso Activo</span>
                          </div>
                        </Link>

                        {/* Title & Subtitle */}
                        <h3 className="font-serif text-lg text-obsidian font-bold leading-snug mb-1.5 line-clamp-2">
                          <Link href={playUrl} className="hover:text-champagne transition-colors">
                            {course.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-obsidian/65 line-clamp-2 mb-4 leading-relaxed">
                          {course.subtitle || course.short_description || 'Impartido por el Dr. Mauricio Benjamín Galindo López.'}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4 bg-[#F9F7F2] p-3 rounded-xl border border-[#B39A6A]/15">
                          <div className="flex items-center justify-between text-[11px] text-obsidian/75 font-medium mb-1.5">
                            <span>Progreso de estudio</span>
                            <span className="font-mono font-semibold text-champagne">
                              {progressPercent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-champagne rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-obsidian/50 mt-1.5">
                            <span>
                              {completedCount} de {totalLessonsCount} lecciones completadas
                            </span>
                            {isComplete && (
                              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                <CheckCircle2 className="size-2.5" /> Finalizada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action CTA */}
                      <Link
                        href={playUrl}
                        className="w-full py-2.5 px-4 rounded-xl bg-obsidian text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#07182A] transition-all shadow-xs"
                      >
                        <Play className="size-3.5 fill-white text-white" />
                        <span>{progressPercent > 0 ? 'Continuar Lección' : 'Comenzar Masterclass'}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
