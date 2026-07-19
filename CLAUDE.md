# CLAUDE.md — Guía operativa de Tienda

Guía operativa para agentes de IA y para cualquier desarrollador (incluido Estevan, quien va a continuar este proyecto de forma independiente después de hacer fork) que trabaje en este repositorio.

Este documento explica **cómo** se trabaja día a día en el repo: comandos, estructura de carpetas, convenciones de nombres y reglas de mantenimiento. No repite el **por qué** de las decisiones de arquitectura (eso vive en los ADRs, `docs/adr/`) ni el **qué** de cada feature (eso vive en los specs, `docs/specs/`). Para entender por qué se eligió Supabase o qué debe hacer el carrito, conviene consultar el documento correspondiente en lugar de buscarlo aquí. La sección 8 explica esta división con más detalle.

## 1. Resumen

Tienda es una vitrina e-commerce-lite para un negocio familiar en Colombia que vende arreglos artesanales (ramos combinando jabones, flores y chocolates), gorras y decoraciones. El sitio público muestra el catálogo con precios siempre visibles en pesos colombianos (COP), permite armar un carrito y cerrar el pedido enviando un mensaje pre-armado por WhatsApp — sin pasarela de pago, porque el negocio ya cierra ventas por ese canal. Un panel de administración en español, pensado para una usuaria única no técnica, permite gestionar categorías, productos e imágenes sin depender de un desarrollador para cada cambio. El stack es Next.js (App Router) sobre Supabase (Postgres + Auth + Storage), desplegado en Vercel.

### Términos usados en este documento

| Sigla | Significado | Dónde aparece |
|---|---|---|
| RSC | React Server Component | Secciones 5 y 9, [ADR-0006](docs/adr/0006-feature-based-structure-and-server-components.md) |
| RLS | Row Level Security (control de acceso por fila en Postgres) | Sección 9, [admin-panel.md](docs/specs/admin-panel.md) |
| ISR | Incremental Static Regeneration | [ADR-0001](docs/adr/0001-nextjs-app-router.md) |
| COP | Peso colombiano | Sección 1, [data-model.md](docs/specs/data-model.md) |
| ADR | Architecture Decision Record | Sección 8, [docs/README.md](docs/README.md) |

## 2. Estado del proyecto

**Fase actual: documentación.** Este repositorio contiene por ahora únicamente la base documental (ADRs, specs y esta guía). Todavía no existe scaffold de Next.js, ni proyecto de Supabase configurado con sus migraciones SQL, ni implementación del diseño visual. El objetivo de esta fase es dejar las decisiones y el diseño por escrito antes de escribir la primera línea de código de la aplicación, para que cualquiera que continúe el proyecto — humano o agente de IA — pueda entender qué construir y por qué sin tener que preguntar.

| Elemento | Estado |
|---|---|
| Documentación (ADRs + specs + esta guía) | Completa |
| Scaffold de Next.js | Pendiente |
| Proyecto de Supabase (migraciones SQL) | Pendiente |
| Diseño visual implementado | Pendiente |
| Deploy en Vercel | Pendiente |

Cuando se ejecute el scaffold, quien lo haga debe volver a este archivo y actualizar la sección 4 (Comandos) con los comandos reales que aparezcan en `package.json`. No dejar los `TBD` de esa tabla sin actualizar — un `CLAUDE.md` con comandos falsos es peor que uno sin comandos.

### Flujo de trabajo previsto

Este repositorio nace como base documental para que otra persona lo continúe de forma independiente:

1. La base (esta documentación) se construye y se publica en `main`.
2. Estevan hace fork del repositorio.
3. Estevan ejecuta el scaffold de Next.js, configura su propio proyecto de Supabase y despliega su fork en su propia cuenta de Vercel (ver [ADR-0004](docs/adr/0004-vercel-deployment.md)).
4. A partir de ahí, Estevan continúa el desarrollo de forma autónoma, apoyándose en los ADRs y specs de este repositorio para entender el porqué y el qué de cada decisión ya tomada.

Este documento, los ADRs/specs enlazados y la guía paso a paso en [docs/guides/setup-desde-cero.md](docs/guides/setup-desde-cero.md) son, en conjunto, el material de traspaso: no requieren una sesión de onboarding en vivo para ser entendidos.

