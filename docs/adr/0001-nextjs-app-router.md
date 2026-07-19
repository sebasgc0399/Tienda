# ADR-0001: Next.js con App Router

## Estado

Accepted

## Fecha

2026-07-19

## Contexto

La tienda necesita un catálogo indexable por buscadores (SEO) con contenido que se actualiza con poca frecuencia, ideal para SSG con revalidación incremental (ISR). Además, el mismo repositorio debe cubrir tanto el sitio público (catálogo, carrito) como el panel de administración, y se busca evitar mantener una API HTTP separada solo para las mutaciones del admin.

## Decisión

Se usa Next.js con App Router como framework principal del proyecto.

## Alternativas consideradas

- **SPA con Vite + backend propio**: requiere construir y mantener una API separada, y el SEO del catálogo exige trabajo adicional de pre-renderizado que Next.js resuelve nativamente.
- **Astro**: fuerte en sitios estáticos, pero el panel de administración necesita interactividad y mutaciones que encajan mejor con el modelo de Server Components/Server Actions de Next.js.
- **Remix**: alternativa válida con SSR, pero se descarta por menor alineación con el ecosistema Supabase y por preferencia de mantener un único framework full-stack ampliamente documentado para que Estevan continúe el desarrollo.

## Consecuencias

- El catálogo puede servirse con SSG/ISR para SEO y performance, sin sacrificar datos frescos.
- Un solo repositorio y un solo framework cubren público y admin, simplificando el mantenimiento para un desarrollador único.
- Las mutaciones del admin se implementan con Server Actions, sin necesidad de exponer una API REST/GraphQL adicional.
- El equipo queda atado a las convenciones y ciclo de releases de Next.js App Router.
