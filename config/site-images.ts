/**
 * ============================================================================
 * REGISTRO CENTRAL DE IMÁGENES — DR. MAURICIO BENJAMÍN GALINDO LÓPEZ
 * Single Source of Truth para la gestión de fotografías en el sitio web.
 * ============================================================================
 * 
 * GUÍA RÁPIDA DE ACTIVACIÓN PARA CODEX:
 * ----------------------------------------------------------------------------
 * 1. Para activar TODAS las fotografías profesionales del Dr. Mauricio a la vez,
 *    cambia únicamente la propiedad SITE_IMAGE_MODE de "current" a "doctor":
 * 
 *    export const SITE_IMAGE_MODE: SiteImageMode = "doctor";
 * 
 * 2. Para cambiar la fotografía de un solo slot individualmente (ejemplo: usar
 *    DR MAU1 en la tarjeta de reserva), modifica la propiedad .doctor del slot:
 * 
 *    bookingPortrait: {
 *      ...
 *      doctor: {
 *        png: "/images/doctor/dr-mauricio-about.png",
 *        webp: "/images/doctor/dr-mauricio-about.webp",
 *      }
 *    }
 * ============================================================================
 */

export type SiteImageMode = 'current' | 'doctor';

/**
 * INTERRUPTOR GLOBAL DE IMÁGENES
 * "current" -> Mantiene las imágenes actuales provisionales
 * "doctor"  -> Activa las fotografías profesionales del Dr. Mauricio
 */
export const SITE_IMAGE_MODE: SiteImageMode = 'doctor';

export interface ImageSlotData {
  png: string;
  webp?: string;
}

export interface ImageSlotConfig {
  id?: string;
  current: ImageSlotData;
  doctor: ImageSlotData;
  alt: string;
  objectFit: 'cover' | 'contain';
  desktopPosition: string;
  mobilePosition: string;
  aspectRatio?: string;
}

export const SITE_IMAGES: Record<'homeHero' | 'aboutPortrait' | 'bookingPortrait', ImageSlotConfig> = {
  /**
   * SLOT 1: Portada Principal / Hero (Home)
   * ID Oficial: IMG-301-DR-MAURICIO-GALINDO-HERO
   */
  homeHero: {
    id: 'IMG-301-DR-MAURICIO-GALINDO-HERO',
    current: {
      png: '/images/doctor/official/mauricio-home-hero-2026.png',
      webp: '/images/doctor/official/mauricio-home-hero-2026.webp',
    },
    doctor: {
      png: '/images/doctor/official/mauricio-home-hero-2026.png',
      webp: '/images/doctor/official/mauricio-home-hero-2026.webp',
    },
    alt: 'Dr. Mauricio Benjamín Galindo López, Médico Cirujano con bata blanca y estetoscopio',
    objectFit: 'cover',
    desktopPosition: 'object-[center_top]',
    mobilePosition: 'object-[72%_top]',
  },

  /**
   * SLOT 2: Sección "Sobre Mí" y Página /sobre-mi
   * ID Oficial: IMG-302-DR-MAURICIO-GALINDO-ABOUT
   */
  aboutPortrait: {
    id: 'IMG-302-DR-MAURICIO-GALINDO-ABOUT',
    current: {
      png: '/images/doctor-sobre-mi-cutout.png',
      webp: '/images/doctor-sobre-mi-cutout.webp',
    },
    doctor: {
      png: '/images/doctor-sobre-mi-cutout.png',
      webp: '/images/doctor-sobre-mi-cutout.webp',
    },
    alt: 'Retrato profesional del Dr. Mauricio Benjamín Galindo López, Médico Cirujano',
    objectFit: 'contain',
    desktopPosition: 'object-bottom',
    mobilePosition: 'object-bottom',
  },

  /**
   * SLOT 3: Tarjeta de Reserva de Consulta (/agendar)
   * ID Oficial: IMG-303-DR-MAURICIO-GALINDO-CONSULTA
   */
  bookingPortrait: {
    id: 'IMG-303-DR-MAURICIO-GALINDO-CONSULTA',
    current: {
      png: '/images/doctor/official/mauricio-consultation-2026.png',
      webp: '/images/doctor/official/mauricio-consultation-2026.webp',
    },
    doctor: {
      png: '/images/doctor/official/mauricio-consultation-2026.png',
      webp: '/images/doctor/official/mauricio-consultation-2026.webp',
    },
    alt: 'Dr. Mauricio Benjamín Galindo López con uniforme clínico azul y estetoscopio',
    objectFit: 'cover',
    desktopPosition: 'object-[center_20%]',
    mobilePosition: 'object-[center_20%]',
  },
} as const;

export type ImageSlotKey = keyof typeof SITE_IMAGES;

export const SLOT_TO_IMAGE_ID_MAP: Record<ImageSlotKey, string> = {
  homeHero: 'IMG-301-DR-MAURICIO-GALINDO-HERO',
  aboutPortrait: 'IMG-302-DR-MAURICIO-GALINDO-ABOUT',
  bookingPortrait: 'IMG-303-DR-MAURICIO-GALINDO-CONSULTA',
};

// Re-export central registry types and helpers
export * from '@/lib/images/registry';

/**
 * Función auxiliar para resolver la configuración activa de un slot
 */
export function getActiveSlotImage(
  slot: ImageSlotKey,
  mode: SiteImageMode = SITE_IMAGE_MODE,
) {
  const slotConfig = SITE_IMAGES[slot];
  const activeData = slotConfig[mode];

  return {
    src: activeData.png,
    webpSrc: activeData.webp || activeData.png,
    pngSrc: activeData.png,
    alt: slotConfig.alt,
    objectFit: slotConfig.objectFit,
    desktopPosition: slotConfig.desktopPosition,
    mobilePosition: slotConfig.mobilePosition,
    slotConfig,
  };
}
