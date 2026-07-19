# Spec: Modelo de datos

## Objetivo

Definir el esquema de base de datos (Postgres/Supabase) del catálogo: `categories`, `products` y `product_images`. Este documento es la fuente única de verdad del esquema; el resto de los specs (`public-catalog.md`, `cart-whatsapp-checkout.md`, `admin-panel.md`) lo referencian en vez de redefinir campos.

## Alcance / Fuera de alcance

**Alcance:**
- Tablas `categories`, `products`, `product_images` y sus relaciones.
- Convenciones de tipos y nombres aplicadas a las tres tablas.

**Fuera de alcance:**
- `product_variants`: no hay variantes de producto en v1 (cada producto es un SKU único). El modelo queda abierto a extenderse más adelante.
- Tags y collections: no existen en v1; el catálogo se organiza solo por categoría.
- Pedidos persistidos: no hay tabla de órdenes. El pedido vive en la conversación de WhatsApp (ver `cart-whatsapp-checkout.md`), no en la base de datos.

## Requisitos funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RF-1 | Precio como entero en COP | `products.price` es `integer NOT NULL`. El negocio opera en pesos colombianos sin centavos; un entero evita errores de redondeo de punto flotante en dinero. |
| RF-2 | Borrado lógico | `is_active` en `categories` y `products` oculta el registro sin eliminarlo físicamente. `product_images` no necesita su propio `is_active` porque su ciclo de vida depende del producto (ver relaciones). |
| RF-3 | Destacados curados a mano | `products.is_featured` lo activa la dueña manualmente desde el panel admin; no existe lógica de ventas ni analítica que lo calcule automáticamente. |
| RF-4 | Disponibilidad como enum | `products.availability` es un enum nativo de Postgres, `product_availability` (`CREATE TYPE product_availability AS ENUM ('in_stock', 'out_of_stock', 'made_to_order')`), no un `text` con `CHECK`: así los tipos que Supabase genera en TypeScript exponen el union literal `'in_stock' \| 'out_of_stock' \| 'made_to_order'` en vez de `string`. Un booleano simple no alcanza porque parte del catálogo son piezas artesanales hechas bajo pedido. Tradeoff: agregar valores a un enum nativo requiere `ALTER TYPE ... ADD VALUE`; si esa rigidez pesa más que la seguridad de tipos, la alternativa es `text` + `CHECK`, pero entonces el tipo generado sería `string`. |
| RF-5 | Orden manual de presentación | `display_order` existe en las tres tablas porque la dueña controla el orden visual del catálogo (categorías, productos dentro de una categoría, imágenes de un producto); no depende de un algoritmo. El `display_order` de `products` es válido solo dentro de su categoría, no aplica al orden global de "destacados" en el home (ver `public-catalog.md`, RF-1). |
| RF-6 | Imágenes por ruta relativa | `storage_path` guarda la ruta del archivo dentro del bucket `product-images` de Supabase Storage, no la URL pública completa. La URL se resuelve en tiempo de lectura a partir de esa ruta. Política de acceso del bucket (público/privado) documentada en [admin-panel.md](./admin-panel.md), sección Seguridad. |

## Escenarios de usuario

1. La dueña crea una categoría, luego un producto asociado a ella (`category_id`), y sube una o más imágenes al producto marcando una como `is_primary`.
2. El catálogo público consulta únicamente categorías y productos con `is_active = true`; un producto solo es visible si tanto él como su categoría (`category_id`) tienen `is_active = true` (ver `public-catalog.md`), ordenados por `display_order`.

## Casos borde

- **Categoría con productos asociados**: no se elimina físicamente; se desactiva con `is_active = false`. La FK `category_id` no debe permitir borrar una categoría que aún tenga productos.
- **Producto sin imágenes**: `product_images` puede estar vacío para un producto; la UI muestra un placeholder (comportamiento definido en `public-catalog.md`, no en este documento).
- **Más de una imagen marcada `is_primary`**: el modelo no impone esa unicidad a nivel de base de datos; es responsabilidad de la capa de aplicación mantener como máximo una imagen principal por producto.
- **Archivo huérfano en Storage**: si se elimina una fila de `product_images` sin eliminar el archivo correspondiente en el bucket, el archivo queda huérfano. Requiere manejo explícito en la aplicación (no hay trigger de base de datos para esto).

## Touchpoints de datos

### `categories`

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` | Identificador único |
| slug | text | UNIQUE, NOT NULL | Usado en la ruta `/categoria/[slug]`; se deriva de `name` y su unicidad se garantiza en la capa de aplicación (ver [admin-panel.md](./admin-panel.md)) |
| name | text | NOT NULL | Nombre visible en el catálogo |
| description | text | NULL | Texto descriptivo opcional |
| storage_path | text | NULL | Ruta de la imagen de portada en el bucket `product-images` |
| display_order | integer | NOT NULL, default `0` | Orden manual de presentación |
| is_active | boolean | NOT NULL, default `true` | Borrado lógico: `false` oculta la categoría |
| created_at | timestamptz | NOT NULL, default `now()` | |
| updated_at | timestamptz | NOT NULL, default `now()` | |

### `products`

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` | Identificador único |
| slug | text | UNIQUE, NOT NULL | Usado en la ruta `/producto/[slug]`; se deriva de `name` y su unicidad se garantiza en la capa de aplicación (ver [admin-panel.md](./admin-panel.md)) |
| name | text | NOT NULL | Nombre visible |
| description | text | NOT NULL | Descripción del producto |
| price | integer | NOT NULL | Precio en COP, sin centavos (ver RF-1) |
| category_id | uuid | FK → `categories.id`, NOT NULL, `ON DELETE RESTRICT` | Categoría a la que pertenece |
| is_featured | boolean | NOT NULL, default `false` | Destacado curado a mano (ver RF-3) |
| availability | `product_availability` (enum nativo Postgres) | NOT NULL, default `'in_stock'` | Disponibilidad del producto (ver RF-4) |
| is_active | boolean | NOT NULL, default `true` | Borrado lógico |
| display_order | integer | NOT NULL, default `0` | Orden manual dentro de su categoría |
| created_at | timestamptz | NOT NULL, default `now()` | |
| updated_at | timestamptz | NOT NULL, default `now()` | |

### `product_images`

| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` | Identificador único |
| product_id | uuid | FK → `products.id`, NOT NULL, `ON DELETE CASCADE` | Producto al que pertenece |
| storage_path | text | NOT NULL | Ruta relativa en el bucket `product-images` (ver RF-6) |
| alt_text | text | NULL | Texto alternativo para accesibilidad |
| is_primary | boolean | NOT NULL, default `false` | Imagen principal mostrada en tarjetas y listados |
| display_order | integer | NOT NULL, default `0` | Orden dentro de la galería del producto |
| created_at | timestamptz | NOT NULL, default `now()` | |

### Relaciones

- `categories` 1—N `products` vía `products.category_id`, con `ON DELETE RESTRICT`: no se puede eliminar una categoría que aún tenga productos asociados.
- `products` 1—N `product_images` vía `product_images.product_id`, con `ON DELETE CASCADE`: al eliminar físicamente un producto, sus imágenes se eliminan en cascada.

## Preguntas abiertas

- ¿La unicidad de `is_primary` por producto se refuerza con un índice parcial en Postgres, o queda como responsabilidad exclusiva de la capa de aplicación?
- ¿Se necesita un índice compuesto (`category_id`, `display_order`) para el listado por categoría, o el volumen esperado del catálogo no lo justifica?
