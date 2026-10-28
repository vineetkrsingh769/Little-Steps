import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function useFavorites(enabled: boolean) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user && enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("favorites").select("id, center_id").eq("parent_id", user!.id);
      if (error) throw error;
      return data;
    },
  });
}

export function FavoriteButton({ centerId, overlay = false }: { centerId: string; overlay?: boolean }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useFavorites(true);
  const fav = data?.find((f) => f.center_id === centerId);

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to save centers.");
      if (fav) {
        const { error } = await supabase.from("favorites").delete().eq("id", fav.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("favorites").insert({ center_id: centerId, parent_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={fav ? "Remove from saved" : "Save center"}
      aria-pressed={!!fav}
      className={`shrink-0 rounded-full ${overlay ? "bg-background/80 hover:bg-background" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate();
      }}
    >
      <Heart className={`h-5 w-5 transition ${fav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
    </Button>
  );
}
