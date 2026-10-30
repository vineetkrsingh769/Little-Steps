import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageThread } from "@/components/MessageThread";
import { ReportProblem } from "@/components/ReportProblem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AGE_GROUPS, TIMINGS, inr, type Center } from "@/lib/centers";
import { ProviderCharts } from "./ProviderCharts";
import { Empty, Stat, StatusBadge } from "./shared";

export function ProviderDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: centers = [], isError: centersError } = useQuery({
    queryKey: ["centers", "mine", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("centers").select("*").eq("owner_id", user!.id).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const ids = centers.map((c) => c.id);
  const { data: bookings = [], isError: bookingsError } = useQuery({
    queryKey: ["bookings", "provider", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*, centers(name)").in("center_id", ids).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const today = new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
  const earnings = bookings.filter((b) => b.status === "accepted" || b.status === "completed").reduce((s, b) => s + b.total_price, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Centers" value={centers.length} />
        <Stat label="Pending requests" value={bookings.filter((b) => b.status === "pending").length} />
        <Stat label="Confirmed bookings" value={bookings.filter((b) => b.status === "accepted").length} />
        <Stat label="Earnings" value={inr(earnings)} />
      </div>

      {bookings.length > 0 && <ProviderCharts bookings={bookings} />}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">My centers</h2>
          <CenterForm />
        </div>
        {centersError ? <Empty>Couldn't load your centers. Please refresh the page.</Empty> : centers.length === 0 ? <Empty>Add your first center. It will go live once our team verifies it.</Empty> : (
          <div className="grid gap-4 md:grid-cols-2">
            {centers.map((c) => (
              <div key={c.id} className="space-y-3 rounded-3xl border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">{c.city} · capacity {c.capacity}</p></div>
                  <StatusBadge s={c.status} />
                </div>
                <p className="text-sm">{inr(c.hourly_price)}/hr · {inr(c.daily_price)}/day · {inr(c.monthly_price)}/mo</p>
                <div className="flex gap-2"><CenterForm center={c} /><CaregiverForm centerId={c.id} /></div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Booking requests</h2>
        {bookingsError ? <Empty>Couldn't load booking requests. Please refresh the page.</Empty> : bookings.length === 0 ? <Empty>No booking requests yet.</Empty> : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-card p-5 shadow-card">
                <div>
                  <p className="font-semibold">{b.child_name} <span className="font-normal text-muted-foreground">· {b.age_group} · {b.centers?.name}</span></p>
                  <p className="text-sm text-muted-foreground">{b.plan} × {b.quantity} · from {b.start_date} {b.start_time.slice(0, 5)}{b.end_date !== b.start_date && ` until ${b.end_date}`}{b.notes ? ` · “${b.notes}”` : ""}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-semibold">{inr(b.total_price)}</span>
                  <StatusBadge s={b.status} />
                  <MessageThread bookingId={b.id} label={b.child_name} />
                  <ReportProblem bookingId={b.id} label={b.child_name} />
                  {b.status === "pending" && <>
                    <Button size="sm" variant="success" onClick={() => setStatus.mutate({ id: b.id, status: "accepted" })}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: b.id, status: "rejected" })}>Reject</Button>
                  </>}
                  {b.status === "accepted" && <PickupCheck bookingId={b.id} childName={b.child_name} />}
                  {b.status === "accepted" && (today >= b.end_date
                    ? <Button size="sm" variant="secondary" onClick={() => setStatus.mutate({ id: b.id, status: "completed" })}>Mark done</Button>
                    : <span className="text-xs text-muted-foreground">Done after {b.end_date}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PickupCheck({ bookingId, childName }: { bookingId: string; childName: string }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const check = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("verify_pickup_code", { _booking_id: bookingId, _code: code });
      if (error) throw error;
      return data;
    },
    onSuccess: (match) => {
      if (match) { toast.success(`PIN matches — OK to hand over ${childName}`); setOpen(false); setCode(""); }
      else toast.error("PIN doesn't match. Don't hand over the child — call the parent.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Check PIN</Button></DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Check pickup PIN · {childName}</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); check.mutate(); }}>
          <Label htmlFor={`pin-${bookingId}`}>PIN shown on the parent's pass</Label>
          <Input id={`pin-${bookingId}`} inputMode="numeric" autoComplete="off" maxLength={4} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
          <Button type="submit" variant="hero" className="w-full" disabled={check.isPending || code.length !== 4}>Check</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function CenterForm({ center }: { center?: Center }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    name: center?.name ?? "", city: center?.city ?? "", address: center?.address ?? "", description: center?.description ?? "",
    is_24x7: center?.is_24x7 ?? false, timings: center?.timings ?? ["day"], age_groups: center?.age_groups ?? ["toddler"],
    capacity: center?.capacity ?? 10, hourly_price: center?.hourly_price ?? 200, daily_price: center?.daily_price ?? 1200, monthly_price: center?.monthly_price ?? 15000,
    safety: (center?.safety_measures ?? []).join(", "), certs: (center?.certifications ?? []).join(", "),
  });
  const toggle = (k: "timings" | "age_groups", v: string) =>
    setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });

  const [photo, setPhoto] = useState<File | null>(null);
  const save = useMutation({
    mutationFn: async () => {
      const row = {
        name: f.name, city: f.city, address: f.address, description: f.description, is_24x7: f.is_24x7,
        timings: f.timings, age_groups: f.age_groups, capacity: f.capacity,
        hourly_price: f.hourly_price, daily_price: f.daily_price, monthly_price: f.monthly_price,
        safety_measures: list(f.safety), certifications: list(f.certs),
      };
      const { data: saved, error } = center
        ? await supabase.from("centers").update(row).eq("id", center.id).select("id").single()
        : await supabase.from("centers").insert({ ...row, owner_id: user!.id, image_key: `center-${1 + Math.floor(Math.random() * 4)}` }).select("id").single();
      if (error) throw error;
      if (photo) {
        // Photos live in the center's own folder; the database only accepts paths inside it.
        const path = `${saved.id}/${Date.now()}.${photo.name.split(".").pop()?.toLowerCase() || "jpg"}`;
        const up = await supabase.storage.from("center-photos").upload(path, photo, { contentType: photo.type });
        if (up.error) throw new Error(`Center saved, but the photo didn't upload: ${up.error.message}`);
        const { error: photoError } = await supabase.from("centers").update({ photo_path: path }).eq("id", saved.id);
        if (photoError) throw photoError;
        if (center?.photo_path) await supabase.storage.from("center-photos").remove([center.photo_path]);
      }
    },
    onSuccess: () => {
      const needsReview = center?.status === "approved" && (
        f.name !== center.name || f.address !== center.address || f.city !== center.city || list(f.certs).join() !== center.certifications.join()
      );
      toast.success(!center ? "Center submitted for verification" : needsReview ? "Saved — name, address, city or certification changes need admin re-approval" : "Center updated");
      setOpen(false);
      setPhoto(null);
      qc.invalidateQueries({ queryKey: ["centers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: Number(e.target.value) || 0 });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant={center ? "outline" : "hero"}>{center ? "Edit" : "Add center"}</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{center ? "Edit center" : "New center"}</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <div className="space-y-1"><Label>Name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>City</Label><Input required value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></div>
            <div className="space-y-1"><Label>Capacity / day</Label><Input type="number" min={1} value={f.capacity} onChange={num("capacity")} /></div>
          </div>
          <div className="space-y-1"><Label>Address</Label><Input required value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
          <div className="space-y-1"><Label>Description</Label><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><Switch checked={f.is_24x7} onCheckedChange={(v) => setF({ ...f, is_24x7: v })} /> Open 24×7</label>
          <div className="flex flex-wrap gap-4 text-sm">{TIMINGS.map((t) => <label key={t.value} className="flex items-center gap-2"><Checkbox checked={f.timings.includes(t.value)} onCheckedChange={() => toggle("timings", t.value)} />{t.label}</label>)}</div>
          <div className="flex flex-wrap gap-4 text-sm">{AGE_GROUPS.map((t) => <label key={t.value} className="flex items-center gap-2"><Checkbox checked={f.age_groups.includes(t.value)} onCheckedChange={() => toggle("age_groups", t.value)} />{t.label}</label>)}</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label>₹ / hour</Label><Input type="number" min={0} value={f.hourly_price} onChange={num("hourly_price")} /></div>
            <div className="space-y-1"><Label>₹ / day</Label><Input type="number" min={0} value={f.daily_price} onChange={num("daily_price")} /></div>
            <div className="space-y-1"><Label>₹ / month</Label><Input type="number" min={0} value={f.monthly_price} onChange={num("monthly_price")} /></div>
          </div>
          <div className="space-y-1"><Label>Safety measures (comma separated)</Label><Input value={f.safety} onChange={(e) => setF({ ...f, safety: e.target.value })} /></div>
          <div className="space-y-1"><Label>Certifications (comma separated)</Label><Input value={f.certs} onChange={(e) => setF({ ...f, certs: e.target.value })} /></div>
          <div className="space-y-1">
            <Label htmlFor={`photo-${center?.id ?? "new"}`}>{center?.photo_path ? "Replace photo" : "Center photo"}</Label>
            <Input id={`photo-${center?.id ?? "new"}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file && file.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5 MB"); e.target.value = ""; return; }
              setPhoto(file);
            }} />
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP, up to 5 MB. A bright photo of your play area works best.</p>
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={save.isPending}>Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CaregiverForm({ centerId }: { centerId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", role: "Caregiver", experience_years: 1, bio: "" });
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("caregivers").insert({ ...f, center_id: centerId });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Caregiver added — awaiting verification"); setOpen(false); setF({ name: "", role: "Caregiver", experience_years: 1, bio: "" }); qc.invalidateQueries({ queryKey: ["caregivers"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="secondary">Add caregiver</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add caregiver</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <div className="space-y-1"><Label>Name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Role</Label><Input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} /></div>
            <div className="space-y-1"><Label>Years experience</Label><Input type="number" min={0} value={f.experience_years} onChange={(e) => setF({ ...f, experience_years: Number(e.target.value) || 0 })} /></div>
          </div>
          <div className="space-y-1"><Label>Short bio</Label><Textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></div>
          <Button type="submit" variant="hero" className="w-full" disabled={save.isPending}>Add</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
