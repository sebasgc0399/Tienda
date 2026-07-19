# ADR-0004: Despliegue en Vercel

## Estado

Accepted

## Fecha

2026-07-19

## Contexto

Next.js está optimizado para desplegarse en Vercel, con integración nativa a Git (deploy automático en cada push) y preview deployments por pull request. El flujo de trabajo previsto es que Estevan haga fork del repositorio y despliegue su propia copia sin necesidad de administrar infraestructura.

## Decisión

El proyecto se despliega en Vercel en el tier gratuito (Hobby), incluido el lanzamiento público, sin presupuesto de hosting. Se acepta explícitamente el riesgo de las Fair Use Guidelines: Hobby está formalmente restringido a uso personal no comercial ("advertising the sale of a product or service" es uso descalificante), pero para sitios de tráfico bajo la aplicación práctica de esa política es poco frecuente y el escenario realista ante una observación de Vercel es una solicitud de upgrade, no una baja inmediata (decisión del 2026-07-19, con experiencia previa del equipo operando sitios pequeños en Hobby sin incidentes).

## Alternativas consideradas

- **Vercel Pro**: elimina el riesgo de la política de uso comercial, pero introduce un costo mensual que contradice el requisito de operar sin presupuesto. Queda como opción si la tienda crece o si Vercel exige el upgrade.
- **Otros hosts gratuitos sin restricción comercial** (p. ej. Cloudflare Pages/Workers, Netlify): descartados como opción inicial por mayor fricción para desplegar Next.js que la integración nativa de Vercel; quedan como plan de migración documentado si el riesgo de Hobby se materializa (verificar sus políticas y compatibilidad vigentes al momento de migrar).

## Consecuencias

- Deploy automático en cada push a `main` y preview deployments por pull request, sin configuración de CI/CD adicional.
- Estevan puede desplegar su fork de forma independiente, sin acceso a infraestructura compartida.
- El proyecto queda atado a los límites del tier Hobby y al riesgo aceptado de su política de uso comercial; si Vercel lo observa, el camino es upgrade a Pro o migración al plan alternativo documentado.

> **Nota (riesgo aceptado):** un sitio comercial en vivo sobre Hobby incumple formalmente las Fair Use Guidelines y queda sujeto, en teoría, a pausa o baja según la política. El equipo acepta ese riesgo para operar con costo cero; si Vercel lo señala, se hace upgrade a Pro o se migra al host alternativo (ver Alternativas). Confirmar además los límites vigentes del tier Hobby (ancho de banda, invocaciones de funciones, transformaciones de imagen) antes de pasar a producción, ya que pueden cambiar.
