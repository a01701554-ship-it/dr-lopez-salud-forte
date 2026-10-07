import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Play, AlertCircle } from 'lucide-react';

export interface VideoPlayerRef {
  getCurrentTime: () => number;
  getDuration: () => number;
  saveProgressNow: (markAsCompleted?: boolean) => Promise<boolean>;
  isCompleted: () => boolean;
}

interface LessonVideoPlayerProps {
  playbackData: {
    type: 'cloudflare' | 'youtube' | 'video';
    playbackUrl?: string;
    embedUrl?: string;
    videoId?: string;
    videoUrl?: string;
    error?: string;
    code?: string;
  } | null;
  lessonTitle: string;
  courseId: string;
  lessonId: string;
  userId: string;
  courseSlug: string;
  lessonSlug: string;
  serverPositionSeconds?: number;
  serverDurationSeconds?: number;
  serverCompleted?: boolean;
  serverUpdatedAt?: string;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  onProgressUpdate?: (progress: { positionSeconds: number; durationSeconds: number; completed: boolean }) => void;
  onLessonAutoCompleted?: () => void;
}

interface StoredProgress {
  currentTime: number;
  duration: number;
  wasPlaying: boolean;
  playbackRate: number;
  volume?: number;
  muted?: boolean;
  updatedAt: string;
  completed?: boolean;
}

