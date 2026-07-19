# Spec: Panel de administración

## Objetivo

Permitir a la dueña del negocio (usuaria única, no técnica) gestionar el catálogo completo —categorías, productos e imágenes— desde una interfaz protegida en español, sin depender de un desarrollador para cada cambio.

## Alcance / Fuera de alcance

**Alcance:**
- Login con Supabase Auth (email/password), un solo usuario administrador.
- Rutas `/admin/**` protegidas: requieren sesión activa.
- CRUD de productos y categorías.
- Subida múltiple de imágenes por producto a Supabase Storage, con selección de imagen principal y reordenamiento.
- Toggles de `is_featured`, `is_active` y `availability`.
- Edición de `display_order` en productos y categorías.
- UI en español, con etiquetas claras, confirmaciones antes de acciones destructivas y mensajes de error legibles.

**Fuera de alcance:**
- Roles o múltiples administradores (v1 es un solo usuario).
- Registro público de usuarios.
- Logs de auditoría.
- Importación masiva de productos.
- Analítica o reportes de ventas.

## Requisitos funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RF-1 | Login | Formulario email/password contra Supabase Auth. Sin opción de registro visible en la UI. |
| RF-2 | Rutas protegidas | Todo bajo `/admin/**` redirige a `/admin/login` si no hay sesión válida. |
| RF-3 | CRUD de categorías | Crear, editar y eliminar categorías (`name`, `slug`, `description`, portada, `display_order`, `is_active`). |
| RF-4 | CRUD de productos | Crear, editar y eliminar productos (`name`, `slug`, `description`, `price`, categoría, `availability`, toggles). |
| RF-5 | Subida de imágenes | Subida múltiple a Storage por producto, con validación de tipo y tamaño antes de subir. |
| RF-6 | Imagen principal | Marcar una imagen como `is_primary`; solo una por producto. |
| RF-7 | Reordenar imágenes | Cambiar `display_order` de las imágenes de un producto (drag-and-drop o controles arriba/abajo). |
| RF-8 | Toggles de estado | Activar/desactivar `is_featured`, `is_active` y cambiar `availability` desde la lista o el detalle del producto. |
| RF-9 | Orden de presentación | Editar `display_order` de productos y categorías desde la UI (afecta el catálogo público). |
| RF-10 | Confirmaciones | Toda acción destructiva (eliminar producto, categoría o imagen) pide confirmación explícita. |

## Escenarios de usuario

1. La dueña entra a `/admin/login`, ingresa su email y contraseña, y llega al listado de productos.
2. Crea un producto nuevo: completa nombre, precio, categoría y disponibilidad; sube 3 fotos; marca una como principal; guarda.
3. Reordena las fotos de un producto ya existente arrastrando una miniatura a la primera posición.
4. Desactiva un producto agotado (`is_active = false`) sin eliminarlo, para que deje de mostrarse en el catálogo público pero conserve su historial.
5. Cambia el `display_order` de las categorías para que "Ramos" aparezca antes que "Gorras" en el menú público.

## Casos borde

- **Sesión expirada**: cualquier acción sobre `/admin/**` con sesión vencida redirige a `/admin/login` con el mensaje "Tu sesión expiró, ingresa de nuevo". Los datos del formulario en curso se conservan en el estado del cliente cuando es posible.
- **Archivo de imagen inválido o muy pesado**: se valida tipo (`image/jpeg`, `image/png`, `image/webp`) y tamaño máximo antes de subir a Storage. Si falla, se muestra un mensaje claro (ej. "La imagen debe ser JPG, PNG o WEBP y pesar menos de 5 MB") y no se intenta la subida.
- **Falla de subida a Storage**: si la subida falla a mitad de camino, se informa el error y el producto queda sin esa imagen, sin registro huérfano en `product_images`.
- **Eliminar categoría con productos asociados**: no se permite el borrado directo (la FK `category_id` lo bloquea). La resolución principal es desactivar la categoría (`is_active = false`), como define `data-model.md`; como alternativa, la UI permite reasignar los productos a otra categoría antes de eliminarla.
- **Borrado de producto**: es soft-delete (`is_active = false`); el borrado físico no está expuesto en la UI en v1.
- **Borrado de imagen**: es hard delete y orquesta dos pasos: eliminar el archivo en Storage y luego la fila en `product_images`, evitando archivos huérfanos o referencias rotas.

## Touchpoints de datos

- `categories`: lectura y escritura completas desde el admin. Ver [data-model.md](./data-model.md).
- `products`: lectura y escritura completas, incluyendo `is_featured`, `is_active`, `availability`, `display_order`.
- `product_images`: alta al subir imágenes, edición de `is_primary` y `display_order`, baja al eliminar.
- Supabase Storage, bucket `product-images`: archivos referenciados por `storage_path` en `product_images` y en la portada de `categories`.

## Seguridad

- **RLS (Row Level Security)**: lectura pública habilitada solo sobre productos y categorías con `is_active = true`; cualquier operación de escritura (insert/update/delete) requiere usuario autenticado.
- La `service_role` key de Supabase se usa exclusivamente en el servidor (Server Actions / route handlers), nunca se expone al cliente.
- `.env` con credenciales nunca se commitea al repositorio; solo `NEXT_PUBLIC_*` llega al bundle del cliente.

## Preguntas abiertas

- Ninguna.
