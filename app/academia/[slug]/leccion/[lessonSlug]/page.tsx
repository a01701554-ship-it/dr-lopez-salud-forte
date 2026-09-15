'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  FileText,
  Download,
  AlertCircle,
  ShieldCheck,
  Info,
  ChevronRight,
  ChevronLeft,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface LessonPlayerProps {
  params?: {
    slug: string;
    lessonSlug: string;
  };
  slugProp?: string;
  lessonSlugProp?: string;
}

interface LessonData {
  id: string;
  slug: string;
  title: string;
  durationSeconds: number;
  isPreview?: boolean;
  videoProvider?: 'youtube' | 'cloudflare';
  videoExternalId?: string;
  videoUrl?: string;
  summary?: string;
  transcript?: string;
  attachments?: Array<{
    id: string;
    title: string;
    fileSizeLabel: string;
    format: string;
    mimeType?: string;
  }>;
}

interface ModuleData {
  id: string;
  title: string;
  lessons: LessonData[];
}

interface CourseData {
  id: string;
  slug: string;
  title: string;
  instructor?: {
    name: string;
    title: string;
  };
  modules?: ModuleData[];
  lessonCount?: number;
  disclaimerShort?: string;
}

interface VideoPlaybackData {
  type: 'youtube' | 'cloudflare';
  videoId?: string;
  embedUrl?: string;
  token?: string;
  playbackUrl?: string;
  notice?: string;
  expiresIn?: number;
}

