# ADR-0007: Estrategia de motion v1 — CSS + primitivas de shadcn (data-state), sin librería JS

## Estado

Accepted

## Fecha

2026-07-19

## Contexto

`docs/specs/design-system.md` deja la estrategia de motion/microinteracciones fuera de su alcance y remite la decisión a este ADR. Aun así, el checkout por WhatsApp sin pasarela de pago depende de feedback visual al agregar un producto, y componentes ya planeados (`Sheet`, mega-menú) van a traer animaciones vía el patrón de atributos `data-state` que expone la primitiva subyacente de shadcn (Radix o Base UI). Faltaba precisar qué motion entra en v1 sin reabrir esa exclusión ni contradecir el criterio server-first de ADR-0006 (`"use client"` mínimo, mantenible por un junior).

## Decisión

V1 no incorpora librerías de animación JS: usa transiciones de Tailwind CSS y las animaciones `data-state` que expone la primitiva subyacente de shadcn (Radix o Base UI, adoptado en ADR-0005) vía su paquete de utilidades de animación CSS (actualmente `tw-animate-css`; `tailwindcss-animate` quedó deprecado para Tailwind v4), a verificar contra la salida del CLI de shadcn al hacer el scaffold. Alcance: zoom en hover de la imagen de producto (`@media (hover: hover)`); feedback del botón agregar/WhatsApp (etiqueta + escala breve); apertura del `Sheet` del carrito y revelado del mega-menú vía `data-state`; revelado del buy-bar mobile vía `IntersectionObserver`, animado solo con `transform`/`opacity`; opcionalmente, reveals de scroll bajo el pliegue con `animation-timeline: view()` con fallback sin animación. `prefers-reduced-motion` es obligatorio en toda regla animada (buena práctica de accesibilidad). Fuera de alcance: hero/LCP, carruseles automáticos, parallax, stagger por tarjeta en grillas largas y View Transitions por ruta (experimental).

## Alternativas consideradas

- **Motion** (motion.dev, ex-Framer Motion, MIT): único fallback aprobado si surge una necesidad real de orquestación JS, acotado a hojas cliente aisladas.
- **GSAP** (ahora gratuito): descartado; su diferencial de scroll-pinning no aplica a este catálogo.
- **Aceternity UI / react-bits**: descartados; su estética animation-first contradice el criterio Clemont-minimal del proyecto.

## Consecuencias

- No agrega peso de bundle ni nuevos límites `"use client"` más allá de los que la interactividad ya requiere.
- Clarifica, no revierte, la exclusión de `design-system.md`: este set de CSS es una precisión de alcance, no una reversión.
- Cada regla animada debe incluir `prefers-reduced-motion` como disciplina de implementación.
- Si a futuro se necesita orquestación JS real, Motion queda preaprobado como fallback.
