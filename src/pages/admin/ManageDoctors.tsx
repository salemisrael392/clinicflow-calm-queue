import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Doctor = Tables<"doctors">;

export default function ManageDoctors() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState({ name: "", specialty: "" });

  const fetchDoctors = async () => {
    const { data } = await supabase.from("doctors").select("*").order("name");
    setDoctors(data ?? []);
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.specialty) return;
    if (editing) {
      const { error } = await supabase.from("doctors").update(form).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Doctor updated" });
    } else {
      const { error } = await supabase.from("doctors").insert(form);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Doctor added" });
    }
    setOpen(false);
    setEditing(null);
    setForm({ name: "", specialty: "" });
    fetchDoctors();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Doctor removed" });
    fetchDoctors();
  };

  const openEdit = (doc: Doctor) => {
    setEditing(doc);
    setForm({ name: doc.name, specialty: doc.specialty });
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", specialty: "" });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Doctors</h1>
          <p className="text-muted-foreground mt-1">Add and manage doctor profiles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Doctor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Jane Smith" />
              </div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Cardiology" />
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Doctor</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doc) => (
          <Card key={doc.id} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
                    {doc.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold">{doc.name}</p>
                    <Badge variant="secondary">{doc.specialty}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(doc)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
