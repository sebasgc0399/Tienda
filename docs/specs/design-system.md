# Spec: Design System

## Objetivo

Definir guardrails visuales y de interacción para la tienda: tokens de diseño sobre el theme de Tailwind y un inventario de componentes shadcn/ui, de modo que cualquier pantalla nueva (pública o admin) se construya de forma consistente sin depender de specs pixel-perfect por pantalla.

## Alcance / Fuera de alcance

**Alcance:**
- Interpretación de las tres referencias del cliente en principios de diseño accionables.
- Tokens de diseño (paleta, escala tipográfica, espaciado, radios) sobre `tailwind.config.ts`.
- Inventario de componentes shadcn/ui a usar y su propósito.
- Reglas de responsive mobile-first.
- Accesibilidad básica (contraste, foco, texto alternativo).
- Idioma de la UI: español, sin framework de i18n.

**Fuera de alcance:**
- Entregables de Figma o mockups de alta fidelidad.
- Specs pixel-perfect por pantalla.
- Animaciones o microinteracciones avanzadas.
- Dark mode.

## Requisitos funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RF-1 | Interpretación de referencias | The North Face aporta el criterio editorial (imagen de producto grande y protagonista, header persistente/sticky); Clemont aporta minimalismo (whitespace generoso, tipografía refinada, pocos elementos por vista); Apple aporta el patrón de navegación (mega-menú por columnas organizado por categoría). |
| RF-2 | Tokens de diseño | Paleta neutra (grises + un color de acento de marca a definir), sin colores saturados de fondo, priorizando que la imagen del producto sea el elemento de color dominante. |
| RF-3 | Escala tipográfica | Escala corta sobre las clases de Tailwind: `text-4xl`/`text-3xl` para títulos, `text-xl` para subtítulos, `text-base` para cuerpo, `text-sm` para metadatos (precio secundario, etiquetas). Peso `font-bold` en títulos, `font-normal` en cuerpo. |
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
| Form | Formularios CRUD de productos/categorías, con validación. |
| Sheet | Carrito en mobile (panel deslizante lateral). |

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

- No hay tabla propia de este documento; los tokens viven como configuración en `tailwind.config.ts` y `globals.css`.
- `product_images.alt_text` alimenta el atributo `alt` de las imágenes (ver `data-model.md`).
- `categories.display_order` y `products.display_order` determinan el orden en el mega-menú y en las listas (ver `data-model.md`).

## Preguntas abiertas

- Color de acento de marca definitivo: pendiente de definición con la dueña del negocio.
- Evaluar dark mode como mejora futura, fuera del alcance de v1.
