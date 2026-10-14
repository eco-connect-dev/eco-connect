grant delete on public.community_posts to authenticated;

create policy "Council can delete community posts"
  on public.community_posts for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin'));
