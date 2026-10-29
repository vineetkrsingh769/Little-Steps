import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Little Steps" },
      { name: "description", content: "Update your name, phone number and password." },
    ],
  }),
  component: ProfilePage,
});

/** Accepts 10-digit Indian mobile numbers, with or without +91 / spaces. Returns "" when invalid. */
function normalisePhone(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : "";
}

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isError } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("full_name, phone").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => {
    if (profile) { setName(profile.full_name); setPhone(profile.phone ?? ""); }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const cleaned = phone.trim() ? normalisePhone(phone) : "";
      if (phone.trim() && !cleaned) throw new Error("Enter a valid 10-digit mobile number.");
      const { error } = await supabase.from("profiles").update({ full_name: name.trim(), phone: cleaned || null }).eq("id", user!.id);
      if (error) throw error;
      setPhone(cleaned);
    },
    onSuccess: () => { toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const changePassword = useMutation({
    mutationFn: async () => {
      if (password !== confirm) throw new Error("The two passwords don't match.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Password changed"); setPassword(""); setConfirm(""); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto max-w-xl space-y-8 px-4 py-10">
      <h1 className="text-3xl font-bold">My profile</h1>
      {isError && <p role="alert" className="rounded-3xl bg-destructive p-4 text-sm text-destructive-foreground">Couldn't load your profile. Please refresh the page.</p>}

      <form className="space-y-4 rounded-3xl border bg-card p-6 shadow-card" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" value={user?.email ?? ""} disabled /></div>
        <div className="space-y-1"><Label htmlFor="name">Full name</Label><Input id="name" autoComplete="name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-1">
          <Label htmlFor="phone">Mobile number</Label>
          <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <p className="text-xs text-muted-foreground">Used for booking updates. We'll ask before sending WhatsApp or SMS messages.</p>
        </div>
        <Button type="submit" variant="hero" disabled={save.isPending || !profile}>Save profile</Button>
      </form>

      <form className="space-y-4 rounded-3xl border bg-card p-6 shadow-card" onSubmit={(e) => { e.preventDefault(); changePassword.mutate(); }}>
        <h2 className="text-xl font-semibold">Change password</h2>
        <div className="space-y-1"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
        <Button type="submit" variant="outline" disabled={changePassword.isPending}>Change password</Button>
      </form>
    </main>
  );
}
