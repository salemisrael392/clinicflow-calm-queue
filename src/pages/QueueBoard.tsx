import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Clock } from "lucide-react";
import { format } from "date-fns";

interface BoardEntry {
  doctorName: string;
  specialty: string;
  currentToken: string | null;
  nextTokens: string[];
}

export default function QueueBoard() {
  const [entries, setEntries] = useState<BoardEntry[]>([]);
  const [time, setTime] = useState(new Date());
  const today = format(new Date(), "yyyy-MM-dd");

  const fetchBoard = async () => {
    const { data: doctors } = await supabase.from("doctors").select("*").eq("is_active", true);
    if (!doctors) return;

    const board: BoardEntry[] = [];
    for (const doc of doctors) {
      const { data: qs } = await supabase
        .from("queue_status")
        .select("current_token")
        .eq("doctor_id", doc.id)
        .eq("queue_date", today)
        .maybeSingle();

      const { data: upcoming } = await supabase
        .from("appointments")
        .select("token_number")
        .eq("doctor_id", doc.id)
        .eq("appointment_date", today)
        .eq("status", "scheduled")
        .order("token_number")
        .limit(3);

      board.push({
        doctorName: doc.name,
        specialty: doc.specialty,
        currentToken: qs?.current_token ?? null,
        nextTokens: upcoming?.map(u => u.token_number) ?? [],
      });
    }
    setEntries(board);
  };

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 5000);
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, []);

  return (
    <div className="min-h-screen bg-foreground p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <Activity className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-background">Clinic Flow</h1>
            <p className="text-background/60 text-sm">Live Queue Display</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-background/80">
          <Clock className="h-5 w-5" />
          <span className="text-2xl font-mono font-bold">{format(time, "HH:mm:ss")}</span>
        </div>
      </div>

      {/* Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {entries.map((entry, i) => (
          <div key={i} className="rounded-2xl bg-background/10 backdrop-blur-sm border border-background/20 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-background">{entry.doctorName}</h3>
              <p className="text-sm text-background/60">{entry.specialty}</p>
            </div>
            <div className="bg-primary/20 rounded-xl p-5 text-center mb-4">
              <p className="text-xs text-background/60 uppercase tracking-wider mb-1">Now Serving</p>
              <p className={`text-5xl font-extrabold ${entry.currentToken ? "text-primary animate-pulse-soft" : "text-background/30"}`}>
                {entry.currentToken ?? "—"}
              </p>
            </div>
            {entry.nextTokens.length > 0 && (
              <div>
                <p className="text-xs text-background/50 uppercase tracking-wider mb-2">Next Up</p>
                <div className="flex gap-2">
                  {entry.nextTokens.map((t) => (
                    <span key={t} className="bg-background/10 rounded-lg px-3 py-1.5 text-sm font-semibold text-background/80">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-20 text-background/40 text-lg">
          No active queues today
        </div>
      )}
    </div>
  );
}
