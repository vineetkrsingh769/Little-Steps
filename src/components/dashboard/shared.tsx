import { Badge } from "@/components/ui/badge";

const tone: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  accepted: "bg-success text-success-foreground",
  approved: "bg-success text-success-foreground",
  completed: "bg-secondary text-secondary-foreground",
  rejected: "bg-destructive text-destructive-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export function StatusBadge({ s }: { s: string }) {
  return <Badge className={`rounded-full capitalize ${tone[s] ?? ""}`}>{s}</Badge>;
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-secondary p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">{children}</div>;
}
