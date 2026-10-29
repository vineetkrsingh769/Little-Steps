import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/centers";

type Props = {
  b: { id: string; child_name: string; age_group: string; start_date: string; start_time: string; plan: string; quantity: number; total_price: number };
  center?: { name: string; city: string; address?: string } | null;
};

export function PickupPass({ b, center }: Props) {
  const [open, setOpen] = useState(false);
  // Random code issued by the database when the center accepts; only the parent can read it.
  const { data: code, isLoading } = useQuery({
    queryKey: ["pickup-code", b.id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.from("booking_pickup_codes").select("code").eq("booking_id", b.id).maybeSingle();
      if (error) throw error;
      return data?.code ?? null;
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">View pass</Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Booking pass</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="rounded-2xl bg-secondary p-4 text-center">
            <p className="text-muted-foreground">Pickup PIN — share only with the center at pickup</p>
            <p className="font-display text-4xl font-bold tracking-[0.4em]">{isLoading ? "····" : code ?? "—"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Ref {b.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <dl className="grid grid-cols-2 gap-2">
            <dt className="text-muted-foreground">Child</dt><dd>{b.child_name} ({b.age_group})</dd>
            <dt className="text-muted-foreground">Center</dt><dd>{center?.name}</dd>
            <dt className="text-muted-foreground">Address</dt><dd>{center?.address ? `${center.address}, ` : ""}{center?.city}</dd>
            <dt className="text-muted-foreground">Drop-off</dt><dd>{b.start_date} at {b.start_time.slice(0, 5)}</dd>
            <dt className="text-muted-foreground">Plan</dt><dd className="capitalize">{b.plan} × {b.quantity}</dd>
            <dt className="text-muted-foreground">Amount due</dt><dd className="font-semibold">{inr(b.total_price)}</dd>
          </dl>
          <p className="rounded-xl border p-3 text-xs text-muted-foreground">Pay at the center on arrival (UPI or cash). Bring your child's ID and any medicines with written instructions.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>Print / Save</Button>
            {center && (
              <Button asChild variant="outline" className="flex-1">
                <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.name}, ${center.address ?? ""} ${center.city}`)}`}>Directions</a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
