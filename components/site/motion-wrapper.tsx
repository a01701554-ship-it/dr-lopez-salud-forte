'use client';

import React, { useEffect, useRef, useState, useId } from 'react';
import { motionTokens } from '@/lib/motion';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
export type MaskVariant = 'left' | 'right' | 'up' | 'down' | 'none';
export type EasingType = 'premium' | 'editorial' | 'micro' | 'soft';

export interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: RevealDirection;
  maskVariant?: MaskVariant;
  distance?: number;
  mobileDistance?: number;
  delay?: number;
  duration?: number;
  easing?: EasingType;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  id?: string;
  key?: React.Key;
  as?: React.ElementType;
  style?: React.CSSProperties;
}

/**
 * Hook to detect reduced motion preference
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * ScrollReveal Component
 * High performance, CSS transition & IntersectionObserver powered reveal.
 * - Single execution per scroll.
 * - Zero residual transforms after animation completes to avoid hover conflicts.
 * - Automatic reduced motion fallback.
 */
export function ScrollReveal({
  children,
  direction = 'up',
  maskVariant = 'none',
  distance,
  mobileDistance,
  delay = 0,
  duration = motionTokens.duration.normal,
  easing = 'premium',
  threshold = 0.16,
  rootMargin = '0px 0px -10% 0px',
  className = '',
  id,
  as: Component = 'div',
  style = {},
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setIsRevealed(true);
      setIsAnimationComplete(true);
      return;
    }

    const node = elementRef.current;
    if (!node) return;

    // Check if already in viewport or if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      setIsAnimationComplete(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, prefersReduced]);

  // Clean up inline styles once transition has completed
  useEffect(() => {
    if (!isRevealed || isAnimationComplete) return;

    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, (delay + duration) * 1000 + 50);

    return () => clearTimeout(timer);
  }, [isRevealed, delay, duration, isAnimationComplete]);

  // If reduced motion is requested, render without transforms
  if (prefersReduced) {
    return (
      <Component id={id} ref={elementRef} className={className} style={style}>
        {children}
      </Component>
    );
  }

  const easeString = motionTokens.easingCSS[easing];
  const dist = distance !== undefined ? distance : motionTokens.distances.desktop.regular;
  const mobDist = mobileDistance !== undefined ? mobileDistance : motionTokens.distances.mobile.regular;

  // Mask reveal handling
  if (maskVariant !== 'none') {
    let initialClip = 'inset(0 0 0 0)';
    if (!isRevealed) {
      switch (maskVariant) {
        case 'left':
          initialClip = 'inset(0 100% 0 0)';
          break;
        case 'right':
          initialClip = 'inset(0 0 0 100%)';
          break;
        case 'up':
          initialClip = 'inset(100% 0 0 0)';
          break;
        case 'down':
          initialClip = 'inset(0 0 100% 0)';
          break;
      }
    }

    return (
      <Component
        id={id}
        ref={elementRef}
        className={`gpu-accel ${className}`}
        style={{
          ...style,
          clipPath: isRevealed ? 'inset(0 0 0 0)' : initialClip,
          opacity: isRevealed ? 1 : 0.001,
          transition: isAnimationComplete
            ? undefined
            : `clip-path ${duration}s ${easeString} ${delay}s, opacity ${duration * 0.6}s ${easeString} ${delay}s`,
        }}
      >
        {children}
      </Component>
    );
  }

  // Directional transform handling
  let initialTransform = '';
  switch (direction) {
    case 'up':
      initialTransform = `translate3d(0, ${dist}px, 0)`;
      break;
    case 'down':
      initialTransform = `translate3d(0, -${dist}px, 0)`;
      break;
    case 'left':
      initialTransform = `translate3d(${dist}px, 0, 0)`;
      break;
    case 'right':
      initialTransform = `translate3d(-${dist}px, 0, 0)`;
      break;
    case 'scale':
      initialTransform = `scale(${motionTokens.scale.subtle})`;
      break;
    case 'none':
    default:
      initialTransform = 'none';
      break;
  }

  // When complete, remove transform completely to ensure layout/hover purity
  const currentTransform = isAnimationComplete
    ? undefined
    : isRevealed
    ? 'translate3d(0, 0, 0) scale(1)'
    : initialTransform;

  const currentOpacity = isRevealed ? 1 : 0;

  return (
    <Component
      id={id}
      ref={elementRef}
      className={`gpu-accel ${className}`}
      style={{
        ...style,
        opacity: currentOpacity,
        transform: currentTransform,
        transition: isAnimationComplete
          ? undefined
          : `opacity ${duration}s ${easeString} ${delay}s, transform ${duration}s ${easeString} ${delay}s`,
      }}
    >
      {children}
    </Component>
  );
}

// Backward compatible alias
export const Reveal = ScrollReveal;

/**
 * MaskReveal Component
 * Overflow-hidden container for editorial title line reveals
 */
export function MaskReveal({
  children,
  delay = 0,
  duration = motionTokens.duration.normal,
  direction = 'up',
  distance = 26,
  className = '',
  id,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'left' | 'right';
  distance?: number;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={`overflow-hidden ${className}`}>
      <ScrollReveal
        direction={direction}
        distance={distance}
        delay={delay}
        duration={duration}
        easing="editorial"
      >
        {children}
      </ScrollReveal>
    </div>
  );
}

