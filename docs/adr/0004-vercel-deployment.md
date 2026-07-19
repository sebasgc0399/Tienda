# ADR-0004: Despliegue en Vercel (free tier)

## Estado

Accepted

## Fecha

2026-07-19

## Contexto

Next.js está optimizado para desplegarse en Vercel, con integración nativa a Git (deploy automático en cada push) y preview deployments por pull request. El flujo de trabajo previsto es que Estevan haga fork del repositorio y despliegue su propia copia sin necesidad de administrar infraestructura.

## Decisión

El proyecto se despliega en Vercel, usando el tier gratuito.

## Alternativas consideradas

- No se evaluaron alternativas de proveedor: la combinación Next.js + Vercel es el camino de menor fricción para que un desarrollador único despliegue sin configurar infraestructura propia.

## Consecuencias

- Deploy automático en cada push a `main` y preview deployments por pull request, sin configuración de CI/CD adicional.
- Estevan puede desplegar su fork de forma independiente, sin acceso a infraestructura compartida.
- El proyecto queda atado a los límites y comportamiento del tier gratuito de Vercel.

> **Nota:** antes de pasar a producción, confirmar los límites vigentes del tier gratuito de Vercel (ancho de banda, invocaciones de funciones, build minutes), ya que pueden cambiar y afectar la viabilidad del plan a mediano plazo.
