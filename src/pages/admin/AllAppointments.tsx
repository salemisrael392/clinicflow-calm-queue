import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parse } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Doctor = Tables<"doctors">;

interface AppointmentRow {
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

export default function AllAppointments() {
  const { role, user } = useAuth();
  const isDoctor = role === "doctor";
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterDate, setFilterDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterStatus, setFilterStatus] = useState("all");
  const [myDoctorId, setMyDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      let q = supabase.from("doctors").select("*").order("name");
      if (isDoctor && user) {
        q = q.eq("user_id", user.id);
      }
      const { data } = await q;
      setDoctors(data ?? []);
      if (isDoctor && data?.length) {
        setMyDoctorId(data[0].id);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchAppts = async () => {
      let q = supabase
        .from("appointments")
        .select("id, appointment_date, time_slot, token_number, status, doctors(name, specialty)")
        .order("appointment_date", { ascending: false })
        .order("token_number");

      if (filterDate) q = q.eq("appointment_date", filterDate);
      if (isDoctor && myDoctorId) {
        q = q.eq("doctor_id", myDoctorId);
      } else if (filterDoctor !== "all") {
        q = q.eq("doctor_id", filterDoctor);
      }
      if (filterStatus !== "all") q = q.eq("status", filterStatus);

      const { data } = await q;
      setAppointments((data as any) ?? []);
    };
    fetchAppts();
  }, [filterDoctor, filterDate, filterStatus, myDoctorId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{isDoctor ? "My Appointments" : "All Appointments"}</h1>
        <p className="text-muted-foreground mt-1">{isDoctor ? "View your patient appointments" : "View and filter appointments"}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-[180px]" />
        {!isDoctor && (
          <Select value={filterDoctor} onValueChange={setFilterDoctor}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Doctors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              {!isDoctor && <TableHead>Doctor</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((apt) => (
              <TableRow key={apt.id}>
                <TableCell className="font-bold">{apt.token_number}</TableCell>
                {!isDoctor && <TableCell>{apt.doctors?.name}</TableCell>}
                <TableCell>{format(new Date(apt.appointment_date), "PP")}</TableCell>
                <TableCell>{format(parse(apt.time_slot, "HH:mm:ss", new Date()), "h:mm a")}</TableCell>
                <TableCell>
                  <Badge className={statusColors[apt.status] ?? ""} variant="outline">
                    {apt.status.replace("_", " ")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={isDoctor ? 4 : 5} className="text-center py-8 text-muted-foreground">
                  No appointments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
