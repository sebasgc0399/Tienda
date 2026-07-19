# ADR-0006: Estructura feature-based y Server Components por defecto

## Estado

Accepted

## Fecha

2026-07-19

## Contexto

El proyecto va a ser continuado por un desarrollador junior (Estevan) sin acompañamiento constante, por lo que la organización del código debe favorecer la ubicación rápida de lo relacionado a cada funcionalidad. Además, Next.js App Router habilita React Server Components (RSC), lo que permite reducir el JavaScript enviado al cliente si se define un criterio claro de cuándo usar `"use client"`.

## Decisión

El código se organiza por feature (`catalog`, `cart`, `admin`) en lugar de por tipo de archivo, y los componentes son Server Components por defecto; `"use client"` se reserva para las hojas interactivas del árbol de componentes.

## Alternativas consideradas

- **Organización por tipo de archivo** (`components/`, `hooks/`, `services/` a nivel global): dispersa el código de una misma funcionalidad en múltiples carpetas, dificultando ubicar todo lo relacionado a `cart` o `admin` de un vistazo.
- **Client Components por defecto**: es el patrón más familiar para quien viene de SPA tradicional, pero renuncia a las ventajas de RSC (menos JS al cliente, data fetching más simple) sin necesidad real.

## Consecuencias

- Cada feature agrupa sus propios componentes, lógica y datos, lo que facilita el trabajo autónomo de un desarrollador único.
- El patrón container/presentational se traduce a términos de App Router: un Server Component obtiene los datos y un componente presentacional los pinta; las mutaciones se hacen vía Server Actions.
- Se reduce el JavaScript enviado al cliente al limitar `"use client"` a los nodos que realmente necesitan interactividad.
- Este ADR documenta el porqué de la decisión; las reglas de aplicación día a día (cuándo crear una feature nueva, convenciones de carpetas) viven en `CLAUDE.md`, no aquí.
