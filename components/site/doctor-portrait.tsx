import { cn } from '@/lib/utils';
import { ManagedImage } from './managed-image';
import { ImageSlotKey } from '@/config/site-images';

type DoctorPortraitProps = {
  variant?: 'hero' | 'about' | 'consultation' | 'podcast';
  className?: string;
  imgClassName?: string;
  fadeBottom?: boolean;
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
  fadeBottom = true,
}: DoctorPortraitProps) {
  const slot = variantToSlotMap[variant] || 'aboutPortrait';
  const isAbout = variant === 'about';

  const bottomFadeStyle =
    isAbout && fadeBottom
      ? {
          WebkitMaskImage:
            'linear-gradient(to bottom, #000 0%, #000 92%, rgba(0, 0, 0, 0.96) 94%, rgba(0, 0, 0, 0.72) 97%, rgba(0, 0, 0, 0.3) 99%, transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, #000 0%, #000 92%, rgba(0, 0, 0, 0.96) 94%, rgba(0, 0, 0, 0.72) 97%, rgba(0, 0, 0, 0.3) 99%, transparent 100%)',
        }
      : undefined;

  return (
    <ManagedImage
      slot={slot}
      priority={variant === 'hero' || isAbout}
      objectFit={isAbout ? 'contain' : undefined}
      style={bottomFadeStyle}
      imgClassName={cn(
        isAbout
          ? 'object-contain object-bottom drop-shadow-none'
          : 'object-[center_top]',
        imgClassName
      )}
      className={cn(
        'relative flex items-end justify-center select-none',
        isAbout
          ? 'bg-transparent overflow-visible'
          : 'overflow-hidden min-h-[380px] sm:min-h-[460px] bg-[#0D2235]',
        className,
      )}
    />
  );
}
