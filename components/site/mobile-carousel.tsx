'use client';

import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface MobileAutoCarouselProps {
  id: string;
  ariaLabel: string;
  itemCount: number;
  intervalMs?: number; // Duration each card stays visible (default 2000ms)
  transitionDurationMs?: number; // Duration of slide transition (default 300ms)
  cardMaxWidth?: string; // Max width for cards (default "340px")
  children: React.ReactNode[];
  className?: string;
}

export function MobileCarousel({
  id,
  ariaLabel,
  itemCount,
  intervalMs = 2000,
  transitionDurationMs = 300,
  cardMaxWidth = '340px',
  children,
  className,
}: MobileAutoCarouselProps) {
  // Track index: 1 is Card 0. 0 is Clone of Last. totalCards + 1 is Clone of First.
  const [trackIndex, setTrackIndex] = useState(1);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
  const [progressKey, setProgressKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);

  const instanceId = useId();
  const carouselId = `${id}-${instanceId.replace(/:/g, '')}`;

  const cards = React.Children.toArray(children);
  const totalCards = cards.length;

  // Active real index derived directly from trackIndex
  const activeRealIndex = totalCards <= 1
    ? 0
    : trackIndex === 0
    ? totalCards - 1
    : trackIndex === totalCards + 1
    ? 0
    : trackIndex - 1;

  // Measure container max height among all cards
  useEffect(() => {
    if (!measureContainerRef.current) return;

    const measureHeights = () => {
      if (!measureContainerRef.current) return;
      const childNodes = measureContainerRef.current.children;
      let maxHeight = 0;
      for (let i = 0; i < childNodes.length; i++) {
        const height = (childNodes[i] as HTMLElement).offsetHeight;
        if (height > maxHeight) maxHeight = height;
      }
      if (maxHeight > 0) {
        setContainerHeight(maxHeight);
      }
    };

    measureHeights();
    const timer = setTimeout(measureHeights, 80);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && measureContainerRef.current) {
      resizeObserver = new ResizeObserver(measureHeights);
      resizeObserver.observe(measureContainerRef.current);
    }

    window.addEventListener('resize', measureHeights, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureHeights);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [children]);

  // Advance function
  const nextSlide = useCallback(() => {
    if (totalCards <= 1) return;

    setIsTransitionEnabled(true);
    setProgressKey((prev) => prev + 1);
    setTrackIndex((prev) => prev + 1);
  }, [totalCards]);

  // Handle clone jump reset after transition finishes
  useEffect(() => {
    if (trackIndex === totalCards + 1) {
      const timer = setTimeout(() => {
        setIsTransitionEnabled(false);
        setTrackIndex(1);
      }, transitionDurationMs);
      return () => clearTimeout(timer);
    }
  }, [trackIndex, totalCards, transitionDurationMs]);

  // Autoplay Timer (always active, reliable 100%)
  useEffect(() => {
    if (totalCards <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [nextSlide, intervalMs, totalCards]);

  // Slides structure: [Clone of Last, Card 0, Card 1, ..., Card N-1, Clone of First]
  const slides = totalCards > 1
    ? [
        { card: cards[totalCards - 1], originalIndex: totalCards - 1, isClone: true, key: 'clone-last' },
        ...cards.map((card, idx) => ({ card, originalIndex: idx, isClone: false, key: `slide-${idx}` })),
        { card: cards[0], originalIndex: 0, isClone: true, key: 'clone-first' },
      ]
    : cards.map((card, idx) => ({ card, originalIndex: idx, isClone: false, key: `slide-${idx}` }));

  return (
    <div
      ref={containerRef}
      id={carouselId}
      role="region"
      aria-roledescription="carrusel automático"
      aria-label={ariaLabel}
      className={cn('relative w-full overflow-hidden py-1', className)}
      style={{
        touchAction: 'pan-y pinch-zoom',
        overscrollBehaviorX: 'contain',
      }}
    >
      {/* Off-screen container to measure max height among cards */}
      <div
        ref={measureContainerRef}
        aria-hidden="true"
        className="absolute top-0 left-0 w-full pointer-events-none opacity-0 -z-50 invisible"
      >
        {cards.map((card, idx) => (
          <div key={`measure-${idx}`} className="w-full mx-auto px-2" style={{ maxWidth: cardMaxWidth }}>
            {card}
          </div>
        ))}
      </div>

      {/* Slide track */}
      <div
        className="relative w-full overflow-hidden"
        style={{ minHeight: containerHeight ? `${containerHeight}px` : 'auto' }}
      >
        <div
          className="flex w-full h-full"
          style={{
            transform: totalCards > 1 ? `translate3d(-${trackIndex * 100}%, 0, 0)` : 'translate3d(0, 0, 0)',
            transition: isTransitionEnabled
              ? `transform ${transitionDurationMs}ms cubic-bezier(0.25, 1, 0.5, 1)`
              : 'none',
          }}
        >
          {slides.map((slide, slideIdx) => {
            const isActive = !slide.isClone && slide.originalIndex === activeRealIndex;
            return (
              <div
                key={`${slide.key}-${slideIdx}`}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`Tarjeta ${slide.originalIndex + 1} de ${totalCards}`}
                aria-hidden={!isActive}
                inert={!isActive}
                className="w-full shrink-0 flex justify-center px-2"
                style={{
                  height: containerHeight ? `${containerHeight}px` : 'auto',
                }}
              >
                <div className="w-full h-full flex flex-col" style={{ maxWidth: cardMaxWidth }}>
                  {slide.card}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Progress Bar Indicators */}
      {totalCards > 1 && (
        <div
          aria-hidden="true"
          className="mt-3.5 flex items-center justify-center gap-1.5 pointer-events-none select-none"
        >
          {Array.from({ length: totalCards }).map((_, idx) => {
            const isCurrent = idx === activeRealIndex;
            return (
              <div
                key={`indicator-${idx}`}
                className={cn(
                  'relative h-[3px] rounded-full overflow-hidden transition-all duration-300',
                  isCurrent ? 'w-[28px] bg-[#B39A6A]/30' : 'w-[10px] bg-[#B39A6A]/20'
                )}
              >
                {isCurrent && (
                  <div
                    key={`progress-fill-${activeRealIndex}-${progressKey}`}
                    className="absolute inset-y-0 left-0 bg-[#B39A6A] rounded-full h-full w-full"
                    style={{
                      transformOrigin: 'left center',
                      animation: `mobileCarouselProgress ${intervalMs}ms linear forwards`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes mobileCarouselProgress {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
