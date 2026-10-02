alter table public.pickup_requests enable row level security;
alter table public.dumping_reports enable row level security;

grant select, insert on public.pickup_requests to authenticated;
grant update (status) on public.pickup_requests to authenticated;
grant select on public.dumping_reports to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'pickup_requests'
      and policyname = 'Residents can read their pickup requests'
  ) then
    create policy "Residents can read their pickup requests"
      on public.pickup_requests for select to authenticated
      using (
        resident_id = (select auth.uid())
        or (auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'pickup_requests'
      and policyname = 'Residents can submit their own pickup requests'
  ) then
    create policy "Residents can submit their own pickup requests"
      on public.pickup_requests for insert to authenticated
      with check (resident_id = (select auth.uid()) and status = 'pending');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'pickup_requests'
      and policyname = 'Council can update pickup request status'
  ) then
    create policy "Council can update pickup request status"
      on public.pickup_requests for update to authenticated
      using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin'))
      with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'dumping_reports'
      and policyname = 'Residents can read their dumping reports'
  ) then
    create policy "Residents can read their dumping reports"
      on public.dumping_reports for select to authenticated
      using (
        reporter_id = (select auth.uid())
        or (auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin')
      );
  end if;
end;
$$;
