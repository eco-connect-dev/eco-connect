-- Driver accounts are assigned by a trusted administrator. Residents cannot
-- promote themselves because role remains outside their profile update grant.
alter table public.users
  drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check
  check (role in ('user', 'council', 'admin', 'driver'));

-- Remove the older broad status-write policy. Council/admin retain status
-- management while drivers may only resolve a task that is currently assigned.
drop policy if exists "Council can update pickup request status"
  on public.pickup_requests;
drop policy if exists "Authenticated users can update pickup request status"
  on public.pickup_requests;
drop policy if exists "Council can update dumping report status"
  on public.dumping_reports;
drop policy if exists "Authenticated users can update dumping report status"
  on public.dumping_reports;

grant update (status) on public.pickup_requests to authenticated;
grant update (status) on public.dumping_reports to authenticated;

create policy "Council and admins manage pickup request status"
  on public.pickup_requests for update to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = (select auth.uid()) and u.role in ('council', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = (select auth.uid()) and u.role in ('council', 'admin')
    )
  );

create policy "Drivers resolve assigned pickup requests"
  on public.pickup_requests for update to authenticated
  using (
    status = 'assigned'
    and exists (
      select 1 from public.users u
      where u.id = (select auth.uid()) and u.role = 'driver'
    )
  )
  with check (
    status = 'resolved'
    and exists (
      select 1 from public.users u
      where u.id = (select auth.uid()) and u.role = 'driver'
    )
  );

create policy "Council and admins manage dumping report status"
  on public.dumping_reports for update to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = (select auth.uid()) and u.role in ('council', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = (select auth.uid()) and u.role in ('council', 'admin')
    )
  );

create policy "Drivers resolve assigned dumping reports"
  on public.dumping_reports for update to authenticated
  using (
    status = 'assigned'
    and exists (
      select 1 from public.users u
      where u.id = (select auth.uid()) and u.role = 'driver'
    )
  )
  with check (
    status = 'resolved'
    and exists (
      select 1 from public.users u
      where u.id = (select auth.uid()) and u.role = 'driver'
    )
  );
