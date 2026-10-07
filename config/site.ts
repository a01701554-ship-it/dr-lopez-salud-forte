export const siteConfig = {
  brandName: 'Dr. Mauricio Benjamín Galindo López',
  doctorName: 'Dr. Mauricio Benjamín Galindo López',
  legalName: 'Mauricio Benjamín Galindo López',
  professionalTitle: 'Médico General',
  degreeName: 'Licenciatura como Médico Cirujano',
  university: 'Tecnológico de Monterrey',
  universityLegalName:
    'Instituto Tecnológico y de Estudios Superiores de Monterrey',
  professionalLicense: '15851723',
  credentialVerificationUrl:
    'https://certificados.tec.mx/certificate/2f5cb12495c15b16b59a21f52552f646',
  podcastName: 'Salud Forte',
  podcastLogo: '/images/brand/salud-forte-podcast-cover-3000.png',
  spotifyShowUrl: 'https://open.spotify.com/show/3n6UjZ8sHZdwGcuDh93jPv',
  spotifyShowId: '3n6UjZ8sHZdwGcuDh93jPv',
  applePodcastsUrl: 'https://podcasts.apple.com/mx/podcast/saludforte/id1825040130',
  youtubePodcastUrl:
    'https://www.youtube.com/channel/UCNht3TMKX5w5McVigzSzURA',
  city: 'Querétaro, Qro., México',
  timezone: 'America/Mexico_City',
  contactEmail: '',
  whatsappNumber: '+524421275952',
  doctorNotificationWhatsapp: '+524421275952',
  socialLinks: {
    spotify: 'https://open.spotify.com/show/3n6UjZ8sHZdwGcuDh93jPv',
    instagram: '',
    youtube: 'https://www.youtube.com/channel/UCNht3TMKX5w5McVigzSzURA',
    tiktok: '',
    facebook: '',
    linkedin: '',
  },
  bookingSettings: {
    appointmentDuration: 50, // 50 min consultation
    gracePeriodMinutes: 15, // 15 min tolerance policy
    bufferBefore: 0,
    bufferAfter: 10,
    minimumAdvanceTime: 12,
    maximumBookingWindow: 60,
    cancellationWindow: 24,
  },
  colors: {
    obsidian: '#111820',
    navy: '#0D2235',
    midnight: '#07182A',
    platinum: '#D8D1C3',
    ivory: '#F5F3EE',
    stone: '#E9E6DF',
    sage: '#76867A',
    champagne: '#B39A6A',
    white: '#FFFFFF',
    iceBlue: '#F3F8FF',
    actionBlue: '#4AA3F7',
    heroNavyBar: '#1E2539',
  },
  fonts: {
    heading: 'Instrument Serif',
    body: 'Inter',
  },
} as const;

export { STORE_ENABLED } from './store';
import { STORE_ENABLED } from './store';

export const allNavigation = [
  { label: 'Sobre mí', href: '/sobre-mi' },
  { label: 'Consulta', href: '/consulta' },
  { label: 'Salud Forte', href: '/podcast' },
  { label: 'Preguntas', href: '/preguntas' },
  { label: 'Academia', href: '/academia' },
  { label: 'Tienda', href: '/tienda' },
] as const;

export const navigation = STORE_ENABLED
  ? (allNavigation as unknown as { label: string; href: string }[])
  : (allNavigation.filter((item) => item.href !== '/tienda') as unknown as { label: string; href: string }[]);

export type SiteConfig = typeof siteConfig;
