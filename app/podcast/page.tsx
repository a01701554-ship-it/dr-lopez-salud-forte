import { Container } from '@/components/site/container';
import { SaludForteFeature } from '@/components/site/salud-forte-feature';
import { SpotifyShowEmbed } from '@/components/site/spotify';
import { saludForteShow, podcastEpisodes } from '@/lib/content/podcast';
import { siteConfig } from '@/config/site';

export default function PodcastPage() {
  const origin = (typeof window !== 'undefined' ? window.location.origin : '') || 'http://localhost:3000';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: saludForteShow.name,
    description: saludForteShow.description,
    url: `${origin}/podcast`,
    sameAs: saludForteShow.spotifyUrl,
    author: {
      '@type': 'Person',
      name: siteConfig.doctorName,
    },
  };

  return (
    <main id="contenido-principal" className="bg-[#07182A] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SaludForteFeature context="podcast" headingLevel="h1" />

      <section
        id="episodios"
        className="scroll-mt-20 sm:scroll-mt-24 border-t border-white/10 bg-[#0A1624] py-20 sm:py-28"
      >
        <span id="reproductor-oficial" className="scroll-mt-20 sm:scroll-mt-24" />
        <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="eyebrow text-champagne">Reproductor oficial</p>
            <h2 className="mt-6 max-w-sm font-serif text-3xl leading-tight sm:text-4xl text-white">
              Escucha el programa completo sin salir del sitio.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Disfruta de la experiencia oficial directamente en Spotify o navega por los episodios desde este reproductor integrado.
            </p>
          </div>
          <SpotifyShowEmbed />
        </Container>
      </section>

      {podcastEpisodes.length > 0 && (
        <section className="border-t border-white/12 bg-obsidian py-20 sm:py-28">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
              <p className="eyebrow text-champagne">Episodios</p>
              <div className="space-y-6">
                {podcastEpisodes.map((episode) => (
                  <div key={episode.slug} className="border-b border-white/10 pb-6">
                    <h3 className="font-serif text-2xl text-white">{episode.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{episode.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
