alter table public.community_posts
  add column if not exists deleted smallint not null default 0;

alter table public.community_posts
  drop constraint if exists community_posts_deleted_check;
alter table public.community_posts
  add constraint community_posts_deleted_check check (deleted in (0, 1));

revoke delete on public.community_posts from authenticated;
drop policy if exists "Council can delete community posts"
  on public.community_posts;
drop policy if exists "Authenticated users can delete community posts"
  on public.community_posts;

grant update (deleted) on public.community_posts to authenticated;
drop policy if exists "Authenticated users can soft-delete community posts"
  on public.community_posts;
create policy "Authenticated users can soft-delete community posts"
  on public.community_posts for update to authenticated
  using (true)
  with check (deleted = 1);
