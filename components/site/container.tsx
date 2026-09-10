import type React from 'react';
import { cn } from '@/lib/utils';

type ContainerProps = React.ComponentProps<'div'>;

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10 xl:px-14',
        className,
      )}
      {...props}
    />
  );
}

export function NarrowContainer({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-3xl px-5 sm:px-8', className)}
      {...props}
    />
  );
}

export function EditorialContainer({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1728px] px-5 sm:px-8 lg:px-10 xl:px-14',
        className,
      )}
      {...props}
    />
  );
}
