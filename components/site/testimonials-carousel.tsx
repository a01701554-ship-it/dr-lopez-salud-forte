import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Volume2, VolumeX, X, Heart, Shield, Maximize2 } from 'lucide-react';
import { Reveal } from '@/components/site/motion-wrapper';

export interface TestimonialItem {
  id: string;
  videoProvider: string;
  videoId: string;
  videoUrl?: string;
  posterUrl: string;
  displayName: string;
  publicLabel?: string;
  shortDescription?: string;
  sortOrder: number;
}

interface TestimonialsCarouselProps {
  previewItems?: TestimonialItem[];
  isPreviewMode?: boolean;
}

export function TestimonialsCarousel({ previewItems, isPreviewMode = false }: TestimonialsCarouselProps) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(previewItems || []);
  const [loading, setLoading] = useState(!previewItems);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [modalItem, setModalItem] = useState<TestimonialItem | null>(null);
  const [modalIsMuted, setModalIsMuted] = useState(false);
  const [modalIsPlaying, setModalIsPlaying] = useState(true);

  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeCardRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Touch gesture state for mobile swipe
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Load public testimonials from database API if not provided via preview props
  const fetchPublicTestimonials = useCallback(async () => {
    if (previewItems) {
      setTestimonials(previewItems);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/testimonials', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.testimonials)) {
          setTestimonials(data.testimonials);
        }
      }
    } catch (err) {
      console.error('[Testimonials] Error fetching public testimonials:', err);
    } finally {
      setLoading(false);
    }
  }, [previewItems]);

  useEffect(() => {
    fetchPublicTestimonials();

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [fetchPublicTestimonials]);

  // Sync if previewItems changes
  useEffect(() => {
    if (previewItems) {
      setTestimonials(previewItems);
      setLoading(false);
    }
  }, [previewItems]);

  // Intersection Observer for In-View playback
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pause when browser tab is inactive / hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Smooth video playback controller
  useEffect(() => {
    if (testimonials.length === 0 || modalItem) return;

    testimonials.forEach((item, idx) => {
      const vid = videoRefs.current[item.id];
      if (!vid) return;

      if (idx === activeIndex && isInView && !isPaused && !prefersReducedMotion) {
        vid.muted = true;
        vid.defaultMuted = true;
        vid.playbackRate = 1.0;
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay policy fallback (browser restriction or poster display)
          });
        }
      } else {
        vid.pause();
        try {
          vid.currentTime = 0;
        } catch {
          // ignore if stream not yet seekable
        }
      }
    });
  }, [activeIndex, isInView, isPaused, testimonials, modalItem, prefersReducedMotion]);

  // Center active card smoothly in mobile & tablet horizontal scroll
  useEffect(() => {
    if (trackRef.current && testimonials.length > 0) {
      const activeEl = trackRef.current.children[activeIndex] as HTMLElement | undefined;
      if (activeEl) {
        const track = trackRef.current;
        const trackCenter = track.offsetWidth / 2;
        const cardCenter = activeEl.offsetLeft + activeEl.offsetWidth / 2;
        track.scrollTo({
          left: cardCenter - trackCenter,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }
    }
  }, [activeIndex, testimonials.length, prefersReducedMotion]);

  // Advance to next video on REAL video 'ended' event
  const handleVideoEnded = (idx: number) => {
    if (testimonials.length <= 1 || prefersReducedMotion) return;
    if (idx === activeIndex) {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }
  };

  // Fallback if video errors: advance after a short delay so carousel never gets stuck
  const handleVideoError = (idx: number) => {
    if (idx === activeIndex && testimonials.length > 1) {
      const timer = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearTimeout(timer);
    }
  };

  // Enforce 1x playback rate strictly
  const handleRateChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.currentTarget;
    if (target.playbackRate !== 1.0) {
      target.playbackRate = 1.0;
    }
  };

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance && testimonials.length > 1) {
      // Swiped Left -> Next
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    } else if (diff < -minSwipeDistance && testimonials.length > 1) {
      // Swiped Right -> Prev
      setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Modal Open / Close Handlers
  const openModal = (item: TestimonialItem) => {
    lastActiveElementRef.current = document.activeElement as HTMLElement;
    setIsPaused(true);
    Object.keys(videoRefs.current).forEach((key) => {
      videoRefs.current[key]?.pause();
    });
    setModalItem(item);
    setModalIsMuted(false);
    setModalIsPlaying(true);
  };

  const closeModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    setModalItem(null);
    setIsPaused(false);
    // Restore focus to triggering card
    setTimeout(() => {
      lastActiveElementRef.current?.focus();
    }, 50);
  };

  // Escape key listener & focus trapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalItem) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalItem]);

  const toggleModalPlayback = () => {
    if (!modalVideoRef.current) return;
    if (modalVideoRef.current.paused) {
      modalVideoRef.current.play();
      setModalIsPlaying(true);
    } else {
      modalVideoRef.current.pause();
      setModalIsPlaying(false);
    }
  };

  const toggleFullscreen = () => {
    if (!modalVideoRef.current) return;
    if (modalVideoRef.current.requestFullscreen) {
      modalVideoRef.current.requestFullscreen();
    }
  };

  const getVideoSrc = (item: TestimonialItem) => {
    if (item.videoUrl && item.videoUrl.trim()) return item.videoUrl.trim();
    if (item.videoId && item.videoId.trim()) {
      if (item.videoProvider === 'youtube') {
        return `https://www.youtube.com/watch?v=${item.videoId}`;
      }
      return `https://iframe.mediadelivery.net/play/314227/${item.videoId}`;
    }
    return '';
  };

  return (
    <section
      ref={containerRef}
      id="testimonios-consulta"
      aria-label="Experiencias de pacientes"
      className="bg-[#FBF9F5] py-20 sm:py-28 lg:py-32 border-b border-[#B39A6A]/15 overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal direction="up" distance={12}>
            <p className="eyebrow text-sage inline-flex items-center gap-1.5 justify-center">
              <Heart className="size-3.5 text-champagne shrink-0" />
              <span>EXPERIENCIAS DE PACIENTES</span>
            </p>
            <h2 className="mt-4 font-serif text-[clamp(2.3rem,4.5vw,3.8rem)] leading-[1.05] text-obsidian tracking-tight">
              Historias compartidas con confianza.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-obsidian/75">
              Conoce la experiencia de personas que han decidido compartir, de manera voluntaria, cómo vivieron su proceso de atención y acompañamiento médico.
            </p>
          </Reveal>
        </div>

        {/* Dynamic Carousel or Sober Empty State */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block size-6 animate-spin rounded-full border-2 border-champagne border-t-transparent" />
            <p className="mt-3 text-xs text-obsidian/60 font-sans">Cargando experiencias autorizadas...</p>
          </div>
        ) : testimonials.length === 0 ? (
          /* Sober, natural-height state when no testimonials are published yet */
          <div className="max-w-lg mx-auto p-8 rounded-2xl bg-white/70 border border-[#B39A6A]/20 text-center shadow-xs">
            <Shield className="size-6 text-champagne mx-auto mb-3 opacity-80" />
            <p className="text-sm font-serif font-medium text-obsidian/85 leading-relaxed">
              Próximamente podrás conocer experiencias compartidas por nuestros pacientes.
            </p>
            <p className="text-xs text-obsidian/55 mt-2 leading-relaxed">
              Cada testimonio requiere autorización informada previa para garantizar el resguardo ético y la privacidad clínica.
            </p>
          </div>
        ) : (
          /* Video Testimonials Carousel */
          <div className="relative">
            {/* Carousel Container (No visible scrollbars, clean edge masks) */}
            <div
              ref={trackRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory py-4 px-2 sm:px-4 justify-start md:justify-center items-center select-none"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {testimonials.map((item, idx) => {
                const isActive = idx === activeIndex;
                const videoSrc = getVideoSrc(item);

                return (
                  <div
                    key={item.id}
                    ref={isActive ? activeCardRef : null}
                    onClick={() => openModal(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openModal(item);
                      }
                    }}
                    onFocus={() => {
                      setActiveIndex(idx);
                      setIsPaused(true);
                    }}
                    onBlur={() => setIsPaused(false)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver video testimonio de ${item.displayName}. Pulsa Enter para ver en pantalla completa con sonido.`}
                    className={`group relative shrink-0 snap-center cursor-pointer rounded-[22px] bg-[#0D2235] p-2.5 sm:p-3 shadow-[0_16px_36px_rgba(13,34,53,0.12)] border transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-champagne focus:ring-offset-2 ${
                      isActive
                        ? 'w-[260px] sm:w-[290px] lg:w-[320px] scale-100 border-[#B39A6A]/60 ring-1 ring-champagne/40 z-10'
                        : 'w-[230px] sm:w-[260px] lg:w-[280px] scale-[0.94] opacity-80 hover:opacity-100 border-[#B39A6A]/20 hover:scale-[0.97]'
                    }`}
                  >
                    {/* 9:16 Aspect ratio video frame */}
                    <div className="relative w-full aspect-[9/16] overflow-hidden rounded-[16px] bg-obsidian">
                      <video
                        ref={(el) => {
                          videoRefs.current[item.id] = el;
                        }}
                        src={videoSrc}
                        poster={item.posterUrl}
                        muted
                        playsInline
                        preload={idx === activeIndex || idx === (activeIndex + 1) % testimonials.length ? 'metadata' : 'none'}
                        onEnded={() => handleVideoEnded(idx)}
                        onError={() => handleVideoError(idx)}
                        onRateChange={handleRateChange}
                        className="size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Subtle Dark Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-black/30 pointer-events-none opacity-85 transition-opacity group-hover:opacity-65" />

                      {/* Discrete Center Play Indicator */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="size-12 sm:size-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <Play className="size-5 sm:size-6 fill-white text-white ml-0.5" />
                        </div>
                      </div>

                      {/* Patient & Story Info at Bottom */}
                      <div className="absolute bottom-0 inset-x-0 p-4 text-left text-white bg-gradient-to-t from-obsidian via-obsidian/75 to-transparent pointer-events-none">
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-champagne mb-1 font-mono">
                          {item.publicLabel || 'Consulta Médica'}
                        </span>
                        <h3 className="font-serif text-base sm:text-lg leading-tight font-medium text-white line-clamp-1">
                          {item.displayName}
                        </h3>
                        {item.shortDescription && (
                          <p className="mt-1 text-xs text-white/80 line-clamp-2 leading-relaxed font-sans font-light">
                            {item.shortDescription}
                          </p>
                        )}
                      </div>

                      {/* Video Indicator Tag */}
                      <div className="absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium text-white/90 border border-white/15">
                        Testimonio
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Symmetrical Bottom Note (Medical & Responsible) */}
        <div className="mt-12 text-center">
          <p className="text-xs text-obsidian/60 italic max-w-xl mx-auto leading-relaxed">
            “Los testimonios reflejan experiencias personales. Cada caso y resultado puede variar.”
          </p>
        </div>
      </div>

      {/* Premium Fullscreen-Capable Video Modal */}
      {modalItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Testimonio en video de ${modalItem.displayName}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md md:max-w-lg rounded-[26px] bg-[#0D2235] border border-[#B39A6A]/30 p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="w-full flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-champagne font-mono">
                  {modalItem.publicLabel || 'Experiencia de Paciente'}
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-white font-medium">
                  {modalItem.displayName}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-champagne"
                aria-label="Cerrar video"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal 9:16 Video Player */}
            <div className="relative w-full aspect-[9/16] max-h-[62vh] rounded-[18px] overflow-hidden bg-black shadow-inner flex items-center justify-center">
              <video
                ref={modalVideoRef}
                src={getVideoSrc(modalItem)}
                poster={modalItem.posterUrl}
                autoPlay
                playsInline
                muted={modalIsMuted}
                onRateChange={handleRateChange}
                className="size-full object-contain"
              />
            </div>

            {/* Modal Bottom Controls & Narrative */}
            <div className="w-full mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/80">
              <p className="line-clamp-2 text-xs font-light max-w-xs text-white/70">
                {modalItem.shortDescription || 'Experiencia compartida voluntariamente sobre el proceso de atención y acompañamiento médico.'}
              </p>

              {/* Action Buttons: Audio Toggle, Play/Pause, Fullscreen */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={toggleModalPlayback}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label={modalIsPlaying ? 'Pausar video' : 'Reproducir video'}
                  title={modalIsPlaying ? 'Pausar' : 'Reproducir'}
                >
                  <Play className={`size-4 ${modalIsPlaying ? 'opacity-40' : 'fill-white'}`} />
                </button>

                <button
                  onClick={() => setModalIsMuted(!modalIsMuted)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
                  aria-label={modalIsMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {modalIsMuted ? <VolumeX className="size-4 text-amber-300" /> : <Volume2 className="size-4 text-champagne" />}
                  <span>{modalIsMuted ? 'Activar Sonido' : 'Sonido Activo'}</span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Ver en pantalla completa"
                  title="Pantalla completa"
                >
                  <Maximize2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
