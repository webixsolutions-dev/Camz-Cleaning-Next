# Phase 5 — Live Pricing, Booking Summary & Admin Quote Management

Phase 5 completes the customer review flow and adds a full admin quote/review workflow on top of the Phase 1–4 pricing system.

## Customer booking flow

### Live price calculation
- Existing central pricing engine remains the single source of truth.
- The customer sees the complete line-item breakdown, subtotal, configured tax and final total before submission.
- Review/custom-quote cases still show the calculated estimate, but clearly state that the final price requires admin approval.

### Booking summary screen
The final review step now shows separate editable sections for:
- Selected service and package
- Customer/property details
- Property size and condition
- Schedule and verified service address
- Room/area selections
- Selected add-ons
- Carpet services
- Additional instructions and attached condition photos
- Full line-item pricing breakdown
- Subtotal
- Tax
- Final total or calculated estimate
- Review/custom quote notice
- Confirmation/cancellation/service notes

Each relevant section has an **Edit** action that returns the customer to the correct booking step before submission.

### Initial workflow status
New bookings now enter the workflow as:
- `new_request` — normal submitted booking
- `under_review` — admin review required
- `custom_quote_required` — final price requires a custom quote

The booking API still recalculates the price server-side before saving.

## Admin quote management

The Admin → Bookings detail screen now includes a dedicated **Quote Management** panel.

Admin can:
- View automatic subtotal, tax and calculated total
- View the original pricing breakdown
- Edit quote line items
- Add a service/item
- Remove a service/item
- Edit quantities and unit prices
- Add a customer-facing quote note
- Add internal admin notes
- Save a quote
- Send a custom quote
- Request additional photos
- Approve the request/quote
- Reject the request
- Confirm the booking
- Mark the booking completed

### Quote recalculation
Admin quote totals are recalculated server-side:

`Quote line items = Subtotal`

`Subtotal + configured booking tax = Quote Total`

The API does not trust a total supplied by the browser.

### Manual price override audit
When the admin quote differs from the original automatic calculated total:
- `manualPriceOverride` is recorded
- Original calculated total is retained
- New quote subtotal/tax/total are stored
- Admin user and timestamp are stored
- An audit trail entry is created
- The admin UI displays a **Manual price override** badge

The original `calculatedSubtotal`, `calculatedTax` and `calculatedTotal` remain in `jobs.service_data` for comparison.

### Workflow statuses
Admin/customer interfaces support:
- New Request
- Under Review
- Awaiting Photos
- Quote Sent
- Approved
- Booking Confirmed
- Completed
- Cancelled
- Custom Quote Required

Existing legacy booking statuses remain supported for backward compatibility.

## Customer quote visibility

When an admin sends/saves a quote:
- Quote line items, subtotal, tax, total and note are stored in `jobs.service_data.adminQuote`.
- The updated total is reflected in the booking record.
- Registered customers can see the quote in their booking details.
- Quote status is visible in customer booking lists and progress tracking.

## Customer notification

When **Send Quote** is used:
- The quote is made available in the customer dashboard.
- The system also attempts to email the quote using the existing Camz Cleaning SMTP configuration.
- Email delivery success/failure is recorded in `service_data.customerNotification`.
- A mail failure does not discard the saved quote.

When **Request Photos** is used:
- Booking status becomes `awaiting_photos`.
- The customer dashboard displays the photo request.
- The system attempts to email the request to the customer.

## Additional requested photos

For logged-in customers:
- The booking details page displays an upload control when admin requests more photos.
- Customer can upload up to 6 JPG/PNG/WEBP files, max 8 MB each.
- Files use the existing private `booking-condition-photos` bucket.
- New paths are appended to the booking condition-photo list.
- Booking returns to `under_review` after submission.
- Admin can open both initial and follow-up condition photos using signed URLs.

New endpoint:

`POST /api/booking/review-photos`

## Admin audit trail

`jobs.service_data.adminAuditTrail` records recent admin workflow actions, including:
- Status changes
- Cleaner changes
- Quote updates
- Manual price changes
- Notes
- Photo requests
- Approvals/rejections
- Booking confirmation/completion

No new database columns are required for Phase 5. Phase 5 uses the existing `jobs.service_data` JSON field and existing booking price/status columns.

## Deployment

Phase 1 and Phase 4 migrations must already be applied. Phase 5 does **not** require an additional Supabase migration.

For email delivery, the existing SMTP environment variables must be configured:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

If SMTP is unavailable, quotes remain saved and visible in the customer dashboard; the notification failure is recorded for the admin.
