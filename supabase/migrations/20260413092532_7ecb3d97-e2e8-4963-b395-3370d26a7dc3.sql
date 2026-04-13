
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
    INSERT INTO public.doctors (name, specialty, user_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Doctor'),
      COALESCE(NEW.raw_user_meta_data->>'specialty', 'General'),
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
