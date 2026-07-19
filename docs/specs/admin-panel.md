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
| RF-1 | Login | Formulario email/password contra Supabase Auth. Sin opción de registro visible en la UI; el registro público también está deshabilitado a nivel de API (ver Seguridad). |
| RF-2 | Rutas protegidas | Todo bajo `/admin/**` redirige a `/admin/login` si no hay sesión válida. Es UX defensiva, no la frontera de seguridad de las mutaciones (ver Seguridad). |
| RF-3 | CRUD de categorías | Crear, editar y eliminar categorías (`name`, `slug`, `description`, portada, `display_order`, `is_active`). Generación y unicidad de `slug`: ver "Generación de slug" más abajo. |
| RF-4 | CRUD de productos | Crear, editar y eliminar productos (`name`, `slug`, `description`, `price`, categoría, `availability`, toggles). Generación y unicidad de `slug`: ver "Generación de slug" más abajo. |
| RF-5 | Subida de imágenes | Subida múltiple a Storage por producto, con validación de tipo y tamaño antes de subir. Convención de `storage_path`: ver [data-model.md](./data-model.md#convención-de-storage_path), RF-6. |
| RF-6 | Imagen principal | Marcar una imagen como `is_primary`; solo una por producto. |
| RF-7 | Reordenar imágenes | Cambiar `display_order` de las imágenes de un producto (drag-and-drop o controles arriba/abajo). |
| RF-8 | Toggles de estado | Activar/desactivar `is_featured`, `is_active` y cambiar `availability` desde la lista o el detalle del producto. |
| RF-9 | Orden de presentación | Editar `display_order` de productos y categorías desde la UI (afecta el catálogo público). |
| RF-10 | Confirmaciones | Toda acción destructiva (eliminar producto, categoría o imagen) pide confirmación explícita. |

### Generación de slug

- El `slug` se autogenera a partir de `name` (slugify: minúsculas, sin tildes/acentos, guiones) al crear una categoría o producto; queda pre-cargado en un campo editable.
- Si el `slug` generado colisiona con uno existente en la misma tabla, se le agrega un sufijo numérico incremental (p. ej. `ramo-rosas-2`) para que la dueña nunca tenga que armar a mano una URL única.
- La misma validación de unicidad aplica a ediciones manuales del slug; si el valor ingresado ya existe, se muestra un error legible en español (no el error crudo de Postgres por violación de UNIQUE).
- Cambiar el `slug` de un producto o categoría ya publicado rompe los enlaces de WhatsApp compartidos previamente hacia `/producto/[slug]` (ver [public-catalog.md](./public-catalog.md)); editar un slug existente pide confirmación explícita antes de guardar.

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

- **Registro público deshabilitado**: además de no exponer una pantalla de registro en la UI (RF-1), los signups públicos de Supabase Auth se desactivan a nivel de API (paso operativo en [setup-desde-cero.md](../guides/setup-desde-cero.md), sección 5) — sin ese paso, cualquiera puede llamar directamente al endpoint de signup con la `anon key` (pública por diseño) y obtener un usuario `authenticated` válido sin pasar por la aplicación.
- **RLS (Row Level Security)**: habilitado en las tres tablas (`categories`, `products`, `product_images`); el esquema completo de policies vive en [data-model.md](./data-model.md#row-level-security-rls), que es la fuente única de verdad — no se duplica acá. Ninguna tabla otorga policies de escritura a `anon` ni a `authenticated`; la autoridad real de escritura es la `service_role` key (ver el punto siguiente).
- **Verificación de sesión en cada Server Action**: la redirección de `/admin/**` a `/admin/login` (RF-2) es UX defensiva para la usuaria, no una frontera de seguridad — las Server Actions son endpoints POST independientes que Next.js no protege por estar la ruta bajo `/admin/**`. Toda Server Action que muta (crear/editar/eliminar categoría, producto o imagen) valida la sesión con `supabase.auth.getUser()` o `getClaims()` como primera instrucción, antes de cualquier escritura o de usar la `service_role` key, y rechaza la operación si no hay usuario válido. Nunca se autoriza a partir del usuario embebido en `getSession()`, que no está validado contra el servidor.
- La `service_role` key de Supabase se usa exclusivamente en el servidor (Server Actions / route handlers) para las mutaciones descritas arriba, siempre después de la verificación anterior; nunca se expone al cliente. Como `service_role` evita RLS, esa verificación en la propia Server Action —no RLS— es lo que impide que cualquiera dispare una mutación.
- `.env` con credenciales nunca se commitea al repositorio; solo `NEXT_PUBLIC_*` llega al bundle del cliente. La misma regla aplica al contenido de `supabase/migrations/`: solo datos placeholder, nunca credenciales ni un email personal real (ver [CLAUDE.md](../../CLAUDE.md), sección 9).

### Almacenamiento / Storage

- El bucket `product-images` de Supabase Storage es **público**: el catálogo público es SSG/ISR e indexable por SEO ([ADR-0001](../adr/0001-nextjs-app-router.md)) y lee imágenes de forma anónima (ver [public-catalog.md](./public-catalog.md), RF-4); las imágenes son fotos de producto/categoría no sensibles. Un bucket público permite leer con `getPublicUrl` — una URL estable que puede quedar embebida en páginas renderizadas estáticamente/ISR — tanto para `product_images.storage_path` como para `categories.storage_path` (la portada de categoría también vive en este bucket, ver [data-model.md](./data-model.md)). No se requiere policy de SELECT sobre `storage.objects` para un bucket público.
- Un bucket público igual aplica control de acceso sobre las operaciones de escritura (INSERT/UPDATE/DELETE/move/copy). Como las subidas del admin corren server-side con la `service_role` key (ver más arriba) y `service_role` evita RLS, no son estrictamente necesarias policies de escritura sobre Storage para el flujo documentado. Si en algún momento se agrega subida directa desde el cliente (usuario autenticado), sumar policies de INSERT/UPDATE/DELETE en `storage.objects` acotadas a `bucket_id = 'product-images'` para el rol `authenticated`, como defensa en profundidad.
- Alternativa descartada para v1: un bucket **privado** exigiría URLs firmadas server-side (`createSignedUrl`, con expiración) y, para cualquier lectura directa autenticada, una policy de SELECT sobre `storage.objects` que además tendría que hacer JOIN contra `products` para respetar el soft-delete, porque `product_images` no tiene su propio `is_active`. Se descarta porque rompe el cacheo de larga duración de las URLs de imagen en SSG/ISR y agrega complejidad sin beneficio para imágenes no sensibles.

## Preguntas abiertas

- Ninguna.
