# ADR-0002: Supabase como backend (sobre Firebase)

## Estado

Accepted

## Fecha

2026-07-19

## Contexto

El modelo de datos es relacional: categorías que contienen productos, y productos que tienen múltiples imágenes. Se necesita almacenamiento de archivos (imágenes de producto) que sea gratuito en el tier inicial, control de acceso a nivel de fila para separar lectura pública de escritura autenticada, y un esquema que Estevan pueda inspeccionar y modificar con SQL estándar.

## Decisión

Se usa Supabase (Postgres + Auth + Storage) como backend, en lugar de Firebase.

## Alternativas consideradas

- **Firebase**: su modelo de datos NoSQL encaja peor con relaciones categoría→producto→imágenes, y Firebase Storage exige el plan de pago Blaze para uso en producción, lo que rompe el requisito de operar en un tier gratuito.

## Consecuencias

- El esquema (`categories`, `products`, `product_images`) se modela como tablas Postgres relacionales, con SQL transferible y portable.
- Row Level Security (RLS) permite exponer lectura pública de datos activos y restringir la escritura a usuarios autenticados, sin una capa de autorización adicional.
- Supabase Storage cubre el almacenamiento de imágenes sin costo adicional en el tier inicial.

### Sub-decisiones

- Las imágenes de producto se almacenan en un bucket de Supabase Storage llamado `product-images`.
- Existe un único administrador, autenticado vía Supabase Auth (email/password), sin registro público de usuarios.

> **Nota:** Los proyectos de Supabase en tier gratuito se pausan automáticamente tras ~1 semana sin actividad de base de datos, dejando la tienda offline hasta reanudarla manualmente desde el dashboard (restaurable hasta 90 días; Supabase envía aviso por email ~1 semana antes). Ver supabase.com/docs/guides/platform/free-project-pausing. Mitigación: mantener el proyecto activo con un keep-alive programado (GitHub Action / cron / monitor de uptime) que ejecute una CONSULTA REAL a la base de datos (p. ej. un SELECT ligero vía la API REST/PostgREST sobre una tabla) — un simple ping HTTP al sitio no cuenta si no toca la base de datos —, o aceptar explícitamente que el proyecto puede requerir reanudación manual antes de demos/lanzamiento.
