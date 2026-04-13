
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

  IF _role = 'doctor' THEN
    INSERT INTO public.doctors (name, specialty, qualification, years_of_experience, consultation_fee, user_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Doctor'),
      COALESCE(NEW.raw_user_meta_data->>'specialty', 'General'),
      NEW.raw_user_meta_data->>'qualification',
      (NEW.raw_user_meta_data->>'years_of_experience')::integer,
      (NEW.raw_user_meta_data->>'consultation_fee')::numeric,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
