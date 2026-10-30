import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  Baby,
  Filter,
  LocateFixed,
  Moon,
  RotateCcw,
  Search,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CenterCard } from "@/components/CenterCard";
import { CenterSkeletonGrid } from "@/components/centers/CenterSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { AGE_GROUPS, TIMINGS, inr } from "@/lib/centers";
import { toast } from "sonner";

export const Route = createFileRoute("/centers/")({
  validateSearch: z.object({
    city: z.string().optional(),
    timing: z.string().optional(),
    age: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Find Daycare & Crèche Centers — Little Steps" },
      { name: "description", content: "Filter verified childcare centers by 24×7 availability, age group, timing and price with zero overbooking." },
      { property: "og:title", content: "Find Daycare & Crèche Centers — Little Steps" },
      { property: "og:description", content: "Compare verified 24×7 childcare centers near you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CentersPage,
});

export function CentersPage() {
  const search = Route.useSearch();
  const [city, setCity] = useState(search.city ?? "");
  const [only247, setOnly247] = useState(false);
  const [onlyInfant, setOnlyInfant] = useState(false);
  const [onlyCctv, setOnlyCctv] = useState(false);
  const [onlyTopRated, setOnlyTopRated] = useState(false);
  const [age, setAge] = useState(search.age ?? "any");
  const [timing, setTiming] = useState(search.timing ?? "any");
  const [maxHourly, setMaxHourly] = useState(400);
  const [sortBy, setSortBy] = useState<"rating" | "price-asc" | "price-desc" | "capacity">("rating");
  const [locating, setLocating] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["centers", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("centers")
        .select("*")
        .eq("status", "approved")
        .order("rating", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Geolocation quick helper
  function detectNearMe() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        const cities = [
          { name: "Pune", lat: 18.5204, lng: 73.8567 },
          { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
          { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
          { name: "Delhi", lat: 28.7041, lng: 77.1025 },
        ];
        let closest = cities[0];
        let minDist = Infinity;
        for (const c of cities) {
          const d = Math.hypot(c.lat - latitude, c.lng - longitude);
          if (d < minDist) {
            minDist = d;
            closest = c;
          }
        }
        if (closest) {
          setCity(closest.name);
          toast.success(`Showing verified daycares near ${closest.name}`);
        }
      },
      () => {
        setLocating(false);
        toast.error("Could not access location. Please type your city.");
      },
      { timeout: 8000 }
    );
  }

  function resetFilters() {
    setCity("");
    setOnly247(false);
    setOnlyInfant(false);
    setOnlyCctv(false);
    setOnlyTopRated(false);
    setAge("any");
    setTiming("any");
    setMaxHourly(400);
    setSortBy("rating");
  }

  const hasActiveFilters = Boolean(
    city ||
      only247 ||
      onlyInfant ||
      onlyCctv ||
      onlyTopRated ||
      age !== "any" ||
      timing !== "any" ||
      maxHourly < 400
  );

  const activeFilterCount =
    (city ? 1 : 0) +
    (only247 ? 1 : 0) +
    (onlyInfant ? 1 : 0) +
    (onlyCctv ? 1 : 0) +
    (onlyTopRated ? 1 : 0) +
    (age !== "any" ? 1 : 0) +
    (timing !== "any" ? 1 : 0) +
    (maxHourly < 400 ? 1 : 0);

  const filtered = useMemo(() => {
    let result = (data ?? []).filter((c) => {
      const matchCity = !city || [c.city, c.address, c.name].some((v) => v.toLowerCase().includes(city.toLowerCase()));
      const match247 = !only247 || c.is_24x7;
      const matchInfant = !onlyInfant || c.age_groups.includes("infant");
      const matchCctv = !onlyCctv || c.safety_measures.some((s) => s.toLowerCase().includes("cctv"));
      const matchRating = !onlyTopRated || Number(c.rating) >= 4.5;
      const matchAge = age === "any" || c.age_groups.includes(age);
      const matchTiming = timing === "any" || c.timings.includes(timing);
      const matchPrice = c.hourly_price <= maxHourly;

      return matchCity && match247 && matchInfant && matchCctv && matchRating && matchAge && matchTiming && matchPrice;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "rating") return Number(b.rating) - Number(a.rating);
      if (sortBy === "price-asc") return a.hourly_price - b.hourly_price;
      if (sortBy === "price-desc") return b.hourly_price - a.hourly_price;
      if (sortBy === "capacity") return b.capacity - a.capacity;
      return 0;
    });

    return result;
  }, [data, city, only247, onlyInfant, onlyCctv, onlyTopRated, age, timing, maxHourly, sortBy]);

  // Reusable filter controls block used in desktop sidebar & mobile accordion
  const filterControls = (
    <div className="space-y-6">
      {/* Search & Near me */}
      <div className="space-y-2">
        <Label htmlFor="search-input" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Location or Center
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City, area, or name..."
            className="pl-9 pr-8 h-9 text-sm rounded-xl"
          />
          {city && (
            <button
              onClick={() => setCity("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear location search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={detectNearMe}
          disabled={locating}
          className="w-full rounded-xl text-xs gap-1.5 h-8 font-medium hover:border-primary/50"
        >
          <LocateFixed className="h-3.5 w-3.5 text-primary" />
          <span>{locating ? "Detecting location…" : "Detect Near Me"}</span>
        </Button>
      </div>

      {/* Quick Pills */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Highlights
        </Label>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="sm"
            variant={only247 ? "default" : "outline"}
            onClick={() => setOnly247(!only247)}
            className="justify-start text-xs rounded-xl h-8.5 font-medium transition-all"
          >
            <Moon className="h-3.5 w-3.5 mr-2" />
            <span>Open 24×7</span>
            {only247 && <span className="ml-auto text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded-full">On</span>}
          </Button>

          <Button
            type="button"
            size="sm"
            variant={onlyInfant ? "default" : "outline"}
            onClick={() => setOnlyInfant(!onlyInfant)}
            className="justify-start text-xs rounded-xl h-8.5 font-medium transition-all"
          >
            <Baby className="h-3.5 w-3.5 mr-2" />
            <span>Infant Care (0–1 yr)</span>
            {onlyInfant && <span className="ml-auto text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded-full">On</span>}
          </Button>

          <Button
            type="button"
            size="sm"
            variant={onlyCctv ? "default" : "outline"}
            onClick={() => setOnlyCctv(!onlyCctv)}
            className="justify-start text-xs rounded-xl h-8.5 font-medium transition-all"
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-2" />
            <span>Live CCTV Monitored</span>
            {onlyCctv && <span className="ml-auto text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded-full">On</span>}
          </Button>

          <Button
            type="button"
            size="sm"
            variant={onlyTopRated ? "default" : "outline"}
            onClick={() => setOnlyTopRated(!onlyTopRated)}
            className="justify-start text-xs rounded-xl h-8.5 font-medium transition-all"
          >
            <Star className="h-3.5 w-3.5 mr-2 fill-warning text-warning" />
            <span>Top Rated (4.5★ & up)</span>
            {onlyTopRated && <span className="ml-auto text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded-full">On</span>}
          </Button>
        </div>
      </div>

      {/* Hourly Price Range Slider */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Max Hourly Budget
          </Label>
          <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
            {inr(maxHourly)}/hr
          </span>
        </div>
        <Slider
          min={100}
          max={400}
          step={10}
          value={[maxHourly]}
          onValueChange={(v) => setMaxHourly(v[0] ?? 400)}
          className="py-1"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
          <span>₹100/hr</span>
          <span>₹400/hr</span>
        </div>
      </div>

      {/* Age Group Selector */}
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Age Group
        </Label>
        <Select value={age} onValueChange={setAge}>
          <SelectTrigger className="rounded-xl h-9 text-xs">
            <SelectValue placeholder="Any age" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any age group</SelectItem>
            {AGE_GROUPS.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timing Shift Selector */}
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Timing Shift
        </Label>
        <Select value={timing} onValueChange={setTiming}>
          <SelectTrigger className="rounded-xl h-9 text-xs">
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any time shift</SelectItem>
            {TIMINGS.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Page Title & Top Summary */}
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Find Childcare Near You</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search verified crèches and 24×7 daycares with real-time seat availability.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center gap-3 lg:hidden mt-2">
          <Button
            type="button"
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="rounded-xl gap-2 text-xs h-9 w-full sm:w-auto"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</span>
          </Button>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs h-9 text-muted-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Collapsible Filter Drawer / Accordion */}
      {mobileFilterOpen && (
        <div className="mb-6 rounded-3xl border bg-card p-5 shadow-card lg:hidden animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filter Centers
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMobileFilterOpen(false)}
              className="h-7 w-7 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {filterControls}
          <Button
            type="button"
            className="w-full mt-4 rounded-xl text-xs font-semibold"
            onClick={() => setMobileFilterOpen(false)}
          >
            Show {filtered.length} Results
          </Button>
        </div>
      )}

      {/* Main Two-Column Layout: Left Sidebar + Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-8 items-start">
        {/* Left Sticky Sidebar (Desktop) */}
        <aside className="sticky top-20 hidden lg:block rounded-3xl border bg-card p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-3 border-b">
            <h2 className="font-bold text-base flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="text-[11px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </h2>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>

          {filterControls}
        </aside>

        {/* Right Content Column */}
        <section className="min-w-0 space-y-5">
          {/* Results Bar: Result Count + Active Tags + Sort Dropdown */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border bg-card/60 p-3.5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {isLoading ? "Searching…" : `${filtered.length} verified centers`}
              </span>

              {/* Active Filter Tags */}
              {city && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-semibold">
                  <span>{city}</span>
                  <button onClick={() => setCity("")} className="hover:opacity-75">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {only247 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-[11px] font-semibold">
                  <span>24×7</span>
                  <button onClick={() => setOnly247(false)} className="hover:opacity-75">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {onlyInfant && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-[11px] font-semibold">
                  <span>Infant</span>
                  <button onClick={() => setOnlyInfant(false)} className="hover:opacity-75">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {onlyCctv && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-[11px] font-semibold">
                  <span>CCTV</span>
                  <button onClick={() => setOnlyCctv(false)} className="hover:opacity-75">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {onlyTopRated && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-[11px] font-semibold">
                  <span>4.5★+</span>
                  <button onClick={() => setOnlyTopRated(false)} className="hover:opacity-75">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {age !== "any" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-[11px] font-semibold capitalize">
                  <span>{age}</span>
                  <button onClick={() => setAge("any")} className="hover:opacity-75">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {timing !== "any" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-[11px] font-semibold capitalize">
                  <span>{timing}</span>
                  <button onClick={() => setTiming("any")} className="hover:opacity-75">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {maxHourly < 400 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-[11px] font-semibold">
                  <span>≤ {inr(maxHourly)}/hr</span>
                  <button onClick={() => setMaxHourly(400)} className="hover:opacity-75">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">Sort:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[160px] h-8 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="capacity">Largest Capacity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Grid */}
          <div>
            {isLoading ? (
              <CenterSkeletonGrid count={6} />
            ) : filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {filtered.map((c) => (
                  <CenterCard key={c.id} c={c} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed bg-secondary/30 p-12 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground mb-4">
                  <SearchX className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold">No centers match your filters</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your maximum hourly budget, expanding the age group, or clearing active filter chips.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="mt-5 rounded-full gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" /> Reset all filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
