import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const REASONS = [
  { value: "safety", label: "Child safety concern" },
  { value: "service", label: "Quality of care / service" },
  { value: "billing", label: "Payment or price" },
  { value: "cancellation", label: "Cancellation or no-show" },
  { value: "other", label: "Something else" },
] as const;

/** "Report a problem" on one booking. Every row shares one cached list of the user's own complaints. */
export function ReportProblem({ bookingId, label }: { bookingId: string; label: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const { data: mine = [] } = useQuery({
    queryKey: ["disputes", "mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("disputes").select("id, booking_id, reason, status, admin_note, created_at").eq("reporter_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const existing = mine.find((d) => d.booking_id === bookingId);

  const send = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("disputes").insert({ booking_id: bookingId, reporter_id: user!.id, reason, details: details.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks — our team will look into it.");
      setOpen(false);
      setReason("");
      setDetails("");
      qc.invalidateQueries({ queryKey: ["disputes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className={existing ? "" : "text-muted-foreground"}>
          <Flag className="h-4 w-4" />
          {existing ? (existing.status === "resolved" ? "Report resolved" : "Report open") : "Report a problem"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{existing ? "Your report" : "Report a problem"} · {label}</DialogTitle></DialogHeader>
        {existing ? (
          <div className="space-y-3 text-sm">
            <p><span className="text-muted-foreground">Reason:</span> {REASONS.find((r) => r.value === existing.reason)?.label}</p>
            <p><span className="text-muted-foreground">Status:</span> <span className="font-semibold capitalize">{existing.status}</span></p>
            {existing.admin_note
              ? <p className="rounded-2xl bg-secondary p-3 text-secondary-foreground"><span className="font-semibold">Little Steps team:</span> {existing.admin_note}</p>
              : <p className="text-muted-foreground">Our team has your report and will reply here.</p>}
          </div>
        ) : (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); send.mutate(); }}>
            <div className="space-y-1">
              <Label htmlFor={`reason-${bookingId}`}>What went wrong?</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id={`reason-${bookingId}`}><SelectValue placeholder="Choose a reason" /></SelectTrigger>
                <SelectContent>{REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`details-${bookingId}`}>Details</Label>
              <Textarea id={`details-${bookingId}`} required minLength={10} maxLength={2000} rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What happened, and when?" />
            </div>
            <p className="text-xs text-muted-foreground">Only you and the Little Steps team can see this report. For emergencies, call 112.</p>
            <Button type="submit" variant="hero" className="w-full" disabled={send.isPending || !reason || details.trim().length < 10}>Send report</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
