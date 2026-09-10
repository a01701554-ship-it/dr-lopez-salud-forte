import { siteConfig } from '@/config/site';
import {
  getSpotifyEpisodeEmbedUrl,
  getSpotifyShowEmbedUrl,
} from '@/lib/integrations/spotify';

type SpotifyShowProps = {
  showId?: string;
  compact?: boolean;
};

export function SpotifyShow({
  showId = siteConfig.spotifyShowId,
  compact = false,
}: SpotifyShowProps) {
  return (
    <div className="overflow-hidden bg-[#121212] shadow-[0_20px_70px_rgba(0,0,0,0.16)] w-full">
      <iframe
        title={`Escuchar ${siteConfig.podcastName} en Spotify`}
        src={getSpotifyShowEmbedUrl(showId)}
        width="100%"
        height={compact ? 232 : 352}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="block w-full border-0"
      />
      <noscript>
        <p className="p-6 text-sm text-white">
          No pudimos cargar el reproductor en este momento.{' '}
          <a className="underline" href={siteConfig.spotifyShowUrl}>
            Escuchar en Spotify
          </a>
        </p>
      </noscript>
    </div>
  );
}

export const SpotifyShowEmbed = SpotifyShow;

type SpotifyEpisodeProps = {
  episodeId: string;
  title: string;
};

export function SpotifyEpisode({ episodeId, title }: SpotifyEpisodeProps) {
  return (
    <iframe
      title={`Escuchar ${title} en Spotify`}
      src={getSpotifyEpisodeEmbedUrl(episodeId)}
      width="100%"
      height="152"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="block w-full border-0"
    />
  );
}
