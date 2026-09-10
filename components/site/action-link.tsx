import type React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActionLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'text' | 'light';
  className?: string;
  external?: boolean;
};

export function ActionLink({
  href,
  children,
  variant = 'primary',
  className,
  external = false,
}: ActionLinkProps) {
  const styles = {
    primary:
      'border-[#0D2235] bg-[#0D2235] text-[#F5F3EE] hover:border-obsidian hover:bg-obsidian shadow-sm',
    secondary:
      'border border-[#111820]/20 bg-transparent text-obsidian hover:border-obsidian/40 hover:bg-stone/60',
    light:
      'border-white/30 bg-white text-[#0D2235] hover:border-white hover:bg-ivory',
    text: 'border-transparent px-0 text-obsidian hover:text-[#B39A6A]',
  }[variant];

  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        'group inline-flex min-h-12 items-center justify-center gap-3 px-8 py-4 text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-4',
        styles,
        className,
      )}
      {...(external
        ? { target: '_blank', rel: 'noreferrer noopener' }
        : undefined)}
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}
