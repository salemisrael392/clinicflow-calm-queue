import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { CalendarDays } from "lucide-react";

interface AppointmentWithDoctor {
  id: string;
  appointment_date: string;
  time_slot: string;
  token_number: string;
  status: string;
  doctors: { name: string; specialty: string } | null;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-secondary/10 text-secondary border-secondary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MyAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from("appointments")
      .select("id, appointment_date, time_slot, token_number, status, doctors(name, specialty)")
      .eq("patient_id", user!.id)
      .order("appointment_date", { ascending: false });
    setAppointments((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, [user]);

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Appointment cancelled" });
      fetchAppointments();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
        <p className="text-muted-foreground mt-1">View and manage your appointments</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Card key={i} className="animate-pulse"><CardContent className="h-24 p-6" /></Card>)}
        </div>
      ) : appointments.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground">No appointments yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Book your first appointment from the dashboard</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt.id} className="border-border/50">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center font-bold text-primary text-sm">
                    {apt.token_number}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{apt.doctors?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(apt.appointment_date), "PPP")} at{" "}
                      {format(parse(apt.time_slot, "HH:mm:ss", new Date()), "h:mm a")}
                    </p>
                    <p className="text-xs text-muted-foreground">{apt.doctors?.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[apt.status] ?? ""} variant="outline">
                    {apt.status.replace("_", " ")}
                  </Badge>
                  {apt.status === "scheduled" && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleCancel(apt.id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
