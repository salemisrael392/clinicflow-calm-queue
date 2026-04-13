
-- Create a unique index to prevent double bookings (excluding cancelled)
CREATE UNIQUE INDEX idx_unique_appointment_slot
ON public.appointments (doctor_id, appointment_date, time_slot)
WHERE status != 'cancelled';

-- Enable realtime for appointments so patients see live slot updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
