import { siteConfig } from '@/config/site';

export type PodcastShow = {
  id: string;
  name: string;
  slug: string;
  platform: 'spotify';
  spotifyShowId: string;
  spotifyUrl: string;
  description: string;
  coverImage: string;
  active: boolean;
};

export type PodcastEpisode = {
  title: string;
  slug: string;
  spotifyUrl: string;
  spotifyEpisodeId: string;
  description: string;
  episodeNumber: number | null;
  publishedAt: string;
  duration: string;
  category: string;
  thumbnail: string;
  featured: boolean;
  references: Array<{ label: string; url: string }>;
  relatedArticleIds: string[];
};

export const saludForteShow: PodcastShow = {
  id: 'salud-forte',
  name: siteConfig.podcastName,
  slug: 'salud-forte',
  platform: 'spotify',
  spotifyShowId: siteConfig.spotifyShowId,
  spotifyUrl: siteConfig.spotifyShowUrl,
  description:
    'Un espacio para hablar de medicina, prevención, hábitos y bienestar con información clara, responsable y útil.',
  coverImage: '/images/brand/salud-forte-podcast-cover-3000.png',
  active: true,
};

export type PodcastPlatform = {
  name: string;
  href: string;
  active: boolean;
  badgeLabel?: string;
};

export const podcastPlatforms: PodcastPlatform[] = [
  {
    name: 'Spotify',
    href: siteConfig.spotifyShowUrl,
    active: true,
    badgeLabel: 'Escuchar en Spotify',
  },
  {
    name: 'Apple Podcasts',
    href: siteConfig.applePodcastsUrl,
    active: true,
    badgeLabel: 'Escuchar en Apple Podcasts',
  },
  {
    name: 'YouTube',
    href: siteConfig.youtubePodcastUrl || '',
    active: Boolean(siteConfig.youtubePodcastUrl),
    badgeLabel: 'Ver en YouTube',
  },
];

// Producción permanece vacía hasta contar con metadata real y verificada.
export const podcastEpisodes: PodcastEpisode[] = [];
