
-- ============ 1. cleaner_applications ============
CREATE TABLE public.cleaner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text,
  zips text[] DEFAULT '{}'::text[],
  years_experience integer,
  languages text[] DEFAULT '{}'::text[],
  audiences text[] DEFAULT '{}'::text[],
  bio text,
  has_transport boolean DEFAULT false,
  has_supplies boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  approved_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cleaner_applications TO authenticated;
GRANT INSERT ON public.cleaner_applications TO anon;
GRANT ALL ON public.cleaner_applications TO service_role;
ALTER TABLE public.cleaner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application"
  ON public.cleaner_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(full_name) BETWEEN 2 AND 120
    AND status = 'pending'
  );

CREATE POLICY "Admins manage applications"
  ON public.cleaner_applications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER cleaner_applications_touch
  BEFORE UPDATE ON public.cleaner_applications
  FOR EACH ROW EXECUTE FUNCTION public.tidly_touch_updated_at();

CREATE INDEX cleaner_applications_status_idx ON public.cleaner_applications(status, created_at DESC);


-- ============ 2. booking_messages ============
CREATE TABLE public.booking_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('customer','cleaner','admin')),
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_messages TO authenticated;
GRANT ALL ON public.booking_messages TO service_role;
ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;

-- Helper: is caller a participant in this booking?
CREATE OR REPLACE FUNCTION public.can_access_booking(_booking_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = _booking_id
      AND (
        b.user_id = auth.uid()
        OR b.cleaner_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
      )
  )
$$;

CREATE POLICY "Participants read booking messages"
  ON public.booking_messages FOR SELECT
  TO authenticated
  USING (public.can_access_booking(booking_id));

CREATE POLICY "Participants send booking messages"
  ON public.booking_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.can_access_booking(booking_id)
  );

CREATE POLICY "Sender can update own message read state"
  ON public.booking_messages FOR UPDATE
  TO authenticated
  USING (public.can_access_booking(booking_id))
  WITH CHECK (public.can_access_booking(booking_id));

CREATE INDEX booking_messages_booking_idx ON public.booking_messages(booking_id, created_at);


-- ============ 3. cleaner_availability ============
CREATE TABLE public.cleaner_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);
GRANT SELECT ON public.cleaner_availability TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cleaner_availability TO authenticated;
GRANT ALL ON public.cleaner_availability TO service_role;
ALTER TABLE public.cleaner_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads availability of published cleaners"
  ON public.cleaner_availability FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cleaner_profiles cp
      WHERE cp.user_id = cleaner_availability.cleaner_id
        AND cp.published = true
    )
    OR cleaner_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Cleaner manages own availability"
  ON public.cleaner_availability FOR ALL
  TO authenticated
  USING (cleaner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (cleaner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX cleaner_availability_cleaner_idx ON public.cleaner_availability(cleaner_id, weekday);


-- ============ 4. cleaner_time_off ============
CREATE TABLE public.cleaner_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cleaner_time_off TO authenticated;
GRANT ALL ON public.cleaner_time_off TO service_role;
ALTER TABLE public.cleaner_time_off ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cleaner manages own time off"
  ON public.cleaner_time_off FOR ALL
  TO authenticated
  USING (cleaner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (cleaner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX cleaner_time_off_cleaner_idx ON public.cleaner_time_off(cleaner_id, starts_at);


-- ============ 5. Bookings: cancellation / reschedule columns ============
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS rescheduled_from_at timestamptz;


-- ============ 6. RPC: approve a cleaner application ============
CREATE OR REPLACE FUNCTION public.approve_cleaner_application(_app_id uuid, _user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  app public.cleaner_applications%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve applications';
  END IF;

  SELECT * INTO app FROM public.cleaner_applications WHERE id = _app_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;
  IF app.status <> 'pending' THEN RAISE EXCEPTION 'Application is not pending'; END IF;

  -- Grant cleaner role (idempotent)
  INSERT INTO public.user_roles(user_id, role)
  VALUES (_user_id, 'cleaner'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create draft cleaner profile if none exists
  INSERT INTO public.cleaner_profiles (
    user_id, slug, display_name, bio, years_experience, languages, zips, audiences, published, active
  )
  VALUES (
    _user_id,
    lower(regexp_replace(app.full_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(_user_id::text, 1, 6),
    app.full_name,
    app.bio,
    app.years_experience,
    app.languages,
    app.zips,
    app.audiences,
    false,
    true
  )
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.cleaner_applications
  SET status = 'approved',
      approved_user_id = _user_id,
      reviewed_at = now(),
      reviewed_by = auth.uid()
  WHERE id = _app_id;
END;
$$;

-- ============ 7. RPC: cancel a booking (customer or assigned cleaner) ============
CREATE OR REPLACE FUNCTION public.cancel_booking(_booking_id uuid, _reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  b public.bookings%ROWTYPE;
BEGIN
  SELECT * INTO b FROM public.bookings WHERE id = _booking_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;

  IF NOT (
    b.user_id = auth.uid()
    OR b.cleaner_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  ) THEN
    RAISE EXCEPTION 'Not allowed to cancel this booking';
  END IF;

  IF b.status IN ('cancelled','completed') THEN
    RAISE EXCEPTION 'Booking already %', b.status;
  END IF;

  UPDATE public.bookings
  SET status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = auth.uid(),
      cancel_reason = _reason,
      -- if a cleaner cancels, release the job back to the open pool
      cleaner_id = CASE WHEN b.cleaner_id = auth.uid() AND NOT public.has_role(auth.uid(), 'admin')
                        THEN NULL ELSE cleaner_id END
  WHERE id = _booking_id;
END;
$$;
