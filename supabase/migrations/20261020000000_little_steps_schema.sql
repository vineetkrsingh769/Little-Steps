CREATE TYPE public.app_role AS ENUM ('admin','provider','parent');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- signup: profile + role (parent/provider only; first ever user becomes admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r text;
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  r := COALESCE(NEW.raw_user_meta_data->>'account_type','parent');
  IF r NOT IN ('parent','provider') THEN r := 'parent'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, r::app_role);
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  name text NOT NULL,
  city text NOT NULL,
  address text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  is_24x7 boolean NOT NULL DEFAULT false,
  timings text[] NOT NULL DEFAULT '{day}',
  age_groups text[] NOT NULL DEFAULT '{toddler}',
  capacity int NOT NULL DEFAULT 10,
  hourly_price int NOT NULL DEFAULT 0,
  daily_price int NOT NULL DEFAULT 0,
  monthly_price int NOT NULL DEFAULT 0,
  safety_measures text[] NOT NULL DEFAULT '{}',
  certifications text[] NOT NULL DEFAULT '{}',
  image_key text NOT NULL DEFAULT 'center-1',
  status text NOT NULL DEFAULT 'pending',
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.centers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.centers TO authenticated;
GRANT ALL ON public.centers TO service_role;
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved centers public" ON public.centers FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "owner reads own" ON public.centers FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "provider inserts" ON public.centers FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(),'provider'));
CREATE POLICY "owner or admin updates" ON public.centers FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "owner deletes" ON public.centers FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.guard_center_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(),'admin') THEN
    IF TG_OP = 'INSERT' THEN NEW.status := 'pending';
    ELSE NEW.status := OLD.status; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER centers_status_guard BEFORE INSERT OR UPDATE ON public.centers FOR EACH ROW EXECUTE FUNCTION public.guard_center_status();

CREATE TABLE public.caregivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Caregiver',
  experience_years int NOT NULL DEFAULT 1,
  bio text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.caregivers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caregivers TO authenticated;
GRANT ALL ON public.caregivers TO service_role;
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "caregivers public" ON public.caregivers FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.centers c WHERE c.id = center_id AND c.status='approved'));
CREATE POLICY "caregivers owner read" ON public.caregivers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.centers c WHERE c.id = center_id AND c.owner_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "caregivers owner insert" ON public.caregivers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.centers c WHERE c.id = center_id AND c.owner_id = auth.uid()));
CREATE POLICY "caregivers owner or admin update" ON public.caregivers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.centers c WHERE c.id = center_id AND c.owner_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "caregivers owner delete" ON public.caregivers FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.centers c WHERE c.id = center_id AND c.owner_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.guard_caregiver_verified()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(),'admin') THEN
    IF TG_OP = 'INSERT' THEN NEW.verified := false; ELSE NEW.verified := OLD.verified; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER caregivers_verified_guard BEFORE INSERT OR UPDATE ON public.caregivers FOR EACH ROW EXECUTE FUNCTION public.guard_caregiver_verified();

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL,
  child_name text NOT NULL,
  age_group text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('hourly','daily','monthly')),
  start_date date NOT NULL,
  start_time time NOT NULL DEFAULT '09:00',
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 24),
  total_price int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled','completed')),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent reads own bookings" ON public.bookings FOR SELECT TO authenticated USING (parent_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.centers c WHERE c.id = center_id AND c.owner_id = auth.uid()));
