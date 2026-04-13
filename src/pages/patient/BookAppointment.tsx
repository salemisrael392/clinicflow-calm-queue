import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { format, addMinutes, parse, isToday, isBefore } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Doctor = Tables<"doctors">;
type Schedule = Tables<"doctor_schedules">;

export default function BookAppointment() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [confirmedToken, setConfirmedToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const [docRes, schedRes] = await Promise.all([
        supabase.from("doctors").select("*").eq("id", doctorId!).single(),
        supabase.from("doctor_schedules").select("*").eq("doctor_id", doctorId!),
      ]);
      setDoctor(docRes.data);
      setSchedules(schedRes.data ?? []);
    };
    fetch();
  }, [doctorId]);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDate || !doctorId) return;
    setSelectedSlot(null);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    supabase
      .from("appointments")
      .select("time_slot")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", dateStr)
      .neq("status", "cancelled")
      .then(({ data }) => {
        setBookedSlots(data?.map((a) => a.time_slot) ?? []);
      });
  }, [selectedDate, doctorId]);

  const daySchedule = selectedDate
    ? schedules.find((s) => s.day_of_week === selectedDate.getDay())
    : null;

  const generateSlots = (): string[] => {
    if (!daySchedule) return [];
    const slots: string[] = [];
    let current = parse(daySchedule.start_time, "HH:mm:ss", new Date());
    const end = parse(daySchedule.end_time, "HH:mm:ss", new Date());
    while (isBefore(current, end)) {
      const timeStr = format(current, "HH:mm:ss");
      if (!(selectedDate && isToday(selectedDate) && isBefore(current, new Date()))) {
        slots.push(timeStr);
      }
      current = addMinutes(current, daySchedule.slot_duration_minutes);
    }
    return slots;
  };

  const availableSlots = generateSlots().filter((s) => !bookedSlots.includes(s));

  const availableDays = schedules.map((s) => s.day_of_week);
  const disabledDays = (date: Date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return true;
    return !availableDays.includes(date.getDay());
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot || !user || !doctorId) return;
    setSubmitting(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Generate token: prefix from specialty + sequential number
    const { count } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", doctorId)
      .eq("appointment_date", dateStr)
      .neq("status", "cancelled");

    const prefix = (doctor?.specialty?.[0] ?? "A").toUpperCase();
    const tokenNum = String((count ?? 0) + 1).padStart(3, "0");
    const tokenNumber = `${prefix}-${tokenNum}`;

    const { error } = await supabase.from("appointments").insert({
      patient_id: user.id,
      doctor_id: doctorId,
      appointment_date: dateStr,
      time_slot: selectedSlot,
      token_number: tokenNumber,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      setConfirmedToken(tokenNumber);
    }
  };

  if (confirmedToken) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card className="border-border/50 shadow-lg text-center">
          <CardContent className="p-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Appointment Confirmed!</h2>
            <div className="bg-accent rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-1">Your Token Number</p>
              <p className="text-4xl font-extrabold text-primary">{confirmedToken}</p>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Doctor:</strong> {doctor?.name}</p>
              <p><strong>Date:</strong> {selectedDate && format(selectedDate, "PPP")}</p>
              <p><strong>Time:</strong> {selectedSlot && format(parse(selectedSlot, "HH:mm:ss", new Date()), "h:mm a")}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => navigate("/appointments")}>View Appointments</Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>Back to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Doctors
      </Button>

      {doctor && (
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center text-lg font-bold text-accent-foreground">
                {doctor.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <CardTitle>{doctor.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="mt-1">{doctor.specialty}</Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDays}
              className="rounded-md pointer-events-auto"
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Select Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-muted-foreground text-sm">Please select a date first</p>
            ) : !daySchedule ? (
              <p className="text-muted-foreground text-sm">No schedule for this day</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-muted-foreground text-sm">No available slots for this date</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSlot(slot)}
                    className="text-xs"
                  >
                    {format(parse(slot, "HH:mm:ss", new Date()), "h:mm a")}
                  </Button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <Button className="w-full mt-6" onClick={handleBook} disabled={submitting}>
                {submitting ? "Booking..." : "Confirm Appointment"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
