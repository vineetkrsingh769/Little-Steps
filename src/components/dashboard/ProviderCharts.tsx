import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { inr } from "@/lib/centers";

type BookingLite = { status: string; start_date: string; total_price: number };

const STATUSES = ["pending", "accepted", "completed", "rejected", "cancelled"] as const;
const earningsConfig = { earnings: { label: "Earnings", color: "var(--primary)" } } satisfies ChartConfig;
const statusConfig = { count: { label: "Bookings", color: "var(--primary)" } } satisfies ChartConfig;

/** Earnings per month (accepted + completed, by start month) and bookings per status. */
export function ProviderCharts({ bookings }: { bookings: BookingLite[] }) {
  const byMonth = new Map<string, number>();
  for (const b of bookings) {
    if (b.status !== "accepted" && b.status !== "completed") continue;
    const m = b.start_date.slice(0, 7);
    byMonth.set(m, (byMonth.get(m) ?? 0) + b.total_price);
  }
  const earnings = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([m, earnings]) => ({
      month: new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      earnings,
    }));
  const statuses = STATUSES.map((s) => ({ status: s.charAt(0).toUpperCase() + s.slice(1), count: bookings.filter((b) => b.status === s).length }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <figure className="rounded-3xl border bg-card p-5 shadow-card">
        <figcaption className="mb-3 font-semibold">Earnings per month</figcaption>
        {earnings.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No accepted bookings yet.</p>
        ) : (
          <ChartContainer config={earningsConfig} className="aspect-auto h-56 w-full">
            <BarChart data={earnings} margin={{ left: 4, right: 4 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => inr(v)} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => inr(Number(v))} />} />
              <Bar dataKey="earnings" fill="var(--color-earnings)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ChartContainer>
        )}
      </figure>
      <figure className="rounded-3xl border bg-card p-5 shadow-card">
        <figcaption className="mb-3 font-semibold">Bookings by status</figcaption>
        <ChartContainer config={statusConfig} className="aspect-auto h-56 w-full">
          <BarChart data={statuses} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="status" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ChartContainer>
      </figure>
    </div>
  );
}
