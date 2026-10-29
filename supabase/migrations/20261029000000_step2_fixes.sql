-- Step 2 fixes: seat counting across a booking's whole date range, safe status changes,
-- secret pickup codes, honest ratings, re-review of edited centers, live messages,
-- and automatic completion of finished bookings.

-- ---------- Bookings: last day of care ----------
ALTER TABLE public.bookings ADD COLUMN end_date date;
UPDATE public.bookings SET end_date = CASE plan
  WHEN 'hourly' THEN start_date
  WHEN 'daily' THEN start_date + (quantity - 1)
  ELSE (start_date + make_interval(months => quantity) - interval '1 day')::date END;
ALTER TABLE public.bookings ALTER COLUMN end_date SET NOT NULL;
CREATE INDEX bookings_center_dates_idx ON public.bookings (center_id, start_date, end_date) WHERE status = 'accepted';

CREATE OR REPLACE FUNCTION public.guard_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.centers; is_owner boolean; full_day date;
BEGIN
  SELECT * INTO c FROM public.centers WHERE id = NEW.center_id;
  IF TG_OP = 'INSERT' THEN
    IF c.status <> 'approved' THEN RAISE EXCEPTION 'This center is not accepting bookings yet'; END IF;
    IF NEW.start_date < current_date THEN RAISE EXCEPTION 'Please choose today or a future date'; END IF;
    IF NOT (NEW.age_group = ANY (c.age_groups)) THEN RAISE EXCEPTION 'This center does not take this age group'; END IF;
    IF NEW.plan = 'hourly' AND NEW.quantity < 1 THEN RAISE EXCEPTION 'At least one hour'; END IF;
    IF NEW.plan <> 'hourly' THEN NEW.quantity := LEAST(NEW.quantity, 12); END IF;
    NEW.status := 'pending';
    NEW.total_price := CASE NEW.plan
      WHEN 'hourly' THEN c.hourly_price * NEW.quantity
      WHEN 'daily' THEN c.daily_price * NEW.quantity
      ELSE c.monthly_price * NEW.quantity END;
    NEW.end_date := CASE NEW.plan
      WHEN 'hourly' THEN NEW.start_date
      WHEN 'daily' THEN NEW.start_date + (NEW.quantity - 1)
      ELSE (NEW.start_date + make_interval(months => NEW.quantity) - interval '1 day')::date END;
    RETURN NEW;
  END IF;

  -- UPDATE: only status may change
  NEW.center_id := OLD.center_id; NEW.parent_id := OLD.parent_id; NEW.total_price := OLD.total_price;
  NEW.plan := OLD.plan; NEW.quantity := OLD.quantity; NEW.start_date := OLD.start_date; NEW.end_date := OLD.end_date;
  NEW.start_time := OLD.start_time; NEW.child_name := OLD.child_name; NEW.age_group := OLD.age_group;
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  -- auth.uid() is null for system jobs (e.g. the nightly auto-complete)
  is_owner := auth.uid() IS NULL OR c.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin');
  IF NOT (
    (is_owner AND OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected'))
    OR (is_owner AND OLD.status = 'accepted' AND NEW.status = 'completed')
    OR (OLD.status IN ('pending', 'accepted') AND NEW.status = 'cancelled'
        AND (OLD.parent_id = auth.uid() OR is_owner))
  ) THEN
    RAISE EXCEPTION 'You cannot change this booking from % to %', OLD.status, NEW.status;
  END IF;

  IF NEW.status = 'completed' AND current_date < OLD.end_date THEN
    RAISE EXCEPTION 'This booking can be marked done from %', to_char(OLD.end_date, 'DD Mon YYYY');
  END IF;

  IF NEW.status = 'accepted' THEN
    -- Every day of this booking needs a free seat, counting longer bookings that started earlier.
    SELECT d::date INTO full_day
    FROM generate_series(OLD.start_date, OLD.end_date, interval '1 day') AS d
    WHERE (SELECT count(*) FROM public.bookings b
           WHERE b.center_id = OLD.center_id AND b.status = 'accepted' AND b.id <> OLD.id
             AND d::date BETWEEN b.start_date AND b.end_date) >= c.capacity
    ORDER BY d LIMIT 1;
    IF full_day IS NOT NULL THEN
      RAISE EXCEPTION 'Center is full on % (capacity %)', to_char(full_day, 'DD Mon YYYY'), c.capacity;
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- ---------- Secret pickup codes (only the parent can read them) ----------
CREATE TABLE public.booking_pickup_codes (
  booking_id uuid PRIMARY KEY REFERENCES public.bookings(id) ON DELETE CASCADE,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.booking_pickup_codes TO authenticated;
GRANT ALL ON public.booking_pickup_codes TO service_role;
ALTER TABLE public.booking_pickup_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent reads own pickup code" ON public.booking_pickup_codes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.parent_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.issue_pickup_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    INSERT INTO public.booking_pickup_codes (booking_id, code)
    VALUES (NEW.id, lpad(floor(random() * 10000)::int::text, 4, '0'))
    ON CONFLICT (booking_id) DO NOTHING;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER bookings_issue_pickup_code AFTER UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.issue_pickup_code();

INSERT INTO public.booking_pickup_codes (booking_id, code)
SELECT id, lpad(floor(random() * 10000)::int::text, 4, '0') FROM public.bookings WHERE status = 'accepted'
ON CONFLICT (booking_id) DO NOTHING;

-- The center checks a code without ever seeing it.
CREATE OR REPLACE FUNCTION public.verify_pickup_code(_booking_id uuid, _code text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.bookings b JOIN public.centers c ON c.id = b.center_id
    WHERE b.id = _booking_id AND (c.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ) THEN
    RAISE EXCEPTION 'Only the center can check pickup codes';
  END IF;
  RETURN EXISTS (SELECT 1 FROM public.booking_pickup_codes WHERE booking_id = _booking_id AND code = trim(_code));
END $$;
REVOKE EXECUTE ON FUNCTION public.verify_pickup_code(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_pickup_code(uuid, text) TO authenticated;

-- ---------- Ratings: 0 means "no reviews yet" ----------
ALTER TABLE public.centers ALTER COLUMN rating SET DEFAULT 0;
UPDATE public.centers c SET rating = 0 WHERE NOT EXISTS (SELECT 1 FROM public.reviews r WHERE r.center_id = c.id);

CREATE OR REPLACE FUNCTION public.refresh_center_rating() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cid uuid := COALESCE(NEW.center_id, OLD.center_id);
BEGIN
  UPDATE public.centers SET rating = COALESCE((SELECT round(avg(rating)::numeric, 1) FROM public.reviews WHERE center_id = cid), 0) WHERE id = cid;
  RETURN NULL;
END $$;

-- ---------- Centers: owners can't set ratings; key edits need re-approval ----------
CREATE OR REPLACE FUNCTION public.guard_center_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Nested calls come from our own triggers (e.g. the rating refresh after a review).
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') OR pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    NEW.rating := 0;
    RETURN NEW;
  END IF;
  NEW.rating := OLD.rating;
  NEW.owner_id := OLD.owner_id;
  NEW.status := OLD.status;
  IF OLD.status = 'approved' AND (
    NEW.name IS DISTINCT FROM OLD.name OR NEW.address IS DISTINCT FROM OLD.address
    OR NEW.city IS DISTINCT FROM OLD.city OR NEW.certifications IS DISTINCT FROM OLD.certifications
  ) THEN
    NEW.status := 'pending';
  END IF;
  RETURN NEW;
END $$;

-- ---------- Live messages ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- ---------- Nightly: finished bookings become completed (00:15 UTC = 05:45 IST) ----------
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
SELECT cron.schedule(
  'complete-finished-bookings',
  '15 0 * * *',
  $$UPDATE public.bookings SET status = 'completed' WHERE status = 'accepted' AND end_date < current_date$$
);
