import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import {
  SITE_IMAGES,
  SITE_IMAGE_MODE,
  ImageSlotKey,
  SiteImageMode,
  getActiveSlotImage,
  SLOT_TO_IMAGE_ID_MAP,
  IMAGE_REGISTRY,
  getImageById,
} from '@/config/site-images';

export interface ManagedImageProps {
  slot?: ImageSlotKey;
  imageId?: string;
  mode?: SiteImageMode;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  device?: 'desktop' | 'mobile' | 'all';
  alt?: string;
  objectFit?: 'cover' | 'contain';
  style?: React.CSSProperties;
}

export function ManagedImage({
  slot,
  imageId,
  mode = SITE_IMAGE_MODE,
  className,
  imgClassName,
  priority = false,
  sizes = '(max-width: 1023px) 100vw, 50vw',
  device = 'all',
  alt: customAlt,
  objectFit,
  style,
}: ManagedImageProps) {
  const [hasError, setHasError] = useState(false);

  // Resolve target image metadata either from imageId or slot
  const resolvedId = imageId || (slot ? SLOT_TO_IMAGE_ID_MAP[slot] : undefined);
  const registryItem = resolvedId ? getImageById(resolvedId) : undefined;
  const activeSlot = slot ? getActiveSlotImage(slot, mode) : undefined;

  const src = activeSlot?.src || registryItem?.primarySrc || '';
  const webpSrc = activeSlot?.webpSrc || registryItem?.webpSrc;
  const pngSrc = activeSlot?.pngSrc || registryItem?.pngSrc;
  const alt = customAlt || activeSlot?.alt || registryItem?.alt || siteConfig.doctorName;
  const width = registryItem?.width || 1086;
  const height = registryItem?.height || 1448;

  // Determine positional class based on device prop
  let positionClass = activeSlot?.desktopPosition || registryItem?.desktopPosition || 'object-center';
  if (device === 'mobile') {
    positionClass = activeSlot?.mobilePosition || registryItem?.mobilePosition || 'object-center';
  } else if (device === 'all' && (activeSlot?.mobilePosition || registryItem?.mobilePosition)) {
    const mob = activeSlot?.mobilePosition || registryItem?.mobilePosition;
    const dsk = activeSlot?.desktopPosition || registryItem?.desktopPosition;
    positionClass = `${mob} lg:${dsk}`;
  }

  const isHero = slot === 'homeHero' || resolvedId === 'IMG-301-DR-MAURICIO-GALINDO-HERO';
  const loadingStrategy = priority || isHero ? 'eager' : 'lazy';
  const fetchPriorityStrategy = priority || isHero ? 'high' : 'auto';

  return (
    <div
      data-image-id={resolvedId}
      style={style}
      className={cn(
        'relative overflow-hidden bg-[#0D2235] flex items-center justify-center select-none',
        className,
      )}
    >
      {!hasError && src ? (
        <picture className="absolute inset-0 size-full">
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          {pngSrc && <source srcSet={pngSrc} type="image/png" />}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            loading={loadingStrategy}
            fetchPriority={fetchPriorityStrategy}
            decoding="async"
            sizes={sizes}
            className={cn(
              'size-full transition-opacity duration-300',
              (objectFit || activeSlot?.objectFit) === 'contain'
                ? 'object-contain'
                : 'object-cover',
              positionClass,
              imgClassName,
            )}
          />
        </picture>
      ) : (
        /* Fallback de seguridad neutro sin mostrar rostros de terceros */
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D2235] via-[#111820] to-[#0A1624] flex flex-col items-center justify-center p-6 text-center">
          <div className="absolute inset-4 border border-white/10 rounded-lg pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="size-2 rounded-full bg-[#B39A6A] mb-3" />
            <span className="font-serif text-lg text-[#F5F3EE] font-normal tracking-tight">
              {siteConfig.doctorName}
            </span>
            <span className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#B39A6A]">
              {siteConfig.professionalTitle} · {siteConfig.university}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
