-- Company profile fields for Invoice CRM settings.
-- Does not recreate numbering; only avoids a double hyphen when prefix already ends with '-'.

alter table public.crm_company_settings
  add column if not exists address_line2 text,
  add column if not exists reply_to_email text,
  add column if not exists e_transfer_instructions text,
  add column if not exists invoice_footer_text text,
  add column if not exists default_customer_note text,
  add column if not exists default_due_terms text,
  add column if not exists default_due_days integer not null default 14,
  add column if not exists timezone text not null default 'America/Edmonton',
  add column if not exists logo_url text,
  add column if not exists deposit_percentage integer not null default 25;

alter table public.crm_company_settings
  drop constraint if exists crm_company_settings_deposit_percentage_check;
alter table public.crm_company_settings
  add constraint crm_company_settings_deposit_percentage_check
  check (deposit_percentage >= 0 and deposit_percentage <= 100);

alter table public.crm_company_settings
  drop constraint if exists crm_company_settings_due_days_check;
alter table public.crm_company_settings
  add constraint crm_company_settings_due_days_check
  check (default_due_days >= 0 and default_due_days <= 365);

insert into storage.buckets (id, name, public)
values ('crm-assets', 'crm-assets', true)
on conflict (id) do update set public = true;

drop policy if exists crm_assets_public_read on storage.objects;
create policy crm_assets_public_read
  on storage.objects for select
  using (bucket_id = 'crm-assets');

drop policy if exists crm_assets_admin_write on storage.objects;
create policy crm_assets_admin_write
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'crm-assets' and public.crm_is_admin());

drop policy if exists crm_assets_admin_update on storage.objects;
create policy crm_assets_admin_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'crm-assets' and public.crm_is_admin())
  with check (bucket_id = 'crm-assets' and public.crm_is_admin());

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

  v_prefix := btrim(coalesce(v_prefix, 'INV'));
  if v_prefix = '' then
    v_prefix := 'INV';
  end if;
  if right(v_prefix, 1) = '-' then
    v_number := v_prefix || lpad(v_seq::text, 5, '0');
  else
    v_number := v_prefix || '-' || lpad(v_seq::text, 5, '0');
  end if;

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

grant execute on function public.crm_issue_invoice(uuid) to authenticated;

notify pgrst, 'reload schema';
