# Spec: Design System

## Objetivo

Definir guardrails visuales y de interacción para la tienda: tokens de diseño sobre el theme de Tailwind y un inventario de componentes shadcn/ui, de modo que cualquier pantalla nueva (pública o admin) se construya de forma consistente sin depender de specs pixel-perfect por pantalla.

## Alcance / Fuera de alcance

**Alcance:**
- Interpretación de las tres referencias del cliente en principios de diseño accionables.
- Tokens de diseño (paleta, escala tipográfica, espaciado, radios) definidos en `globals.css` vía el bloque `@theme` de Tailwind v4 (CSS-first); `tailwind.config.ts` solo aplica como opt-in de compatibilidad v3, vía la directiva `@config` en `globals.css` — sin ella, sus tokens se ignoran silenciosamente.
- Inventario de componentes shadcn/ui a usar y su propósito.
- Reglas de responsive mobile-first.
- Accesibilidad básica (contraste, foco, texto alternativo).
- Idioma de la UI: español, sin framework de i18n.

**Fuera de alcance:**
- Entregables de Figma o mockups de alta fidelidad.
- Specs pixel-perfect por pantalla.
- Estrategia de motion/microinteracciones: decidida en ADR-0007, no en esta spec.
- Dark mode.

## Requisitos funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RF-1 | Interpretación de referencias | The North Face aporta el criterio editorial (imagen de producto grande y protagonista, header persistente/sticky); Clemont aporta minimalismo (whitespace generoso, tipografía refinada, pocos elementos por vista); Apple aporta el patrón de navegación (mega-menú por columnas organizado por categoría), escalado hacia abajo para 4-6 categorías — ver "Patrones de UI > Navegación" más abajo. |
| RF-2 | Tokens de diseño | Paleta neutra + un color de acento de marca, sin colores saturados de fondo, priorizando que la imagen del producto sea el elemento de color dominante. Dirección visual seleccionada: A "Barrio Cálido" (ver "Direcciones visuales"). |
| RF-3 | Escala tipográfica | Escala corta sobre las clases de Tailwind: `text-4xl`/`text-3xl` para títulos, `text-xl` para subtítulos, `text-base` para cuerpo, `text-sm` para metadatos (precio secundario, etiquetas). Peso `font-bold` en títulos, `font-normal` en cuerpo. Máximo 2 familias tipográficas: un único tipo display para hero y títulos de categoría, sobre una tipografía de cuerpo sans (ver "Direcciones visuales"). |
| RF-4 | Espaciado y radios | Unidad base 4px (escala default de Tailwind); secciones con `py-16`/`py-24` para el whitespace tipo Clemont; `rounded-lg` en cards e imágenes, `rounded-md` en botones e inputs. |
| RF-5 | Inventario shadcn/ui | Ver tabla de componentes más abajo. |
| RF-6 | Responsive mobile-first | Estilos base para mobile; el mega-menú de categorías (Apple) se activa desde el breakpoint `lg`, en mobile se reemplaza por un menú de navegación simple. |
| RF-7 | Accesibilidad básica | Contraste mínimo AA (4.5:1 en texto de cuerpo), estados de foco visibles (`focus-visible` de shadcn) en todo elemento interactivo, `alt` obligatorio en imágenes de producto usando el campo `alt_text` de `product_images`. |
| RF-8 | Idioma de la UI | Todo el copy de interfaz en español, hardcodeado en los componentes; no se introduce `next-intl` ni ninguna librería de i18n. |

### Componentes shadcn/ui

| Componente | Uso |
|---|---|
| Navigation Menu | Base del navbar con mega-menú por categorías (patrón Apple). |
| Card | Product card del catálogo (imagen, nombre, precio). |
| Button | Acciones primarias/secundarias (añadir al carrito, pedir por WhatsApp, CRUD admin). |
| Dialog | Confirmaciones destructivas en el panel admin (ej. eliminar categoría). |
| Form | Formularios CRUD admin con `<form action>` nativo + `useActionState` y validación server-side (sin react-hook-form). |
| Sheet | Dos usos en mobile: carrito (panel deslizante lateral) y drawer de navegación de categorías. |
| Input | Campos de texto de una línea en los formularios CRUD admin (nombre, slug, precio). |
| Label | Etiqueta asociada a cada campo de formulario, siempre arriba del campo (ver "Panel de administración"). |
| Textarea | Campos de texto largo en los formularios CRUD admin (descripción de categoría/producto). |
| Select | Selección de una opción entre varias en el panel admin (ej. categoría destino al reasignar productos, disponibilidad de un producto). |
| Switch | Toggles inline en listas y formularios admin (`is_active`, `is_featured`). |

