# ADR-0007: Estrategia de motion v1 — CSS + Radix, sin librería JS

## Estado

Accepted

## Fecha

2026-07-19

## Contexto

`docs/specs/design-system.md` excluye "animaciones o microinteracciones avanzadas" del alcance. Aun así, el checkout por WhatsApp sin pasarela de pago depende de feedback visual al agregar un producto, y componentes ya adoptados (`Sheet`, mega-menú) traen animaciones `data-state` de Radix. Faltaba precisar qué motion entra en v1 sin reabrir esa exclusión ni contradecir el criterio server-first de ADR-0006 (`"use client"` mínimo, mantenible por un junior).

## Decisión

V1 no incorpora librerías de animación JS: usa transiciones de Tailwind CSS y las animaciones `data-state` que shadcn/Radix ya traen vía `tailwindcss-animate` (ADR-0005). Alcance: zoom en hover de la imagen de producto (`@media (hover: hover)`); feedback del botón agregar/WhatsApp (etiqueta + escala breve); apertura del `Sheet` del carrito y revelado del mega-menú vía `data-state`; opcionalmente, reveals de scroll bajo el pliegue con `animation-timeline: view()` con fallback sin animación. `prefers-reduced-motion` es obligatorio en toda regla animada (WCAG 2.1 AA). Fuera de alcance: hero/LCP, carruseles automáticos, parallax, stagger por tarjeta en grillas largas y View Transitions por ruta (experimental).

## Alternativas consideradas

- **Motion** (motion.dev, ex-Framer Motion, MIT): único fallback aprobado si surge una necesidad real de orquestación JS, acotado a hojas cliente aisladas.
- **GSAP** (ahora gratuito): descartado; su diferencial de scroll-pinning no aplica a este catálogo.
- **Aceternity UI / react-bits**: descartados; su estética animation-first contradice el criterio Clemont-minimal del proyecto.

## Consecuencias

- No agrega peso de bundle ni nuevos límites `"use client"` más allá de los que la interactividad ya requiere.
- Clarifica, no revierte, la exclusión de `design-system.md`: este set de CSS es una precisión de alcance, no una reversión.
- Cada regla animada debe incluir `prefers-reduced-motion` como disciplina de implementación.
- Si a futuro se necesita orquestación JS real, Motion queda preaprobado como fallback.
