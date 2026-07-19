# Documentación de Tienda

Punto de entrada a la documentación técnica. El proyecto está en fase de documentación (sin scaffold de Next.js todavía) — ver [CLAUDE.md](../CLAUDE.md) para el estado completo.

## ADR o spec: ¿cuál leo?

| Documento | Responde | Cuándo leerlo |
|---|---|---|
| ADR (`adr/`) | ¿Por qué se eligió X sobre Y? | Antes de cuestionar o revertir una decisión de arquitectura. |
| Spec (`specs/`) | ¿Qué debe hacer esta feature? | Antes de implementar o revisar una feature. |

## Architecture Decision Records

| Doc | Descripción |
|---|---|
| [template.md](adr/template.md) | Plantilla MADR-lite para nuevos ADRs. |
| [0001-nextjs-app-router.md](adr/0001-nextjs-app-router.md) | Next.js con App Router como framework. |
| [0002-supabase-vs-firebase.md](adr/0002-supabase-vs-firebase.md) | Supabase (Postgres + Auth + Storage) como backend, sobre Firebase. |
| [0003-whatsapp-checkout-no-payment-gateway.md](adr/0003-whatsapp-checkout-no-payment-gateway.md) | Checkout vía WhatsApp, sin pasarela de pago. |
| [0004-vercel-deployment.md](adr/0004-vercel-deployment.md) | Despliegue en Vercel, tier gratuito. |
| [0005-styling-tailwind-shadcn.md](adr/0005-styling-tailwind-shadcn.md) | Tailwind CSS + shadcn/ui para estilos y componentes. |
| [0006-feature-based-structure-and-server-components.md](adr/0006-feature-based-structure-and-server-components.md) | Estructura feature-based y Server Components por defecto. |
| [0007-motion-strategy-css-radix.md](adr/0007-motion-strategy-css-radix.md) | Motion v1 con CSS + Radix, sin librería JS de animación. |

## Specs

| Doc | Descripción |
|---|---|
| [template.md](specs/template.md) | Plantilla de spec para nuevas features. |
| [data-model.md](specs/data-model.md) | Esquema de base de datos: `categories`, `products`, `product_images`. |
| [public-catalog.md](specs/public-catalog.md) | Catálogo público: home, mega-menú, listado y detalle de producto. |
| [cart-whatsapp-checkout.md](specs/cart-whatsapp-checkout.md) | Carrito en `localStorage` y checkout vía WhatsApp. |
| [admin-panel.md](specs/admin-panel.md) | Panel de administración: login, CRUD, imágenes. |
| [design-system.md](specs/design-system.md) | Tokens de diseño y componentes shadcn/ui. |

## Guías

| Doc | Descripción |
|---|---|
| [setup-desde-cero.md](guides/setup-desde-cero.md) | Puesta en marcha completa del proyecto desde cero: fork, Supabase propio, variables de entorno, deploy en Vercel y keep-alive. |
| [fotografia-cheatsheet.md](guides/fotografia-cheatsheet.md) | Cómo fotografiar productos con el celular de forma consistente. |

## Qué NO documentamos

- Referencia de API.
- CI/CD (Vercel es zero-config).
- Estrategia de tests (todavía).
- Roadmap en `docs/` (se usan issues de GitHub).
- Whitepaper de seguridad.
- Documentación oficial de Next.js/Supabase (se enlaza, no se reproduce).
- Changelog.
- Decisiones duplicadas entre documentos.