## Patrones de UI

Detalle de patrones que antes no estaban documentados o que necesitaban ajuste de escala para un catálogo de 4-6 categorías.

### Navegación (escala reducida)

El componente Navigation Menu de shadcn (RF-5) se mantiene, pero su densidad se ajusta al tamaño real del catálogo: un mega-menú denso multi-columna (estilo Apple/Walmart) se justifica desde 10+ categorías; esta tienda maneja 4-6. Se renderiza como una sola fila de columnas simples — una columna por categoría —, no como grid denso.

| Regla | Detalle |
|---|---|
| Apertura (hover) | Delay de apertura 0.5s, revelado en 0.1s, delay de cierre 0.5s (NN/g, *Timing Guidelines for Exposing Hidden Content*). |
| Header de categoría | Clickable en sí mismo, no solo sus hijos. |
| Estado activo | La categoría actual se resalta en su header. |
| Mobile | Lista plana de categorías dentro del `Sheet` (sin acordeones anidados); iconos de carrito y WhatsApp permanecen fuera del drawer, visibles en el header. |

### Product card

Anatomía fija: imagen → título → precio → CTA. Todas las fotos de producto se estandarizan a **ratio 1:1** para no romper el ritmo de la grilla.

| Elemento | Regla |
|---|---|
| Aspect ratio | 1:1 en todas las fotos de producto, sin excepción. |
| Hover (desktop) | Zoom CSS `transition-transform hover:scale-105`, dentro de `@media (hover: hover)` para no quedar activo en touch. Respeta `prefers-reduced-motion` (obligatorio, ver [ADR-0007](../adr/0007-motion-strategy-css-radix.md)). |
| Image-swap | Mejora opcional, reservada solo a productos destacados con una segunda foto curada del mismo ángulo y ratio. |

### PDP (detalle de producto)

Patrón nuevo — no estaba cubierto en la versión anterior de esta spec.

| Zona | Regla |
|---|---|
| Galería (desktop) | Columna principal, scroll vertical editorial; todos los thumbnails visibles, sin truncar. |
| Buy-box (desktop) | `position: sticky` a la derecha — nombre, precio, CTA "Añadir al carrito" (RF-6 de [public-catalog.md](./public-catalog.md)). |
| Buy-bar (mobile) | Fija; precio + CTA "Añadir al carrito". Aparece vía `IntersectionObserver` cuando el CTA principal sale de la vista, re-exponiendo esa misma acción. "Pedir por WhatsApp" es una acción del carrito (RF-7 de [cart-whatsapp-checkout.md](./cart-whatsapp-checkout.md)), no del PDP. |
| Animación de buy-bar | Solo `transform`/`opacity` (nunca `height`/`top`) para evitar layout shift. Respeta `prefers-reduced-motion` (obligatorio, ver [ADR-0007](../adr/0007-motion-strategy-css-radix.md)). |
| Tap target | Mínimo 44×44px (WCAG 2.5.5). |

### Carrito (Sheet lateral)

