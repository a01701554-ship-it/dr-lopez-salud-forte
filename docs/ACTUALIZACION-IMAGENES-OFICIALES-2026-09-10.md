# Actualización de imágenes oficiales — 10 de septiembre de 2026

Este registro documenta la sustitución completa de imágenes realizada en las
pantallas solicitadas: Inicio, Sobre mí, Consulta/Agenda y Academia/Masterclasses.

## Retratos del Dr. Mauricio

| Ubicación | Archivo de origen | Recurso publicado |
| --- | --- | --- |
| Hero de Inicio | `DR MAU13.png` | `/images/doctor/official/mauricio-home-hero-2026.webp` |
| Inicio y página Sobre mí | `DR MAU1.png` | `/images/doctor/official/mauricio-about-2026.webp` |
| Reserva de consulta | `DR MAU2.png` | `/images/doctor/official/mauricio-consultation-2026.webp` |
| Instructor de Academia | `01_retrato_fondo_azul_marino.png` | `/images/doctor/official/mauricio-instructor-2026.webp` |

Los cuatro retratos tienen un respaldo PNG. El hero conserva su relación 3:2;
Sobre mí conserva 3:4; Consulta conserva 4:5; y el retrato de instructor conserva
1:1. Las posiciones de recorte fueron configuradas por separado para móvil y
escritorio.

## Salud Forte en la página de Inicio

La composición `imagen de telefono final.png` reemplaza el fondo y el teléfono
anteriores. Se generaron dos presentaciones:

- Escritorio: `/images/podcast/official/salud-forte-home-phone-final-2026.webp`
- Móvil: `/images/podcast/official/salud-forte-home-phone-mobile-2026.webp`

En escritorio se usa la composición panorámica completa, con el teléfono a la
derecha y el texto sobre la zona oscura izquierda. En móvil se usa un recorte
vertical dedicado debajo del contenido para que la interfaz del teléfono no se
corte ni compita con el texto.

## Portadas de Masterclasses

| Masterclass | Recurso publicado |
| --- | --- |
| Monitorea tu glucosa con confianza | `/images/masterclasses/official/glucosa-2026.webp` |
| Presión arterial: mídela bien en casa | `/images/masterclasses/official/presion-arterial-2026.webp` |
| Dormir mejor: energía, enfoque y rendimiento | `/images/masterclasses/official/dormir-mejor-2026.webp` |
| Menopausia con claridad | `/images/masterclasses/official/menopausia-con-claridad-2026.webp` |
| Estrés y tensión muscular | `/images/masterclasses/official/estres-tension-muscular-2026.webp` |
| Salud hormonal masculina | `/images/masterclasses/official/salud-hormonal-masculina-2026.webp` |
| SOP con claridad | `/images/masterclasses/official/sop-con-claridad-2026.webp` |

Las tres portadas originales en 16:9 fueron normalizadas a 1586 × 992 mediante
bandas azul marino, sin cortar títulos ni elementos clínicos. Las otras cuatro
ya tenían la relación 8:5 del catálogo. Todas cuentan con WebP optimizado y PNG
de respaldo, y se conectaron al catálogo, a la ficha individual, a la biblioteca
del alumno y al carrito mediante los datos centrales de cada curso.

## Archivos de configuración actualizados

- `config/site-images.ts`: activa los retratos oficiales en los tres slots.
- `lib/images/registry.ts`: registra rutas, dimensiones, estado y textos alternativos.
- `lib/academy/db.ts`: conecta las siete portadas y sus identificadores estables.
- `lib/academy/instructor.ts`: conecta el retrato oficial del instructor.
- `components/site/salud-forte-feature.tsx`: aplica las composiciones responsive.
- `components/site/managed-image.tsx`: usa las dimensiones reales del registro.

## Verificación final

- Compilación de producción completada correctamente.
- TypeScript completado sin errores.
- Las 12 rutas solicitadas respondieron HTTP 200.
- Los 13 recursos WebP principales respondieron HTTP 200.
- Se comprobó que cada referencia `/images/.../official/` existe y no está vacía.
- Los archivos `.webp` fueron verificados como WebP reales, no PNG renombrados.
