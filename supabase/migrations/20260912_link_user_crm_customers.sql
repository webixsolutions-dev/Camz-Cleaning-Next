-- Link app customers (users) to Invoice CRM (crm_customers) with the same 4-digit ID.
-- Run AFTER 20260912_customer_codes.sql
-- Safe to re-run after the previous "column reference code is ambiguous" error.

create or replace function public.allocate_customer_code()
returns text
language plpgsql
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

-- Same code may exist on both users and crm_customers for the SAME person.
create or replace function public.register_customer_code(p_code text)
returns text
language plpgsql
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
declare
  existing_code text;
begin
  if lower(coalesce(new.role::text, '')) = 'customer' then
    if tg_op = 'UPDATE' and old.customer_code is not null then
      new.customer_code := old.customer_code;
    elsif new.customer_code is null or btrim(new.customer_code) = '' then
      if new.email is not null then
        select c.customer_code into existing_code
        from public.crm_customers c
        where lower(c.email) = lower(new.email)
          and c.customer_code is not null
        order by c.created_at
        limit 1;
      end if;
      if existing_code is not null then
        new.customer_code := existing_code;
      else
        new.customer_code := public.allocate_customer_code();
      end if;
    elsif tg_op = 'INSERT' then
      new.customer_code := public.register_customer_code(new.customer_code);
    end if;
  else
    new.customer_code := null;
  end if;
  return new;
end;
$$;

create or replace function public.crm_customers_assign_customer_code()
returns trigger
language plpgsql
as $$
declare
  linked_user record;
begin
  if new.email is not null and (new.user_id is null or new.customer_code is null or btrim(new.customer_code) = '') then
    select u.id, u.customer_code into linked_user
    from public.users u
    where lower(u.role::text) = 'customer'
      and lower(u.email) = lower(new.email)
    limit 1;
    if linked_user.id is not null then
      new.user_id := coalesce(new.user_id, linked_user.id);
      if new.customer_code is null or btrim(new.customer_code) = '' then
        new.customer_code := linked_user.customer_code;
      end if;
    end if;
  end if;

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

create or replace function public.sync_crm_customer_from_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  crm_id uuid;
begin
  if lower(coalesce(new.role::text, '')) <> 'customer' then
    return new;
  end if;
  if new.email is null or btrim(new.email) = '' then
    return new;
  end if;

  select c.id into crm_id
  from public.crm_customers c
  where c.user_id = new.id
  limit 1;

  if crm_id is null then
    select c.id into crm_id
    from public.crm_customers c
    where lower(c.email) = lower(new.email)
    order by c.created_at
    limit 1;
  end if;

  if crm_id is not null then
    update public.crm_customers
    set
      user_id = new.id,
      display_name = coalesce(nullif(new.name, ''), display_name),
      email = new.email,
      phone = coalesce(new.phone_number, phone),
      updated_at = now()
    where id = crm_id;
  else
    insert into public.crm_customers (
      display_name,
      email,
      phone,
      user_id,
      customer_code,
      is_active,
      created_by
    )
    values (
      coalesce(nullif(new.name, ''), split_part(new.email, '@', 1)),
      new.email,
      new.phone_number,
      new.id,
      new.customer_code,
      true,
      new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists users_sync_crm_customer on public.users;
create trigger users_sync_crm_customer
after insert or update of name, email, phone_number, role, customer_code
on public.users
for each row execute function public.sync_crm_customer_from_user();

create unique index if not exists crm_customers_user_id_unique
  on public.crm_customers (user_id)
  where user_id is not null;

update public.crm_customers c
set user_id = u.id
from public.users u
where lower(u.role::text) = 'customer'
  and lower(c.email) = lower(u.email)
  and c.user_id is null
  and not exists (
    select 1 from public.crm_customers other
    where other.user_id = u.id
  );

insert into public.crm_customers (display_name, email, phone, user_id, customer_code, is_active, created_by)
select
  coalesce(nullif(u.name, ''), split_part(u.email, '@', 1)),
  u.email,
  u.phone_number,
  u.id,
  u.customer_code,
  true,
  u.id
from public.users u
where lower(u.role::text) = 'customer'
  and u.email is not null
  and btrim(u.email) <> ''
  and u.customer_code is not null
  and not exists (
    select 1 from public.crm_customers c
    where c.user_id = u.id or lower(c.email) = lower(u.email)
  );
