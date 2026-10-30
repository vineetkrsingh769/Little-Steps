-- Submission features: seats-left lookup, complaints (disputes), and daycare photo uploads.
-- Made safe to run multiple times without errors.

-- ---------- Seats left ----------
CREATE OR REPLACE FUNCTION public.booking_end_date(_plan text, _start date, _quantity int)
RETURNS date LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _plan
    WHEN 'hourly' THEN _start
    WHEN 'daily' THEN _start + (GREATEST(_quantity, 1) - 1)
    ELSE (_start + make_interval(months => GREATEST(_quantity, 1)) - interval '1 day')::date END
$$;

CREATE OR REPLACE FUNCTION public.seats_left(_center_id uuid, _plan text, _start date, _quantity int)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(c.capacity - COALESCE((
    SELECT max(used) FROM (
      SELECT (SELECT count(*) FROM public.bookings b
              WHERE b.center_id = c.id AND b.status = 'accepted'
                AND d::date BETWEEN b.start_date AND b.end_date) AS used
      FROM generate_series(_start, public.booking_end_date(_plan, _start, LEAST(_quantity, 24)), interval '1 day') AS d
    ) per_day
  ), 0), 0)::int
  FROM public.centers c
  WHERE c.id = _center_id AND c.status = 'approved'
$$;
GRANT EXECUTE ON FUNCTION public.seats_left(uuid, text, date, int) TO anon, authenticated;

-- ---------- Complaints ----------
CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('safety', 'service', 'billing', 'cancellation', 'other')),
  details text NOT NULL CHECK (length(details) BETWEEN 10 AND 2000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  admin_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS disputes_booking_idx ON public.disputes (booking_id);
GRANT SELECT, INSERT, UPDATE ON public.disputes TO authenticated;
GRANT ALL ON public.disputes TO service_role;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "disputes read own or admin" ON public.disputes;
CREATE POLICY "disputes read own or admin" ON public.disputes FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "disputes report on own booking" ON public.disputes;
CREATE POLICY "disputes report on own booking" ON public.disputes FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid() AND public.is_booking_party(booking_id, auth.uid()));

DROP POLICY IF EXISTS "disputes admin resolves" ON public.disputes;
CREATE POLICY "disputes admin resolves" ON public.disputes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.guard_dispute()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'open'; NEW.admin_note := ''; NEW.resolved_at := NULL;
    RETURN NEW;
  END IF;
  NEW.booking_id := OLD.booking_id; NEW.reporter_id := OLD.reporter_id;
  NEW.reason := OLD.reason; NEW.details := OLD.details; NEW.created_at := OLD.created_at;
  NEW.resolved_at := CASE WHEN NEW.status = 'resolved' THEN COALESCE(OLD.resolved_at, now()) END;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS disputes_guard ON public.disputes;
CREATE TRIGGER disputes_guard BEFORE INSERT OR UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.guard_dispute();

-- ---------- Daycare photos ----------
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS photo_path text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'centers_photo_path_check'
  ) THEN
    ALTER TABLE public.centers ADD CONSTRAINT centers_photo_path_check
      CHECK (photo_path IS NULL OR photo_path LIKE id::text || '/%');
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('center-photos', 'center-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "center photos: owner uploads" ON storage.objects;
CREATE POLICY "center photos: owner uploads" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'center-photos' AND EXISTS (
    SELECT 1 FROM public.centers c WHERE c.id::text = (storage.foldername(objects.name))[1] AND c.owner_id = auth.uid()));

DROP POLICY IF EXISTS "center photos: owner deletes" ON storage.objects;
CREATE POLICY "center photos: owner deletes" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'center-photos' AND EXISTS (
    SELECT 1 FROM public.centers c WHERE c.id::text = (storage.foldername(objects.name))[1] AND c.owner_id = auth.uid()));
