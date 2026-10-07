/**
 * Configuración central de la tienda de suplementos y productos.
 * ÚNICA FUENTE DE VERDAD (Single Source of Truth) para la activación de la tienda.
 * 
 * - Cuando STORE_ENABLED = false:
 *   - Se oculta "Tienda" en la navegación principal (escritorio y móvil).
 *   - Se oculta el botón/bolsa del carrito en el encabezado.
 *   - No se monta el CartDrawer en el DOM.
 *   - Las rutas públicas (/tienda, /tienda/:slug) redirigen limpiamente al inicio (/).
 *   - Se retiran llamados a explorar tienda en vistas vacías.
 *   - Se mantiene intacto el panel administrativo (/admin/productos), base de datos,
 *     pedidos existentes e integraciones de Shopify.
 * 
 * Para reactivar la tienda en el futuro:
 * Cambia únicamente este valor a true (STORE_ENABLED = true).
 */
export const STORE_ENABLED = false;
