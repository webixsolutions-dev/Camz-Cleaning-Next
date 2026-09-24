-- Camz Cleaning - Invoice Roles & Access Control
-- Admin = full system + invoice permissions
-- Accountant = invoice-only role
-- Data Entry = existing access + optional per-user invoice access

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'user_role'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'user_role'
      AND e.enumlabel = 'accountant'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'accountant';
  END IF;
END $$;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS invoice_access boolean NOT NULL DEFAULT false;

UPDATE public.users
SET invoice_access = true
WHERE role::text = 'accountant'
  AND invoice_access IS DISTINCT FROM true;

ALTER TABLE public.crm_invoices
  ADD COLUMN IF NOT EXISTS service_type text;

COMMENT ON COLUMN public.users.invoice_access IS
  'Per-user Invoice module permission. Used for Data Entry; Accountant has invoice access by role.';

COMMENT ON COLUMN public.crm_invoices.service_type IS
  'Optional service type used for invoice list/history filtering; customer PDF layout is unchanged.';
