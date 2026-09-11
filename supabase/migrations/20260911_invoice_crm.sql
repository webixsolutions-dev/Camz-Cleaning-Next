-- Invoice CRM (crm_*). Does not alter users/jobs/payments/manual_invoices.

create or replace function public.crm_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and lower(role::text) = 'admin'
      and is_blocked = false
  );
$$;

create or replace function public.crm_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and lower(role::text) in ('admin', 'data_entry')
      and is_blocked = false
  );
$$;

revoke all on function public.crm_is_admin() from public;
revoke all on function public.crm_is_staff() from public;
grant execute on function public.crm_is_admin() to authenticated;
grant execute on function public.crm_is_staff() to authenticated;

create or replace function public.crm_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.crm_forbid_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Hard delete is not allowed on %', tg_table_name;
end;
$$;

create table if not exists public.crm_customers (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  legal_name text,
  email text,
  phone text,
  notes text,
  is_active boolean not null default true,
  user_id uuid references public.users(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.crm_customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.crm_customers(id) on delete restrict,
  label text,
  line1 text not null,
  line2 text,
  city text,
  province text,
  postal_code text,
  country text not null default 'CA',
  is_billing boolean not null default false,
  is_service boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.crm_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique,
  status text not null default 'draft'
    check (status in ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void')),
  customer_id uuid not null references public.crm_customers(id) on delete restrict,
  billing_address_id uuid references public.crm_customer_addresses(id) on delete set null,
  issue_date date,
  due_date date,
  currency text not null default 'CAD',
  subtotal_cents bigint not null default 0 check (subtotal_cents >= 0),
  tax_cents bigint not null default 0 check (tax_cents >= 0),
  total_cents bigint not null default 0 check (total_cents >= 0),
  amount_paid_cents bigint not null default 0 check (amount_paid_cents >= 0),
  balance_cents bigint not null default 0 check (balance_cents >= 0),
  notes text,
  issued_at timestamptz,
  issued_by uuid references public.users(id) on delete set null,
  is_void boolean not null default false,
  voided_at timestamptz,
  voided_by uuid references public.users(id) on delete set null,
  void_reason text,
  current_revision integer not null default 1,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_invoices_total_check check (total_cents = subtotal_cents + tax_cents)
);

create table if not exists public.crm_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.crm_invoices(id) on delete restrict,
  position integer not null default 0 check (position >= 0),
  description text not null,
  quantity integer not null default 1 check (quantity >= 1),
  unit_cents bigint not null check (unit_cents >= 0),
  line_total_cents bigint not null check (line_total_cents >= 0),
  created_at timestamptz not null default now(),
  constraint crm_invoice_items_line_check check (line_total_cents = quantity * unit_cents)
);

create table if not exists public.crm_invoice_revisions (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.crm_invoices(id) on delete restrict,
  revision_number integer not null,
  snapshot jsonb not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (invoice_id, revision_number)
);

create table if not exists public.crm_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.crm_invoices(id) on delete restrict,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'CAD',
  method text,
  received_at timestamptz not null default now(),
  reference text,
  notes text,
  is_void boolean not null default false,
  voided_at timestamptz,
  voided_by uuid references public.users(id) on delete set null,
  void_reason text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_payment_reversals (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.crm_payments(id) on delete restrict,
  amount_cents bigint not null check (amount_cents > 0),
  reason text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_invoice_emails (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.crm_invoices(id) on delete restrict,
  to_email text not null,
  subject text not null,
  body text,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  sent_at timestamptz,
  error text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.crm_invoice_events (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.crm_invoices(id) on delete restrict,
  event_type text not null,
  payload jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before jsonb,
  after jsonb,
  actor_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_invoice_assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('logo', 'pdf', 'attachment')),
  invoice_id uuid references public.crm_invoices(id) on delete restrict,
  storage_path text not null,
  public_url text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_company_settings (
  id integer primary key check (id = 1),
  legal_name text not null,
  trade_name text not null,
  email text,
  phone text,
  website text,
  address_line1 text,
  city text,
  province text,
  postal_code text,
  tax_number text,
  default_tax_bps integer not null default 0 check (default_tax_bps >= 0),
  default_currency text not null default 'CAD',
  invoice_number_prefix text not null default 'INV',
  next_invoice_seq bigint not null default 1 check (next_invoice_seq >= 1),
  logo_asset_id uuid references public.crm_invoice_assets(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_reconciliation (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  expected_cents bigint not null default 0,
  received_cents bigint not null default 0,
  variance_cents bigint not null default 0,
  status text not null default 'open' check (status in ('open', 'matched', 'unmatched')),
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_reconciliation_period_check check (period_end >= period_start)
);

insert into public.crm_company_settings (id, legal_name, trade_name)
values (1, 'Camz Cleaning', 'Camz Cleaning')
on conflict (id) do nothing;

create index if not exists crm_customers_user_id_idx on public.crm_customers (user_id);
create index if not exists crm_customer_addresses_customer_id_idx on public.crm_customer_addresses (customer_id);
create index if not exists crm_invoices_customer_id_idx on public.crm_invoices (customer_id);
create index if not exists crm_invoices_status_idx on public.crm_invoices (status);
create index if not exists crm_invoice_items_invoice_id_idx on public.crm_invoice_items (invoice_id);
create index if not exists crm_payments_invoice_id_idx on public.crm_payments (invoice_id);
create index if not exists crm_invoice_emails_invoice_id_idx on public.crm_invoice_emails (invoice_id);
create index if not exists crm_invoice_events_invoice_id_idx on public.crm_invoice_events (invoice_id);

drop trigger if exists crm_customers_updated_at on public.crm_customers;
create trigger crm_customers_updated_at before update on public.crm_customers
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_customer_addresses_updated_at on public.crm_customer_addresses;
create trigger crm_customer_addresses_updated_at before update on public.crm_customer_addresses
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_invoices_updated_at on public.crm_invoices;
create trigger crm_invoices_updated_at before update on public.crm_invoices
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_company_settings_updated_at on public.crm_company_settings;
create trigger crm_company_settings_updated_at before update on public.crm_company_settings
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_reconciliation_updated_at on public.crm_reconciliation;
create trigger crm_reconciliation_updated_at before update on public.crm_reconciliation
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_invoices_no_delete on public.crm_invoices;
create trigger crm_invoices_no_delete before delete on public.crm_invoices
for each row execute function public.crm_forbid_delete();

drop trigger if exists crm_payments_no_delete on public.crm_payments;
create trigger crm_payments_no_delete before delete on public.crm_payments
for each row execute function public.crm_forbid_delete();

drop trigger if exists crm_invoice_events_no_delete on public.crm_invoice_events;
create trigger crm_invoice_events_no_delete before delete on public.crm_invoice_events
for each row execute function public.crm_forbid_delete();

drop trigger if exists crm_audit_logs_no_delete on public.crm_audit_logs;
create trigger crm_audit_logs_no_delete before delete on public.crm_audit_logs
for each row execute function public.crm_forbid_delete();

create or replace function public.crm_guard_invoice_write()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if old.is_void = true then
      raise exception 'Voided invoices cannot be changed';
    end if;
    if new.is_void = true and old.is_void = false then
      if not public.crm_is_admin() then
        raise exception 'Only an admin can void an invoice';
      end if;
      new.status := 'void';
      new.voided_at := coalesce(new.voided_at, now());
      new.voided_by := coalesce(new.voided_by, auth.uid());
    end if;
    if old.status is distinct from 'draft' and new.is_void = false then
      if new.customer_id is distinct from old.customer_id
        or new.subtotal_cents is distinct from old.subtotal_cents
        or new.tax_cents is distinct from old.tax_cents
        or new.total_cents is distinct from old.total_cents then
        raise exception 'Issued invoices cannot change money or customer fields';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists crm_invoices_guard on public.crm_invoices;
create trigger crm_invoices_guard before update on public.crm_invoices
for each row execute function public.crm_guard_invoice_write();

create or replace function public.crm_guard_payment_write()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if old.is_void = true then
      raise exception 'Voided payments cannot be changed';
    end if;
    if new.is_void = true and old.is_void = false then
      if not public.crm_is_admin() then
        raise exception 'Only an admin can void a payment';
      end if;
      new.voided_at := coalesce(new.voided_at, now());
      new.voided_by := coalesce(new.voided_by, auth.uid());
    elsif new.amount_cents is distinct from old.amount_cents
      or new.invoice_id is distinct from old.invoice_id then
      raise exception 'Payment amount and invoice cannot be changed; void instead';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists crm_payments_guard on public.crm_payments;
create trigger crm_payments_guard before update on public.crm_payments
for each row execute function public.crm_guard_payment_write();

create or replace function public.crm_guard_item_write()
returns trigger
language plpgsql
as $$
declare
  invoice_status text;
  invoice_void boolean;
begin
  select status, is_void into invoice_status, invoice_void
  from public.crm_invoices
  where id = coalesce(new.invoice_id, old.invoice_id);

  if invoice_void or invoice_status is distinct from 'draft' then
    raise exception 'Invoice line items can only change on draft invoices';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists crm_invoice_items_guard_ins on public.crm_invoice_items;
create trigger crm_invoice_items_guard_ins before insert on public.crm_invoice_items
for each row execute function public.crm_guard_item_write();

drop trigger if exists crm_invoice_items_guard_upd on public.crm_invoice_items;
create trigger crm_invoice_items_guard_upd before update on public.crm_invoice_items
for each row execute function public.crm_guard_item_write();

drop trigger if exists crm_invoice_items_guard_del on public.crm_invoice_items;
create trigger crm_invoice_items_guard_del before delete on public.crm_invoice_items
for each row execute function public.crm_guard_item_write();

create or replace function public.crm_apply_invoice_money(p_invoice_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subtotal bigint;
  v_tax bigint;
  v_total bigint;
  v_paid bigint;
  v_balance bigint;
  v_status text;
  v_is_void boolean;
begin
  select coalesce(sum(line_total_cents), 0) into v_subtotal
  from public.crm_invoice_items
  where invoice_id = p_invoice_id;

  select tax_cents, is_void, status
    into v_tax, v_is_void, v_status
  from public.crm_invoices
  where id = p_invoice_id;

  v_tax := coalesce(v_tax, 0);
  v_total := v_subtotal + v_tax;

  select coalesce(sum(amount_cents), 0) into v_paid
  from public.crm_payments
  where invoice_id = p_invoice_id
    and is_void = false;

  v_balance := greatest(v_total - v_paid, 0);

  if v_is_void then
    v_status := 'void';
  elsif v_status = 'draft' then
    v_status := 'draft';
  elsif v_paid <= 0 then
    v_status := 'issued';
  elsif v_balance <= 0 then
    v_status := 'paid';
  else
    v_status := 'partially_paid';
  end if;

  update public.crm_invoices
  set
    subtotal_cents = v_subtotal,
    total_cents = v_total,
    amount_paid_cents = v_paid,
    balance_cents = v_balance,
    status = v_status
  where id = p_invoice_id;
end;
$$;

create or replace function public.crm_after_item_change()
returns trigger
language plpgsql
as $$
begin
  perform public.crm_apply_invoice_money(coalesce(new.invoice_id, old.invoice_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists crm_invoice_items_after_ins on public.crm_invoice_items;
create trigger crm_invoice_items_after_ins after insert on public.crm_invoice_items
for each row execute function public.crm_after_item_change();

drop trigger if exists crm_invoice_items_after_upd on public.crm_invoice_items;
create trigger crm_invoice_items_after_upd after update on public.crm_invoice_items
for each row execute function public.crm_after_item_change();

drop trigger if exists crm_invoice_items_after_del on public.crm_invoice_items;
create trigger crm_invoice_items_after_del after delete on public.crm_invoice_items
for each row execute function public.crm_after_item_change();

create or replace function public.crm_after_payment_change()
returns trigger
language plpgsql
as $$
begin
  perform public.crm_apply_invoice_money(coalesce(new.invoice_id, old.invoice_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists crm_payments_after_ins on public.crm_payments;
create trigger crm_payments_after_ins after insert on public.crm_payments
for each row execute function public.crm_after_payment_change();

drop trigger if exists crm_payments_after_upd on public.crm_payments;
create trigger crm_payments_after_upd after update on public.crm_payments
for each row execute function public.crm_after_payment_change();

create or replace function public.crm_append_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.crm_audit_logs (entity_type, entity_id, action, before, after, actor_id)
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    lower(tg_op),
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end,
    auth.uid()
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists crm_invoices_audit on public.crm_invoices;
create trigger crm_invoices_audit after insert or update on public.crm_invoices
for each row execute function public.crm_append_audit();

drop trigger if exists crm_payments_audit on public.crm_payments;
create trigger crm_payments_audit after insert or update on public.crm_payments
for each row execute function public.crm_append_audit();

create or replace function public.crm_issue_invoice(p_invoice_id uuid)
returns public.crm_invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.crm_invoices;
  v_prefix text;
  v_seq bigint;
  v_number text;
  v_items jsonb;
begin
  if not public.crm_is_staff() then
    raise exception 'Staff access required';
  end if;

  select * into v_invoice from public.crm_invoices where id = p_invoice_id for update;
  if not found then
    raise exception 'Invoice not found';
  end if;
  if v_invoice.is_void then
    raise exception 'Voided invoices cannot be issued';
  end if;
  if v_invoice.status is distinct from 'draft' then
    raise exception 'Only draft invoices can be issued';
  end if;
  if v_invoice.total_cents <= 0 then
    raise exception 'Invoice must have a total greater than zero';
  end if;

  select invoice_number_prefix, next_invoice_seq
    into v_prefix, v_seq
  from public.crm_company_settings
  where id = 1
  for update;

  v_number := v_prefix || '-' || lpad(v_seq::text, 5, '0');

  update public.crm_company_settings
  set next_invoice_seq = next_invoice_seq + 1
  where id = 1;

  update public.crm_invoices
  set
    invoice_number = v_number,
    status = 'issued',
    issue_date = coalesce(issue_date, current_date),
    issued_at = now(),
    issued_by = auth.uid(),
    current_revision = current_revision + 1
  where id = p_invoice_id
  returning * into v_invoice;

  select coalesce(jsonb_agg(to_jsonb(i) order by i.position), '[]'::jsonb)
    into v_items
  from public.crm_invoice_items i
  where i.invoice_id = p_invoice_id;

  insert into public.crm_invoice_revisions (invoice_id, revision_number, snapshot, created_by)
  values (
    p_invoice_id,
    v_invoice.current_revision,
    jsonb_build_object('invoice', to_jsonb(v_invoice), 'items', v_items),
    auth.uid()
  );

  insert into public.crm_invoice_events (invoice_id, event_type, payload, created_by)
  values (
    p_invoice_id,
    'issued',
    jsonb_build_object('invoice_number', v_number),
    auth.uid()
  );

  return v_invoice;
end;
$$;

create or replace function public.crm_void_invoice(p_invoice_id uuid, p_reason text)
returns public.crm_invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.crm_invoices;
begin
  if not public.crm_is_admin() then
    raise exception 'Only an admin can void an invoice';
  end if;
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'Void reason is required';
  end if;

  update public.crm_invoices
  set
    is_void = true,
    status = 'void',
    voided_at = now(),
    voided_by = auth.uid(),
    void_reason = p_reason
  where id = p_invoice_id
    and is_void = false
  returning * into v_invoice;

  if not found then
    raise exception 'Invoice not found or already voided';
  end if;

  insert into public.crm_invoice_events (invoice_id, event_type, payload, created_by)
  values (
    p_invoice_id,
    'voided',
    jsonb_build_object('reason', p_reason),
    auth.uid()
  );

  return v_invoice;
end;
$$;

create or replace function public.crm_void_payment(p_payment_id uuid, p_reason text)
returns public.crm_payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.crm_payments;
begin
  if not public.crm_is_admin() then
    raise exception 'Only an admin can void a payment';
  end if;
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'Void reason is required';
  end if;

  update public.crm_payments
  set
    is_void = true,
    voided_at = now(),
    voided_by = auth.uid(),
    void_reason = p_reason
  where id = p_payment_id
    and is_void = false
  returning * into v_payment;

  if not found then
    raise exception 'Payment not found or already voided';
  end if;

  insert into public.crm_invoice_events (invoice_id, event_type, payload, created_by)
  values (
    v_payment.invoice_id,
    'payment_voided',
    jsonb_build_object('payment_id', p_payment_id, 'reason', p_reason),
    auth.uid()
  );

  insert into public.crm_payment_reversals (payment_id, amount_cents, reason, created_by)
  values (p_payment_id, v_payment.amount_cents, p_reason, auth.uid());

  return v_payment;
end;
$$;

revoke all on function public.crm_issue_invoice(uuid) from public;
revoke all on function public.crm_void_invoice(uuid, text) from public;
revoke all on function public.crm_void_payment(uuid, text) from public;
revoke all on function public.crm_apply_invoice_money(uuid) from public;
grant execute on function public.crm_issue_invoice(uuid) to authenticated;
grant execute on function public.crm_void_invoice(uuid, text) to authenticated;
grant execute on function public.crm_void_payment(uuid, text) to authenticated;
grant execute on function public.crm_apply_invoice_money(uuid) to authenticated;

do $$
declare
  t text;
  tables text[] := array[
    'crm_customers', 'crm_customer_addresses', 'crm_invoices', 'crm_invoice_items',
    'crm_invoice_revisions', 'crm_payments', 'crm_payment_reversals', 'crm_invoice_emails',
    'crm_invoice_events', 'crm_audit_logs', 'crm_invoice_assets', 'crm_company_settings',
    'crm_reconciliation'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from public, anon', t);
    execute format('grant select, insert, update on table public.%I to authenticated', t);
  end loop;
end
$$;

revoke delete on table public.crm_invoices from authenticated;
revoke delete on table public.crm_payments from authenticated;
revoke delete on table public.crm_invoice_events from authenticated;
revoke delete on table public.crm_audit_logs from authenticated;
grant delete on table public.crm_invoice_items to authenticated;
grant delete on table public.crm_customer_addresses to authenticated;

drop policy if exists crm_staff_select on public.crm_customers;
drop policy if exists crm_staff_insert on public.crm_customers;
drop policy if exists crm_staff_update on public.crm_customers;

create policy crm_staff_select on public.crm_customers for select to authenticated using (public.crm_is_staff());
create policy crm_staff_insert on public.crm_customers for insert to authenticated with check (public.crm_is_staff());
create policy crm_staff_update on public.crm_customers for update to authenticated using (public.crm_is_staff()) with check (public.crm_is_staff());

drop policy if exists crm_addr_select on public.crm_customer_addresses;
drop policy if exists crm_addr_insert on public.crm_customer_addresses;
drop policy if exists crm_addr_update on public.crm_customer_addresses;
drop policy if exists crm_addr_delete on public.crm_customer_addresses;

create policy crm_addr_select on public.crm_customer_addresses for select to authenticated using (public.crm_is_staff());
create policy crm_addr_insert on public.crm_customer_addresses for insert to authenticated with check (public.crm_is_staff());
create policy crm_addr_update on public.crm_customer_addresses for update to authenticated using (public.crm_is_staff()) with check (public.crm_is_staff());
create policy crm_addr_delete on public.crm_customer_addresses for delete to authenticated using (public.crm_is_staff());

drop policy if exists crm_inv_select on public.crm_invoices;
drop policy if exists crm_inv_insert on public.crm_invoices;
drop policy if exists crm_inv_update on public.crm_invoices;

create policy crm_inv_select on public.crm_invoices for select to authenticated using (public.crm_is_staff());
create policy crm_inv_insert on public.crm_invoices for insert to authenticated with check (public.crm_is_staff());
create policy crm_inv_update on public.crm_invoices for update to authenticated using (public.crm_is_staff()) with check (public.crm_is_staff());

drop policy if exists crm_item_select on public.crm_invoice_items;
drop policy if exists crm_item_insert on public.crm_invoice_items;
drop policy if exists crm_item_update on public.crm_invoice_items;
drop policy if exists crm_item_delete on public.crm_invoice_items;

create policy crm_item_select on public.crm_invoice_items for select to authenticated using (public.crm_is_staff());
create policy crm_item_insert on public.crm_invoice_items for insert to authenticated with check (public.crm_is_staff());
create policy crm_item_update on public.crm_invoice_items for update to authenticated using (public.crm_is_staff()) with check (public.crm_is_staff());
create policy crm_item_delete on public.crm_invoice_items for delete to authenticated using (public.crm_is_staff());

drop policy if exists crm_rev_select on public.crm_invoice_revisions;
drop policy if exists crm_rev_insert on public.crm_invoice_revisions;

create policy crm_rev_select on public.crm_invoice_revisions for select to authenticated using (public.crm_is_staff());
create policy crm_rev_insert on public.crm_invoice_revisions for insert to authenticated with check (public.crm_is_staff());

drop policy if exists crm_pay_select on public.crm_payments;
drop policy if exists crm_pay_insert on public.crm_payments;
drop policy if exists crm_pay_update on public.crm_payments;

create policy crm_pay_select on public.crm_payments for select to authenticated using (public.crm_is_staff());
create policy crm_pay_insert on public.crm_payments for insert to authenticated with check (public.crm_is_staff());
create policy crm_pay_update on public.crm_payments for update to authenticated using (public.crm_is_staff()) with check (public.crm_is_staff());

drop policy if exists crm_revpay_select on public.crm_payment_reversals;
drop policy if exists crm_revpay_insert on public.crm_payment_reversals;

create policy crm_revpay_select on public.crm_payment_reversals for select to authenticated using (public.crm_is_staff());
create policy crm_revpay_insert on public.crm_payment_reversals for insert to authenticated with check (public.crm_is_admin());

drop policy if exists crm_email_select on public.crm_invoice_emails;
drop policy if exists crm_email_insert on public.crm_invoice_emails;
drop policy if exists crm_email_update on public.crm_invoice_emails;

create policy crm_email_select on public.crm_invoice_emails for select to authenticated using (public.crm_is_staff());
create policy crm_email_insert on public.crm_invoice_emails for insert to authenticated with check (public.crm_is_staff());
create policy crm_email_update on public.crm_invoice_emails for update to authenticated using (public.crm_is_staff()) with check (public.crm_is_staff());

drop policy if exists crm_evt_select on public.crm_invoice_events;
drop policy if exists crm_evt_insert on public.crm_invoice_events;

create policy crm_evt_select on public.crm_invoice_events for select to authenticated using (public.crm_is_staff());
create policy crm_evt_insert on public.crm_invoice_events for insert to authenticated with check (public.crm_is_staff());

drop policy if exists crm_audit_select on public.crm_audit_logs;
drop policy if exists crm_audit_insert on public.crm_audit_logs;

create policy crm_audit_select on public.crm_audit_logs for select to authenticated using (public.crm_is_staff());
create policy crm_audit_insert on public.crm_audit_logs for insert to authenticated with check (public.crm_is_staff());

drop policy if exists crm_asset_select on public.crm_invoice_assets;
drop policy if exists crm_asset_insert on public.crm_invoice_assets;

create policy crm_asset_select on public.crm_invoice_assets for select to authenticated using (public.crm_is_staff());
create policy crm_asset_insert on public.crm_invoice_assets for insert to authenticated with check (public.crm_is_staff());

drop policy if exists crm_settings_select on public.crm_company_settings;
drop policy if exists crm_settings_update on public.crm_company_settings;

create policy crm_settings_select on public.crm_company_settings for select to authenticated using (public.crm_is_staff());
create policy crm_settings_update on public.crm_company_settings for update to authenticated using (public.crm_is_admin()) with check (public.crm_is_admin());

drop policy if exists crm_recon_select on public.crm_reconciliation;
drop policy if exists crm_recon_insert on public.crm_reconciliation;
drop policy if exists crm_recon_update on public.crm_reconciliation;

create policy crm_recon_select on public.crm_reconciliation for select to authenticated using (public.crm_is_staff());
create policy crm_recon_insert on public.crm_reconciliation for insert to authenticated with check (public.crm_is_staff());
create policy crm_recon_update on public.crm_reconciliation for update to authenticated using (public.crm_is_admin()) with check (public.crm_is_admin());

notify pgrst, 'reload schema';
