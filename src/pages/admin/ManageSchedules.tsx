import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Doctor = Tables<"doctors">;
type Schedule = Tables<"doctor_schedules">;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ManageSchedules() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ day_of_week: "1", start_time: "09:00", end_time: "17:00", slot_duration_minutes: "15" });

  const fetchData = async () => {
    const { data: docs } = await supabase.from("doctors").select("*").order("name");
    setDoctors(docs ?? []);
    if (docs?.length && !selectedDoctor) setSelectedDoctor(docs[0].id);
  };

  const fetchSchedules = async () => {
    if (!selectedDoctor) return;
    const { data } = await supabase.from("doctor_schedules").select("*").eq("doctor_id", selectedDoctor).order("day_of_week");
    setSchedules(data ?? []);
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchSchedules(); }, [selectedDoctor]);

  const handleAdd = async () => {
    const { error } = await supabase.from("doctor_schedules").insert({
      doctor_id: selectedDoctor,
      day_of_week: parseInt(form.day_of_week),
      start_time: form.start_time + ":00",
      end_time: form.end_time + ":00",
      slot_duration_minutes: parseInt(form.slot_duration_minutes),
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Schedule added" });
    setOpen(false);
    fetchSchedules();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("doctor_schedules").delete().eq("id", id);
    toast({ title: "Schedule removed" });
    fetchSchedules();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Schedules</h1>
          <p className="text-muted-foreground mt-1">Set doctor availability</p>
        </div>
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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Slot</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Schedule</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Day</Label>
                <Select value={form.day_of_week} onValueChange={(v) => setForm({ ...form, day_of_week: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Slot Duration (minutes)</Label>
                <Input type="number" value={form.slot_duration_minutes} onChange={(e) => setForm({ ...form, slot_duration_minutes: e.target.value })} />
              </div>
              <Button onClick={handleAdd} className="w-full">Add Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {schedules.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              No schedules set for this doctor
            </CardContent>
          </Card>
        ) : (
          schedules.map((s) => (
            <Card key={s.id} className="border-border/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground w-24">{DAYS[s.day_of_week]}</span>
                  <span className="text-muted-foreground">
                    {s.start_time.slice(0, 5)} — {s.end_time.slice(0, 5)}
                  </span>
                  <span className="text-sm text-muted-foreground">({s.slot_duration_minutes} min slots)</span>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
