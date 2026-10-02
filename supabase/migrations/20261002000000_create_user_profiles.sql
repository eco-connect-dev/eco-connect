create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  phone text not null check (char_length(btrim(phone)) between 7 and 20),
  address_line text not null check (char_length(btrim(address_line)) between 5 and 240),
  neighborhood text not null check (char_length(btrim(neighborhood)) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Service modules can efficiently find residents by neighborhood.
create index if not exists users_neighborhood_idx
  on public.users (lower(neighborhood));

alter table public.users enable row level security;
grant select, insert, update on public.users to authenticated;

create policy "Users can read their own profile"
  on public.users for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their own profile"
  on public.users for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.users for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
