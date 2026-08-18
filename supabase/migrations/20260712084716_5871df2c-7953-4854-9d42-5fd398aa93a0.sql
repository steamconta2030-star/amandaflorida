CREATE TABLE public.booking_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ratee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('customer_to_cleaner', 'cleaner_to_customer')),
  stars smallint NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, rater_id, direction)
);

GRANT SELECT, INSERT ON public.booking_ratings TO authenticated;
GRANT ALL ON public.booking_ratings TO service_role;

ALTER TABLE public.booking_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read ratings on their booking"
  ON public.booking_ratings FOR SELECT TO authenticated
  USING (public.can_access_booking(booking_id));

CREATE POLICY "Rater can insert own rating"
  ON public.booking_ratings FOR INSERT TO authenticated
  WITH CHECK (
    rater_id = auth.uid()
    AND public.can_access_booking(booking_id)
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND b.status = 'completed'
        AND (
          (direction = 'customer_to_cleaner' AND b.user_id = auth.uid() AND b.cleaner_id = ratee_id)
          OR
          (direction = 'cleaner_to_customer' AND b.cleaner_id = auth.uid() AND b.user_id = ratee_id)
        )
    )
  );

CREATE INDEX booking_ratings_ratee_idx ON public.booking_ratings(ratee_id, direction);
CREATE INDEX booking_ratings_booking_idx ON public.booking_ratings(booking_id);

CREATE OR REPLACE FUNCTION public.cleaner_rating_summary(_cleaner_id uuid)
RETURNS TABLE(avg_stars numeric, review_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT ROUND(AVG(stars)::numeric, 2), COUNT(*)::bigint
  FROM public.booking_ratings
  WHERE ratee_id = _cleaner_id
    AND direction = 'customer_to_cleaner'
$$;

GRANT EXECUTE ON FUNCTION public.cleaner_rating_summary(uuid) TO anon, authenticated;