'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Container } from '@/components/site/container';
import { AccountHeader } from '@/components/account/account-nav';
import { useAuth } from '@/lib/auth/auth-context';
import {
  fetchStudentDashboardData,
  StudentDashboardData,
  EntitlementData,
} from '@/lib/academy/student-dashboard-service';
import {
  BookOpen,
  Play,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  Clock,
  ArrowRight,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function MisMasterclassesPage() {
  const { user, isLoading: authLoading } = useAuth();
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
      console.error('Error al cargar masterclasses:', err?.message || err);
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
          window.location.href = '/cuenta/iniciar-sesion?redirect=/mi-cuenta/masterclasses';
        }
      } else if (user.id) {
        loadData(user.id);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, loadData]);

  if (authLoading || (dataLoading && !dashboardData)) {
    return (
      <div className="bg-ivory min-h-screen text-obsidian">
        <AccountHeader currentTab="masterclasses" />
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="size-10 border-3 border-champagne border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-lg text-obsidian font-medium">Sincronizando tus masterclasses...</p>
          <p className="text-xs text-obsidian/60 mt-1">Verificando accesos autorizados y progreso de lecciones</p>
        </div>
      </div>
    );
  }

  const activeEntitlements = dashboardData?.activeEntitlements || [];
  const lessons = dashboardData?.lessons || [];
  const progress = dashboardData?.progress || [];

  return (
    <div className="bg-ivory min-h-screen text-obsidian pb-20">
      <AccountHeader currentTab="masterclasses" />

      <Container className="max-w-[1120px] mx-auto px-5 sm:px-8 mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#B39A6A]/20 gap-3">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-medium">
              Biblioteca de Masterclasses
            </h2>
            <p className="text-xs sm:text-sm text-obsidian/70 mt-1">
              Acceso a tus contenidos educativos, temarios y material clínico de apoyo.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-obsidian/70 bg-white px-3.5 py-1.5 rounded-full border border-[#B39A6A]/20 shadow-2xs">
              {activeEntitlements.length} {activeEntitlements.length === 1 ? 'masterclass activa' : 'masterclasses activas'}
            </span>
            <Link
              href="/academia"
              className="text-xs font-semibold text-champagne hover:text-[#8A7347] flex items-center gap-1 transition-colors"
            >
              <span>Explorar catálogo</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
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
          <div className="mt-12 p-10 sm:p-14 rounded-3xl bg-white border border-[#B39A6A]/25 text-center max-w-xl mx-auto shadow-xs">
            <div className="size-16 rounded-full bg-champagne/10 text-champagne flex items-center justify-center mx-auto mb-4 border border-champagne/20">
              <GraduationCap className="size-8 text-[#8A7347]" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-obsidian mb-2">
              Tu biblioteca está lista para comenzar
            </h3>
            <p className="text-xs sm:text-sm text-obsidian/70 leading-relaxed mb-6">
              Cuando adquieras o recibas acceso a una masterclass, aparecerá aquí junto con tus lecciones y avance.
            </p>
            <Link
              href="/academia"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-all shadow-md"
            >
              <span>Explorar Masterclasses</span>
              <ArrowRight className="size-3.5 text-champagne" />
            </Link>
          </div>
        ) : (
          /* Grid of Enrolled Masterclasses */
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEntitlements.map((ent) => {
              const course = ent.masterclass;
              if (!course) return null;

              const mcLessons = lessons.filter((l) => l.masterclass_id === course.id);
              const mcProgress = progress.filter((p) =>
                mcLessons.some((l) => l.id === p.lesson_id)
              );

              const totalLessonsCount = mcLessons.length;
              const completedCount = mcLessons.filter((l) => {
                const p = mcProgress.find((prog) => prog.lesson_id === l.id);
                return p?.completed || p?.progress_percent === 100;
              }).length;

              const progressPercent =
                totalLessonsCount > 0
                  ? Math.min(100, Math.round((completedCount / totalLessonsCount) * 100))
                  : 0;

              const isComplete = totalLessonsCount > 0 && completedCount === totalLessonsCount;

              // Find first accessible or in-progress lesson
              const inProgressLesson = mcProgress
                .filter((p) => p.progress_percent > 0)
                .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())[0];

              const targetLesson =
                mcLessons.find((item) => item.id === inProgressLesson?.lesson_id) || mcLessons[0];
              const targetLessonSlug = targetLesson?.slug || targetLesson?.id || 'inicio';

              return (
                <div
                  key={ent.id}
                  className="p-5 rounded-2xl bg-white border border-[#B39A6A]/25 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Course Cover */}
                    <div className="aspect-16/10 rounded-xl overflow-hidden mb-4 bg-[#0D2235] relative">
                      <img
                        src={course.cover_image || '/images/course-default.jpg'}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#0D2235]/85 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider">
                        {course.category || 'Educación Médica'}
                      </div>
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                        <ShieldCheck className="size-3" />
                        <span>Acceso Activo</span>
                      </div>
                    </div>

                    {/* Title & Info */}
                    <h3 className="font-serif text-lg text-obsidian font-bold leading-snug mb-1.5 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-obsidian/65 line-clamp-2 mb-4 leading-relaxed">
                      {course.subtitle || course.short_description || 'Impartido por el Dr. Mauricio Benjamín Galindo López.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4 bg-[#F9F7F2] p-3 rounded-xl border border-[#B39A6A]/15">
                      <div className="flex items-center justify-between text-[11px] text-obsidian/75 font-medium mb-1.5">
                        <span>Progreso del curso</span>
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

                  {/* Play / Resume CTA */}
                  <Link
                    href={`/aprender/${course.slug}/${targetLessonSlug}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-obsidian text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#07182A] transition-all shadow-xs"
                  >
                    <Play className="size-3.5 fill-white text-white" />
                    <span>{progressPercent > 0 ? 'Continuar Lección' : 'Comenzar Masterclass'}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