| Elemento | Regla |
|---|---|
| Trigger + badge | Icono `ShoppingBag` en un `Button` ghost de 44×44px en el header. Badge circular sobre la esquina superior derecha con la cantidad total de unidades; oculto con el carrito vacío. El badge solo aparece tras la hidratación del cliente (el conteo vive en `localStorage`), nunca en el render del servidor. |
| Fila de ítem | Anatomía fija: miniatura (64×64px, imagen primaria del producto o placeholder) → nombre (`line-clamp-2`) → precio unitario → stepper de cantidad → subtotal de línea → botón "Quitar". |
| Stepper de cantidad | Controles `−` y `+` de mínimo 44×44px (WCAG 2.5.5). `−` se deshabilita en cantidad 1: el mínimo es 1 y para llegar a 0 se usa "Quitar" (ver [cart-whatsapp-checkout.md](./cart-whatsapp-checkout.md), RF-4). |
| Total | Al pie del sheet (`SheetFooter`): etiqueta "Total" + monto en COP. |
| Estado vacío | Copy centrado "Tu carrito está vacío" + subtexto "Agrega productos desde el catálogo." El botón "Pedir por WhatsApp" no se muestra con el carrito vacío. |
| Checkout | Botón "Pedir por WhatsApp" al pie; deshabilitado mientras haya ítems no disponibles sin quitar. Abre `wa.me` en pestaña nueva (ver [cart-whatsapp-checkout.md](./cart-whatsapp-checkout.md), RF-7). |
| Revalidación | Antes de abrir WhatsApp se revalida disponibilidad y precio contra la base de datos; los ítems con cambios se marcan en su fila y los no disponibles deben quitarse antes de continuar. |
| Motion | Apertura/cierre del `Sheet` vía `data-state` (ver [ADR-0007](../adr/0007-motion-strategy-css-radix.md)); respeta `prefers-reduced-motion`. |

### Home

| Sección | Regla |
|---|---|
| Hero | Estático, sin carrusel autorotativo; la imagen es clickable hacia el producto que retrata. |
| Destacados | 4-8 productos curados en un bloque asimétrico tipo "bento" (uno grande + 2-3 menores), no el catálogo completo. |
| Historia de marca | Bloque editorial ("hecho a mano en [ciudad]"). |

### Footer

3-4 columnas — Información/Políticas, Contacto + WhatsApp, Newsletter, Redes — modeladas sobre el footer real de Clemont. En mobile, cada columna colapsa a un acordeón.

### Panel de administración

Patrón nuevo — introducido junto con el CRUD de categorías, primera pantalla del panel admin (`admin-panel.md`).

| Elemento | Regla |
|---|---|
| Chrome | Barra superior con "Tienda · Admin", navegación Categorías/Productos y "Cerrar sesión"; contenedor central. El panel no hereda el header/footer públicos ni el carrito — es un layout propio, sin componentes del catálogo. |
| Formularios CRUD | Una columna, etiqueta arriba del campo, primitivas Input/Textarea/Select/Switch. Validación server-side con errores legibles bajo cada campo (`useActionState`); sin librería de formularios (ver fila Form de la tabla de componentes). Campos relacionados (ej. Precio + Disponibilidad) pueden compartir fila en `sm+`; flags de visibilidad (Destacado, Activo) se agrupan bajo una etiqueta muda ("Visibilidad") separada por un borde superior. El mensaje de éxito/error (`FormAlert`) se ubica junto al botón de envío, no arriba del formulario — feedback cerca de la acción que lo produjo. Una sola acción primaria (rellena) por formulario. |
| Listas | Tabla en desktop, tarjetas en mobile; miniatura, toggles inline y controles ▲▼ para `display_order`. Filas de producto agrupadas por categoría con un subencabezado discreto por grupo (texto muted, `text-xs uppercase tracking-wide`, fondo sutil); el nombre del producto es un link a su edición, mismo estilo de texto con subrayado al hover. Alta/baja de un producto se gestiona solo con el Switch `Activo` — sin botón destructivo por fila; el destructivo relleno queda reservado al botón de confirmación dentro de un Dialog. En las cards mobile, cada Switch lleva una etiqueta visible junto al control (ej. "Destacado", "Activo"), no solo `aria-label`. Controles ▲▼ como íconos ghost compactos, mismo tratamiento que las acciones de imagen. |
| Edición de producto | Layout de dos columnas en desktop (`datos` 1fr / `imágenes` 380px), apiladas en mobile; encabezado de página con enlace de vuelta, nombre y badge de estado (Activo/Inactivo). Cada zona es un `Card` con heading real (`CardTitle`, `text-lg`) en vez de un `<h2>` suelto — una sola acción primaria por página (Guardar). |
| Confirmaciones | Toda acción destructiva usa Dialog; cambiar un slug ya publicado pide confirmación explícita antes de guardar. El disparador de una confirmación puede ser un ícono ghost (ej. eliminar imagen: `Trash2` ghost, rojo solo en el ícono) — el destructivo relleno queda reservado al botón de confirmación dentro del Dialog. |
| Estados sobre imagen | Un estado (ej. "Principal") se muestra como badge absoluto sobre la miniatura, no como botón deshabilitado — estado ≠ acción. Las acciones disponibles (marcar principal, reordenar, eliminar) son íconos ghost compactos debajo de la imagen. |
| Subida de imágenes | Validación de tipo/tamaño antes de subir; una imagen por request; estado por archivo. El disparador vive en el encabezado de la zona "Imágenes" (`CardAction`), no debajo de la grilla. La lista de estado, una vez que el lote termina, solo muestra filas pendientes y con error — las filas exitosas se retiran porque la miniatura en la grilla ya comunica el éxito. |

