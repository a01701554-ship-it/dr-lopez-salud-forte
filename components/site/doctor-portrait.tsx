import { cn } from '@/lib/utils';
import { ManagedImage } from './managed-image';
import { ImageSlotKey } from '@/config/site-images';

type DoctorPortraitProps = {
  variant?: 'hero' | 'about' | 'consultation' | 'podcast';
  className?: string;
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
}: DoctorPortraitProps) {
  const slot = variantToSlotMap[variant] || 'aboutPortrait';

  return (
    <ManagedImage
      slot={slot}
      priority={variant === 'hero'}
      className={cn(
        'relative min-h-[460px] overflow-hidden bg-[#0D2235] flex items-center justify-center',
        className,
      )}
    />
  );
}
