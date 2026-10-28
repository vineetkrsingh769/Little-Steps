import { useQuery } from "@tanstack/react-query";
import { CenterCard } from "@/components/CenterCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Center } from "@/lib/centers";
import { Empty } from "./shared";

export function SavedTab() {
  const { user } = useAuth();
  const { data: favs = [], isLoading } = useQuery({
    queryKey: ["favorites", "list", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("favorites").select("*, centers(*)").eq("parent_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold">Saved centers</h2>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : favs.length === 0 ? (
        <Empty>Nothing saved yet. Tap the heart on any center to keep it here.</Empty>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favs.map((f) => {
            const center = (f as { centers: Center | null }).centers;
            return center ? <CenterCard key={f.id} c={center} /> : null;
          })}
        </div>
      )}
    </div>
  );
}
