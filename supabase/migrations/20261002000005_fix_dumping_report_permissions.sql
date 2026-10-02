-- Keep resident report inserts and the insert-returning SELECT scoped to the
-- authenticated reporter, even if the earlier access migration was skipped.
alter table public.dumping_reports enable row level security;
grant select, insert on public.dumping_reports to authenticated;

drop policy if exists "Residents can read their dumping reports"
  on public.dumping_reports;
create policy "Residents can read their dumping reports"
  on public.dumping_reports for select to authenticated
  using (
    reporter_id = (select auth.uid())
    or (auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin')
  );

drop policy if exists "Residents can submit their own dumping reports"
  on public.dumping_reports;
create policy "Residents can submit their own dumping reports"
  on public.dumping_reports for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and status = 'pending'
  );
