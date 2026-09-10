import { Hero } from '@/components/site/hero';
import { HomeSections } from '@/components/site/home-sections';
import { siteConfig } from '@/config/site';

export default function Home() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: siteConfig.doctorName,
    jobTitle: siteConfig.professionalTitle,
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: siteConfig.universityLegalName,
      alternateName: siteConfig.university,
    },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: siteConfig.degreeName,
      credentialCategory: 'professional license',
      identifier: siteConfig.professionalLicense,
      url: siteConfig.credentialVerificationUrl,
    },
    subjectOf: {
      '@type': 'PodcastSeries',
      name: siteConfig.podcastName,
      sameAs: siteConfig.spotifyShowUrl,
    },
  };

  return (
    <main id="contenido-principal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Hero />
      <HomeSections />
    </main>
  );
}
