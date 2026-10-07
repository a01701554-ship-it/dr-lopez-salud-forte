# Guía de Configuración de Correos Transaccionales en Supabase
## Proyecto: Dr. Mauricio Benjamín Galindo López / Salud Forte

Esta guía documenta paso a paso cómo actualizar las plantillas de correo de **Confirmación de Cuenta** y **Recuperación de Contraseña** en el panel de control de Supabase para la plataforma médica de Salud Forte, garantizando una identidad visual sobria, profesional, en español y sin textos genéricos en inglés.

---

## 1. Ubicación de los Archivos en el Repositorio

Los archivos HTML completos y optimizados para clientes de correo se encuentran listos para copiar y pegar en:

| Plantilla | Archivo en el Repositorio | Asunto Oficial |
| :--- | :--- | :--- |
| **Confirmación de registro** | `supabase/templates/confirm-signup.html` | `Confirma tu correo electrónico \| Salud Forte` |
| **Recuperación de contraseña** | `supabase/templates/reset-password.html` | `Restablece tu contraseña \| Salud Forte` |

*(También disponibles de respaldo en la carpeta `email_templates/`).*

---

## 2. Configuración de URLs en el Panel de Supabase

Antes de probar los correos, es indispensable verificar que Supabase conozca las rutas de retorno autorizadas para que los enlaces redirijan de forma segura al usuario.

1. Inicia sesión en el panel de **[Supabase](https://supabase.com/dashboard)** y entra a tu proyecto.
2. En el menú lateral izquierdo, ve a **Authentication** (ícono de candado o usuarios) y selecciona **URL Configuration**.
3. **Site URL (URL del Sitio):**
   - Coloca la URL principal de producción de tu dominio médico (por ejemplo: `https://tudominio.com`).
4. **Redirect URLs (URLs de Redirección Permitidas):**
   - Agrega las rutas exactas donde la aplicación recibe los tokens y códigos de verificación:
     - `https://tudominio.com/auth/callback`
     - `https://tudominio.com/cuenta/reset-password`
     - `https://tudominio.com/cuenta/verificar-correo`
     - `https://tudominio.com/mi-cuenta/masterclasses`
   - *Para entornos de desarrollo o vistas previas:*
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/cuenta/reset-password`
5. Haz clic en **Save**.

---

## 3. Actualización de la Plantilla de Confirmación de Cuenta

1. En el panel de Supabase, en el menú **Authentication**, dirígete a **Email Templates**.
2. Haz clic sobre la pestaña o tarjeta **Confirm signup** (Confirmación de registro).
3. Modifica los siguientes campos:
   - **Subject (Asunto):**
     ```text
     Confirma tu correo electrónico | Salud Forte
     ```
   - **Message Body (Cuerpo del mensaje):**
     - Borra todo el contenido en inglés que viene por defecto.
     - Abre el archivo `supabase/templates/confirm-signup.html` de este proyecto.
     - Copia todo su contenido (desde `<!DOCTYPE html>` hasta `</html>`).
     - Pégalo directamente en el editor de código HTML de Supabase.
4. Haz clic en **Save changes** (Guardar cambios).

---

## 4. Actualización de la Plantilla de Recuperación de Contraseña

1. En el panel de Supabase, dentro de **Authentication** -> **Email Templates**.
2. Haz clic sobre la pestaña o tarjeta **Reset password** (Recuperación de contraseña).
3. Modifica los siguientes campos:
   - **Subject (Asunto):**
     ```text
     Restablece tu contraseña | Salud Forte
     ```
   - **Message Body (Cuerpo del mensaje):**
     - Borra todo el contenido anterior.
     - Abre el archivo `supabase/templates/reset-password.html` de este proyecto.
     - Copia todo su contenido (desde `<!DOCTYPE html>` hasta `</html>`).
     - Pégalo directamente en el editor de código HTML de Supabase.
4. Haz clic en **Save changes** (Guardar cambios).

---

## 5. Configuración del Remitente y Servidor SMTP Oficial

Por defecto, Supabase incluye un servicio de prueba interno con un límite estricto (30 correos por hora) que envía desde una dirección genérica de supabase.co. Para producción, es prioritario configurar tu propio proveedor SMTP (como Resend, SendGrid, Amazon SES o Postmark):

1. En **Authentication** -> **Email Settings** / **SMTP Settings**:
   - Activa la casilla **Enable Custom SMTP**.
   - **Sender Name (Nombre del remitente):**
     ```text
     Dr. Mauricio Galindo | Salud Forte
     ```
   - **Sender Email (Correo del remitente):**
     Utiliza un correo corporativo verificado con tu dominio (por ejemplo: `contacto@tudominio.com` o `notificaciones@tudominio.com`).
   - Ingresa los datos de tu servidor SMTP (Host, Port, User, Password).
2. Guarda los cambios.

---

## 6. Lista de Verificación y Pruebas (Checklist)

Una vez aplicadas las plantillas:

- [ ] **Registro de prueba:** Entra a `/cuenta/registro` e inscríbete con un correo de prueba.
- [ ] **Recepción:** Comprueba en tu bandeja de entrada que el correo llegue con el asunto `Confirma tu correo electrónico | Salud Forte`.
- [ ] **Visualización:** Verifica que la tarjeta se muestre en fondo marfil, cabecera azul marino con texto dorado/blanco, tipografía legible y sin elementos rotos.
- [ ] **Activación:** Haz clic en **CONFIRMAR MI CORREO** y confirma que redirige correctamente a `/auth/callback` y valida la cuenta hacia tu panel.
- [ ] **Recuperación:** Ve a `/cuenta/recuperar-contrasena`, ingresa tu correo y solicita el restablecimiento.
- [ ] **Enlace de seguridad:** Comprueba que el correo llegue con el asunto `Restablece tu contraseña | Salud Forte` y que el botón **RESTABLECER CONTRASEÑA** abra `/cuenta/reset-password`.
- [ ] **Actualización de clave:** Ingresa una nueva contraseña y verifica que puedas iniciar sesión inmediatamente con las nuevas credenciales.

---

## 7. Advertencias Importantes de Seguridad

1. **Variable dinámica `{{ .ConfirmationURL }}`:**
   - **NUNCA** sustituyas `{{ .ConfirmationURL }}` por un enlace fijo, una IP o un dominio manual. Supabase inyecta en esa variable el token criptográfico seguro de un solo uso de cada usuario.
2. **Secretos y Llaves:**
   - Nunca expongas la `SUPABASE_SERVICE_ROLE_KEY` ni credenciales SMTP en el cliente, en repositorios públicos ni dentro del HTML de los correos.
3. **Vigencia:**
   - Los enlaces de confirmación y recuperación tienen un tiempo de expiración regulado directamente en la configuración de seguridad de tu proyecto Supabase (por defecto 24 horas o 3600 segundos).
