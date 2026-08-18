-- Services catalog (public read)
CREATE TABLE public.services_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  audience text NOT NULL CHECK (audience IN ('home', 'rental', 'move')),
  description text NOT NULL,
  base_price_cents integer NOT NULL,
  duration_minutes integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services_catalog TO anon;
GRANT SELECT ON public.services_catalog TO authenticated;
GRANT ALL ON public.services_catalog TO service_role;
ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services catalog is public readable"
  ON public.services_catalog FOR SELECT
  USING (active = true);

-- Chat sessions (guest allowed via session_token, converted to user_id on login)
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  audience text CHECK (audience IN ('home', 'rental', 'move')),
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  quote jsonb,
  lang text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own chat sessions"
  ON public.chat_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own chat sessions"
  ON public.chat_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_session_id uuid REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  service_slug text NOT NULL,
  audience text NOT NULL CHECK (audience IN ('home', 'rental', 'move')),
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL DEFAULT 'Tampa',
  state text NOT NULL DEFAULT 'FL',
  zip text NOT NULL,
  bedrooms integer,
  bathrooms integer,
  square_feet integer,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  price_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins view all bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.tidly_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_services_catalog_updated_at BEFORE UPDATE ON public.services_catalog
  FOR EACH ROW EXECUTE FUNCTION public.tidly_touch_updated_at();
CREATE TRIGGER trg_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.tidly_touch_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.tidly_touch_updated_at();

-- Seed catalog
INSERT INTO public.services_catalog (slug, name, audience, description, base_price_cents, duration_minutes, sort_order) VALUES
  ('home-standard', 'Standard clean', 'home', 'Regular maintenance clean, weekly or bi-weekly.', 14900, 150, 10),
  ('home-deep', 'Deep clean', 'home', 'Full-detail refresh: baseboards, inside appliances, grout.', 29900, 300, 20),
  ('home-monthly', 'Monthly refresh', 'home', 'Deeper cadence between visits, once a month.', 21900, 210, 30),
  ('rental-turnover', 'STR turnover', 'rental', 'Airbnb/VRBO turnover with photo checklist between guests.', 12900, 120, 10),
  ('rental-deep', 'STR deep reset', 'rental', 'Seasonal deep reset for short-term rentals.', 32900, 330, 20),
  ('move-out', 'Move out clean', 'move', 'End-of-lease clean, deposit-ready.', 34900, 360, 10),
  ('move-in', 'Move in clean', 'move', 'Fresh-start clean before you unpack.', 29900, 300, 20),
  ('move-post-construction', 'Post-construction', 'move', 'Post-reno dust and debris removal.', 44900, 420, 30);