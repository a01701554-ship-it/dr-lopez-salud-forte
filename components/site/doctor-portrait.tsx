import React from 'react';
import { cn } from '@/lib/utils';
import { ManagedImage } from './managed-image';
import { ImageSlotKey } from '@/config/site-images';

type DoctorPortraitProps = {
  variant?: 'hero' | 'about' | 'consultation' | 'podcast';
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  maskBottom?: boolean;
};

const variantToSlotMap: Record<string, ImageSlotKey> = {
  hero: 'homeHero',
  about: 'aboutPortrait',
  consultation: 'bookingPortrait',
  podcast: 'bookingPortrait',
};

export function DoctorPortrait({
  variant = 'about',
  className,
  imgClassName,
  priority = false,
  maskBottom = true,
}: DoctorPortraitProps) {
  const slot = variantToSlotMap[variant] || 'aboutPortrait';
  const isAbout = variant === 'about';

  if (isAbout) {
    return (
      <div
        className={cn(
          'relative bg-transparent border-0 outline-0 shadow-none flex items-end justify-center select-none',
          className
        )}
      >
        <picture className="block w-full h-auto">
          <source srcSet="/images/doctor-trayectoria-cutout.webp" type="image/webp" />
          <img
            src="/images/doctor-trayectoria-cutout.png"
            alt="Dr. Mauricio Benjamín Galindo López, Médico Cirujano"
            width={1086}
            height={1448}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            referrerPolicy="no-referrer"
            className={cn(
              'block w-full h-auto aspect-[1086/1448] object-contain object-bottom mx-auto border-0 outline-0 shadow-none',
              imgClassName
            )}
            style={
              maskBottom
                ? {
                    WebkitMaskImage:
                      'linear-gradient(to bottom, #000 0%, #000 80%, rgba(0, 0, 0, 0.96) 86%, rgba(0, 0, 0, 0.6) 93%, transparent 100%)',
                    maskImage:
                      'linear-gradient(to bottom, #000 0%, #000 80%, rgba(0, 0, 0, 0.96) 86%, rgba(0, 0, 0, 0.6) 93%, transparent 100%)',
                  }
                : undefined
            }
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== '/images/doctor/official/mauricio-about-2026.png') {
                target.src = '/images/doctor/official/mauricio-about-2026.png';
              }
            }}
          />
        </picture>
      </div>
    );
  }

  return (
    <ManagedImage
      slot={slot}
      priority={priority || variant === 'hero'}
      objectFit="cover"
      imgClassName={cn('object-[center_top]', imgClassName)}
      className={cn(
        'relative overflow-hidden flex items-center justify-center min-h-[380px] sm:min-h-[460px] bg-[#0D2235]',
        className
      )}
    />
  );
}
