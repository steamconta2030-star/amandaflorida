-- Secure the booking workflow so customers and cleaners cannot directly alter
-- prices, ownership, assignments, or arbitrary status fields.

DROP POLICY IF EXISTS "Users insert own bookings" ON public.bookings;
CREATE POLICY "Users create valid pending bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND cleaner_id IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.services_catalog service
      WHERE service.slug = bookings.service_slug
        AND service.active = true
        AND bookings.price_cents >= service.base_price_cents
        AND bookings.duration_minutes >= service.duration_minutes
    )
  );

DROP POLICY IF EXISTS "Users update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Cleaner updates own claimed jobs" ON public.bookings;

CREATE OR REPLACE FUNCTION public.cancel_booking(_booking_id uuid, _reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking public.bookings%ROWTYPE;
  cleaner_is_releasing boolean;
BEGIN
  SELECT * INTO booking
  FROM public.bookings
  WHERE bookings.id = _booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF NOT (
    booking.user_id = auth.uid()
    OR booking.cleaner_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  ) THEN
    RAISE EXCEPTION 'Not allowed to cancel this booking';
  END IF;

  IF booking.status IN ('cancelled', 'completed') THEN
    RAISE EXCEPTION 'Booking already %', booking.status;
  END IF;

  IF booking.status = 'in_progress' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'An in-progress booking can only be cancelled by an administrator';
  END IF;

  cleaner_is_releasing := booking.cleaner_id = auth.uid()
    AND NOT public.has_role(auth.uid(), 'admin');

  UPDATE public.bookings
  SET status = CASE WHEN cleaner_is_releasing THEN 'pending' ELSE 'cancelled' END,
      cancelled_at = now(),
      cancelled_by = auth.uid(),
      cancel_reason = _reason,
      cleaner_id = CASE WHEN cleaner_is_releasing THEN NULL ELSE cleaner_id END,
      claimed_at = CASE WHEN cleaner_is_releasing THEN NULL ELSE claimed_at END
  WHERE id = _booking_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_job(_booking_id uuid)
RETURNS TABLE (
  id uuid,
  status text,
  cleaner_id uuid,
  claimed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested public.bookings%ROWTYPE;
  updated public.bookings%ROWTYPE;
  local_start timestamp;
  local_end timestamp;
BEGIN
  IF NOT public.has_cleaner_role(auth.uid()) THEN
    RAISE EXCEPTION 'Not a cleaner';
  END IF;

  SELECT * INTO requested
  FROM public.bookings
  WHERE bookings.id = _booking_id
  FOR UPDATE;

  IF NOT FOUND OR requested.cleaner_id IS NOT NULL OR requested.status <> 'pending' THEN
    RAISE EXCEPTION 'Job is no longer available';
  END IF;

  local_start := requested.scheduled_at AT TIME ZONE 'America/New_York';
  local_end := (requested.scheduled_at + requested.duration_minutes * interval '1 minute')
    AT TIME ZONE 'America/New_York';

  IF local_start::date <> local_end::date OR NOT EXISTS (
    SELECT 1
    FROM public.cleaner_availability availability
    WHERE availability.cleaner_id = auth.uid()
      AND availability.weekday = EXTRACT(DOW FROM local_start)::smallint
      AND availability.start_time <= local_start::time
      AND availability.end_time >= local_end::time
  ) THEN
    RAISE EXCEPTION 'Job is outside your configured availability';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.cleaner_time_off time_off
    WHERE time_off.cleaner_id = auth.uid()
      AND tstzrange(time_off.starts_at, time_off.ends_at, '[)') &&
          tstzrange(
            requested.scheduled_at,
            requested.scheduled_at + requested.duration_minutes * interval '1 minute',
            '[)'
          )
  ) THEN
    RAISE EXCEPTION 'Job conflicts with your time off';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.bookings existing
    WHERE existing.cleaner_id = auth.uid()
      AND existing.status IN ('assigned', 'confirmed', 'in_progress')
      AND tstzrange(
            existing.scheduled_at,
            existing.scheduled_at + existing.duration_minutes * interval '1 minute',
            '[)'
          ) &&
          tstzrange(
            requested.scheduled_at,
            requested.scheduled_at + requested.duration_minutes * interval '1 minute',
            '[)'
          )
  ) THEN
    RAISE EXCEPTION 'Job conflicts with another assigned booking';
  END IF;

  UPDATE public.bookings booking
  SET cleaner_id = auth.uid(),
      claimed_at = now(),
      status = 'assigned'
  WHERE booking.id = _booking_id
    AND booking.cleaner_id IS NULL
    AND booking.status = 'pending'
  RETURNING booking.* INTO updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job is no longer available';
  END IF;

  RETURN QUERY SELECT updated.id, updated.status, updated.cleaner_id, updated.claimed_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_cleaner_booking_status(
  _booking_id uuid,
  _status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking public.bookings%ROWTYPE;
BEGIN
  SELECT * INTO booking
  FROM public.bookings
  WHERE bookings.id = _booking_id
  FOR UPDATE;

  IF NOT FOUND OR booking.cleaner_id <> auth.uid() OR NOT public.has_cleaner_role(auth.uid()) THEN
    RAISE EXCEPTION 'Booking not found or not assigned to this cleaner';
  END IF;

  IF NOT (
    (_status = 'in_progress' AND booking.status IN ('assigned', 'confirmed'))
    OR (_status = 'completed' AND booking.status = 'in_progress')
  ) THEN
    RAISE EXCEPTION 'Invalid booking status transition from % to %', booking.status, _status;
  END IF;

  UPDATE public.bookings
  SET status = _status
  WHERE id = _booking_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_cleaner_booking_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_cleaner_booking_status(uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.claim_job(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_job(uuid) TO authenticated;

CREATE INDEX IF NOT EXISTS bookings_cleaner_schedule_idx
  ON public.bookings(cleaner_id, scheduled_at)
  WHERE status IN ('assigned', 'confirmed', 'in_progress');
