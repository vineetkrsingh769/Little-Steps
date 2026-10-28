import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function MessageThread({ bookingId, label, triggerLabel = "Messages" }: { bookingId: string; label: string; triggerLabel?: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", bookingId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").eq("booking_id", bookingId).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const send = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to send messages.");
      const { error } = await supabase.from("messages").insert({ booking_id: bookingId, sender_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["messages", bookingId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">{triggerLabel}</Button></DialogTrigger>
      <DialogContent className="flex max-h-[80vh] flex-col">
        <DialogHeader><DialogTitle>Messages · {label}</DialogTitle></DialogHeader>
        <div className="flex-1 space-y-2 overflow-y-auto pr-1" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={m.sender_id === user?.id ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                <p>{m.body}</p>
                <p className="mt-1 text-xs opacity-70">{new Date(m.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No messages yet. Say hello!</p>}
        </div>
        <form className="flex gap-2 pt-2" onSubmit={(e) => { e.preventDefault(); if (body.trim()) send.mutate(); }}>
          <Input value={body} onChange={(e) => setBody(e.target.value)} required maxLength={1000} placeholder="Write a message…" aria-label="Message" />
          <Button type="submit" variant="hero" disabled={send.isPending || !body.trim()}>Send</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
