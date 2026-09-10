import React from 'react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export type PodcastPlatformsProps = {
  className?: string;
  showIntroText?: boolean;
};

// 1. Spotify Crisp Lockup
function SpotifyLockup() {
  return (
    <div className="inline-flex items-center gap-3 shrink-0">
      {/* Official Spotify Green Icon */}
      <svg viewBox="0 0 40 40" className="h-9 sm:h-11 md:h-12 w-auto shrink-0" aria-hidden="true">
        <circle cx="20" cy="20" r="20" fill="#1ED760" />
        <path
          d="M29.2 28.8c-.3.5-1.1.7-1.6.4-4.6-2.8-10.4-3.5-17.2-1.9-.7.1-1.3-.3-1.5-.9-.1-.7.3-1.3.9-1.5 7.4-1.7 13.8-1 19 2.2.5.3.7 1.2.4 1.7zm2.4-5.2c-.4.6-1.3.9-2 .5-5.3-3.2-13.3-4.2-19.5-2.3-.7.2-1.6-.2-1.8-1-.2-.7.2-1.6 1-1.8 7.1-2.2 15.9-1.1 21.8 2.6.7.4.9 1.4.5 2zm.3-5.5c-6.3-3.7-16.7-4.1-22.8-2.3-1 .3-2-.2-2.3-1.2-.3-1 .2-2 1.2-2.3 7-2.1 18.5-1.7 25.8 2.6.9.5 1.2 1.7.7 2.5-.5.9-1.7 1.2-2.6.7z"
          fill="#000000"
        />
      </svg>
      {/* Official Spotify Green Typography */}
      <span className="font-sans font-bold text-2xl sm:text-3xl md:text-[34px] text-[#1ED760] tracking-[0.02em] leading-none whitespace-nowrap">
        Spotify<sup className="text-xs sm:text-sm font-normal ml-0.5">®</sup>
      </span>
    </div>
  );
}

// 2. Apple Podcasts Crisp Lockup
function ApplePodcastsLockup() {
  return (
    <div className="inline-flex items-center gap-3 shrink-0">
      {/* Official Apple Podcasts Purple Squircle */}
      <div className="h-9 sm:h-11 md:h-12 w-9 sm:w-11 md:w-12 rounded-[10px] sm:rounded-[12px] bg-gradient-to-b from-[#B83CF4] to-[#7928CA] flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="size-6 sm:size-7 md:size-8 text-white fill-current" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.2 6.9 9.5v-2.1c-2.9-1.1-5-3.9-5-7.4 0-4.4 3.6-8 8.1-8s8.1 3.6 8.1 8c0 3.5-2.1 6.3-5 7.4v2.1c4-1.3 6.9-5.1 6.9-9.5a10 10 0 0 0-10-10z" />
          <path d="M12 6a6 6 0 0 0-6 6c0 2.5 1.5 4.7 3.7 5.5v-2c-1.1-.6-1.8-1.8-1.8-3.5 0-2.2 1.8-4.1 4.1-4.1s4.1 1.9 4.1 4.1c0 1.7-.7 2.9-1.8 3.5v2c2.2-.8 3.7-3 3.7-5.5a6 6 0 0 0-6-6z" />
          <circle cx="12" cy="12" r="2.2" />
          <path d="M11 16.5h2v6h-2z" />
          <path d="M9.5 22h5v1.2h-5z" />
        </svg>
      </div>
      {/* Official White Podcasts Typography */}
      <span className="font-sans font-semibold text-2xl sm:text-3xl md:text-[34px] text-white tracking-[0.02em] leading-none whitespace-nowrap">
        Podcasts
      </span>
    </div>
  );
}

// 3. YouTube Crisp Lockup
function YouTubeLockup() {
  return (
    <div className="inline-flex items-center gap-3 shrink-0">
      {/* Official YouTube Red Play Icon */}
      <div className="h-7 sm:h-8 md:h-9 w-10 sm:w-12 md:w-13 rounded-[8px] bg-[#FF0000] flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="size-4 sm:size-5 text-white fill-current ml-0.5" aria-hidden="true">
          <polygon points="6,3 20,12 6,21" />
        </svg>
      </div>
      {/* Official White YouTube Typography */}
      <span className="font-sans font-bold text-2xl sm:text-3xl md:text-[34px] text-white tracking-tight leading-none whitespace-nowrap">
        YouTube
      </span>
    </div>
  );
}

export function PodcastPlatforms({
  className,
  showIntroText = true,
}: PodcastPlatformsProps) {
  const hasYoutube = Boolean(siteConfig.youtubePodcastUrl);

  return (
    <div
      className={cn(
        'w-full flex flex-col xl:flex-row items-center justify-start gap-6 sm:gap-8 lg:gap-12 xl:gap-14 select-none',
        className,
      )}
    >
      {/* 1. Texto introductorio a la izquierda */}
      {showIntroText && (
        <p className="font-sans font-light text-[clamp(1.35rem,2vw,2.25rem)] leading-[1.2] text-[#F5F3EE] tracking-tight text-center xl:text-left shrink-0">
          Escúchalo en:
        </p>
      )}

      {/* 2. Lockups oficiales horizontales directamente sobre fondo azul marino sin tarjetas ni bordes */}
      <div className="flex flex-wrap items-center justify-center xl:justify-start gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
        {/* 1. Spotify */}
        <a
          href={siteConfig.spotifyShowUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir Salud Forte en Spotify"
          className="group relative inline-flex items-center justify-center p-1.5 transition-all duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 active:-translate-y-[3px] hover:brightness-105 motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-[#07182A] rounded-sm"
        >
          <SpotifyLockup />
        </a>

        {/* 2. Apple Podcasts */}
        <a
          href={siteConfig.applePodcastsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir SaludForte en Apple Podcasts"
          className="group relative inline-flex items-center justify-center p-1.5 transition-all duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 active:-translate-y-[3px] hover:brightness-105 motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-[#07182A] rounded-sm"
        >
          <ApplePodcastsLockup />
        </a>

        {/* 3. YouTube */}
        <a
          href={siteConfig.youtubePodcastUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visitar el canal de Salud Forte en YouTube; se abre en una pestaña nueva"
          className="group relative inline-flex items-center justify-center p-1.5 transition-all duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 active:-translate-y-[3px] hover:brightness-105 motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-[#07182A] rounded-sm"
        >
          <YouTubeLockup />
        </a>
      </div>
    </div>
  );
}
