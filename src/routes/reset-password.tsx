import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — Little Steps" },
      { name: "description", content: "Choose a new password for your Little Steps account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  // The emailed link signs the user in, so a session here means the link was valid.
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("The two passwords don't match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="bg-hero min-h-[80vh] px-4 py-16">
      <div className="mx-auto max-w-md space-y-5 rounded-[2rem] bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        {loading ? (
          <p className="text-muted-foreground">Checking your link…</p>
        ) : !user ? (
          <p className="text-muted-foreground">
            This reset link is invalid or has expired.{" "}
            <Link to="/auth" className="text-primary underline">Request a new one</Link> from the sign-in page.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>Save new password</Button>
          </form>
        )}
      </div>
    </main>
  );
}
