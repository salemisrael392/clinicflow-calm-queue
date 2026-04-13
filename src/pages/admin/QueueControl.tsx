import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Play, SkipForward, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Doctor = Tables<"doctors">;

interface AppointmentRow {
  id: string;
  token_number: string;
  time_slot: string;
  status: string;
  patient_id: string;
}

export default function QueueControl() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    supabase.from("doctors").select("*").order("name").then(({ data }) => {
      setDoctors(data ?? []);
      if (data?.length && !selectedDoctor) setSelectedDoctor(data[0].id);
    });
  }, []);

  const fetchQueue = async () => {
    if (!selectedDoctor) return;
    const [apptRes, qsRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("id, token_number, time_slot, status, patient_id")
        .eq("doctor_id", selectedDoctor)
        .eq("appointment_date", today)
        .neq("status", "cancelled")
        .order("token_number"),
      supabase
        .from("queue_status")
        .select("current_token")
        .eq("doctor_id", selectedDoctor)
        .eq("queue_date", today)
        .maybeSingle(),
    ]);
    setAppointments((apptRes.data as AppointmentRow[]) ?? []);
    setCurrentToken(qsRes.data?.current_token ?? null);
  };

  useEffect(() => { fetchQueue(); }, [selectedDoctor]);

  const setServing = async (token: string) => {
    // Upsert queue_status
    const { error: qError } = await supabase.from("queue_status").upsert(
      { doctor_id: selectedDoctor, queue_date: today, current_token: token },
      { onConflict: "doctor_id,queue_date" }
    );
    // Update appointment status
    await supabase.from("appointments")
      .update({ status: "in_progress" })
      .eq("doctor_id", selectedDoctor)
      .eq("appointment_date", today)
      .eq("token_number", token);

    if (qError) {
      toast({ title: "Error", description: qError.message, variant: "destructive" });
    } else {
      toast({ title: `Now serving ${token}` });
      fetchQueue();
    }
  };

  const completeToken = async (aptId: string) => {
    await supabase.from("appointments").update({ status: "completed" }).eq("id", aptId);
    toast({ title: "Marked as completed" });
    fetchQueue();
  };

  const callNext = () => {
    const scheduled = appointments.filter(a => a.status === "scheduled");
    if (scheduled.length > 0) {
      setServing(scheduled[0].token_number);
    } else {
      toast({ title: "No more patients in queue" });
    }
  };

  const statusColors: Record<string, string> = {
    scheduled: "bg-primary/10 text-primary",
    in_progress: "bg-warning/10 text-warning",
    completed: "bg-secondary/10 text-secondary",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Queue Control</h1>
        <p className="text-muted-foreground mt-1">Manage patient queues for today</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={callNext} className="gap-2">
          <SkipForward className="h-4 w-4" /> Call Next
        </Button>
      </div>

      {currentToken && (
        <Card className="border-primary/30 bg-accent">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Currently Serving</p>
            <p className="text-4xl font-extrabold text-primary">{currentToken}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {appointments.map((apt) => (
          <Card key={apt.id} className="border-border/50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg w-20">{apt.token_number}</span>
                <span className="text-sm text-muted-foreground">{apt.time_slot.slice(0, 5)}</span>
                <Badge className={statusColors[apt.status] ?? ""} variant="outline">
                  {apt.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex gap-2">
                {apt.status === "scheduled" && (
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setServing(apt.token_number)}>
                    <Play className="h-3 w-3" /> Serve
                  </Button>
                )}
                {apt.status === "in_progress" && (
                  <Button variant="outline" size="sm" className="gap-1 text-secondary" onClick={() => completeToken(apt.id)}>
                    <CheckCircle2 className="h-3 w-3" /> Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {appointments.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              No appointments for today
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