## 3. Stack

Cada fila enlaza al ADR donde está justificada la elección. Esta tabla es un mapa de navegación, no reemplaza la lectura del ADR si se necesita el contexto completo.

| Capa | Tecnología | ADR |
|---|---|---|
| Framework | Next.js (App Router) | [ADR-0001](docs/adr/0001-nextjs-app-router.md) |
| Backend (base de datos, autenticación, almacenamiento de archivos) | Supabase (Postgres) | [ADR-0002](docs/adr/0002-supabase-vs-firebase.md) |
| Checkout | Mensaje pre-armado vía `wa.me` (sin pasarela de pago) | [ADR-0003](docs/adr/0003-whatsapp-checkout-no-payment-gateway.md) |
| Deploy | Vercel | [ADR-0004](docs/adr/0004-vercel-deployment.md) |
| Estilos y componentes de UI | Tailwind CSS + shadcn/ui | [ADR-0005](docs/adr/0005-styling-tailwind-shadcn.md) |
| Organización del código | Feature-based, Server Components por defecto | [ADR-0006](docs/adr/0006-feature-based-structure-and-server-components.md) |

Notas operativas sobre cómo se usa cada capa una vez exista código (sin repetir el porqué, que está en el ADR correspondiente):

- El cliente de Supabase vive en `lib/` con tres variantes (detalle de seguridad de cada una en la sección 9):
  1. **Cliente de browser** — `createBrowserClient` (`@supabase/ssr`), usa la `anon key` pública, corre en componentes `"use client"`, sujeto a RLS.
  2. **Cliente de servidor por sesión** — `createServerClient` (`@supabase/ssr`), `anon key` + cookies vía `next/headers`, sujeto a RLS. Es el cliente que usan los Server Components para las lecturas del catálogo público (home, listado, detalle).
  3. **Cliente admin/service** — `createClient` (`@supabase-js`), `service_role key`, evita RLS por completo, server-only. Uso concreto en v1: las mutaciones del admin (Server Actions en `features/admin/actions/` — filas de `categories`/`products`/`product_images` y objetos de Storage), siempre después de que la propia Server Action re-verificó la sesión con `getUser()`/`getClaims()` (ver sección 9) — esa re-verificación, no RLS, es lo que impide que cualquiera dispare estas mutaciones. Nunca se usa para renderizar páginas públicas ni anónimas.
- Los componentes de shadcn/ui no llegan como dependencia de `node_modules`: su CLI los copia como código fuente dentro de `components/ui/`, así que se editan directamente en el repo en vez de "actualizarse" con un gestor de paquetes.
- Las rutas de `app/` son deliberadamente finas: obtienen datos y componen features, pero la lógica vive en `features/`, conforme a la organización feature-based del ADR-0006.

## 4. Comandos

Ningún comando existe todavía porque el scaffold de Next.js no se ha ejecutado. La tabla queda como placeholder de lo que hay que completar apenas exista `package.json`.

### Requisitos

Node.js >= la versión mínima que exija la versión de Next.js que se scaffoldee. Hoy Next.js 16 requiere Node.js >= 20.9 (Node 18 no soportado; verificado en nextjs.org/docs, instalación v16.2.10).

Gestor de paquetes pineado: **pnpm** (no `npm` ni `yarn`). Se instala vía Corepack, que ya viene con Node.js: `corepack enable`. La versión exacta queda fijada en el campo `packageManager` de `package.json` en cuanto exista el scaffold; Corepack la resuelve sola en el primer `pnpm install`.

| Acción | Comando |
|---|---|
| Instalar dependencias | TBD |
| Levantar entorno de desarrollo | TBD |
| Build de producción | TBD |
| Lint | TBD |
| Tests | TBD — no hay estrategia de tests definida todavía (ver [docs/README.md](docs/README.md), sección "Qué NO documentamos") |
| Generar tipos TypeScript desde el esquema de Supabase | TBD |
| Aplicar migraciones SQL a Supabase | TBD |

**Migraciones de base de datos (decisión ya tomada, independiente del scaffold):** viven como archivos SQL versionados en `supabase/migrations/`, committeados al repo. Se aplican al principio manualmente desde el SQL Editor del dashboard de Supabase, en orden; Supabase CLI (`supabase db push`) queda como camino de crecimiento opcional para más adelante, no como requisito inicial. Paso a paso operativo en [docs/guides/setup-desde-cero.md](docs/guides/setup-desde-cero.md).

