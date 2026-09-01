-- ShopSphere database schema for Supabase (PostgreSQL)
-- Run this whole file once in Supabase Studio -> SQL Editor.

-- ========== EXTENSIONS ==========
create extension if not exists "uuid-ossp";

-- ========== TABLES ==========

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  discount_percentage int default 0,
  category_id uuid references categories(id) on delete set null,
  image_url text,
  stock int not null default 0,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_amount numeric(10,2) not null,
  shipping_amount numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  payment_method text not null check (payment_method in ('cod','demo_online')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  order_status text not null default 'pending' check (order_status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  shipping_name text not null,
  shipping_email text not null,
  shipping_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_postal_code text not null,
  shipping_country text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_price numeric(10,2) not null,
  quantity int not null,
  subtotal numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== HELPER: current user is admin ==========
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ========== AUTO-CREATE PROFILE ON SIGNUP ==========
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email, 'customer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ========== updated_at TRIGGER ==========
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles for each row execute procedure set_updated_at();
drop trigger if exists trg_products_updated on products;
create trigger trg_products_updated before update on products for each row execute procedure set_updated_at();
drop trigger if exists trg_cart_updated on cart_items;
create trigger trg_cart_updated before update on cart_items for each row execute procedure set_updated_at();
drop trigger if exists trg_orders_updated on orders;
create trigger trg_orders_updated before update on orders for each row execute procedure set_updated_at();
drop trigger if exists trg_reviews_updated on reviews;
create trigger trg_reviews_updated before update on reviews for each row execute procedure set_updated_at();

-- ========== ROW LEVEL SECURITY ==========
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table wishlists enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;

-- profiles
create policy "profiles_select_own_or_admin" on profiles for select
  using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert
  with check (auth.uid() = id);

-- categories: public read, admin write
create policy "categories_select_all" on categories for select using (true);
create policy "categories_admin_write" on categories for insert with check (is_admin());
create policy "categories_admin_update" on categories for update using (is_admin());
create policy "categories_admin_delete" on categories for delete using (is_admin());

-- products: public read, admin write
create policy "products_select_all" on products for select using (true);
create policy "products_admin_write" on products for insert with check (is_admin());
create policy "products_admin_update" on products for update using (is_admin());
create policy "products_admin_delete" on products for delete using (is_admin());

-- cart_items: owner only
create policy "cart_select_own" on cart_items for select using (auth.uid() = user_id);
create policy "cart_insert_own" on cart_items for insert with check (auth.uid() = user_id);
create policy "cart_update_own" on cart_items for update using (auth.uid() = user_id);
create policy "cart_delete_own" on cart_items for delete using (auth.uid() = user_id);

-- wishlists: owner only
create policy "wishlist_select_own" on wishlists for select using (auth.uid() = user_id);
create policy "wishlist_insert_own" on wishlists for insert with check (auth.uid() = user_id);
create policy "wishlist_delete_own" on wishlists for delete using (auth.uid() = user_id);

-- orders: owner + admin
create policy "orders_select_own_or_admin" on orders for select using (auth.uid() = user_id or is_admin());
create policy "orders_insert_own" on orders for insert with check (auth.uid() = user_id);
create policy "orders_update_own_or_admin" on orders for update using (auth.uid() = user_id or is_admin());

-- order_items: visible if you can see the parent order
create policy "order_items_select" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
);
create policy "order_items_insert" on order_items for insert with check (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);

-- reviews: public read, owner write (should have purchased — enforced in app layer + optional check below)
create policy "reviews_select_all" on reviews for select using (true);
create policy "reviews_insert_own" on reviews for insert with check (
  auth.uid() = user_id and exists (
    select 1 from order_items oi
    join orders o on o.id = oi.order_id
    where o.user_id = auth.uid() and oi.product_id = reviews.product_id and o.order_status <> 'cancelled'
  )
);
create policy "reviews_update_own" on reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own" on reviews for delete using (auth.uid() = user_id);

-- ========== SEED: CATEGORIES ==========
insert into categories (name, slug, description, image_url) values
  ('Electronics', 'electronics', 'Phones, audio, and everyday tech', 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600'),
  ('Fashion', 'fashion', 'Apparel and accessories for every day', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'),
  ('Home & Living', 'home-living', 'Furniture, decor, and kitchen essentials', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600'),
  ('Accessories', 'accessories', 'Bags, watches, and small everyday carry', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'),
  ('Sports', 'sports', 'Gear for training, running, and play', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600'),
  ('Beauty', 'beauty', 'Skincare and grooming essentials', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600'),
  ('Books', 'books', 'Fiction, non-fiction, and study guides', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600')
on conflict (slug) do nothing;

-- ========== SEED: PRODUCTS (20+) ==========
do $$
declare
  c_electronics uuid; c_fashion uuid; c_home uuid; c_accessories uuid; c_sports uuid; c_beauty uuid; c_books uuid;
begin
  select id into c_electronics from categories where slug = 'electronics';
  select id into c_fashion from categories where slug = 'fashion';
  select id into c_home from categories where slug = 'home-living';
  select id into c_accessories from categories where slug = 'accessories';
  select id into c_sports from categories where slug = 'sports';
  select id into c_beauty from categories where slug = 'beauty';
  select id into c_books from categories where slug = 'books';

  insert into products (name, description, price, original_price, discount_percentage, category_id, image_url, stock, rating, review_count) values
    ('Wireless Over-Ear Headphones', 'Noise-isolating headphones with 30-hour battery life and plush earcups.', 2999, 3999, 25, c_electronics, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 42, 4.5, 128),
    ('Mechanical Keyboard, RGB', 'Hot-swappable switches with per-key RGB lighting for gaming and typing.', 3499, 3499, 0, c_electronics, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', 30, 4.3, 76),
    ('Smart Fitness Band', 'Tracks heart rate, sleep, and steps with a 10-day battery.', 1799, 2499, 28, c_electronics, 'https://images.unsplash.com/photo-1575311373438-3d7f8b1d8e1a?w=600', 60, 4.1, 203),
    ('Portable Bluetooth Speaker', 'Water-resistant speaker with deep bass and 12-hour playback.', 1499, 1899, 21, c_electronics, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', 55, 4.4, 91),
    ('65W Fast Charger Adapter', 'GaN charger for laptops and phones with dual USB-C output.', 999, 1299, 23, c_electronics, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600', 80, 4.2, 54),
    ('Classic Denim Jacket', 'Washed cotton denim with a relaxed, everyday fit.', 1899, 2399, 21, c_fashion, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 25, 4.0, 40),
    ('Everyday Cotton T-Shirt', 'Breathable combed cotton tee in a regular fit.', 499, 699, 29, c_fashion, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 120, 4.3, 210),
    ('Slim Fit Chinos', 'Stretch-cotton chinos built for all-day comfort.', 1299, 1699, 24, c_fashion, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', 45, 4.1, 65),
    ('Running Sneakers', 'Lightweight mesh sneakers with cushioned soles.', 2499, 2999, 17, c_fashion, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 38, 4.6, 176),
    ('Wool Blend Scarf', 'Soft wool-blend scarf for cold weather layering.', 799, 999, 20, c_fashion, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600', 65, 4.0, 22),
    ('Ceramic Dinner Set (16pc)', 'Chip-resistant stoneware set for everyday dining.', 2199, 2799, 21, c_home, 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=600', 20, 4.4, 58),
    ('Memory Foam Pillow', 'Contoured pillow that supports neck and shoulders.', 899, 1199, 25, c_home, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600', 70, 4.2, 88),
    ('Aromatic Soy Candle Set', 'Set of 3 hand-poured candles in warm scents.', 699, 899, 22, c_home, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=600', 90, 4.3, 47),
    ('Non-Stick Cookware Set (5pc)', 'Induction-friendly cookware with soft-touch handles.', 3299, 3999, 18, c_home, 'https://images.unsplash.com/photo-1584990347449-a2d4c1c9f0e9?w=600', 18, 4.5, 63),
    ('Leather Messenger Bag', 'Full-grain leather bag with a padded laptop sleeve.', 3999, 4999, 20, c_accessories, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 15, 4.6, 34),
    ('Minimalist Analog Watch', 'Stainless steel watch with a sapphire-coated face.', 2799, 3499, 20, c_accessories, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600', 32, 4.4, 71),
    ('Polarized Sunglasses', 'UV400 protection with a lightweight acetate frame.', 999, 1399, 29, c_accessories, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 55, 4.1, 39),
    ('Adjustable Dumbbell Set', 'Space-saving dumbbells adjustable from 2.5kg to 20kg.', 5999, 6999, 14, c_sports, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', 12, 4.7, 52),
    ('Yoga Mat, Extra Thick', 'Non-slip 8mm mat with a carry strap.', 899, 1199, 25, c_sports, 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600', 75, 4.3, 96),
    ('Insulated Water Bottle', 'Keeps drinks cold for 24 hours or hot for 12.', 599, 799, 25, c_sports, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', 100, 4.2, 61),
    ('Vitamin C Face Serum', 'Brightening serum with niacinamide and hyaluronic acid.', 799, 999, 20, c_beauty, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', 60, 4.4, 84),
    ('Herbal Shampoo & Conditioner', 'Sulfate-free duo for daily use on all hair types.', 649, 849, 24, c_beauty, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', 85, 4.1, 45),
    ('Atomic Habits (Paperback)', 'A practical guide to building better habits.', 399, 499, 20, c_books, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', 150, 4.8, 512),
    ('The Pragmatic Programmer', 'Classic guide to becoming a better software engineer.', 649, 799, 19, c_books, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', 40, 4.7, 234)
  on conflict do nothing;
end $$;
