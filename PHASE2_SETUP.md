# Camz Cleaning Phase 2 — Standard Cleaning Calculator

## Implemented
- Customer-facing Standard Cleaning package selection:
  - Essential Standard Clean — $99
  - Complete Standard Clean — $149 (Most Popular)
- Exact documented Standard Cleaning base-tier logic, including the internal 2 bed / 1 bath $129 tier.
- Dynamic property-size inputs for bedrooms, full bathrooms, half bathrooms, kitchens, living/family rooms, finished basement and stair flights.
- Additional-area charges are applied only above the selected/applied package allowance, preventing double charging.
- Live estimate updates immediately as property details change.
- Standard Cleaning is fixed package pricing; the hourly-pricing choice is disabled for this flow.
- 5+ bedroom properties and unusual layouts are routed to admin review/custom quote.
- Booking API recalculates Standard Cleaning pricing server-side from the central pricing configuration so client-side values cannot be trusted or manipulated.
- Saved booking service data includes the applied package, pricing version, pricing breakdown, calculated subtotal/tax/total and custom-quote state.
- Booking service card reads the Standard starting price from the central pricing API.

## Pricing test cases verified
- 1 bed + 1 bath = $99
- 2 beds + 1 bath = $129
- 2 beds + 2 baths = $149
- 3 beds + 2 baths = $169
- 3 beds + 3 baths = $199
- 4 beds + 3 baths = $219
- 4 beds + 4 baths = $249
- 5+ bedrooms = custom quote/admin review

## Database requirement
Phase 2 uses the pricing table created in Phase 1. Make sure the Phase 1 migration has already been applied:

`supabase/migrations/20260919000100_create_cleaning_pricing_config.sql`

No new database migration is required for Phase 2.
