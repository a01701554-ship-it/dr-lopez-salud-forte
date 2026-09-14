'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/site/container';
import { useAuth } from '@/lib/auth/auth-context';
import {
  GraduationCap,
  ShieldCheck,
  Users,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Key,
  Plus,
  Edit2,
  Trash2,
  Video,
  ExternalLink,
  Calendar,
  MessageCircle,
  Mail,
  BarChart3,
  Search,
  Filter,
  Eye,
  Check,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';

interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  categoryLabel?: string;
  durationMinutes?: number;
  lessonCount?: number;
  modules?: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      slug: string;
      title: string;
      durationSeconds: number;
      isPreview?: boolean;
      videoProvider?: 'youtube' | 'cloudflare';
      videoExternalId?: string;
      videoUrl?: string;
      summary?: string;
    }>;
  }>;
}

interface Student {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  created_at: string;
  last_login_at: string | null;
  enrolledCourses: Array<{
    courseId: string;
    courseTitle: string;
    status: string;
    grantedAt: string;
  }>;
  enrolledCoursesCount: number;
}

export default function AdminAcademiaPage() {
  const { user, profile, isLoading: authLoading, fetchWithAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<'cursos' | 'alumnos' | 'metricas' | 'agenda' | 'webhooks'>('cursos');
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState('');
  const [marketingOnly, setMarketingOnly] = useState(false);

  // New Course Modal / State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSubtitle, setNewCourseSubtitle] = useState('');
  const [newCourseSlug, setNewCourseSlug] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Ginecología & Salud Femenina');

  // New Lesson / YouTube State
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<Course | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(15);
  const [newLessonIsPreview, setNewLessonIsPreview] = useState(false);
  const [youtubePreview, setYoutubePreview] = useState<any>(null);
  const [validatingYt, setValidatingYt] = useState(false);

  // Grant Course State
  const [grantEmail, setGrantEmail] = useState('');
  const [grantCourseId, setGrantCourseId] = useState('');

  // Webhook simulation state
  const [simEmail, setSimEmail] = useState('alumno.prueba@saludforte.com');
  const [simOrder, setSimOrder] = useState('#SHOP-5520');
  const [simVariant, setSimVariant] = useState('gid://shopify/ProductVariant/420011223344');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch courses
      const cRes = await fetchWithAuth('/api/admin/courses');
      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(cData.courses || []);
        if (cData.courses?.length > 0 && !grantCourseId) {
          setGrantCourseId(cData.courses[0].id);
        }
      }

      // 2. Fetch students
      const sRes = await fetchWithAuth('/api/admin/students');
      if (sRes.ok) {
        const sData = await sRes.json();
        setStudents(sData.students || []);
      }

      // 3. Fetch metrics
      const mRes = await fetchWithAuth('/api/admin/metrics');
      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData.metrics);
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  // YouTube URL Validation & Parsing
  const handleValidateYouTube = async (url: string) => {
    setNewLessonUrl(url);
    if (!url.trim()) {
      setYoutubePreview(null);
      return;
    }

    setValidatingYt(true);
    try {
      const res = await fetchWithAuth('/api/admin/youtube/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setYoutubePreview(data);
      } else {
        setYoutubePreview({ error: data.error || 'URL no válida' });
      }
    } catch (e) {
      setYoutubePreview({ error: 'Error al verificar enlace' });
    } finally {
      setValidatingYt(false);
    }
  };

  // Create Course Action
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle) return;

    const slug = newCourseSlug || newCourseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      const res = await fetchWithAuth('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCourseTitle,
          subtitle: newCourseSubtitle,
          slug,
          categoryLabel: newCourseCategory,
          shopifyProductGid: `gid://shopify/Product/manual_${Date.now()}`,
          shopifyVariantGid: `gid://shopify/ProductVariant/manual_${Date.now()}`,
        }),
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: `Masterclass "${newCourseTitle}" creada con éxito.` });
        setShowCourseModal(false);
        setNewCourseTitle('');
        setNewCourseSubtitle('');
        setNewCourseSlug('');
        await fetchData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.error });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  // Create Lesson Action
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLesson || !selectedModuleId || !newLessonTitle) return;

    try {
      const res = await fetchWithAuth(`/api/admin/courses/${selectedCourseForLesson.id}/modules/${selectedModuleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newLessonTitle,
          videoUrl: newLessonUrl,
          durationSeconds: newLessonDuration * 60,
          isPreview: newLessonIsPreview,
          videoProvider: 'youtube',
          videoExternalId: youtubePreview?.videoId || '',
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', message: `Lección "${newLessonTitle}" agregada con éxito.` });
        setShowLessonModal(false);
        setNewLessonTitle('');
        setNewLessonUrl('');
        setYoutubePreview(null);
        await fetchData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.error });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  // Grant Course Action
  const handleGrantCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail || !grantCourseId) return;

    try {
      const res = await fetchWithAuth('/api/admin/students/grant-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: grantEmail,
          courseId: grantCourseId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        setGrantEmail('');
        await fetchData();
      } else {
        setFeedback({ type: 'error', message: data.error });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  // Simulate Webhook Action
  const handleSimulateWebhook = async () => {
    try {
      const res = await fetch('/api/admin/academia/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic: 'orders/paid',
          orderNumber: simOrder,
          customerEmail: simEmail,
          courseVariantGid: simVariant,
        }),
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: `Webhook de compra simulado para ${simEmail}.` });
        await fetchData();
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesConsent = marketingOnly ? s.marketing_consent : true;
    return matchesSearch && matchesConsent;
  });

  return (
    <div className="bg-[#F9F7F2] min-h-screen text-obsidian pb-20">
      {/* Top Banner & Dr. Galindo Identification */}
      <section className="pt-28 pb-10 sm:pt-36 sm:pb-12 border-b border-[#B39A6A]/20 bg-white">
        <Container className="max-w-[1240px] mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-obsidian text-champagne text-[11px] font-semibold tracking-wider uppercase shadow-xs">
                <ShieldCheck className="size-3.5 text-champagne" />
                <span>Panel Oficial del Instructor · Dr. Mauricio Benjamín Galindo López</span>
              </div>
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl text-obsidian font-bold tracking-tight">
                Centro de Mando Académico & Gestión de Alumnos
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-obsidian/70">
                Control soberano de masterclasses, videos de YouTube no listados, directorio médico de alumnos y métricas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-obsidian/20 text-xs font-semibold hover:bg-obsidian hover:text-white transition-all bg-white shadow-xs"
              >
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar Datos</span>
              </button>
            </div>
          </div>

          {/* Feedback alert */}
          {feedback && (
            <div
              className={`mt-6 p-4 rounded-xl text-xs flex items-center justify-between ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-red-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="text-xs font-semibold opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto border-b border-[#B39A6A]/20 pb-0">
            {[
              { id: 'cursos', label: 'Cursos & Lecciones YouTube', icon: Video },
              { id: 'alumnos', label: 'Directorio de Alumnos & Consentimiento', icon: Users },
              { id: 'metricas', label: 'Métricas & Auditoría', icon: BarChart3 },
              { id: 'agenda', label: 'Agenda Google & WhatsApp', icon: Calendar },
              { id: 'webhooks', label: 'Simulador de Webhooks', icon: Key },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-champagne text-obsidian font-bold'
                      : 'border-transparent text-obsidian/60 hover:text-obsidian'
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? 'text-champagne' : 'text-obsidian/40'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Main Content Sections */}
      <Container className="max-w-[1240px] mx-auto px-5 sm:px-8 mt-8">
        {/* ==================================================================== */}
        {/* TAB 1: CURSOS & LECCIONES YOUTUBE                                    */}
        {/* ==================================================================== */}
        {activeTab === 'cursos' && (
          <div className="space-y-8">
            {/* Header with Create Course Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
              <div>
                <h2 className="text-lg font-serif font-bold text-obsidian">Catálogo de Masterclasses Publicadas</h2>
                <p className="text-xs text-obsidian/65 mt-0.5">
                  Gestiona los módulos y añade videos de YouTube (formato no listado) a cada clase.
                </p>
              </div>
              <button
                onClick={() => setShowCourseModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian text-white text-xs font-semibold hover:bg-[#07182A] transition-all shadow-xs"
              >
                <Plus className="size-4 text-champagne" />
                <span>Nueva Masterclass</span>
              </button>
            </div>

            {/* Courses List */}
            <div className="space-y-6">
              {courses.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-[#B39A6A]/20 p-6 shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#B39A6A]/15">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#B39A6A]/15 text-[#8A7347] text-[10px] font-bold uppercase tracking-wider">
                          {c.categoryLabel || 'Salud Médica'}
                        </span>
                        <span className="text-[11px] text-obsidian/50 font-mono">slug: {c.slug}</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-obsidian mt-1">{c.title}</h3>
                      <p className="text-xs text-obsidian/70">{c.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCourseForLesson(c);
                          setSelectedModuleId(c.modules?.[0]?.id || '');
                          setShowLessonModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-champagne text-obsidian text-xs font-semibold hover:brightness-105 transition-all shadow-xs"
                      >
                        <Plus className="size-3.5" />
                        <span>Añadir Lección YouTube</span>
                      </button>
                      <a
                        href={`/academia/${c.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-obsidian/20 text-obsidian/60 hover:text-obsidian hover:bg-obsidian/5"
                        title="Ver página pública del curso"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </div>

                  {/* Modules & Lessons */}
                  <div className="mt-5 space-y-4">
                    {c.modules?.map((mod, mIdx) => (
                      <div key={mod.id} className="bg-[#F9F7F2] rounded-xl p-4 border border-[#B39A6A]/15">
                        <div className="text-xs font-bold text-obsidian mb-3 flex items-center justify-between">
                          <span className="uppercase tracking-wider">
                            Módulo {mIdx + 1}: {mod.title}
                          </span>
                          <span className="text-[11px] text-obsidian/50 font-mono">
                            {mod.lessons.length} clases
                          </span>
                        </div>

                        <div className="space-y-2">
                          {mod.lessons.map((les) => (
                            <div
                              key={les.id}
                              className="bg-white p-3 rounded-lg border border-[#B39A6A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="size-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                                  <Play className="size-3.5 fill-red-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-obsidian flex items-center gap-2">
                                    <span>{les.title}</span>
                                    {les.isPreview && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                                        Vista Previa Libre
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-obsidian/50 font-mono mt-0.5 flex items-center gap-2">
                                    <span>Duración: {Math.round(les.durationSeconds / 60)} min</span>
                                    {les.videoExternalId && (
                                      <span className="text-red-600 font-medium">
                                        YouTube ID: {les.videoExternalId}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <a
                                  href={`/academia/${c.slug}/leccion/${les.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D1B2A] text-white text-[11px] font-medium hover:bg-black transition-colors"
                                >
                                  <Eye className="size-3 text-champagne" />
                                  <span>Probar Reproductor</span>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: DIRECTORIO DE ALUMNOS & CONSENTIMIENTO                        */}
        {/* ==================================================================== */}
        {activeTab === 'alumnos' && (
          <div className="space-y-6">
            {/* Search, Filter & Quick Grant Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search & Filter */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-serif font-bold text-obsidian">Directorio Médico de Alumnos</h2>
                  <p className="text-xs text-obsidian/65 mt-0.5">
                    Registros con verificación de correo y consentimiento de marketing explícito.
                  </p>

                  <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="size-4 absolute left-3 top-3 text-obsidian/40" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o correo electrónico..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne bg-[#FDFBF7]"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium text-obsidian/80 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={marketingOnly}
                        onChange={(e) => setMarketingOnly(e.target.checked)}
                        className="size-4 rounded-md accent-champagne"
                      />
                      <span>Solo con consentimiento de marketing</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#B39A6A]/15 flex items-center justify-between text-xs text-obsidian/60">
                  <span>Mostrando {filteredStudents.length} de {students.length} alumnos</span>
                  <span className="font-semibold text-emerald-700">
                    {students.filter((s) => s.marketing_consent).length} suscriptores de salud activa
                  </span>
                </div>
              </div>

              {/* Quick Grant Masterclass */}
              <div className="bg-[#0B1724] text-white p-6 rounded-2xl border border-white/10 shadow-xs">
                <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="size-4 text-champagne" />
                  <span>Otorgar Acceso Manual</span>
                </h3>
                <p className="text-[11px] text-white/70 mt-1">
                  Inscribe a un alumno directamente a una masterclass por correo.
                </p>

                <form onSubmit={handleGrantCourse} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                      Correo del Alumno
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alumno@ejemplo.com"
                      value={grantEmail}
                      onChange={(e) => setGrantEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:outline-hidden focus:border-champagne"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-white/60 mb-1">
                      Masterclass
                    </label>
                    <select
                      value={grantCourseId}
                      onChange={(e) => setGrantCourseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0D2235] border border-white/20 text-xs text-white focus:outline-hidden focus:border-champagne"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-champagne text-obsidian font-semibold text-xs hover:brightness-105 transition-all shadow-xs"
                  >
                    Otorgar Licencia
                  </button>
                </form>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-[#B39A6A]/20 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#B39A6A]/15 bg-[#F9F7F2] text-obsidian/75 font-semibold">
                      <th className="py-3 px-4">Alumno</th>
                      <th className="py-3 px-4">Estado Cuenta</th>
                      <th className="py-3 px-4">Consentimiento Marketing</th>
                      <th className="py-3 px-4">Masterclasses Inscritas</th>
                      <th className="py-3 px-4">Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B39A6A]/15">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-obsidian">{st.full_name || 'Sin nombre registrado'}</div>
                          <div className="text-[11px] text-obsidian/50 font-mono">{st.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {st.email_verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                              <CheckCircle2 className="size-3" /> Verificado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                              <Clock className="size-3" /> Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {st.marketing_consent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-semibold">
                              <Check className="size-3" /> Aceptado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px]">
                              Solo Transaccional
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-obsidian">
                            {st.enrolledCoursesCount} {st.enrolledCoursesCount === 1 ? 'curso' : 'cursos'}
                          </div>
                          {st.enrolledCourses.length > 0 && (
                            <div className="text-[10px] text-obsidian/60 truncate max-w-xs">
                              {st.enrolledCourses.map((c) => c.courseTitle).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-obsidian/60 text-[11px]">
                          {new Date(st.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-obsidian/50">
                          No se encontraron alumnos con los criterios seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: MÉTRICAS & AUDITORÍA                                          */}
        {/* ==================================================================== */}
        {activeTab === 'metricas' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Alumnos Registrados
                </div>
                <div className="text-2xl font-serif font-bold text-obsidian mt-1">
                  {metrics?.totalRegisteredUsers || students.length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Alumnos Verificados
                </div>
                <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                  {metrics?.verifiedUsersCount || students.filter((s) => s.email_verified).length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Suscritos Marketing
                </div>
                <div className="text-2xl font-serif font-bold text-indigo-700 mt-1">
                  {metrics?.marketingSubscribersCount || students.filter((s) => s.marketing_consent).length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Masterclasses Activas
                </div>
                <div className="text-2xl font-serif font-bold text-obsidian mt-1">
                  {metrics?.totalCourses || courses.length}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Lecciones en Video
                </div>
                <div className="text-2xl font-serif font-bold text-obsidian mt-1">
                  {metrics?.totalLessons || 0}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#B39A6A]/20 shadow-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-obsidian/60 font-semibold">
                  Licencias Otorgadas
                </div>
                <div className="text-2xl font-serif font-bold text-champagne mt-1">
                  {metrics?.activeEntitlementsCount || 0}
                </div>
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white rounded-2xl border border-[#B39A6A]/20 p-6 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-obsidian mb-2">
                Auditoría de Accesos & Reproducciones de Video
              </h3>
              <p className="text-xs text-obsidian/60 mb-4">
                Registro inmutable de validaciones de licencias y solicitudes de tokens educativos.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#B39A6A]/15 text-obsidian/60 font-semibold">
                      <th className="py-2.5 px-3">Fecha y Hora</th>
                      <th className="py-2.5 px-3">Alumno</th>
                      <th className="py-2.5 px-3">Acción</th>
                      <th className="py-2.5 px-3">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B39A6A]/10 font-mono text-[11px]">
                    {metrics?.recentAudits?.map((a: any) => (
                      <tr key={a.id}>
                        <td className="py-2.5 px-3 text-obsidian/60">
                          {new Date(a.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">{a.customerGid}</td>
                        <td className="py-2.5 px-3">{a.action}</td>
                        <td className="py-2.5 px-3">
                          {a.result === 'granted' ? (
                            <span className="text-emerald-700 font-semibold">Autorizado</span>
                          ) : (
                            <span className="text-red-700 font-semibold">Denegado ({a.reason || 'Sin licencia'})</span>
                          )}
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-obsidian/50">
                          Sin eventos de auditoría registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: AGENDA GOOGLE & WHATSAPP                                      */}
        {/* ==================================================================== */}
        {activeTab === 'agenda' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Calendar */}
            <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex flex-col justify-between">
              <div>
                <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-200">
                  <Calendar className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-obsidian">Agenda Médica con Google Calendar</h3>
                <p className="text-xs text-obsidian/70 mt-2 leading-relaxed">
                  Configura y sincroniza las consultas clínicas privadas del Dr. Mauricio Benjamín Galindo López con Google Calendar. Los pacientes y alumnos podrán agendar valoraciones médicas funcionales sin fricciones.
                </p>

                <div className="mt-5 p-4 rounded-xl bg-[#F9F7F2] border border-[#B39A6A]/15 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian/70">Especialista:</span>
                    <span className="font-semibold text-obsidian">Dr. Mauricio Benjamín Galindo López</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian/70">Duración por consulta:</span>
                    <span className="font-semibold text-obsidian">45 a 60 minutos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-obsidian/70">Formato:</span>
                    <span className="font-semibold text-obsidian">Google Meet / Presencial</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#B39A6A]/15">
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Abrir Google Calendar del Dr. Galindo</span>
                </a>
              </div>
            </div>

            {/* WhatsApp Business */}
            <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs flex flex-col justify-between">
              <div>
                <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200">
                  <MessageCircle className="size-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-obsidian">Notificaciones por WhatsApp Business</h3>
                <p className="text-xs text-obsidian/70 mt-2 leading-relaxed">
                  Confirmaciones de inscripción a masterclasses y recordatorios personalizados de consulta médica directa con el equipo del Dr. Galindo.
                </p>

                <div className="mt-5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-2 text-xs text-emerald-950">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-emerald-800">
                    Plantilla Médica Pre-aprobada:
                  </div>
                  <p className="italic text-[11px] bg-white p-3 rounded-lg border border-emerald-200">
                    "Estimada paciente, el Dr. Mauricio Galindo te da la bienvenida a tu Masterclass en Salud Forte. Puedes ingresar con tu correo y contraseña directamente a tu aula virtual."
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#B39A6A]/15">
                <a
                  href="https://api.whatsapp.com/send?phone=525500000000&text=Hola%20Dr.%20Mauricio%20Galindo"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <MessageCircle className="size-3.5" />
                  <span>Probar Mensajería WhatsApp Business</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: SIMULADOR SHOPIFY & WEBHOOKS                                  */}
        {/* ==================================================================== */}
        {activeTab === 'webhooks' && (
          <div className="bg-white p-6 rounded-2xl border border-[#B39A6A]/20 shadow-xs max-w-2xl">
            <h3 className="font-serif text-xl font-bold text-obsidian">Simulador de Webhooks de Compra Shopify</h3>
            <p className="text-xs text-obsidian/70 mt-1 leading-relaxed">
              Prueba la concesión instantánea de licencias sin realizar cobros reales en Shopify.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Correo del Comprador</label>
                <input
                  type="email"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Número de Pedido Simulado</label>
                <input
                  type="text"
                  value={simOrder}
                  onChange={(e) => setSimOrder(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                />
              </div>

              <button
                onClick={handleSimulateWebhook}
                className="w-full py-3 px-4 rounded-xl bg-obsidian text-white font-semibold text-xs hover:bg-[#07182A] transition-colors shadow-xs"
              >
                Disparar Webhook orders/paid
              </button>
            </div>
          </div>
        )}
      </Container>

      {/* ==================================================================== */}
      {/* MODAL: NUEVA MASTERCLASS                                             */}
      {/* ==================================================================== */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#B39A6A]/30 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#B39A6A]/20">
              <h3 className="font-serif text-xl font-bold text-obsidian">Crear Nueva Masterclass</h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-obsidian/50 hover:text-obsidian text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Título de la Masterclass</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Salud Hormonal en la Perimenopausia"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Subtítulo Descriptivo</label>
                <input
                  type="text"
                  placeholder="Guía clínica y protocolo práctico para el bienestar femenino"
                  value={newCourseSubtitle}
                  onChange={(e) => setNewCourseSubtitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Categoría Médica</label>
                <select
                  value={newCourseCategory}
                  onChange={(e) => setNewCourseCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                >
                  <option value="Ginecología & Salud Femenina">Ginecología & Salud Femenina</option>
                  <option value="Medicina Funcional & Longevidad">Medicina Funcional & Longevidad</option>
                  <option value="Nutrición Celular & Metabolismo">Nutrición Celular & Metabolismo</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-obsidian/70 hover:bg-black/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-obsidian text-white font-semibold text-xs hover:bg-[#07182A] transition-colors"
                >
                  Publicar Masterclass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: AÑADIR LECCIÓN EN VIDEO YOUTUBE                               */}
      {/* ==================================================================== */}
      {showLessonModal && selectedCourseForLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#B39A6A]/30 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#B39A6A]/20">
              <div>
                <h3 className="font-serif text-xl font-bold text-obsidian">Añadir Lección en Video</h3>
                <p className="text-[11px] text-obsidian/60 mt-0.5">{selectedCourseForLesson.title}</p>
              </div>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-obsidian/50 hover:text-obsidian text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Módulo Destino</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                >
                  {selectedCourseForLesson.modules?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">Título de la Lección</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fisiopatología de la transición menopáusica"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian mb-1">
                  Enlace de YouTube (No listado / Unlisted)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newLessonUrl}
                    onChange={(e) => handleValidateYouTube(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne pr-10"
                  />
                  {validatingYt && (
                    <RefreshCw className="size-4 animate-spin absolute right-3 top-3 text-obsidian/40" />
                  )}
                </div>
                {youtubePreview && youtubePreview.valid && (
                  <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                    <img
                      src={youtubePreview.thumbnailUrl}
                      alt="Miniatura"
                      className="size-12 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>Enlace de YouTube Verificado</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-mono">ID: {youtubePreview.videoId}</div>
                    </div>
                  </div>
                )}
                {youtubePreview && youtubePreview.error && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="size-3.5" />
                    <span>{youtubePreview.error}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-obsidian mb-1">Duración (minutos)</label>
                  <input
                    type="number"
                    min={1}
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-obsidian/20 text-xs focus:outline-hidden focus:border-champagne"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-medium text-obsidian pb-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newLessonIsPreview}
                      onChange={(e) => setNewLessonIsPreview(e.target.checked)}
                      className="size-4 rounded-md accent-champagne"
                    />
                    <span>Acceso libre (Preview)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-obsidian/70 hover:bg-black/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-obsidian text-white font-semibold text-xs hover:bg-[#07182A] transition-colors"
                >
                  Guardar Lección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
