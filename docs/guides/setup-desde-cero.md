# Guía: configurar el proyecto desde cero

Esta guía es la secuencia completa de pasos para poner en marcha Tienda desde cero: fork del repositorio, proyecto propio de Supabase, variables de entorno y deploy en Vercel. Está escrita para Estevan — o cualquier desarrollador que reciba este repositorio por primera vez y necesite dejarlo corriendo en su propia cuenta, sin depender de una sesión de onboarding en vivo.

No repite el porqué de cada decisión (eso vive en los [ADRs](../adr/)) ni el qué de cada feature (eso vive en los [specs](../specs/)). Esta guía es solo el **cómo, paso a paso**, de la puesta en marcha inicial — el día a día una vez levantado el proyecto está en [CLAUDE.md](../../CLAUDE.md).

## 1. Estado actual del proyecto

Este repositorio está hoy en **fase de documentación** (ver [CLAUDE.md](../../CLAUDE.md), sección 2): existen los ADRs, los specs y esta guía, pero todavía no hay scaffold de Next.js ni proyecto de Supabase. Algunos pasos de esta guía dependen de archivos que aún no existen en el repo (`package.json`, `supabase/migrations/`) y están marcados **[tras el scaffold]**: se activan en cuanto ese scaffold se ejecute y esos archivos aparezcan — misma disciplina de los `TBD` que usa CLAUDE.md en su sección 4, para no documentar un comando que todavía no existe.

## 2. Cuentas y herramientas

Todo lo necesario para levantar el proyecto es gratuito.

| Herramienta | Para qué | Nota |
|---|---|---|
| Cuenta de GitHub | Hacer fork del repositorio | Gratis |
| Cuenta de Supabase | Backend (base de datos, auth, storage) | Gratis, sin tarjeta de crédito |
| Cuenta de Vercel | Deploy | Tier Hobby, gratis. Riesgo aceptado documentado en [ADR-0004](../adr/0004-vercel-deployment.md) |
| Node.js >= 20.9 | Correr el proyecto en local | Next.js 16 no soporta Node 18 (ver [CLAUDE.md](../../CLAUDE.md), sección 4) |
| pnpm (vía Corepack) | Gestor de paquetes del proyecto | Instalación abajo |
| Git | Clonar y versionar | — |
| Claude Code | Asistente de IA para trabajar en el repo | Opcional |

`pnpm` es el gestor de paquetes fijado para este proyecto (no `npm` ni `yarn`). Node.js ya trae Corepack; alcanza con habilitarlo una vez:

```
corepack enable
```

La versión exacta de `pnpm` queda fijada en el campo `packageManager` de `package.json` en cuanto exista el scaffold — Corepack la resuelve sola en el primer `pnpm install`.

## 3. Fork y clone del repositorio

1. En GitHub, hacer fork del repositorio a tu propia cuenta.
2. Clonar tu fork en local:

```
git clone https://github.com/<tu-usuario>/tienda.git
cd tienda
```

## 4. [tras el scaffold] Instalar dependencias y correr en local

```
pnpm install
pnpm dev
```

Esto deja el proyecto corriendo en `http://localhost:3000`. En este punto el catálogo todavía no muestra nada real: falta conectar tu propio proyecto de Supabase (siguiente sección).

## 5. Crear tu proyecto de Supabase

Cada fork crea **su propio** proyecto de Supabase — no se comparte uno entre forks (ver [ADR-0002](../adr/0002-supabase-vs-firebase.md)).

