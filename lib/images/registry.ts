/**
 * ============================================================================
 * CATÁLOGO CENTRAL Y REGISTRO ÚNICO DE IMÁGENES (SINGLE SOURCE OF TRUTH)
 * Salud Forte · Dr. Mauricio Benjamín Galindo López
 * ============================================================================
 * 
 * Este archivo es la FUENTE ÚNICA DE VERDAD para todas las imágenes y recursos
 * visuales del proyecto. Está diseñado para que Codex o cualquier desarrollador
 * pueda auditar, rastrear y reemplazar cualquier fotografía con absoluta precisión
 * simplemente actualizando las rutas y metadatos aquí definidos.
 * 
 * ESTRUCTURA DE IDENTIFICADORES (IMG-XXX):
 * - IMG-000 a IMG-099: Identidad visual, marcas, monogramas y logos institucionales
 * - IMG-100 a IMG-199: Masterclasses y portadas de la Academia
 * - IMG-200 a IMG-299: Tienda oficial y productos de suplementación
 * - IMG-300 a IMG-399: Perfiles, retratos del Dr. Mauricio Galindo e instructores
 * - IMG-400 a IMG-499: Dashboard y área privada del estudiante
 * - IMG-500 a IMG-599: Consulta médica y agendamiento clínico
 * - IMG-600 a IMG-699: Podcast Salud Forte y contenido editorial
 * - IMG-900 a IMG-999: Marcadores temporales perfectamente documentados (Placeholders)
 * ============================================================================
 */

export type ImageStatus = 'active' | 'pending' | 'replaceable' | 'archived';

export type ImageDomain =
  | 'brand'
  | 'masterclass'
  | 'product'
  | 'doctor'
  | 'podcast'
  | 'platform'
  | 'dashboard'
  | 'consultation'
  | 'placeholder';

export interface ImageItem {
  id: string;
  label: string;
  domain: ImageDomain;
  status: ImageStatus;
  primarySrc: string;
  webpSrc?: string;
  pngSrc?: string;
  fallbackSrc?: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio: string;
  objectFit: 'cover' | 'contain';
  desktopPosition?: string;
  mobilePosition?: string;
  renderedLocations: string[];
  notesForCodex: string;
}

