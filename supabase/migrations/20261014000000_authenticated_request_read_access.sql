-- All signed-in app users can view pickup and dumping requests, regardless of
-- their application role. Inserts and updates remain governed by the existing
-- owner and council policies.
grant select on public.pickup_requests to authenticated;
grant select on public.dumping_reports to authenticated;

drop policy if exists "Residents can read their pickup requests"
  on public.pickup_requests;
create policy "Authenticated users can read all pickup requests"
  on public.pickup_requests for select to authenticated
  using (true);

drop policy if exists "Residents can read their dumping reports"
  on public.dumping_reports;
create policy "Authenticated users can read all dumping reports"
  on public.dumping_reports for select to authenticated
  using (true);
