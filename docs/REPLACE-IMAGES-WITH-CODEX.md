# Manual de Reemplazo de Imágenes para Codex

Este protocolo establece los pasos exactos y seguros que el agente **Codex** debe seguir para actualizar o sustituir cualquier fotografía de la plataforma sin alterar la arquitectura, el diseño visual ni provocar regresiones de compilación.

---

## 1. Principio Rector

> **"Un cambio en el activo físico se registra siempre en el registro canónico y nunca de forma directa o dispersa en los componentes."**

No modifiques etiquetas `<img>` directamente en múltiples archivos JSX/TSX. Toda imagen está gobernada por:
1. El archivo físico en `public/images/`.
2. El registro canónico `lib/images/registry.ts`.
3. El mapa de slots en `config/site-images.ts`.

---

## 2. Flujo de Trabajo en 4 Pasos

### Paso 1: Localizar el ID de la Imagen
Consulta `docs/IMAGE-INVENTORY.md` o busca en el DOM el atributo `data-image-id`.
- Ejemplo: Para actualizar la portada de la masterclass de Menopausia, el ID es `IMG-101-MASTERCLASS-MENOPAUSIA-PORTADA`.
- Ejemplo: Para actualizar la foto de hero del Dr. Mauricio, el ID es `IMG-301-DR-MAURICIO-HERO`.

### Paso 2: Depositar los Nuevos Archivos en `public/images/`
Guarda la nueva imagen en la subcarpeta correspondiente con optimización WebP y PNG/JPG de respaldo:
- Formato recomendado: `.webp` para producción con un `.png` o `.jpg` para compatibilidad.
- Conservar las dimensiones recomendadas (indicadas en `docs/IMAGE-INVENTORY.md`) para evitar saltos de diseño (CLS).

### Paso 3: Actualizar el Registro Canónico (`lib/images/registry.ts`)
Abre `lib/images/registry.ts` y actualiza la entrada correspondiente al ID:

```typescript
'IMG-101-MASTERCLASS-MENOPAUSIA-PORTADA': {
  id: 'IMG-101-MASTERCLASS-MENOPAUSIA-PORTADA',
  category: 'masterclasses',
  currentSrc: '/images/masterclasses/menopausia-nueva-version.webp', // <- Actualizar aquí
  fallbackSrc: '/images/masterclasses/menopausia-nueva-version.png',
  recommendedWidth: 1586,
  recommendedHeight: 992,
  aspectRatio: '8:5',
  altText: 'Portada oficial de la masterclass Menopausia con claridad',
  description: 'Fotografía médica aprobada para curso de menopausia',
  slot: 'course_menopausia',
  status: 'production',
},
```

### Paso 4: Validar Compilación y Calidad
Ejecuta las herramientas de verificación:
1. `npm run lint` (o `tsc --noEmit`) para comprobar que no existan errores de tipos.
2. `npm run build` para validar el empaquetado de producción.
3. Comprueba que el componente mantenga el atributo `data-image-id` visible en las herramientas de desarrollo.

---

## 3. Reglas Especiales por Categoría

### A. Fotografías del Dr. Mauricio Galindo (`doctor/`)
- **Regla Ética:** Solo se permiten fotografías reales y autorizadas del Dr. Mauricio Benjamín Galindo López. Prohibido insertar modelos genéricos de stock con bata médica.
- **Encuadre:** El punto focal del rostro debe mantenerse en el tercio superior central (`object-[center_20%]`) para evitar cortes desproporcionados en pantallas móviles.

### B. Portadas de Masterclasses (`masterclasses/`)
- **Proporción Fija:** Todas las portadas deben mantener la relación de aspecto `8:5` (por ejemplo, 1586 x 992 px o 1280 x 800 px).
- **Contraste:** Los primeros 200 px en la parte inferior deben permitir la legibilidad de etiquetas de categoría y duración cuando se superpongan textos.

### C. Productos y Suplementos (`products/`)
- **Fondo:** Fondo limpio blanco o transparente neutro centrado.
- **Cumplimiento COFEPRIS:** Si la fotografía muestra una etiqueta en inglés o una dosis que exceda la normativa mexicana (por ejemplo, Melatonina > 5 mg), el producto debe permanecer con `complianceStatus: 'high_priority_review'` o `status: 'draft'` en `lib/shopify/products-db.ts` hasta contar con la autorización legal correspondiente.

---

## 4. Lista de Verificación Final para Codex
- [ ] ¿El archivo se colocó en `public/images/<carpeta>/`?
- [ ] ¿Se definió tanto la versión `.webp` como el fallback tradicional?
- [ ] ¿Se actualizó `lib/images/registry.ts`?
- [ ] ¿Se preservaron las dimensiones y el aspect-ratio requerido?
- [ ] ¿El alt text describe el contenido de forma accesible y en español?
- [ ] ¿Pasaron los comandos de compilación sin errores?
