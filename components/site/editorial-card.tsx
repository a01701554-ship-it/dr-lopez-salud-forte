import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type EditorialCardProps = {
  number?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  className?: string;
  tone?: 'light' | 'stone' | 'dark';
};

export function EditorialCard({
  number,
  eyebrow,
  title,
  description,
  href,
  className,
  tone = 'light',
}: EditorialCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] opacity-54">
          {number ?? eyebrow}
        </p>
        {href ? <ArrowUpRight aria-hidden="true" className="size-4" /> : null}
      </div>
      <h3 className="mt-12 max-w-sm font-serif text-3xl leading-[1.02] tracking-[-0.02em] sm:text-4xl">
        {title}
      </h3>
      {description ? (
        <p className="mt-5 max-w-md text-sm leading-[1.7] opacity-64">
          {description}
        </p>
      ) : null}
    </>
  );

  const styles = cn(
    'group block min-h-[280px] border p-7 transition-all duration-300 sm:p-9',
    tone === 'light' &&
      'border-[#B39A6A]/20 bg-white text-obsidian hover:border-champagne hover:bg-ivory',
    tone === 'stone' &&
      'border-[#B39A6A]/20 bg-stone/52 text-obsidian hover:border-champagne hover:bg-stone',
    tone === 'dark' &&
      'border-[#B39A6A]/25 bg-navy text-white hover:border-champagne hover:bg-[#111820]',
    className,
  );

  return href ? (
    <Link href={href} prefetch={false} className={styles}>
      {content}
    </Link>
  ) : (
    <article className={styles}>{content}</article>
  );
}
