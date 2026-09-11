-- FR-31.3: lock invoice + sequence rows so numbering and payment totals cannot race.

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
  perform 1 from public.crm_invoices where id = p_invoice_id for update;

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

create or replace function public.crm_record_payment(
  p_invoice_id uuid,
  p_amount_cents bigint,
  p_method text default 'e_transfer',
  p_reference text default null,
  p_notes text default null
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
    invoice_id, amount_cents, currency, method, received_at, reference, notes, created_by
  ) values (
    p_invoice_id,
    p_amount_cents,
    v_invoice.currency,
    coalesce(p_method, 'e_transfer'),
    now(),
    p_reference,
    p_notes,
    auth.uid()
  )
  returning * into v_payment;

  insert into public.crm_invoice_events (invoice_id, event_type, payload, created_by)
  values (
    p_invoice_id,
    'payment_recorded',
    jsonb_build_object('payment_id', v_payment.id, 'amount_cents', p_amount_cents),
    auth.uid()
  );

  return v_payment;
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

  select * into v_invoice from public.crm_invoices where id = p_invoice_id for update;
  if not found then
    raise exception 'Invoice not found';
  end if;
  if v_invoice.is_void then
    raise exception 'Invoice not found or already voided';
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

  select * into v_payment from public.crm_payments where id = p_payment_id for update;
  if not found then
    raise exception 'Payment not found';
  end if;

  perform 1 from public.crm_invoices where id = v_payment.invoice_id for update;

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

revoke all on function public.crm_record_payment(uuid, bigint, text, text, text) from public;
revoke all on function public.crm_void_invoice(uuid, text) from public;
grant execute on function public.crm_record_payment(uuid, bigint, text, text, text) to authenticated;
grant execute on function public.crm_apply_invoice_money(uuid) to authenticated;
grant execute on function public.crm_void_payment(uuid, text) to authenticated;
grant execute on function public.crm_void_invoice(uuid, text) to authenticated;

notify pgrst, 'reload schema';
