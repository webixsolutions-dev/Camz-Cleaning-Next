-- Unique 4-digit customer IDs (0001-9999) for app customers and CRM billing customers.
-- Run in Supabase SQL Editor.

create table if not exists public.customer_code_counter (
  id integer primary key check (id = 1),
  next_code integer not null default 1 check (next_code >= 1 and next_code <= 10000)
);

insert into public.customer_code_counter (id, next_code)
values (1, 1)
on conflict (id) do nothing;

create table if not exists public.customer_code_registry (
  code text primary key,
  constraint customer_code_registry_digits check (code ~ '^[0-9]{4}$')
);

alter table public.users
  add column if not exists customer_code text;

alter table public.crm_customers
  add column if not exists customer_code text;

alter table public.users
  drop constraint if exists users_customer_code_digits;

alter table public.users
  add constraint users_customer_code_digits
  check (customer_code is null or customer_code ~ '^[0-9]{4}$');

alter table public.crm_customers
  drop constraint if exists crm_customers_customer_code_digits;

alter table public.crm_customers
  add constraint crm_customers_customer_code_digits
  check (customer_code is null or customer_code ~ '^[0-9]{4}$');

create unique index if not exists users_customer_code_unique
  on public.users (customer_code)
  where customer_code is not null;

create unique index if not exists crm_customers_customer_code_unique
  on public.crm_customers (customer_code)
  where customer_code is not null;

create or replace function public.allocate_customer_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
  v_code text;
begin
  insert into public.customer_code_counter (id, next_code)
  values (1, 1)
  on conflict (id) do nothing;

  loop
    update public.customer_code_counter
    set next_code = next_code + 1
    where id = 1
      and next_code <= 9999
    returning next_code - 1 into n;

    if n is null then
      raise exception 'No 4-digit customer IDs remaining (0001-9999).';
    end if;

    v_code := lpad(n::text, 4, '0');
    begin
      insert into public.customer_code_registry (code) values (v_code);
      return v_code;
    exception
      when unique_violation then
        null;
    end;
  end loop;
end;
$$;

create or replace function public.register_customer_code(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  v_code := lpad(regexp_replace(coalesce(p_code, ''), '\D', '', 'g'), 4, '0');
  if v_code !~ '^[0-9]{4}$' then
    raise exception 'Customer ID must be exactly 4 digits.';
  end if;
  insert into public.customer_code_registry (code) values (v_code)
  on conflict (code) do nothing;
  return v_code;
end;
$$;

create or replace function public.users_assign_customer_code()
returns trigger
language plpgsql
as $$
begin
  if lower(coalesce(new.role::text, '')) = 'customer' then
    if tg_op = 'UPDATE' and old.customer_code is not null then
      new.customer_code := old.customer_code;
    elsif new.customer_code is null or btrim(new.customer_code) = '' then
      new.customer_code := public.allocate_customer_code();
    elsif tg_op = 'INSERT' then
      new.customer_code := public.register_customer_code(new.customer_code);
    end if;
  else
    new.customer_code := null;
  end if;
  return new;
end;
$$;

drop trigger if exists users_assign_customer_code on public.users;
create trigger users_assign_customer_code
before insert or update on public.users
for each row execute function public.users_assign_customer_code();

create or replace function public.crm_customers_assign_customer_code()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.customer_code is not null then
    new.customer_code := old.customer_code;
  elsif new.customer_code is null or btrim(new.customer_code) = '' then
    new.customer_code := public.allocate_customer_code();
  elsif tg_op = 'INSERT' then
    new.customer_code := public.register_customer_code(new.customer_code);
  end if;
  return new;
end;
$$;

drop trigger if exists crm_customers_assign_customer_code on public.crm_customers;
create trigger crm_customers_assign_customer_code
before insert or update on public.crm_customers
for each row execute function public.crm_customers_assign_customer_code();

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := lower(coalesce(new.raw_user_meta_data->>'role', new.raw_app_meta_data->>'role', 'customer'));
begin
  if meta_role not in ('admin', 'customer', 'cleaner', 'data_entry') then
    meta_role := 'customer';
  end if;

  insert into public.users (
    id,
    name,
    email,
    role,
    phone_number,
    approval_status,
    is_blocked,
    source,
    verified
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(coalesce(new.email, 'customer'), '@', 1)),
    new.email,
    meta_role::public.user_role,
    coalesce(new.raw_user_meta_data->>'phone_number', ''),
    case when meta_role = 'customer' then 'pending' else 'approved' end,
    false,
    'Web',
    false
  )
  on conflict (id) do nothing;

  return new;
exception
  when others then
    raise warning 'handle_auth_user_created failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

update public.users
set name = name
where lower(role::text) = 'customer'
  and (customer_code is null or btrim(customer_code) = '');

update public.crm_customers
set display_name = display_name
where customer_code is null or btrim(customer_code) = '';
