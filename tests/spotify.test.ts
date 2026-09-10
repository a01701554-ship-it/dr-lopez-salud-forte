import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getSpotifyEpisodeEmbedUrl,
  getSpotifyShowEmbedUrl,
  parseSpotifyResourceUrl,
} from '../lib/integrations/spotify.ts';

const showId = '3n6UjZ8sHZdwGcuDh93jPv';

void test('builds the official Spotify show embed URL', () => {
  assert.equal(
    getSpotifyShowEmbedUrl(showId),
    `https://open.spotify.com/embed/show/${showId}?utm_source=generator&theme=0`,
  );
});

void test('builds an official Spotify episode embed URL', () => {
  assert.equal(
    getSpotifyEpisodeEmbedUrl('episode-id'),
    'https://open.spotify.com/embed/episode/episode-id?utm_source=generator&theme=0',
  );
});

void test('parses the configured show URL', () => {
  assert.equal(
    parseSpotifyResourceUrl(
      `https://open.spotify.com/show/${showId}?si=example`,
      'show',
    ),
    showId,
  );
});

void test('rejects a different host or resource type', () => {
  assert.equal(
    parseSpotifyResourceUrl(`https://example.com/show/${showId}`, 'show'),
    null,
  );
  assert.equal(
    parseSpotifyResourceUrl(
      `https://open.spotify.com/show/${showId}`,
      'episode',
    ),
    null,
  );
});
