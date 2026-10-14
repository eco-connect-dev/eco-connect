grant delete on public.community_posts to authenticated;

drop policy if exists "Council can delete community posts"
  on public.community_posts;
drop policy if exists "Authenticated users can delete community posts"
  on public.community_posts;
create policy "Authenticated users can delete community posts"
  on public.community_posts for delete to authenticated
  using (true);
