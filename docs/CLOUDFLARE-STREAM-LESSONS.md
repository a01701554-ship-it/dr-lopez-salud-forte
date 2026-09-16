# Videos de Cloudflare Stream en las masterclasses

La aplicación reproduce videos privados de Cloudflare Stream mediante enlaces firmados que caducan. El token secreto de Cloudflare permanece únicamente en el servidor.

## Configuración del servidor

La publicación necesita estas variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_STREAM_API_TOKEN`
- `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`

El token de Cloudflare debe tener permisos **Stream Read** y **Stream Write**. Nunca debe guardarse en GitHub ni exponerse en el navegador.

## Flujo recomendado para cada video

1. Subir el archivo desde **Cloudflare Dashboard → Stream**.
2. Esperar a que Cloudflare muestre el video como listo.
3. Iniciar sesión en Salud Forte con la cuenta administradora.
4. Abrir `/admin/academia`.
5. En **Cursos & Videos**, localizar la lección correcta.
6. Pulsar **Poner video** o **Cambiar video**.
7. Elegir el video de la biblioteca de Cloudflare y guardar.
8. Pulsar **Probar reproductor** para comprobar la lección.

Al guardar, la aplicación realiza dos acciones coordinadas:

- autoriza automáticamente `dr-lopez-salud-forte.ai.studio` en ese video;
- guarda el ID de Cloudflare Stream en la lección de Supabase.

Esto evita el error `This video has not been configured to be allowed on this domain`.

## Alternativa con YouTube

En la misma ventana se puede elegir **YouTube** e introducir el ID del video. Para contenido de pago o material médico exclusivo se recomienda Cloudflare Stream porque la reproducción usa un token firmado y no revela un enlace público permanente.

## Datos guardados en Supabase

Para Cloudflare:

```text
video_provider = cloudflare
video_asset_id = ID_DEL_VIDEO
video_external_id = NULL
```

Para YouTube:

```text
video_provider = youtube
video_asset_id = NULL
video_external_id = ID_DE_YOUTUBE
```

No es necesario editar estos campos manualmente cuando se usa el panel `/admin/academia`.
