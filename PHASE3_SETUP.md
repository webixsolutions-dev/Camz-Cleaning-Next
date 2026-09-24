# Phase 3 — Deep, Move-In / Move-Out & Carpet Pricing

Phase 3 extends the Phase 1 central pricing configuration and Phase 2 Standard Cleaning calculator.

## Implemented

- Deep Cleaning dedicated pricing engine
  - 1 bed / 1 bath base tier
  - 2 bed / 1 bath base tier
  - 2 bed / 2 bath base tier
  - additional bedroom, full/half bathroom, kitchen, living room, finished basement and stair charges
  - no universal Standard + fixed-upgrade formula
- Move-In / Move-Out pricing engine
  - documented 1-bed through 4-bed base grid
  - additional-area charges beyond the selected tier
  - 5+ bedroom custom quote handling
  - unusual-layout review handling
- Carpet Steam Cleaning pricing engine
  - standalone $100 minimum
  - first standard room and additional-room pricing
  - living/larger room, hallway, carpeted stairs, small rug and heavy-stain pricing
  - pet urine / odour custom quote rule
  - standalone and add-on modes
- Booking UI
  - live Deep Cleaning calculation
  - live Move-In / Move-Out calculation
  - standalone carpet configurator
  - carpet add-on configurator for Standard, Deep and Move-In / Move-Out bookings
  - live subtotal/tax/total through the existing booking steps
  - central admin-edited pricing is used instead of legacy service-config rates
- Booking API
  - recalculates all supported cleaning prices server-side
  - stores pricing scope, applied package/tier, pricing version and pricing breakdown
  - prevents client-side price manipulation
  - stores custom-quote state/reason when required
- Booking cards
  - Deep and Move-In / Move-Out starting prices now come from the central pricing configuration
  - Carpet displays the configured standalone minimum
- Legacy compatibility
  - service-scope resolver supports existing DB rows where Deep Cleaning is still `residential` or Carpet Cleaning is stored under `specialty` / `carpet_sofa`

## Database

No new Phase 3 migration is required. Phase 3 uses the `cleaning_pricing_config` table created in Phase 1.

## Verified pricing cases

- Deep: 1/1 = $159
- Deep: 2/2 = $229
- Deep: 3/2 = $259
- Deep: 2/3 = $269
- Deep: 3/3 = $299
- Deep: 4/3 = $329
- Deep: 4/4 = $369
- Deep: 3/3 + second kitchen = $369
- Deep: 3/3 + extra living room = $329
- Move-In / Out: 2/2 = $249
- Move-In / Out: 3/3 = $329
- Move-In / Out: 4/3 = $369
- Move-In / Out: 4/4 = $399
- Standalone carpet, 1 standard room = $100 minimum
- Carpet add-on, 1 standard room = $45
- Carpet add-on, 2 standard rooms = $80

All values above are before applicable tax.
