import { ManagedImage } from '@/components/site/managed-image';

interface DoctorBookingPhotoProps {
  className?: string;
  variant?: 'card' | 'large';
}

/**
 * Editorial Doctor Photograph Component for Booking Flow
 * Powered by centralized ManagedImage system (bookingPortrait slot).
 */
export function DoctorBookingPhoto({ className = '', variant = 'large' }: DoctorBookingPhotoProps) {
  return (
    <ManagedImage
      slot="bookingPortrait"
      className={`${
        variant === 'card'
          ? 'w-full sm:w-[240px] md:w-[260px] aspect-[3/4] rounded-lg'
          : 'w-full h-full min-h-[440px] lg:min-h-[580px] rounded-xl'
      } ${className}`}
    />
  );
}
