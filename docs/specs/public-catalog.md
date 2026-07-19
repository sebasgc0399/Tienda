# Spec: Catálogo público

## Objetivo

Permitir que cualquier visitante explore el catálogo de productos (ramos, gorras, decoraciones) sin necesidad de cuenta, desde el home hasta el detalle de un producto, con el precio en COP siempre visible y un punto de entrada al carrito.

## Alcance / Fuera de alcance

**Alcance:**
- Home con sección de destacados (productos con `is_featured = true`, curados manualmente por la dueña).
- Mega-menú de categorías en la navegación superior (patrón Apple: columnas desplegables desde el ítem de navegación).
- Listado de productos por categoría, respetando el orden manual (`display_order`).
- Detalle de producto: galería de imágenes, precio en COP, botón "Añadir al carrito".
- Rutas dinámicas `/categoria/[slug]` y `/producto/[slug]`.
- Diseño mobile-first en todas las vistas.

**Fuera de alcance:**
- Búsqueda de productos.
- Filtros (precio, disponibilidad, múltiples categorías, etc.).
- Reseñas o calificaciones de productos.
- Lógica del carrito y del checkout por WhatsApp (ver `cart-whatsapp-checkout.md`).
- Variantes de producto (fuera de v1; ver `data-model.md`).

## Requisitos funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RF-1 | Home con destacados | Sección que lista productos con `is_featured = true`; curaduría manual, sin algoritmo de ventas. |
| RF-2 | Mega-menú de categorías | La navegación superior despliega columnas con las categorías activas (patrón Apple). |
| RF-3 | Listado por categoría | Ruta `/categoria/[slug]`; productos ordenados por `display_order` ascendente. |
| RF-4 | Detalle de producto | Ruta `/producto/[slug]`; muestra galería, nombre, descripción, precio y disponibilidad. |
| RF-5 | Precio siempre visible | Precio en COP, entero sin centavos, visible en card, listado y detalle. |
| RF-6 | Añadir al carrito | Botón en el detalle que entrega el producto al carrito (ver `cart-whatsapp-checkout.md`). |
| RF-7 | Mobile-first | Layout, navegación y galería optimizados primero para pantallas móviles. |

## Escenarios de usuario

1. La visitante entra al home, ve la sección de destacados, abre el mega-menú, elige una categoría, navega el listado ordenado por la dueña, entra al detalle de un producto, revisa la galería y el precio, y presiona "Añadir al carrito".
2. La visitante llega por un enlace compartido directo a `/producto/[slug]` (por ejemplo, desde WhatsApp) y ve la misma información de detalle sin pasar por el home.

## Casos borde

- **Categoría vacía**: si no tiene productos activos, el listado muestra un mensaje ("Sin productos por el momento") en lugar de una grilla vacía.
- **Producto inactivo** (`is_active = false`): se trata como no encontrado; la ruta responde 404.
- **Producto agotado** (`availability = out_of_stock`): se muestra en listado y detalle con una etiqueta "Agotado"; el botón "Añadir al carrito" queda deshabilitado.
- **Producto sobre pedido** (`availability = made_to_order`): se muestra con su etiqueta correspondiente; el botón permanece habilitado porque la disponibilidad real se confirma por WhatsApp.
- **Producto sin imágenes**: la galería y la card muestran una imagen placeholder genérica en lugar de un espacio vacío.
- **Slug inexistente** (categoría o producto): página 404 estándar de Next.js.

## Touchpoints de datos

- `categories`: lectura de `slug`, `name`, `display_order`, `is_active` (esquema completo en `data-model.md`).
- `products`: lectura de `slug`, `name`, `description`, `price`, `is_featured`, `availability`, `is_active`, `display_order` (esquema completo en `data-model.md`).
- `product_images`: lectura de `storage_path`, `alt_text`, `is_primary`, `display_order` (esquema completo en `data-model.md`).
- Este feature es de solo lectura pública; no escribe en ninguna tabla (la escritura vive en `admin-panel.md`).

## Preguntas abiertas

- Ninguna: el alcance queda cerrado con las decisiones ya registradas en `data-model.md` y en este documento.