/**
 * EditorialCurtain Component
 * Double panel split reveal for doctor photography in the "Trayectoria" section.
 * - Two panels split from center to left and right.
 * - Center champagne accent line.
 * - Underlying photo soft scale transition (1.035 -> 1).
 */
export function EditorialCurtain({
  children,
  curtainColor = '#ffffff',
  className = '',
  delay = 0.1,
  id,
}: {
  children: React.ReactNode;
  curtainColor?: string;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (prefersReduced) {
      setIsOpen(true);
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsOpen(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [prefersReduced]);

  const easeString = motionTokens.easingCSS.editorial;
  const duration = motionTokens.duration.curtain;

  return (
    <div
      id={id}
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Underlying content / Doctor Portrait with soft scale on desktop only */}
      <div
        className="size-full gpu-accel transition-all"
        style={{
          transform: prefersReduced || isMobile
            ? 'none'
            : isOpen
            ? 'scale(1)'
            : `scale(${motionTokens.scale.curtainInitial})`,
          transformOrigin: 'top center',
          transition: prefersReduced || isMobile
            ? 'none'
            : `transform ${duration + 0.1}s ${easeString} ${delay}s`,
        }}
      >
        {children}
      </div>

      {/* Left Curtain Panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 z-20 gpu-accel origin-left"
        style={{
          backgroundColor: curtainColor,
          transform: prefersReduced
            ? 'scaleX(0)'
            : isOpen
            ? 'scaleX(0)'
            : 'scaleX(1)',
          transition: prefersReduced
            ? 'none'
            : `transform ${duration}s ${easeString} ${delay}s`,
        }}
      />

      {/* Right Curtain Panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 z-20 gpu-accel origin-right"
        style={{
          backgroundColor: curtainColor,
          transform: prefersReduced
            ? 'scaleX(0)'
            : isOpen
            ? 'scaleX(0)'
            : 'scaleX(1)',
          transition: prefersReduced
            ? 'none'
            : `transform ${duration}s ${easeString} ${delay}s`,
        }}
      />

      {/* Center Champagne Accent Line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] z-30 bg-[#B39A6A]/60 gpu-accel"
        style={{
          opacity: prefersReduced ? 0 : isOpen ? 0 : 1,
          transform: prefersReduced
            ? 'scaleY(0)'
            : isOpen
            ? 'scaleY(0)'
            : 'scaleY(1)',
          transition: prefersReduced
            ? 'none'
            : `opacity ${duration * 0.7}s ${easeString} ${delay + 0.2}s, transform ${duration}s ${easeString} ${delay}s`,
        }}
      />
    </div>
  );
}

/**
 * LineReveal Component
 * Expanding divider line from left or center
 */
export function LineReveal({
  origin = 'left',
  delay = 0,
  duration = motionTokens.duration.medium,
  className = '',
  id,
}: {
  origin?: 'left' | 'center';
  delay?: number;
  duration?: number;
  className?: string;
  id?: string;
}) {
  const lineRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setIsRevealed(true);
      return;
    }

    const node = lineRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -5% 0px',
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [prefersReduced]);

  const originClass = origin === 'left' ? 'origin-left' : 'origin-center';
  const easeString = motionTokens.easingCSS.premium;

  return (
    <div
      id={id}
      ref={lineRef}
      className={`gpu-accel ${originClass} ${className}`}
      style={{
        transform: prefersReduced ? 'none' : isRevealed ? 'scaleX(1)' : 'scaleX(0)',
        transition: prefersReduced
          ? 'none'
          : `transform ${duration}s ${easeString} ${delay}s`,
      }}
    />
  );
}

/**
 * ImageReveal Component
 * Smooth photographic unveiling with gentle scale settling
 */
export function ImageReveal({
  children,
  className = '',
  delay = 0,
  duration = motionTokens.duration.editorial,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  id?: string;
}) {
  return (
    <ScrollReveal
      direction="scale"
      delay={delay}
      duration={duration}
      easing="editorial"
      className={`overflow-hidden ${className}`}
      id={id}
    >
      {children}
    </ScrollReveal>
  );
}

/**
 * StaggerGroup & StaggerItem Components
 * Backward-compatible staggered container using modern CSS orchestration
 */
export interface StaggerGroupProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  id?: string;
  key?: React.Key;
}

export function StaggerGroup({
  children,
  staggerDelay = 0.09,
  className = '',
  id,
}: StaggerGroupProps) {
  return (
    <div id={id} className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        const typedChild = child as React.ReactElement<{ delay?: number }>;
        return React.cloneElement(typedChild, {
          delay: (typedChild.props.delay ?? 0) + index * staggerDelay,
        });
      })}
    </div>
  );
}

export interface StaggerItemProps {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  direction?: RevealDirection;
  duration?: number;
  className?: string;
  id?: string;
  key?: React.Key;
}

export function StaggerItem({
  children,
  delay = 0,
  distance = 18,
  direction = 'up',
  duration = motionTokens.duration.normal,
  className = '',
  id,
}: StaggerItemProps) {
  return (
    <ScrollReveal
      direction={direction}
      distance={distance}
      delay={delay}
      duration={duration}
      className={className}
      id={id}
    >
      {children}
    </ScrollReveal>
  );
}
