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
