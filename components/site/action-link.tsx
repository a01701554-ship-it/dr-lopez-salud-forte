import type React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActionLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'text' | 'light' | 'premium-schedule';
  className?: string;
  external?: boolean;
  showCalendar?: boolean;
};

export function ActionLink({
  href,
  children,
  variant = 'primary',
  className,
  external = false,
  showCalendar = false,
}: ActionLinkProps) {
  const isPremiumSchedule = variant === 'premium-schedule';

  const styles = {
    primary:
      'border-[#0D2235] bg-[#0D2235] text-[#F5F3EE] hover:border-obsidian hover:bg-obsidian shadow-sm min-h-12 px-8 py-4 text-xs tracking-widest',
    secondary:
      'border border-[#111820]/20 bg-transparent text-obsidian hover:border-obsidian/40 hover:bg-stone/60 min-h-12 px-8 py-4 text-xs tracking-widest',
    light:
      'border-white/30 bg-white text-[#0D2235] hover:border-white hover:bg-ivory min-h-12 px-8 py-4 text-xs tracking-widest',
    text: 'border-transparent px-0 text-obsidian hover:text-[#B39A6A] min-h-12 text-xs tracking-widest',
    'premium-schedule':
      'border border-[rgba(199,169,107,0.45)] bg-[linear-gradient(135deg,#0B2239_0%,#12324A_100%)] text-[#F8F7F3] shadow-[0_10px_26px_rgba(11,34,57,0.18),0_2px_6px_rgba(11,34,57,0.10)] rounded-[9px] min-h-[58px] sm:min-h-[64px] px-5 sm:px-8 py-4 sm:py-[18px] text-[14px] sm:text-[15px] font-semibold tracking-[0.07em] hover:-translate-y-[2px] hover:brightness-[1.05] hover:shadow-[0_14px_32px_rgba(11,34,57,0.25),0_4px_10px_rgba(11,34,57,0.12)] active:translate-y-0 active:scale-[0.99] active:shadow-[0_6px_16px_rgba(11,34,57,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A96B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2239] focus-visible:outline-[3px] focus-visible:outline-[rgba(199,169,107,0.45)] focus-visible:outline-offset-[3px] transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:hover:transform-none',
  }[variant];

  const hasCalendar = showCalendar || isPremiumSchedule;

  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        'group inline-flex items-center justify-center gap-3 uppercase font-semibold transition-all duration-200 focus-visible:outline-none',
        styles,
        className,
      )}
      {...(external
        ? { target: '_blank', rel: 'noreferrer noopener' }
        : undefined)}
    >
      {hasCalendar && (
        <Calendar
          aria-hidden="true"
          className={cn(
            'size-5 text-[#C7A96B] shrink-0 stroke-[1.6]',
            isPremiumSchedule && 'size-[19px]',
          )}
        />
      )}
      <span className="whitespace-nowrap">{children}</span>
      <ArrowRight
        aria-hidden="true"
        className={cn(
          'size-3.5 transition-transform duration-200 group-hover:translate-x-1',
          isPremiumSchedule &&
            'size-[19px] text-[#C7A96B] shrink-0 stroke-[1.6] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[4px]',
        )}
      />
    </Link>
  );
}

