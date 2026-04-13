
-- Add user_id to doctors table to link to auth user
ALTER TABLE public.doctors ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- Create helper function to check if user is a doctor for a given doctor_id
CREATE OR REPLACE FUNCTION public.is_own_doctor_record(_user_id UUID, _doctor_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.doctors WHERE id = _doctor_id AND user_id = _user_id
  )
$$;

-- Get doctor_id for a given user
CREATE OR REPLACE FUNCTION public.get_doctor_id_for_user(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.doctors WHERE user_id = _user_id LIMIT 1
$$;

-- DOCTORS TABLE: Allow doctors to manage their own record
CREATE POLICY "Doctors can manage own record" ON public.doctors
  FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'doctor'))
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'doctor'));

-- DOCTOR_SCHEDULES TABLE: Allow doctors to manage their own schedules
CREATE POLICY "Doctors can manage own schedules" ON public.doctor_schedules
  FOR ALL TO authenticated
  USING (public.is_own_doctor_record(auth.uid(), doctor_id) AND public.has_role(auth.uid(), 'doctor'))
  WITH CHECK (public.is_own_doctor_record(auth.uid(), doctor_id) AND public.has_role(auth.uid(), 'doctor'));

-- APPOINTMENTS TABLE: Allow doctors to view/manage their own patient appointments
CREATE POLICY "Doctors can view own appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (public.is_own_doctor_record(auth.uid(), doctor_id) AND public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can update own appointments" ON public.appointments
  FOR UPDATE TO authenticated
  USING (public.is_own_doctor_record(auth.uid(), doctor_id) AND public.has_role(auth.uid(), 'doctor'));

-- QUEUE_STATUS TABLE: Allow doctors to manage their own queue
CREATE POLICY "Doctors can manage own queue" ON public.queue_status
  FOR ALL TO authenticated
  USING (public.is_own_doctor_record(auth.uid(), doctor_id) AND public.has_role(auth.uid(), 'doctor'))
  WITH CHECK (public.is_own_doctor_record(auth.uid(), doctor_id) AND public.has_role(auth.uid(), 'doctor'));

-- Update handle_new_user to auto-create a doctor record when doctor signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

  IF NEW.raw_user_meta_data->>'signup_role' = 'doctor' THEN
    _role := 'doctor';
  ELSE
    _role := 'user';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  -- Auto-create doctor record for doctor signups
  IF _role = 'doctor' THEN
    INSERT INTO public.doctors (name, specialty, user_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Doctor'),
      'General',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
