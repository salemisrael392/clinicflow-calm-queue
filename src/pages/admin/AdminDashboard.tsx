import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Stethoscope, ListOrdered } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ doctors: 0, todayAppts: 0, totalPatients: 0, activeQueues: 0 });
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const fetch = async () => {
      const [docs, appts, queues] = await Promise.all([
        supabase.from("doctors").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("appointment_date", today),
        supabase.from("queue_status").select("id", { count: "exact", head: true }).eq("queue_date", today),
      ]);
      setStats({
        doctors: docs.count ?? 0,
        todayAppts: appts.count ?? 0,
        totalPatients: 0,
        activeQueues: queues.count ?? 0,
      });
    };
    fetch();
  }, []);

  const cards = [
    { label: "Total Doctors", value: stats.doctors, icon: Stethoscope, color: "text-primary" },
    { label: "Today's Appointments", value: stats.todayAppts, icon: CalendarDays, color: "text-secondary" },
    { label: "Active Queues", value: stats.activeQueues, icon: ListOrdered, color: "text-warning" },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-border/70 pb-6">
        <p className="text-sm font-semibold text-primary">Clinic operations</p>
        <h1 className="mt-1 text-4xl text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">A clear view of today's care flow.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                <c.icon className={`h-6 w-6 ${c.color}`} />
              </div>
              <div>
                <p className="text-3xl font-display">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
