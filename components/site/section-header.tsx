import { cn } from '@/lib/utils';

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        'max-w-4xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <p className={cn('eyebrow', tone === 'dark' && 'text-champagne')}>
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-5 text-balance font-serif text-[clamp(2.7rem,5vw,5.4rem)] leading-[0.95] tracking-[-0.035em]',
          tone === 'dark' ? 'text-white' : 'text-obsidian',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-7 max-w-2xl text-pretty text-base leading-[1.75] sm:text-lg',
            align === 'center' && 'mx-auto',
            tone === 'dark' ? 'text-white/62' : 'text-obsidian/64',
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}

export const SectionHeading = SectionHeader;
