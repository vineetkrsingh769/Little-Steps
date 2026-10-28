import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AGE_GROUPS, label } from "@/lib/centers";
import { Empty } from "./shared";

type ChildRow = { id: string; name: string; date_of_birth: string | null; age_group: string; notes: string };

const blank = { name: "", date_of_birth: "", age_group: "toddler", notes: "" };

export function ChildrenTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ChildRow | null>(null);
  const [f, setF] = useState(blank);

  const { data: children = [] } = useQuery({
    queryKey: ["children", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("children").select("*").eq("parent_id", user!.id).order("created_at");
      if (error) throw error;
      return data as ChildRow[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const row = { name: f.name, date_of_birth: f.date_of_birth || null, age_group: f.age_group, notes: f.notes };
      const { error } = editing
        ? await supabase.from("children").update(row).eq("id", editing.id)
        : await supabase.from("children").insert({ ...row, parent_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editing ? "Child updated" : "Child added");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["children"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("children").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Child removed"); qc.invalidateQueries({ queryKey: ["children"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">My children</h2>
        <Button size="sm" variant="hero" onClick={() => { setEditing(null); setF(blank); setOpen(true); }}>Add child</Button>
      </div>
      {children.length === 0 ? <Empty>No children added yet. Save their details to fill booking forms faster.</Empty> : (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((ch) => (
            <div key={ch.id} className="flex items-start justify-between gap-3 rounded-3xl border bg-card p-5 shadow-card">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-peach font-display font-semibold text-accent-foreground">{ch.name[0]}</div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{ch.name}</p>
                <p className="text-sm text-muted-foreground">{label(AGE_GROUPS, ch.age_group)}{ch.date_of_birth ? ` · born ${ch.date_of_birth}` : ""}</p>
                {ch.notes && <p className="mt-1 text-sm">{ch.notes}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setEditing(ch); setF({ name: ch.name, date_of_birth: ch.date_of_birth ?? "", age_group: ch.age_group, notes: ch.notes }); setOpen(true); }}>Edit</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(ch.id)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit child" : "Add child"}</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
            <div className="space-y-1"><Label htmlFor="child-name">Name</Label><Input id="child-name" required maxLength={60} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label htmlFor="child-dob">Date of birth (optional)</Label><Input id="child-dob" type="date" value={f.date_of_birth} onChange={(e) => setF({ ...f, date_of_birth: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="child-age">Age group</Label>
                <Select value={f.age_group} onValueChange={(v) => setF({ ...f, age_group: v })}>
                  <SelectTrigger id="child-age"><SelectValue /></SelectTrigger>
                  <SelectContent>{AGE_GROUPS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label htmlFor="child-notes">Allergies / notes</Label><Textarea id="child-notes" maxLength={500} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
            <Button type="submit" variant="hero" className="w-full" disabled={save.isPending}>{editing ? "Save changes" : "Add child"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
