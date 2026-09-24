# Phase 4 — Add-ons, Property Form & Smart Review Rules

Phase 4 extends the Phase 1–3 central pricing system and booking calculator.

## Implemented

### Service-specific add-ons
- Add-ons are loaded from the central `cleaning_pricing_config`.
- The booking form shows only add-ons that are relevant to the selected service.
- Fixed, "From", per-unit and custom-quote add-ons are supported.
- Per-unit add-ons support quantity selection.
- Add-on prices update the live subtotal/tax calculation.
- Add-on pricing is recalculated server-side during booking submission.

### Duplicate-charge prevention
- Add-ons marked as included for the selected service are hidden and ignored by the backend.
- Service `includedItems` are also respected by the add-on calculator.
- Examples:
  - Deep + Inside Microwave: hidden / no charge.
  - Move-In / Move-Out + Inside Oven: hidden / no charge.
  - Move-In / Move-Out + Inside Fridge: hidden / no charge.
  - Move-In / Move-Out + Inside Empty Cabinets: hidden / no charge.

### Property information
The cleaning booking flow now collects:
- Customer name
- Email
- Phone number
- Service address
- Postal code (from verified address)
- Property type
- Bedrooms
- Full bathrooms
- Half bathrooms
- Kitchens
- Living / family rooms
- Finished basement living area
- Stair flights
- Preferred service date
- Preferred time
- Additional instructions

Property types:
- House
- Apartment
- Condo
- Townhouse
- Basement suite
- Rental property
- Other

### Dynamic service questions
- Standard: package + room customization.
- Deep: property condition + property size + service-specific add-ons.
- Move-In / Move-Out: confirms whether the property will be empty.
- Carpet: carpeted rooms, larger rooms, hallways, carpeted stairs, rugs, stain areas and pet urine/odour treatment.

### Property condition / admin review
Property condition choices:
- Regularly maintained
- Moderate buildup
- Heavy condition

Heavy-condition behaviour follows admin pricing settings:
- Review notice is displayed.
- Condition photos can be required.
- Admin review is flagged on the booking.
- Instant confirmed pricing is disabled when admin approval is required.
- The calculated subtotal/tax/estimated total is still stored for review.

Condition-dependent add-ons marked `adminReview` also trigger review and photo collection.

### Condition photo upload
- New private Supabase bucket: `booking-condition-photos`.
- Up to 6 JPG / PNG / WEBP photos.
- Maximum 8 MB per image.
- Upload is performed through a server-side endpoint using the service role key.
- Customer-supplied paths are validated before being stored.
- Admins can open photos through a short-lived signed URL endpoint.

### Admin visibility
The existing Admin Bookings detail screen now shows:
- Admin review warning and reasons
- Property type
- Property condition
- Postal code
- Applied pricing package
- Empty-property confirmation for Move-In / Move-Out
- Calculated total
- Additional instructions
- Condition-photo links

### Server-side validation
The booking API now validates:
- Customer name, email and phone
- Property type
- Property condition
- Empty-home confirmation for Move-In / Move-Out
- Required review photos
- Add-on availability and quantities
- Included-service rules
- Admin-review/custom-quote state

The server recalculates all add-on prices and does not trust client-provided totals.

## Database migration

Run this migration after the Phase 1 pricing migration:

`supabase/migrations/20260919000200_create_booking_condition_photos_bucket.sql`

No new booking table is required. Phase 4 stores the new property/review/add-on data in the existing `jobs.service_data` JSON field.

## Verified Phase 4 rules

- Standard + inside fridge + inside oven = +$70 before tax.
- Standard + 3 wet-wipe blinds = +$30 before tax.
- Deep + inside microwave = hidden / $0 duplicate charge.
- Move-In / Move-Out + inside oven = hidden / $0 duplicate charge.
- Move-In / Move-Out + inside fridge = hidden / $0 duplicate charge.
- Move-In / Move-Out + inside empty cabinets = hidden / $0 duplicate charge.
- Heavy-duty condition add-on triggers admin review/custom quote.
- Heavy property condition requires admin review according to central settings.
- Non-empty Move-In / Move-Out property is sent for review instead of instant final pricing.
