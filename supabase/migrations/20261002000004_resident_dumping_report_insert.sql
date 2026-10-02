grant insert on public.dumping_reports to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dumping_reports'
      and policyname = 'Residents can submit their own dumping reports'
  ) then
    create policy "Residents can submit their own dumping reports"
      on public.dumping_reports for insert to authenticated
      with check (
        reporter_id = (select auth.uid())
        and status = 'pending'
      );
  end if;
end;
$$;