export const IMAGE_REGISTRY: Record<string, ImageItem> = {
  // ==========================================================================
  // RANGO IMG-000 a IMG-099: IDENTIDAD VISUAL Y LOGOTIPOS
  // ==========================================================================
  'IMG-001-LOGO-MBGL': {
    id: 'IMG-001-LOGO-MBGL',
    label: 'Monograma y Emblema Médico Oficial Dr. Mauricio Benjamín Galindo López',
    domain: 'brand',
    status: 'active',
    primarySrc: 'inline:MbglLogo',
    alt: 'Monograma MBGL del Dr. Mauricio Benjamín Galindo López con bastón de Esculapio',
    width: 1000,
    height: 1000,
    aspectRatio: '1:1',
    objectFit: 'contain',
    renderedLocations: ['Navbar / Encabezado principal', 'Pie de página (Footer)', 'Página /sobre-mi'],
    notesForCodex: 'Componente vectorial SVG de alta definición con degradado dorado (#C68A27) y azul marino (#061A40). No sustituir por imagen de mapa de bits sin previa autorización de marca.',
  },

  'IMG-002-PODCAST-COVER-3000': {
    id: 'IMG-002-PODCAST-COVER-3000',
    label: 'Portada Oficial Cuadrada HD del Podcast Salud Forte',
    domain: 'brand',
    status: 'active',
    primarySrc: '/images/brand/salud-forte-podcast-cover-3000.webp',
    webpSrc: '/images/brand/salud-forte-podcast-cover-3000.webp',
    pngSrc: '/images/brand/salud-forte-podcast-cover-3000.png',
    fallbackSrc: '/images/brand/salud-forte-podcast-cover-3000.jpg',
    alt: 'Portada oficial de Salud Forte Podcast con el Dr. Mauricio Galindo',
    width: 3000,
    height: 3000,
    aspectRatio: '1:1',
    objectFit: 'cover',
    renderedLocations: ['Página /podcast', 'Tarjetas de reproducción y metadatos OpenGraph'],
    notesForCodex: 'Arte maestro oficial requerido por plataformas de podcast (Spotify/Apple) en formato cuadrado exacto de 3000x3000px.',
  },

  'IMG-003-PLATFORM-SPOTIFY': {
    id: 'IMG-003-PLATFORM-SPOTIFY',
    label: 'Icono Oficial Spotify',
    domain: 'platform',
    status: 'active',
    primarySrc: '/images/platforms/spotify.svg',
    alt: 'Spotify Podcast',
    width: 40,
    height: 40,
    aspectRatio: '1:1',
    objectFit: 'contain',
    renderedLocations: ['Tira de plataformas de podcast', 'Pie de página'],
    notesForCodex: 'Vector SVG oficial en color de marca Spotify (#1ED760).',
  },

  'IMG-004-PLATFORM-APPLE': {
    id: 'IMG-004-PLATFORM-APPLE',
    label: 'Icono Oficial Apple Podcasts',
    domain: 'platform',
    status: 'active',
    primarySrc: '/images/platforms/apple-podcasts.svg',
    alt: 'Apple Podcasts',
    width: 40,
    height: 40,
    aspectRatio: '1:1',
    objectFit: 'contain',
    renderedLocations: ['Tira de plataformas de podcast', 'Pie de página'],
    notesForCodex: 'Vector SVG squircle oficial en degradado púrpura de Apple.',
  },

  'IMG-005-PLATFORM-YOUTUBE': {
    id: 'IMG-005-PLATFORM-YOUTUBE',
    label: 'Icono Oficial YouTube',
    domain: 'platform',
    status: 'active',
    primarySrc: '/images/platforms/youtube.svg',
    alt: 'Canal de YouTube Salud Forte',
    width: 40,
    height: 40,
    aspectRatio: '1:1',
    objectFit: 'contain',
    renderedLocations: ['Tira de plataformas de podcast', 'Pie de página'],
    notesForCodex: 'Vector SVG oficial YouTube Red (#FF0000).',
  },

  // ==========================================================================
  // RANGO IMG-100 a IMG-199: MASTERCLASSES Y ACADEMIA
  // ==========================================================================
  'IMG-101-MASTERCLASS-MENOPAUSIA-PORTADA': {
    id: 'IMG-101-MASTERCLASS-MENOPAUSIA-PORTADA',
    label: 'Portada Masterclass: Menopausia con claridad',
    domain: 'masterclass',
    status: 'active',
    primarySrc: '/images/masterclasses/official/menopausia-con-claridad-2026.webp',
    webpSrc: '/images/masterclasses/official/menopausia-con-claridad-2026.webp',
    pngSrc: '/images/masterclasses/official/menopausia-con-claridad-2026.png',
    fallbackSrc: '/images/masterclasses/official/menopausia-con-claridad-2026.png',
    alt: 'Menopausia con claridad: síntomas, opciones y decisiones informadas - Academia Salud Forte',
    width: 1586,
    height: 992,
    aspectRatio: '8:5',
    objectFit: 'cover',
    desktopPosition: 'center center',
    mobilePosition: 'center center',
    renderedLocations: [
      'Catálogo /academia',
      'Ficha de curso /academia/menopausia-con-claridad',
      'Biblioteca privada /academia/mis-masterclasses',
      'Drawer de Carrito',
    ],
    notesForCodex: 'Fotografía aprobada de estilo médico realista con tipografía editorial en español. Relación 8:5 obligatoria para preservar la cuadrícula de tarjetas.',
  },

  'IMG-102-MASTERCLASS-ESTRES-PORTADA': {
    id: 'IMG-102-MASTERCLASS-ESTRES-PORTADA',
    label: 'Portada Masterclass: Estrés y tensión muscular',
    domain: 'masterclass',
    status: 'active',
    primarySrc: '/images/masterclasses/official/estres-tension-muscular-2026.webp',
    webpSrc: '/images/masterclasses/official/estres-tension-muscular-2026.webp',
    pngSrc: '/images/masterclasses/official/estres-tension-muscular-2026.png',
    fallbackSrc: '/images/masterclasses/official/estres-tension-muscular-2026.png',
    alt: 'Estrés y tensión muscular: fisiología y manejo práctico - Academia Salud Forte',
    width: 1586,
    height: 992,
    aspectRatio: '8:5',
    objectFit: 'cover',
    desktopPosition: 'center center',
    mobilePosition: 'center center',
    renderedLocations: [
      'Catálogo /academia',
      'Ficha de curso /academia/estres-y-tension-muscular',
      'Biblioteca privada /academia/mis-masterclasses',
      'Drawer de Carrito',
    ],
    notesForCodex: 'Fotografía aprobada de alta resolución con texto en español integrado armónicamente.',
  },

  'IMG-103-MASTERCLASS-HORMONAL-PORTADA': {
    id: 'IMG-103-MASTERCLASS-HORMONAL-PORTADA',
    label: 'Portada Masterclass: Salud hormonal masculina',
    domain: 'masterclass',
    status: 'active',
    primarySrc: '/images/masterclasses/official/salud-hormonal-masculina-2026.webp',
    webpSrc: '/images/masterclasses/official/salud-hormonal-masculina-2026.webp',
    pngSrc: '/images/masterclasses/official/salud-hormonal-masculina-2026.png',
    fallbackSrc: '/images/masterclasses/official/salud-hormonal-masculina-2026.png',
    alt: 'Salud hormonal masculina: testosterona, energía y bienestar metabólico - Academia Salud Forte',
    width: 1586,
    height: 992,
    aspectRatio: '8:5',
    objectFit: 'cover',
    desktopPosition: 'center center',
    mobilePosition: 'center center',
    renderedLocations: [
      'Catálogo /academia',
      'Ficha de curso /academia/salud-hormonal-masculina',
      'Biblioteca privada /academia/mis-masterclasses',
      'Drawer de Carrito',
    ],
    notesForCodex: 'Fotografía aprobada. Mantener relación de aspecto 8:5 para evitar desplazamientos de diseño.',
  },

  'IMG-104-MASTERCLASS-SOP-PORTADA': {
    id: 'IMG-104-MASTERCLASS-SOP-PORTADA',
    label: 'Portada Masterclass: Síndrome de ovario poliquístico',
    domain: 'masterclass',
    status: 'active',
    primarySrc: '/images/masterclasses/official/sop-con-claridad-2026.webp',
    webpSrc: '/images/masterclasses/official/sop-con-claridad-2026.webp',
    pngSrc: '/images/masterclasses/official/sop-con-claridad-2026.png',
    fallbackSrc: '/images/masterclasses/official/sop-con-claridad-2026.png',
    alt: 'SOP con claridad: evidencia, metabolismo y salud hormonal - Academia Salud Forte',
    width: 1586,
    height: 992,
    aspectRatio: '8:5',
    objectFit: 'cover',
    desktopPosition: 'center center',
    mobilePosition: 'center center',
    renderedLocations: [
      'Catálogo /academia',
      'Ficha de curso /academia/sindrome-ovario-poliquistico',
      'Biblioteca privada /academia/mis-masterclasses',
      'Drawer de Carrito',
    ],
    notesForCodex: 'Fotografía aprobada. Tonos neutros e iluminación médica cálida.',
  },

  // ==========================================================================
  // RANGO IMG-200 a IMG-299: TIENDA Y PRODUCTOS
  // ==========================================================================
  'IMG-201-PRODUCTO-CALCIO-D3': {
    id: 'IMG-201-PRODUCTO-CALCIO-D3',
    label: 'Producto: ALXFRESH Calcio, Magnesio y Zinc con Vitamina D3',
    domain: 'product',
    status: 'pending',
    primarySrc: '/images/products/alxfresh_calcium.webp',
    pngSrc: '/images/products/alxfresh_calcium.png',
    fallbackSrc: '/images/products/alxfresh_calcium.svg',
    alt: 'Frasco de ALXFRESH Calcio, Magnesio y Zinc con Vitamina D3',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    objectFit: 'contain',
    renderedLocations: ['Catálogo /tienda', 'Ficha /tienda/alxfresh-calcium-citrate-...', 'Panel Admin'],
    notesForCodex: 'Fotografía de empaque pendiente de recepción física por el distribuidor. El componente renderiza un fallback SVG neutro y elegante sin romper la maquetación.',
  },

  'IMG-202-PRODUCTO-MELATONINA': {
    id: 'IMG-202-PRODUCTO-MELATONINA',
    label: 'Producto: Melatonin Max 55 mg',
    domain: 'product',
    status: 'pending',
    primarySrc: '/images/products/melatonin_max.webp',
    pngSrc: '/images/products/melatonin_max.png',
    fallbackSrc: '/images/products/melatonin_max.svg',
    alt: 'Frasco de Melatonin Max 55 mg con minerales y vitaminas para el descanso',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    objectFit: 'contain',
    renderedLocations: ['Catálogo /tienda', 'Ficha /tienda/melatonina-max-...', 'Panel Admin'],
    notesForCodex: 'Fórmula y empaque en revisión clínica. Requiere fotografías de frente, reverso e información de lote.',
  },

  'IMG-203-PRODUCTO-MULTIVITAMINICO': {
    id: 'IMG-203-PRODUCTO-MULTIVITAMINICO',
    label: 'Producto: Centrum Men Multivitamínico',
    domain: 'product',
    status: 'pending',
    primarySrc: '/images/products/centrum_men.webp',
    pngSrc: '/images/products/centrum_men.png',
    fallbackSrc: '/images/products/centrum_men.svg',
    alt: 'Envase de Centrum Men multivitamínico y multimineral para hombres',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    objectFit: 'contain',
    renderedLocations: ['Catálogo /tienda', 'Ficha /tienda/centrum-men-...', 'Panel Admin'],
    notesForCodex: 'Pendiente de autorización digital de marca por parte del fabricante.',
  },

  'IMG-204-PRODUCTO-CAFE-HONGOS': {
    id: 'IMG-204-PRODUCTO-CAFE-HONGOS',
    label: 'Producto: Café de hongos con melena de león, reishi y MCT',
    domain: 'product',
    status: 'pending',
    primarySrc: '/images/products/mushroom_coffee.webp',
    pngSrc: '/images/products/mushroom_coffee.png',
    fallbackSrc: '/images/products/mushroom_coffee.svg',
    alt: 'Bolsa de café instantáneo con extractos de hongos adaptógenos y aceite MCT',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    objectFit: 'contain',
    renderedLocations: ['Catálogo /tienda', 'Ficha /tienda/cafe-de-hongos-...', 'Panel Admin'],
    notesForCodex: 'Empaque en evaluación con proveedor. Utiliza el fallback neutral de la tienda.',
  },

  // ==========================================================================
  // RANGO IMG-300 a IMG-399: PERFILES Y RETRATOS MÉDICOS
  // ==========================================================================
  'IMG-301-DR-MAURICIO-GALINDO-HERO': {
    id: 'IMG-301-DR-MAURICIO-GALINDO-HERO',
    label: 'Retrato Principal Hero: Dr. Mauricio Benjamín Galindo López',
    domain: 'doctor',
    status: 'active',
    primarySrc: '/images/doctor/official/mauricio-home-hero-2026.webp',
    webpSrc: '/images/doctor/official/mauricio-home-hero-2026.webp',
    pngSrc: '/images/doctor/official/mauricio-home-hero-2026.png',
    fallbackSrc: '/images/doctor/official/mauricio-home-hero-2026.png',
    alt: 'Dr. Mauricio Benjamín Galindo López, Médico Cirujano con bata blanca y estetoscopio',
    width: 1536,
    height: 1024,
    aspectRatio: '3:2',
    objectFit: 'cover',
    desktopPosition: 'object-[center_top]',
    mobilePosition: 'object-[72%_top]',
    renderedLocations: ['Página de Inicio (Hero)', 'Tarjeta de presentación institucional'],
    notesForCodex: 'Fotografía maestra de estudio con iluminación clara. Para actualizar la fotografía del Dr. Mauricio en el Hero, sustituir este asset.',
  },

  'IMG-302-DR-MAURICIO-GALINDO-ABOUT': {
    id: 'IMG-302-DR-MAURICIO-GALINDO-ABOUT',
    label: 'Retrato Editorial Sobre Mí: Dr. Mauricio Benjamín Galindo López',
    domain: 'doctor',
    status: 'active',
    primarySrc: '/images/doctor/official/mauricio-about-2026.webp',
    webpSrc: '/images/doctor/official/mauricio-about-2026.webp',
    pngSrc: '/images/doctor/official/mauricio-about-2026.png',
    fallbackSrc: '/images/doctor/official/mauricio-about-2026.png',
    alt: 'Retrato profesional del Dr. Mauricio Benjamín Galindo López, Médico Cirujano',
    width: 1086,
    height: 1448,
    aspectRatio: '3:4',
    objectFit: 'contain',
    desktopPosition: 'object-center',
    mobilePosition: 'object-center',
    renderedLocations: ['Sección Sobre Mí en Home', 'Página completa /sobre-mi'],
    notesForCodex: 'Retrato editorial con enfoque en credenciales médicas y formación académica.',
  },

  'IMG-303-DR-MAURICIO-GALINDO-CONSULTA': {
    id: 'IMG-303-DR-MAURICIO-GALINDO-CONSULTA',
    label: 'Retrato para Reserva de Citas: Dr. Mauricio Benjamín Galindo López',
    domain: 'doctor',
    status: 'active',
    primarySrc: '/images/doctor/official/mauricio-consultation-2026.webp',
    webpSrc: '/images/doctor/official/mauricio-consultation-2026.webp',
    pngSrc: '/images/doctor/official/mauricio-consultation-2026.png',
    fallbackSrc: '/images/doctor/official/mauricio-consultation-2026.png',
    alt: 'Dr. Mauricio Benjamín Galindo López con uniforme clínico azul y estetoscopio',
    width: 1122,
    height: 1402,
    aspectRatio: '4:5',
    objectFit: 'cover',
    desktopPosition: 'object-[center_20%]',
    mobilePosition: 'object-[center_20%]',
    renderedLocations: ['Página /agendar', 'Componente DoctorBookingPhoto', 'Modal de Confirmación'],
    notesForCodex: 'Transmite cercanía y rigor profesional para pacientes que solicitan cita.',
  },

  'IMG-304-DR-MAURICIO-GALINDO-INSTRUCTOR': {
    id: 'IMG-304-DR-MAURICIO-GALINDO-INSTRUCTOR',
    label: 'Retrato Oficial del Instructor: Dr. Mauricio Benjamín Galindo López',
    domain: 'doctor',
    status: 'active',
    primarySrc: '/images/doctor/official/mauricio-instructor-user-provided-2026.webp',
    webpSrc: '/images/doctor/official/mauricio-instructor-user-provided-2026.webp',
    pngSrc: '/images/doctor/official/mauricio-instructor-user-provided-2026.png',
    fallbackSrc: '/images/doctor/official/mauricio-instructor-user-provided-2026.png',
    alt: 'Retrato oficial del Dr. Mauricio Benjamín Galindo López como instructor de la Academia Salud Forte',
    width: 1254,
    height: 1254,
    aspectRatio: '1:1',
    objectFit: 'cover',
    desktopPosition: 'object-[center_20%]',
    mobilePosition: 'object-[center_20%]',
    renderedLocations: [
      'Componente InstructorAvatar (compact y featured)',
      'Tarjetas de Masterclass (avatar de autor)',
      'Detalle de curso /academia/[slug]',
    ],
    notesForCodex: 'Formato cuadrado de alta resolución para insignias de autor y sección de instructor oficial.',
  },

  'IMG-305-DR-MAURICIO-GALINDO-PODCAST-STUDIO': {
    id: 'IMG-305-DR-MAURICIO-GALINDO-PODCAST-STUDIO',
    label: 'Retrato en Estudio de Grabación Salud Forte',
    domain: 'doctor',
    status: 'active',
    primarySrc: '/images/doctor/professional/mauricio-podcast-studio-navy-v1.webp',
    webpSrc: '/images/doctor/professional/mauricio-podcast-studio-navy-v1.webp',
    pngSrc: '/images/doctor/professional/mauricio-podcast-studio-navy-v1.png',
    alt: 'Dr. Mauricio Benjamín Galindo López en el estudio del podcast Salud Forte',
    width: 1200,
    height: 800,
    aspectRatio: '3:2',
    objectFit: 'cover',
    renderedLocations: ['Galería de estudio y material promocional'],
    notesForCodex: 'Ambiente de estudio con tonos azul marino institucional (#07182A).',
  },

  // ==========================================================================
  // RANGO IMG-600 a IMG-699: PODCAST SALUD FORTE Y CONTENIDO EDITORIAL
  // ==========================================================================
  'IMG-601-PODCAST-PHONE-MOCKUP': {
    id: 'IMG-601-PODCAST-PHONE-MOCKUP',
    label: 'Composición de Mano y Teléfono con la App de Spotify Salud Forte',
    domain: 'podcast',
    status: 'active',
    primarySrc: '/images/podcast/official/salud-forte-home-phone-final-2026.webp',
    webpSrc: '/images/podcast/official/salud-forte-home-phone-final-2026.webp',
    pngSrc: '/images/podcast/official/salud-forte-home-phone-final-2026.png',
    alt: 'Mano sosteniendo un smartphone con el podcast Salud Forte abierto en Spotify',
    width: 1812,
    height: 868,
    aspectRatio: '2.09:1',
    objectFit: 'cover',
    renderedLocations: ['Sección Podcast en Home', 'Página completa /podcast'],
    notesForCodex: 'Composición con fondo transparente y sombreado cinemático de alta gama. Para actualizar la captura de pantalla del teléfono, actualizar este archivo.',
  },

  'IMG-602-PODCAST-EDITORIAL-BG': {
    id: 'IMG-602-PODCAST-EDITORIAL-BG',
    label: 'Fondo Cinemático para Sección de Podcast',
    domain: 'podcast',
    status: 'active',
    primarySrc: '/images/podcast/official/salud-forte-home-phone-final-2026.webp',
    webpSrc: '/images/podcast/official/salud-forte-home-phone-final-2026.webp',
    pngSrc: '/images/podcast/official/salud-forte-home-phone-final-2026.png',
    fallbackSrc: '/images/podcast/official/salud-forte-home-phone-final-2026.png',
    alt: 'Composición editorial de Salud Forte con un teléfono mostrando el podcast en Spotify',
    width: 1812,
    height: 868,
    aspectRatio: '2.09:1',
    objectFit: 'cover',
    renderedLocations: ['Fondo opcional de sección de podcast'],
    notesForCodex: 'Se activa mediante el flag podcastHeroBackground.mode = "photographic-background" en salud-forte-feature.tsx.',
  },

  // ==========================================================================
  // RANGO IMG-900 a IMG-999: MARCADORES TEMPORALES (PLACEHOLDERS PENDIENTES)
  // ==========================================================================
  'IMG-901-PENDIENTE-MASTERCLASS-GLUCOSA': {
    id: 'IMG-901-PENDIENTE-MASTERCLASS-GLUCOSA',
    label: 'Portada Masterclass: Monitorea tu glucosa con confianza',
    domain: 'masterclass',
    status: 'active',
    primarySrc: '/images/masterclasses/official/glucosa-2026.webp',
    webpSrc: '/images/masterclasses/official/glucosa-2026.webp',
    pngSrc: '/images/masterclasses/official/glucosa-2026.png',
    fallbackSrc: '/images/masterclasses/official/glucosa-2026.png',
    alt: 'Monitorea tu glucosa con confianza - Academia Salud Forte',
    width: 1586,
    height: 992,
    aspectRatio: '8:5',
    objectFit: 'cover',
    renderedLocations: ['Catálogo /academia', 'Ficha /academia/monitorea-tu-glucosa-con-confianza'],
    notesForCodex: 'Portada final proporcionada por el Dr. Mauricio; normalizada a 8:5 sin recortar el texto.',
  },

  'IMG-902-PENDIENTE-MASTERCLASS-PRESION': {
    id: 'IMG-902-PENDIENTE-MASTERCLASS-PRESION',
    label: 'Portada Masterclass: Presión arterial, mídela bien en casa',
    domain: 'masterclass',
    status: 'active',
    primarySrc: '/images/masterclasses/official/presion-arterial-2026.webp',
    webpSrc: '/images/masterclasses/official/presion-arterial-2026.webp',
    pngSrc: '/images/masterclasses/official/presion-arterial-2026.png',
    fallbackSrc: '/images/masterclasses/official/presion-arterial-2026.png',
    alt: 'Presión arterial: mídela bien en casa - Academia Salud Forte',
    width: 1586,
    height: 992,
    aspectRatio: '8:5',
    objectFit: 'cover',
    renderedLocations: ['Catálogo /academia', 'Ficha /academia/presion-arterial-midela-bien-en-casa'],
    notesForCodex: 'Portada final proporcionada por el Dr. Mauricio; normalizada a 8:5 sin recortar el título.',
  },

  'IMG-903-PENDIENTE-MASTERCLASS-SUENO': {
    id: 'IMG-903-PENDIENTE-MASTERCLASS-SUENO',
    label: 'Portada Masterclass: Dormir mejor, energía, enfoque y rendimiento',
    domain: 'masterclass',
    status: 'active',
    primarySrc: '/images/masterclasses/official/dormir-mejor-2026.webp',
    webpSrc: '/images/masterclasses/official/dormir-mejor-2026.webp',
    pngSrc: '/images/masterclasses/official/dormir-mejor-2026.png',
    fallbackSrc: '/images/masterclasses/official/dormir-mejor-2026.png',
    alt: 'Dormir mejor: energía, enfoque y rendimiento - Academia Salud Forte',
    width: 1586,
    height: 992,
    aspectRatio: '8:5',
    objectFit: 'cover',
    renderedLocations: ['Catálogo /academia', 'Ficha /academia/dormir-mejor-energia-enfoque-y-rendimiento'],
    notesForCodex: 'Portada final proporcionada por el Dr. Mauricio; normalizada a 8:5 sin recortar el título.',
  },

  'IMG-920-PENDIENTE-PRODUCTO-VITAMINA-D3': {
    id: 'IMG-920-PENDIENTE-PRODUCTO-VITAMINA-D3',
    label: 'Marcador Temporal: Producto Vitamina D3 gotas sublinguales',
    domain: 'placeholder',
    status: 'pending',
    primarySrc: '/images/products/placeholder_d3.webp',
    fallbackSrc: '/images/products/placeholder_d3.svg',
    alt: 'Fotografía de empaque pendiente de autorización para Vitamina D3',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    objectFit: 'contain',
    renderedLocations: ['Catálogo /tienda', 'Ficha /tienda/vitamina-d3-...'],
    notesForCodex: 'Producto en evaluación de proveedor y dosificación clínica. Conserva el marcador estético de empaque pendiente.',
  },
};

