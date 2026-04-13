import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { format } from "date-fns";

interface QueueInfo {
  doctorName: string;
  specialty: string;
  currentToken: string | null;
  myToken: string | null;
  myPosition: number | null;
}

export default function QueueStatus() {
  const { user } = useAuth();
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  const fetchQueue = async () => {
    // Get my today's appointments
    const { data: myAppts } = await supabase
      .from("appointments")
      .select("doctor_id, token_number, doctors(name, specialty)")
      .eq("patient_id", user!.id)
      .eq("appointment_date", today)
      .in("status", ["scheduled", "in_progress"]);

    if (!myAppts?.length) {
      setQueues([]);
      setLoading(false);
      return;
    }

    const infos: QueueInfo[] = [];
    for (const apt of myAppts as any[]) {
      const { data: qs } = await supabase
        .from("queue_status")
        .select("current_token")
        .eq("doctor_id", apt.doctor_id)
        .eq("queue_date", today)
        .maybeSingle();

      // Calculate position
      const { data: allTokens } = await supabase
        .from("appointments")
        .select("token_number")
        .eq("doctor_id", apt.doctor_id)
        .eq("appointment_date", today)
        .in("status", ["scheduled", "in_progress"])
        .order("token_number");

      const tokens = allTokens?.map(t => t.token_number) ?? [];
      const currentIdx = qs?.current_token ? tokens.indexOf(qs.current_token) : -1;
      const myIdx = tokens.indexOf(apt.token_number);
      const position = myIdx >= 0 && currentIdx >= 0 ? myIdx - currentIdx : null;

      infos.push({
        doctorName: apt.doctors?.name ?? "",
        specialty: apt.doctors?.specialty ?? "",
        currentToken: qs?.current_token ?? null,
        myToken: apt.token_number,
        myPosition: position,
      });
    }

    setQueues(infos);
    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Queue Status</h1>
        <p className="text-muted-foreground mt-1">Track your position in today's queue</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32 p-6" /></Card>)}
        </div>
      ) : queues.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground">No appointments today</h3>
            <p className="text-muted-foreground text-sm mt-1">You don't have any active appointments for today</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queues.map((q, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{q.doctorName}</CardTitle>
                <Badge variant="secondary" className="w-fit">{q.specialty}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-accent rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Now Serving</p>
                    <p className="text-2xl font-bold text-primary">{q.currentToken ?? "—"}</p>
                  </div>
                  <div className="bg-accent rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Your Token</p>
                    <p className="text-2xl font-bold text-foreground">{q.myToken}</p>
                  </div>
                </div>
                {q.myPosition !== null && q.myPosition > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">{q.myPosition}</strong> patient(s) ahead of you
                    </span>
                  </div>
                )}
                {q.myPosition !== null && q.myPosition <= 0 && (
                  <Badge className="bg-secondary/10 text-secondary border-secondary/20" variant="outline">
                    It's your turn!
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
