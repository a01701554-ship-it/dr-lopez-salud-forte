# GUÍA DE REEMPLAZO DE FOTOGRAFÍAS — DR. MAURICIO GALINDO

Esta guía documenta la arquitectura centralizada para la gestión y sustitución de fotografías profesionales en el sitio web del Dr. Mauricio Benjamín Galindo López.

---

## 1. UBIACIONES FOTOGRÁFICAS PRINCIPALES (SLOTS)

El sitio cuenta con tres ubicaciones estratégicas principales:

| Slot ID | Ubicación en el Sitio | Fotografía de Referencia | Ruta Permanente en `/public` |
| :--- | :--- | :--- | :--- |
| **`homeHero`** | Portada Principal (Homepage Hero) | `DR MAU13.png` | `/public/images/doctor/dr-mauricio-hero.png` |
| **`aboutPortrait`** | Sección y Página "Sobre Mí" | `DR MAU1.png` | `/public/images/doctor/dr-mauricio-about.png` |
| **`bookingPortrait`** | Tarjeta de Reserva de Consulta | `DR MAU2.png` | `/public/images/doctor/dr-mauricio-booking.png` |

---

## 2. ACTIVACIÓN GLOBAL EN 1 SOLO PASO (RECOMENDADO)

Para activar **todas** las fotografías profesionales del Dr. Mauricio simultáneamente:

1. Abre el archivo de configuración central:
   `/config/site-images.ts`

2. Cambia el valor del interruptor global `SITE_IMAGE_MODE` de `"current"` a `"doctor"`:

```typescript
// /config/site-images.ts

// CAMBIAR DE:
export const SITE_IMAGE_MODE: SiteImageMode = "current";

// A:
export const SITE_IMAGE_MODE: SiteImageMode = "doctor";
```

¡Listo! Con este único cambio, todo el sitio actualizará sus imágenes manteniendo el diseño responsivo, alineación y optimización.

---

## 3. CAMBIO O PERSONALIZACIÓN INDIVIDUAL DE UN SLOT

Si deseas cambiar la imagen de una sola ubicación (por ejemplo, asignar `DR MAU1` a la tarjeta de reserva en lugar de `DR MAU2`), modifica la propiedad `.doctor` dentro de la configuración del slot en `/config/site-images.ts`:

```typescript
// /config/site-images.ts

export const SITE_IMAGES = {
  ...
  bookingPortrait: {
    ...
    doctor: {
      png: "/images/doctor/dr-mauricio-about.png",
      webp: "/images/doctor/dr-mauricio-about.webp",
    },
  },
};
```

---

## 4. ARCHIVOS FOTOGRÁFICOS Y RUTAS PERMANENTES

Los archivos oficiales están almacenados en el directorio público del proyecto:

- **Hero / Portada (`DR MAU13`)**:
  - `/public/images/doctor/dr-mauricio-hero.png`
  - `/public/images/doctor/dr-mauricio-hero.webp`
- **Sobre Mí (`DR MAU1`)**:
  - `/public/images/doctor/dr-mauricio-about.png`
  - `/public/images/doctor/dr-mauricio-about.webp`
- **Agendar Consulta (`DR MAU2`)**:
  - `/public/images/doctor/dr-mauricio-booking.png`
  - `/public/images/doctor/dr-mauricio-booking.webp`

---

## 5. COMPONENTE REUTILIZABLE `ManagedImage`

Todas las ubicaciones consumen el componente reutilizable `ManagedImage` (`/components/site/managed-image.tsx`), el cual garantiza:

- Carga adaptativa WebP y PNG con etiqueta `<picture>`.
- Ajuste responsivo de la posición de la imagen (`object-cover` y `object-position` adaptados a escritorio y móvil).
- Manejo de errores con fallback editorial neutro en caso de fallo de red.
- Cumplimiento estricto con las políticas de privacidad y privacidad de recursos (`referrerPolicy="no-referrer"`).
