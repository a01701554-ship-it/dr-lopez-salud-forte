'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/site/container';
import { MasterclassCard } from '@/components/academia/masterclass-card';
import { INITIAL_COURSES } from '@/lib/academy/db';
import { Course } from '@/lib/academy/types';
import { useAuth } from '@/lib/auth/auth-context';
import {
  GraduationCap,
  ShieldCheck,
  Search,
  BookMarked,
  HelpCircle,
  Mail,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Todas las masterclasses' },
  { id: 'salud_mujer', label: 'Salud de la mujer' },
  { id: 'salud_hombre', label: 'Salud masculina' },
  { id: 'bienestar', label: 'Bienestar & Fisiología' },
];

export default function AcademiaPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [emailWaitlist, setEmailWaitlist] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'success'>('idle');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const { user, fetchWithAuth } = useAuth();

  useEffect(() => {
    let isMounted = true;
    if (user) {
      fetchWithAuth('/api/academia/my-library', { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isMounted || !data) return;
          const items = data.library || data.courses || [];
          const ids = new Set<string>();
          for (const item of items) {
            if (item.course?.id) ids.add(item.course.id);
            if (item.course?.slug) ids.add(item.course.slug);
          }
          setEnrolledCourseIds(ids);
        })
        .catch(() => {});
    } else {
      setEnrolledCourseIds(new Set());
    }
    return () => {
      isMounted = false;
    };
  }, [user, fetchWithAuth]);

  const filteredCourses = INITIAL_COURSES.filter((course) => {
    if (selectedCategory === 'all') return true;
    return course.category === selectedCategory;
  });

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailWaitlist) return;
    setWaitlistStatus('success');
    setEmailWaitlist('');
  };

  return (
    <div className="bg-ivory min-h-screen text-obsidian">
      {/* 
        ========================================================================
        1. HERO EDITORIAL DE ACADEMIA
        ========================================================================
      */}
      <section className="pt-28 pb-14 sm:pt-36 sm:pb-20 border-b border-[#B39A6A]/20 bg-[#F9F7F2]">
        <Container className="max-w-[1180px] mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B39A6A]/15 text-[#8A7347] text-[11px] font-semibold uppercase tracking-[0.14em]">
                <GraduationCap className="size-3.5 text-champagne" />
                <span>Academia Salud Forte</span>
              </div>

              {/* Título Principal */}
              <h1 className="mt-4 font-serif text-[clamp(2.3rem,4.5vw,4.2rem)] leading-[0.98] tracking-[-0.03em] text-obsidian">
                Aprender también es una forma de cuidar tu salud.
              </h1>

              {/* Subtítulo */}
              <p className="mt-5 text-base sm:text-lg text-obsidian/75 leading-[1.65]">
                Masterclasses creadas para ayudarte a comprender temas importantes de salud con información clara, responsable y basada en evidencia.
              </p>

              {/* Aviso Médico Breve */}
              <div className="mt-6 inline-flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-[#B39A6A]/25 text-xs text-obsidian/80 max-w-xl">
                <Info className="size-4 text-champagne shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso ético:</strong> Contenido educativo. No sustituye una consulta médica ni establece una relación médico-paciente.
                </span>
              </div>
            </div>

            {/* Quick access to student library */}
            <div className="shrink-0 p-5 rounded-2xl bg-white border border-[#B39A6A]/30 shadow-xs max-w-sm w-full">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-champagne">
                <BookMarked className="size-4" />
                <span>Alumnos registrados</span>
              </div>
              <h3 className="font-serif text-lg text-obsidian font-medium mt-1">
                ¿Ya tienes masterclasses?
              </h3>
              <p className="text-xs text-obsidian/70 mt-1 leading-normal">
                Accede directamente a tu biblioteca personal con tu correo verificado.
              </p>
              <a
                href={user ? "/mi-cuenta/masterclasses" : "/cuenta/iniciar-sesion?redirect=/mi-cuenta/masterclasses"}
                className="mt-3.5 inline-flex items-center justify-center gap-1.5 w-full h-[40px] rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors shadow-xs"
              >
                <span>Entrar a mis masterclasses</span>
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        2. FILTROS Y CATÁLOGO DE MASTERCLASSES
        ========================================================================
      */}
      <section className="py-14 sm:py-20 border-b border-[#B39A6A]/15">
        <Container className="max-w-[1180px] mx-auto px-5 sm:px-8">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-[#B39A6A]/15">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-obsidian text-white shadow-xs'
                      : 'bg-white text-obsidian/70 border border-[#B39A6A]/25 hover:border-[#B39A6A]/60 hover:text-obsidian'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-obsidian/60 font-medium">
              Mostrando {filteredCourses.length} programas educativos
            </span>
          </div>

          {/* Grid of Masterclasses */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {filteredCourses.map((course) => (
              <MasterclassCard
                key={course.id}
                course={course}
                hasAccess={enrolledCourseIds.has(course.id) || enrolledCourseIds.has(course.slug)}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        3. LISTA DE ESPERA & PRÓXIMOS LANZAMIENTOS
        ========================================================================
      */}
      <section className="py-16 sm:py-24 bg-[#EFECE5] border-b border-[#B39A6A]/20">
        <Container className="max-w-[760px] mx-auto px-5 sm:px-8 text-center">
          <div className="size-12 rounded-2xl bg-white border border-[#B39A6A]/30 flex items-center justify-center mx-auto text-champagne mb-4">
            <Mail className="size-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-obsidian font-medium tracking-tight">
            Nuevas masterclasses en desarrollo
          </h2>
          <p className="mt-3 text-sm sm:text-base text-obsidian/75 leading-relaxed">
            Cada contenido se publica únicamente tras una rigurosa revisión bibliográfica y clínica. Deja tu correo si deseas recibir notificación cuando un nuevo temario esté disponible.
          </p>

          {waitlistStatus === 'success' ? (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-700" />
              <span>Gracias. Te notificaremos exclusivamente cuando se abra una nueva masterclass.</span>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={emailWaitlist}
                onChange={(e) => setEmailWaitlist(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                className="flex-1 h-[48px] px-4 rounded-full bg-white border border-[#B39A6A]/30 text-sm text-obsidian placeholder:text-obsidian/45 focus:outline-hidden focus:border-champagne focus:ring-2 focus:ring-champagne/20"
              />
              <button
                type="submit"
                className="h-[48px] px-6 rounded-full bg-obsidian text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#07182A] transition-colors shadow-xs"
              >
                Avisarme
              </button>
            </form>
          )}

          <p className="mt-3 text-[11px] text-obsidian/55">
            Sin spam. Solo avisos educativos y enlaces a temarios verificados.
          </p>
        </Container>
      </section>

      {/* 
        ========================================================================
        4. PREGUNTAS FRECUENTES DE LA ACADEMIA
        ========================================================================
      */}
      <section className="py-16 sm:py-24">
        <Container className="max-w-[880px] mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl text-obsidian font-medium tracking-tight">
              Preguntas frecuentes sobre la Academia
            </h2>
            <p className="mt-2 text-sm text-obsidian/70">
              Certeza sobre formatos, licencias y metodología de aprendizaje.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: '¿Cómo recibo el acceso después de completar mi compra?',
                a: 'El acceso se vincula automáticamente al correo electrónico registrado durante tu proceso de compra seguro. Recibirás una confirmación inmediata con tu enlace directo y podrás iniciar sesión en "Mis masterclasses" en cualquier momento.',
              },
              {
                q: '¿Puedo comprar una masterclass como regalo para otra persona?',
                a: 'Sí. Durante el checkout puedes indicar el correo del destinatario o solicitar la reasignación enviándonos el número de pedido desde nuestro canal de soporte oficial.',
              },
              {
                q: '¿Los videos se pueden descargar a mi computadora?',
                a: 'Por protección de derechos de autor y seguridad del contenido, los videos se reproducen de manera privada dentro de nuestra plataforma con tecnología adaptativa HD. Lo que sí puedes descargar son las guías, checklists e infografías en formato PDF.',
              },
              {
                q: '¿Qué sucede si tengo dudas médicas específicas sobre mi caso?',
                a: 'La Academia ofrece formación general basada en evidencia. Para evaluar tu situación individual, estudios o iniciar un tratamiento, te invitamos a agendar una consulta médica formal.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-white border border-[#B39A6A]/25 p-5 sm:p-6 open:shadow-xs transition-all duration-200"
              >
                <summary className="font-serif text-lg sm:text-xl text-obsidian font-medium cursor-pointer list-none flex items-center justify-between gap-4 select-none">
                  <span>{faq.q}</span>
                  <span className="text-champagne group-open:rotate-45 transition-transform duration-200 text-2xl font-light leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-obsidian/75 leading-relaxed pt-2 border-t border-[#B39A6A]/10">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
