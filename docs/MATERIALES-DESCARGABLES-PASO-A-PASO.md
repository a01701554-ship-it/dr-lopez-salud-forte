# Materiales descargables por lección

Este procedimiento se realiza en el proyecto de Supabase
`salud-forte-produccion`. El depósito correcto es `academy-materials` y debe
permanecer privado.

## 1. Preparar el archivo

Usar un nombre corto, sin acentos, e indicar módulo y lección:

```text
M01-L01-guia-de-estudio.pdf
M01-L02-lista-de-verificacion.pdf
M02-L01-bitacora-semanal.xlsx
```

Formatos permitidos: PDF, DOCX, XLSX, PPTX, JPG y PNG. El tamaño máximo por
archivo es 50 MB.

## 2. Identificar el curso y la lección

1. Abrir **Table Editor** → `lessons`.
2. Buscar la lección por su `slug` o `title`.
3. Confirmar el módulo y la masterclass mediante `module_id` y
   `masterclass_id`.
4. Copiar el valor completo de `id`. Este será el `lesson_id` del material.

No usar el ID de la masterclass ni el del módulo en el campo `lesson_id`.

## 3. Subir el archivo al depósito privado

1. Abrir **Storage** → `academy-materials`.
2. Crear una carpeta con el `slug` de la masterclass.
3. Dentro, crear otra carpeta con el `slug` de la lección.
4. Abrir la carpeta de la lección y seleccionar **Upload files**.
5. Subir el archivo.
6. Copiar la ruta interna completa, sin el nombre del depósito.

Ejemplo:

```text
monitorea-tu-glucosa-con-confianza/glucosa-es-un-dato/M01-L01-guia-de-estudio.pdf
```

No usar una URL pública ni anteponer `academy-materials/`.

## 4. Relacionar el archivo con la lección

1. Abrir **Table Editor** → `lesson_attachments`.
2. Seleccionar **Insert row**.
3. Completar:

```text
id                 = dejar vacío; Supabase lo genera
lesson_id          = UUID copiado de la tabla lessons
title              = Guía de estudio — Módulo 1.pdf
storage_path       = ruta interna exacta del paso anterior
mime_type          = application/pdf
file_size_bytes    = opcional; puede quedar vacío
position           = 1 para el primer archivo, 2 para el segundo, etc.
status             = draft mientras se revisa; published cuando esté listo
created_at         = dejar el valor automático
updated_at         = dejar el valor automático
```

Valores de `mime_type` más comunes:

```text
PDF   application/pdf
DOCX  application/vnd.openxmlformats-officedocument.wordprocessingml.document
XLSX  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
PPTX  application/vnd.openxmlformats-officedocument.presentationml.presentation
JPG   image/jpeg
PNG   image/png
```

El campo `title` debe terminar con la extensión correcta para que el archivo
descargado conserve su formato.

## 5. Publicar y comprobar

1. Cambiar `status` a `published` cuando el documento sea definitivo.
2. Abrir la lección en el sitio público con una cuenta autorizada.
3. Seleccionar **Materiales descargables**.
4. Confirmar que aparecen el título, formato y botón **Descargar**.
5. Descargar el archivo y abrirlo.
6. Repetir la prueba con una cuenta sin acceso: la descarga debe quedar
   bloqueada.

## Reglas importantes

- No volver público el depósito `academy-materials`.
- No compartir enlaces de Storage manualmente con alumnos.
- No subir expedientes, estudios clínicos ni datos personales de pacientes.
- Para sustituir un documento, subir el nuevo archivo, actualizar
  `storage_path` y probarlo antes de borrar el anterior.
- Un mismo archivo que deba aparecer en dos lecciones necesita dos registros
  en `lesson_attachments`, uno con cada `lesson_id`.
