import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REASONS } from "@/components/ReportProblem";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/centers";
import { Empty, Stat, StatusBadge } from "./shared";

export function AdminDashboard() {
  const qc = useQueryClient();
  const { data: centers = [], isError: centersError } = useQuery({
    queryKey: ["centers", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("centers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: caregivers = [], isError: caregiversError } = useQuery({
    queryKey: ["caregivers", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("caregivers").select("*, centers(name)").eq("verified", false);
      if (error) throw error;
      return data;
    },
  });
  const { data: bookings = [], isError: bookingsError } = useQuery({
    queryKey: ["bookings", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*, centers(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: users = 0, isError: usersError } = useQuery({
    queryKey: ["profiles", "count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: complaints = [], isError: complaintsError } = useQuery({
    queryKey: ["disputes", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select("*, profiles(full_name), bookings(child_name, centers(name))")
        .order("status")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
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
  const monthly = accepted.filter((b) => b.plan === "monthly").length;
  const adoption = accepted.length ? Math.round((monthly / accepted.length) * 100) : 0;
  const approved = centers.filter((c) => c.status === "approved");
  const rated = approved.filter((c) => c.rating > 0);
  const avgRating = rated.length ? (rated.reduce((s, c) => s + Number(c.rating), 0) / rated.length).toFixed(1) : "—";
  const providers = new Set(approved.map((c) => c.owner_id).filter(Boolean)).size;
  // Seats in use today across approved centers ÷ their total capacity.
  const today = new Date().toLocaleDateString("en-CA");
  const seatsToday = bookings.filter((b) => b.status === "accepted" && b.start_date <= today && today <= b.end_date).length;
  const totalSeats = approved.reduce((s, c) => s + c.capacity, 0);
  const utilization = totalSeats ? Math.round((seatsToday / totalSeats) * 100) : 0;

  return (
    <div className="space-y-8">
      {(centersError || caregiversError || bookingsError || usersError) && (
        <p role="alert" className="rounded-3xl bg-destructive p-4 text-sm text-destructive-foreground">Some admin data couldn't load, so the lists below may be incomplete. Please refresh the page.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Registered users" value={users} />
        <Stat label="Verified centers" value={approved.length} />
        <Stat label="Verified providers" value={providers} />
        <Stat label="Bookings" value={bookings.length} />
        <Stat label="Booking conversion" value={`${conversion}%`} />
        <Stat label="Monthly plan adoption" value={`${adoption}% (${monthly})`} />
        <Stat label="Utilization today" value={`${utilization}%`} />
        <Stat label="Avg rating" value={avgRating === "—" ? avgRating : `★ ${avgRating}`} />
        <Stat label="Booking value" value={inr(accepted.reduce((s, b) => s + b.total_price, 0))} />
        <Stat label="Open complaints" value={complaints.filter((d) => d.status === "open").length} />
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Complaints</h2>
        {complaintsError ? <Empty>Couldn't load complaints. Please refresh the page.</Empty> : complaints.length === 0 ? <Empty>No complaints reported.</Empty> : (
          <div className="space-y-3">{complaints.map((d) => <ComplaintRow key={d.id} d={d} />)}</div>
        )}
      </section>

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

type Complaint = {
  id: string; reason: string; details: string; status: string; admin_note: string; created_at: string;
  profiles: { full_name: string } | null;
  bookings: { child_name: string; centers: { name: string } | null } | null;
};

function ComplaintRow({ d }: { d: Complaint }) {
  const qc = useQueryClient();
  const [note, setNote] = useState(d.admin_note);
  const resolve = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("disputes").update({ status: "resolved", admin_note: note.trim() }).eq("id", d.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Complaint resolved"); qc.invalidateQueries({ queryKey: ["disputes"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-2 rounded-3xl border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">
          {REASONS.find((r) => r.value === d.reason)?.label ?? d.reason}
          <span className="font-normal text-muted-foreground"> · {d.bookings?.centers?.name} · child {d.bookings?.child_name} · by {d.profiles?.full_name || "user"}</span>
        </p>
        <StatusBadge s={d.status} />
      </div>
      <p className="text-sm">{d.details}</p>
      <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
      {d.status === "open" ? (
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); resolve.mutate(); }}>
          <Input className="min-w-56 flex-1" aria-label="Note to the person who reported" placeholder="What did you do? (shown to the reporter)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
          <Button type="submit" size="sm" variant="success" disabled={resolve.isPending}>Mark resolved</Button>
        </form>
      ) : d.admin_note && <p className="rounded-2xl bg-secondary p-3 text-sm text-secondary-foreground">Note: {d.admin_note}</p>}
    </div>
  );
}
