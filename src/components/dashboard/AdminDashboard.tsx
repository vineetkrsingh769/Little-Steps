import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/centers";
import { Empty, Stat, StatusBadge } from "./shared";

export function AdminDashboard() {
  const qc = useQueryClient();
  const { data: centers = [] } = useQuery({
    queryKey: ["centers", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("centers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: caregivers = [] } = useQuery({
    queryKey: ["caregivers", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("caregivers").select("*, centers(name)").eq("verified", false);
      if (error) throw error;
      return data;
    },
  });
  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*, centers(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: users = 0 } = useQuery({
    queryKey: ["profiles", "count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const setCenter = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("centers").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Center updated"); qc.invalidateQueries({ queryKey: ["centers"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const verify = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("caregivers").update({ verified: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Caregiver verified"); qc.invalidateQueries({ queryKey: ["caregivers"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const pending = centers.filter((c) => c.status === "pending");
  const accepted = bookings.filter((b) => b.status === "accepted" || b.status === "completed");
  const conversion = bookings.length ? Math.round((accepted.length / bookings.length) * 100) : 0;
  const monthly = bookings.filter((b) => b.plan === "monthly").length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Users" value={users} />
        <Stat label="Verified centers" value={centers.filter((c) => c.status === "approved").length} />
        <Stat label="Bookings" value={bookings.length} />
        <Stat label="Conversion" value={`${conversion}%`} />
        <Stat label="Subscriptions" value={monthly} />
        <Stat label="Booking value" value={inr(accepted.reduce((s, b) => s + b.total_price, 0))} />
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Centers awaiting verification</h2>
        {pending.length === 0 ? <Empty>Nothing to review right now.</Empty> : (
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-card p-5 shadow-card">
                <div>
                  <p className="font-semibold">{c.name} <span className="font-normal text-muted-foreground">· {c.city}</span></p>
                  <p className="text-sm text-muted-foreground">Certifications: {c.certifications.join(", ") || "none listed"}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" onClick={() => setCenter.mutate({ id: c.id, status: "approved" })}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => setCenter.mutate({ id: c.id, status: "rejected" })}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Caregivers awaiting verification</h2>
        {caregivers.length === 0 ? <Empty>All caregivers are verified.</Empty> : (
          <div className="space-y-3">
            {caregivers.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-3xl border bg-card p-5 shadow-card">
                <p><span className="font-semibold">{g.name}</span> <span className="text-muted-foreground">· {g.role} at {g.centers?.name}</span></p>
                <Button size="sm" variant="success" onClick={() => verify.mutate(g.id)}><BadgeCheck /> Verify</Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">All bookings</h2>
        {bookings.length === 0 ? <Empty>No bookings yet.</Empty> : (
          <div className="overflow-x-auto rounded-3xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left"><tr><th className="p-3">Center</th><th className="p-3">Child</th><th className="p-3">Plan</th><th className="p-3">Date</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="p-3">{b.centers?.name}</td><td className="p-3">{b.child_name}</td>
                    <td className="p-3 capitalize">{b.plan} × {b.quantity}</td><td className="p-3">{b.start_date}</td>
                    <td className="p-3">{inr(b.total_price)}</td><td className="p-3"><StatusBadge s={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