**Instrucción para quien haga el scaffold:**

- Comando pineado — no usar los "recommended defaults" del CLI tal cual: `src/` es una pregunta opt-in con default "No" (el flujo de defaults recomendados trae TypeScript, ESLint, Tailwind, App Router y AGENTS.md, pero no `src/`), y `--yes` tampoco lo activa.

  ```
  npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --no-agents-md --use-pnpm
  ```

  Esto fuerza el árbol `src/` que exige la sección 5 sin depender de lo que se responda en los prompts restantes que puedan quedar interactivos.
- `--no-agents-md` es obligatorio en este repo: `create-next-app` trae `--agents-md` activado por defecto y genera, además de `AGENTS.md`, un `CLAUDE.md` propio de una sola línea (`@AGENTS.md`) en la raíz — correrlo sin esta bandera **sobrescribe** este archivo gobernado de ~250 líneas con esa línea única, no lo duplica.
- El scaffold corre in-place en la raíz de este repo (target `.`), que ya contiene `CLAUDE.md`, `README.md`, `docs/` y `.atl/`; si el CLI rechaza el directorio por archivos existentes, resolverlo sin perder estos archivos, y nunca dejar que un scaffold generado aparte sobrescriba este `CLAUDE.md` al fusionarse.
- Si en algún momento se quiere el `AGENTS.md` que genera Next.js (puntero a su documentación empaquetada), no usar `--no-agents-md` para ese archivo específico, pero sí registrar el `AGENTS.md` resultante en el mapa de documentación (sección 7/8) para que no quede como archivo no gobernado; si no se quiere, mantener `--no-agents-md`.
- En cuanto `package.json` exista, reemplazar cada `TBD` por el comando real (por ejemplo `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`) en el mismo PR que agrega el scaffold. Esta tabla es la primera fuente que va a consultar cualquier agente de IA antes de correr un comando — mantenerla desactualizada rompe esa confianza.

## 5. Estructura del proyecto

Todavía no existe código de aplicación, pero la organización de `src/` ya está decidida (ver [ADR-0006](docs/adr/0006-feature-based-structure-and-server-components.md)): feature-based, con React Server Components (RSC) por defecto y `"use client"` reservado para las hojas interactivas del árbol de componentes.

```
src/
  app/           # rutas finas: (public)/ y admin/
  features/      # catalog/, cart/, admin/ — el corazón del código
  components/ui/ # primitivos shadcn/ui
  lib/           # cliente de Supabase, utilidades, formato de moneda
  types/
```

Responsabilidad de cada carpeta:

| Carpeta | Responsabilidad |
|---|---|
| `app/` | Solo rutas (`page.tsx`, `layout.tsx`) y composición de features. Sin lógica de negocio. |
| `features/catalog/` | Home, mega-menú por categorías, listado por categoría, detalle de producto. |
| `features/cart/` | Carrito en `localStorage` y construcción del mensaje de checkout por WhatsApp. |
| `features/admin/` | Login, CRUD de categorías/productos, gestión de imágenes. |
| `components/ui/` | Componentes shadcn/ui sin lógica de negocio (botón, dialog, sheet, etc.), compartidos entre features. |
| `lib/` | Cliente de Supabase (browser y server), utilidades compartidas, formato de moneda COP. |
| `types/` | Tipos compartidos, por ejemplo los tipos generados a partir del esquema de Supabase. |

Dentro de cada feature, el patrón a seguir es: un componente Server Component obtiene los datos (consulta a Supabase en el servidor) y se los pasa a un componente presentacional; las mutaciones se hacen vía Server Actions, no vía una API HTTP separada. Ejemplo ilustrativo de cómo se vería esa co-locación dentro de `features/catalog/` (nombres de archivo a modo de ejemplo, no una lista cerrada):

```
src/features/catalog/
  components/
    product-card.tsx        # exporta ProductCard
    category-mega-menu.tsx  # exporta CategoryMegaMenu
  actions/
    get-featured-products.ts
  types.ts
```

