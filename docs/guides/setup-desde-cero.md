# Guía: configurar el proyecto desde cero

Esta guía es la secuencia completa de pasos para poner en marcha Tienda desde cero: fork del repositorio, proyecto propio de Supabase, variables de entorno y deploy en Vercel. Está escrita para Estevan — o cualquier desarrollador que reciba este repositorio por primera vez y necesite dejarlo corriendo en su propia cuenta, sin depender de una sesión de onboarding en vivo.

No repite el porqué de cada decisión (eso vive en los [ADRs](../adr/)) ni el qué de cada feature (eso vive en los [specs](../specs/)). Esta guía es solo el **cómo, paso a paso**, de la puesta en marcha inicial — el día a día una vez levantado el proyecto está en [CLAUDE.md](../../CLAUDE.md).

## 1. Estado actual del proyecto

El repositorio ya incluye el **scaffold completo** (ver [CLAUDE.md](../../CLAUDE.md), sección 2): Next.js 16 con `src/`, tooling, tema base, migraciones SQL y seed. Todos los pasos de esta guía están activos — lo único que cada fork debe crear por su cuenta es su propio proyecto de Supabase (sección 5) y su deploy (sección 7).

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

La versión exacta de `pnpm` está fijada en el campo `packageManager` de `package.json` — Corepack la resuelve sola en el primer `pnpm install`. En Windows, si `corepack enable` falla con `EPERM` (Node instalado en `Program Files`), correr la terminal como administrador o usar el fallback `npm install -g pnpm`, que instala en espacio de usuario y funciona igual.

## 3. Fork y clone del repositorio

1. En GitHub, hacer fork del repositorio a tu propia cuenta.
2. Clonar tu fork en local:

```
git clone https://github.com/<tu-usuario>/tienda.git
cd tienda
```

## 4. Instalar dependencias y correr en local

```
pnpm install
pnpm dev
```

Esto deja el proyecto corriendo en `http://localhost:3000`. En este punto el catálogo todavía no muestra nada real: falta conectar tu propio proyecto de Supabase (siguiente sección).

## 5. Crear tu proyecto de Supabase

Cada fork crea **su propio** proyecto de Supabase — no se comparte uno entre forks (ver [ADR-0002](../adr/0002-supabase-vs-firebase.md)).

