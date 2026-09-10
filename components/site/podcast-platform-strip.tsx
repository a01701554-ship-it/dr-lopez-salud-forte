import React from 'react';
import { PodcastPlatforms, PodcastPlatformsProps } from './podcast-platforms';

export type PodcastPlatformStripProps = PodcastPlatformsProps;

export function PodcastPlatformStrip({ className, showIntroText = true }: PodcastPlatformStripProps) {
  return (
    <div className="w-full max-w-[1440px] mx-auto py-6 sm:py-8 lg:py-10">
      <PodcastPlatforms className={className} showIntroText={showIntroText} />
    </div>
  );
}
