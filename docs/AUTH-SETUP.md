# Guía de Configuración e Integración de Autenticación Supabase - Salud Forte

Esta documentación detalla la arquitectura, configuración y procedimientos necesarios para operar el sistema de autenticación de Salud Forte impulsado por Supabase Auth.

---

## 1. Arquitectura de Seguridad y Roles

Salud Forte utiliza un modelo de control de acceso basado en roles (RBAC) centralizado exclusivamente en la tabla `public.profiles` de PostgreSQL en Supabase.

### Roles Permitidos
Existen exactamente **tres roles** dentro de la plataforma:
- `CUSTOMER`: Alumnos y clientes de la tienda/academia (Rol predeterminado).
- `INSTRUCTOR`: Docentes y profesionales de la salud colaboradores.
- `ADMIN`: Administrador médico principal (Dr. Mauricio Galindo López).

### Principios de Seguridad
1. **Source of Truth Única**: El rol de un usuario radica en el campo `profiles.role`. Los datos guardados en `user_metadata` o parámetros del cliente son ignorados por el backend.
2. **Asignación Automática**: Un disparador de base de datos (`handle_new_user`) se ejecuta en el esquema `auth.users` ante cualquier registro. Todo usuario registrado públicamente recibe automáticamente el rol `CUSTOMER`.
3. **Privilegios Administrativos Elevados**: Ningún registro público ni solicitud HTTP de usuario puede establecer o modificar roles a `ADMIN` o `INSTRUCTOR`. La elevación de roles debe realizarse directamente en la base de datos o mediante scripts con la llave de servicio de Supabase (`service_role`).
4. **Validación de Token Bearer JWT**: El backend verifica cada solicitud protegida (`/api/academia/*` y `/api/admin/*`) mediante `supabase.auth.getUser(token)`, comprobando la validez del JWT nativo de Supabase Auth.

---

## 2. Aplicación de la Migración SQL en Supabase

Antes de iniciar el sistema por primera vez en un proyecto nuevo de Supabase, ejecuta la migración ubicada en:
`/supabase/migrations/20260910_create_profiles_schema.sql`

### Pasos para aplicar mediante la interfaz web de Supabase:
1. Inicia sesión en [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecciona tu proyecto de Salud Forte.
3. Ve a **SQL Editor** en el menú lateral.
4. Crea una nueva consulta ("New query").
5. Copia y pega todo el contenido de `20260910_create_profiles_schema.sql`.
6. Haz clic en **Run**.

La migración es completamente idempotente y:
- Crea la extensión `pgcrypto` para la generación de UUIDs.
- Define el tipo ENUM `user_role` (`CUSTOMER`, `INSTRUCTOR`, `ADMIN`).
- Crea la tabla `public.profiles` con restricciones de integridad y campos de consentimiento (`terms_accepted_at`, `marketing_consent`).
- Configura Row Level Security (RLS) con políticas estrictas de lectura y actualización.
- Crea la función y disparador `handle_new_user()` que auto-puebla el perfil en `public.profiles` ignorando cualquier `role` en la carga útil inicial.

---

## 3. Configuración de Variables de Entorno

Asegúrate de contar con las siguientes variables en tu entorno de producción o archivo `.env.local`:

```env
# URL de la API de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<TU-PROYECTO>.supabase.co

# Llave Anónima de Supabase (Pública, segura para el navegador)
NEXT_PUBLIC_SUPABASE_ANON_KEY=<TU-LLAVE-PUBLICA-O-ANON>

# Llave de Servicio / Admin de Supabase (PRIVADA - NUNCA expuesta al cliente).
# No es necesaria para el acceso normal a lecciones ni para Cloudflare Stream.
SUPABASE_SERVICE_ROLE_KEY=<SOLO-SI-UN-PROCESO-ADMINISTRATIVO-SEPARADO-LA-REQUIERE>

# URL pública de la aplicación para redirecciones de correo
NEXT_PUBLIC_SITE_URL=https://saludforte.com
```

---

## 4. Configuración de Correo Electrónico y Confirmación

Para que los correos de confirmación de registro y recuperación de contraseña funcionen correctamente en Supabase:

1. Ve a **Authentication** -> **URL Configuration** en Supabase Dashboard.
2. Configura **Site URL**: `https://saludforte.com` (o el dominio activo de tu servidor).
3. Agrega en **Redirect URLs**:
   - `https://saludforte.com/cuenta/verificar-correo`
   - `https://saludforte.com/cuenta/reset-password`
   - `https://saludforte.com/cuenta/iniciar-sesion`
   - `http://localhost:3000/*` (Para desarrollo local)

4. Configura el proveedor SMTP personalizado en **Authentication** -> **Email Settings**:
   - Desactiva el servidor SMTP predeterminado de prueba de Supabase (que tiene un límite de 3 correos por hora).
   - Configura tus credenciales SMTP de producción (Resend, SendGrid, Amazon SES o Google Workspace).
   - Configura el remitente oficial: `Dr. Mauricio Galindo | Salud Forte <contacto@saludforte.com>`.

---

## 5. Promoción de Usuario Administrador (Dr. Mauricio Galindo)

Una vez que el Dr. Mauricio Galindo complete su registro inicial a través del formulario de la plataforma, un administrador con acceso a la base de datos puede elevar su rol a `ADMIN` ejecutando la siguiente consulta en el Editor SQL:

```sql
-- Elevar al Dr. Mauricio Galindo a Administrador
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'dr.mauricio.galindo@saludforte.com';
```

Alternativamente, el script administrativo de backend utilizará `supabaseServerAuth` con la llave de servicio (`service_role`) para promover usuarios sin interacción del cliente.

---

## 6. Verificación del Flujo de Autenticación

El sistema ha sido probado e inspeccionado minuciosamente:
- **Registro**: `/cuenta/registro` -> Envía enlace de confirmación oficial de Supabase.
- **Inicio de Sesión**: `/cuenta/iniciar-sesion` -> Obtiene tokens JWT (`access_token` y `refresh_token`), los almacena de forma segura en almacenamiento persistente y sincroniza el perfil desde `public.profiles`.
- **Acceso a Masterclasses**: `/academia/mis-masterclasses` -> Valida el Bearer JWT en `/api/academia/my-library`.
- **Panel Administrativo**: `/admin/academia` -> Exige que el JWT corresponda a un usuario con rol `ADMIN` o `INSTRUCTOR` verificado en la tabla `profiles`.
