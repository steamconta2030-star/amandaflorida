
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
  CHECK (status = ANY (ARRAY['pending','assigned','confirmed','in_progress','completed','cancelled']));
