# Guía de Variables de Entorno · Plataforma Médica

Este documento especifica exhaustivamente cada variable de entorno utilizada por la plataforma, indicando su ámbito (cliente o servidor), propósito, obligatoriedad y comportamiento de contingencia (fallback) en entornos de desarrollo local.

---

## 1. Reglas Generales de Seguridad

1. **Aislamiento de Secretos:** Las credenciales que otorgan acceso privilegiado (Service Role, API Secrets, claves privadas de firma) **nunca** deben prefijarse con `VITE_` y residen exclusivamente en el servidor (`server.ts` o microservicios backend).
2. **Exposición en Cliente:** Solo las variables con prefijo `VITE_` son empaquetadas por Vite e inyectadas al navegador. No agregues claves de pago ni tokens maestros en variables `VITE_`.
3. **Contingencia Local (Graceful Fallback):** La aplicación está programada para funcionar en modo demostración/desarrollo local cuando las variables están vacías, utilizando la base de datos en memoria (`lib/academy/db.ts`) y catálogos locales seguros.

---

## 2. Catálogo de Variables

### A. Infraestructura y Servidor

| Variable | Ámbito | Sensibilidad | Propósito | Valor por Defecto / Modo Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Servidor | Baja | Puerto de enlace del servidor Express (3000 por defecto en AI Studio Cloud Run). | `3000` |
| `NODE_ENV` | Ambos | Baja | Indica si el entorno es `development` o `production`. | `development` |
| `APP_URL` | Servidor | Media | URL canónica de la aplicación para enlaces absolutos y webhooks. | `http://localhost:3000` |
| `APP_ENCRYPTION_KEY` | Servidor | **Alta** | Clave de cifrado de 32 caracteres para cookies de sesión firmadas. | Generada temporalmente en memoria si no se define. |

---

### B. Inteligencia Artificial (Google Gemini)

| Variable | Ámbito | Sensibilidad | Propósito | Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Servidor | **Alta** | Clave para llamadas al modelo Gemini desde el servidor. | Las funciones de IA se desactivan pacíficamente sin bloquear la interfaz. |

---

### C. Base de Datos y Autenticación (Supabase)

| Variable | Ámbito | Sensibilidad | Propósito | Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Cliente/Servidor | Baja | URL del proyecto Supabase. | El sistema utiliza `lib/academy/db.ts` (Mock DB en memoria). |
| `VITE_SUPABASE_ANON_KEY` | Cliente | Media | Llave anónima pública con políticas de RLS habilitadas. | Modo demostración local activo. |
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor | **Crítica** | Llave administrativa de backend para operaciones maestras. | No requerida para la vista de usuario estándar. |

---

### D. Comercio y Pagos (Shopify Storefront & Partner App)

| Variable | Ámbito | Sensibilidad | Propósito | Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `SHOPIFY_SHOP_DOMAIN` | Servidor | Media | Dominio de la tienda Shopify (ej. `salud-forte.myshopify.com`). | Se usan identificadores de muestra en `lib/shopify/products-db.ts`. |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Servidor | Media | Token para consultar el catálogo de Shopify Storefront API. | Catálogo local servido desde la base de datos en memoria. |
| `SHOPIFY_API_KEY` | Servidor | Media | Client ID de la Partner App para autenticación OAuth con Shopify. | Desactivado en desarrollo. |
| `SHOPIFY_API_SECRET` | Servidor | **Crítica** | Secret de la Partner App para firma HMAC de webhooks. | Validación omitida en entorno local seguro. |
| `SHOPIFY_WEBHOOK_SECRET` | Servidor | **Crítica** | Token de validación de eventos de compra procesada. | Desactivado en desarrollo. |

---

### E. Video Streaming Seguro (Cloudflare Stream)

| Variable | Ámbito | Sensibilidad | Propósito | Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `CLOUDFLARE_ACCOUNT_ID` | Servidor | Media | ID de cuenta de Cloudflare. | Reproductor utiliza enlaces seguros de respaldo (YouTube embed no listado o video demo). |
| `CLOUDFLARE_STREAM_API_TOKEN` | Servidor | **Alta** | Token con permisos de lectura para firmar URLs de streaming. | Fallback a reproductor informativo. |
| `CLOUDFLARE_STREAM_KEY_ID` | Servidor | Media | ID del certificado de firma para tokens JWT de video. | Modo fallback. |
| `CLOUDFLARE_STREAM_PRIVATE_KEY`| Servidor | **Crítica** | Llave privada para generar tokens con expiración por lección. | Modo fallback. |

---

### F. Comunicaciones Transaccionales (Resend)

| Variable | Ámbito | Sensibilidad | Propósito | Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `RESEND_API_KEY` | Servidor | **Alta** | Token de API para envío de correos de confirmación de acceso. | Se registran los correos en consola del servidor (`console.log`). |
| `EMAIL_FROM_ADDRESS` | Servidor | Baja | Dirección autorizada de envío (ej. `soporte@saludforte.mx`). | `onboarding@resend.dev` |
| `EMAIL_FROM_NAME` | Servidor | Baja | Nombre visible del remitente institucional. | `Dr. Mauricio Galindo · Salud Forte` |

---

## 3. Guía de Configuración Local

Para configurar las variables en tu entorno local:
```bash
# 1. Copiar plantilla de ejemplo
cp .env.example .env

# 2. Rellenar las variables necesarias con los valores del equipo de desarrollo
```
Recuerda que `.env` está expresamente excluido de los commits de control de versiones a través de `.gitignore`.
