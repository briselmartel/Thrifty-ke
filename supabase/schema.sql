-- ============================================================
-- Thrifty.ke — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. PROFILES ---------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

-- Add any columns that might be missing if this table was partially
-- created in an earlier run (safe to re-run — does nothing if already present).
alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists email text;
alter table profiles add column if not exists role text default 'buyer';
alter table profiles add column if not exists seller_type text;
alter table profiles add column if not exists verification_status text default 'unverified';
alter table profiles add column if not exists is_admin boolean default false;
alter table profiles add column if not exists created_at timestamptz default now();

alter table profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on profiles;
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- 2. LISTINGS -----------------------------------------------------
create table if not exists listings (
  id uuid primary key default gen_random_uuid()
);

alter table listings add column if not exists seller_id uuid references profiles(id) on delete cascade;
alter table listings add column if not exists title text;
alter table listings add column if not exists description text;
alter table listings add column if not exists price numeric;
alter table listings add column if not exists category text;
alter table listings add column if not exists condition text;
alter table listings add column if not exists size text;
alter table listings add column if not exists image_urls text[] default '{}';
alter table listings add column if not exists status text default 'active';
alter table listings add column if not exists created_at timestamptz default now();

alter table listings enable row level security;

drop policy if exists "Active listings are viewable by everyone" on listings;
create policy "Active listings are viewable by everyone"
  on listings for select using (true);

drop policy if exists "Sellers can insert their own listings" on listings;
create policy "Sellers can insert their own listings"
  on listings for insert with check (auth.uid() = seller_id);

drop policy if exists "Sellers can update their own listings" on listings;
create policy "Sellers can update their own listings"
  on listings for update using (auth.uid() = seller_id);

drop policy if exists "Sellers can delete their own listings" on listings;
create policy "Sellers can delete their own listings"
  on listings for delete using (auth.uid() = seller_id);

-- 3. ORDERS (escrow) ----------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid()
);

alter table orders add column if not exists listing_id uuid references listings(id);
alter table orders add column if not exists buyer_id uuid references profiles(id);
alter table orders add column if not exists seller_id uuid references profiles(id);
alter table orders add column if not exists amount numeric;
alter table orders add column if not exists status text default 'pending_payment';
alter table orders add column if not exists payment_method text default 'bank_transfer';
alter table orders add column if not exists payment_reference text;
alter table orders add column if not exists payment_proof_url text;
alter table orders add column if not exists delivery_address text;
alter table orders add column if not exists delivery_phone text;
alter table orders add column if not exists created_at timestamptz default now();

alter table orders enable row level security;

drop policy if exists "Buyers and sellers can view their own orders" on orders;
create policy "Buyers and sellers can view their own orders"
  on orders for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "Buyers can create orders" on orders;
create policy "Buyers can create orders"
  on orders for insert with check (auth.uid() = buyer_id);

drop policy if exists "Buyers, sellers and admins can update relevant orders" on orders;
create policy "Buyers, sellers and admins can update relevant orders"
  on orders for update using (
    auth.uid() = buyer_id or auth.uid() = seller_id
    or exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Admins need full read/write on profiles + orders for verification & escrow release.
drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile"
  on profiles for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ============================================================
-- STORAGE BUCKETS
-- Create these in Supabase Dashboard → Storage → New bucket
--   1. listing-images  (Public bucket)
--   2. order-photos  (Public bucket is simplest for MVP;
--      switch to private + signed URLs once you have time)
-- ============================================================

-- After creating the two buckets above, run this so logged-in users
-- can upload into their own folder and everyone can view images:

drop policy if exists "Authenticated users can upload listing images" on storage.objects;
create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

drop policy if exists "Anyone can view listing images" on storage.objects;
create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

drop policy if exists "Authenticated users can upload payment proofs" on storage.objects;
create policy "Authenticated users can upload payment proofs"
  on storage.objects for insert
  with check (bucket_id = 'order-photos' and auth.role() = 'authenticated');

drop policy if exists "Anyone can view payment proofs" on storage.objects;
create policy "Anyone can view payment proofs"
  on storage.objects for select
  using (bucket_id = 'order-photos');

-- ============================================================
-- MAKE YOURSELF AN ADMIN (run after you've signed up once)
-- ============================================================
-- update profiles set is_admin = true where email = 'kaixaden6@gmail.com';
