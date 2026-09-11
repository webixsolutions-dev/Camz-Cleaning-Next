-- Invoice CRM only. Does not touch public.payments (jobs/Square) or public.customers (does not exist).
-- Safe to re-run. Null emails were audited as 0 rows.

do $$
begin
  if exists (
    select 1 from public.crm_customers
    where email is null or btrim(email) = ''
  ) then
    raise exception 'crm_customers has null/blank emails; stop and decide how to fill them before NOT NULL';
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

update public.crm_company_settings
set deposit_percentage = coalesce(deposit_percentage, 25)
where id = 1;
