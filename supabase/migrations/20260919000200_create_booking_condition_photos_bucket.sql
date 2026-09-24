-- Phase 4: private condition-photo storage used by the booking review flow.
-- Files are uploaded only through the server-side booking photo endpoint.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'booking-condition-photos',
  'booking-condition-photos',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
