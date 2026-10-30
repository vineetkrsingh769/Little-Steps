import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BadgeCheck, CalendarClock, Moon, Search, ShieldCheck, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CenterCard } from "@/components/CenterCard";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { FaqSection } from "@/components/home/FaqSection";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Little Steps — Trusted 24×7 Childcare & Daycare Platform" },
      { name: "description", content: "Search verified crèches and daycare centers open day, night and for emergencies. Book hourly, daily or monthly with zero overbooking." },
      { property: "og:title", content: "Little Steps — Trusted 24×7 Childcare" },
      { property: "og:description", content: "Verified caregivers, real-time availability and flexible plans for working parents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: ShieldCheck, title: "100% Verified & Safe", text: "Every center license and caregiver undergoes mandatory police and background checks." },
  { icon: Moon, title: "True 24×7 Availability", text: "Late night shifts, rotational hospital rosters, and emergency drop-ins." },
  { icon: CalendarClock, title: "Zero Overbooking", text: "Automated database capacity guards lock your seat across all dates." },
  { icon: BadgeCheck, title: "Transparent Pricing", text: "Fixed system-calculated hourly, daily, and monthly rates with no hidden fees." },
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
      {/* Hero Section */}
      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-6 md:grid-cols-2 md:pb-16 md:pt-10">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl text-foreground">
              Childcare you can trust, <span className="text-primary">any hour</span> of the day.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Find verified crèches and caregivers near you — for day shifts, overnight hospital rotations, and last-minute emergencies.
            </p>

            <form
              className="flex max-w-md gap-2 rounded-full bg-card p-2 shadow-soft border"
              onSubmit={(e) => { e.preventDefault(); navigate({ to: "/centers", search: { city } }); }}
            >
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search city, e.g. Bengaluru, Pune..."
                className="border-0 shadow-none focus-visible:ring-0 text-sm"
              />
              <Button type="submit" variant="hero" className="rounded-full px-5">
                <Search className="h-4 w-4" /> Search
              </Button>
            </form>
          </div>

          <div className="relative">
            <img
              src={hero}
              alt="Caregiver playing with toddlers at a daycare"
              width={1600}
              height={1008}
              className="w-full rounded-[2rem] object-cover shadow-soft border"
            />
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-3xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-soft hover:-translate-y-1">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary mb-4">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>

      {/* How Little Steps Works (3-Step Guide) */}
      <HowItWorks />

      {/* Top-Rated Daycares */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">Handpicked Quality</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Top-Rated Centers Near You</h2>
          </div>
          <Button asChild variant="link" className="text-base font-semibold">
            <Link to="/centers">Browse all centers →</Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {centers?.map((c) => <CenterCard key={c.id} c={c} />)}
        </div>
      </section>

      {/* Parent Testimonials */}
      <Testimonials />

      {/* FAQ Accordion */}
      <FaqSection />

      {/* Provider CTA Banner */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2.5rem] bg-accent p-10 md:flex-row md:items-center md:p-12 border">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-peach/40 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>For Childcare Providers</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-accent-foreground">Run a verified crèche or daycare?</h2>
            <p className="mt-2 text-base leading-relaxed text-accent-foreground/85">
              Fill empty evening, weekend, and night slots. Manage bookings with zero overbooking risk and receive verified parent bookings directly.
            </p>
          </div>
          <Button asChild variant="hero" size="lg" className="rounded-full px-8 shrink-0">
            <Link to="/auth" search={{ mode: "signup", type: "provider" }}>
              List your center today
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
