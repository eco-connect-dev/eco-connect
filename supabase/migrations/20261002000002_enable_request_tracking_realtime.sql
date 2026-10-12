do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'dumping_reports'
  ) then
    alter publication supabase_realtime add table public.dumping_reports;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pickup_requests'
  ) then
    alter publication supabase_realtime add table public.pickup_requests;
  end if;
end;
$$;
