create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null check (char_length(btrim(author_name)) between 1 and 120),
  description text not null check (char_length(btrim(description)) between 1 and 4000),
  location text not null check (char_length(btrim(location)) between 2 and 240),
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_idx
  on public.community_posts (created_at desc);

alter table public.community_posts enable row level security;
grant select, insert on public.community_posts to authenticated;

create policy "Authenticated users can read community posts"
  on public.community_posts for select to authenticated
  using (true);

create policy "Users can create community posts as themselves"
  on public.community_posts for insert to authenticated
  with check (author_id = (select auth.uid()));
