import type React from 'react';
import { BookOpen } from 'lucide-react';

type TopicCardProps = {
  key?: React.Key;
  index: number;
  title: string;
};

export function TopicCard({ index, title }: TopicCardProps) {
  return (
    <div className="group relative flex min-h-[160px] flex-col justify-between border-b border-r border-[#B39A6A]/20 p-6 transition-all duration-300 hover:bg-white sm:min-h-[190px] sm:p-8">
      <div className="flex items-center justify-between">
        <span className="text-[0.62rem] font-semibold tracking-[0.15em] text-champagne">
          {String(index + 1).padStart(2, '0')}
        </span>
        <BookOpen
          aria-hidden="true"
          className="size-4 text-obsidian/24 transition-colors group-hover:text-champagne"
        />
      </div>
      <div>
        <h3 className="mt-8 max-w-[12rem] font-serif text-2xl leading-tight text-obsidian transition-colors group-hover:text-champagne sm:text-3xl">
          {title}
        </h3>
        <div className="mt-4 h-px w-0 bg-champagne transition-all duration-300 group-hover:w-full" />
      </div>
    </div>
  );
}