export default function LessonPlayerPage({
  params,
  slugProp,
  lessonSlugProp,
}: LessonPlayerProps) {
  const slug = slugProp || params?.slug || 'menopausia-con-claridad';
  const lessonSlug = lessonSlugProp || params?.lessonSlug || 'bienvenida-y-alcance-educativo';

  const { fetchWithAuth, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [playbackData, setPlaybackData] = useState<VideoPlaybackData | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const [progressRecords, setProgressRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'resumen' | 'transcripcion' | 'materiales'>('resumen');
  const [savingProgress, setSavingProgress] = useState(false);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  // Fetch lesson data and validate entitlement
  const fetchLesson = async () => {
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage(null);

    try {
      const res = await fetchWithAuth(`/api/academia/courses/${slug}/lessons/${lessonSlug}`, {
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorStatus(data.code || (res.status === 401 ? 'UNAUTHENTICATED' : 'ERROR'));
        setErrorMessage(data.error || 'No fue posible acceder a esta lección.');
        setLoading(false);
        return;
      }

      setCourse(data.course);
      setModuleData(data.module);
      setLesson(data.lesson);

      // Check existing progress
      if (data.progress && Array.isArray(data.progress)) {
        setProgressRecords(data.progress);
        const thisLessonProgress = data.progress.find((p: any) => p.lessonId === data.lesson.id);
        if (thisLessonProgress && thisLessonProgress.status === 'completed') {
          setIsCompleted(true);
        }
      }

      // Fetch video playback token / details
      await fetchPlaybackDetails();
    } catch (err: any) {
      setErrorStatus('NETWORK_ERROR');
      setErrorMessage('Error de conexión al cargar la clase.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaybackDetails = async () => {
    setPlaybackLoading(true);
    setPlaybackError(null);
    setPlaybackData(null);

    try {
      const res = await fetchWithAuth(`/api/academia/courses/${slug}/lessons/${lessonSlug}/token`, {
        method: 'POST',
        credentials: 'include',
      });

      const pData = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPlaybackError(pData.error || 'No fue posible preparar la reproducción segura.');
        return;
      }

      setPlaybackData(pData);
    } catch (e) {
      setPlaybackError('No fue posible conectar con el servicio de reproducción.');
    } finally {
      setPlaybackLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [slug, lessonSlug, user]);

  const handleToggleComplete = async () => {
    if (!lesson) return;
    setSavingProgress(true);
    const nextState = !isCompleted;

    try {
      const res = await fetchWithAuth(`/api/academia/courses/${slug}/lessons/${lesson.slug}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: nextState ? 'completed' : 'in_progress',
          positionSeconds: 0,
        }),
      });

      if (res.ok) {
        setIsCompleted(nextState);
        const updatedProg = await res.json();
        if (updatedProg.progress) {
          setProgressRecords(updatedProg.progress);
        }
      }
    } catch (e) {
      console.error('Error saving progress:', e);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleAttachmentDownload = async (attachmentId: string) => {
    if (!lesson) return;
    setDownloadingAttachmentId(attachmentId);
    setAttachmentError(null);

    try {
      const res = await fetchWithAuth(
        `/api/academia/courses/${slug}/lessons/${lesson.slug}/attachment/${attachmentId}`,
        { credentials: 'include' },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.downloadUrl) {
        setAttachmentError(data.error || 'No fue posible preparar la descarga.');
        return;
      }

      const downloadLink = document.createElement('a');
      downloadLink.href = data.downloadUrl;
      downloadLink.download = data.filename || '';
      downloadLink.rel = 'noopener noreferrer';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch {
      setAttachmentError('No fue posible conectar con el servicio de descarga.');
    } finally {
      setDownloadingAttachmentId(null);
    }
  };

  // Find next and previous lessons for easy navigation
  let allLessons: { lesson: LessonData; moduleTitle: string }[] = [];
  if (course && course.modules) {
    for (const m of course.modules) {
      for (const l of m.lessons) {
        allLessons.push({ lesson: l, moduleTitle: m.title });
      }
    }
  }

  const currentIndex = allLessons.findIndex((item) => item.lesson.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Render Loading
  if (loading) {
    return (
      <div className="bg-[#091420] min-h-screen text-white flex flex-col items-center justify-center p-6">
        <div className="size-12 border-3 border-champagne border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/80 font-serif text-lg">Cargando lección médica...</p>
        <p className="text-xs text-white/50 mt-1">Verificando credenciales de acceso</p>
      </div>
    );
  }

  // Render Access Errors
  if (errorStatus) {
    return (
      <div className="bg-[#091420] min-h-screen text-white flex flex-col">
        <header className="h-16 border-b border-white/10 bg-[#07101A] px-6 flex items-center justify-between">
          <a
            href="/academia/mis-masterclasses"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Volver a Mis Masterclasses</span>
          </a>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0D1B2A] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            {errorStatus === 'UNAUTHENTICATED' && (
              <>
                <div className="size-16 rounded-full bg-champagne/10 text-champagne mx-auto flex items-center justify-center mb-5 border border-champagne/20">
                  <Lock className="size-8" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-white mb-2">Acceso a Alumnos</h2>
                <p className="text-sm text-white/70 mb-6 leading-relaxed">
                  {errorMessage || 'Para acceder a esta lección médica debes iniciar sesión con tu cuenta de Salud Forte.'}
                </p>
                <div className="space-y-3">
                  <a
                    href={`/cuenta/iniciar-sesion?returnTo=/academia/${slug}/leccion/${lessonSlug}`}
                    className="block w-full py-3 px-4 rounded-xl bg-champagne text-obsidian font-semibold text-sm hover:brightness-105 transition-all shadow-md"
                  >
                    Entrar a mi cuenta
                  </a>
                  <a
                    href="/cuenta/registro"
                    className="block w-full py-3 px-4 rounded-xl bg-white/5 text-white/90 font-medium text-sm hover:bg-white/10 transition-colors border border-white/10"
                  >
                    ¿Aún no tienes cuenta? Regístrate aquí
                  </a>
                </div>
              </>
            )}

            {errorStatus === 'EMAIL_VERIFICATION_REQUIRED' && (
              <>
                <div className="size-16 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-5 border border-amber-500/20">
                  <Mail className="size-8" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-white mb-2">Verificación Requerida</h2>
                <p className="text-sm text-white/70 mb-6 leading-relaxed">
                  {errorMessage || 'Debes verificar tu correo electrónico para acceder al contenido clínico de esta masterclass.'}
                </p>
                <a
                  href="/cuenta/verificar"
                  className="block w-full py-3 px-4 rounded-xl bg-champagne text-obsidian font-semibold text-sm hover:brightness-105 transition-all shadow-md"
                >
                  Verificar mi correo ahora
                </a>
              </>
            )}

            {errorStatus === 'ENTITLEMENT_REQUIRED' && (
              <>
                <div className="size-16 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center mb-5 border border-red-500/20">
                  <AlertCircle className="size-8" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-white mb-2">Masterclass no adquirida</h2>
                <p className="text-sm text-white/70 mb-6 leading-relaxed">
                  {errorMessage}
                </p>
                <div className="space-y-3">
                  <a
                    href={`/academia/${slug}`}
                    className="block w-full py-3 px-4 rounded-xl bg-champagne text-obsidian font-semibold text-sm hover:brightness-105 transition-all"
                  >
                    Ver detalles y adquirir masterclass
                  </a>
                  <a
                    href="/academia/mis-masterclasses"
                    className="block w-full py-3 px-4 rounded-xl bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-colors border border-white/10"
                  >
                    Ir a mis masterclasses activas
                  </a>
                </div>
              </>
            )}

            {errorStatus !== 'UNAUTHENTICATED' &&
              errorStatus !== 'EMAIL_VERIFICATION_REQUIRED' &&
              errorStatus !== 'ENTITLEMENT_REQUIRED' && (
                <>
                  <div className="size-16 rounded-full bg-white/5 text-white/70 mx-auto flex items-center justify-center mb-5">
                    <AlertCircle className="size-8" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-white mb-2">Aviso de Reproducción</h2>
                  <p className="text-sm text-white/70 mb-6 leading-relaxed">{errorMessage}</p>
                  <button
                    onClick={fetchLesson}
                    className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-champagne text-obsidian font-semibold text-sm"
                  >
                    <RefreshCw className="size-4" />
                    Reintentar
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback if course or lesson object wasn't loaded
  if (!course || !lesson) {
    return (
      <div className="bg-[#091420] min-h-screen text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="size-10 text-champagne mb-4" />
        <h2 className="font-serif text-2xl font-bold text-white mb-2">Lección no disponible</h2>
        <p className="text-sm text-white/70 max-w-md mb-6">
          No fue posible encontrar la lección solicitada o no cuentas con los permisos necesarios.
        </p>
        <a
          href="/mi-cuenta/masterclasses"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-champagne text-obsidian font-semibold text-xs uppercase tracking-wider"
        >
          Volver a Mis Masterclasses
        </a>
      </div>
    );
  }

  const activeCourse = course;
  const activeLesson = lesson;

  return (
    <div className="bg-[#091420] min-h-screen text-white flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-white/10 bg-[#07101A] px-4 sm:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-4 min-w-0">
          <a
            href="/academia/mis-masterclasses"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Mis Masterclasses</span>
          </a>
          <span className="text-white/20">|</span>
          <div className="truncate">
            <h1 className="font-serif text-sm sm:text-base font-medium text-white truncate max-w-xs sm:max-w-md">
              {activeCourse.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-white/60">
            <ShieldCheck className="size-4 text-champagne" />
            Licencia Individual Activa
          </span>
          <button
            onClick={handleToggleComplete}
            disabled={savingProgress}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-white/10 text-white/90 border border-white/20 hover:bg-white/20'
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>{isCompleted ? 'Completada' : 'Marcar completada'}</span>
          </button>
        </div>
      </header>

      {/* Split Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main Video & Content Area */}
        <div className="flex-1 flex flex-col bg-black">
          {/* Video Player Canvas */}
          <div className="relative aspect-16/9 w-full bg-[#030910] flex items-center justify-center overflow-hidden">
            {playbackLoading ? (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-[#07131F] w-full h-full">
                <div className="size-10 border-2 border-champagne border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-white/80 text-sm">Preparando reproducción segura…</p>
                <p className="text-white/45 text-xs mt-1">Verificando tu acceso a esta lección</p>
              </div>
            ) : playbackData?.type === 'cloudflare' && playbackData.playbackUrl ? (
              <iframe
                id="lesson_cloudflare_iframe"
                src={playbackData.playbackUrl}
                title={activeLesson?.title || 'Video seguro de la lección'}
                className="w-full h-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : playbackData?.type === 'youtube' && (playbackData.embedUrl || playbackData.videoId) ? (
              <iframe
                id="lesson_youtube_iframe"
                src={
                  playbackData.embedUrl ||
                  `https://www.youtube-nocookie.com/embed/${playbackData.videoId}?rel=0&modestbranding=1&autoplay=1&enablejsapi=1`
                }
                title={activeLesson?.title || 'Video de la lección'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-[#07131F]">
                <div className="text-center p-6">
                  <div className="size-16 rounded-full bg-red-500/10 text-red-300 mx-auto flex items-center justify-center mb-3 border border-red-400/20">
                    <AlertCircle className="size-8" />
                  </div>
                  <h3 className="text-white font-serif text-lg font-medium">Video no disponible</h3>
                  <p className="text-white/60 text-xs mt-1 max-w-sm">
                    {playbackError || playbackData?.notice || 'Esta lección todavía no tiene un video publicado.'}
                  </p>
                  <button
                    type="button"
                    onClick={fetchPlaybackDetails}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-champagne px-4 py-2 text-xs font-semibold text-obsidian hover:brightness-105"
                  >
                    <RefreshCw className="size-3.5" />
                    Intentar nuevamente
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Metadata Bar */}
          <div className="bg-[#0A1624] px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-champagne font-mono font-medium">
                {moduleData?.title || 'Módulo Principal'}
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white mt-0.5">
                {activeLesson?.title}
              </h2>
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center gap-2">
              {prevLesson && (
                <a
                  href={`/academia/${slug}/leccion/${prevLesson.lesson.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs transition-colors border border-white/10"
                >
                  <ChevronLeft className="size-3.5" />
                  <span className="hidden sm:inline">Anterior</span>
                </a>
              )}
              {nextLesson && (
                <a
                  href={`/academia/${slug}/leccion/${nextLesson.lesson.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-champagne text-obsidian text-xs font-semibold hover:brightness-105 transition-all shadow-sm"
                >
                  <span>Siguiente clase</span>
                  <ChevronRight className="size-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Tabs & Content */}
          <div className="flex-1 bg-[#FDFBF7] text-obsidian p-6 sm:p-8">
            <div className="flex items-center gap-6 border-b border-[#B39A6A]/20 pb-3 text-xs sm:text-sm font-medium">
              <button
                onClick={() => setActiveTab('resumen')}
                className={`pb-3 border-b-2 transition-colors -mb-3 font-semibold ${
                  activeTab === 'resumen'
                    ? 'border-[#B39A6A] text-[#0B1724]'
                    : 'border-transparent text-[#0B1724]/60 hover:text-[#0B1724]'
                }`}
              >
                Resumen clínico
              </button>
              <button
                onClick={() => setActiveTab('transcripcion')}
                className={`pb-3 border-b-2 transition-colors -mb-3 font-semibold ${
                  activeTab === 'transcripcion'
                    ? 'border-[#B39A6A] text-[#0B1724]'
                    : 'border-transparent text-[#0B1724]/60 hover:text-[#0B1724]'
                }`}
              >
                Transcripción y notas
              </button>
              <button
                onClick={() => setActiveTab('materiales')}
                className={`pb-3 border-b-2 transition-colors -mb-3 font-semibold ${
                  activeTab === 'materiales'
                    ? 'border-[#B39A6A] text-[#0B1724]'
                    : 'border-transparent text-[#0B1724]/60 hover:text-[#0B1724]'
                }`}
              >
                Materiales descargables ({activeLesson?.attachments?.length || 0})
              </button>
            </div>

            <div className="mt-6 text-sm text-[#0B1724]/85 leading-relaxed min-h-[160px]">
              {activeTab === 'resumen' && (
                <div className="space-y-4">
                  <p>
                    {activeLesson?.summary ||
                      'Esta lección aborda los fundamentos clínicos impartidos por el Dr. Mauricio Benjamín Galindo López, con base en evidencia médica rigurosa y aplicación práctica personalizada.'}
                  </p>
                  <div className="p-4 rounded-xl bg-white border border-[#B39A6A]/25 text-xs text-[#0B1724]/80 shadow-xs">
                    <strong className="text-[#0B1724] font-semibold">Criterio clínico:</strong> Recuerda que el contenido de esta lección tiene carácter formativo y educativo. No reemplaza una consulta médica presencial ni justifica la auto-prescripción farmacológica.
                  </div>
                </div>
              )}

              {activeTab === 'transcripcion' && (
                <div className="space-y-3 font-serif text-base text-[#0B1724]/90 max-w-2xl">
                  <p>
                    {activeLesson?.transcript ||
                      'La transcripción completa de esta clase se genera a partir de la exposición del Dr. Mauricio Galindo para facilitar tu estudio y consulta rápida de conceptos.'}
                  </p>
                </div>
              )}

              {activeTab === 'materiales' && (
                <div className="space-y-3">
                  {attachmentError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      {attachmentError}
                    </div>
                  )}
                  {activeLesson?.attachments && activeLesson.attachments.length > 0 ? (
                    activeLesson.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#B39A6A]/25 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-champagne" />
                          <div>
                            <div className="font-medium text-obsidian text-xs sm:text-sm">{att.title}</div>
                            <div className="text-[11px] text-obsidian/50">{att.fileSizeLabel} · Formato {att.format}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAttachmentDownload(att.id)}
                          disabled={downloadingAttachmentId === att.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian text-white text-xs font-semibold hover:bg-[#07182A] transition-colors"
                        >
                          <Download className="size-3.5" />
                          <span>{downloadingAttachmentId === att.id ? 'Preparando…' : 'Descargar'}</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-obsidian/60">
                      Esta lección no contiene archivos adicionales descargables.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Medical Disclaimer */}
            <div className="mt-8 pt-4 border-t border-[#B39A6A]/20 text-[11px] text-[#0B1724]/60 flex items-start gap-2">
              <Info className="size-4 text-champagne shrink-0 mt-0.5" />
              <span>
                {activeCourse.disclaimerShort ||
                  'Material educativo bajo licencia individual. Prohibida su difusión o descarga no autorizada.'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Course Syllabus */}
        <aside className="w-full lg:w-96 bg-[#0D1B2A] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-auto lg:h-full">
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0B1724]">
            <span className="text-xs uppercase tracking-wider font-semibold text-white/80">
              Temario del Curso
            </span>
            <span className="text-xs text-champagne font-mono">
              {allLessons.length} lecciones
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-[600px] lg:max-h-none">
            {activeCourse.modules?.map((mod) => (
              <div key={mod.id} className="p-4">
                <div className="text-xs font-semibold text-white/90 mb-2.5">
                  {mod.title}
                </div>
                <div className="space-y-1.5">
                  {mod.lessons.map((les) => {
                    const isCurrent = les.slug === lessonSlug;
                    const isLessonDone = progressRecords.some(
                      (p) => p.lessonId === les.id && p.status === 'completed'
                    );

                    return (
                      <a
                        key={les.id}
                        href={`/academia/${activeCourse.slug}/leccion/${les.slug}`}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                          isCurrent
                            ? 'bg-champagne/20 text-white font-medium border border-champagne/40'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isLessonDone ? (
                            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <Play className="size-3.5 text-champagne shrink-0 fill-champagne" />
                          ) : (
                            <Play className="size-3.5 text-white/40 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        <span className="text-[10px] text-white/40 shrink-0 ml-2 font-mono">
                          {Math.round((les.durationSeconds || 600) / 60)}m
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
