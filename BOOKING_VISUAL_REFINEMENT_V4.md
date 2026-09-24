# Booking Visual Refinement v4

Changes made to `src/components/booking/BookingClient.tsx`:

- Added a visual hero composition using the existing `/Banner-Image.webp` asset.
- Added animated entrance and subtle floating motion to the hero image and pricing badges.
- Rebuilt **How your price is built** as four compact image cards with scroll-in and hover animations.
- Reused existing Camz Cleaning image assets from `/wp-admin/uploads/...` so no new public asset migration is required.
- Added image thumbnails to all four service cards.
- Reduced the service-card grid width for a cleaner, more focused booking page.
- Kept the packages/add-ons pricing notice, live pricing flow, GST display, and all Phase 1–5 booking logic unchanged.
- Responsive behavior is retained for mobile, tablet, and desktop.

No new Supabase migration is required.
