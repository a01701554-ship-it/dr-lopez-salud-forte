'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LessonVideoPlayer,
  VideoPlayerRef,
} from '@/components/academia/lesson-video-player';

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
  type: 'youtube' | 'cloudflare' | 'video';
  videoId?: string;
  embedUrl?: string;
  token?: string;
  playbackUrl?: string;
  videoUrl?: string;
  notice?: string;
  expiresIn?: number;
}

type PlayerMachineState =
  | 'checking-session'
  | 'checking-access'
  | 'loading-lesson'
  | 'loading-video-source'
  | 'restoring-progress'
  | 'ready'
  | 'error';

export default function LessonPlayerPage({
  params,
  slugProp,
  lessonSlugProp,
}: LessonPlayerProps) {
  const slug = slugProp || params?.slug || 'menopausia-con-claridad';
  const lessonSlug = lessonSlugProp || params?.lessonSlug || 'bienvenida-y-alcance-educativo';

  const { fetchWithAuth, user } = useAuth();
  const fetchWithAuthRef = useRef(fetchWithAuth);
  fetchWithAuthRef.current = fetchWithAuth;

  // Strict state machine
  const [playerState, setPlayerState] = useState<PlayerMachineState>('checking-session');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [playbackData, setPlaybackData] = useState<VideoPlaybackData | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const [serverPositionSeconds, setServerPositionSeconds] = useState(0);
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | undefined>(undefined);
  const [progressRecords, setProgressRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'resumen' | 'transcripcion' | 'materiales'>('resumen');

  const [isSavingNextLesson, setIsSavingNextLesson] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const videoPlayerRef = useRef<VideoPlayerRef | null>(null);
  const requestIdRef = useRef(0);

  // Fetch lesson data and validate access in a single atomic flow
  const fetchLesson = useCallback(
    async (signal?: AbortSignal) => {
      const currentRequestId = ++requestIdRef.current;
      setPlayerState('loading-lesson');
      setErrorStatus(null);
      setErrorMessage(null);
      setNavigationError(null);

      try {
        const res = await fetchWithAuthRef.current(`/api/academia/courses/${slug}/lessons/${lessonSlug}`, {
          signal,
          credentials: 'include',
        });

        if (signal?.aborted || currentRequestId !== requestIdRef.current) {
          return;
        }

        const data = await res.json();

        if (signal?.aborted || currentRequestId !== requestIdRef.current) {
          return;
        }

        if (!res.ok) {
          const status = data.code || (res.status === 401 ? 'UNAUTHENTICATED' : res.status === 403 ? 'ENTITLEMENT_REQUIRED' : 'ERROR');
          setErrorStatus(status);
          setErrorMessage(data.error || 'No fue posible acceder a esta lección.');
          setPlayerState('error');
          return;
        }

        // Transition through video source and progress restoration
        setPlayerState('loading-video-source');
        setCourse(data.course);
        setModuleData(data.module);
        setLesson(data.lesson);
        setPlaybackData(data.playback || null);

        // Check existing progress
        let foundCompleted = false;
        let foundPosition = 0;
        let foundUpdatedAt: string | undefined = undefined;

        if (data.progress && Array.isArray(data.progress)) {
          setProgressRecords(data.progress);
          const thisLessonProgress = data.progress.find(
            (p: any) => p.lessonId === data.lesson.id || p.lessonId === data.lesson.slug,
          );
          if (thisLessonProgress) {
            foundCompleted =
              thisLessonProgress.status === 'completed' || Boolean(thisLessonProgress.completed);
            foundPosition = thisLessonProgress.positionSeconds || 0;
            foundUpdatedAt = thisLessonProgress.updatedAt || thisLessonProgress.lastWatchedAt;
          }
        }

        setIsCompleted(foundCompleted);
        setServerPositionSeconds(foundPosition);
        setServerUpdatedAt(foundUpdatedAt);

        setPlayerState('restoring-progress');

        // Transition to ready: Video mounts once and stays mounted
        setPlayerState('ready');
      } catch (err: any) {
        if (signal?.aborted || currentRequestId !== requestIdRef.current) {
          return;
        }
        setErrorStatus('NETWORK_ERROR');
        setErrorMessage('Error de conexión al cargar la lección.');
        setPlayerState('error');
      }
    },
    [slug, lessonSlug],
  );

  // Trigger lesson load ONLY when lesson coordinates or authenticated user actually change
  useEffect(() => {
    const controller = new AbortController();
    fetchLesson(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchLesson, user?.id]);

  const handleAttachmentDownload = async (attachmentId: string) => {
    if (!lesson) return;
    setDownloadingAttachmentId(attachmentId);
    setAttachmentError(null);

    try {
      const res = await fetchWithAuthRef.current(
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
  const isLastLesson = currentIndex === allLessons.length - 1;

  // Handle "Siguiente lección" click with mandatory save -> confirm -> navigate flow
  const handleNextLesson = async () => {
    if (isSavingNextLesson) return;
    setIsSavingNextLesson(true);
    setNavigationError(null);

    try {
      // 1. Guardar progreso actual y marcar como completada
      let saveSuccess = false;
      if (videoPlayerRef.current) {
        saveSuccess = await videoPlayerRef.current.saveProgressNow(true);
      }

      // Fallback directo a la API en caso de que el ref del reproductor no estuviera disponible
      if (!saveSuccess && (lesson || lessonSlug)) {
        try {
          const res = await fetchWithAuth(
            `/api/academia/courses/${course?.slug || slug}/lessons/${lesson?.slug || lessonSlug}/progress`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'completed',
                positionSeconds: lesson?.durationSeconds || 0,
                durationSeconds: lesson?.durationSeconds || 0,
              }),
            },
          );
          if (res.ok) {
            saveSuccess = true;
          }
        } catch (postErr) {
          console.warn('[handleNextLesson] Direct fallback save note:', postErr);
        }
      }

      if (!saveSuccess) {
        setNavigationError('No fue posible guardar tu progreso. Inténtalo nuevamente.');
        setIsSavingNextLesson(false);
        return;
      }

      // 2. Confirmación y actualización inmediata de interfaz
      setIsCompleted(true);

      if (lesson) {
        setProgressRecords((prev) => {
          const filtered = prev.filter(
            (p) =>
              p.lessonId !== lesson.id &&
              p.lessonId !== lesson.slug &&
              p.lesson_id !== lesson.id &&
              p.lesson_id !== lesson.slug,
          );
          return [
            ...filtered,
            {
              lessonId: lesson.id,
              lesson_id: lesson.id,
              status: 'completed',
              completed: true,
              progressPercent: 100,
              progress_percent: 100,
              positionSeconds: videoPlayerRef.current?.getCurrentTime() || lesson.durationSeconds || 0,
              lastWatchedAt: new Date().toISOString(),
            },
          ];
        });
      }

      // Detener el estado de guardando para que la interfaz pase inmediatamente al ESTADO 3 (Verde "Lección completada")
      setIsSavingNextLesson(false);

      // 3. Pausa de confirmación visual (600ms) para que el alumno aprecie el indicador verde antes de la transición
      await new Promise((resolve) => setTimeout(resolve, 600));

      // 4. Navegar a la siguiente lección
      if (nextLesson) {
        const nextUrl = `/academia/${course?.slug || slug}/leccion/${nextLesson.lesson.slug}`;
        window.history.pushState(null, '', nextUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        // Última lección: llevar de vuelta a Mis Masterclasses con progreso completo
        const finishUrl = '/academia/mis-masterclasses';
        window.history.pushState(null, '', finishUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    } catch (err) {
      console.error('[Navigation] Error in handleNextLesson:', err);
      setNavigationError('No fue posible guardar tu progreso. Inténtalo nuevamente.');
      setIsSavingNextLesson(false);
    }
  };

  // Handle "Anterior" navigation with position preservation
  const handlePrevLesson = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!prevLesson) return;

    // Preservar la posición actual antes de retroceder
    videoPlayerRef.current?.saveProgressNow(false).catch(() => {});

    const prevUrl = `/academia/${slug}/leccion/${prevLesson.lesson.slug}`;
    window.history.pushState(null, '', prevUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Handle direct lesson selection from syllabus
  const handleSelectLessonFromSyllabus = (targetSlug: string, e: React.MouseEvent) => {
    if (targetSlug === lessonSlug) {
      e.preventDefault();
      return;
    }
    e.preventDefault();

    // Guardar posición en segundo plano antes de cambiar
    videoPlayerRef.current?.saveProgressNow(false).catch(() => {});

    const targetUrl = `/academia/${course?.slug || slug}/leccion/${targetSlug}`;
    window.history.pushState(null, '', targetUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Render Access / Authentication Errors
  if (errorStatus || playerState === 'error') {
    return (
      <div className="bg-[#091420] min-h-screen text-white flex flex-col">
        <header className="h-16 border-b border-white/10 bg-[#07101A] px-6 flex items-center justify-between">
          <Link
            href="/academia/mis-masterclasses"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Volver a Mis Masterclasses</span>
          </Link>
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
                  {errorMessage ||
                    'Para acceder a esta lección médica debes iniciar sesión con tu cuenta de Salud Forte.'}
                </p>
                <div className="space-y-3">
                  <Link
                    href={`/cuenta/iniciar-sesion?redirect=/academia/${slug}/leccion/${lessonSlug}`}
                    className="block w-full py-3 px-4 rounded-xl bg-champagne text-obsidian font-semibold text-sm hover:brightness-105 transition-all shadow-md"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href={`/cuenta/registro?redirect=/academia/${slug}/leccion/${lessonSlug}`}
                    className="block w-full py-3 px-4 rounded-xl bg-white/5 border border-white/15 text-white/90 font-medium text-sm hover:bg-white/10 transition-colors"
                  >
                    Crear cuenta
                  </Link>
                </div>
              </>
            )}

            {errorStatus === 'ENTITLEMENT_REQUIRED' && (
              <>
                <div className="size-16 rounded-full bg-amber-500/10 text-amber-300 mx-auto flex items-center justify-center mb-5 border border-amber-500/20">
                  <Lock className="size-8" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-white mb-2">Masterclass no adquirida</h2>
                <p className="text-sm text-white/70 mb-6 leading-relaxed">
                  {errorMessage ||
                    'Esta lección médica requiere inscripción activa en la masterclass.'}
                </p>
                <Link
                  href={`/academia/${slug}`}
                  className="block w-full py-3 px-4 rounded-xl bg-champagne text-obsidian font-semibold text-sm hover:brightness-105 transition-all shadow-md"
                >
                  Ver detalles de la masterclass
                </Link>
              </>
            )}

            {errorStatus !== 'UNAUTHENTICATED' && errorStatus !== 'ENTITLEMENT_REQUIRED' && (
              <>
                <div className="size-16 rounded-full bg-red-500/10 text-red-300 mx-auto flex items-center justify-center mb-5 border border-red-500/20">
                  <AlertCircle className="size-8" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-white mb-2">Lección no disponible</h2>
                <p className="text-sm text-white/70 mb-6 leading-relaxed">
                  {errorMessage ||
                    'No fue posible cargar el contenido solicitado en este momento.'}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fetchLesson()}
                    className="w-full py-3 px-4 rounded-xl bg-champagne text-obsidian font-semibold text-sm hover:brightness-105 transition-all shadow-md cursor-pointer"
                  >
                    Reintentar conexión
                  </button>
                  <Link
                    href="/academia/mis-masterclasses"
                    className="block w-full py-3 px-4 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors text-center"
                  >
                    Volver a mis masterclasses
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const activeCourse = course || {
    id: 'placeholder',
    slug,
    title: 'Masterclass Médica',
    modules: [],
  };

  const activeLesson = lesson || {
    id: 'placeholder',
    slug: lessonSlug,
    title: 'Lección Médica',
    durationSeconds: 0,
  };

  return (
    <div className="bg-[#091420] min-h-screen text-white flex flex-col selection:bg-champagne selection:text-obsidian">
      {/* Top Bar Navigation */}
      <header className="h-16 border-b border-white/10 bg-[#07101A] px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/academia/mis-masterclasses"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Mis Masterclasses</span>
          </Link>
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

          {/* Non-interactive Lesson Status Indicator */}
          <div
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-default select-none pointer-events-none transition-all duration-300 ${
              isSavingNextLesson
                ? 'bg-[#0D1F30] text-champagne border border-champagne/40 shadow-[0_0_12px_rgba(212,175,55,0.12)]'
                : isCompleted
                ? 'bg-[rgba(16,185,129,0.16)] text-[#D1FAE5] border border-[rgba(16,185,129,0.45)] shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-[#0D1F30] text-white/80 border border-white/15'
            }`}
          >
            {isSavingNextLesson ? (
              <>
                <RefreshCw className="size-3.5 animate-spin text-champagne" aria-hidden="true" />
                <span>Guardando progreso…</span>
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="size-3.5 text-[#10B981]" aria-hidden="true" />
                <span>Lección completada</span>
              </>
            ) : (
              <>
                <span className="size-2 rounded-full bg-champagne animate-pulse" aria-hidden="true" />
                <span>Lección en curso</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Split Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main Video & Content Area */}
        <div className="flex-1 flex flex-col bg-black">
          {/* Video Container Area:
              Shows initial access verification screen ONLY until ready.
              Once ready, mounts LessonVideoPlayer permanently. */}
          {playerState === 'ready' && lesson ? (
            <LessonVideoPlayer
              ref={videoPlayerRef}
              key={lesson.id}
              playbackData={playbackData}
              lessonTitle={activeLesson.title}
              courseId={activeCourse.id}
              lessonId={lesson.id}
              userId={user?.id || 'anon'}
              courseSlug={slug}
              lessonSlug={activeLesson.slug}
              serverPositionSeconds={serverPositionSeconds}
              serverDurationSeconds={activeLesson.durationSeconds}
              serverCompleted={isCompleted}
              serverUpdatedAt={serverUpdatedAt}
              fetchWithAuth={fetchWithAuth}
              onProgressUpdate={(prog) => {
                if (prog.completed && !isCompleted) {
                  setIsCompleted(true);
                }
              }}
              onLessonAutoCompleted={() => {
                setIsCompleted(true);
              }}
            />
          ) : (
            <div className="relative aspect-16/9 w-full bg-[#030910] flex flex-col items-center justify-center text-center p-6">
              <div className="size-10 border-2 border-champagne border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white/80 text-sm">Preparando reproducción segura…</p>
              <p className="text-white/45 text-xs mt-1">Verificando tu acceso a esta lección</p>
            </div>
          )}

          {/* Lesson Metadata Bar */}
          <div className="bg-[#0A1624] px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-champagne font-mono font-medium">
                {moduleData?.title || 'Módulo Principal'}
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white mt-0.5">
                {activeLesson.title}
              </h2>
            </div>

            {/* Prev / Next navigation */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              {navigationError && (
                <span className="text-xs text-amber-300 font-medium mr-2">
                  {navigationError}
                </span>
              )}

              <div className="flex items-center gap-2">
                {prevLesson && (
                  <button
                    type="button"
                    onClick={handlePrevLesson}
                    aria-label="Ir a la lección anterior"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs transition-colors border border-white/10 cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5" />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>
                )}

                {/* Siguiente lección / Finalizar curso button */}
                <button
                  type="button"
                  onClick={handleNextLesson}
                  disabled={isSavingNextLesson}
                  aria-label={isLastLesson ? 'Finalizar curso' : 'Ir a la siguiente lección'}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 min-w-[155px] justify-center rounded-lg bg-champagne text-obsidian text-xs font-semibold hover:brightness-105 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSavingNextLesson ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Guardando progreso…</span>
                    </>
                  ) : isLastLesson ? (
                    <>
                      <span>Finalizar curso</span>
                      <CheckCircle2 className="size-3.5 text-obsidian" />
                    </>
                  ) : (
                    <>
                      <span>Siguiente lección</span>
                      <ChevronRight className="size-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs & Content */}
          <div className="flex-1 bg-[#FDFBF7] text-obsidian p-6 sm:p-8">
            <div className="flex items-center gap-6 border-b border-[#B39A6A]/20 pb-3 text-xs sm:text-sm font-medium">
              <button
                onClick={() => setActiveTab('resumen')}
                className={`pb-3 border-b-2 transition-colors -mb-3 font-semibold cursor-pointer ${
                  activeTab === 'resumen'
                    ? 'border-[#B39A6A] text-[#0B1724]'
                    : 'border-transparent text-[#0B1724]/60 hover:text-[#0B1724]'
                }`}
              >
                Resumen clínico
              </button>
              <button
                onClick={() => setActiveTab('transcripcion')}
                className={`pb-3 border-b-2 transition-colors -mb-3 font-semibold cursor-pointer ${
                  activeTab === 'transcripcion'
                    ? 'border-[#B39A6A] text-[#0B1724]'
                    : 'border-transparent text-[#0B1724]/60 hover:text-[#0B1724]'
                }`}
              >
                Transcripción y notas
              </button>
              <button
                onClick={() => setActiveTab('materiales')}
                className={`pb-3 border-b-2 transition-colors -mb-3 font-semibold cursor-pointer ${
                  activeTab === 'materiales'
                    ? 'border-[#B39A6A] text-[#0B1724]'
                    : 'border-transparent text-[#0B1724]/60 hover:text-[#0B1724]'
                }`}
              >
                Materiales descargables ({activeLesson.attachments?.length || 0})
              </button>
            </div>

            <div className="mt-6 text-sm text-[#0B1724]/85 leading-relaxed min-h-[160px]">
              {activeTab === 'resumen' && (
                <div className="space-y-4">
                  <p>
                    {activeLesson.summary ||
                      'Esta lección aborda los fundamentos clínicos impartidos por el Dr. Mauricio Benjamín Galindo López, con base en evidencia médica rigurosa y aplicación práctica personalizada.'}
                  </p>
                  <div className="p-4 rounded-xl bg-white border border-[#B39A6A]/25 text-xs text-[#0B1724]/80 shadow-xs">
                    <strong className="text-[#0B1724] font-semibold">Criterio clínico:</strong> Recuerda
                    que el contenido de esta lección tiene carácter formativo y educativo. No reemplaza
                    una consulta médica presencial ni justifica la auto-prescripción farmacológica.
                  </div>
                </div>
              )}

              {activeTab === 'transcripcion' && (
                <div className="space-y-3 font-serif text-base text-[#0B1724]/90 max-w-2xl">
                  <p>
                    {activeLesson.transcript ||
                      'La transcripción completa de esta lección se genera a partir de la exposición del Dr. Mauricio Galindo para facilitar tu estudio y consulta rápida de conceptos.'}
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
                  {activeLesson.attachments && activeLesson.attachments.length > 0 ? (
                    activeLesson.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#B39A6A]/25 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-champagne" />
                          <div>
                            <div className="font-medium text-obsidian text-xs sm:text-sm">
                              {att.title}
                            </div>
                            <div className="text-[11px] text-obsidian/50">
                              {att.fileSizeLabel} · Formato {att.format}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAttachmentDownload(att.id)}
                          disabled={downloadingAttachmentId === att.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian text-white text-xs font-semibold hover:bg-[#07182A] transition-colors cursor-pointer"
                        >
                          <Download className="size-3.5" />
                          <span>
                            {downloadingAttachmentId === att.id ? 'Preparando…' : 'Descargar'}
                          </span>
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
                    const isLessonDone =
                      (isCurrent && isCompleted) ||
                      progressRecords.some(
                        (p) =>
                          (p.lessonId === les.id ||
                            p.lessonId === les.slug ||
                            p.lesson_id === les.id ||
                            p.lesson_id === les.slug) &&
                          (p.status === 'completed' ||
                            p.completed === true ||
                            p.progressPercent === 100 ||
                            p.progress_percent === 100),
                      );

                    return (
                      <Link
                        key={les.id}
                        href={`/academia/${activeCourse.slug}/leccion/${les.slug}`}
                        onClick={(e) => handleSelectLessonFromSyllabus(les.slug, e)}
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
                      </Link>
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