CREATE POLICY "parent creates bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (parent_id = auth.uid());
CREATE POLICY "parties update bookings" ON public.bookings FOR UPDATE TO authenticated USING (parent_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.centers c WHERE c.id = center_id AND c.owner_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.guard_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.centers; taken int; is_owner boolean;
BEGIN
  SELECT * INTO c FROM public.centers WHERE id = NEW.center_id;
  IF TG_OP = 'INSERT' THEN
    IF c.status <> 'approved' THEN RAISE EXCEPTION 'This center is not accepting bookings yet'; END IF;
    IF NEW.start_date < current_date THEN RAISE EXCEPTION 'Please choose today or a future date'; END IF;
    IF NEW.plan = 'hourly' AND NEW.quantity < 1 THEN RAISE EXCEPTION 'At least one hour'; END IF;
    IF NEW.plan <> 'hourly' THEN NEW.quantity := LEAST(NEW.quantity, 12); END IF;
    NEW.status := 'pending';
    NEW.total_price := CASE NEW.plan
      WHEN 'hourly' THEN c.hourly_price * NEW.quantity
      WHEN 'daily' THEN c.daily_price * NEW.quantity
      ELSE c.monthly_price * NEW.quantity END;
    RETURN NEW;
  END IF;
  -- UPDATE: only status may change
  NEW.center_id := OLD.center_id; NEW.parent_id := OLD.parent_id; NEW.total_price := OLD.total_price;
  NEW.plan := OLD.plan; NEW.quantity := OLD.quantity; NEW.start_date := OLD.start_date;
  is_owner := c.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin');
  IF NEW.status <> OLD.status THEN
    IF NOT is_owner AND NOT (OLD.parent_id = auth.uid() AND NEW.status = 'cancelled' AND OLD.status IN ('pending','accepted')) THEN
      RAISE EXCEPTION 'You cannot change this booking to %', NEW.status;
    END IF;
    IF NEW.status = 'accepted' THEN
      SELECT count(*) INTO taken FROM public.bookings b
        WHERE b.center_id = NEW.center_id AND b.status = 'accepted' AND b.id <> NEW.id AND b.start_date = NEW.start_date;
      IF taken >= c.capacity THEN RAISE EXCEPTION 'Center is at full capacity for this date'; END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER bookings_guard BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.guard_booking();

-- Seed approved demo centers
INSERT INTO public.centers (id, name, city, address, description, is_24x7, timings, age_groups, capacity, hourly_price, daily_price, monthly_price, safety_measures, certifications, image_key, status, rating) VALUES
('11111111-1111-1111-1111-111111111111','Sunbeam Kids Crèche','Bengaluru','12 Indiranagar 100ft Rd','A bright, round-the-clock crèche for shift-working parents, with nap pods and a sensory play room.',true,'{day,night,emergency}','{infant,toddler,preschool}',30,250,1500,18000,'{CCTV in all rooms,Biometric pickup,First-aid trained staff,Child-safe furniture}','{Fire Safety NOC,Police-verified staff,FSSAI kitchen}','center-1','approved',4.8),
('22222222-2222-2222-2222-222222222222','Little Nest Daycare','Mumbai','4 Hill Rd, Bandra West','Cozy home-style daycare with organic meals and a small caregiver-to-child ratio.',false,'{day}','{toddler,preschool}',18,200,1200,15000,'{OTP-based pickup,Sanitised play areas,Pediatrician on call}','{Fire Safety NOC,Police-verified staff}','center-2','approved',4.6),
('33333333-3333-3333-3333-333333333333','Moonlight Care Hub','Pune','22 Hinjewadi Phase 1','Night-shift friendly centre near the IT park with quiet sleep rooms and emergency drop-ins.',true,'{night,emergency}','{infant,toddler}',20,300,1800,21000,'{24h security guard,CCTV,Night nurse on duty}','{Fire Safety NOC,Nursing license}','center-3','approved',4.7),
('44444444-4444-4444-4444-444444444444','Tiny Toes Preschool & Crèche','Delhi','B-7 Vasant Vihar','Play-based learning crèche with Montessori corners and an outdoor garden.',false,'{day,emergency}','{preschool}',40,180,1000,12000,'{Gated campus,Visitor log,First-aid kit in every room}','{Montessori certified,Police-verified staff}','center-4','approved',4.5);

INSERT INTO public.caregivers (center_id, name, role, experience_years, bio, verified) VALUES
('11111111-1111-1111-1111-111111111111','Priya Nair','Lead Caregiver',8,'Early-childhood educator who loves storytelling.',true),
('11111111-1111-1111-1111-111111111111','Anita Rao','Night Nanny',5,'Specialises in infant sleep routines.',true),
('22222222-2222-2222-2222-222222222222','Meera Shah','Caregiver',6,'Trained in toddler nutrition and play.',true),
('33333333-3333-3333-3333-333333333333','Sunita Pawar','Night Nurse',10,'Registered nurse, infant care specialist.',true),
('33333333-3333-3333-3333-333333333333','Rahul Kulkarni','Caregiver',3,'Calm, patient and great with toddlers.',true),
('44444444-4444-4444-4444-444444444444','Kavya Menon','Montessori Guide',7,'AMI-trained guide for 3-6 year olds.',true);