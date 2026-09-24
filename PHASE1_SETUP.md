# Camz Cleaning Phase 1 — Pricing Foundation

## What is included
- Database-backed cleaning pricing configuration.
- Admin page: `/admin-dashboard/pricing-settings`.
- Admin API: `/api/admin/pricing-settings`.
- Public read-only pricing API for the next calculator phase: `/api/pricing`.
- Editable base packages, room allowances, extra-area charges, add-ons, carpet pricing, GST, inclusion rules, heavy-condition review and custom-quote rules.
- Optimistic version checking so one admin session cannot silently overwrite another admin's newer pricing changes.

## Required database step
Apply:

`supabase/migrations/20260919000100_create_cleaning_pricing_config.sql`

You can run it through the Supabase SQL Editor or your normal Supabase migration workflow.

After the migration is applied, open:

`/admin-dashboard/pricing-settings`

The migration seeds the Phase 1 master pricing values from the supplied pricing specification.
