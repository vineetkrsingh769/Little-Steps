import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BadgeCheck, CalendarClock, Moon, Search, ShieldCheck } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CenterCard } from "@/components/CenterCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Little Steps — Trusted 24×7 Childcare Near You" },
      { name: "description", content: "Search verified crèches and daycare centers open day, night and for emergencies. Book hourly, daily or monthly." },
      { property: "og:title", content: "Little Steps — Trusted 24×7 Childcare" },
      { property: "og:description", content: "Verified caregivers, real-time availability and flexible plans for working parents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: ShieldCheck, title: "Verified & safe", text: "Every center and caregiver is document-checked by our team." },
  { icon: Moon, title: "Round the clock", text: "Night-shift and emergency drop-ins, not just 9 to 5." },
  { icon: CalendarClock, title: "Flexible plans", text: "Book by the hour, the day, or subscribe monthly." },
  { icon: BadgeCheck, title: "Clear pricing", text: "Transparent rates and safety standards before you book." },
];

function Index() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const { data: centers } = useQuery({
    queryKey: ["centers", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase.from("centers").select("*").eq("status", "approved").order("rating", { ascending: false }).limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <main>
      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-10 pt-6 md:grid-cols-2 md:pb-12 md:pt-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">Childcare you can trust, <span className="text-primary">any hour</span> of the day.</h1>
            <p className="max-w-md text-lg text-muted-foreground">Find verified crèches and caregivers near you — for day shifts, night shifts and last-minute emergencies.</p>
            <form
              className="flex max-w-md gap-2 rounded-full bg-card p-2 shadow-soft"
              onSubmit={(e) => { e.preventDefault(); navigate({ to: "/centers", search: { city } }); }}
            >
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city, e.g. Pune" className="border-0 shadow-none focus-visible:ring-0" />
              <Button type="submit" variant="hero"><Search /> Search</Button>
            </form>
          </div>
          <img src={hero} alt="Caregiver playing with toddlers at a daycare" width={1600} height={1008} className="w-full rounded-[2rem] object-cover shadow-soft" />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-3xl bg-secondary p-6">
            <f.icon className="mb-3 h-7 w-7 text-primary" />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-bold">Top-rated centers</h2>
          <Button asChild variant="link"><Link to="/centers">See all →</Link></Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {centers?.map((c) => <CenterCard key={c.id} c={c} />)}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-accent p-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-accent-foreground">Run a crèche or daycare?</h2>
            <p className="mt-1 text-accent-foreground/80">List your center, manage slots and grow with Little Steps.</p>
          </div>
          <Button asChild variant="hero" size="lg"><Link to="/auth" search={{ mode: "signup", type: "provider" }}>Become a provider</Link></Button>
        </div>
      </section>
    </main>
  );
}
