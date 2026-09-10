'use client';

import React, { useEffect } from 'react';
import { Container } from '@/components/site/container';
import { AccountHeader } from '@/components/account/account-nav';
import { useAuth } from '@/lib/auth/auth-context';
import { INITIAL_COURSES } from '@/lib/academy/db';
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
} from 'lucide-react';
import Link from 'next/link';

export default function MyAccountPage() {
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/cuenta/iniciar-sesion?redirect=/mi-cuenta';
      }
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center">
          <div className="size-10 rounded-full border-2 border-[#B39A6A] border-t-transparent animate-spin mb-4" />
          <p className="font-serif text-lg text-obsidian">Cargando tu área privada...</p>
        </div>
      </div>
    );
  }

  // Active user masterclasses
  const availableCourses = INITIAL_COURSES.filter((c) => c.launchStatus === 'available');
  const lastActiveCourse = availableCourses[0];

  return (
    <div className="bg-ivory min-h-screen text-obsidian pb-20">
      <AccountHeader currentTab="resumen" />

      <Container className="max-w-[1120px] mx-auto px-5 sm:px-8 mt-10">
        {/* 1. Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-[#0D2235]/5 text-obsidian flex items-center justify-center shrink-0">
              <BookOpen className="size-5 text-champagne" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-obsidian">2</div>
              <div className="text-xs text-obsidian/65 font-medium">Masterclasses activas</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-obsidian">45%</div>
              <div className="text-xs text-obsidian/65 font-medium">Avance general</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-[#B39A6A]/15 text-[#8A7347] flex items-center justify-center shrink-0">
              <Award className="size-5 text-champagne" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-obsidian">1</div>
              <div className="text-xs text-obsidian/65 font-medium">Constancia en curso</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Package className="size-5 text-amber-700" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-obsidian">0</div>
              <div className="text-xs text-obsidian/65 font-medium">Pedidos pendientes</div>
            </div>
          </div>
        </div>

        {/* 2. Continuar Aprendiendo (Resume Last Masterclass) */}
        {lastActiveCourse && (
          <div className="mt-10 bg-[#0D2235] text-white rounded-[24px] p-6 sm:p-8 relative overflow-hidden shadow-md">
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-[#B39A6A]/10 pointer-events-none blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-champagne text-[10px] font-semibold uppercase tracking-wider border border-white/10 mb-3">
                  <Sparkles className="size-3" />
                  <span>Continuar donde lo dejaste</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium leading-tight">
                  {lastActiveCourse.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-white/75 leading-relaxed line-clamp-2">
                  Lección actual: <strong>1.2 Qué ocurre con los estrógenos, progesterona y FSH</strong>
                </p>

                {/* Progress bar */}
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between text-xs text-white/70 mb-1.5 font-medium">
                    <span>Avance: 60%</span>
                    <span>12 min restantes</span>
                  </div>
                  <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
                    <div className="h-full bg-champagne rounded-full transition-all duration-500 w-[60%]" />
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  href={`/academia/${lastActiveCourse.slug}/leccion/${lastActiveCourse.modules?.[0]?.lessons?.[0]?.slug || 'inicio'}`}
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

            <div className="space-y-4">
              {availableCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white p-5 rounded-2xl border border-[#B39A6A]/20 shadow-xs hover:border-[#B39A6A]/45 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-16 rounded-xl overflow-hidden bg-[#0D2235] shrink-0">
                      <img
                        src={course.imageFallback || course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-[#B39A6A]/15 text-[#8A7347] text-[10px] font-semibold uppercase tracking-wider">
                        {course.categoryLabel}
                      </span>
                      <h4 className="font-serif text-base text-obsidian font-medium mt-1 truncate">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-obsidian/60 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3 text-champagne" />
                          {course.durationMinutes} min
                        </span>
                        <span>•</span>
                        <span>{course.lessonCount} lecciones</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/academia/${course.slug}/leccion/${course.modules?.[0]?.lessons?.[0]?.slug || 'inicio'}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-[42px] px-5 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors shrink-0"
                  >
                    <Play className="size-3.5 fill-champagne text-champagne" />
                    <span>Entrar</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Side Column: Orders & Support */}
          <div className="space-y-6">
            <div className="pb-3 border-b border-[#B39A6A]/20">
              <h3 className="font-serif text-xl text-obsidian font-medium">
                Últimos Pedidos
              </h3>
            </div>

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