El mismo patrón se repite en las otras dos features. En `features/cart/`, la lógica de `localStorage` y la construcción del mensaje de WhatsApp quedan aisladas de los componentes que solo pintan el carrito:

```
src/features/cart/
  components/
    cart-sheet.tsx           # exporta CartSheet ("use client": necesita estado)
    cart-item-row.tsx        # exporta CartItemRow
  lib/
    build-whatsapp-message.ts
    cart-storage.ts
```

En `features/admin/`, cada recurso administrable (productos, categorías) tiene su propia carpeta de Server Actions, separada de los formularios que las invocan:

```
src/features/admin/
  components/
    product-form.tsx         # exporta ProductForm ("use client": formulario)
    image-uploader.tsx       # exporta ImageUploader ("use client": input de archivo)
  actions/
    create-product.ts
    update-product.ts
    delete-product-image.ts
```

Estos árboles son ilustrativos — el nombre exacto de cada archivo se define al implementar cada feature — pero fijan el criterio: componentes interactivos llevan `"use client"` explícito en el comentario o en la primera línea del archivo, la lógica que no es JSX (armar el mensaje de WhatsApp, leer `localStorage`, llamar a Supabase) vive separada del componente que la usa.

### Patrón container/presentacional en términos de App Router

El ADR-0006 decide "RSC obtiene datos → presentacional pinta"; en la práctica, dentro de una misma feature eso se ve así:

```tsx
// src/features/catalog/components/featured-products.tsx
// Server Component (sin "use client"): obtiene los datos.
import { getFeaturedProducts } from "../actions/get-featured-products"
import { ProductCard } from "./product-card"

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

```tsx
// src/features/catalog/components/product-card.tsx
// Presentacional: recibe props, no llama a Supabase directamente.
type ProductCardProps = {
  product: { id: string; name: string; price: number }
}