1. **Crear el proyecto**: en [supabase.com](https://supabase.com), "New project". Elegir una región cercana a tus usuarios reales (por ejemplo, São Paulo para Colombia) y guardar la contraseña de la base de datos en un gestor de contraseñas (no se usa en el día a día — la app usa las API keys —, pero la pide la CLI de Supabase). En la sección **Security** del formulario: dejar marcados **Enable Data API** (los clientes `@supabase/ssr` y el keep-alive leen por esa API) y **Automatically expose new tables** (las migraciones asumen los grants default; la protección real es el RLS default-deny, no esconder tablas), y **marcar** "Enable automatic RLS" (viene desmarcado; alinea con la regla del proyecto de que toda tabla nace con RLS activado). En **Postgres Type**, dejar el default Postgres — no OrioleDB (alpha).
2. **Aplicar las migraciones**: en el dashboard, ir a **SQL Editor** y ejecutar, en orden, cada archivo de `supabase/migrations/` del repositorio. Definen `categories`, `products`, `product_images` (ver [data-model.md](../specs/data-model.md)) y sus policies de RLS. El SQL Editor es el camino inicial; Supabase CLI queda como camino de crecimiento opcional más adelante (ver [CLAUDE.md](../../CLAUDE.md), sección 4).
3. **Cargar datos de ejemplo (seed)**: en el mismo **SQL Editor**, después de las migraciones, ejecutar `supabase/seed.sql`. Inserta 2-3 categorías y 4-6 productos **ficticios** — sin PII ni credenciales reales (misma regla que las migraciones, ver [CLAUDE.md](../../CLAUDE.md), sección 9) — para poder verificar que el catálogo público y el admin funcionan de punta a punta antes de cargar un producto real. Los productos reales los agrega la dueña desde el panel admin, nunca por seed.
4. **Crear el bucket de imágenes**: en **Storage**, crear un bucket llamado `product-images` como **público** — es una decisión explícita, no el default de Supabase (ver [admin-panel.md](../specs/admin-panel.md#almacenamiento--storage)).
5. **Activar RLS**: las migraciones ya definen las policies (lectura pública de `is_active = true`; sin policies de escritura para `anon`/`authenticated` — las mutaciones las hace el servidor con la `service_role` key, ver [data-model.md](../specs/data-model.md#row-level-security-rls)); confirmar en **Authentication > Policies** que RLS quedó activado en las tres tablas.
6. **Crear el único usuario admin**: en **Authentication > Users > Add user**, crear el usuario con email y una **contraseña fuerte y única** (12+ caracteres, generada y guardada en un gestor de contraseñas). Esta cuenta no tiene pantalla de registro pública, así que su contraseña es el único punto de fallo de acceso al panel — Supabase exige por defecto solo 6 caracteres como mínimo, y la protección automática contra contraseñas filtradas (HaveIBeenPwned) es exclusiva del plan Pro, no disponible en el tier gratuito de este proyecto. Se puede subir el mínimo de longitud y exigir clases de caracteres en **Authentication > Providers > Email** (no confundir con **Authentication > Policies**, usado en el paso anterior para RLS). Más adelante se puede sumar MFA por TOTP como capa adicional — es gratis en todos los planes de Supabase. No hay pantalla de registro visible en la UI — este es el único punto de alta desde la interfaz (ver [admin-panel.md](../specs/admin-panel.md), RF-1); la garantía real a nivel de API la da el paso siguiente, no la ausencia de UI.
7. **Desactivar el registro público**: en **Authentication > Sign In / Providers** (la opción también puede aparecer bajo **Project Settings > Authentication**), sección "User Signups", desactivar **"Allow new users to sign up"**. Este es el control real que cierra el registro: la `anon key` es pública por diseño, así que sin este paso cualquiera puede llamar directamente a `{SUPABASE_URL}/auth/v1/signup` y obtener un JWT `authenticated` válido sin pasar por la aplicación — la falta de pantalla de registro en el frontend (paso anterior) no alcanza para evitarlo por sí sola.
8. **Copiar credenciales**: en **Project Settings > API**, copiar el **Project URL** y la **anon public key** — se usan en la siguiente sección.

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

### Backups

Supabase no ofrece backups automáticos en el tier gratuito — la mitigación acá es manual y proporcional a un catálogo chico y sin PII (no hay pagos, pedidos ni datos de clientes en la base de datos; ver [ADR-0003](../adr/0003-whatsapp-checkout-no-payment-gateway.md)).

**Mínimo (sin herramientas adicionales)**: antes de correr cualquier SQL riesgoso en el SQL Editor (`DROP`, `DELETE`, `ALTER` o una migración nueva), exportar cada tabla desde **Table Editor** > seleccionar `categories` / `products` / `product_images` > **Export to CSV**. Tres CSVs chicos son una foto completa de los metadatos del catálogo y no requieren instalar nada. Repetir este paso cada vez antes de correr SQL a mano.

**Si se adopta Supabase CLI** (camino de crecimiento opcional, ver [CLAUDE.md](../../CLAUDE.md), sección 4): `supabase db dump --data-only -f backup.sql` alcanza porque el esquema ya está versionado en `supabase/migrations/`. Guardar el archivo fuera de este repo (local o un repo privado aparte), nunca en el repo público del proyecto.

**Si se automatiza con GitHub Actions** (opcional, cron semanal): no subir el dump como artifact de este repo — si el repo es público, sus artifacts son descargables sin autenticación vía la API REST de artifacts. Empujar el dump a un repo **privado** aparte usando un PAT como secret. A diferencia del keep-alive de arriba (que usa la `anon key` pública sobre PostgREST, solo lectura y sujeta a RLS), un dump necesita la cadena de conexión de Postgres **con password** (`SUPABASE_DB_URL` o `SUPABASE_ACCESS_TOKEN` + project ref) — un secret mucho más sensible; guardarlo como secret cifrado del repo y nunca imprimirlo en logs.

**Falta cubrir**: un `db dump` de Postgres no incluye los archivos binarios del bucket `product-images` en Storage, solo las filas de `product_images.storage_path` que los referencian. Para un catálogo chico alcanza con que la dueña conserve las fotos originales; un pipeline de backup de Storage es sobre-ingeniería para este proyecto.

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

## 11. Endurecimiento opcional

Recomendaciones de seguridad opcionales — ninguna es requisito para poner el proyecto en marcha:

- **2FA en las cuentas de GitHub, Supabase y Vercel**: esas tres cuentas concentran las credenciales del proyecto y el control del deploy; activar autenticación de dos factores en cada una.
- **Dependabot security updates en el fork**: en GitHub, **Settings > Code security**, activar las actualizaciones de seguridad de Dependabot para que abra PRs automáticos ante dependencias con vulnerabilidades conocidas.
- **CAPTCHA en `/admin/login`**: si alguna vez aparece ruido de bots contra el login, Supabase Auth soporta CAPTCHA (hCaptcha o Cloudflare Turnstile, ambos gratuitos) sin costo adicional — ver [admin-panel.md](../specs/admin-panel.md#seguridad) y la [documentación de Supabase](https://supabase.com/docs/guides/auth/auth-captcha).
