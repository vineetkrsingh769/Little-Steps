import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    mode: z.enum(["signin", "signup"]).optional(),
    type: z.enum(["parent", "provider"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Little Steps" },
      { name: "description", content: "Sign in or create a parent or provider account on Little Steps." },
      { property: "og:title", content: "Sign in — Little Steps" },
      { property: "og:description", content: "Access your Little Steps childcare account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState(search.mode ?? "signin");
  const [type, setType] = useState<"parent" | "provider">(search.type ?? "parent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name, account_type: type } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard" });
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  }

  if (sent)
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-muted-foreground">We sent a confirmation link to {email}. Click it to finish creating your account.</p>
      </main>
    );

  return (
    <main className="bg-hero min-h-[80vh] px-4 py-16">
      <div className="mx-auto max-w-md space-y-5 rounded-[2rem] bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-bold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-2">
            {(["parent", "provider"] as const).map((t) => (
              <Button key={t} type="button" onClick={() => setType(t)} aria-pressed={type === t}
                variant={type === t ? "default" : "secondary"}>
                {t === "parent" ? "I'm a parent" : "I run a center"}
              </Button>
            ))}
          </div>
        )}
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && <div className="space-y-1"><Label htmlFor="full-name">Full name</Label><Input id="full-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>}
          <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-1"><Label htmlFor="password">Password</Label><Input id="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>{mode === "signup" ? "Create account" : "Sign in"}</Button>
        </form>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" /></div>
        <Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
        {mode === "signup" && <p className="text-xs text-muted-foreground">Signing in with Google creates a parent account.</p>}
        <p className="text-center text-sm">
          {mode === "signup" ? "Already have an account?" : "New to Little Steps?"}{" "}
          <Button type="button" variant="link" className="h-auto p-0" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? "Sign in" : "Create one"}
          </Button>
        </p>
      </div>
    </main>
  );
}
