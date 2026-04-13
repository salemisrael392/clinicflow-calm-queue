
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Check if signup_role is 'doctor', otherwise default to 'user'
  IF NEW.raw_user_meta_data->>'signup_role' = 'doctor' THEN
    _role := 'doctor';
  ELSE
    _role := 'user';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
