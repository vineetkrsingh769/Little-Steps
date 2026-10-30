import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Award, BadgeCheck, Clock, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FavoriteButton } from "@/components/FavoriteButton";
import { RatingBadge, formatCenterName } from "@/components/CenterCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AGE_GROUPS, PLANS, inr, label, photoFor, priceFor, type Center } from "@/lib/centers";

export const Route = createFileRoute("/centers/$id")({
  head: () => ({
    meta: [
      { title: "Center details — Little Steps" },
      { name: "description", content: "Caregivers, safety measures, certifications and pricing for this childcare center." },
      { property: "og:title", content: "Center details — Little Steps" },
      { property: "og:description", content: "View caregivers, safety and pricing, then book a slot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CenterPage,
});

function CenterPage() {
  const { id } = Route.useParams();
  const { data: c, isLoading } = useQuery({
    queryKey: ["center", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("centers").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: caregivers } = useQuery({
    queryKey: ["caregivers", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("caregivers").select("*").eq("center_id", id);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <main className="mx-auto max-w-6xl px-4 py-16 text-muted-foreground">Loading…</main>;
  if (!c) return <main className="mx-auto max-w-6xl px-4 py-16">This center isn't available. <Link to="/centers" className="text-primary underline">Browse centers</Link></main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <img src={photoFor(c)} alt={c.name} width={1024} height={768} className="aspect-[16/9] w-full rounded-[2rem] object-cover shadow-soft" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {c.is_24x7 && <Badge className="rounded-full">Open 24×7</Badge>}
              {c.status !== "approved" && <Badge variant="outline" className="rounded-full capitalize">{c.status}</Badge>}
              <RatingBadge rating={c.rating} />
              <FavoriteButton centerId={c.id} />
            </div>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">{formatCenterName(c.name)}</h1>
            <p className="mt-2 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{[c.address, c.city].filter(Boolean).join(", ")}</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name}, ${c.address}, ${c.city}`)}`} target="_blank" rel="noreferrer">
                <MapPin className="h-4 w-4" /> Get directions
              </a>
            </Button>
            <p className="mt-4 text-lg leading-relaxed">{c.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Info icon={Clock} title="Timings" items={c.timings.map((t) => t.charAt(0).toUpperCase() + t.slice(1))} />
            <Info icon={Users} title="Age groups" items={c.age_groups.map((a) => label(AGE_GROUPS, a))} />
            <Info icon={Users} title="Capacity" items={[`${c.capacity} children / day`]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Info icon={ShieldCheck} title="Safety measures" items={c.safety_measures} />
            <Info icon={Award} title="Certifications" items={c.certifications} />
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">Caregivers</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {caregivers?.map((g) => (
                <div key={g.id} className="flex gap-4 rounded-3xl border bg-card p-5 shadow-card">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-peach font-display font-semibold text-accent-foreground">{g.name[0]}</div>
                  <div>
                    <p className="flex items-center gap-1 font-semibold">{g.name}{g.verified && <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified" />}</p>
                    <p className="text-sm text-muted-foreground">{g.role} · {g.experience_years} yrs experience</p>
                    <p className="mt-1 text-sm">{g.bio}</p>
                  </div>
                </div>
              ))}
              {caregivers?.length === 0 && <p className="text-muted-foreground">Caregiver profiles coming soon.</p>}
            </div>
          </div>
          <Reviews centerId={c.id} />
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingCard c={c} />
        </aside>
      </div>
    </main>
  );
}

function Info({ icon: Icon, title, items }: { icon: typeof Clock; title: string; items: string[] }) {
  return (
    <div className="rounded-3xl bg-secondary p-5">
      <p className="mb-2 flex items-center gap-2 font-semibold"><Icon className="h-4 w-4 text-primary" />{title}</p>
      {items.length > 0
        ? <ul className="space-y-1 text-sm text-secondary-foreground">{items.map((i) => <li key={i}>• {i}</li>)}</ul>
        : <p className="text-sm text-muted-foreground">Not listed yet</p>}
    </div>
  );
}

function BookingCard({ c }: { c: Center }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const { data: children = [] } = useQuery({
    queryKey: ["children", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("children").select("id, name, age_group").eq("parent_id", user!.id).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const [plan, setPlan] = useState("hourly");
  const [qty, setQty] = useState(4);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("09:00");
  const [child, setChild] = useState("");
  const [age, setAge] = useState(c.age_groups[0] ?? "toddler");
  const [notes, setNotes] = useState("");
  const unit = PLANS.find((p) => p.value === plan)?.unit ?? "hours";
  // Free seats on the busiest day of the chosen dates (counts accepted bookings only).
  const { data: seats } = useQuery({
    queryKey: ["seats", c.id, plan, date, qty],
    enabled: c.status === "approved" && !!date,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("seats_left", { _center_id: c.id, _plan: plan, _start: date, _quantity: qty });
      if (error) throw error;
      return data;
    },
  });
  const full = seats === 0;

  const book = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to book care.");
      const { error } = await supabase.from("bookings").insert({
        center_id: c.id, parent_id: user.id, child_name: child, age_group: age,
        plan, quantity: qty, start_date: date, start_time: time, notes,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Booking request sent! The center will confirm shortly."); navigate({ to: "/dashboard" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 rounded-[2rem] border bg-card p-6 shadow-soft">
      <div className="grid grid-cols-3 gap-2 text-center">
        {PLANS.map((p) => (
          <button key={p.value} type="button" onClick={() => { setPlan(p.value); setQty(p.value === "hourly" ? 4 : 1); }}
            className={`rounded-2xl p-3 transition ${plan === p.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            <p className="text-xs">{p.label}</p>
            <p className="font-display font-semibold">{inr(p.value === "hourly" ? c.hourly_price : p.value === "daily" ? c.daily_price : c.monthly_price)}</p>
          </button>
        ))}
      </div>
      {c.status !== "approved" ? (
        <p role="status" className="rounded-2xl bg-warning/20 px-4 py-2 text-sm font-medium text-warning-foreground">
          This center is awaiting administrator approval.
        </p>
      ) : !date ? (
        <p role="status" className="rounded-2xl bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground">
          📅 Choose a start date to check live seat availability
        </p>
      ) : seats != null && (
        <p role="status" className={`rounded-2xl px-4 py-2 text-sm font-medium ${full ? "bg-destructive text-destructive-foreground" : "bg-success/15 text-success font-semibold"}`}>
          {full ? "⚠️ Fully booked for these dates — please try another date" : `✓ ${seats} of ${c.capacity} seats available for these dates`}
        </p>
      )}
      {!user ? (
        <Button asChild variant="hero" size="lg" className="w-full"><Link to="/auth">Sign in to book</Link></Button>
      ) : (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); book.mutate(); }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Start date</Label><Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required /></div>
            <div className="space-y-1"><Label>Drop-off</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
          </div>
          <div className="space-y-1"><Label>Number of {unit}</Label><Input type="number" min={1} max={plan === "hourly" ? 24 : 12} value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} /></div>
          {children.length > 0 && (
            <div className="space-y-1"><Label htmlFor="saved-child">Use a saved child</Label>
              <Select onValueChange={(id) => {
                const ch = children.find((x) => x.id === id);
                if (ch) {
                  setChild(ch.name);
                  if (c.age_groups.includes(ch.age_group)) setAge(ch.age_group);
                }
              }}>
                <SelectTrigger id="saved-child"><SelectValue placeholder="Choose a child" /></SelectTrigger>
                <SelectContent>{children.map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label htmlFor="child-name">Child's name</Label><Input id="child-name" value={child} onChange={(e) => setChild(e.target.value)} required maxLength={60} /></div>
            <div className="space-y-1"><Label>Age group</Label>
              <Select value={age} onValueChange={setAge}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AGE_GROUPS.filter((a) => c.age_groups.includes(a.value)).map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1"><Label>Notes for caregivers</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Allergies, routines…" /></div>
          <div className="flex items-center justify-between rounded-2xl bg-accent px-4 py-3 text-accent-foreground">
            <span>Estimated total</span><span className="font-display text-xl font-bold">{inr(priceFor(c, plan, qty))}</span>
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={book.isPending || c.status !== "approved" || full}>
            {book.isPending ? "Sending…" : "Request booking"}
          </Button>
        </form>
      )}
    </div>
  );
}

function Reviews({ centerId }: { centerId: string }) {
  const { user } = useAuth();
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", centerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").eq("center_id", centerId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: completed = [] } = useQuery({
    queryKey: ["bookings", "completed", centerId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("id").eq("center_id", centerId).eq("parent_id", user!.id).eq("status", "completed");
      if (error) throw error;
      return data;
    },
  });
  const mine = reviews.find((r) => r.parent_id === user?.id);
  const canReview = !!user && completed.length > 0 && !mine;
  const ref = useRef<HTMLDivElement>(null);
  // "Leave a review" in My bookings links here with #reviews; scroll once the section has content.
  useEffect(() => {
    if (window.location.hash === "#reviews") ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [canReview, reviews.length]);

  return (
    <div id="reviews" ref={ref} className="scroll-mt-24">
      <h2 className="mb-4 text-2xl font-bold">Reviews</h2>
      {canReview && <ReviewForm centerId={centerId} />}
      {mine && <p className="mb-4 rounded-3xl bg-secondary p-4 text-sm text-secondary-foreground">You already shared {mine.rating} star{mine.rating > 1 ? "s" : ""} for this center — thank you!</p>}
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-3xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{r.reviewer_name}</p>
              <span className="flex items-center gap-1 text-sm font-medium"><Star className="h-4 w-4 fill-warning text-warning" />{r.rating}</span>
            </div>
            {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}
      </div>
    </div>
  );
}

function ReviewForm({ centerId }: { centerId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const save = useMutation({
    mutationFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle();
      const { error } = await supabase.from("reviews").insert({
        center_id: centerId, parent_id: user!.id, rating, comment,
        reviewer_name: profile?.full_name?.trim() || "Parent",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks for your review!");
      setRating(0);
      setComment("");
      qc.invalidateQueries({ queryKey: ["reviews", centerId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form className="mb-6 space-y-3 rounded-3xl border bg-card p-5 shadow-card" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <p className="font-semibold">Share your experience</p>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}>
            <Star className={`h-6 w-6 transition ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
      <Textarea required maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the care?" aria-label="Review comment" />
      <Button type="submit" variant="hero" disabled={save.isPending || rating === 0}>{save.isPending ? "Posting…" : "Post review"}</Button>
    </form>
  );
}
