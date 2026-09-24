# Camz Cleaning — Build Your Own Scope implementation

Implemented from **Camz Cleaning Custom Scope Pricing & Booking Logic** developer instructions.

## What changed

- Existing prebuilt packages remain available.
- Standard, Deep, and Move-In / Move-Out now also support **Build Your Own Scope**.
- Custom mode starts every area counter at `0` and allows any combination, including all counters remaining at `0`.
- Custom service pricing uses:
  - selected-area subtotal = quantity × admin-configured unit value
  - service subtotal = `MAX(custom minimum, selected-area subtotal)`
  - selected add-ons and carpet charges are added after the minimum-floor rule
  - configured GST/tax is applied to the combined subtotal
- Zero-count areas are omitted from the customer review and persisted `customScope` list.
- Existing duplicate-charge/add-on rules remain active and are selection-aware in custom mode.
- Admin Pricing Settings can enable/disable custom scope per cleaning service and edit custom minimums and area unit values.
- Admin booking detail shows the exact selected scope, selected-area subtotal, minimum, minimum adjustment, and server pricing breakdown.
- Server-side booking repricing uses the same custom-scope rules as the client before saving a booking.

## Database migration

Run:

`supabase/migrations/20260925000100_add_custom_scope_pricing_defaults.sql`

The migration preserves existing pricing and adds `customScope` defaults to the existing singleton pricing config. Runtime validation is also backward-compatible with a legacy config while deployment is being completed.

## Required pricing checks verified

- Deep: 0 bed + 1 full bath → $159
- Deep: 0 bed + 3 full baths → $159
- Deep: 0 bed + 4 full baths → $160
- Deep: 0 bed + 3 full + 1 half bath → $159
- Standard: 0 bed + 3 full baths → $99
- Standard: 0 bed + 4 full baths → $120
- Standard: all area counters 0 → $99 before add-ons
- Move-In / Move-Out: 1 kitchen only → $199
- Move-In / Move-Out: 3 beds + 2 full baths + kitchen + living room → $235

The core pricing modules were TypeScript-checked and the calculation matrix above was executed against the implementation.
