'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePrefersReducedMotion } from './motion-wrapper';

/**
 * Constantes de calibración temporal del video MP4 avatar.
 * Ratios de tiempo exactos del avatar animado:
 * - LEFT_TIME_RATIO (0.00): Avatar mirando hacia la izquierda de la pantalla (primer fotograma)
 * - FRONT_TIME_RATIO (0.63): Avatar mirando completamente de frente (contacto visual con el paciente)
 * - RIGHT_TIME_RATIO (0.98): Avatar mirando hacia la derecha de la pantalla (último fotograma útil)
 * - FRAME_RATE (24 fps): 1 / 24 = ~0.041667s por fotograma
 */
export const AVATAR_CALIBRATION = {
  LEFT_TIME_RATIO: 0.0,
  FRONT_TIME_RATIO: 0.63,
  RIGHT_TIME_RATIO: 0.98,
  FRAME_RATE: 24,
  FRAME_DURATION: 1 / 24, // ~0.041667s
} as const;

interface InteractiveDoctorAvatarProps {
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  heroRef?: React.RefObject<HTMLElement | null>;
}

export function InteractiveDoctorAvatar({
  className = '',
  imgClassName = '',
  priority = false,
  heroRef,
}: InteractiveDoctorAvatarProps) {
  const prefersReduced = usePrefersReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Estados visuales de React (solamente para presentación y fallback, no en cada fotograma)
  const [videoReady, setVideoReady] = useState(false);
  const [hasRealMediaError, setHasRealMediaError] = useState(false);

  // Máquina de estados y referencias numéricas para scrub continuo y fluido
  const metadataReadyRef = useRef<boolean>(false);
  const dataReadyRef = useRef<boolean>(false);
  const successfullyUnlockedRef = useRef<boolean>(false);
  const isSeekingRef = useRef<boolean>(false);
  const pendingTimeRef = useRef<number | null>(null);
  const lastRequestedTimeRef = useRef<number>(-1);
  const isVisibleRef = useRef<boolean>(true);
  const isDesktopModeRef = useRef<boolean>(false);
  const durationRef = useRef<number>(4.042);

  // Progreso normalizado [0: izquierda, 0.5: frontal, 1.0: derecha]
  const targetProgressRef = useRef<number>(0.5);
  const smoothedProgressRef = useRef<number>(0.5);
  const rafIdRef = useRef<number | null>(null);

  // Cálculo del progreso de scroll móvil según la posición real del contenedor en el viewport
  const calculateMobileScrollProgress = useCallback(() => {
    if (typeof window === 'undefined') return 0.5;
    const targetElement = containerRef.current || heroRef?.current;
    if (!targetElement) return 0.5;

    const rect = targetElement.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;

    // Rango de activación en viewport:
    // - Comienza (progreso 0.0) cuando la parte superior de la tarjeta entra por el 85% de la altura visible
    // - Termina (progreso 1.0) cuando la parte superior asciende al 15% superior del viewport
    const startPos = vh * 0.85;
    const endPos = vh * 0.15;
    const range = startPos - endPos;

    if (range <= 0) return 0.5;

    const rawProgress = (startPos - rect.top) / range;
    return Math.max(0, Math.min(1, rawProgress));
  }, [heroRef]);

  // Mapeo continuo y suave del progreso normalizado [0, 1] a tiempo útil del video
  const computeTargetTime = useCallback(
    (progress: number, duration: number) => {
      if (!duration || isNaN(duration) || duration <= 0) return 0;

      const frameDur = AVATAR_CALIBRATION.FRAME_DURATION;
      const minTime = duration * AVATAR_CALIBRATION.LEFT_TIME_RATIO;
      const frontTime = duration * AVATAR_CALIBRATION.FRONT_TIME_RATIO;
      const maxTime = Math.min(
        duration - frameDur,
        duration * AVATAR_CALIBRATION.RIGHT_TIME_RATIO,
      );

      const p = Math.max(0, Math.min(1, progress));

      // Mapeo proporcional continuo:
      // p = 0.0 -> minTime (primer fotograma)
      // p = 0.5 -> frontTime (contacto visual frontal)
      // p = 1.0 -> maxTime (último fotograma útil)
      if (p <= 0.5) {
        return minTime + (frontTime - minTime) * (p / 0.5);
      } else {
        return frontTime + (maxTime - frontTime) * ((p - 0.5) / 0.5);
      }
    },
    [],
  );

  // Aplicación segura de currentTime al elemento de video con cola de un solo seek pendiente
  const applyTime = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration || durationRef.current;
    if (!duration || isNaN(duration) || duration <= 0) return;

    const frameDur = AVATAR_CALIBRATION.FRAME_DURATION;
    const safeTime = Math.max(0, Math.min(duration - frameDur, time));

    // Si el video está en pleno proceso de búsqueda (seeking), encolar el tiempo más reciente
    if (video.seeking || isSeekingRef.current) {
      pendingTimeRef.current = safeTime;
      return;
    }

    // Solo solicitar una nueva búsqueda si la diferencia es de al menos 1 fotograma (o primera asignación)
    const isFirstSeek = lastRequestedTimeRef.current < 0;
    const diff = Math.abs(video.currentTime - safeTime);

    if (isFirstSeek || diff >= frameDur) {
      try {
        isSeekingRef.current = true;
        lastRequestedTimeRef.current = safeTime;
        video.currentTime = safeTime;
      } catch {
        isSeekingRef.current = false;
      }
    }
  }, []);

  // Activación visual del video una vez que el fotograma está confirmado en el buffer
  const activateVideoIfDecoded = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        (
          video as unknown as {
            requestVideoFrameCallback: (cb: () => void) => void;
          }
        ).requestVideoFrameCallback(() => {
          setVideoReady(true);
        });
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVideoReady(true);
          });
        });
      }
    } else if (video.readyState >= 2) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVideoReady(true);
        });
      });
    }
  }, []);

  // Sincronizar el video con el progreso actual de forma segura
  const synchronizeVideo = useCallback(
    (force = false) => {
      const video = videoRef.current;
      if (!video) return;

      const duration = video.duration || durationRef.current;
      if (!duration || isNaN(duration) || duration <= 0) return;

      let p = smoothedProgressRef.current;
      if (!isDesktopModeRef.current) {
        p = calculateMobileScrollProgress();
        targetProgressRef.current = p;
        if (force) {
          smoothedProgressRef.current = p;
        }
      }

      const targetTime = computeTargetTime(p, duration);
      applyTime(targetTime);
    },
    [calculateMobileScrollProgress, computeTargetTime, applyTime],
  );

  // FASE 4: Evento onLoadedMetadata:
  // - Solo guarda duración, pausa y configura atributos
  // - NUNCA modifica currentTime aquí para evitar bloquear el pipeline de decodificación en Safari iOS
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.duration && !isNaN(video.duration) && video.duration > 0) {
      durationRef.current = video.duration;
    }

    video.pause();
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    metadataReadyRef.current = true;
    setHasRealMediaError(false);
  };

  // Evento onLoadedData / onCanPlay: la primera sincronización de tiempo ocurre aquí de forma segura
  const handleLoadedData = () => {
    dataReadyRef.current = true;
    activateVideoIfDecoded();

    // Primera sincronización segura de fotograma inicial
    if (lastRequestedTimeRef.current < 0) {
      synchronizeVideo(true);
    }
  };

  // FASE 6: Evento onSeeked: procesar el último objetivo encolado de forma inmediata
  const handleSeeked = () => {
    isSeekingRef.current = false;
    activateVideoIfDecoded();

    if (pendingTimeRef.current !== null) {
      const nextTime = pendingTimeRef.current;
      pendingTimeRef.current = null;
      applyTime(nextTime);
    }
  };

  // FASE 10: Manejo de errores multimedia reales
  const handleVideoError = () => {
    const video = videoRef.current;
    // Solo registrar como error fatal si hay un MediaError real en el elemento
    if (video && video.error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[InteractiveDoctorAvatar] Error multimedia en video. Se mantiene el poster permanente de alta resolución.',
          video.error,
        );
      }
      setHasRealMediaError(true);
      setVideoReady(false);
    }
  };

  // Comprobar estado de video si ya venía precargado en caché
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    if (video.readyState >= 1 && video.duration && !isNaN(video.duration)) {
      durationRef.current = video.duration;
      metadataReadyRef.current = true;
    }

    if (video.readyState >= 2) {
      dataReadyRef.current = true;
      activateVideoIfDecoded();
      if (lastRequestedTimeRef.current < 0) {
        synchronizeVideo(true);
      }
    }
  }, [activateVideoIfDecoded, synchronizeVideo]);

  // Observador de visibilidad con IntersectionObserver para suspender cálculos fuera de pantalla
  useEffect(() => {
    const targetElement = containerRef.current || heroRef?.current;
    if (!targetElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && dataReadyRef.current) {
            synchronizeVideo(false);
          }
        });
      },
      { rootMargin: '120px 0px 120px 0px', threshold: [0, 0.1, 0.5] },
    );

    observer.observe(targetElement);

    return () => {
      observer.disconnect();
    };
  }, [heroRef, synchronizeVideo]);

  // FASE 8: Bucle de animación suave con requestAnimationFrame y factor lerp
  useEffect(() => {
    if (prefersReduced || hasRealMediaError) return;

    const loop = () => {
      const video = videoRef.current;

      if (
        isVisibleRef.current &&
        video &&
        metadataReadyRef.current &&
        dataReadyRef.current
      ) {
        const currentSmoothed = smoothedProgressRef.current;
        const target = targetProgressRef.current;
        const diff = target - currentSmoothed;

        // Si hay diferencia perceptible, aplicar interpolación lerp
        if (Math.abs(diff) > 0.0004) {
          const lerpFactor = isDesktopModeRef.current ? 0.10 : 0.14;
          const newSmoothed = currentSmoothed + diff * lerpFactor;
          smoothedProgressRef.current = newSmoothed;

          const duration = video.duration || durationRef.current;
          const targetTime = computeTargetTime(newSmoothed, duration);
          applyTime(targetTime);
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [
    prefersReduced,
    hasRealMediaError,
    computeTargetTime,
    applyTime,
  ]);

  // Detección de modo y captura de interacciones (Mouse en Escritorio / Scroll en Móvil)
  useEffect(() => {
    if (prefersReduced) return;
    if (typeof window === 'undefined') return;

    let scrollRafId: number | null = null;

    const checkDeviceMode = () => {
      const isFinePointer =
        window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        window.innerWidth >= 1024;
      isDesktopModeRef.current = isFinePointer;
    };

    checkDeviceMode();

    // 1. ESCRITORIO: Seguimiento continuo del cursor
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDesktopModeRef.current || !isVisibleRef.current) return;
      const normalizedX = Math.max(
        0,
        Math.min(1, e.clientX / window.innerWidth),
      );
      targetProgressRef.current = normalizedX;
    };

    const handleMouseLeave = () => {
      if (!isDesktopModeRef.current) return;
      targetProgressRef.current = 0.5;
    };

    // 2. MÓVIL Y TABLET: Control proporcional por scroll en tiempo real
    const handleScroll = () => {
      if (isDesktopModeRef.current || !isVisibleRef.current) return;

      if (scrollRafId !== null) return;

      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        const progress = calculateMobileScrollProgress();
        targetProgressRef.current = progress;
      });
    };

    const handleResizeOrOrientation = () => {
      checkDeviceMode();
      if (!isDesktopModeRef.current) {
        const progress = calculateMobileScrollProgress();
        targetProgressRef.current = progress;
        smoothedProgressRef.current = progress;
        synchronizeVideo(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResizeOrOrientation, { passive: true });
    window.addEventListener('orientationchange', handleResizeOrOrientation, { passive: true });

    // Sincronización inicial en móvil
    if (!isDesktopModeRef.current) {
      const initialP = calculateMobileScrollProgress();
      targetProgressRef.current = initialP;
      smoothedProgressRef.current = initialP;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResizeOrOrientation);
      window.removeEventListener('orientationchange', handleResizeOrOrientation);
      if (scrollRafId !== null) {
        cancelAnimationFrame(scrollRafId);
        scrollRafId = null;
      }
    };
  }, [prefersReduced, calculateMobileScrollProgress, synchronizeVideo]);

  // FASE 5: Inicialización y desbloqueo seguro para Safari iOS ante interacción táctil
  useEffect(() => {
    const removeUnlockListeners = () => {
      window.removeEventListener('touchstart', handleGestureUnlock);
      window.removeEventListener('pointerdown', handleGestureUnlock);
    };

    const handleGestureUnlock = async () => {
      const video = videoRef.current;
      if (!video || successfullyUnlockedRef.current) {
        removeUnlockListeners();
        return;
      }

      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');

      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          video.pause();

          successfullyUnlockedRef.current = true;
          dataReadyRef.current = true;
          activateVideoIfDecoded();
          synchronizeVideo(true);

          // Remover listeners solo cuando el desbloqueo fue 100% exitoso
          removeUnlockListeners();
        }
      } catch {
        // En caso de rechazo temporal, mantener successfullyUnlockedRef en false
        // y dejar los listeners activos para reintentar en el siguiente gesto
        successfullyUnlockedRef.current = false;
      }
    };

    window.addEventListener('touchstart', handleGestureUnlock, { passive: true });
    window.addEventListener('pointerdown', handleGestureUnlock, { passive: true });

    return () => {
      removeUnlockListeners();
    };
  }, [activateVideoIfDecoded, synchronizeVideo]);

  // FASE 9: Recuperación ante retorno de historial de Safari (pageshow) o visibilidad (visibilitychange)
  useEffect(() => {
    const handleSyncOnResume = () => {
      const video = videoRef.current;
      if (!video) return;

      if (!isDesktopModeRef.current) {
        const p = calculateMobileScrollProgress();
        targetProgressRef.current = p;
        smoothedProgressRef.current = p;
        synchronizeVideo(true);
      } else {
        targetProgressRef.current = 0.5;
        smoothedProgressRef.current = 0.5;
        synchronizeVideo(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleSyncOnResume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handleSyncOnResume);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handleSyncOnResume);
    };
  }, [calculateMobileScrollProgress, synchronizeVideo]);

  return (
    <div
      ref={containerRef}
      className={`relative size-full overflow-hidden ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* 
        POSTER DE RESPALDO PERMANENTE (FOTOGRAMA FRONTAL DEL AVATAR ANIMADO)
        - Permanece debajo del video para que el contenedor nunca quede en blanco o negro.
        - Mantiene el encuadre visual idéntico (1916x1080 / 16:9).
      */}
      {(() => {
        const mediaFitClass = imgClassName.includes('object-')
          ? imgClassName
          : `object-cover object-[center_top] ${imgClassName}`;

        return (
          <>
            <picture className="size-full absolute inset-0 pointer-events-none select-none z-0">
              <source
                srcSet="/images/avatar-doctor-poster.webp"
                type="image/webp"
              />
              <source
                srcSet="/images/avatar-doctor-poster.png"
                type="image/png"
              />
              <img
                src="/images/avatar-doctor-poster.webp"
                alt="Avatar interactivo animado del Dr. Mauricio Galindo"
                width={1916}
                height={1080}
                fetchPriority={priority ? 'high' : 'auto'}
                loading={priority ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
                className={`size-full ${mediaFitClass}`}
              />
            </picture>

            {/* 
              VIDEO INTERACTIVO DEL AVATAR ANIMADO (ALL-INTRA KEYFRAMES V2)
              - Archivo: /videos/avatar-doctor-interactivo-scrub-v2.mp4
              - Muted, defaultMuted, playsInline, preload="auto".
              - 100% de fotogramas como keyframes (GOP 1) para scrub instantáneo en Safari iOS.
              - Totalmente accesible y respetuoso con prefers-reduced-motion.
            */}
            {!hasRealMediaError && (
              <video
                ref={videoRef}
                muted
                playsInline
                preload="auto"
                controls={false}
                autoPlay={false}
                loop={false}
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload noplaybackrate nofullscreen"
                aria-hidden="true"
                tabIndex={-1}
                onLoadedMetadata={handleLoadedMetadata}
                onLoadedData={handleLoadedData}
                onCanPlay={handleLoadedData}
                onSeeked={handleSeeked}
                onError={handleVideoError}
                className={`size-full pointer-events-none select-none transition-opacity duration-500 relative z-10 ${
                  videoReady ? 'opacity-100' : 'opacity-0'
                } ${mediaFitClass}`}
              >
                <source
                  src="/videos/avatar-doctor-interactivo-scrub-v2.mp4"
                  type="video/mp4"
                />
              </video>
            )}
          </>
        );
      })()}
    </div>
  );
}


