-- Account roles are provisioned by a trusted operator. Authenticated users can
-- read their own role, but cannot assign themselves council/admin privileges.
alter table public.users
  add column if not exists role text not null default 'user';

alter table public.users
  drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check check (role in ('user', 'council', 'admin'));

-- Keep profile editing available while withholding write access to `role`.
revoke update on public.users from authenticated;
grant update (full_name, phone, address_line, neighborhood, updated_at)
  on public.users to authenticated;

drop policy if exists "Users can create their own profile" on public.users;
create policy "Users can create their own profile"
  on public.users for insert to authenticated
  with check ((select auth.uid()) = id and role = 'user');
