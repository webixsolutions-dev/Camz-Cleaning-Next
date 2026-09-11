-- Invoice CRM schema: required customer email, deposit flag, configurable deposit %.
-- Does not alter public.payments (jobs/Square) or create public.customers.

do $$
begin
  if exists (
    select 1
    from public.crm_customers
    where email is null or btrim(email) = ''
  ) then
    raise exception 'crm_customers has null/blank emails; refuse NOT NULL until those rows are fixed';
  end if;
end $$;

alter table public.crm_customers
  alter column email set not null;

alter table public.crm_customers
  drop constraint if exists crm_customers_email_required;

alter table public.crm_customers
  add constraint crm_customers_email_required check (length(btrim(email)) > 0);

alter table public.crm_payments
  add column if not exists is_deposit boolean default false;

alter table public.crm_company_settings
  add column if not exists deposit_percentage integer not null default 25;

alter table public.crm_company_settings
  drop constraint if exists crm_company_settings_deposit_percentage_check;

alter table public.crm_company_settings
  add constraint crm_company_settings_deposit_percentage_check
  check (deposit_percentage >= 0 and deposit_percentage <= 100);

drop function if exists public.crm_record_payment(uuid, bigint, text, text, text);

create or replace function public.crm_record_payment(
  p_invoice_id uuid,
  p_amount_cents bigint,
  p_method text default 'e_transfer',
  p_reference text default null,
  p_notes text default null,
  p_is_deposit boolean default false
)
returns public.crm_payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.crm_invoices;
  v_payment public.crm_payments;
begin
  if not public.crm_is_staff() then
    raise exception 'Staff access required';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;

  select * into v_invoice from public.crm_invoices where id = p_invoice_id for update;
  if not found then
    raise exception 'Invoice not found';
  end if;
  if v_invoice.is_void or v_invoice.status = 'draft' then
    raise exception 'Payments can only be recorded on issued invoices';
  end if;

  insert into public.crm_payments (
    invoice_id, amount_cents, currency, method, received_at, reference, notes, is_deposit, created_by
  ) values (
    p_invoice_id,
    p_amount_cents,
    v_invoice.currency,
    coalesce(p_method, 'e_transfer'),
    now(),
    p_reference,
    p_notes,
    coalesce(p_is_deposit, false),
    auth.uid()
  )
  returning * into v_payment;

  insert into public.crm_invoice_events (invoice_id, event_type, payload, created_by)
  values (
    p_invoice_id,
    'payment_recorded',
    jsonb_build_object(
      'payment_id', v_payment.id,
      'amount_cents', p_amount_cents,
      'is_deposit', coalesce(p_is_deposit, false)
    ),
    auth.uid()
  );

  return v_payment;
end;
$$;

revoke all on function public.crm_record_payment(uuid, bigint, text, text, text, boolean) from public;
grant execute on function public.crm_record_payment(uuid, bigint, text, text, text, boolean) to authenticated;

notify pgrst, 'reload schema';
