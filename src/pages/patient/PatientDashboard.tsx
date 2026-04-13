import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, DollarSign, GraduationCap, Stethoscope, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Doctor = Tables<"doctors">;

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      const [doctorsRes, appointmentsRes] = await Promise.all([
        supabase.from("doctors").select("*").eq("is_active", true),
        supabase
          .from("appointments")
          .select("id")
          .eq("patient_id", user!.id)
          .eq("status", "scheduled")
          .gte("appointment_date", new Date().toISOString().split("T")[0]),
      ]);
      setDoctors(doctorsRes.data ?? []);
      setUpcomingCount(appointmentsRes.data?.length ?? 0);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const specialties = [...new Set(doctors.map((d) => d.specialty))].sort();
  const filteredDoctors = filterSpecialty === "all" ? doctors : doctors.filter(d => d.specialty === filterSpecialty);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Book appointments and track your queue position</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingCount}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{doctors.length}</p>
              <p className="text-sm text-muted-foreground">Doctors Available</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{specialties.length}</p>
              <p className="text-sm text-muted-foreground">Specialties</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-foreground">Available Doctors</h2>
          <div className="flex items-center gap-3">
            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => navigate("/appointments")}>
              View My Appointments
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/50 animate-pulse">
                <CardContent className="p-6 h-40" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="border-border/50 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/book/${doctor.id}`)}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center shrink-0 text-lg font-bold text-accent-foreground">
                      {doctor.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{doctor.name}</h3>
                      <Badge variant="secondary" className="mt-1">{doctor.specialty}</Badge>
                      {(doctor as any).qualification && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" /> {(doctor as any).qualification}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {(doctor as any).years_of_experience && (
                          <span>{(doctor as any).years_of_experience} yrs exp</span>
                        )}
                        {(doctor as any).consultation_fee && (
                          <span className="flex items-center gap-0.5">
                            <DollarSign className="h-3 w-3" />₹{(doctor as any).consultation_fee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filteredDoctors.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No doctors available{filterSpecialty !== "all" ? ` for ${filterSpecialty}` : ""}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
