# Arquitectura y Estructura del Proyecto · Plataforma Médica Dr. Mauricio Galindo

Este documento detalla la estructura física y lógica del proyecto, los límites de responsabilidad de cada módulo, la estrategia de gestión de recursos visuales y las directrices ético-clínicas incorporadas en el diseño del software.

---

## 1. Visión General de la Arquitectura

La plataforma es una aplicación web full-stack de alto rendimiento construida sobre:
- **Frontend:** React 18 con TypeScript y Vite.
- **Backend / Proxy:** Node.js con Express (`server.ts`), que sirve tanto la API interna como los activos estáticos y middleware en desarrollo.
- **Estilos:** Tailwind CSS con tokens médicos de alta gama (paleta Obsidian, Champagne/Oro `#B39A6A`, pizarra médica y marfil).
- **Animaciones:** Framer Motion / Motion.
- **Iconografía:** Lucide React.
- **Persistencia en Memoria:** Base de datos en memoria (`lib/academy/db.ts`) con auditoría de accesos y tipado estricto.

---

## 2. Árbol de Directorios y Responsabilidades

```
plataforma-medica/
├── config/                     # Configuraciones maestras del sitio
│   └── site-images.ts          # Mapeo de slots visuales hacia el registro unificado
│
├── components/                 # Componentes UI organizados por dominio
│   ├── academia/               # Masterclasses, reproductor, perfiles del instructor
│   │   ├── instructor-portrait.tsx  # Fotografía oficial del Dr. Mauricio Galindo
│   │   ├── masterclass-card.tsx     # Tarjeta de masterclass con data-image-id
│   │   ├── video-player.tsx         # Reproductor adaptativo con controles
│   │   └── ...
│   ├── site/                   # Componentes transversales del sitio institucional
│   │   ├── managed-image.tsx        # Renderizador central con soporte imageId y data-image-id
│   │   ├── header.tsx               # Navegación global con branding
│   │   ├── footer.tsx               # Pie de página y descargos legales obligatorios
│   │   ├── salud-forte-feature.tsx  # Sección visual de podcast y mockup móvil
│   │   └── ...
│   ├── shopify/                # Carrito de compra, checkout y modales comerciales
│   │   ├── cart-drawer.tsx          # Cajón lateral del carrito con miniaturas
│   │   └── ...
│   ├── tienda/                 # Catálogo y fichas técnicas de suplementos
│   │   ├── product-card.tsx         # Tarjeta de producto con etiquetado regulatorio
│   │   ├── regulatory-badge.tsx     # Insignias de cumplimiento COFEPRIS / etiquetado
│   │   └── ...
│   └── ui/                     # Primitivas de diseño atómicas (botones, inputs, badges)
│
├── lib/                        # Lógica de negocio, base de datos y utilidades
│   ├── academy/                # Dominio de Academia Médica
│   │   ├── db.ts               # Base de datos en memoria para cursos y auditorías
│   │   ├── types.ts            # Tipado TypeScript estricto de cursos y usuarios
│   │   ├── auth-service.ts     # Control de sesiones, tokens de acceso y YouTube embed
│   │   └── instructor.ts       # Datos curriculares verificados del Dr. Mauricio Galindo
│   ├── images/                 # Dominio de Medios y Recursos Visuales
│   │   └── registry.ts         # Registro central canónico de imágenes (IMG-XXX)
│   └── shopify/                # Dominio de Suplementos y Farmacia
│       ├── products-db.ts      # Catálogo de productos con reglas de compliance médico
│       └── ...
│
├── public/                     # Activos estáticos públicos servidos por Vite/Express
│   ├── images/
│   │   ├── brand/              # Logotipos y carátulas de marca
│   │   ├── doctor/             # Retratos oficiales del Dr. Mauricio Benjamín Galindo López
│   │   ├── masterclasses/      # Portadas editoriales (WebP, PNG y SVGs vectoriales)
│   │   ├── podcast/            # Mockups de teléfono, fondo editorial y carátulas
│   │   ├── products/           # Fotografía de producto y placeholders vectoriales
│   │   └── platforms/          # Logos SVG oficiales (Spotify, Apple Podcasts, YouTube)
│   └── favicon.ico
│
├── src/
│   ├── assets/images/          # Archivos maestros originales de alta resolución (Backups)
│   ├── index.css               # Estilos globales con Tailwind CSS
│   └── main.tsx                # Entrada de cliente React
│
├── docs/                       # Documentación técnica obligatoria para desarrolladores y Codex
│   ├── PROJECT-STRUCTURE.md    # Este documento
│   ├── IMAGE-INVENTORY.md      # Inventario exhaustivo de cada imagen del sistema
│   ├── IMAGE-MAP-BY-PAGE.md    # Mapeo de selectores y componentes por pantalla
│   ├── REPLACE-IMAGES-WITH-CODEX.md # Guía para el agente Codex
│   ├── ENVIRONMENT-VARIABLES.md# Especificación de variables de entorno
│   └── CHANGELOG-REORGANIZATION.md # Historial de refactorización segura
│
├── server.ts                   # Servidor backend Express con Vite middleware integrado
├── package.json                # Dependencias y scripts de compilación
├── tsconfig.json               # Configuración de compilación TypeScript estricta
└── metadata.json               # Metadatos de la aplicación para AI Studio
```

---

## 3. Separación de Responsabilidades y Dominios

### A. Dominio de Academia (`lib/academy/` + `components/academia/`)
- **Objetivo:** Gestión del contenido formativo (Masterclasses médicas, video-lecciones, material complementario descargable y control de acceso estudiantil).
- **Aislamiento Ético:** El contenido formativo nunca diagnostica de forma individualizada. Cada curso incluye advertencias sanitarias explícitas en `disclaimerShort` y `disclaimerLong`.
- **Instructor Oficial:** Los datos del docente (`OFFICIAL_INSTRUCTOR`) provienen de `lib/academy/instructor.ts` y reflejan con rigor la cédula y credenciales médicas del Dr. Mauricio Galindo.

### B. Dominio de Tienda / Suplementos (`lib/shopify/` + `components/tienda/`)
- **Objetivo:** Catálogo clínico de formulaciones y suplementos alimenticios.
- **Compliance Regulatorio:** Todo producto posee un estado de conformidad (`complianceStatus`). Los productos sin empaque físico revisado o sin documentación de importación oficial se mantienen en estado `draft`, mostrando un marcador gráfico de "Pendiente de revisión clínica" para proteger la reputación médica de la plataforma.

### C. Dominio de Medios y Recursos Visuales (`lib/images/` + `config/site-images.ts` + `components/site/managed-image.tsx`)
- **Principio de Identificación Única:** Cada fotografía tiene un identificador inmutable (`IMG-XXX`).
- **Inyección DOM:** Cada imagen renderizada a través de `ManagedImage` o componentes derivados inyecta el atributo HTML `data-image-id="IMG-XXX"`. Esto permite inspección y reemplazo automatizado por agentes de IA como Codex.

---

## 4. Estándares de Código y Calidad
1. **Tipado Estricto:** Toda propiedad debe estar tipada en `types.ts`. Prohibido el uso indiscriminado de `any`.
2. **Imágenes Responsivas:** Empleo de etiquetas `<picture>` con fallback WebP/PNG y dimensiones explícitas (`width` y `height`) para prevenir Cumulative Layout Shift (CLS).
3. **Seguridad:** Los secretos y tokens de acceso nunca se exponen al cliente. Las rutas del backend en `server.ts` gestionan la persistencia en sesión y las auditorías de acceso.
