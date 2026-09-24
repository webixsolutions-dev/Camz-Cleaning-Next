-- Phase 5 booking/quote workflow statuses.
-- Existing installations used a narrower public.job_status enum.  The richer
-- booking workflow introduced by the pricing/quote flow needs these values so
-- customer submissions and admin actions can be persisted without enum errors.

alter type public.job_status add value if not exists 'new_request';
alter type public.job_status add value if not exists 'under_review';
alter type public.job_status add value if not exists 'awaiting_photos';
alter type public.job_status add value if not exists 'quote_sent';
alter type public.job_status add value if not exists 'approved';
alter type public.job_status add value if not exists 'booking_confirmed';
alter type public.job_status add value if not exists 'custom_quote_required';
alter type public.job_status add value if not exists 'canceled';
