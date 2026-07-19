-- Example data for verifying the stack end-to-end. Real products are managed
-- by the owner through the admin panel — never via committed seeds.
-- No real PII or credentials here (see CLAUDE.md section 9).

insert into categories (slug, name, description, display_order) values
  ('ramos', 'Ramos', 'Ramos artesanales con jabones, flores y chocolates.', 0),
  ('gorras', 'Gorras', 'Gorras bordadas y personalizadas.', 1),
  ('decoraciones', 'Decoraciones', 'Detalles decorativos hechos a mano.', 2);

insert into products (slug, name, description, price, category_id, is_featured, availability, display_order) values
  ('ramo-jabones-clasico', 'Ramo de jabones clásico', 'Ramo artesanal con jabones aromáticos y flores eternas.', 65000, (select id from categories where slug = 'ramos'), true, 'in_stock', 0),
  ('ramo-chocolates-premium', 'Ramo de chocolates premium', 'Chocolates surtidos en un arreglo listo para regalar.', 85000, (select id from categories where slug = 'ramos'), true, 'made_to_order', 1),
  ('gorra-bordada-flores', 'Gorra bordada de flores', 'Gorra con bordado floral hecho a mano.', 38000, (select id from categories where slug = 'gorras'), true, 'in_stock', 0),
  ('gorra-personalizada', 'Gorra personalizada', 'Gorra bordada con el diseño que elijas.', 42000, (select id from categories where slug = 'gorras'), false, 'made_to_order', 1),
  ('centro-mesa-eterno', 'Centro de mesa eterno', 'Centro de mesa con flores eternas y velas.', 55000, (select id from categories where slug = 'decoraciones'), true, 'out_of_stock', 0);
