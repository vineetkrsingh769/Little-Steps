import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageThread } from "@/components/MessageThread";
import { PickupPass } from "@/components/PickupPass";
import { ReportProblem } from "@/components/ReportProblem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { inr } from "@/lib/centers";
import { ChildrenTab } from "./ChildrenTab";
import { SavedTab } from "./SavedTab";
import { Empty, Stat, StatusBadge } from "./shared";

export function ParentDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [], isError } = useQuery({
    queryKey: ["bookings", "parent", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*, centers(name, city, address)").eq("parent_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: reviewed = [] } = useQuery({
    queryKey: ["reviews", "mine", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("center_id").eq("parent_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.center_id);
    },
  });
  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Booking cancelled"); qc.invalidateQueries({ queryKey: ["bookings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const subs = data.filter((b) => b.plan === "monthly" && b.status === "accepted");

  return (
    <Tabs defaultValue="bookings">
      <TabsList className="mb-6 flex-wrap">
        <TabsTrigger value="bookings">My bookings</TabsTrigger>
        <TabsTrigger value="children">My children</TabsTrigger>
        <TabsTrigger value="saved">Saved</TabsTrigger>
      </TabsList>
      <TabsContent value="bookings">
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Total bookings" value={data.length} />
            <Stat label="Awaiting confirmation" value={data.filter((b) => b.status === "pending").length} />
            <Stat label="Active subscriptions" value={subs.length} />
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Booking history</h2>
              <Button asChild variant="hero" size="sm"><Link to="/centers">Book care</Link></Button>
            </div>
            {isError ? <Empty>Couldn't load your bookings. Please refresh the page.</Empty> : data.length === 0 ? <Empty>No bookings yet. Find a center to get started.</Empty> : (
              <div className="space-y-3">
                {data.map((b) => (
                  <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-card p-5 shadow-card">
                    <div>
                      <p className="font-semibold">{b.centers?.name} <span className="font-normal text-muted-foreground">· {b.centers?.city}</span></p>
                      <p className="text-sm text-muted-foreground">
                        {b.child_name} · {b.quantity} {b.plan === "hourly" ? "hr" : b.plan === "daily" ? "day" : "month"}{b.quantity > 1 ? "s" : ""} from {b.start_date} at {b.start_time.slice(0, 5)}{b.end_date !== b.start_date && ` · until ${b.end_date}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-semibold">{inr(b.total_price)}</span>
                      <StatusBadge s={b.status} />
                      {b.status === "accepted" && <PickupPass b={b} center={b.centers} />}
                      <MessageThread bookingId={b.id} label={b.centers?.name ?? "center"} />
                      <ReportProblem bookingId={b.id} label={b.centers?.name ?? "center"} />
                      {b.status === "completed" && !reviewed.includes(b.center_id) && (
                        <Button asChild size="sm" variant="secondary">
                          <Link to="/centers/$id" params={{ id: b.center_id }} hash="reviews"><Star className="h-4 w-4" /> Leave a review</Link>
                        </Button>
                      )}
                      {(b.status === "pending" || b.status === "accepted") && (
                        <Button variant="ghost" size="sm" onClick={() => cancel.mutate(b.id)}>Cancel</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="children"><ChildrenTab /></TabsContent>
      <TabsContent value="saved"><SavedTab /></TabsContent>
    </Tabs>
  );
}
