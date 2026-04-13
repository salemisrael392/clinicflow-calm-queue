
ALTER TABLE public.doctors
ADD COLUMN qualification text DEFAULT NULL,
ADD COLUMN years_of_experience integer DEFAULT NULL,
ADD COLUMN consultation_fee numeric(10,2) DEFAULT NULL;