export const LessonVideoPlayer = forwardRef<VideoPlayerRef, LessonVideoPlayerProps>(
  (
    {
      playbackData,
      lessonTitle,
      courseId,
      lessonId,
      userId,
      courseSlug,
      lessonSlug,
      serverPositionSeconds = 0,
      serverDurationSeconds = 0,
      serverCompleted = false,
      serverUpdatedAt,
      fetchWithAuth,
      onProgressUpdate,
      onLessonAutoCompleted,
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    // Buffering state (overlay only - never unmounts player)
    const [isBuffering, setIsBuffering] = useState<boolean>(false);
    const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Player live state
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(serverDurationSeconds || 0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isCompletedState, setIsCompletedState] = useState<boolean>(serverCompleted);

    // Active refs to avoid stale closures in event listeners
    const currentTimeRef = useRef<number>(0);
    const durationRef = useRef<number>(serverDurationSeconds || 0);
    const isPlayingRef = useRef<boolean>(false);
    const isCompletedRef = useRef<boolean>(serverCompleted);
    const lastSavedToLocalRef = useRef<number>(0);
    const lastSyncedToSupabaseRef = useRef<number>(0);
    const isSavingSupabaseRef = useRef<boolean>(false);
    const hasRestoredProgressRef = useRef<boolean>(false);

    // Storage keys
    const storageKey = `lesson-progress:${userId || 'anon'}:${courseId}:${lessonId}`;
    const legacyKey = `salud_forte_lesson_progress_${userId || 'anon'}_${lessonId}`;

    // Reset restored flag when lesson changes
    useEffect(() => {
      hasRestoredProgressRef.current = false;
      currentTimeRef.current = 0;
      isCompletedRef.current = serverCompleted;
      setIsCompletedState(serverCompleted);
    }, [lessonId, serverCompleted]);

    // Determine freshest position comparing localStorage vs Supabase server position
    const getFreshestInitialPosition = useCallback((): {
      position: number;
      duration: number;
      wasPlaying: boolean;
      completed: boolean;
    } => {
      let localData: StoredProgress | null = null;
      try {
        const raw = localStorage.getItem(storageKey) || localStorage.getItem(legacyKey);
        if (raw) {
          localData = JSON.parse(raw);
        }
      } catch (e) {
        console.warn('[Player] LocalStorage read note:', e);
      }

      const serverPos = Math.max(0, serverPositionSeconds || 0);
      const serverDur = Math.max(0, serverDurationSeconds || 0);
      const isServerCompleted = Boolean(serverCompleted);

      if (!localData) {
        return {
          position: serverPos,
          duration: serverDur,
          wasPlaying: false,
          completed: isServerCompleted,
        };
      }

      const localTime = new Date(localData.updatedAt || 0).getTime();
      const serverTime = serverUpdatedAt ? new Date(serverUpdatedAt).getTime() : 0;
      const completed = Boolean(localData.completed || isServerCompleted);
      const effectiveDuration = Math.max(localData.duration || 0, serverDur);

      // Local position is fresher than server timestamp
      if (localTime >= serverTime && Number.isFinite(localData.currentTime) && localData.currentTime > 0) {
        const pos = effectiveDuration > 0
          ? Math.min(localData.currentTime, effectiveDuration)
          : localData.currentTime;
        return {
          position: pos,
          duration: effectiveDuration,
          wasPlaying: Boolean(localData.wasPlaying),
          completed,
        };
      }

      return {
        position: serverPos,
        duration: effectiveDuration,
        wasPlaying: false,
        completed,
      };
    }, [storageKey, legacyKey, serverPositionSeconds, serverDurationSeconds, serverCompleted, serverUpdatedAt]);

    // Save to LocalStorage immediately
    const saveToLocalStorage = useCallback(
      (pos: number, dur: number, playing: boolean, completed: boolean) => {
        if (!courseId || !lessonId) return;
        try {
          const payload: StoredProgress = {
            currentTime: Math.round(pos * 10) / 10,
            duration: Math.round(dur * 10) / 10,
            wasPlaying: playing,
            playbackRate: videoRef.current?.playbackRate || 1,
            volume: videoRef.current?.volume ?? 1,
            muted: videoRef.current?.muted ?? false,
            updatedAt: new Date().toISOString(),
            completed,
          };
          const serialized = JSON.stringify(payload);
          localStorage.setItem(storageKey, serialized);
          localStorage.setItem(legacyKey, serialized);
          lastSavedToLocalRef.current = Date.now();
        } catch (err) {
          console.warn('[Player] LocalStorage save note:', err);
        }
      },
      [courseId, lessonId, storageKey, legacyKey],
    );

    // Sync to Supabase via backend endpoint
    const syncToSupabase = useCallback(
      async (markAsCompleted?: boolean): Promise<boolean> => {
        if (!courseSlug || !lessonSlug) {
          return false;
        }

        // If background periodic sync is already in flight, throttle routine saves,
        // but always allow explicit markAsCompleted calls to execute.
        if (isSavingSupabaseRef.current && !markAsCompleted) {
          return false;
        }

        isSavingSupabaseRef.current = true;
        const currentPos = Math.round(currentTimeRef.current);
        const currentDur = Math.round(durationRef.current);
        const finalCompleted = markAsCompleted ?? isCompletedRef.current;

        try {
          const res = await fetchWithAuth(
            `/api/academia/courses/${courseSlug}/lessons/${lessonSlug}/progress`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: finalCompleted ? 'completed' : 'in_progress',
                positionSeconds: currentPos,
                durationSeconds: currentDur,
              }),
            },
          );

          if (res.ok) {
            lastSyncedToSupabaseRef.current = Date.now();
            if (finalCompleted) {
              isCompletedRef.current = true;
              setIsCompletedState(true);
              onLessonAutoCompleted?.();
            }
            return true;
          } else {
            console.warn('[Player] Supabase sync response status:', res.status);
            return false;
          }
        } catch (err) {
          console.warn('[Player] Supabase sync network note:', err);
          return false;
        } finally {
          isSavingSupabaseRef.current = false;
        }
      },
      [courseSlug, lessonSlug, fetchWithAuth, onLessonAutoCompleted],
    );

    // Expose imperative methods to parent
    useImperativeHandle(
      ref,
      () => ({
        getCurrentTime: () => currentTimeRef.current,
        getDuration: () => durationRef.current,
        saveProgressNow: async (markAsCompleted?: boolean) => {
          const completed = markAsCompleted ?? isCompletedRef.current;
          if (completed) {
            isCompletedRef.current = true;
            setIsCompletedState(true);
          }
          saveToLocalStorage(
            currentTimeRef.current,
            durationRef.current,
            isPlayingRef.current,
            completed,
          );
          return await syncToSupabase(completed);
        },
        isCompleted: () => isCompletedRef.current,
      }),
      [saveToLocalStorage, syncToSupabase],
    );

    // Initial position calculated ONCE when lessonId changes
    const initialStartSecond = useMemo(() => {
      const initial = getFreshestInitialPosition();
      currentTimeRef.current = initial.position;
      durationRef.current = initial.duration;
      isCompletedRef.current = initial.completed;
      return Math.floor(initial.position || 0);
    }, [getFreshestInitialPosition]);

    // Build STABLE embed URLs that NEVER change on timeupdate
    const stableEmbedUrl = useMemo(() => {
      if (!playbackData) return '';

      if (playbackData.type === 'cloudflare' && playbackData.playbackUrl) {
        try {
          const url = new URL(playbackData.playbackUrl, 'https://cloudflarestream.com');
          if (initialStartSecond > 0) {
            url.searchParams.set('startTime', `${initialStartSecond}s`);
          }
          return url.toString();
        } catch {
          return playbackData.playbackUrl;
        }
      }

      if (playbackData.type === 'youtube') {
        if (playbackData.embedUrl) {
          try {
            const url = new URL(playbackData.embedUrl, 'https://www.youtube-nocookie.com');
            if (initialStartSecond > 0) url.searchParams.set('start', String(initialStartSecond));
            url.searchParams.set('enablejsapi', '1');
            return url.toString();
          } catch {
            return playbackData.embedUrl;
          }
        }
        if (playbackData.videoId) {
          const startParam = initialStartSecond > 0 ? `&start=${initialStartSecond}` : '';
          return `https://www.youtube-nocookie.com/embed/${playbackData.videoId}?rel=0&modestbranding=1&enablejsapi=1${startParam}`;
        }
      }

      return '';
    }, [playbackData?.type, playbackData?.playbackUrl, playbackData?.embedUrl, playbackData?.videoId, initialStartSecond]);

    // HTML5 Video Event Handlers
    const handleVideoLoadedMetadata = () => {
      if (!videoRef.current) return;
      const video = videoRef.current;
      const dur = video.duration || durationRef.current;
      durationRef.current = dur;
      setDuration(dur);

      if (!hasRestoredProgressRef.current) {
        const restored = getFreshestInitialPosition();
        if (restored.position > 0 && restored.position < dur) {
          video.currentTime = restored.position;
          currentTimeRef.current = restored.position;
          setCurrentTime(restored.position);
        }
        hasRestoredProgressRef.current = true;
      }

      // Restore volume / muted preferences
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed: StoredProgress = JSON.parse(raw);
          if (typeof parsed.volume === 'number') video.volume = parsed.volume;
          if (typeof parsed.muted === 'boolean') video.muted = parsed.muted;
          if (typeof parsed.playbackRate === 'number') video.playbackRate = parsed.playbackRate;
        }
      } catch {
        // silent
      }
    };

    const handleVideoTimeUpdate = () => {
      if (!videoRef.current) return;
      const pos = videoRef.current.currentTime;
      const dur = videoRef.current.duration || durationRef.current;

      currentTimeRef.current = pos;

      // Auto-complete when reaching 95% of duration
      if (dur > 30 && pos >= dur * 0.95 && !isCompletedRef.current) {
        isCompletedRef.current = true;
        setIsCompletedState(true);
        saveToLocalStorage(pos, dur, isPlayingRef.current, true);
        syncToSupabase(true);
        onLessonAutoCompleted?.();
      }

      // Throttle localStorage save (every 3 seconds)
      const now = Date.now();
      if (now - lastSavedToLocalRef.current > 3000) {
        saveToLocalStorage(pos, dur, isPlayingRef.current, isCompletedRef.current);
      }

      // Throttle Supabase sync (every 12 seconds during playback)
      if (isPlayingRef.current && now - lastSyncedToSupabaseRef.current > 12000) {
        syncToSupabase(isCompletedRef.current);
      }
    };

    const handleVideoPlay = () => {
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = null;
      }
      setIsBuffering(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      saveToLocalStorage(currentTimeRef.current, durationRef.current, true, isCompletedRef.current);
    };

    const handleVideoPause = () => {
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = null;
      }
      setIsBuffering(false);
      isPlayingRef.current = false;
      setIsPlaying(false);
      saveToLocalStorage(currentTimeRef.current, durationRef.current, false, isCompletedRef.current);
      syncToSupabase(isCompletedRef.current);
    };

    const handleVideoEnded = () => {
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = null;
      }
      setIsBuffering(false);
      isPlayingRef.current = false;
      setIsPlaying(false);
      isCompletedRef.current = true;
      setIsCompletedState(true);
      saveToLocalStorage(durationRef.current, durationRef.current, false, true);
      syncToSupabase(true);
      onLessonAutoCompleted?.();
    };

    // Buffering with 250ms delay to prevent visual flicker
    const handleVideoWaiting = () => {
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = setTimeout(() => {
        setIsBuffering(true);
      }, 250);
    };

    const handleVideoPlaying = () => {
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = null;
      }
      setIsBuffering(false);
    };

    // Tab visibility handling: DO NOT PAUSE the video! Just flush latest progress to storage
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          saveToLocalStorage(
            currentTimeRef.current,
            durationRef.current,
            isPlayingRef.current,
            isCompletedRef.current,
          );
          syncToSupabase(isCompletedRef.current);
        }
      };

      const handlePageHide = () => {
        saveToLocalStorage(
          currentTimeRef.current,
          durationRef.current,
          isPlayingRef.current,
          isCompletedRef.current,
        );
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pagehide', handlePageHide);
      window.addEventListener('beforeunload', handlePageHide);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pagehide', handlePageHide);
        window.removeEventListener('beforeunload', handlePageHide);
        if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
        saveToLocalStorage(
          currentTimeRef.current,
          durationRef.current,
          isPlayingRef.current,
          isCompletedRef.current,
        );
      };
    }, [saveToLocalStorage, syncToSupabase]);

    // Handle postMessage events from Cloudflare Stream or YouTube iframe
    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (!event.data) return;
        try {
          let data = event.data;
          if (typeof data === 'string') {
            data = JSON.parse(data);
          }

          // Cloudflare Stream events
          if (data?.eventName === 'timeupdate' && typeof data?.currentTime === 'number') {
            const pos = data.currentTime;
            const dur = data.duration || durationRef.current;
            currentTimeRef.current = pos;
            if (dur > 0 && dur !== durationRef.current) {
              durationRef.current = dur;
            }

            const now = Date.now();
            if (now - lastSavedToLocalRef.current > 3000) {
              saveToLocalStorage(pos, dur, isPlayingRef.current, isCompletedRef.current);
            }
            if (isPlayingRef.current && now - lastSyncedToSupabaseRef.current > 12000) {
              syncToSupabase(isCompletedRef.current);
            }
          } else if (data?.eventName === 'play' || data?.eventName === 'playing') {
            handleVideoPlaying();
            isPlayingRef.current = true;
          } else if (data?.eventName === 'pause') {
            handleVideoPause();
          } else if (data?.eventName === 'waiting') {
            handleVideoWaiting();
          } else if (data?.eventName === 'ended') {
            handleVideoEnded();
          }

          // YouTube events
          if (data?.event === 'infoDelivery' && data?.info) {
            if (typeof data.info.currentTime === 'number') {
              const pos = data.info.currentTime;
              const dur = data.info.duration || durationRef.current;
              currentTimeRef.current = pos;

              const now = Date.now();
              if (now - lastSavedToLocalRef.current > 3000) {
                saveToLocalStorage(pos, dur, isPlayingRef.current, isCompletedRef.current);
              }
              if (isPlayingRef.current && now - lastSyncedToSupabaseRef.current > 12000) {
                syncToSupabase(isCompletedRef.current);
              }
            }
            if (data.info.playerState === 1) {
              // Playing
              handleVideoPlaying();
              isPlayingRef.current = true;
            } else if (data.info.playerState === 2) {
              // Paused
              handleVideoPause();
            } else if (data.info.playerState === 3) {
              // Buffering
              handleVideoWaiting();
            } else if (data.info.playerState === 0) {
              // Ended
              handleVideoEnded();
            }
          }
        } catch {
          // Ignore non-JSON postMessage events
        }
      };

      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, [saveToLocalStorage, syncToSupabase]);

    return (
      <div className="relative aspect-16/9 w-full bg-[#030910] flex items-center justify-center overflow-hidden">
        {/* Native HTML5 Video */}
        {playbackData?.type === 'video' && playbackData.videoUrl ? (
          <video
            ref={videoRef}
            id="lesson_native_video"
            src={playbackData.videoUrl}
            title={lessonTitle}
            className="w-full h-full object-contain bg-black"
            controls
            playsInline
            preload="metadata"
            onLoadedMetadata={handleVideoLoadedMetadata}
            onTimeUpdate={handleVideoTimeUpdate}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onEnded={handleVideoEnded}
            onWaiting={handleVideoWaiting}
            onPlaying={handleVideoPlaying}
          />
        ) : playbackData?.type === 'cloudflare' && stableEmbedUrl ? (
          /* Cloudflare Stream Iframe */
          <iframe
            ref={iframeRef}
            id="lesson_cloudflare_iframe"
            key={`cf_${lessonId}`}
            src={stableEmbedUrl}
            title={lessonTitle || 'Video seguro de la lección'}
            className="w-full h-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : playbackData?.type === 'youtube' && stableEmbedUrl ? (
          /* YouTube Iframe */
          <iframe
            ref={iframeRef}
            id="lesson_youtube_iframe"
            key={`yt_${lessonId}`}
            src={stableEmbedUrl}
            title={lessonTitle || 'Video de la lección'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          /* Placeholder / Video unavailable */
          <div className="flex flex-col items-center justify-center text-center p-8 bg-[#07131F] w-full h-full">
            <div className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-champagne">
              <Play className="size-6 ml-0.5" />
            </div>
            <p className="text-white text-base font-medium max-w-md">
              {lessonTitle}
            </p>
            <p className="text-white/50 text-xs mt-2 max-w-sm">
              Esta lección está registrada en el temario. Si el video está en procesamiento, el contenido audiovisual estará disponible próximamente.
            </p>
          </div>
        )}

        {/* Buffering Indicator Overlay (Non-destructive, keeps video mounted) */}
        {isBuffering && (
          <div
            role="status"
            aria-label="Cargando video…"
            className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none transition-opacity duration-200 z-10"
          >
            <div className="size-10 border-2 border-champagne border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  },
);

LessonVideoPlayer.displayName = 'LessonVideoPlayer';
