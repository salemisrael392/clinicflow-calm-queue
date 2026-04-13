

## Clinic Flow — Hospital Appointment Scheduling System

### Design
- **Color scheme**: Light blue (`#E0F2FE`, `#0EA5E9`), green (`#D1FAE5`, `#10B981`), white backgrounds
- **Clean, modern medical UI** with card-based layouts and clear typography

### Pages & Features

#### 1. Auth (Login/Signup)
- Email & password authentication via Lovable Cloud
- Role-based access: patients vs admins
- Redirect to appropriate dashboard after login

#### 2. Patient Booking Dashboard
- Browse available doctors by specialty (cards with photo, name, specialty, availability)
- Select date/time slot from doctor's available schedule
- Confirm booking → receive a **token number** (e.g., "Token #A-042")
- View upcoming and past appointments

#### 3. Real-Time Queue Display
- **Public TV board** (`/queue-board`): Full-screen view showing each doctor's currently serving token and next tokens — suitable for waiting room screens
- **Patient tracker** (in patient dashboard): Shows your position in queue, estimated wait time, and current token being served

#### 4. Appointment Confirmation
- Confirmation screen with token number, doctor name, date/time, and estimated position
- Appointments list with status badges (Scheduled, In Progress, Completed, Cancelled)

#### 5. Admin Panel (`/admin`)
- **Doctor management**: Add/edit doctors (name, specialty, photo)
- **Schedule management**: Set available days, time slots, and slot duration per doctor
- **Queue control**: Mark tokens as "now serving," complete, or skip
- **Appointment overview**: View/filter all appointments by date, doctor, or status

### Database (Supabase via Lovable Cloud)
- `doctors` — name, specialty, avatar_url
- `doctor_schedules` — doctor_id, day_of_week, start_time, end_time, slot_duration
- `appointments` — patient_id, doctor_id, date, time_slot, token_number, status
- `user_roles` — user_id, role (admin/user) with secure RLS
- `queue_status` — doctor_id, current_token, date

### Navigation
- Sidebar layout with role-based menu items
- Patients see: Dashboard, My Appointments, Queue Status
- Admins see: Doctors, Schedules, Queue Control, All Appointments

