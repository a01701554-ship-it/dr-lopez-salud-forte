const SPOTIFY_HOSTS = new Set(['open.spotify.com', 'www.open.spotify.com']);

export function getSpotifyShowEmbedUrl(showId: string) {
  if (!showId.trim()) throw new Error('Spotify show ID is required');

  return `https://open.spotify.com/embed/show/${encodeURIComponent(showId)}?utm_source=generator&theme=0`;
}

export function getSpotifyEpisodeEmbedUrl(episodeId: string) {
  if (!episodeId.trim()) throw new Error('Spotify episode ID is required');

  return `https://open.spotify.com/embed/episode/${encodeURIComponent(episodeId)}?utm_source=generator&theme=0`;
}

export function parseSpotifyResourceUrl(
  value: string,
  expectedType: 'show' | 'episode',
) {
  const url = new URL(value);
  if (!SPOTIFY_HOSTS.has(url.hostname)) return null;

  const segments = url.pathname.split('/').filter(Boolean);
  const typeIndex = segments.findIndex((segment) => segment === expectedType);
  const id = typeIndex >= 0 ? segments[typeIndex + 1] : undefined;

  return id?.trim() || null;
}
