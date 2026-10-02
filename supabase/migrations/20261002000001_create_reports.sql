create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 3 and 160),
  description text not null check (char_length(btrim(description)) between 1 and 4000),
  address_line text not null check (char_length(btrim(address_line)) between 5 and 240),
  neighborhood text not null check (char_length(btrim(neighborhood)) between 2 and 120),
  status text not null default 'submitted'
    check (status in ('submitted', 'under_review', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_reporter_created_idx
  on public.reports (reporter_id, created_at desc);
create index if not exists reports_neighborhood_status_idx
  on public.reports (lower(neighborhood), status);

create table if not exists public.report_status_history (
  id bigint generated always as identity primary key,
  report_id uuid not null references public.reports (id) on delete cascade,
  status text not null check (status in ('submitted', 'under_review', 'resolved')),
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users (id) on delete set null
);
create index if not exists report_status_history_report_idx
  on public.report_status_history (report_id, changed_at desc);

alter table public.reports enable row level security;
alter table public.report_status_history enable row level security;
grant select, insert on public.reports to authenticated;
grant update (status, updated_at) on public.reports to authenticated;
grant select on public.report_status_history to authenticated;

create policy "Residents can read their own reports; council can read all"
  on public.reports for select to authenticated
  using (
    reporter_id = (select auth.uid())
    or (auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin')
  );

create policy "Residents can submit reports as themselves"
  on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and status = 'submitted');

create policy "Council can update report status"
  on public.reports for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin'));

create policy "Report owners and council can read status history"
  on public.report_status_history for select to authenticated
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and (
          r.reporter_id = (select auth.uid())
          or (auth.jwt() -> 'app_metadata' ->> 'role') in ('council', 'admin')
        )
    )
  );

create or replace function public.track_report_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if not (
      (old.status = 'submitted' and new.status = 'under_review')
      or (old.status = 'under_review' and new.status = 'resolved')
    ) then
      raise exception 'Invalid report status transition: % to %', old.status, new.status;
    end if;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create or replace function public.record_report_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.report_status_history (report_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists reports_validate_status on public.reports;
create trigger reports_validate_status
before update of status on public.reports
for each row execute function public.track_report_status();

drop trigger if exists reports_record_status on public.reports;
create trigger reports_record_status
after insert or update of status on public.reports
for each row execute function public.record_report_status();

-- Supabase Realtime delivers council status updates to resident detail views.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reports'
  ) then
    alter publication supabase_realtime add table public.reports;
  end if;
end;
$$;
