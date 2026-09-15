# Cloudflare Stream en lecciones reales

Esta integración protege cada reproducción con dos controles consecutivos:

1. Supabase Auth identifica al usuario mediante su JWT.
2. Supabase confirma que existe un `entitlement` activo para la masterclass.
3. El servidor solicita a Cloudflare una URL firmada de corta duración.
4. El navegador recibe únicamente la URL temporal y la conserva en memoria.

La llave de Cloudflare nunca debe utilizarse en variables que empiecen con
`VITE_`, porque esas variables pueden terminar incluidas en el navegador.

## 1. Variables privadas del servidor

Configurar estas cuatro variables en el entorno de publicación:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_STREAM_API_TOKEN
CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN
SUPABASE_URL o VITE_SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY,
VITE_SUPABASE_PUBLISHABLE_KEY o VITE_SUPABASE_ANON_KEY
```

`CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN` debe tener este formato, sin `https://`
y sin diagonal al final:

```text
customer-xxxxxxxx.cloudflarestream.com
```

## 2. Migraciones de Supabase

Aplicar en orden:

1. `20260914_add_academy_tables.sql`
2. `20260914_secure_academy_entitlements.sql`

La segunda migración hace que un acceso revocado o vencido deje de autorizar
la lectura de lecciones y el guardado de avance, aunque todavía tenga el texto
`active` en otra parte del sistema.

## 3. Asociar un video con una lección

En Cloudflare, abrir el video y copiar solamente `Video ID`. No copiar el HLS,
el iframe ni un token firmado.

En Supabase, abrir `Table Editor` → `lessons` y completar:

```text
video_provider = cloudflare
video_asset_id = VIDEO_ID_COPIADO_DE_CLOUDFLARE
video_external_id = NULL
status = published
```

El `masterclass_id` de la lección debe corresponder a la masterclass que el
alumno adquirió. El `module_id` debe pertenecer a esa misma masterclass.

Para una lección de YouTube se usa:

```text
video_provider = youtube
video_asset_id = NULL
video_external_id = URL_O_ID_DE_YOUTUBE
```

## 4. Conceder acceso a un alumno

Primero localizar el UUID del usuario y el UUID de la masterclass:

```sql
SELECT id, email
FROM auth.users
WHERE lower(email) = lower('correo-del-alumno@ejemplo.com');

SELECT id, slug, title
FROM public.masterclasses
WHERE slug = 'slug-de-la-masterclass';
```

Después crear o reactivar el acceso:

```sql
INSERT INTO public.entitlements (
  user_id,
  masterclass_id,
  source,
  status,
  granted_at,
  expires_at,
  revoked_at,
  revocation_reason
)
VALUES (
  'UUID_DEL_USUARIO',
  'UUID_DE_LA_MASTERCLASS',
  'admin',
  'active',
  NOW(),
  NULL,
  NULL,
  NULL
)
ON CONFLICT (user_id, masterclass_id)
DO UPDATE SET
  status = 'active',
  granted_at = NOW(),
  expires_at = NULL,
  revoked_at = NULL,
  revocation_reason = NULL,
  updated_at = NOW();
```

Para acceso limitado, sustituir `expires_at = NULL` por una fecha futura.

## 5. Pruebas obligatorias

1. Con sesión y acceso activo: la lección y el video deben abrir.
2. Con sesión y sin acceso: debe mostrarse `Masterclass no adquirida`.
3. Con acceso vencido o revocado: debe bloquearse igual que un usuario sin acceso.
4. Sin sesión: debe solicitar inicio de sesión.
5. Al marcar la clase como terminada: debe actualizarse `lesson_progress`.
6. En las herramientas del navegador: nunca debe aparecer el API token de Cloudflare.

La antigua ruta `/mi-cuenta/prueba-video` y su endpoint temporal ya no forman
parte de la aplicación. El video de prueba puede conservarse en Cloudflare o
eliminarse desde el panel cuando deje de ser necesario.