export function ProductCard({ product }: ProductCardProps) {
  return <article>{/* ... */}</article>
}
```

`FeaturedProducts` solo se vuelve un componente con `"use client"` si en algún momento necesita estado o manejadores de eventos propios (por ejemplo, un carrusel controlado por el usuario) — mientras solo obtenga y renderice datos, se queda como Server Component.

## 6. Convenciones

| Elemento | Convención | Nota |
|---|---|---|
| Archivos y carpetas | `kebab-case` | Obligatorio: Windows no distingue mayúsculas/minúsculas en el filesystem, pero Linux (donde corre Vercel) sí. Un archivo creado como `ProductCard.tsx` en Windows e importado en el código como `product-card.tsx` compila en local y **falla en el deploy**. |
| Componentes React | `PascalCase` | Es el nombre exportado, no el del archivo. El archivo `product-card.tsx` exporta el componente `ProductCard`. |
| Server Actions | `camelCase` | Ejemplos: `createProduct`, `toggleFeatured`, `deleteCategoryImage`. |
| Tablas de base de datos | `snake_case`, en plural | Ejemplos: `categories`, `products`, `product_images`. Esquema completo en [data-model.md](docs/specs/data-model.md). |
| Variables de entorno expuestas al cliente | Prefijo `NEXT_PUBLIC_` | Ejemplo: `NEXT_PUBLIC_WHATSAPP_NUMBER`. Cualquier variable sin ese prefijo se asume server-only y no debe llegar al bundle del cliente. |

### Ejemplo aplicado

Para fijar la regla de casing con un caso concreto: un componente de tarjeta de producto se guarda como `src/features/catalog/components/product-card.tsx` (archivo en kebab-case) y dentro del archivo se exporta como `export function ProductCard()` (componente en PascalCase). La Server Action que lo acompaña para marcarlo como destacado vive en `src/features/admin/actions/toggle-featured.ts` (archivo en kebab-case) y se exporta como `export async function toggleFeatured()` (acción en camelCase). Mismo criterio para cualquier archivo nuevo: el nombre del archivo nunca lleva mayúsculas.

### Excepción: archivos reservados de Next.js

Los archivos que App Router reconoce por convención (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) mantienen exactamente ese nombre en minúsculas — no es una violación a la regla de `kebab-case`, es el nombre que exige el framework y ya cumple el formato. Las carpetas de rutas dinámicas siguen la convención de Next.js entre corchetes y usan el término en español ya definido en los specs, por ejemplo `app/(public)/categoria/[slug]/page.tsx` y `app/(public)/producto/[slug]/page.tsx` (ver [public-catalog.md](docs/specs/public-catalog.md)).

## 7. Mapa de documentación

El índice completo de ADRs y specs, con una descripción de una línea por cada uno y la lista explícita de qué NO se documenta en este repositorio, está en [docs/README.md](docs/README.md). No se repite esa lista aquí para evitar mantener el mismo inventario en dos lugares — si se agrega un ADR o un spec nuevo, se actualiza únicamente `docs/README.md`.

Hoy el repositorio tiene 7 ADRs (`docs/adr/0001` a `0007`) y 5 specs (`docs/specs/`), más una plantilla de cada tipo para documentos futuros, más `docs/guides/` para guías operativas cortas que no encajan como ADR ni como spec (por ejemplo, la guía de fotografía de productos). Si aparece una decisión de arquitectura o una feature que no encaja en ninguno de los documentos existentes, corresponde crear uno nuevo con la plantilla — no forzarla dentro de un documento que responde otra pregunta.

Si un ADR y un spec parecen contradecirse, la causa casi siempre es que uno de los dos quedó desactualizado tras un cambio que no se propagó — no que existan dos respuestas válidas. En ese caso, se corrige el documento desactualizado en vez de dejar la contradicción o de resolverla verbalmente sin dejar rastro escrito.

## 8. Regla de mantenimiento

Cada documento tiene una responsabilidad exclusiva y no se pisan entre sí. Si algo cambia, se actualiza donde vive ese tipo de información — no se copia el cambio a otro archivo.

| Documento | Responde | Cuándo actualizarlo |
|---|---|---|
| ADR (`docs/adr/`) | ¿Por qué se tomó esta decisión de arquitectura? | Al tomar una **nueva** decisión de arquitectura, se crea un ADR nuevo con número consecutivo (no se edita uno existente, salvo para marcarlo como reemplazado por otro). |
| Spec (`docs/specs/`) | ¿Qué debe hacer esta feature? | Al cambiar el comportamiento de una feature, se actualiza el spec correspondiente **en el mismo PR** que cambia el código — nunca en un PR separado ni "después". |
| CLAUDE.md (este archivo) | ¿Cómo se trabaja en este repo día a día? | Al cambiar comandos, estructura de carpetas o convenciones de nombres. |

Regla corta para recordar: **ADR = por qué, spec = qué, CLAUDE.md = cómo.**

Tres ejemplos concretos de cómo aplicar la tabla anterior:

1. **Nueva decisión de arquitectura.** Si más adelante se decide agregar una pasarela de pago (por ejemplo Wompi), eso reemplaza a [ADR-0003](docs/adr/0003-whatsapp-checkout-no-payment-gateway.md) — corresponde crear un ADR nuevo que documente el cambio y marcar el ADR-0003 como reemplazado, además de actualizar [cart-whatsapp-checkout.md](docs/specs/cart-whatsapp-checkout.md) con el nuevo comportamiento, todo en el mismo PR que implementa el cambio.
2. **Cambio de comportamiento sin cambio de arquitectura.** Si se decide que el catálogo debe permitir filtrar productos por rango de precio, no hace falta un ADR nuevo (no cambia ninguna tecnología ni decisión estructural) — alcanza con actualizar [public-catalog.md](docs/specs/public-catalog.md) con el nuevo requisito funcional, en el mismo PR que agrega el filtro.
3. **Cambio operativo.** Si el equipo decide que las Server Actions van a llevar el sufijo `Action` (por ejemplo `createProductAction`), eso no es una decisión de arquitectura ni un cambio de comportamiento de una feature — se actualiza la sección 6 de este archivo, sin tocar ADRs ni specs.

## 9. Guardrails para agentes de IA

Reglas no negociables al generar o modificar código en este repositorio. Todas están fundamentadas en un ADR o en un requisito de spec (columna derecha); esta tabla es el recordatorio operativo rápido para no tener que releer todo antes de escribir código.

| Guardrail | En la práctica | Fundamento |
|---|---|---|
| Nunca commitear secretos ni `.env` | `.env` debe estar en `.gitignore` desde el primer commit del scaffold. Credenciales de Supabase siempre por variable de entorno, nunca hardcodeadas. | [admin-panel.md](docs/specs/admin-panel.md) |
| `service_role key` solo en servidor | Se usa únicamente en Server Actions y route handlers, nunca en un archivo con `"use client"` ni con prefijo `NEXT_PUBLIC_`, y nunca para renderizar páginas públicas — las lecturas del catálogo público usan el cliente de servidor por sesión (`anon key` + RLS, ver sección 3), no el cliente admin/service. | [admin-panel.md](docs/specs/admin-panel.md) |
| Respetar RLS en toda consulta nueva | Lectura pública limitada a `is_active = true`. Ninguna tabla otorga policies de escritura a `anon`/`authenticated` (esquema completo en [data-model.md](docs/specs/data-model.md#row-level-security-rls)): la autoridad real de escritura es la `service_role key`, sumada a la re-verificación de sesión dentro de la propia Server Action (ver guardrail siguiente) — RLS por sí sola ya no es lo que autoriza las escrituras del admin. No usar `service_role key` como atajo para saltarse RLS desde código que corre en el cliente. | [admin-panel.md](docs/specs/admin-panel.md), [data-model.md](docs/specs/data-model.md) |
| Toda Server Action que muta re-verifica sesión server-side | Primera línea: `getUser()`/`getClaims()`; rechazar si no hay usuario válido, antes de cualquier escritura o uso de `service_role key`. El redirect de RF-2 es UX, no frontera de seguridad. | [admin-panel.md](docs/specs/admin-panel.md) (Seguridad), Next.js data security |
| Protección de `/admin/**` vive en `src/proxy.ts`, no en `middleware.ts` | Next.js 16 renombró `middleware.ts`/`middleware()` a `proxy.ts`/`proxy()` (el anterior queda deprecado, no removido — se mantiene solo para runtime edge). Llamar `supabase.auth.getClaims()` justo después de crear el cliente de servidor en cada request que matchee, para rotar/persistir el token — omitirlo desloguea a la usuaria al azar. | [admin-panel.md](docs/specs/admin-panel.md) (RF-2), Supabase SSR docs |
| Imágenes van a Storage, no al repo | Se suben al bucket `product-images` de Supabase Storage; nunca se commitean al repositorio ni se guardan como archivos estáticos en `public/`. | [ADR-0002](docs/adr/0002-supabase-vs-firebase.md), [admin-panel.md](docs/specs/admin-panel.md) |
| Preferir Server Components | `"use client"` solo cuando el componente necesita interactividad real (estado, manejadores de eventos, hooks de navegador). | [ADR-0006](docs/adr/0006-feature-based-structure-and-server-components.md) |
| Datos de ejemplo y credenciales en SQL | Los archivos de `supabase/migrations/` (y cualquier futuro seed) se committean a un repo público: usar solo datos placeholder (p. ej. `admin@example.com`, nombres/precios de ejemplo), nunca un email personal real ni contraseñas/keys hardcodeadas — la misma regla del `.env` aplica al contenido de los SQL. El usuario admin se crea desde el dashboard de Supabase (ver [setup §5](docs/guides/setup-desde-cero.md)), no por seed. | [admin-panel.md](docs/specs/admin-panel.md) (Seguridad), setup §5 |
| Antes de SQL riesgoso en producción (`DROP`/`DELETE`/`ALTER`) | Exportar `categories`/`products`/`product_images` a CSV primero (Table Editor > Export to CSV) — el tier gratuito no tiene backups automáticos. | [setup-desde-cero.md](docs/guides/setup-desde-cero.md#backups) |

Ejemplo de estructura esperada para `.env` (nombres ilustrativos, sin valores reales — este archivo nunca se commitea):

```
# server-only — nunca se expone al cliente
SUPABASE_SERVICE_ROLE_KEY=

# público — llega al bundle del cliente, por eso el prefijo
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# número WhatsApp en formato internacional, solo dígitos, sin +, sin ceros a la izquierda ni espacios (ej. 573001234567)
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

Si un agente de IA necesita generar o modificar este archivo, debe usar `.env.example` (sin valores reales, sí commiteable) como plantilla y dejar `.env` fuera del control de versiones.
