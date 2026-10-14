-- Every signed-in user can update request status, regardless of app role.
grant update (status) on public.pickup_requests to authenticated;
grant update (status) on public.dumping_reports to authenticated;

drop policy if exists "Council can update pickup request status"
  on public.pickup_requests;
create policy "Authenticated users can update pickup request status"
  on public.pickup_requests for update to authenticated
  using (true)
  with check (true);

drop policy if exists "Council can update dumping report status"
  on public.dumping_reports;
create policy "Authenticated users can update dumping report status"
  on public.dumping_reports for update to authenticated
  using (true)
  with check (true);

alter table public.pickup_requests
  drop constraint if exists pickup_requests_status_check;
alter table public.pickup_requests
  add constraint pickup_requests_status_check
  check (status = any (array['pending', 'in_review', 'assigned', 'resolved', 'rejected']::text[]));

alter table public.dumping_reports
  drop constraint if exists dumping_reports_status_check;
alter table public.dumping_reports
  add constraint dumping_reports_status_check
  check (status = any (array['pending', 'in_review', 'assigned', 'resolved', 'rejected']::text[]));