## Direcciones visuales

**Estado: dirección A seleccionada (2026-07-19).** B y C quedan documentadas como alternativas por si la dueña del negocio pide un cambio al ver el mockup comparativo.

| Dirección | Paleta | Tipografía | Estado |
|---|---|---|---|
| A — "Barrio Cálido" | Base crema `#FAF6F0`, texto carbón `#2B2622`, acento terracota `#C36F4E` (sage `#8A9A7E` opcional, solo en tags) | Display: Fraunces · Cuerpo: Inter | **Seleccionada** |
| B — "Papel y Tinta" | Base casi blanca `#FBFBF9`, acento salvia `#4A5446`, rosa polvo `#C9A0A0` (uso escaso) | Display: Playfair/Cormorant · Cuerpo: Karla/Nunito Sans | Alternativa |
| C — "Estudio Hecho a Mano" | Base hueso `#F7F3E8`, texto arcilla `#5C4433`, acento único (coral `#E8734F` o miel `#D9A441`) reservado al CTA de WhatsApp | Display: Bricolage Grotesque · Cuerpo: Lora/Inter | Alternativa |

Máximo 2 familias tipográficas por dirección: un display (hero, títulos de categoría) sobre un cuerpo sans.

**Carga de fuentes**: Fraunces e Inter se cargan con `next/font/google` y `subsets: ['latin']`. El subset `latin` de Google Fonts ya cubre los caracteres del español (á, é, í, ó, ú, ñ, ü, ¿, ¡ — todos dentro del bloque Latin-1 Supplement); `latin-ext` no es necesario acá, ese subset solo suma cobertura para lenguas de Europa central/oriental y vietnamita. `next/font` descarga los archivos en build time y los sirve self-hosted desde el propio dominio — sin request en runtime a Google — y ajusta automáticamente las métricas de la fuente de fallback para minimizar CLS.

## Escenarios de usuario

1. Una desarrolladora agrega una pantalla nueva: consulta esta spec, reutiliza los tokens de tipografía/espaciado y elige el componente shadcn correspondiente en vez de definir estilos ad hoc.
2. Una compradora navega en mobile: el header muestra un menú compacto en vez del mega-menú; al abrir el carrito, se despliega un `Sheet` en vez de un dropdown, priorizando el espacio reducido.
3. Una compradora navega en desktop: el mega-menú expone las categorías en columnas al pasar el cursor por "Categorías", siguiendo el patrón Apple.

## Casos borde

- **Categoría sin imagen de portada**: el mega-menú y las cards muestran un placeholder neutro en vez de romper el layout.
- **Nombre de producto muy largo**: se trunca con `line-clamp` en la card, el texto completo permanece disponible en el detalle.
- **Muchas categorías activas**: el mega-menú debe soportar scroll interno en vez de desbordar la pantalla.
- **Imagen sin `alt_text` cargado**: se usa el `name` del producto como alternativa mínima para no dejar el atributo `alt` vacío.

## Touchpoints de datos

- No hay tabla propia de este documento; los tokens viven en `globals.css` (bloque `@theme` de Tailwind v4).
- `product_images.alt_text` alimenta el atributo `alt` de las imágenes (ver [data-model.md](./data-model.md)).
- `categories.display_order` y `products.display_order` determinan el orden en el mega-menú y en las listas (ver [data-model.md](./data-model.md)).

## Preguntas abiertas

- Evaluar dark mode como mejora futura, fuera del alcance de v1.
