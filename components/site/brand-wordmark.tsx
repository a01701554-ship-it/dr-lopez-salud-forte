import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

type BrandWordmarkProps = {
  className?: string;
  multiline?: boolean;
};

export function BrandWordmark({
  className,
  multiline = false,
}: BrandWordmarkProps) {
  return (
    <Link
      href="/"
      prefetch={false}
      aria-label="Dr. Mauricio Galindo, inicio"
      className={cn(
        'font-serif tracking-[-0.02em] outline-none focus-visible:ring-2 focus-visible:ring-champagne transition-opacity hover:opacity-90',
        className,
      )}
    >
      {multiline ? (
        <>
          Dr. Mauricio
          <br />
          Galindo
        </>
      ) : (
        <span className="font-serif text-obsidian tracking-[-0.02em]">
          Dr. Mauricio Galindo
        </span>
      )}
    </Link>
  );
}