/**
 * Función de ayuda: obtiene la configuración de una imagen por su ID único
 */
export function getImageById(id: string): ImageItem | undefined {
  return IMAGE_REGISTRY[id];
}

/**
 * Función de ayuda: obtiene la URL principal para renderizar
 */
export function getImageSrc(id: string): string {
  const item = IMAGE_REGISTRY[id];
  if (!item) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[ImageRegistry] Advertencia: ID de imagen desconocido "${id}".`);
    }
    return '';
  }
  return item.primarySrc;
}

/**
 * Función de ayuda: obtiene el texto alternativo accesible
 */
export function getImageAlt(id: string): string {
  const item = IMAGE_REGISTRY[id];
  return item ? item.alt : '';
}

/**
 * Obtiene todas las imágenes pertenecientes a un dominio específico
 */
export function getImagesByDomain(domain: ImageDomain): ImageItem[] {
  return Object.values(IMAGE_REGISTRY).filter((img) => img.domain === domain);
}

/**
 * Obtiene todas las imágenes según su estado
 */
export function getImagesByStatus(status: ImageStatus): ImageItem[] {
  return Object.values(IMAGE_REGISTRY).filter((img) => img.status === status);
}

/**
 * Obtiene la lista completa de todas las imágenes registradas
 */
export function getAllImages(): ImageItem[] {
  return Object.values(IMAGE_REGISTRY);
}
