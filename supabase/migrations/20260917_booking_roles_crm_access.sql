-- Category/role-level CRM permission for Calendar > Manage Users > Manage Roles.
-- Admin access remains implicit in application code.

alter table public.booking_roles
  add column if not exists can_access_crm boolean not null default false;

-- Ensure the built-in operational categories exist. Existing values are preserved.
insert into public.booking_roles (key, name, base_role, is_system, can_access_crm)
values
  ('cleaner', 'Cleaner', 'cleaner', true, false),
  ('data_entry', 'Data Entry', 'data_entry', true, false)
on conflict (key) do nothing;

-- Middleware/server permission checks need authenticated staff to read role
-- definitions. Role names and access flags are not sensitive data.
grant select on table public.booking_roles to authenticated;

alter table public.booking_roles enable row level security;

drop policy if exists "authenticated_read_booking_roles" on public.booking_roles;
create policy "authenticated_read_booking_roles"
on public.booking_roles
for select
to authenticated
using (true);
