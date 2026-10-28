import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CenterCard } from "@/components/CenterCard";
import { supabase } from "@/integrations/supabase/client";
import { AGE_GROUPS, TIMINGS, inr } from "@/lib/centers";

export const Route = createFileRoute("/centers/")({
  validateSearch: z.object({ city: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Find Daycare & Crèche Centers — Little Steps" },
      { name: "description", content: "Filter verified childcare centers by 24×7 availability, age group, timing and price." },
      { property: "og:title", content: "Find Daycare & Crèche Centers — Little Steps" },
      { property: "og:description", content: "Compare verified 24×7 childcare centers near you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CentersPage,
});

function CentersPage() {
  const search = Route.useSearch();
  const [city, setCity] = useState(search.city ?? "");
  const [only247, setOnly247] = useState(false);
  const [age, setAge] = useState("any");
  const [timing, setTiming] = useState("any");
  const [maxHourly, setMaxHourly] = useState(500);

  const { data, isLoading } = useQuery({
    queryKey: ["centers", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("centers").select("*").eq("status", "approved").order("rating", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (c) =>
          (!city || [c.city, c.address, c.name].some((v) => v.toLowerCase().includes(city.toLowerCase()))) &&
          (!only247 || c.is_24x7) &&
          (age === "any" || c.age_groups.includes(age)) &&
          (timing === "any" || c.timings.includes(timing)) &&
          c.hourly_price <= maxHourly,
      ),
    [data, city, only247, age, timing, maxHourly],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold md:text-4xl">Find childcare near you</h1>
      <div className="mt-6 grid gap-4 rounded-3xl border bg-card p-5 shadow-card md:grid-cols-5 md:items-end">
        <div className="space-y-1.5 md:col-span-1">
          <Label htmlFor="search">Search</Label>
          <Input id="search" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City, area or center name" />
        </div>
        <div className="space-y-1.5">
          <Label>Age group</Label>
          <Select value={age} onValueChange={setAge}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any age</SelectItem>
              {AGE_GROUPS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Timing</Label>
          <Select value={timing} onValueChange={setTiming}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              {TIMINGS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Up to {inr(maxHourly)}/hr</Label>
          <Slider min={100} max={500} step={10} value={[maxHourly]} onValueChange={(v) => setMaxHourly(v[0] ?? 500)} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <Switch checked={only247} onCheckedChange={setOnly247} /> Open 24×7 only
        </label>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{isLoading ? "Loading…" : `${filtered.length} centers found`}</p>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => <CenterCard key={c.id} c={c} />)}
      </div>
      {!isLoading && filtered.length === 0 && (
        <div className="mt-6 rounded-3xl bg-secondary p-10 text-center text-muted-foreground">No centers match these filters yet. Try widening your search.</div>
      )}
    </main>
  );
}
