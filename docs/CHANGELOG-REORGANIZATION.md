# Registro de Cambios y Reorganización (Changelog)

**Fecha:** 10 de Septiembre de 2026  
**Responsable:** Arquitecto de Software Senior  
**Estado de Compilación:** Aprobado (`tsc --noEmit` exitoso, `npm run build` exitoso)  
**Regresiones Visuales:** 0 (Diseño, maquetación, paleta y tipografía intactos)

---

## 1. Resumen Ejecutivo de la Intervención

Se llevó a cabo una reorganización integral y profiláctica del código fuente con el fin de:
1. Resolver todos los errores de tipado TypeScript heredados que impedían la compilación estricta.
2. Establecer un sistema unificado y canónico de gestión de imágenes identificadas por código `IMG-XXX`.
3. Inyectar trazabilidad automática mediante atributos `data-image-id` en el DOM para permitir al agente **Codex** localizar y reemplazar cualquier recurso con precisión absoluta.
4. Generar la documentación técnica obligatoria (`docs/`).

---

## 2. Detalle de Modificaciones por Componente y Módulo

### A. Tipado TypeScript y Modelo de Datos (`lib/academy/types.ts`)
- **UserProfile:**
  - Se añadieron campos requeridos por los flujos de registro y cumplimiento legal: `marketing_consent?: boolean`, `terms_accepted?: boolean`, `privacy_accepted?: boolean`, `last_login_at?: string`, `phone?: string`, `avatar_url?: string`.
- **Course:**
  - Se tiparon explícitamente los campos editoriales y multimedia: `imageFallback?: string`, `imageWidth?: number`, `imageHeight?: number`, `imagePosition?: string`, `imagePriority?: boolean`, `disclaimerLong?: string`, `learningOutcomes?: string[]`, `targetAudience?: string[]`, `includedFeatures?: string[]`, `faqs?: any[]`, `modules?: any[]`.
- **AccessAudit:**
  - Se flexibilizó `courseId?: string` y se ampliaron los tipos de eventos en `action` para soportar auditorías de autenticación (`login`, `logout`, `session_refresh`, `failed_attempt`, `password_reset_request`).

### B. Base de Datos en Memoria (`lib/academy/db.ts`)
- Se corrigió la asignación de instructores en la inicialización de cursos vinculando directamente a `OFFICIAL_INSTRUCTOR`.
- Se añadieron valores por defecto para todos los campos de `Course` en la función `createCourse()` para satisfacer la rigurosidad del compilador.
- Se implementó la función exportada `getRecentAudits()` requerida por el backend.

### C. Servidor Backend (`server.ts`)
- Se corrigieron los castings de tipos en la gestión de sesiones de usuario y registro de eventos de auditoría, eliminando discrepancias entre el payload de solicitud y las interfaces de base de datos.

### D. Registro Central Canónico de Imágenes (`lib/images/registry.ts`)
- **Nuevo Módulo Creado:** `lib/images/registry.ts`.
- Contiene el catálogo completo de imágenes del sistema indexado por IDs únicos (`IMG-001` a `IMG-920`), con rutas WebP, fallbacks tradicionales, dimensiones, aspect-ratios, alt texts en español y notas clínicas.
- Métodos utilitarios creados: `getImageById()`, `getImageBySlot()`, `getAllImages()`, `getImagesByCategory()`.

### E. Mapeo de Slots y Compatibilidad (`config/site-images.ts`)
- Se vinculó cada slot (`doctor_hero`, `course_menopausia`, etc.) con su correspondiente entrada en el registro canónico de `IMAGE_REGISTRY`.
- Se exportó el mapa bidireccional `SLOT_TO_IMAGE_ID_MAP` para evitar redundancias de código.

### F. Renderizador Inteligente (`components/site/managed-image.tsx`)
- Se enriqueció el componente `ManagedImage` para admitir la propiedad `imageId` (además del parámetro `slot` preexistente).
- Se inyecta de forma garantizada el atributo HTML `data-image-id="IMG-XXX"` en el elemento rendered (`<img>` y contenedor), facilitando la inspección automatizada por selectores DOM.

### G. Inyección de Trazabilidad en Componentes Específicos
- `components/site/salud-forte-feature.tsx`:
  - Capa de fondo editorial marcada con `data-image-id="IMG-602-PODCAST-EDITORIAL-BG"`.
  - Maqueta de mano con teléfono marcada con `data-image-id="IMG-601-PODCAST-PHONE-MOCKUP"`.
- `components/academia/instructor-portrait.tsx`:
  - Fotografía oficial en avatar compacto y destacado marcada con `data-image-id="IMG-304-DR-MAURICIO-GALINDO-INSTRUCTOR"`.
- `components/academia/masterclass-card.tsx`:
  - Contenedor e imagen de portada marcados dinámicamente con el `course.imageId`.
- `components/shopify/cart-drawer.tsx`:
  - Miniaturas de productos y cursos marcadas con `data-image-id`.
- `lib/shopify/products-db.ts`:
  - Se normalizaron las rutas a `/images/products/` y se asignaron los IDs canónicos correspondientes a cada producto.

### H. Activos Vectoriales Creados para Estado Pendiente
Para evitar errores de red (404) y mantener la presentación elegante en productos o cursos cuyos lotes físicos o grabaciones se encuentran en proceso, se crearon placeholders vectoriales médicos en formato SVG:
- `public/images/products/alxfresh_calcium.svg`
- `public/images/products/melatonin_max.svg`
- `public/images/products/centrum_men.svg`
- `public/images/products/mushroom_coffee.svg`
- `public/images/products/placeholder_d3.svg`
- `public/images/masterclasses/glucosa.svg`
- `public/images/masterclasses/presion.svg`
- `public/images/masterclasses/sueno.svg`

### I. Documentación Técnica Creada (`docs/`)
- `docs/PROJECT-STRUCTURE.md`
- `docs/IMAGE-INVENTORY.md`
- `docs/IMAGE-MAP-BY-PAGE.md`
- `docs/REPLACE-IMAGES-WITH-CODEX.md`
- `docs/ENVIRONMENT-VARIABLES.md`
- `docs/CHANGELOG-REORGANIZATION.md`

---

## 3. Estado de Verificación
- **Linter (`tsc --noEmit`):** 0 errores.
- **Compilación de Producción (`vite build`):** Exitosa (`dist/` generado sin advertencias).
- **Diseño Visual:** Íntegro, sin cambios en estilos Tailwind, márgenes, tipografías ni paleta de colores aprobada.
