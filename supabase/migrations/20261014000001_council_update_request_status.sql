grant update (status) on public.pickup_requests to authenticated;
grant update (status) on public.dumping_reports to authenticated;

drop policy if exists "Council can update pickup request status"
  on public.pickup_requests;
create policy "Council can update pickup request status"
  on public.pickup_requests for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin'));

drop policy if exists "Council can update dumping report status"
  on public.dumping_reports;
create policy "Council can update dumping report status"
  on public.dumping_reports for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin'));
