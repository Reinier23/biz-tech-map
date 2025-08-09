-- Enable pgcrypto for gen_random_uuid (safe if already enabled)
create extension if not exists pgcrypto;

-- 1) Create shares table
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  is_public boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- 2) Enable Row Level Security
alter table public.shares enable row level security;

-- 3) Policies
-- Allow SELECT for anon & authenticated only when is_public = true
create policy "Public can read public shares"
  on public.shares
  for select
  using (is_public = true);

-- Allow INSERT for authenticated users (app creates shares when logged in)
create policy "Authenticated can insert shares"
  on public.shares
  for insert
  with check (true);

-- Optional helpful index to fetch by id quickly (though PK already exists)
create index if not exists idx_shares_created_at on public.shares (created_at desc);