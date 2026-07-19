-- Initial catalog schema for Tienda.
-- Source of truth: docs/specs/data-model.md — update both together.

create type product_availability as enum ('in_stock', 'out_of_stock', 'made_to_order');

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  storage_path text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  price integer not null,
  category_id uuid not null references categories (id) on delete restrict,
  is_featured boolean not null default false,
  availability product_availability not null default 'in_stock',
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  is_primary boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- At most one primary image per product, enforced at the DB level.
create unique index one_primary_image_per_product
  on product_images (product_id)
  where is_primary;

create index products_category_id_idx on products (category_id);
create index product_images_product_id_idx on product_images (product_id);

-- RLS: default-deny. Public SELECT of active rows only; all writes go through
-- the server with the service_role key, so there are NO write policies by design.
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;

create policy "Public read of active categories"
  on categories for select
  to anon, authenticated
  using (is_active);

create policy "Public read of active products in active categories"
  on products for select
  to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from categories c
      where c.id = category_id and c.is_active
    )
  );

create policy "Public read of images of visible products"
  on product_images for select
  to anon, authenticated
  using (
    exists (
      select 1
      from products p
      join categories c on c.id = p.category_id
      where p.id = product_id and p.is_active and c.is_active
    )
  );
