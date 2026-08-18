
CREATE TYPE public.conversation_status AS ENUM ('new', 'in_progress', 'quoted', 'scheduled', 'won', 'lost');

ALTER TABLE public.conversations
  ADD COLUMN status public.conversation_status NOT NULL DEFAULT 'new',
  ADD COLUMN admin_notes text;

CREATE POLICY "Admins can update conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
