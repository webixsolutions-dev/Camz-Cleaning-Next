-- Fix: staff adding a CRM customer must not insert into customer_code_counter as themselves.
-- Empty phone/address is allowed. Name + email are required. This error is RLS, not empty fields.

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

alter function public.allocate_customer_code() owner to postgres;
alter function public.register_customer_code(text) owner to postgres;

revoke all on function public.allocate_customer_code() from public;
revoke all on function public.register_customer_code(text) from public;
grant execute on function public.allocate_customer_code() to authenticated, service_role;
grant execute on function public.register_customer_code(text) to authenticated, service_role;

alter table public.customer_code_counter enable row level security;
alter table public.customer_code_registry enable row level security;

revoke all on table public.customer_code_counter from public, anon, authenticated;
revoke all on table public.customer_code_registry from public, anon, authenticated;
grant all on table public.customer_code_counter to postgres, service_role;
grant all on table public.customer_code_registry to postgres, service_role;
