
-- 1) Novo papel "cleaner"
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cleaner';

-- Helper que evita referenciar o literal do enum em CREATE POLICY (compatível
-- com a mesma transação em que o valor foi adicionado ao enum).
CREATE OR REPLACE FUNCTION public.has_cleaner_role(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _uid
      AND role::text = 'cleaner'
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_cleaner_role(uuid) TO authenticated;


-- 2) Perfis de cleaner
CREATE TABLE public.cleaner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  photo_url TEXT,
  years_experience INT,
  languages TEXT[] NOT NULL DEFAULT '{}',
  zips TEXT[] NOT NULL DEFAULT '{}',
  audiences TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
  review_count INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cleaner_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cleaner_profiles TO authenticated;
GRANT ALL ON public.cleaner_profiles TO service_role;

ALTER TABLE public.cleaner_profiles ENABLE ROW LEVEL SECURITY;

-- Público lê apenas perfis publicados + ativos
CREATE POLICY "Published cleaners are public"
  ON public.cleaner_profiles FOR SELECT
  TO anon, authenticated
  USING (published = true AND active = true);

-- Cleaner lê o próprio perfil (mesmo não publicado)
CREATE POLICY "Cleaner reads own profile"
  ON public.cleaner_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Cleaner atualiza o próprio perfil mas não pode mudar o flag "published"
-- nem o próprio user_id
CREATE POLICY "Cleaner updates own profile"
  ON public.cleaner_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin manda em tudo
CREATE POLICY "Admins manage cleaner profiles"
  ON public.cleaner_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger para prevenir auto-publish: se o usuário não é admin, força
-- published a manter o valor anterior.
CREATE OR REPLACE FUNCTION public.cleaner_profiles_guard_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.published := OLD.published;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleaner_profiles_guard_publish_trg
  BEFORE UPDATE ON public.cleaner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.cleaner_profiles_guard_publish();

CREATE TRIGGER cleaner_profiles_touch_updated_at
  BEFORE UPDATE ON public.cleaner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tidly_touch_updated_at();


-- 3) Bookings: quem pegou + quando
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cleaner_id UUID REFERENCES auth.users(id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS bookings_cleaner_status_idx
  ON public.bookings(cleaner_id, status);
CREATE INDEX IF NOT EXISTS bookings_open_idx
  ON public.bookings(status) WHERE cleaner_id IS NULL;

-- Cleaner lê os jobs que já pegou (dados completos do cliente, para atender)
CREATE POLICY "Cleaner reads own claimed jobs"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    cleaner_id = auth.uid()
    AND public.has_cleaner_role(auth.uid())
  );

-- Cleaner atualiza status dos próprios jobs
CREATE POLICY "Cleaner updates own claimed jobs"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (
    cleaner_id = auth.uid()
    AND public.has_cleaner_role(auth.uid())
  )
  WITH CHECK (
    cleaner_id = auth.uid()
    AND public.has_cleaner_role(auth.uid())
  );


-- 4) Marketplace: função de listar jobs abertos (colunas seguras)
CREATE OR REPLACE FUNCTION public.list_open_jobs()
RETURNS TABLE (
  id UUID,
  service_slug TEXT,
  audience TEXT,
  scheduled_at TIMESTAMPTZ,
  duration_minutes INT,
  price_cents INT,
  bedrooms INT,
  bathrooms INT,
  square_feet INT,
  city TEXT,
  zip TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id, b.service_slug, b.audience, b.scheduled_at,
    b.duration_minutes, b.price_cents, b.bedrooms, b.bathrooms,
    b.square_feet, b.city, b.zip, b.created_at
  FROM public.bookings b
  WHERE b.cleaner_id IS NULL
    AND b.status = 'pending'
    AND public.has_cleaner_role(auth.uid())
  ORDER BY b.scheduled_at ASC
$$;

GRANT EXECUTE ON FUNCTION public.list_open_jobs() TO authenticated;


-- 5) Marketplace: reivindicar um job de forma atômica
CREATE OR REPLACE FUNCTION public.claim_job(_booking_id uuid)
RETURNS TABLE (
  id UUID,
  status TEXT,
  cleaner_id UUID,
  claimed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.bookings%ROWTYPE;
BEGIN
  IF NOT public.has_cleaner_role(auth.uid()) THEN
    RAISE EXCEPTION 'Not a cleaner';
  END IF;

  UPDATE public.bookings b
  SET cleaner_id = auth.uid(),
      claimed_at = now(),
      status = 'assigned'
  WHERE b.id = _booking_id
    AND b.cleaner_id IS NULL
    AND b.status = 'pending'
  RETURNING * INTO updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job is no longer available';
  END IF;

  RETURN QUERY SELECT updated.id, updated.status, updated.cleaner_id, updated.claimed_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_job(uuid) TO authenticated;
