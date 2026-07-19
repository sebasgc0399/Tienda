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
| RF-6 | Imágenes por ruta relativa | `storage_path` guarda la ruta del archivo dentro del bucket `product-images` de Supabase Storage, no la URL pública completa. La URL se resuelve en tiempo de lectura a partir de esa ruta. Política de acceso del bucket (público/privado) documentada en [admin-panel.md](./admin-panel.md), sección Seguridad. Convención de la ruta: ver "Convención de storage_path" más abajo. |

### Convención de storage_path

- Clave del objeto en el bucket `product-images`: `{product_id}/{uuid}.{ext}` para imágenes de producto y `categories/{category_id}/{uuid}.{ext}` para portadas de categoría. Agrupar por el id de la fila dueña facilita la limpieza masiva y evita colisiones entre productos.
- El `uuid` se genera server-side (`crypto.randomUUID()`, o reutilizar el `id` de la fila `product_images` que se está creando) — nunca a partir del nombre de archivo del cliente. Los celulares generan nombres repetibles entre fotos (`IMG_0001.jpg`); usar el nombre del cliente como clave produciría colisiones reales entre productos distintos.
- `ext` se deriva del MIME type ya validado en la subida (ver [admin-panel.md](./admin-panel.md), RF-5: `image/jpeg`/`png`/`webp` → `jpg`/`png`/`webp`), no de la extensión del archivo del cliente.
- Las subidas nuevas nunca usan `upsert: true`: como cada subida apunta a una ruta única, un error "Asset Already Exists" señala un bug real (por ejemplo un reintento), no algo para resolver sobrescribiendo. `upsert: true` solo es aceptable para un reemplazo deliberado in-place de la misma imagen lógica, si ese flujo se agrega más adelante.

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

## Row Level Security (RLS)

Fuente única de verdad de las policies de RLS de las tres tablas; [admin-panel.md](./admin-panel.md#seguridad) referencia esta sección en vez de redefinirla.

RLS se activa explícitamente por tabla — crear una tabla desde el SQL Editor no la activa sola:

```sql
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
```

**Lectura pública** (`anon` y `authenticated`), limitada a registros activos:

```sql
create policy "public read active categories" on categories
  for select to anon, authenticated
  using (is_active = true);

create policy "public read active products" on products
  for select to anon, authenticated
  using (is_active = true);
```

`product_images` no tiene columna `is_active` propia (ver RF-2): su visibilidad depende de que el producto y la categoría a la que pertenece estén activos, así que la policy hace `JOIN`:

```sql
create policy "public read images of active products" on product_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from products p
      join categories c on c.id = p.category_id
      where p.id = product_images.product_id
        and p.is_active = true
        and c.is_active = true
    )
  );
```

**Escritura**: ninguna de las tres tablas otorga policies de `insert`/`update`/`delete` a `anon` ni a `authenticated` — con RLS activado y solo policies de `select`, esas escrituras ya quedan denegadas por default, sin necesidad de una policy explícita de rechazo. La autoridad real de escritura es la `service_role key`, usada exclusivamente server-side dentro de Server Actions que re-verifican la sesión del admin antes de escribir (ver [admin-panel.md](./admin-panel.md#seguridad)) — el mismo modelo que ya aplica al bucket de Storage.

Si alguna vez se necesita que el cliente escriba directamente sujeto a RLS (sin pasar por una Server Action), la policy debe acotarse a la única cuenta admin — nunca un `to authenticated` sin condición, porque eso vuelve a abrir la escritura a cualquier cuenta que logre autenticarse (por ejemplo, si el registro público se reactivara por error) — por ejemplo `using (auth.uid() = '<uuid-del-admin>')`.

## Preguntas abiertas

- ¿La unicidad de `is_primary` por producto se refuerza con un índice parcial en Postgres, o queda como responsabilidad exclusiva de la capa de aplicación?
- ¿Se necesita un índice compuesto (`category_id`, `display_order`) para el listado por categoría, o el volumen esperado del catálogo no lo justifica?
