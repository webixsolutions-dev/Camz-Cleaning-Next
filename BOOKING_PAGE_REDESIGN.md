# Booking Page Redesign

The public `/booking` page has been redesigned around the pricing/booking specification.

## Customer-facing flow

1. The hero now uses the transparent `Professional Home Cleaning From $99` message and explains the exact $99 scope.
2. The main screen shows the four documented services only:
   - Standard Cleaning
   - Deep Cleaning
   - Move-In / Move-Out Cleaning
   - Carpet Steam Cleaning
3. Starting prices are read from `/api/pricing` and fall back to the documented master prices if the API is temporarily unavailable.
4. Each card explains its included scope and opens the existing dynamic booking calculator.
5. The existing Phase 2–5 modal continues to handle package selection, property information, add-ons, carpet options, live subtotal/tax, review and submission.
6. Login is optional because customers may continue as guests.
7. The page includes pricing transparency messaging, duplicate-charge protection and custom-quote/review messaging.

No new Supabase migration is required for this redesign.
