# ADR-0004: Despliegue en Vercel

## Estado

Accepted

## Fecha

2026-07-19

## Contexto

Next.js está optimizado para desplegarse en Vercel, con integración nativa a Git (deploy automático en cada push) y preview deployments por pull request. El flujo de trabajo previsto es que Estevan haga fork del repositorio y despliegue su propia copia sin necesidad de administrar infraestructura.

## Decisión

El proyecto se despliega en Vercel. Durante el desarrollo y antes del lanzamiento público, Estevan puede usar el tier gratuito (Hobby) para sus despliegues personales de desarrollo y preview. Una vez la tienda esté públicamente en vivo anunciando la venta de productos, el proyecto debe correr en Vercel Pro: las Fair Use Guidelines de Vercel restringen Hobby a uso personal no comercial y listan explícitamente "advertising the sale of a product or service" como uso descalificante, sin importar el volumen de tráfico.

## Alternativas consideradas

- No se evaluaron alternativas de proveedor: la combinación Next.js + Vercel es el camino de menor fricción para que un desarrollador único despliegue sin configurar infraestructura propia.

## Consecuencias

- Deploy automático en cada push a `main` y preview deployments por pull request, sin configuración de CI/CD adicional.
- Estevan puede desplegar su fork de forma independiente, sin acceso a infraestructura compartida.
- El proyecto queda atado a los límites y comportamiento del tier de Vercel elegido en cada etapa (Hobby en desarrollo, Pro en producción pública).

> **Nota:** Vercel Hobby está limitado por sus Fair Use Guidelines a uso personal no comercial; un catálogo público que anuncia la venta de productos califica como uso comercial ("advertising the sale of a product or service") y requiere Vercel Pro, sin importar el tráfico. Mantener Hobby solo para desarrollo/preview antes del lanzamiento; migrar a Pro antes de anunciar la tienda públicamente — un sitio comercial en vivo sobre Hobby queda sujeto a pausa o baja según la política, no es solo un pedido de upgrade. Además, confirmar los límites vigentes del tier elegido (ancho de banda, invocaciones de funciones, build minutes) antes de pasar a producción, ya que pueden cambiar y afectar la viabilidad del plan a mediano plazo.
