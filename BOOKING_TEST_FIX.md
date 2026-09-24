# Booking submission + review UI fix

1. Run `supabase/migrations/20260920000100_extend_job_status_for_booking_workflow.sql` in Supabase.
2. Restart/redeploy the app.
3. Re-test `/booking`.

The API also includes a safe `pending` fallback so booking submission does not fail with PostgreSQL error `22P02` if the migration has not been applied yet. The intended workflow state is still retained in `service_data.bookingWorkflowStatus`.

The review modal was widened and made responsive, service-customization values are now displayed as clean cards instead of cramped side-by-side rows, edit controls are easier to tap, and the booking action bar stays visible at the bottom while reviewing long bookings.
