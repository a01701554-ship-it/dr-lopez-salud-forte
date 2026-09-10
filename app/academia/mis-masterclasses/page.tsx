'use client';

import React, { useEffect, useState } from 'react';
import { Container } from '@/components/site/container';
import { useAuth } from '@/lib/auth/auth-context';
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
} from 'lucide-react';
import Link from 'next/link';

interface LibraryItem {
  entitlementId: string;
  status: 'active' | 'revoked' | 'suspended';
  grantedAt: string;
  course: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    image?: string;
    imageFallback?: string;
    coverImage?: string;
    categoryLabel?: string;
    durationMinutes?: number;
    lessonCount?: number;
    instructor?: {
      name: string;
      title: string;
    };
  } | null;
  progress: {
    percent: number;
    completedCount: number;
    totalCount: number;
    lastLessonId: string | null;
  };
}

export default function MisMasterclassesPage() {
  const { user, profile, isLoading, signOut } = useAuth();
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch real library items from server
  const loadLibrary = async () => {
    setLoadingLibrary(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/academia/my-library', {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/cuenta/iniciar-sesion?returnTo=/academia/mis-masterclasses';
          return;
        }
        const err = await res.json();
        setFetchError(err.error || 'No fue posible consultar tu biblioteca.');
        return;
      }
      const data = await res.json();
      setLibrary(data.library || []);
    } catch (e: any) {
      setFetchError('Error de red al consultar tus masterclasses.');
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = '/cuenta/iniciar-sesion?returnTo=/academia/mis-masterclasses';
      } else {
        loadLibrary();
      }
    }
  }, [user, isLoading]);

  if (isLoading || loadingLibrary) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-10 border-3 border-champagne border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg text-obsidian font-medium">Accediendo a tu biblioteca clínica...</p>
        <p className="text-xs text-obsidian/60 mt-1">Sincronizando licencias y progreso académico</p>
      </div>
    );
  }

  const isDoctor = profile?.role === 'ADMIN' || profile?.role === 'INSTRUCTOR';

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
            <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs mb-8 flex items-center gap-3">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{fetchError}</span>
            </div>
          )}

          {library.length === 0 ? (
            /* Empty state */
            <div className="p-10 sm:p-14 rounded-3xl bg-white border border-[#B39A6A]/25 text-center max-w-xl mx-auto shadow-xs">
              <div className="size-16 rounded-full bg-champagne/10 text-champagne flex items-center justify-center mx-auto mb-4 border border-champagne/20">
                <BookOpen className="size-8" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-obsidian mb-2">
                Aún no tienes masterclasses activas
              </h2>
              <p className="text-xs sm:text-sm text-obsidian/70 leading-relaxed mb-6">
                Al inscribirte en cualquiera de nuestras masterclasses, tendrás acceso inmediato e ilimitado a las lecciones en video, resúmenes clínicos y materiales descargables en esta sección.
              </p>
              <Link
                href="/academia"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-obsidian text-white text-xs font-semibold hover:bg-[#07182A] transition-all shadow-md"
              >
                <span>Explorar Catálogo de Masterclasses</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          ) : (
            /* Grid of Enrolled Masterclasses */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#B39A6A]/15">
                <span className="text-xs font-semibold tracking-wider uppercase text-obsidian/60">
                  {library.length} {library.length === 1 ? 'Masterclass inscrita' : 'Masterclasses inscritas'}
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
                {library.map((item) => {
                  const course = item.course;
                  if (!course) return null;

                  const isComplete = item.progress.percent === 100;

                  return (
                    <div
                      key={item.entitlementId}
                      className="p-5 rounded-2xl bg-white border border-[#B39A6A]/25 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        {/* Course Image */}
                        <div className="aspect-16/10 rounded-xl overflow-hidden mb-4 bg-[#0D2235] relative">
                          <img
                            src={course.imageFallback || course.coverImage || course.image}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#0D2235]/85 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider">
                            {course.categoryLabel || 'Salud Femenina'}
                          </div>
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                            <ShieldCheck className="size-3" />
                            <span>Acceso Activo</span>
                          </div>
                        </div>

                        {/* Title & Subtitle */}
                        <h3 className="font-serif text-lg text-obsidian font-bold leading-snug mb-1.5 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-obsidian/65 line-clamp-2 mb-4 leading-relaxed">
                          {course.subtitle || 'Impartido por el Dr. Mauricio Benjamín Galindo López.'}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4 bg-[#F9F7F2] p-3 rounded-xl border border-[#B39A6A]/15">
                          <div className="flex items-center justify-between text-[11px] text-obsidian/75 font-medium mb-1.5">
                            <span>Progreso de estudio</span>
                            <span className="font-mono font-semibold text-champagne">
                              {item.progress.percent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-champagne rounded-full transition-all duration-500"
                              style={{ width: `${item.progress.percent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-obsidian/50 mt-1.5">
                            <span>
                              {item.progress.completedCount} de {course.lessonCount || item.progress.totalCount} lecciones completadas
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
                        href={`/academia/${course.slug}/leccion/${course.slug === 'menopausia-con-claridad' ? 'bienvenida-y-alcance-educativo' : 'introduccion-a-la-ginecologia-funcional'}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-obsidian text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#07182A] transition-all shadow-xs"
                      >
                        <Play className="size-3.5 fill-white text-white" />
                        <span>{item.progress.percent > 0 ? 'Continuar Lección' : 'Comenzar Masterclass'}</span>
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