1. **Crear el proyecto**: en [supabase.com](https://supabase.com), "New project". Elegir una región cercana a tus usuarios reales (por ejemplo, São Paulo para Colombia).
2. **[tras el scaffold] Aplicar las migraciones**: en el dashboard, ir a **SQL Editor** y ejecutar, en orden, cada archivo de `supabase/migrations/` del repositorio. Definen `categories`, `products`, `product_images` (ver [data-model.md](../specs/data-model.md)) y sus policies de RLS. El SQL Editor es el camino inicial; Supabase CLI queda como camino de crecimiento opcional más adelante (ver [CLAUDE.md](../../CLAUDE.md), sección 4).
3. **Crear el bucket de imágenes**: en **Storage**, crear un bucket llamado `product-images` como **público** — es una decisión explícita, no el default de Supabase (ver [admin-panel.md](../specs/admin-panel.md#almacenamiento--storage)).
4. **Activar RLS**: las migraciones ya definen las policies (lectura pública de `is_active = true`, escritura solo autenticada); confirmar en **Authentication > Policies** que RLS quedó activado en las tres tablas.
5. **Crear el único usuario admin**: en **Authentication > Users > Add user**, crear el usuario con email y password. No hay registro público — este es el único punto de alta (ver [admin-panel.md](../specs/admin-panel.md), RF-1).
6. **Copiar credenciales**: en **Project Settings > API**, copiar el **Project URL** y la **anon public key** — se usan en la siguiente sección.

## 6. Variables de entorno

Copiar la plantilla y completarla con tus propios valores:

```
cp .env.example .env.local
```

| Variable | De dónde sale | Formato |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings > API > Project URL | URL completa, ej. `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings > API > anon public key | Cadena larga (JWT) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp del negocio | Solo dígitos, formato internacional, sin `+`, espacios ni guiones (ej. `573001234567`) — regla completa en [cart-whatsapp-checkout.md](../specs/cart-whatsapp-checkout.md), RF-8 |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings > API > service_role key | Solo si/cuando una operación server-only la necesite; **nunca** con prefijo `NEXT_PUBLIC_` (ver [CLAUDE.md](../../CLAUDE.md), sección 9) |

**Regla de oro**: `.env.local` **jamás** se commitea — tiene tus credenciales reales. `.env.example` sí se commitea, porque es solo la plantilla sin valores (`.gitignore` ya trae la excepción `!.env.example`).

## 7. Desplegar en Vercel

1. En Vercel, "Import Project" y elegir tu fork de GitHub.
2. Configurar las mismas variables de entorno de la sección 6 en el proyecto de Vercel (Settings > Environment Variables).
3. Deploy. Desde acá, cada push a `main` dispara un deploy automático, sin configuración de CI/CD adicional.

Esto corre en el tier Hobby de Vercel, con el riesgo de la política de uso comercial ya evaluado y aceptado — detalle completo en [ADR-0004](../adr/0004-vercel-deployment.md), no se repite acá.

## 8. Keep-alive de Supabase

Los proyectos de Supabase en tier gratuito se **auto-pausan tras ~1 semana sin actividad de base de datos** (ver [ADR-0002](../adr/0002-supabase-vs-firebase.md)). La mitigación es un workflow de GitHub Actions que ejecuta una consulta real a la base de datos cada 3 días — un ping HTTP simple no alcanza, tiene que tocar la base de datos.

Crear `.github/workflows/supabase-keepalive.yml`:

```yaml
name: Supabase Keep-Alive

on:
  schedule:
    - cron: "0 12 */3 * *"
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Query Supabase to prevent auto-pause
        run: |
          curl --fail --silent --show-error \
            "${{ secrets.SUPABASE_KEEPALIVE_URL }}/rest/v1/categories?select=id&is_active=eq.true&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_KEEPALIVE_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_KEEPALIVE_KEY }}"
```

El `cron` corre aproximadamente cada 3 días (los schedulers de GitHub Actions no son puntuales por diseño; el margen real hasta la auto-pausa es de ~1 semana, así que esa variación no es un problema). La consulta pega directo a PostgREST y hace un `SELECT` real filtrado por `is_active` sobre `categories` — no un ping vacío.

> **Importante en forks:** GitHub deshabilita los workflows de Actions en los forks por defecto. Entrar una vez a la pestaña **Actions** del fork y aceptar el aviso de habilitarlos — sin ese paso, el keep-alive nunca se ejecuta y el proyecto de Supabase terminará pausándose.

Crear los secrets del repositorio en **Settings > Secrets and variables > Actions > New repository secret**:

| Secret | Valor |
|---|---|
| `SUPABASE_KEEPALIVE_URL` | El mismo valor que `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_KEEPALIVE_KEY` | El mismo valor que `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

Usar la `anon key` acá es seguro: es la misma clave pública que ya viaja al bundle del cliente, sujeta a RLS.

## 9. Trabajar con Claude Code en este repo

- [CLAUDE.md](../../CLAUDE.md) se lee automáticamente al abrir el repo con Claude Code — no hace falta pegarlo a mano en cada sesión.
- Antes de tocar cualquier archivo, leer [docs/README.md](../README.md): indica qué ADR o spec corresponde consultar según lo que se va a cambiar.
- Regla de mantenimiento (detalle completo en [CLAUDE.md](../../CLAUDE.md), sección 8): una **decisión de arquitectura** nueva se documenta en un ADR nuevo; un **cambio de comportamiento** de una feature actualiza el spec correspondiente **en el mismo PR** que cambia el código.
- Instalar el MCP server oficial de shadcn (el único recomendado para este repo):

```
pnpm dlx shadcn@latest mcp init --client claude
```

- Al pedirle a Claude que implemente algo, conviene pedirle explícitamente que consulte primero el ADR o spec relevante antes de escribir código — reduce el riesgo de que reinvente una decisión ya tomada.

## 10. Checklist final

- [ ] La tienda carga en `http://localhost:3000` sin errores.
- [ ] El catálogo muestra datos que vienen de **tu propio** proyecto de Supabase (no datos de ejemplo hardcodeados).
- [ ] `/admin/login` autentica con **tu** usuario admin creado en la sección 5.
- [ ] El deploy en Vercel responde en su URL pública.
- [ ] El workflow de keep-alive corrió al menos una vez en verde en la pestaña **Actions** de GitHub.
