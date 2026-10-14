-- Ensure authenticated residents can submit a pending request for themselves,
-- including the optional image URL added for pickup request uploads.
alter table public.pickup_requests
  add column if not exists image_url text;

grant insert, select on public.pickup_requests to authenticated;

drop policy if exists "Residents can submit their own pickup requests"
  on public.pickup_requests;
create policy "Residents can submit their own pickup requests"
  on public.pickup_requests for insert to authenticated
  with check (
    resident_id = (select auth.uid())
    and status = 'pending'
  );
