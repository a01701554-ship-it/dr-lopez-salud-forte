# Mapa de Imágenes por Pantalla y Componente · Plataforma Médica

Este mapa describe con precisión quirúrgica en qué vistas, componentes y selectores del DOM se encuentra cada recurso visual del proyecto. Permite localizar de forma inmediata cualquier fotografía y verificar su comportamiento responsivo.

---

## 1. Página de Inicio (Home / Landing Page)

**Ruta:** `/`  
**Archivo Principal:** `src/App.tsx` (cuando la ruta activa es `'home'`)

### 1.1. Cabecera y Marca Global (Header)
- **Componente:** `components/site/header.tsx`
- **Selector DOM:** `header nav a[data-image-id="IMG-001-LOGO-SALUD-FORTE"]`
- **ID de Imagen:** `IMG-001-LOGO-SALUD-FORTE`
- **Renderizado:** Visible en todos los dispositivos (móvil y escritorio). Logotipo de 40x40 px con texto institucional adyacente.

### 1.2. Sección Hero Principal (Dr. Mauricio Galindo)
- **Componente:** `components/site/doctor-hero.tsx` (o `components/site/managed-image.tsx`)
- **Selector DOM:** `[data-image-id="IMG-301-DR-MAURICIO-HERO"]`
- **ID de Imagen:** `IMG-301-DR-MAURICIO-HERO`
- **Comportamiento Responsivo:**
  - En pantallas `< 1024px` (móvil y tablet): Imagen centrada en la parte superior o apilada con altura máxima controlada.
  - En pantallas `≥ 1024px` (escritorio): Columna derecha con recorte vertical 6:7, iluminación de estudio y sombra de baja opacidad.

### 1.3. Sección de Trayectoria y Consulta (About / Credenciales)
- **Componente:** `components/site/doctor-about.tsx`
- **Selector DOM:** `[data-image-id="IMG-302-DR-MAURICIO-ABOUT"]`
- **ID de Imagen:** `IMG-302-DR-MAURICIO-ABOUT`
- **Detalles:** Acompaña el texto de cédula profesional, especialidad médica y filosofía clínica.

### 1.4. Módulo Destacado de Podcast SaludForte
- **Componente:** `components/site/salud-forte-feature.tsx`
- **Capa 1 (Fondo Editorial Atmosférico):**
  - Selector DOM: `section#podcast img[data-image-id="IMG-602-PODCAST-EDITORIAL-BG"]`
  - ID de Imagen: `IMG-602-PODCAST-EDITORIAL-BG`
  - Modo: Absoluto, `object-fit: cover`, atenuado con degradado radial oscuro hacia `#061522` para garantizar contraste de texto WCAG AAA.
- **Capa 2 (Maqueta de Teléfono en Mano):**
  - Selector DOM: `section#podcast [data-image-id="IMG-601-PODCAST-PHONE-MOCKUP"]`
  - ID de Imagen: `IMG-601-PODCAST-PHONE-MOCKUP`
  - Modo: Contenedor con `drop-shadow`, ancho responsivo fluido (`280px` en móvil hasta `520px` en pantallas grandes).

---

## 2. Catálogo de la Academia Médica (Masterclasses)

**Ruta:** `/academia` o `/masterclasses`  
**Componente Contenedor:** `components/academia/` + `App.tsx`

### 2.1. Tarjetas del Catálogo (Grid de Cursos)
- **Componente:** `components/academia/masterclass-card.tsx`
- **Selector DOM:** `article.group [data-image-id]` y la etiqueta `img[data-image-id]`
- **IDs Mapeados Dinámicamente:**
  - Curso Menopausia con claridad: `IMG-101-MASTERCLASS-MENOPAUSIA-PORTADA`
  - Curso Estrés y tensión muscular: `IMG-102-MASTERCLASS-ESTRES-PORTADA`
  - Curso Salud hormonal masculina: `IMG-103-MASTERCLASS-HORMONAL-PORTADA`
  - Curso SOP con claridad: `IMG-104-MASTERCLASS-SOP-PORTADA`
  - Curso Glucosa (Próximo): `IMG-901-PENDIENTE-MASTERCLASS-GLUCOSA`
  - Curso Presión arterial (Próximo): `IMG-902-PENDIENTE-MASTERCLASS-PRESION`
  - Curso Sueño y descanso (Próximo): `IMG-903-PENDIENTE-MASTERCLASS-SUENO`
- **Aspect Ratio:** Estricto `aspect-[8/5]` para evitar saltos de línea y mantener uniformidad en el grid de 3 columnas.

---

## 3. Ficha Individual de Masterclass y Aula Digital

**Ruta:** `/academia/:slug`  
**Componentes Clave:**
- `components/academia/instructor-portrait.tsx`:
  - Selector DOM (Badge compacto): `[data-image-id="IMG-304-DR-MAURICIO-GALINDO-INSTRUCTOR"]` (Diámetro 48-58px, circular).
  - Selector DOM (Sección Instructor Oficial): `section [data-image-id="IMG-304-DR-MAURICIO-GALINDO-INSTRUCTOR"]` (180-260px, esquinas redondeadas 16px).
- `components/academia/video-player.tsx`:
  - Carátula de precarga del reproductor: Toma el recurso de portada `IMG-10X` correspondiente a la masterclass activa.

---

## 4. Tienda de Suplementos Clínicos

**Ruta:** `/tienda` o `/suplementos`  
**Componente Contenedor:** `components/tienda/`

### 4.1. Fichas de Producto
- **Componente:** `components/tienda/product-card.tsx`
- **Selector DOM:** `[data-image-id]` dentro de cada tarjeta de suplemento
- **IDs de Producto:**
  - ALXFRESH Calcio D3: `IMG-201-PRODUCTO-CALCIO-D3`
  - Melatonin Max: `IMG-202-PRODUCTO-MELATONINA`
  - Centrum Men: `IMG-203-PRODUCTO-MULTIVITAMINICO`
  - Café de Hongos: `IMG-204-PRODUCTO-CAFE-HONGOS`
  - Vitamina D3 (Borrador): `IMG-920-PENDIENTE-PRODUCTO-VITAMINA-D3`

---

## 5. Componentes Globales Persistentes

### 5.1. Cajón Lateral del Carrito (Cart Drawer)
- **Componente:** `components/shopify/cart-drawer.tsx`
- **Selector DOM:** `aside [data-image-id] img`
- **Comportamiento:** Muestra la miniatura del curso (`IMG-10X`) o suplemento (`IMG-20X`) en un contenedor cuadrado de 72x72 px (`size-18`).

### 5.2. Modal de Reserva y Consulta
- **Componente:** `components/site/booking-modal.tsx`
- **Selector DOM:** `[data-image-id="IMG-303-DR-MAURICIO-BOOKING"]`
- **ID de Imagen:** `IMG-303-DR-MAURICIO-BOOKING`
- **Aspect Ratio:** Cuadrado 1:1, recortado con borde suave y sombra.
