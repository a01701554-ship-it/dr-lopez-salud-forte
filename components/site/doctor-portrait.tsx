import { cn } from '@/lib/utils';
import { ManagedImage } from './managed-image';
import { ImageSlotKey } from '@/config/site-images';

type DoctorPortraitProps = {
  variant?: 'hero' | 'about' | 'consultation' | 'podcast';
  className?: string;
  imgClassName?: string;
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
}: DoctorPortraitProps) {
  const slot = variantToSlotMap[variant] || 'aboutPortrait';
  const isAbout = variant === 'about';

  return (
    <ManagedImage
      slot={slot}
      priority={variant === 'hero'}
      objectFit={isAbout ? 'contain' : undefined}
      imgClassName={cn(
        isAbout
          ? 'object-contain object-bottom'
          : 'object-[center_top]',
        imgClassName
      )}
      className={cn(
        'relative overflow-hidden flex items-center justify-center',
        isAbout
          ? 'bg-[#E1EDFB]'
          : 'min-h-[380px] sm:min-h-[460px] bg-[#0D2235]',
        className,
      )}
    />
  );
}
